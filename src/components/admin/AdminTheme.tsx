import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { ThemeConfig } from '../../types/player';
import { Palette, Save, Check } from 'lucide-react';

export const AdminTheme: React.FC = () => {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<ThemeConfig>(DataService.getTheme());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.updateTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('تخصيص الهوية البصرية والألوان', 'Appearance & Theme Manager')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('التحكم الكامل بألوان الهوية، درجة الشفافية ونصف قطر البطاقات', 'Customize athletic brand colors, card radius & hero overlay opacity')}</p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('حفظ ألوان الهوية', 'SAVE THEME')}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{t('تم تحديث ألوان ومظهر الموقع بنجاح!', 'Theme updated successfully!')}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">{t('اللون الرئيسي (Primary Color)', 'Primary Color')}</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={theme.primaryColor}
                onChange={e => setTheme({...theme, primaryColor: e.target.value})}
                className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer"
              />
              <input 
                type="text" 
                value={theme.primaryColor}
                onChange={e => setTheme({...theme, primaryColor: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2">{t('اللون الثنائي (Secondary Color)', 'Secondary Color')}</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={theme.secondaryColor}
                onChange={e => setTheme({...theme, secondaryColor: e.target.value})}
                className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer"
              />
              <input 
                type="text" 
                value={theme.secondaryColor}
                onChange={e => setTheme({...theme, secondaryColor: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2">{t('لون التمييز (Accent Color)', 'Accent Color')}</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={theme.accentColor}
                onChange={e => setTheme({...theme, accentColor: e.target.value})}
                className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer"
              />
              <input 
                type="text" 
                value={theme.accentColor}
                onChange={e => setTheme({...theme, accentColor: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
