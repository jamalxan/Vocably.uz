// Vocably Listening 15 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-15',
  title: 'Listening 15: A Once-in-a-Lifetime Star Explosion',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'nasa-nova-explosion-to-be-once-in-lifetime-event-in-night-sky',
        contextText: 'You will hear a science report about a star explosion that astronomers expect to see in the night sky.',
        questionGroups: [
          {
            id: 'l15-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What usually happens to a star after a nova?', ['It goes back to its normal state.', 'It is completely destroyed.', 'It turns into a red giant.', 'It splits into two stars.'], 'A', 'The speaker says "such stars usually return to their normal state after experiencing a nova event".'),
              mc(2, 'The Northern Crown is another name for', ['a constellation.', 'a binary star.', 'a white dwarf.', 'a telescope.'], 'A', 'The speaker says the binary system is "in the constellation Corona Borealis, also known as the Northern Crown".'),
              mc(3, 'How far away is the constellation?', ['about 3,000 light years', 'about 9.5 light years', 'about 80 light years', 'about 1,866 light years'], 'A', 'The speaker says "This constellation is about 3,000 light years from Earth."'),
            ],
          },
          {
            id: 'l15-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>How the nova happens</strong></p><p>The red giant releases large amounts of {{q4}}.</p><p>↓</p><p>Pressure and {{q5}} build up on the white dwarf.</p><p>↓</p><p>A thermonuclear {{q6}} blasts away the material the white dwarf has collected.</p><p>↓</p><p>Unlike in a supernova, the white dwarf stays {{q7}} after the event.</p>',
            questions: [
              q(4, null, 'hydrogen', 'The speaker says "A red giant forms when a star releases large amounts of hydrogen at its center."'),
              q(5, null, 'heat', 'The speaker says the release of hydrogen "causes a heavy buildup of pressure and heat on the white dwarf".'),
              q(6, null, 'explosion', 'The speaker says such buildup can cause a "thermonuclear explosion" and "large enough to blast away the material the white dwarf had collected".'),
              q(7, null, 'active', 'The speaker says "In a nova, the white dwarf remains active after the event."'),
            ],
          },
          {
            id: 'l15-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'On average, how often does a nova repeat?', ['80 years', '80'], 'The speaker says "novas appear to repeat, on average, about every 80 years".'),
              q(9, 'In which year was the nova first discovered?', '1866', 'The speaker says "The event was first discovered by Irish astronomer John Birmingham in 1866".'),
              q(10, 'In which US state is the Goddard Space Flight Center?', 'Maryland', 'The speaker says Rebekah Hounsell works at "Goddard Space Flight Center in Maryland".'),
            ],
          },
        ],
      }),
    ],
  },
};
