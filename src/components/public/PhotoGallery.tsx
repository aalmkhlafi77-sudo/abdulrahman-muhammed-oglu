import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePhotos } from '../../context/PhotoContext';
import { PhotoItem } from '../../types/player';
import { Image, Maximize2, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const PhotoGallery: React.FC = () => {
  const { t } = useLanguage();
  const { photos: allPhotos } = usePhotos();
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(() => new Set());
  const photos = allPhotos.filter(p => p.published && Boolean(p.imageUrl?.trim()) && !failedPhotoIds.has(p.id));

  const [selectedClub, setSelectedClub] = useState<string>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const clubNames = Array.from(new Set(photos.map(p => p.clubNameAr))).filter(Boolean);

  const filteredPhotos = photos.filter(p => {
    if (selectedClub === 'ALL') return true;
    return p.clubNameAr === selectedClub || p.clubNameEn === selectedClub;
  });

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const nextPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
  };

  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="py-20 bg-[#0b0f17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Image className="w-3.5 h-3.5" />
            <span>{t('معرض الصور', 'Photo Gallery')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('معرض صور المباريات والتدريبات', 'Match & Training Gallery')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('الصور المنشورة', 'Published photos')}
          </p>
        </div>

        {/* Club Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
          <button
            onClick={() => { setSelectedClub('ALL'); setVisibleCount(12); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedClub === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t('جميع الأندية', 'All Clubs')} ({photos.length})
          </button>

          {clubNames.map((name) => (
            <button
              key={name}
              onClick={() => { setSelectedClub(name as string); setVisibleCount(12); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedClub === name
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedPhotos.map((photo, index) => (
            <div 
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer shadow-lg hover:border-cyan-500/50 transition-all duration-300"
            >
              <img 
                src={photo.imageUrl} 
                alt={photo.titleEn || 'Player Photo'} 
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setFailedPhotoIds(current => new Set(current).add(photo.id))}
                style={{
                  objectPosition: photo.focalPoint 
                    ? `${photo.focalPoint.x}% ${photo.focalPoint.y}%` 
                    : 'center'
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="text-xs font-bold text-white line-clamp-1">
                  {t(photo.titleAr || '', photo.titleEn || '')}
                </span>
                {photo.clubNameAr && (
                  <span className="text-[10px] text-cyan-400 font-semibold font-latin">
                    {t(photo.clubNameAr, photo.clubNameEn || '')}
                  </span>
                )}
                <div className="absolute top-3 right-3 p-2 rounded-lg bg-slate-950/80 text-cyan-400">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredPhotos.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 font-bold text-xs transition-all hover:text-cyan-400"
            >
              {t('عرض المزيد من الصور', 'Load More Photos')} ({filteredPhotos.length - visibleCount})
            </button>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-800 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev / Next Navigation */}
          <button
            onClick={prevPhoto}
            className="absolute left-6 p-3 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-800 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextPhoto}
            className="absolute right-6 p-3 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-800 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Image Container */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img 
              src={filteredPhotos[lightboxIndex].imageUrl} 
              alt="Expanded view" 
              referrerPolicy="no-referrer"
              onError={() => {
                setFailedPhotoIds(current => new Set(current).add(filteredPhotos[lightboxIndex].id));
                setLightboxIndex(null);
              }}
              className="max-w-full max-h-[70vh] object-contain rounded-xl border border-slate-800 shadow-2xl mb-4"
            />
            <div className="text-center">
              <h4 className="text-base font-bold text-white">
                {t(filteredPhotos[lightboxIndex].titleAr || '', filteredPhotos[lightboxIndex].titleEn || '')}
              </h4>
              <p className="text-xs text-cyan-400 font-latin mt-1">
                {t(filteredPhotos[lightboxIndex].clubNameAr || '', filteredPhotos[lightboxIndex].clubNameEn || '')}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
