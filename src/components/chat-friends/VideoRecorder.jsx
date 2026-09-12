'use client';
import { useEffect, useRef, useState } from 'react';
import { Video, Square, X, SwitchCamera } from 'lucide-react';
import { mediaErrorMessage } from '@/lib/mediaError';
import { useChat } from '@/context/ChatContext';

const MAX_SECONDS = 60; // Telegram uslubidagi qisqa "video xabar" — 1 daqiqagacha

function VideoRecorderPanel({ onRecorded, onCancel }) {
  const { sendTyping } = useChat();
  const [seconds, setSeconds] = useState(0);
  const [facing, setFacing] = useState('user');
  // Boshlang'ich taxmin: teginish ekranli (deyarli barcha telefon/planshet)
  // qurilmalarda kamera almashtirish tugmasi DARHOL, birinchi render'dayoq
  // ko'rinadi — `enumerateDevices()` natijasini kutib keyin paydo bo'lsa,
  // tugmalar qatori siljib, foydalanuvchi "aylantirish"ni bosganda barmog'i
  // aslida siljib ulgurgan "yuborish" tugmasi ustiga tushib qolardi. Faqat
  // haqiqatan bitta kameraga ega ekanligi aniqlansa (kamdan-kam holat) keyin
  // yashiriladi — desktop'da (sichqoncha, teginish yo'q) boshidanoq yashirin.
  const [canFlip, setCanFlip] = useState(
    () => typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  );
  const [flipping, setFlipping] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const flippingRef = useRef(false);
  const unmountedRef = useRef(false);

  // VOCABLY-TZ.md (chat audit) — kamera almashtirish ILGARI bitta MediaStream
  // ICHIDA faqat video trekni almashtirar edi, MediaRecorder qayta
  // yaratilmasdan yozuvni davom ettirardi ("yozuvni to'xtatmasdan"). Bu
  // Chrome/Android'da yozib olingan faylni tez-tez BUZAR edi: video
  // to'liq yuklanmasdan (readyState hech qachon 0'dan o'tmaydi), na xato
  // beradi, na ochiladi — o'ng tomonga bo'sh rangli quti sifatida chiqadi
  // (jonli tekshiruvda aynan shu holat production'da topildi). Faol
  // MediaRecorder yozayotgan MediaStream'ning trekini "jonli" almashtirish
  // brauzerlar orasida (va hatto Chrome ichida ham qurilmaga qarab)
  // ishonchli qo'llab-quvvatlanmaydi.
  //
  // Yechim: kamera almashtirilganda yozuvni TO'XTATIB (oldingi bo'lak
  // TASHLAB YUBORILADI — `onstop` uzib qo'yiladi, hech narsa yuborilmaydi),
  // yangi kamerada YANGI MediaRecorder bilan qaytadan boshlaymiz. Natijada
  // yuboriladigan fayl DOIM bitta, to'liq, buzilmagan MediaRecorder chiqishi
  // bo'ladi — faqat oxirgi (joriy) kameradagi kesim yuboriladi, lekin
  // "ishlamaydigan almashtirish" o'rniga "almashtirilganda video qaytadan
  // boshlanadi" — aniq va doim ishlaydigan xatti-harakat.
  const startRecording = async (mode) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode, width: 480, height: 480 },
      audio: true,
    });
    if (unmountedRef.current) {
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
    setFacing(mode);
    setSeconds(0);
    clearInterval(timerRef.current);
    // Boshqa tomonga "video yubormoqda..." ko'rsatish uchun — sendTyping'ning
    // o'zida 2s throttle bor, shuning uchun har soniya chaqirsak ham socket'ga
    // faqat 2s'da bir ketadi, lekin butun yozuv davomida tirik turadi.
    sendTyping('video');
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) stop();
        return s + 1;
      });
      sendTyping('video');
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  // Panel ochiq turgan vaqtda orqadagi sahifa surilmasin — aks holda mobil
  // brauzerda tasodifiy surish manzil qatorini (address bar) yashirib/ko'rsatib,
  // bu esa `fixed inset-0` panelning butun ekranini "qimirlatib" qo'yardi.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await startRecording('user');
        // Boshlang'ich taxminni haqiqiy kamera soniga qarab to'g'rilaymiz —
        // faqat bitta kamera bo'lsa (kamdan-kam, masalan ba'zi planshetlar)
        // tugmani yashiramiz; aks holda (2+) ko'rinishda qoladi.
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            if (unmountedRef.current) return;
            setCanFlip(devices.filter((d) => d.kind === 'videoinput').length > 1);
          })
          .catch(() => {});
      } catch (err) {
        alert(mediaErrorMessage(err, 'Kamera/mikrofon'));
        onCancel();
      }
    })();
    return () => {
      unmountedRef.current = true;
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    clearInterval(timerRef.current);
    // `stop()` navbatdagi bufer uchun oxirgi bitta `ondataavailable`ni chaqiradi
    // (shu chunk faqat SHUNDAN keyin, `onstop`dan oldin keladi) — shuning uchun
    // "bo'sh massiv" tekshiruvi yetarli emas edi: cancel bosilsa ham o'sha oxirgi
    // chunk qayta qo'shilib, video baribir yuborilib ketardi. Ikkalasini ham
    // (`onstop` VA `ondataavailable`) uzib qo'yish (VoiceRecorder.jsx'dagi bilan
    // bir xil yondashuv) buni oldini oladi.
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.ondataavailable = null;
      if (mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
    }
    chunksRef.current = [];
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCancel();
  };

  const flipCamera = async () => {
    if (flippingRef.current || !streamRef.current) return;
    flippingRef.current = true;
    setFlipping(true);
    const prevFacing = facing;
    const nextFacing = facing === 'user' ? 'environment' : 'user';
    try {
      // Joriy yozuvni "yuborish sifatida" emas, jimgina to'xtatamiz (onstop
      // VA ondataavailable ikkalasi ham uzib qo'yilgan — aks holda eski
      // recorder'ning to'xtashda chiqaradigan SO'NGGI bo'lagi, async kelib,
      // ENDI YANGI kamera uchun boshlangan `chunksRef.current`ga qo'shilib
      // qolishi mumkin edi, ikki kameraning kadrlarini bitta faylga
      // aralashtirib) — pastdagi startRecording() yangi kamerada butunlay
      // yangi MediaRecorder bilan qaytadan boshlaydi.
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.ondataavailable = null;
        if (mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
      }
      chunksRef.current = [];
      // MUHIM: yangi kamerani so'rashdan OLDIN eskisini to'xtatish kerak —
      // ko'p telefonlar bir vaqtning o'zida faqat bitta kamera oqimini
      // ochishga ruxsat beradi, shuning uchun eski trek band turgan holda
      // getUserMedia() "NotReadableError" (kamera band) bilan qulab tushardi.
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      try {
        await startRecording(nextFacing);
      } catch (err) {
        // Ba'zi qurilmalarda apparat (kamera hardware) trek to'xtatilgandan
        // keyin ham darhol emas, bir oz kechikib bo'shaydi — shu oraliqda
        // getUserMedia chaqirilsa hech kim band qilmagan bo'lsa ham
        // "NotReadableError" (band) xatosi qaytadi. Shu holatda bir oz kutib,
        // bitta marta qayta urinamiz — bekorga "band" deb chiqib ketmasin.
        if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          await new Promise((resolve) => setTimeout(resolve, 350));
          await startRecording(nextFacing);
        } else {
          throw err;
        }
      }
    } catch (err) {
      // Yangi kamera ochilmadi — qorayib qolmasligi uchun avvalgi kamerani
      // qaytarishga urinamiz (yozuv shu yerdan yana qaytadan boshlanadi).
      try {
        await startRecording(prevFacing);
      } catch {
        // Fallback ham muvaffaqiyatsiz bo'lsa — kamera to'xtagan holda
        // qoladi, lekin foydalanuvchi hech bo'lmasa asosiy xatoni ko'radi
        // va "Bekor qilish" bilan chiqa oladi.
      }
      alert(mediaErrorMessage(err, 'Kamera'));
    } finally {
      flippingRef.current = false;
      setFlipping(false);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div
      // `h-dvh`/`w-dvw` — mobil brauzerda manzil qatori ko'rinib/yashiringanda
      // "dinamik" viewport'ni kuzatadi, `100vh`dan farqli o'laroq ekran
      // "qimirlab" qolmaydi. `overscroll-behavior: none` panel ichida surish
      // orqa sahifaga (yoki brauzer "pull-to-refresh"iga) o'tib ketishini
      // to'xtatadi. Pastki xavfsiz zona (notch/home-indicator) uchun
      // qo'shimcha padding — boshqa mobil-panellar (Composer, EmojiPicker)
      // bilan bir xil konventsiya.
      className="fixed inset-0 h-dvh w-dvw bg-black/80 z-50 flex flex-col items-center justify-center gap-4 p-4 overflow-hidden"
      style={{ overscrollBehavior: 'none', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {/* Doira o'lchami `vmin`ga bog'liq — juda tor (kichik telefon) yoki juda
          past (gorizontal holat) ekranlarda ham hech qachon konteynerdan
          toshib ketmaydi, shu bilan sahifani zoom/scroll qilishga majburlamaydi
          va "kattalashib" yoki siljib ko'rinmaydi. */}
      <div className="relative w-[clamp(12rem,60vmin,16rem)] h-[clamp(12rem,60vmin,16rem)] shrink-0 rounded-full overflow-hidden border-4 border-white/20">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`w-full h-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`}
        />
        <span className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-soft0 animate-pulse" />
          {mm}:{ss}
        </span>
      </div>
      {/* Bekor qilish (chiqish) va Yuborish (yozuvni to'xtatib jo'natish) — ikkalasi
          ham asosiy harakatlar, shu sababli kamera almashtirish (ikkinchi darajali,
          "utility" harakat) ularning O'RTASIGA, bir xil kichik vazndagi doira
          tugma sifatida qo'yiladi — Yuborish tugmasi kattaroq/accent rangda
          qolib, asosiy harakat ekanligi vizual ravshan bo'lib qoladi. */}
      <div className="flex items-center gap-4">
        <button
          onClick={cancel}
          disabled={flipping}
          title="Bekor qilish"
          aria-label="Video yozishni bekor qilish"
          className="p-3 bg-surface/10 hover:bg-surface/20 disabled:opacity-40 text-white rounded-full transition-colors touch-manipulation"
        >
          <X size={20} />
        </button>
        {canFlip && (
          <button
            onClick={flipCamera}
            disabled={flipping}
            title="Kamerani almashtirish (yozuv qaytadan boshlanadi)"
            aria-label={facing === 'user' ? 'Orqa kameraga o‘tish' : 'Old kameraga o‘tish'}
            className="p-3 bg-surface/10 hover:bg-surface/20 text-white rounded-full transition-colors touch-manipulation disabled:opacity-40"
          >
            <SwitchCamera size={20} className={flipping ? 'animate-spin' : ''} />
          </button>
        )}
        <button
          onClick={stop}
          disabled={flipping}
          title="Yuborish"
          aria-label="Yozuvni tugatib yuborish"
          className="p-4 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-full transition-colors touch-manipulation"
        >
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
        aria-label="Video xabar yozish"
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
