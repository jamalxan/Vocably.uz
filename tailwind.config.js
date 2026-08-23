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
        // Faqat admin panel uchun (src/app/admin/layout.jsx) — hashamatli serif sarlavhalar.
        luxury: ['var(--font-luxury)', 'Georgia', 'serif'],
      },
      boxShadow: {
        premium: '0 20px 60px -15px rgba(79, 70, 229, 0.25)',
        // Admin panel maksimalizm dizayni uchun — qatlamli, chuqur soyalar.
        'admin-card': '0 1px 2px rgba(0,0,0,.4), 0 24px 48px -12px rgba(0,0,0,.65)',
        'admin-glow': '0 0 0 1px rgba(221,2,0,.35), 0 8px 32px -4px rgba(221,2,0,.35)',
        'admin-gold-glow': '0 0 0 1px rgba(201,150,43,.3), 0 8px 28px -6px rgba(201,150,43,.3)',
      },
      // Admin panelning to'liq rang tizimi — foydalanuvchi bergan 4 ta asosiy rangdan
      // (Alabaster Grey, Racing Red, Black Cherry, Coffee Bean) hosil qilingan tonal
      // shkalalar + muvozanat uchun oltin urg'u rangi (faqat ijobiy holat belgisi sifatida).
      colors: {
        racing: {
          50: '#FFF0F0', 100: '#FFDCDB', 200: '#FFB3B2', 300: '#FF7170', 400: '#FF2B29',
          500: '#EB0200', 600: '#DD0200', 700: '#AD0200', 800: '#850100', 900: '#610100', 950: '#3D0100',
        },
        coffee: {
          50: '#FAEBEA', 100: '#F1C3C1', 200: '#E28783', 300: '#D44C45', 400: '#A62D26',
          500: '#741F1B', 600: '#531613', 700: '#3A100D', 800: '#290B0A', 900: '#1A0706', 950: '#130504',
        },
        cherry: {
          50: '#FCEAE9', 100: '#F5BFBD', 200: '#EB7F7A', 300: '#E13F38', 400: '#B1211B',
          500: '#851914', 600: '#61120F', 700: '#55100D', 800: '#310907', 900: '#210605', 950: '#140403',
        },
        alabaster: {
          50: '#FAFAFA', 100: '#F2F2F2', 200: '#E6E6E6', 300: '#D9D9D9', 400: '#BFBFBF',
          500: '#A6A6A6', 600: '#8C8C8C', 700: '#6B6B6B', 800: '#474747', 900: '#292929', 950: '#171717',
        },
        gold: {
          50: '#FDF9F2', 100: '#F9F0DC', 200: '#F1DCB1', 300: '#E8C57D', 400: '#E0B252',
          500: '#C9962B', 600: '#B68620', 700: '#936C1A', 800: '#715314', 900: '#4E390E', 950: '#342609',
        },
      },
    },
  },
  plugins: [],
}
