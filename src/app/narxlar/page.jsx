import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Narxlar — Vocably',
  description: 'Vocably tariflari tez orada e\'lon qilinadi.',
  alternates: { canonical: '/narxlar' },
};

// VOCABLY-TZ.md §3.1 IA'da /narxlar bo'limi ko'rsatilgan, lekin haqiqiy tarif
// tuzilishi va narxlar — biznes qarori (§20.1 risklar jadvali: "marketing
// qarori"), muhandislik darajasida hal qilinmaydi. Shu sabab bu yerda soxta
// raqamlar o'ylab topilmadi — hozircha ochiq va halol "tez orada" xabari,
// foydalanuvchi darhol bepul boshlashi mumkinligi bilan.
export default function NarxlarPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="px-4 sm:px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
          <ArrowLeft size={15} /> Bosh sahifa
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-on-accent shadow-glow mb-6">
          <Sparkles size={28} />
        </div>
        <h1 className="font-luxury text-2xl sm:text-3xl font-bold text-ink mb-3">Tariflar tez orada</h1>
        <p className="text-sm text-muted max-w-md mb-8">
          Vocably hozircha to'liq bepul. Pullik tariflar joriy etilganda, hozirgi foydalanuvchilar
          birinchilardan bo'lib xabardor qilinadi.
        </p>
        <Link
          href="/royxat"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-glow"
        >
          Hoziroq bepul boshlash
        </Link>
      </main>
    </div>
  );
}
