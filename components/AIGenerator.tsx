import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { generateFamilyFromText } from '../services/geminiService';
import { Loader2, Sparkles } from 'lucide-react';
import { useFamily } from '../contexts/FamilyContext';
import { Person } from '../types';

const AIGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { addPerson } = useFamily();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const people = await generateFamilyFromText(prompt);
      
      // Simple logic to merge generated people into context
      // In a real app, this requires smarter merging and ID conflict resolution
      people.forEach(p => {
         // Assign new unique IDs to avoid conflict with existing mocks if needed
         // For demo, we assume AI generates distinct IDs or we overwrite
         addPerson(p);
      });

      setPrompt('');
      alert(`Successfully imported ${people.length} family members!`);
    } catch (e) {
      setError('Failed to generate family tree. Please check API Key or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-4 text-brand-600">
        <Sparkles size={20} />
        <h3 className="font-semibold text-lg">{t('generateAI')}</h3>
      </div>
      
      <textarea
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px]"
        placeholder={t('aiPrompt')}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? t('loading') : t('generateAI')}
        </button>
      </div>
    </div>
  );
};

export default AIGenerator;