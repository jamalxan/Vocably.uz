'use client';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';
import MockShell from '@/features/exam/mock/MockShell';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi eski (test tanlash +
// exam/practice tumbler bo'lgan) sahifa emas, to'g'ridan-to'g'ri yangi exam
// engine. Foydalanuvchi so'rovi: "mockda tanlash bo'lmasin, to'liq avto" —
// shu sabab `MockShell`ga `testId` UMUMAN berilmaydi, u server tomonida
// tasodifiy tanlanadi (src/app/api/exam/attempts/route.js). Practice-mode mock
// (vaqt bosimisiz) yangi dvigatelda hali qurilmagan — shu tugma qo'shilmadi.
export default function MockPage() {
  const { isAuthed, displayName } = useApp();
  const { t } = useT();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">{t('ex.login')}</p>;
  }

  return <MockShell candidateName={displayName || t('ex.user')} />;
}
