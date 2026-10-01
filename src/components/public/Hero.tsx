import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, calculateAge, parseYoutubeUrl } from '../../services/dataService';
import { Play, User, FileText, MapPin, Flag, ChevronDown } from 'lucide-react';

interface HeroProps {
  onOpenHighlights: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenHighlights }) => {
  const { t } = useLanguage();
  const player = DataService.getPlayerInfo();
  const heroConfig = DataService.getHeroConfig();
  const age = calculateAge(player.dob);

  const imgDisp = heroConfig.imageDisplay || {
    fit: 'cover',
    positionX: 50,
    positionY: 50,
    focalPoint: { x: 50, y: 50 },
    zoom: 1,
    panX: 0,
    panY: 0,
    brightness: 90,
    contrast: 110,
    saturation: 100,
    opacity: 100,
    blur: 0
  };

  const imageSrc = heroConfig.desktopImage || player.heroImage;
  const mobileImgSrc = heroConfig.mobileImage || imageSrc;

  const focalX = imgDisp.focalPoint?.x ?? imgDisp.positionX ?? 50;
  const focalY = imgDisp.focalPoint?.y ?? imgDisp.positionY ?? 50;

  const animationClass = heroConfig.animationType === 'pulse' ? 'animate-pulse' 
    : heroConfig.animationType === 'breathing' ? 'animate-pulse duration-[8000ms]'
    : heroConfig.animationType === 'ken-burns' ? 'scale-110 hover:scale-125 transition-transform duration-[10000ms]'
    : '';

  return (
    <section 
      style={{
        minHeight: heroConfig.desktopHeight || '85vh',
      }}
      className="relative flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#0b0f17] bg-grid-pattern transition-all duration-300"
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        
        {/* Video Mode */}
        {(heroConfig.displayMode === 'video' || heroConfig.displayMode === 'video_overlay') && heroConfig.videoUrl ? (
          <div className="w-full h-full pointer-events-none opacity-40">
            <iframe
              src={`${parseYoutubeUrl(heroConfig.videoUrl)}?autoplay=1&mute=1&loop=1&controls=0`}
              title="Hero Background Video"
              className="w-full h-full object-cover scale-150"
            />
          </div>
        ) : (
          /* Image Mode */
          <picture className="w-full h-full block">
            {heroConfig.mobileImage && (
              <source media="(max-width: 640px)" srcSet={mobileImgSrc} />
            )}
            <img 
              src={imageSrc} 
              alt={player.nameEn}
              style={{
                objectFit: imgDisp.fit as any,
                objectPosition: `${focalX}% ${focalY}%`,
                transform: `scale(${imgDisp.zoom || 1}) translate(${imgDisp.panX || 0}px, ${imgDisp.panY || 0}px)`,
                filter: `brightness(${imgDisp.brightness ?? 100}%) contrast(${imgDisp.contrast ?? 100}%) saturate(${imgDisp.saturation ?? 100}%) opacity(${imgDisp.opacity ?? 100}%) blur(${imgDisp.blur ?? 0}px)`
              }}
              className={`w-full h-full ${animationClass} ${heroConfig.pauseOnHover ? 'hover:animation-paused' : ''}`}
            />
          </picture>
        )}

        {/* Dynamic Overlay Layer */}
        {(heroConfig.displayMode === 'image_overlay' || heroConfig.displayMode === 'video_overlay' || heroConfig.displayMode === 'gradient') && (
          <>
            <div 
              style={{
                backgroundColor: heroConfig.overlayColor || '#0b0f17',
                opacity: (heroConfig.overlayOpacity ?? 70) / 100
              }}
              className="absolute inset-0 z-1"
            />

            {heroConfig.gradientEnabled && (
              <div 
                className={`absolute inset-0 z-2 ${
                  heroConfig.gradientDirection === 'top-to-bottom' ? 'bg-gradient-to-b from-[#0b0f17] via-[#0b0f17]/70 to-[#0b0f17]' :
                  heroConfig.gradientDirection === 'left-to-right' ? 'bg-gradient-to-r from-[#0b0f17] via-[#0b0f17]/60 to-transparent' :
                  heroConfig.gradientDirection === 'right-to-left' ? 'bg-gradient-to-l from-[#0b0f17] via-[#0b0f17]/60 to-transparent' :
                  heroConfig.gradientDirection === 'radial' ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0b0f17]/80 to-[#0b0f17]' :
                  'bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/75 to-[#0b0f17]/40'
                }`}
              />
            )}
          </>
        )}
      </div>

      {/* Hero Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Nationality & Location */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase mb-4 font-latin">
          <span className="flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-cyan-400" />
            {t(player.nationalityAr, player.nationalityEn)}
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {t(player.locationAr, player.locationEn)}
          </span>
        </div>

        {/* Main Player Name */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-3 max-w-5xl leading-none uppercase font-latin">
          {t(player.nameAr, player.nameEn)}
        </h1>

        {/* Positions Banner */}
        <p className="text-lg sm:text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 mb-6 uppercase font-latin">
          {t(player.primaryPositionAr, player.primaryPositionEn)}
          <span className="text-cyan-500 mx-2">·</span>
          {t(player.secondaryPositionAr, player.secondaryPositionEn)}
        </p>

        {/* Quick Physical Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 text-slate-300 font-latin">
          <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs text-slate-400 uppercase tracking-wider">{t('الطول', 'Height')}</span>
            <span className="text-lg font-extrabold text-white">{player.heightCm} <span className="text-xs text-cyan-400">CM</span></span>
          </div>

          <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs text-slate-400 uppercase tracking-wider">{t('الوزن', 'Weight')}</span>
            <span className="text-lg font-extrabold text-white">{player.weightKg} <span className="text-xs text-cyan-400">KG</span></span>
          </div>

          <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
            <span className="text-xs text-slate-400 uppercase tracking-wider">{t('العمر', 'Age')}</span>
            <span className="text-lg font-extrabold text-white">{age} <span className="text-xs text-cyan-400">{t('سنة', 'YRS')}</span></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onOpenHighlights}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{t('مشاهدة الملخص', 'WATCH HIGHLIGHTS')}</span>
          </button>

          <a
            href="#scouting"
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-bold text-sm hover:border-cyan-500 hover:text-cyan-400 transition-all hover:scale-[1.02]"
          >
            <User className="w-4 h-4" />
            <span>{t('الملف الكشفي', 'VIEW PROFILE')}</span>
          </a>

          <a
            href="#cv"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 font-medium text-sm hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{t('السيرة الذاتية (CV)', 'DOWNLOAD CV')}</span>
          </a>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#scouting" 
          className="mt-12 text-slate-500 hover:text-cyan-400 transition-colors animate-bounce flex flex-col items-center gap-1 text-xs tracking-widest font-latin uppercase"
        >
          <span>{t('استكشف المزيد', 'SCROLL DOWN')}</span>
          <ChevronDown className="w-4 h-4" />
        </a>

      </div>
    </section>
  );
};
