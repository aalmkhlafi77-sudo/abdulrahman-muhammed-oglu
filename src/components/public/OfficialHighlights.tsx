import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { VideoHighlight } from '../../types/player';
import { MediaCover } from '../common/MediaCover';
import { Play, Film, Clock, Sparkles } from 'lucide-react';

interface OfficialHighlightsProps {
  onPlayVideo: (video: VideoHighlight) => void;
}

export const OfficialHighlights: React.FC<OfficialHighlightsProps> = ({ onPlayVideo }) => {
  const { t } = useLanguage();
  const { videos } = useStructuredContent();
  const officialVideo = videos.find(video => video.featured && video.published && Boolean(video.videoUrl?.trim()));

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
            {t('الفيديو المميز', 'Featured Video')}
          </h2>
        </div>

        {/* Wide Cinematic Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group flex flex-col">
          
          {/* Thumbnail Image Container */}
          <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-slate-950">
            <MediaCover category="video" coverUrl={officialVideo.thumbnailUrl} alt={officialVideo.titleEn} className="absolute inset-0" />
            {/* Scrim gradients on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17]/90 via-[#0b0f17]/30 to-transparent hidden sm:block" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17]/90 via-transparent to-[#0b0f17]/60 hidden sm:block" />
            <div className="absolute inset-0 bg-slate-950/20 sm:hidden block" />

            {/* Duration Tag */}
            {officialVideo.duration && <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-cyan-400 text-[11px] sm:text-xs font-bold font-latin flex items-center gap-1.5 shadow-lg z-10">
              <Clock className="w-3.5 h-3.5" />
              <span>{officialVideo.duration}</span>
            </div>}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <button
                onClick={() => onPlayVideo(officialVideo)}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-all duration-300 group-hover:shadow-cyan-400/60 cursor-pointer"
                aria-label="Play featured video"
              >
                <Play className="w-7 h-7 sm:w-10 sm:h-10 fill-slate-950 translate-x-0.5" />
              </button>
            </div>

            {/* Bottom Overlay Info (Desktop Only) */}
            <div className="hidden sm:flex absolute bottom-6 left-6 right-6 flex-row items-end justify-between gap-4 z-10">
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
                className="px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-400 font-bold text-xs hover:border-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Film className="w-4 h-4" />
                <span>{t('تشغيل ملخص المباريات', 'LAUNCH REEL')}</span>
              </button>
            </div>

          </div>

          {/* Mobile Info Body Below Thumbnail (Clean layout matching other video container) */}
          <div className="sm:hidden p-5 bg-slate-900 flex flex-col justify-between space-y-3.5 border-t border-slate-800/80">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-extrabold uppercase font-latin mb-2 inline-block">
                {officialVideo.category}
              </span>
              <h3 className="text-base font-extrabold text-white leading-snug mb-2">
                {t(officialVideo.titleAr, officialVideo.titleEn)}
              </h3>
              {officialVideo.descriptionAr && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t(officialVideo.descriptionAr, officialVideo.descriptionEn || '')}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => onPlayVideo(officialVideo)}
                className="text-cyan-400 font-bold hover:underline flex items-center gap-1.5 text-xs py-1"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{t('مشاهدة الفيديو', 'Watch Video')}</span>
              </button>
              <span className="text-[10px] text-slate-500 uppercase font-latin font-bold">{officialVideo.videoSourceType}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
