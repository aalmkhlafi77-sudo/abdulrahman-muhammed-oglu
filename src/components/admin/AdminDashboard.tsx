import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { usePhotos } from '../../context/PhotoContext';
import { Video, Image, Briefcase, Mail } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { videos, clubs, achievements } = useStructuredContent();
  const { photos } = usePhotos();
  const inquiries = DataService.getInquiries();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('ملخص لوحة التحكم العامة', 'Dashboard Overview')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('متابعة إحصائيات المحتوى، الوسائط والرسائل الواردة', 'Monitor portfolio metrics, media uploads, and scout inquiries')}</p>
      </div>

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


    </div>
  );
};
