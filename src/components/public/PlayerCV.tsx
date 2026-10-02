import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { calculateAge } from '../../services/dataService';
import { usePlayerInfo } from '../../context/PlayerInfoContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { FileText, Download, Printer } from 'lucide-react';

interface OfficialCv { url: string; }

export const PlayerCV: React.FC = () => {
  const { t, lang } = useLanguage();
  const { player } = usePlayerInfo();
  const { clubs } = useStructuredContent();
  const [officialCv, setOfficialCv] = useState<OfficialCv | null>(null);
  const [cvLang, setCvLang] = useState<'ar' | 'en'>(lang);
  const age = calculateAge(player.dob);

  useEffect(() => {
    fetch('/api/documents/cv')
      .then(async response => response.ok ? await response.json() as OfficialCv | null : null)
      .then(setOfficialCv)
      .catch(error => console.warn('Could not load official CV PDF:', error));
  }, []);

  const handlePrintCV = () => {
    window.print();
  };

  return (
    <section id="cv" className="py-20 bg-[#0b0f17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>{t('السيرة الذاتية الرسمية', 'Official CV Document')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('السيرة الذاتية الرياضية المعتمدة', 'Player CV & Printable Dossier')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('عرض وتحميل ملف السيرة الذاتية بصيغة PDF باللغتين العربية والإنجليزية', 'Interactive preview and downloadable sports resume in Arabic & English')}
          </p>
        </div>

        {/* CV Control Bar */}
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Language Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setCvLang('ar')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                cvLang === 'ar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية (CV)
            </button>
            <button
              onClick={() => setCvLang('en')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all font-latin ${
                cvLang === 'en' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              English (CV)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintCV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>{t('طباعة السيرة', 'Print Resume')}</span>
            </button>

            {officialCv?.url && (
              <a href={officialCv.url} download="official-cv.pdf" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition-all hover:shadow-cyan-500/20">
                <Download className="h-4 w-4 fill-slate-950" />
                <span>{t('تنزيل السيرة الرسمية PDF', 'Download Official PDF')}</span>
              </a>
            )}
          </div>

        </div>

        {/* CV Interactive Paper Sheet Preview */}
        <div 
          id="printable-cv"
          className="max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden"
          dir={cvLang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Header Banner Inside CV */}
          <div className="border-b border-slate-800 pb-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
                {cvLang === 'ar' ? player.nameAr : player.nameEn}
              </h1>
              <p className="text-sm font-bold text-cyan-400 tracking-wider uppercase font-latin">
                {cvLang === 'ar' ? `${player.primaryPositionAr} • ${player.secondaryPositionAr}` : `${player.primaryPositionEn} • ${player.secondaryPositionEn}`}
              </p>
            </div>

            <div className="text-xs text-slate-400 space-y-1 font-latin">
              <p><strong className="text-slate-200">{cvLang === 'ar' ? 'الجنسية:' : 'Nationality:'}</strong> {cvLang === 'ar' ? player.nationalityAr : player.nationalityEn}</p>
              <p><strong className="text-slate-200">{cvLang === 'ar' ? 'الموقع:' : 'Location:'}</strong> {cvLang === 'ar' ? player.locationAr : player.locationEn}</p>
              {age !== null && <p><strong className="text-slate-200">{cvLang === 'ar' ? 'العمر:' : 'Age:'}</strong> {age} {cvLang === 'ar' ? 'سنة' : 'years'}</p>}
              <p><strong className="text-slate-200">{cvLang === 'ar' ? 'البريد:' : 'Email:'}</strong> {player.email}</p>
              <p><strong className="text-slate-200">{cvLang === 'ar' ? 'الهاتف:' : 'Phone:'}</strong> {player.phone}</p>
            </div>
          </div>

          {/* Vitals & Career Summary inside CV */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs space-y-3">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider mb-2 font-latin">
                {cvLang === 'ar' ? 'القياسات البدنية' : 'PHYSICAL SPECS'}
              </h3>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'الطول:' : 'Height:'}</span> <strong className="text-white font-latin">{player.heightCm} cm</strong></p>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'الوزن:' : 'Weight:'}</span> <strong className="text-white font-latin">{player.weightKg} kg</strong></p>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'المركز الرئيسي:' : 'Primary:'}</span> <strong className="text-cyan-400">{cvLang === 'ar' ? player.primaryPositionAr : player.primaryPositionEn}</strong></p>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'المركز الثانوي:' : 'Secondary:'}</span> <strong className="text-white">{cvLang === 'ar' ? player.secondaryPositionAr : player.secondaryPositionEn}</strong></p>
              
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider pt-3 border-t border-slate-800 font-latin">
                {cvLang === 'ar' ? 'التعليم واللغات' : 'EDUCATION & LANGUAGES'}
              </h3>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'التعليم:' : 'Education:'}</span> <strong className="text-white">{cvLang === 'ar' ? player.educationAr : player.educationEn}</strong></p>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'العربية:' : 'Arabic:'}</span> <strong className="text-white">{cvLang === 'ar' ? 'اللغة الأم' : 'Native'}</strong></p>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'التركية:' : 'Turkish:'}</span> <strong className="text-white">{cvLang === 'ar' ? 'ممتاز' : 'Excellent'}</strong></p>
              <p><span className="text-slate-400">{cvLang === 'ar' ? 'الإنجليزية:' : 'English:'}</span> <strong className="text-white">{cvLang === 'ar' ? 'جيد' : 'Good'}</strong></p>
            </div>

            <div className="md:col-span-2 space-y-6 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 pb-1 border-b border-slate-800 font-latin">
                  {cvLang === 'ar' ? 'الهدف المهني' : 'CAREER OBJECTIVE'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {cvLang === 'ar' ? player.objectiveAr : player.objectiveEn}
                </p>
              </div>

              {clubs.length > 0 && <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800 font-latin">
                  {cvLang === 'ar' ? 'المسيرة الكروية والأندية' : 'CAREER & CLUB HISTORY'}
                </h3>
                <div className="space-y-3">
                  {clubs.map(c => (
                    <div key={c.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{cvLang === 'ar' ? c.clubNameAr : c.clubNameEn}</span>
                        <span className="text-cyan-400 font-latin">{cvLang === 'ar' ? c.durationAr : c.durationEn}</span>
                      </div>
                      {(cvLang === 'ar' ? c.levelAr : c.levelEn) && <p className="text-[11px] text-slate-400 mt-1">{cvLang === 'ar' ? c.levelAr : c.levelEn}</p>}
                      {(c.achievementsAr && c.achievementsAr.length > 0) && (
                        <p className="text-[11px] font-bold text-amber-400 mt-1">
                          ★ {(cvLang === 'ar' ? c.achievementsAr : c.achievementsEn)?.join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
