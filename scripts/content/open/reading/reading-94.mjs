// Vocably Reading 94 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-94',
  title: 'Reading 94: The Escalator',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'escalator', title: 'The Moving Staircase', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r94-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of inventors and companies below. Match each statement with the correct name, <strong>A-F</strong>.<br/><strong>NB</strong> There is one name you will not need.',
            bank: bank(['Nathan Ames', 'Leamon Souder', 'Jesse W. Reno', 'George A. Wheeler', 'Charles Seeberger', 'Piat']),
            questions: [
              q(1, 'produced the earliest escalator that actually operated', 'C', 'Paragraph F: "Reno produced the first working escalator" and installed it at Coney Island in 1896.', 'F'),
              q(2, 'was granted patents for more than one spiral design', 'B', 'Paragraph E: at least four patents were issued to Souder, "including two for spiral designs".', 'E'),
              q(3, 'designed a machine from which riders had to leave the steps sideways', 'E', 'Paragraph G: on Seeberger\'s device "the passenger had to step off sideways".', 'G'),
              q(4, 'gave up the rights to a device it installed in a shop', 'F', 'Paragraph H: "the company relinquished its patent rights to the department store".', 'H'),
              q(5, 'was the first to patent an escalator, although the design was never constructed', 'A', 'Paragraph D: Ames patented his design in 1859, "even though no working model of his design was ever built".', 'D'),
            ],
          },
          {
            id: 'r94-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'An escalator that has broken down can still be used as an ordinary staircase.', 'TRUE', 'Paragraph C: "A non-functional escalator can function as a normal staircase".', 'C'),
              q(7, 'Ames specified that the steps of his revolving stairs should be made of wood.', 'FALSE', 'Paragraph D: "he had no preference for materials or potential use (he noted that steps could be upholstered or made of wood".', 'D'),
              q(8, 'Reno\'s escalator at Coney Island remained in service for several years.', 'NOT GIVEN', 'Paragraph F says the device was installed in 1896 and that "A few months later, the same prototype was used for a month-long trial period" at the Brooklyn Bridge, but does not say how long it stayed in service at Coney Island.', 'F'),
              q(9, 'The Smithsonian abandoned its plan to rebuild a historic Reno escalator for financial reasons.', 'TRUE', 'Paragraph F: "logistics and reassembly costs won out over nostalgia".', 'F'),
              q(10, 'Otis still holds the trademark on the word "escalator".', 'FALSE', 'Paragraph I: "The Otis trademark is no longer in effect."', 'I'),
            ],
          },
          {
            id: 'r94-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'At what angle did Reno\'s Coney Island device rise?', ['25 degrees', '25 degree', '25'], 'Paragraph F: the device "traveled along a 25 degree incline".', 'F'),
              q(12, 'What award did the Seeberger-Otis escalator receive in Paris in 1900?', ['first prize'], 'Paragraph G: "It won first prize at the 1900 Paris Exposition Universelle."', 'G'),
              q(13, 'Which alcoholic drink was given to nervous customers at Harrods?', ['cognac'], 'Paragraph H: "customers unnerved by the experience were revived by shopmen dispensing free smelling salts and cognac".', 'H'),
              q(14, 'What name did Westinghouse use for its own escalator?', ['Electric Stairway', 'the Electric Stairway'], 'Paragraph I: "Westinghouse called their model the Electric Stairway".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
