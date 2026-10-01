import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataService, parseDriveUrl, compressImage } from '../../services/dataService';
import { PhotoItem } from '../../types/player';
import { 
  Upload, 
  Link, 
  Image as ImageIcon, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  ZoomIn, 
  RefreshCw, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  Crop, 
  Maximize,
  AlertCircle
} from 'lucide-react';

interface ImagePickerProps {
  label: string;
  currentValue?: string; // Current image URL
  currentFocalPoint?: { x: number; y: number };
  onSelect: (photoData: { 
    imageUrl: string; 
    focalPoint?: { x: number; y: number };
    fileName?: string;
    originalFileName?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
  }) => void;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9' | 'free';
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ 
  label, 
  currentValue = '', 
  currentFocalPoint = { x: 50, y: 50 }, 
  onSelect,
  aspectRatio = 'free'
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('library');
  const [previewUrl, setPreviewUrl] = useState<string>(currentValue);
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>(currentFocalPoint);
  
  // Transform States
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [cropRatio, setCropRatio] = useState<string>(aspectRatio);

  // URL Tab
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState(false);

  // Library Tab
  const [libraryPhotos, setLibraryPhotos] = useState<PhotoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('ALL');

  // Multi-format upload file variables
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLibraryPhotos(DataService.getPhotos());
  }, [activeTab]);

  // Read dimensions of selected / uploaded image dynamically
  const fetchImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 800 });
      };
      img.src = url;
    });
  };

  // 1. Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      
      // Compress immediately to prevent quota limits (Requirement #15 & #16)
      const dataUrl = await compressImage(rawDataUrl);
      
      setPreviewUrl(dataUrl);
      const dims = await fetchImageDimensions(dataUrl);

      onSelect({
        imageUrl: dataUrl,
        fileName: file.name,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        width: dims.width,
        height: dims.height,
        focalPoint: focalPoint
      });
    };
    reader.readAsDataURL(file);
  };

  // 2. URL Handler
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    let resolvedUrl = urlInput;
    if (urlInput.includes('drive.google.com')) {
      resolvedUrl = parseDriveUrl(urlInput).directUrl;
    }

    // Basic URL validation
    if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://') && !resolvedUrl.startsWith('data:image')) {
      setUrlError(true);
      return;
    }

    setUrlError(false);
    setPreviewUrl(resolvedUrl);
    const dims = await fetchImageDimensions(resolvedUrl);

    onSelect({
      imageUrl: resolvedUrl,
      fileName: 'url_imported_asset.jpg',
      originalFileName: 'url_imported_asset.jpg',
      width: dims.width,
      height: dims.height,
      focalPoint: focalPoint
    });
  };

  // 3. Media Library Handler
  const handleSelectFromLibrary = (photo: PhotoItem) => {
    setPreviewUrl(photo.imageUrl);
    setFocalPoint(photo.focalPoint || { x: 50, y: 50 });
    onSelect({
      imageUrl: photo.imageUrl,
      fileName: photo.fileName || 'library_asset.jpg',
      originalFileName: photo.originalFileName || 'library_asset.jpg',
      focalPoint: photo.focalPoint || { x: 50, y: 50 },
      width: photo.width,
      height: photo.height
    });
  };

  // Focal Point Handler
  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const newFPoint = { x, y };
    setFocalPoint(newFPoint);
    onSelect({
      imageUrl: previewUrl,
      focalPoint: newFPoint
    });
  };

  const resetTransforms = () => {
    setRotation(0);
    setZoom(1);
    setFlipH(false);
    setFlipV(false);
  };

  // Get filtered library photos
  const clubs = Array.from(new Set(libraryPhotos.map(p => p.clubNameAr))).filter(Boolean);
  const filteredLibrary = libraryPhotos.filter(p => {
    const matchesSearch = p.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) || p.clubNameAr?.includes(searchQuery);
    const matchesClub = selectedClub === 'ALL' || p.clubNameAr === selectedClub;
    return matchesSearch && matchesClub;
  });

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-sm font-bold text-white uppercase tracking-wider font-latin">{label}</span>
        <span className="text-[10px] text-cyan-400 font-bold font-latin">UNIFIED MEDIA PICKER</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'library' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{t('مكتبة الوسائط', 'Media Library')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'upload' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t('رفع من الجهاز', 'Upload')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'url' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>{t('إضافة رابط', 'URL')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 transition-colors group"
          >
            <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-slate-300">{t('اسحب وألقِ الصورة هنا أو انقر للتصفح', 'Drag & drop image here, or click to browse')}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-latin">Supports JPG, PNG, WebP, AVIF up to 10MB</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}

      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-latin"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-cyan-500 text-cyan-400 rounded-xl text-xs font-bold transition-colors"
            >
              {t('جلب الصورة', 'Fetch')}
            </button>
          </div>
          {urlError && (
            <p className="text-[11px] text-red-400 flex items-center gap-1.5 font-latin">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Please enter a valid HTTP/HTTPS image URL</span>
            </p>
          )}
        </form>
      )}

      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('البحث باسم الصورة أو النادي...', 'Search by title or club...')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100"
              />
            </div>

            <select
              value={selectedClub}
              onChange={e => setSelectedClub(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
            >
              <option value="ALL">{t('جميع الأندية', 'All Clubs')}</option>
              {clubs.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto no-scrollbar border border-slate-800 p-2 rounded-xl bg-slate-950/40">
            {filteredLibrary.map((photo) => (
              <div 
                key={photo.id}
                onClick={() => handleSelectFromLibrary(photo)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border hover:border-cyan-500 transition-colors ${
                  previewUrl === photo.imageUrl ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800'
                }`}
              >
                <img src={photo.imageUrl} alt="Library Item" className="w-full h-full object-cover" />
                {previewUrl === photo.imageUrl && (
                  <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-cyan-400 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor & Focal Point Live Preview */}
      {previewUrl && (
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <span className="text-xs font-bold text-slate-300 block">{t('معاينة وتحديد نقطة التركيز (Focal Point Editor)', 'Live Preview & Focal Point Selection')}</span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Visual Canvas Area */}
            <div className="md:col-span-8 flex flex-col items-center">
              <div 
                ref={previewContainerRef}
                onClick={handleFocalPointClick}
                className="relative overflow-hidden rounded-xl border border-slate-800 cursor-crosshair bg-slate-950 max-h-72 aspect-video w-full flex items-center justify-center group"
              >
                <img 
                  src={previewUrl} 
                  alt="Editor Canvas Preview" 
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom}) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    transition: 'transform 0.20s ease'
                  }}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />

                {/* Focal Point Indicator (Visually overlaid target) */}
                <div 
                  className="absolute w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-500/30 shadow-lg pointer-events-none"
                  style={{
                    left: `calc(${focalPoint.x}% - 16px)`,
                    top: `calc(${focalPoint.y}% - 16px)`,
                    transition: 'left 0.15s ease, top 0.15s ease'
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>

                {/* Micro Hint */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-slate-950/80 text-[10px] text-slate-400">
                  {t('انقر على الصورة لتحديد رأس أو وجه اللاعب', 'Click to set focal target (e.g. player face)')} ({focalPoint.x}%, {focalPoint.y}%)
                </div>
              </div>
            </div>

            {/* Transform Controls Sidebar */}
            <div className="md:col-span-4 flex flex-col gap-3 justify-center text-xs">
              
              {/* Zoom Slider */}
              <div>
                <div className="flex justify-between mb-1 text-slate-400 font-latin">
                  <span>Zoom / Scale</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.1"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950"
                />
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRotation(r => r - 90)}
                  className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRotation(r => r + 90)}
                  className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>

              <button
                type="button"
                onClick={resetTransforms}
                className="w-full mt-1 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('إعادة ضبط التحويلات', 'Reset Transforms')}</span>
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
