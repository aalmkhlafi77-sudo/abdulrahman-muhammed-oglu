import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { VideoHighlight, VideoCategory } from '../../types/player';
import { ImagePicker } from './ImagePicker';
import { MediaCover } from '../common/MediaCover';
import { Plus, Trash2, Edit, Star } from 'lucide-react';

export const AdminVideos: React.FC = () => {
  const { t } = useLanguage();
  const { videos, setVideos } = useStructuredContent();
  const [editingVideo, setEditingVideo] = useState<VideoHighlight | null>(null);
  const [error, setError] = useState('');

  const deleteVideo = (id: string) => {
    if (window.confirm(t('حذف هذا الفيديو من المكتبة؟', 'Delete video from library?'))) {
      void fetch(`/api/videos/${id}`, { method: 'DELETE' }).then(response => {
        if (!response.ok) throw new Error('Delete failed');
        setVideos(current => current.filter(v => v.id !== id));
      }).catch(() => setError(t('تعذر حذف الفيديو.', 'Could not delete video.')));
    }
  };

  const addVideo = () => {
    const newVid: VideoHighlight = {
      id: `draft-${Date.now()}`,
      titleAr: '',
      titleEn: '',
      category: 'HIGHLIGHTS',
      duration: '',
      videoSourceType: 'external',
      videoUrl: '',
      thumbnailUrl: '',
      featured: false,
      published: false,
      sortOrder: videos.length + 1
    };
    setVideos(current => [newVid, ...current]);
    setEditingVideo(newVid);
  };

  const updateCurrentEdit = (field: keyof VideoHighlight, value: any) => {
    if (!editingVideo) return;

    let updated = { ...editingVideo, [field]: value };

    // Auto-detect drive link format
    if (field === 'videoUrl' && value.includes('drive.google.com')) {
      updated.videoSourceType = 'drive';
    }

    setEditingVideo(updated);
    setVideos(current => current.map(v => v.id === updated.id ? updated : v));
  };

  const saveVideo = async () => {
    if (!editingVideo?.titleAr.trim() || !editingVideo.titleEn.trim() || !editingVideo.videoUrl.trim()) {
      setError(t('أدخل العنوانين ورابط الفيديو.', 'Enter both titles and a video URL.'));
      return;
    }
    const isNew = editingVideo.id.startsWith('draft-');
    const response = await fetch(isNew ? '/api/videos' : `/api/videos/${editingVideo.id}`, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingVideo) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Save failed'); return; }
    setVideos(current => current.map(item => item.id === editingVideo.id ? result : item)); setEditingVideo(result); setError('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('إدارة مكتبة الفيديوهات', 'Video Highlights Manager')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('دعم الروابط المباشرة وتخصيص الصور المصغرة بالـ ImagePicker الموحد', 'Manage Google Drive / YouTube links & select thumbnails via unified ImagePicker')}</p>
        </div>

        <button
          onClick={addVideo}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة فيديو جديد', 'ADD NEW VIDEO')}</span>
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <div key={vid.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 space-y-3 p-4 flex flex-col justify-between">
            
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
              <MediaCover category="video" coverUrl={vid.thumbnailUrl} alt={vid.titleEn} className="absolute inset-0" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-cyan-400 text-[10px] font-extrabold font-latin">
                {vid.category}
              </span>
              {vid.featured && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold font-latin">
                  FEATURED
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1">{vid.titleEn}</h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-latin">{vid.videoUrl}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingVideo(editingVideo?.id === vid.id ? null : vid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  editingVideo?.id === vid.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                }`}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{editingVideo?.id === vid.id ? t('إغلاق التعديل', 'Close Edit') : t('تعديل الفيديو والرمز', 'Edit Details')}</span>
              </button>

              <button
                onClick={() => deleteVideo(vid.id)}
                className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Inline Editor with ImagePicker for Thumbnail */}
            {editingVideo?.id === vid.id && (
              <div className="pt-4 border-t border-slate-800 space-y-4 text-xs animate-fadeIn">
                
                <ImagePicker 
                  label={t('الصورة المصغرة للفيديو (Video Thumbnail)', 'Video Thumbnail')}
                  currentValue={editingVideo.thumbnailUrl}
                  onSelect={({ imageUrl }) => updateCurrentEdit('thumbnailUrl', imageUrl)}
                  aspectRatio="16:9"
                />

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t('عنوان الفيديو (English)', 'Title (English)')}</label>
                  <input 
                    type="text" 
                    value={editingVideo.titleEn}
                    onChange={e => updateCurrentEdit('titleEn', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-latin"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t('العنوان بالعربية', 'Title (Arabic)')}</label>
                  <input type="text" value={editingVideo.titleAr} onChange={e => updateCurrentEdit('titleAr', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100" />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t('رابط الفيديو (Google Drive / YouTube / MP4)', 'Video URL')}</label>
                  <input 
                    type="text" 
                    value={editingVideo.videoUrl}
                    onChange={e => updateCurrentEdit('videoUrl', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-latin"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t('التصنيف', 'Category')}</label>
                    <select
                      value={editingVideo.category}
                      onChange={e => updateCurrentEdit('category', e.target.value as VideoCategory)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-latin"
                    >
                      <option value="HIGHLIGHTS">HIGHLIGHTS</option>
                      <option value="GOALS">GOALS</option>
                      <option value="ASSISTS">ASSISTS</option>
                      <option value="SKILLS">SKILLS</option>
                      <option value="MATCHES">MATCHES</option>
                      <option value="INTERVIEWS">INTERVIEWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t('المدة', 'Duration')}</label>
                    <input 
                      type="text" 
                      value={editingVideo.duration || ''}
                      onChange={e => updateCurrentEdit('duration', e.target.value)}
                      placeholder="04:32"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-latin"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id={`featured-${vid.id}`}
                    checked={editingVideo.featured}
                    onChange={e => updateCurrentEdit('featured', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800"
                  />
                      <label htmlFor={`featured-${vid.id}`} className="text-amber-400 font-bold">{t('تمييز الفيديو', 'Feature video')}</label>
                </div>
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={editingVideo.published} onChange={e => updateCurrentEdit('published', e.target.checked)} className="rounded bg-slate-950 border-slate-800" />
                  {t('نشر الفيديو للعامة', 'Publish video publicly')}
                </label>
                <button onClick={() => void saveVideo()} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold">{t('حفظ الفيديو', 'Save video')}</button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};
