import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import type { PerformanceStat } from '../../types/player';
import { Plus, Save, Trash2 } from 'lucide-react';

const metricKeys = ['matches', 'goals', 'assists', 'minutes', 'starts', 'substitutes', 'yellowCards', 'redCards'] as const;
const labels: Record<(typeof metricKeys)[number], string> = { matches: 'Matches', goals: 'Goals', assists: 'Assists', minutes: 'Minutes', starts: 'Starts', substitutes: 'Substitutes', yellowCards: 'Yellow cards', redCards: 'Red cards' };
export const AdminStats: React.FC = () => {
  const { t } = useLanguage();
  const { stats, setStats } = useStructuredContent();
  const [draft, setDraft] = useState<PerformanceStat | null>(null);
  const [error, setError] = useState('');
  const save = async () => {
    if (!draft || !metricKeys.some(key => typeof draft[key] === 'number')) { setError(t('أدخل إحصائية موثقة واحدة على الأقل.', 'Enter at least one documented metric.')); return; }
    const isNew = draft.id.startsWith('draft-');
    const response = await fetch(isNew ? '/api/stats' : `/api/stats/${draft.id}`, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Save failed'); return; }
    setStats(current => isNew ? [...current, result] : current.map(item => item.id === draft.id ? result : item)); setDraft(result); setError('');
  };
  const remove = async (item: PerformanceStat) => {
    if (!window.confirm(t('حذف هذه الإحصائية؟', 'Delete these stats?'))) return;
    const response = await fetch(`/api/stats/${item.id}`, { method: 'DELETE' });
    if (response.ok) { setStats(current => current.filter(row => row.id !== item.id)); if (draft?.id === item.id) setDraft(null); } else setError(t('تعذر الحذف.', 'Delete failed.'));
  };
  return <div className="space-y-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold text-white">{t('إدارة الإحصائيات', 'Performance Stats')}</h1><button onClick={() => setDraft({ id: `draft-${Date.now()}` })} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"><Plus className="inline w-4 h-4 mr-1" />{t('إضافة إحصائية', 'Add stats')}</button></div>{error && <p role="alert" className="text-sm text-red-400">{error}</p>}<div className="grid gap-3">{stats.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"><button onClick={() => setDraft(item)} className="text-left text-sm text-white">{item.clubNameEn || item.season || item.clubNameAr || item.id}: {metricKeys.filter(key => typeof item[key] === 'number').map(key => `${labels[key]}: ${item[key]}`).join(' · ')}</button><button onClick={() => void remove(item)} className="text-red-400"><Trash2 className="w-4 h-4" /></button></div>)}</div>{draft && <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5"><label className="text-xs text-slate-300">{t('اسم النادي (عربي)', 'Club name (Arabic)')}<input value={draft.clubNameAr || ''} onChange={event => setDraft(current => current ? { ...current, clubNameAr: event.target.value } : current)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label><label className="text-xs text-slate-300">{t('اسم النادي (إنجليزي)', 'Club name (English)')}<input value={draft.clubNameEn || ''} onChange={event => setDraft(current => current ? { ...current, clubNameEn: event.target.value } : current)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label><label className="text-xs text-slate-300">{t('الموسم', 'Season')}<input value={draft.season || ''} onChange={event => setDraft(current => current ? { ...current, season: event.target.value } : current)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label>{metricKeys.map(key => <label key={key} className="text-xs text-slate-300">{labels[key]}<input type="number" min="0" value={draft[key] ?? ''} onChange={event => setDraft(current => current ? { ...current, [key]: event.target.value === '' ? undefined : Number(event.target.value) } : current)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" /></label>)}<button onClick={() => void save()} className="col-span-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"><Save className="inline w-4 h-4 mr-1" />{t('حفظ', 'Save')}</button></div>}</div>;
};
