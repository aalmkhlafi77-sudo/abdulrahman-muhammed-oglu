import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import type { Achievement } from '../../types/player';
import { Plus, Save, Trash2 } from 'lucide-react';

const emptyAchievement = (): Achievement => ({ id: `draft-${Date.now()}`, titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', priority: 0, featured: false });

export const AdminAchievements: React.FC = () => {
  const { t } = useLanguage();
  const { achievements, setAchievements } = useStructuredContent();
  const [draft, setDraft] = useState<Achievement | null>(null);
  const [error, setError] = useState('');
  const save = async () => {
    if (!draft?.titleAr.trim() || !draft.titleEn.trim()) { setError(t('أدخل العنوان بالعربية والإنجليزية.', 'Enter both Arabic and English titles.')); return; }
    const isNew = draft.id.startsWith('draft-');
    const response = await fetch(isNew ? '/api/achievements' : `/api/achievements/${draft.id}`, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Save failed'); return; }
    setAchievements(current => isNew ? [...current, result] : current.map(item => item.id === draft.id ? result : item)); setDraft(result); setError('');
  };
  const remove = async (item: Achievement) => {
    if (!window.confirm(t('حذف هذا الإنجاز؟', 'Delete this achievement?'))) return;
    const response = await fetch(`/api/achievements/${item.id}`, { method: 'DELETE' });
    if (response.ok) { setAchievements(current => current.filter(row => row.id !== item.id)); if (draft?.id === item.id) setDraft(null); }
    else setError(t('تعذر الحذف.', 'Delete failed.'));
  };
  const field = (label: string, key: 'titleAr' | 'titleEn' | 'descriptionAr' | 'descriptionEn') => <label className="block text-xs text-slate-300">{label}<input value={draft?.[key] || ''} onChange={event => setDraft(current => current ? { ...current, [key]: event.target.value } : current)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label>;
  return <div className="space-y-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold text-white">{t('إدارة الإنجازات', 'Achievements')}</h1><button onClick={() => setDraft(emptyAchievement())} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"><Plus className="inline w-4 h-4 mr-1" />{t('إضافة إنجاز', 'Add achievement')}</button></div>{error && <p role="alert" className="text-sm text-red-400">{error}</p>}<div className="grid gap-3">{achievements.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"><button onClick={() => setDraft(item)} className="text-left text-sm text-white">{item.titleEn}<span className="block text-xs text-slate-400">{item.titleAr}</span></button><button onClick={() => void remove(item)} className="text-red-400"><Trash2 className="w-4 h-4" /></button></div>)}</div>{draft && <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">{field(t('العنوان بالعربية', 'Arabic title'), 'titleAr')}{field(t('العنوان بالإنجليزية', 'English title'), 'titleEn')}{field(t('الوصف بالعربية', 'Arabic description'), 'descriptionAr')}{field(t('الوصف بالإنجليزية', 'English description'), 'descriptionEn')}<label className="block text-xs text-slate-300">{t('الموسم أو السنة', 'Season or year')}<input value={draft.season || ''} onChange={event => setDraft({ ...draft, season: event.target.value })} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label><label className="block text-xs text-slate-300">{t('ترتيب العرض', 'Display order')}<input type="number" value={draft.priority} onChange={event => setDraft({ ...draft, priority: Number(event.target.value), sortOrder: Number(event.target.value) })} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label><label className="flex gap-2 text-sm text-slate-300"><input type="checkbox" checked={draft.featured} onChange={event => setDraft({ ...draft, featured: event.target.checked })} />{t('مميز', 'Featured')}</label><button onClick={() => void save()} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"><Save className="inline w-4 h-4 mr-1" />{t('حفظ', 'Save')}</button></div>}</div>;
};
