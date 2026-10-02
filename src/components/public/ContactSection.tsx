import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { createInquiry } from '../../services/inquiriesApi';
import { usePlayerInfo } from '../../context/PlayerInfoContext';
import { Mail, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Social3DLinks } from './Social3DLinks';
import { WebsiteQrCode } from './WebsiteQrCode';

const validWebUrl = (value?: string): string => {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const { player } = usePlayerInfo();

  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const email = player.email?.trim() || '';
  const phone = player.phone?.trim() || '';
  const phoneHref = phone.replace(/[\s-]/g, '');
  const whatsapp = player.whatsapp?.trim() || '';
  const whatsappDigits = whatsapp.replace(/\D/g, '');
  const websiteUrl = validWebUrl(player.websiteUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await createInquiry(form);
      setSubmitted(true);
      setForm({ name: '', email: '', organization: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('تعذر إرسال الرسالة.', 'Unable to submit inquiry.'));
    } finally { setSubmitting(false); }
  };

  return (
    <section id="contact" className="py-20 bg-[#0e1420] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>{t('التواصل مع الأندية والكشافين', 'Club and Scout Contact')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('مهتم بالتواصل مع عبدالرحمن؟', 'Interested in contacting Abderrahman?')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('تواصل مباشر مع اللاعب أو إرسال استفسارات التعاقد والتجربة الميدانية', 'Direct communication channels for clubs, scouts, agents, and athletic directors')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Contact Info & Socials */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <div>
              {(email || phoneHref || whatsappDigits) && <h3 className="mb-5 text-xl font-bold text-white">{t('معلومات التواصل المباشرة', 'Direct Contact Channels')}</h3>}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {email && <a href={`mailto:${email}`} className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950 p-4 transition-colors hover:border-cyan-500/50 group">
                  <div className="shrink-0 rounded-lg bg-cyan-500/10 p-3 text-cyan-400 transition-colors group-hover:bg-cyan-500 group-hover:text-slate-950"><Mail className="h-5 w-5" /></div>
                  <div className="min-w-0"><span className="block text-[11px] font-semibold text-slate-400">{t('البريد الإلكتروني', 'Email Address')}</span><bdi dir="ltr" className="block truncate font-latin font-bold text-slate-100 transition-colors group-hover:text-cyan-400">{email}</bdi></div>
                </a>}
                {phoneHref && <a href={`tel:${phoneHref}`} className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950 p-4 transition-colors hover:border-cyan-500/50 group">
                  <div className="shrink-0 rounded-lg bg-cyan-500/10 p-3 text-cyan-400 transition-colors group-hover:bg-cyan-500 group-hover:text-slate-950"><Phone className="h-5 w-5" /></div>
                  <div className="min-w-0"><span className="block text-[11px] font-semibold text-slate-400">{t('رقم الهاتف', 'Phone Number')}</span><bdi dir="ltr" className="block truncate font-latin font-bold text-slate-100 transition-colors group-hover:text-cyan-400">{phone}</bdi></div>
                </a>}
                {whatsappDigits && <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950 p-4 transition-colors hover:border-emerald-500/50 group">
                  <div className="shrink-0 rounded-lg bg-emerald-500/10 p-3 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-slate-950"><MessageSquare className="h-5 w-5" /></div>
                  <div className="min-w-0"><span className="block text-[11px] font-semibold text-slate-400">{t('واتساب مباشر', 'Direct WhatsApp')}</span><bdi dir="ltr" className="block truncate font-latin font-bold text-slate-100 transition-colors group-hover:text-emerald-400">{whatsapp}</bdi></div>
                </a>}
              </div>

              <Social3DLinks />
              {websiteUrl && <>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm font-bold text-cyan-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-200">
                  <span>{t('الموقع الإلكتروني', 'Website')}</span><span dir="ltr" className="truncate font-latin">{websiteUrl}</span>
                </a>
                <WebsiteQrCode websiteUrl={websiteUrl} />
              </>}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-latin">
              <span>Istanbul, Türkiye</span>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">
              {t('إرسال طلب تقييم أو عرض رياضي', 'Submit Club Inquiry / Scouting Request')}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t('أرسل رسالة مباشرة إلى اللاعب', 'Send a message directly to the player')}
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{t('تم إرسال رسالتك بنجاح!', 'Message Submitted Successfully!')}</h4>
                  <p className="text-xs text-emerald-300 mt-1">{t('سيتم التواصل معكم في أقرب وقت ممكن.', 'Our management team will respond shortly.')}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('الاسم الكامل *', 'Full Name *')}</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder={t('أدخل اسمك', 'Enter your name')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('البريد الإلكتروني *', 'Email Address *')}</label>
                    <input 
                      type="email" 
                      required
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="scout@club.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 font-latin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('اسم النادي / الجهة', 'Club / Organization Name')}</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={e => setForm({...form, organization: e.target.value})}
                    placeholder={t('مثال: نادي إسطنبول باشاك شهير', 'e.g. Football Agency / FC Club')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('تفاصيل الرسالة أو العرض *', 'Message / Offer Details *')}</label>
                  <textarea 
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    placeholder={t('اكتب تفاصيل الاستفسار أو موعد التجربة الميدانية المطلوب...', 'Describe trial arrangements, contract inquiries, or video requests...')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {submitError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{submitError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 fill-slate-950" />
                  <span>{submitting ? t('جارٍ الإرسال...', 'Submitting...') : t('إرسال الاستفسار الآن', 'SEND INQUIRY NOW')}</span>
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
