import type {
  Achievement,
  BrandingConfig,
  ClubExperience,
  HeroConfig,
  ImageDisplayConfig,
  PerformanceStat,
  PlayerInfo,
  PlayerLanguage,
  SEOConfig,
  SectionConfig,
  ThemeConfig,
  VideoHighlight,
} from '../types/player';

export const initialPlayerInfo: PlayerInfo = {
  nameAr: 'عبدالرحمن محمد أوغلو',
  nameEn: 'Abderrahman Muhammed Oglu',
  nationalityAr: 'تركي',
  nationalityEn: 'Turkish',
  locationAr: 'إسطنبول – تركيا',
  locationEn: 'Istanbul – Türkiye',
  dob: '2003-08-27',
  heightCm: 176,
  weightKg: 66,
  primaryPositionAr: 'خط وسط ارتكاز',
  primaryPositionEn: 'Box-to-Box Midfielder',
  secondaryPositionAr: 'جناح أيسر',
  secondaryPositionEn: 'Left Wing',
  positionsOrder: ['primary', 'secondary'],
  email: 'Dhomyi1233@gmail.com',
  phone: '+905314244594',
  whatsapp: '+905314244594',
  objectiveAr: 'أتطلع الى فرصة في بيئة مشجعة للتطوير والانضمام الى نادي محترف لكي أقدم كل ما لدي لتحقيق اهدافي وصقل مهاراتي والارتقاء بمساري.',
  objectiveEn: '',
  educationAr: 'الثانوية العامة 2021',
  educationEn: 'High School 2021',
  heroImage: '',
  profilePhoto: '',
  mobileHeroImage: '',
  socialLinks: {
    instagram: '',
    tiktok: '',
    youtube: '',
    facebook: '',
    twitter: '',
    transfermarkt: '',
  },
};

export const initialLanguages: PlayerLanguage[] = [
  { id: '1', nameAr: 'العربية', nameEn: 'Arabic', levelAr: 'اللغة الأم', levelEn: 'Native' },
  { id: '2', nameAr: 'التركية', nameEn: 'Turkish', levelAr: 'ممتاز', levelEn: 'Excellent' },
  { id: '3', nameAr: 'الإنجليزية', nameEn: 'English', levelAr: 'جيد', levelEn: 'Good' },
];

export const initialClubs: ClubExperience[] = [
  {
    id: 'club-1', clubNameAr: 'الهلال', clubNameEn: 'Al Hilal', countryAr: '', countryEn: '',
    levelAr: 'مستوى براعم', levelEn: 'Youth', durationAr: 'نصف موسم', durationEn: 'Half season', sortOrder: 1,
  },
  {
    id: 'club-2', clubNameAr: 'الشعلة', clubNameEn: 'Al-Shulla', countryAr: '', countryEn: '',
    levelAr: 'ناشئين', levelEn: 'Junior', durationAr: 'سنة', durationEn: 'One year', sortOrder: 2,
  },
  {
    id: 'club-3', clubNameAr: 'كارا دولاب', clubNameEn: 'Karadolap', countryAr: '', countryEn: '',
    levelAr: '', levelEn: '', durationAr: 'سنة', durationEn: 'One year', sortOrder: 3,
    achievementsAr: ['هداف الفريق', 'ثاني هدافي الدوري'], achievementsEn: ['Team top scorer', 'Second top scorer in the league'],
  },
  {
    id: 'club-4', clubNameAr: 'نارت سبور', clubNameEn: 'Nart Spor', countryAr: '', countryEn: '',
    levelAr: '', levelEn: '', durationAr: 'سنة', durationEn: 'One year', sortOrder: 4,
  },
  {
    id: 'club-5', clubNameAr: 'زيتون بورنو', clubNameEn: 'Zeytinburnu', countryAr: '', countryEn: '',
    levelAr: '', levelEn: '', durationAr: 'سنة', durationEn: 'One year', sortOrder: 5,
  },
  {
    id: 'club-6', clubNameAr: 'غيشت قلعة سبور', clubNameEn: 'Geçitkale Spor', countryAr: '', countryEn: '',
    levelAr: '', levelEn: '', durationAr: 'نصف موسم', durationEn: 'Half season', sortOrder: 6,
    achievementsAr: ['ثاني هدافي الفريق', 'أكثر لاعب صناعة للأهداف'],
    achievementsEn: ['Second top scorer in the team', 'Most assists'],
  },
];

export const initialAchievements: Achievement[] = [
  { id: 'ach-1', titleAr: 'هداف الفريق', titleEn: 'Team top scorer', clubId: 'club-3', clubNameAr: 'كارا دولاب', clubNameEn: 'Karadolap', priority: 1, featured: true, badgeType: 'trophy' },
  { id: 'ach-2', titleAr: 'ثاني هدافي الدوري', titleEn: 'Second top scorer in the league', clubId: 'club-3', clubNameAr: 'كارا دولاب', clubNameEn: 'Karadolap', priority: 2, featured: true, badgeType: 'medal' },
  { id: 'ach-3', titleAr: 'ثاني هدافي الفريق', titleEn: 'Second top scorer in the team', clubId: 'club-6', clubNameAr: 'غيشت قلعة سبور', clubNameEn: 'Geçitkale Spor', priority: 3, featured: true, badgeType: 'star' },
  { id: 'ach-4', titleAr: 'أكثر لاعب صناعة للأهداف', titleEn: 'Most assists', clubId: 'club-6', clubNameAr: 'غيشت قلعة سبور', clubNameEn: 'Geçitkale Spor', priority: 4, featured: true, badgeType: 'chart' },
];

export const initialStats: PerformanceStat[] = [];
export const initialVideos: VideoHighlight[] = [];

export const initialSections: SectionConfig[] = [
  { id: 'sec-hero', key: 'hero', titleAr: 'الرئيسية', titleEn: 'Hero Banner', enabled: true, sortOrder: 1 },
  { id: 'sec-scouting', key: 'scouting', titleAr: 'بطاقة التقييم السريع للكشافين', titleEn: 'Scouting Evaluation', enabled: true, sortOrder: 2 },
  { id: 'sec-profile', key: 'profile', titleAr: 'الملف الشخصي والهدف', titleEn: 'Player Profile & Objective', enabled: true, sortOrder: 3 },
  { id: 'sec-career', key: 'career', titleAr: 'المسيرة الكروية والأندية', titleEn: 'Career Timeline', enabled: true, sortOrder: 4 },
  { id: 'sec-achievements', key: 'achievements', titleAr: 'أبرز الإنجازات', titleEn: 'Key Achievements', enabled: true, sortOrder: 5 },
  { id: 'sec-stats', key: 'stats', titleAr: 'الإحصائيات والأرقام', titleEn: 'Performance Stats', enabled: true, sortOrder: 6 },
  { id: 'sec-official-highlights', key: 'officialHighlights', titleAr: 'أبرز الفيديوهات', titleEn: 'Featured Highlights', enabled: true, sortOrder: 7 },
  { id: 'sec-videos', key: 'videos', titleAr: 'مكتبة الفيديوهات', titleEn: 'Video Library', enabled: true, sortOrder: 8 },
  { id: 'sec-photos', key: 'photos', titleAr: 'معرض الصور', titleEn: 'Photo Gallery', enabled: true, sortOrder: 9 },
  { id: 'sec-media', key: 'media', titleAr: 'المقابلات والتغطيات الإعلامية', titleEn: 'Media & Interviews', enabled: true, sortOrder: 10 },
  { id: 'sec-cv', key: 'cv', titleAr: 'السيرة الذاتية', titleEn: 'Player CV', enabled: true, sortOrder: 11 },
  { id: 'sec-contact', key: 'contact', titleAr: 'التواصل والاستفسارات', titleEn: 'Inquiries & Contact', enabled: true, sortOrder: 12 },
];

export const initialTheme: ThemeConfig = {
  primaryColor: '#0284c7',
  secondaryColor: '#0f172a',
  accentColor: '#06b6d4',
  backgroundColor: '#0b0f17',
  cardColor: '#111827',
  textColor: '#f8fafc',
  heroOverlayOpacity: 0.65,
  cardRadius: 'xl',
};

export const initialSEO: SEOConfig = {
  siteTitleAr: 'عبدالرحمن محمد أوغلو | لاعب كرة قدم',
  siteTitleEn: 'Abderrahman Muhammed Oglu | Football Player',
  descriptionAr: 'الملف الرقمي للاعب كرة القدم عبدالرحمن محمد أوغلو.',
  descriptionEn: 'Player profile for Abderrahman Muhammed Oglu.',
  keywords: 'Abderrahman Muhammed Oglu, لاعب كرة قدم, Box-to-Box Midfielder, Left Wing',
  ogImageUrl: '',
};

export const defaultImageDisplayConfig: ImageDisplayConfig = {
  fit: 'cover', positionPreset: 'center-center', positionX: 50, positionY: 50,
  focalPoint: { x: 50, y: 50 }, zoom: 1, panX: 0, panY: 0,
  brightness: 100, contrast: 100, saturation: 100, opacity: 100, blur: 0,
  mobileFit: 'cover', mobilePositionX: 50, mobilePositionY: 50,
  mobileFocalPoint: { x: 50, y: 50 }, mobileZoom: 1,
};

export const initialHeroConfig: HeroConfig = {
  displayMode: 'image_overlay', desktopImage: '', mobileImage: '', videoUrl: '', videoSourceType: 'youtube',
  imageDisplay: { ...defaultImageDisplayConfig, brightness: 90, contrast: 110 },
  desktopHeight: '85vh', tabletHeight: '70vh', mobileHeight: '65vh',
  overlayColor: '#0b0f17', overlayOpacity: 70, gradientEnabled: true, gradientDirection: 'bottom-to-top',
  animationType: 'pulse', animationSpeed: 10, animationIntensity: 1.05, pauseOnHover: true,
  contentVerticalAlign: 'center', contentHorizontalAlign: 'center', contentMaxWidth: 'wide',
  textAlign: 'center', mobileContentAlign: 'center',
};

export const initialBrandingConfig: BrandingConfig = {
  logoUrl: '', logoFit: 'contain', desktopLogoWidth: 120, tabletLogoWidth: 100, mobileLogoWidth: 80,
  logoAlignment: 'center', showInHeader: true, showInFooter: true, showInAdminLogin: true,
  showInAdminSidebar: true, showInFavicon: false, showInSocialShare: false, logoStatus: 'removed',
};
