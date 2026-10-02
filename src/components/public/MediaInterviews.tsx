import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPublicMedia, MediaItem } from '../../services/mediaApi';
import { ExternalLink, FileText, Image as ImageIcon, Mic, Video } from 'lucide-react';

export const MediaInterviews: React.FC = () => {
  const { t } = useLanguage();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    getPublicMedia().then(setMediaItems).catch(error => console.warn('Could not load published media:', error));
  }, []);

  if (!mediaItems.length) return null;

  const iconFor = (category: MediaItem['category']) => {
    if (category === 'interview') return <Mic className="h-3.5 w-3.5" />;
    if (category === 'video') return <Video className="h-3.5 w-3.5" />;
    if (category === 'image') return <ImageIcon className="h-3.5 w-3.5" />;
    return <FileText className="h-3.5 w-3.5" />;
  };

  return (
    <section id="media" className="border-t border-slate-800 bg-[#0e1420] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{t('المقابلات والتغطيات الإعلامية', 'Media & Interviews')}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mediaItems.map(item => (
            <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition-all hover:border-cyan-500/40">
              <div>
                {item.coverUrl && <img src={item.coverUrl} alt={item.titleEn || item.titleAr} className="mb-5 max-h-64 w-full rounded-xl object-cover" />}
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-cyan-400">
                  {iconFor(item.category)}{item.category}
                </span>
                <h3 className="mb-2 text-lg font-bold text-white">{t(item.titleAr, item.titleEn)}</h3>
                {(item.contentAr || item.contentEn) && <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{t(item.contentAr, item.contentEn)}</p>}
              </div>
              {item.externalUrl && (
                <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
                  <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300">
                    {t('فتح المصدر', 'Open source')}<ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
