'use client';
import { useState } from 'react';
import { Lightbulb, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';

// V6 "Mnemonika ustaxonasi" (VOCABLY-TZ.md 6.2) — boshqa yangi rejimlardan farqli
// o'laroq, AI-boyitishga MUHTOJ EMAS: foydalanuvchi istalgan so'z uchun o'z
// mnemonikasini yozishi mumkin. AI taklifi (enrichment.mnemonicUz) bor bo'lsa,
// faqat "ilhom" sifatida ko'rsatiladi — elaborative encoding eng kuchli o'zi ijod
// qilganda ishlaydi (izoh).
export default function MnemonikaPage() {
  const { activeCategory, saveMnemonic } = useApp();
  const words = activeCategory.words || [];
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState(words[0]?.enrichment?.userMnemonicUz || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (words.length === 0) {
    return <p className="p-8 text-center text-sm text-muted">Bu kategoriyada hali so'z yo'q.</p>;
  }

  const current = words[idx];

  const goTo = (nextIdx) => {
    setIdx(nextIdx);
    setDraft(words[nextIdx]?.enrichment?.userMnemonicUz || '');
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const res = await saveMnemonic(activeCategory._id, current._id, draft);
    setSaving(false);
    if (!res.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>{idx + 1} / {words.length}</span>
          <div className="flex items-center gap-1">
            <IconButton icon={ArrowLeft} label="Oldingi so'z" size="sm" disabled={idx === 0} onClick={() => goTo(idx - 1)} />
            <IconButton icon={ArrowRight} label="Keyingi so'z" size="sm" disabled={idx === words.length - 1} onClick={() => goTo(idx + 1)} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="text-2xl font-bold text-ink font-word text-center mb-1">{current.word}</p>
          <p className="text-sm text-muted text-center mb-5">{current.syns.join(', ')}</p>

          {current.enrichment?.mnemonicUz && (
            <div className="bg-accent-soft rounded-lg p-3 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent mb-1 flex items-center gap-1">
                <Lightbulb size={11} /> AI taklifi (ilhom uchun)
              </p>
              <p className="text-sm text-ink">{current.enrichment.mnemonicUz}</p>
              <button
                onClick={() => setDraft(current.enrichment.mnemonicUz)}
                className="text-[11px] text-accent font-semibold mt-1.5 hover:underline"
              >
                Shu asosda yozish
              </button>
            </div>
          )}

          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">
            Sizning mnemonikangiz
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Bu so'zni qanday eslab qolasiz? O'z assotsiatsiyangizni yozing..."
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent resize-none mb-4"
          />

          <Button onClick={save} disabled={saving} className="w-full">
            {saved ? <Check size={16} /> : null}
            {saving ? 'Saqlanmoqda...' : saved ? 'Saqlandi' : 'Saqlash'}
          </Button>
        </div>
      </div>
    </div>
  );
}
