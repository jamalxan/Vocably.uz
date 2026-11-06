'use client';
import { Phone, Video } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import ActionSheet from './ActionSheet';

// "Qayta qo'ng'iroq qilasizmi?" — bildirishnomadagi `?call=audio|video` havolasidan (CALLS_SPEC §9.6).
// Avtomatik terilmaydi: Safari getUserMedia/AudioContext uchun foydalanuvchi harakatini talab qiladi.
export default function CallbackSheet({ open, kind, onPick, onClose, disabled, disabledTitle }) {
  const { t } = useT();
  const items = [
    { key: 'audio', label: t('call.callbackAudio'), icon: Phone, onSelect: () => onPick('audio'), testid: 'call-callback-audio', disabled },
    { key: 'video', label: t('call.callbackVideo'), icon: Video, onSelect: () => onPick('video'), testid: 'call-callback-video', disabled },
  ];
  // Havoladagi tur birinchi turadi (birinchi fokus shunda).
  if (kind === 'video') items.reverse();
  return (
    <ActionSheet open={open} title={t('call.callbackTitle')} items={items} onClose={onClose} testid="call-callback-sheet" role="dialog">
      {disabled && disabledTitle && <p className="px-4 pb-2 text-xs text-muted">{disabledTitle}</p>}
    </ActionSheet>
  );
}
