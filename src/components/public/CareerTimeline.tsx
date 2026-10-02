import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { Briefcase, Trophy, Award } from 'lucide-react';

export const CareerTimeline: React.FC = () => {
  const { t, lang } = useLanguage();
  const { career: clubs } = useStructuredContent();
  const careerEntries = clubs.filter(club => club.clubNameAr || club.clubNameEn);

  if (careerEntries.length === 0) return null;

  return (
    <section id="career" className="py-20 bg-[#0e1420] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t('المسيرة الكروية', 'Career Path')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('المحطات والأندية الرياضية', 'Career Timeline & Club History')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('الأندية والإنجازات المسجلة ضمن مسيرة اللاعب', 'Clubs and achievements in the player’s career')}
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-slate-800">
          
          {careerEntries.map((club, index) => {
            const isEven = index % 2 === 0;
            const hasAchievements = (club.achievementsAr && club.achievementsAr.length > 0) || (club.achievementsEn && club.achievementsEn.length > 0);

            return (
              <div 
                key={club.id}
                className={`relative flex flex-col sm:flex-row items-center gap-8 ${
                  isEven ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Node Badge */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-lg shadow-cyan-500/20 z-10 font-latin">
                  0{index + 1}
                </div>

                {/* Club Card Container */}
                <div className="w-full sm:w-[calc(50%-2.5rem)] ml-12 sm:ml-0">
                  <div 
                    className={`bg-slate-900/90 rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.01] ${
                      hasAchievements 
                        ? 'border-cyan-500/40 shadow-xl shadow-cyan-500/5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20' 
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Top Row: Club Name & Duration Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mt-1">
                          {t(club.clubNameAr, club.clubNameEn)}
                        </h3>
                      </div>

                      {/* Duration Tag */}
                      <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs shrink-0 font-latin">
                        {t(club.durationAr, club.durationEn)}
                      </span>
                    </div>

                    {/* Level / Category */}
                    {(club.levelAr || club.levelEn) && <p className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{t(club.levelAr, club.levelEn)}</span>
                    </p>}

                    {/* Prominent Achievements Showcase */}
                    {hasAchievements && (
                      <div className="mt-4 pt-4 border-t border-cyan-500/20">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{t('إنجازات النادي', 'Club Achievements')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(lang === 'ar' ? club.achievementsAr : club.achievementsEn)?.map((ach, i) => (
                            <div 
                              key={i}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>{ach}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
