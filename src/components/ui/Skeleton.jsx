// Yuklanish placeholder'i. DashboardHome/ActivityChart'da qo'lda yozilgan
// `animate-pulse` div bor edi — bu shu naqshni umumiy komponentga chiqaradi,
// yangi joylarda (masalan Lug'at ro'yxati, Profil) shu ishlatiladi.
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-primary-soft/50 ${className}`} />;
}
