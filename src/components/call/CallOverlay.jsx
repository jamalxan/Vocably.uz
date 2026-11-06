'use client';
import { useEffect, useRef } from 'react';
import { useCall } from '@/context/CallContext';
import { useBackClose } from '@/lib/useBackClose';
import { isLiveStatus } from '@/lib/call/callMachine';
import IncomingCallScreen from './IncomingCallScreen';
import InCallScreen from './InCallScreen';
import MinimizedCall from './MinimizedCall';
import ElsewhereBanner from './ElsewhereBanner';
import CallErrorSheet from './CallErrorSheet';

// Qo'ng'iroq qatlamining yagona kirish nuqtasi ((main) layout'da, CALLS_SPEC §10.1). Holatga qarab
// ekranni tanlaydi; masofaviy ovoz uchun <audio> qo'ng'iroq jonli bo'lgan butun vaqt (kichraytirilganda
// ham) o'rnatilgan turadi. Android "orqaga" — kichraytiradi, hech qachon tugatmaydi.
export default function CallOverlay() {
  const { call, minimize, remoteStream, reportAudioBlocked, audioRetry, outputDeviceId } = useCall();
  const { status, minimized, error } = call;
  const audioRef = useRef(null);
  const live = isLiveStatus(status);
  const fullScreen = !minimized && status !== 'idle' && status !== 'elsewhere';

  useBackClose(fullScreen && status !== 'ended', minimize);

  // To'liq ekranli qo'ng'iroqda orqa sahifa surilmasin (VideoRecorder.jsx'dagi retsept).
  useEffect(() => {
    if (!fullScreen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullScreen]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.srcObject !== remoteStream) el.srcObject = remoteStream || null;
    if (!remoteStream) return;
    const p = el.play?.();
    if (p && typeof p.then === 'function') p.then(() => reportAudioBlocked(false)).catch((err) => err?.name === 'NotAllowedError' && reportAudioBlocked(true));
  }, [remoteStream, audioRetry, live, reportAudioBlocked]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !outputDeviceId || typeof el.setSinkId !== 'function') return;
    el.setSinkId(outputDeviceId).catch(() => {});
  }, [outputDeviceId, live]);

  if (status === 'idle' && !error) return null;

  let screen = null;
  if (status === 'elsewhere') screen = <ElsewhereBanner />;
  else if (status !== 'idle' && minimized) screen = <MinimizedCall />;
  else if (status === 'incoming') screen = <IncomingCallScreen />;
  else if (status !== 'idle') screen = <InCallScreen />;

  return (
    <div data-testid="call-overlay" data-state={status}>
      {screen}
      {live && <audio ref={audioRef} autoPlay playsInline data-testid="remote-audio" className="hidden" />}
      {error && <CallErrorSheet />}
    </div>
  );
}
