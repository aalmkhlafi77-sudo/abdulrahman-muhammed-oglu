import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, compressImage, parseDriveUrl } from '../../services/dataService';
import { PhotoItem } from '../../types/player';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Search, X } from 'lucide-react';

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
  onClose?: () => void;
  title?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  value = '',
  onChange,
  onClose,
  title
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'url'>('upload');
  
  // Device Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Library state
  const [photos] = useState<PhotoItem[]>(DataService.getPhotos());
  const [searchQuery, setSearchQuery] = useState('');

  // URL State
  const [inputUrl, setInputUrl] = useState(value);

  // File Upload Handler
  const handleFileChange = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawData = e.target?.result as string;
      const compressed = await compressImage(rawData, 1200, 0.82);

      // Register into Media Library
      const newPhotoItem: PhotoItem = {
        id: `upload-${Date.now()}`,
        fileName: file.name,
        originalFileName: file.name,
        titleAr: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        titleEn: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        imageUrl: compressed,
        sourceType: 'upload',
        featured: false,
        published: true,
        sortOrder: photos.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updated = [newPhotoItem, ...photos];
      DataService.updatePhotos(updated);

      onChange(compressed);
      setUploading(false);
      if (onClose) onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    let finalUrl = inputUrl.trim();
    if (finalUrl.includes('drive.google.com')) {
      finalUrl = parseDriveUrl(finalUrl).directUrl;
    }
    onChange(finalUrl);
    if (onClose) onClose();
  };

  const filteredPhotos = photos.filter(p => 
    p.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.titleAr?.includes(searchQuery) ||
    p.clubNameAr?.includes(searchQuery)
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 w-full space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2 font-latin">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          <span>{title || t('اختر أو ارفع صورة', 'Select or Upload Image')}</span>
        </h3>
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-1 sm:gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'upload' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{t('رفع من الجهاز', 'Device Upload')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'library' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{t('مكتبة الوسائط', 'Media Library')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'url' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>{t('رابط خارجي / Drive', 'External URL')}</span>
        </button>
      </div>

      {/* Tab 1: Upload from Device */}
      {activeTab === 'upload' && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
          }`}
        >
          <input 
            type="file" 
            accept="image/*"
            id="media-picker-file-input"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          <label htmlFor="media-picker-file-input" className="cursor-pointer block space-y-3">
            <Upload className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
            <div className="space-y-1">
              <p className="font-bold text-xs sm:text-sm text-slate-200">
                {uploading ? t('جاري معالجة وتصغير الصورة...', 'Compressing and processing...') : t('انقر أو اسحب ملف الصورة هنا للرفع', 'Click or drag image file here to upload')}
              </p>
              <p className="text-[11px] text-slate-500 font-latin">Supports JPG, PNG, WEBP, AVIF (Auto compressed)</p>
            </div>
          </label>
        </div>
      )}

      {/* Tab 2: Select from Media Library */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('البحث في المكتبة...', 'Search library...')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 rtl:pr-9 pr-4 py-2 text-xs text-slate-200"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
            {filteredPhotos.map((photo) => {
              const isSelected = value === photo.imageUrl;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    onChange(photo.imageUrl);
                    if (onClose) onClose();
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={photo.imageUrl} alt={photo.titleEn} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-slate-950 bg-cyan-400 rounded-full p-0.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: URL / Google Drive */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('رابط الصورة المباشر أو Google Drive', 'Direct Image or Google Drive URL')}</label>
            <input 
              type="url" 
              required
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-latin"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
          >
            {t('تطبيق الرابط', 'Apply URL')}
          </button>
        </form>
      )}
    </div>
  );
};
