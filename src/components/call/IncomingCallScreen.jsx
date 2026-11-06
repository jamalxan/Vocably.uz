'use client';
import { useRef } from 'react';
import { Minimize2, Phone, PhoneOff, Volume2, VideoOff } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';
import Avatar from '@/components/avatar/Avatar';
import CallBackground from './CallBackground';
import { peerDisplayName } from './callUi';

// Kiruvchi qo'ng'iroq — desktop'da ham to'liq ekran (CALLS_SPEC §10.2). Esc hech narsa qilmaydi
// (tasodifan rad etib yubormaslik uchun); kichraytirish strip'ga o'tkazadi (mini qabul/rad bilan).
export default function IncomingCallScreen() {
  const { t } = useT();
  const { call, acceptCall, rejectCall, minimize, enableSound } = useCall();
  const acceptRef = useRef(null);
  const containerRef = useDialogFocus(true, acceptRef);
  const { peer, kind, audioBlocked } = call;
  const name = peerDisplayName(peer);

  return (
    <div
      ref={containerRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="call-peer"
      aria-describedby="call-incoming-status"
      data-testid="incoming-call"
      className="fixed inset-0 z-[70] h-dvh w-dvw bg-black text-white overflow-hidden flex flex-col"
      style={{ overscrollBehavior: 'none' }}
    >
      <CallBackground peer={peer} />
      <div className="relative flex items-center justify-between px-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={minimize}
          aria-label={t('call.minimize')}
          title={t('call.minimize')}
          className="w-11 h-11 inline-flex items-center justify-center rounded-full text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Minimize2 size={20} aria-hidden="true" />
        </button>
        <span className="text-white/60 text-xs font-semibold tracking-wide">Vocably</span>
        <span className="w-11" aria-hidden="true" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative">
          <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-white/30 motion-safe:animate-ping" />
          <Avatar userId={peer?.id} photoId={peer?.photoId} name={peer?.nickname || peer?.name} username={peer?.username} size={128} ringClass="border-white/20" />
        </div>
        <div className="max-w-full">
          <h2 id="call-peer" className="text-2xl font-semibold font-display truncate">
            {name}
          </h2>
          <p id="call-incoming-status" role="status" aria-live="assertive" className="mt-1 text-sm text-white/80">
            {kind === 'video' ? t('call.incomingVideo') : t('call.incomingAudio')}
          </p>
        </div>
        {audioBlocked && (
          <button
            type="button"
            data-testid="call-enable-sound"
            onClick={enableSound}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-white/15 hover:bg-white/25 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Volume2 size={16} aria-hidden="true" />
            {t('call.tapForSound')}
          </button>
        )}
      </div>

      <div className="relative flex flex-col items-center gap-5 px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        {kind === 'video' && (
          <button
            type="button"
            data-testid="call-accept-audio-only"
            onClick={() => acceptCall({ videoOff: true })}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-medium text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <VideoOff size={16} aria-hidden="true" />
            {t('call.acceptAudioOnly')}
          </button>
        )}
        <div className="w-full max-w-xs flex items-start justify-between">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              data-testid="call-decline"
              aria-label={t('call.decline')}
              onClick={rejectCall}
              className="w-[72px] h-[72px] rounded-full inline-flex items-center justify-center bg-danger text-on-danger hover:bg-danger/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <PhoneOff size={28} aria-hidden="true" />
            </button>
            <span aria-hidden="true" className="text-xs text-white/80">
              {t('call.decline')}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              ref={acceptRef}
              type="button"
              data-testid="call-accept"
              aria-label={t('call.accept')}
              onClick={() => acceptCall()}
              className="w-[72px] h-[72px] rounded-full inline-flex items-center justify-center bg-success text-on-success hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {/* Tugmaning o'zi qimirlamaydi (bosish nishoni barqaror), faqat ichidagi belgi "sakraydi". */}
              <span aria-hidden="true" className="inline-flex motion-safe:animate-bounce">
                <Phone size={28} aria-hidden="true" />
              </span>
            </button>
            <span aria-hidden="true" className="text-xs text-white/80">
              {t('call.accept')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
