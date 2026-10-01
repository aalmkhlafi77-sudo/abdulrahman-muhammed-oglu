import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { Video, Image, Briefcase, Trophy, Mail, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const videos = DataService.getVideos();
  const photos = DataService.getPhotos();
  const clubs = DataService.getClubs();
  const achievements = DataService.getAchievements();
  const inquiries = DataService.getInquiries();

  const [message, setMessage] = useState<string | null>(null);

  const handleExportJSON = () => {
    const jsonStr = DataService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abdurahman_portfolio_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setMessage(t('تم تصدير النسخة الاحتياطية بنجاح!', 'Backup exported successfully!'));
    setTimeout(() => setMessage(null), 4000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = DataService.importAllDataJSON(content);
        if (success) {
          setMessage(t('تم استيراد البيانات وتحديث الموقع بنجاح!', 'Data imported successfully! Page will refresh.'));
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage(t('فشل استيراد الملف. تأكد من صيغة JSON.', 'Import failed. Invalid JSON format.'));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm(t('هل أنت تأكد من إعادة ضبط كافة البيانات إلى الحالة الافتراضية؟', 'Are you sure you want to reset all data to default values?'))) {
      DataService.resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('ملخص لوحة التحكم العامة', 'Dashboard Overview')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('متابعة إحصائيات المحتوى، الوسائط والرسائل الواردة', 'Monitor portfolio metrics, media uploads, and scout inquiries')}</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase font-latin">{t('إجمالي الفيديوهات', 'Total Videos')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{videos.length}</h3>
            <span className="text-[11px] text-cyan-400 mt-1 block font-latin">{videos.filter(v => v.published).length} {t('منشور', 'published')}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Video className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase font-latin">{t('إجمالي الصور', 'Total Photos')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{photos.length}</h3>
            <span className="text-[11px] text-cyan-400 mt-1 block font-latin">{photos.filter(p => p.published).length} {t('منشورة', 'published')}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Image className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase font-latin">{t('سجل الأندية', 'Clubs Count')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{clubs.length}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block font-latin">{achievements.length} {t('إنجاز توثيقي', 'achievements')}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase font-latin">{t('رسائل الكشافين', 'Scout Inquiries')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{inquiries.length}</h3>
            <span className="text-[11px] text-emerald-400 mt-1 block font-latin">{inquiries.filter(i => !i.read).length} {t('جديدة', 'unread')}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Mail className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Data Backup & Restore Panel */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-2">{t('النسخ الاحتياطي واستعادة البيانات (JSON)', 'Data Backup & JSON Restore')}</h3>
        <p className="text-xs text-slate-400 mb-6">
          {t('تصدير كافة التعديلات في ملف JSON للنسخ الاحتياطي أو النقل، أو استعادة ملف سابق.', 'Export full portfolio dataset as JSON or restore a previous JSON backup.')}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleExportJSON}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 fill-slate-950" />
            <span>{t('تصدير النسخة الاحتياطية (Export JSON)', 'EXPORT BACKUP JSON')}</span>
          </button>

          <label className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-700 cursor-pointer transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{t('استيراد ملف JSON', 'IMPORT BACKUP JSON')}</span>
            <input 
              type="file" 
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('إعادة ضبط الافتراضي', 'RESET TO DEFAULTS')}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
