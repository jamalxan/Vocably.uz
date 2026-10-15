// Vocably Listening 37 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-37',
  title: 'Listening 37: Your Own Immersion Programme',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'create-an-english-language-immersion-experience',
        contextText: 'You will hear a talk about how to create an English immersion programme at home.',
        questionGroups: [
          {
            id: 'l37-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Creating an immersion programme</strong></p><p>Step 1: find out your ability {{q1}} – take a free {{q2}} test, then repeat it later</p><p>↓</p><p>Step 2: choose materials slightly above your level – e.g. the VOA site has three levels: Beginner, {{q3}} and Advanced</p><p>↓</p><p>Step 3: vary your practice – avoid doing the {{q4}} thing every day</p><p>↓</p><p>Step 4: make new {{q5}} and have fun</p>',
            questions: [
              q(1, null, 'level', 'The speaker says "It is best to know your ability level to create your immersion program."'),
              q(2, null, 'online', 'The speaker says "You can test yourself with a free online language test".'),
              q(3, null, 'Intermediate', 'The speaker says "there are three levels: Beginner, Intermediate, and Advanced".'),
              q(4, null, 'same', 'The speaker says "Try to avoid doing the same thing each day."'),
              q(5, null, 'friends', 'The speaker says "you will probably find new friends".'),
            ],
          },
          {
            id: 'l37-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does an immersion situation force a learner to do?', ['study grammar every morning', 'use the new language all day', 'travel to another country', 'take an exam every week'], 'B', 'The speaker says the immersion situation "forces the learner to use the new language throughout the day".'),
              mc(7, 'What does the VOA English Challenge test give you?', ['a certificate', 'a list of reading materials', 'a score on the CEFR scale', 'a free online course'], 'C', 'The speaker says "The VOA English Challenge test on our website will give you a score" on the CEFR scale.'),
              mc(8, 'Why should you take a break from time to time?', ['to let your brain rest', 'to watch television in English', 'to check your test results', 'to meet your conversation club'], 'A', 'The speaker says "take a break now and then to rest your brain".'),
            ],
          },
          {
            id: 'l37-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Which VOA series is suggested for learners moving up from the Intermediate level?', ['American Stories'], 'The speaker says "try choosing readings from our Advanced level, such as American Stories".'),
              q(10, 'Who could you invite to join your immersion programme?', ['friend', 'a friend', 'family member'], 'The speaker suggests "inviting a friend or family member to join you".'),
            ],
          },
        ],
      }),
    ],
  },
};
