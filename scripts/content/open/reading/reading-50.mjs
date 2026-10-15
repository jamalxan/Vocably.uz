// Vocably Reading 50 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-50',
  title: 'Reading 50: Sunglasses',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sunglasses', title: 'A History of Sunglasses', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r50-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'In the early twentieth century, sunglasses were sometimes called sun cheaters.', 'TRUE', 'Paragraph A: "In the early 20th century, they were also known as sun cheaters".', 'A'),
              q(2, 'Dark lenses that let UV light through can do more harm than wearing no glasses at all.', 'TRUE', 'Paragraph B: "Dark glasses that do not block UV radiation can be more damaging to the eyes than not wearing eye protection at all".', 'B'),
              q(3, 'Inuit snow goggles were made from glass.', 'FALSE', 'Paragraph C: Inuit "made and wore snow goggles of flattened walrus or caribou ivory".', 'C'),
              q(4, 'The earliest Chinese sunglasses also improved the wearer\'s eyesight.', 'FALSE', 'Paragraph D: they "offered no corrective powers but did protect the eyes from glare".', 'D'),
              q(5, 'Goldoni glasses cost more than gondola glasses.', 'NOT GIVEN', 'Paragraph F describes "goldoni glasses" and gondola glasses but says nothing about the price of either.', 'F'),
            ],
          },
          {
            id: 'r50-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 6-10) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['James Ayscough', 'Antoine Lavoisier', 'Walter Alden', 'T. Longmore', 'Jean-Marie-Théodore Fieuzal', 'Nuno Fernandes']),
            questions: [
              q(6, 'asked for eyewear to protect against the glare of snow while riding', 'F', 'Paragraph E: "Nuno Fernandes made a request for a pair of spectacles to protect the eyes while horseriding in the snow".', 'E'),
              q(7, 'was the first to call for lenses that shield the eyes from ultraviolet light', 'E', 'Paragraph K: "was the first to argue for UV protection with (yellow) shaded glasses".', 'K'),
              q(8, 'thought that coloured glass could correct problems with vision', 'A', 'Paragraph G: "Ayscough believed that blue- or green-tinted glass could correct for specific vision impairments".', 'G'),
              q(9, 'wrote about soldiers wearing protective lenses during a civil war', 'C', 'Paragraph J: a report "from 1866 by Walter Alden, who wrote of soldiers using, during the American Civil War" shell spectacles.', 'J'),
              q(10, 'is shown wearing sunglasses in one of the oldest surviving pictures of its kind', 'B', 'Paragraph H: "One of the earliest surviving depictions of a person wearing sunglasses is one from 1772 of the scientist Antoine Lavoisier".', 'H'),
            ],
          },
          {
            id: 'r50-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Period and place', 'Wearers', 'Description'], [
              ['12th century, China', 'judges', 'flat panes of smoky {{q11}}'],
              ['18th century, Venice', 'women and children', 'tinted glasses used against the glare from the {{q12}}'],
              ['late 18th century, Venice', 'the Doge and wealthy citizens', 'tinted spectacles with pieces of {{q13}} at the sides'],
              ['19th century', '{{q14}} travellers', 'tinted spectacles'],
            ], 'Early forms of eye protection'),
            questions: [
              q(11, null, 'quartz', 'Paragraph D: "made from flat panes of smoky quartz".', 'D'),
              q(12, null, ['water', 'canals'], 'Paragraph F: "to shield their eyes from the glare from the water in the canals".', 'F'),
              q(13, null, 'cloth', 'Paragraph F: "tinted pairs of spectacles with pieces of cloth as sun guards on the sides of the glasses".', 'F'),
              q(14, null, 'railway', 'Paragraph H: "tinted spectacles were worn by railway travelers".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
