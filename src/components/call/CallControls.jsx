'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, SwitchCamera, Video, VideoOff, Volume2 } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { canChooseOutput, listCameras, listOutputs } from '@/lib/call/devices';

// Qo'ng'iroq boshqaruvlari (CALLS_SPEC §10.4): 56 px doiralar, ostida 11 px yorliq; tugatish o'ngda.
// Klaviatura: M — mikrofon, V — kamera (matn maydonida emas). Esc qo'ng'iroqni tugatmaydi.

const CIRCLE = 'w-14 h-14 rounded-full inline-flex items-center justify-center backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40';
const OFF = 'bg-white/15 hover:bg-white/25 text-white';
const ON = 'bg-white text-black';

function Control({ label, testid, pressed, onClick, children, buttonRef, disabled, haspopup, expanded, className = '' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-16">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={typeof pressed === 'boolean' ? pressed : undefined}
        aria-haspopup={haspopup}
        aria-expanded={haspopup ? !!expanded : undefined}
        data-testid={testid}
        onClick={onClick}
        disabled={disabled}
        className={`${CIRCLE} ${pressed ? ON : OFF} ${className}`}
      >
        {children}
      </button>
      <span aria-hidden="true" className="text-[11px] leading-tight text-white/80 text-center line-clamp-2">
        {label}
      </span>
    </div>
  );
}

export default function CallControls({ initialRef }) {
  const { t } = useT();
  const { call, toggleMic, toggleCamera, flipCamera, flipping, endCall, setOutputDevice, outputDeviceId } = useCall();
  const { status, mic, camera } = call;
  const [cameraCount, setCameraCount] = useState(0);
  const [outputs, setOutputs] = useState(null); // null = tanlab bo'lmaydi
  const [outputOpen, setOutputOpen] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    if (camera) listCameras().then((list) => alive && setCameraCount(list.length));
    return () => {
      alive = false;
    };
  }, [camera]);

  useEffect(() => {
    let alive = true;
    canChooseOutput().then(async (ok) => {
      if (!alive || !ok) return;
      const list = await listOutputs();
      if (alive) setOutputs(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handlersRef = useRef({ toggleMic, toggleCamera });
  useEffect(() => {
    handlersRef.current = { toggleMic, toggleCamera };
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      if (el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const k = e.key.toLowerCase();
      if (k === 'm') handlersRef.current.toggleMic();
      else if (k === 'v') handlersRef.current.toggleCamera();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (status === 'accepting' || status === 'ended') return null;

  return (
    <div className="relative flex items-end justify-center gap-5 md:gap-8 px-4 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black/70 to-transparent">
      <Control label={mic ? t('call.mute') : t('call.unmute')} testid="call-mute" pressed={!mic} onClick={toggleMic} buttonRef={initialRef}>
        {mic ? <Mic size={22} aria-hidden="true" /> : <MicOff size={22} aria-hidden="true" />}
      </Control>
      <Control label={camera ? t('call.cameraOff') : t('call.cameraOn')} testid="call-camera" pressed={camera} onClick={toggleCamera}>
        {camera ? <Video size={22} aria-hidden="true" /> : <VideoOff size={22} aria-hidden="true" />}
      </Control>
      {camera && cameraCount > 1 && (
        <Control label={t('call.flip')} testid="call-flip" onClick={flipCamera} disabled={flipping}>
          <SwitchCamera size={22} aria-hidden="true" />
        </Control>
      )}
      {outputs && outputs.length > 1 && (
        <Control label={t('call.speaker')} testid="call-output" onClick={() => setOutputOpen((v) => !v)} buttonRef={outputRef} haspopup="listbox" expanded={outputOpen}>
          <Volume2 size={22} aria-hidden="true" />
        </Control>
      )}
      <div className="flex flex-col items-center gap-1.5 w-16">
        <button
          type="button"
          aria-label={t('call.end')}
          title={t('call.end')}
          data-testid="call-end"
          onClick={endCall}
          className="w-16 h-16 rounded-full inline-flex items-center justify-center bg-danger text-on-danger hover:bg-danger/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <PhoneOff size={24} aria-hidden="true" />
        </button>
        <span aria-hidden="true" className="text-[11px] leading-tight text-white/80">
          {t('call.end')}
        </span>
      </div>
      {outputOpen && outputs && (
        <ul role="listbox" aria-label={t('call.speaker')} className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-black/80 backdrop-blur border border-white/20 p-1.5 text-sm">
          {outputs.map((d, i) => {
            const selected = (outputDeviceId || 'default') === d.deviceId;
            return (
              <li key={d.deviceId || i} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setOutputDevice(d.deviceId);
                    setOutputOpen(false);
                    outputRef.current?.focus();
                  }}
                  className={`w-full min-h-10 px-3 rounded-xl text-left truncate hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${selected ? 'font-semibold text-white' : 'text-white/80'}`}
                >
                  {d.label || `${t('call.speaker')} ${i + 1}`}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
