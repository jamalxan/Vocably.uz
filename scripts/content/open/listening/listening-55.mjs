// Vocably Listening 55 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-55',
  title: 'Listening 55: Pay Cuts for a Better Life',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'study-us-workers-would-take-pay-cuts-for-improved-quality-of-life',
        contextText: 'You will hear a news report about a survey of workers who would accept lower pay for a better quality of life.',
        questionGroups: [
          {
            id: 'l55-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What proportion of US workers would accept a 20 percent pay cut for a better quality of life?', ['about a quarter', 'just over half', 'about three quarters', 'nearly all of them'], 'B', 'The speaker says just over half "would be willing to take a 20 percent pay cut in exchange for a better quality of life".'),
              mc(2, 'Lynn Bufka works as a', ['job advisor.', 'clinical psychologist.', 'company manager.', 'university professor.'], 'B', 'The speaker says "Lynn Bufka is a clinical psychologist with ties to the American Psychological Association".'),
              mc(3, 'Julia Toothacre is a', ['psychologist.', 'job advisor.', 'survey researcher.', 'car company executive.'], 'B', 'The speaker says "She is a job advisor at ResumeBuilder.com."'),
            ],
          },
          {
            id: 'l55-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Generation', 'Ages', 'Would take the pay cut'], [
              ['Millennials', '27 to 42', '{{q4}} percent'],
              ['Generation Z', '18 up to {{q5}}', '56 percent'],
              ['Generation X', '43 to 59', '{{q6}} percent'],
              ['Baby Boomers', '{{q7}} to 78', '33 percent'],
            ], 'Survey results'),
            questions: [
              q(4, null, ['60', 'sixty'], 'The speaker says sixty percent of millennials "said they would accept less money for a better work-life balance".'),
              q(5, null, '26', 'The speaker says "Fifty-six percent of Generation Z adults, people aged 18 up to 26, said the same thing."'),
              q(6, null, '45', 'The speaker says "45 percent of Generation X" would take the pay cut.'),
              q(7, null, ['60', 'sixty'], 'The speaker says "only 33 percent of Baby Boomers, those aged 60 to 78, would do the same".'),
            ],
          },
          {
            id: 'l55-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'The survey was carried out by the ______ Motor Company.', 'Ford', 'The speaker says "The survey was carried out by Ford Motor Company".'),
              q(9, 'It included online interviews with adults in ______ countries.', '16', 'The speaker says the survey included "online interviews with adults in 16 countries".'),
              q(10, '______ percent of those surveyed believed a balanced life was more important than a higher-paying job.', ['77', 'seventy-seven'], 'The speaker says "Seventy-seven percent of those surveyed say they believed a balanced life was more important than a higher-paying position at work."'),
            ],
          },
        ],
      }),
    ],
  },
};
