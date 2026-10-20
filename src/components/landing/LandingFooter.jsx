import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import CurrentYear from './CurrentYear';

const COLUMNS = [
  {
    title: "O'rganish",
    links: [
      { href: '/demo', label: 'Bepul sinov' },
      { href: '/dictionary', label: "So'zlar lug'ati" },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'IELTS',
    links: [
      { href: '/ielts', label: "IELTS qo'llanma" },
      { href: '/ielts/band-calculator', label: 'Band kalkulyatori' },
      { href: '/ielts/mock-test', label: 'Mock test onlayn' },
      { href: '/ielts/reading', label: 'Reading' },
      { href: '/ielts/writing', label: 'Writing' },
    ],
  },
  {
    title: 'Hisob',
    links: [
      { href: '/login', label: 'Kirish' },
      { href: '/register', label: "Ro'yxatdan o'tish" },
      { href: '/pricing', label: 'Narxlar' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-10 mb-10">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <BrandLogo height={28} />
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              O'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi — so'z boyligini ilmiy
              asoslangan takrorlash tizimi bilan quradi.
            </p>
          </div>
          <div className="flex gap-12 sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">{col.title}</p>
                <div className="flex flex-col md:gap-2">
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} className="min-h-10 md:min-h-0 inline-flex items-center text-sm text-muted hover:text-accent transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-border text-xs text-ink-subtle">
          © <CurrentYear initial={new Date().getFullYear()} /> Vocably. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
