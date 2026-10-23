'use client';
import { Globe } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n';

// Uzbek first: it is the site's primary audience.
const ORDER = ['uz', 'en'].filter((l) => LOCALES.includes(l));
const SHORT = { uz: 'UZ', en: 'EN' };
const GROUP_LABEL = { uz: 'Sayt tili', en: 'Site language' };

// Two-option segmented switch with a sliding thumb. One click changes the language of the
// whole site (cookie + every component that reads useT re-renders).
//   compact — globe + "UZ | EN", for the header bar (also on mobile, next to the menu button)
//   full    — "O'zbekcha | English", for the mobile menu and the footer
export default function LanguageSwitch({ variant = 'compact', className = '' }) {
  const { locale, setLocale } = useT();
  const index = Math.max(0, ORDER.indexOf(locale));
  const compact = variant === 'compact';

  return (
    <div
      role="radiogroup"
      aria-label={GROUP_LABEL[locale] || GROUP_LABEL.en}
      className={`relative inline-flex items-center rounded-full border border-border bg-surface/80 p-1 backdrop-blur-md shadow-sm ${className}`}
    >
      {compact && <Globe size={15} className="mx-1.5 text-muted flex-shrink-0" aria-hidden="true" />}
      <div className="relative grid grid-cols-2">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-accent shadow-glow transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {ORDER.map((l) => {
          const on = l === locale;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={on}
              lang={l}
              onClick={() => !on && setLocale(l)}
              title={LOCALE_LABELS[l]}
              className={`relative z-10 rounded-full font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                compact ? 'min-w-10 h-8 px-2.5 text-xs tracking-wide' : 'min-w-24 h-10 px-4 text-sm'
              } ${on ? 'text-on-accent' : 'text-muted hover:text-ink'}`}
            >
              {compact ? SHORT[l] : LOCALE_LABELS[l]}
              {compact && <span className="sr-only"> {LOCALE_LABELS[l]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
