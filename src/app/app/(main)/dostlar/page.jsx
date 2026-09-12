import DoStlarPanel from '@/components/chat-friends/DoStlarPanel';

export default function DostlarPage() {
  // TZ-vocably-v2.md BUG-023 — `h-full` (foizli balandlik) o'rniga `flex-1 min-h-0
  // flex flex-col`: bu div AppShell'ning `<main>`i ostida yagona bola, main endi
  // o'zi flex konteyner (q. AppShell.jsx), shuning uchun bu yerda flex-item sifatida
  // butun qolgan balandlikni egallaydi va o'zi ham flex konteyner bo'lib, DoStlarPanel
  // ichidagi h-full zanjirining to'g'ri ishlashi uchun zarur bo'lgan "aniq balandlik"ni
  // beradi (real brauzerda tekshirilgan — h-full ustidan flex-1 min-h-0 flex flex-col
  // zanjiri bo'lmasa, panel kontent balandligiga qisqarib, ostida bo'sh joy qolardi).
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <DoStlarPanel />
    </div>
  );
}
