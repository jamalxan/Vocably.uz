'use client';
import { useState, useEffect, useRef } from 'react';
import { Lightbulb, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import { categoryKey } from '@/lib/lugatQuiz';

// V6 "Mnemonika ustaxonasi" (VOCABLY-TZ.md 6.2) — boshqa yangi rejimlardan farqli
// o'laroq, AI-boyitishga MUHTOJ EMAS: foydalanuvchi istalgan so'z uchun o'z
// mnemonikasini yozishi mumkin. AI taklifi (enrichment.mnemonicUz) bor bo'lsa,
// faqat "ilhom" sifatida ko'rsatiladi — elaborative encoding eng kuchli o'zi ijod
// qilganda ishlaydi (izoh).
export default function MnemonikaPage() {
  const { activeCategory, activeCatIndex } = useApp();
  // Kategoriya almashsa idx/draft eski kategoriyadan qolib ketmasin (P0: undefined.word).
  return <MnemonikaWorkshop key={categoryKey(activeCatIndex, activeCategory)} />;
}

function MnemonikaWorkshop() {
  const { activeCategory, saveMnemonic } = useApp();
  const words = activeCategory.words || [];
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState(words[0]?.enrichment?.userMnemonicUz || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const savedTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  if (words.length === 0) {
    return <p className="p-8 text-center text-sm text-muted">Bu kategoriyada hali so'z yo'q.</p>;
  }

  // So'zlar ro'yxati qisqarsa ham chegaradan chiqmaslik uchun.
  const safeIdx = Math.min(idx, words.length - 1);
  const current = words[safeIdx];

  const goTo = (nextIdx) => {
    clearTimeout(savedTimerRef.current);
    setIdx(nextIdx);
    setDraft(words[nextIdx]?.enrichment?.userMnemonicUz || '');
    setSaved(false);
    setError('');
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const res = await saveMnemonic(activeCategory._id, current._id, draft).catch(() => ({ error: "Saqlab bo'lmadi" }));
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSaved(true);
    clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>{safeIdx + 1} / {words.length}</span>
          <div className="flex items-center gap-1">
            <IconButton icon={ArrowLeft} label="Oldingi so'z" size="lg" className="md:w-10 md:h-10" disabled={safeIdx === 0} onClick={() => goTo(safeIdx - 1)} />
            <IconButton icon={ArrowRight} label="Keyingi so'z" size="lg" className="md:w-10 md:h-10" disabled={safeIdx === words.length - 1} onClick={() => goTo(safeIdx + 1)} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="text-2xl font-bold text-ink font-word text-center mb-1">{current.word}</p>
          <p className="text-sm text-muted text-center mb-5">{current.syns.join(', ')}</p>

          {current.enrichment?.mnemonicUz && (
            <div className="bg-accent-soft rounded-lg p-3 mb-4">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-accent mb-1 flex items-center gap-1">
                <Lightbulb size={11} /> AI taklifi (ilhom uchun)
              </p>
              <p className="text-sm text-ink">{current.enrichment.mnemonicUz}</p>
              <button
                type="button"
                onClick={() => setDraft(current.enrichment.mnemonicUz)}
                className="text-xs text-accent font-semibold mt-1 -ml-2 px-2 py-1.5 min-h-11 md:min-h-0 rounded-md hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Shu asosda yozish
              </button>
            </div>
          )}

          <label htmlFor="user-mnemonic" className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Sizning mnemonikangiz
          </label>
          <textarea
            id="user-mnemonic"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Bu so'zni qanday eslab qolasiz? O'z assotsiatsiyangizni yozing..."
            className="w-full px-3 py-2.5 bg-bg text-ink border border-border rounded-lg text-base md:text-sm outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 resize-none mb-4"
          />

          <Button onClick={save} disabled={saving} className="w-full">
            {saved ? <Check size={16} /> : null}
            {saving ? 'Saqlanmoqda...' : saved ? 'Saqlandi' : 'Saqlash'}
          </Button>
          {error && (
            <p role="alert" className="text-xs text-danger font-medium mt-2 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
