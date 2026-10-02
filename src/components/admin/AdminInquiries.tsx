import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { deleteInquiry, getInquiries, markInquiryRead } from '../../services/inquiriesApi';
import type { ContactInquiry } from '../../types/player';
import { Building, Clock, Mail, Trash2 } from 'lucide-react';

export const AdminInquiries: React.FC = () => {
  const { t } = useLanguage();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => setInquiries(await getInquiries()), []);

  useEffect(() => { void refresh().catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load inquiries')); }, [refresh]);

  const read = async (id: string) => {
    try { await markInquiryRead(id); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not mark inquiry read'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('حذف هذه الرسالة؟', 'Delete this inquiry?'))) return;
    try { await deleteInquiry(id); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete inquiry'); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('رسائل واستفسارات الكشافين والأندية', 'Scout & Club Inquiries')}</h1>
        <p className="mt-1 text-xs text-slate-400">{t('مراجعة الطلبات الواردة من الأندية والكشافين.', 'Review incoming inquiries from clubs and scouts.')}</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      {!inquiries.length ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <Mail className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">{t('لا توجد رسائل حالياً.', 'No inquiries yet.')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <article key={inquiry.id} className={`rounded-2xl border bg-slate-900 p-6 ${inquiry.readAt ? 'border-slate-800 opacity-80' : 'border-cyan-500/50 shadow-lg'}`}>
              <div className="mb-4 flex flex-col justify-between gap-4 border-b border-slate-800 pb-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-bold text-white">{inquiry.name}</h2>
                  <a href={`mailto:${inquiry.email}`} className="mt-1 block text-xs text-cyan-300">{inquiry.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  {!inquiry.readAt && <button onClick={() => void read(inquiry.id)} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950">{t('تعليم كمقروء', 'Mark read')}</button>}
                  <button onClick={() => void remove(inquiry.id)} className="rounded-lg bg-slate-800 p-2 text-red-400" aria-label={t('حذف الرسالة', 'Delete inquiry')}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {inquiry.organization && <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-300"><Building className="h-3.5 w-3.5 text-cyan-400" />{inquiry.organization}</div>}
              <p className="whitespace-pre-wrap rounded-xl border border-slate-800/80 bg-slate-950 p-4 text-xs leading-relaxed text-slate-200">{inquiry.message}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500"><Clock className="h-3 w-3" />{new Date(inquiry.createdAt).toLocaleString()}</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
