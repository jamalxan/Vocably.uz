'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle, Upload, Download, Plus, Search, Trash2, X } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const STATUS_TONE = { DRAFT: 'neutral', AI_GENERATED: 'info', UNDER_REVIEW: 'warning', APPROVED: 'accent', REJECTED: 'danger', PUBLISHED: 'success', ARCHIVED: 'neutral' };
const STATUS_LABEL = { DRAFT: 'Qoralama', AI_GENERATED: 'AI yaratgan', UNDER_REVIEW: "Ko'rib chiqilmoqda", APPROVED: 'Tasdiqlangan', REJECTED: 'Rad etilgan', PUBLISHED: 'Nashr qilingan', ARCHIVED: 'Arxiv' };
// Holat mashinasi (src/lib/vocab/library.ts bilan bir xil) — tugmalarni ko'rsatish uchun; haqiqiy tekshiruv serverda.
const NEXT = {
  DRAFT: ['UNDER_REVIEW', 'APPROVED', 'ARCHIVED'],
  AI_GENERATED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'UNDER_REVIEW', 'ARCHIVED'],
  REJECTED: ['DRAFT', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'UNDER_REVIEW'],
  ARCHIVED: ['DRAFT'],
};
const EMPTY = { word: '', pos: 'verb', cefr: 'B2', ieltsRelevance: 0, translationUz: '', shortDefinition: '', ipaUk: '', imageUrl: '', example: '', synonyms: '', topicTags: '' };
const inputCls = 'w-full bg-bg-sunken border border-border rounded-xl px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

async function api(url, options) {
  const res = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Xatolik');
  return data;
}

// TZ §29–§32: global lug'at kutubxonasi — yaratish/tahrirlash, CSV import/export, review → publish oqimi.
export default function AdminVocabLibrary() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | {id?, ...fields}
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);

  // ?status=AI_GENERATED bilan ochilsa (masalan fabrikadan) filtr oldindan tanlanadi — SSR bilan mos kelishi uchun mount'dan keyin.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('status') || '';
    if (Object.prototype.hasOwnProperty.call(STATUS_LABEL, s)) setStatus(s);
  }, []);

  const load = useCallback(async () => {
    try {
      const sp = new URLSearchParams({ page: String(page), limit: '25' });
      if (q.trim()) sp.set('q', q.trim());
      if (status) sp.set('status', status);
      setData(await api(`/api/admin/vocab-library?${sp}`));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [q, status, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0); // qidiruvda debounce
    return () => clearTimeout(t);
  }, [load, q]);

  const run = async (fn, okMsg) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      if (okMsg) setNotice(okMsg);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      const body = {
        word: form.word,
        pos: form.pos,
        cefr: form.cefr,
        ieltsRelevance: Number(form.ieltsRelevance) || 0,
        translationUz: form.translationUz,
        shortDefinition: form.shortDefinition,
        ipaUk: form.ipaUk,
        imageUrl: form.imageUrl,
        synonyms: form.synonyms,
        topicTags: form.topicTags,
        examples: form.example.trim() ? [{ en: form.example.trim() }, ...(form.moreExamples || [])] : form.moreExamples || [],
      };
      if (form.id) await api(`/api/admin/vocab-library/${form.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await api('/api/admin/vocab-library', { method: 'POST', body: JSON.stringify(body) });
      setForm(null);
    }, 'Saqlandi');

  const edit = (e) =>
    setForm({
      id: e.id,
      word: e.word,
      pos: e.pos || 'verb',
      cefr: e.cefr || 'B2',
      ieltsRelevance: e.ieltsRelevance || 0,
      translationUz: e.translationUz || '',
      shortDefinition: e.shortDefinition || '',
      ipaUk: e.ipaUk || '',
      imageUrl: e.imageUrl || '',
      example: e.examples?.[0]?.en || '',
      moreExamples: (e.examples || []).slice(1),
      synonyms: (e.synonyms || []).join('; '),
      topicTags: (e.topicTags || []).join('; '),
    });

  const move = (e, to) => {
    const note = to === 'REJECTED' ? window.prompt('Rad etish sababi (ixtiyoriy):') ?? '' : '';
    return run(() => api(`/api/admin/vocab-library/${e.id}/status`, { method: 'POST', body: JSON.stringify({ to, note }) }), `${e.word}: ${STATUS_LABEL[to]}`);
  };

  const remove = (e) => {
    if (!window.confirm(`"${e.word}" o'chirilsinmi?`)) return;
    return run(() => api(`/api/admin/vocab-library/${e.id}`, { method: 'DELETE' }), "O'chirildi");
  };

  const onFile = (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    const ai = window.confirm("Bu fayl AI yaratganmi? (OK — AI_GENERATED, Cancel — oddiy qoralama)");
    run(async () => {
      const csv = await file.text();
      const r = await api('/api/admin/vocab-library/import', { method: 'POST', body: JSON.stringify({ csv, aiGenerated: ai }) });
      setNotice(`Import: ${r.created} ta qo'shildi, ${r.duplicates} ta takror, ${r.invalid} ta xato${r.errors?.length ? ` (masalan, qator ${r.errors[0].line}: ${r.errors[0].error})` : ''}`);
    });
  };

  const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }));

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink font-display">Lug&apos;at kutubxonasi</h1>
          <p className="text-sm text-muted mt-1">Foydalanuvchilar faqat &quot;Nashr qilingan&quot; so&apos;zlarni ko&apos;radi. AI yaratgan kontent tasdiqlanmaguncha nashr qilinmaydi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload size={14} aria-hidden="true" /> CSV import
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} aria-label="CSV faylni tanlang" />
          <a href={`/api/admin/vocab-library/export${status ? `?status=${status}` : ''}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface text-ink border border-border hover:bg-bg-sunken">
            <Download size={14} aria-hidden="true" /> CSV export
          </a>
          <Button size="sm" onClick={() => setForm({ ...EMPTY })} disabled={busy}>
            <Plus size={14} aria-hidden="true" /> Yangi so&apos;z
          </Button>
        </div>
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

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="So'z, tarjima, mavzu…" aria-label="Qidirish" className={`${inputCls} pl-9`} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Holat bo'yicha filtr" className={`${inputCls} w-auto`}>
          <option value="">Barcha holatlar{data ? ` (${Object.values(data.counts).reduce((a, b) => a + b, 0)})` : ''}</option>
          {Object.keys(STATUS_LABEL).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}{data?.counts?.[s] ? ` (${data.counts[s]})` : ''}
            </option>
          ))}
        </select>
      </div>

      {!data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={26} />
        </div>
      ) : data.items.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">Hech narsa topilmadi. CSV import qiling yoki yangi so&apos;z qo&apos;shing.</p>
      ) : (
        <ul className="grid gap-2">
          {data.items.map((e) => (
            <li key={e.id} className="bg-surface border border-border rounded-2xl p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => edit(e)} className="text-base font-semibold text-ink hover:underline break-words text-left">
                      {e.word}
                    </button>
                    {e.pos && <span className="text-xs text-muted">{e.pos}</span>}
                    {e.cefr && <Badge tone="accent">{e.cefr}</Badge>}
                    <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                    {e.aiGenerated && <Badge tone="info">AI</Badge>}
                    <span className="text-[11px] text-muted">v{e.contentVersion}</span>
                  </div>
                  <p className="text-sm text-muted mt-1 break-words">{e.translationUz || '—'} · {e.shortDefinition || '—'}</p>
                  {e.reviewNote && <p className="text-xs text-warning mt-1">Izoh: {e.reviewNote}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {NEXT[e.status].map((to) => (
                    <Button key={to} variant={to === 'PUBLISHED' ? 'primary' : to === 'REJECTED' ? 'danger' : 'secondary'} size="sm" disabled={busy} onClick={() => move(e, to)}>
                      {STATUS_LABEL[to]}
                    </Button>
                  ))}
                  {e.status !== 'PUBLISHED' && (
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => remove(e)} aria-label={`${e.word} ni o'chirish`}>
                      <Trash2 size={14} aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Oldingi</Button>
          <span className="text-muted tabular-nums">{page} / {data.pages}</span>
          <Button variant="secondary" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Keyingi</Button>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={form.id ? "So'zni tahrirlash" : "Yangi so'z"}>
          <div className="bg-surface w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink font-display">{form.id ? "So'zni tahrirlash" : "Yangi so'z"}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Yopish" className="p-2 rounded-lg hover:bg-bg-sunken text-muted">
                <X size={18} />
              </button>
            </div>
            <label className="block text-xs text-muted">So&apos;z *<input value={form.word} onChange={set('word')} className={inputCls} maxLength={80} /></label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-xs text-muted">Turkum
                <select value={form.pos} onChange={set('pos')} className={inputCls}>
                  {['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'phrasal_verb'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted">CEFR
                <select value={form.cefr} onChange={set('cefr')} className={inputCls}>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted">IELTS (0–3)
                <input type="number" min={0} max={3} value={form.ieltsRelevance} onChange={set('ieltsRelevance')} className={inputCls} />
              </label>
            </div>
            <label className="block text-xs text-muted">O&apos;zbekcha tarjima *<input value={form.translationUz} onChange={set('translationUz')} className={inputCls} /></label>
            <label className="block text-xs text-muted">Qisqa ta&apos;rif (inglizcha) *<input value={form.shortDefinition} onChange={set('shortDefinition')} className={inputCls} /></label>
            <label className="block text-xs text-muted">Misol gap *<input value={form.example} onChange={set('example')} className={inputCls} /></label>
            <label className="block text-xs text-muted">Rasm URL (ixtiyoriy — Rasm↔So&apos;z o&apos;yinlari uchun, https:// yoki /)<input value={form.imageUrl} onChange={set('imageUrl')} className={inputCls} placeholder="https://…" /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs text-muted">IPA (UK)<input value={form.ipaUk} onChange={set('ipaUk')} className={inputCls} /></label>
              <label className="block text-xs text-muted">Sinonimlar (; bilan)<input value={form.synonyms} onChange={set('synonyms')} className={inputCls} /></label>
            </div>
            <label className="block text-xs text-muted">Mavzular (; bilan)<input value={form.topicTags} onChange={set('topicTags')} className={inputCls} /></label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setForm(null)}>Bekor qilish</Button>
              <Button onClick={save} disabled={busy || !form.word.trim()}>{busy ? <Loader2 size={14} className="animate-spin" /> : 'Saqlash'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
