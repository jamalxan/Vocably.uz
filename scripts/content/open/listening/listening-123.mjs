// Vocably Listening 123 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-123',
  title: 'Listening 123: The Many Meanings of Double',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'seeing-double',
        contextText: 'You will hear a talk about English expressions that use the word "double".',
        questionGroups: [
          {
            id: 'l123-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each expression mean? Choose the correct letter, <strong>A-F</strong>.',
            bank: bank(['serve two purposes', 'return the way you came', 'quickly', 'cheat someone', 'refuse to change your position', 'bend over with laughter']),
            questions: [
              q(1, 'on the double', 'C', 'The speaker says "we should discuss it on the double! That means quickly."'),
              q(2, 'double down', 'E', 'The speaker says "If you double down, you stick to a position or undertaking even if it is not a good one."'),
              q(3, 'double duty', 'A', 'The speaker says something that does double duty "serves two purposes".'),
              q(4, 'double back', 'B', 'The speaker says "If you double back, you turn around and come back the same way that you came."'),
            ],
          },
          {
            id: 'l123-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why did the speaker have to double-check that the woman was really her co-worker?', ['She had lost a lot of weight.', 'She had a new haircut and a tattoo.', 'She was wearing a uniform.', 'She was with a different group of people.'], 'B', 'The speaker says "She had a new haircut and a tattoo. I had to double-check if it was even her."'),
              mc(6, 'Why did the co-worker double over with laughter?', ['The speaker had got lost on a hike.', 'The speaker told her a joke.', 'The tattoo was not a permanent one.', 'The speaker did not recognize her at all.'], 'C', 'The speaker says "As it turns out, it was a temporary tattoo."'),
              mc(7, 'Which expression does the speaker describe as a betrayal?', ['double talk', 'double standard', 'double duty', 'double-cross'], 'D', 'The speaker says "A double-cross is a betrayal."'),
            ],
          },
          {
            id: 'l123-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Negative "double" words</strong></p><p>Double talk sounds meaningful but is really a mixture of sense and {{q8}}. Doublespeak is language that aims to {{q9}} people by hiding part of the truth. A double {{q10}} is a set of rules that is applied more severely to one group of people than to another, for example when an older man dating a younger woman is accepted but a woman dating a younger man is criticized.</p>',
            questions: [
              q(8, null, 'nonsense', 'The speaker says double talk "is a mixture of sense and nonsense".'),
              q(9, null, 'trick', 'The speaker says "doublespeak is language used to trick people by hiding some of the truth".'),
              q(10, null, 'standard', 'The speaker says "A double standard is a set of principles or rules that apply differently and usually more severely to one group of people than to another."'),
            ],
          },
        ],
      }),
    ],
  },
};
