import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePlayerInfo } from '../../context/PlayerInfoContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { PlayerInfo, HeroConfig } from '../../types/player';
import { defaultImageDisplayConfig } from '../../data/initialData';
import { MediaPicker } from '../common/MediaPicker';
import { ImageDisplayControls } from '../common/ImageDisplayControls';
import { HeroCustomizer } from '../common/HeroCustomizer';
import { Save, Check, FileImage, Layout, Sparkles, Sliders, Trash2, Phone } from 'lucide-react';

interface OptionalInputProps {
  label: string;
  value: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  dir?: 'ltr' | 'rtl';
  onChange: (value: string) => void;
  t: (ar: string, en: string) => string;
}

const OptionalInput: React.FC<OptionalInputProps> = ({ label, value, type = 'text', dir, onChange, t }) => (
  <div className="min-w-0 space-y-1.5">
    <label className="block text-xs font-semibold text-slate-300">{label}</label>
    <div className="flex gap-2">
      <input
        type={type}
        value={value}
        dir={dir}
        onChange={event => onChange(event.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange('')}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {t('مسح', 'Clear')}
      </button>
    </div>
  </div>
);

const SOCIAL_FIELDS = [
  { key: 'instagram', ar: 'Instagram', en: 'Instagram' },
  { key: 'snapchat', ar: 'Snapchat', en: 'Snapchat' },
  { key: 'facebook', ar: 'Facebook', en: 'Facebook' },
  { key: 'youtube', ar: 'YouTube', en: 'YouTube' },
  { key: 'tiktok', ar: 'TikTok', en: 'TikTok' },
  { key: 'twitter', ar: 'X / Twitter', en: 'X / Twitter' },
  { key: 'transfermarkt', ar: 'Transfermarkt', en: 'Transfermarkt' },
] as const;

export const AdminPlayerProfile: React.FC = () => {
  const { t } = useLanguage();
  const { player: sharedPlayer, setPlayer: setSharedPlayer } = usePlayerInfo();
  const { hero: sharedHero, setHero: setSharedHero } = useSiteSettings();
  const [player, setPlayer] = useState<PlayerInfo>(sharedPlayer);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(sharedHero);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'hero' | 'imageControls' | 'contact'>('profile');

  // Active Picker Modal states
  const [activePicker, setActivePicker] = useState<'profile' | 'hero' | 'mobileHero' | 'cutout' | null>(null);

  useEffect(() => setHeroConfig(sharedHero), [sharedHero]);

  useEffect(() => {
    fetch('/api/player')
      .then(async response => response.ok ? await response.json() as PlayerInfo : null)
      .then(async value => {
        if (value) {
          const normalizedPlayer: PlayerInfo = {
            ...value,
            email: value.email ?? '',
            phone: value.phone ?? '',
            whatsapp: value.whatsapp ?? '',
            socialLinks: value.socialLinks ?? {},
          };
          setPlayer(normalizedPlayer);
          setSharedPlayer(normalizedPlayer);
          const heroResponse = await fetch('/api/settings/hero');
          const storedHero = heroResponse.ok ? await heroResponse.json() as Partial<HeroConfig> | null : null;
          setHeroConfig(current => ({
            ...current,
            ...storedHero,
            desktopImage: storedHero?.desktopImage ?? value.heroImage ?? '',
            mobileImage: storedHero?.mobileImage ?? value.mobileHeroImage ?? '',
          }));
        }
      })
      .catch(error => console.warn('Could not load player profile from server:', error));
  }, [setSharedPlayer]);

  const removeImage = (target: NonNullable<typeof activePicker>) => {
    if (target === 'profile') setPlayer(current => ({ ...current, profilePhoto: '' }));
    if (target === 'hero') {
      setPlayer(current => ({ ...current, heroImage: '' }));
      setHeroConfig(current => ({ ...current, desktopImage: '' }));
    }
    if (target === 'mobileHero') {
      setPlayer(current => ({ ...current, mobileHeroImage: '' }));
      setHeroConfig(current => ({ ...current, mobileImage: '' }));
    }
    if (target === 'cutout') setPlayer(current => ({ ...current, playerCutoutImage: '' }));
  };

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
      let savedHero: HeroConfig | null = null;
      if (activeTab !== 'contact') {
        savedHero = heroConfig;
      }
      if (savedHero && JSON.stringify(heroConfig) !== JSON.stringify(sharedHero)) {
        const heroResponse = await fetch('/api/settings/hero', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(heroConfig),
        });
        if (!heroResponse.ok) {
          setSaveError(true);
          return;
        }
        savedHero = await heroResponse.json() as HeroConfig;
      }
      setPlayer(savedPlayer);
      setSharedPlayer(savedPlayer);
      if (savedHero) {
        setHeroConfig(savedHero);
        setSharedHero(savedHero);
      }
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
      <div className="grid grid-cols-2 xl:grid-cols-4 items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`min-w-0 py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'profile' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileImage className="w-4 h-4" />
          <span>{t('البيانات والصور الرئيسية', 'Identity & Photos')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`min-w-0 py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'hero' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>{t('تخصيص الهيرو (Hero Customizer)', 'Hero Customizer')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('imageControls')}
          className={`min-w-0 py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'imageControls' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('تحكم عرض الصور (Image Controls)', 'Image Display Controls')}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`min-w-0 py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'contact' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Phone className="h-4 w-4" />
          <span>{t('التواصل والسوشيال ميديا', 'Contact & Social')}</span>
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
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {player.profilePhoto ? (
                    <img src={player.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500">{t('لا توجد صورة', 'No image')}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setActivePicker('profile')} className="py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors">
                    {t('تغيير الصورة', 'Change Photo')}
                  </button>
                  <button type="button" onClick={() => removeImage('profile')} disabled={!player.profilePhoto} className="py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5 inline-block me-1" />{t('إزالة الصورة', 'Remove')}
                  </button>
                </div>
              </div>

              {/* Desktop Hero */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('غلاف الكمبيوتر', 'Desktop Hero')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {player.heroImage ? (
                    <img src={player.heroImage} alt="Desktop Hero" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500">{t('لا توجد صورة', 'No image')}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setActivePicker('hero')} className="py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors">
                    {t('تغيير الصورة', 'Change Photo')}
                  </button>
                  <button type="button" onClick={() => removeImage('hero')} disabled={!player.heroImage} className="py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5 inline-block me-1" />{t('إزالة الصورة', 'Remove')}
                  </button>
                </div>
              </div>

              {/* Mobile Hero */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('غلاف الموبايل', 'Mobile Hero')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {player.mobileHeroImage ? (
                    <img src={player.mobileHeroImage} alt="Mobile Hero" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500">{t('لا توجد صورة', 'No image')}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setActivePicker('mobileHero')} className="py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors">
                    {t('تغيير الصورة', 'Change Photo')}
                  </button>
                  <button type="button" onClick={() => removeImage('mobileHero')} disabled={!player.mobileHeroImage} className="py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5 inline-block me-1" />{t('إزالة الصورة', 'Remove')}
                  </button>
                </div>
              </div>

              {/* Cutout Image */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block truncate">{t('صورة مقصوصة (Cutout)', 'Player Cutout')}</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {player.playerCutoutImage ? (
                    <img src={player.playerCutoutImage} alt="Cutout" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-500">{t('لا توجد صورة', 'No image')}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setActivePicker('cutout')} className="py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors">
                    {t('تغيير الصورة', 'Change Photo')}
                  </button>
                  <button type="button" onClick={() => removeImage('cutout')} disabled={!player.playerCutoutImage} className="py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5 inline-block me-1" />{t('إزالة الصورة', 'Remove')}
                  </button>
                </div>
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

      {activeTab === 'contact' && (
        <div className="space-y-5 text-xs">
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{t('التواصل المباشر', 'Direct Contact')}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <OptionalInput label="Email" type="email" value={player.email ?? ''} onChange={value => setPlayer(current => ({ ...current, email: value }))} t={t} />
              <OptionalInput label="Phone" type="tel" value={player.phone ?? ''} dir="ltr" onChange={value => setPlayer(current => ({ ...current, phone: value }))} t={t} />
              <OptionalInput label="WhatsApp" type="tel" value={player.whatsapp ?? ''} dir="ltr" onChange={value => setPlayer(current => ({ ...current, whatsapp: value }))} t={t} />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{t('وسائل التواصل الاجتماعي', 'Social Media')}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {SOCIAL_FIELDS.map(field => (
                <OptionalInput
                  key={field.key}
                  label={t(field.ar, field.en)}
                  type="url"
                  dir="ltr"
                  value={player.socialLinks?.[field.key] ?? ''}
                  onChange={value => setPlayer(current => ({ ...current, socialLinks: { ...current.socialLinks, [field.key]: value } }))}
                  t={t}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{t('الموقع الإلكتروني', 'Website')}</h3>
            </div>
            <div className="max-w-2xl">
              <OptionalInput label="Website URL" type="url" dir="ltr" value={player.websiteUrl ?? ''} onChange={value => setPlayer(current => ({ ...current, websiteUrl: value }))} t={t} />
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: Hero Customizer */}
      {activeTab === 'hero' && (
        <HeroCustomizer
          config={heroConfig}
          onChange={(newHeroCfg) => {
            setHeroConfig(newHeroCfg);
            setPlayer(prev => ({
              ...prev,
              heroImage: newHeroCfg.desktopImage || '',
              mobileHeroImage: newHeroCfg.mobileImage || '',
            }));
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
                activePicker === 'mobileHero' ? (player.mobileHeroImage || '') :
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
