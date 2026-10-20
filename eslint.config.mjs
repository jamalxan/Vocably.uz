import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...coreWebVitals,
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'e2e/**', 'scripts/**', 'docs/**', 'next-env.d.ts'] },
  { rules: { 'react/no-unescaped-entities': 'off' } },
  {
    // eslint-config-next 16 (react-hooks v6) React Compiler qoidalarini qo'shdi. Ular xato emas, balki mavjud kodning
    // uslub eskirishi (91 ta setState-in-effect va h.k.) — yangilash bilan birga yamab bo'lmaydi, shuning uchun ogohlantirish.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
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
