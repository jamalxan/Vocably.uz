'use client';
import { useState } from 'react';
import { Loader2, Shuffle } from 'lucide-react';

// 2026-09-24 (foydalanuvchi so'rovi): "Writing va Speaking o'zi random
// tushsin" — bu ikki bo'limda endi test ro'yxati (TestPicker) YO'Q.
// Foydalanuvchi faqat "Boshlash"ni bosadi, topshiriqni server tasodifiy
// tanlaydi (`POST /api/exam/attempts` — `testId`siz, shu foydalanuvchining
// oxirgi urinishlarini chetlab o'tib).
//
// Nega avtomatik navigatsiya EMAS (sahifa ochilishi bilan urinish
// boshlanmaydi): Writing 60 daqiqalik taymerli urinish — tasodifan sahifaga
// kirib qolgan foydalanuvchida jim boshlanib ketishi kerak emas.
export default function RandomSectionStart({ title, description, buttonLabel = 'Boshlash', onStart, footer }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    setLoading(true);
    setError('');
    try {
      await onStart();
    } catch (err) {
      setError(err?.message || "Topshiriq ochilmadi. Qayta urinib ko'ring.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 sm:p-10">
      <h1 className="text-lg font-bold text-ink mb-2 font-display">{title}</h1>
      <p className="text-sm text-muted mb-6">{description}</p>

      <button
        onClick={start}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-xl text-sm font-semibold transition-colors"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
        {loading ? 'Tayyorlanmoqda...' : buttonLabel}
      </button>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}
