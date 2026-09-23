'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';
import GapInput from '../GapInput';
import GapSelect from '../GapSelect';
import { useIsMobile } from '../../state/useIsMobile';

// TZ-vocably-v2.md §6.4/§7.6 — diagram_label (Reading), map_label/plan_label
// (Listening) HAMMASI bir xil mexanizm: `group.imageUrl` ustiga
// `group.imageHotspots` koordinatalari (foizda, 0-100) bo'yicha inputlar
// joylashadi. Uch xil nomdan farqli (diagram/xarita/reja — faqat MAZMUNIY
// farq, admin qaysi rasmni yuklashida), render bir xil — shuning uchun BITTA
// komponent.
//
// "Har hotspot: kichik input yoki drop zone (variantlar bankidan drag)."
// Drag-drop ATAYLAB qilinmagan — TZ o'zi buni "Mobil'da drag-drop ishlamaydi"
// deb tan oladi va tavsiya sifatida oddiy tanlovni ham qo'shishni aytadi;
// `group.bank` bo'lsa <select> (GapSelect), bo'lmasa erkin matn (GapInput) —
// bu ikkalasi ham mobil-mos, universal yechim.
export interface ImageHotspotLabelProps {
  group: SanitizedQuestionGroup;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionNumber: number, value: AnswerValue) => void;
}

export default function ImageHotspotLabel({ group, answers, onAnswerChange }: ImageHotspotLabelProps) {
  const hotspots = group.imageHotspots || [];
  const bank = group.bank;
  const isMobile = useIsMobile();

  if (!group.imageUrl) return null;

  const renderField = (questionNumber: number, className: string) => {
    const value = answers[`q${questionNumber}`];
    const stringValue = typeof value === 'string' ? value : '';
    return bank ? (
      <GapSelect
        questionNumber={questionNumber}
        value={stringValue}
        onChange={(v) => onAnswerChange(questionNumber, v)}
        bank={bank}
        className={className}
      />
    ) : (
      <GapInput
        questionNumber={questionNumber}
        value={stringValue}
        onChange={(v) => onAnswerChange(questionNumber, v)}
        wordLimit={group.wordLimit}
        className={className}
      />
    );
  };

  // <768px: rasm ustida faqat raqamli belgilar, javob maydonlari esa rasm ostida
  // ro'yxat bo'lib — tor ekranda inputlar bir-birini va rasmni yopib qo'ymaydi.
  if (isMobile) {
    return (
      <div>
        <div className="relative inline-block max-w-full" style={{ border: '1px solid var(--exam-chrome-border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={group.imageUrl} alt={group.imageAlt || ''} className="block max-w-full h-auto" />
          {hotspots.map((h) => (
            <span
              key={h.questionNumber}
              aria-hidden="true"
              className="absolute -translate-x-1/2 -translate-y-1/2 min-w-6 h-6 px-1 flex items-center justify-center rounded-full text-[12px] font-bold text-white shadow-sm"
              style={{ left: `${h.x}%`, top: `${h.y}%`, background: 'var(--exam-accent)' }}
            >
              {h.questionNumber}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {hotspots.map((h) => (
            <div key={h.questionNumber}>{renderField(h.questionNumber, '!mx-0')}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block max-w-full" style={{ border: '1px solid var(--exam-chrome-border)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={group.imageUrl} alt={group.imageAlt || ''} className="block max-w-full h-auto" />
      {hotspots.map((h) => (
        // Shaffof input rasm chiziqlari ustida o'qilmaydi — shuning uchun shaffof bo'lmagan "chip".
        <div
          key={h.questionNumber}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded px-1 shadow-sm"
          style={{ left: `${h.x}%`, top: `${h.y}%`, background: 'var(--exam-bg)' }}
        >
          {renderField(h.questionNumber, '!mx-0')}
        </div>
      ))}
    </div>
  );
}
