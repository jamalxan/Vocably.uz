// Vocably Reading 110 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-110',
  title: 'Reading 110: Great Zimbabwe',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'great-zimbabwe', title: 'Great Zimbabwe: Houses of Stone', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r110-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(1, 'Great Zimbabwe became the capital of a kingdom in the ______ century.', '13th', 'Paragraph A: it "served as the capital of the Kingdom of Great Zimbabwe from the 13th century".', 'A'),
              q(2, 'The high stone walls of the Great Enclosure were put up without using any ______.', 'mortar', 'Paragraph B: "The Great Enclosure, with its 11 m (36 ft) high dry stone walls (constructed without mortar)".', 'B'),
              q(3, 'The name of the ruins was first written down in 1531 by a Portuguese ______.', 'captain', 'Paragraph F: "first recorded in 1531 by Vicente Pegado, captain of the Portuguese garrison of Sofala".', 'F'),
              q(4, 'Between the 4th and 7th centuries, farming communities in the valley also mined and worked ______.', 'iron', 'Paragraph H: communities of the Gokomere or Ziwa cultures "farmed the valley, and mined and worked iron, but built no stone structures".', 'H'),
            ],
          },
          {
            id: 'r110-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Write the correct letter, A-J.</em>',
            questions: [
              q(5, 'two possible explanations of the meaning of a word', 'G', 'Paragraph G: "There are two theories for the etymology of the name."', 'G'),
              q(6, 'a suggestion that the rise of Great Zimbabwe was connected with events elsewhere', 'J', 'Paragraph J: "Its growth has been linked to the decline of Mapungubwe from around 1300, or the greater availability of gold in the hinterland of Great Zimbabwe."', 'J'),
              q(7, 'political interference in the study of the site', 'D', 'Paragraph D: "the white government of Rhodesia pressured archaeologists to deny its construction by black Africans".', 'D'),
              q(8, 'how the ruling family spent its wealth', 'I', 'Paragraph I: "The ruling dynasty used their wealth to have houses built out of thick daga (earthen daub), rather than daga and poles, and built stone walls to shield themselves from public view."', 'I'),
            ],
          },
          {
            id: 'r110-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(9, 'Recent research suggests that the city\'s population was larger than earlier estimates.', 'FALSE', 'Paragraph A: "Earlier estimates suggest a peak population of around 20,000 people", whereas a recent study "suggests that the site\'s population did not exceed 10,000".', 'A'),
              q(10, 'Scholars agree about what the different complexes were used for.', 'FALSE', 'Paragraph B: "Scholars disagree on the functions of the complexes."', 'B'),
              q(11, 'Europeans removed objects from Great Zimbabwe in the late 19th and early 20th centuries.', 'TRUE', 'Paragraph C: "Great Zimbabwe and surrounding sites were looted by European antiquarians between the 1890s and 1920s."', 'C'),
              q(12, 'Bumbusi is the largest of the smaller zimbabwe sites.', 'NOT GIVEN', 'Paragraph E mentions sites "such as Bumbusi in Zimbabwe and Manyikeni in Mozambique" but says nothing about their relative sizes.', 'E'),
              q(13, 'The walls of the Great Enclosure run for roughly 250 metres.', 'TRUE', 'Paragraph J: the Great Enclosure "has walls as high as 11 m (36 ft) extending approximately 250 m (820 ft)".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
