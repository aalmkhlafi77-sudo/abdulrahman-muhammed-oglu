import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ImageDisplayConfig, FitMode, PositionPreset } from '../../types/player';
import { Sliders, Focus, Maximize2, Move, Sun, Contrast, Eye, Smartphone, Monitor } from 'lucide-react';

interface ImageDisplayControlsProps {
  config: ImageDisplayConfig;
  onChange: (updated: ImageDisplayConfig) => void;
  imageUrl?: string;
  title?: string;
}

const POSITION_PRESETS: { id: PositionPreset; labelAr: string; labelEn: string; symbol: string; x: number; y: number }[] = [
  { id: 'top-left', labelAr: 'أعلى اليسار', labelEn: 'Top Left', symbol: '↖', x: 0, y: 0 },
  { id: 'top-center', labelAr: 'أعلى الوسط', labelEn: 'Top Center', symbol: '↑', x: 50, y: 0 },
  { id: 'top-right', labelAr: 'أعلى اليمين', labelEn: 'Top Right', symbol: '↗', x: 100, y: 0 },
  { id: 'center-left', labelAr: 'وسط اليسار', labelEn: 'Center Left', symbol: '←', x: 0, y: 50 },
  { id: 'center-center', labelAr: 'المنتصف', labelEn: 'Center Center', symbol: '●', x: 50, y: 50 },
  { id: 'center-right', labelAr: 'وسط اليمين', labelEn: 'Center Right', symbol: '→', x: 100, y: 50 },
  { id: 'bottom-left', labelAr: 'أسفل اليسار', labelEn: 'Bottom Left', symbol: '↙', x: 0, y: 100 },
  { id: 'bottom-center', labelAr: 'أسفل الوسط', labelEn: 'Bottom Center', symbol: '↓', x: 50, y: 100 },
  { id: 'bottom-right', labelAr: 'أسفل اليمين', labelEn: 'Bottom Right', symbol: '↘', x: 100, y: 100 },
];

const FIT_OPTIONS: { id: FitMode; labelAr: string; labelEn: string; descAr: string; descEn: string }[] = [
  { id: 'cover', labelAr: 'Cover (تغطية)', labelEn: 'Cover', descAr: 'ملء المساحة بالكامل مع احتمال قص الأطراف لضمان التغطية', descEn: 'Fill container completely with potential edge cropping' },
  { id: 'contain', labelAr: 'Contain (احتواء)', labelEn: 'Contain', descAr: 'إظهار الصورة كاملة داخل الإطار بدون أي قص', descEn: 'Fit entire image inside frame without any crop' },
  { id: 'fill', labelAr: 'Fill (تعبئة)', labelEn: 'Fill', descAr: 'مط وتعبئة المساحة بالكامل لتطابق الأبعاد', descEn: 'Stretch image to fill full container aspect ratio' },
  { id: 'scale-down', labelAr: 'Scale Down (تصغير)', labelEn: 'Scale Down', descAr: 'تقليل حجم الصورة تلقائياً للحفاظ على الأبعاد الأصلية', descEn: 'Reduce size automatically keeping original aspect' },
  { id: 'auto', labelAr: 'Auto (تلقائي)', labelEn: 'Auto', descAr: 'الحجم التلقائي بدون تغيير الأبعاد', descEn: 'Default original image scale' }
];

export const ImageDisplayControls: React.FC<ImageDisplayControlsProps> = ({
  config,
  onChange,
  imageUrl,
  title
}) => {
  const { t } = useLanguage();
  const [deviceTab, setDeviceTab] = useState<'desktop' | 'mobile'>('desktop');

  const updateConfig = (fields: Partial<ImageDisplayConfig>) => {
    onChange({ ...config, ...fields });
  };

  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (deviceTab === 'mobile') {
      updateConfig({ mobileFocalPoint: { x, y }, mobilePositionX: x, mobilePositionY: y });
    } else {
      updateConfig({ focalPoint: { x, y }, positionX: x, positionY: y });
    }
  };

  const currentFocal = deviceTab === 'mobile' 
    ? (config.mobileFocalPoint || config.focalPoint || { x: 50, y: 50 })
    : (config.focalPoint || { x: 50, y: 50 });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 animate-fadeIn text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sliders className="w-5 h-5" />
          <h3 className="font-bold text-sm sm:text-base text-white">{title || t('تحكم شاشة عرض الصورة (Fit & Position System)', 'Image Display & Alignment Control')}</h3>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDeviceTab('desktop')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              deviceTab === 'desktop' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t('سطح المكتب', 'Desktop')}</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceTab('mobile')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              deviceTab === 'mobile' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('الموبايل', 'Mobile')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Column 1: Interactive Focal Point & Fit Mode */}
        <div className="space-y-5">
          
          {/* Fit Mode Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-2 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>{t('طريقة احتواء الصورة (Image Fit)', 'Fit Mode')}</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {FIT_OPTIONS.map((fitOpt) => {
                const currentFit = deviceTab === 'mobile' ? (config.mobileFit || config.fit) : config.fit;
                const isSelected = currentFit === fitOpt.id;
                return (
                  <button
                    key={fitOpt.id}
                    type="button"
                    onClick={() => {
                      if (deviceTab === 'mobile') updateConfig({ mobileFit: fitOpt.id });
                      else updateConfig({ fit: fitOpt.id });
                    }}
                    className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                      isSelected ? 'bg-cyan-500/10 border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-cyan-300">{fitOpt.labelAr} / {fitOpt.labelEn}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t(fitOpt.descAr, fitOpt.descEn)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focal Point Interactive Picker Box */}
          {imageUrl && (
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Focus className="w-4 h-4 text-cyan-400" />
                  <span>{t('نقطة التركيز والوجه (Focal Point Picker)', 'Focal Point Picker')}</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-latin">X: {currentFocal.x}% | Y: {currentFocal.y}%</span>
              </label>
              <p className="text-[10px] text-slate-400 mb-2">{t('انقر داخل الصورة أدناه لتحديد نقطة الوجه أو الكرة لضبط المحاذاة تلقائياً', 'Click directly inside the image to pinpoint head/ball focus')}</p>
              
              <div 
                onClick={handleFocalPointClick}
                className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-700 hover:border-cyan-400 cursor-crosshair bg-slate-950 group select-none shadow-inner"
              >
                <img 
                  src={imageUrl} 
                  alt="Focal preview" 
                  className="w-full h-full object-cover pointer-events-none opacity-80"
                  style={{
                    objectFit: (deviceTab === 'mobile' ? (config.mobileFit || config.fit) : config.fit) as any,
                    objectPosition: `${currentFocal.x}% ${currentFocal.y}%`,
                    filter: `brightness(${config.brightness}%) contrast(${config.contrast}%) saturate(${config.saturation}%) opacity(${config.opacity}%) blur(${config.blur}px)`
                  }}
                />
                
                {/* Focal Point Target Ring */}
                <div 
                  className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-cyan-400 rounded-full bg-cyan-500/30 flex items-center justify-center shadow-lg transition-all duration-150 pointer-events-none"
                  style={{ left: `${currentFocal.x}%`, top: `${currentFocal.y}%` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Column 2: Presets, Custom Sliders & Filter Controls */}
        <div className="space-y-5">
          
          {/* Position Presets Grid */}
          <div>
            <label className="block text-slate-300 font-bold mb-2 flex items-center gap-1.5">
              <Move className="w-4 h-4 text-cyan-400" />
              <span>{t('المحاذاة السريعة (Position Presets)', 'Position Presets')}</span>
            </label>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              {POSITION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    if (deviceTab === 'mobile') {
                      updateConfig({ mobilePositionX: preset.x, mobilePositionY: preset.y, mobileFocalPoint: { x: preset.x, y: preset.y } });
                    } else {
                      updateConfig({ positionX: preset.x, positionY: preset.y, focalPoint: { x: preset.x, y: preset.y } });
                    }
                  }}
                  className="py-2.5 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <span className="text-lg font-bold leading-none text-cyan-400">{preset.symbol}</span>
                  <span className="text-[10px]">{preset.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tuning Position X / Y Sliders */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-1">
                <span>{t('المحاذاة الأفقية (Horizontal X)', 'Horizontal Position X')}</span>
                <span className="text-cyan-400 font-latin">{deviceTab === 'mobile' ? (config.mobilePositionX ?? config.positionX) : config.positionX}%</span>
              </div>
              <input 
                type="range"
                min={0}
                max={100}
                value={deviceTab === 'mobile' ? (config.mobilePositionX ?? config.positionX) : config.positionX}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (deviceTab === 'mobile') updateConfig({ mobilePositionX: val });
                  else updateConfig({ positionX: val });
                }}
                className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-1">
                <span>{t('المحاذاة الرأسية (Vertical Y)', 'Vertical Position Y')}</span>
                <span className="text-cyan-400 font-latin">{deviceTab === 'mobile' ? (config.mobilePositionY ?? config.positionY) : config.positionY}%</span>
              </div>
              <input 
                type="range"
                min={0}
                max={100}
                value={deviceTab === 'mobile' ? (config.mobilePositionY ?? config.positionY) : config.positionY}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (deviceTab === 'mobile') updateConfig({ mobilePositionY: val });
                  else updateConfig({ positionY: val });
                }}
                className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-1">
                <span>{t('التكبير والتصغير (Image Zoom)', 'Image Zoom')}</span>
                <span className="text-cyan-400 font-latin">{((deviceTab === 'mobile' ? (config.mobileZoom ?? config.zoom) : config.zoom) * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={deviceTab === 'mobile' ? (config.mobileZoom ?? config.zoom) : config.zoom}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (deviceTab === 'mobile') updateConfig({ mobileZoom: val });
                  else updateConfig({ zoom: val });
                }}
                className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Color Adjustments: Brightness, Contrast, Saturation, Blur */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span>{t('تأثيرات السطوع واللون (Image FX Filters)', 'Filters & Color')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('السطوع (Brightness)', 'Brightness')}: {config.brightness}%</label>
                <input 
                  type="range"
                  min={0}
                  max={200}
                  value={config.brightness}
                  onChange={(e) => updateConfig({ brightness: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('التباين (Contrast)', 'Contrast')}: {config.contrast}%</label>
                <input 
                  type="range"
                  min={0}
                  max={200}
                  value={config.contrast}
                  onChange={(e) => updateConfig({ contrast: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('الإشباع (Saturation)', 'Saturation')}: {config.saturation}%</label>
                <input 
                  type="range"
                  min={0}
                  max={200}
                  value={config.saturation}
                  onChange={(e) => updateConfig({ saturation: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('الضبابية (Blur)', 'Blur')}: {config.blur}px</label>
                <input 
                  type="range"
                  min={0}
                  max={20}
                  value={config.blur}
                  onChange={(e) => updateConfig({ blur: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
