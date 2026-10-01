import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, compressImage, parseDriveUrl } from '../../services/dataService';
import { MediaItem } from '../../types/player';
import { MediaPicker } from '../common/MediaPicker';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Check, 
  Star, 
  Eye, 
  EyeOff, 
  Search, 
  Radio, 
  FileText, 
  Video, 
  Image as ImageIcon,
  FolderOpen,
  Calendar,
  User,
  Link,
  HelpCircle,
  Tag,
  Bold,
  Italic,
  Heading,
  List,
  ChevronDown,
  X,
  ArrowLeft,
  FileImage,
  Upload,
  Globe
} from 'lucide-react';

export const AdminMediaInterviews: React.FC = () => {
  const { t } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const list = DataService.getMedia();
    return list.map((item, idx) => ({
      ...item,
      published: item.published !== false,
      featured: item.featured || false,
      sortOrder: item.sortOrder || idx + 1
    }));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [statusFilter, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'FEATURED'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'sortOrder'>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Editor / Form States
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Show picker overlays
  const [showPickerFor, setShowPickerFor] = useState<'thumbnail' | 'gallery' | 'article_featured' | 'photo_src' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Single file upload for video/image device uploads
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const saveAll = (updated: MediaItem[]) => {
    setMediaList(updated);
    DataService.updateMedia(updated);
  };

  const handleTogglePublish = (id: string) => {
    const updated = mediaList.map(m => m.id === id ? { ...m, published: !m.published } : m);
    saveAll(updated);
    setMessage(t('تم تحديث حالة النشر بنجاح.', 'Publish status updated successfully.'));
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleFeatured = (id: string) => {
    const updated = mediaList.map(m => m.id === id ? { ...m, featured: !m.featured } : m);
    saveAll(updated);
    setMessage(t('تم تحديث حالة التمييز كعنصر رئيسي.', 'Featured spotlight status updated.'));
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذه المادة الإعلامية؟', 'Are you sure you want to delete this media item?'))) {
      const updated = mediaList.filter(m => m.id !== id);
      saveAll(updated);
      setMessage(t('تم حذف المادة بنجاح.', 'Media item deleted successfully.'));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDuplicate = (item: MediaItem) => {
    const duplicated: MediaItem = {
      ...item,
      id: `media-dup-${Date.now()}`,
      titleAr: `${item.titleAr} (نسخة مكررة)`,
      titleEn: `${item.titleEn} (Copy)`,
      sortOrder: mediaList.length + 1,
      featured: false,
      published: false
    };
    const updated = [...mediaList, duplicated];
    saveAll(updated);
    setMessage(t('تم تكرار العنصر الإعلامي بنجاح.', 'Media item duplicated successfully.'));
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenAddForm = (type: 'video' | 'article' | 'image' | 'gallery') => {
    setShowAddMenu(false);
    const newItem: MediaItem = {
      id: `media-new-${Date.now()}`,
      titleAr: '',
      titleEn: '',
      sourceNameAr: '',
      sourceNameEn: '',
      date: new Date().toISOString().split('T')[0],
      mediaType: type,
      url: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop',
      descriptionAr: '',
      descriptionEn: '',
      summaryAr: '',
      summaryEn: '',
      contentAr: '',
      contentEn: '',
      authorAr: '',
      authorEn: '',
      clubNameAr: '',
      clubNameEn: '',
      sourceType: 'external_url',
      featured: false,
      published: true,
      sortOrder: mediaList.length + 1,
      galleryUrls: [],
      tags: []
    };
    setEditingItem(newItem);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updatedList;
    const exists = mediaList.some(m => m.id === editingItem.id);
    if (exists) {
      updatedList = mediaList.map(m => m.id === editingItem.id ? editingItem : m);
    } else {
      updatedList = [...mediaList, editingItem];
    }

    saveAll(updatedList);
    setEditingItem(null);
    setMessage(t('تم حفظ المادة الإعلامية بنجاح!', 'Media item saved successfully!'));
    setTimeout(() => setMessage(null), 3000);
  };

  const addTag = (tag: string) => {
    if (!editingItem) return;
    const tags = editingItem.tags || [];
    if (tag && !tags.includes(tag)) {
      setEditingItem({ ...editingItem, tags: [...tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    if (!editingItem) return;
    const tags = editingItem.tags || [];
    setEditingItem({ ...editingItem, tags: tags.filter(t => t !== tag) });
  };

  // Safe WYSIWYG HTML Injector Helper (Requirement #4)
  const insertHtmlAtCursor = (isAr: boolean, tag: string) => {
    const textarea = document.getElementById(isAr ? 'contentAr' : 'contentEn') as HTMLTextAreaElement;
    if (!textarea || !editingItem) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = '';
    if (tag === 'b') replacement = `<b>${selected || t('نص عريض', 'Bold Text')}</b>`;
    else if (tag === 'i') replacement = `<i>${selected || t('نص مائل', 'Italic Text')}</i>`;
    else if (tag === 'h3') replacement = `<h3>${selected || t('عنوان رئيسي', 'Heading 3')}</h3>`;
    else if (tag === 'p') replacement = `<p>${selected || t('اكتب الفقرة هنا...', 'Paragraph text...')}</p>`;
    else if (tag === 'ul') replacement = `<ul>\n  <li>${selected || t('عنصر القائمة 1', 'List Item 1')}</li>\n  <li>${t('عنصر القائمة 2', 'List Item 2')}</li>\n</ul>`;
    else if (tag === 'a') {
      const url = prompt(t('أدخل رابط URL:', 'Enter URL:'), 'https://');
      if (!url) return;
      replacement = `<a href="${url}" target="_blank" class="text-cyan-400 underline hover:text-cyan-300 transition-colors">${selected || t('نص الرابط', 'link text')}</a>`;
    } else if (tag === 'img') {
      const url = prompt(t('أدخل رابط الصورة المباشر أو الـ Drive:', 'Enter direct Image or Drive URL:'), 'https://');
      if (!url) return;
      const caption = prompt(t('أدخل عنوان تعليق الصورة (Caption):', 'Enter Image Caption:'), '');
      if (caption) {
        replacement = `<figure class="my-6 space-y-2"><img src="${url}" alt="Article Image" class="w-full rounded-2xl border border-slate-800 shadow-xl max-h-96 object-cover" /><figcaption class="text-center text-xs text-slate-400">${caption}</figcaption></figure>`;
      } else {
        replacement = `<img src="${url}" alt="Article Image" class="my-6 w-full rounded-2xl border border-slate-800 shadow-xl max-h-96 object-cover" />`;
      }
    } else if (tag === 'caption') {
      replacement = `<figcaption class="text-center text-xs text-slate-400 mt-1">${selected || t('تعليق توضيحي للصورة', 'Image Caption')}</figcaption>`;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    if (isAr) {
      setEditingItem({ ...editingItem, contentAr: newValue });
    } else {
      setEditingItem({ ...editingItem, contentEn: newValue });
    }

    // Refocus and place selection pointer beautifully
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Handler for direct file uploading in Video/Image sections
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'url' | 'thumbnailUrl') => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploadProgress(t('جاري التحميل والمعالجة...', 'Uploading & processing...'));
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawData = event.target?.result as string;
      
      try {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(rawData, 1200, 0.82);
          setEditingItem({ ...editingItem, [field]: compressed });
        } else {
          // Large MP4/Video file storage quota helper warning
          if (file.size > 8 * 1024 * 1024) {
            alert(t('تنبيه: حجم الفيديو كبير جداً للتخزين المحلي. نوصي باستخدام رابط Google Drive أو YouTube لتفادي حدوث مشاكل في المتصفح.', 'Warning: Video is too large for local browser storage. We recommend using a Google Drive or YouTube link to prevent storage issues.'));
          }
          setEditingItem({ ...editingItem, [field]: rawData });
        }
        setUploadProgress(null);
      } catch (err) {
        setUploadProgress(t('فشل المعالجة.', 'Processing failed.'));
        setTimeout(() => setUploadProgress(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Gallery handler to choose multiple photos for an article/gallery
  const handleAddGalleryUrl = (url: string) => {
    if (!editingItem) return;
    const list = editingItem.galleryUrls || [];
    if (!list.includes(url)) {
      setEditingItem({ ...editingItem, galleryUrls: [...list, url] });
    }
  };

  const handleRemoveGalleryUrl = (url: string) => {
    if (!editingItem) return;
    const list = editingItem.galleryUrls || [];
    setEditingItem({ ...editingItem, galleryUrls: list.filter(u => u !== url) });
  };

  // Sorting and Filtering logic
  const filteredList = mediaList.filter(item => {
    const matchesSearch = item.titleAr.includes(searchQuery) || 
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sourceNameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clubNameEn || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type Filter
    let matchesType = false;
    if (filterType === 'ALL') {
      matchesType = true;
    } else if (filterType === 'video') {
      matchesType = item.mediaType === 'video' || item.mediaType === 'interview' || item.mediaType === 'field_interview' || item.mediaType === 'clip';
    } else if (filterType === 'article') {
      matchesType = item.mediaType === 'article' || item.mediaType === 'press';
    } else if (filterType === 'image') {
      matchesType = item.mediaType === 'image';
    } else if (filterType === 'gallery') {
      matchesType = item.mediaType === 'gallery';
    } else {
      matchesType = item.mediaType === filterType;
    }
    
    // Status / Spotlight Filter
    let matchesStatus = true;
    if (statusFilter === 'PUBLISHED') {
      matchesStatus = item.published === true;
    } else if (statusFilter === 'DRAFT') {
      matchesStatus = item.published === false;
    } else if (statusFilter === 'FEATURED') {
      matchesStatus = item.featured === true;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return sortDirection === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    } else {
      const orderA = a.sortOrder || 99;
      const orderB = b.sortOrder || 99;
      return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
    }
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Navigation Breadcrumb Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 px-4 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <button 
            type="button"
            onClick={() => {
              if ((window as any).adminNavigateToTab) {
                (window as any).adminNavigateToTab('dashboard');
              }
            }}
            className="hover:text-cyan-400 font-bold transition-colors"
          >
            {t('لوحة التحكم', 'Dashboard')}
          </button>
          <span>/</span>
          <span className="text-white font-bold">{t('المقابلات والإعلام', 'Media & Interviews')}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if ((window as any).adminClosePortal) {
              (window as any).adminClosePortal();
            }
          }}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('خروج وإغلاق', 'Exit Admin')}</span>
        </button>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('إدارة التغطيات والمقابلات الإعلامية', 'Media & Interviews Manager')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('إنشاء وإدارة وتكرار التغطيات الصحفية، الفيديوهات الإعلامية، المقالات المكتوبة وصور الملاعب بنقرة واحدة', 'Add, edit, duplicate & publish press interviews, news features, and visual articles')}</p>
        </div>

        {/* Add Media Dropdown Menu (Requirement #2) */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة مادة إعلامية', 'ADD MEDIA')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20 animate-fadeIn text-right rtl:text-right">
              <button
                type="button"
                onClick={() => handleOpenAddForm('video')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="flex-1 text-right">{t('إضافة فيديو (Add Video)', 'Add Video')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddForm('article')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-right">{t('إضافة مقال (Add Article)', 'Add Article')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddForm('image')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex-1 text-right">{t('إضافة صورة (Add Image)', 'Add Image')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddForm('gallery')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <FolderOpen className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="flex-1 text-right">{t('إضافة معرض صور (Add Photo Gallery)', 'Add Photo Gallery')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Media Content Manager & Filters Area (Requirement #6) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 rtl:right-3 rtl:left-auto" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('البحث بالعنوان، الناشر، النادي...', 'Search title, publisher, club...')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 rtl:pr-9 pr-4 py-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 shrink-0">{t('النوع:', 'Type:')}</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t('جميع التغطيات', 'All Media')}</option>
            <option value="video">{t('الفيديوهات والمقابلات المرئية', 'Videos')}</option>
            <option value="article">{t('المقالات والتقارير المكتوبة', 'Articles')}</option>
            <option value="image">{t('الصور والتغطية الفردية', 'Images')}</option>
            <option value="gallery">{t('معارض الصور المتكاملة', 'Galleries')}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 shrink-0">{t('الحالة:', 'Status:')}</span>
          <select
            value={statusFilter}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t('الكل', 'All Statuses')}</option>
            <option value="PUBLISHED">{t('منشور', 'Published')}</option>
            <option value="DRAFT">{t('مسودة', 'Draft')}</option>
            <option value="FEATURED">{t('المميزة فقط', 'Featured Spotlights')}</option>
          </select>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 shrink-0">{t('ترتيب:', 'Sort:')}</span>
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-');
              setSortField(field as any);
              setSortDirection(dir as any);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-200 focus:outline-none font-latin"
          >
            <option value="sortOrder-asc">Sort Order (Low to High)</option>
            <option value="sortOrder-desc">Sort Order (High to Low)</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Media Contents List Grid */}
      {sortedList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
          <h3 className="font-bold text-white text-base mb-1">{t('لا توجد مواد مضافة تطابق التصفية الحالية', 'No media items match filter')}</h3>
          <p className="text-xs text-slate-500 mb-4">{t('يرجى اختيار إضافة مادة إعلامية جديدة للبدء في تعبئة محتوى المقابلات.', 'Choose an action from the "+ Add Media" dropdown to begin.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {sortedList.map((item) => {
            const isVideo = item.mediaType === 'video' || item.mediaType === 'interview' || item.mediaType === 'field_interview' || item.mediaType === 'clip';
            const isArticle = item.mediaType === 'article' || item.mediaType === 'press';
            const isImage = item.mediaType === 'image';
            const isGallery = item.mediaType === 'gallery';
            
            return (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl relative transition-all"
              >
                
                {/* Media Type Badge */}
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-950/90 text-cyan-400 font-extrabold uppercase text-[9px] tracking-wider z-10 flex items-center gap-1.5 font-latin">
                  {isVideo ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : 
                   isArticle ? <FileText className="w-3.5 h-3.5 text-amber-400" /> : 
                   isImage ? <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> :
                   <FolderOpen className="w-3.5 h-3.5 text-violet-400" />}
                  <span>{item.mediaType}</span>
                </div>

                <div className="space-y-3">
                  {/* Cover Preview Image */}
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative">
                    <img src={item.thumbnailUrl} alt={item.titleEn} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 leading-snug">{item.titleAr || item.titleEn}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1 font-latin">{item.titleEn}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-latin">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-cyan-500" /> {item.date}</span>
                    <span>·</span>
                    <span className="text-cyan-400 font-bold">{item.sourceNameEn || item.clubNameEn || t('مستقل', 'Independent')}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`p-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors ${
                        item.featured ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                      }`}
                      title={t('تمكين كعنصر مميز', 'Toggle Featured Spotlight')}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      className={`p-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors ${
                        item.published ? 'text-emerald-400' : 'text-slate-500 hover:text-white'
                      }`}
                      title={t('منشور / مسودة', 'Toggle Publish Status')}
                    >
                      {item.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                      title={t('تعديل', 'Edit')}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                      title={t('تكرار', 'Duplicate')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                      title={t('حذف', 'Delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal for Adding / Editing Media Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSaveForm}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 max-w-3xl w-full shadow-2xl space-y-5 my-8 animate-fadeIn text-xs text-right"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-row-reverse">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2 flex-row-reverse">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>
                  {editingItem.mediaType === 'video' ? t('إدارة فيديو إعلامي', 'Manage Video Item') :
                   editingItem.mediaType === 'article' ? t('تحرير مقال صحفي غني', 'Edit Written Article') :
                   editingItem.mediaType === 'image' ? t('إدارة قصة مصورة فردية', 'Manage Photo Story') :
                   t('إدارة معرض صور إعلامي متكامل', 'Manage Photo Gallery')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pl-2 pr-2 no-scrollbar text-right">
              
              {/* Common Basic Information Titles (Arabic & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('العنوان بالعربية *', 'Arabic Title *')}</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.titleAr}
                    onChange={(e) => setEditingItem({ ...editingItem, titleAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-right"
                    placeholder="مثال: مقابلة مع تلفزيون الرياضة"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('العنوان بالإنجليزية *', 'English Title *')}</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.titleEn}
                    onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-latin"
                    placeholder="e.g. Interview with Sports TV"
                  />
                </div>
              </div>

              {/* Date & Club Name Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('تاريخ النشر / المقابلة *', 'Publication Date *')}</label>
                  <input 
                    type="date" 
                    required
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('النادي المرتبط بالعربية', 'Club (Arabic)')}</label>
                  <input 
                    type="text"
                    value={editingItem.clubNameAr || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, clubNameAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    placeholder="مثال: كارا دولاب"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('النادي المرتبط بالإنجليزية', 'Club (English)')}</label>
                  <input 
                    type="text"
                    value={editingItem.clubNameEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, clubNameEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                    placeholder="e.g. Karadolap"
                  />
                </div>
              </div>

              {/* TYPE 1: VIDEO SPECIFIC LAYOUT */}
              {(editingItem.mediaType === 'video' || editingItem.mediaType === 'interview' || editingItem.mediaType === 'clip') && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 border-b border-slate-900 pb-1.5 flex items-center justify-between flex-row-reverse">
                    <span>{t('إعدادات ومصدر الفيديو الإعلامي', 'Video Source Config')}</span>
                    <Video className="w-4 h-4" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('مصدر الفيديو', 'Video Source Type')}</label>
                      <select
                        value={editingItem.sourceType || 'external_url'}
                        onChange={(e) => setEditingItem({ ...editingItem, sourceType: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                      >
                        <option value="upload">{t('رفع من الجهاز (Upload File)', 'Device Upload')}</option>
                        <option value="google_drive">{t('رابط Google Drive', 'Google Drive URL')}</option>
                        <option value="external_url">{t('رابط خارجي / YouTube / URL', 'External URL / YouTube')}</option>
                        <option value="media_library">{t('مكتبة الصور (Media Library)', 'Media Library')}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('المصور / المصدر', 'Photographer / Source')}</label>
                      <input 
                        type="text"
                        value={editingItem.photographerEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, photographerEn: e.target.value, photographerAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                        placeholder="e.g. Bein Sports, Photographer"
                      />
                    </div>
                  </div>

                  {/* Dynamic inputs based on source type */}
                  {editingItem.sourceType === 'upload' && (
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">{t('اختر ملف الفيديو من جهازك', 'Choose Video File')}</label>
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => handleDeviceUpload(e, 'url')}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                      />
                      {uploadProgress && <div className="text-[10px] text-cyan-400">{uploadProgress}</div>}
                    </div>
                  )}

                  {editingItem.sourceType === 'google_drive' && (
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">{t('رابط Google Drive للفيديو *', 'Google Drive Video Link *')}</label>
                      <input 
                        type="url" 
                        required
                        value={editingItem.url || ''}
                        onChange={(e) => {
                          const parsed = parseDriveUrl(e.target.value);
                          setEditingItem({ ...editingItem, url: parsed.directUrl });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-latin text-left"
                        placeholder="https://drive.google.com/file/d/..."
                      />
                    </div>
                  )}

                  {(editingItem.sourceType === 'external_url' || !editingItem.sourceType) && (
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">{t('الرابط الخارجي للفيديو (YouTube / Direct MP4) *', 'External Video Link *')}</label>
                      <input 
                        type="url" 
                        required
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-latin text-left"
                        placeholder="https://youtube.com/watch?v=... or .mp4 URL"
                      />
                    </div>
                  )}

                  {editingItem.sourceType === 'media_library' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 flex-row-reverse">
                        <label className="block text-slate-300 font-bold">{t('اختر مادة الفيديو من مكتبة الوسائط', 'Choose Video from Library')}</label>
                        <button
                          type="button"
                          onClick={() => setShowPickerFor('photo_src')}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 text-[10px]"
                        >
                          {t('تصفح المعرض', 'Browse Library')}
                        </button>
                      </div>
                      <input 
                        type="text" 
                        required
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin text-left"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TYPE 2: ARTICLE REAL WYSIWYG EDITOR LAYOUT (Requirement #4) */}
              {editingItem.mediaType === 'article' && (
                <div className="space-y-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-amber-400 border-b border-slate-900 pb-1.5 flex items-center justify-between flex-row-reverse">
                    <span>{t('محرر المقالات الصحفية والأخبار المتكامل', 'Written Press Article Editor')}</span>
                    <FileText className="w-4 h-4" />
                  </div>

                  {/* Summary inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('الملخص المختصر بالعربية', 'Arabic Summary')}</label>
                      <textarea 
                        rows={2}
                        value={editingItem.summaryAr || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, summaryAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-right"
                        placeholder="أدخل مخلص سريع وجذاب كعنوان فرعي للأخبار..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('الملخص بالإنجليزية', 'English Summary')}</label>
                      <textarea 
                        rows={2}
                        value={editingItem.summaryEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, summaryEn: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                        placeholder="Enter short press preview summary..."
                      />
                    </div>
                  </div>

                  {/* Publisher & External Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('اسم الكاتب / المحرر', 'Author Name')}</label>
                      <input 
                        type="text"
                        value={editingItem.authorEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, authorEn: e.target.value, authorAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('المصدر / الجريدة الناشرة', 'Publisher Network')}</label>
                      <input 
                        type="text"
                        required
                        value={editingItem.sourceNameEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, sourceNameEn: e.target.value, sourceNameAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                        placeholder="e.g. Football News Agency"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('رابط الخبر الخارجي الأصلي', 'External Article URL')}</label>
                      <input 
                        type="url"
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin text-left"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Rich Text Editor Body Panels (Arabic) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800 flex-row-reverse">
                      <span className="font-bold text-slate-300">{t('المحتوى الكامل للمقال (بالعربية)', 'Arabic Article Content')}</span>
                      
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex-row-reverse">
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'h3')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title={t('عنوان رئيسي <h3>', 'Heading')}><Heading className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'p')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title={t('فقرة جديدة <p>', 'Paragraph')}><FileText className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'b')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white font-bold" title={t('نص عريض <b>', 'Bold')}><Bold className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'i')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white italic" title={t('نص مائل <i>', 'Italic')}><Italic className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'ul')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title={t('قائمة نقطية <ul>', 'List')}><List className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'a')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title={t('إدراج رابط نشط <a>', 'Insert Link')}><Link className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(true, 'img')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title={t('إدراج صورة تعليق <figure>', 'Insert Image')}><ImageIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <textarea
                      id="contentAr"
                      rows={8}
                      value={editingItem.contentAr || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, contentAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-right"
                      placeholder="<p>اكتب محتوى المقال مع تنسيق HTML غني هنا...</p>"
                    />
                  </div>

                  {/* Rich Text Editor Body Panels (English) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300">{t('المحتوى الكامل بالإنجليزية', 'English Article Content')}</span>
                      
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'h3')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Heading <h3>"><Heading className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'p')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Paragraph <p>"><FileText className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'b')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white font-bold" title="Bold <b>"><Bold className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'i')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white italic" title="Italic <i>"><Italic className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'ul')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="List <ul>"><List className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'a')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Insert Link <a>"><Link className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => insertHtmlAtCursor(false, 'img')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Insert Image <figure>"><ImageIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <textarea
                      id="contentEn"
                      rows={8}
                      value={editingItem.contentEn || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, contentEn: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-left"
                      placeholder="<p>Write English text using rich HTML markup...</p>"
                    />
                  </div>

                  {/* Associated Gallery URLs inside Article */}
                  <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center flex-row-reverse">
                      <span className="font-bold text-slate-200">{t('الصور المرفقة بالمقال (Article Photo Gallery)', 'Attached Article Gallery')}</span>
                      <button
                        type="button"
                        onClick={() => setShowPickerFor('gallery')}
                        className="px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950"
                      >
                        {t('+ اختر صورة للمقالة', '+ Choose Photo')}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {(editingItem.galleryUrls || []).map((url, index) => (
                        <div key={index} className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative group">
                          <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryUrl(url)}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 3: IMAGE / PHOTO STORY SPECIFIC LAYOUT */}
              {editingItem.mediaType === 'image' && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-right">
                  <div className="text-xs font-bold text-emerald-400 border-b border-slate-900 pb-1.5 flex items-center justify-between flex-row-reverse">
                    <span>{t('إعدادات ومصدر الصورة الإعلامية', 'Photo Story Config')}</span>
                    <ImageIcon className="w-4 h-4" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('مصدر إدخال الصورة', 'Photo Source Type')}</label>
                      <select
                        value={editingItem.sourceType || 'external_url'}
                        onChange={(e) => setEditingItem({ ...editingItem, sourceType: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                      >
                        <option value="upload">{t('رفع ملف مباشر من الجهاز', 'Device Upload')}</option>
                        <option value="media_library">{t('اختر من مكتبة الوسائط الحالية', 'Choose from Media Library')}</option>
                        <option value="google_drive">{t('رابط Google Drive للصورة', 'Google Drive URL')}</option>
                        <option value="external_url">{t('رابط خارجي مباشر للملف', 'External URL Link')}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('المصور الفوتوغرافي', 'Photographer Credit')}</label>
                      <input 
                        type="text"
                        value={editingItem.photographerEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, photographerEn: e.target.value, photographerAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                        placeholder="e.g. John Sports Shot"
                      />
                    </div>
                  </div>

                  {/* Custom Source file pickers */}
                  {editingItem.sourceType === 'upload' && (
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">{t('اختر ملف الصورة للقصة الإعلامية *', 'Choose Image File *')}</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        required={!editingItem.url}
                        onChange={(e) => handleDeviceUpload(e, 'url')}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                      />
                      {uploadProgress && <div className="text-[10px] text-cyan-400">{uploadProgress}</div>}
                    </div>
                  )}

                  {editingItem.sourceType === 'media_library' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 flex-row-reverse">
                        <label className="block text-slate-300 font-bold">{t('اختر الصورة من مكتبة الوسائط *', 'Pick from Media Library *')}</label>
                        <button
                          type="button"
                          onClick={() => setShowPickerFor('photo_src')}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 text-[10px]"
                        >
                          {t('تصفح المعرض', 'Browse Gallery')}
                        </button>
                      </div>
                      <input 
                        type="text" 
                        required
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin text-left"
                      />
                    </div>
                  )}

                  {editingItem.sourceType === 'google_drive' && (
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">{t('رابط Google Drive للصورة *', 'Google Drive URL *')}</label>
                      <input 
                        type="url" 
                        required
                        value={editingItem.url || ''}
                        onChange={(e) => {
                          const parsed = parseDriveUrl(e.target.value);
                          setEditingItem({ ...editingItem, url: parsed.directUrl });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-latin text-left"
                        placeholder="https://drive.google.com/file/d/..."
                      />
                    </div>
                  )}

                  {editingItem.sourceType === 'external_url' && (
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">{t('رابط الصورة المباشر من الإنترنت *', 'Direct Image URL *')}</label>
                      <input 
                        type="url" 
                        required
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-latin text-left"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('التعليق التوضيحي المرفق بالعربية', 'Arabic Caption')}</label>
                      <input 
                        type="text"
                        value={editingItem.descriptionAr || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
                        placeholder="مثال: لقطة أثناء التدريبات"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">{t('التعليق التوضيحي المرفق بالإنجليزية', 'English Caption')}</label>
                      <input 
                        type="text"
                        value={editingItem.descriptionEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-latin"
                        placeholder="e.g. Training session moment"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 4: PHOTO GALLERY SPECIFIC LAYOUT */}
              {editingItem.mediaType === 'gallery' && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-right">
                  <div className="text-xs font-bold text-violet-400 border-b border-slate-900 pb-1.5 flex items-center justify-between flex-row-reverse">
                    <span>{t('إدارة ألبوم ومعرض الصور الإعلامي المتكامل', 'Photo Gallery Setup')}</span>
                    <FolderOpen className="w-4 h-4" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center flex-row-reverse">
                      <label className="block text-slate-300 font-bold">{t('إضافة صور جديدة للألبوم المتكامل', 'Add images to this Gallery Album')}</label>
                      <button
                        type="button"
                        onClick={() => setShowPickerFor('gallery')}
                        className="px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 text-[11px]"
                      >
                        {t('+ اختر صورة للإضافة', '+ Select Image')}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 min-h-[100px]">
                      {(editingItem.galleryUrls || []).map((url, index) => (
                        <div key={index} className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative group animate-fadeIn">
                          <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryUrl(url)}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(editingItem.galleryUrls || []).length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-500">
                          {t('المعرض فارغ حالياً. انقر على الزر بالأعلى لإضافة صور من جهازك أو المكتبة.', 'Gallery is currently empty. Click button to append photos.')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnail URL Picker Cover for all (except direct images sometimes) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-right">
                <div className="flex items-center justify-between flex-row-reverse">
                  <span className="font-bold text-slate-300 block">{t('الصورة الرمزية للغلاف (Cover Image / Thumbnail) *', 'Thumbnail Cover Image *')}</span>
                  <button
                    type="button"
                    onClick={() => setShowPickerFor('thumbnail')}
                    className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                  >
                    {t('اختر من المكتبة', 'Choose Cover Photo')}
                  </button>
                </div>
                <div className="flex gap-4 items-center flex-row-reverse">
                  <img src={editingItem.thumbnailUrl || editingItem.url} alt="Thumbnail preview" className="w-24 h-16 rounded-lg object-cover border border-slate-800 shrink-0" />
                  <input 
                    type="url" 
                    required
                    value={editingItem.thumbnailUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin text-left"
                  />
                </div>
              </div>

              {/* Descriptions & Summaries for List Card views */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('الوصف التوضيحي القصير بالعربية *', 'Arabic Card Description *')}</label>
                  <textarea 
                    rows={2}
                    required
                    value={editingItem.descriptionAr || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
                    placeholder="اكتب مقتطف قصير جذاب للبطاقة الإعلامية..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">{t('الوصف التوضيحي بالإنجليزية *', 'English Card Description *')}</label>
                  <textarea 
                    rows={2}
                    required
                    value={editingItem.descriptionEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                    placeholder="Enter short engaging description for the card preview..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin text-left"
                  />
                </div>
              </div>

              {/* Tags & Metadata keywords */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-right">
                <span className="font-bold text-slate-300 block flex items-center gap-1.5 flex-row-reverse">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>{t('الوسوم والكلمات الدلالية (Tags & Keywords)', 'Tags & Keywords')}</span>
                </span>
                
                <div className="flex flex-wrap gap-1.5 flex-row-reverse">
                  {(editingItem.tags || []).map((tVal) => (
                    <span key={tVal} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 flex items-center gap-1 font-latin">
                      <span>{tVal}</span>
                      <button type="button" onClick={() => removeTag(tVal)} className="hover:text-red-400 font-bold">×</button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 flex-row-reverse">
                  <input 
                    type="text" 
                    id="new-tag-input"
                    placeholder={t('أضف تصنيف مثل: مباراة، أهداف، كشف', 'Add tag...')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          addTag(val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById('new-tag-input') as HTMLInputElement;
                      if (inp?.value.trim()) {
                        addTag(inp.value.trim());
                        inp.value = '';
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Status Toggles & Ordering */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 items-center">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300 justify-end flex-row-reverse">
                  <input 
                    type="checkbox"
                    checked={editingItem.featured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span>{t('تمييز كخبر رئيسي في البداية (Featured Focus)', 'Featured Spotlight')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300 justify-end flex-row-reverse">
                  <input 
                    type="checkbox"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span>{t('نشر المادة الإعلامية فوراً (Publish)', 'Publish Instantly')}</span>
                </label>

                <div className="flex items-center gap-2 justify-end flex-row-reverse">
                  <span className="text-slate-400 font-bold">{t('الترتيب:', 'Sort Order:')}</span>
                  <input 
                    type="number"
                    value={editingItem.sortOrder || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                    className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center text-slate-200 font-latin"
                  />
                </div>
              </div>

            </div>

            {/* Form Footer */}
            <div className="flex items-center gap-3 border-t border-slate-800 pt-4 flex-row-reverse">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                {t('حفظ ونشر المادة الإعلامية', 'SAVE & PUBLISH MEDIA')}
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                {t('إلغاء التعديل', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Picker Overlays for Thumbnail & Article Gallery choosing */}
      {(showPickerFor === 'thumbnail' || showPickerFor === 'gallery' || showPickerFor === 'photo_src') && (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <MediaPicker
              value={showPickerFor === 'thumbnail' ? (editingItem?.thumbnailUrl || '') : ''}
              onChange={(url) => {
                if (editingItem) {
                  if (showPickerFor === 'thumbnail') {
                    setEditingItem({ ...editingItem, thumbnailUrl: url });
                  } else if (showPickerFor === 'photo_src') {
                    setEditingItem({ ...editingItem, url: url });
                  } else if (showPickerFor === 'gallery') {
                    handleAddGalleryUrl(url);
                  }
                }
                setShowPickerFor(null);
              }}
              onClose={() => setShowPickerFor(null)}
              title={
                showPickerFor === 'thumbnail' ? t('اختر غلاف الصورة الرمزية للمقال والفيديو', 'Select Cover Image Thumbnail') :
                showPickerFor === 'photo_src' ? t('اختر ملف الصورة للقصة الصحفية', 'Choose Image Asset') :
                t('أضف صورة لمعرض الألبوم', 'Choose Album Photo to Append')
              }
            />
          </div>
        </div>
      )}

    </div>
  );
};
