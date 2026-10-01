import React from 'react';
import { VideoHighlight } from '../../types/player';
import { parseDriveUrl, parseYoutubeUrl } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface VideoModalProps {
  video: VideoHighlight | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const { t } = useLanguage();

  if (!video) return null;

  let embedSrc = video.videoUrl;

  if (video.videoSourceType === 'drive') {
    embedSrc = parseDriveUrl(video.videoUrl).embedUrl;
  } else if (video.videoSourceType === 'youtube' || video.videoUrl.includes('youtube') || video.videoUrl.includes('youtu.be')) {
    embedSrc = parseYoutubeUrl(video.videoUrl);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] uppercase font-latin">
              {video.category}
            </span>
            <h3 className="text-base font-bold text-white line-clamp-1">
              {t(video.titleAr, video.titleEn)}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          {video.videoSourceType === 'mp4' ? (
            <video 
              src={video.videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain" 
            />
          ) : (
            <iframe
              src={embedSrc}
              title={video.titleEn}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Footer Description */}
        <div className="p-6 bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('مقطع مباراة رسمي موثق', 'Official Match Film')}</span>
            </div>
            {video.descriptionAr && (
              <p className="text-xs text-slate-300">
                {t(video.descriptionAr, video.descriptionEn || '')}
              </p>
            )}
          </div>

          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white hover:border-cyan-500 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>{t('فتح الرابط الخارجي', 'Open Original Source')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
