'use client';
import { Volume2 } from 'lucide-react';
import { speakText } from '@/lib/speech';

// /lugat/[word] server komponent — talaffuz tugmasi onClick talab qilgani
// uchun shu kichik client "island" ga ajratilgan (qolgan sahifa to'liq statik
// qoladi, generateStaticParams orqali build vaqtida generatsiya qilinadi).
export default function SpeakWordButton({ word }) {
  return (
    <button
      onClick={() => speakText(word)}
      aria-label="Talaffuzni eshitish"
      className="p-2.5 bg-accent-soft text-accent hover:bg-accent/20 rounded-full transition-colors flex-shrink-0"
    >
      <Volume2 size={18} />
    </button>
  );
}
