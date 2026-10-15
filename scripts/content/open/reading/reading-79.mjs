// Vocably Reading 79 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-79',
  title: 'Reading 79: Lichens',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'lichen', title: 'Lichens: Partnerships in Miniature', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r79-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The idea of symbiosis entered biology through the study of lichens.', 'TRUE', 'Paragraph A: "Lichens are the lifeform that first brought the term symbiosis (as Symbiotismus) into biological context."', 'A'),
              q(2, 'The terms macrolichen and microlichen describe how large a lichen is.', 'FALSE', 'Paragraph C: the words macro and micro "do not refer to size, but to the growth form".', 'C'),
              q(3, 'Lichens that grow on plants take nourishment from them.', 'FALSE', 'Paragraph C: "When they grow on plants, they do not live as parasites, but instead use the plant\'s surface as a substrate."', 'C'),
              q(4, 'Some lichens are able to live within solid rock.', 'TRUE', 'Paragraph D: "They can even live inside solid rock, growing between the grains (endolithic)."', 'D'),
              q(5, 'Lichens grow more quickly in warm climates than in cold ones.', 'NOT GIVEN', 'Paragraph E mentions "the long life-span and slow and regular growth rate of some species" but makes no comparison between warm and cold climates.', 'E'),
            ],
          },
          {
            id: 'r79-endings', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-F</strong>, below.',
            bank: bank([
              'they absorb water and nutrients through roots, like plants.',
              'it is normally the most visible part of the organism.',
              'they are not closely related to mosses or to any other plant.',
              'their colour becomes more dramatic when they are wet.',
              'some species grow slowly and at a steady rate.',
              'only their reproductive parts are visible outside the rock.',
            ]),
            questions: [
              q(6, 'Lichens are classified according to their thallus because', 'B', 'Paragraph G: "Lichens are grouped by thallus type, since the thallus is usually the most visually prominent part of the lichen."', 'G'),
              q(7, 'Names such as "reindeer moss" are misleading because', 'C', 'Paragraph C: lichens "may superficially look like and grow with mosses, but they are not closely related to mosses or any plant".', 'C'),
              q(8, 'Lichens can be used to date past events because', 'E', 'Paragraph E: "The long life-span and slow and regular growth rate of some species can be used to date events (lichenometry)."', 'E'),
              q(9, 'Endolithic lichens can be hard to notice because', 'F', 'Paragraph J: "Some lichens can grow inside solid rock between the grains (endolithic lichens), with only the sexual fruiting part visible growing outside the rock."', 'J'),
            ],
          },
          {
            id: 'r79-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Approximately how many species of lichen have been identified?', ['20,000', '20000'], 'Paragraph E: "There are about 20,000 known species."', 'E'),
              q(11, 'From which ancient language does the English word lichen originally come?', 'Greek', 'Paragraph F: "The English word lichen derives from the Greek" word leichēn, via Latin.', 'F'),
              q(12, 'What name is given to the separate pieces formed when the centre of an old crustose lichen cracks?', 'areolas', 'Paragraph H: the island-like pieces "separated by the cracks are called areolas".', 'H'),
              q(13, 'Which kind of lichen can look leafy when it has dried out?', ['gelatinous', 'gelatinous lichens'], 'Paragraph I: "Gelatinous lichens may appear leafy when dry."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
