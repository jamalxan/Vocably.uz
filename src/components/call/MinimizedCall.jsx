'use client';
import { MicOff, Phone, PhoneOff } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { elapsedLabel, peerDisplayName, useCornerDrag, useElapsedSec, useStreamRef } from './callUi';

// Kichraytirilgan qo'ng'iroq (CALLS_SPEC §10.5): audio (va mobil'dagi har qanday) qo'ng'iroq — yuqoridagi
// yashil strip; video qo'ng'iroq `md`dan katta ekranda — sudraladigan PiP karta. /app ichida
// navigatsiya qo'ng'iroqni to'xtatmaydi (provider layout'da).

const CARD_CORNER = { tr: 'top-20 right-6', tl: 'top-20 left-6 md:left-[96px] xl:left-[280px]', br: 'bottom-6 right-6', bl: 'bottom-6 left-6 md:left-[96px] xl:left-[280px]' };

function PipCard() {
  const { t } = useT();
  const { call, restore, remoteStream } = useCall();
  const drag = useCornerDrag('tr');
  const videoRef = useStreamRef(remoteStream);
  const elapsed = useElapsedSec(call.status === 'active' ? call.since : null);
  return (
    <button
      type="button"
      {...drag.handlers}
      style={drag.style}
      onClick={() => {
        if (!drag.moved()) restore();
      }}
      aria-label={t('call.returnToCall')}
      title={t('call.returnToCall')}
      data-testid="call-pip-card"
      className={`fixed z-[70] ${CARD_CORNER[drag.corner]} w-40 h-56 rounded-2xl overflow-hidden shadow-card border border-white/20 bg-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
    >
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] tabular-nums">
        {call.status === 'active' ? elapsedLabel(elapsed) : peerDisplayName(call.peer)}
      </span>
      {!call.mic && (
        <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1">
          <MicOff size={12} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

function Strip() {
  const { t } = useT();
  const { call, restore, acceptCall, rejectCall } = useCall();
  const elapsed = useElapsedSec(call.status === 'active' ? call.since : null);
  const incoming = call.status === 'incoming';
  const label =
    call.status === 'active'
      ? elapsedLabel(elapsed)
      : incoming
        ? peerDisplayName(call.peer)
        : call.status === 'outgoing'
          ? call.ringing
            ? t('call.statusRinging')
            : t('call.statusRequesting')
          : call.status === 'reconnecting'
            ? t('call.statusReconnecting')
            : t('call.statusConnecting');
  return (
    <div className="fixed top-0 inset-x-0 md:left-[72px] xl:left-64 z-[70] h-9 bg-success text-on-success text-sm font-semibold flex items-center">
      <button
        type="button"
        onClick={restore}
        aria-label={t('call.returnToCall')}
        data-testid="call-minimized"
        className="flex-1 min-w-0 h-full flex items-center justify-center gap-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <Phone size={14} aria-hidden="true" />
        <span className="truncate">{t('call.returnToCall')}</span>
        <span aria-hidden="true" className="tabular-nums opacity-90 truncate">
          · {label}
        </span>
      </button>
      {incoming && (
        <div className="flex items-center gap-2 pr-2">
          <button
            type="button"
            data-testid="call-decline-mini"
            aria-label={t('call.decline')}
            onClick={rejectCall}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-danger text-on-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <PhoneOff size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            data-testid="call-accept-mini"
            aria-label={t('call.accept')}
            onClick={() => acceptCall()}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-on-success text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Phone size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function MinimizedCall() {
  const { call } = useCall();
  const isMd = useMediaQuery('(min-width: 768px)');
  const isVideo = call.kind === 'video' || call.camera || call.remoteCamera;
  if (isVideo && isMd && call.status !== 'incoming') return <PipCard />;
  return <Strip />;
}
