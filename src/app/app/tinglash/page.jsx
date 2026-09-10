'use client';
import { useState } from 'react';
import { Headphones, Loader2, RotateCcw, Play } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SplitPane from '@/components/exam/SplitPane';
import HighlightableText from '@/components/exam/HighlightableText';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SPEEDS = [
  { rate: 0.85, label: '0.85×' },
  { rate: 1, label: '1×' },
  { rate: 1.25, label: '1.25×' },
];

// VOCABLY-TZ.md §8 (Listening moduli). Transkript OLDINDAN ko'rsatilmaydi — faqat
// tinglash uchun TTS'ga uzatiladi, natija chiqqandan keyingina matn sifatida ochiladi
// (aks holda mashq mazmunsiz bo'lib qolardi). Real audio-fayl/aksent (UK/US/AUS)
// yo'q (T4) — brauzer TTS bitta ovozda o'qiydi.
export default function TinglashPage() {
  const { token } = useApp();
  const [cefr, setCefr] = useState('B1');
  const [topic, setTopic] = useState('');
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  // Highlight/note — Oqish sahifasidagi bilan bir xil naqsh (lokal holat, /submit'da
  // backend'ga birga yuboriladi). Faqat SAVOL matniga tegishli — haqiqiy IELTS
  // Listening'da ham transkript oldindan ko'rinmaydi, faqat savollarni belgilash
  // mumkin (tinglab turib eslatma yozish uchun).
  const [highlights, setHighlights] = useState([]);

  const addHighlight = (text) => setHighlights((prev) => [...prev, { _id: `h${prev.length}-${Date.now()}`, text, note: '' }]);
  const removeHighlight = (id) => setHighlights((prev) => prev.filter((h) => h._id !== id));
  const noteHighlight = (id, note) => setHighlights((prev) => prev.map((h) => (h._id === id ? { ...h, note } : h)));

  const generate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setHighlights([]);
    try {
      const res = await fetch('/api/listening/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cefr, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Yaratib bo'lmadi");
      setSession(data);
      setAnswers(Array(data.questions.length).fill(null));
      setPlayCount(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const play = () => {
    speakText(session.transcript, { rate });
    setPlayCount((c) => c + 1);
  };

  const submit = async () => {
    if (answers.some((a) => a === null)) return setError('Barcha savollarga javob bering');
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/listening/${session.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers, highlights }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Tekshirib bo'lmadi");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSession(null);
    setResult(null);
    setAnswers([]);
    setHighlights([]);
    setError('');
  };

  if (!session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Headphones size={20} className="text-accent" />
          <h1 className="text-xl font-bold text-ink font-display">Tinglash (Listening)</h1>
        </div>
        <p className="text-sm text-muted mb-6">AI qisqa matn tayyorlaydi, brauzer ovozda o'qib beradi.</p>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Daraja</label>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {CEFR_LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setCefr(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  cefr === l ? 'bg-accent text-on-accent' : 'bg-bg border border-border text-muted hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">
            Mavzu (ixtiyoriy)
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Masalan: sayohat e'loni..."
            className="w-full px-3 py-2.5 bg-bg text-ink border border-border rounded-lg text-sm outline-none focus:border-accent mb-4"
          />
          {error && <p className="text-xs text-danger font-medium mb-3">{error}</p>}
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Tayyorlanmoqda...' : 'Boshlash'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <SplitPane
        initialLeftPercent={38}
        left={
          <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
            <Badge tone="accent" className="mb-3">{cefr}</Badge>
            <button
              onClick={play}
              className="w-20 h-20 mx-auto rounded-full bg-accent hover:bg-accent-hover text-on-accent flex items-center justify-center shadow-glow transition-colors mb-3"
              aria-label="Tinglash"
            >
              <Play size={30} className="ml-1" />
            </button>
            <p className="text-xs text-muted mb-3">{playCount === 0 ? 'Tinglash uchun bosing' : `${playCount} marta tinglandi`}</p>
            <div className="flex justify-center gap-1.5">
              {SPEEDS.map((s) => (
                <button
                  key={s.rate}
                  onClick={() => setRate(s.rate)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    rate === s.rate ? 'bg-accent text-on-accent' : 'bg-bg border border-border text-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        }
        right={
          <div className="p-4 sm:p-6 space-y-4">
            {session.questions.map((q, qi) => (
              <div key={qi} className="bg-surface border border-border rounded-2xl p-4 shadow-card">
                <p className="text-sm font-medium text-ink mb-3 select-text">
                  {qi + 1}.{' '}
                  <HighlightableText text={q.prompt} highlights={highlights} onAdd={addHighlight} onRemove={removeHighlight} onNote={noteHighlight} />
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const qResult = result?.questions?.[qi];
                    let style = 'border-border hover:border-accent/30';
                    if (qResult) {
                      if (opt === qResult.correctAnswer) style = 'border-green-300 bg-green-50 text-green-700';
                      else if (opt === qResult.userAnswer) style = 'border-red-300 bg-accent-soft text-red-700';
                    } else if (answers[qi] === opt) {
                      style = 'border-accent bg-accent-soft text-accent';
                    }
                    return (
                      <button
                        key={oi}
                        disabled={!!result}
                        onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? opt : a)))}
                        className={`w-full text-left px-3 py-2 border rounded-lg text-xs transition-colors ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {result?.questions?.[qi] && (
                  <p className="text-[11px] text-muted mt-2 italic">{result.questions[qi].explanation}</p>
                )}
              </div>
            ))}

            {error && <p className="text-xs text-danger font-medium">{error}</p>}

            {!result ? (
              <Button onClick={submit} disabled={submitting} className="w-full">
                {submitting ? 'Tekshirilmoqda...' : 'Tekshirish'}
              </Button>
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-4 text-center shadow-card">
                <p className="text-lg font-bold text-ink font-display mb-3">
                  Natija: <span className="text-accent">{result.score}</span>/{result.total}
                </p>
                <details className="text-left mb-4">
                  <summary className="text-xs text-accent font-semibold cursor-pointer">Transkriptni ko'rish</summary>
                  <p className="text-xs text-muted mt-2 leading-relaxed">{result.transcript}</p>
                </details>
                <Button onClick={reset} variant="secondary" className="w-full">
                  <RotateCcw size={15} /> Yangi matn
                </Button>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
