// Vocably Listening 49 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

/** MC savol (ikki javob): options A-E, selectCount = javoblar soni */
const mcm = (number, promptHtml, texts, answers, explanationHtml) => ({
  number, promptHtml,
  options: texts.map((text, i) => ({ key: 'ABCDEFGH'[i], text })),
  selectCount: answers.length,
  answer: { accepted: answers },
  explanationHtml,
});

export default {
  slug: 'vocably-listening-49',
  title: 'Listening 49: Searching for Water on the Moon',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'nasa-to-launch-instrument-to-study-water-on-moon',
        contextText: 'You will hear a news report about a spacecraft that will look for water on the moon.',
        questionGroups: [
          {
            id: 'l49-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Lunar Trailblazer', 'Details'], [
              ['Launch', 'later this year or early {{q1}}'],
              ['Rocket', 'SpaceX Falcon {{q2}}'],
              ['Instruments', 'two, both using {{q3}} technology to map the moon'],
              ['Weight', 'about {{q4}} kilograms'],
              ['Orbit', 'about {{q5}} kilometres above the surface'],
            ]),
            questions: [
              q(1, null, '2025', 'The speaker says "It is set to launch later this year, or in early 2025."'),
              q(2, null, '9', 'The speaker says "A SpaceX Falcon 9 rocket will carry the orbiter to space."'),
              q(3, null, 'infrared', 'The speaker says "The two instruments use infrared technology to produce highly detailed mapped images."'),
              q(4, null, '200', 'The speaker says "Lunar Trailblazer weighs about 200 kilograms".'),
              q(5, null, '100', 'The speaker says "The spacecraft is set to orbit the moon about 100 kilometers from the lunar surface."'),
            ],
          },
          {
            id: 'l49-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, <strong>A-E</strong>.',
            questions: [
              mcm(6, 'Which TWO uses for water on the moon does the speaker mention?', ['growing food', 'drinking water', 'building shelters', 'making rocket fuel', 'powering computers'], ['B', 'D'], 'The speaker says "Astronauts could process it for drinking water, to cool equipment, to create breathable oxygen or even to make rocket fuel."'),
              mcm(7, 'Which TWO organisations built the two instruments?', ['the Jet Propulsion Laboratory', 'Lockheed Martin', 'the California Institute of Technology', 'the University of Oxford', 'Johns Hopkins University'], ['A', 'D'], 'The speaker says one instrument "was developed by the JPL" and "The other, called the Lunar Thermal Mapper, was built by a team at the University of Oxford in Britain."'),
            ],
          },
          {
            id: 'l49-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'The Lunar Thermal Mapper will produce detailed maps of surface ______.', 'temperatures', 'The speaker says "the instrument would center on producing detailed maps of lunar surface temperatures".'),
              q(9, 'The movement of water molecules may depend on how much ______ an area receives.', 'sun', 'The speaker says "Such movements can be linked to how much sun specific areas receive."'),
              q(10, 'Rachel Klima compared studying lunar ice to studying ______ on Earth.', 'glaciers', 'The speaker says "Klima compared such examinations to those involving glaciers".'),
            ],
          },
        ],
      }),
    ],
  },
};
