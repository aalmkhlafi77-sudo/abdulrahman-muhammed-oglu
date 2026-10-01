import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { Trophy, Medal, Star, BarChart2, Award } from 'lucide-react';

export const Achievements: React.FC = () => {
  const { t } = useLanguage();
  const achievements = DataService.getAchievements();

  const getBadgeIcon = (type?: string) => {
    switch (type) {
      case 'trophy': return <Trophy className="w-6 h-6 text-amber-400" />;
      case 'medal': return <Medal className="w-6 h-6 text-amber-400" />;
      case 'star': return <Star className="w-6 h-6 text-cyan-400" />;
      default: return <Award className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <section id="achievements" className="py-20 bg-[#0b0f17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('السجل التهديفي والألقاب', 'Individual Honors')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('أبرز إنجازات اللاعب الرسمية', 'Key Career Achievements')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('الإنجازات الفردية والألقاب الموثقة رسمياً في البطولات التركية والقبرصية', 'Documented top goalscoring and assist achievements across Turkish & Cypriot leagues')}
          </p>
        </div>

        {/* Achievements Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between relative group"
            >
              <div>
                {/* Icon & Club Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                    {getBadgeIcon(item.badgeType)}
                  </div>
                  {item.clubNameAr && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300">
                      {t(item.clubNameAr, item.clubNameEn || '')}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {t(item.titleAr, item.titleEn)}
                </h3>

                {item.descriptionAr && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(item.descriptionAr, item.descriptionEn || '')}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-latin">
                <span>{t('موثق رسمياً', 'OFFICIALLY VERIFIED')}</span>
                <span className="text-cyan-400 font-bold">100% MATCH PROOF</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
