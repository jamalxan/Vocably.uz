'use client';
import { create } from 'zustand';
import type { AnswerValue, ExamSectionKey } from '@/lib/exam/types';
import { countWords } from '@/lib/exam/wordCount';

// TZ-vocably-v2.md §17 (IELTS CD Exam Engine v1.0) — client holati (zustand).
//
// MUHIM (§17 izohi): `answers` obyekt yangilanganda faqat shu KALIT qiymati
// o'zgarishi kerak, butun obyekt "qayta yaratilmasin" — 40 ta input bor, har
// bosishda hammasi qayta render bo'lsa sekinlashadi. Zustand'da immutability
// talab qilingani uchun `answers` obyektining REFERENSI har `setAnswer`da
// albatta yangilanadi (aks holda o'zgarish umuman aniqlanmaydi) — lekin bu
// muammo emas, chunki har savol komponenti butun `answers`ga emas, faqat
// o'zining `s => s.answers[key]` selektoriga obuna bo'ladi (ExamStore emas,
// UNI ISHLATUVCHI komponent shu qoidaga rioya qilishi kerak) — zustand shu
// selektor natijasini `Object.is` bilan solishtirib, faqat HAQIQIY o'zgargan
// komponentlarni qayta render qiladi.

function isBrowser() {
  return typeof window !== 'undefined';
}

function readStored<T>(key: string, fallback: T, parse: (raw: string) => T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : parse(raw);
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: string) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // xato bo'lsa (masalan xususiy rejim) — jimgina o'tkazib yuboramiz, sozlama shu sessiyada ishlayveradi
  }
}

// Loyihada auth FAQAT `Authorization: Bearer <token>` header orqali (JWT hali
// localStorage'da — TZ-vocably-v2.md BUG-030, Sprint 5'da httpOnly cookie'ga
// o'tkaziladi). `useAutosave.ts` ham shu funksiyani ishlatadi.
export function getStoredAuthToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export interface EssayState {
  text: string;
  wordCount: number;
}

async function patchAnswers(
  attemptId: string,
  body: {
    answers: Record<string, AnswerValue>;
    flagged: number[];
    lastQuestion: number;
    essays?: { task1?: EssayState; task2?: EssayState };
  }
): Promise<boolean> {
  const token = getStoredAuthToken();
  if (!token) return false;
  try {
    const res = await fetch(`/api/exam/attempts/${attemptId}/answers`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type ExamFontSize = 16 | 18 | 20 | 22;
export type ExamMode = 'exam' | 'practice' | 'review';

export interface ExamStoreState {
  attemptId: string | null;
  mode: ExamMode;
  section: ExamSectionKey | null;

  answers: Record<string, AnswerValue>;
  flagged: Set<number>;
  currentQuestion: number;

  // Writing (§8) — "q12" kalitlardan farqli, `dirtyKeys` ichida "task1"/"task2"
  // sifatida kuzatiladi, shunda MAVJUD autosave infratuzilmasi (debounce/
  // interval/blur/beforeunload, useAutosave.ts) qayta ishlatiladi — Writing
  // uchun alohida "dirty" mexanizmi QURILMAYDI.
  essays: { task1: EssayState; task2: EssayState };
  activeWritingTask: 1 | 2;

  // Taymer — §4.2: `endsAt` (server bergan, ms epoch) + `serverOffset`
  // (serverNow - Date.now(), so'rov vaqtida hisoblangan) haqiqat manbai;
  // `remainingSec` shulardan hosila, har tikda `useExamTimer` yangilaydi.
  endsAt: number;
  serverOffset: number;
  remainingSec: number;
  timerHidden: boolean;

  // Sozlamalar paneli — §5.7, localStorage'da saqlanadi.
  fontSize: ExamFontSize;
  highContrast: boolean;
  splitRatio: number; // 0.3-0.7 — §6.1

  // Saqlash holati — §4.3
  saveStatus: 'saved' | 'saving' | 'error';
  dirtyKeys: Set<string>;
  flaggedDirty: boolean;

  init: (params: {
    attemptId: string;
    mode: ExamMode;
    section: ExamSectionKey;
    answers: Record<string, AnswerValue>;
    flagged: number[];
    currentQuestion: number;
    endsAt: number; // ms epoch
    serverNow: number; // ms epoch
    essays?: { task1?: Partial<EssayState>; task2?: Partial<EssayState> };
  }) => void;
  reset: () => void;
  setAnswer: (qNum: number, value: AnswerValue) => void;
  toggleFlag: (qNum: number) => void;
  goToQuestion: (qNum: number) => void;
  setEssayText: (task: 1 | 2, text: string) => void;
  setActiveWritingTask: (task: 1 | 2) => void;
  setRemainingSec: (sec: number) => void;
  reconcileFromHeartbeat: (remainingSecFromServer: number) => void;
  toggleTimerHidden: () => void;
  setFontSize: (size: ExamFontSize) => void;
  toggleHighContrast: () => void;
  setSplitRatio: (ratio: number) => void;
  syncNow: () => Promise<void>;
}

const EMPTY_ESSAY: EssayState = { text: '', wordCount: 0 };

const INITIAL_TRANSIENT_STATE = {
  attemptId: null as string | null,
  mode: 'practice' as ExamMode,
  section: null as ExamSectionKey | null,
  answers: {} as Record<string, AnswerValue>,
  flagged: new Set<number>(),
  currentQuestion: 1,
  essays: { task1: EMPTY_ESSAY, task2: EMPTY_ESSAY },
  activeWritingTask: 1 as 1 | 2,
  endsAt: 0,
  serverOffset: 0,
  remainingSec: 0,
  dirtyKeys: new Set<string>(),
  flaggedDirty: false,
  saveStatus: 'saved' as const,
};

export const useExamStore = create<ExamStoreState>((set, get) => ({
  ...INITIAL_TRANSIENT_STATE,
  timerHidden: readStored('exam.timerHidden', false, (r) => r === 'true'),
  fontSize: readStored('exam.fontSize', 16 as ExamFontSize, (r) => {
    const n = Number(r);
    return (n === 16 || n === 18 || n === 20 || n === 22 ? n : 16) as ExamFontSize;
  }),
  highContrast: readStored('exam.highContrast', false, (r) => r === 'true'),
  splitRatio: readStored('exam.splitRatio', 0.5, (r) => {
    const n = Number(r);
    return Number.isFinite(n) ? Math.min(0.7, Math.max(0.3, n)) : 0.5;
  }),

  init: ({ attemptId, mode, section, answers, flagged, currentQuestion, endsAt, serverNow, essays }) =>
    set({
      attemptId,
      mode,
      section,
      answers,
      flagged: new Set(flagged),
      currentQuestion,
      essays: {
        task1: { text: essays?.task1?.text || '', wordCount: essays?.task1?.wordCount ?? countWords(essays?.task1?.text || '') },
        task2: { text: essays?.task2?.text || '', wordCount: essays?.task2?.wordCount ?? countWords(essays?.task2?.text || '') },
      },
      activeWritingTask: 1,
      endsAt,
      serverOffset: serverNow - Date.now(),
      remainingSec: Math.max(0, Math.round((endsAt - serverNow) / 1000)),
      dirtyKeys: new Set(),
      flaggedDirty: false,
      saveStatus: 'saved',
    }),

  // Boshqa attempt/bo'limga o'tishdan oldin (masalan Mock'da bo'lim almashganda,
  // Faza 3) taymer/javob holati eski attempt'dan "sizib qolmasligi" uchun.
  reset: () => set({ ...INITIAL_TRANSIENT_STATE, flagged: new Set(), dirtyKeys: new Set() }),

  setAnswer: (qNum, value) =>
    set((state) => ({
      answers: { ...state.answers, [`q${qNum}`]: value },
      dirtyKeys: new Set(state.dirtyKeys).add(`q${qNum}`),
      saveStatus: 'saving',
    })),

  // §8.3 — so'z hisoblagich har o'zgarishda qayta hisoblanadi (debounce
  // chaqiruvchi tarafda, EssayEditor.tsx'da — bu yerda faqat state).
  setEssayText: (task, text) =>
    set((state) => ({
      essays: { ...state.essays, [`task${task}`]: { text, wordCount: countWords(text) } },
      dirtyKeys: new Set(state.dirtyKeys).add(`task${task}`),
      saveStatus: 'saving',
    })),

  setActiveWritingTask: (task) => set({ activeWritingTask: task }),

  toggleFlag: (qNum) =>
    set((state) => {
      const next = new Set(state.flagged);
      if (next.has(qNum)) next.delete(qNum);
      else next.add(qNum);
      return { flagged: next, flaggedDirty: true, saveStatus: 'saving' };
    }),

  goToQuestion: (qNum) => set({ currentQuestion: qNum }),

  setRemainingSec: (sec) => set({ remainingSec: sec }),

  // §4.2 — "Har heartbeat'da server remainingSec qaytaradi va klient farqni
  // ≥3s bo'lsa tuzatadi." 3 soniyadan kichik farqni ATAYLAB e'tiborsiz
  // qoldiramiz — aks holda tarmoq kechikishi tufayli taymer har heartbeat'da
  // bir-ikki soniya "sakrab" turadi.
  reconcileFromHeartbeat: (remainingSecFromServer) =>
    set((state) => {
      if (Math.abs(state.remainingSec - remainingSecFromServer) < 3) return {};
      const impliedServerNow = state.endsAt - remainingSecFromServer * 1000;
      return { serverOffset: impliedServerNow - Date.now(), remainingSec: remainingSecFromServer };
    }),

  toggleTimerHidden: () =>
    set((state) => {
      const next = !state.timerHidden;
      writeStored('exam.timerHidden', String(next));
      return { timerHidden: next };
    }),

  setFontSize: (size) => {
    writeStored('exam.fontSize', String(size));
    set({ fontSize: size });
  },

  toggleHighContrast: () =>
    set((state) => {
      const next = !state.highContrast;
      writeStored('exam.highContrast', String(next));
      return { highContrast: next };
    }),

  setSplitRatio: (ratio) => {
    const clamped = Math.min(0.7, Math.max(0.3, ratio));
    writeStored('exam.splitRatio', String(clamped));
    set({ splitRatio: clamped });
  },

  // useAutosave.ts shu funksiyani chaqiradi (debounce/interval/blur triggerlari
  // bilan) — bu yerning o'zi hech qanday taymerni bilmaydi, faqat "hozir
  // yubor" komandasi.
  //
  // Diqqat — poyga holati (race): so'rov havoda turgan paytda foydalanuvchi
  // yana bitta javobni o'zgartirishi mumkin. Shuning uchun MUVAFFAQIYATDAN
  // KEYIN `dirtyKeys`ni BUTUNLAY tozalamaymiz — faqat AYNAN shu so'rovga
  // kiritilgan kalitlarni olib tashlaymiz. Aks holda so'rov davomida qo'shilgan
  // yangi javob "saqlangan" deb belgilanib, serverga hech qachon yetib bormas edi.
  syncNow: async () => {
    const state = get();
    if (!state.attemptId) return;
    if (state.dirtyKeys.size === 0 && !state.flaggedDirty) return;

    const keysBeingSynced = new Set(state.dirtyKeys);
    const flaggedBeingSynced = state.flaggedDirty;
    const dirtyAnswers: Record<string, AnswerValue> = {};
    const dirtyEssays: { task1?: EssayState; task2?: EssayState } = {};
    for (const key of keysBeingSynced) {
      if (key === 'task1') dirtyEssays.task1 = state.essays.task1;
      else if (key === 'task2') dirtyEssays.task2 = state.essays.task2;
      else dirtyAnswers[key] = state.answers[key];
    }

    const ok = await patchAnswers(state.attemptId, {
      answers: dirtyAnswers,
      flagged: Array.from(state.flagged),
      lastQuestion: state.currentQuestion,
      essays: Object.keys(dirtyEssays).length > 0 ? dirtyEssays : undefined,
    });

    set((s) => {
      if (!ok) return { saveStatus: 'error' };
      const remainingDirty = new Set(s.dirtyKeys);
      for (const key of keysBeingSynced) remainingDirty.delete(key);
      const stillFlaggedDirty = flaggedBeingSynced ? false : s.flaggedDirty;
      return {
        dirtyKeys: remainingDirty,
        flaggedDirty: stillFlaggedDirty,
        saveStatus: remainingDirty.size > 0 || stillFlaggedDirty ? 'saving' : 'saved',
      };
    });
  },
}));
