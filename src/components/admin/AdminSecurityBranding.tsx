import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, hashPassword } from '../../services/dataService';
import { BrandingConfig } from '../../types/player';
import { MediaPicker } from '../common/MediaPicker';
import { 
  Lock, 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Smartphone, 
  Monitor, 
  X,
  Palette,
  Layout,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const AdminSecurityBranding: React.FC = () => {
  const { t } = useLanguage();

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordErrorSuccess] = useState(false);
  const [logoutSessions, setLogoutSessions] = useState(true);

  // Branding States
  const [branding, setBranding] = useState<BrandingConfig>(() => DataService.getBrandingConfig());
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [activeLogoType, setActiveLogoType] = useState<'main' | 'mobile' | 'light' | 'dark' | null>(null);

  // Password strength checker helper
  const getPasswordStrength = (pass: string): { strength: 'weak' | 'medium' | 'strong'; label: string; color: string } => {
    if (!pass) return { strength: 'weak', label: t('ضعيفة', 'Weak'), color: 'bg-red-500 w-1/3' };
    if (pass.length < 8) {
      return { strength: 'weak', label: t('ضعيفة جداً (أقل من 8 أحرف)', 'Weak (< 8 chars)'), color: 'bg-red-500 w-1/3' };
    }
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    const conditionsCount = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

    if (conditionsCount >= 4 && pass.length >= 10) {
      return { strength: 'strong', label: t('قوية وآمنة', 'Strong & Secure'), color: 'bg-emerald-500 w-full' };
    }
    if (conditionsCount >= 2) {
      return { strength: 'medium', label: t('متوسطة', 'Medium'), color: 'bg-amber-500 w-2/3' };
    }
    return { strength: 'weak', label: t('ضعيفة', 'Weak'), color: 'bg-red-500 w-1/3' };
  };

  const strengthInfo = getPasswordStrength(newPassword);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordErrorSuccess(false);

    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    // 1. Check if current password is correct
    const isCurrentCorrect = await DataService.verifyAdminPassword(cleanCurrent);
    if (!isCurrentCorrect) {
      setPasswordError(t('كلمة المرور الحالية غير صحيحة', 'Current password is incorrect'));
      return;
    }

    // 2. Minimum validation
    if (cleanNew.length < 8) {
      setPasswordError(t('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل', 'New password must be at least 8 characters'));
      return;
    }

    // 3. Confirm password matches
    if (cleanNew !== cleanConfirm) {
      setPasswordError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }

    // 4. Update secure hash
    await DataService.updateAdminPassword(cleanNew);
    setPasswordErrorSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    if (logoutSessions) {
      // Clear authenticate session and force logout
      setTimeout(() => {
        sessionStorage.removeItem('admin_authenticated');
        window.location.reload();
      }, 2000);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.updateBrandingConfig(branding);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 3000);
  };

  const removeLogo = (type: 'main' | 'mobile' | 'light' | 'dark') => {
    if (type === 'main') {
      setBranding({ ...branding, logoUrl: '', logoStatus: 'removed' });
    } else if (type === 'mobile') {
      setBranding({ ...branding, mobileLogoUrl: '' });
    } else if (type === 'light') {
      setBranding({ ...branding, lightLogoUrl: '' });
    } else if (type === 'dark') {
      setBranding({ ...branding, darkLogoUrl: '' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('الأمان وشعار الموقع الرياضي', 'Security & Branding Settings')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('تغيير كلمة المرور الآمنة للمشرف وتخصيص ورفع شعار اللاعب المعروض بالموقع', 'Update secure admin password and manage custom brand logos')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Password Changer (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handlePasswordUpdate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-latin">{t('تغيير كلمة مرور المشرف', 'CHANGE ADMIN PASSWORD')}</h3>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 shrink-0" />
                <span>{t('تم تحديث كلمة المرور بنجاح! جاري إعادة التحميل...', 'Password updated successfully! Reloading...')}</span>
              </div>
            )}

            {/* Current Password Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">{t('كلمة المرور الحالية', 'Current Password')}</label>
              <div className="flex items-center gap-3">
                <input 
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-slate-100 font-latin text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  title={showCurrent ? t('إخفاء كلمة المرور', 'Hide Password') : t('إظهار كلمة المرور', 'Show Password')}
                  aria-label="Toggle Current Password Visibility"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                  <span className="text-[11px] font-bold hidden sm:inline">
                    {showCurrent ? t('إخفاء', 'Hide') : t('إظهار', 'Show')}
                  </span>
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">{t('كلمة المرور الجديدة', 'New Password')}</label>
              <div className="flex items-center gap-3">
                <input 
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-slate-100 font-latin text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  title={showNew ? t('إخفاء كلمة المرور', 'Hide Password') : t('إظهار كلمة المرور', 'Show Password')}
                  aria-label="Toggle New Password Visibility"
                >
                  {showNew ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                  <span className="text-[11px] font-bold hidden sm:inline">
                    {showNew ? t('إخفاء', 'Hide') : t('إظهار', 'Show')}
                  </span>
                </button>
              </div>

              {/* Password strength UI */}
              {newPassword && (
                <div className="pt-2 space-y-1.5 animate-fadeIn">
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${strengthInfo.color}`} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{t('قوة الرمز:', 'Strength:')}</span>
                    <span className="font-bold text-cyan-400">{strengthInfo.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">{t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}</label>
              <div className="flex items-center gap-3">
                <input 
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-slate-100 font-latin text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  title={showConfirm ? t('إخفاء كلمة المرور', 'Hide Password') : t('إظهار كلمة المرور', 'Show Password')}
                  aria-label="Toggle Confirm Password Visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                  <span className="text-[11px] font-bold hidden sm:inline">
                    {showConfirm ? t('إخفاء', 'Hide') : t('إظهار', 'Show')}
                  </span>
                </button>
              </div>
            </div>

            {/* Session log out check */}
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300 pt-1">
              <input 
                type="checkbox"
                checked={logoutSessions}
                onChange={(e) => setLogoutSessions(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-cyan-400 focus:ring-0"
              />
              <span>{t('تسجيل الخروج بعد التحديث لتأمين الجلسة', 'Log out and re-login after update')}</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs hover:from-red-600 hover:to-red-700 transition-colors shadow-lg flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('تحديث كلمة المرور', 'UPDATE PASSWORD')}</span>
            </button>
          </form>
        </div>

        {/* Column 2: Branding (Right) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveBranding} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Settings className="w-5 h-5 animate-spin-slow" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-latin">{t('إعدادات شعار الموقع الرياضي', 'SITE BRANDING & LOGOS')}</h3>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{t('حفظ الهوية', 'SAVE BRANDING')}</span>
              </button>
            </div>

            {brandingSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 shrink-0" />
                <span>{t('تم حفظ إعدادات الشعار والهوية بنجاح!', 'Branding specifications and logos saved!')}</span>
              </div>
            )}

            {/* Logo grid picker section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Main Logo Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{t('الشعار الرئيسي (Site Logo)', 'Main Site Logo')}</span>
                  {branding.logoUrl && (
                    <button type="button" onClick={() => removeLogo('main')} className="text-red-400 hover:text-red-300 font-bold" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 relative">
                  {branding.logoUrl ? (
                    <img 
                      src={branding.logoUrl} 
                      alt="Logo preview" 
                      style={{ objectFit: branding.logoFit === 'original' ? 'none' : branding.logoFit }}
                      className="w-full h-full max-h-24" 
                    />
                  ) : (
                    <span className="text-slate-500 font-latin text-[10px]">{t('لا يوجد شعار', 'No Logo Set')}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLogoType('main')}
                  className="w-full py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  {t('رفع أو اختيار شعار', 'Upload/Select Logo')}
                </button>
              </div>

              {/* Mobile Override Logo Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{t('شعار الهاتف البديل (Mobile Override)', 'Mobile Logo Override')}</span>
                  {branding.mobileLogoUrl && (
                    <button type="button" onClick={() => removeLogo('mobile')} className="text-red-400 hover:text-red-300 font-bold" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2">
                  {branding.mobileLogoUrl ? (
                    <img src={branding.mobileLogoUrl} alt="Mobile preview" className="max-h-24 object-contain" />
                  ) : (
                    <span className="text-slate-500 italic text-[10px]">{t('يستخدم الشعار الرئيسي تلقائياً', 'Fallback to Main Logo')}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLogoType('mobile')}
                  className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  {t('تعيين شعار موبايل', 'Set Mobile Logo')}
                </button>
              </div>

              {/* Light Logo Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{t('الشعار الفاتح (Light Theme Logo)', 'Light Theme Logo')}</span>
                  {branding.lightLogoUrl && (
                    <button type="button" onClick={() => removeLogo('light')} className="text-red-400 hover:text-red-300 font-bold" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="aspect-video rounded-xl bg-white flex items-center justify-center p-2">
                  {branding.lightLogoUrl ? (
                    <img src={branding.lightLogoUrl} alt="Light preview" className="max-h-24 object-contain" />
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">{t('يستخدم الشعار الرئيسي', 'Fallback to Main')}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLogoType('light')}
                  className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  {t('شعار الخلفيات الداكنة', 'Set Light Logo')}
                </button>
              </div>

              {/* Dark Logo Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{t('الشعار الداكن (Dark Theme Logo)', 'Dark Theme Logo')}</span>
                  {branding.darkLogoUrl && (
                    <button type="button" onClick={() => removeLogo('dark')} className="text-red-400 hover:text-red-300 font-bold" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                  {branding.darkLogoUrl ? (
                    <img src={branding.darkLogoUrl} alt="Dark preview" className="max-h-24 object-contain" />
                  ) : (
                    <span className="text-slate-500 italic text-[10px]">{t('يستخدم الشعار الرئيسي', 'Fallback to Main')}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLogoType('dark')}
                  className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  {t('شعار الخلفيات الفاتحة', 'Set Dark Logo')}
                </button>
              </div>

            </div>

            {/* Display and Width settings */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <span className="font-bold text-slate-200 block border-b border-slate-900 pb-2">{t('أبعاد الشعار والمحاذاة', 'Sizing & Position Alignment')}</span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('عرض الكمبيوتر (Desktop Width)', 'Desktop Logo Width')} (px)</label>
                  <input 
                    type="number"
                    value={branding.desktopLogoWidth}
                    onChange={(e) => setBranding({ ...branding, desktopLogoWidth: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-latin"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('عرض التابلت (Tablet Width)', 'Tablet Logo Width')} (px)</label>
                  <input 
                    type="number"
                    value={branding.tabletLogoWidth}
                    onChange={(e) => setBranding({ ...branding, tabletLogoWidth: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-latin"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('عرض الهاتف (Mobile Width)', 'Mobile Logo Width')} (px)</label>
                  <input 
                    type="number"
                    value={branding.mobileLogoWidth}
                    onChange={(e) => setBranding({ ...branding, mobileLogoWidth: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-latin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('المحاذاة (Alignment)', 'Logo Alignment')}</label>
                  <select
                    value={branding.logoAlignment}
                    onChange={(e) => setBranding({ ...branding, logoAlignment: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="left">{t('يسار الشاشة', 'Left')}</option>
                    <option value="center">{t('المنتصف', 'Center')}</option>
                    <option value="right">{t('يمين الشاشة', 'Right')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-1">{t('احتواء الشعار (Logo Fit)', 'Logo Fit')}</label>
                  <select
                    value={branding.logoFit}
                    onChange={(e) => setBranding({ ...branding, logoFit: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="contain">Contain (افتراضي - احتواء كامل)</option>
                    <option value="cover">Cover (تغطية مع قص)</option>
                    <option value="original">Original (الأبعاد الأصلية)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Placements Switches */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 block border-b border-slate-900 pb-2">{t('أماكن ظهور الشعار بالموقع', 'Display Locations Toggles')}</span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={branding.showInHeader}
                    onChange={(e) => setBranding({ ...branding, showInHeader: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span>Header (الترويسة)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={branding.showInFooter}
                    onChange={(e) => setBranding({ ...branding, showInFooter: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span>Footer (التذييل)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={branding.showInAdminSidebar}
                    onChange={(e) => setBranding({ ...branding, showInAdminSidebar: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span>Admin Sidebar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={branding.showInAdminLogin}
                    onChange={(e) => setBranding({ ...branding, showInAdminLogin: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span>Admin Portal Login</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={branding.showInFavicon}
                    onChange={(e) => setBranding({ ...branding, showInFavicon: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span>Favicon (أيقونة المتصفح)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={branding.showInSocialShare}
                    onChange={(e) => setBranding({ ...branding, showInSocialShare: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span>Social Share OG</span>
                </label>
              </div>
            </div>

          </form>
        </div>

      </div>

      {/* Media Picker Modal Overlay */}
      {activeLogoType && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <MediaPicker
              value={
                activeLogoType === 'main' ? branding.logoUrl :
                activeLogoType === 'mobile' ? branding.mobileLogoUrl :
                activeLogoType === 'light' ? branding.lightLogoUrl :
                branding.darkLogoUrl
              }
              onChange={(url) => {
                if (activeLogoType === 'main') {
                  setBranding({ ...branding, logoUrl: url, logoStatus: 'custom' });
                } else if (activeLogoType === 'mobile') {
                  setBranding({ ...branding, mobileLogoUrl: url });
                } else if (activeLogoType === 'light') {
                  setBranding({ ...branding, lightLogoUrl: url });
                } else if (activeLogoType === 'dark') {
                  setBranding({ ...branding, darkLogoUrl: url });
                }
                setActiveLogoType(null);
              }}
              onClose={() => setActiveLogoType(null)}
              title={t('اختر أو ارفع شعار الموقع الرياضي', 'Upload or Select Brand Logo')}
            />
          </div>
        </div>
      )}

    </div>
  );
};
