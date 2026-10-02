import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { calculateAge } from '../../services/dataService';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { usePlayerInfo } from '../../context/PlayerInfoContext';
import { ShieldAlert, Award, Star, CheckCircle, ExternalLink, Mail, Phone, ArrowUpRight } from 'lucide-react';

export const ScoutingCard: React.FC = () => {
  const { t } = useLanguage();
  const { player } = usePlayerInfo();
  const { achievements: allAchievements } = useStructuredContent();
  const achievements = allAchievements.filter(a => a.featured);
  const age = calculateAge(player.dob);
  const [profilePhotoFailed, setProfilePhotoFailed] = useState(false);
  useEffect(() => setProfilePhotoFailed(false), [player.profilePhoto]);

  return (
    <section id="scouting" className="py-16 bg-[#0e1420] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase font-latin mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>{t('تقييم الكشافين السريع', '10-SECOND SCOUTING DOSSIER')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {t('بطاقة تقييم اللاعب', 'Player Scouting Summary')}
            </h2>
          </div>
          <span className="text-xs text-slate-400 mt-2 md:mt-0 font-latin">
            {t('للتواصل المباشر مع الأندية والكشافين', 'Direct contact for clubs and scouts')}
          </span>
        </div>

        {/* Card Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left / Top: Player Avatar & Core Vitals */}
          <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-6 lg:pb-0 lg:pr-8">
            <div className="relative mb-4 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-xl">
              {player.profilePhoto && !profilePhotoFailed ? (
                <img
                  src={player.profilePhoto}
                  alt={player.nameEn}
                  onError={() => setProfilePhotoFailed(true)}
                  style={player.profilePhotoDisplay ? {
                    objectFit: player.profilePhotoDisplay.fit as any,
                    objectPosition: `${player.profilePhotoDisplay.focalPoint?.x ?? player.profilePhotoDisplay.positionX ?? 50}% ${player.profilePhotoDisplay.focalPoint?.y ?? player.profilePhotoDisplay.positionY ?? 50}%`,
                    transform: `scale(${player.profilePhotoDisplay.zoom || 1}) translate(${player.profilePhotoDisplay.panX || 0}px, ${player.profilePhotoDisplay.panY || 0}px)`,
                    filter: `brightness(${player.profilePhotoDisplay.brightness ?? 100}%) contrast(${player.profilePhotoDisplay.contrast ?? 100}%) saturate(${player.profilePhotoDisplay.saturation ?? 100}%) opacity(${player.profilePhotoDisplay.opacity ?? 100}%) blur(${player.profilePhotoDisplay.blur ?? 0}px)`
                  } : {
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  className="w-full h-full transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-xs text-slate-500">
                  {t('لا توجد صورة', 'No image')}
                </div>
              )}
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-cyan-500 text-slate-950 text-[11px] font-extrabold font-latin tracking-wider uppercase shadow-md z-10">
                {player.nationalityEn}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {t(player.nameAr, player.nameEn)}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-cyan-400 mb-4 uppercase font-latin">
              {t(player.primaryPositionAr, player.primaryPositionEn)}
            </p>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full text-center bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-latin">
              {age !== null && <div>
                <span className="block text-[10px] text-slate-400 uppercase">{t('العمر', 'Age')}</span>
                <span className="text-sm font-extrabold text-white">{age} <span className="text-[10px] text-cyan-400">{t('سنة', 'yrs')}</span></span>
              </div>}
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">{t('الطول', 'Height')}</span>
                <span className="text-sm font-extrabold text-white">{player.heightCm} <span className="text-[10px] text-cyan-400">cm</span></span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">{t('الوزن', 'Weight')}</span>
                <span className="text-sm font-extrabold text-white">{player.weightKg} <span className="text-[10px] text-cyan-400">kg</span></span>
              </div>
            </div>

            {/* Display Preferred Foot ONLY IF set */}
            {(player.preferredFootAr || player.preferredFootEn) && (
              <div className="mt-3 w-full bg-slate-800/50 p-2 rounded-lg text-xs font-medium text-slate-300">
                <span>{t('القدم المفضلة:', 'Preferred Foot:')} </span>
                <span className="font-bold text-cyan-400">{t(player.preferredFootAr || '', player.preferredFootEn || '')}</span>
              </div>
            )}
          </div>

          {/* Center: Tactical Positions & Primary Achievements */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-latin">
                {t('المراكز التكتيكية', 'Positions')}
              </h4>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30">
                  <span className="text-xs font-bold text-slate-300">{t('المركز الرئيسي', 'Primary Position')}</span>
                  <span className="text-sm font-extrabold text-cyan-400 uppercase font-latin">
                    {t(player.primaryPositionAr, player.primaryPositionEn)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400">{t('المركز الثانوي', 'Secondary Position')}</span>
                  <span className="text-sm font-semibold text-slate-200 uppercase font-latin">
                    {t(player.secondaryPositionAr, player.secondaryPositionEn)}
                  </span>
                </div>
              </div>

              {/* Key Achievements List */}
              {achievements.length > 0 && <>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-latin">
                  {t('أبرز الإنجازات', 'Key Achievements')}
                </h4>
                <div className="space-y-2">
                  {achievements.slice(0, 3).map((ach) => (
                    <div key={ach.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/40 text-xs">
                      <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-100">{t(ach.titleAr, ach.titleEn)}</span>
                        {ach.clubNameAr && <span className="block text-[11px] text-slate-400 mt-0.5">{t(ach.clubNameAr, ach.clubNameEn || '')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>}
            </div>
          </div>

          {/* Right: Direct Contact & Quick Actions */}
          <div className="lg:col-span-3 flex flex-col justify-between pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800/80 lg:pl-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-latin">
                {t('التواصل المباشر مع اللاعب', 'Direct Scouting Access')}
              </h4>
              
              <div className="space-y-2.5 mb-6 text-xs">
                {player.email?.trim() && <a
                  href={`mailto:${player.email.trim()}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">{player.email}</span>
                </a>}

                {player.phone?.trim() && <a
                  href={`tel:${player.phone.trim().replace(/[\s-]/g, '')}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <bdi dir="ltr" className="font-latin">{player.phone}</bdi>
                </a>}
              </div>
            </div>

            <div className="space-y-2">
              <a 
                href="#contact"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                <span>{t('إرسال عرض أو استفسار', 'Submit Club Inquiry')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              
              <a 
                href="#career"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:text-white transition-colors"
              >
                <span>{t('استعراض الأندية والمسيرة', 'View Club History')}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
