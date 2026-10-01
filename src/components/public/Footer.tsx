import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { Shield } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { t } = useLanguage();
  const player = DataService.getPlayerInfo();

  return (
    <footer className="bg-[#070a0f] border-t border-slate-800/80 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-slate-950 font-latin text-xs">
            AMO
          </div>
          <div>
            <span className="font-bold text-white block text-sm">
              {t(player.nameAr, player.nameEn)}
            </span>
            <span className="text-[11px] text-slate-500 font-latin">
              {t('الملف الكشفي والمحفظة الرياضية الرسمية', 'Official Player Portfolio & Scouting Platform')}
            </span>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="flex flex-wrap items-center gap-6 font-medium text-slate-300">
          <a href="#scouting" className="hover:text-cyan-400 transition-colors">{t('التقييم', 'Scouting')}</a>
          <a href="#profile" className="hover:text-cyan-400 transition-colors">{t('الملف', 'Profile')}</a>
          <a href="#career" className="hover:text-cyan-400 transition-colors">{t('المسيرة', 'Career')}</a>
          <a href="#highlights" className="hover:text-cyan-400 transition-colors">{t('الفيديوهات', 'Highlights')}</a>
          <a href="#cv" className="hover:text-cyan-400 transition-colors">{t('السيرة', 'CV')}</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">{t('التواصل', 'Contact')}</a>
        </div>

        {/* Copyright & Admin Link */}
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()} {player.nameEn}. All rights reserved.</span>
          <button
            onClick={onOpenAdmin}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-cyan-400 transition-colors"
            title={t('لوحة الإدارة', 'Admin Panel')}
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
