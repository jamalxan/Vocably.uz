'use client';
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2, ArrowLeft, Link2, Check, Lock, Users, UserRound, MessageSquareText, Image as ImageIcon, Video, Mic,
  Flag, Pencil, Trash2, Download, UserX, Tag, Search, Phone, PhoneMissed, Forward, Reply, Smile,
  ShieldCheck, X, ChevronUp, FileText, AlertTriangle,
} from 'lucide-react';
import Avatar from '@/components/avatar/Avatar';
import { useAuthedAdminMediaUrl } from '@/lib/useAuthedMedia';
import { useAllChatsUnlocked } from '@/lib/adminHiddenChats';
import { findSticker } from '@/lib/stickers';

// Admin panel: foydalanuvchilar suhbatlarini ko'rish (faqat o'qish). `conversationId`
// berilsa — bitta suhbat (/admin/c/<id>), aks holda ro'yxat (/admin/conversations).
// Ro'yxat ikki bo'limga ajratilgan: "Mening" (admin o'zi yozishgan) va yashirin
// "Umumiy" — ikkinchisi faqat "Suhbatlar" menyusi 5 marta tez bosilganda ko'rinadi
// (src/lib/adminHiddenChats.js). Har bir suhbatni ochish server tomonda audit-log'ga
// yoziladi (api/admin/chat/conversations/[id]/messages).

const EMPTY_LIST = { items: [], cursor: null, loaded: false, error: false };
const VIEW_TABS = [
  { key: 'chat', label: 'Suhbat', icon: MessageSquareText },
  { key: 'image', label: 'Rasmlar', icon: ImageIcon },
  { key: 'video', label: 'Videolar', icon: Video },
  { key: 'voice', label: 'Ovozlilar', icon: Mic },
];
const CALL_OUTCOME = {
  ended: 'Yakunlangan',
  missed: 'Javobsiz',
  declined: 'Rad etilgan',
  busy: 'Band',
  cancelled: 'Bekor qilingan',
  failed: 'Ulanmagan',
};
// Bir xil yuboruvchining shu oraliqdagi ketma-ket xabarlari bitta guruh bo'lib chiqadi.
const GROUP_GAP_MS = 5 * 60 * 1000;
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';

// ---------- yordamchilar ----------

// Admin ishtirok etgan suhbatda — suhbatdosh (admin emas) tomon; aks holda null.
function otherParticipant(c, adminId) {
  if (!adminId || !c.participants.some((p) => String(p._id) === adminId)) return null;
  return c.participants.find((p) => String(p._id) !== adminId) || null;
}

const handle = (p) => `@${p?.username || p?.name || '?'}`;
const displayName = (p) => p?.name || (p?.username ? `@${p.username}` : "Noma'lum");
const byId = (participants, id) => participants.find((p) => String(p?._id) === String(id));

const pad = (n) => String(n).padStart(2, '0');
const timeHM = (d) => {
  const x = new Date(d);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isYesterday(x) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return sameDay(x, y);
}
function dayLabel(d) {
  const x = new Date(d);
  const today = new Date();
  if (sameDay(x, today)) return 'Bugun';
  if (isYesterday(x)) return 'Kecha';
  const base = `${x.getDate()}-${MONTHS[x.getMonth()]}`;
  return x.getFullYear() === today.getFullYear() ? base : `${base}, ${x.getFullYear()}`;
}
// Ro'yxatdagi qisqa vaqt: bugun — soat, kecha, shu hafta — "N kun", aks holda sana.
function listTime(d) {
  if (!d) return '';
  const x = new Date(d);
  const now = new Date();
  if (sameDay(x, now)) return timeHM(x);
  if (isYesterday(x)) return 'Kecha';
  const days = Math.floor((now - x) / 86400000);
  if (days < 7) return `${days} kun`;
  return x.getFullYear() === now.getFullYear()
    ? `${x.getDate()} ${MONTHS[x.getMonth()].slice(0, 3)}`
    : `${pad(x.getDate())}.${pad(x.getMonth() + 1)}.${String(x.getFullYear()).slice(2)}`;
}
const fullDate = (d) => new Date(d).toLocaleString('uz-UZ');
const fmtDuration = (sec) => {
  const s = Math.round(sec || 0);
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};
const fmtSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// ---------- media (admin endpointi orqali) ----------
// Oddiy foydalanuvchi tomonidagi MessageBubble.jsx naqshi, lekin /api/admin/chat/media
// orqali — ishtirokchi bo'lmasa ham, xabar/suhbat "o'chirilgan" bo'lsa ham fayl
// ko'rinadi (haqiqiy S3 obyekt hech qachon o'chirilmaydi).

function Skeleton({ className }) {
  return <div className={`bg-surface-3/70 animate-pulse ${className}`} />;
}

function AdminImage({ media, fill = false }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  if (!url) return <Skeleton className={fill ? 'w-full h-full' : 'w-56 max-w-full aspect-[4/3] rounded-xl'} />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className={`block overflow-hidden ${fill ? 'w-full h-full' : 'rounded-xl'} ${FOCUS_RING}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Rasm"
        loading="lazy"
        className={`block object-cover transition-transform duration-300 hover:scale-[1.03] ${
          fill ? 'w-full h-full' : 'max-w-[min(280px,100%)] max-h-[320px]'
        }`}
      />
    </a>
  );
}

function AdminVideo({ media, fill = false }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  const round = media.round && !fill;
  if (!url) {
    return <Skeleton className={fill ? 'w-full h-full' : round ? 'w-48 h-48 rounded-full' : 'w-64 max-w-full aspect-video rounded-xl'} />;
  }
  return (
    <video
      src={url}
      controls
      preload="metadata"
      className={
        fill
          ? 'w-full h-full object-cover bg-black'
          : round
            ? 'w-48 h-48 rounded-full object-cover'
            : 'max-w-[min(300px,100%)] max-h-[320px] rounded-xl bg-black'
      }
    />
  );
}

function AdminVoice({ media }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  if (!url) return <Skeleton className="w-60 max-w-full h-11 rounded-full" />;
  return <audio src={url} controls preload="metadata" className="w-64 max-w-full h-11" />;
}

function AdminFile({ media }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  const body = (
    <>
      <span className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
        {url ? <FileText size={18} /> : <Loader2 size={16} className="animate-spin" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium truncate">{media.name || 'Fayl'}</span>
        <span className="block text-[11px] opacity-75">{url ? fmtSize(media.size) || 'Yuklab olish' : 'Tayyorlanmoqda…'}</span>
      </span>
      {url && <Download size={15} className="flex-shrink-0 opacity-75" />}
    </>
  );
  // URL tayyor bo'lguncha havola faol emas ('#' yangi bo'sh tab ochmasin).
  if (!url) {
    return (
      <span aria-disabled="true" className="flex items-center gap-3 w-64 max-w-full p-1.5 rounded-xl opacity-75">
        {body}
      </span>
    );
  }
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 w-64 max-w-full p-1.5 rounded-xl hover:bg-black/5 transition-colors ${FOCUS_RING}`}
    >
      {body}
    </a>
  );
}

function AdminMediaContent({ message, fill = false }) {
  if (!message.media) return null;
  if (message.type === 'image') return <AdminImage media={message.media} fill={fill} />;
  if (message.type === 'video') return <AdminVideo media={message.media} fill={fill} />;
  if (message.type === 'voice') return <AdminVoice media={message.media} />;
  if (message.type === 'file') return <AdminFile media={message.media} />;
  return null;
}

// ---------- kichik UI bo'laklari ----------

function Segmented({ items, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="self-start inline-flex p-1 gap-1 rounded-xl bg-surface-2 border border-border max-w-full overflow-x-auto">
      {items.map(({ key, label: text, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 min-h-9 rounded-lg text-xs font-semibold transition-all ${FOCUS_RING} ${
              active ? 'bg-surface text-ink shadow-sm ring-1 ring-border' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon size={14} className={active ? 'text-accent' : ''} />
            {text}
          </button>
        );
      })}
    </div>
  );
}

const CHIP_TONES = {
  neutral: 'bg-surface-2 text-muted border-border',
  warning: 'bg-warning-soft text-warning border-warning/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
  accent: 'bg-accent-soft text-accent border-accent/25',
};

function Chip({ tone = 'neutral', icon: Icon, children, title }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium max-w-full ${CHIP_TONES[tone]}`}
    >
      {Icon && <Icon size={11} className="flex-shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

function UserAvatar({ user, size }) {
  return <Avatar userId={user?._id} photoId={user?.photoId} name={user?.name} username={user?.username} size={size} />;
}

// Admin ishtirok etmagan suhbat — ikkala ishtirokchi bir-birining ustiga qo'yilgan avatar.
function PairAvatars({ a, b, size = 44 }) {
  const small = Math.round(size * 0.72);
  return (
    <span className="relative inline-block flex-shrink-0" style={{ width: size, height: size }}>
      <span className="absolute top-0 left-0">
        <UserAvatar user={a} size={small} />
      </span>
      <span className="absolute bottom-0 right-0 rounded-full ring-2 ring-surface">
        <UserAvatar user={b} size={small} />
      </span>
    </span>
  );
}

function CenterSpinner() {
  return (
    <div role="status" className="flex justify-center py-20">
      <Loader2 className="animate-spin text-accent" size={24} />
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-16 px-6">
      <span className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-muted">
        <Icon size={20} />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {hint && <p className="text-xs text-muted max-w-xs">{hint}</p>}
      {children}
    </div>
  );
}

function PillButton({ onClick, busy, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 px-4 min-h-9 rounded-full bg-surface border border-border text-xs font-semibold text-muted shadow-sm hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 ${FOCUS_RING}`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : Icon ? <Icon size={13} /> : null}
      {children}
    </button>
  );
}

// ---------- ro'yxat ----------

function ConversationRow({ c, adminId }) {
  const other = otherParticipant(c, adminId);
  const [a, b] = c.participants;
  const hasNick = c.participants.some((p) => p?.savedAsByOther);
  return (
    <Link
      href={`/admin/c/${c.id}`}
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-surface-2/70 focus-visible:bg-surface-2 focus-visible:outline-none transition-colors"
    >
      {other ? <UserAvatar user={other} size={44} /> : <PairAvatars a={a} b={b} />}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-ink truncate">
            {other ? (
              displayName(other)
            ) : (
              <>
                {handle(a)} <span className="text-muted font-normal">↔</span> {handle(b)}
              </>
            )}
          </span>
          {other?.name && other?.username && <span className="hidden sm:inline text-xs text-muted truncate">@{other.username}</span>}
          {c.hiddenFor?.length > 0 && (
            <span title={`Ro'yxatdan o'chirgan: ${c.hiddenFor.map((u) => `@${u}`).join(', ')}`} className="flex-shrink-0 text-warning">
              <UserX size={13} aria-label="Ro'yxatdan o'chirilgan" />
            </span>
          )}
          {hasNick && (
            <span title="Taxallus qo'yilgan" className="flex-shrink-0 text-accent">
              <Tag size={13} aria-label="Taxallus qo'yilgan" />
            </span>
          )}
          <span className="ml-auto pl-2 text-[11px] text-muted tabular-nums flex-shrink-0" title={c.lastMessageAt ? fullDate(c.lastMessageAt) : undefined}>
            {listTime(c.lastMessageAt)}
          </span>
        </span>
        <span title={c.lastMessagePreview} className="block mt-0.5 text-xs text-muted truncate">
          {c.lastMessagePreview || <span className="italic opacity-70">Xabar yo&apos;q</span>}
        </span>
      </span>
    </Link>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5" aria-hidden="true">
      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-40 max-w-full rounded" />
        <Skeleton className="h-2.5 w-64 max-w-full rounded" />
      </div>
    </div>
  );
}

// ---------- suhbat oqimi ----------

function CallRow({ call = {} }) {
  const missed = call.outcome && call.outcome !== 'ended';
  const Icon = missed ? PhoneMissed : call.kind === 'video' ? Video : Phone;
  return (
    <span className="flex items-center gap-2.5">
      <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${missed ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}>
        <Icon size={16} />
      </span>
      <span>
        <span className="block text-sm font-semibold">{call.kind === 'video' ? 'Video qo‘ng‘iroq' : 'Ovozli qo‘ng‘iroq'}</span>
        <span className="block text-[11px] opacity-75">
          {CALL_OUTCOME[call.outcome] || 'Qo‘ng‘iroq'}
          {call.outcome === 'ended' && call.durationSec ? ` · ${fmtDuration(call.durationSec)}` : ''}
        </span>
      </span>
    </span>
  );
}

function MessageBody({ m }) {
  if (m.type === 'call') return <CallRow call={m.call || undefined} />;
  if (m.type === 'sticker') {
    const st = findSticker(m.stickerId);
    if (!st) return <Chip icon={Smile}>Stiker: {m.stickerId}</Chip>;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={st.file} alt={st.label} className="w-32 h-32" draggable={false} />;
  }
  return (
    <>
      <AdminMediaContent message={m} />
      {m.text && (
        <p className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed ${m.media ? 'mt-2' : ''}`}>{m.text}</p>
      )}
    </>
  );
}

function Bubble({ m, right, sender, participants, groupStart, groupEnd }) {
  const deleted = m.deletedForEveryone;
  const plain = m.type === 'sticker';
  const replySender = m.replyTo && byId(participants, m.replyTo.senderId);
  const reactions = m.reactions || [];
  const hasBadges = m.edited || deleted || m.flagged || m.deletedFor?.length > 0;
  const shell = plain
    ? ''
    : `px-3.5 py-2.5 rounded-2xl shadow-sm ${
        right
          ? `bg-accent text-on-accent ${groupEnd ? 'rounded-br-md' : ''}`
          : `bg-surface text-ink border border-border ${groupEnd ? 'rounded-bl-md' : ''}`
      }`;
  return (
    <div className={`flex items-end gap-2 ${right ? 'flex-row-reverse' : ''} ${groupStart ? 'mt-3' : 'mt-1'}`}>
      <span className="w-8 flex-shrink-0 hidden sm:block">{groupEnd && <UserAvatar user={sender} size={32} />}</span>
      <div className={`min-w-0 max-w-[88%] sm:max-w-[72%] flex flex-col ${right ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative min-w-0 max-w-full text-sm ${shell} ${
            deleted ? 'opacity-75 outline outline-2 outline-dashed outline-danger/50 outline-offset-2' : ''
          } ${m.flagged ? 'ring-2 ring-danger/70 ring-offset-2 ring-offset-bg' : ''}`}
        >
          {groupStart && !plain && (
            <p className={`text-[11px] font-semibold mb-1 ${right ? 'opacity-85' : 'text-accent'}`}>{handle(sender)}</p>
          )}
          {hasBadges && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {m.flagged && <Chip tone="danger" icon={Flag}>Shikoyat qilingan</Chip>}
              {deleted && <Chip tone="danger" icon={Trash2}>Hammadan o&apos;chirilgan</Chip>}
              {!deleted && m.deletedFor?.length > 0 && <Chip icon={Trash2}>{m.deletedFor.length} tarafdan o&apos;chirilgan</Chip>}
              {m.edited && <Chip tone="warning" icon={Pencil}>Tahrirlangan</Chip>}
            </div>
          )}
          {m.forwardedFrom && (
            <p className="flex items-center gap-1 text-[11px] opacity-80 mb-1">
              <Forward size={11} /> {m.forwardedFrom.name || "Noma'lum"} dan yuborilgan
              {m.forwardedFrom.hidden && <span className="opacity-75">(yashirin)</span>}
            </p>
          )}
          {m.replyTo && (
            <div
              className={`mb-1.5 pl-2 pr-2 py-1 border-l-2 rounded-r-md text-[12px] ${
                right ? 'border-on-accent/60 bg-black/10' : 'border-accent bg-accent/5'
              }`}
            >
              <p className="flex items-center gap-1 font-semibold opacity-90">
                <Reply size={11} /> {handle(replySender)}
              </p>
              <p className="opacity-80 truncate">{m.replyTo.deleted ? "Xabar o'chirildi" : m.replyTo.text || `[${m.replyTo.type}]`}</p>
            </div>
          )}
          {m.edited && m.originalText && (
            <p className="text-[12px] opacity-60 line-through whitespace-pre-wrap break-words mb-1">{m.originalText}</p>
          )}
          <MessageBody m={m} />
          <p
            title={fullDate(m.createdAt)}
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] tabular-nums ${plain ? 'text-muted' : 'opacity-75'}`}
          >
            {timeHM(m.createdAt)}
            {m.readAt && <Check size={11} aria-label="O'qilgan" />}
          </p>
        </div>
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((r, i) => (
              <span key={i} title={handle(byId(participants, r.userId))} className="text-xs px-1.5 py-0.5 rounded-full bg-surface border border-border shadow-sm">
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DaySeparator({ date }) {
  return (
    <div className="sticky top-2 z-10 flex justify-center my-4 pointer-events-none">
      <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-muted bg-surface/90 backdrop-blur border border-border shadow-sm">
        {dayLabel(date)}
      </span>
    </div>
  );
}

function MessageStream({ messages, leftId, participants }) {
  const continues = (a, b) =>
    a && b && String(a.senderId) === String(b.senderId) && sameDay(new Date(a.createdAt), new Date(b.createdAt)) &&
    Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) < GROUP_GAP_MS;
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const newDay = !prev || !sameDay(new Date(prev.createdAt), new Date(m.createdAt));
    return (
      <Fragment key={m._id}>
        {newDay && <DaySeparator date={m.createdAt} />}
        <Bubble
          m={m}
          right={String(m.senderId) !== String(leftId)}
          sender={byId(participants, m.senderId)}
          participants={participants}
          groupStart={!continues(prev, m)}
          groupEnd={!continues(m, messages[i + 1])}
        />
      </Fragment>
    );
  });
}

function GalleryView({ type, data, participants, onMore, loadingMore }) {
  if (!data) return <CenterSpinner />;
  const { messages, cursor } = data;
  if (messages.length === 0) {
    const tab = VIEW_TABS.find((t) => t.key === type);
    return <EmptyState icon={tab.icon} title={`${tab.label} yo'q`} hint="Bu suhbatda bunday turdagi xabar yuborilmagan." />;
  }
  return (
    <div className="p-3 sm:p-5">
      {type === 'voice' ? (
        <ul className="space-y-2">
          {messages.map((m) => {
            const s = byId(participants, m.senderId);
            return (
              <li key={m._id} className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-surface border border-border shadow-sm">
                <UserAvatar user={s} size={32} />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-ink">{handle(s)}</span>
                  <span className="block text-[11px] text-muted tabular-nums">{fullDate(m.createdAt)}</span>
                </span>
                {m.deletedForEveryone && <Chip tone="danger" icon={Trash2}>O&apos;chirilgan</Chip>}
                <span className="sm:ml-auto w-full sm:w-auto">{m.media && <AdminVoice media={m.media} />}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {messages.map((m) => (
            <figure key={m._id} className="relative rounded-2xl overflow-hidden bg-surface border border-border shadow-sm">
              <div className="aspect-square bg-bg-sunken overflow-hidden">{m.media && <AdminMediaContent message={m} fill />}</div>
              <figcaption className="flex items-center gap-1.5 px-2.5 py-2 text-[11px] text-muted">
                <span className="truncate font-medium text-ink">{handle(byId(participants, m.senderId))}</span>
                {m.deletedForEveryone && <Trash2 size={11} className="text-danger flex-shrink-0" aria-label="O'chirilgan" />}
                <span className="ml-auto tabular-nums flex-shrink-0" title={fullDate(m.createdAt)}>
                  {dayLabel(m.createdAt)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {cursor && (
        <div className="flex justify-center pt-4">
          <PillButton onClick={onMore} busy={loadingMore}>
            Yana yuklash
          </PillButton>
        </div>
      )}
    </div>
  );
}

// ---------- asosiy komponent ----------

export default function ConversationViewer({ conversationId = null }) {
  const router = useRouter();
  const unlocked = useAllChatsUnlocked();
  const [tab, setTab] = useState('mine'); // mine | others
  const [lists, setLists] = useState({ mine: EMPTY_LIST, others: EMPTY_LIST });
  const [query, setQuery] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [loadingMoreConvos, setLoadingMoreConvos] = useState(false);
  const [active, setActive] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState(null);
  const [msgCursor, setMsgCursor] = useState(null);
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
  // "Suhbat" (matn + media aralash, eskidan-yangiga) va uchta alohida galereya —
  // Rasmlar/Videolar/Ovozlilar (har biri o'z {messages, cursor} holatiga ega, faqat
  // birinchi ochilganda yuklanadi). O'chirilgan xabarlar fayli ham ko'rinadi.
  const [viewMode, setViewMode] = useState('chat');
  const [galleryData, setGalleryData] = useState({});
  const [loadingMoreGallery, setLoadingMoreGallery] = useState(false);

  const scrollRef = useRef(null);
  // Eski xabarlar tepaga qo'shilganda o'qilayotgan joy siljimasligi uchun (pastdan masofa).
  const prependAnchor = useRef(null);
  // Suhbat oynasi ochilganda/qaytilganda bir marta eng pastga (eng yangi xabar) tushirish.
  const needsBottomScroll = useRef(true);

  // Yashirin bo'lim qayta yopilsa — "Umumiy" tabida qolib ketmaslik.
  const currentTab = unlocked ? tab : 'mine';
  const list = lists[currentTab];

  const fetchPage = (scope, cursor) => {
    const qs = new URLSearchParams({ scope });
    if (cursor) qs.set('before', cursor);
    return fetch(`/api/admin/chat/conversations?${qs}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.adminId) setAdminId(data.adminId);
        setLists((prev) => ({
          ...prev,
          [scope]: {
            items: cursor ? [...prev[scope].items, ...(data.conversations || [])] : data.conversations || [],
            cursor: data.nextCursor || null,
            loaded: true,
            error: !Array.isArray(data.conversations),
          },
        }));
      });
  };

  // Har bir bo'lim birinchi marta ko'rsatilganda yuklanadi — "Umumiy" ro'yxat
  // yashirin turganda umuman so'ralmaydi.
  useEffect(() => {
    if (conversationId || lists[currentTab].loaded) return;
    fetchPage(currentTab).catch(() =>
      setLists((prev) => ({ ...prev, [currentTab]: { ...EMPTY_LIST, loaded: true, error: true } }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentTab]);

  const loadMoreConversations = async () => {
    if (!list.cursor || loadingMoreConvos) return;
    setLoadingMoreConvos(true);
    try {
      await fetchPage(currentTab, list.cursor);
    } catch {
      // Tarmoq xatosi — tugma qayta bosilishi mumkin.
    } finally {
      setLoadingMoreConvos(false);
    }
  };

  // Suhbat almashganda holatni render vaqtida boshiga qaytaramiz.
  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (prevConversationId !== conversationId) {
    setPrevConversationId(conversationId);
    if (conversationId) {
      setActive(null);
      setNotFound(false);
      setMessages(null);
      setMsgCursor(null);
      setViewMode('chat');
      setGalleryData({});
    }
  }

  // /admin/c/<id> — suhbat `id` filtri bilan to'g'ridan-to'g'ri olinadi
  // (ro'yxatning qaysi sahifasida turganidan qat'i nazar).
  useEffect(() => {
    if (!conversationId) return;
    needsBottomScroll.current = true;
    fetch(`/api/admin/chat/conversations?id=${encodeURIComponent(conversationId)}`)
      .then((r) => r.json())
      .then(async (d) => {
        const conv = d.conversations?.[0];
        if (d.adminId) setAdminId(d.adminId);
        if (!conv) {
          setNotFound(true);
          return;
        }
        setActive(conv);
        const res = await fetch(`/api/admin/chat/conversations/${conv.id}/messages`);
        const data = await res.json();
        setMessages(data.messages || []);
        setMsgCursor(data.nextCursor || null);
      })
      .catch(() => setNotFound(true));
  }, [conversationId]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !messages || viewMode !== 'chat') return;
    if (prependAnchor.current != null) {
      el.scrollTop = el.scrollHeight - prependAnchor.current;
      prependAnchor.current = null;
    } else if (needsBottomScroll.current) {
      el.scrollTop = el.scrollHeight;
      needsBottomScroll.current = false;
    }
  }, [messages, viewMode]);

  // Eski havolalar (`/admin/conversations?open=<id>`) yangi manzilga yo'naltiriladi.
  const openParam = useSearchParams().get('open');
  useEffect(() => {
    if (openParam && !conversationId) router.replace(`/admin/c/${encodeURIComponent(openParam)}`);
  }, [openParam, conversationId, router]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard ruxsati yo'q — havola baribir manzil satrida.
    }
  };

  // Galereyalar birinchi marta ochilganda yuklanadi (eng yangisi tepada, order=desc).
  const switchView = async (type) => {
    if (type === 'chat') needsBottomScroll.current = true;
    setViewMode(type);
    if (type === 'chat' || galleryData[type] || !active) return;
    try {
      const res = await fetch(`/api/admin/chat/conversations/${active.id}/messages?type=${type}&order=desc`);
      const data = await res.json();
      setGalleryData((prev) => ({ ...prev, [type]: { messages: data.messages || [], cursor: data.nextCursor || null } }));
    } catch {
      setGalleryData((prev) => ({ ...prev, [type]: { messages: [], cursor: null } }));
    }
  };

  const loadMoreGallery = async () => {
    const current = galleryData[viewMode];
    if (!current?.cursor || loadingMoreGallery || !active) return;
    setLoadingMoreGallery(true);
    try {
      const res = await fetch(
        `/api/admin/chat/conversations/${active.id}/messages?type=${viewMode}&order=desc&before=${encodeURIComponent(current.cursor)}`
      );
      const data = await res.json();
      setGalleryData((prev) => ({
        ...prev,
        [viewMode]: {
          messages: [...(prev[viewMode]?.messages || []), ...(data.messages || [])],
          cursor: data.nextCursor || null,
        },
      }));
    } catch {
      // Tarmoq xatosi — tugma qayta bosilishi mumkin.
    } finally {
      setLoadingMoreGallery(false);
    }
  };

  // Eski xabarlarni ro'yxat boshiga (yuqoriga) qo'shadi — xabarlar eskidan yangiga.
  const loadOlderMessages = async () => {
    if (!msgCursor || loadingMoreMsgs || !active) return;
    setLoadingMoreMsgs(true);
    try {
      const res = await fetch(`/api/admin/chat/conversations/${active.id}/messages?before=${encodeURIComponent(msgCursor)}`);
      const data = await res.json();
      const el = scrollRef.current;
      if (el) prependAnchor.current = el.scrollHeight - el.scrollTop;
      setMessages((prev) => [...(data.messages || []), ...(prev || [])]);
      setMsgCursor(data.nextCursor || null);
    } catch {
      // Tarmoq xatosi — tugma qayta bosilishi mumkin.
    } finally {
      setLoadingMoreMsgs(false);
    }
  };

  // Qidiruv — yuklangan suhbatlar orasida (ism, @username, taxallus, oxirgi xabar).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    if (!q) return list.items;
    return list.items.filter((c) =>
      [c.lastMessagePreview, ...c.participants.flatMap((p) => [p?.username, p?.name, p?.savedAsByOther])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [list.items, query]);

  // ---------- bitta suhbat ----------
  if (conversationId && notFound) {
    return (
      <div className="rounded-3xl border border-border bg-surface shadow-card">
        <EmptyState icon={MessageSquareText} title="Suhbat topilmadi" hint="Havola noto'g'ri yoki suhbat mavjud emas.">
          <Link href="/admin/conversations" className={`mt-2 text-sm font-semibold text-accent hover:underline rounded ${FOCUS_RING}`}>
            Suhbatlar ro&apos;yxatiga qaytish
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (conversationId && !active) return <CenterSpinner />;

  if (active) {
    const other = otherParticipant(active, adminId);
    const [p0, p1] = active.participants;
    // Admin ishtirok etgan suhbatda chap tomonda suhbatdosh, o'ngda admin o'zi
    // (oddiy messenjerdagidek); boshqa suhbatlarda — birinchi ishtirokchi chapda.
    const left = other || p0;
    const nickLines = [
      p1?.savedAsByOther && { by: p0, of: p1, as: p1.savedAsByOther },
      p0?.savedAsByOther && { by: p1, of: p0, as: p0.savedAsByOther },
    ].filter(Boolean);

    return (
      <div className="rounded-3xl border border-border bg-surface shadow-card overflow-hidden flex flex-col h-[calc(100dvh-9rem)] min-h-[520px]">
        <header className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-border">
          <Link
            href="/admin/conversations"
            aria-label="Suhbatlar ro'yxatiga qaytish"
            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-muted hover:text-ink hover:bg-surface-2 transition-colors flex-shrink-0 ${FOCUS_RING}`}
          >
            <ArrowLeft size={18} />
          </Link>
          {other ? <UserAvatar user={other} size={44} /> : <PairAvatars a={p0} b={p1} size={46} />}
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-ink truncate">
              {other ? (
                <>
                  {displayName(other)}{' '}
                  {other.username && other.name && <span className="text-sm font-normal text-muted">@{other.username}</span>}
                </>
              ) : (
                <>
                  {handle(p0)} <span className="text-muted font-normal">↔</span> {handle(p1)}
                </>
              )}
            </h1>
            <p className="flex items-center gap-1.5 text-[11px] text-muted truncate">
              <ShieldCheck size={12} className="text-success flex-shrink-0" />
              Faqat ko&apos;rish · ochilish audit-log&apos;ga yoziladi
            </p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Havolani nusxalash"
            className={`inline-flex items-center gap-1.5 px-3 min-h-10 rounded-xl border border-border text-xs font-semibold text-muted hover:text-ink hover:border-accent/40 transition-colors flex-shrink-0 ${FOCUS_RING}`}
          >
            {copied ? <Check size={14} className="text-success" /> : <Link2 size={14} />}
            <span className="hidden sm:inline">{copied ? 'Nusxalandi' : 'Havolani nusxalash'}</span>
          </button>
        </header>

        <div className="flex flex-col gap-2.5 px-3 sm:px-5 py-3 border-b border-border bg-surface-2/40">
          {(nickLines.length > 0 || active.hiddenFor?.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {nickLines.map((n, i) => (
                <Chip key={i} tone="accent" icon={Tag}>
                  {handle(n.by)} → {handle(n.of)}ni &ldquo;{n.as}&rdquo; deb saqlagan
                </Chip>
              ))}
              {active.hiddenFor?.length > 0 && (
                <Chip tone="warning" icon={UserX}>
                  Ro&apos;yxatdan o&apos;chirgan: {active.hiddenFor.map((u) => `@${u}`).join(', ')}
                </Chip>
              )}
            </div>
          )}
          <Segmented items={VIEW_TABS} value={viewMode} onChange={switchView} label="Ko'rinish" />
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain bg-bg-sunken/60 [background-image:radial-gradient(rgb(var(--color-border)/0.55)_1px,transparent_1px)] [background-size:18px_18px]"
        >
          {viewMode !== 'chat' ? (
            <GalleryView
              type={viewMode}
              data={galleryData[viewMode]}
              participants={active.participants}
              onMore={loadMoreGallery}
              loadingMore={loadingMoreGallery}
            />
          ) : messages === null ? (
            <CenterSpinner />
          ) : messages.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="Xabar yo'q" hint="Bu suhbatda hali hech narsa yozilmagan." />
          ) : (
            <div className="px-2 sm:px-5 pb-5 pt-2">
              {msgCursor && (
                <div className="flex justify-center pt-2">
                  <PillButton onClick={loadOlderMessages} busy={loadingMoreMsgs} icon={ChevronUp}>
                    Eski xabarlarni yuklash
                  </PillButton>
                </div>
              )}
              <MessageStream messages={messages} leftId={left?._id} participants={active.participants} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- ro'yxat ----------
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          {/* Sahifa sarlavhasi ("Suhbatlar") AdminShell'da — bu yerda faqat bo'lim izohi. */}
          <p className="text-sm text-muted">
            {currentTab === 'mine' ? 'Siz ishtirok etgan yozishmalar' : 'Foydalanuvchilar orasidagi barcha yozishmalar'}
            {list.loaded && !list.error && (
              <span className="tabular-nums">
                {' '}
                · {list.items.length}
                {list.cursor ? '+' : ''}
              </span>
            )}
          </p>
        </div>
        {unlocked && (
          <div className="flex flex-col items-start sm:items-end gap-1">
            <Segmented
              label="Suhbatlar bo'limi"
              value={currentTab}
              onChange={(k) => {
                setTab(k);
                setQuery('');
              }}
              items={[
                { key: 'mine', label: 'Mening suhbatlarim', icon: UserRound },
                { key: 'others', label: 'Umumiy suhbatlar', icon: Users },
              ]}
            />
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Lock size={11} /> yashirish uchun &quot;Suhbatlar&quot;ni 5 marta bosing
            </span>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border">
          <label className="relative block">
            <span className="sr-only">Suhbatlarni qidirish</span>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism, @username yoki xabar bo'yicha qidirish"
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-surface-2 border border-transparent text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-surface focus:ring-4 focus:ring-accent/10 transition [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Qidiruvni tozalash"
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-3 ${FOCUS_RING}`}
              >
                <X size={14} />
              </button>
            )}
          </label>
          {query && list.cursor && (
            <p className="text-[11px] text-muted mt-2 px-1">
              Qidiruv faqat yuklangan suhbatlar orasida. Ko&apos;proq natija uchun pastdagi &quot;Yana yuklash&quot;ni bosing.
            </p>
          )}
        </div>

        {!list.loaded ? (
          <div className="divide-y divide-border" role="status" aria-label="Yuklanmoqda">
            {Array.from({ length: 6 }, (_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : list.error ? (
          <EmptyState icon={AlertTriangle} title="Ro'yxat yuklanmadi" hint="Sahifani yangilab ko'ring." />
        ) : filtered.length === 0 ? (
          query ? (
            <EmptyState icon={Search} title="Hech narsa topilmadi" hint={`"${query}" bo'yicha mos suhbat yo'q.`} />
          ) : (
            <EmptyState
              icon={MessageSquareText}
              title={currentTab === 'mine' ? 'Siz hali hech kim bilan yozishmagansiz' : "Suhbat yo'q"}
              hint={currentTab === 'mine' ? 'Foydalanuvchilar bilan yozishmalaringiz shu yerda chiqadi.' : undefined}
            />
          )
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c) => (
              <ConversationRow key={c.id} c={c} adminId={adminId} />
            ))}
          </div>
        )}

        {list.cursor && (
          <div className="flex justify-center py-4 border-t border-border">
            <PillButton onClick={loadMoreConversations} busy={loadingMoreConvos}>
              Yana yuklash
            </PillButton>
          </div>
        )}
      </div>
    </div>
  );
}
