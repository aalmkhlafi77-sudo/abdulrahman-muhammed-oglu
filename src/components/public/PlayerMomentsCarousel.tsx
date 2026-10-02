import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePhotos } from '../../context/PhotoContext';

export const PlayerMomentsCarousel: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { photos } = usePhotos();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  const pointerStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const realPhotos = useMemo(
    () => photos.filter(photo => photo.published && Boolean(photo.imageUrl?.trim()) && !failedIds.has(photo.id)),
    [photos, failedIds],
  );

  if (realPhotos.length < 2) return null;

  const currentIndex = activeIndex % realPhotos.length;
  const move = (delta: number) => {
    setActiveIndex(index => (index + delta + realPhotos.length) % realPhotos.length);
  };
  const imageAt = (offset: number) => realPhotos[(currentIndex + offset + realPhotos.length) % realPhotos.length];
  const leftDelta = isRtl ? 1 : -1;
  const rightDelta = -leftDelta;

  return (
    <section className="player-moments-section border-t border-slate-800 bg-[#0b0f17] py-16 sm:py-20" aria-label={t('لحظات اللاعب', 'Player Moments')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">{t('من الصور المنشورة', 'From published photos')}</p>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('لحظات اللاعب', 'Player Moments')}</h2>
        </header>

        <div
          className="player-moments"
          dir={isRtl ? 'rtl' : 'ltr'}
          tabIndex={0}
          aria-roledescription={t('عارض صور', 'carousel')}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); move(leftDelta); }
            if (event.key === 'ArrowRight') { event.preventDefault(); move(rightDelta); }
          }}
          onPointerDown={event => { if (event.pointerType === 'touch') pointerStart.current = event.clientX; }}
          onPointerUp={event => {
            if (pointerStart.current === null) return;
            const distance = event.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(distance) < 40) return;
            suppressClick.current = true;
            window.setTimeout(() => { suppressClick.current = false; }, 400);
            const swipedLeft = distance < 0;
            move(swipedLeft ? (isRtl ? -1 : 1) : (isRtl ? 1 : -1));
          }}
          onPointerCancel={() => { pointerStart.current = null; }}
        >
          <div className="player-moments-stage" aria-live="polite">
            {([-1, 0, 1] as const).map(offset => {
              const photo = imageAt(offset);
              const side = offset === 0 ? 'active' : offset < 0 ? 'previous' : 'next';
              return (
                <button
                  key={`${photo.id}-${side}`}
                  type="button"
                  className={`player-moments-card player-moments-card--${side}`}
                  onClick={() => {
                    if (suppressClick.current) { suppressClick.current = false; return; }
                    if (offset !== 0) move(offset);
                  }}
                  aria-label={offset === 0 ? t('الصورة الحالية', 'Current photo') : t('عرض الصورة المجاورة', 'Show adjacent photo')}
                  aria-current={offset === 0 ? 'true' : undefined}
                  tabIndex={offset === 0 ? 0 : -1}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.titleEn || photo.titleAr || t('لحظة من مسيرة اللاعب', 'Player moment')}
                    draggable={false}
                    onError={() => setFailedIds(current => new Set(current).add(photo.id))}
                  />
                  {offset === 0 && (photo.captionAr || photo.captionEn || photo.titleAr || photo.titleEn) && (
                    <span className="player-moments-caption">{t(photo.captionAr || photo.titleAr || '', photo.captionEn || photo.titleEn || '')}</span>
                  )}
                </button>
              );
            })}
          </div>

          <button type="button" className="player-moments-arrow player-moments-arrow--left" onClick={() => move(leftDelta)} aria-label={t('الصورة السابقة', 'Previous photo')}>
            {isRtl ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
          </button>
          <button type="button" className="player-moments-arrow player-moments-arrow--right" onClick={() => move(rightDelta)} aria-label={t('الصورة التالية', 'Next photo')}>
            {isRtl ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          </button>
        </div>

        <div className="mt-7 flex justify-center gap-2" role="group" aria-label={t('اختيار صورة', 'Choose a photo')}>
          {realPhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`player-moments-dot ${index === currentIndex ? 'player-moments-dot--active' : ''}`}
              aria-label={t(`الصورة ${index + 1}`, `Photo ${index + 1}`)}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
