import Link from 'next/link';
import { BookOpen } from 'lucide-react';

const COLUMNS = [
  {
    title: "O'rganish",
    links: [
      { href: '/demo', label: 'Bepul sinov' },
      { href: '/lugat', label: "So'zlar lug'ati" },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Hisob',
    links: [
      { href: '/kirish', label: 'Kirish' },
      { href: '/royxat', label: "Ro'yxatdan o'tish" },
      { href: '/narxlar', label: 'Narxlar' },
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
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-on-accent">
                <BookOpen size={16} />
              </div>
              <span className="font-luxury text-lg font-bold text-ink">
                Voc<span className="text-accent">ably</span>
              </span>
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
                <div className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-accent transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-border text-[11px] text-muted/70">
          © {new Date().getFullYear()} Vocably. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
