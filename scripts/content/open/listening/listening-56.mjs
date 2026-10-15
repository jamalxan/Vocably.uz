// Vocably Listening 56 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-56',
  title: 'Listening 56: Water on the Moon',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'study-water-sources-on-moon-more-widespread-than-thought',
        contextText: 'You will hear a science report about a new study of water on the moon.',
        questionGroups: [
          {
            id: 'l56-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Chandrayaan-1 mission</strong></p><ul><li>Indian spacecraft launched in October {{q1}}</li><li>2009 study: data showed molecules linked to water and a substance called {{q2}}</li><li>NASA: hydroxyl is made of one hydrogen atom and one {{q3}} atom</li><li>2009 study said most water was in large craters near the {{q4}}</li><li>new analysis: water also exists in areas that get direct {{q5}}</li></ul>',
            questions: [
              q(1, null, '2008', 'The speaker says "It launched in October 2008 and collected data while orbiting the moon for about a year."'),
              q(2, null, 'hydroxyl', 'The speaker says "The data showed the presence of molecules linked to water, as well as the substance hydroxyl."'),
              q(3, null, 'oxygen', 'The speaker says hydroxyl is "a molecule made up of one hydrogen atom and one oxygen atom".'),
              q(4, null, 'poles', 'The speaker says "most of the water probably existed in large craters near the poles where sunlight is blocked".'),
              q(5, null, 'sunlight', 'The speaker says "the research suggests water is even present in areas of the moon receiving direct sunlight".'),
            ],
          },
          {
            id: 'l56-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What was the M3 instrument designed to do on the mission?', ['measure the temperature inside craters', 'map the minerals on the surface of the moon', 'photograph the lunar poles', 'search for signs of life'], 'B', 'The speaker says "the spectrometer aimed to map the mineral composition of materials".'),
              mc(7, 'How does M3 compare with a normal digital camera?', ['It is much smaller.', 'It works without any light.', 'It can identify many more colours.', 'It takes pictures more quickly.'], 'C', 'The speaker says the instrument "can identify 85 different colors in its examinations of mineral compositions" while cameras "generally only record three colors".'),
              mc(8, 'According to Roger Clark, what brings water-rich materials to the surface of the moon?', ['cratering and volcanic activity', 'the solar wind', 'heating by sunlight', 'dust storms'], 'A', 'The speaker says "both cratering and volcanic activity can bring water-rich materials to the surface".'),
            ],
          },
          {
            id: 'l56-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(9, 'Clark says the discovery can help future ______ efforts on the moon.', 'exploration', 'The speaker says "The discovery, Clark said, can be helpful to future exploration efforts on the moon."'),
              q(10, 'Knowing where water is located helps scientists understand the geologic ______ of the moon.', 'history', 'The speaker says "Knowing where water is located not only helps to understand lunar geologic history".'),
            ],
          },
        ],
      }),
    ],
  },
};
