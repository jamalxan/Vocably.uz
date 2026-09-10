import Link from 'next/link';
import {
  ArrowRight, Sparkles, RotateCw, BookOpenText, Ear, Mic, PenLine, Target,
  Trophy, Layers, Zap, CheckCircle2, Globe, Palette,
} from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

// VOCABLY-TZ.md §3.1 (IA) — T3 muammosi tuzatildi: '/' endi ochiq marketing
// landing (statik, SEO uchun server komponent), avvalgi to'g'ridan-to'g'ri
// login formasi /kirish'ga ko'chdi (src/app/kirish, src/components/auth/AuthForm.jsx).
//
// Dizayn: TZ §14.6 "Landing — to'liq maksimalizm" yo'nalishi — katta Playfair
// tipografika, merlot gradient blob'lar, kuchli kontrastli CTA'lar. LEKIN
// react-three-fiber asosidagi 3D so'z buluti va magnit kursor QASDDAN
// QO'SHILMADI — bular yangi og'ir dependency (paketda yo'q) va sezilarli
// qo'shimcha xavf/hajm keltiradi; shu o'rniga CSS gradient/blur bilan bir xil
// vizual "premium" hissi, yengilroq (LCP/bundle uchun xavfsizroq) yo'l bilan
// olindi.
export const metadata = {
  title: 'Vocably — Ingliz tilini ilmiy asoslangan usulda o\'rganing',
  description:
    "Vocably — o'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi. So'z boyligini ilmiy asoslangan takrorlash (SRS) tizimi bilan quring va Reading, Listening, Speaking, Writing mashqlarida darhol ishlating.",
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Vocably — Ingliz tilini ilmiy asoslangan usulda o\'rganing',
    description: "So'z boyligini SRS tizimi bilan quring, Reading/Listening/Speaking/Writing'da darhol ishlating.",
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vocably' }],
  },
};

const DIFFERENTIATORS = [
  {
    icon: Globe,
    title: "O'zbek tili birinchi",
    body: "Tarjima, izoh, AI yordamchi, butun interfeys — hammasi o'zbekcha. Boshqa tilni bilish shart emas.",
  },
  {
    icon: RotateCw,
    title: "So'z → ko'nikma zanjiri",
    body: "Bugun o'rgangan so'zingiz 24 soat ichida Reading matnida, Listening dialogida va Speaking savolida qaytadan uchraydi.",
  },
  {
    icon: Palette,
    title: 'Boshqacha dizayn',
    body: "Deep Merlot — issiq, premium palitra. Ko'k-yashil shablonlardan charchagan bo'lsangiz, bu sizga yoqadi.",
  },
];

const SKILL_CARDS = [
  { icon: Layers, title: "Lug'at (14 rejim)", body: 'Kartochka, test, kollokatsiya, jumla quruvchi, mnemonika va boshqalar — bitta SRS tizimi asosida.' },
  { icon: BookOpenText, title: 'Oqish', body: 'CEFR darajangizga mos matnlar va tushunish savollari, har javobga izoh bilan.' },
  { icon: Ear, title: 'Tinglash', body: "Tabiiy nutq matnlari, tezlikni sozlash imkoniyati bilan." },
  { icon: Mic, title: 'Gapirish', body: 'Ovozli javob bering — AI IELTS mezonlari bo\'yicha taxminiy baholaydi.' },
  { icon: PenLine, title: 'Yozish', body: 'Task 1/2 topshiriqlar, band + mezon bo\'yicha AI tahlil va tuzatishlar.' },
  { icon: Target, title: 'Mock imtihon', body: "4 bo'limli to'liq sinov — server taymeri, avtosaqlash, haqiqiy imtihon tajribasi." },
];

const FAQS = [
  { q: 'Vocably bepulmi?', a: "Ha, hozircha to'liq bepul. Pullik tariflar joriy etilganda mavjud foydalanuvchilar birinchi bo'lib xabardor qilinadi." },
  { q: "Ro'yxatdan o'tmasdan sinab ko'ra olamanmi?", a: "Ha — /demo sahifasida 10 ta so'zni ro'yxatdan o'tmasdan sinab ko'rishingiz mumkin." },
  { q: 'Telefonda ishlaydimi?', a: "Ha, Vocably to'liq mobil-moslashuvchan va PWA sifatida telefon ekraniga o'rnatilishi mumkin." },
  { q: "So'z boyligim qanday oshadi?", a: "Ilmiy asoslangan takrorlash (SRS) tizimi har so'zni unutish arafasida qayta ko'rsatadi — natijada kamroq vaqt bilan ko'proq eslab qolasiz." },
];

export default function LandingPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Vocably — Ingliz tili',
      description: "So'z boyligini SRS tizimi bilan quring, Reading/Listening/Speaking/Writing'da ishlating.",
      provider: { '@type': 'Organization', name: 'Vocably', sameAs: 'https://vocably.uz' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalProgram',
      name: 'Vocably ingliz tili dasturi',
      description: "O'zbek tilida so'zlashuvchilar uchun ingliz tili o'rganish dasturi.",
      provider: { '@type': 'Organization', name: 'Vocably' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh bg-bg overflow-x-hidden">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Fon: gradient mesh — TZ §14.6 "merlot gradient meshlar" ruhida, CSS-only */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-32 w-[26rem] h-[26rem] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[60%] left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <LandingHeader />

      {/* ============ HERO ============ */}
      <section className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-accent-soft text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={13} /> Ilmiy asoslangan takrorlash tizimi (SRS)
          </div>
          <h1 className="font-luxury text-4xl sm:text-6xl font-bold text-ink leading-[1.1] tracking-tight mb-6">
            Ingliz tilini <span className="text-accent">unutmaydigan</span> usulda o'rganing
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-9 leading-relaxed">
            Vocably — so'z boyligingizni ilmiy asoslangan takrorlash tizimi bilan quradi va shu
            so'zlarni Reading, Listening, Speaking, Writing mashqlarida darhol ishlatishga majbur qiladi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/royxat"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-glow"
            >
              Bepul boshlash <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface border border-border hover:border-accent/40 text-ink font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Ro'yxatdan o'tmasdan sinash
            </Link>
          </div>
          <p className="text-xs text-muted mt-5">Kredit karta talab qilinmaydi · 1 daqiqada boshlanadi</p>
        </div>
      </section>

      {/* ============ FARQLANISH ============ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink text-center mb-3">
            Nega Vocably boshqacha
          </h2>
          <p className="text-sm text-muted text-center max-w-lg mx-auto mb-12">
            Ko'p ilova so'z yodlashni "o'yin" qiladi. Biz uni <strong className="text-ink">tizim</strong> qildik.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="bg-bg border border-border rounded-2xl p-6 shadow-card">
                <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center mb-4">
                  <d.icon size={20} />
                </div>
                <h3 className="font-display text-base font-bold text-ink mb-1.5">{d.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ZANJIR MEXANIZMI ============ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-3">
            Bir so'z — to'rt marta ishlatiladi
          </h2>
          <p className="text-sm text-muted max-w-lg mx-auto mb-10">
            O'rgangan so'zingiz izolyatsiyalangan holda qolmaydi — bir necha kun ichida boshqa
            ko'nikmalarda tabiiy ravishda qaytib chiqadi.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 text-left">
            {[
              { step: 'T+0', label: 'Kartochka / Test', body: "So'zni birinchi marta o'rganasiz" },
              { step: 'T+1 kun', label: 'Reading', body: 'So\'z ishlatilgan qisqa matnda uchraydi' },
              { step: 'T+2 kun', label: 'Listening', body: "So'z bor dialogda tinglaysiz" },
              { step: 'T+3 kun', label: 'Speaking / Writing', body: "So'zni o'zingiz ishlatib gapirasiz yoki yozasiz" },
            ].map((s, i) => (
              <div key={s.step} className="flex-1 bg-surface border border-border rounded-2xl p-4 relative">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{s.step}</span>
                <p className="text-sm font-semibold text-ink mt-1">{s.label}</p>
                <p className="text-xs text-muted mt-1">{s.body}</p>
                {i < 3 && (
                  <ArrowRight size={14} className="hidden sm:block absolute top-1/2 -right-2 -translate-y-1/2 text-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KO'NIKMALAR ============ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink text-center mb-12">
            Bitta platforma, to'rtta ko'nikma
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_CARDS.map((s) => (
              <div key={s.title} className="bg-bg border border-border rounded-2xl p-6 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-ink flex items-center justify-center mb-4">
                  <s.icon size={20} />
                </div>
                <h3 className="font-display text-base font-bold text-ink mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GAMIFIKATSIYA / ILMIY ASOS ============ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={18} className="text-accent" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Nega ishlaydi</h2>
          </div>
          <p className="text-sm text-muted max-w-xl mx-auto mb-6 leading-relaxed">
            Hermann Ebbinghaus'ning "unutish egri chizig'i" bo'yicha, yangi ma'lumotning katta
            qismi bir hafta ichida esdan chiqadi — agar to'g'ri vaqtda takrorlanmasa. Vocably har
            so'zni <strong className="text-ink">aynan unutish arafasida</strong> qayta ko'rsatadi — natijada
            bir xil bilim darajasiga sezilarli darajada kamroq vaqt bilan erishasiz.
          </p>
          <Link href="/blog/spaced-repetition-fsrs-nima" className="text-sm text-accent font-semibold hover:text-accent-hover inline-flex items-center gap-1">
            To'liq tushuntirishni o'qing <ArrowRight size={14} />
          </Link>

          <div className="grid sm:grid-cols-3 gap-4 mt-12 text-left">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <Trophy size={18} className="text-accent mb-2" />
              <p className="text-sm font-semibold text-ink mb-1">XP va darajalar</p>
              <p className="text-xs text-muted">Har mashq XP beradi, A1'dan C2'gacha daraja bosib o'tasiz.</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5">
              <CheckCircle2 size={18} className="text-accent mb-2" />
              <p className="text-sm font-semibold text-ink mb-1">Kunlik alanga</p>
              <p className="text-xs text-muted">Ketma-ket kunlar streak sifatida saqlanadi va sizni izchil bo'lishga undaydi.</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5">
              <Sparkles size={18} className="text-accent mb-2" />
              <p className="text-sm font-semibold text-ink mb-1">AI yordamchi</p>
              <p className="text-xs text-muted">Istalgan sahifadan bir tugma bosib AI'dan tushuntirish so'rashingiz mumkin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20 bg-surface border-y border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink text-center mb-10">
            Ko'p beriladigan savollar
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-bg border border-border rounded-2xl p-5">
                <summary className="text-sm font-semibold text-ink cursor-pointer list-none flex items-center justify-between gap-3">
                  {f.q}
                  <ArrowRight size={14} className="text-muted group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-sm text-muted mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ YAKUNIY CTA ============ */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-ink mb-4">
            Bugun boshlang, ertaga eslang
          </h2>
          <p className="text-sm text-muted mb-8">Ro'yxatdan o'tish 1 daqiqa, kredit karta shart emas.</p>
          <Link
            href="/royxat"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-8 py-4 rounded-xl text-sm transition-colors shadow-glow"
          >
            Bepul boshlash <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
