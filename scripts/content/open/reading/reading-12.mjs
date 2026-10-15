// Vocably Reading 12 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-12',
  title: 'Reading 12: The Venus Flytrap',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'venus-flytrap', title: 'The Venus Flytrap', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r12-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'In the wild, the Venus flytrap grows in just two American states.', 'TRUE', 'Paragraph A: "a carnivorous plant native to the temperate and subtropical wetlands of North Carolina and South Carolina".', 'A'),
              q(2, 'The trap shuts completely the moment a single hair is touched.', 'FALSE', 'Paragraph A: "the trap prepares to close, only fully enclosing the prey if a second hair is contacted within (approximately) twenty seconds of the first contact".', 'A'),
              q(3, 'The plant starts to digest its prey as soon as the trap has closed.', 'FALSE', 'Paragraph B: "the plant will only begin digestion after five more stimuli are activated".', 'B'),
              q(4, 'There are now more Venus flytraps in cultivation than in the wild.', 'NOT GIVEN', 'Paragraph C says the plant is "widely cultivated for sale" and that the wild population "has been rapidly declining", but it does not compare the two numbers.', 'C'),
              q(5, 'John Ellis thought the name "tippitywichit" came from a Native American language.', 'TRUE', 'Paragraph E: "John Ellis, who gave the plant its scientific name in 1768, wrote that the plant name tippitywichit was an indigenous word from either Cherokee or Catawba".', 'E'),
            ],
          },
          {
            id: 'r12-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the passage, the plant waits for a second touch in order to', [
                'give the insect time to move further into the trap.',
                'avoid wasting energy on things it cannot digest.',
                'check that the prey is large enough to be worth eating.',
                'allow the heat sensor to measure the temperature.',
              ], 'B', 'Paragraph B: the repeated triggering "serves as a safeguard against energy loss and to avoid trapping objects with no nutritional value".', 'B'),
              mc(7, 'What does the passage say about the species name <em>muscipula</em>?', [
                'It was chosen because the plant looks like a mouse.',
                'It comes from the name of a Greek goddess.',
                'It can be understood as either "mousetrap" or "flytrap".',
                'It was first used by Arthur Dobbs.',
              ], 'C', 'Paragraph D: "the species name, muscipula, is Latin for both" mousetrap and flytrap.', 'D'),
              mc(8, 'Arthur Dobbs\'s letters to Peter Collinson are important because they', [
                'contain the first detailed European record of the plant.',
                'gave the plant its scientific name.',
                'were published in The London Magazine.',
                'were later sent on to Carl Linnaeus.',
              ], 'A', 'Paragraph H: "This was the first detailed recorded notice of the plant by Europeans."', 'H'),
              mc(9, 'What does the passage say about flytraps with more than seven leaves?', [
                'They are produced only after the plant has flowered.',
                'They are groups of plants that have split below the soil.',
                'They grow from an unusually long stem.',
                'They are found only in cultivated plants.',
              ], 'B', 'Paragraph I: "Flytraps that have more than seven leaves are colonies formed by rosettes that have divided beneath the ground."', 'I'),
            ],
          },
          {
            id: 'r12-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The flytrap\'s closest relatives are the waterwheel plant and the ______.', 'sundews', 'Paragraph A: "It is closely related to the waterwheel plant (Aldrovanda vesiculosa) and the cosmopolitan sundews (Drosera)".', 'A'),
              q(11, 'Dobbs observed that the plant grew at latitude 34 but not at latitude ______.', '35', 'Paragraph F: "It grows in Latitude 34 but not in 35."', 'F'),
              q(12, 'In September 1768 Ellis suggested the plant\'s English name in a letter to ______.', ['Carl Linnaeus', 'Linnaeus'], 'Paragraph H: "his letter to Carl Linnaeus on 23 September 1768, in which he described the plant and proposed its English name".', 'H'),
              q(13, 'The leaves grow from a short underground stem that is really a kind of ______.', 'bulb', 'Paragraph I: "a short subterranean stem that is actually a bulb-like object".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
