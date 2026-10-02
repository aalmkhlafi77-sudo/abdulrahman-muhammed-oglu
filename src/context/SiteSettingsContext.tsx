import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialBrandingConfig, initialHeroConfig } from '../data/initialData';
import type { BrandingConfig, HeroConfig } from '../types/player';

interface SiteSettingsContextValue {
  hero: HeroConfig;
  setHero: React.Dispatch<React.SetStateAction<HeroConfig>>;
  branding: BrandingConfig;
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hero, setHero] = useState<HeroConfig>(initialHeroConfig);
  const [branding, setBranding] = useState<BrandingConfig>(initialBrandingConfig);

  useEffect(() => {
    fetch('/api/settings/hero')
      .then(async response => response.ok ? await response.json() as Partial<HeroConfig> | null : null)
      .then(value => { if (value) setHero(current => ({ ...current, ...value })); })
      .catch(error => console.warn('Could not load Hero settings:', error));
    fetch('/api/settings/branding')
      .then(async response => response.ok ? await response.json() as Partial<BrandingConfig> | null : null)
      .then(value => { if (value) setBranding(current => ({ ...current, ...value })); })
      .catch(error => console.warn('Could not load Branding settings:', error));
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ hero, setHero, branding, setBranding }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = (): SiteSettingsContextValue => {
  const value = useContext(SiteSettingsContext);
  if (!value) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return value;
};
