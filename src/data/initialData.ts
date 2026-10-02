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
  ImageDisplayConfig,
  HeroConfig,
  BrandingConfig
} from '../types/player';

export const initialPlayerInfo: PlayerInfo = {
  nameAr: "عبدالرحمن محمد أوغلو",
  nameEn: "Abdurahman Muhammed Oglu",
  nationalityAr: "تركي",
  nationalityEn: "Turkish",
  locationAr: "إسطنبول – تركيا",
  locationEn: "Istanbul – Türkiye",
  dob: "2003-08-27",
  heightCm: 176,
  weightKg: 66,
  primaryPositionAr: "لاعب خط وسط Box-to-Box",
  primaryPositionEn: "Box-to-Box Midfielder",
  secondaryPositionAr: "جناح أيسر",
  secondaryPositionEn: "Left Wing",
  positionsOrder: ['primary', 'secondary'],
  
  // Left blank as per requirements #6 & #58 until configured in admin
  preferredFootAr: "",
  preferredFootEn: "",
  currentClubAr: "",
  currentClubEn: "",
  shirtNumber: undefined,
  contractStatusAr: "",
  contractStatusEn: "",

  email: "Dhomyi1233@gmail.com",
  phone: "+905314244594",
  whatsapp: "+905314244594",
  agentContactAr: "",
  agentContactEn: "",

  objectiveAr: "يبحث اللاعب عن فرصة داخل بيئة احترافية تساعده على التطور والانضمام إلى نادٍ محترف ليقدم أفضل ما لديه، يطور مهاراته ويواصل التقدم في مسيرته الرياضية.",
  objectiveEn: "Abdurahman is seeking a competitive opportunity within a professional club environment to maximize his potential, deliver top-tier athletic performance, refine technical & tactical capabilities, and achieve continuous career progress.",
  
  educationAr: "الثانوية العامة (2021)",
  educationEn: "High School (2021)",

  heroImage: "",
  profilePhoto: "",
  mobileHeroImage: "",

  socialLinks: {
    instagram: "https://instagram.com",
    tiktok: "",
    youtube: "",
    facebook: "",
    twitter: "",
    transfermarkt: ""
  }
};

export const initialLanguages: PlayerLanguage[] = [
  {
    id: '1',
    nameAr: 'العربية',
    nameEn: 'Arabic',
    levelAr: 'اللغة الأم',
    levelEn: 'Native / Mother Language'
  },
  {
    id: '2',
    nameAr: 'التركية',
    nameEn: 'Turkish',
    levelAr: 'ممتاز',
    levelEn: 'Excellent'
  },
  {
    id: '3',
    nameAr: 'الإنجليزية',
    nameEn: 'English',
    levelAr: 'جيد',
    levelEn: 'Good'
  }
];

export const initialAttributes: PersonalAttribute[] = [
  { id: '1', ar: 'إدارة الوقت والمواعيد', en: 'Time & Appointment Management', iconName: 'Clock' },
  { id: '2', ar: 'القدرة على العمل تحت الضغط', en: 'Ability to Work Under High Pressure', iconName: 'Zap' },
  { id: '3', ar: 'العمل الجماعي وتلاحم الفريق', en: 'Teamwork & Cohesive Spirit', iconName: 'Users' },
  { id: '4', ar: 'سرعة البديهة والتعلم السريع', en: 'Quick Intuition & Rapid Tactical Adaptation', iconName: 'Brain' },
  { id: '5', ar: 'التكيف مع البيئات المتغيرة', en: 'Adaptability to Diverse Football Environments', iconName: 'RefreshCw' },
  { id: '6', ar: 'التواصل الفعال مع الآخرين', en: 'Effective Pitch & Locker-room Communication', iconName: 'MessageSquare' }
];

export const initialClubs: ClubExperience[] = [
  {
    id: 'club-1',
    clubNameAr: 'الهلال',
    clubNameEn: 'Al Hilal Club',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    levelAr: 'مستوى البراعم',
    levelEn: 'Al-Baraem Level',
    durationAr: 'نصف موسم',
    durationEn: 'Half Season',
    sortOrder: 1,
    descriptionAr: 'بداية التأسيس الكروي وصقل مهارات التحكم والتموضع في الفئات السنية.',
    descriptionEn: 'Early youth development focusing on foundational mechanics, spatial awareness, and pitch control.'
  },
  {
    id: 'club-2',
    clubNameAr: 'الشعلة',
    clubNameEn: 'Al-Shulla',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    levelAr: 'دوري الناشئين',
    levelEn: 'Junior League',
    durationAr: 'سنة واحدة',
    durationEn: 'One Year',
    sortOrder: 2,
    descriptionAr: 'المشاركة في منافسات دوري الناشئين وتطوير المهارات التكتيكية والبدنية.',
    descriptionEn: 'Competitive participation in the Junior League, elevating tactical discipline and physical conditioning.'
  },
  {
    id: 'club-3',
    clubNameAr: 'كارا دولاب',
    clubNameEn: 'Karadolap',
    countryAr: 'تركيا',
    countryEn: 'Türkiye',
    levelAr: 'الدوري التركي المحلي',
    levelEn: 'Turkish League Level',
    durationAr: 'سنة واحدة',
    durationEn: 'One Year',
    sortOrder: 3,
    achievementsAr: ['هداف الفريق', 'ثاني هدافي الدوري'],
    achievementsEn: ['Team Top Scorer', 'Second Top Scorer in the League'],
    descriptionAr: 'موسم استثنائي تميز بالحس التهديفي العالي والحسم أمام المرمى.',
    descriptionEn: 'Standout season highlighted by lethal finishing, off-the-ball runs, and top goalscoring honors.',
    featured: true
  },
  {
    id: 'club-4',
    clubNameAr: 'نارت سبور',
    clubNameEn: 'Nart Spor',
    countryAr: 'تركيا',
    countryEn: 'Türkiye',
    levelAr: 'الدوري التركي',
    levelEn: 'Turkish League',
    durationAr: 'سنة واحدة',
    durationEn: 'One Year',
    sortOrder: 4,
    descriptionAr: 'تعزيز الأداء الكروي كلاعب وسط Box-to-Box مع أدوار هجومية ودفاعية متكاملة.',
    descriptionEn: 'Solidifying dynamic Box-to-Box responsibilities, bridging defense and attack seamlessly.'
  },
  {
    id: 'club-5',
    clubNameAr: 'زيتون بورنو',
    clubNameEn: 'Zeytinburnu Club',
    countryAr: 'تركيا',
    countryEn: 'Türkiye',
    levelAr: 'الدوري التركي',
    levelEn: 'Turkish League',
    durationAr: 'سنة واحدة',
    durationEn: 'One Year',
    sortOrder: 5,
    descriptionAr: 'خوض مباريات تنافسية في إسطنبول وإظهار مرونة لعب في خط الوسط والجناح الأيسر.',
    descriptionEn: 'Competitive fixtures in Istanbul demonstrating dual flexibility across central midfield and left wing.'
  },
  {
    id: 'club-6',
    clubNameAr: 'غيشت قلعة سبور',
    clubNameEn: 'Geçitkale Spor',
    countryAr: 'قبرص',
    countryEn: 'Cyprus',
    levelAr: 'الدوري القبرصي الممتاز',
    levelEn: 'Cyprus Premier / League Level',
    durationAr: 'نصف موسم',
    durationEn: 'Half Season',
    sortOrder: 6,
    achievementsAr: ['ثاني هدافي الفريق', 'أكثر لاعب صناعة للأهداف'],
    achievementsEn: ['Second Top Scorer in the Team', 'Most Assists Player'],
    descriptionAr: 'تألق لافت وصناعة اللعب من الأطراف والعمق مع المساهمة الحاسمة في الأهداف.',
    descriptionEn: 'High-impact stint leading team playmaking, key passes, and scoring contributions.',
    featured: true
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    titleAr: 'هداف فريق كارا دولاب',
    titleEn: 'Team Top Scorer – Karadolap',
    descriptionAr: 'حصل على لقب هداف الفريق بفضل النجاعة التهديفية العالية وتحركات Box-to-Box الذكية.',
    descriptionEn: 'Earned the top goalscorer title with clinical finishing and intelligent box-to-box runs.',
    clubId: 'club-3',
    clubNameAr: 'كارا دولاب',
    clubNameEn: 'Karadolap',
    priority: 1,
    featured: true,
    badgeType: 'trophy'
  },
  {
    id: 'ach-2',
    titleAr: 'ثاني هدافي الدوري التركي المحلي',
    titleEn: 'Second Top Scorer in League – Türkiye',
    descriptionAr: 'حقق المركز الثاني في قائمة هدافي الدوري العام برصيد مميز من الأهداف الانفرادية والرأسية.',
    descriptionEn: 'Ranked 2nd overall goalscorer in the league competition with exceptional offensive output.',
    clubId: 'club-3',
    clubNameAr: 'كارا دولاب',
    clubNameEn: 'Karadolap',
    priority: 2,
    featured: true,
    badgeType: 'medal'
  },
  {
    id: 'ach-3',
    titleAr: 'أكثر لاعب صناعة للأهداف (Most Assists)',
    titleEn: 'Most Assists Player – Geçitkale Spor',
    descriptionAr: 'تصدر قائمة صانعي الأهداف في النادي بفضل العرضيات الدقيقة والتمريرات البينية الحاسمة.',
    descriptionEn: 'Led the club assist charts through precise crosses, through balls, and set-piece delivery.',
    clubId: 'club-6',
    clubNameAr: 'غيشت قلعة سبور',
    clubNameEn: 'Geçitkale Spor',
    priority: 3,
    featured: true,
    badgeType: 'star'
  },
  {
    id: 'ach-4',
    titleAr: 'ثاني هدافي نادي غيشت قلعة سبور',
    titleEn: 'Second Top Scorer in Team – Geçitkale Spor',
    descriptionAr: 'المساهمة المباشرة بالأهداف الحاسمة في الدوري القبرصي خلال نصف موسم.',
    descriptionEn: 'Decisive scoring contribution in Cyprus competition within half a season.',
    clubId: 'club-6',
    clubNameAr: 'غيشت قلعة سبور',
    clubNameEn: 'Geçitkale Spor',
    priority: 4,
    featured: true,
    badgeType: 'chart'
  }
];

export const initialStats: PerformanceStat[] = [
  // Only authentic documented stats, no invented numbers!
  {
    id: 'stat-1',
    clubId: 'club-3',
    clubNameAr: 'كارا دولاب (تركيا)',
    clubNameEn: 'Karadolap (Türkiye)',
    season: '2022-2023'
  },
  {
    id: 'stat-2',
    clubId: 'club-6',
    clubNameAr: 'غيشت قلعة سبور (قبرص)',
    clubNameEn: 'Geçitkale Spor (Cyprus)',
    season: '2023-2024'
  }
];

export const initialVideos: VideoHighlight[] = [
  {
    id: 'vid-official-1',
    titleAr: 'عبدالرحمن – الفيديو التجميعي الرسمي (Official Highlights)',
    titleEn: 'Abdurahman – Official Scouting Highlights',
    descriptionAr: 'الملخص الرسمي لأفضل الأهداف والتمريرات الحاسمة والمهارات التكتيكية في المباريات الرسمية.',
    descriptionEn: 'Primary comprehensive showcase including goals, key passes, pressing traps, and technical skills.',
    category: 'HIGHLIGHTS',
    duration: '04:32',
    videoSourceType: 'external',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Embed preview player fallback
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    published: true,
    sortOrder: 1
  },
  {
    id: 'vid-goal-1',
    titleAr: 'هدف رأسي متقن بعد ارتقاء عالي',
    titleEn: 'Header Goal – High Vertical Leap',
    descriptionAr: 'هدف بالرأس من داخل المنطقة بعد متابعة حاسمة للكرة العرضية.',
    descriptionEn: 'Powerful aerial finish into the top corner following a dynamic box entry.',
    category: 'GOALS',
    clubNameAr: 'كارا دولاب',
    clubNameEn: 'Karadolap',
    duration: '00:45',
    videoSourceType: 'external',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    featured: false,
    published: true,
    sortOrder: 2
  },
  {
    id: 'vid-assist-1',
    titleAr: 'صناعة هدف بصورة رأسية حاسمة (Header Assist)',
    titleEn: 'Header Assist – Precise Flick-on',
    descriptionAr: 'تأمين الكرة وتمريرها بالرأس مباشرة للمهاجم أمام المرمى.',
    descriptionEn: 'Decisive tactical flick-on setting up the striker for a 1-on-1 finish.',
    category: 'ASSISTS',
    clubNameAr: 'غيشت قلعة سبور',
    clubNameEn: 'Geçitkale Spor',
    duration: '00:38',
    videoSourceType: 'external',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
    featured: false,
    published: true,
    sortOrder: 3
  },
  {
    id: 'vid-skill-1',
    titleAr: 'لمحة مهارية بالكعب وتجاوز مدافعين (Heel Skill)',
    titleEn: 'Heel Skill & Dual Dribble Evasion',
    descriptionAr: 'استلام ممتاز تحت الضغط واستخدام الكعب لتغيير اتجاه اللعب.',
    descriptionEn: 'Clever heel flick under heavy pressure to break the opposition defensive block.',
    category: 'SKILLS',
    duration: '00:30',
    videoSourceType: 'external',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560272564-6695205502ce?q=80&w=800&auto=format&fit=crop',
    featured: false,
    published: true,
    sortOrder: 4
  },
  {
    id: 'vid-match-1',
    titleAr: 'ملخص تحركات Box-to-Box وقوة افتراض الكرة',
    titleEn: 'Full Match Scouting Clip – Workrate & Ball Recovery',
    descriptionAr: 'عرض الأدوار الدفاعية واستعادة الكرات والضغط العالي طوال 90 دقيقة.',
    descriptionEn: 'Detailed 90-minute breakdown of tactical positioning, ball recoveries, and stamina.',
    category: 'MATCHES',
    clubNameAr: 'زيتون بورنو',
    clubNameEn: 'Zeytinburnu Club',
    duration: '02:15',
    videoSourceType: 'external',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=800&auto=format&fit=crop',
    featured: false,
    published: true,
    sortOrder: 5
  }
];

// 58 Photos set categorized into the respective 6 groups as specified
export const generateInitialPhotos = (): PhotoItem[] => {
  const clubs = [
    { nameAr: 'كارا دولاب', nameEn: 'Karadolap', count: 5, prefix: 'karadolap' },
    { nameAr: 'دريم سبور', nameEn: 'Dreamspor', count: 10, prefix: 'dreamspor' },
    { nameAr: 'غيشت قلعة الدوري الأول', nameEn: 'Geçitkale First League', count: 13, prefix: 'gecitkale' },
    { nameAr: 'ليفربورت مصر', nameEn: 'Liversport Egypt', count: 12, prefix: 'liversport' },
    { nameAr: 'زيتون بورنو', nameEn: 'Zeytinburnu', count: 8, prefix: 'zeytinburnu' },
    { nameAr: 'نارت سبور', nameEn: 'Nart Club', count: 10, prefix: 'nart' }
  ];

  const stockActionImages = [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560272564-6695205502ce?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop'
  ];

  const items: PhotoItem[] = [];
  let globalIndex = 1;

  clubs.forEach((club) => {
    for (let i = 1; i <= club.count; i++) {
      const imgIndex = (globalIndex - 1) % stockActionImages.length;
      items.push({
        id: `photo-${club.prefix}-${i}`,
        fileName: `${club.prefix}_${i}.jpg`,
        originalFileName: `${club.prefix}_${i}_original.jpg`,
        titleAr: `صورة ${globalIndex} - ${club.nameAr}`,
        titleEn: `Action Shot ${i} – ${club.nameEn}`,
        imageUrl: stockActionImages[imgIndex],
        clubNameAr: club.nameAr,
        clubNameEn: club.nameEn,
        captionAr: `صورة أثناء المشاركة مع ${club.nameAr}`,
        captionEn: `Matchday snapshot with ${club.nameEn}`,
        sourceType: 'external_url',
        sourceUrl: stockActionImages[imgIndex],
        width: 800,
        height: 800,
        fileSize: 102400,
        mimeType: 'image/jpeg',
        focalPoint: { x: 50, y: 50 },
        featured: i === 1,
        published: true,
        sortOrder: globalIndex,
        createdAt: '2026-09-30T14:10:00Z',
        updatedAt: '2026-09-30T14:10:00Z'
      });
      globalIndex++;
    }
  });

  return items;
};

export const initialPhotos: PhotoItem[] = generateInitialPhotos();

export const initialMedia: MediaItem[] = [
  {
    id: 'media-1',
    titleAr: 'لقاء ميداني عقب المباراة وإبراز الأداء الجماهيري',
    titleEn: 'Post-Match Pitchside Interview – Key Match Reflections',
    sourceNameAr: 'التغطية الإعلامية الرياضية',
    sourceNameEn: 'Sports Pitch Coverage',
    date: '2024-02-15',
    mediaType: 'field_interview',
    url: 'https://youtube.com',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    descriptionAr: 'حديث عبدالرحمن عن مجريات اللقاء التكتيكي وتحقيقه لجائزة أفضل لاعب في المباراة.',
    descriptionEn: 'Abdurahman discussing tactical adjustments and earning Man of the Match recognition.'
  },
  {
    id: 'media-2',
    titleAr: 'تقرير صحفي عن المواهب الشابة في الدوري التركي والقبرصي',
    titleEn: 'Press Feature: Rising Talents in Turkish & Cypriot Leagues',
    sourceNameAr: 'الصحافة الرياضية',
    sourceNameEn: 'Football Press Network',
    date: '2023-11-10',
    mediaType: 'press',
    url: 'https://google.com',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop',
    descriptionAr: 'تسليط الضوء على قدرات عبدالرحمن في مرونة مراكز خط الوسط والجناح الأيسر.',
    descriptionEn: 'Feature article analyzing Abdurahman’s box-to-box engine and positional flexibility.'
  }
];

export const initialCV: DocumentCV = {
  id: 'cv-default',
  titleAr: 'السيرة الذاتية الرياضية الرسمية – عبدالرحمن محمد أوغلو',
  titleEn: 'Official Sports CV – Abdurahman Muhammed Oglu',
  language: 'both',
  fileUrl: '#',
  updatedAt: '2026-09-30'
};

export const initialSections: SectionConfig[] = [
  { id: 'sec-hero', key: 'hero', titleAr: 'الرئيسية', titleEn: 'Hero Banner', enabled: true, sortOrder: 1 },
  { id: 'sec-scouting', key: 'scouting', titleAr: 'بطاقة التقييم السريع للكشافين', titleEn: 'Scouting Evaluation', enabled: true, sortOrder: 2 },
  { id: 'sec-profile', key: 'profile', titleAr: 'الملف الشخصي والهدف', titleEn: 'Player Profile & Objective', enabled: true, sortOrder: 3 },
  { id: 'sec-career', key: 'career', titleAr: 'المسيرة الكروية والأندية', titleEn: 'Career Timeline', enabled: true, sortOrder: 4 },
  { id: 'sec-achievements', key: 'achievements', titleAr: 'أبرز الإنجازات والألقاب', titleEn: 'Key Achievements', enabled: true, sortOrder: 5 },
  { id: 'sec-stats', key: 'stats', titleAr: 'الإحصائيات والأرقام', titleEn: 'Performance Stats', enabled: true, sortOrder: 6 },
  { id: 'sec-official-highlights', key: 'officialHighlights', titleAr: 'الفيديو التجميعي الرسمي', titleEn: 'Official Highlights', enabled: true, sortOrder: 7 },
  { id: 'sec-videos', key: 'videos', titleAr: 'مكتبة الفيديوهات والمهارات', titleEn: 'Video Highlights Library', enabled: true, sortOrder: 8 },
  { id: 'sec-photos', key: 'photos', titleAr: 'معرض الصور المعتمده', titleEn: 'Photo Gallery', enabled: true, sortOrder: 9 },
  { id: 'sec-media', key: 'media', titleAr: 'المقابلات والتغطيات الإعلامية', titleEn: 'Media & Interviews', enabled: true, sortOrder: 10 },
  { id: 'sec-cv', key: 'cv', titleAr: 'السيرة الذاتية الرياضية (CV)', titleEn: 'Player CV', enabled: true, sortOrder: 11 },
  { id: 'sec-contact', key: 'contact', titleAr: 'التواصل والاستفسارات الأكاديمية', titleEn: 'Inquiries & Contact', enabled: true, sortOrder: 12 }
];

export const initialTheme: ThemeConfig = {
  primaryColor: '#0284c7', // Cyan / Electric Blue
  secondaryColor: '#0f172a', // Deep Navy
  accentColor: '#06b6d4', // Bright Cyan
  backgroundColor: '#0b0f17', // Charcoal Black
  cardColor: '#111827',
  textColor: '#f8fafc',
  heroOverlayOpacity: 0.65,
  cardRadius: 'xl'
};

export const initialSEO: SEOConfig = {
  siteTitleAr: 'عبدالرحمن محمد أوغلو | لاعب كرة قدم محترف – Scouting Profile',
  siteTitleEn: 'Abdurahman Muhammed Oglu | Professional Footballer Portfolio',
  descriptionAr: 'الموقع الرسمي والملف الرقمي للاعب كرة القدم عبدالرحمن محمد أوغلو. استعراض الفيديوهات، الأهداف، المسيرة، والتواصل المباشر مع الكشافين والأندية.',
  descriptionEn: 'Official scouting platform and portfolio for Abdurahman Muhammed Oglu, Turkish football player (Box-to-Box Midfielder & Left Wing).',
  keywords: 'Abdurahman Muhammed Oglu, Footballer, Midfielder, Left Wing, Scouting, Highlights, Karadolap, Geçitkale, Transfermarkt',
  ogImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'
};

export const defaultImageDisplayConfig: ImageDisplayConfig = {
  fit: 'cover',
  positionPreset: 'center-center',
  positionX: 50,
  positionY: 50,
  focalPoint: { x: 50, y: 50 },
  zoom: 1.0,
  panX: 0,
  panY: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  opacity: 100,
  blur: 0,
  mobileFit: 'cover',
  mobilePositionX: 50,
  mobilePositionY: 50,
  mobileFocalPoint: { x: 50, y: 50 },
  mobileZoom: 1.0
};

export const initialHeroConfig: HeroConfig = {
  displayMode: 'image_overlay',
  desktopImage: '',
  mobileImage: '',
  videoUrl: '',
  videoSourceType: 'youtube',
  imageDisplay: { ...defaultImageDisplayConfig, brightness: 90, contrast: 110 },
  desktopHeight: '85vh',
  tabletHeight: '70vh',
  mobileHeight: '65vh',
  overlayColor: '#0b0f17',
  overlayOpacity: 70,
  gradientEnabled: true,
  gradientDirection: 'bottom-to-top',
  animationType: 'pulse',
  animationSpeed: 10,
  animationIntensity: 1.05,
  pauseOnHover: true,
  contentVerticalAlign: 'center',
  contentHorizontalAlign: 'center',
  contentMaxWidth: 'wide',
  textAlign: 'center',
  mobileContentAlign: 'center'
};

export const initialBrandingConfig: BrandingConfig = {
  logoUrl: '',
  logoFit: 'contain',
  desktopLogoWidth: 120,
  tabletLogoWidth: 100,
  mobileLogoWidth: 80,
  logoAlignment: 'center',
  showInHeader: true,
  showInFooter: true,
  showInAdminLogin: true,
  showInAdminSidebar: true,
  showInFavicon: false,
  showInSocialShare: false,
  logoStatus: 'removed'
};
