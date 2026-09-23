'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, X } from 'lucide-react';
import { mediaErrorMessage } from '@/lib/mediaError';
import { useChat } from '@/context/ChatContext';

// Ovozli xabar uchun yuqori chegara — cheksiz yozuv yuklashda xato bilan yo'qolmasin.
const MAX_SECONDS = 300;

// MediaRecorder API'ga tayanadi — Safari/iOS'da ba'zi formatlarda cheklov bo'lishi
// mumkin, haqiqiy qurilmada sinash tavsiya etiladi (docs/ chat plani, "Frontend" bo'limi).
export default function VoiceRecorder({ onRecorded, onCancel }) {
  const { sendTyping } = useChat();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
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
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        stream.getTracks().forEach((t) => t.stop());
        onRecorded(file);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
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
      alert(mediaErrorMessage(err, 'Mikrofon'));
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
    start();
    // Yozuv paytida komponent yopilsa (masalan suhbatdan chiqilsa) — mikrofon, taymer
    // o'chiriladi va hech narsa yuborilmaydi.
    return () => {
      genRef.current += 1;
      clearInterval(timerRef.current);
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

  return (
    <div className="absolute bottom-full mb-2 right-0 flex items-center gap-2 md:gap-3 bg-surface border border-border rounded-xl shadow-lg pl-4 pr-2 md:px-4 py-1.5 md:py-2.5 z-20">
      <span className="w-2 h-2 rounded-full bg-danger motion-safe:animate-pulse" />
      <span className="text-sm font-mono text-muted tabular-nums">
        {mm}:{ss}
      </span>
      <button
        type="button"
        onClick={cancel}
        aria-label="Ovozli xabarni bekor qilish"
        title="Bekor qilish"
        className="inline-flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-1.5 rounded-full text-muted hover:text-accent transition-colors"
      >
        <X size={16} />
      </button>
      <button
        type="button"
        onClick={stop}
        aria-label="Yozishni tugatib yuborish"
        title="Yuborish"
        className="inline-flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-1.5 bg-accent hover:bg-accent-hover text-on-accent rounded-full transition-colors"
      >
        <Square size={14} />
      </button>
    </div>
  );
}

export function VoiceRecorderButton({ onRecorded, onActiveChange }) {
  const [active, setActiveState] = useState(false);
  const setActive = (v) => {
    setActiveState(v);
    onActiveChange?.(v);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setActive(true)}
        title="Ovozli xabar"
        aria-label="Ovozli xabar yozish"
        className="inline-flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-2 text-muted hover:text-accent hover:bg-bg rounded-lg transition-colors"
      >
        <Mic size={18} />
      </button>
      {active && (
        <VoiceRecorder
          onRecorded={(file) => {
            setActive(false);
            onRecorded(file);
          }}
          onCancel={() => setActive(false)}
        />
      )}
    </div>
  );
}
