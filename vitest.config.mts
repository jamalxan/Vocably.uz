import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Loyihaning tsconfig.json'i `"jsx": "preserve"` (Next.js talabi — Next o'zi
// SWC bilan JSX'ni compile qiladi). Vitest esa to'g'ridan-to'g'ri Vite orqali
// ishlaydi va "preserve" bilan kelishmaydi ("invalid JS syntax" xatosi har
// qanday .tsx faylni import qilishda) — Vite'ning o'ziga xos esbuild/oxc
// sozlamasi (`esbuild.jsx`) buni to'g'irlashga urinib ko'rilgan edi, lekin bu
// Vite versiyasida standart transformer sifatida ishlatiladigan oxc uni
// e'tiborsiz qoldirdi. `@vitejs/plugin-react` — rasmiy, versiyaga bog'liq
// bo'lmagan yechim. Bu FAQAT test yugurtirish uchun — production build
// (Next/SWC) ga hech qanday ta'siri yo'q.
export default defineConfig({
  plugins: [react()],
});
