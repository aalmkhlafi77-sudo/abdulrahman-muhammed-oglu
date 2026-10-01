import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/dataService';
import { Mail, Phone, MessageSquare, Send, CheckCircle, Instagram, Youtube, Facebook, Twitter, Globe } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const player = DataService.getPlayerInfo();

  const [form, setForm] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    organization: '',
    organizationType: 'club' as const,
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.senderName || !form.senderEmail || !form.message) return;

    DataService.addInquiry(form);
    setSubmitted(true);
    setForm({
      senderName: '',
      senderEmail: '',
      senderPhone: '',
      organization: '',
      organizationType: 'club',
      message: ''
    });

    setTimeout(() => setSubmitted(false), 6000);
  };

  const socialIcons = [
    { key: 'instagram', url: player.socialLinks?.instagram, label: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
    { key: 'tiktok', url: player.socialLinks?.tiktok, label: 'TikTok', icon: <Globe className="w-5 h-5" /> },
    { key: 'youtube', url: player.socialLinks?.youtube, label: 'YouTube', icon: <Youtube className="w-5 h-5" /> },
    { key: 'facebook', url: player.socialLinks?.facebook, label: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
    { key: 'twitter', url: player.socialLinks?.twitter, label: 'X / Twitter', icon: <Twitter className="w-5 h-5" /> },
    { key: 'transfermarkt', url: player.socialLinks?.transfermarkt, label: 'Transfermarkt', icon: <Globe className="w-5 h-5" /> },
  ].filter(item => Boolean(item.url)); // Strictly hides empty links as mandated by requirement #33!

  return (
    <section id="contact" className="py-20 bg-[#0e1420] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>{t('التواصل الرسمي مع الكشافين والأندية', 'Official Scouting & Agent Contact')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('Interested in Abdurahman?', 'Interested in Abdurahman?')}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {t('تواصل مباشر مع اللاعب أو إرسال استفسارات التعاقد والتجربة الميدانية', 'Direct communication channels for clubs, scouts, agents, and athletic directors')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Contact Info & Socials */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-6">
                {t('معلومات التواصل المباشرة', 'Direct Contact Channels')}
              </h3>

              <div className="space-y-4 text-sm mb-8">
                {/* Email */}
                <a 
                  href={`mailto:${player.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block">{t('البريد الإلكتروني', 'Email Address')}</span>
                    <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors font-latin">{player.email}</span>
                  </div>
                </a>

                {/* Phone */}
                <a 
                  href={`tel:${player.phone}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block">{t('رقم الهاتف', 'Phone Number')}</span>
                    <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors font-latin">{player.phone}</span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  href={`https://wa.me/${player.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block">{t('واتساب مباشر', 'Direct WhatsApp')}</span>
                    <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors font-latin">{player.whatsapp}</span>
                  </div>
                </a>
              </div>

              {/* Social Channels (Strictly non-empty!) */}
              {socialIcons.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-latin">
                    {t('حسابات التواصل الاجتماعي المعتمدة', 'Verified Social Profiles')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {socialIcons.map((soc) => (
                      <a
                        key={soc.key}
                        href={soc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-all"
                        title={soc.label}
                      >
                        {soc.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-latin">
              <span>Istanbul, Türkiye · Turkish Football Federation ID Registered</span>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">
              {t('إرسال طلب تقييم أو عرض رياضي', 'Submit Club Inquiry / Scouting Request')}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t('نموذج المراسلة المباشرة الموجهة إلى الإدارة الرياضية للاعب', 'Direct inquiry form routed directly to Abdurahman and his sports management')}
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
                      value={form.senderName}
                      onChange={e => setForm({...form, senderName: e.target.value})}
                      placeholder={t('أدخل اسمك', 'Enter your name')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('البريد الإلكتروني *', 'Email Address *')}</label>
                    <input 
                      type="email" 
                      required
                      value={form.senderEmail}
                      onChange={e => setForm({...form, senderEmail: e.target.value})}
                      placeholder="scout@club.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 font-latin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-slate-300 font-semibold mb-1">{t('صفة المرسل', 'Role / Organization Type')}</label>
                    <select
                      value={form.organizationType}
                      onChange={e => setForm({...form, organizationType: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="club">{t('إدارة نادٍ محترف', 'Professional Club Management')}</option>
                      <option value="scout">{t('كشاف لاعبين (Scout)', 'Football Scout')}</option>
                      <option value="agent">{t('وكيل لاعبين (Agent)', 'Licensed Agent')}</option>
                      <option value="academy">{t('أكاديمية رياضية', 'Sports Academy')}</option>
                      <option value="media">{t('وسائل إعلام', 'Sports Media')}</option>
                      <option value="other">{t('جهة أخرى', 'Other')}</option>
                    </select>
                  </div>
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

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 fill-slate-950" />
                  <span>{t('إرسال الاستفسار الآن', 'SEND INQUIRY NOW')}</span>
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
