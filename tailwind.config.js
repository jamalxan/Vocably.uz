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
        bg: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          sunken: 'rgb(var(--color-bg-sunken) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          2: 'rgb(var(--color-surface-2) / <alpha-value>)',
        },
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
        // Sarlavha/matn rangi — dark-mode'da invert bo'ladigan yagona token
        // (globals.css'dagi --color-ink izohiga q.). Yangi kod text-primary
        // o'rniga text-ink ishlatsin.
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
        },
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          soft: 'rgb(var(--color-success-soft) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          soft: 'rgb(var(--color-warning-soft) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          soft: 'rgb(var(--color-danger-soft) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          soft: 'rgb(var(--color-info-soft) / <alpha-value>)',
        },
        srs: {
          new: 'rgb(var(--color-srs-new) / <alpha-value>)',
          learning: 'rgb(var(--color-srs-learning) / <alpha-value>)',
          review: 'rgb(var(--color-srs-review) / <alpha-value>)',
          mastered: 'rgb(var(--color-srs-mastered) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
