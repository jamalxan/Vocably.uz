'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle, RotateCcw, LogOut } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import Button from '@/components/ui/Button';

const AppContext = createContext(null);

// N-15 (VOCABLY_TZ_V2_LIVE_AUDIT §4) — butun lug'at (`/api/words`, ba'zi
// foydalanuvchilarda bir necha MB) ilgari HAR bir /app sahifasida (mock,
// gapirish, oqish, do'stlar chati va h.k. ham) yuklanardi, garchi bu
// sahifalar `categories`/`activeCategory`dan umuman foydalanmasa ham.
// Faqat quyidagi sahifalar `useApp().categories`/`reviewStreak`ga chindan
// muhtoj (grep: `useApp\(\)` — FlashcardMode/TestMode/SpeedQuiz/MatchGame/
// ListeningMode/WritingTest/SpacedRepetition/WordTable — barchasi
// /app/lugat/* ostida; profil sahifasi `reviewStreak`ni, /app/ai to'liq
// sahifasi esa AiChat orqali `categories`ni o'qiydi). Qolgan sahifalar
// (imtihon guruhi, do'stlar, reyting, mashq menyusi) faqat `isAuthed`/
// `displayName`/`chatAccess` kabi yengil holatni ishlatadi.
function needsVocabulary(pathname) {
  if (!pathname) return true; // noaniq holatda xavfsiz standart — yuklaymiz
  if (pathname === '/app') return true;
  return ['/app/lugat', '/app/profil', '/app/ai'].some((p) => pathname.startsWith(p));
}

// AUTH_MIGRATION_MAP.md (2026-09-17) — JWT endi localStorage'da SAQLANMAYDI va
// hech qanday fetch'ga `Authorization: Bearer <token>` sifatida QO'LDA
// biriktirilmaydi. Server (`src/lib/auth.js#getUserIdFromRequest`) allaqachon
// httpOnly `vocably_session` cookie'ni ham qabul qiladi — brauzer buni HAR bir
// same-origin so'rovga o'zi, avtomatik qo'shadi, shuning uchun bu yerdagi
// fetch'lar endi hech qanday auth-header'siz ishlaydi. `isAuthed` — HAQIQIY
// token EMAS, faqat "oxirgi authenticated so'rov muvaffaqiyatli bo'ldimi"
// degan mahalliy UI holati (boolean) — chaqiruvchi effektlar shu bilan
// gate qilinadi, lekin serverga HECH QACHON yuborilmaydi va XSS uni o'qisa
// ham hisobga kirish imkonini bermaydi (haqiqiy tekshiruv doim serverda,
// cookie orqali).
export function AppProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // Root layout (src/app/app/layout.jsx) izohiga q. — AppProvider navigatsiya
  // paytida qayta mount bo'lmaydi, shuning uchun "lug'at allaqachon yuklandimi"
  // holatini oddiy state emas, ref bilan kuzatamiz (qayta render'ni talab qilmaydi).
  const vocabLoadedRef = useRef(false);
  const [loadingApp, setLoadingApp] = useState(true);
  // Boshlang'ich /api/words yuklanmasa (401 dan boshqa xato) — sessiya o'chirilmaydi,
  // "Qayta urinish" ekrani ko'rsatiladi.
  const [appError, setAppError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [reviewStreak, setReviewStreak] = useState(0);

  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  // Do'stlar bo'limi — hidden feature, faqat admin ruxsat bergan userlarga ko'rinadi
  // (src/app/api/chat/me). `chatUsername`/`chatRole` shu yerdan keladi, login uchun
  // ishlatiladigan `phone`dan mustaqil.
  const [chatAccess, setChatAccess] = useState(false);
  const [chatUsername, setChatUsername] = useState(null);
  const [chatRole, setChatRole] = useState('user');
  // AUTH_MIGRATION_MAP.md — Do'stlar bo'limi ilgari "o'z ID"ni JWT'ni client-side
  // decode qilib (src/lib/jwtClient.js) olardi; endi JWT client'da yo'q, shuning
  // uchun bu ID shu javobdan (chat/me/route.js) keladi.
  const [chatUserId, setChatUserId] = useState(null);

  const fetchChatAccess = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/me');
      if (!res.ok) return;
      const data = await res.json();
      setChatAccess(!!data.chatAccess);
      setChatUsername(data.username || null);
      setChatRole(data.role || 'user');
      setChatUserId(data.id || null);
    } catch {
      // jimgina e'tiborsiz qoldiramiz — bo'lim shunchaki ko'rinmay qoladi
    }
  }, []);

  // "Yozish testi" har qanday nav bosilganda qayta boshlanadigan qilib sozlanadi (avvalgi xatti-harakat).
  const [writeResetNonce, setWriteResetNonce] = useState(0);
  // "Juftlikni topish" nav tugmasi bosilganda kartalar qayta aralashtiriladi (avvalgi xatti-harakat).
  const [matchGameNonce, setMatchGameNonce] = useState(0);

  const triggerWriteReset = useCallback(() => setWriteResetNonce((n) => n + 1), []);
  const triggerMatchReshuffle = useCallback(() => setMatchGameNonce((n) => n + 1), []);

  const logout = useCallback(() => {
    localStorage.removeItem('vocably_authed');
    localStorage.removeItem('username');
    localStorage.removeItem('phone');
    setIsAuthed(false);
    // httpOnly cookie client JS'dan o'chirilmaydi, shuning uchun serverdan
    // tozalanadi. Fire-and-forget — natijasi kutilmaydi, chiqishni sekinlashtirmaydi.
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    // '/' endi ochiq marketing landing (VOCABLY-TZ.md T3 tuzatildi) — chiqqan
    // foydalanuvchi qayta kirish formasiga to'g'ridan-to'g'ri tushsin.
    router.push('/kirish');
  }, [router]);

  const fetchUserData = useCallback(async () => {
    setAppError(false);
    try {
      // N-15: joriy sahifa lug'atga muhtoj bo'lmasa `?light=1` bilan so'raladi —
      // server faqat sessiya haqiqiyligi + reviewStreak'ni tekshiradi, butun
      // `categories` massivini QAYTARMAYDI (src/app/api/words/route.js).
      const wantVocab = needsVocabulary(pathname);
      const res = await fetch(wantVocab ? '/api/words' : '/api/words?light=1');
      // Faqat 401 (sessiya yaroqsiz/muddati o'tgan) chiqishga olib keladi; tarmoq yoki
      // server xatosida sessiya saqlanadi va foydalanuvchi qayta urinadi.
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (wantVocab) {
        setCategories(data.categories || []);
        vocabLoadedRef.current = true;
      }
      setReviewStreak(data.reviewStreak || 0);
      setIsAuthed(true);
      localStorage.setItem('vocably_authed', '1');
    } catch {
      setAppError(true);
    } finally {
      setLoadingApp(false);
    }
  }, [logout, pathname]);

  // Fon rejimida faqat kategoriyalarni qayta yuklaydi (masalan AI chat orqali so'z qo'shilgandan keyin,
  // yoki N-15 lazy-load effekti — foydalanuvchi lug'atga muhtoj bo'lmagan sahifadan
  // shunday sahifaga o'tganda, quyida).
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/words');
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || []);
      setReviewStreak(data.reviewStreak || 0);
      vocabLoadedRef.current = true;
    } catch {
      // jimgina e'tiborsiz qoldiramiz
    }
  }, []);

  // N-15: agar boshlang'ich sahifa lug'atga muhtoj bo'lmasa (masalan
  // to'g'ridan-to'g'ri /app/mock'ga kirilgan) va keyin foydalanuvchi lug'atga
  // muhtoj sahifaga o'tsa (masalan sidebar'dan "Lug'at"), shu yerda BIR MARTA
  // (keyingi navigatsiyalarda qayta emas) to'liq ro'yxat yuklanadi.
  useEffect(() => {
    if (!isAuthed || loadingApp) return;
    if (vocabLoadedRef.current) return;
    if (!needsVocabulary(pathname)) return;
    refreshCategories();
  }, [pathname, isAuthed, loadingApp, refreshCategories]);

  // Bitta so'zning takrorlash statistikasini yangilaydi (Bugungi takrorlash, Test, Tinglab yozish rejimlari uchun).
  // Haqiqiy hisob-kitob (src/lib/srs.ts, ease-asosidagi interval) faqat serverda amalga oshadi —
  // bu yerda faqat so'zni "hozir due emas" qilib ko'rsatadigan taxminiy optimistic yangilanish
  // bor, keyin server javobi kelganda haqiqiy stats bilan almashtiriladi. Ilgari bu yerda alohida,
  // eski flat-lookup algoritmi takrorlanardi — ikkalasi orasidagi farq vaqt o'tishi bilan
  // ko'payib, "Navbatda" ro'yxati serverdagi haqiqiy holatdan chetlashardi.
  const reviewWord = useCallback(
    async (categoryId, wordId, correct, extra = {}) => {
      const optimisticNextReview = new Date(Date.now() + (correct ? 60_000 : 10 * 60_000)).toISOString();
      setCategories((prev) =>
        prev.map((c) =>
          c._id !== categoryId
            ? c
            : {
                ...c,
                words: c.words.map((w) =>
                  w._id !== wordId ? w : { ...w, stats: { ...w.stats, nextReview: optimisticNextReview } }
                ),
              }
        )
      );
      try {
        const res = await fetch('/api/words/review', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId, wordId, correct, ...extra }),
        });
        const data = await res.json();
        if (res.ok) {
          setReviewStreak(data.reviewStreak || 0);
          setCategories((prev) =>
            prev.map((c) =>
              c._id !== categoryId
                ? c
                : { ...c, words: c.words.map((w) => (w._id !== wordId ? w : { ...w, stats: data.stats })) }
            )
          );
        }
      } catch (err) {
        console.error('Statistikani saqlashda xatolik', err);
      }
    },
    []
  );

  // Dashboard'dagi "Qiynalayotgan so'zlar" ro'yxatidan "Shularni mashq qilish" bosilganda
  // shu so'zlar ID ro'yxati shu yerga yoziladi. SpacedRepetition buni ko'rsa, oddiy due
  // navbati o'rniga faqat shu so'zlarni (due muddatidan qat'iy nazar) ko'rsatadi.
  const [practiceWordIds, setPracticeWordIds] = useState(null);
  const startPracticeQueue = useCallback((wordIds) => {
    setPracticeWordIds(wordIds && wordIds.length ? wordIds : null);
  }, []);
  const clearPracticeQueue = useCallback(() => setPracticeWordIds(null), []);

  // ---- AI chat sessiyalari ----
  // Ro'yxat sidebar'da, xabarlar esa chat ekranida ko'rsatiladi — shuning uchun holat
  // shu yerda, umumiy kontekstda turadi.
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  // Foydalanuvchi sidebar'dan sessiya tanlaganda oshadi. AiChat shu nonce'ga qarab
  // xabarlarni qayta yuklaydi — currentSessionId ning o'zi javob oqimi paytida ham
  // o'zgaradi (yangi sessiya yaratilganda), unda esa qayta yuklash kerak emas.
  const [sessionOpenNonce, setSessionOpenNonce] = useState(0);

  const loadChatSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/sessions');
      const data = await res.json();
      if (res.ok) setChatSessions(data.sessions || []);
    } catch {
      // jimgina e'tiborsiz qoldiramiz — ro'yxat bo'sh ko'rinadi
    }
  }, []);

  useEffect(() => {
    if (isAuthed) loadChatSessions();
  }, [isAuthed, loadChatSessions]);

  const openChatSession = useCallback((id) => {
    setCurrentSessionId(id);
    setSessionOpenNonce((n) => n + 1);
  }, []);

  const startNewChatSession = useCallback(() => {
    setCurrentSessionId(null);
    setSessionOpenNonce((n) => n + 1);
  }, []);

  const renameChatSession = useCallback(
    async (id, title) => {
      const clean = (title || '').trim();
      if (!clean) return;
      setChatSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: clean } : s)));
      try {
        const res = await fetch(`/api/ai/sessions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: clean }),
        });
        if (!res.ok) loadChatSessions();
      } catch {
        loadChatSessions();
      }
    },
    [loadChatSessions]
  );

  const deleteChatSession = useCallback(
    async (id) => {
      setChatSessions((prev) => prev.filter((s) => s.id !== id));
      // Faol suhbat o'chirilsa yangi bo'sh suhbatga o'tamiz.
      if (currentSessionId === id) startNewChatSession();
      try {
        const res = await fetch(`/api/ai/sessions/${id}`, { method: 'DELETE' });
        if (!res.ok) loadChatSessions();
      } catch {
        loadChatSessions();
      }
    },
    [currentSessionId, startNewChatSession, loadChatSessions]
  );

  const deleteAllChatSessions = useCallback(async () => {
    setChatSessions([]);
    startNewChatSession();
    try {
      const res = await fetch('/api/ai/sessions', { method: 'DELETE' });
      if (!res.ok) loadChatSessions();
    } catch {
      loadChatSessions();
    }
  }, [startNewChatSession, loadChatSessions]);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    const savedPhone = localStorage.getItem('phone');
    setUsername(savedUser || '');
    setPhone(savedPhone || '');
    // Ilgari bu yerda "localStorage'da token bormi" degan tarmoqsiz tekshiruv
    // bo'lardi. Endi haqiqiy tekshiruv doim serverga (cookie orqali) boradi —
    // 401 kelsa fetchUserData o'zi logout() chaqiradi (pastda, useCallback ichida).
    fetchUserData();
    fetchChatAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncData = useCallback(async (updatedCategories) => {
    try {
      await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories }),
      });
    } catch (err) {
      console.error('Saqlashda xatolik', err);
    }
  }, []);

  const activeCategory = categories[activeCatIndex] || { name: '', words: [] };
  const displayName = username || phone || 'Foydalanuvchi';

  const handleAddCategory = useCallback(
    (name) => {
      if (!name.trim()) return;
      const updated = [...categories, { name: name.trim(), words: [] }];
      setCategories(updated);
      setActiveCatIndex(updated.length - 1);
      syncData(updated);
    },
    [categories, syncData]
  );

  const handleRenameCategory = useCallback(
    (idx, name) => {
      const clean = (name || '').trim();
      const cat = categories[idx];
      if (!clean || !cat) return;

      const updated = categories.map((c, i) => (i === idx ? { ...c, name: clean } : c));
      setCategories(updated);

      fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: cat._id, name: clean }),
      }).catch((err) => console.error("Kategoriyani tahrirlashda xatolik", err));
    },
    [categories]
  );

  // A4 (docs/AUDIT_FINDINGS.md): ilgari native `confirm()` ishlatilardi — WordTable va chat
  // sessiyalarini o'chirishda allaqachon ishlatilayotgan uslubiy ConfirmModal bilan bir xillikka
  // keltirildi. Tasdiqlash kutilayotgan kategoriya indeksi shu yerda saqlanadi, modal esa
  // pastda, AppProvider ichida render qilinadi — shunda Sidebar va Dashboard sarlavhasidagi
  // ikkala chaqiruvchi ham bitta umumiy modaldan foydalanadi.
  const [categoryDeleteIdx, setCategoryDeleteIdx] = useState(null);
  const categoryPendingDelete = categoryDeleteIdx !== null ? categories[categoryDeleteIdx] : null;
  // Native alert() o'rniga qisqa bildirishnoma (pastda render qilinadi, 3 soniyada yo'qoladi).
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const handleDeleteCategory = useCallback(
    (idx) => {
      const cat = categories[idx];
      if (!cat) return;
      if (categories.length <= 1) {
        setNotice('Kamida bitta kategoriya qolishi kerak');
        return;
      }
      setCategoryDeleteIdx(idx);
    },
    [categories]
  );

  const cancelDeleteCategory = useCallback(() => setCategoryDeleteIdx(null), []);

  const confirmDeleteCategory = useCallback(() => {
    const idx = categoryDeleteIdx;
    const cat = categories[idx];
    setCategoryDeleteIdx(null);
    if (!cat) return;

    const updated = categories.filter((_, i) => i !== idx);
    setCategories(updated);
    setActiveCatIndex(0);

    fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: cat._id }),
    }).catch((err) => console.error("Kategoriyani o'chirishda xatolik", err));
  }, [categories, categoryDeleteIdx]);

  // B3 (docs/AUDIT_FINDINGS.md): bitta so'z qo'shish ilgari butun `categories` massivini
  // qayta yozardi (`syncData`) — katta hujjatni har safar to'liq yuborish/saqlash, va ikkita
  // ochiq tab bir vaqtda yozsa biri ikkinchisini "yutib" ketishi mumkin edi. Endi allaqachon
  // mavjud, indekslangan `$push` endpointidan (`/api/words/add`, AI oqimi ham shuni ishlatadi)
  // foydalanadi — atomik, faqat qo'shilayotgan so'zni yozadi. `false` — bo'sh maydon YOKI
  // saqlash muvaffaqiyatsiz bo'ldi (chaqiruvchi formani tozalamasligi kerak).
  const handleAddWord = useCallback(
    async (word, synsStr) => {
      const cleanWord = (word || '').trim();
      const synsArray = (synsStr || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (!cleanWord || synsArray.length === 0) return false;

      const cat = categories[activeCatIndex];
      if (!cat?._id) return false;

      try {
        const res = await fetch('/api/words/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: cat._id, words: [{ word: cleanWord, syns: synsArray }] }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        console.error("So'z qo'shishda xatolik", err);
        return false;
      } finally {
        await refreshCategories();
      }
      return true;
    },
    [categories, activeCatIndex, refreshCategories]
  );

  // Bir yoki bir nechta so'zni barqaror _id bo'yicha o'chiradi (granular endpoint — butun massivni
  // almashtirish o'rniga, boshqa joyda parallel yozilgan o'zgarishlarni yo'qotib qo'ymaslik uchun).
  const deleteWords = useCallback(
    async (wordIds) => {
      const cat = categories[activeCatIndex];
      if (!cat?._id || !wordIds || wordIds.length === 0) return;

      setCategories((prev) =>
        prev.map((c, i) =>
          i === activeCatIndex ? { ...c, words: c.words.filter((w) => !wordIds.includes(w._id)) } : c
        )
      );

      try {
        await fetch('/api/words', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: cat._id, wordIds }),
        });
      } catch (err) {
        console.error("So'zlarni o'chirishda xatolik", err);
      }
    },
    [categories, activeCatIndex]
  );

  // "Bekor qilish" toast bosilganda o'chirilgan so'zlarni qayta tiklaydi.
  const restoreWords = useCallback(
    async (categoryId, words) => {
      if (!categoryId || !words || words.length === 0) return;
      try {
        await fetch('/api/words/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId, words: words.map((w) => ({ word: w.word, syns: w.syns })) }),
        });
      } finally {
        await refreshCategories();
      }
    },
    [refreshCategories]
  );

  // VOCABLY-TZ.md §4.1/FAZA 1 — bitta so'zni AI bilan boyitish (ta'rif, misollar,
  // kollokatsiya, CEFR va h.k. — src/app/api/words/enrich). Muvaffaqiyatli bo'lsa
  // qaytgan so'zni to'g'ridan-to'g'ri local state'ga qo'yamiz (refreshCategories
  // shart emas — server allaqachon yangilangan so'zning o'zini qaytaradi).
  const enrichWord = useCallback(async (categoryId, wordId) => {
    const res = await fetch('/api/words/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, wordId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data?.error || "Boyitib bo'lmadi", requestId: data?.requestId || null };

    setCategories((prev) =>
      prev.map((c) =>
        c._id !== categoryId
          ? c
          : { ...c, words: c.words.map((w) => (w._id === wordId ? { ...w, enrichment: data.word.enrichment } : w)) }
      )
    );
    return { word: data.word };
  }, []);

  // TZ-vocably-v2.md §D5 (BUG-008) — bir so'rovda 10 tagacha so'zni birga boyitish
  // (src/app/api/words/enrich-batch). WordTable.jsx bir nechta bunday chaqiruvni
  // parallel yuboradi. Har bir so'z natijasi mustaqil (birontasi xato bo'lsa ham
  // qolganlari saqlanadi) — shuning uchun natija massivini qaytaramiz, xato
  // bo'lganlarini chaqiruvchi o'zi ajratib oladi.
  const enrichWordsBatch = useCallback(async (categoryId, wordIds) => {
    const res = await fetch('/api/words/enrich-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, wordIds }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return wordIds.map((wordId) => ({ wordId, error: data?.error || "Boyitib bo'lmadi", requestId: data?.requestId || null }));
    }

    const results = Array.isArray(data.results) ? data.results : [];
    const succeeded = results.filter((r) => r.success);
    if (succeeded.length > 0) {
      setCategories((prev) =>
        prev.map((c) =>
          c._id !== categoryId
            ? c
            : {
                ...c,
                words: c.words.map((w) => {
                  const match = succeeded.find((r) => r.wordId === w._id);
                  return match ? { ...w, enrichment: match.enrichment } : w;
                }),
              }
        )
      );
    }
    return results;
  }, []);

  // V6 "Mnemonika ustaxonasi" — foydalanuvchining o'z mnemonikasini saqlaydi
  // (src/app/api/words/mnemonic, models.js'dagi userMnemonicUz izohiga q.).
  const saveMnemonic = useCallback(async (categoryId, wordId, userMnemonicUz) => {
    const res = await fetch('/api/words/mnemonic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, wordId, userMnemonicUz }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data?.error || "Saqlab bo'lmadi" };

    setCategories((prev) =>
      prev.map((c) =>
        c._id !== categoryId
          ? c
          : {
              ...c,
              words: c.words.map((w) =>
                w._id !== wordId ? w : { ...w, enrichment: { ...w.enrichment, userMnemonicUz: data.userMnemonicUz } }
              ),
            }
      )
    );
    return { success: true };
  }, []);

  const value = {
    loadingApp,
    categories,
    setCategories,
    activeCatIndex,
    setActiveCatIndex,
    enrichWord,
    enrichWordsBatch,
    saveMnemonic,
    activeCategory,
    isAuthed,
    username,
    phone,
    displayName,
    chatAccess,
    chatUsername,
    chatRole,
    chatUserId,
    fetchUserData,
    refreshCategories,
    syncData,
    logout,
    handleAddCategory,
    handleRenameCategory,
    handleDeleteCategory,
    handleAddWord,
    deleteWords,
    restoreWords,
    reviewStreak,
    reviewWord,
    practiceWordIds,
    startPracticeQueue,
    clearPracticeQueue,
    writeResetNonce,
    triggerWriteReset,
    matchGameNonce,
    triggerMatchReshuffle,
    chatSessions,
    currentSessionId,
    setCurrentSessionId,
    sessionOpenNonce,
    loadChatSessions,
    openChatSession,
    startNewChatSession,
    renameChatSession,
    deleteChatSession,
    deleteAllChatSessions,
  };

  return (
    <AppContext.Provider value={value}>
      {appError ? (
        <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
          <div role="alert" className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-card p-6 text-center">
            <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-danger-soft text-danger flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <h2 className="font-bold text-ink font-display mb-1">Ma&apos;lumotlarni yuklab bo&apos;lmadi</h2>
            <p className="text-sm text-muted mb-5">Internet aloqasini tekshirib, qayta urinib ko&apos;ring.</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setLoadingApp(true);
                  fetchUserData();
                }}
              >
                <RotateCcw size={16} /> Qayta urinish
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut size={16} /> Chiqish
              </Button>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
      {notice && (
        <div
          role="status"
          className="fixed z-50 left-1/2 -translate-x-1/2 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 max-w-[calc(100vw-2rem)] px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm shadow-premium"
        >
          {notice}
        </div>
      )}
      <ConfirmModal
        open={!!categoryPendingDelete}
        title="Kategoriyani o'chirish"
        message={
          categoryPendingDelete
            ? `"${categoryPendingDelete.name}" kategoriyasi va undagi ${categoryPendingDelete.words.length} ta so'z butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.`
            : ''
        }
        onConfirm={confirmDeleteCategory}
        onCancel={cancelDeleteCategory}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
