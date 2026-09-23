'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, RotateCcw, Check } from 'lucide-react';
import { mediaErrorMessage } from '@/lib/mediaError';
import { useExamStore } from '../state/examStore';
import { uploadSpeakingRecording } from '../state/attemptsApi';

// TZ-vocably-v2.md §19 Faza 4 item 23 — bitta Speaking javobini yozib olish.
// MediaRecorder oqimi eski (pre-exam-engine) `/app/gapirish/page.jsx`dan
// ATAYLAB deyarli aynan ko'chirilgan (getUserMedia -> MediaRecorder -> Blob ->
// yuklash) — bu pattern allaqachon production'da sinalgan, qayta ixtiro
// qilishning hojati yo'q. Farq: natija shu yerda ko'rsatilmaydi (AI baholash
// butun bo'lim tugagach, YAXLIT — speakingGrader.ts izohiga q.), faqat
// "yuklandi" holati.
export interface RecordingPaneProps {
  part: 1 | 2 | 3;
  questionIndex: number;
  maxDurationSec?: number; // faqat Part 2 (speakSec) — yetilsa avtomatik to'xtaydi
  alreadyRecorded: boolean; // resume: bu javob avval yozib olinganmi
  onUploaded: () => void;
  onRecordingChange?: (recording: boolean) => void;
}

export default function RecordingPane({
  part,
  questionIndex,
  maxDurationSec,
  alreadyRecorded,
  onUploaded,
  onRecordingChange,
}: RecordingPaneProps) {
  const attemptId = useExamStore((s) => s.attemptId);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(alreadyRecorded);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0); // maxDurationSec tekshiruvi uchun — `seconds` state async, closure eskirib qolishi mumkin
  // Yuklash muvaffaqiyatsiz bo'lsa — qayta yozdirmasdan shu yozuvni qayta yuborish uchun.
  const lastRecordingRef = useRef<{ blob: Blob; durationSec: number } | null>(null);
  const onRecordingChangeRef = useRef(onRecordingChange);
  useEffect(() => {
    onRecordingChangeRef.current = onRecordingChange;
  });

  useEffect(() => {
    onRecordingChangeRef.current?.(recording);
  }, [recording]);

  useEffect(() => {
    setDone(alreadyRecorded);
    setSeconds(0);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part, questionIndex]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Unmount paytida yozuv to'xtatilsa `onstop` yarim javobni yuklab,
      // "yozib olindi" deb belgilamasin — tugallanmagan yozuv tashlab yuboriladi.
      if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onRecordingChangeRef.current?.(false);
    },
    []
  );

  const upload = async (blob: Blob, durationSec: number) => {
    if (!attemptId) return;
    setUploading(true);
    setError('');
    lastRecordingRef.current = { blob, durationSec };
    try {
      await uploadSpeakingRecording(attemptId, { part, questionIndex, blob, durationSec });
      lastRecordingRef.current = null;
      setDone(true);
      onUploaded();
    } catch (err: any) {
      setError(err?.message || "Yuklab bo'lmadi — qaytadan urinib ko'ring");
    } finally {
      setUploading(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const startRecording = async () => {
    setError('');
    setDone(false);
    lastRecordingRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        upload(blob, secondsRef.current);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      secondsRef.current = 0;
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (maxDurationSec && secondsRef.current >= maxDurationSec) stopRecording();
      }, 1000);
    } catch (err) {
      setError(mediaErrorMessage(err, 'Mikrofon'));
    }
  };

  if (done && !recording) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--exam-answered-bg)', color: 'var(--exam-answered)' }}
        >
          <Check size={24} />
        </div>
        <p className="text-sm" style={{ color: 'var(--exam-muted)' }}>
          Javob yozib olindi.
        </p>
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-1.5 min-h-11 md:min-h-8 px-4 md:px-3 py-1.5 text-sm md:text-xs font-semibold rounded-lg focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ border: '1px solid var(--exam-input-border)', color: 'var(--exam-text)' }}
        >
          <RotateCcw size={13} /> Qayta yozib olish
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--exam-accent)' }} />
          <p className="text-xs" style={{ color: 'var(--exam-muted)' }}>
            Yuklanmoqda...
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            aria-label={recording ? "Yozishni to'xtatish" : "Yozishni boshlash"}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)] ${
              recording ? 'animate-pulse' : ''
            }`}
            style={{
              background: recording ? 'var(--exam-danger)' : 'var(--exam-accent)',
              color: '#fff',
            }}
          >
            {recording ? <Square size={26} /> : <Mic size={30} />}
          </button>
          <p className="text-xs" style={{ color: 'var(--exam-muted)' }}>
            {recording
              ? `${seconds}s${maxDurationSec ? ` / ${maxDurationSec}s` : ''} — to'xtatish uchun bosing`
              : 'Boshlash uchun bosing'}
          </p>
        </>
      )}
      {error && (
        <p className="text-xs" style={{ color: 'var(--exam-danger)' }} role="alert">
          {error}
        </p>
      )}
      {error && !uploading && !recording && lastRecordingRef.current && (
        <button
          type="button"
          onClick={() => {
            const last = lastRecordingRef.current;
            if (last) upload(last.blob, last.durationSec);
          }}
          className="flex items-center gap-1.5 min-h-11 md:min-h-8 px-4 md:px-3 py-1.5 text-sm md:text-xs font-semibold rounded-lg text-white focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ background: 'var(--exam-accent)' }}
        >
          <RotateCcw size={13} /> Qayta yuklash
        </button>
      )}
    </div>
  );
}
