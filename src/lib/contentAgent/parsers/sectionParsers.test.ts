import { describe, it, expect } from 'vitest';
import { normalizeListeningParts, normalizeWritingTasks, normalizeSpeakingSection } from './sectionParsers';

// Bu testlarning ko'pi HAQIQIY model javoblaridan olingan shakllarni
// qoplaydi (2026-09-24 smoke-test): sxemani majburlamaydigan provayder
// javobni "yassilashtirib" yuboradi va avvalgi kodda natija jimgina BO'SH
// bo'lib qolardi.
describe('normalizeListeningParts', () => {
  it("to'g'ri shaklni o'zgartirmasdan o'giradi", () => {
    const { parts, needsReview } = normalizeListeningParts(
      {
        parts: [
          {
            order: 1,
            contextText: 'You will hear a conversation',
            questionGroups: [
              {
                type: 'form_completion',
                instruction: 'Complete the form',
                stemHtml: 'Name: {{q1}}',
                questions: [{ number: 1, accepted: ['Marsden'] }],
              },
            ],
          },
        ],
      },
      't1'
    );
    expect(parts[0].questionGroups[0].type).toBe('form_completion');
    expect(parts[0].questionGroups[0].questions[0].answer.accepted).toEqual(['Marsden']);
    expect(needsReview).toHaveLength(0);
  });

  it('qisqartirilgan tur nomini kanonik turga o\'giradi ("form" -> "form_completion")', () => {
    const { parts, needsReview } = normalizeListeningParts(
      { parts: [{ order: 1, questionGroups: [{ type: 'form', instruction: '', questions: [{ number: 1, accepted: ['x'] }] }] }] },
      't1'
    );
    expect(parts[0].questionGroups[0].type).toBe('form_completion');
    expect(needsReview).toHaveLength(0);
  });

  it("guruh darajasidagi `accepted`dan savollarni {{qN}} bo'yicha tiklaydi", () => {
    const { parts, needsReview } = normalizeListeningParts(
      {
        parts: [
          {
            order: 1,
            questionGroups: [
              {
                type: 'form',
                instruction: '',
                stemHtml: 'Name: Helen {{q1}}<br>Address: 42 {{q2}} Road<br>Type: {{q3}}<br>Fee: {{q4}}',
                accepted: [['Marsden'], ['Chapel'], ['family'], ['£28']],
              } as any,
            ],
          },
        ],
      },
      't1'
    );
    const questions = parts[0].questionGroups[0].questions;
    expect(questions.map((q) => q.number)).toEqual([1, 2, 3, 4]);
    expect(questions[3].answer.accepted).toEqual(['£28']);
    // Tiklangan bo'lsa ham admin ko'rib chiqishi kerak.
    expect(needsReview.some((r) => r.reason.includes('tiklandi'))).toBe(true);
  });

  it("noma'lum turni short_answer'ga zaxiralaydi va tekshiruvga yuboradi", () => {
    const { parts, needsReview } = normalizeListeningParts(
      { parts: [{ order: 1, questionGroups: [{ type: 'map_label', instruction: '', questions: [{ number: 1, accepted: ['A'] }] }] }] },
      't1'
    );
    expect(parts[0].questionGroups[0].type).toBe('short_answer');
    expect(needsReview[0].type).toBe('map_label');
  });

  it("`accepted` string bo'lib kelsa ham massivga o'giradi", () => {
    const { parts } = normalizeListeningParts(
      { parts: [{ order: 1, questionGroups: [{ type: 'short_answer', instruction: '', questions: [{ number: 1, accepted: 'blue folder' as any }] }] }] },
      't1'
    );
    expect(parts[0].questionGroups[0].questions[0].answer.accepted).toEqual(['blue folder']);
  });

  it("part order yo'q bo'lsa tartib bo'yicha to'ldiradi", () => {
    const { parts } = normalizeListeningParts({ parts: [{ questionGroups: [] } as any, { questionGroups: [] } as any] }, 't1');
    expect(parts.map((p) => p.order)).toEqual([1, 2]);
  });
});

describe('normalizeWritingTasks', () => {
  it('minWords/recommendedMin qiymatlarini order bo\'yicha qat\'iy belgilaydi', () => {
    const tasks = normalizeWritingTasks({
      tasks: [
        { order: 1, promptText: 'Chart', hasVisual: true },
        { order: 2, minWords: 999, promptText: 'Essay' },
      ],
    });
    expect(tasks[0]).toMatchObject({ order: 1, minWords: 150, recommendedMin: 20, hasVisual: true });
    expect(tasks[1]).toMatchObject({ order: 2, minWords: 250, recommendedMin: 40 });
  });

  it('HTML belgilarini ekranlaydi', () => {
    const tasks = normalizeWritingTasks({ tasks: [{ order: 1, promptText: 'a < b & c' }] });
    expect(tasks[0].promptHtml).toBe('<p>a &lt; b &amp; c</p>');
  });
});

describe('normalizeSpeakingSection', () => {
  it("bo'sh qiymatlarni tashlaydi va cue card vaqtlarini to'ldiradi", () => {
    const speaking = normalizeSpeakingSection({
      part1Questions: ['Where do you live?', ''],
      part2CueCard: { topic: 'A place', bulletPoints: ['where it is', ''] },
      part3Questions: ['Why parks?'],
    });
    expect(speaking.part1Questions).toEqual(['Where do you live?']);
    expect(speaking.part2CueCard.bulletPoints).toEqual(['where it is']);
    expect(speaking.part2CueCard.prepSec).toBe(60);
    expect(speaking.part2CueCard.speakSec).toBe(120);
  });
});
