
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Search, Plus, Camera, Upload, Trash2, Briefcase, MapPin, Phone, CreditCard, Flag, Globe, HeartCrack } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Person } from '../types';
import { useFamily } from '../contexts/FamilyContext';
import { NATIONALITIES } from '../constants';
import * as L from 'leaflet';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
  initialRelationships?: {
    parentIds?: string[];
    childrenIds?: string[];
    partnerIds?: string[];
  };
}

// Helper component for selecting multiple people
const RelationshipSelect = ({ 
  label, 
  allPeople, 
  selectedIds, 
  onChange, 
  placeholder,
  t
}: { 
  label: string, 
  allPeople: Person[], 
  selectedIds: string[], 
  onChange: (ids: string[]) => void,
  placeholder: string,
  t: (key: string) => string
}) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter people: exclude already selected ones and match search query
  const filteredOptions = allPeople.filter(p => 
    !selectedIds.includes(p.id) && 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = (id: string) => {
    onChange([...selectedIds, id]);
    setQuery('');
    setIsDropdownOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter(currentId => currentId !== id));
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      
      {/* Selected Items */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {selectedIds.map(id => {
          const person = allPeople.find(p => p.id === id) || { name: 'Unknown', id } as Person;
          return (
            <span key={id} className="bg-brand-50 border border-brand-100 text-brand-700 pl-2 pr-1 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm">
              {person.name}
              <button 
                type="button" 
                onClick={() => handleRemove(id)}
                className="hover:bg-brand-100 p-0.5 rounded text-brand-500 hover:text-brand-800"
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        {selectedIds.length === 0 && <span className="text-slate-400 text-sm italic py-1">None selected</span>}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsDropdownOpen(true); }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
        />
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
      </div>

      {/* Dropdown Results */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAdd(p.id)}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex justify-between items-center"
              >
                <span>{p.name}</span>
                <Plus size={14} />
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-slate-400">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper Component for the Map
const LocationPicker = ({ 
  position, 
  setPosition, 
  t 
}: { 
  position: { lat: number, lng: number } | null, 
  setPosition: (pos: { lat: number, lng: number }) => void,
  t: (key: string) => string
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const defaultLat = 24.7136; // Riyadh
      const defaultLng = 46.6753;
      const startPos: L.LatLngExpression = position ? [position.lat, position.lng] : [defaultLat, defaultLng];

      const map = L.map(mapRef.current).setView(startPos, position ? 12 : 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Fix for default icon issues
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(map);
        }
      });

      mapInstanceRef.current = map;
    }

    if (position && mapInstanceRef.current) {
        if (markerRef.current) {
            markerRef.current.setLatLng([position.lat, position.lng]);
        } else {
            markerRef.current = L.marker([position.lat, position.lng]).addTo(mapInstanceRef.current);
        }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); 

  return (
    <div className="w-full h-64 rounded-lg border border-slate-300 overflow-hidden relative z-0">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-xs rounded z-[1000] pointer-events-none">
        {t('clickToPin')}
      </div>
    </div>
  );
};

const PersonModal: React.FC<PersonModalProps> = ({ isOpen, onClose, personToEdit, initialRelationships }) => {
  const { t } = useLanguage();
  const { addPerson, updatePerson, familyData } = useFamily();
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [nationalId, setNationalId] = useState('');
  const [nationality, setNationality] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [jobHistory, setJobHistory] = useState('');
  
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number, lng: number } | null>(null);

  const [parentIds, setParentIds] = useState<string[]>([]);
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  const [partnerIds, setPartnerIds] = useState<string[]>([]);

  const allPeople = (Object.values(familyData.people) as Person[]).filter(p => 
    !personToEdit || p.id !== personToEdit.id
  );

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setGender(personToEdit.gender);
      setBirthDate(personToEdit.birthDate || '');
      setDeathDate(personToEdit.deathDate || '');
      setIsDeceased(personToEdit.isDeceased || !!personToEdit.deathDate);
      setPhotoUrl(personToEdit.photoUrl || '');
      
      setNationalId(personToEdit.nationalId || '');
      setNationality(personToEdit.nationality || '');
      setPhoneNumber(personToEdit.phoneNumber || '');
      setLocation(personToEdit.location || '');
      setJobHistory(personToEdit.jobHistory || '');

      if (personToEdit.latitude && personToEdit.longitude) {
        setMapCoordinates({ lat: personToEdit.latitude, lng: personToEdit.longitude });
      } else {
        setMapCoordinates(null);
      }

      setParentIds(personToEdit.parentIds || []);
      setChildrenIds(personToEdit.childrenIds || []);
      setPartnerIds(personToEdit.partnerIds || []);
    } else {
      setName('');
      setGender('male');
      setBirthDate('');
      setDeathDate('');
      setIsDeceased(false);
      setPhotoUrl('');
      
      setNationalId('');
      setNationality('');
      setPhoneNumber('');
      setLocation('');
      setJobHistory('');
      setMapCoordinates(null);

      if (initialRelationships) {
        setParentIds(initialRelationships.parentIds || []);
        setChildrenIds(initialRelationships.childrenIds || []);
        setPartnerIds(initialRelationships.partnerIds || []);
      } else {
        setParentIds([]);
        setChildrenIds([]);
        setPartnerIds([]);
      }
    }
  }, [personToEdit, isOpen, initialRelationships]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const personData: Person = {
      id: personToEdit ? personToEdit.id : `p_${Date.now()}`,
      name,
      gender,
      birthDate: birthDate || undefined,
      deathDate: isDeceased && deathDate ? deathDate : undefined,
      isDeceased: isDeceased,
      photoUrl: photoUrl || undefined,
      
      nationalId: nationalId || undefined,
      nationality: nationality || undefined,
      phoneNumber: phoneNumber || undefined,
      location: location || undefined,
      latitude: mapCoordinates?.lat,
      longitude: mapCoordinates?.lng,
      jobHistory: jobHistory || undefined,

      parentIds,
      childrenIds,
      partnerIds,
    };

    if (personToEdit) {
      updatePerson(personData);
    } else {
      addPerson(personData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transform transition-all scale-100">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
          <h3 className="font-bold text-xl text-slate-800">
            {personToEdit ? t('edit') : t('addPerson')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-start gap-5">
             <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-slate-400" size={36} />
                  )}
                </div>
                <div className="mt-2 flex flex-col items-center gap-1">
                   <label className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                     <Upload size={12} />
                     {t('uploadPhoto')}
                     <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                   </label>
                   {photoUrl && (
                     <button 
                       type="button"
                       onClick={() => setPhotoUrl('')}
                       className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                     >
                       <Trash2 size={12} /> {t('removePhoto')}
                     </button>
                   )}
                </div>
             </div>

             <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('name')}</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('name')}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('birthDate')}</label>
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">{t('gender')}</label>
                     <div className="flex gap-2">
                        <button
                           type="button"
                           onClick={() => setGender('male')}
                           className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${gender === 'male' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                           <span>♂</span> {t('males')}
                        </button>
                        <button
                           type="button"
                           onClick={() => setGender('female')}
                           className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${gender === 'female' ? 'bg-pink-50 border-pink-500 text-pink-700 ring-1 ring-pink-500' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                           <span>♀</span> {t('females')}
                        </button>
                     </div>
                  </div>
                </div>

                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="checkbox"
                          id="isDeceased"
                          checked={isDeceased}
                          onChange={e => setIsDeceased(e.target.checked)}
                          className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                        />
                        <label htmlFor="isDeceased" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <HeartCrack size={14} className="text-gray-500"/>
                            {t('isDeceased')}
                        </label>
                    </div>
                    
                    {isDeceased && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('deathDate')}</label>
                            <input 
                                type="date" 
                                value={deathDate}
                                onChange={e => setDeathDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm bg-white"
                            />
                        </div>
                    )}
                </div>
             </div>
          </div>

          <hr className="border-slate-100" />

          <div>
             <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
               <CreditCard size={16} className="text-brand-600" /> {t('personalInfo')}
             </h4>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                   <CreditCard size={12} /> {t('nationalId')}
                 </label>
                 <input 
                   type="text" 
                   value={nationalId}
                   onChange={e => setNationalId(e.target.value)}
                   placeholder="e.g. 1234567890"
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                   <Flag size={12} /> {t('nationality')}
                 </label>
                 <div className="relative">
                    <select 
                      value={nationality}
                      onChange={e => setNationality(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">{t('select')}</option>
                      {NATIONALITIES.map(nat => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500 rtl:right-auto rtl:left-0">
                       <Globe size={14} />
                    </div>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4 mb-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                   <Phone size={12} /> {t('phoneNumber')}
                 </label>
                 <input 
                   type="tel" 
                   value={phoneNumber}
                   onChange={e => setPhoneNumber(e.target.value)}
                   placeholder="+966..."
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                 />
               </div>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                   <MapPin size={12} /> {t('location')} & {t('pinLocation')}
                </label>
                
                <div className="mb-3">
                   <input 
                     type="text" 
                     value={location}
                     onChange={e => setLocation(e.target.value)}
                     placeholder="e.g. Riyadh (Display text)"
                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm bg-white"
                   />
                </div>

                <LocationPicker 
                  position={mapCoordinates} 
                  setPosition={(pos) => {
                    setMapCoordinates(pos);
                    if (!location) setLocation(`Lat: ${pos.lat.toFixed(4)}, Lng: ${pos.lng.toFixed(4)}`);
                  }} 
                  t={t}
                />
             </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <Briefcase size={16} className="text-brand-600" /> {t('professionalInfo')}
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t('jobHistory')}</label>
              <textarea
                value={jobHistory}
                onChange={e => setJobHistory(e.target.value)}
                placeholder="Brief summary of jobs, positions, or achievements..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm resize-none"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Relationships</h4>
            
            <RelationshipSelect 
              label={t('parents')} 
              allPeople={allPeople} 
              selectedIds={parentIds} 
              onChange={setParentIds} 
              placeholder={t('searchPlaceholder')}
              t={t}
            />

            <RelationshipSelect 
              label={t('partners')} 
              allPeople={allPeople} 
              selectedIds={partnerIds} 
              onChange={setPartnerIds} 
              placeholder={t('searchPlaceholder')}
              t={t}
            />

            <RelationshipSelect 
              label={t('children')} 
              allPeople={allPeople} 
              selectedIds={childrenIds} 
              onChange={setChildrenIds} 
              placeholder={t('searchPlaceholder')}
              t={t}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium shadow-sm shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save size={18} />
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonModal;
