import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, Eye, EyeOff, Filter, Search, Star, Trash2, Upload, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePhotos } from '../../context/PhotoContext';
import { createPhoto, deleteAsset, deletePhoto, updatePhoto, uploadImage } from '../../services/photoApi';
import type { PhotoDetails } from '../../services/photoApi';
import type { PhotoItem } from '../../types/player';

const detailsOf = (photo: PhotoItem): PhotoDetails => ({
  assetId: photo.assetId,
  titleAr: photo.titleAr || '',
  titleEn: photo.titleEn || '',
  clubNameAr: photo.clubNameAr || '',
  clubNameEn: photo.clubNameEn || '',
  featured: photo.featured,
  published: photo.published,
  sortOrder: photo.sortOrder,
  focalPoint: photo.focalPoint,
});

export const AdminMediaLibrary: React.FC = () => {
  const { t } = useLanguage();
  const { photos, refreshPhotos } = usePhotos();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [clubName, setClubName] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<PhotoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhotoItem | null>(null);
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  useEffect(() => { void refreshPhotos().catch(() => setError(t('تعذر تحميل الصور.', 'Could not load photos.'))); }, []);
  useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const showError = (reason: unknown) => {
    setError(reason instanceof Error ? reason.message : t('تعذرت العملية.', 'Operation failed.'));
    setMessage('');
  };

  const submitUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true); setError('');
    try {
      const asset = await uploadImage(file);
      try {
        await createPhoto({ assetId: asset.id, titleAr, titleEn, clubNameAr: clubName, clubNameEn: clubName,
          featured, published, sortOrder: photos.length + 1 });
      } catch (reason) {
        await deleteAsset(asset.id).catch(() => {});
        throw reason;
      }
      await refreshPhotos();
      setUploadOpen(false); setFile(null); setTitleAr(''); setTitleEn(''); setClubName('');
      setFeatured(false); setPublished(false);
      setMessage(t('تم حفظ الصورة على القرص وفي قاعدة البيانات.', 'Image saved to disk and database.'));
    } catch (reason) { showError(reason); }
    finally { setBusy(false); }
  };

  const replaceFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const replacement = event.target.files?.[0];
    const target = replaceTarget;
    event.target.value = '';
    if (!replacement || !target?.assetId || busy) return;
    setBusy(true); setError('');
    try {
      const asset = await uploadImage(replacement);
      try { await updatePhoto(target.id, { ...detailsOf(target), assetId: asset.id }); }
      catch (reason) { await deleteAsset(asset.id).catch(() => {}); throw reason; }
      let oldFileRetained = false;
      try { await deleteAsset(target.assetId); }
      catch { oldFileRetained = true; }
      await refreshPhotos();
      setMessage(oldFileRetained
        ? t('تم الاستبدال؛ بقي الملف القديم لأنه مستخدم في موضع آخر.', 'Image replaced; old file retained because it is still in use.')
        : t('تم استبدال الصورة وحذف الملف القديم.', 'Image replaced and old file removed.'));
    } catch (reason) { showError(reason); }
    finally { setReplaceTarget(null); setBusy(false); }
  };

  const saveChange = async (photo: PhotoItem) => {
    setBusy(true); setError('');
    try {
      await updatePhoto(photo.id, detailsOf(photo));
      await refreshPhotos();
      setEditing(null);
      setMessage(t('تم حفظ التعديل.', 'Changes saved.'));
    } catch (reason) { showError(reason); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleteTarget || busy) return;
    setBusy(true); setError('');
    try {
      await deletePhoto(deleteTarget.id);
      await refreshPhotos();
      setDeleteTarget(null);
      setMessage(t('حُذفت الصورة دون وضع بديل.', 'Image deleted without a replacement.'));
    } catch (reason) { showError(reason); }
    finally { setBusy(false); }
  };

  const copy = async (photo: PhotoItem) => {
    await navigator.clipboard.writeText(photo.imageUrl);
    setCopiedId(photo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clubs = Array.from(new Set(photos.map(photo => photo.clubNameAr).filter(Boolean)));
  const filteredPhotos = photos.filter(photo => {
    const query = search.toLowerCase();
    return (!query || [photo.titleAr, photo.titleEn, photo.fileName, photo.clubNameAr]
      .some(value => value?.toLowerCase().includes(query)))
      && (selectedClub === 'ALL' || photo.clubNameAr === selectedClub)
      && (!featuredOnly || photo.featured);
  });

  return <div className="space-y-8">
    <div className="flex items-center justify-between bg-slate-900/60 p-3 px-4 rounded-xl border border-slate-800 text-xs">
      <div className="flex items-center gap-2 text-slate-400"><span>{t('لوحة التحكم', 'Dashboard')}</span><span>/</span><span className="text-white font-bold">{t('مكتبة الوسائط والصور', 'Media & Photo Library')}</span></div>
      <button type="button" onClick={() => (window as any).adminClosePortal?.()} className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:text-red-400 border border-slate-700 text-slate-300 font-bold flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />{t('خروج وإغلاق', 'Exit Admin')}</button>
    </div>

    <input type="file" ref={replaceInput} onChange={event => void replaceFile(event)} accept="image/jpeg,image/png,image/webp" className="hidden" />
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl font-extrabold text-white">{t('مكتبة الوسائط والصور', 'Central Media Library')}</h1><p className="text-xs text-slate-400 mt-1">{t('صور محفوظة على القرص مع بياناتها في MySQL', 'Images stored on disk with MySQL metadata')}</p></div>
      <button onClick={() => setUploadOpen(value => !value)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-cyan-400 font-bold text-xs hover:bg-slate-700 flex items-center gap-2"><Upload className="w-4 h-4" />{t('رفع صورة من الجهاز', 'UPLOAD FROM DEVICE')}</button>
    </div>

    {message && <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center gap-2"><Check className="w-4 h-4" />{message}</div>}
    {error && <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

    {uploadOpen && <form onSubmit={event => void submitUpload(event)} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 text-xs">
      <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3"><Upload className="w-5 h-5" /><h3 className="font-bold text-sm">{t('رفع صورة جديدة من الجهاز', 'UPLOAD NEW IMAGE FROM DEVICE')}</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          <input type="file" ref={uploadInput} onChange={event => setFile(event.target.files?.[0] || null)} accept="image/jpeg,image/png,image/webp" className="hidden" />
          <button type="button" onClick={() => uploadInput.current?.click()} className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            {previewUrl ? <img src={previewUrl} alt={t('معاينة الصورة', 'Image preview')} className="w-full h-full object-contain" /> : <><Upload className="w-8 h-8 text-slate-500 mb-2" /><span className="text-slate-300 font-bold">{t('اختر ملف صورة', 'Choose image file')}</span><span className="text-slate-500 mt-1">JPG, JPEG, PNG, WebP</span></>}
          </button>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-slate-300 font-bold">{t('العنوان بالعربية', 'Arabic title')}<input value={titleAr} onChange={event => setTitleAr(event.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100" /></label>
            <label className="text-slate-300 font-bold">{t('العنوان بالإنجليزية', 'English title')}<input value={titleEn} onChange={event => setTitleEn(event.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100" /></label>
            <label className="text-slate-300 font-bold">{t('اسم النادي', 'Club name')}<input value={clubName} onChange={event => setClubName(event.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100" /></label>
            <div className="space-y-2"><label className="flex gap-2 text-slate-300"><input type="checkbox" checked={featured} onChange={event => setFeatured(event.target.checked)} />{t('مميزة', 'Featured')}</label><label className="flex gap-2 text-slate-300"><input type="checkbox" checked={published} onChange={event => setPublished(event.target.checked)} />{t('منشورة', 'Published')}</label></div>
          </div>
          {file && <p className="text-slate-400">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
          <div className="flex gap-2"><button type="submit" disabled={!file || busy} className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold disabled:opacity-30">{busy ? t('جارٍ الرفع…', 'Uploading…') : t('حفظ وإضافة للمكتبة', 'SAVE TO MEDIA LIBRARY')}</button><button type="button" onClick={() => { setUploadOpen(false); setFile(null); }} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400">{t('إلغاء', 'Cancel')}</button></div>
        </div>
      </div>
    </form>}

    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-center text-xs">
      <div className="relative w-full lg:w-72"><Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('البحث باسم الصورة أو النادي...', 'Search image or club...')} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-100" /></div>
      <div className="flex items-center gap-3"><Filter className="w-4 h-4 text-cyan-400" /><select value={selectedClub} onChange={event => setSelectedClub(event.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"><option value="ALL">{t('جميع الأندية', 'All Clubs')}</option>{clubs.map(name => <option key={name} value={name}>{name}</option>)}</select><label className="text-slate-300 flex gap-2"><input type="checkbox" checked={featuredOnly} onChange={event => setFeaturedOnly(event.target.checked)} />{t('المميزة فقط', 'Featured only')}</label></div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {filteredPhotos.map(photo => <div key={photo.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700/80 flex flex-col justify-between p-4 group">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3"><img src={photo.imageUrl} alt={photo.titleEn || ''} className="w-full h-full object-cover" style={{ objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%` }} />{photo.featured && <Star className="absolute bottom-2 right-2 w-4 h-4 text-amber-400 fill-amber-400" />}</div>
        <div><h4 className="text-xs font-bold text-white truncate">{photo.titleEn || photo.titleAr}</h4><p className="text-[10px] text-slate-400 font-latin truncate mt-0.5">{photo.fileName}</p><p className="text-[10px] text-slate-500 mt-2">{photo.fileSize ? `${(photo.fileSize / 1024).toFixed(0)} KB` : ''}</p></div>
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-3 mt-3 border-t border-slate-800">
          <button onClick={() => void copy(photo)} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400" title="Copy Image URL">{copiedId === photo.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}</button>
          <button onClick={() => { setReplaceTarget(photo); replaceInput.current?.click(); }} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400" title="Upload replacement"><Upload className="w-3.5 h-3.5" /></button>
          <button onClick={() => void saveChange({ ...photo, featured: !photo.featured })} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400" title="Toggle featured"><Star className="w-3.5 h-3.5" /></button>
          <button onClick={() => void saveChange({ ...photo, published: !photo.published })} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400" title="Publish / Unpublish">{photo.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
          <button onClick={() => setEditing(photo)} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs" title="Edit details">{t('تعديل', 'Edit')}</button>
          <button onClick={() => setDeleteTarget(photo)} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-red-400" title="Delete photo"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>)}
    </div>

    {editing && <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-xs"><div className="flex justify-between"><h3 className="font-bold text-white">{t('تعديل بيانات الصورة', 'Edit image details')}</h3><button onClick={() => setEditing(null)}><X className="w-4 h-4" /></button></div><input value={editing.titleAr || ''} onChange={event => setEditing({ ...editing, titleAr: event.target.value })} placeholder={t('العنوان بالعربية', 'Arabic title')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /><input value={editing.titleEn || ''} onChange={event => setEditing({ ...editing, titleEn: event.target.value })} placeholder={t('العنوان بالإنجليزية', 'English title')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" /><button disabled={busy} onClick={() => void saveChange(editing)} className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">{t('حفظ', 'Save')}</button></div></div>}

    {deleteTarget && <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 text-xs"><h3 className="text-base font-bold text-white">{t('تأكيد حذف الصورة', 'Confirm image deletion')}</h3><p className="text-slate-300">{t('ستُزال من المعرض. سيُحذف الملف إذا لم يكن مستخدمًا في مكان آخر.', 'The photo will leave the gallery. Its file will be removed if no other content uses it.')}</p><div className="flex gap-3"><button disabled={busy} onClick={() => void remove()} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold">{t('حذف', 'Delete')}</button><button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300">{t('إلغاء', 'Cancel')}</button></div></div></div>}
  </div>;
};
