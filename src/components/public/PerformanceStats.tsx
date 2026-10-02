import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { Activity } from 'lucide-react';

export const PerformanceStats: React.FC = () => {
  const { t } = useLanguage();
  const { stats } = useStructuredContent();

  // Filter stats that have at least one defined metric to avoid displaying empty cards
  const activeStats = stats.filter(s =>
    [s.matches, s.goals, s.assists, s.minutes, s.yellowCards, s.redCards]
      .some(value => typeof value === 'number' && Number.isFinite(value))
  );

  if (activeStats.length === 0) return null;

  return (
    <section id="stats" className="py-16 bg-[#0e1420] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase font-latin mb-1">
              <Activity className="w-4 h-4" />
              <span>{t('الإحصائيات', 'Statistics')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {t('سجل المشاركات والأداء', 'Performance Breakdown')}
            </h2>
          </div>
          
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeStats.map((st) => (
              <div key={st.id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">
                  {t(st.clubNameAr || '', st.clubNameEn || '')}
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-latin">
                  {st.matches !== undefined && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-xs text-slate-400 uppercase">{t('المباريات', 'Matches')}</span>
                      <span className="text-xl font-extrabold text-white">{st.matches}</span>
                    </div>
                  )}

                  {st.goals !== undefined && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-xs text-slate-400 uppercase">{t('الأهداف', 'Goals')}</span>
                      <span className="text-xl font-extrabold text-cyan-400">{st.goals}</span>
                    </div>
                  )}

                  {st.assists !== undefined && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-xs text-slate-400 uppercase">{t('الصناعة', 'Assists')}</span>
                      <span className="text-xl font-extrabold text-blue-400">{st.assists}</span>
                    </div>
                  )}

                  {st.minutes !== undefined && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-xs text-slate-400 uppercase">{t('الدقائق', 'Minutes')}</span>
                      <span className="text-xl font-extrabold text-slate-200">{st.minutes}'</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      </div>
    </section>
  );
};
