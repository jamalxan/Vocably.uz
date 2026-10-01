'use client';
import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getDiagnostic, skipDiagnostic, submitDiagnostic } from './api';

const DONT_KNOW = '__unknown__';

// Onboarding diagnostic (TZ §63–64): qisqa lug'at testi. Hech qachon majburiy emas — o'tkazib yuborish mumkin.
// Holat tugagan/o'tkazilgan bo'lsa yoki xato bo'lsa karta ko'rinmaydi.
export default function DiagnosticCard() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDiagnostic()
      .then((d) => !cancelled && setData(d))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;
  const done = data.status?.completedAt || data.status?.skippedAt;
  if (done && !result) return null;

  const questions = data.questions || [];

  async function finish(all) {
    setBusy(true);
    setErr('');
    try {
      const res = await submitDiagnostic(all);
      setResult(res.result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  function choose(choice) {
    const q = questions[idx];
    const all = [...answers, { id: q.id, choice: choice === DONT_KNOW ? null : choice }];
    setAnswers(all);
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else finish(all);
  }

  async function skip() {
    try {
      await skipDiagnostic();
    } catch {
      // e'tiborsiz: keyingi safar yana ko'rsatiladi
    }
    setData({ ...data, status: { skippedAt: new Date().toISOString() } });
  }

  if (result) {
    return (
      <section role="status" className="bg-accent-soft border border-accent/30 rounded-2xl p-5">
        <h2 className="text-base font-bold text-ink font-display">Taxminiy lug'at darajangiz: {result.level}</h2>
        <p className="text-sm text-muted mt-1">
          {result.correct}/{result.total} to'g'ri ({result.score}%). Reja va tavsiyalar shu darajaga moslashtiriladi.
        </p>
      </section>
    );
  }

  if (!open) {
    return (
      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="diag-title">
        <h2 id="diag-title" className="text-base font-bold text-ink font-display flex items-center gap-2">
          <ClipboardCheck size={18} className="text-accent" aria-hidden="true" /> Darajangizni aniqlang
        </h2>
        <p className="text-sm text-muted mt-1">{questions.length} ta qisqa savol (~2 daqiqa). Bilmaganingizga "Bilmayman" deng — taxmin qilish shart emas.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={() => setOpen(true)}>Boshlash</Button>
          <Button variant="secondary" onClick={skip}>
            Keyinroq
          </Button>
        </div>
      </section>
    );
  }

  const q = questions[idx];
  return (
    <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="diag-q">
      <p className="text-xs text-muted tabular-nums">
        {idx + 1} / {questions.length}
      </p>
      <h2 id="diag-q" className="text-lg font-bold text-ink font-display mt-1">
        "{q.word}" so'zining ma'nosi qaysi?
      </h2>
      <div className="grid gap-2 mt-3" role="group" aria-label="Variantlar">
        {q.options.map((o) => (
          <button
            key={o}
            type="button"
            disabled={busy}
            onClick={() => choose(o)}
            className="text-left px-4 py-3 min-h-11 rounded-xl border border-border bg-surface text-sm text-ink hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
          >
            {o}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => choose(DONT_KNOW)}
          className="text-left px-4 py-3 min-h-11 rounded-xl border border-dashed border-border text-sm text-muted hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
        >
          Bilmayman
        </button>
      </div>
      {err && (
        <p role="alert" className="text-sm text-danger mt-3">
          {err}
        </p>
      )}
    </section>
  );
}
