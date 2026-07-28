'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const router = useRouter();
  const [loadingApp, setLoadingApp] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCatIndex, setActiveCatIndex] = useState(0);

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

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
    router.push('/');
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
    } catch {
      // jimgina e'tiborsiz qoldiramiz
    }
  }, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    const savedPhone = localStorage.getItem('phone');
    if (!savedToken) {
      router.push('/');
    } else {
      setToken(savedToken);
      setUsername(savedUser || '');
      setPhone(savedPhone || '');
      fetchUserData(savedToken);
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

  const handleDeleteCategory = useCallback(
    (idx) => {
      if (categories.length <= 1) return alert('Kamida bitta kategoriya qolishi kerak');
      if (!confirm(`"${categories[idx].name}" kategoriyasini o'chirmoqchimisiz?`)) return;
      const updated = categories.filter((_, i) => i !== idx);
      setCategories(updated);
      setActiveCatIndex(0);
      syncData(updated);
    },
    [categories, syncData]
  );

  const handleAddWord = useCallback(
    (word, synsStr) => {
      if (!word.trim() || !synsStr.trim()) return;
      const synsArray = synsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = categories.map((c, i) =>
        i === activeCatIndex ? { ...c, words: [...c.words, { word: word.trim(), syns: synsArray }] } : c
      );
      setCategories(updated);
      syncData(updated);
    },
    [categories, activeCatIndex, syncData]
  );

  const handleDeleteWord = useCallback(
    (wordIdx) => {
      const updated = categories.map((c, i) =>
        i === activeCatIndex ? { ...c, words: c.words.filter((_, wi) => wi !== wordIdx) } : c
      );
      setCategories(updated);
      syncData(updated);
    },
    [categories, activeCatIndex, syncData]
  );

  const value = {
    loadingApp,
    categories,
    setCategories,
    activeCatIndex,
    setActiveCatIndex,
    activeCategory,
    token,
    username,
    phone,
    displayName,
    fetchUserData,
    refreshCategories,
    syncData,
    logout,
    handleAddCategory,
    handleDeleteCategory,
    handleAddWord,
    handleDeleteWord,
    writeResetNonce,
    triggerWriteReset,
    matchGameNonce,
    triggerMatchReshuffle,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
