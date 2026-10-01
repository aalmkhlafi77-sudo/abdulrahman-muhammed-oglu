import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { VideoHighlight } from '../../types/player';
import { Play, Film, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface OfficialHighlightsProps {
  onPlayVideo: (video: VideoHighlight) => void;
}

export const OfficialHighlights: React.FC<OfficialHighlightsProps> = ({ onPlayVideo }) => {
  const { t } = useLanguage();
  const videos = DataService.getVideos();
  const officialVideo = videos.find(v => v.featured) || videos[0];

  if (!officialVideo) return null;

  return (
    <section id="official-highlights" className="py-20 bg-[#0b0f17] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('العرض التجميعي الرئيسي', 'PRIMARY SCOUTING VIDEO')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('الفيديو التجميعي الرسمي للاعب', 'Official Scouting Highlights')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('ملخص شامل لمدة 4:30 دقيقة يستعرض التحركات التكتيكية والأهداف ومهارات التحكم', 'Comprehensive 4:32 highlight reel curated for clubs, scouts, and performance evaluators')}
          </p>
        </div>

        {/* Wide Cinematic Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
          
          {/* Thumbnail Image with Gradient Scrim */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            <img 
              src={officialVideo.thumbnailUrl} 
              alt={officialVideo.titleEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17]/90 via-transparent to-[#0b0f17]/60" />

            {/* Duration Tag */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-cyan-400 text-xs font-bold font-latin flex items-center gap-1.5 shadow-lg">
              <Clock className="w-3.5 h-3.5" />
              <span>{officialVideo.duration || '04:32'}</span>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => onPlayVideo(officialVideo)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-all duration-300 group-hover:shadow-cyan-400/60"
                aria-label="Play Official Video"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 translate-x-0.5" />
              </button>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 inline-block font-latin">
                  {officialVideo.category}
                </span>
                <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
                  {t(officialVideo.titleAr, officialVideo.titleEn)}
                </h3>
                {officialVideo.descriptionAr && (
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2">
                    {t(officialVideo.descriptionAr, officialVideo.descriptionEn || '')}
                  </p>
                )}
              </div>

              <button
                onClick={() => onPlayVideo(officialVideo)}
                className="self-start sm:self-end px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-400 font-bold text-xs hover:border-cyan-400 transition-colors shrink-0 flex items-center gap-2"
              >
                <Film className="w-4 h-4" />
                <span>{t('تشغيل ملخص المباريات', 'LAUNCH REEL')}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
