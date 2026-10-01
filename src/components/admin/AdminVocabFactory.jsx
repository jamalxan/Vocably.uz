'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, FileText, Loader2, Pause, Play, Trash2, Upload } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MAX_UPLOAD_BYTES, splitRanges } from '@/lib/vocab/uploadParts';

const STATUS_TONE = { queued: 'neutral', processing: 'info', done: 'success', cancelled: 'warning' };
const STATUS_LABEL = { queued: 'Navbatda', processing: 'Ishlanmoqda', done: 'Tugadi', cancelled: 'Bekor qilindi' };
const inputCls = 'w-full bg-bg-sunken border border-border rounded-xl px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

async function api(url, options) {
  const isForm = options?.body instanceof FormData;
  const res = await fetch(url, { credentials: 'same-origin', headers: isForm ? undefined : { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Xatolik');
  return data;
}

function Progress({ job }) {
  const { total, done, failed } = job.chunks;
  const pct = total ? Math.round(((done + failed) / total) * 100) : 0;
  return (
    <div>
      <div className="h-2 rounded-full bg-bg-sunken overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Bajarilish">
        <div className="h-full bg-accent transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted mt-1 tabular-nums">
        {done + failed} / {total} bo&apos;lak{failed ? ` · ${failed} ta xato` : ''}
      </p>
    </div>
  );
}

// TZ §29: Content Factory — PDF/DOCX/TXT -> bo'laklar -> AI so'z tahlili -> AI_GENERATED yozuvlar -> inson ko'rib chiqishi.
export default function AdminVocabFactory() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [progress, setProgress] = useState('');
  const [running, setRunning] = useState(null); // ishlayotgan job id
  const stopRef = useRef(false);
  const fileRef = useRef(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await api('/api/admin/vocab-factory');
      if (mounted.current) setJobs(d.jobs);
    } catch (e) {
      if (mounted.current) setError(e.message);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
      stopRef.current = true;
    };
  }, [load]);

  const patchJob = (job) => setJobs((cur) => (cur ? cur.map((j) => (j.id === job.id ? job : j)) : cur));

  // Navbat bo'laklarini ketma-ket ishlaydi; sahifa yopilsa/pauza bosilsa to'xtaydi (holat serverda saqlanadi, davom ettiriladi).
  const runLoop = useCallback(async (id) => {
    stopRef.current = false;
    setRunning(id);
    setError('');
    try {
      for (;;) {
        if (stopRef.current || !mounted.current) break;
        const { job } = await api(`/api/admin/vocab-factory/${id}/run`, { method: 'POST', body: '{}' });
        if (!mounted.current) return;
        patchJob(job);
        if (job.chunks.pending + job.chunks.processing === 0 || job.cancelled) {
          setNotice(`Tugadi: ${job.created} ta yangi so'z kutubxonaga AI_GENERATED sifatida qo'shildi.`);
          break;
        }
      }
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current) setRunning(null);
    }
  }, []);

  const create = async (body) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { job } = await api('/api/admin/vocab-factory', { method: 'POST', body });
      setJobs((cur) => [job, ...(cur || [])]);
      setText('');
      runLoop(job.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Fayl 3 MB li qismlarga bo'lib yuboriladi (Vercel so'rov chegarasi), oxirida server yig'adi:
  // matn qatlami bor hujjat — oddiy ish, skanerlangan PDF — OCR ishi.
  const onFile = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`Fayl juda katta (maks ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`);
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const uploadId = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, '');
      const ranges = splitRanges(file.size);
      for (let i = 0; i < ranges.length; i++) {
        setProgress(`Yuklanmoqda: ${i + 1} / ${ranges.length}`);
        const form = new FormData();
        form.append('uploadId', uploadId);
        form.append('index', String(i));
        form.append('total', String(ranges.length));
        form.append('file', file.slice(ranges[i].start, ranges[i].end), `${i}.part`);
        await api('/api/admin/vocab-factory/upload', { method: 'POST', body: form });
      }
      setProgress('Fayl tahlil qilinmoqda…');
      const { job } = await api('/api/admin/vocab-factory/upload/complete', {
        method: 'POST',
        body: JSON.stringify({ uploadId, total: ranges.length, filename: file.name }),
      });
      setJobs((cur) => [job, ...(cur || [])]);
      if (job.ocr) setNotice(`Skanerlangan PDF: ${job.pages} sahifa OCR qilinadi (AI orqali, sekinroq).`);
      runLoop(job.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setProgress('');
      if (mounted.current) setBusy(false);
    }
  };

  const cancel = async (id) => {
    stopRef.current = true;
    try {
      patchJob((await api(`/api/admin/vocab-factory/${id}`, { method: 'PATCH', body: JSON.stringify({ cancel: true }) })).job);
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Ish o'chirilsinmi? Yaratilgan so'zlar kutubxonada qoladi.")) return;
    try {
      await api(`/api/admin/vocab-factory/${id}`, { method: 'DELETE' });
      setJobs((cur) => cur.filter((j) => j.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-ink font-display">Lug&apos;at fabrikasi (AI)</h1>
        <p className="text-sm text-muted mt-1">
          Kitob yoki material yuklang — AI matndan foydali so&apos;zlarni ajratib, tarjima, ta&apos;rif va misollar bilan to&apos;ldiradi.
          Natijalar <strong>AI_GENERATED</strong> holatida <Link href="/admin/vocab-library?status=AI_GENERATED" className="text-accent hover:underline">kutubxonada</Link> ko&apos;rib chiqilgach nashr qilinadi.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={16} aria-hidden="true" /> {error}
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm text-success bg-success-soft border border-success/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}

      <section className="bg-surface border border-border rounded-2xl p-4 space-y-3" aria-label="Yangi ish">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => fileRef.current?.click()} disabled={busy || !!running}>
            {busy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Upload size={14} aria-hidden="true" />} Fayl yuklash
          </Button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={onFile} aria-label="PDF, DOCX yoki TXT faylni tanlang" />
          <span className="text-xs text-muted" role="status">
            {progress || 'PDF · DOCX · TXT, 25 MB gacha. Skanerlangan PDF — OCR bilan (14 MB gacha, sekinroq, GEMINI_API_KEY kerak).'}
          </span>
        </div>
        <label className="block text-xs text-muted">
          Yoki matnni to&apos;g&apos;ridan-to&apos;g&apos;ri qo&apos;ying
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={`${inputCls} mt-1`} placeholder="Reading matni, maqola, kitob bobi…" />
        </label>
        <Button variant="secondary" disabled={busy || !!running || text.trim().length < 200} onClick={() => create(JSON.stringify({ text, filename: 'qo‘lda kiritilgan matn' }))}>
          <FileText size={14} aria-hidden="true" /> Matndan boshlash
        </Button>
        <p className="text-xs text-muted">AI ga faqat matn bo&apos;laklari yuboriladi (foydalanuvchi ma&apos;lumotlari emas). Nashr — faqat sizning tasdig&apos;ingizdan keyin.</p>
      </section>

      {!jobs ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">Hali ishlar yo&apos;q.</p>
      ) : (
        <ul className="grid gap-3">
          {jobs.map((j) => {
            const active = running === j.id;
            const open = j.chunks.pending + j.chunks.processing > 0 && !j.cancelled;
            return (
              <li key={j.id} className="bg-surface border border-border rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink break-words">{j.filename || 'Nomsiz'}</p>
                    <p className="text-xs text-muted">
                      {new Date(j.createdAt).toLocaleString('uz-UZ')} · {j.ocr ? `OCR · ${j.pages} sahifa` : `${j.charCount.toLocaleString('en')} belgi`}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[j.status]}>{STATUS_LABEL[j.status]}</Badge>
                </div>
                <Progress job={j} />
                <p className="text-xs text-muted">
                  Yangi so&apos;z: <strong className="text-ink">{j.created}</strong> · mashq: {j.exercises || 0}
                  {j.exerciseErrors ? ` (${j.exerciseErrors} bo'lakda mashq xatosi)` : ''} · takror: {j.duplicates} · rad etilgan (AI xatosi): {j.rejected}
                </p>
                {j.errors.length > 0 && (
                  <p className="text-xs text-danger break-words">
                    Xato: bo&apos;lak {j.errors[0].index + 1} — {j.errors[0].error}
                  </p>
                )}
                {j.rejectedSamples.length > 0 && (
                  <details className="text-xs text-muted">
                    <summary className="cursor-pointer">Rad etilgan namunalar</summary>
                    <ul className="mt-1 list-disc pl-4">
                      {j.rejectedSamples.slice(-8).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </details>
                )}
                <div className="flex flex-wrap gap-2">
                  {open && !active && (
                    <Button size="sm" onClick={() => runLoop(j.id)} disabled={!!running}>
                      <Play size={14} aria-hidden="true" /> {j.chunks.done + j.chunks.failed ? 'Davom ettirish' : 'Boshlash'}
                    </Button>
                  )}
                  {active && (
                    <Button size="sm" variant="secondary" onClick={() => (stopRef.current = true)}>
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" /> <Pause size={14} aria-hidden="true" /> Pauza
                    </Button>
                  )}
                  {open && (
                    <Button size="sm" variant="ghost" onClick={() => cancel(j.id)} disabled={active}>
                      Bekor qilish
                    </Button>
                  )}
                  {j.created > 0 && (
                    <Link href="/admin/vocab-library?status=AI_GENERATED" className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface text-ink border border-border hover:bg-bg-sunken">
                      Ko&apos;rib chiqish
                    </Link>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(j.id)} disabled={active} aria-label="Ishni o'chirish">
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
