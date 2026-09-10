'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const router = useRouter();
  const [loadingApp, setLoadingApp] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [reviewStreak, setReviewStreak] = useState(0);

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  // Do'stlar bo'limi — hidden feature, faqat admin ruxsat bergan userlarga ko'rinadi
  // (src/app/api/chat/me). `chatUsername`/`chatRole` shu yerdan keladi, login uchun
  // ishlatiladigan `phone`dan mustaqil.
  const [chatAccess, setChatAccess] = useState(false);
  const [chatUsername, setChatUsername] = useState(null);
  const [chatRole, setChatRole] = useState('user');

  const fetchChatAccess = useCallback(async (jwtToken) => {
    try {
      const res = await fetch('/api/chat/me', { headers: { Authorization: `Bearer ${jwtToken}` } });
      if (!res.ok) return;
      const data = await res.json();
      setChatAccess(!!data.chatAccess);
      setChatUsername(data.username || null);
      setChatRole(data.role || 'user');
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
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('phone');
    // '/' endi ochiq marketing landing (VOCABLY-TZ.md T3 tuzatildi) — chiqqan
    // foydalanuvchi qayta kirish formasiga to'g'ridan-to'g'ri tushsin.
    router.push('/kirish');
  }, [router]);

  const fetchUserData = useCallback(
    async (jwtToken) => {
      try {
        const res = await fetch('/api/words', {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCategories(data.categories || []);
        setReviewStreak(data.reviewStreak || 0);
      } catch {
        logout();
      } finally {
        setLoadingApp(false);
      }
    },
    [logout]
  );

  // Fon rejimida faqat kategoriyalarni qayta yuklaydi (masalan AI chat orqali so'z qo'shilgandan keyin).
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/words', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || []);
      setReviewStreak(data.reviewStreak || 0);
    } catch {
      // jimgina e'tiborsiz qoldiramiz
    }
  }, [token]);

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
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    [token]
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
    if (!token) return;
    try {
      const res = await fetch('/api/ai/sessions', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setChatSessions(data.sessions || []);
    } catch {
      // jimgina e'tiborsiz qoldiramiz — ro'yxat bo'sh ko'rinadi
    }
  }, [token]);

  useEffect(() => {
    if (token) loadChatSessions();
  }, [token, loadChatSessions]);

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
        await fetch(`/api/ai/sessions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: clean }),
        });
      } catch {
        loadChatSessions();
      }
    },
    [token, loadChatSessions]
  );

  const deleteChatSession = useCallback(
    async (id) => {
      setChatSessions((prev) => prev.filter((s) => s.id !== id));
      // Faol suhbat o'chirilsa yangi bo'sh suhbatga o'tamiz.
      if (currentSessionId === id) startNewChatSession();
      try {
        await fetch(`/api/ai/sessions/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        loadChatSessions();
      }
    },
    [token, currentSessionId, startNewChatSession, loadChatSessions]
  );

  const deleteAllChatSessions = useCallback(async () => {
    setChatSessions([]);
    startNewChatSession();
    try {
      await fetch('/api/ai/sessions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      loadChatSessions();
    }
  }, [token, startNewChatSession, loadChatSessions]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    const savedPhone = localStorage.getItem('phone');
    if (!savedToken) {
      router.push('/kirish');
    } else {
      setToken(savedToken);
      setUsername(savedUser || '');
      setPhone(savedPhone || '');
      fetchUserData(savedToken);
      fetchChatAccess(savedToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const syncData = useCallback(
    async (updatedCategories) => {
      try {
        await fetch('/api/words', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ categories: updatedCategories }),
        });
      } catch (err) {
        console.error('Saqlashda xatolik', err);
      }
    },
    [token]
  );

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categoryId: cat._id, name: clean }),
      }).catch((err) => console.error("Kategoriyani tahrirlashda xatolik", err));
    },
    [categories, token]
  );

  // A4 (docs/AUDIT_FINDINGS.md): ilgari native `confirm()` ishlatilardi — WordTable va chat
  // sessiyalarini o'chirishda allaqachon ishlatilayotgan uslubiy ConfirmModal bilan bir xillikka
  // keltirildi. Tasdiqlash kutilayotgan kategoriya indeksi shu yerda saqlanadi, modal esa
  // pastda, AppProvider ichida render qilinadi — shunda Sidebar va Dashboard sarlavhasidagi
  // ikkala chaqiruvchi ham bitta umumiy modaldan foydalanadi.
  const [categoryDeleteIdx, setCategoryDeleteIdx] = useState(null);
  const categoryPendingDelete = categoryDeleteIdx !== null ? categories[categoryDeleteIdx] : null;

  const handleDeleteCategory = useCallback(
    (idx) => {
      const cat = categories[idx];
      if (!cat) return;
      if (categories.length <= 1) return alert('Kamida bitta kategoriya qolishi kerak');
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoryId: cat._id }),
    }).catch((err) => console.error("Kategoriyani o'chirishda xatolik", err));
  }, [categories, categoryDeleteIdx, token]);

  // B3 (docs/AUDIT_FINDINGS.md): bitta so'z qo'shish ilgari butun `categories` massivini
  // qayta yozardi (`syncData`) — katta hujjatni har safar to'liq yuborish/saqlash, va ikkita
  // ochiq tab bir vaqtda yozsa biri ikkinchisini "yutib" ketishi mumkin edi. Endi allaqachon
  // mavjud, indekslangan `$push` endpointidan (`/api/words/add`, AI oqimi ham shuni ishlatadi)
  // foydalanadi — atomik, faqat qo'shilayotgan so'zni yozadi. Qaytish qiymati (`false`) bo'sh
  // maydon holatini chaqiruvchi tomonda (WordTable) xabar ko'rsatish uchun ishlatiladi.
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
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ categoryId: cat._id, words: [{ word: cleanWord, syns: synsArray }] }),
        });
        if (!res.ok) throw new Error();
      } catch (err) {
        console.error("So'z qo'shishda xatolik", err);
      } finally {
        await refreshCategories();
      }
      return true;
    },
    [categories, activeCatIndex, token, refreshCategories]
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
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ categoryId: cat._id, wordIds }),
        });
      } catch (err) {
        console.error("So'zlarni o'chirishda xatolik", err);
      }
    },
    [categories, activeCatIndex, token]
  );

  // "Bekor qilish" toast bosilganda o'chirilgan so'zlarni qayta tiklaydi.
  const restoreWords = useCallback(
    async (categoryId, words) => {
      if (!categoryId || !words || words.length === 0) return;
      try {
        await fetch('/api/words/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ categoryId, words: words.map((w) => ({ word: w.word, syns: w.syns })) }),
        });
      } finally {
        await refreshCategories();
      }
    },
    [token, refreshCategories]
  );

  // VOCABLY-TZ.md §4.1/FAZA 1 — bitta so'zni AI bilan boyitish (ta'rif, misollar,
  // kollokatsiya, CEFR va h.k. — src/app/api/words/enrich). Muvaffaqiyatli bo'lsa
  // qaytgan so'zni to'g'ridan-to'g'ri local state'ga qo'yamiz (refreshCategories
  // shart emas — server allaqachon yangilangan so'zning o'zini qaytaradi).
  const enrichWord = useCallback(
    async (categoryId, wordId) => {
      const res = await fetch('/api/words/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    },
    [token]
  );

  // V6 "Mnemonika ustaxonasi" — foydalanuvchining o'z mnemonikasini saqlaydi
  // (src/app/api/words/mnemonic, models.js'dagi userMnemonicUz izohiga q.).
  const saveMnemonic = useCallback(
    async (categoryId, wordId, userMnemonicUz) => {
      const res = await fetch('/api/words/mnemonic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    },
    [token]
  );

  const value = {
    loadingApp,
    categories,
    setCategories,
    activeCatIndex,
    setActiveCatIndex,
    enrichWord,
    saveMnemonic,
    activeCategory,
    token,
    username,
    phone,
    displayName,
    chatAccess,
    chatUsername,
    chatRole,
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
      {children}
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
