'use client';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import CurrentYear from './CurrentYear';
import useCopy from './useCopy';

const HREFS = [
  ['/demo', '/dictionary', '/blog'],
  ['/ielts', '/ielts/band-calculator', '/ielts/mock-test', '/ielts/reading', '/ielts/writing'],
  ['/login', '/register', '/pricing'],
];

const COPY = {
  uz: {
    about: "O'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi — so'z boyligini ilmiy asoslangan takrorlash tizimi bilan quradi.",
    columns: [
      { title: "O'rganish", links: ['Bepul sinov', "So'zlar lug'ati", 'Blog'] },
      { title: 'IELTS', links: ["IELTS qo'llanma", 'Band kalkulyatori', 'Mock test onlayn', 'Reading', 'Writing'] },
      { title: 'Hisob', links: ['Kirish', "Ro'yxatdan o'tish", 'Narxlar'] },
    ],
    lang: 'Sayt tili',
    rights: 'Barcha huquqlar himoyalangan.',
  },
  en: {
    about: 'An English learning platform for Uzbek speakers — it builds your vocabulary with a science-based spaced repetition system.',
    columns: [
      { title: 'Learn', links: ['Free trial', 'Word dictionary', 'Blog'] },
      { title: 'IELTS', links: ['IELTS guide', 'Band calculator', 'Online mock test', 'Reading', 'Writing'] },
      { title: 'Account', links: ['Log in', 'Sign up', 'Pricing'] },
    ],
    lang: 'Site language',
    rights: 'All rights reserved.',
  },
};

export default function LandingFooter() {
  const tx = useCopy(COPY);
  return (
    <footer className="border-t border-border px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-10 mb-10">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <BrandLogo height={28} />
            </Link>
            <p className="text-xs text-muted leading-relaxed mb-5">{tx.about}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">{tx.lang}</p>
            <LanguageSwitch variant="full" />
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-8 sm:gap-16">
            {tx.columns.map((col, ci) => (
              <div key={ci}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">{col.title}</p>
                <div className="flex flex-col md:gap-2">
                  {col.links.map((label, li) => (
                    <Link key={HREFS[ci][li]} href={HREFS[ci][li]} className="min-h-10 md:min-h-0 inline-flex items-center text-sm text-muted hover:text-accent transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-border text-xs text-ink-subtle">
          © <CurrentYear initial={new Date().getFullYear()} /> Vocably. {tx.rights}
        </div>
      </div>
    </footer>
  );
}
