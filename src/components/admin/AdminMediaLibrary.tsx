import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, parseDriveUrl, compressImage } from '../../services/dataService';
import { PhotoItem } from '../../types/player';
import { ImagePicker } from './ImagePicker';
import { MediaPicker } from '../common/MediaPicker';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Check, 
  Download, 
  Star, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  AlertCircle,
  FileImage,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Upload,
  X
} from 'lucide-react';

export const AdminMediaLibrary: React.FC = () => {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Replacement States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<'ALL' | 'FEATURED'>('ALL');

  // Deletion Warn Modal State
  const [deletionWarning, setDeletionWarning] = useState<{
    show: boolean;
    photo: PhotoItem | null;
    references: string[];
  }>({ show: false, photo: null, references: [] });

  // Bulk Upload Panel State
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkClub, setBulkClub] = useState('كارا دولاب');
  const [bulkUrls, setBulkUrls] = useState('');

  // Single Device Upload State (Requested feature)
  const [singleUploadMode, setSingleUploadMode] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoDataUrl, setNewPhotoDataUrl] = useState<string>('');
  const [newPhotoTitleAr, setNewPhotoTitleAr] = useState('');
  const [newPhotoTitleEn, setNewPhotoTitleEn] = useState('');
  const [newPhotoClub, setNewPhotoClub] = useState('كارا دولاب');
  const [newPhotoFeatured, setNewPhotoFeatured] = useState(false);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    setPhotos(DataService.getPhotos());
  };

  const saveAll = (updated: PhotoItem[]) => {
    setPhotos(updated);
    DataService.updatePhotos(updated);
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Check References before deletion (Requirement #9)
  const handleDeleteCheck = (photo: PhotoItem) => {
    const player = DataService.getPlayerInfo();
    const clubs = DataService.getClubs();
    const seo = DataService.getSEO();
    
    const references: string[] = [];

    if (player.profilePhoto === photo.imageUrl) references.push('Player Profile Photo');
    if (player.heroImage === photo.imageUrl) references.push('Hero Desktop Background');
    if (player.mobileHeroImage === photo.imageUrl) references.push('Hero Mobile Background');
    if (player.playerCutoutImage === photo.imageUrl) references.push('Player Profile Cutout');
    if (player.aboutImage === photo.imageUrl) references.push('About Player Section');
    if (player.cvPreviewImage === photo.imageUrl) references.push('CV Preview Background');
    if (player.socialShareImage === photo.imageUrl) references.push('Social Share Banner');
    if (seo.ogImageUrl === photo.imageUrl) references.push('SEO OpenGraph Banner');

    clubs.forEach(c => {
      if (c.logoUrl === photo.imageUrl) references.push(`Logo of Club: ${c.clubNameEn}`);
      if (c.coverImageUrl === photo.imageUrl) references.push(`Cover of Club: ${c.clubNameEn}`);
    });

    // Always trigger custom warning dialog modal to prevent browser blocking errors!
    setDeletionWarning({ show: true, photo, references });
  };

  // Safe Deletion & Automatic Reference Unlinking (Bug fix)
  const confirmDelete = (id: string) => {
    const freshPhotos = DataService.getPhotos();
    const photoToDelete = freshPhotos.find(p => p.id === id);
    if (!photoToDelete) return;

    const oldUrl = photoToDelete.imageUrl;

    // 1. Delete photo from Media Library array safely
    const updatedPhotos = freshPhotos.filter(p => p.id !== id);
    saveAll(updatedPhotos);

    // 2. Safely unlink/clear active references in Player Profile Info
    const player = DataService.getPlayerInfo();
    let playerUpdated = false;
    const fallbackImage = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
    
    if (player.profilePhoto === oldUrl) { player.profilePhoto = fallbackImage; playerUpdated = true; }
    if (player.heroImage === oldUrl) { player.heroImage = fallbackImage; playerUpdated = true; }
    if (player.mobileHeroImage === oldUrl) { player.mobileHeroImage = fallbackImage; playerUpdated = true; }
    if (player.playerCutoutImage === oldUrl) { player.playerCutoutImage = ''; playerUpdated = true; }
    if (player.aboutImage === oldUrl) { player.aboutImage = ''; playerUpdated = true; }
    if (player.cvPreviewImage === oldUrl) { player.cvPreviewImage = ''; playerUpdated = true; }
    if (player.socialShareImage === oldUrl) { player.socialShareImage = ''; playerUpdated = true; }
    if (playerUpdated) {
      DataService.updatePlayerInfo(player);
    }

    // 3. Safely unlink/clear active references in Club History
    const clubsList = DataService.getClubs();
    let clubsUpdated = false;
    const updatedClubs = clubsList.map(c => {
      let changed = false;
      let logo = c.logoUrl;
      let cover = c.coverImageUrl;
      if (c.logoUrl === oldUrl) { logo = ''; changed = true; }
      if (c.coverImageUrl === oldUrl) { cover = ''; changed = true; }
      if (changed) {
        clubsUpdated = true;
        return { ...c, logoUrl: logo, coverImageUrl: cover };
      }
      return c;
    });
    if (clubsUpdated) {
      DataService.updateClubs(updatedClubs);
    }

    // 4. Safely unlink/clear active references in SEO OG Image
    const seo = DataService.getSEO();
    if (seo.ogImageUrl === oldUrl) {
      seo.ogImageUrl = fallbackImage;
      DataService.updateSEO(seo);
    }

    setDeletionWarning({ show: false, photo: null, references: [] });
    setMessage(t('تم حذف الصورة من مكتبة الوسائط وإلغاء ارتباطاتها تلقائياً.', 'Photo deleted from Media Library and active references unlinked.'));
    setTimeout(() => setMessage(null), 3000);
  };

  // Replace Photo upload handler (Requirement #5 & User request)
  const triggerReplace = (id: string) => {
    setReplaceTargetId(id);
    fileInputRef.current?.click();
  };

  const handleReplaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      
      // Compress immediately to prevent quota limits (Requirement #15 & #16)
      const dataUrl = await compressImage(rawDataUrl);
      
      const freshPhotos = DataService.getPhotos();
      
      const oldPhoto = freshPhotos.find(p => p.id === replaceTargetId);
      if (!oldPhoto) return;

      const oldUrl = oldPhoto.imageUrl;

      // 1. Update the photo item's image URL in the photos database
      const updatedPhotos = freshPhotos.map(p => 
        p.id === replaceTargetId 
          ? { 
              ...p, 
              imageUrl: dataUrl, 
              fileName: file.name,
              originalFileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              sourceType: 'upload' as const,
              updatedAt: new Date().toISOString()
            } 
          : p
      );
      saveAll(updatedPhotos);

      // 2. Scan and replace references in Player Profile (Requirement #5)
      const player = DataService.getPlayerInfo();
      let playerUpdated = false;
      if (player.profilePhoto === oldUrl) { player.profilePhoto = dataUrl; playerUpdated = true; }
      if (player.heroImage === oldUrl) { player.heroImage = dataUrl; playerUpdated = true; }
      if (player.mobileHeroImage === oldUrl) { player.mobileHeroImage = dataUrl; playerUpdated = true; }
      if (player.playerCutoutImage === oldUrl) { player.playerCutoutImage = dataUrl; playerUpdated = true; }
      if (player.aboutImage === oldUrl) { player.aboutImage = dataUrl; playerUpdated = true; }
      if (player.cvPreviewImage === oldUrl) { player.cvPreviewImage = dataUrl; playerUpdated = true; }
      if (player.socialShareImage === oldUrl) { player.socialShareImage = dataUrl; playerUpdated = true; }
      if (playerUpdated) {
        DataService.updatePlayerInfo(player);
      }

      // 3. Scan and replace references in Clubs
      const clubsList = DataService.getClubs();
      let clubsUpdated = false;
      const updatedClubs = clubsList.map(c => {
        let changed = false;
        let logo = c.logoUrl;
        let cover = c.coverImageUrl;
        if (c.logoUrl === oldUrl) { logo = dataUrl; changed = true; }
        if (c.coverImageUrl === oldUrl) { cover = dataUrl; changed = true; }
        if (changed) {
          clubsUpdated = true;
          return { ...c, logoUrl: logo, coverImageUrl: cover };
        }
        return c;
      });
      if (clubsUpdated) {
        DataService.updateClubs(updatedClubs);
      }

      // 4. Scan and replace references in SEO
      const seo = DataService.getSEO();
      if (seo.ogImageUrl === oldUrl) {
        seo.ogImageUrl = dataUrl;
        DataService.updateSEO(seo);
      }

      setReplaceTargetId(null);
      setMessage(t('تم استبدال الصورة بنجاح وتحديث كافة الارتباطات الفورية!', 'Image replaced successfully and all linkages updated!'));
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Featured status
  const toggleFeatured = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, featured: !p.featured } : p);
    saveAll(updated);
  };

  // Toggle Publish Status
  const togglePublish = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, published: !p.published } : p);
    saveAll(updated);
  };

  // Bulk Multiple Image URLs addition (Requirement #10)
  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkUrls) return;

    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(Boolean);
    const newPhotos: PhotoItem[] = urls.map((url, i) => {
      let finalUrl = url;
      if (url.includes('drive.google.com')) {
        finalUrl = parseDriveUrl(url).directUrl;
      }
      return {
        id: `photo-bulk-${Date.now()}-${i}`,
        fileName: `bulk_import_${i + 1}.jpg`,
        originalFileName: `bulk_import_${i + 1}.jpg`,
        titleAr: `صورة مجمعة ${photos.length + i + 1}`,
        titleEn: `Bulk Import ${photos.length + i + 1}`,
        imageUrl: finalUrl,
        clubNameAr: bulkClub,
        clubNameEn: bulkClub,
        sourceType: url.includes('drive.google.com') ? 'google_drive' : 'external_url',
        sourceUrl: url,
        width: 800,
        height: 800,
        fileSize: 102400,
        mimeType: 'image/jpeg',
        focalPoint: { x: 50, y: 50 },
        featured: false,
        published: true,
        sortOrder: photos.length + i + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    saveAll([...newPhotos, ...photos]);
    setBulkUrls('');
    setBulkMode(false);
    setMessage(t('تم استيراد مجموعة الصور بنجاح!', 'Batch photos imported successfully!'));
    setTimeout(() => setMessage(null), 3000);
  };

  // Single Device File Upload Handlers (Requested feature)
  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      const compressed = await compressImage(rawDataUrl);
      setNewPhotoDataUrl(compressed);
      
      // Auto extraction of clean title
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setNewPhotoTitleEn(cleanName);
      setNewPhotoTitleAr(cleanName);
    };
    reader.readAsDataURL(file);
  };

  const handleSingleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoDataUrl) return;

    const newPhoto: PhotoItem = {
      id: `photo-upload-${Date.now()}`,
      fileName: newPhotoFile?.name || 'uploaded_photo.jpg',
      originalFileName: newPhotoFile?.name || 'uploaded_photo.jpg',
      titleAr: newPhotoTitleAr || 'صورة مرفوعة',
      titleEn: newPhotoTitleEn || 'Uploaded Photo',
      imageUrl: newPhotoDataUrl,
      clubNameAr: newPhotoClub,
      clubNameEn: newPhotoClub,
      sourceType: 'upload',
      width: 1000,
      height: 1000,
      fileSize: newPhotoFile?.size || 102400,
      mimeType: newPhotoFile?.type || 'image/jpeg',
      focalPoint: { x: 50, y: 50 },
      featured: newPhotoFeatured,
      published: true,
      sortOrder: photos.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAll([newPhoto, ...photos]);
    
    // Reset form states
    setSingleUploadMode(false);
    setNewPhotoFile(null);
    setNewPhotoDataUrl('');
    setNewPhotoTitleAr('');
    setNewPhotoTitleEn('');
    setNewPhotoFeatured(false);
    
    setMessage(t('تم رفع وحفظ الصورة الجديدة بنجاح في المكتبة!', 'New photo successfully uploaded and added to the library!'));
    setTimeout(() => setMessage(null), 3000);
  };

  // Overhauled Deletion Workflow State
  const [showReplacementPicker, setShowReplacementPicker] = useState(false);

  const getTabForReference = (ref: string): string => {
    if (ref.includes('Profile Photo') || ref.includes('Hero') || ref.includes('Cutout') || ref.includes('About') || ref.includes('CV')) {
      return 'profile';
    }
    if (ref.includes('Club')) {
      return 'career';
    }
    if (ref.includes('SEO')) {
      return 'seo';
    }
    return 'profile';
  };

  const handleOpenUsage = (ref: string) => {
    const tabName = getTabForReference(ref);
    if ((window as any).adminNavigateToTab) {
      (window as any).adminNavigateToTab(tabName);
    }
    setDeletionWarning({ show: false, photo: null, references: [] });
  };

  const executeReplaceEverywhere = (oldUrl: string, newUrl: string) => {
    // 1. Update Player Info references
    const player = DataService.getPlayerInfo();
    let playerUpdated = false;
    if (player.profilePhoto === oldUrl) { player.profilePhoto = newUrl; playerUpdated = true; }
    if (player.heroImage === oldUrl) { player.heroImage = newUrl; playerUpdated = true; }
    if (player.mobileHeroImage === oldUrl) { player.mobileHeroImage = newUrl; playerUpdated = true; }
    if (player.playerCutoutImage === oldUrl) { player.playerCutoutImage = newUrl; playerUpdated = true; }
    if (player.aboutImage === oldUrl) { player.aboutImage = newUrl; playerUpdated = true; }
    if (player.cvPreviewImage === oldUrl) { player.cvPreviewImage = newUrl; playerUpdated = true; }
    if (player.socialShareImage === oldUrl) { player.socialShareImage = newUrl; playerUpdated = true; }
    if (playerUpdated) DataService.updatePlayerInfo(player);

    // 2. Update Club Experience references
    const clubsList = DataService.getClubs();
    let clubsUpdated = false;
    const updatedClubs = clubsList.map(c => {
      let changed = false;
      let logo = c.logoUrl;
      let cover = c.coverImageUrl;
      let gallery = c.galleryUrls || [];
      if (c.logoUrl === oldUrl) { logo = newUrl; changed = true; }
      if (c.coverImageUrl === oldUrl) { cover = newUrl; changed = true; }
      if (gallery.includes(oldUrl)) {
        gallery = gallery.map(url => url === oldUrl ? newUrl : url);
        changed = true;
      }
      if (changed) {
        clubsUpdated = true;
        return { ...c, logoUrl: logo, coverImageUrl: cover, galleryUrls: gallery };
      }
      return c;
    });
    if (clubsUpdated) DataService.updateClubs(updatedClubs);

    // 3. Update SEO references
    const seo = DataService.getSEO();
    if (seo.ogImageUrl === oldUrl) {
      seo.ogImageUrl = newUrl;
      DataService.updateSEO(seo);
    }

    // Now delete oldUrl photo from media list safely
    if (deletionWarning.photo) {
      const freshPhotos = DataService.getPhotos();
      const updatedPhotos = freshPhotos.filter(p => p.id !== deletionWarning.photo!.id);
      saveAll(updatedPhotos);
    }

    setDeletionWarning({ show: false, photo: null, references: [] });
    setShowReplacementPicker(false);
    setMessage(t('تم استبدال الصورة بنجاح وحذف الصورة القديمة من المكتبة.', 'Image replaced everywhere and old photo deleted successfully.'));
    setTimeout(() => setMessage(null), 3000);
  };

  const executeRemoveFromUsage = (oldUrl: string) => {
    const fallbackImage = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
    
    // 1. Player Info references
    const player = DataService.getPlayerInfo();
    let playerUpdated = false;
    if (player.profilePhoto === oldUrl) { player.profilePhoto = fallbackImage; playerUpdated = true; }
    if (player.heroImage === oldUrl) { player.heroImage = fallbackImage; playerUpdated = true; }
    if (player.mobileHeroImage === oldUrl) { player.mobileHeroImage = fallbackImage; playerUpdated = true; }
    if (player.playerCutoutImage === oldUrl) { player.playerCutoutImage = ''; playerUpdated = true; }
    if (player.aboutImage === oldUrl) { player.aboutImage = ''; playerUpdated = true; }
    if (player.cvPreviewImage === oldUrl) { player.cvPreviewImage = ''; playerUpdated = true; }
    if (player.socialShareImage === oldUrl) { player.socialShareImage = ''; playerUpdated = true; }
    if (playerUpdated) DataService.updatePlayerInfo(player);

    // 2. Club Experience references
    const clubsList = DataService.getClubs();
    let clubsUpdated = false;
    const updatedClubs = clubsList.map(c => {
      let changed = false;
      let logo = c.logoUrl;
      let cover = c.coverImageUrl;
      let gallery = c.galleryUrls || [];
      if (c.logoUrl === oldUrl) { logo = ''; changed = true; }
      if (c.coverImageUrl === oldUrl) { cover = ''; changed = true; }
      if (gallery.includes(oldUrl)) {
        gallery = gallery.filter(url => url !== oldUrl);
        changed = true;
      }
      if (changed) {
        clubsUpdated = true;
        return { ...c, logoUrl: logo, coverImageUrl: cover, galleryUrls: gallery };
      }
      return c;
    });
    if (clubsUpdated) DataService.updateClubs(updatedClubs);

    // 3. SEO references
    const seo = DataService.getSEO();
    if (seo.ogImageUrl === oldUrl) {
      seo.ogImageUrl = fallbackImage;
      DataService.updateSEO(seo);
    }

    // Now delete oldUrl photo from media list safely
    if (deletionWarning.photo) {
      const freshPhotos = DataService.getPhotos();
      const updatedPhotos = freshPhotos.filter(p => p.id !== deletionWarning.photo!.id);
      saveAll(updatedPhotos);
    }

    setDeletionWarning({ show: false, photo: null, references: [] });
    setMessage(t('تم إزالة الصورة بنجاح من كافة مواضع الاستخدام وحذفها.', 'Image unlinked from all references and deleted successfully.'));
    setTimeout(() => setMessage(null), 3000);
  };

  // Filters logic
  const clubs = Array.from(new Set(photos.map(p => p.clubNameAr))).filter(Boolean);
  const filteredPhotos = photos.filter(p => {
    const matchesSearch = p.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.clubNameAr?.includes(searchQuery);
    const matchesClub = selectedClub === 'ALL' || p.clubNameAr === selectedClub || p.clubNameEn === selectedClub;
    const matchesSource = selectedSource === 'ALL' || p.sourceType === selectedSource;
    const matchesFeatured = featuredFilter === 'ALL' || (featuredFilter === 'FEATURED' && p.featured);

    return matchesSearch && matchesClub && matchesSource && matchesFeatured;
  });

  return (
    <div className="space-y-8">
      
      {/* Hidden File Input for Replacement Trigger */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleReplaceUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('مكتبة الوسائط والترميم', 'Central Media Library')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('استبدال فوري لأي صورة بالرفع من جهازك مع فحص شامل وتحديث لكافة الارتباطات النشطة تلقائياً', 'Instant image replacement from device and automated safe linkages updating')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSingleUploadMode(!singleUploadMode);
              setBulkMode(false);
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${
              singleUploadMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t('رفع صورة من الجهاز', 'UPLOAD FROM DEVICE')}</span>
          </button>

          <button
            onClick={() => {
              setBulkMode(!bulkMode);
              setSingleUploadMode(false);
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${
              bulkMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{t('رفع مجمع للروابط', 'BATCH URL IMPORT')}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Unified Deletion Custom confirmation dialog modal */}
      {deletionWarning.show && deletionWarning.photo && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn text-xs relative">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => {
                setDeletionWarning({ show: false, photo: null, references: [] });
                setShowReplacementPicker(false);
              }}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {deletionWarning.references.length > 0 ? (
              <>
                <div className="flex items-center gap-2.5 text-red-400 border-b border-slate-800 pb-2">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <h3 className="font-bold text-base">{t('حذف محظور: الصورة قيد الاستخدام نشط!', 'Deletion Locked: Image In Use!')}</h3>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t(
                    'لتجنب ظهور صور مكسورة أو روابط فارغة في الموقع العام، الصورة مرتبطة حالياً بالمواضع التالية. الرجاء فك الارتباط أو استخدام الحلول السريعة أدناه:',
                    'To prevent layout breakages, this image is currently active in the following places. Choose a quick resolution action below:'
                  )}
                </p>

                {/* Usage Map list with direct jumps */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 block">{t('خريطة مواضع استخدام الصورة (Usage Map):', 'Image Usage Map:')}</span>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 divide-y divide-slate-900">
                    {deletionWarning.references.map((ref, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between gap-4">
                        <span className="text-slate-300 font-latin text-[11px]">{ref}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenUsage(ref)}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors shrink-0 text-[10px]"
                        >
                          {t('ذهاب للموضع ↗', 'Open Usage ↗')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overhauled Recovery Actions Suite */}
                <div className="space-y-3 pt-2">
                  <span className="font-bold text-slate-400 block">{t('إجراءات المعالجة والحل الفوري (Quick Resolution Suite):', 'Automated Conflict Resolution:')}</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Action 1: Replace Everywhere */}
                    <button
                      type="button"
                      onClick={() => setShowReplacementPicker(!showReplacementPicker)}
                      className="p-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex flex-col items-center justify-center text-center gap-1 shadow-lg"
                    >
                      <span className="font-bold">{t('🔄 استبدال في جميع المواضع', 'Replace Everywhere')}</span>
                      <span className="text-[10px] opacity-80 font-normal">{t('اختر البديل وحفظ وحذف فوراً', 'Choose swap image')}</span>
                    </button>

                    {/* Action 2: Remove references completely */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t('هل أنت متأكد من تفريغ كافة ارتباطات هذه الصورة وحذفها نهائياً؟', 'Are you sure you want to unlink this image and delete it?'))) {
                          executeRemoveFromUsage(deletionWarning.photo!.imageUrl);
                        }
                      }}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs border border-red-500/30 transition-colors flex flex-col items-center justify-center text-center gap-1"
                    >
                      <span>🔓 {t('إزالة كافة الارتباطات وحذف', 'Remove from Usage')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{t('تفريغ المراجع وحذف الصورة', 'Unlink references & delete')}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Placement Picker for Replacing Everywhere */}
                {showReplacementPicker && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3 animate-fadeIn">
                    <span className="font-bold text-cyan-400 block">{t('اختر الصورة البديلة المراد استبدالها بالمواضع النشطة:', 'Select Replacement Image:')}</span>
                    <MediaPicker
                      value={deletionWarning.photo.imageUrl}
                      onChange={(newUrl: string) => {
                        executeReplaceEverywhere(deletionWarning.photo!.imageUrl, newUrl);
                      }}
                      onClose={() => setShowReplacementPicker(false)}
                      title={t('اختر الصورة البديلة للاستبدال', 'Select Swap Replacement Image')}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5 text-cyan-400 border-b border-slate-800 pb-2">
                  <FileImage className="w-6 h-6 shrink-0" />
                  <h3 className="font-bold text-base">{t('تأكيد حذف العنصر نهائياً', 'Confirm Media Deletion')}</h3>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('هل أنت متأكد من رغبتك في حذف هذه الصورة نهائياً من مكتبة الوسائط؟ لا يمكن التراجع عن هذا الإجراء.', 'Are you sure you want to permanently delete this photo from the library? This action cannot be undone.')}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => confirmDelete(deletionWarning.photo!.id)}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors"
                  >
                    {t('نعم، احذف الصورة', 'DELETE PERMANENTLY')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletionWarning({ show: false, photo: null, references: [] })}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Bulk Upload Area */}
      {bulkMode && (
        <form onSubmit={handleBulkUpload} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 animate-fadeIn text-xs">
          <div className="flex items-center gap-2 text-cyan-400">
            <FolderOpen className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider font-latin">{t('رفع متعدد للصور (Batch URL Import)', 'MULTIPLE URL BATCH IMPORT')}</h3>
          </div>
          <p className="text-[11px] text-slate-400">{t('أدخل كل رابط صورة في سطر مستقل لتسجيلها معاً لتبسيط العمل في ثوانٍ.', 'Paste one image URL per line. Easily register dozens of photos at once.')}</p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">{t('تصنيف النادي للمجموعة كاملة', 'Assign Club for this Batch')}</label>
            <input 
              type="text" 
              required
              value={bulkClub}
              onChange={e => setBulkClub(e.target.value)}
              className="w-full sm:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">{t('روابط الصور (رابط واحد في كل سطر) *', 'Image URLs (One URL per line) *')}</label>
            <textarea 
              rows={5}
              required
              value={bulkUrls}
              onChange={e => setBulkUrls(e.target.value)}
              placeholder="https://drive.google.com/file/d/...\nhttps://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-latin"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              {t('استيراد الدفعة بالكامل', 'IMPORT BATCH')}
            </button>
            <button
              type="button"
              onClick={() => setBulkMode(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              {t('إلغاء', 'Cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Single Device File Upload Area (Requested feature) */}
      {singleUploadMode && (
        <form onSubmit={handleSingleUploadSubmit} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 animate-fadeIn text-xs">
          
          <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
            <Upload className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider font-latin">{t('رفع صورة جديدة من الجهاز', 'UPLOAD NEW IMAGE FROM DEVICE')}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('اختر صورة من حاسوبك أو هاتفك المحمول ليتم ضغطها وتخزينها فوريّاً بجودة فائقة وحجم ذكي', 'Choose any photo from your device. It will compress automatically to prevent storage quota limits')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left side: Upload Picker & Preview */}
            <div className="md:col-span-1 space-y-3">
              <label className="block text-slate-300 font-bold mb-1">{t('ملف الصورة', 'Select Image File')}</label>
              
              <input 
                type="file"
                ref={singleFileInputRef}
                onChange={handleSingleFileChange}
                accept="image/*"
                className="hidden"
              />

              {newPhotoDataUrl ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
                  <img src={newPhotoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => singleFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-[10px] hover:bg-cyan-400"
                    >
                      {t('تغيير الملف', 'CHOOSE OTHER FILE')}
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => singleFileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950 cursor-pointer flex flex-col items-center justify-center p-4 text-center transition-colors group"
                >
                  <Upload className="w-8 h-8 text-slate-600 group-hover:text-cyan-400 transition-colors mb-2 animate-bounce" />
                  <span className="font-bold text-slate-300 text-[11px]">{t('انقر لاختيار ملف صورة', 'Click to Select Image File')}</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-latin">JPG, PNG, WEBP, AVIF</span>
                </div>
              )}
            </div>

            {/* Right side: Image Metadata & details */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('العنوان (بالعربية)', 'Title (Arabic)')}</label>
                  <input 
                    type="text"
                    required
                    value={newPhotoTitleAr}
                    onChange={e => setNewPhotoTitleAr(e.target.value)}
                    placeholder="مثال: لقطة المباراة الحاسمة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('العنوان (بالإنجليزية)', 'Title (English)')}</label>
                  <input 
                    type="text"
                    required
                    value={newPhotoTitleEn}
                    onChange={e => setNewPhotoTitleEn(e.target.value)}
                    placeholder="e.g. Decisive Match Shot"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 font-latin"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('اسم النادي المرتبط', 'Associated Club Name')}</label>
                  <input 
                    type="text"
                    required
                    value={newPhotoClub}
                    onChange={e => setNewPhotoClub(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2 text-slate-300 font-bold">
                    <input 
                      type="checkbox"
                      checked={newPhotoFeatured}
                      onChange={e => setNewPhotoFeatured(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{t('تمييز كصورة معبرة رئيسية (Featured)', 'Set as Primary Featured Showcase')}</span>
                  </label>
                </div>
              </div>

              {newPhotoFile && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1 font-latin">
                  <div><strong className="text-slate-300">File Name:</strong> {newPhotoFile.name}</div>
                  <div><strong className="text-slate-300">File Size:</strong> {(newPhotoFile.size / 1024).toFixed(1)} KB</div>
                  <div><strong className="text-slate-300">Compressed Size:</strong> {newPhotoDataUrl ? `${(newPhotoDataUrl.length * 0.75 / 1024).toFixed(1)} KB` : 'calculating...'}</div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!newPhotoDataUrl}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t('حفظ وإضافة للمكتبة', 'SAVE TO MEDIA LIBRARY')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSingleUploadMode(false);
                    setNewPhotoFile(null);
                    setNewPhotoDataUrl('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
              </div>
            </div>

          </div>

        </form>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-center text-xs">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('البحث باسم الملف أو التصنيف...', 'Search file or category...')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-100"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedClub}
              onChange={e => setSelectedClub(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 font-semibold text-slate-300 focus:outline-none w-full"
            >
              <option value="ALL">{t('جميع الأندية', 'All Clubs')}</option>
              {clubs.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 font-semibold text-slate-300 focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="ALL">{t('جميع المصادر', 'All Sources')}</option>
            <option value="upload">Upload</option>
            <option value="google_drive">Google Drive</option>
            <option value="external_url">External Links</option>
          </select>

          <select
            value={featuredFilter}
            onChange={e => setFeaturedFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 font-semibold text-slate-300 focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="ALL">{t('الكل', 'Show All')}</option>
            <option value="FEATURED">{t('المميزة فقط', 'Featured Only')}</option>
          </select>

        </div>

      </div>

      {/* Grid Library View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id}
            className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between p-4 group animate-fadeIn"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3">
              <img 
                src={photo.imageUrl} 
                alt="Asset" 
                style={{ objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%` }}
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-cyan-400 text-[10px] font-extrabold uppercase font-latin">
                {photo.sourceType}
              </div>

              {/* Status overlays */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {photo.featured && (
                  <span className="p-1 rounded bg-amber-500 text-slate-950" title="Featured Card Banner">
                    <Star className="w-3 h-3 fill-slate-950" />
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white truncate">{photo.titleEn}</h4>
              <p className="text-[10px] text-slate-400 font-latin truncate mt-0.5">{photo.fileName}</p>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 font-latin">
                <span>{photo.width}x{photo.height}</span>
                <span>·</span>
                <span>{((photo.fileSize ?? 102400) / 1024).toFixed(0)} KB</span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-3 mt-3 border-t border-slate-800">
              <button
                onClick={() => copyToClipboard(photo.imageUrl, photo.id)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                title="Copy Image URL"
              >
                {copiedId === photo.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Upload & Replace from Device Button (Requested Feature) */}
              <button
                onClick={() => triggerReplace(photo.id)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                title="Upload & Replace Image"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={() => toggleFeatured(photo.id)}
                className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 transition-colors ${
                  photo.featured ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                }`}
                title="Toggle Featured Status"
              >
                <Star className={`w-3.5 h-3.5 ${photo.featured ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={() => togglePublish(photo.id)}
                className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 transition-colors ${
                  photo.published ? 'text-emerald-400' : 'text-slate-500 hover:text-white'
                }`}
                title="Publish / Unpublish"
              >
                {photo.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleDeleteCheck(photo)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                title="Delete Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
