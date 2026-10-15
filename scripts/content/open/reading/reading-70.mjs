// Vocably Reading 70 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-70',
  title: 'Reading 70: The Cactus',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'cactus', title: 'The Cactus: Built for Drought', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r70-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em>',
            questions: [
              q(1, 'a mention of plants that are often wrongly taken to be cacti', 'D', 'Paragraph D: spiny euphorbias "are sometimes incorrectly assumed to be cacti, although they are not".', 'D'),
              q(2, 'an explanation of why taking in carbon dioxide at night saves water', 'A', 'Paragraph A: "Because transpiration takes place during the cooler, more humid night hours, water loss is significantly reduced."', 'A'),
              q(3, 'the dimensions of the biggest and the smallest cactus species', 'B', 'Paragraph B: "The tallest free-standing cactus is Pachycereus pringlei, with a maximum recorded height of 19.2 m (63 ft), and the smallest is Blossfeldia liliputiana".', 'B'),
              q(4, 'a group of cacti whose leaves, rather than their stems, do most of the photosynthesis', 'F', 'Paragraph F: they have "long-lasting leaves that provide the main means of photosynthesis".', 'F'),
            ],
          },
          {
            id: 'r70-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'According to paragraph A, the ribs on a cactus stem allow the plant to', ['produce a larger number of flowers.', 'swell and shrink as water is taken in and used up.', 'resist being eaten by animals.', 'grow taller more quickly after rain.'], 'B', 'Paragraph A: "This allows them to expand and contract easily for quick water absorption after rain, followed by retention over long drought periods."', 'A'),
              mc(6, 'Why do many small cacti have globe-shaped stems?', ['to roll away from danger', 'to attract pollinating insects', 'to hold the most water while losing the least', 'to catch as much sunlight as possible'], 'C', 'Paragraph B: "combining the highest possible volume for water storage with the lowest possible surface area for water loss from transpiration".', 'B'),
              mc(7, 'What shows that Pereskia and its relatives are cacti despite looking like ordinary trees?', ['their spines', 'their flattened stems', 'their lack of bark', 'their areoles'], 'D', 'Paragraph B: "Their areoles identify them as cacti, and in spite of their appearance, they, too, have many adaptations for water conservation."', 'B'),
              mc(8, 'What is unusual about the two Maihuenia species?', ['They have no leaves at all.', 'Their fleshy stems do not carry out photosynthesis.', 'They are the tallest of all cacti.', 'They grow on the branches of other trees.'], 'B', 'Paragraph F: "The two species of Maihuenia have succulent but non-photosynthetic stems and prominent succulent leaves."', 'F'),
            ],
          },
          {
            id: 'r70-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How cacti are built</strong></p><p>Spines grow from areoles, which are in fact a type of greatly reduced {{q9}}; areoles also produce flowers. Most cacti have a widespread but {{q10}} root system that quickly takes up any rain. Of the 1,500 to 1,800 species, most belong to the opuntias or the cactoids, whose fleshy stems are the main organs of {{q11}} and whose leaves are small, absent or short-lived. Tree-like cacti generally have a single woody {{q12}} topped by many branches; in most species these branches have no leaves and are covered in spines. Other cacti are described as {{q13}}, with several stems rising from the ground.</p>',
            questions: [
              q(9, null, 'branch', 'Paragraph A: "specialized structures called areoles, a kind of highly reduced branch".', 'A'),
              q(10, null, 'shallow', 'Paragraph A: "an extensive but relatively shallow root system that quickly absorbs any water reaching the ground surface".', 'A'),
              q(11, null, 'photosynthesis', 'Paragraph E: "They have fleshy succulent stems that are major organs of photosynthesis."', 'E'),
              q(12, null, 'trunk', 'Paragraph G: "a single more-or-less woody trunk topped by several to many branches".', 'G'),
              q(13, null, 'shrubby', 'Paragraph G: "Cacti may also be described as shrubby, with several stems coming from the ground".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
