'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mediaErrorMessage } from '@/lib/mediaError';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AiErrorNotice from '@/components/ui/AiErrorNotice';

// VOCABLY-TZ.md §9 (Speaking moduli). MUHIM CHEKLOV (UI'da ham ko'rsatiladi):
// Azure Speech Pronunciation Assessment (fonema darajasidagi baho, TZ 9.1'dagi asosiy
// reja) YO'Q — GROQ_API_KEY orqali Whisper transkripsiya + shu matnga LLM bahosi
// ishlatiladi (§20.1'dagi "bepul tarif" zaxirasi). Talaffuz ustuni shuning uchun
// ball emas, faqat matnli kuzatuv sifatida ko'rsatiladi. Audio yozuv SAQLANMAYDI
// (faqat vaqtinchalik qayta ishlanadi) — "Yozuvni tinglash" tugmasi yo'q.
export default function GapirishPage() {
  const { token } = useApp();
  const [part, setPart] = useState(1);
  const [promptState, setPromptState] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  // Joriy xatoni keltirib chiqargan amalni eslab qoladi, shunda "Qayta urinish" tugmasi
  // xato mikrofon ruxsatidanmi yoki AI baholashdanmi ekaniga qarab to'g'ri amalni qayta
  // ishga tushiradi (mikrofon uchun qaytadan yozdirish, AI uchun mavjud yozuvni qayta yuborish).
  const retryActionRef = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const getPrompt = async () => {
    setLoadingPrompt(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/speaking/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ part }),
      });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data?.error || "Yaratib bo'lmadi"), { requestId: data?.requestId });
      setPromptState(data);
    } catch (err) {
      retryActionRef.current = getPrompt;
      setError({ message: err.message, requestId: err.requestId });
    } finally {
      setLoadingPrompt(false);
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        submit(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      retryActionRef.current = startRecording;
      setError(mediaErrorMessage(err, 'Mikrofon'));
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submit = async (blob) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('part', String(part));
      form.append('prompt', promptState.prompt);
      form.append('audio', new File([blob], `speaking-${Date.now()}.webm`, { type: blob.type }));

      const res = await fetch('/api/speaking/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data?.error || "Tekshirib bo'lmadi"), { requestId: data?.requestId });
      setResult(data);
    } catch (err) {
      retryActionRef.current = () => submit(blob);
      setError({ message: err.message, requestId: err.requestId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Mic size={20} className="text-accent" />
        <h1 className="text-xl font-bold text-ink font-display">Gapirish (Speaking)</h1>
      </div>
      <p className="text-xs text-warning bg-warning-soft rounded-lg px-3 py-2 mb-5">
        ⚠️ Talaffuz balli fonema darajasida emas — faqat matn (Whisper transkripti) asosidagi taxminiy kuzatuv.
      </p>

      <div className="flex gap-2 mb-5">
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            onClick={() => {
              setPart(p);
              setPromptState(null);
              setResult(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              part === p ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted'
            }`}
          >
            Part {p}
          </button>
        ))}
      </div>

      {!promptState ? (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-card">
          <AiErrorNotice error={error} onRetry={() => retryActionRef.current?.()} className="mb-4 text-left" />
          <Button onClick={getPrompt} disabled={loadingPrompt}>
            {loadingPrompt ? <Loader2 size={16} className="animate-spin" /> : null}
            {loadingPrompt ? 'Tayyorlanmoqda...' : 'Savol olish'}
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-accent-soft rounded-2xl p-4 mb-5">
            <p className="text-sm text-ink mb-2">{promptState.prompt}</p>
            {promptState.cueCardPoints?.length > 0 && (
              <ul className="text-xs text-muted list-disc list-inside space-y-0.5">
                {promptState.cueCardPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            )}
          </div>

          {!result && (
            <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-card mb-4">
              {submitting ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 size={28} className="animate-spin text-accent" />
                  <p className="text-xs text-muted">Tahlil qilinmoqda...</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-glow transition-colors mb-3 ${
                      recording ? 'bg-danger text-white animate-pulse' : 'bg-accent hover:bg-accent-hover text-on-accent'
                    }`}
                    aria-label={recording ? "To'xtatish" : 'Yozishni boshlash'}
                  >
                    {recording ? <Square size={26} /> : <Mic size={30} />}
                  </button>
                  <p className="text-xs text-muted">{recording ? `${seconds}s — bosib to'xtating` : 'Boshlash uchun bosing'}</p>
                </>
              )}
            </div>
          )}

          <AiErrorNotice error={error} onRetry={() => retryActionRef.current?.()} className="mb-3" />

          {result && (
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-card text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Taxminiy band</p>
                <p className="text-4xl font-bold text-accent font-display">{result.feedback.band}</p>
              </div>

              <details className="bg-surface border border-border rounded-2xl p-4">
                <summary className="text-xs font-semibold text-ink cursor-pointer">Transkript</summary>
                <p className="text-xs text-muted mt-2 leading-relaxed">{result.transcript}</p>
              </details>

              <div className="grid grid-cols-1 gap-2">
                {['fluencyCoherence', 'lexicalResource', 'grammaticalRange'].map((key) => (
                  <div key={key} className="bg-surface border border-border rounded-xl p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted uppercase mb-0.5">{CRITERIA_LABEL[key]}</p>
                      <p className="text-xs text-muted">{result.feedback.criteria[key].note}</p>
                    </div>
                    <Badge tone="accent" className="flex-shrink-0">{result.feedback.criteria[key].band}</Badge>
                  </div>
                ))}
                <div className="bg-surface border border-border rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-muted uppercase mb-0.5">Talaffuz (taxminiy)</p>
                  <p className="text-xs text-muted">{result.feedback.criteria.pronunciation.note}</p>
                </div>
              </div>

              {result.feedback.corrections?.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-4">
                  <p className="text-xs font-semibold text-ink mb-2">Tuzatishlar</p>
                  <div className="space-y-1.5">
                    {result.feedback.corrections.map((c, i) => (
                      <p key={i} className="text-xs">
                        <span className="line-through text-danger">{c.original}</span>{' '}
                        <span className="text-success font-semibold">→ {c.suggestion}</span>
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

              <Button onClick={getPrompt} variant="secondary" className="w-full">
                <RotateCcw size={15} /> Yangi savol
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const CRITERIA_LABEL = {
  fluencyCoherence: 'Fluency & Coherence',
  lexicalResource: 'Lexical Resource',
  grammaticalRange: 'Grammar',
};
