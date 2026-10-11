'use client';
import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { SpeakingModelAnswer } from '@/lib/exam/types';

// Foydalanuvchi savolga javobini yozib olgandan KEYIN ko'rsatiladigan namuna javob
// (Band 8+) va undagi foydali iboralar (inglizcha izoh + o'zbekcha tarjima). Avval
// o'zi gapirib, keyin solishtirishi uchun — javob yozilmaguncha ko'rsatilmaydi.
function highlight(answer: string, phrases: string[]) {
  // Iboralarni (qavs ichidagi izohlarsiz) javob matnida qalin qilib ko'rsatadi.
  const keys = phrases
    .map((p) => p.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\.\.\./g, '').trim())
    .filter((p) => p.length > 2)
    .sort((a, b) => b.length - a.length);
  if (!keys.length) return answer;
  const re = new RegExp(`(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return answer.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: 'var(--exam-accent)' }}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export default function ModelAnswer({ model }: { model: SpeakingModelAnswer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-xl" style={{ border: '1px solid var(--exam-chrome-border)', background: 'var(--exam-instruction)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-11 flex items-center gap-2 px-4 py-3 text-left text-sm font-semibold focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)] rounded-xl"
        style={{ color: 'var(--exam-text)' }}
      >
        <Sparkles size={16} style={{ color: 'var(--exam-accent)' }} />
        <span className="flex-1">Namuna javob (Band 8+) — shunday gapirsangiz yaxshi bo&apos;ladi</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--exam-text)' }}>
            {highlight(model.answer, (model.vocab || []).map((v) => v.phrase))}
          </p>
          {model.vocab && model.vocab.length > 0 && (
            <>
              <p className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--exam-muted)' }}>
                Foydali iboralar
              </p>
              <ul className="space-y-2">
                {model.vocab.map((v, i) => (
                  <li key={i} className="text-sm" style={{ color: 'var(--exam-text)' }}>
                    <span className="font-semibold">{v.phrase}</span>
                    {v.meaning && <span style={{ color: 'var(--exam-muted)' }}> — {v.meaning}</span>}
                    {v.uz && <span className="block text-[13px]" style={{ color: 'var(--exam-muted)' }}>🇺🇿 {v.uz}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
