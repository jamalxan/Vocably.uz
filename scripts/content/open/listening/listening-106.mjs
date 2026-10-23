// Vocably Listening 106 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-106',
  title: 'Listening 106: Sleep Expressions for Solving Problems',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'solving-problems-with-sleep-expressions',
        contextText: 'You will hear a talk about English sleep expressions that are connected with solving problems.',
        questionGroups: [
          {
            id: 'l106-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'When camping, people may sleep on the ground or on a ______.', 'cot', 'The speaker says "When we go camping, we sleep on the ground, or we sleep on a cot."'),
              q(2, 'To sleep on something means to give yourself time to consider a problem ______.', 'overnight', 'The speaker says "To sleep on something means you give yourself time to think about a problem overnight."'),
              q(3, 'Even if you are not actively thinking, your ______ may be working on the problem.', 'subconscious', 'The speaker says "Your subconscious may be working on it."'),
              q(4, 'Sleep is necessary for staying healthy, both mentally and ______.', 'physically', 'The speaker says "We know that sleep is necessary to be healthy, both mentally and physically."'),
            ],
          },
          {
            id: 'l106-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why do the co-workers in the example decide to sleep on their problem?', ['It is very late in the day.', 'They are not making any progress.', 'Their manager tells them to stop.', 'They have already found a solution.'], 'B', 'One of them says "Look, we\'re not getting anywhere. So, let\'s sleep on it."'),
              mc(6, 'What kind of problems are "nothing to lose sleep over"?', ['very serious ones', 'unimportant ones', 'ones that cannot be solved', 'ones connected with work'], 'B', 'The speaker says "Some problems are not a big deal — they are not important."'),
              mc(7, 'How many units will the new apartment building have?', ['10', '50', '100', '1,000'], 'C', 'Mark says "It\'s going to have 100 units!"'),
              mc(8, 'According to Mark, what will the new building mean for the neighbourhood?', ['more parking spaces', 'fewer people', 'more people and less parking', 'higher rents'], 'C', 'Mark says "It will mean a lot MORE people and a lot LESS parking."'),
            ],
          },
          {
            id: 'l106-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Which of the two friends is upset about the new apartment building?', 'Mark', 'The speaker says "If you said Mark, you are right!"'),
              q(10, 'What might be at stake in the serious problems described by the last expression?', ['life', 'your life'], 'The speaker says "we talk about serious problems – problems in which your life might be at stake".'),
            ],
          },
        ],
      }),
    ],
  },
};
