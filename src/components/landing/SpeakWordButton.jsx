'use client';
import { Volume2 } from 'lucide-react';
import { speakText } from '@/lib/speech';

// /lugat/[word] server komponent — talaffuz tugmasi onClick talab qilgani
// uchun shu kichik client "island" ga ajratilgan (qolgan sahifa to'liq statik
// qoladi, generateStaticParams orqali build vaqtida generatsiya qilinadi).
export default function SpeakWordButton({ word }) {
  return (
    <button
      type="button"
      onClick={() => speakText(word)}
      aria-label="Talaffuzni eshitish"
      className="w-11 h-11 inline-flex items-center justify-center bg-accent-soft text-accent hover:bg-accent/20 rounded-full transition-colors flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Volume2 size={18} />
    </button>
  );
}
