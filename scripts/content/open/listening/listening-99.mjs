// Vocably Listening 99 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-99',
  title: 'Listening 99: The National Arab Orchestra',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'american-orchestra-shares-arabic-music-culture',
        contextText: 'You will hear a report about an American orchestra that performs and teaches Arabic music.',
        questionGroups: [
          {
            id: 'l99-form', type: 'form_completion', wordLimit: W1,
            instructionHtml: 'Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>National Arab Orchestra (NAO) – fact sheet</strong></p><ul><li>Founder and director: Michael Ibrahim</li><li>Based in the state of: {{q1}}</li><li>Country where Ibrahim spent a year as a boy: {{q2}}</li><li>Instrument his father played: the {{q3}}</li><li>Year the group began as a student orchestra: {{q4}}</li><li>Number of events in the 2022-2023 season: {{q5}}</li></ul>',
            questions: [
              q(1, null, 'Michigan', 'The speaker says "The group is based in the state of Michigan."'),
              q(2, null, 'Syria', 'The speaker says "When he was 10, he spent a year living in Syria with his family."'),
              q(3, null, 'oud', 'The speaker says "he learned to play the oud, a stringed instrument his father played".'),
              q(4, null, '2009', 'The speaker says "The NAO started in 2009 as a student musical group at the University of Michigan".'),
              q(5, null, ['12', 'twelve'], 'The speaker says "the orchestra played together at 12 events".'),
            ],
          },
          {
            id: 'l99-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Where does much of the orchestra\'s music come from?', ['Morocco and Tunisia', 'Egypt, Lebanon, Israel and Syria', 'Iraq and Jordan', 'Saudi Arabia and Yemen'], 'B', 'The speaker says "much of the music they play comes from Egypt, Lebanon, Israel, and Syria".'),
              mc(7, 'What gives the orchestra\'s music its strong rhythmic feel?', ['the oud and the buzuq', 'the qanun', 'hand drums and tambourines', 'the singers'], 'C', 'The speaker says the musicians play "different kinds of hand drums and tambourines" and "This gives the music a strong rhythmic feel."'),
              mc(8, 'How long can it take Ibrahim to arrange a piece of music?', ['two days to two weeks', 'two weeks to two months', 'two months to a year', 'more than a year'], 'B', 'The speaker says "this can take him anywhere from two weeks to two months to finish".'),
            ],
          },
          {
            id: 'l99-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Public support</strong></p><p>In January the NAO concert in Washington, D.C. sold out in under three {{q9}}, and about 1,100 people came. According to Sherri Richards, the orchestra has more than 400,000 followers on {{q10}}, more than any other orchestra in the world.</p>',
            questions: [
              q(9, null, 'hours', 'The speaker says the concert "sold out in less than three hours".'),
              q(10, null, 'YouTube', 'Richards says "We have over 400,000 followers on YouTube, which is more than any other orchestra in the world".'),
            ],
          },
        ],
      }),
    ],
  },
};
