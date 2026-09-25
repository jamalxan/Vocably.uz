'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Loader2, Trash2, ArrowUp, ArrowDown, Upload, Pencil, Check, X, Lock, AlertCircle } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import ConfirmModal from '@/components/ConfirmModal';

// Admin: stiker to'plamlarini yaratish/tahrirlash. Stiker fayllari brauzerdan
// to'g'ridan-to'g'ri S3'ga yuklanadi (presign -> PUT -> commit), server faylni
// haqiqiy formati va hajmi bo'yicha tekshiradi (src/app/api/admin/stickers/...).
const ACCEPT = 'image/png,image/webp,image/gif';
const MAX_BYTES = 512 * 1024;

async function api(url, options) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { error: data.error || "Xatolik yuz berdi" };
  } catch {
    return { error: 'Tarmoq xatosi' };
  }
}

function labelFromFileName(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 40);
}

async function uploadOne(packId, file) {
  if (!ACCEPT.split(',').includes(file.type)) return { error: 'Faqat PNG, WEBP yoki GIF' };
  if (file.size > MAX_BYTES) return { error: '512 KB dan katta' };

  const base = `/api/admin/stickers/${packId}/stickers`;
  const pre = await api(base, { method: 'POST', body: JSON.stringify({ action: 'presign', mimeType: file.type, size: file.size }) });
  if (pre.error) return pre;

  try {
    const put = await fetch(pre.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!put.ok) return { error: "S3'ga yuklanmadi" };
  } catch {
    return { error: "S3'ga yuklanmadi" };
  }

  return api(base, {
    method: 'POST',
    body: JSON.stringify({ action: 'commit', stickerId: pre.stickerId, mimeType: file.type, label: labelFromFileName(file.name) }),
  });
}

function StickerTile({ packId, sticker, onPackChange }) {
  const [label, setLabel] = useState(sticker.label);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setLabel(sticker.label), [sticker.label]);

  const saveLabel = async () => {
    if (label.trim() === sticker.label) return;
    setSaving(true);
    const res = await api(`/api/admin/stickers/${packId}/stickers/${sticker.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ label }),
    });
    setSaving(false);
    if (res.error) {
      alert(res.error);
      setLabel(sticker.label);
    } else onPackChange(res.pack);
  };

  const remove = async () => {
    setConfirm(false);
    const res = await api(`/api/admin/stickers/${packId}/stickers/${sticker.id}`, { method: 'DELETE' });
    if (res.error) alert(res.error);
    else onPackChange(res.pack);
  };

  return (
    <div className="group relative rounded-xl border border-border bg-bg p-2 flex flex-col items-center gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sticker.file} alt={sticker.label} loading="lazy" className="w-20 h-20 object-contain" />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={saveLabel}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        maxLength={40}
        placeholder="Nomi"
        aria-label="Stiker nomi"
        className="w-full px-2 py-1 bg-surface border border-border rounded-lg text-xs text-ink text-center outline-none focus:border-accent"
      />
      {saving && <Loader2 size={12} className="absolute top-2 left-2 animate-spin text-muted" />}
      <button
        type="button"
        onClick={() => setConfirm(true)}
        aria-label="Stikerni o'chirish"
        title="O'chirish"
        className="absolute top-1 right-1 w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-surface transition-colors md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 size={14} />
      </button>
      <ConfirmModal
        open={confirm}
        title="Stikerni o'chirasizmi?"
        message="Stiker tanlash oynasidan yo'qoladi. Allaqachon yuborilgan xabarlarda ko'rinishda qoladi."
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

function PackCard({ pack, isFirst, isLast, onPackChange, onPacksChange, onDeleted }) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(pack.name);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState([]); // { id, name, status: 'uploading'|'error', error }
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => setName(pack.name), [pack.name]);

  const patch = async (body) => {
    setBusy(true);
    const res = await api(`/api/admin/stickers/${pack.id}`, { method: 'PATCH', body: JSON.stringify(body) });
    setBusy(false);
    if (res.error) {
      alert(res.error);
      return false;
    }
    onPacksChange(res.packs);
    return true;
  };

  const saveName = async () => {
    if (!name.trim() || name.trim() === pack.name) {
      setName(pack.name);
      setEditingName(false);
      return;
    }
    if (await patch({ name })) setEditingName(false);
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const items = files.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, status: 'uploading', file: f }));
    setUploads((u) => [...u, ...items]);
    // Ketma-ket — tartib saqlanadi va server "120 ta" cheklovini to'g'ri hisoblaydi.
    for (const item of items) {
      const res = await uploadOne(pack.id, item.file);
      if (res.error) {
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: 'error', error: res.error } : x)));
      } else {
        setUploads((u) => u.filter((x) => x.id !== item.id));
        onPackChange(res.pack);
      }
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    const res = await api(`/api/admin/stickers/${pack.id}`, { method: 'DELETE' });
    if (res.error) alert(res.error);
    else onDeleted(pack.id);
  };

  const uploading = uploads.some((u) => u.status === 'uploading');

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-border">
        {editingName ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-[12rem]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
                if (e.key === 'Escape') {
                  setName(pack.name);
                  setEditingName(false);
                }
              }}
              maxLength={64}
              autoFocus
              aria-label="To'plam nomi"
              className="flex-1 min-w-0 px-3 py-1.5 bg-bg border border-border rounded-lg text-sm text-ink outline-none focus:border-accent"
            />
            <button type="button" onClick={saveName} aria-label="Saqlash" className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-success hover:bg-bg">
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setName(pack.name);
                setEditingName(false);
              }}
              aria-label="Bekor qilish"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-muted hover:bg-bg"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink truncate">{pack.name}</h3>
            <span className="text-[11px] text-muted flex-shrink-0">{pack.stickers.length} ta</span>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              aria-label="Nomini o'zgartirish"
              title="Nomini o'zgartirish"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-bg flex-shrink-0"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          <Switch
            checked={pack.active}
            onChange={(v) => patch({ active: v })}
            disabled={busy}
            label={pack.active ? "Foydalanuvchilarga ko'rinadi" : 'Yashirin'}
          />
          <button
            type="button"
            onClick={() => patch({ move: 'up' })}
            disabled={busy || isFirst}
            aria-label="Yuqoriga"
            title="Yuqoriga"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-bg disabled:opacity-30"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            onClick={() => patch({ move: 'down' })}
            disabled={busy || isLast}
            aria-label="Pastga"
            title="Pastga"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-bg disabled:opacity-30"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            aria-label="To'plamni o'chirish"
            title="To'plamni o'chirish"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-bg disabled:opacity-30"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
            dragOver ? 'border-accent bg-accent-soft' : 'border-border'
          }`}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-on-accent rounded-xl text-sm font-semibold transition-colors"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Stiker yuklash
          </button>
          <p className="text-xs text-muted mt-2">
            yoki fayllarni shu yerga tashlang · PNG/WEBP (shaffof fon), GIF (animatsiya) · 512 KB gacha · tavsiya: 512×512
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {uploads.length > 0 && (
          <ul className="space-y-1.5">
            {uploads.map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-xs">
                {u.status === 'uploading' ? (
                  <Loader2 size={13} className="animate-spin text-muted flex-shrink-0" />
                ) : (
                  <AlertCircle size={13} className="text-danger flex-shrink-0" />
                )}
                <span className="truncate text-ink">{u.name}</span>
                {u.error && <span className="text-danger flex-shrink-0">— {u.error}</span>}
                {u.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => setUploads((list) => list.filter((x) => x.id !== u.id))}
                    aria-label="Yopish"
                    className="ml-auto text-muted hover:text-ink flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {pack.stickers.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
            {pack.stickers.map((s) => (
              <StickerTile key={s.id} packId={pack.id} sticker={s} onPackChange={onPackChange} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted text-center">
            Hali stiker yo'q. Stikerlar yuklangach, to'plamni yoqing — shunda foydalanuvchilarga ko'rinadi.
          </p>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        title={`"${pack.name}" to'plamini o'chirasizmi?`}
        message="To'plam stiker tanlash oynasidan yo'qoladi. Allaqachon yuborilgan stikerlar xabarlarda ko'rinishda qoladi."
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  );
}

export default function StickersPanel() {
  const [packs, setPacks] = useState(null);
  const [builtin, setBuiltin] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    const res = await api('/api/admin/stickers');
    if (res.error) setLoadError(res.error);
    else {
      setPacks(res.packs || []);
      setBuiltin(res.builtin || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    setCreateError('');
    const res = await api('/api/admin/stickers', { method: 'POST', body: JSON.stringify({ name: newName }) });
    setCreating(false);
    if (res.error) setCreateError(res.error);
    else {
      setPacks((p) => [...(p || []), res.pack]);
      setNewName('');
    }
  };

  const replacePack = (updated) => setPacks((list) => list.map((p) => (p.id === updated.id ? updated : p)));

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-3">
        <p className="text-sm font-bold text-ink flex items-center gap-2">
          <Plus size={16} className="text-accent" /> Yangi stiker to'plami
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={64}
            placeholder="To'plam nomi (masalan: IELTS mushuklari)"
            aria-label="To'plam nomi"
            className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-base md:text-sm text-ink outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-xl text-sm font-semibold transition-colors"
          >
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Yaratish
          </button>
        </div>
        <p className="text-xs text-muted">
          Yangi to'plam yashirin holda yaratiladi. Stikerlarni yuklab, keyin yoqing — shunda chatda "Stikerlar" bo'limida chiqadi.
        </p>
        {createError && (
          <p role="alert" className="text-xs text-danger">
            {createError}
          </p>
        )}
      </form>

      {loadError && (
        <div className="text-center py-6">
          <p className="text-sm text-danger mb-2">{loadError}</p>
          <button type="button" onClick={load} className="text-xs font-semibold text-accent hover:underline min-h-11">
            Qayta yuklash
          </button>
        </div>
      )}

      {!packs && !loadError && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-accent" size={22} />
        </div>
      )}

      {packs?.map((pack, i) => (
        <PackCard
          key={pack.id}
          pack={pack}
          isFirst={i === 0}
          isLast={i === packs.length - 1}
          onPackChange={replacePack}
          onPacksChange={setPacks}
          onDeleted={(id) => setPacks((list) => list.filter((p) => p.id !== id))}
        />
      ))}

      {builtin.map((pack) => (
        <section key={pack.id} className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden opacity-90">
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-border">
            <Lock size={14} className="text-muted" />
            <h3 className="text-sm font-bold text-ink">{pack.name}</h3>
            <span className="text-[11px] text-muted">standart · {pack.stickers.length} ta · o'zgartirib bo'lmaydi</span>
          </div>
          <div className="p-4 sm:p-5 grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
            {pack.stickers.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s.id} src={s.file} alt={s.label} title={s.label} className="w-16 h-16 mx-auto" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
