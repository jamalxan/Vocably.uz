// Vocably Reading 65 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W1 = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-65',
  title: 'Reading 65: The Story of Bread',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'bread', title: 'The Story of Bread', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r65-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a description of a modern industrial method that shortens the time needed to make a loaf', 'G', 'Paragraph G: the Chorleywood process is used "to dramatically reduce the fermentation period and the time taken to produce a loaf".', 'G'),
              q(2, 'how a by-product of beer-making was used to make bread rise', 'F', 'Paragraph F: "the Gauls and Iberians used the foam skimmed from beer, called barm".', 'F'),
              q(3, 'the location of the earliest known evidence of bread-making', 'D', 'Paragraph D: "The oldest evidence of bread-making has been found in a 14,500-year-old Natufian site in Jordan\'s northeastern desert."', 'D'),
              q(4, 'why loaves made without gluten may not keep their shape', 'J', 'Paragraph J: "Since these foods lack gluten, dough made from them may not hold its shape as the loaves rise".', 'J'),
              q(5, 'a comparison between bread and a man-made packaging material', 'K', 'Paragraph K: "bread can be defined as an elastic-plastic foam (same as styrofoam)".', 'K'),
            ],
          },
          {
            id: 'r65-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The origins of bread</strong></p><p>Rocks used for pounding plants, dated to 30,000 years ago, carry traces of {{q6}}, which suggests that extracts from plant roots may once have been cooked on a hot stone into a simple flatbread. Grains became the basis of bread around 10,000 BC with the spread of {{q7}}. Because yeast spores are found everywhere, any dough that is left to rest rises naturally. Leavened bread was being baked in southern Mesopotamia by 6000 BC, and the Egyptians, who improved the method by adding {{q8}} to the flour, probably learned the technique from the {{q9}}.</p>',
            questions: [
              q(6, null, 'starch', 'Paragraph D: "revealed starch residue on rocks used for pounding plants".', 'D'),
              q(7, null, 'agriculture', 'Paragraph D: "with the dawn of the Neolithic age and the spread of agriculture, grains became the mainstay of making bread".', 'D'),
              q(8, null, 'yeast', 'Paragraph E: "The Egyptians refined the process and started adding yeast to the flour."', 'E'),
              q(9, null, 'Sumerians', 'Paragraph E: "cradle of the Sumerian civilization, who may have passed on the knowledge to the Egyptians"; "The Sumerians were already using ash".', 'E'),
            ],
          },
          {
            id: 'r65-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'All bread is made with some kind of raising agent.', 'FALSE', 'Paragraph B: "Bread may also be unleavened."', 'B'),
              q(11, 'In some parts of Asia, bread is not the main food.', 'TRUE', 'Paragraph H: "This is in contrast to parts of South and East Asia, where rice or noodles are the staple."', 'H'),
              q(12, 'Bread made from spelt is more nutritious than ordinary wheat bread.', 'NOT GIVEN', 'Paragraph I merely lists spelt among "other wheat species (including spelt, emmer, einkorn and kamut)"; it makes no comparison of nutritional value.', 'I'),
              q(13, 'Gliadin returns to its original form after being deformed.', 'FALSE', 'Paragraph K: "The gliadin protein contributes to its plastic nature, because it demonstrates non-reversible structural change"; it is glutenin that "is able to regain its initial shape after deformation".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
