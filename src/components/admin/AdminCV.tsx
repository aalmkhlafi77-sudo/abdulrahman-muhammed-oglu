import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Download, ExternalLink, FileText, Trash2, Upload } from 'lucide-react';

interface OfficialCv {
  id: string;
  titleAr: string;
  titleEn: string;
  url: string;
  fileName: string;
  fileSize: number;
  updatedAt: string;
}

const readResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `CV request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
};

export const AdminCV: React.FC = () => {
  const { t } = useLanguage();
  const [document, setDocument] = useState<OfficialCv | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => setDocument(await readResponse(await fetch('/api/documents/cv', { credentials: 'include' }))), []);
  useEffect(() => { void refresh().catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load CV')); }, [refresh]);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      await readResponse(await fetch('/api/documents/cv', { method: 'POST', credentials: 'include', body: form }));
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not upload CV'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm(t('حذف ملف PDF الرسمي؟', 'Delete the official PDF?'))) return;
    setBusy(true);
    setError('');
    try {
      await readResponse(await fetch('/api/documents/cv', { method: 'DELETE', credentials: 'include' }));
      setDocument(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete CV'); }
    finally { setBusy(false); }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">{t('ملف السيرة الذاتية PDF', 'Official CV PDF')}</h1>
        <p className="mt-1 text-xs text-slate-400">{t('إدارة الملف الرسمي المنشور للموقع.', 'Manage the optional published PDF document.')}</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        {document ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FileText className="h-8 w-8 text-cyan-400" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">{document.titleEn}</p>
              <p className="mt-1 text-xs text-slate-400">{document.fileName} · {(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <a href={document.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white"><ExternalLink className="h-4 w-4" />{t('عرض', 'View')}</a>
            <a href={document.url} download="official-cv.pdf" className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white"><Download className="h-4 w-4" />{t('تنزيل', 'Download')}</a>
          </div>
        ) : <p className="text-sm text-slate-400">{t('لا يوجد ملف رسمي مرفوع.', 'No official PDF uploaded.')}</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            <Upload className="h-4 w-4" />{document ? t('استبدال PDF', 'Replace PDF') : t('رفع PDF', 'Upload PDF')}
            <input type="file" accept="application/pdf,.pdf" disabled={busy} className="sr-only" onChange={event => { void upload(event.target.files?.[0]); event.currentTarget.value = ''; }} />
          </label>
          {document && <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-3 text-xs text-red-300 disabled:opacity-50"><Trash2 className="h-4 w-4" />{t('حذف الملف', 'Delete PDF')}</button>}
          {busy && <span className="text-xs text-slate-400">{t('جارٍ التنفيذ...', 'Working...')}</span>}
        </div>
        <p className="text-[11px] text-slate-500">{t('PDF فقط، بحد أقصى 15 MB.', 'PDF only, maximum size 15 MB.')}</p>
      </div>
    </section>
  );
};
