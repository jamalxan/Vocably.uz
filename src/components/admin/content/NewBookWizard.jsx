'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, FileText, Music, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { detectSourceFormat, SOURCE_FORMAT_MIME } from '@/lib/contentAgent/sourceFormat';

// Bitta ekranli yuklash: fayllarni tashlang -> "Yuklash". Hujjat (PDF/DOCX) va
// audio fayllar turiga qarab o'zi ajratiladi, sarlavha fayl nomidan olinadi,
// litsenziya "o'zimniki"/nashr "faqat men" standartda. Qolgan maydonlar
// "Qo'shimcha sozlamalar"da yashirin. Admin (/admin/content/books/new) ham,
// o'qituvchi (/teacher/materials/new) ham shu komponentdan foydalanadi.
// Fayllar R2'ga presigned PUT bilan to'g'ridan-to'g'ri yuklanadi (TZ §4.3).

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

const inputCls =
  'w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40';

function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

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

export default function NewBookWizard({ redirectTo = '/admin/content/books', canPublishPublic = true }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState({}); // { doc: 0..1, [audioIndex]: 0..1 }

  const [docFile, setDocFile] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [autoProcess, setAutoProcess] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [meta, setMeta] = useState({
    publisher: '', volume: '', module: 'academic', licence: 'own', licenceNote: '', publishScope: 'private',
  });

  const publicBlocked = meta.licence === 'third_party_copyright' && meta.publishScope === 'public';
  const canSubmit = !!docFile && !!title.trim() && !publicBlocked && !submitting;

  const addFiles = (fileList) => {
    const rejected = [];
    const newAudio = [];
    let nextDoc = null;
    for (const file of Array.from(fileList || [])) {
      if (detectSourceFormat({ filename: file.name, mimeType: file.type })) {
        nextDoc = file; // bir nechta bo'lsa — oxirgisi
      } else if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(file.name)) {
        newAudio.push(file);
      } else {
        rejected.push(file.name);
      }
    }
    if (nextDoc) {
      setDocFile(nextDoc);
      if (!titleTouched) setTitle(titleFromFilename(nextDoc.name));
    }
    if (newAudio.length) setAudioFiles((prev) => [...prev, ...newAudio]);
    setError(rejected.length ? `Qabul qilinmadi (faqat PDF, DOCX yoki audio): ${rejected.join(', ')}` : '');
  };

  const onPick = (e) => {
    const files = e.target.files;
    addFiles(files);
    e.target.value = '';
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          publisher: meta.publisher.trim(),
          volume: meta.volume ? Number(meta.volume) : null,
          module: meta.module,
          licence: meta.licence,
          licenceNote: meta.licenceNote.trim(),
          publishScope: meta.publishScope,
          pdf: {
            mimeType: docFile.type || SOURCE_FORMAT_MIME[detectSourceFormat({ filename: docFile.name, mimeType: docFile.type }) || 'pdf'],
            size: docFile.size,
            filename: docFile.name,
          },
          audio: audioFiles.map((f) => ({ mimeType: f.type || 'audio/mpeg', size: f.size, filename: f.name })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Material yaratib bo'lmadi");
        setSubmitting(false);
        return;
      }

      await uploadWithProgress(data.uploadUrls.pdf.uploadUrl, docFile, (p) => setProgress((s) => ({ ...s, doc: p })));
      for (let i = 0; i < data.uploadUrls.audio.length; i++) {
        await uploadWithProgress(data.uploadUrls.audio[i].uploadUrl, audioFiles[i], (p) => setProgress((s) => ({ ...s, [i]: p })));
      }

      if (autoProcess) {
        // Ishlov berishni navbatga qo'yish; xato bo'lsa material baribir yuklangan —
        // foydalanuvchi ro'yxatdan qayta urinishi mumkin.
        await fetch(`/api/admin/books/${data.bookId}/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        }).catch(() => {});
      }

      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Yuklashda xatolik yuz berdi');
      setSubmitting(false);
    }
  };

  const hasFiles = docFile || audioFiles.length > 0;

  return (
    <div className="max-w-2xl space-y-5">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 px-4 text-center cursor-pointer focus-within:ring-2 focus-within:ring-accent transition-colors ${
          dragging ? 'border-accent bg-accent-soft' : 'border-border hover:border-accent/40 bg-surface'
        }`}
      >
        <Upload size={26} className="text-accent" />
        <span className="text-sm font-semibold text-ink">Fayllarni shu yerga tashlang yoki bosib tanlang</span>
        <span className="text-xs text-muted">PDF yoki DOCX (kitob) + ixtiyoriy audio fayllar. Hammasini birdan tanlash mumkin.</span>
        <input
          type="file"
          multiple
          accept={`${SOURCE_FORMAT_MIME.pdf},.pdf,${SOURCE_FORMAT_MIME.docx},.docx,audio/*`}
          className="sr-only"
          onChange={onPick}
          disabled={submitting}
        />
      </label>

      {hasFiles && (
        <div className="space-y-2">
          {docFile && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-surface border border-border rounded-lg text-sm">
              <FileText size={16} className="text-accent flex-shrink-0" />
              <span className="flex-1 min-w-0 truncate">{docFile.name}</span>
              <span className="text-xs text-muted flex-shrink-0">
                {submitting ? `${Math.round((progress.doc || 0) * 100)}%` : `${mb(docFile.size)} MB`}
              </span>
              {!submitting && (
                <button onClick={() => setDocFile(null)} aria-label="Faylni olib tashlash" className="min-w-11 min-h-11 -my-3 -mr-3 flex items-center justify-center rounded-lg text-muted hover:text-danger flex-shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          {audioFiles.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-2.5 px-3 py-2 bg-surface border border-border rounded-lg text-sm">
              <Music size={15} className="text-accent flex-shrink-0" />
              <span className="flex-1 min-w-0 truncate">{f.name}</span>
              <span className="text-xs text-muted flex-shrink-0">
                {submitting ? `${Math.round((progress[i] || 0) * 100)}%` : `${mb(f.size)} MB`}
              </span>
              {!submitting && (
                <button onClick={() => setAudioFiles((prev) => prev.filter((_, j) => j !== i))} aria-label="Audio faylni olib tashlash" className="min-w-11 min-h-11 -my-3 -mr-3 flex items-center justify-center rounded-lg text-muted hover:text-danger flex-shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {docFile && (
        <div>
          <label htmlFor="material-title" className="block text-sm font-semibold text-ink mb-1.5">Nomi</label>
          <input
            id="material-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }}
            placeholder="Cambridge IELTS 19"
            disabled={submitting}
            className={inputCls}
          />
        </div>
      )}

      {docFile && (
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer min-h-11">
            <input type="checkbox" checked={autoProcess} onChange={(e) => setAutoProcess(e.target.checked)} disabled={submitting} className="w-4 h-4 accent-[var(--accent,currentColor)]" />
            Yuklangach darrov testlarga ajratish (ishlov berish)
          </label>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink min-h-11 md:min-h-0"
          >
            <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} /> Qo'shimcha sozlamalar
          </button>

          {showMore && (
            <div className="space-y-4 bg-surface border border-border rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Nashriyot</label>
                  <input value={meta.publisher} onChange={(e) => setMeta((m) => ({ ...m, publisher: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Jild</label>
                  <input type="number" value={meta.volume} onChange={(e) => setMeta((m) => ({ ...m, volume: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Modul</label>
                  <select value={meta.module} onChange={(e) => setMeta((m) => ({ ...m, module: e.target.value }))} className={inputCls}>
                    <option value="academic">Academic</option>
                    <option value="general">General Training</option>
                    <option value="both">Ikkalasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Litsenziya</label>
                  <select value={meta.licence} onChange={(e) => setMeta((m) => ({ ...m, licence: e.target.value }))} className={inputCls}>
                    {LICENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              {canPublishPublic && (
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Nashr doirasi</label>
                  <select value={meta.publishScope} onChange={(e) => setMeta((m) => ({ ...m, publishScope: e.target.value }))} className={inputCls}>
                    {SCOPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
              {publicBlocked && (
                <p className="text-xs text-danger">
                  Uchinchi tomon mualliflik huquqidagi materialni ommaviy nashr qilib bo'lmaydi — "Nashr doirasi"ni o'zgartiring.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 min-h-11 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-lg text-sm font-semibold transition-colors"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        {submitting ? 'Yuklanmoqda...' : 'Yuklash'}
      </button>
    </div>
  );
}
