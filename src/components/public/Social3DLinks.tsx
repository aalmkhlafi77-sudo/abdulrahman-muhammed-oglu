import React from 'react';
import { Facebook, Globe2, Instagram, Music2, Twitter, Youtube } from 'lucide-react';
import { usePlayerInfo } from '../../context/PlayerInfoContext';
import { useLanguage } from '../../context/LanguageContext';

export const Social3DLinks: React.FC = () => {
  const { player } = usePlayerInfo();
  const { t } = useLanguage();
  const links = [
    { key: 'instagram', label: 'Instagram', url: player.socialLinks?.instagram, Icon: Instagram },
    { key: 'tiktok', label: 'TikTok', url: player.socialLinks?.tiktok, Icon: Music2 },
    { key: 'youtube', label: 'YouTube', url: player.socialLinks?.youtube, Icon: Youtube },
    { key: 'facebook', label: 'Facebook', url: player.socialLinks?.facebook, Icon: Facebook },
    { key: 'twitter', label: 'X / Twitter', url: player.socialLinks?.twitter, Icon: Twitter },
    { key: 'transfermarkt', label: 'Transfermarkt', url: player.socialLinks?.transfermarkt, Icon: Globe2 },
  ].flatMap(link => {
    const value = link.url?.trim();
    if (!value) return [];
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return [];
      return [{ ...link, url: parsed.href }];
    } catch {
      return [];
    }
  });

  if (links.length === 0) return null;

  return (
    <nav className="social-3d-links" aria-label={t('حسابات التواصل الاجتماعي', 'Social links')}>
      {links.map(({ key, label, url, Icon }) => (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="social-3d-link">
          <span className="social-3d-link__surface"><Icon aria-hidden="true" className="h-5 w-5" /></span>
        </a>
      ))}
    </nav>
  );
};
