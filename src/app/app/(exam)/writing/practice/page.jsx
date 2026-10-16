import { redirect } from 'next/navigation';

// Alohida "mashq" ro'yxati olib tashlandi (2026-09-29) — mashq endi
// /app/writing sahifasining o'zida (Practice rejimi). Eski havolalar uchun.
export default function Page() {
  redirect('/app/writing');
}
