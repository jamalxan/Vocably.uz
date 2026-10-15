// Vocably Reading 46 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-46',
  title: 'Reading 46: The Emperor Penguin',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'emperor-penguin', title: 'The Emperor Penguin', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r46-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Male and female emperor penguins look very much alike.', 'TRUE', 'Paragraph A: "The male and female are similar in plumage and size".', 'A'),
              q(2, 'Emperor penguins can stay underwater for roughly twenty minutes while hunting.', 'TRUE', 'Paragraph B: "While hunting, the species can remain submerged around 20 minutes".', 'B'),
              q(3, 'The female keeps the egg warm while the male goes to the sea to feed.', 'FALSE', 'Paragraph C: the egg "is incubated for just over two months by the male while the female returns to the sea to feed".', 'C'),
              q(4, 'Forster travelled with Captain Cook on one of his voyages.', 'TRUE', 'Paragraph D: Johann Reinhold Forster "accompanied Captain James Cook on his second voyage".', 'D'),
              q(5, 'Female emperor penguins take longer to moult than males.', 'NOT GIVEN', 'Paragraph G says that moulting takes "only around 34 days" but makes no distinction between males and females.', 'G'),
            ],
          },
          {
            id: 'r46-ends', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-F</strong>, from the box below.',
            bank: bank([
              'depend entirely on sound to recognise one another.',
              'helps them swim faster through the water.',
              'allows it to keep working when oxygen is scarce.',
              'so that the bird loses less heat.',
              'stop captured prey from getting away.',
              'enable them to dive deeper than any other bird.',
            ]),
            questions: [
              q(6, 'The emperor penguin\'s unusual haemoglobin', 'C', 'Paragraph B: "an unusually structured haemoglobin to allow it to function at low oxygen levels".', 'B'),
              q(7, 'The backward-pointing barbs on the tongue', 'E', 'Paragraph F: "The tongue is equipped with rear-facing barbs to prevent prey from escaping when caught."', 'F'),
              q(8, 'New feathers start growing before the old ones drop out', 'D', 'Paragraph G: feathers emerge "before old feathers are lost, to help reduce heat loss".', 'G'),
              q(9, 'Because there are no fixed nesting sites, emperor penguins', 'A', 'Paragraph I: "emperor penguins must rely on vocal sounds alone for identification".', 'I'),
            ],
          },
          {
            id: 'r46-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Emperor penguin facts</strong></p><ul><li>bill is about 8 cm long; its lower part may be pink, orange or {{q10}}</li><li>newly hatched chicks weigh around {{q11}} grams</li><li>the annual moult lasts only about {{q12}} days</li><li>adults have a yearly survival rate of {{q13}}%</li><li>only {{q14}}% of chicks survive their first year</li></ul>',
            questions: [
              q(10, null, 'lilac', 'Paragraph F: "the lower mandible can be pink, orange or lilac".', 'F'),
              q(11, null, '315', 'Paragraph F: "Chicks weigh around 315 g (11.1 oz) after hatching".', 'F'),
              q(12, null, '34', 'Paragraph G: "Moulting is rapid in this species compared with other birds, taking only around 34 days."', 'G'),
              q(13, null, '95.1', 'Paragraph H: "The average yearly survival rate of an adult emperor penguin has been measured at 95.1%".', 'H'),
              q(14, null, '19', 'Paragraph H: "only 19% of chicks survive their first year of life".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
