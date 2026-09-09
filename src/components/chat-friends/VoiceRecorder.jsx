'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, X } from 'lucide-react';
import { mediaErrorMessage } from '@/lib/mediaError';
import { useChat } from '@/context/ChatContext';

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

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        setSeconds((s) => s + 1);
        sendTyping('voice');
      }, 1000);
    } catch (err) {
      alert(mediaErrorMessage(err, 'Mikrofon'));
      onCancel();
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
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
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!recording) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="absolute bottom-full mb-2 right-0 flex items-center gap-3 bg-surface border border-border rounded-xl shadow-lg px-4 py-2.5 z-20">
      <span className="w-2 h-2 rounded-full bg-accent-soft0 animate-pulse" />
      <span className="text-sm font-mono text-muted tabular-nums">
        {mm}:{ss}
      </span>
      <button onClick={cancel} aria-label="Ovozli xabarni bekor qilish" title="Bekor qilish" className="p-1.5 text-muted hover:text-accent transition-colors">
        <X size={16} />
      </button>
      <button onClick={stop} aria-label="Yozishni tugatib yuborish" title="Yuborish" className="p-1.5 bg-accent hover:bg-accent-hover text-white rounded-full transition-colors">
        <Square size={14} />
      </button>
    </div>
  );
}

export function VoiceRecorderButton({ onRecorded }) {
  const [active, setActive] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setActive(true)}
        title="Ovozli xabar"
        aria-label="Ovozli xabar yozish"
        className="p-2 text-muted hover:text-accent hover:bg-bg rounded-lg transition-colors"
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
