import { redirect } from 'next/navigation';

// Eski himoyalangan zona shu yerda edi (bitta catch-all route, ichki "view" holati
// bilan — U4: hech bir rejim haqiqiy URL'ga ega emas edi). Endi VOCABLY-TZ.md 3.1
// bo'yicha /app ostida haqiqiy marshrutlar bor (src/app/app/**). Bu fayl faqat
// eski bookmark/push-bildirishnoma havolalarini (masalan avval yuborilgan Telegram
// xabarlaridagi /dashboard/friends/... havolalari) yangi joyga yo'naltiradi —
// hech narsa buzilmasligi uchun o'chirilmadi.
export default function LegacyDashboardRedirect({ params }) {
  const list = params?.segments || [];

  if (list[0] === 'friends') {
    const rest = list.slice(1);
    redirect(rest.length ? `/app/dostlar/${rest.join('/')}` : '/app/dostlar');
  }
  redirect('/app');
}
