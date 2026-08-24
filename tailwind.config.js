/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        luxury: ['var(--font-luxury)', 'Georgia', 'serif'],
        // Faqat o'rganilayotgan so'zning o'zi uchun (flashcard/test/quiz) — bosh
        // so'z uslubidagi dictionary-serif, layout.jsx'dagi izohga q.
        word: ['var(--font-word)', 'Georgia', 'serif'],
        // Do'stlar chat'i (xabarlar, input, emoji picker) uchun — matn shriftidan keyin
        // platformaning emoji shriftiga tushadi, shunda emoji hech qachon lotin harflari
        // shriftidan (glyph yo'qligi sababli) render bo'lmaydi.
        chat: ['var(--font-body)', 'var(--font-emoji)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Standart Tailwind font-mono'ni almashtiradi — statistika raqamlari (streak,
        // KPI, mastery, forecast), jadval indekslari va ID'lar generik tizim mono
        // shrifti o'rniga brendning premium mono shriftida (IBM Plex Mono) chiqadi.
        // Mavjud barcha `font-mono` klasslari o'zgarishsiz avtomatik yangilanadi.
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // "Deep Merlot" — qora emas, brendning o'z (primary) rangiga to'yingan yumshoq soya —
        // premium ko'rinish shundan keladi. Kartalar uchun.
        card: '0 1px 2px rgba(74,18,38,.05), 0 16px 40px -12px rgba(74,18,38,.14)',
        // Accent atrofidagi nozik nurlanish — aktiv holat/asosiy CTA uchun.
        glow: '0 0 0 1px rgba(184,57,74,.22), 0 10px 28px -8px rgba(184,57,74,.32)',
        premium: '0 20px 60px -15px rgba(74,18,38,.20)',
      },
      // Yagona manba: src/app/globals.css'dagi CSS o'zgaruvchilar. Bu yerda faqat
      // Tailwind'ga "qanday nomlash" ko'rsatiladi — haqiqiy qiymat va uni o'zgartirish
      // faqat globals.css'da. rgb(var(--x) / <alpha-value>) pattern opacity
      // modifikatorlarini (masalan bg-accent/60) ishlashda qoldiradi.
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          soft: 'rgb(var(--color-primary-soft) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        },
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
