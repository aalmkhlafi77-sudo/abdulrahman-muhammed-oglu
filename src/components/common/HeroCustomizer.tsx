import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HeroConfig } from '../../types/player';
import { MediaPicker } from './MediaPicker';
import { ImageDisplayControls } from './ImageDisplayControls';
import { Layout, Sparkles, Sliders, Play, Smartphone, Monitor, Palette } from 'lucide-react';

interface HeroCustomizerProps {
  config: HeroConfig;
  onChange: (updated: HeroConfig) => void;
}

export const HeroCustomizer: React.FC<HeroCustomizerProps> = ({ config, onChange }) => {
  const { t } = useLanguage();
  const [showDesktopMediaPicker, setShowDesktopMediaPicker] = useState(false);
  const [showMobileMediaPicker, setShowMobileMediaPicker] = useState(false);

  const updateConfig = (fields: Partial<HeroConfig>) => {
    onChange({ ...config, ...fields });
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* 1. Display Mode Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <label className="block text-slate-200 font-bold text-sm flex items-center gap-2">
          <Layout className="w-4 h-4 text-cyan-400" />
          <span>{t('نمط عرض واجهة الهيرو (Hero Display Mode)', 'Hero Display Mode')}</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {[
            { id: 'image_overlay', nameAr: 'صورة + طبقة', nameEn: 'Image + Overlay' },
            { id: 'image', nameAr: 'صورة فقط', nameEn: 'Pure Image' },
            { id: 'video_overlay', nameAr: 'فيديو + طبقة', nameEn: 'Video + Overlay' },
            { id: 'video', nameAr: 'فيديو فقط', nameEn: 'Pure Video' },
            { id: 'gradient', nameAr: 'تدرج لوني', nameEn: 'Pure Gradient' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => updateConfig({ displayMode: mode.id as any })}
              className={`p-3 rounded-xl border font-bold text-center transition-all ${
                config.displayMode === mode.id 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div>{mode.nameAr}</div>
              <div className="text-[10px] opacity-80 font-latin">{mode.nameEn}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Media Pickers (Desktop Image, Mobile Image & Video) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Desktop Image */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>{t('صورة الهيرو الرئيسية (Desktop Image)', 'Desktop Image')}</span>
            </label>
            <button
              type="button"
              onClick={() => setShowDesktopMediaPicker(!showDesktopMediaPicker)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-bold transition-all"
            >
              {t('تغيير الصورة', 'Change Image')}
            </button>
          </div>

          {config.desktopImage && (
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img src={config.desktopImage} alt="Desktop Hero" className="w-full h-full object-cover" />
            </div>
          )}

          {showDesktopMediaPicker && (
            <MediaPicker
              value={config.desktopImage}
              onChange={(url) => updateConfig({ desktopImage: url })}
              onClose={() => setShowDesktopMediaPicker(false)}
            />
          )}
        </div>

        {/* Mobile Image */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{t('صورة الهيرو للموبايل (Mobile Image Override)', 'Mobile Image Override')}</span>
            </label>
            <button
              type="button"
              onClick={() => setShowMobileMediaPicker(!showMobileMediaPicker)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-bold transition-all"
            >
              {t('تغيير صورة الموبايل', 'Change Mobile Image')}
            </button>
          </div>

          {config.mobileImage ? (
            <div className="aspect-video sm:aspect-square max-h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mx-auto">
              <img src={config.mobileImage} alt="Mobile Hero" className="w-full h-full object-cover" />
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] p-4 text-center italic bg-slate-950 rounded-xl border border-slate-800">
              {t('لم يتم تعيين صورة منفصلة للموبايل (سيتم استخدام صورة سطح المكتب تلقائياً)', 'No separate mobile image set (Desktop image will adapt automatically)')}
            </p>
          )}

          {showMobileMediaPicker && (
            <MediaPicker
              value={config.mobileImage}
              onChange={(url) => updateConfig({ mobileImage: url })}
              onClose={() => setShowMobileMediaPicker(false)}
            />
          )}
        </div>

      </div>

      {/* Video Source (If video mode enabled) */}
      {(config.displayMode === 'video' || config.displayMode === 'video_overlay') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <label className="block font-bold text-slate-200 flex items-center gap-1.5">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>{t('رابط خلفية الفيديو (Google Drive / YouTube / MP4)', 'Video Background URL')}</span>
          </label>
          <input 
            type="url" 
            value={config.videoUrl || ''}
            onChange={(e) => updateConfig({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/... or https://drive.google.com/file/d/..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-latin"
          />
        </div>
      )}

      {/* 3. Detailed Image Controls System */}
      <ImageDisplayControls
        config={config.imageDisplay}
        onChange={(imgDisp) => updateConfig({ imageDisplay: imgDisp })}
        imageUrl={config.desktopImage}
        title={t('إعدادات احتواء ومحاذاة خلفية الهيرو', 'Hero Background Fit & Alignment')}
      />

      {/* 4. Overlay & Color Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <label className="block text-slate-200 font-bold text-sm flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>{t('تأثيرات الطبقة والتدرج اللوني (Overlay & Gradient Controls)', 'Overlay & Gradient Customization')}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('لون الطبقة (Overlay Color)', 'Overlay Color')}</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={config.overlayColor}
                onChange={(e) => updateConfig({ overlayColor: e.target.value })}
                className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
              />
              <span className="font-latin text-slate-300 font-bold">{config.overlayColor}</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('شفافية الطبقة (Opacity)', 'Overlay Opacity')}: {config.overlayOpacity}%</label>
            <input 
              type="range"
              min={0}
              max={100}
              value={config.overlayOpacity}
              onChange={(e) => updateConfig({ overlayOpacity: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-900 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('اتجاه التدرج اللوني (Gradient Direction)', 'Gradient Direction')}</label>
            <select
              value={config.gradientDirection}
              onChange={(e) => updateConfig({ gradientDirection: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="bottom-to-top">{t('من الأسفل للأعلى (Bottom to Top)', 'Bottom to Top')}</option>
              <option value="top-to-bottom">{t('من الأعلى للاسفل (Top to Bottom)', 'Top to Bottom')}</option>
              <option value="left-to-right">{t('من اليسار لليمين (Left to Right)', 'Left to Right')}</option>
              <option value="right-to-left">{t('من اليمين لليسار (Right to Left)', 'Right to Left')}</option>
              <option value="radial">{t('دائري من المركز (Radial)', 'Radial Center')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Animation & Dynamic Effects */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <label className="block text-slate-200 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{t('حركات وتأثيرات الهيرو (Hero Dynamic Animations)', 'Hero Animations')}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('نوع الحركة (Animation Style)', 'Animation Style')}</label>
            <select
              value={config.animationType}
              onChange={(e) => updateConfig({ animationType: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
            >
              <option value="none">None (بدون حركة)</option>
              <option value="pulse">Subtle Pulse (نبض هادئ)</option>
              <option value="breathing">Breathing (تنفس ناعم)</option>
              <option value="ken-burns">Ken Burns Effect</option>
              <option value="subtle-zoom-in">Subtle Zoom In</option>
              <option value="subtle-zoom-out">Subtle Zoom Out</option>
              <option value="slow-pan-left">Slow Pan Left</option>
              <option value="slow-pan-right">Slow Pan Right</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('سرعة الحركة (Speed Seconds)', 'Animation Duration')}: {config.animationSpeed}s</label>
            <input 
              type="range"
              min={3}
              max={25}
              value={config.animationSpeed}
              onChange={(e) => updateConfig({ animationSpeed: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-900 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300 py-2">
              <input 
                type="checkbox"
                checked={config.pauseOnHover}
                onChange={(e) => updateConfig({ pauseOnHover: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
              />
              <span>{t('إيقاف الحركة عند تحريك الماوس (Pause on Hover)', 'Pause on Hover')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 6. Heights & Responsive Content Alignment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <label className="block text-slate-200 font-bold text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>{t('ارتفاع الهيرو ومحاذاة النصوص (Hero Heights & Layout)', 'Hero Heights & Content Layout')}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('ارتفاع الكمبيوتر (Desktop Height)', 'Desktop Height')}</label>
            <input 
              type="text"
              value={config.desktopHeight}
              onChange={(e) => updateConfig({ desktopHeight: e.target.value })}
              placeholder="e.g. 85vh, 750px"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('ارتفاع التابلت (Tablet Height)', 'Tablet Height')}</label>
            <input 
              type="text"
              value={config.tabletHeight}
              onChange={(e) => updateConfig({ tabletHeight: e.target.value })}
              placeholder="e.g. 70vh, 550px"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-bold block mb-1">{t('ارتفاع الموبايل (Mobile Height)', 'Mobile Height')}</label>
            <input 
              type="text"
              value={config.mobileHeight}
              onChange={(e) => updateConfig({ mobileHeight: e.target.value })}
              placeholder="e.g. 65vh, 450px"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
