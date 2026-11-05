'use client';
import { useT } from '@/context/LocaleContext';

// Pricing page heading — a client component so it follows the UZ/EN switch like the table below it.
export default function PricingIntro() {
  const { t } = useT();
  return (
    <>
      <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-ink mb-3">{t('pr.title')}</h1>
      <p className="text-sm sm:text-base text-muted">{t('pr.subtitle')}</p>
    </>
  );
}
