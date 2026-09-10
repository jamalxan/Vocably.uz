'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Play, Clock, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SplitPane from '@/components/exam/SplitPane';
import HighlightableText from '@/components/exam/HighlightableText';

const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking'];
const SECTION_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
const RESYNC_MS = 20_000;
const AUTOSAVE_DEBOUNCE_MS = 1200;

function formatTime(sec) {
  if (sec == null) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.max(0, sec) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Imtihon "qobig'i" (exam shell) — VOCABLY-TZ.md §11.4. Taymer HECH QACHON bu
// yerda hisoblanmaydi, faqat server javobidagi `remaining`dan tiklanadi va har
// RESYNC_MS'da qayta sinxronlanadi (lib/exam/engine.ts). beforeunload
// ogohlantirishi + har javobda autosave — sahifa tasodifan yopilsa ham hech
// narsa yo'qolmaydi (buning uchun butun bu dvigatel qurilgan).
export default function MockSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useApp();

  const [state, setState] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('listening');
  const [localRemaining, setLocalRemaining] = useState(null);
  const [saving, setSaving] = useState(false);
  const [audioState, setAudioState] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const essayTimers = useRef({});

  const fetchState = useCallback(async () => {
    const res = await fetch(`/api/exam/${id}/state`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Yuklab bo'lmadi");
    return data;
  }, [id, token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchState();
        if (cancelled) return;
        if (data.status === 'submitted') {
          router.replace(`/app/mock/${id}/natija`);
          return;
        }
        setState(data);
        setContent(data.content);
        const firstUnlocked = SECTION_ORDER.find((s) => !data.sections[s].locked) || 'speaking';
        setActiveSection(firstUnlocked);
        setLocalRemaining(data.sections[firstUnlocked]?.remaining ?? null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodik qayta-sinxronlash — server har doim haqiqiy manba.
  useEffect(() => {
    if (!state || state.status === 'submitted') return undefined;
    const interval = setInterval(async () => {
      try {
        const data = await fetchState();
        if (data.status === 'submitted') {
          router.replace(`/app/mock/${id}/natija`);
          return;
        }
        setState(data);
        setLocalRemaining(data.sections[activeSection]?.remaining ?? null);
      } catch {
        // vaqtinchalik tarmoq xatosi — keyingi tsiklda qayta urinamiz
      }
    }, RESYNC_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, activeSection]);

  // Lokal bir soniyalik tik — faqat KO'RSATISH uchun, hisob-kitobning o'zi emas.
  // Bitta doimiy interval (deps yo'q, funksional yangilovchi orqali) — bo'lim
  // boshlanganda `localRemaining` null'dan songa o'tganda ham qayta ishga
  // tushirilishi shart emas, chunki setLocalRemaining har doim eng so'nggi
  // qiymatni o'qiydi.
  useEffect(() => {
    const t = setInterval(() => setLocalRemaining((r) => (r != null ? Math.max(0, r - 1) : r)), 1000);
    return () => clearInterval(t);
  }, []);

  // Sahifadan chiqishga urinilsa ogohlantirish (exam rejimida).
  useEffect(() => {
    if (!state || state.mode !== 'exam') return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state]);

  const startSection = async (section) => {
    const res = await fetch(`/api/exam/${id}/section/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ section }),
    });
    const data = await res.json();
    if (res.ok) {
      setState((s) => ({ ...s, sections: data.sections }));
      setLocalRemaining(data.sections[section]?.remaining ?? null);
      setActiveSection(section);
    }
  };

  const saveAnswer = async (questionId, value) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: value } }));
    setSaving(true);
    try {
      const res = await fetch(`/api/exam/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionId, value }),
      });
      const data = await res.json();
      if (res.ok && state.mode === 'practice') {
        setState((s) => ({ ...s, _practiceReveal: { ...s._practiceReveal, [questionId]: data } }));
      }
    } finally {
      setSaving(false);
    }
  };

  const saveEssay = (task, text) => {
    setState((s) => ({ ...s, essays: { ...s.essays, [task]: text } }));
    clearTimeout(essayTimers.current[task]);
    essayTimers.current[task] = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/exam/${id}/essay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task, text }),
      });
      setSaving(false);
    }, AUTOSAVE_DEBOUNCE_MS);
  };

  // Highlight/note — haqiqiy IELTS dasturidagi kabi, backend'da saqlanadi
  // (lib/models.js'dagi ExamSession.highlights). Optimistik yangilanadi, keyin
  // serverdan qaytgan ID bilan almashtiriladi (remove/note aniq ID kerak bo'lgani
  // uchun).
  const addHighlight = async (section, text) => {
    const tempId = `temp-${Date.now()}`;
    setState((s) => ({ ...s, highlights: [...(s.highlights || []), { _id: tempId, section, text, note: '' }] }));
    try {
      const res = await fetch(`/api/exam/${id}/highlight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'add', section, text }),
      });
      const data = await res.json();
      if (res.ok) {
        setState((s) => ({
          ...s,
          highlights: (s.highlights || []).map((h) => (h._id === tempId ? data.highlight : h)),
        }));
      }
    } catch {
      // tarmoq xatosi — optimistik holat vizual qoladi, keyingi /state sinxronida to'g'irlanadi
    }
  };

  const removeHighlight = async (highlightId) => {
    setState((s) => ({ ...s, highlights: (s.highlights || []).filter((h) => h._id !== highlightId) }));
    await fetch(`/api/exam/${id}/highlight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'remove', highlightId }),
    });
  };

  const noteHighlight = async (highlightId, note) => {
    setState((s) => ({
      ...s,
      highlights: (s.highlights || []).map((h) => (h._id === highlightId ? { ...h, note } : h)),
    }));
    await fetch(`/api/exam/${id}/highlight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'note', highlightId, note }),
    });
  };

  // `transcript` — Cambridge'dan import qilingan testlarda haqiqiy audio fayl yo'q,
  // shuning uchun brauzer TTS orqali audioscript o'qib beriladi (2026-09-10 so'rovi).
  // Server baribir /audio/start orqali play-once holatini kuzatib boradi (eski AI-demo
  // mock'lar uchun ham, kelgusida haqiqiy audio fayl qo'shilganda ham ishlayveradi).
  const playAudio = async (transcript) => {
    const res = await fetch(`/api/exam/${id}/audio/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ section: 'listening' }),
    });
    const data = await res.json();
    if (res.ok) {
      setAudioState(data);
      if (transcript) speakText(transcript, { rate: 1 });
    }
  };

  const goToNextSection = async () => {
    const idx = SECTION_ORDER.indexOf(activeSection);
    const next = SECTION_ORDER[idx + 1];
    if (next) await startSection(next);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/exam/${id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push(`/app/mock/${id}/natija`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }
  if (error) return <p className="p-8 text-center text-sm text-danger">{error}</p>;
  if (!state || !content) return null;

  const sec = state.sections[activeSection];
  const secStarted = sec?.started;
  const isLast = activeSection === 'speaking';

  return (
    <div className="flex flex-col h-full">
      {/* Fokus rejimi — asosiy navigatsiya AppShell'da baribir turadi, lekin bu
          sahifa o'zi minimal, chalg'ituvchi elementlarsiz (real IELTS dasturi
          kabi rasmiy, "beg'ubor" ko'rinish — 2026-09-10 so'rovi). */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-primary text-on-primary border-b border-on-primary/10">
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
          {SECTION_ORDER.map((s) => (
            <span
              key={s}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide flex-shrink-0 ${
                s === activeSection
                  ? 'bg-accent text-on-accent'
                  : state.sections[s].locked
                    ? 'text-on-primary/30 line-through'
                    : 'text-on-primary/55'
              }`}
            >
              {SECTION_LABEL[s]}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {saving && (
            <span className="text-[11px] text-on-primary/50 flex items-center gap-1 hidden sm:flex">
              <Check size={11} /> Saqlanmoqda...
            </span>
          )}
          {state.mode === 'practice' && <Badge tone="warning">Mashq rejimi</Badge>}
          {secStarted && (
            <span
              className={`flex items-center gap-1.5 font-mono text-base font-bold px-2.5 py-1 rounded-lg bg-primary-hover ${
                localRemaining < 60 ? 'text-danger' : 'text-on-primary'
              }`}
            >
              <Clock size={15} /> {formatTime(localRemaining)}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        {!secStarted ? (
          <div className="max-w-md mx-auto text-center py-16 px-4">
            <p className="text-lg font-bold text-ink font-display mb-2">{SECTION_LABEL[activeSection]} bo'limi</p>
            <p className="text-sm text-muted mb-6">
              Boshlagach {Math.round(sec.duration / 60)} daqiqa vaqtingiz bo'ladi. Taymer to'xtamaydi.
            </p>
            <Button onClick={() => startSection(activeSection)}>Bo'limni boshlash</Button>
          </div>
        ) : (
          <SectionBody
            section={activeSection}
            content={content.sections[activeSection]}
            answers={state.answers}
            essays={state.essays}
            practiceReveal={state._practiceReveal}
            audioState={audioState}
            highlights={state.highlights}
            onAnswer={saveAnswer}
            onEssay={saveEssay}
            onPlayAudio={playAudio}
            onAddHighlight={addHighlight}
            onRemoveHighlight={removeHighlight}
            onNoteHighlight={noteHighlight}
          />
        )}
      </main>

      {secStarted && (
        <footer className="border-t border-border p-4 flex justify-end">
          {!isLast ? (
            <Button onClick={goToNextSection}>Keyingi bo'lim →</Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Yuborilmoqda...' : 'Imtihonni yakunlash'}
            </Button>
          )}
        </footer>
      )}
    </div>
  );
}

function SectionBody({
  section,
  content,
  answers,
  essays,
  practiceReveal,
  audioState,
  highlights,
  onAnswer,
  onEssay,
  onPlayAudio,
  onAddHighlight,
  onRemoveHighlight,
  onNoteHighlight,
}) {
  const hlProps = { highlights, onAdd: (t) => onAddHighlight(section, t), onRemove: onRemoveHighlight, onNote: onNoteHighlight };

  if (section === 'listening') {
    return (
      <SplitPane
        initialLeftPercent={40}
        left={
          <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted mb-4 max-w-xs">{content.audioLabel}</p>
            <button
              onClick={() => onPlayAudio(content.transcript)}
              className="w-20 h-20 rounded-full bg-accent hover:bg-accent-hover text-on-accent flex items-center justify-center shadow-glow"
              aria-label="Tinglash"
            >
              <Play size={30} className="ml-1" />
            </button>
            {audioState?.replaysBlocked && (
              <p className="text-[11px] text-warning mt-3 max-w-xs">
                Bir marta ijro etiladi — {audioState.offset}s joydan davom etyapti
              </p>
            )}
            <p className="text-[10px] text-muted mt-4 max-w-xs">
              {content.transcript
                ? "Brauzer ovozda o'qib beradi (haqiqiy diktor audiosi emas)."
                : "(Audio fayl hali yuklanmagan — mashq uchun savollarni matn asosida yeching)"}
            </p>
          </div>
        }
        right={
          <div className="p-4 sm:p-6">
            <QuestionList section="listening" questions={content.questions} answers={answers} reveal={practiceReveal} onAnswer={onAnswer} {...hlProps} />
          </div>
        }
      />
    );
  }

  if (section === 'reading') {
    return (
      <SplitPane
        initialLeftPercent={55}
        left={
          <div className="p-4 sm:p-6">
            <h3 className="font-bold text-ink font-display mb-3">{content.passageTitle}</h3>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap select-text">
              <HighlightableText text={content.passage} section="reading" {...hlProps} />
            </p>
          </div>
        }
        right={
          <div className="p-4 sm:p-6">
            <QuestionList section="reading" questions={content.questions} answers={answers} reveal={practiceReveal} onAnswer={onAnswer} {...hlProps} />
          </div>
        }
      />
    );
  }

  if (section === 'writing') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {['task1', 'task2'].map((task) => (
          <div key={task} className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-accent uppercase mb-1.5">{task === 'task1' ? 'Task 1' : 'Task 2'}</p>
            <p className="text-sm text-ink mb-3">{content[task]}</p>
            <textarea
              value={essays[task] || ''}
              onChange={(e) => onEssay(task, e.target.value)}
              rows={8}
              placeholder="Javobingizni shu yerga yozing..."
              className="w-full px-3 py-2.5 bg-bg text-ink border border-border rounded-lg text-sm outline-none focus:border-accent resize-none"
            />
            <p className="text-[11px] text-muted mt-1">
              {(essays[task] || '').trim() ? (essays[task] || '').trim().split(/\s+/).length : 0} so'z
            </p>
          </div>
        ))}
      </div>
    );
  }

  // speaking — imtihon davomida yozib olish/AI-baho integratsiya qilinmagan
  // (alohida /app/gapirish sahifasida to'liq ishlaydi); bu yerda faqat savollar
  // ko'rsatiladi, real imtihonda bo'lgani kabi tayyorgarlik/mulohaza uchun.
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <p className="text-xs text-muted text-center mb-2">
        Speaking bo'limi mock ichida yozib olinmaydi — savollarga ovozli javob berishni mustaqil mashq qiling
        (to'liq AI-baholash uchun alohida "Gapirish" bo'limidan foydalaning).
      </p>
      {content.parts.map((p) => (
        <div key={p.id} className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-accent uppercase mb-1">{p.label}</p>
          <p className="text-sm text-ink">{p.question}</p>
        </div>
      ))}
    </div>
  );
}

function QuestionList({ section, questions, answers, reveal, onAnswer, highlights, onAdd, onRemove, onNote }) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const r = reveal?.[q.id];
        return (
          <div key={q.id} className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-sm font-medium text-ink mb-2.5 select-text">
              {i + 1}.{' '}
              <HighlightableText text={q.text} section={section} highlights={highlights} onAdd={onAdd} onRemove={onRemove} onNote={onNote} />
            </p>
            {q.type === 'gap' ? (
              <GapAnswer questionId={q.id} value={answers?.[q.id]} reveal={r} onAnswer={onAnswer} />
            ) : (
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  // `answers` server'dan undefined kelishi mumkin edi (eski
                  // hujjatlarda) — himoya sifatida optional chaining (asosiy
                  // tuzatish: lib/models.js'dagi minimize:false + engine.ts'dagi
                  // `|| {}`, lekin bu yerda ham ehtiyot chorasi).
                  const selected = answers?.[q.id] === oi;
                  // `r.correct` ba'zan "1,3" kabi vergul bilan yozilgan bo'lishi mumkin
                  // (Cambridge'dagi "TWO letters" turidagi savollar) — shu holda
                  // to'plamdagi HAR BIR indeks "to'g'ri" deb belgilanadi.
                  const correctSet = r ? String(r.correct).split(',').map((s) => s.trim()) : [];
                  let style = 'border-border hover:border-accent/30';
                  if (r) {
                    if (correctSet.includes(String(oi))) style = 'border-green-300 bg-green-50 text-green-700';
                    else if (selected) style = 'border-red-300 bg-accent-soft text-red-700';
                  } else if (selected) {
                    style = 'border-accent bg-accent-soft text-accent';
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => onAnswer(q.id, oi)}
                      className={`w-full text-left px-3 py-2 border rounded-lg text-xs transition-colors ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Gap-fill (note/table/summary completion) — Cambridge'dagi haqiqiy testlar uchun.
// Mahalliy holat blur/Enter'da autosave qiladi (har harfda so'rov yubormaslik uchun).
function GapAnswer({ questionId, value, reveal, onAnswer }) {
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    setDraft(value || '');
  }, [questionId, value]);

  const commit = () => {
    if (draft.trim() && draft !== value) onAnswer(questionId, draft.trim());
  };

  const style = reveal
    ? reveal.isCorrect
      ? 'border-green-300 bg-green-50 text-green-700'
      : 'border-red-300 bg-accent-soft text-red-700'
    : 'bg-bg text-ink border-border focus:border-accent';

  return (
    <div>
      <input
        type="text"
        value={draft}
        disabled={!!reveal}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        placeholder="Javobingiz..."
        className={`w-full px-3 py-2 border rounded-lg text-xs outline-none transition-colors ${style}`}
      />
      {reveal && !reveal.isCorrect && (
        <p className="text-[11px] text-muted mt-1.5">
          To'g'ri javob: <span className="font-semibold text-ink">{String(reveal.correct)}</span>
        </p>
      )}
    </div>
  );
}
