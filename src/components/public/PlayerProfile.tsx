import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, calculateAge } from '../../services/dataService';
import { Target, UserCheck, Languages, Check, Compass, Shield, Clock, Zap, Users, Brain, RefreshCw, MessageSquare } from 'lucide-react';

export const PlayerProfile: React.FC = () => {
  const { t } = useLanguage();
  const player = DataService.getPlayerInfo();
  const languages = DataService.getLanguages();
  const attributes = DataService.getAttributes();
  const age = calculateAge(player.dob);

  // Map icon names safely
  const getIcon = (name?: string) => {
    switch (name) {
      case 'Clock': return <Clock className="w-5 h-5 text-cyan-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'Users': return <Users className="w-5 h-5 text-cyan-400" />;
      case 'Brain': return <Brain className="w-5 h-5 text-cyan-400" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-cyan-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      default: return <UserCheck className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section id="profile" className="py-20 bg-[#0b0f17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('الملف الفني والرياضي', 'Athletic Profile')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('السيرة الذاتية والمهارات الشخصية', 'Player Profile & Characteristics')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Player Objective & Personal Characteristics */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Player Objective Card */}
            <div className="bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t('الهدف المهني للاعب', 'Player Objective')}
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                {t(player.objectiveAr, player.objectiveEn)}
              </p>
            </div>

            {/* Professional Attributes Grid */}
            <div className="bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span>{t('السمات الشخصية والمهنية', 'Professional Attributes & Work Rate')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attributes.map((attr) => (
                  <div 
                    key={attr.id}
                    className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {getIcon(attr.iconName)}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {t(attr.ar, attr.en)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Vitals Table & Languages & Education */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Vitals Table Card */}
            <div className="bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>{t('البيانات الشخصية الرسمية', 'Official Player Data')}</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{t('الاسم الكامل', 'Full Name')}</span>
                  <span className="font-bold text-white">{t(player.nameAr, player.nameEn)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{t('الجنسية', 'Nationality')}</span>
                  <span className="font-bold text-white">{t(player.nationalityAr, player.nationalityEn)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{t('الموقع الإقليمي', 'Location')}</span>
                  <span className="font-bold text-white">{t(player.locationAr, player.locationEn)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 font-latin">
                  <span className="text-slate-400">{t('تاريخ الميلاد', 'Date of Birth')}</span>
                  <span className="font-bold text-white">27 Aug 2003 ({age} {t('سنة', 'years')})</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800 font-latin">
                  <span className="text-slate-400">{t('القياسات البدنية', 'Physical Measurements')}</span>
                  <span className="font-bold text-cyan-400">{player.heightCm} cm · {player.weightKg} kg</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{t('المركز الرئيسي', 'Primary Position')}</span>
                  <span className="font-bold text-cyan-400">{t(player.primaryPositionAr, player.primaryPositionEn)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{t('المركز الثانوي', 'Secondary Position')}</span>
                  <span className="font-bold text-white">{t(player.secondaryPositionAr, player.secondaryPositionEn)}</span>
                </div>

                {/* Optional fields - rendered only if defined */}
                {(player.preferredFootAr || player.preferredFootEn) && (
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">{t('القدم المفضلة', 'Preferred Foot')}</span>
                    <span className="font-bold text-cyan-400">{t(player.preferredFootAr || '', player.preferredFootEn || '')}</span>
                  </div>
                )}

                {player.currentClubAr && (
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">{t('النادي الحالي', 'Current Club')}</span>
                    <span className="font-bold text-white">{t(player.currentClubAr, player.currentClubEn || '')}</span>
                  </div>
                )}

                {player.shirtNumber && (
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">{t('رقم القميص', 'Shirt Number')}</span>
                    <span className="font-bold text-cyan-400">#{player.shirtNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Languages & Education */}
            <div className="bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-cyan-400" />
                <span>{t('اللغات والتعليم', 'Languages & Education')}</span>
              </h3>

              <div className="space-y-3 mb-6">
                {languages.map((langItem) => (
                  <div key={langItem.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 text-xs sm:text-sm">
                    <span className="font-bold text-slate-200">{t(langItem.nameAr, langItem.nameEn)}</span>
                    <span className="text-cyan-400 font-medium">{t(langItem.levelAr, langItem.levelEn)}</span>
                  </div>
                ))}
              </div>

              {/* Education (Discrete quietly placed as per rule #11) */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">{t('المستوى التعليمي', 'Education Level')}</span>
                <span className="font-semibold text-slate-200">{t(player.educationAr, player.educationEn)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
