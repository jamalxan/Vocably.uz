// Vocably Listening 140 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-140',
  title: 'Listening 140: Wave Expressions',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'learn-some-wave-expressions',
        contextText: 'You will hear a talk about English expressions and phrasal verbs that use the word "wave".',
        questionGroups: [
          {
            id: 'l140-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'In the example, why do people say the woman "rode the wave"?', ['She had many years of political experience.', 'She belonged to a famous political family.', 'She was an expert surfer.', 'She won the election by a large margin.'], 'B', 'The speaker says "After she wins, many people say she rode the wave of her family\'s fame."'),
              mc(2, 'What does "catching the wave" mean?', ['missing a good opportunity', 'being in the right place at the right time', 'causing problems for other people', 'stopping a vehicle'], 'B', 'The speaker says "If you catch the wave, you also take advantage of an opportunity. You are at the right place at the right time."'),
              mc(3, 'Why is it a bad idea to make waves when you start a new job?', ['Nobody will notice you.', 'You will be promoted too quickly.', 'You create trouble and interfere with normal business.', 'Your colleagues will copy you.'], 'C', 'The speaker says "When you make waves you create trouble and interfere with usual business operations."'),
            ],
          },
          {
            id: 'l140-verbs', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each phrasal verb mean? Choose the correct letter, <strong>A-F</strong>.',
            bank: bank(['signal to someone to keep moving, or encourage them', 'cancel, dismiss or refuse something', 'signal to someone or something to stop', 'direct or dismiss, depending on the situation', 'greet someone from a distance', 'ask someone for help']),
            questions: [
              q(4, 'wave someone on', 'A', 'The speaker says "Waving someone on is the same thing as giving them a sign to keep moving." and "Waving someone on can also mean to encourage someone."'),
              q(5, 'wave someone off', 'B', 'The speaker says "if you wave something or someone off, you cancel, dismiss, or refuse them".'),
              q(6, 'wave someone down', 'C', 'The speaker says "To wave down someone or something is also a signal to stop."'),
              q(7, 'wave someone aside', 'D', 'The speaker says "if you wave something or someone aside you are either directing them or dismissing them. It depends on the situation."'),
            ],
          },
          {
            id: 'l140-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The concert</strong></p><ul><li>the band was riding the wave of an earlier rock and roll band</li><li>the venue was outside and had no {{q8}} around it, so people without tickets sneaked in</li><li>security guards waved ticket-holders aside to a different {{q9}}</li><li>after the concert the speaker waved down a {{q10}} to go home</li></ul>',
            questions: [
              q(8, null, 'barrier', 'The speaker says "It was outside and did not have a barrier around it."'),
              q(9, null, 'entrance', 'The speaker says "the security guards had to wave ticket-holders aside to a different entrance".'),
              q(10, null, 'taxi', 'The speaker says "I immediately waved down a taxi to go home."'),
            ],
          },
        ],
      }),
    ],
  },
};
