import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, compressImage } from '../../services/dataService';
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
  X
} from 'lucide-react';

export const AdminMediaInterviews: React.FC = () => {
  const { t } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const list = DataService.getMedia();
    // Guarantee basic fields
    return list.map((item, idx) => ({
      ...item,
      published: item.published !== false,
      featured: item.featured || false,
      sortOrder: item.sortOrder || idx + 1
    }));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [statusFilter, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  
  // Editor / Form States
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPickerFor, setShowPickerFor] = useState<'thumbnail' | 'gallery' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Article rich-text helper state
  const [editorText, setEditorText] = useState('');

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
    setEditorText('');
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

  const insertRichText = (tag: string) => {
    if (!editingItem) return;
    let codeAr = '';
    let codeEn = '';
    if (tag === 'b') { codeAr = '<b>نص عريض</b>'; codeEn = '<b>Bold Text</b>'; }
    if (tag === 'i') { codeAr = '<i>نص مائل</i>'; codeEn = '<i>Italic Text</i>'; }
    if (tag === 'h3') { codeAr = '<h3>عنوان فرعي</h3>'; codeEn = '<h3>Subheading</h3>'; }
    if (tag === 'p') { codeAr = '<p>فقرة جديدة...</p>'; codeEn = '<p>New paragraph...</p>'; }

    setEditingItem({
      ...editingItem,
      contentAr: (editingItem.contentAr || '') + codeAr,
      contentEn: (editingItem.contentEn || '') + codeEn
    });
  };

  const filteredList = mediaList.filter(item => {
    const matchesSearch = item.titleAr.includes(searchQuery) || 
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceNameEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'ALL' || item.mediaType === filterType;
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'PUBLISHED' && item.published) || 
      (statusFilter === 'DRAFT' && !item.published);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('إدارة المقابلات والتغطيات الإعلامية', 'Media & Interviews Manager')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('إضافة وتعديل الفيديوهات، المقابلات الصحفية، المقالات، وتغطية الصور لوسائل الإعلام والنوادي', 'Add, edit, duplicate & publish press interviews, news features, and visual articles')}</p>
        </div>

        {/* Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة مادة إعلامية', 'ADD NEW MEDIA')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20 animate-fadeIn">
              <button
                onClick={() => handleOpenAddForm('video')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <Video className="w-4 h-4 text-cyan-400" />
                <span>{t('إضافة فيديو مقابلة / تقرير', 'Add Interview Video')}</span>
              </button>

              <button
                onClick={() => handleOpenAddForm('article')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{t('إضافة مقال / تقرير صحفي مكتوب', 'Add Written Article')}</span>
              </button>

              <button
                onClick={() => handleOpenAddForm('image')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>{t('إضافة قصة مصورة فردية', 'Add Photo Story')}</span>
              </button>

              <button
                onClick={() => handleOpenAddForm('gallery')}
                className="w-full px-4 py-3 text-right hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-3 text-xs"
              >
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>{t('إضافة معرض صور متكامل', 'Add Media Gallery')}</span>
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

      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('البحث بالعنوان أو اسم الوسيلة الإعلامية...', 'Search by title or publisher...')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 rtl:pr-9 pr-4 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 shrink-0">{t('النوع:', 'Type:')}</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
          >
            <option value="ALL">{t('جميع الوسائط الإعلامية', 'All Media Types')}</option>
            <option value="video">{t('الفيديوهات والمقابلات المرئية', 'Videos')}</option>
            <option value="article">{t('المقالات والتقارير الصحفية', 'Articles & Press')}</option>
            <option value="image">{t('القصص المصورة المنفردة', 'Photo Stories')}</option>
            <option value="gallery">{t('معارض الصور الإعلامية', 'Galleries')}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 shrink-0">{t('الحالة:', 'Status:')}</span>
          <select
            value={statusFilter}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
          >
            <option value="ALL">{t('الكل', 'All Statuses')}</option>
            <option value="PUBLISHED">{t('منشور فقط', 'Published Only')}</option>
            <option value="DRAFT">{t('مسودة غير منشورة', 'Drafts Only')}</option>
          </select>
        </div>
      </div>

      {/* Media Contents Table/Cards List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
          <h3 className="font-bold text-white text-base mb-1">{t('لا توجد مواد إعلامية مضافة حالياً', 'No media items found')}</h3>
          <p className="text-xs text-slate-500 mb-4">{t('يرجى النقر على زر الإضافة لإضافة مقابلة جديدة للظهور في واجهة اللاعب', 'Click on "Add New Media" to inject TV coverage, interviews, or news features.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const isVideo = item.mediaType === 'video' || item.mediaType === 'interview' || item.mediaType === 'field_interview';
            const isArticle = item.mediaType === 'article' || item.mediaType === 'press';
            const isGallery = item.mediaType === 'gallery';
            
            return (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl relative transition-all"
              >
                
                {/* Media Type Badge */}
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-950/80 text-cyan-400 font-extrabold uppercase text-[10px] tracking-wider z-10 flex items-center gap-1.5 font-latin">
                  {isVideo ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : isArticle ? <FileText className="w-3.5 h-3.5 text-amber-400" /> : <ImageIcon className="w-3.5 h-3.5 text-teal-400" />}
                  <span>{item.mediaType}</span>
                </div>

                <div className="space-y-3">
                  {/* Thumbnail */}
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
                    <span className="text-cyan-400 font-bold">{item.sourceNameEn}</span>
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
                      title={t('تعديل مادة الإعلام', 'Edit')}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                      title={t('تكرار المادة', 'Duplicate')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                      title={t('حذف مادة الإعلام', 'Delete')}
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
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 animate-fadeIn text-xs"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>{editingItem.id.includes('new') ? t('إضافة مادة إعلامية جديدة', 'Add New Media Item') : t('تعديل مادة إعلامية', 'Edit Media Item')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
              
              {/* Basic Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('العنوان بالعربية', 'Arabic Title')}</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.titleAr}
                    onChange={(e) => setEditingItem({ ...editingItem, titleAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('العنوان بالإنجليزية', 'English Title')}</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.titleEn}
                    onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                  />
                </div>
              </div>

              {/* Publisher & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('الناشر / المصدر بالعربية', 'Arabic Publisher')}</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.sourceNameAr}
                    onChange={(e) => setEditingItem({ ...editingItem, sourceNameAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('الناشر / المصدر بالإنجليزية', 'English Publisher')}</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.sourceNameEn}
                    onChange={(e) => setEditingItem({ ...editingItem, sourceNameEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('تاريخ النشر', 'Publication Date')}</label>
                  <input 
                    type="date" 
                    required
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 block">{t('الصورة الرمزية / الغلاف (Thumbnail)', 'Thumbnail Preview Cover')}</span>
                  <button
                    type="button"
                    onClick={() => setShowPickerFor('thumbnail')}
                    className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                  >
                    {t('اختر من المكتبة', 'Choose Photo')}
                  </button>
                </div>
                <div className="flex gap-4 items-center">
                  <img src={editingItem.thumbnailUrl} alt="Thumbnail preview" className="w-24 h-16 rounded-lg object-cover border border-slate-800" />
                  <input 
                    type="url" 
                    required
                    value={editingItem.thumbnailUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
                  />
                </div>
              </div>

              {/* Media Type Specific Fields */}
              {editingItem.mediaType === 'article' ? (
                /* Rich-Text Article Section */
                <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>{t('محرر المقال الصحفي المتكامل (Rich-Text Press Editor)', 'Written Article Content')}</span>
                    </span>

                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      <button type="button" onClick={() => insertRichText('b')} className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertRichText('i')} className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertRichText('h3')} className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white" title="Heading"><Heading className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => insertRichText('p')} className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white" title="Paragraph"><List className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold mb-1">{t('محتوى المقال بالعربية', 'Arabic Content')}</label>
                      <textarea
                        rows={6}
                        value={editingItem.contentAr || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, contentAr: e.target.value })}
                        placeholder="<p>اكتب الفقرات والرموز هنا...</p>"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold mb-1">{t('محتوى المقال بالإنجليزية', 'English Content')}</label>
                      <textarea
                        rows={6}
                        value={editingItem.contentEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, contentEn: e.target.value })}
                        placeholder="<p>Write raw HTML paragraphs here...</p>"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold mb-1">{t('الكاتب / المحرر بالعربية', 'Arabic Author')}</label>
                      <input 
                        type="text" 
                        value={editingItem.authorAr || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, authorAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold mb-1">{t('الكاتب بالإنجليزية', 'English Author')}</label>
                      <input 
                        type="text" 
                        value={editingItem.authorEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, authorEn: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Video / Gallery URLs fields */
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-cyan-400" />
                    <span>{t('رابط المادة الإعلامية (Video / Target URL)', 'Media Target Link')}</span>
                  </label>
                  <input 
                    type="url" 
                    required
                    value={editingItem.url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-latin"
                  />
                </div>
              )}

              {/* Tags & Metadata */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 block flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>{t('الوسوم والتصنيفات (Tags & Keywords)', 'Tags & Keywords')}</span>
                </span>
                
                <div className="flex flex-wrap gap-1.5">
                  {(editingItem.tags || []).map((tVal) => (
                    <span key={tVal} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 flex items-center gap-1 font-latin">
                      <span>{tVal}</span>
                      <button type="button" onClick={() => removeTag(tVal)} className="hover:text-red-400 font-bold">×</button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="new-tag-input"
                    placeholder={t('أضف تصنيف مثل: مقابلة، تلفزيون، هدف', 'Add tag...')}
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200"
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

              {/* Descriptions & Summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('الوصف القصير بالعربية', 'Arabic Description')}</label>
                  <textarea 
                    rows={2}
                    value={editingItem.descriptionAr || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{t('الوصف القصير بالإنجليزية', 'English Description')}</label>
                  <textarea 
                    rows={2}
                    value={editingItem.descriptionEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap items-center gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={editingItem.featured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span>{t('تمييز كعنصر رئيسي في الواجهة (Featured Focus)', 'Featured Spotlight')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input 
                    type="checkbox"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span>{t('نشر المادة الإعلامية فوراً (Publish)', 'Publish Instantly')}</span>
                </label>
              </div>

            </div>

            {/* Form Footer */}
            <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                {t('حفظ ونشر المادة', 'SAVE & PUBLISH MEDIA')}
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                {t('إلغاء', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Internal Picker Overlay */}
      {showPickerFor === 'thumbnail' && (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <MediaPicker
              value={editingItem?.thumbnailUrl}
              onChange={(url) => {
                if (editingItem) setEditingItem({ ...editingItem, thumbnailUrl: url });
                setShowPickerFor(null);
              }}
              onClose={() => setShowPickerFor(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
