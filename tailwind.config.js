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
        // Faqat kod bloklari, ID va JSON uchun (IBM Plex Mono). Statistika raqamlari
        // endi asosiy shriftda (Poppins) + tabular-nums.
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // "Deep Merlot" — qora emas, brendning o'z (primary) rangiga to'yingan yumshoq soya —
        // premium ko'rinish shundan keladi. Kartalar uchun.
        // Ranglar globals.css tokenlaridan (--shadow-rgb, --color-accent) — dark-mode'da
        // soya qora, glow esa dark accent tusiga o'tadi. Light qiymatlari avvalgidek.
        card: '0 1px 2px rgb(var(--shadow-rgb) / .05), 0 16px 40px -12px rgb(var(--shadow-rgb) / .14)',
        // Accent atrofidagi nozik nurlanish — aktiv holat/asosiy CTA uchun.
        glow: '0 0 0 1px rgb(var(--color-accent) / .22), 0 10px 28px -8px rgb(var(--color-accent) / .32)',
        premium: '0 20px 60px -15px rgb(var(--shadow-rgb) / .20)',
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
          3: 'rgb(var(--color-surface-3) / <alpha-value>)',
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
          subtle: 'rgb(var(--color-text-subtle) / <alpha-value>)',
        },
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
        'on-danger': 'rgb(var(--color-on-danger) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        // TZ-vocably-v2.md §B2 nomlanishi: brend rangidagi sarlavha/katta raqam uchun
        // mustaqil token (text-ink'dan farqli — dark-mode'da atayin aksent tusiga
        // inverts bo'ladi, BUG-001'ning asl tuzatilishi).
        'brand-text': 'rgb(var(--color-brand-text) / <alpha-value>)',
        'on-brand': 'rgb(var(--color-on-brand) / <alpha-value>)',
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
