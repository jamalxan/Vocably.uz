'use client';
import { Phone } from 'lucide-react';
import { useT } from '@/context/LocaleContext';

// Shu akkauntning boshqa qurilmasida qo'ng'iroq bor — faqat ma'lumot, amal yo'q (CALLS_SPEC §10.6).
export default function ElsewhereBanner() {
  const { t } = useT();
  return (
    <div
      role="status"
      data-testid="call-elsewhere"
      className="fixed top-0 inset-x-0 md:left-[72px] xl:left-64 z-[70] h-9 bg-surface-2 text-ink border-b border-border text-sm font-semibold flex items-center justify-center gap-2 px-3"
    >
      <Phone size={14} aria-hidden="true" />
      <span className="truncate">{t('call.onOtherDevice')}</span>
    </div>
  );
}
