// Vocably Listening 97 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-97',
  title: 'Listening 97: Welcoming the Spring',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'vernal-equinox-marks-arrival-of-spring',
        contextText: 'You will hear a report about the spring equinox and the ways different cultures celebrate the arrival of spring.',
        questionGroups: [
          {
            id: 'l97-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'How many hours of daylight does the day of the equinox have?', ['12', 'twelve', '12 hours'], 'The speaker says "The day has 12 hours of daylight" and the same of night.'),
              q(2, 'Around which year did the Maya build their pyramid at Chichen Itza?', ['1000', '1000 A.D.', 'year 1000'], 'The speaker says "Around the year 1000 A.D., for example, the Maya built a pyramid in what is now Mexico’s Yucatan."'),
              q(3, 'What does the pyramid appear to look like when the sun hits it on the equinox?', ['snake', 'a snake'], 'The speaker says "the sunlight hits in a way that makes the structure look like a snake".'),
            ],
          },
          {
            id: 'l97-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Festival', 'Where', 'Details'], [
              ['hanami', 'Japan', 'people gather under the cherry blossoms, called {{q4}} in Japanese; in 1912 Japan gave {{q5}} cherry trees to Washington, D.C.'],
              ['Nowruz', 'Central Asia and the Middle East', 'the name means "new {{q6}}" in Farsi; Iranian families display {{q7}} special items'],
              ['Holi', 'India and Nepal', 'also known as the festival of colors or the festival of {{q8}}'],
            ], 'Spring festivals'),
            questions: [
              q(4, null, 'sakura', 'The speaker says people "enjoy the cherry blossoms, known as sakura in Japanese".'),
              q(5, null, ['3,000', '3000'], 'The speaker says "Japan gave 3,000 cherry trees to the U.S. capital city of Washington".'),
              q(6, null, 'day', 'The speaker says "The words now and ruz mean new day in Farsi."'),
              q(7, null, ['seven', '7'], 'The speaker says "Iranian families set up a haft seen display of seven special items".'),
              q(8, null, 'love', 'The speaker says Holi is "known also as the festival of colors or the festival of love".'),
            ],
          },
          {
            id: 'l97-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'What are the Las Fallas statues in Valencia made of?', ['stone and metal', 'wood, paper and plastic', 'cloth and straw', 'ice and snow'], 'B', 'The speaker says the festival centers on "huge colorful statues made of wood, paper and plastic".'),
              mc(10, 'What happens at midnight on March 19?', ['A parade passes through the city.', 'The bullfights begin.', 'The streetlights go off and the statues are burned.', 'A beauty competition is held.'], 'C', 'The speaker says "the city turns off all its streetlights and the statues are set on fire".'),
            ],
          },
        ],
      }),
    ],
  },
};
