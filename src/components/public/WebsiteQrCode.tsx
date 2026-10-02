import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const getHttpUrl = (value?: string): string => {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

export const WebsiteQrCode: React.FC<{ websiteUrl?: string }> = ({ websiteUrl }) => {
  const { t } = useLanguage();
  const url = getHttpUrl(websiteUrl);
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    let active = true;
    setQrImage('');
    if (url) {
      void import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(url, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 256,
          color: { dark: '#0b0f17', light: '#ffffff' },
        }))
        .then(image => { if (active) setQrImage(image); })
        .catch(() => { if (active) setQrImage(''); });
    }
    return () => { active = false; };
  }, [url]);

  if (!url || !qrImage) return null;

  return (
    <figure className="mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-center sm:w-fit">
      <img src={qrImage} alt={t('رمز QR لفتح الموقع', 'QR code to open the website')} className="h-40 w-40 max-w-full rounded-lg bg-white p-2 sm:h-44 sm:w-44" />
      <figcaption className="text-xs font-semibold text-slate-300">{t('مسح لفتح الموقع', 'Scan to open website')}</figcaption>
    </figure>
  );
};
