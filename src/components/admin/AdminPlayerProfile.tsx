import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { usePlayerInfo } from '../../context/PlayerInfoContext';
import { PlayerInfo, HeroConfig } from '../../types/player';
import { defaultImageDisplayConfig } from '../../data/initialData';
import { MediaPicker } from '../common/MediaPicker';
import { ImageDisplayControls } from '../common/ImageDisplayControls';
import { HeroCustomizer } from '../common/HeroCustomizer';
import { Save, Check, FileImage, Layout, Sparkles, Sliders } from 'lucide-react';

export const AdminPlayerProfile: React.FC = () => {
  const { t } = useLanguage();
  const { player: sharedPlayer, setPlayer: setSharedPlayer } = usePlayerInfo();
  const [player, setPlayer] = useState<PlayerInfo>(sharedPlayer);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(DataService.getHeroConfig());
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'hero' | 'imageControls'>('profile');

  // Active Picker Modal states
  const [activePicker, setActivePicker] = useState<'profile' | 'hero' | 'mobileHero' | 'cutout' | null>(null);

  useEffect(() => {
    fetch('/api/player')
      .then(async response => response.ok ? await response.json() as PlayerInfo : null)
      .then(value => {
        if (value) {
          setPlayer(value);
          setSharedPlayer(value);
        }
      })
      .catch(error => console.warn('Could not load player profile from server:', error));
  }, [setSharedPlayer]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError(false);
    try {
      const response = await fetch('/api/player', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
      });
      if (!response.ok) {
        setSaveError(true);
        return;
      }
      const savedPlayer = await response.json() as PlayerInfo;
      setPlayer(savedPlayer);
      setSharedPlayer(savedPlayer);
      DataService.updateHeroConfig(heroConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Could not save player profile:', error);
      setSaveError(true);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header & Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('تعديل الملف الشخصي واجهة الهيرو', 'Edit Player Profile & Hero')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('تعديل الهوية، الهيرو، الصور، نقاط التركيز (Focal Point) والتحكم بالمظهر', 'Manage identity, Hero banner, images, Focal Point & Display Controls')}</p>
        </div>

        <button
          onClick={() => handleSave()}
          className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{t('حفظ جميع التغييرات', 'SAVE ALL CHANGES')}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{t('تم حفظ جميع البيانات والصور بنجاح!', 'All player details, images & hero settings saved successfully!')}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {t('تعذر حفظ الملف. تحقق من تسجيل الدخول واتصال الخادم.', 'Could not save profile. Check your login and server connection.')}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'profile' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileImage className="w-4 h-4" />
          <span>{t('البيانات والصور الرئيسية', 'Identity & Photos')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'hero' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>{t('تخصيص الهيرو (Hero Customizer)', 'Hero Customizer')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('imageControls')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'imageControls' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('تحكم عرض الصور (Image Controls)', 'Image Display Controls')}</span>
        </button>
      </div>

      {/* TAB 1: Profile & Identity */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* Main Portfolio Imagery */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-latin">{t('صور اللاعب والهوية البصرية', 'PLAYER PORTFOLIO IMAGERY')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Profile Photo */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('الصورة الشخصية', 'Profile Photo')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img src={player.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setActivePicker('profile')}
                  className="w-full py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  {t('تغيير الصورة', 'Change Photo')}
                </button>
              </div>

              {/* Desktop Hero */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('غلاف الكمبيوتر', 'Desktop Hero')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img src={player.heroImage} alt="Desktop Hero" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setActivePicker('hero')}
                  className="w-full py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  {t('تغيير الصورة', 'Change Photo')}
                </button>
              </div>

              {/* Mobile Hero */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('غلاف الموبايل', 'Mobile Hero')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img src={player.mobileHeroImage || player.heroImage} alt="Mobile Hero" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setActivePicker('mobileHero')}
                  className="w-full py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  {t('تغيير الصورة', 'Change Photo')}
                </button>
              </div>

              {/* Cutout Image */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('صورة مقصوصة (Cutout)', 'Player Cutout')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {player.playerCutoutImage ? (
                    <img src={player.playerCutoutImage} alt="Cutout" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-500">{t('لا توجد صورة مقصوصة', 'No Cutout Image')}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActivePicker('cutout')}
                  className="w-full py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  {t('تغيير الصورة', 'Change Photo')}
                </button>
              </div>

            </div>
          </div>

          {/* Basic Names & Info */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-latin">{t('الاسم والبيانات الأساسية', 'BASIC IDENTITY')}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('الاسم بالعربية', 'Arabic Name')}</label>
                <input 
                  type="text" 
                  value={player.nameAr}
                  onChange={e => setPlayer({...player, nameAr: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('الاسم بالإنجليزية', 'English Name')}</label>
                <input 
                  type="text" 
                  value={player.nameEn}
                  onChange={e => setPlayer({...player, nameEn: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('الجنسية', 'Nationality')}</label>
                <input 
                  type="text" 
                  value={player.nationalityEn}
                  onChange={e => setPlayer({...player, nationalityEn: e.target.value, nationalityAr: e.target.value === 'Turkish' ? 'تركي' : e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('الموقع الإقليمي', 'Location')}</label>
                <input 
                  type="text" 
                  value={player.locationEn}
                  onChange={e => setPlayer({...player, locationEn: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('تاريخ الميلاد (YYYY-MM-DD)', 'Date of Birth')}</label>
                <input 
                  type="text" 
                  value={player.dob}
                  onChange={e => setPlayer({...player, dob: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>
            </div>
          </div>

          {/* Physical specs & Positions */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-latin">{t('المراكز والقياسات البدنية', 'POSITIONS & PHYSICAL SPECS')}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('الطول (سم)', 'Height (CM)')}</label>
                <input 
                  type="number" 
                  value={player.heightCm}
                  onChange={e => setPlayer({...player, heightCm: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('الوزن (كجم)', 'Weight (KG)')}</label>
                <input 
                  type="number" 
                  value={player.weightKg}
                  onChange={e => setPlayer({...player, weightKg: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('القدم المفضلة (اختياري)', 'Preferred Foot (Optional)')}</label>
                <input 
                  type="text" 
                  value={player.preferredFootEn || ''}
                  onChange={e => setPlayer({...player, preferredFootEn: e.target.value, preferredFootAr: e.target.value === 'Right' ? 'اليمنى' : e.target.value === 'Left' ? 'اليسرى' : e.target.value})}
                  placeholder={t('اتركه فارغاً إن لم يحدد', 'Leave blank if unassigned')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('المركز الرئيسي (Primary)', 'Primary Position')}</label>
                <input 
                  type="text" 
                  value={player.primaryPositionEn}
                  onChange={e => setPlayer({...player, primaryPositionEn: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('المركز الثانوي (Secondary)', 'Secondary Position')}</label>
                <input 
                  type="text" 
                  value={player.secondaryPositionEn}
                  onChange={e => setPlayer({...player, secondaryPositionEn: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
                />
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-latin">{t('الهدف المهني', 'PLAYER OBJECTIVE')}</h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('الهدف بالعربية', 'Objective (Arabic)')}</label>
              <textarea 
                rows={3}
                value={player.objectiveAr}
                onChange={e => setPlayer({...player, objectiveAr: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('الهدف بالإنجليزية', 'Objective (English)')}</label>
              <textarea 
                rows={3}
                value={player.objectiveEn}
                onChange={e => setPlayer({...player, objectiveEn: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-latin"
              />
            </div>
          </div>

        </form>
      )}

      {/* TAB 2: Hero Customizer */}
      {activeTab === 'hero' && (
        <HeroCustomizer
          config={heroConfig}
          onChange={(newHeroCfg) => {
            setHeroConfig(newHeroCfg);
            // Also sync hero image with player.heroImage
            if (newHeroCfg.desktopImage) {
              setPlayer(prev => ({ ...prev, heroImage: newHeroCfg.desktopImage }));
            }
          }}
        />
      )}

      {/* TAB 3: Profile Photo Display Controls */}
      {activeTab === 'imageControls' && (
        <ImageDisplayControls
          config={player.profilePhotoDisplay || defaultImageDisplayConfig}
          onChange={(newImgCfg) => setPlayer(prev => ({ ...prev, profilePhotoDisplay: newImgCfg }))}
          imageUrl={player.profilePhoto}
          title={t('تحكم شاشة عرض صورة اللاعب الشخصية (Profile Photo Fit & Position)', 'Profile Photo Display & Alignment Control')}
        />
      )}

      {/* Media Picker Modal */}
      {activePicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-2xl w-full">
            <MediaPicker
              value={
                activePicker === 'profile' ? player.profilePhoto :
                activePicker === 'hero' ? player.heroImage :
                activePicker === 'mobileHero' ? (player.mobileHeroImage || player.heroImage) :
                (player.playerCutoutImage || '')
              }
              onChange={(url) => {
                if (activePicker === 'profile') setPlayer(prev => ({ ...prev, profilePhoto: url }));
                if (activePicker === 'hero') {
                  setPlayer(prev => ({ ...prev, heroImage: url }));
                  setHeroConfig(prev => ({ ...prev, desktopImage: url }));
                }
                if (activePicker === 'mobileHero') {
                  setPlayer(prev => ({ ...prev, mobileHeroImage: url }));
                  setHeroConfig(prev => ({ ...prev, mobileImage: url }));
                }
                if (activePicker === 'cutout') setPlayer(prev => ({ ...prev, playerCutoutImage: url }));
                setActivePicker(null);
              }}
              onClose={() => setActivePicker(null)}
            />
          </div>
        </div>
      )}

      {/* Mobile Sticky Save Action Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => handleSave()}
          className="w-full py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('حفظ جميع التعديلات الحالية', 'SAVE ALL CHANGES')}</span>
        </button>
      </div>

    </div>
  );
};
