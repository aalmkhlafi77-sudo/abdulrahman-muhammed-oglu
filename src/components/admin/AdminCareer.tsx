import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStructuredContent } from '../../context/StructuredContentContext';
import { ClubExperience } from '../../types/player';
import { ImagePicker } from './ImagePicker';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Edit, Check, Link, Landmark } from 'lucide-react';

export const AdminCareer: React.FC = () => {
  const { t } = useLanguage();
  const { career: clubs, setCareer } = useStructuredContent();
  const [editingClub, setEditingClub] = useState<ClubExperience | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveAll = (updated: ClubExperience[]) => {
    setCareer(updated);
  };

  const moveClub = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clubs.length) return;

    const newClubs = [...clubs];
    const temp = newClubs[index];
    newClubs[index] = newClubs[targetIndex];
    newClubs[targetIndex] = temp;

    // re-index sortOrder
    const reordered = newClubs.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    saveAll(reordered);
    void Promise.all(reordered.filter(item => item.careerEntryId).map(item => fetch(`/api/career/${item.careerEntryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })));
  };

  const deleteClub = (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذا النادي؟', 'Are you sure you want to delete this club?'))) {
      const club = clubs.find(item => item.id === id);
      if (!club?.careerEntryId) { saveAll(clubs.filter(c => c.id !== id)); return; }
      void fetch(`/api/career/${club.careerEntryId}`, { method: 'DELETE' }).then(async response => {
        if (!response.ok) throw new Error('Delete failed');
        saveAll(clubs.filter(c => c.id !== id));
      }).catch(() => setError(t('تعذر حذف المحطة.', 'Could not delete this entry.')));
    }
  };

  const addClub = () => {
    const newClub: ClubExperience = {
      id: `draft-${Date.now()}`,
      clubNameAr: '',
      clubNameEn: '',
      countryAr: '',
      countryEn: '',
      levelAr: '',
      levelEn: '',
      durationAr: '',
      durationEn: '',
      logoUrl: '',
      coverImageUrl: '',
      galleryUrls: [],
      sortOrder: clubs.length + 1
    };
    saveAll([...clubs, newClub]);
    setEditingClub(newClub);
  };

  const updateCurrentEdit = (field: keyof ClubExperience, value: any) => {
    if (!editingClub) return;
    const updated = { ...editingClub, [field]: value };
    setEditingClub(updated);
    saveAll(clubs.map(c => c.id === updated.id ? updated : c));
  };

  const saveCurrentEdit = async () => {
    if (!editingClub?.clubNameAr.trim() || !editingClub.clubNameEn.trim()) {
      setError(t('أدخل اسم النادي بالعربية والإنجليزية.', 'Enter the club name in Arabic and English.'));
      return;
    }
    setSaving(true); setError('');
    try {
      const isNew = !editingClub.careerEntryId;
      const response = await fetch(isNew ? '/api/career' : `/api/career/${editingClub.careerEntryId}`, {
        method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingClub),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Save failed');
      saveAll(clubs.map(item => item.id === editingClub.id ? result as ClubExperience : item));
      setEditingClub(result as ClubExperience);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('تعذر الحفظ.', 'Save failed.'));
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('إدارة مسيرة الأندية الرياضية', 'Career & Clubs Manager')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('إضافة وتعديل الأندية، رفع الشعارات، وتغطيات غلاف النادي', 'Add, edit, reorder & upload crest logos & covers for each club')}</p>
        </div>

        <button
          onClick={addClub}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة نادي جديد', 'ADD NEW CLUB')}</span>
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {/* List of Clubs */}
      <div className="space-y-6">
        {clubs.map((club, index) => (
          <div key={club.id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {club.logoUrl ? (
                  <img src={club.logoUrl} alt="Crest" className="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Landmark className="w-6 h-6" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-cyan-400 font-latin">0{index + 1}</span>
                    {club.durationEn && <span className="text-[10px] text-slate-500 font-latin">· {club.durationEn}</span>}
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {club.clubNameEn} ({club.clubNameAr})
                  </h3>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveClub(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 hover:text-cyan-400"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  onClick={() => moveClub(index, 'down')}
                  disabled={index === clubs.length - 1}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 hover:text-cyan-400"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setEditingClub(editingClub?.id === club.id ? null : club)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    editingClub?.id === club.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{editingClub?.id === club.id ? t('إغلاق', 'Close') : t('تعديل النادي والصور', 'Edit Details')}</span>
                </button>

                <button
                  onClick={() => deleteClub(club.id)}
                  className="p-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editing Panel inside Card */}
            {editingClub?.id === club.id && (
              <div className="pt-6 border-t border-slate-800 space-y-6 animate-fadeIn">
                
                {/* Crest and Cover picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImagePicker 
                    label={t('شعار النادي (Club Crest / Logo)', 'Club Crest / Logo')}
                    currentValue={editingClub.logoUrl || ''}
                    onSelect={({ imageUrl }) => updateCurrentEdit('logoUrl', imageUrl)}
                    aspectRatio="1:1"
                  />

                  <ImagePicker 
                    label={t('صورة غلاف النادي (Club Cover)', 'Club Cover Background')}
                    currentValue={editingClub.coverImageUrl || ''}
                    onSelect={({ imageUrl }) => updateCurrentEdit('coverImageUrl', imageUrl)}
                    aspectRatio="16:9"
                  />
                </div>

                {/* Text fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('اسم النادي بالعربية', 'Club Name (Arabic)')}</label>
                    <input 
                      type="text" 
                      value={editingClub.clubNameAr}
                      onChange={e => updateCurrentEdit('clubNameAr', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('اسم النادي بالإنجليزية', 'Club Name (English)')}</label>
                    <input 
                      type="text" 
                      value={editingClub.clubNameEn}
                      onChange={e => updateCurrentEdit('clubNameEn', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('البلد', 'Country')}</label>
                    <input 
                      type="text" 
                      value={editingClub.countryEn}
                      onChange={e => updateCurrentEdit('countryEn', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t('المدة', 'Duration')}</label>
                    <input 
                      type="text" 
                      value={editingClub.durationEn}
                      onChange={e => updateCurrentEdit('durationEn', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-latin"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => void saveCurrentEdit()} disabled={saving} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-50">
                    <Save className="w-4 h-4 inline mr-2" />{saving ? t('جارٍ الحفظ…', 'Saving…') : t('حفظ', 'Save')}
                  </button>
                </div>

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};
