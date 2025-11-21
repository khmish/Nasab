
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Globe,
  Plus,
  Loader2
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { FamilyProvider, useFamily } from './contexts/FamilyContext';
import D3Tree from './components/D3Tree';
import AIGenerator from './components/AIGenerator';
import PersonModal from './components/PersonModal';
import { Person } from './types';

// --- Sub-components for pages ---

const Dashboard = () => {
  const { t } = useLanguage();
  const { familyData } = useFamily();
  const totalMembers = Object.keys(familyData.people).length;
  const males = (Object.values(familyData.people) as Person[]).filter(p => p.gender === 'male').length;
  const deceasedCount = (Object.values(familyData.people) as Person[]).filter(p => p.isDeceased).length;
  
  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title={t('totalMembers')} value={totalMembers} icon={<Users className="text-blue-500" />} />
        <StatCard title={t('males')} value={males} icon={<div className="text-blue-500 font-bold">♂</div>} />
        <StatCard title={t('females')} value={totalMembers - males} icon={<div className="text-pink-500 font-bold">♀</div>} />
        <StatCard title={t('isDeceased')} value={deceasedCount} icon={<div className="text-gray-500 font-bold">✝</div>} />
      </div>

      <AIGenerator />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-lg mb-4 text-slate-700">Recent Activity</h3>
        <p className="text-slate-500 text-sm">System initialized. Family "{familyData.familyName}" loaded successfully.</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-full">
      {icon}
    </div>
  </div>
);

const TreeView = () => {
  const { t } = useLanguage();
  const { familyData, getPerson } = useFamily();
  const [rootId, setRootId] = useState(familyData.rootId || (Object.keys(familyData.people).length > 0 ? Object.keys(familyData.people)[0] : ''));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [initialRelationships, setInitialRelationships] = useState<{ parentIds?: string[], childrenIds?: string[], partnerIds?: string[] } | undefined>(undefined);

  // Handle clicking on a node (Edit)
  const handleNodeClick = (id: string) => {
    const person = getPerson(id);
    if (person) {
      setEditingPerson(person);
      setInitialRelationships(undefined);
      setIsModalOpen(true);
    }
  };

  // Handle adding a relative from the tree
  const handleAddRelative = (sourceId: string, type: 'parent' | 'child' | 'partner') => {
    setEditingPerson(null); // We are adding a new person
    
    // Prepare pre-filled relationships
    let rels = {};
    if (type === 'child') {
      rels = { parentIds: [sourceId] };
    } else if (type === 'parent') {
      rels = { childrenIds: [sourceId] };
    } else if (type === 'partner') {
      rels = { partnerIds: [sourceId] };
    }
    
    setInitialRelationships(rels);
    setIsModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-800">{t('familyTree')}</h1>
        <div className="flex gap-2">
             {/* Controls can go here */}
        </div>
      </div>
      <div className="flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden relative">
        {rootId && familyData.people[rootId] ? (
          <D3Tree 
            data={familyData} 
            rootId={rootId} 
            onNodeClick={handleNodeClick} 
            onAddRelative={handleAddRelative}
          />
        ) : (
          <div className="p-10 text-center text-gray-500 h-full flex flex-col items-center justify-center">
             <p className="mb-4">No family members found.</p>
             <button 
               onClick={() => { setEditingPerson(null); setIsModalOpen(true); }}
               className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
             >
                Add First Person
             </button>
          </div>
        )}
      </div>

      <PersonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        personToEdit={editingPerson} 
        initialRelationships={initialRelationships}
      />
    </div>
  );
};

const PeopleList = () => {
  const { t } = useLanguage();
  const { familyData, deletePerson } = useFamily();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const handleAdd = () => {
    setEditingPerson(null);
    setIsModalOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
      if(window.confirm(t('delete') + '?')) {
          await deletePerson(id);
      }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('people')}</h1>
        <button 
          onClick={handleAdd}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={18} /> {t('addPerson')}
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm uppercase">
              <tr>
                <th className="p-4">{t('name')}</th>
                <th className="p-4">{t('gender')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4">{t('birthDate')}</th>
                <th className="p-4 text-right">{t('settings')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(Object.values(familyData.people) as Person[]).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className={`w-8 h-8 rounded-full object-cover border border-slate-200 ${p.isDeceased ? 'grayscale' : ''}`} />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.isDeceased ? 'bg-gray-200 text-gray-600' : p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                            {p.name.charAt(0)}
                          </div>
                        )}
                        {p.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {t(p.gender === 'male' ? 'males' : 'females')}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.isDeceased ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                           {t('isDeceased')}
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                           {t('living')}
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">
                      {p.birthDate || '-'}
                      {p.isDeceased && p.deathDate && <span className="text-xs text-red-400 block">died: {p.deathDate}</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => handleEdit(p)} 
                            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                            {t('edit')}
                        </button>
                        <button 
                            onClick={() => handleDelete(p.id)} 
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                            {t('delete')}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Object.keys(familyData.people).length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                          No people found. Add someone to get started!
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PersonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        personToEdit={editingPerson} 
      />
    </div>
  );
};

// --- Layout Components ---

const SidebarItem = ({ to, icon, label }: any) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
        isActive 
        ? 'bg-brand-50 text-brand-600 font-medium' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const MainLayout = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  const { isLoading } = useFamily();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
         <div className="flex flex-col items-center gap-3 text-brand-600">
            <Loader2 className="animate-spin w-10 h-10" />
            <span className="font-medium text-slate-600">Loading Nasab...</span>
         </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-slate-50 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={dir}>
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${dir === 'rtl' ? 'right-0 border-l border-r-0' : 'left-0'}
        ${mobileMenuOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
        md:translate-x-0 md:static
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 rtl:mr-0 rtl:ml-3">
            N
          </div>
          <span className="text-xl font-bold text-slate-800">Nasab</span>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden ml-auto rtl:ml-0 rtl:mr-auto text-slate-500">
            <X />
          </button>
        </div>

        <nav className="p-4">
          <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label={t('dashboard')} />
          <SidebarItem to="/tree" icon={<Network size={20} />} label={t('familyTree')} />
          <SidebarItem to="/people" icon={<Users size={20} />} label={t('people')} />
          <div className="my-4 border-t border-slate-100"></div>
          <SidebarItem to="/settings" icon={<Settings size={20} />} label={t('settings')} />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50/50">
           <button 
             onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
             className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
           >
             <Globe size={16} />
             {language === 'en' ? 'العربية' : 'English'}
           </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
           <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600">
             <Menu />
           </button>
           <span className="font-bold text-slate-800">Nasab</span>
           <div className="w-6"></div>
        </header>

        <div className="flex-1 overflow-auto">
           <Routes>
             <Route path="/" element={<Dashboard />} />
             <Route path="/tree" element={<TreeView />} />
             <Route path="/people" element={<PeopleList />} />
             <Route path="/settings" element={<div className="p-6">Settings Placeholder</div>} />
           </Routes>
        </div>
      </main>
      
      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <FamilyProvider>
        <Router>
          <MainLayout />
        </Router>
      </FamilyProvider>
    </LanguageProvider>
  );
};

export default App;
