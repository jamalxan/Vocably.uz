'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// TZ-vocably-v2.md §7.1 — "AudioEngine qoidalari (exam rejim)":
//   - <audio> elementi yashirin, native controls YO'Q
//   - preload="auto"
//   - Faqat volume boshqariladi
//   - seek BLOKLANADI: onseeking'da lastKnownTime'ga qaytariladi
//   - pause BLOKLANADI (foydalanuvchi tomonidan)
//   - Part tugagach avtomatik keyingi partga o'tadi
//   - Refresh qilinsa: server positionSec'dan davom etadi, boshidan EMAS
//
// §7.7 — practice rejimda BARCHASI aksincha: pauza/seek/tezlik/qayta tinglash
// erkin. Bu komponent shu farqni `mode` propi orqali hal qiladi — UI
// boshqaruvlari (play/pause/±10s/tezlik) BU YERDA YO'Q, ular chaqiruvchida
// (ListeningSection practice rejimida) alohida render qilinadi; AudioEngine
// faqat pastki `<audio>` mexanizmini boshqaradi.
export interface AudioEngineProps {
  src: string; // /api/exam/audio/:fileId
  mode: 'exam' | 'practice';
  volume: number; // 0-1
  playbackRate?: number; // faqat practice
  startPositionSec: number; // refresh'dan keyin shu joydan davom etadi
  play: boolean; // true bo'lganda audio.play() chaqiriladi (VolumeCheck/ListeningSection boshqaradi)
  onPositionChange: (sec: number) => void;
  onEnded: () => void;
  onDurationKnown?: (sec: number) => void;
  // play() rad etilsa (avtoplay bloki) yoki audio yuklanmasa/xato bersa.
  onPlaybackError?: () => void;
}

// Faqat practice rejimda kerak (ListeningPracticeSection.tsx — ±10s tugmalari)
// — exam rejimda seek allaqachon `onSeeking` orqali bloklangan, tashqi
// dasturiy seek imkoniyatining o'zi shart emas.
export interface AudioEngineHandle {
  seekBy: (deltaSec: number) => void;
  // Foydalanuvchi tugmasi (user gesture) ichidan qayta ishga tushirish; xato
  // bo'lgan bo'lsa audio qayta yuklanadi va oxirgi pozitsiyadan davom etadi.
  retryPlay: () => Promise<boolean>;
}

const AudioEngine = forwardRef<AudioEngineHandle, AudioEngineProps>(function AudioEngine(
  { src, mode, volume, playbackRate = 1, startPositionSec, play, onPositionChange, onEnded, onDurationKnown, onPlaybackError },
  ref
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastKnownTimeRef = useRef(startPositionSec);
  const positionAppliedRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const playRef = useRef(play);
  const onPlaybackErrorRef = useRef(onPlaybackError);
  useEffect(() => {
    playRef.current = play;
    onPlaybackErrorRef.current = onPlaybackError;
  });

  // Har `src` (yangi part) uchun boshlang'ich pozitsiyani FAQAT bir marta
  // qo'llaymiz — `loadedmetadata`gacha `currentTime` o'rnatib bo'lmaydi.
  useEffect(() => {
    positionAppliedRef.current = false;
    lastKnownTimeRef.current = startPositionSec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onLoadedMetadata = () => {
      if (pendingSeekRef.current != null) {
        // retryPlay() — xatodan keyin qayta yuklangan audio oxirgi joydan davom etadi.
        lastKnownTimeRef.current = pendingSeekRef.current;
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
      } else if (!positionAppliedRef.current) {
        audio.currentTime = startPositionSec;
        positionAppliedRef.current = true;
      }
      onDurationKnown?.(audio.duration);
    };

    const onTimeUpdate = () => {
      lastKnownTimeRef.current = audio.currentTime;
      onPositionChange(audio.currentTime);
    };

    // §7.1 — "seek BLOKLANADI". Practice rejimda foydalanuvchi o'zi
    // boshqaradigan ±10s tugmalari HAM `audio.currentTime`ni bevosita
    // o'zgartiradi — bu holatda `onseeking` ham otiladi, shuning uchun
    // practice rejimda bu tekshiruv BUTUNLAY o'chirilgan.
    const onSeeking = () => {
      if (mode !== 'exam') return;
      if (Math.abs(audio.currentTime - lastKnownTimeRef.current) > 0.25) {
        audio.currentTime = lastKnownTimeRef.current;
      }
    };

    // §7.1 — "pause BLOKLANADI". Haqiqiy imtihonda exam UI hech qanday
    // pauza tugmasi ko'rsatmaydi — bu shunga qo'shimcha ehtiyot chorasi
    // (masalan tashqi media-tugma/qisqa tugma orqali pauza bo'lib qolsa).
    const onPause = () => {
      if (mode === 'exam' && !audio.ended) {
        audio.play().catch(() => {
          // Avtoplay siyosati bloklashi mumkin — bu holatda hech narsa
          // qilolmaymiz, foydalanuvchi allaqachon play tugmasini bosgan edi.
        });
      }
    };

    const onError = () => {
      if (playRef.current) onPlaybackErrorRef.current?.();
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('seeking', onSeeking);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('seeking', onSeeking);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && mode === 'practice') audio.playbackRate = playbackRate;
  }, [playbackRate, mode]);

  // `play` prop true bo'lganda chaqiriladi. Diqqat: bu effekt faqat `play`
  // TRUE'ga o'zgargan click handler'i bilan BIR XIL React commit ichida
  // ishga tushsa avtoplay siyosatiga tegmaydi (odatiy holat — oddiy onClick
  // → setState → effekt zanjiri, orada `await` bo'lmasa brauzer "user
  // activation"ni saqlab qoladi). Agar kelajakda bu ishlamay qolsa — sabab
  // shu zanjirda biror joyda asinxron kutish paydo bo'lgani, yechim: play()ni
  // to'g'ridan-to'g'ri onClick handler'ining o'zida (ref orqali) chaqirish.
  //
  // `play === false` bo'lganda `audio.pause()` chaqirish FAQAT practice
  // rejimda kerak — exam rejimda haqiqiy pauza tugmasi umuman yo'q (`play`
  // bir marta true bo'lib qoladi), va `onPause` listeneri allaqachon har
  // qanday kutilmagan pauzani avtomatik davom ettiradi (yuqorida) — shu ikki
  // mexanizm bir-biriga qarshi kelmasin uchun bu yerda exam rejim TEGILMAYDI.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (play) {
      audio.play().catch((err) => {
        // Avtoplay bloklandi yoki audio yuklanmadi — chaqiruvchi "qayta
        // boshlash" tugmasini ko'rsatadi. AbortError (pause/load) xato emas.
        if (err?.name === 'AbortError') return;
        onPlaybackErrorRef.current?.();
      });
    } else if (mode === 'practice') {
      audio.pause();
    }
  }, [play, mode]);

  useImperativeHandle(
    ref,
    () => ({
      seekBy: (deltaSec: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        const max = Number.isFinite(audio.duration) ? audio.duration : Infinity;
        audio.currentTime = Math.min(max, Math.max(0, audio.currentTime + deltaSec));
      },
      retryPlay: async () => {
        const audio = audioRef.current;
        if (!audio) return false;
        if (audio.error) {
          pendingSeekRef.current = lastKnownTimeRef.current;
          audio.load();
        }
        try {
          await audio.play();
          return true;
        } catch {
          return false;
        }
      },
    }),
    []
  );

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      controls={false}
      // Exam rejimda native kontekst menyu (yuklab olish va h.k.) yashirin
      // qolishi uchun — hidden bo'lsa ham DOM'da bor (autoplay/eventlar ishlaydi).
      className="hidden"
      aria-hidden="true"
    />
  );
});

export default AudioEngine;
