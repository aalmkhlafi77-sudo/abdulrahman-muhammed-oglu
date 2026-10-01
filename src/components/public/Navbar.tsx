import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Play, Globe, Menu, X, Settings, Download } from 'lucide-react';
import { DataService } from '../../services/dataService';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenHighlights: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onOpenHighlights }) => {
  const { lang, toggleLang, isRtl, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const player = DataService.getPlayerInfo();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#scouting', labelAr: 'التقييم السريع', labelEn: 'Scouting' },
    { href: '#profile', labelAr: 'الملف الشخصي', labelEn: 'Profile' },
    { href: '#career', labelAr: 'المسيرة', labelEn: 'Career' },
    { href: '#highlights', labelAr: 'الفيديوهات', labelEn: 'Highlights' },
    { href: '#gallery', labelAr: 'الصور', labelEn: 'Gallery' },
    { href: '#contact', labelAr: 'التواصل', labelEn: 'Contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-xl' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <a 
          href="#" 
          className="flex items-center gap-3 group animate-fadeIn"
        >
          {(() => {
            const branding = DataService.getBrandingConfig();
            const showLogo = branding.showInHeader && branding.logoUrl && branding.logoStatus !== 'removed';
            const logoSrc = branding.logoUrl;
            
            if (showLogo) {
              return (
                <div className={`flex items-center ${
                  branding.logoAlignment === 'center' ? 'justify-center' :
                  branding.logoAlignment === 'right' ? 'justify-end' : 'justify-start'
                }`}>
                  <picture className="block">
                    {branding.mobileLogoUrl && (
                      <source media="(max-width: 640px)" srcSet={branding.mobileLogoUrl} />
                    )}
                    <img 
                      src={logoSrc} 
                      alt="Brand Logo" 
                      referrerPolicy="no-referrer"
                      style={{
                        objectFit: branding.logoFit === 'original' ? 'none' : branding.logoFit,
                        maxWidth: `${branding.desktopLogoWidth}px`
                      }}
                      className="max-h-12 w-auto transition-all duration-300"
                    />
                  </picture>
                </div>
              );
            }
            return (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform font-latin tracking-wider">
                AMO
              </div>
            );
          })()}
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight group-hover:text-cyan-400 transition-colors">
              {t(player.nameAr, player.nameEn)}
            </span>
            <span className="text-[11px] font-medium text-cyan-400/90 tracking-widest uppercase font-latin">
              {t('لاعب محترف', 'Professional Footballer')}
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="hover:text-cyan-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              {t(link.labelAr, link.labelEn)}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Actions & Settings */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-400 text-xs font-semibold transition-all"
            title={t('تغيير اللغة', 'Switch Language')}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase font-latin">{lang === 'ar' ? 'EN' : 'العربية'}</span>
          </button>

          {/* Official Highlights Quick CTA */}
          <button
            onClick={onOpenHighlights}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>{t('الفيديو الرسمي', 'Official Highlights')}</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors"
            title={t('لوحة الإدارة', 'Admin Portal')}
          >
            <Settings className="w-4 h-4 hover:spin-slow" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b0f17]/95 border-b border-slate-800 px-6 py-6 mt-2 backdrop-blur-xl animate-fadeIn">
          <div className="flex flex-col gap-4 text-base font-medium text-slate-200">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-cyan-400 transition-colors py-2 border-b border-slate-800/50"
              >
                {t(link.labelAr, link.labelEn)}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenHighlights();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{t('الفيديو الرسمي', 'Official Highlights')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
