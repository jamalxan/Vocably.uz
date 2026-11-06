'use client';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video, VideoOff } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { callBubbleLabelKey, callIconName, formatCallDuration, isMissedForViewer } from '@/lib/call/callLabels';

const ICONS = { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video, VideoOff };

// Qo'ng'iroq yozuvi pufakchasi (CALLS_SPEC §10.8): yo'nalish va natija ko'ruvchiga qarab, bosilsa —
// shu turdagi qo'ng'iroq qayta qilinadi. Tanlash rejimida bosish qatorni tanlaydi (MessageBubble).
export default function CallBubble({ message, isMine, peer, timeLabel, selectionMode = false }) {
  const { t } = useT();
  const { canCall, startCall, unavailableKey } = useCall();
  const info = message.call || {};
  const kind = info.kind === 'video' ? 'video' : 'audio';
  const outcome = info.outcome || 'failed';
  const missed = isMissedForViewer(outcome, isMine);
  const Icon = ICONS[callIconName(kind, outcome, isMine)] || Phone;
  const label = `${kind === 'video' ? `${t('mb.callVideoKind')} · ` : ''}${t(callBubbleLabelKey(outcome, isMine))}`;
  const detail = outcome === 'ended' && info.durationSec !== null && info.durationSec !== undefined ? formatCallDuration(info.durationSec) : timeLabel;
  const disabled = !canCall || !message.conversationId;

  const callBack = () => {
    if (selectionMode || disabled) return;
    startCall({ conversationId: String(message.conversationId), kind, peer });
  };

  return (
    <div
      role="button"
      tabIndex={selectionMode ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={t('mb.callAria', { label, detail })}
      title={disabled && unavailableKey ? t(unavailableKey) : t('mb.callBack')}
      data-testid="call-message"
      data-call-outcome={outcome}
      data-call-kind={kind}
      onClick={callBack}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          callBack();
        }
      }}
      className={`flex items-center gap-3 w-60 max-w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${disabled || selectionMode ? '' : 'cursor-pointer'}`}
    >
      <span
        aria-hidden="true"
        className={`w-10 h-10 flex-shrink-0 rounded-full grid place-items-center ${isMine ? 'bg-on-accent/20' : 'bg-accent-soft text-accent'} ${missed ? 'text-danger' : ''}`}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1 min-w-0" aria-hidden="true">
        <span className={`block text-sm font-semibold truncate ${missed ? 'text-danger' : ''}`}>{label}</span>
        <span className={`block text-[11px] tabular-nums ${isMine ? 'text-on-accent/85' : 'text-muted'}`}>{detail}</span>
      </span>
      <Phone size={16} aria-hidden="true" className={`flex-shrink-0 ${isMine ? 'text-on-accent/70' : 'text-muted'} ${disabled ? 'opacity-50' : ''}`} />
    </div>
  );
}
