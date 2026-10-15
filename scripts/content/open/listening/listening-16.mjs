// Vocably Listening 16 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-16',
  title: 'Listening 16: Earth\'s Hidden Electric Field',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'nasa-rocket-confirms-existence-of-earth-s-hidden-electric-field',
        contextText: 'You will hear a science report about a rocket mission that confirmed the existence of an electric field around Earth.',
        questionGroups: [
          {
            id: 'l16-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['The Endurance rocket', ''],
              [
                ['Launch site', '{{q1}} (as close as possible to the North Pole)'],
                ['Maximum altitude', '{{q2}} kilometres'],
                ['Length of flight', '{{q3}} minutes'],
                ['Landing', 'in the sea, off the coast of {{q4}}'],
              ],
            ),
            questions: [
              q(1, null, 'Norway', 'The speaker says "Endurance launched from Norway".'),
              q(2, null, '768', 'The speaker says "Endurance reached a top altitude of 768 kilometers."'),
              q(3, null, '19', 'The speaker says the rocket captured data "during its 19-minute flight".'),
              q(4, null, 'Greenland', 'The speaker says it ended by "splashing down in the sea, off the coast of Greenland".'),
            ],
          },
          {
            id: 'l16-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Since the 1960s, what had spacecraft observed above the poles?', ['particles leaving the atmosphere and going into space', 'strong magnetic storms', 'a visible electric field', 'ice sheets melting'], 'A', 'The speaker says spacecraft "have recorded collections of particles flowing from the planet\'s atmosphere into space".'),
              mc(6, 'Apart from the electric field, which two energy fields affect Earth?', ['gravitational and magnetic', 'solar and magnetic', 'gravitational and thermal', 'nuclear and solar'], 'A', 'The speaker says "The others are gravitational and magnetic."'),
              mc(7, 'Where were the results of the mission published?', ['in the journal Nature', 'in a NASA video', 'in a newspaper', 'on a television programme'], 'A', 'The speaker says a study describing the results "recently appeared in the publication Nature".'),
            ],
          },
          {
            id: 'l16-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>What the mission measured</strong></p><p>The instrument on the rocket measured a voltage of 0.55 volts, about the same as the voltage of a {{q8}} battery. Glyn Collinson compared the field to a {{q9}} belt that lifts the atmosphere into space. Alex Glocer said the field is strong enough to push particles upwards at {{q10}} speeds.</p>',
            questions: [
              q(8, null, 'watch', 'The speaker says it is "about the same voltage used to power a watch battery".'),
              q(9, null, 'conveyor', 'The speaker says Collinson described the field as a kind of "conveyor belt that\'s lifting this atmosphere up into space".'),
              q(10, null, 'supersonic', 'The speaker quotes Glocer: "it\'s enough to launch them upwards into space at supersonic speeds".'),
            ],
          },
        ],
      }),
    ],
  },
};
