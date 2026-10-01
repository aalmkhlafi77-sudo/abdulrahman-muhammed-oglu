import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { ContactInquiry } from '../../types/player';
import { Mail, Trash2, CheckCircle2, Building, Clock } from 'lucide-react';

export const AdminInquiries: React.FC = () => {
  const { t } = useLanguage();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(DataService.getInquiries());

  const markRead = (id: string) => {
    DataService.markInquiryRead(id);
    setInquiries(DataService.getInquiries());
  };

  const deleteInquiry = (id: string) => {
    DataService.deleteInquiry(id);
    setInquiries(DataService.getInquiries());
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('رسائل واستفسارات الكشافين الأندية', 'Scout & Club Inquiries')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('مراجعة الطلبات الواردة من الأكاديميات والأندية وكلاء اللاعبين', 'Review incoming requests from clubs, scouts, agents & academies')}</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="p-12 bg-slate-900 rounded-2xl border border-slate-800 text-center">
          <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{t('لا توجد رسائل جديدة حالياً.', 'No inquiry messages received yet.')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div 
              key={inq.id}
              className={`bg-slate-900 rounded-2xl p-6 border transition-all ${
                inq.read ? 'border-slate-800 opacity-80' : 'border-cyan-500/50 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{inq.senderName}</span>
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase font-latin">
                      {inq.organizationType}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-latin block mt-0.5">{inq.senderEmail} {inq.senderPhone && `· ${inq.senderPhone}`}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!inq.read && (
                    <button
                      onClick={() => markRead(inq.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
                    >
                      {t('تعليم كـ مقروء', 'Mark Read')}
                    </button>
                  )}
                  <button
                    onClick={() => deleteInquiry(inq.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {inq.organization && (
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{inq.organization}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {inq.message}
              </p>

              <div className="mt-3 text-[10px] text-slate-500 font-latin flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Received at: {new Date(inq.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
