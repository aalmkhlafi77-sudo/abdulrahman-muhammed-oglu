import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { SEOConfig } from '../../types/player';
import { Globe, Save, Check } from 'lucide-react';

export const AdminSEO: React.FC = () => {
  const { t } = useLanguage();
  const [seo, setSEO] = useState<SEOConfig>(DataService.getSEO());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.updateSEO(seo);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('إعدادات محركات البحث ووسائل التواصل (SEO)', 'SEO & Metadata Manager')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('تخصيص العناوين، الوصف، الكلمات المفتاحية وصور المشاركة OpenGraph', 'Configure site titles, meta descriptions, keywords & social cards')}</p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('حفظ إعدادات SEO', 'SAVE METADATA')}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{t('تم تحديث إعدادات محركات البحث بنجاح!', 'SEO settings saved!')}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">{t('عنوان الموقع بالإنجليزية (Site Title)', 'Site Title (English)')}</label>
          <input 
            type="text" 
            value={seo.siteTitleEn}
            onChange={e => setSEO({...seo, siteTitleEn: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">{t('وصف الموقع (Description)', 'Meta Description')}</label>
          <textarea 
            rows={3}
            value={seo.descriptionEn}
            onChange={e => setSEO({...seo, descriptionEn: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">{t('الكلمات المفتاحية (Keywords)', 'Keywords')}</label>
          <input 
            type="text" 
            value={seo.keywords}
            onChange={e => setSEO({...seo, keywords: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
          />
        </div>
      </form>
    </div>
  );
};
