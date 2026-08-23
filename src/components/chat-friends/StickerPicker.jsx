'use client';
import { useChat } from '@/context/ChatContext';

export default function StickerPicker({ onPick, onClose }) {
  const { stickerPacks } = useChat();

  return (
    <div className="absolute bottom-full mb-2 right-0 w-72 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-20">
      {stickerPacks.map((pack) => (
        <div key={pack.id} className="mb-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{pack.name}</p>
          <div className="grid grid-cols-4 gap-2">
            {pack.stickers.map((s) => (
              <button
                key={s.id}
                title={s.label}
                onClick={() => {
                  onPick(s.id);
                  onClose();
                }}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.file} alt={s.label} className="w-12 h-12" />
              </button>
            ))}
          </div>
        </div>
      ))}
      {stickerPacks.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Yuklanmoqda...</p>}
    </div>
  );
}
