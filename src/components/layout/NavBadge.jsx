'use client';
import { useT } from '@/context/LocaleContext';
import { badgeLabel } from '@/lib/realtime/clientState';

// "Friends" nav elementidagi o'qilmaganlar belgisi (PARITY_PLAN WP1): sidebar'da yorliq o'ngida,
// rail va pastki tab bar'da ikonka burchagida (`className` bilan joylashtiriladi). Faqat ovozsiz
// suhbatlarda o'qilmagan bo'lsa — kichik kulrang nuqta (Telegram kabi, raqamsiz).
export default function NavBadge({ count = 0, mutedOnly = false, className = '' }) {
  const { t } = useT();
  if (count > 0) {
    return (
      <span className={`inline-flex ${className}`} data-testid="nav-unread-badge" data-count={count}>
        <span aria-hidden="true" className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[10px] font-semibold leading-[18px] text-center tabular-nums">
          {badgeLabel(count)}
        </span>
        <span className="sr-only">{t('nav.unreadAria', { n: count })}</span>
      </span>
    );
  }
  if (mutedOnly) {
    return (
      <span className={`inline-flex ${className}`} data-testid="nav-unread-badge" data-count={0}>
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-muted" />
      </span>
    );
  }
  return null;
}
