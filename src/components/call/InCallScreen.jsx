'use client';
import { useRef } from 'react';
import { Loader2, MicOff, Minimize2, PictureInPicture2, VideoOff, Volume2 } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';
import { endReasonLabelKey } from '@/lib/call/callMachine';
import { formatCallDuration } from '@/lib/chatConstants';
import Avatar from '@/components/avatar/Avatar';
import CallBackground from './CallBackground';
import CallControls from './CallControls';
import { elapsedLabel, peerDisplayName, useCornerDrag, useElapsedSec, useStreamRef } from './callUi';

// Chiquvchi / ulanish / faol / qayta ulanish / tugadi ekrani (CALLS_SPEC §10.3).

const PREVIEW_CORNER = {
  tr: 'top-[calc(4rem+env(safe-area-inset-top))] right-4',
  tl: 'top-[calc(4rem+env(safe-area-inset-top))] left-4',
  br: 'bottom-[calc(9rem+env(safe-area-inset-bottom))] right-4',
  bl: 'bottom-[calc(9rem+env(safe-area-inset-bottom))] left-4',
};

function statusText(t, call, elapsed) {
  switch (call.status) {
    case 'starting':
    case 'inviting':
      return t('call.statusRequesting');
    case 'outgoing':
      return call.ringing ? t('call.statusRinging') : t('call.statusRequesting');
    case 'accepting':
    case 'connecting':
      return t('call.statusConnecting');
    case 'active':
      return t('call.statusActive');
    case 'reconnecting':
      return t('call.statusReconnecting');
    case 'ended':
      return t(endReasonLabelKey(call.endReason, call.role, call.durationSec), { d: formatCallDuration(call.durationSec ?? elapsed) });
    default:
      return '';
  }
}

export default function InCallScreen() {
  const { t } = useT();
  const { call, minimize, localStream, remoteStream, enableSound } = useCall();
  const { status, peer, kind, camera, facing, remoteMic, remoteCamera, since, ringing, audioBlocked } = call;
  const muteRef = useRef(null);
  const containerRef = useDialogFocus(true, muteRef);
  const elapsed = useElapsedSec(status === 'active' ? since : null);
  const remoteRef = useStreamRef(remoteStream);
  const localRef = useStreamRef(localStream);
  const drag = useCornerDrag('tr');
  const name = peerDisplayName(peer);
  const isVideo = kind === 'video' || camera || remoteCamera;
  const showRemoteVideo = isVideo && remoteCamera && !!remoteStream;
  const pipSupported = typeof document !== 'undefined' && !!document.pictureInPictureEnabled;

  const enterPip = () => {
    const v = remoteRef.current;
    if (v && typeof v.requestPictureInPicture === 'function') v.requestPictureInPicture().catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-peer"
      className="fixed inset-0 z-[70] h-dvh w-dvw bg-black text-white overflow-hidden flex flex-col"
      style={{ overscrollBehavior: 'none' }}
    >
      <CallBackground peer={peer} />
      {isVideo && (
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          muted
          data-testid="remote-video"
          className={`absolute inset-0 w-full h-full object-cover ${showRemoteVideo ? '' : 'invisible'}`}
        />
      )}

      <div className="relative flex items-center justify-between px-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        {status !== 'ended' ? (
          <button
            type="button"
            onClick={minimize}
            aria-label={t('call.minimize')}
            title={t('call.minimize')}
            data-testid="call-minimize"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Minimize2 size={20} aria-hidden="true" />
          </button>
        ) : (
          <span className="w-11" aria-hidden="true" />
        )}
        {kind === 'video' && pipSupported && status !== 'ended' && (
          <button
            type="button"
            onClick={enterPip}
            aria-label={t('call.pip')}
            title={t('call.pip')}
            data-testid="call-pip"
            className="w-11 h-11 inline-flex items-center justify-center rounded-full text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <PictureInPicture2 size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={`relative flex-1 flex flex-col items-center ${showRemoteVideo ? 'justify-start pt-2' : 'justify-center'} gap-5 px-6 text-center`}>
        {!showRemoteVideo && (
          <span className={`rounded-full ${status === 'outgoing' && ringing ? 'motion-safe:animate-pulse' : ''}`}>
            <Avatar userId={peer?.id} photoId={peer?.photoId} name={peer?.nickname || peer?.name} username={peer?.username} size={128} ringClass="border-white/20" />
          </span>
        )}
        <div className="max-w-full">
          <h2 id="call-peer" className="text-xl font-semibold font-display truncate">
            {name}
          </h2>
          <p role="status" aria-live="polite" data-testid="call-status" data-state={status} className="mt-1 text-sm text-white/80 inline-flex items-center gap-2">
            {status === 'reconnecting' && <Loader2 size={14} className="motion-safe:animate-spin" aria-hidden="true" />}
            <span>{statusText(t, call, elapsed)}</span>
            {status === 'active' && (
              <span aria-hidden="true" className="tabular-nums text-white/80">
                {elapsedLabel(elapsed)}
              </span>
            )}
          </p>
          {status === 'active' && (
            <span className="sr-only" aria-live="polite">
              {t('call.elapsedAria', { d: elapsedLabel(Math.floor(elapsed / 60) * 60) })}
            </span>
          )}
          {(!remoteMic || (isVideo && !remoteCamera && status === 'active')) && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              {!remoteMic && (
                <span data-testid="call-peer-muted" className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1">
                  <MicOff size={12} aria-hidden="true" />
                  {t('call.peerMuted')}
                </span>
              )}
              {isVideo && !remoteCamera && status === 'active' && (
                <span data-testid="call-peer-camera-off" className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1">
                  <VideoOff size={12} aria-hidden="true" />
                  {t('call.peerCameraOff')}
                </span>
              )}
            </div>
          )}
          {audioBlocked && status !== 'ended' && (
            <button
              type="button"
              data-testid="call-enable-sound"
              onClick={enableSound}
              className="mt-4 inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-white/15 hover:bg-white/25 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Volume2 size={16} aria-hidden="true" />
              {t('call.tapForSound')}
            </button>
          )}
        </div>
      </div>

      {camera && localStream && status !== 'ended' && (
        <div
          {...drag.handlers}
          style={drag.style}
          className={`absolute z-10 ${PREVIEW_CORNER[drag.corner]} w-24 h-32 md:w-36 md:h-48 rounded-2xl overflow-hidden border border-white/20 shadow-card bg-black cursor-grab active:cursor-grabbing motion-safe:transition-transform`}
        >
          <video ref={localRef} autoPlay playsInline muted data-testid="local-video" className={`w-full h-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`} />
        </div>
      )}

      <div className="relative">
        <CallControls initialRef={muteRef} />
      </div>
    </div>
  );
}
