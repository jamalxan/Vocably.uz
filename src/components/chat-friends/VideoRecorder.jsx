'use client';
import { useEffect, useRef, useState } from 'react';
import { Video, Square, X } from 'lucide-react';
import { mediaErrorMessage } from '@/lib/mediaError';

const MAX_SECONDS = 60; // Telegram uslubidagi qisqa "video xabar" — 1 daqiqagacha

function VideoRecorderPanel({ onRecorded, onCancel }) {
  const [seconds, setSeconds] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const stop = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 480, height: 480 },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunksRef.current.length === 0) return;
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
          const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
          onRecorded(file);
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        timerRef.current = setInterval(() => {
          setSeconds((s) => {
            if (s + 1 >= MAX_SECONDS) stop();
            return s + 1;
          });
        }, 1000);
      } catch (err) {
        alert(mediaErrorMessage(err, 'Kamera/mikrofon'));
        onCancel();
      }
    })();
    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    clearInterval(timerRef.current);
    // `stop()` navbatdagi bufer uchun oxirgi bitta `ondataavailable`ni chaqiradi
    // (shu chunk faqat SHUNDAN keyin, `onstop`dan oldin keladi) — shuning uchun
    // "bo'sh massiv" tekshiruvi yetarli emas edi: cancel bosilsa ham o'sha oxirgi
    // chunk qayta qo'shilib, video baribir yuborilib ketardi. `onstop`ning o'zini
    // uzib qo'yish (VoiceRecorder.jsx'dagi bilan bir xil yondashuv) buni oldini oladi.
    if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = null;
    chunksRef.current = [];
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCancel();
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-4 p-4">
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white/20">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
        <span className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-soft0 animate-pulse" />
          {mm}:{ss}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={cancel} className="p-3 bg-surface/10 hover:bg-surface/20 text-white rounded-full transition-colors">
          <X size={20} />
        </button>
        <button onClick={stop} className="p-4 bg-accent hover:bg-accent-hover text-white rounded-full transition-colors">
          <Square size={22} />
        </button>
      </div>
    </div>
  );
}

export default function VideoRecorderButton({ onRecorded }) {
  const [active, setActive] = useState(false);
  return (
    <>
      <button
        onClick={() => setActive(true)}
        title="Video xabar"
        className="p-2 text-muted hover:text-accent hover:bg-bg rounded-lg transition-colors"
      >
        <Video size={18} />
      </button>
      {active && (
        <VideoRecorderPanel
          onRecorded={(file) => {
            setActive(false);
            onRecorded(file);
          }}
          onCancel={() => setActive(false)}
        />
      )}
    </>
  );
}
