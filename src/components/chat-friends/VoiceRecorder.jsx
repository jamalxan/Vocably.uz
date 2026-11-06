'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Trash2 } from 'lucide-react';
import { mediaErrorMessage } from '@/lib/mediaError';
import { useChat } from '@/context/ChatContext';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { buildWaveform } from '@/lib/chat/mediaMeta';

// Ovozli xabar uchun yuqori chegara — cheksiz yozuv yuklashda xato bilan yo'qolmasin.
const MAX_SECONDS = 300;

// MediaRecorder API'ga tayanadi — Safari/iOS'da ba'zi formatlarda cheklov bo'lishi
// mumkin, haqiqiy qurilmada sinash tavsiya etiladi (docs/ chat plani, "Frontend" bo'limi).
export default function VoiceRecorder({ onRecorded, onCancel }) {
  const { sendTyping, showChatNotice } = useChat();
  const { t, locale } = useT();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  // Telegram parity: the waveform is sampled while recording (AnalyserNode, ~20 samples/s) and
  // travels with the message, so bubbles draw it without decoding the audio.
  const samplesRef = useRef([]);
  const analyserRef = useRef(null);
  const sampleTimerRef = useRef(null);
  // Har bir mount o'z "avlod"iga ega — kech kelgan (eski) mikrofon oqimi darhol yopiladi.
  const genRef = useRef(0);

  const start = async () => {
    const gen = genRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (gen !== genRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      let startedAt = 0;
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(sampleTimerRef.current);
        analyserRef.current?.ctx?.close?.().catch?.(() => {});
        // MediaRecorder's webm has no duration header (the player reads it as
        // Infinity), so the recorded length travels with the message.
        onRecorded(file, (Date.now() - startedAt) / 1000, buildWaveform(samplesRef.current));
      };
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = { ctx, analyser };
        samplesRef.current = [];
        const buf = new Uint8Array(analyser.fftSize);
        sampleTimerRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let peak = 0;
          for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128) / 128);
          samplesRef.current.push(peak);
        }, 50);
      } catch {
        analyserRef.current = null; // no Web Audio — the bubble draws a flat waveform
      }
      mediaRecorderRef.current = recorder;
      recorder.start();
      startedAt = Date.now();
      setRecording(true);
      setSeconds(0);
      // Boshqa tomonga "ovoz yubormoqda..." ko'rsatish uchun — sendTyping'ning o'zida
      // 2s throttle bor, shuning uchun har soniya chaqirsak ham socket'ga faqat
      // 2s'da bir ketadi, lekin butun yozuv davomida (3s auto-clear oynasidan tez-tez) tirik turadi.
      sendTyping('voice');
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
        sendTyping('voice');
      }, 1000);
    } catch (err) {
      if (gen !== genRef.current) return;
      showChatNotice(mediaErrorMessage(err, 'Mikrofon', locale), 'error');
      onCancel();
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const cancel = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = null;
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
    onCancel();
  };

  useEffect(() => {
    genRef.current += 1;
    (async () => {
      await start();
    })();
    // Yozuv paytida komponent yopilsa (masalan suhbatdan chiqilsa) — mikrofon, taymer
    // o'chiriladi va hech narsa yuborilmaydi.
    return () => {
      genRef.current += 1;
      clearInterval(timerRef.current);
      clearInterval(sampleTimerRef.current);
      analyserRef.current?.ctx?.close?.().catch?.(() => {});
      const rec = mediaRecorderRef.current;
      if (rec) {
        rec.onstop = null;
        rec.ondataavailable = null;
        if (rec.state === 'recording') rec.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!recording) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  // PARITY_PLAN WP8 — yozuv paneli kiritish "pill"ining O'RNIDA (Composer formasi ustida, Telegram):
  // qizil nuqta + taymer + izoh, chapda bekor qilish, o'ngda yuborish. Taymer matni `00:03` (E2E shunga qaraydi).
  return (
    <div className="absolute inset-x-2 sm:inset-x-3 inset-y-2 sm:inset-y-2.5 z-20 flex items-center gap-1.5 md:gap-2 bg-bg rounded-2xl pl-1 pr-1 chat-fade-in" data-testid="voice-recording">
      <button
        type="button"
        onClick={cancel}
        aria-label={t('ch.voiceCancelAria')}
        title={t('ch.cancel')}
        className="inline-flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-full text-muted hover:text-danger transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Trash2 size={17} />
      </button>
      <span className="w-2.5 h-2.5 rounded-full bg-danger motion-safe:animate-pulse flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium text-ink tabular-nums flex-shrink-0">
        {mm}:{ss}
      </span>
      <span className="flex-1 min-w-0 truncate text-sm text-muted">{t('ch.voiceRecording')}</span>
      <button
        type="button"
        onClick={stop}
        aria-label={t('ch.finishSendAria')}
        title={t('ch.finishSendAria')}
        className="inline-flex items-center justify-center w-11 h-11 md:w-9 md:h-9 bg-accent hover:bg-accent-hover text-on-accent rounded-full transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

export function VoiceRecorderButton({ onRecorded, onActiveChange }) {
  const { t } = useT();
  // iOS bir vaqtda bitta yozib olishga ruxsat beradi — qo'ng'iroq paytida yozib bo'lmaydi.
  const callStatus = useCall().call.status;
  const inCall = callStatus !== 'idle' && callStatus !== 'elsewhere';
  const [active, setActiveState] = useState(false);
  const setActive = (v) => {
    setActiveState(v);
    onActiveChange?.(v);
  };
  // Wrapper ATAYLAB `relative` emas: yozuv paneli Composer formasiga nisbatan joylashadi (pill o'rnida).
  return (
    <div>
      <button
        type="button"
        onClick={() => setActive(true)}
        disabled={inCall}
        title={inCall ? t('call.busyToast') : t('ch.voiceMsg')}
        aria-label={t('ch.voiceRecordAria')}
        className="inline-flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-2 text-muted hover:text-accent hover:bg-bg rounded-lg transition-colors disabled:opacity-40 disabled:hover:text-muted"
      >
        <Mic size={18} />
      </button>
      {active && (
        <VoiceRecorder
          onRecorded={(file, durationSec, waveform) => {
            setActive(false);
            onRecorded(file, durationSec, waveform);
          }}
          onCancel={() => setActive(false)}
        />
      )}
    </div>
  );
}
