'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, X } from 'lucide-react';

// MediaRecorder API'ga tayanadi — Safari/iOS'da ba'zi formatlarda cheklov bo'lishi
// mumkin, haqiqiy qurilmada sinash tavsiya etiladi (docs/ chat plani, "Frontend" bo'limi).
export default function VoiceRecorder({ onRecorded, onCancel }) {
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
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert('Mikrofonga ruxsat berilmadi');
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
    <div className="absolute bottom-full mb-2 right-0 flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2.5 z-20">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm font-mono text-slate-600 tabular-nums">
        {mm}:{ss}
      </span>
      <button onClick={cancel} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
        <X size={16} />
      </button>
      <button onClick={stop} className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors">
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
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
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
