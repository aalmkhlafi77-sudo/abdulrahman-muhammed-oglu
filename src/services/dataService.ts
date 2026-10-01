import { 
  PlayerInfo, 
  PlayerLanguage, 
  PersonalAttribute, 
  ClubExperience, 
  Achievement, 
  PerformanceStat, 
  VideoHighlight, 
  PhotoItem, 
  MediaItem, 
  DocumentCV, 
  SectionConfig, 
  ThemeConfig, 
  SEOConfig,
  ContactInquiry,
  HeroConfig,
  BrandingConfig
} from '../types/player';

import { 
  initialPlayerInfo, 
  initialLanguages, 
  initialAttributes, 
  initialClubs, 
  initialAchievements, 
  initialStats, 
  initialVideos, 
  initialPhotos, 
  initialMedia, 
  initialCV, 
  initialSections, 
  initialTheme, 
  initialSEO,
  initialHeroConfig,
  initialBrandingConfig 
} from '../data/initialData';

const STORAGE_KEYS = {
  PLAYER_INFO: 'abdurahman_player_info_v1',
  HERO_CONFIG: 'abdurahman_hero_config_v1',
  LANGUAGES: 'abdurahman_languages_v1',
  ATTRIBUTES: 'abdurahman_attributes_v1',
  CLUBS: 'abdurahman_clubs_v1',
  ACHIEVEMENTS: 'abdurahman_achievements_v1',
  STATS: 'abdurahman_stats_v1',
  VIDEOS: 'abdurahman_videos_v1',
  PHOTOS: 'abdurahman_photos_v1',
  MEDIA: 'abdurahman_media_v1',
  CV: 'abdurahman_cv_v1',
  SECTIONS: 'abdurahman_sections_v1',
  THEME: 'abdurahman_theme_v1',
  SEO: 'abdurahman_seo_v1',
  INQUIRIES: 'abdurahman_inquiries_v1',
  ADMIN_AUTH: 'abdurahman_admin_auth_v1',
  ADMIN_PASS_HASH: 'abdurahman_admin_pass_hash_v1',
  BRANDING_CONFIG: 'abdurahman_branding_config_v1'
};

const DB_NAME = 'AbdurahmanPortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio_store';

// Synchronous Memory Cache for instant render
const memoryCache: Record<string, any> = {};

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

const writeToIDB = async (key: string, value: any): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB Write Error] Key "${key}":`, err);
  }
};

const readFromIDB = async (key: string): Promise<any> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });
  } catch (err) {
    console.warn(`[IDB Read Error] Key "${key}":`, err);
    return undefined;
  }
};

// Seed / Initial Sync initialization logic
let isStoreInitialized = false;

const initializeDataStoreSync = () => {
  if (isStoreInitialized) return;
  isStoreInitialized = true;

  let hasLocalData = false;

  // Hydrate memory cache synchronously from LocalStorage as fast initial load
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null && raw !== undefined) {
        memoryCache[key] = JSON.parse(raw);
        hasLocalData = true;
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  // Asynchronously hydrate from IndexedDB
  if (typeof window !== 'undefined' && window.indexedDB) {
    (async () => {
      for (const key of Object.values(STORAGE_KEYS)) {
        const idbVal = await readFromIDB(key);
        if (idbVal !== undefined && idbVal !== null) {
          memoryCache[key] = idbVal;
          hasLocalData = true;
          try {
            localStorage.setItem(key, JSON.stringify(idbVal));
          } catch (e) {}
        }
      }
      fetchServerDataAndSync(hasLocalData);
    })();
  } else {
    fetchServerDataAndSync(hasLocalData);
  }
};

const fetchServerDataAndSync = (hasLocalData: boolean) => {
  if (typeof window === 'undefined') return;

  fetch('/api/data')
    .then(res => res.json())
    .then(serverData => {
      if (serverData && serverData.playerInfo && typeof serverData === 'object') {
        // Server has saved data! Apply server data globally to all devices
        DataService.applyServerSync(serverData);
      } else if (hasLocalData) {
        // Server was uninitialized, push current local data to server
        DataService.forcePushToServer();
      }
    })
    .catch(err => {
      console.warn('Could not connect to /api/data server endpoint:', err);
    });
};

initializeDataStoreSync();

/**
 * Calculates exact age in years dynamically from DOB string (YYYY-MM-DD)
 */
export const calculateAge = (dobString: string): number => {
  if (!dobString) return 23;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 23;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

/**
 * Compresses raw base64 image data dynamically using an offscreen canvas
 * downscaling to web-friendly sizes
 */
export const compressImage = (dataUrl: string, maxDim = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
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
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

/**
 * Formats a Google Drive URL into an embeddable preview or direct image stream URL
 */
export const parseDriveUrl = (url: string): { embedUrl: string; directUrl: string; fileId?: string } => {
  if (!url) return { embedUrl: '', directUrl: '' };

  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  
  if (match && match[1]) {
    const fileId = match[1];
    return {
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directUrl: `https://lh3.googleusercontent.com/d/${fileId}`
    };
  }

  return { embedUrl: url, directUrl: url };
};

/**
 * Parses YouTube video URLs into iframe embed links
 */
export const parseYoutubeUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('embed/')) return url;

  // Match standard watch links, shorts, live, and short urls
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

// Generic LocalStorage & IndexedDB Helper
const getStoredData = <T>(key: string, defaultValue: T): T => {
  if (memoryCache[key] !== undefined && memoryCache[key] !== null) {
    return memoryCache[key] as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw);
      memoryCache[key] = parsed;
      return parsed as T;
    }
  } catch (e) {
    console.warn(`Error reading key "${key}":`, e);
  }
  memoryCache[key] = defaultValue;
  return defaultValue;
};

let saveTimer: any = null;

const triggerServerSave = () => {
  if (typeof window === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const payload = DataService.exportAllDataJSON();
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).then(res => res.json()).then(data => {
        console.log('✅ Portfolio data saved on server for all browsers/devices:', data);
      }).catch(err => {
        console.warn('Failed to save portfolio data to server:', err);
      });
    } catch (err) {
      console.warn('Server save payload error:', err);
    }
  }, 400);
};

const setStoredDataNoTrigger = <T>(key: string, value: T): void => {
  memoryCache[key] = value;
  writeToIDB(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {}
};

const setStoredData = <T>(key: string, value: T): void => {
  memoryCache[key] = value;
  
  // 1. Asynchronously persist to IndexedDB
  writeToIDB(key, value);

  // 2. Persist to LocalStorage
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`LocalStorage quota reached for key "${key}". IndexedDB remains primary source of truth.`, error);
  }

  // 3. Persist globally to server (/api/data)
  triggerServerSave();
};

export const DataService = {
  // Player Info
  getPlayerInfo: (): PlayerInfo => getStoredData<PlayerInfo>(STORAGE_KEYS.PLAYER_INFO, initialPlayerInfo),
  updatePlayerInfo: (data: PlayerInfo): void => setStoredData(STORAGE_KEYS.PLAYER_INFO, data),

  // Hero Configuration
  getHeroConfig: (): HeroConfig => getStoredData<HeroConfig>(STORAGE_KEYS.HERO_CONFIG, initialHeroConfig),
  updateHeroConfig: (data: HeroConfig): void => setStoredData(STORAGE_KEYS.HERO_CONFIG, data),

  // Languages
  getLanguages: (): PlayerLanguage[] => getStoredData<PlayerLanguage[]>(STORAGE_KEYS.LANGUAGES, initialLanguages),
  updateLanguages: (data: PlayerLanguage[]): void => setStoredData(STORAGE_KEYS.LANGUAGES, data),

  // Personal Attributes
  getAttributes: (): PersonalAttribute[] => getStoredData<PersonalAttribute[]>(STORAGE_KEYS.ATTRIBUTES, initialAttributes),
  updateAttributes: (data: PersonalAttribute[]): void => setStoredData(STORAGE_KEYS.ATTRIBUTES, data),

  // Clubs / Career Timeline
  getClubs: (): ClubExperience[] => {
    const clubs = getStoredData<ClubExperience[]>(STORAGE_KEYS.CLUBS, initialClubs);
    return clubs.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  updateClubs: (data: ClubExperience[]): void => setStoredData(STORAGE_KEYS.CLUBS, data),

  // Achievements
  getAchievements: (): Achievement[] => {
    const achievements = getStoredData<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, initialAchievements);
    return achievements.sort((a, b) => a.priority - b.priority);
  },
  updateAchievements: (data: Achievement[]): void => setStoredData(STORAGE_KEYS.ACHIEVEMENTS, data),

  // Stats
  getStats: (): PerformanceStat[] => getStoredData<PerformanceStat[]>(STORAGE_KEYS.STATS, initialStats),
  updateStats: (data: PerformanceStat[]): void => setStoredData(STORAGE_KEYS.STATS, data),

  // Videos
  getVideos: (): VideoHighlight[] => {
    const videos = getStoredData<VideoHighlight[]>(STORAGE_KEYS.VIDEOS, initialVideos);
    return videos.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  updateVideos: (data: VideoHighlight[]): void => setStoredData(STORAGE_KEYS.VIDEOS, data),

  // Photos
  getPhotos: (): PhotoItem[] => {
    const photos = getStoredData<PhotoItem[]>(STORAGE_KEYS.PHOTOS, initialPhotos);
    return photos.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  updatePhotos: (data: PhotoItem[]): void => setStoredData(STORAGE_KEYS.PHOTOS, data),

  // Media & Interviews
  getMedia: (): MediaItem[] => getStoredData<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMedia),
  updateMedia: (data: MediaItem[]): void => setStoredData(STORAGE_KEYS.MEDIA, data),

  // CV Document
  getCV: (): DocumentCV => getStoredData<DocumentCV>(STORAGE_KEYS.CV, initialCV),
  updateCV: (data: DocumentCV): void => setStoredData(STORAGE_KEYS.CV, data),

  // Sections
  getSections: (): SectionConfig[] => {
    const sections = getStoredData<SectionConfig[]>(STORAGE_KEYS.SECTIONS, initialSections);
    return sections.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  updateSections: (data: SectionConfig[]): void => setStoredData(STORAGE_KEYS.SECTIONS, data),

  // Theme
  getTheme: (): ThemeConfig => getStoredData<ThemeConfig>(STORAGE_KEYS.THEME, initialTheme),
  updateTheme: (data: ThemeConfig): void => setStoredData(STORAGE_KEYS.THEME, data),

  // SEO
  getSEO: (): SEOConfig => getStoredData<SEOConfig>(STORAGE_KEYS.SEO, initialSEO),
  updateSEO: (data: SEOConfig): void => setStoredData(STORAGE_KEYS.SEO, data),

  // Contact Inquiries
  getInquiries: (): ContactInquiry[] => getStoredData<ContactInquiry[]>(STORAGE_KEYS.INQUIRIES, []),
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'read'>): void => {
    const list = getStoredData<ContactInquiry[]>(STORAGE_KEYS.INQUIRIES, []);
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setStoredData(STORAGE_KEYS.INQUIRIES, [newInquiry, ...list]);
  },
  markInquiryRead: (id: string): void => {
    const list = getStoredData<ContactInquiry[]>(STORAGE_KEYS.INQUIRIES, []);
    const updated = list.map(item => item.id === id ? { ...item, read: true } : item);
    setStoredData(STORAGE_KEYS.INQUIRIES, updated);
  },
  deleteInquiry: (id: string): void => {
    const list = getStoredData<ContactInquiry[]>(STORAGE_KEYS.INQUIRIES, []);
    setStoredData(STORAGE_KEYS.INQUIRIES, list.filter(item => item.id !== id));
  },

  // Branding Settings
  getBrandingConfig: (): BrandingConfig => getStoredData<BrandingConfig>(STORAGE_KEYS.BRANDING_CONFIG, initialBrandingConfig),
  updateBrandingConfig: (data: BrandingConfig): void => setStoredData(STORAGE_KEYS.BRANDING_CONFIG, data),

  // Secure Cryptographic Password Hashing & Authenticating
  getAdminPasswordHash: async (): Promise<string> => {
    let hash = await readFromIDB(STORAGE_KEYS.ADMIN_PASS_HASH);
    if (!hash) {
      const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS_HASH);
      if (raw) {
        try {
          hash = JSON.parse(raw);
        } catch (e) {
          hash = raw;
        }
      }
    }
    if (!hash) {
      // Default "scout2024" SHA-256 hash
      hash = '4c6806e5792ec0656a4252bd3cbfe52cfb9bbd0a793c1df7e132ad8d37446bc4';
      setStoredData(STORAGE_KEYS.ADMIN_PASS_HASH, hash);
    }
    return hash;
  },

  verifyAdminPassword: async (password: string): Promise<boolean> => {
    if (!password) return false;
    const clean = password.trim();
    if (!clean) return false;

    const storedHash = await DataService.getAdminPasswordHash();
    const hashedInput = await hashPassword(clean);

    // 1. Direct hash match
    if (hashedInput === storedHash) return true;

    // 2. Direct plaintext match (if saved as plaintext in legacy or config)
    if (clean === storedHash) return true;

    // 3. Known default password hashes & plain text defaults
    const defaultPasswords = ['scout2024', 'admin', '1234', '2003', 'admin123', 'pass1234'];
    const defaultHashes = [
      '4c6806e5792ec0656a4252bd3cbfe52cfb9bbd0a793c1df7e132ad8d37446bc4', // scout2024
      '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin
      '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
      'a7c93809637c7ee07722709199fa69b2229a43a0e4420a320c29ed6d36e2f17d'  // 2003
    ];

    const isDefaultStored = defaultHashes.includes(storedHash) || !storedHash;
    if (isDefaultStored && defaultPasswords.includes(clean.toLowerCase())) {
      return true;
    }

    return false;
  },

  updateAdminPassword: async (newPassword: string): Promise<void> => {
    const clean = newPassword.trim();
    const hashed = await hashPassword(clean);
    setStoredData(STORAGE_KEYS.ADMIN_PASS_HASH, hashed);
  },

  // Manual Reset to original defaults only when requested by Admin
  resetAll: async (): Promise<void> => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      delete memoryCache[k];
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch (e) {}

    window.location.reload();
  },

  // Export JSON backup
  exportAllDataJSON: (): string => {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      playerInfo: DataService.getPlayerInfo(),
      heroConfig: DataService.getHeroConfig(),
      brandingConfig: DataService.getBrandingConfig(),
      languages: DataService.getLanguages(),
      attributes: DataService.getAttributes(),
      clubs: DataService.getClubs(),
      achievements: DataService.getAchievements(),
      stats: DataService.getStats(),
      videos: DataService.getVideos(),
      photos: DataService.getPhotos(),
      media: DataService.getMedia(),
      cv: DataService.getCV(),
      sections: DataService.getSections(),
      theme: DataService.getTheme(),
      seo: DataService.getSEO()
    };
    return JSON.stringify(payload, null, 2);
  },

  // Import JSON backup
  importAllDataJSON: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.playerInfo) DataService.updatePlayerInfo(data.playerInfo);
      if (data.heroConfig) DataService.updateHeroConfig(data.heroConfig);
      if (data.brandingConfig) DataService.updateBrandingConfig(data.brandingConfig);
      if (data.languages) DataService.updateLanguages(data.languages);
      if (data.attributes) DataService.updateAttributes(data.attributes);
      if (data.clubs) DataService.updateClubs(data.clubs);
      if (data.achievements) DataService.updateAchievements(data.achievements);
      if (data.stats) DataService.updateStats(data.stats);
      if (data.videos) DataService.updateVideos(data.videos);
      if (data.photos) DataService.updatePhotos(data.photos);
      if (data.media) DataService.updateMedia(data.media);
      if (data.cv) DataService.updateCV(data.cv);
      if (data.sections) DataService.updateSections(data.sections);
      if (data.theme) DataService.updateTheme(data.theme);
      if (data.seo) DataService.updateSEO(data.seo);
      return true;
    } catch (e) {
      console.error("Failed to import JSON data", e);
      return false;
    }
  },

  // Apply sync from backend Express server
  applyServerSync: (serverData: any): void => {
    try {
      if (serverData.playerInfo) setStoredDataNoTrigger(STORAGE_KEYS.PLAYER_INFO, serverData.playerInfo);
      if (serverData.heroConfig) setStoredDataNoTrigger(STORAGE_KEYS.HERO_CONFIG, serverData.heroConfig);
      if (serverData.brandingConfig) setStoredDataNoTrigger(STORAGE_KEYS.BRANDING_CONFIG, serverData.brandingConfig);
      if (serverData.languages) setStoredDataNoTrigger(STORAGE_KEYS.LANGUAGES, serverData.languages);
      if (serverData.attributes) setStoredDataNoTrigger(STORAGE_KEYS.ATTRIBUTES, serverData.attributes);
      if (serverData.clubs) setStoredDataNoTrigger(STORAGE_KEYS.CLUBS, serverData.clubs);
      if (serverData.achievements) setStoredDataNoTrigger(STORAGE_KEYS.ACHIEVEMENTS, serverData.achievements);
      if (serverData.stats) setStoredDataNoTrigger(STORAGE_KEYS.STATS, serverData.stats);
      if (serverData.videos) setStoredDataNoTrigger(STORAGE_KEYS.VIDEOS, serverData.videos);
      if (serverData.photos) setStoredDataNoTrigger(STORAGE_KEYS.PHOTOS, serverData.photos);
      if (serverData.media) setStoredDataNoTrigger(STORAGE_KEYS.MEDIA, serverData.media);
      if (serverData.cv) setStoredDataNoTrigger(STORAGE_KEYS.CV, serverData.cv);
      if (serverData.sections) setStoredDataNoTrigger(STORAGE_KEYS.SECTIONS, serverData.sections);
      if (serverData.theme) setStoredDataNoTrigger(STORAGE_KEYS.THEME, serverData.theme);
      if (serverData.seo) setStoredDataNoTrigger(STORAGE_KEYS.SEO, serverData.seo);

      window.dispatchEvent(new Event('portfolio_server_data_synced'));
    } catch (e) {
      console.warn('Failed to apply server sync:', e);
    }
  },

  // Explicitly push current active data to server
  forcePushToServer: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
      const payload = DataService.exportAllDataJSON();
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      const data = await res.json();
      console.log('✅ Force pushed local data to server:', data);
      return data.success === true;
    } catch (err) {
      console.error('Failed to push data to server:', err);
      return false;
    }
  }
};

/**
 * Hash password asynchronously using SHA-256 (for admin security compliance)
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Basic local fallback if crypto subtle is not present
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString(16);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
