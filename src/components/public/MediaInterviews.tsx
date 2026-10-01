import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { Radio, ExternalLink, Mic, Newspaper } from 'lucide-react';

export const MediaInterviews: React.FC = () => {
  const { t } = useLanguage();
  const mediaItems = DataService.getMedia();

  return (
    <section id="media" className="py-20 bg-[#0e1420] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Radio className="w-3.5 h-3.5" />
            <span>{t('التغطية الإعلامية الميدانية', 'Press & Media Network')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('المقابلات والتغطيات الإعلامية', 'Media & Field Interviews')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('لقاءات صحفية وتصريحات القنوات عقب المباريات الرسمية', 'Post-match press commentary, pitchside interviews, and news features')}
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mediaItems.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-1.5 font-latin">
                    {item.mediaType === 'field_interview' ? <Mic className="w-3.5 h-3.5" /> : <Newspaper className="w-3.5 h-3.5" />}
                    <span>{t(item.sourceNameAr, item.sourceNameEn)}</span>
                  </span>
                  {item.date && (
                    <span className="text-[11px] text-slate-500 font-latin">{item.date}</span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {t(item.titleAr, item.titleEn)}
                </h3>

                {item.descriptionAr && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t(item.descriptionAr, item.descriptionEn || '')}
                  </p>
                )}
              </div>

              {item.url && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>{t('مشاهدة التغطية الأصلية', 'View Full Media Source')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
