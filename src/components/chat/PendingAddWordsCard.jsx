'use client';
import { useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';

export default function PendingAddWordsCard({ pendingAction, categories, sessionId, onResolved }) {
  const initialCatId = categories.some((c) => c._id === pendingAction.categoryId)
    ? pendingAction.categoryId
    : null;
  const [selectedCatId, setSelectedCatId] = useState(initialCatId);
  const [words, setWords] = useState(
    (pendingAction.words || []).map((w) => ({
      word: w.word || '',
      synsText: Array.isArray(w.syns) ? w.syns.join(', ') : '',
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resolved, setResolved] = useState(false);

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

      setResolved(true);
      onResolved(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (resolved) return null;

  return (
    <div className="mt-3 bg-white border border-indigo-100 rounded-xl p-3 sm:p-4 text-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Qo'shiladigan so'zlar</p>

      <div className="space-y-2 mb-3">
        {words.map((w, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              value={w.word}
              onChange={(e) => updateWord(idx, 'word', e.target.value)}
              className="w-28 sm:w-32 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
              placeholder="so'z"
            />
            <input
              value={w.synsText}
              onChange={(e) => updateWord(idx, 'synsText', e.target.value)}
              className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
              placeholder="tarjimalar, vergul bilan"
            />
            <button
              onClick={() => removeWord(idx)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              title="Ro'yxatdan olib tashlash"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {words.length === 0 && <p className="text-xs text-slate-400">Ro'yxat bo'sh</p>}
      </div>

      <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Kategoriya</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setSelectedCatId(c._id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedCatId === c._id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <Check size={13} /> {submitting ? 'Qo\'shilmoqda...' : "Qo'shish"}
        </button>
        <button
          onClick={() => setResolved(true)}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
        >
          <X size={13} /> Bekor qilish
        </button>
      </div>
    </div>
  );
}
