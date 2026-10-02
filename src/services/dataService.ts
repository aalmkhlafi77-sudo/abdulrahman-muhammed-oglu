import type {
  SEOConfig,
  SectionConfig,
  ThemeConfig,
} from '../types/player';
import {
  initialSections,
  initialSEO,
  initialTheme,
} from '../data/initialData';

const STORAGE_KEYS = {
  SECTIONS: 'abdurahman_sections_v1',
  THEME: 'abdurahman_theme_v1',
  SEO: 'abdurahman_seo_v1',
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
  getSections: (): SectionConfig[] => getStoredData<SectionConfig[]>(STORAGE_KEYS.SECTIONS, initialSections)
    .sort((a, b) => a.sortOrder - b.sortOrder),
  updateSections: (data: SectionConfig[]): void => setStoredData(STORAGE_KEYS.SECTIONS, data),

  getTheme: (): ThemeConfig => getStoredData(STORAGE_KEYS.THEME, initialTheme),
  updateTheme: (data: ThemeConfig): void => setStoredData(STORAGE_KEYS.THEME, data),

  getSEO: (): SEOConfig => getStoredData(STORAGE_KEYS.SEO, initialSEO),
  updateSEO: (data: SEOConfig): void => setStoredData(STORAGE_KEYS.SEO, data),

};
