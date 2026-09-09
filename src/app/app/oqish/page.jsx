'use client';
import { useState } from 'react';
import { BookOpen, Loader2, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// VOCABLY-TZ.md §7 (Reading moduli) — MCQ + True/False/Not Given, AI orqali
// generatsiya qilinadi (targetWords — zanjir mexanizmi, so'nggi o'rgangan so'zlar).
// TZ'dagi 10 ta task turi va alohida trening rejimlaridan (skimming/scanning/paraphrase
// detektori) faqat asosiy sinov shakli qurildi — qolgani keyingi bosqich.
export default function OqishPage() {
  const { token } = useApp();
  const [cefr, setCefr] = useState('B1');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); // { id, passage, targetWords, questions }
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cefr, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Yaratib bo'lmadi");
      setSession(data);
      setAnswers(Array(data.questions.length).fill(null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (answers.some((a) => a === null)) return setError("Barcha savollarga javob bering");
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/reading/${session.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers }),
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
    setError('');
  };

  if (!session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} className="text-accent" />
          <h1 className="text-xl font-bold text-ink font-display">Oqish (Reading)</h1>
        </div>
        <p className="text-sm text-muted mb-6">AI sizga mos darajada matn va savollar tayyorlaydi.</p>

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
            placeholder="Masalan: texnologiya, sayohat..."
            className="w-full px-3 py-2.5 bg-bg text-ink border border-border rounded-lg text-sm outline-none focus:border-accent mb-4"
          />
          {error && <p className="text-xs text-danger font-medium mb-3">{error}</p>}
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Tayyorlanmoqda...' : 'Matn yaratish'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Badge tone="accent">{session.cefr || cefr}</Badge>
            {session.targetWords?.length > 0 && <Badge tone="neutral">so'zlaringiz bilan</Badge>}
          </div>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{session.passage}</p>
        </div>

        <div className="space-y-4">
          {session.questions.map((q, qi) => (
            <div key={qi} className="bg-surface border border-border rounded-2xl p-4 shadow-card">
              <p className="text-sm font-medium text-ink mb-3">
                {qi + 1}. {q.prompt}
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
              <Button onClick={reset} variant="secondary" className="w-full">
                <RotateCcw size={15} /> Yangi matn
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
