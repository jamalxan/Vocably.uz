'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';
import GapInput from '../GapInput';
import GapSelect from '../GapSelect';

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

  if (!group.imageUrl) return null;

  return (
    <div className="relative inline-block max-w-full" style={{ border: '1px solid var(--exam-chrome-border)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={group.imageUrl} alt={group.imageAlt || ''} className="block max-w-full h-auto" />
      {hotspots.map((h) => {
        const value = answers[`q${h.questionNumber}`];
        const stringValue = typeof value === 'string' ? value : '';
        return (
          <div key={h.questionNumber} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
            {bank ? (
              <GapSelect questionNumber={h.questionNumber} value={stringValue} onChange={(v) => onAnswerChange(h.questionNumber, v)} bank={bank} />
            ) : (
              <GapInput
                questionNumber={h.questionNumber}
                value={stringValue}
                onChange={(v) => onAnswerChange(h.questionNumber, v)}
                wordLimit={group.wordLimit}
                className="!mx-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
