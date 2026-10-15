// Vocably Reading 77 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-77',
  title: 'Reading 77: The Beaver',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'beaver', title: 'The Beaver: Nature\'s Engineer', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r77-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'a genetic reason why the two living species cannot breed with each other', 'E', 'Paragraph E: "The difference in chromosome numbers prevents them from interbreeding."', 'E'),
              q(2, 'why beavers are regarded as a keystone species', 'B', 'Paragraph B: "because of their effect on other organisms in the ecosystem, beavers are considered a keystone species".', 'B'),
              q(3, 'evidence that an extinct relative of the beaver also cut wood', 'I', 'Paragraph I: "Fossils of one genus in Castoroidinae, Dipoides, have been found near piles of chewed wood".', 'I'),
              q(4, 'examples of place names that come from the word for beaver', 'D', 'Paragraph D: "Cognates of beaver are the source for several European placenames, including those of Beverley, Bièvres, Biberbach".', 'D'),
              q(5, 'how beavers first reached Eurasia', 'G', 'Paragraph G: "They originated in North America in the late Eocene and colonized Eurasia via the Bering Land Bridge in the early Oligocene".', 'G'),
            ],
          },
          {
            id: 'r77-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the writer say about young beavers?', [
                'They leave their parents at the end of their first year.',
                'They help to maintain the family\'s dams and lodges.',
                'They are raised by their mother alone.',
                'They establish territories of their own immediately.',
              ], 'B', 'Paragraph B: "After their first year, the young help their parents repair dams and lodges; older siblings may also help raise newly born offspring."', 'B'),
              mc(7, 'How have beaver populations changed over time?', [
                'They have declined steadily since the 19th century.',
                'They are now classified as endangered.',
                'They came close to extinction before being protected.',
                'They have recovered only in North America.',
              ], 'C', 'Paragraph C: "Before protections began in the 19th and early 20th centuries, overhunting had nearly exterminated both species. Their populations have since rebounded".', 'C'),
              mc(8, 'Until the 1970s, many scientists believed that', [
                'the Eurasian beaver had 40 chromosomes.',
                'Linnaeus had given the Eurasian species the wrong name.',
                'there were more than two species of beaver.',
                'the two names referred to a single species.',
              ], 'D', 'Paragraph E: "Many scientists considered both names synonymous for one same species until the 1970s, when chromosomal evidence became available confirming both as separate".', 'E'),
              mc(9, 'Which feature distinguishes the Eurasian beaver from the North American beaver?', [
                'triangular nasal cavities',
                'a wider tail',
                'darker fur',
                'a shorter skull',
              ], 'A', 'Paragraph F: the Eurasian beaver has "a more lengthened skull, triangular nasal cavities (as opposed to the square ones of the North American species), a lighter fur color, and a narrower tail".', 'F'),
            ],
          },
          {
            id: 'r77-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The evolution of beavers</strong></p><p>Beavers first appeared in North America during the late {{q10}} and later spread to Eurasia across a land bridge. One early group, the Palaeocastorinae, consisted mainly of small animals with large front legs and a flattened skull, features that suited a {{q11}} way of life. About 24 million years ago, castorids took up a semiaquatic lifestyle. An extinct relative, Dipoides, appears to have been a poorer {{q12}} than modern beavers. Researchers think that the common ancestor of modern beavers and the Castoroidinae ate {{q13}}, and that building dams and lodges grew out of this habit, enabling beavers to live through the severe {{q14}} of the subarctic.</p>',
            questions: [
              q(10, null, 'Eocene', 'Paragraph G: "They originated in North America in the late Eocene".', 'G'),
              q(11, null, ['fossorial', 'burrowing'], 'Paragraph H: "smaller animals with relatively large front legs, a flattened skull, and a reduced tail—all features of a fossorial (burrowing) lifestyle".', 'H'),
              q(12, null, 'woodcutter', 'Paragraph I: "Dipoides appears to have been an inferior woodcutter compared to Castor".', 'I'),
              q(13, null, 'bark', 'Paragraph I: "Researchers suggest that modern beavers and Castoroidinae shared a bark-eating common ancestor."', 'I'),
              q(14, null, 'winters', 'Paragraph I: "Dam and lodge-building likely developed from bark-eating, and allowed beavers to survive in the harsh winters of the subarctic."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
