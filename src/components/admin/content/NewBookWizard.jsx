'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, Upload, FileText, Music, X, ShieldAlert } from 'lucide-react';
import { detectSourceFormat, SOURCE_FORMAT_MIME } from '@/lib/contentAgent/sourceFormat';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §11.1 — "Yangi kitob — 4
// qadamli sehrgar". M1 doirasida faqat YUKLASH ishlaydi (§19 M1 qabul
// mezoni): fayllar R2'ga presigned PUT bilan to'g'ridan-to'g'ri yuklanadi,
// kitob hujjati yaratiladi, so'ng "Ishlov berish" bosilsa job'lar navbatga
// qo'yiladi ('queued' holatida — worker hali ulanmagan, TZ §7/§21 izohiga q.
// src/app/api/admin/books/[id]/ingest/route.js).
const STEPS = ['Fayllar', "Ma'lumot", 'Sozlamalar', 'Tasdiqlash'];

const LICENCE_OPTIONS = [
  { value: 'own', label: "O'zimniki" },
  { value: 'licensed', label: 'Litsenziyali' },
  { value: 'public_domain', label: 'Public domain' },
  { value: 'third_party_copyright', label: 'Uchinchi tomon mualliflik huquqi' },
];
const SCOPE_OPTIONS = [
  { value: 'private', label: 'Faqat men' },
  { value: 'internal', label: "Ichki (o'quv markazim)" },
  { value: 'public', label: 'Ommaviy' },
];

function uploadWithProgress(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Yuklashda xatolik (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Tarmoq xatoligi'));
    xhr.send(file);
  });
}

export default function NewBookWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { pdf: 0..1, [audioIndex]: 0..1 }

  const [pdfFile, setPdfFile] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);

  const [meta, setMeta] = useState({
    title: '', publisher: '', series: '', volume: '', module: 'academic',
    licence: 'own', licenceNote: '', publishScope: 'private',
  });

  const publicBlocked = meta.licence === 'third_party_copyright' && meta.publishScope === 'public';

  const canNext =
    (step === 0 && !!pdfFile) ||
    (step === 1 && meta.title.trim() && meta.licence && !publicBlocked) ||
    step === 2;

  const handlePdfPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    // §50.2 — endi PDF YOKI DOCX qabul qilinadi. `accept` atributi hamma
    // brauzer/OS'da qattiq cheklamaydi (masalan "Barcha fayllar" tanlansa),
    // shuning uchun bu yerda ham xuddi server (`@/lib/contentAgent/
    // sourceFormat`, BIR XIL funksiya) bilan tekshiriladi — noto'g'ri fayl
    // R2'ga yuklanguncha emas, TANLASH paytidayoq rad etiladi.
    if (!detectSourceFormat({ filename: file.name, mimeType: file.type })) {
      setError("Faqat PDF yoki DOCX fayl qabul qilinadi.");
      return;
    }
    setError('');
    setPdfFile(file);
  };
  const handleAudioPick = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length) setAudioFiles((prev) => [...prev, ...files]);
  };
  const removeAudio = (idx) => setAudioFiles((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meta.title.trim(),
          publisher: meta.publisher.trim(),
          series: meta.series.trim(),
          volume: meta.volume ? Number(meta.volume) : null,
          module: meta.module,
          licence: meta.licence,
          licenceNote: meta.licenceNote.trim(),
          publishScope: meta.publishScope,
          pdf: {
            mimeType: pdfFile.type || SOURCE_FORMAT_MIME[detectSourceFormat({ filename: pdfFile.name, mimeType: pdfFile.type }) || 'pdf'],
            size: pdfFile.size,
            filename: pdfFile.name,
          },
          audio: audioFiles.map((f) => ({ mimeType: f.type || 'audio/mpeg', size: f.size, filename: f.name })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kitob yaratib bo'lmadi");
        setSubmitting(false);
        return;
      }

      // Fayllar to'g'ridan-to'g'ri R2'ga (Next.js serveri orqali o'tmasdan) —
      // TZ §4.3.
      await uploadWithProgress(data.uploadUrls.pdf.uploadUrl, pdfFile, (p) => setUploadProgress((s) => ({ ...s, pdf: p })));
      for (let i = 0; i < data.uploadUrls.audio.length; i++) {
        await uploadWithProgress(data.uploadUrls.audio[i].uploadUrl, audioFiles[i], (p) => setUploadProgress((s) => ({ ...s, [i]: p })));
      }

      router.push('/admin/content/books');
    } catch (err) {
      setError(err.message || "Yuklashda xatolik yuz berdi");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <ol className="flex items-center gap-2 mb-2 sm:mb-6">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? 'step' : undefined}
            className={`flex items-center gap-2 min-w-0 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === step ? 'bg-accent text-on-accent' : i < step ? 'bg-success-soft text-success border border-success/30' : 'bg-bg text-muted'
              }`}
            >
              {i + 1}
            </div>
            {/* Telefonda yorliqlar yashirin — faqat faol qadam nomi pastda ko'rsatiladi. */}
            <span className={`hidden sm:inline text-xs font-medium whitespace-nowrap ${i === step ? 'text-ink' : 'text-muted'}`}>{label}</span>
            <span className="sr-only sm:hidden">{label}</span>
            {i < STEPS.length - 1 && <div className="flex-1 min-w-3 h-px bg-border" />}
          </li>
        ))}
      </ol>
      <p className="sm:hidden mb-4 text-xs font-medium text-ink" aria-hidden="true">
        {step + 1}/{STEPS.length} — {STEPS[step]}
      </p>

      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Kitob fayli (PDF yoki DOCX)</label>
              {pdfFile ? (
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-bg rounded-lg text-sm">
                  <FileText size={16} className="text-accent flex-shrink-0" />
                  <span className="flex-1 min-w-0 truncate">{pdfFile.name}</span>
                  <span className="text-xs text-muted flex-shrink-0">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button onClick={() => setPdfFile(null)} aria-label="Faylni olib tashlash" className="min-w-11 min-h-11 -my-3 -mr-3 flex items-center justify-center rounded-lg text-muted hover:text-danger flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-8 px-3 text-center cursor-pointer hover:border-accent/40 focus-within:ring-2 focus-within:ring-accent transition-colors">
                  <Upload size={22} className="text-muted" />
                  <span className="text-sm text-muted">PDF yoki DOCX faylni tanlang (maks. 500 MB)</span>
                  <input
                    type="file"
                    accept={`${SOURCE_FORMAT_MIME.pdf},.pdf,${SOURCE_FORMAT_MIME.docx},.docx`}
                    className="sr-only"
                    onChange={handlePdfPick}
                  />
                </label>
              )}
              {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Audio fayllar (ixtiyoriy)</label>
              <div className="space-y-2 mb-2">
                {audioFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-bg rounded-lg text-sm">
                    <Music size={15} className="text-accent flex-shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{f.name}</span>
                    <span className="text-xs text-muted flex-shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button onClick={() => removeAudio(i)} aria-label="Audio faylni olib tashlash" className="min-w-11 min-h-11 -my-3 -mr-3 flex items-center justify-center rounded-lg text-muted hover:text-danger flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3 cursor-pointer hover:border-accent/40 focus-within:ring-2 focus-within:ring-accent transition-colors text-sm text-muted">
                <Upload size={15} /> Audio fayl(lar) qo'shish
                <input type="file" accept="audio/*" multiple className="sr-only" onChange={handleAudioPick} />
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Sarlavha *</label>
              <input
                value={meta.title}
                onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                placeholder="Cambridge IELTS 19"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Nashriyot</label>
                <input
                  value={meta.publisher}
                  onChange={(e) => setMeta((m) => ({ ...m, publisher: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Jild</label>
                <input
                  type="number"
                  value={meta.volume}
                  onChange={(e) => setMeta((m) => ({ ...m, volume: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Modul</label>
              <select
                value={meta.module}
                onChange={(e) => setMeta((m) => ({ ...m, module: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
              >
                <option value="academic">Academic</option>
                <option value="general">General Training</option>
                <option value="both">Ikkalasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Litsenziya *</label>
              <select
                value={meta.licence}
                onChange={(e) => setMeta((m) => ({ ...m, licence: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
              >
                {LICENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Nashr doirasi</label>
              <select
                value={meta.publishScope}
                onChange={(e) => setMeta((m) => ({ ...m, publishScope: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
              >
                {SCOPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {publicBlocked && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-danger-soft rounded-lg text-xs text-danger">
                <ShieldAlert size={15} className="flex-shrink-0 mt-0.5" />
                Uchinchi tomon mualliflik huquqidagi kitobni ommaviy nashr qilib bo'lmaydi — "Nashr doirasi"ni "Faqat men" yoki "Ichki"ga o'zgartiring.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm text-ink">
            <p className="text-muted">
              Fayllar yuklangach, "Ishlov berishni boshlash" kitob sahifasida bosiladi — bosqichlar
              (matn ajratish, testlarga bo'lish, savol tahlili, audio kesish, QA) worker ulanganda
              avtomatik ishga tushadi. Hozircha worker ulanmagan — bosqichlar navbatda kutadi.
            </p>
            <div className="px-3 py-2.5 bg-bg rounded-lg text-xs text-muted">
              <p><strong className="text-ink">{pdfFile?.name}</strong> — {pdfFile ? (pdfFile.size / 1024 / 1024).toFixed(1) : 0} MB</p>
              <p className="mt-1">{audioFiles.length} ta audio fayl</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="px-3 py-2.5 bg-bg rounded-lg space-y-1">
              <p><span className="text-muted">Sarlavha:</span> <span className="text-ink font-semibold">{meta.title}</span></p>
              <p><span className="text-muted">Modul:</span> <span className="text-ink">{meta.module}</span></p>
              <p><span className="text-muted">Litsenziya:</span> <span className="text-ink">{LICENCE_OPTIONS.find((o) => o.value === meta.licence)?.label}</span></p>
              <p><span className="text-muted">Nashr doirasi:</span> <span className="text-ink">{SCOPE_OPTIONS.find((o) => o.value === meta.publishScope)?.label}</span></p>
              <p><span className="text-muted">Fayllar:</span> <span className="text-ink">1 {pdfFile?.name?.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF'} + {audioFiles.length} audio</span></p>
            </div>
            {submitting && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted">Hujjat: {Math.round((uploadProgress.pdf || 0) * 100)}%</p>
                {audioFiles.map((f, i) => (
                  <p key={i} className="text-xs text-muted">{f.name}: {Math.round((uploadProgress[i] || 0) * 100)}%</p>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink disabled:opacity-40 transition-colors"
        >
          <ArrowLeft size={15} /> Orqaga
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-lg text-sm font-semibold transition-colors"
          >
            Keyingi <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-lg text-sm font-semibold transition-colors"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />} Yuklash va yaratish
          </button>
        )}
      </div>
    </div>
  );
}
