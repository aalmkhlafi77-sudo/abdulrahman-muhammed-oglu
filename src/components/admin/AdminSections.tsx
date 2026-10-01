import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { SectionConfig } from '../../types/player';
import { Layers, Eye, EyeOff, ArrowUp, ArrowDown, Save } from 'lucide-react';

export const AdminSections: React.FC = () => {
  const { t } = useLanguage();
  const [sections, setSections] = useState<SectionConfig[]>(DataService.getSections());

  const saveAll = (updated: SectionConfig[]) => {
    setSections(updated);
    DataService.updateSections(updated);
  };

  const toggleSection = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    saveAll(updated);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const reordered = newSections.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    saveAll(reordered);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('إدارة وترتيب أقسام الصفحة الرئيسية', 'Homepage Section Manager')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('إظهار أو إخفاء أي قسم وإعادة الترتيب بنقرة واحدة', 'Show, hide, or reorder any section on the public portfolio')}</p>
      </div>

      <div className="space-y-3">
        {sections.map((sec, index) => (
          <div key={sec.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-slate-950 text-cyan-400 font-bold flex items-center justify-center font-latin">
                {index + 1}
              </span>
              <span className="font-bold text-white text-sm">{t(sec.titleAr, sec.titleEn)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 hover:text-cyan-400"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 hover:text-cyan-400"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => toggleSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  sec.enabled ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{sec.enabled ? t('ظاهر', 'Visible') : t('مخفي', 'Hidden')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
