// Yuklanish placeholder'i. DashboardHome/ActivityChart'da qo'lda yozilgan
// `animate-pulse` div bor edi — bu shu naqshni umumiy komponentga chiqaradi,
// yangi joylarda (masalan Lug'at ro'yxati, Profil) shu ishlatiladi.
// bg-border — ikkala temada ham karta/fon ustida ko'rinadi (primary-soft dark'da singib ketardi).
export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-border/70 ${className}`} />;
}
