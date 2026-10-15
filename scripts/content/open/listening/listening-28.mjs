// Vocably Listening 28 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-28',
  title: 'Listening 28: Methane on Mars',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'why-is-methane-gas-coming-out-of-the-ground-on-mars',
        contextText: 'You will hear a science report about a gas that has been detected on the surface of Mars.',
        questionGroups: [
          {
            id: 'l28-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Methane on Mars</strong></p><ul><li>on Earth, most methane comes from living {{q1}}</li><li>the Curiosity rover reached Mars in {{q2}}</li><li>Gale Crater is thought to have once held a {{q3}}</li><li>the ExoMars Trace Gas Orbiter is run by the {{q4}} Space Agency</li><li>methane is only observed at {{q5}}</li></ul>',
            questions: [
              q(1, null, 'creatures', 'The speaker says "On Earth, most of the gas comes from living creatures."'),
              q(2, null, '2012', 'The speaker says "The rover arrived on Mars in 2012 and has been exploring areas around Gale Crater."'),
              q(3, null, 'lake', 'The speaker says "This area is believed to have contained a lake at one time".'),
              q(4, null, 'European', 'The speaker says the spacecraft "is operated by the European Space Agency".'),
              q(5, null, 'night', 'The speaker says "the observations of methane happen only at night".'),
            ],
          },
          {
            id: 'l28-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Where do the researchers think the methane is trapped?', ['deep inside volcanic rock', 'under hardened pieces of salt in the soil', 'in underground lakes', 'inside the walls of the crater'], 'B', 'The speaker says the methane could be "trapped, or sealed, underneath hardened pieces of salt in Martian regolith".'),
              mc(7, 'What could weaken the seal and release the gas?', ['strong winds', 'warmer temperatures', 'falling air pressure', 'dust storms'], 'B', 'The speaker says "warmer temperatures could weaken the seal on the methane, causing gas to be released".'),
              mc(8, 'Why has the Perseverance rover not found methane?', ['It is exploring an area without salt.', 'It has no instrument for detecting methane.', 'It stopped working in 2017.', 'It only operates during the day.'], 'B', 'The speaker says "Perseverance is not equipped with a methane-detecting instrument".'),
            ],
          },
          {
            id: 'l28-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'In which year was the earlier experiment that gave Pavlov his idea carried out?', '2017', 'The speaker says the theory "came from his memories of an unrelated experiment carried out in 2017".'),
              q(10, 'How many samples of frozen soil did the team test?', ['5', 'five'], 'The speaker says "Pavlov\'s team tested five samples of frozen soil containing different kinds of salt material".'),
            ],
          },
        ],
      }),
    ],
  },
};
