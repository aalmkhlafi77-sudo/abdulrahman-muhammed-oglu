import type {
  BrandingConfig,
  ContactInquiry,
  DocumentCV,
  HeroConfig,
  MediaItem,
  SEOConfig,
  SectionConfig,
  ThemeConfig,
} from '../types/player';
import {
  initialBrandingConfig,
  initialCV,
  initialHeroConfig,
  initialMedia,
  initialSections,
  initialSEO,
  initialTheme,
} from '../data/initialData';

const STORAGE_KEYS = {
  HERO_CONFIG: 'abdurahman_hero_config_v1',
  MEDIA: 'abdurahman_media_v1',
  CV: 'abdurahman_cv_v1',
  SECTIONS: 'abdurahman_sections_v1',
  THEME: 'abdurahman_theme_v1',
  SEO: 'abdurahman_seo_v1',
  INQUIRIES: 'abdurahman_inquiries_v1',
  BRANDING_CONFIG: 'abdurahman_branding_config_v1',
} as const;

const memoryCache: Record<string, unknown> = {};

const getStoredData = <T>(key: string, defaultValue: T): T => {
  if (memoryCache[key] !== undefined) return memoryCache[key] as T;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as T;
      memoryCache[key] = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn(`Error reading key "${key}":`, error);
  }
  memoryCache[key] = defaultValue;
  return defaultValue;
};

const setStoredData = <T>(key: string, value: T): void => {
  memoryCache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save key "${key}" to LocalStorage:`, error);
  }
};

/** Calculates age in years from a DOB string (YYYY-MM-DD). */
export const calculateAge = (dobString: string): number => {
  if (!dobString) return 23;
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return 23;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const month = today.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

/** Compresses base64 image data for the legacy Media editor. */
export const compressImage = (dataUrl: string, maxDim = 1200, quality = 0.8): Promise<string> => new Promise((resolve) => {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    resolve(dataUrl);
    return;
  }

  const img = new window.Image();
  img.onload = () => {
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    resolve(context ? (context.drawImage(img, 0, 0, width, height), canvas.toDataURL('image/jpeg', quality)) : dataUrl);
  };
  img.onerror = () => resolve(dataUrl);
  img.src = dataUrl;
});

export const parseDriveUrl = (url: string): { embedUrl: string; directUrl: string; fileId?: string } => {
  if (!url) return { embedUrl: '', directUrl: '' };
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (!match?.[1]) return { embedUrl: url, directUrl: url };
  const fileId = match[1];
  return {
    fileId,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
  };
};

export const parseYoutubeUrl = (url: string): string => {
  if (!url || url.includes('embed/')) return url;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export const DataService = {
  getHeroConfig: (): HeroConfig => getStoredData(STORAGE_KEYS.HERO_CONFIG, initialHeroConfig),
  updateHeroConfig: (data: HeroConfig): void => setStoredData(STORAGE_KEYS.HERO_CONFIG, data),

  getMedia: (): MediaItem[] => getStoredData(STORAGE_KEYS.MEDIA, initialMedia),
  updateMedia: (data: MediaItem[]): void => setStoredData(STORAGE_KEYS.MEDIA, data),

  getCV: (): DocumentCV => getStoredData(STORAGE_KEYS.CV, initialCV),
  updateCV: (data: DocumentCV): void => setStoredData(STORAGE_KEYS.CV, data),

  getSections: (): SectionConfig[] => getStoredData<SectionConfig[]>(STORAGE_KEYS.SECTIONS, initialSections)
    .sort((a, b) => a.sortOrder - b.sortOrder),
  updateSections: (data: SectionConfig[]): void => setStoredData(STORAGE_KEYS.SECTIONS, data),

  getTheme: (): ThemeConfig => getStoredData(STORAGE_KEYS.THEME, initialTheme),
  updateTheme: (data: ThemeConfig): void => setStoredData(STORAGE_KEYS.THEME, data),

  getSEO: (): SEOConfig => getStoredData(STORAGE_KEYS.SEO, initialSEO),
  updateSEO: (data: SEOConfig): void => setStoredData(STORAGE_KEYS.SEO, data),

  getInquiries: (): ContactInquiry[] => getStoredData(STORAGE_KEYS.INQUIRIES, []),
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'read'>): void => {
    const list = DataService.getInquiries();
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setStoredData(STORAGE_KEYS.INQUIRIES, [newInquiry, ...list]);
  },
  markInquiryRead: (id: string): void => {
    setStoredData(STORAGE_KEYS.INQUIRIES, DataService.getInquiries().map(item => item.id === id ? { ...item, read: true } : item));
  },
  deleteInquiry: (id: string): void => {
    setStoredData(STORAGE_KEYS.INQUIRIES, DataService.getInquiries().filter(item => item.id !== id));
  },

  getBrandingConfig: (): BrandingConfig => getStoredData(STORAGE_KEYS.BRANDING_CONFIG, initialBrandingConfig),
  updateBrandingConfig: (data: BrandingConfig): void => setStoredData(STORAGE_KEYS.BRANDING_CONFIG, data),
};
