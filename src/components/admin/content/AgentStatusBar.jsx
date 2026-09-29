'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Headphones, Image as ImageIcon, ClipboardCheck, Loader2, Rocket } from 'lucide-react';

// Above the content agent chat: what the auto-placed content still needs.
// Ready drafts publish in one click (the exam-tests PATCH re-validates each
// before publishing); missing audio/images tell the admin what to drop next.
function Chip({ icon: Icon, tone = 'muted', children, title, href }) {
  const cls = {
    muted: 'bg-bg border-border text-muted',
    ok: 'bg-success-soft border-success/30 text-ink',
    warn: 'bg-warning-soft border-warning/30 text-ink',
  }[tone];
  const inner = (
    <>
      <Icon size={13} aria-hidden="true" /> {children}
    </>
  );
  return href ? (
    <Link href={href} title={title} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium hover:border-accent/40 ${cls}`}>
      {inner}
    </Link>
  ) : (
    <span title={title} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cls}`}>
      {inner}
    </span>
  );
}

export default function AgentStatusBar({ status, onChanged }) {
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState('');
  if (!status) return null;

  const publishAll = async () => {
    if (!confirm(`${status.ready.length} ta tayyor test nashr qilinsinmi? Ular o‘quvchilarga darhol ochiladi.`)) return;
    setPublishing(true);
    setNote('');
    let ok = 0;
    for (const t of status.ready) {
      const res = await fetch(`/api/admin/exam-tests/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true }),
      }).catch(() => null);
      if (res?.ok) ok++;
    }
    setNote(`${ok}/${status.ready.length} ta test nashr qilindi.`);
    setPublishing(false);
    onChanged?.();
  };

  const list = (items, fmt) => items.slice(0, 8).map(fmt).join('\n') + (items.length > 8 ? `\n… yana ${items.length - 8}` : '');

  return (
    <div className="px-3 sm:px-4 py-2 border-b border-border bg-surface/60 space-y-1.5 flex-shrink-0">
      {!status.aiConfigured && (
        <p className="flex items-start gap-2 text-xs text-ink bg-warning-soft border border-warning/30 rounded-lg px-3 py-2">
          <AlertTriangle size={14} className="text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
          AI kaliti sozlanmagan — fayllarni tahlil qilib bo‘lmaydi. Server muhitiga OPENROUTER_API_KEY yoki GEMINI_API_KEY qo‘shing.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {status.ready.length > 0 ? (
          <>
            <Chip icon={CheckCircle2} tone="ok" title={list(status.ready, (t) => t.title)}>
              Nashrga tayyor: {status.ready.length}
            </Chip>
            <button
              type="button"
              onClick={publishAll}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent text-on-accent text-xs font-semibold disabled:opacity-60"
            >
              {publishing ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />} Hammasini nashr qilish
            </button>
          </>
        ) : (
          <Chip icon={CheckCircle2}>Nashrga tayyor qoralama yo‘q</Chip>
        )}
        {status.waitingAudio.length > 0 && (
          <Chip icon={Headphones} tone="warn" title={list(status.waitingAudio, (a) => `${a.testTitle} · Part ${a.partOrder}`)}>
            Audio kutmoqda: {status.waitingAudio.length}
          </Chip>
        )}
        {status.waitingImages.length > 0 && (
          <Chip icon={ImageIcon} tone="warn" title={list(status.waitingImages, (a) => `${a.testTitle} · Writing Task 1`)}>
            Rasm kutmoqda: {status.waitingImages.length}
          </Chip>
        )}
        {status.blocked.length > 0 && (
          <Chip icon={AlertTriangle} tone="warn" href="/admin/exam-tests" title={list(status.blocked, (t) => `${t.title}: ${t.blockers} ta masala`)}>
            Masalali qoralama: {status.blocked.length}
          </Chip>
        )}
        {status.openReview > 0 && (
          <Chip icon={ClipboardCheck} href="/admin/content/review">
            Tekshiruv navbati: {status.openReview}
          </Chip>
        )}
        {note && <span className="text-xs text-success font-medium">{note}</span>}
      </div>
    </div>
  );
}
