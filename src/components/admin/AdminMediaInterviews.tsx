import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MediaPicker } from '../common/MediaPicker';
import { getAssets } from '../../services/photoApi';
import { createMedia, deleteMedia, getAdminMedia, MediaCategory, MediaInput, MediaItem, updateMedia } from '../../services/mediaApi';
import { Edit, ExternalLink, Eye, EyeOff, Plus, Trash2, Upload } from 'lucide-react';

type EditorState = MediaInput & { id: string | null; coverUrl: string };

const newEditor = (category: MediaCategory, sortOrder: number): EditorState => ({
  id: null, titleAr: '', titleEn: '', category, contentAr: '', contentEn: '', coverAssetId: null,
  coverUrl: '', externalUrl: '', published: false, sortOrder,
});

export const AdminMediaInterviews: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => setItems(await getAdminMedia()), []);
  useEffect(() => { void refresh().catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load media')); }, [refresh]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError('');
    try {
      const { id, coverUrl: _coverUrl, ...payload } = editor;
      if (id) await updateMedia(id, payload);
      else await createMedia(payload);
      await refresh();
      setEditor(null);
      setNotice(t('تم حفظ المادة الإعلامية.', 'Media item saved.'));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save media'); }
    finally { setBusy(false); }
  };

  const togglePublished = async (item: MediaItem) => {
    try {
      const { id, coverUrl: _coverUrl, ...payload } = { ...item, published: !item.published };
      await updateMedia(id, payload);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update media'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('حذف هذه المادة؟', 'Delete this media item?'))) return;
    try { await deleteMedia(id); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete media'); }
  };

  const move = async (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const current = items[index];
    const other = items[target];
    try {
      const currentInput: MediaInput = { ...current, sortOrder: other.sortOrder };
      const otherInput: MediaInput = { ...other, sortOrder: current.sortOrder };
      await Promise.all([updateMedia(current.id, currentInput), updateMedia(other.id, otherInput)]);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not reorder media'); }
  };

  const chooseCover = async (url: string) => {
    if (!editor) return;
    try {
      const assets = await getAssets();
      const asset = assets.find(item => item.imageUrl === url);
      setEditor({ ...editor, coverAssetId: asset?.id ?? null, coverUrl: asset?.imageUrl ?? '' });
      setError(asset ? '' : t('تعذر تحديد أصل الصورة المختارة.', 'Could not identify the selected image asset.'));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not read image library'); }
    setPickerOpen(false);
  };

  const categories: MediaCategory[] = ['interview', 'video', 'article', 'image'];
  const categoryName = (category: MediaCategory) => ({
    interview: t('مقابلة', 'Interview'), video: t('فيديو', 'Video'),
    article: t('مقال', 'Article'), image: t('صورة', 'Image'),
  })[category];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('المقابلات والإعلام', 'Media & Interviews')}</h1>
          <p className="mt-1 text-xs text-slate-400">{t('إدارة المواد المنشورة والمسودات.', 'Manage published media and drafts.')}</p>
        </div>
        <button onClick={() => setEditor(newEditor('interview', items.length + 1))} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950">
          <Plus className="h-4 w-4" />{t('إضافة مادة', 'Add item')}
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{notice}</p>}

      {!items.length ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">{t('لا توجد مواد إعلامية.', 'No media items yet.')}</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center">
              {item.coverUrl && <img src={item.coverUrl} alt="" className="h-20 w-28 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-white">{item.titleAr}</h2>
                  <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-cyan-300">{categoryName(item.category)}</span>
                  <span className={`rounded px-2 py-1 text-[10px] ${item.published ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {item.published ? t('منشور', 'Published') : t('مسودة', 'Draft')}
                  </span>
                </div>
                {item.titleEn && <p className="mt-1 text-xs text-slate-400">{item.titleEn}</p>}
                {item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400"><ExternalLink className="h-3 w-3" />{t('الرابط الخارجي', 'External link')}</a>}
              </div>
              <div className="flex items-center gap-2">
                <button aria-label={t('تحريك لأعلى', 'Move up')} onClick={() => void move(index, -1)} disabled={index === 0} className="rounded-lg bg-slate-950 px-2 py-2 text-slate-300 disabled:opacity-30">↑</button>
                <button aria-label={t('تحريك لأسفل', 'Move down')} onClick={() => void move(index, 1)} disabled={index === items.length - 1} className="rounded-lg bg-slate-950 px-2 py-2 text-slate-300 disabled:opacity-30">↓</button>
                <button onClick={() => void togglePublished(item)} className="rounded-lg bg-slate-950 p-2 text-cyan-300" title={t('تغيير النشر', 'Toggle publish')}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => setEditor({ ...item, coverAssetId: item.coverAssetId })} className="rounded-lg bg-slate-950 p-2 text-slate-200" title={t('تعديل', 'Edit')}><Edit className="h-4 w-4" /></button>
                <button onClick={() => void remove(item.id)} className="rounded-lg bg-slate-950 p-2 text-red-400" title={t('حذف', 'Delete')}><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/90 p-4">
          <form onSubmit={save} className="my-6 max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">{editor.id ? t('تعديل مادة إعلامية', 'Edit media') : t('إضافة مادة إعلامية', 'Add media')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-300">{t('العنوان بالعربية *', 'Arabic title *')}<input required maxLength={255} value={editor.titleAr} onChange={e => setEditor({ ...editor, titleAr: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" /></label>
              <label className="space-y-1 text-xs text-slate-300">{t('العنوان بالإنجليزية', 'English title')}<input maxLength={255} value={editor.titleEn} onChange={e => setEditor({ ...editor, titleEn: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" /></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-300">{t('الفئة', 'Category')}<select value={editor.category} onChange={e => setEditor({ ...editor, category: e.target.value as MediaCategory })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white">{categories.map(category => <option key={category} value={category}>{categoryName(category)}</option>)}</select></label>
              <label className="space-y-1 text-xs text-slate-300">{t('الرابط الخارجي', 'External URL')}<input type="url" maxLength={1000} value={editor.externalUrl} onChange={e => setEditor({ ...editor, externalUrl: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" placeholder="https://" /></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-300">{t('المحتوى بالعربية', 'Arabic content')}<textarea rows={4} maxLength={30000} value={editor.contentAr} onChange={e => setEditor({ ...editor, contentAr: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" /></label>
              <label className="space-y-1 text-xs text-slate-300">{t('المحتوى بالإنجليزية', 'English content')}<textarea rows={4} maxLength={30000} value={editor.contentEn} onChange={e => setEditor({ ...editor, contentEn: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" /></label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {editor.coverUrl && <img src={editor.coverUrl} alt="" className="h-14 w-20 rounded object-cover" />}
              <button type="button" onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200"><Upload className="h-4 w-4" />{t('اختيار غلاف', 'Choose cover')}</button>
              {editor.coverAssetId && <button type="button" onClick={() => setEditor({ ...editor, coverAssetId: null, coverUrl: '' })} className="text-xs text-red-300">{t('إزالة الغلاف', 'Remove cover')}</button>}
              <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={editor.published} onChange={e => setEditor({ ...editor, published: e.target.checked })} />{t('منشور', 'Published')}</label>
              <label className="flex items-center gap-2 text-xs text-slate-300">{t('الترتيب', 'Order')}<input type="number" min="0" value={editor.sortOrder} onChange={e => setEditor({ ...editor, sortOrder: Number(e.target.value) })} className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white" /></label>
            </div>
            <div className="flex gap-3 border-t border-slate-800 pt-4">
              <button disabled={busy} type="submit" className="flex-1 rounded-lg bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950 disabled:opacity-50">{t('حفظ', 'Save')}</button>
              <button type="button" onClick={() => setEditor(null)} className="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-xs text-white">{t('إلغاء', 'Cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-2xl"><MediaPicker value={editor?.coverUrl} onChange={url => void chooseCover(url)} onClose={() => setPickerOpen(false)} title={t('اختيار صورة الغلاف', 'Choose cover image')} /></div>
        </div>
      )}
    </div>
  );
};
