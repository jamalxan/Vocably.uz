'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Edit3, Grid, Layers, Sparkles,
  Trash2, Volume2, Plus, ImageIcon, Search, LogOut, Loader2, X, Menu,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [loadingApp, setLoadingApp] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [view, setView] = useState('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const [newWord, setNewWord] = useState('');
  const [newSyns, setNewSyns] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [writeRange, setWriteRange] = useState({ from: 1, to: 10 });
  const [writeActive, setWriteActive] = useState(false);
  const [writeWords, setWriteWords] = useState([]);
  const [writeCurIdx, setWriteCurIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [writeScore, setWriteScore] = useState(0);
  const [writeChecked, setWriteChecked] = useState(false);

  const [matchPairs, setMatchPairs] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);

  const [ocrLoading, setOcrLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Kategoriya almashganda yoki so'zlar soni o'zgarganda kartochka indexini to'g'irlash
  useEffect(() => {
    const len = categories[activeCatIndex]?.words?.length || 0;
    if (cardIndex >= len) setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, activeCatIndex]);

  // Mobil ekranda bo'lim almashtirilganda drawer'ni yopamiz
  useEffect(() => {
    setSidebarOpen(false);
  }, [view]);

  const fetchUserData = async (jwtToken) => {
    try {
      const res = await fetch('/api/words', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories || []);
      setChatMessages(data.chatHistory || []);
    } catch {
      logout();
    } finally {
      setLoadingApp(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('phone');
    router.push('/');
  };

  const syncData = async (updatedCategories) => {
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
  };

  const activeCategory = categories[activeCatIndex] || { name: '', words: [] };
  const displayName = username || phone || 'Foydalanuvchi';

  const speakText = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const updated = [...categories, { name: newCatName.trim(), words: [] }];
    setCategories(updated);
    setActiveCatIndex(updated.length - 1);
    setNewCatName('');
    setShowAddCat(false);
    syncData(updated);
  };

  const handleDeleteCategory = (idx) => {
    if (categories.length <= 1) return alert('Kamida bitta kategoriya qolishi kerak');
    if (!confirm(`"${categories[idx].name}" kategoriyasini o'chirmoqchimisiz?`)) return;
    const updated = categories.filter((_, i) => i !== idx);
    setCategories(updated);
    setActiveCatIndex(0);
    syncData(updated);
  };

  const handleAddWord = () => {
    if (!newWord.trim() || !newSyns.trim()) return;
    const synsArray = newSyns.split(',').map((s) => s.trim()).filter(Boolean);
    const updated = categories.map((c, i) =>
      i === activeCatIndex ? { ...c, words: [...c.words, { word: newWord.trim(), syns: synsArray }] } : c
    );
    setCategories(updated);
    setNewWord('');
    setNewSyns('');
    syncData(updated);
  };

  const handleDeleteWord = (wordIdx) => {
    const updated = categories.map((c, i) =>
      i === activeCatIndex ? { ...c, words: c.words.filter((_, wi) => wi !== wordIdx) } : c
    );
    setCategories(updated);
    syncData(updated);
  };

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/ai/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageBase64: reader.result }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Xatolik');

        if (data.words && data.words.length > 0) {
          const updated = categories.map((c, i) =>
            i === activeCatIndex ? { ...c, words: [...c.words, ...data.words] } : c
          );
          setCategories(updated);
          syncData(updated);
          alert(`${data.words.length} ta so'z "${activeCategory.name}" kategoriyasiga qo'shildi!`);
        } else {
          alert("Rasmdan so'z topilmadi. Aniqroq rasm bilan urinib ko'ring.");
        }
      } catch (err) {
        alert('Xatolik yuz berdi: ' + err.message);
      } finally {
        setOcrLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatLoading(true);
    setChatMessages((prev) => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(data.history);
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const startWriteTest = () => {
    const words = activeCategory.words || [];
    if (words.length === 0) return alert('Avval so\'z qo\'shing');

    const sliceFrom = Math.max(1, writeRange.from) - 1;
    const sliceTo = Math.min(words.length, writeRange.to);
    const selected = words.slice(sliceFrom, sliceTo);
    if (selected.length === 0) return alert("Oraliq noto'g'ri");

    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    setWriteWords(shuffled);
    setWriteCurIdx(0);
    setWriteScore(0);
    setWriteChecked(false);
    setUserAnswers(Array(shuffled[0]?.syns.length || 1).fill(''));
    setWriteActive(true);
  };

  const checkWriteAnswer = () => {
    const current = writeWords[writeCurIdx];
    const correctSyns = current.syns.map((s) => s.toLowerCase());
    let isAllCorrect = userAnswers.length === correctSyns.length;

    userAnswers.forEach((ans) => {
      if (!correctSyns.includes(ans.trim().toLowerCase())) {
        isAllCorrect = false;
      }
    });

    if (isAllCorrect) setWriteScore((prev) => prev + 1);
    setWriteChecked(true);
  };

  const nextWriteQuestion = () => {
    if (writeCurIdx + 1 < writeWords.length) {
      const nextIdx = writeCurIdx + 1;
      setWriteCurIdx(nextIdx);
      setWriteChecked(false);
      setUserAnswers(Array(writeWords[nextIdx]?.syns.length || 1).fill(''));
    } else {
      alert(`Test yakunlandi! Natijangiz: ${writeScore}/${writeWords.length}`);
      setWriteActive(false);
    }
  };

  const initMatchGame = useCallback(() => {
    const words = activeCategory.words || [];
    if (words.length < 4) {
      setMatchPairs([]);
      return;
    }
    const count = Math.min(6, words.length);
    const chosen = [...words].sort(() => Math.random() - 0.5).slice(0, count);
    const cardList = [];
    chosen.forEach((w, i) => {
      cardList.push({ id: `w-${i}`, text: w.word, type: 'word', matchId: i });
      cardList.push({ id: `s-${i}`, text: w.syns[0], type: 'syn', matchId: i });
    });
    setMatchPairs(cardList.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setMatchedIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatIndex, categories]);

  const handleMatchCardClick = (card) => {
    if (selectedCards.length === 2 || matchedIds.includes(card.matchId)) return;
    const currentSelected = [...selectedCards, card];
    setSelectedCards(currentSelected);

    if (currentSelected.length === 2) {
      const [first, second] = currentSelected;
      if (first.matchId === second.matchId && first.type !== second.type) {
        setMatchedIds((prev) => [...prev, first.matchId]);
        setSelectedCards([]);
      } else {
        setTimeout(() => setSelectedCards([]), 800);
      }
    }
  };

  if (loadingApp) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  const navItems = [
    { key: 'cards', label: 'Kartochka', icon: Layers },
    { key: 'write', label: 'Yozish testi', icon: Edit3 },
    { key: 'match', label: 'Juftlikni topish', icon: Grid },
    { key: 'table', label: 'Jadval', icon: BookOpen },
    { key: 'ai', label: 'AI Chat', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobil uchun qorong'i fon (drawer ochiq bo'lganda) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display shadow-lg shadow-indigo-900/40">
                S
              </div>
              <h1 className="text-lg font-bold text-white tracking-wide font-display">
                Sinonimlar <span className="text-indigo-400">AI</span>
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Kategoriyalar
            </label>
            <select
              value={activeCatIndex}
              onChange={(e) => {
                setActiveCatIndex(parseInt(e.target.value));
                setCardIndex(0);
                setShowAnswer(false);
                setWriteActive(false);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
            >
              {categories.map((c, i) => (
                <option key={i} value={i}>
                  {c.name} ({c.words.length})
                </option>
              ))}
            </select>

            {!showAddCat ? (
              <button
                onClick={() => setShowAddCat(true)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Plus size={13} /> Yangi kategoriya
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nomi (masalan: Words 2)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setShowAddCat(false); }}
                  className="flex-1 px-2.5 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddCategory}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => { setShowAddCat(false); setNewCatName(''); }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setView(key);
                  setWriteActive(false);
                  if (key === 'match') initMatchGame();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg text-sm transition-colors ${
                  view === key ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-900/40' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-500">Profil</p>
              <p className="text-sm font-semibold text-slate-300 truncate">{displayName}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors flex-shrink-0" title="Chiqish">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto w-full min-w-0">
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-display truncate">{activeCategory.name || "Kategoriya yo'q"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Jami so'zlar: {activeCategory.words?.length || 0} ta</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap">
              <ImageIcon size={14} />
              <span className="hidden sm:inline">{ocrLoading ? 'AI tahlil qilmoqda...' : 'AI import (rasmdan)'}</span>
              <span className="sm:hidden">{ocrLoading ? '...' : 'AI import'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleOcrUpload} disabled={ocrLoading} />
            </label>
            <button
              onClick={() => handleDeleteCategory(activeCatIndex)}
              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex-shrink-0"
              title="Kategoriyani o'chirish"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto flex-1">
          {/* CARDS */}
          {view === 'cards' && (
            <div className="flex flex-col items-center">
              {activeCategory.words?.length > 0 ? (
                <div className="w-full max-w-md">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span>{cardIndex + 1} / {activeCategory.words.length}</span>
                  </div>

                  <div
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="w-full h-64 sm:h-72 bg-white rounded-2xl shadow-premium border border-slate-100 flex flex-col justify-center items-center p-6 sm:p-8 cursor-pointer relative select-none transition-transform hover:scale-[1.01]"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); speakText(activeCategory.words[cardIndex]?.word); }}
                      className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                      title="Talaffuzni eshitish"
                    >
                      <Volume2 size={16} />
                    </button>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display text-center break-words">{activeCategory.words[cardIndex]?.word}</p>

                    {showAnswer ? (
                      <p className="text-lg sm:text-xl font-medium text-indigo-600 mt-6 text-center">
                        {activeCategory.words[cardIndex]?.syns.join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-300 mt-6 uppercase tracking-wider font-semibold">Ko'rish uchun bosing</p>
                    )}
                  </div>

                  <div className="flex gap-3 sm:gap-4 mt-6 w-full">
                    <button
                      onClick={() => { setCardIndex((cardIndex - 1 + activeCategory.words.length) % activeCategory.words.length); setShowAnswer(false); }}
                      className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
                    >
                      Oldingi
                    </button>
                    <button
                      onClick={() => { setCardIndex((cardIndex + 1) % activeCategory.words.length); setShowAnswer(false); }}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Bu kategoriyada so'zlar yo'q. Jadval bo'limidan qo'shing.</p>
              )}
            </div>
          )}

          {/* WRITE TEST */}
          {view === 'write' && (
            <div className="flex flex-col items-center">
              {!writeActive ? (
                <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 font-display">So'zlarni yozib sinash oraliqlari</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-slate-400 w-12">Dan:</span>
                      <input
                        type="number"
                        min={1}
                        value={writeRange.from}
                        onChange={(e) => setWriteRange({ ...writeRange, from: parseInt(e.target.value) || 1 })}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-slate-400 w-12">Gacha:</span>
                      <input
                        type="number"
                        min={1}
                        value={writeRange.to}
                        onChange={(e) => setWriteRange({ ...writeRange, to: parseInt(e.target.value) || 1 })}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={startWriteTest}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    Testni boshlash
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
                    <span>{writeCurIdx + 1} / {writeWords.length}</span>
                    <span>To'g'ri: {writeScore}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xl sm:text-2xl font-bold text-slate-800 font-display break-words">{writeWords[writeCurIdx]?.word}</span>
                    <button onClick={() => speakText(writeWords[writeCurIdx]?.word)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-600 transition-colors flex-shrink-0">
                      <Volume2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {userAnswers.map((ans, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs font-semibold text-slate-400 w-6">{idx + 1}</span>
                        <input
                          type="text"
                          disabled={writeChecked}
                          placeholder="Sinonim..."
                          value={ans}
                          onChange={(e) => {
                            const temp = [...userAnswers];
                            temp[idx] = e.target.value;
                            setUserAnswers(temp);
                          }}
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none ${
                            writeChecked
                              ? writeWords[writeCurIdx].syns.map((s) => s.toLowerCase()).includes(ans.trim().toLowerCase())
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : 'border-red-300 bg-red-50 text-red-700'
                              : 'focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {writeChecked && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs mb-4">
                      <span className="font-semibold text-slate-500 block mb-1">To'g'ri javoblar:</span>
                      <span className="font-bold text-indigo-600 text-sm">{writeWords[writeCurIdx].syns.join(', ')}</span>
                    </div>
                  )}

                  {!writeChecked ? (
                    <button onClick={checkWriteAnswer} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                      Tekshirish
                    </button>
                  ) : (
                    <button onClick={nextWriteQuestion} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                      Keyingi savol →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MATCHING GAME */}
          {view === 'match' && (
            <div className="flex flex-col items-center">
              {activeCategory.words?.length < 4 ? (
                <p className="text-sm text-slate-400">Bu o'yin uchun kamida 4 ta so'z kerak.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-md">
                    {matchPairs.map((card) => {
                      const isSelected = selectedCards.some((c) => c.id === card.id);
                      const isMatched = matchedIds.includes(card.matchId);
                      return (
                        <div
                          key={card.id}
                          onClick={() => handleMatchCardClick(card)}
                          className={`h-20 sm:h-24 rounded-xl border flex items-center justify-center p-2.5 sm:p-3 text-center text-xs font-semibold cursor-pointer transition-all select-none ${
                            isMatched
                              ? 'border-green-100 bg-green-50 text-green-600 opacity-60 pointer-events-none'
                              : isSelected
                              ? 'border-indigo-400 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {card.text}
                        </div>
                      );
                    })}
                  </div>

                  {matchPairs.length > 0 && matchedIds.length === matchPairs.length / 2 && (
                    <div className="mt-6 text-center">
                      <p className="text-green-600 font-bold text-sm mb-2">Barcha juftliklar topildi!</p>
                      <button onClick={initMatchGame} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
                        Yana o'ynash
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TABLE */}
          {view === 'table' && (
            <div className="space-y-5 sm:space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Yangi so'z</label>
                  <input
                    type="text"
                    placeholder="Masalan: Start"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddWord(); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-[2] w-full">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Sinonimlar / tarjima, vergul bilan</label>
                  <input
                    type="text"
                    placeholder="Masalan: begin, commence, launch"
                    value={newSyns}
                    onChange={(e) => setNewSyns(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddWord(); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleAddWord}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  Qo'shish
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="So'z yoki tarjimalar bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4 sm:px-6 w-12">#</th>
                        <th className="py-3 px-4 sm:px-6">So'z</th>
                        <th className="py-3 px-4 sm:px-6">Sinonimlar / tarjimalar</th>
                        <th className="py-3 px-4 sm:px-6 w-24">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeCategory.words || [])
                        .map((w, idx) => ({ ...w, idx }))
                        .filter(
                          (w) =>
                            w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            w.syns.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((w) => (
                          <tr key={w.idx} className="border-b border-slate-50 hover:bg-slate-50/50 text-sm">
                            <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-mono text-xs">{w.idx + 1}</td>
                            <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">{w.word}</td>
                            <td className="py-3.5 px-4 sm:px-6 text-slate-500">{w.syns.join(', ')}</td>
                            <td className="py-3.5 px-4 sm:px-6 flex gap-2">
                              <button onClick={() => speakText(w.word)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded transition-colors" title="Eshitish">
                                <Volume2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteWord(w.idx)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors" title="O'chirish">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {(activeCategory.words || []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                            Bu kategoriyada hali so'z yo'q.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AI CHAT */}
          {view === 'ai' && (
            <div className="flex flex-col h-[calc(100vh-11rem)] sm:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
                  <Sparkles size={14} /> Ingliz tili AI yordamchisi
                </span>
                <span className="hidden sm:inline">Faqat til, grammatika va tarjima bo'yicha</span>
              </div>

              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Sparkles className="mx-auto mb-3 text-indigo-400" size={32} />
                    <p className="text-sm">Assalomu alaykum! Ingliz tili yoki tarjima bo'yicha savolingiz bormi?</p>
                    <p className="text-[10px] text-slate-400 mt-1">Masalan: "arise" so'zini bir nechta gapda ishlatib ko'rsat</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles size={13} />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      {msg.parts.map((p, idx) => (
                        <span key={idx} className="whitespace-pre-wrap">{p.text}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={13} />
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-slate-400 flex items-center gap-1.5">
                      <Loader2 className="animate-spin" size={13} /> javob yozmoqda...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 sm:p-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Xabaringizni yozing..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                  className="flex-1 min-w-0 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={chatLoading}
                  className="px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  Yuborish
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
