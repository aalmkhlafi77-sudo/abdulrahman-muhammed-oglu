/**
 * Player Data Models & Interfaces
 * Abdurahman Muhammed Oglu Portfolio
 */

export type LanguageCode = 'ar' | 'en';

export interface PlayerInfo {
  nameAr: string;
  nameEn: string;
  nationalityAr: string;
  nationalityEn: string;
  locationAr: string;
  locationEn: string;
  dob: string; // "YYYY-MM-DD" e.g. "2003-08-27"
  heightCm: number;
  weightKg: number;
  primaryPositionAr: string;
  primaryPositionEn: string;
  secondaryPositionAr: string;
  secondaryPositionEn: string;
  positionsOrder: ('primary' | 'secondary')[];
  
  // Optional fields - MUST NOT be displayed if empty
  preferredFootAr?: string; // e.g. "اليمنى" or "اليسرى"
  preferredFootEn?: string; // e.g. "Right" or "Left"
  currentClubAr?: string;
  currentClubEn?: string;
  shirtNumber?: number;
  contractStatusAr?: string;
  contractStatusEn?: string;

  // Contact Info
  email: string;
  phone: string;
  whatsapp: string;
  agentContactAr?: string;
  agentContactEn?: string;

  // Objective & Bio
  objectiveAr: string;
  objectiveEn: string;
  educationAr: string;
  educationEn: string;
  languages?: PlayerLanguage[];
  attributes?: PersonalAttribute[];
  
  // Imagery
  heroImage: string;
  profilePhoto: string;
  mobileHeroImage?: string;
  playerCutoutImage?: string;
  aboutImage?: string;
  cvPreviewImage?: string;
  socialShareImage?: string;

  // Detailed Image Display Configurations
  profilePhotoDisplay?: ImageDisplayConfig;
  heroDisplay?: ImageDisplayConfig;
  playerCutoutDisplay?: ImageDisplayConfig;
  aboutImageDisplay?: ImageDisplayConfig;

  // Image Positions & Fitting Options (Hero Control requirements)
  heroObjectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'auto';
  heroObjectPosition?: string; // e.g. "center" or custom "34% 50%"
  heroFocalPoint?: { x: number; y: number };
  heroMobileFocalPoint?: { x: number; y: number };

  // Social Links
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
    transfermarkt?: string;
  };
}

export interface PlayerLanguage {
  id: string;
  nameAr: string;
  nameEn: string;
  levelAr: string;
  levelEn: string;
}

export interface PersonalAttribute {
  id: string;
  ar: string;
  en: string;
  iconName?: string;
}

export interface ClubExperience {
  id: string;
  clubId?: string;
  careerEntryId?: string;
  clubNameAr: string;
  clubNameEn: string;
  countryAr: string;
  countryEn: string;
  levelAr: string;
  levelEn: string;
  durationAr: string;
  durationEn: string;
  logoUrl?: string; // Club Logo
  coverImageUrl?: string; // Club Cover Image
  galleryUrls?: string[]; // Club Gallery List
  sortOrder: number;
  positionAr?: string;
  positionEn?: string;
  achievementsAr?: string[];
  achievementsEn?: string[];
  descriptionAr?: string;
  descriptionEn?: string;
  featured?: boolean;
}

export interface Achievement {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  clubId?: string;
  clubNameAr?: string;
  clubNameEn?: string;
  season?: string;
  priority: number;
  sortOrder?: number;
  featured: boolean;
  badgeType?: 'trophy' | 'medal' | 'star' | 'chart';
}

export interface PerformanceStat {
  id: string;
  clubId?: string;
  clubNameAr?: string;
  clubNameEn?: string;
  matches?: number;
  goals?: number;
  assists?: number;
  minutes?: number;
  starts?: number;
  substitutes?: number;
  yellowCards?: number;
  redCards?: number;
  season?: string;
}

export type VideoCategory = 
  | 'GOALS' 
  | 'ASSISTS' 
  | 'SKILLS' 
  | 'MATCHES' 
  | 'HIGHLIGHTS' 
  | 'INTERVIEWS' 
  | 'MEDIA';

export interface VideoHighlight {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category: VideoCategory;
  clubId?: string;
  clubNameAr?: string;
  clubNameEn?: string;
  season?: string;
  duration?: string; // e.g. "4:32"
  videoSourceType: 'drive' | 'youtube' | 'mp4' | 'external';
  videoUrl: string; // Drive URL, YouTube URL, MP4 link, or embed
  thumbnailUrl: string;
  featured: boolean; // Primary spotlight e.g. Official Highlights
  published: boolean;
  sortOrder: number;
}

export interface PhotoItem {
  id: string;
  assetId?: string;
  fileName?: string;
  originalFileName?: string;
  titleAr?: string;
  titleEn?: string;
  imageUrl: string;
  clubId?: string;
  clubNameAr?: string;
  clubNameEn?: string;
  category?: string;
  captionAr?: string;
  captionEn?: string;
  altText?: string;
  sourceType: 'upload' | 'google_drive' | 'external_url' | 'media_library';
  sourceUrl?: string;
  driveFileId?: string;
  width?: number;
  height?: number;
  fileSize?: number; // Size in bytes
  mimeType?: string;
  focalPoint?: { x: number; y: number }; // Percentage coordinate e.g. { x: 50, y: 50 }
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  titleAr: string;
  titleEn: string;
  sourceNameAr: string;
  sourceNameEn: string;
  date?: string;
  mediaType: 'interview' | 'field_interview' | 'clip' | 'press' | 'video' | 'article' | 'image' | 'gallery';
  url: string; // Video URL, article URL, etc.
  thumbnailUrl?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  
  // Articles
  summaryAr?: string;
  summaryEn?: string;
  contentAr?: string; // Rich-Text / HTML content
  contentEn?: string;
  authorAr?: string;
  authorEn?: string;
  
  // Custom Media properties
  clubNameAr?: string;
  clubNameEn?: string;
  sourceType?: 'upload' | 'google_drive' | 'external_url' | 'media_library';
  photographerAr?: string;
  photographerEn?: string;
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  galleryUrls?: string[];
  tags?: string[];
}

export interface DocumentCV {
  id: string;
  titleAr: string;
  titleEn: string;
  language: 'ar' | 'en' | 'both';
  fileUrl: string; // PDF link or drive preview
  updatedAt: string;
}

export interface SectionConfig {
  id: string;
  key: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  enabled: boolean;
  sortOrder: number;
}

export interface ThemeConfig {
  primaryColor: string; // e.g., "#0284c7"
  secondaryColor: string; // e.g., "#0f172a"
  accentColor: string; // e.g., "#06b6d4"
  backgroundColor: string; // e.g., "#0b0f17"
  cardColor: string; // e.g., "#111827"
  textColor: string; // e.g., "#f8fafc"
  heroOverlayOpacity: number; // 0.1 to 0.9
  cardRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface SEOConfig {
  siteTitleAr: string;
  siteTitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keywords: string;
  ogImageUrl: string;
}

export interface ContactInquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  organization?: string;
  organizationType: 'club' | 'scout' | 'agent' | 'academy' | 'media' | 'other';
  message: string;
  createdAt: string;
  read: boolean;
}

export type FitMode = 'cover' | 'contain' | 'fill' | 'scale-down' | 'auto';

export type PositionPreset = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'center-left' 
  | 'center-center' 
  | 'center-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export interface ImageDisplayConfig {
  fit: FitMode;
  positionPreset?: PositionPreset;
  positionX: number; // 0 to 100
  positionY: number; // 0 to 100
  focalPoint?: { x: number; y: number }; // 0 to 100
  zoom: number; // 0.5 to 2.0
  panX: number; // -50 to +50
  panY: number; // -50 to +50
  brightness: number; // 0 to 200
  contrast: number; // 0 to 200
  saturation: number; // 0 to 200
  opacity: number; // 0 to 100
  blur: number; // 0 to 20
  
  // Mobile / Responsive Overrides
  mobileImage?: string;
  mobileFit?: FitMode;
  mobilePositionX?: number;
  mobilePositionY?: number;
  mobileFocalPoint?: { x: number; y: number };
  mobileZoom?: number;
}

export interface HeroConfig {
  displayMode: 'image' | 'video' | 'gradient' | 'image_overlay' | 'video_overlay';
  desktopImage: string;
  mobileImage?: string;
  videoUrl?: string;
  videoSourceType?: 'drive' | 'youtube' | 'mp4' | 'external';
  
  // Detailed Image Controls
  imageDisplay: ImageDisplayConfig;
  
  // Heights
  desktopHeight: string; // "85vh", "700px", "100vh"
  tabletHeight: string;  // "70vh", "500px"
  mobileHeight: string;  // "60vh", "400px"
  
  // Overlay & Gradients
  overlayColor: string; // hex e.g. "#0b0f17"
  overlayOpacity: number; // 0 to 100
  gradientEnabled: boolean;
  gradientDirection: 'top-to-bottom' | 'bottom-to-top' | 'left-to-right' | 'right-to-left' | 'radial';
  
  // Animation Options
  animationType: 'none' | 'subtle-zoom-in' | 'subtle-zoom-out' | 'ken-burns' | 'slow-pan-left' | 'slow-pan-right' | 'slow-pan-up' | 'slow-pan-down' | 'pulse' | 'breathing' | 'parallax';
  animationSpeed: number; // e.g. 10
  animationIntensity: number; // e.g. 1.05
  pauseOnHover: boolean;
  
  // Content Layout
  contentVerticalAlign: 'top' | 'center' | 'bottom';
  contentHorizontalAlign: 'left' | 'center' | 'right';
  contentMaxWidth: 'narrow' | 'medium' | 'wide' | 'full';
  textAlign: 'left' | 'center' | 'right';
  mobileContentAlign: 'left' | 'center' | 'right';
}

export interface BrandingConfig {
  logoUrl: string;
  mobileLogoUrl?: string;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  logoFit: 'contain' | 'cover' | 'original';
  desktopLogoWidth: number;
  tabletLogoWidth: number;
  mobileLogoWidth: number;
  logoAlignment: 'left' | 'center' | 'right';
  showInHeader: boolean;
  showInFooter: boolean;
  showInAdminLogin: boolean;
  showInAdminSidebar: boolean;
  showInFavicon: boolean;
  showInSocialShare: boolean;
  logoStatus: 'default' | 'custom' | 'removed';
}
