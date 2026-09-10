'use client';
import { useState, useMemo } from 'react';
import { PenLine, Loader2, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AiErrorNotice from '@/components/ui/AiErrorNotice';

const MIN_WORDS = { 1: 150, 2: 250 };

// VOCABLY-TZ.md §10 (Writing moduli). Task 1 (Academic tavsif) / Task 2 (insho).
// Mikro-mashqlar, Tuzatish rejimi va h.k. (§10.1 qolgan qatorlari) — keyingi bosqich.
export default function YozishPage() {
  const { token } = useApp();
  const [task, setTask] = useState(2);
  const [promptState, setPromptState] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const wordCount = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);

  const getPrompt = async (t) => {
    setLoadingPrompt(true);
    setError('');
    setResult(null);
    setText('');
    try {
      const res = await fetch('/api/writing/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task: t }),
      });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data?.error || "Yaratib bo'lmadi"), { requestId: data?.requestId });
      setPromptState(data);
    } catch (err) {
      setError({ message: err.message, requestId: err.requestId });
    } finally {
      setLoadingPrompt(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/writing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task, prompt: promptState.prompt, text, chart: promptState.chart, chartSvg: promptState.chartSvg }),
      });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data?.error || "Tekshirib bo'lmadi"), { requestId: data?.requestId });
      setResult(data);
    } catch (err) {
      setError({ message: err.message, requestId: err.requestId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <PenLine size={20} className="text-accent" />
        <h1 className="text-xl font-bold text-ink font-display">Yozish (Writing)</h1>
      </div>
      <p className="text-sm text-muted mb-5">AI IELTS mezonlari bo'yicha taxminiy baholaydi.</p>

      <div className="flex gap-2 mb-5">
        {[1, 2].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTask(t);
              setPromptState(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              task === t ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted'
            }`}
          >
            Task {t}
          </button>
        ))}
      </div>

      {!promptState ? (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-card">
          <AiErrorNotice error={error} onRetry={() => getPrompt(task)} className="mb-4 text-left" />
          <Button onClick={() => getPrompt(task)} disabled={loadingPrompt}>
            {loadingPrompt ? <Loader2 size={16} className="animate-spin" /> : null}
            {loadingPrompt ? 'Tayyorlanmoqda...' : 'Topshiriq olish'}
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-accent-soft rounded-2xl p-4 mb-4">
            <p className="text-sm text-ink">{promptState.prompt}</p>
          </div>

          {/* TZ-vocably-v2.md §C3 F-W1 (BUG-014) — Task 1 grafik: neytral (oq fon,
              brendsiz) uslubda, real imtihondagidek. Task 2'da chartSvg yo'q. */}
          {task === 1 && promptState.chartSvg && (
            <div
              className="bg-white border border-border rounded-2xl p-3 mb-4 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: promptState.chartSvg }}
            />
          )}

          {!result ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Javobingizni shu yerga yozing..."
                className="w-full px-4 py-3 bg-bg text-ink border border-border rounded-2xl text-sm outline-none focus:border-accent resize-none mb-2"
              />
              <div className="flex justify-between items-center mb-4 text-xs">
                <span className={wordCount < MIN_WORDS[task] ? 'text-warning' : 'text-success'}>
                  {wordCount} / {MIN_WORDS[task]}+ so'z
                </span>
                <button onClick={() => getPrompt(task)} className="text-accent hover:text-accent-hover font-semibold">
                  Boshqa topshiriq
                </button>
              </div>
              <AiErrorNotice error={error} onRetry={submit} className="mb-3" />
              <Button onClick={submit} disabled={submitting || wordCount < 20} className="w-full">
                {submitting ? 'Baholanmoqda...' : 'Tekshirish'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-card text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Taxminiy band</p>
                <p className="text-4xl font-bold text-accent font-display">{result.feedback.band}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.feedback.criteria).map(([key, c]) => (
                  <div key={key} className="bg-surface border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-muted uppercase">{CRITERIA_LABEL[key]}</span>
                      <Badge tone="accent">{c.band}</Badge>
                    </div>
                    <p className="text-xs text-muted">{c.note}</p>
                  </div>
                ))}
              </div>

              {result.feedback.inlineCorrections?.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-4">
                  <p className="text-xs font-semibold text-ink mb-2">Tuzatishlar</p>
                  <div className="space-y-2">
                    {result.feedback.inlineCorrections.map((c, i) => (
                      <div key={i} className="text-xs">
                        <span className="line-through text-danger">{c.original}</span>{' '}
                        <span className="text-success font-semibold">→ {c.suggestion}</span>
                        <p className="text-muted mt-0.5">{c.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.feedback.vocabularyUpgrades?.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-4">
                  <p className="text-xs font-semibold text-ink mb-2">Lug'atni boyitish</p>
                  <div className="space-y-1.5">
                    {result.feedback.vocabularyUpgrades.map((v, i) => (
                      <p key={i} className="text-xs text-muted">
                        <span className="font-medium text-ink">{v.original}</span> →{' '}
                        <span className="text-accent">{v.better.join(', ')}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.feedback.nextStepsUz?.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-4">
                  <p className="text-xs font-semibold text-ink mb-2">Keyingi qadamlar</p>
                  <ul className="text-xs text-muted list-disc list-inside space-y-1">
                    {result.feedback.nextStepsUz.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={() => getPrompt(task)} variant="secondary" className="w-full">
                <RotateCcw size={15} /> Yangi topshiriq
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const CRITERIA_LABEL = {
  taskAchievement: 'Task Achievement',
  coherenceCohesion: 'Coherence',
  lexicalResource: 'Lexical Resource',
  grammaticalRange: 'Grammar',
};
