// Vocably Reading 64 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-64',
  title: 'Reading 64: The Seahorse',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'seahorse', title: 'The Seahorse', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r64-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Fossil seahorses are plentiful and well documented.', 'FALSE', 'Paragraph B: "The fossil record of seahorses, however, is very sparse."', 'B'),
              q(2, 'No other fish studied so far has a genome that changes as quickly as the seahorse\'s.', 'TRUE', 'Paragraph C: a 2016 study "found the seahorse genome to be the most rapidly evolving fish genome studied so far".', 'C'),
              q(3, 'Every seahorse species has the same number of bony rings.', 'FALSE', 'Paragraph E: "Each species has a distinct number of rings."', 'E'),
              q(4, 'The dwarf seahorse is at risk of extinction.', 'NOT GIVEN', 'Paragraph F describes "H. zosterae (the dwarf seahorse)" only as the slowest-moving fish; nothing is said about its conservation status.', 'F'),
              q(5, 'In the Mediterranean species, females cover a far larger area than males.', 'TRUE', 'Paragraph I: "males stay within 1 m2 (10 sq ft) of habitat, while females range over about one hundred times that".', 'I'),
            ],
          },
          {
            id: 'r64-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Feature', 'Details'],
              [
                ['Body covering', 'no scales; thin skin over bony {{q6}} arranged in rings'],
                ['Ribs', 'absent, because of the outer {{q7}}'],
                ['Swimming', 'upright, driven by the {{q8}} fin; pectoral fins used for steering'],
                ['Speed of the dwarf seahorse', 'maximum of about {{q9}} metres per hour'],
                ['Eyes', 'can move independently, like those of a {{q10}}'],
              ],
              'Seahorse anatomy and movement'
            ),
            questions: [
              q(6, null, 'plates', 'Paragraph E: "thin skin stretched over a series of bony plates, which are arranged in rings".', 'E'),
              q(7, null, 'skeleton', 'Paragraph E: "because of this outer skeleton, they no longer have ribs".', 'E'),
              q(8, null, 'dorsal', 'Paragraph E: "propelling themselves using the dorsal fin".', 'E'),
              q(9, null, '1.5', 'Paragraph F: "with a top speed of about 1.5 m (5 ft) per hour".', 'F'),
              q(10, null, 'chameleon', 'Paragraph F: "their eyes can move independently of each other like those of a chameleon".', 'F'),
            ],
          },
          {
            id: 'r64-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'According to paragraph C, why might seahorses have developed an upright posture?', ['to swim faster than their pipefish relatives', 'to hide among seagrass in newly formed shallow seas', 'to survive in deep ocean water', 'to make the crossing of the Atlantic easier'], 'B', 'Paragraph C: "seagrass habitats that served as camouflage for the seahorses\' upright posture".', 'C'),
              mc(12, 'Why do seahorses have to feed almost continuously?', ['They swim too slowly to catch much food.', 'Their prey contains very little energy.', 'Their digestive system has no stomach.', 'They lose heat quickly in cold water.'], 'C', 'Paragraph J: "extremely simple digestive systems that lack a stomach, so they must eat constantly to stay alive".', 'J'),
              mc(13, 'What did one study conclude about the shape of the seahorse\'s head?', ['It allows the animal to see in all directions.', 'It frightens away larger predators.', 'It helps the seahorse to swim upright.', 'It lets the seahorse get close to prey without disturbing the water much.'], 'D', 'Paragraph J: "their distinctive head morphology gave them a hydrodynamic advantage by minimizing interference while approaching evasive prey".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
