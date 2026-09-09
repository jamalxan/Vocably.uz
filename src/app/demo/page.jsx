import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DemoExperience from '@/components/landing/DemoExperience';

export const metadata = {
  title: 'Bepul sinov — Vocably',
  description: "Ro'yxatdan o'tmasdan 10 ta so'zni Vocably kartochka rejimida sinab ko'ring.",
};

export default function DemoPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="px-4 sm:px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
          <ArrowLeft size={15} /> Bosh sahifaga qaytish
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <h1 className="font-luxury text-2xl sm:text-3xl font-bold text-ink text-center mb-2">Sinab ko'ring</h1>
        <p className="text-sm text-muted text-center mb-8 max-w-sm">
          Ro'yxatdan o'tmasdan — Vocably'ning Kartochka rejimi qanday ishlashini his qiling.
        </p>
        <DemoExperience />
      </main>
    </div>
  );
}
