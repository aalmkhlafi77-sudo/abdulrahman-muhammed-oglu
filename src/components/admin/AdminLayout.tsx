import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Trophy, 
  Activity, 
  Video, 
  Image as ImageIcon, 
  Radio, 
  FileText, 
  Mail, 
  LogOut, 
  Lock, 
  ArrowLeft,
  Menu,
  X,
  AlertCircle,
  Settings,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

interface AdminLayoutProps {
  onCloseAdmin: () => void;
  children: (activeTab: string) => React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onCloseAdmin, children }) => {
  const { t } = useLanguage();
  const { branding } = useSiteSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLogoFailed, setLoginLogoFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(response => setIsAuthenticated(response.ok))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthChecking(false));
  }, []);

  React.useEffect(() => {
    (window as any).adminNavigateToTab = (tab: string) => {
      setActiveTab(tab);
    };
    (window as any).adminClosePortal = () => {
      onCloseAdmin();
    };
    return () => {
      delete (window as any).adminNavigateToTab;
      delete (window as any).adminClosePortal;
    };
  }, [onCloseAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passcode }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthError(false);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  const menuItems = [
    { key: 'dashboard', labelAr: 'لوحة التحكم العامة', labelEn: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'profile', labelAr: 'الملف الشخصي والبيانات', labelEn: 'Player Profile', icon: <User className="w-4 h-4" /> },
    { key: 'career', labelAr: 'المسيرة والأندية', labelEn: 'Career & Clubs', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'achievements', labelAr: 'الإنجازات والألقاب', labelEn: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { key: 'stats', labelAr: 'الإحصائيات والأرقام', labelEn: 'Match Stats', icon: <Activity className="w-4 h-4" /> },
    { key: 'videos', labelAr: 'الفيديوهات والمهارات', labelEn: 'Video Library', icon: <Video className="w-4 h-4" /> },
    { key: 'photos', labelAr: 'مكتبة الوسائط والصور', labelEn: 'Media & Photo Library', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'media', labelAr: 'المقابلات والإعلام', labelEn: 'Media & Interviews', icon: <Radio className="w-4 h-4" /> },
    { key: 'cv', labelAr: 'السيرة الذاتية (CV)', labelEn: 'Player CV', icon: <FileText className="w-4 h-4" /> },
    { key: 'inquiries', labelAr: 'رسائل الكشافين', labelEn: 'Scout Inquiries', icon: <Mail className="w-4 h-4" /> },
    { key: 'security_branding', labelAr: 'الأمان وشعار الموقع', labelEn: 'Security & Branding', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentItem = menuItems.find(m => m.key === activeTab) || menuItems[0];

  if (authChecking) {
    return <div className="fixed inset-0 z-50 bg-[#0b0f17]" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-shell fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        <div className="admin-login-frame w-full max-w-[440px]">
          <div className="admin-login-card rounded-[calc(1.5rem-1px)] border border-slate-700/70 px-5 py-7 shadow-2xl sm:px-9 sm:py-9">
            <div className="mb-7 flex flex-col items-center text-center">
              {branding.showInAdminLogin && branding.logoUrl && branding.logoStatus !== 'removed' && !loginLogoFailed ? (
                <img src={branding.logoUrl} alt={t('شعار الموقع', 'Site logo')} onError={() => setLoginLogoFailed(true)} className="mb-5 h-12 max-w-[180px] object-contain" />
              ) : (
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-inner shadow-cyan-400/10">
                  <Lock className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{t('لوحة إدارة ملف اللاعب', 'Player Portfolio Admin')}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">{t('تسجيل الدخول إلى لوحة إدارة المحتوى', 'Sign in to manage portfolio content')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="admin-login-field">
                <AtSign className="admin-login-field__icon" aria-hidden="true" />
                <label htmlFor="admin-login-email" className="admin-login-field__label">{t('البريد الإلكتروني', 'Email')}</label>
                <input
                  id="admin-login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="username"
                  dir="ltr"
                  required
                  className="admin-login-field__input"
                />
              </div>

              <div className="admin-login-field">
                <Lock className="admin-login-field__icon" aria-hidden="true" />
                <label htmlFor="admin-login-password" className="admin-login-field__label">{t('كلمة المرور', 'Password')}</label>
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  autoComplete="current-password"
                  dir="ltr"
                  required
                  className="admin-login-field__input pe-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(visible => !visible)}
                  className="admin-login-password-toggle"
                  aria-label={showPassword ? t('إخفاء كلمة المرور', 'Hide password') : t('إظهار كلمة المرور', 'Show password')}
                  title={showPassword ? t('إخفاء كلمة المرور', 'Hide password') : t('إظهار كلمة المرور', 'Show password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>

              {authError && (
                <div role="alert" className="admin-login-error flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                  <span>{t('بيانات الدخول غير صحيحة', 'Invalid email or password')}</span>
                </div>
              )}

              <button type="submit" disabled={isLoggingIn} className="admin-login-submit">
                {isLoggingIn && <Loader2 className="admin-login-spinner h-4 w-4" aria-hidden="true" />}
                <span>{isLoggingIn ? t('جارٍ تسجيل الدخول...', 'Signing in...') : t('تسجيل الدخول', 'SIGN IN')}</span>
              </button>

              <button type="button" onClick={onCloseAdmin} className="admin-login-return">
                {t('العودة إلى الموقع الرئيسي', 'Return to Public Portfolio')}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-700/60 pt-5 text-[11px] text-slate-500">
              <Lock className="h-3.5 w-3.5 text-cyan-700" aria-hidden="true" />
              <span>{t('جلسة الإدارة محمية وآمنة', 'Secure administrator session')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f17] flex flex-col lg:flex-row overflow-hidden text-slate-100">
      
      {/* Mobile Top Navbar with Drawer Toggle */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-xs text-white truncate max-w-[180px]">
              {t(currentItem.labelAr, currentItem.labelEn)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseAdmin}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('الموقع', 'Site')}</span>
        </button>
      </header>

      {/* Mobile Navigation Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        />
      )}

      {/* Desktop Sidebar (Always visible, static, hidden on mobile) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-800 shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center font-latin text-xs">
              ADM
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">{t('لوحة الإدارة', 'Admin Panel')}</h2>
              <p className="text-[10px] text-slate-400">{t('إدارة البيانات والميديا', 'Full Portfolio System')}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveTab(item.key);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === item.key
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{t(item.labelAr, item.labelEn)}</span>
            </button>
          ))}
        </nav>

        {/* Logout / Exit */}
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800/80 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('تسجيل الخروج', 'Sign Out')}</span>
          </button>
        </div>

      </aside>

      {/* Mobile Navigation Drawer (Only rendered on mobile viewports when opened) */}
      <aside className={`
        fixed inset-y-0 left-0 rtl:right-0 z-50 lg:hidden
        w-72 bg-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-800
        flex flex-col shrink-0 transition-transform duration-300
        ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
      `}>
        
        {/* Sidebar Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center font-latin text-xs">
              ADM
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">{t('لوحة الإدارة', 'Admin Panel')}</h2>
              <p className="text-[10px] text-slate-400">{t('إدارة البيانات والميديا', 'Full Portfolio System')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveTab(item.key);
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === item.key
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{t(item.labelAr, item.labelEn)}</span>
            </button>
          ))}
        </nav>

        {/* Logout / Exit */}
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800/80 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('تسجيل الخروج', 'Sign Out')}</span>
          </button>
        </div>

      </aside>

      {/* Main Viewport Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 bg-[#0e1420]">
        {children(activeTab)}
      </main>

    </div>
  );
};
