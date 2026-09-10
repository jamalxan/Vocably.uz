'use client';
import { useState } from 'react';
import { Check, X, Trash2, Pencil, ListChecks, Save } from 'lucide-react';
import SparkleBurst from '../SparkleBurst';

export default function PendingAddWordsCard({ pendingAction, categories, sessionId, onResolved }) {
  const initialCatId = categories.some((c) => c._id === pendingAction.categoryId)
    ? pendingAction.categoryId
    : null;
  const [selectedCatId, setSelectedCatId] = useState(initialCatId);
  const [words, setWords] = useState(
    (pendingAction.words || []).map((w) => ({
      word: w.word || '',
      pronunciation: w.pronunciation || '',
      synsText: Array.isArray(w.syns) ? w.syns.join(', ') : '',
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resolved, setResolved] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  // Tahrirlash/o'chirish tugmalari sukut bo'yicha yashirin — "Tanlash" bosilgandagina
  // chiqadi, aks holda ro'yxat tinch, faqat o'qish uchun ko'rinadi.
  const [selectMode, setSelectMode] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);

  const updateWord = (idx, field, value) => {
    setWords((prev) => prev.map((w, i) => (i === idx ? { ...w, [field]: value } : w)));
  };

  const removeWord = (idx) => {
    setWords((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (!selectedCatId) {
      setError('Avval kategoriyani tanlang');
      return;
    }
    const cleanWords = words
      .map((w) => ({
        word: w.word.trim(),
        pronunciation: w.pronunciation.trim(),
        syns: w.synsText.split(',').map((s) => s.trim()).filter(Boolean),
      }))
      .filter((w) => w.word && w.syns.length > 0);

    if (cleanWords.length === 0) {
      setError("Qo'shish uchun kamida bitta to'g'ri so'z qoldiring");
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/ai/sessions/${sessionId}/confirm-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ categoryId: selectedCatId, words: cleanWords }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      // Muvaffaqiyat animatsiyasi biroz ko'rinib tursin, keyin kartani xabarga almashtiramiz.
      setCelebrating(true);
      setTimeout(() => {
        setResolved(true);
        onResolved(data);
      }, 900);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (resolved) return null;

  return (
    <div className="relative mt-3 bg-surface border border-accent/15 rounded-xl p-3 sm:p-4 text-sm overflow-visible">
      {celebrating && <SparkleBurst />}

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted uppercase">Qo'shiladigan so'zlar</p>
        <button
          onClick={() => {
            setSelectMode((v) => !v);
            setEditingIdx(null);
          }}
          disabled={celebrating}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            selectMode ? 'bg-accent text-white' : 'text-accent hover:bg-accent-soft'
          }`}
        >
          <ListChecks size={12} /> {selectMode ? 'Tayyor' : 'Tanlash'}
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {words.map((w, idx) =>
          editingIdx === idx ? (
            <div key={idx} className="border border-accent/30 rounded-lg p-2.5 space-y-1.5">
              <input
                value={w.word}
                onChange={(e) => updateWord(idx, 'word', e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-lg text-xs outline-none focus:border-accent"
                placeholder="Inglizcha so'z"
              />
              <input
                value={w.pronunciation}
                onChange={(e) => updateWord(idx, 'pronunciation', e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-lg text-xs outline-none focus:border-accent italic"
                placeholder="Talaffuz (masalan /əˈraɪz/)"
              />
              <input
                value={w.synsText}
                onChange={(e) => updateWord(idx, 'synsText', e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-lg text-xs outline-none focus:border-accent"
                placeholder="Tarjimalar, vergul bilan"
              />
              <button
                onClick={() => setEditingIdx(null)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Save size={12} /> Saqlash
              </button>
            </div>
          ) : (
            <div key={idx} className="border border-border rounded-lg px-3 py-2.5">
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-ink">{w.word || '—'}</p>
                {w.pronunciation && <p className="text-xs text-muted italic">{w.pronunciation}</p>}
                {selectMode && (
                  <div className="ml-auto flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingIdx(idx)}
                      title="Tahrirlash"
                      className="p-1 text-muted hover:text-accent hover:bg-accent-soft rounded transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeWord(idx)}
                      title="Ro'yxatdan olib tashlash"
                      className="p-1 text-muted hover:text-accent hover:bg-accent-soft rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-1">
                {w.synsText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((syn, i) => (
                    <p key={i} className="text-[13px] text-accent leading-snug">
                      • {syn}
                    </p>
                  ))}
              </div>
            </div>
          )
        )}
        {words.length === 0 && <p className="text-xs text-muted">Ro'yxat bo'sh</p>}
      </div>

      <p className="text-xs font-semibold text-muted uppercase mb-1.5">Kategoriya</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setSelectedCatId(c._id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedCatId === c._id
                ? 'bg-accent border-accent text-white'
                : 'bg-surface border-border text-muted hover:border-accent/30'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-accent mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <Check size={13} /> {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
        </button>
        <button
          onClick={() => setResolved(true)}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-bg hover:bg-primary-soft text-muted rounded-lg text-xs font-semibold transition-colors"
        >
          <X size={13} /> Bekor qilish
        </button>
      </div>
    </div>
  );
}
