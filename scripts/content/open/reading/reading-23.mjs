// Vocably Reading 23 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-23',
  title: 'Reading 23: Lithium-ion Batteries',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'lithium-ion-battery', title: 'The Battery That Powers Modern Life', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r23-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The price of Li-ion batteries fell by a factor of ten in the three decades after they went on sale.', 'TRUE', 'Paragraph A: "In the three decades since Li-ion batteries were first sold in 1991, their volumetric energy density increased threefold while their cost dropped tenfold."', 'A'),
              q(2, 'In late 2024, the world was unable to produce as many Li-ion batteries as were needed.', 'FALSE', 'Paragraph A: "global demand passed 1 terawatt-hour per year, while production capacity was more than twice that".', 'A'),
              q(3, 'Li-ion batteries are made in a small number of standard sizes.', 'FALSE', 'Paragraph B: "Li-ion battery sizes are generally not standardised" and "they come in various and unique form factors depending on device and vendor".', 'B'),
              q(4, 'Most of the world\'s lithium is mined in South America.', 'NOT GIVEN', 'Paragraph D says only that lithium mining is "water intensive in often arid regions"; no country or continent is mentioned.', 'D'),
              q(5, 'Researchers are working on a type of Li-ion battery that contains no flammable electrolyte.', 'TRUE', 'Paragraph D: "Lithium-ion solid-state batteries are being developed to eliminate the flammable electrolyte."', 'D'),
            ],
          },
          {
            id: 'r23-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Look at the following statements (Questions 6-10) and the list of scientists below. Match each statement with the correct person, <strong>A-D</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bank: bank(['M. Stanley Whittingham', 'John Goodenough', 'Akira Yoshino', 'Yoshio Nishi']),
            questions: [
              q(6, 'He led the team that brought the battery to market.', 'D', 'Paragraph C: "commercialized by a Sony and Asahi Kasei team led by Yoshio Nishi in 1991".', 'C'),
              q(7, 'He built a battery in which the anode was not made of lithium metal.', 'C', 'Paragraph C: "The first prototype of the modern Li-ion battery, which uses a carbonaceous anode rather than lithium metal, was developed by Akira Yoshino in 1985".', 'C'),
              q(8, 'He introduced a new cathode material in 1980.', 'B', 'Paragraph C: "John Goodenough expanded on this work in 1980 by using lithium cobalt oxide as a cathode."', 'C'),
              q(9, 'He produced a rechargeable battery that was never sold because it was unsafe.', 'A', 'Paragraph C: Whittingham "created the first rechargeable lithium-ion battery" which "suffered from safety problems and was never commercialized".', 'C'),
              q(10, 'He first had the idea of electrodes based on intercalation.', 'A', 'Paragraph C: "M. Stanley Whittingham conceived intercalation electrodes in the 1970s".', 'C'),
            ],
          },
          {
            id: 'r23-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How a lithium-ion cell works</strong></p><p>In every commercial Li-ion cell, the active materials are {{q11}} compounds. The negative electrode is normally made of graphite, often with some {{q12}} added to give it a greater capacity. When the cell discharges, electrons travel from the anode to the cathode through the external {{q13}}, while lithium ions pass through the electrolyte, which does not itself take part in the reaction. During charging the process runs in reverse, and the electrical energy supplied from outside is stored in the cell as {{q14}} energy.</p>',
            questions: [
              q(11, null, 'intercalation', 'Paragraph F: "All commercial Li-ion cells use intercalation compounds as active materials."', 'F'),
              q(12, null, 'silicon', 'Paragraph F: "The negative electrode is usually graphite, although silicon is often mixed in to increase the capacity."', 'F'),
              q(13, null, 'circuit', 'Paragraph G: "electrons flow from the anode to the cathode through the external circuit".', 'G'),
              q(14, null, 'chemical', 'Paragraph H: "This energy is then stored as chemical energy in the cell".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
