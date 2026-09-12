'use client';
import { Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import CategorySwitcher from '@/components/CategorySwitcher';
import IconButton from '@/components/ui/IconButton';

// Lug'at bo'limining barcha sahifalari (index menyu + 8 ta rejim) shu sarlavhani
// baham ko'radi — kategoriya tanlagich va o'chirish tugmasi ilgari dashboard
// header'ida edi, endi faqat kategoriyaga tegishli sahifalarda ko'rinadi (AI/
// Bugun/Do'stlar/Profil'da bunday tugma umuman kerak emas edi).
export default function LugatLayout({ children }) {
  const { activeCategory, activeCatIndex, handleDeleteCategory } = useApp();

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <CategorySwitcher />
          <p className="text-xs text-muted mt-2">Jami so'zlar: {activeCategory?.words?.length || 0} ta</p>
        </div>
        <IconButton
          icon={Trash2}
          label="Kategoriyani o'chirish"
          variant="danger"
          onClick={() => handleDeleteCategory(activeCatIndex)}
          className="border border-danger/25 flex-shrink-0"
        />
      </div>
      {children}
    </div>
  );
}
