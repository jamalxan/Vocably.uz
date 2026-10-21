import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...coreWebVitals,
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'e2e/**', 'scripts/**', 'docs/**', 'next-env.d.ts'] },
  { rules: { 'react/no-unescaped-entities': 'off' } },
  {
    // set-state-in-effect (91 ta): effect'da ma'lumot yuklash, brauzer API'ni o'qish (gidratatsiya-xavfsiz) va prop o'zgarganda
    // holatni nolga qaytarish — qonuniy naqshlar; ularni ommaviy qayta yozish regressiya xavfini tug'diradi, shuning uchun ogohlantirish.
    // Qolgan React Compiler qoidalari (refs, purity, immutability, memoization) tuzatildi va xato sifatida qoldi.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Oddiy JS/JSX'da aniqlanmagan identifikator (masalan unutilgan import) faqat ish vaqtida — foydalanuvchi so'rovida —
    // ReferenceError beradi; TypeScript JS'ni tekshirmaydi. TS fayllarni tsc o'zi tekshiradi.
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    languageOptions: { globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', process: 'readonly', Buffer: 'readonly', console: 'readonly', fetch: 'readonly', URL: 'readonly' } },
    rules: { 'no-undef': 'error' },
  },
];

export default config;
