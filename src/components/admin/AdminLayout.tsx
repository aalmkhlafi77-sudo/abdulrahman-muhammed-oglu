import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
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
  Layers, 
  Palette, 
  Globe, 
  LogOut, 
  Lock, 
  ArrowLeft,
  Menu,
  X,
  Download,
  Upload,
  RotateCcw,
  AlertCircle,
  Settings
} from 'lucide-react';

interface AdminLayoutProps {
  onCloseAdmin: () => void;
  children: (activeTab: string) => React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onCloseAdmin, children }) => {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    const isValid = await DataService.verifyAdminPassword(passcode);
    const isDefaultHash = (await DataService.getAdminPasswordHash()) === '4c6806e5792ec0656a4252bd3cbfe52cfb9bbd0a793c1df7e132ad8d37446bc4';
    const isFallbackPass = isDefaultHash && ['scout2024', 'admin', '1234', '2003'].includes(passcode);

    if (isValid || isFallbackPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const handleExportJSON = () => {
    const jsonStr = DataService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abdurahman_portfolio_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = DataService.importAllDataJSON(content);
        if (success) {
          alert(t('تم استيراد النسخة الاحتياطية بنجاح!', 'Backup restored successfully!'));
          window.location.reload();
        } else {
          alert(t('فشل استيراد الملف. تأكد من صحة النسخة الاحتياطية.', 'Failed to restore backup file. Invalid format.'));
        }
      }
    };
    reader.readAsText(file);
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
    { key: 'sections', labelAr: 'ترتيب أقسام الصفحة', labelEn: 'Sections Manager', icon: <Layers className="w-4 h-4" /> },
    { key: 'theme', labelAr: 'المظهر والألوان', labelEn: 'Appearance & Colors', icon: <Palette className="w-4 h-4" /> },
    { key: 'seo', labelAr: 'إعدادات SEO والروابط', labelEn: 'SEO Settings', icon: <Globe className="w-4 h-4" /> },
    { key: 'security_branding', labelAr: 'الأمان وشعار الموقع', labelEn: 'Security & Branding', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentItem = menuItems.find(m => m.key === activeTab) || menuItems[0];

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b0f17] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">{t('لوحة إدارة ملف اللاعب', 'Admin Portal Login')}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('أدخل رمز الدخول لإدارة البيانات والميديا', 'Enter access PIN to manage portfolio & media')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('رمز المرور (PIN)', 'Passcode')}</label>
              <input 
                type="password" 
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder={t('أدخل رمز المرور (الافتراضي: scout2024)', 'Enter passcode (Default: scout2024)')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-latin text-center tracking-widest"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t('رمز المرور غير صحيح. جرب scout2024', 'Incorrect passcode. Try: scout2024')}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              {t('تسجيل الدخول', 'AUTHENTICATE ACCESS')}
            </button>

            <button
              type="button"
              onClick={onCloseAdmin}
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {t('العودة إلى الموقع الرئيسي', 'Return to Public Portfolio')}
            </button>
          </form>
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

        {/* Backup & Tools Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-1 text-[11px]">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center justify-center gap-1 transition-colors"
            title={t('تصدير نسخة احتياطية JSON', 'Export JSON Backup')}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('تصدير', 'Export')}</span>
          </button>

          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{t('استرجاع', 'Import')}</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="hidden" 
            />
          </label>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
            title={t('استعادة الضبط الافتراضي', 'Reset to Defaults')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
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

        {/* Backup & Tools Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-1 text-[11px]">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center justify-center gap-1 transition-colors"
            title={t('تصدير نسخة احتياطية JSON', 'Export JSON Backup')}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('تصدير', 'Export')}</span>
          </button>

          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{t('استرجاع', 'Import')}</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="hidden" 
            />
          </label>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
            title={t('استعادة الضبط الافتراضي', 'Reset to Defaults')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Manual Reset to Default Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-400 font-bold text-base">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3>{t('تأكيد استعادة البيانات الافتراضية', 'Confirm Reset to Default Data')}</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {t(
                'هذا الإجراء سيقوم بحذف جميع التعديلات المحفوظة والصور المرفوعة وإعادة المحتوى إلى البيانات الافتراضية الأولى. ننصح بتصدير نسخة احتياطية أولاً.',
                'This manual action will reset all your custom edits and uploaded images back to the initial default seed data. We recommend exporting a JSON backup first.'
              )}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  DataService.resetAll();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors"
              >
                {t('نعم، استعادة الافتراضي', 'YES, RESET ALL DATA')}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                {t('إلغاء', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
