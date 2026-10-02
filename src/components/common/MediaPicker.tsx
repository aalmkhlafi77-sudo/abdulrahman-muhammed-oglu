import React, { useEffect, useId, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getAssets, uploadImage } from '../../services/photoApi';
import type { UploadedAsset } from '../../services/photoApi';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Search, X } from 'lucide-react';

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
  onClose?: () => void;
  title?: string;
  allowExternalUrl?: boolean;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  value = '',
  onChange,
  onClose,
  title,
  allowExternalUrl = true,
}) => {
  const { t, lang } = useLanguage();
  const fileInputId = useId();
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputUrl, setInputUrl] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!allowExternalUrl && activeTab === 'url') setActiveTab('upload');
  }, [allowExternalUrl, activeTab]);

  useEffect(() => {
    let active = true;
    setLoadingAssets(true);
    getAssets()
      .then(items => { if (active) setAssets(items); })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : t('تعذر تحميل مكتبة الصور.', 'Could not load image library.'));
      })
      .finally(() => { if (active) setLoadingAssets(false); });
    return () => { active = false; };
  }, [lang]);

  const handleFileChange = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t('يُسمح فقط بصور JPG وPNG وWebP.', 'Only JPG, PNG, and WebP images are allowed.'));
      return;
    }

    setUploading(true);
    setError('');
    try {
      const asset = await uploadImage(file);
      setAssets(current => [asset, ...current.filter(item => item.id !== asset.id)]);
      onChange(asset.imageUrl);
      if (onClose) onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('تعذر رفع الصورة.', 'Could not upload image.'));
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    onChange(inputUrl.trim());
    if (onClose) onClose();
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredAssets = assets.filter(asset =>
    asset.fileName.toLowerCase().includes(normalizedSearch) || asset.mimeType.toLowerCase().includes(normalizedSearch)
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

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

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

        {allowExternalUrl && (
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>{t('رابط خارجي', 'External URL')}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Upload from Device */}
      {activeTab === 'upload' && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) void handleFileChange(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
          }`}
        >
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp"
            id={fileInputId}
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) void handleFileChange(e.target.files[0]); }}
          />
          <label htmlFor={fileInputId} className="cursor-pointer block space-y-3">
            <Upload className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
            <div className="space-y-1">
              <p className="font-bold text-xs sm:text-sm text-slate-200">
                {uploading ? t('جاري رفع الصورة...', 'Uploading image...') : t('انقر أو اسحب ملف الصورة هنا للرفع', 'Click or drag image file here to upload')}
              </p>
              <p className="text-[11px] text-slate-500 font-latin">JPG, JPEG, PNG, WebP</p>
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
            {loadingAssets && (
              <p className="col-span-full p-4 text-center text-xs text-slate-500">{t('جاري تحميل المكتبة...', 'Loading library...')}</p>
            )}
            {!loadingAssets && filteredAssets.length === 0 && (
              <p className="col-span-full p-4 text-center text-xs text-slate-500">{t('لا توجد صور مرفوعة.', 'No uploaded images.')}</p>
            )}
            {filteredAssets.map((asset) => {
              const isSelected = value === asset.imageUrl;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onChange(asset.imageUrl);
                    if (onClose) onClose();
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={asset.imageUrl} alt={asset.fileName} className="w-full h-full object-cover" />
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

      {/* Tab 3: External URL */}
      {allowExternalUrl && activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('رابط صورة مباشر', 'Direct Image URL')}</label>
            <input 
              type="url" 
              required
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
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
