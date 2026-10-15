// Vocably Reading 99 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-99',
  title: 'Reading 99: Ötzi the Iceman',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'otzi', title: 'Ötzi: The Man from the Ice', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r99-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'the reason researchers believe Ötzi died a violent death', 'B', 'Paragraph B: "Because of the presence of an arrowhead embedded in his left shoulder and various other wounds, researchers believe that Ötzi was killed by another person."', 'B'),
              q(2, 'how an expert\'s reaction to a tool hinted at the true age of the remains', 'D', 'Paragraph D: "After seeing a drawing of the axe, Messner suggested that the remains might be much older than first thought."', 'D'),
              q(3, 'a description of how evidence was lost before it could be documented', 'E', 'Paragraph E: "Fragile objects were stepped on and others were removed before their locations had been recorded".', 'E'),
              q(4, 'the outcome of a survey carried out to establish which country the body was in', 'G', 'Paragraph G: "an official survey placed the find site 92.56 metres (101.22 yd) inside Italy, in South Tyrol".', 'G'),
              q(5, 'injuries to the body caused by the equipment used to free it', 'J', 'Paragraph J: "A pneumatic drill damaged his hip".', 'J'),
            ],
          },
          {
            id: 'r99-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'What nationality were the two people who found Ötzi?', ['German'], 'Paragraph C: Ötzi was discovered "by German tourists Helmut and Erika Simon".', 'C'),
              q(7, 'What did the finders at first assume Ötzi had been?', ['a mountaineer', 'mountaineer'], 'Paragraph C: "At first, Ötzi was thought to be a mountaineer who had recently died."', 'C'),
              q(8, 'What was the long wooden object found near the body later found to be?', ['a bow', 'bow'], 'Paragraph F: "a long wooden object nearby was later identified as a bow".', 'F'),
              q(9, 'How long was Ötzi\'s mummified body?', ['1.54 m', '1.54m', '1.54 metres', '1.54 meters', 'about 1.54 m'], 'Paragraph H: "his mummified body measured about 1.54 m (5 ft 1 in) in length".', 'H'),
            ],
          },
          {
            id: 'r99-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'An archaeologist supervised the removal of the body from the ice.', 'FALSE', 'Paragraph F: "No archaeologist was present."', 'F'),
              q(11, 'The border agreed in 1919 was meant to follow the line of the Alpine watershed.', 'TRUE', 'Paragraph G: the border "was intended to follow the Alpine watershed".', 'G'),
              q(12, 'Ötzi\'s internal organs had been lost during his time in the ice.', 'FALSE', 'Paragraph H: "His tissues, bones and internal organs were well preserved".', 'H'),
              q(13, 'All of Ötzi\'s fingernails were recovered in later excavations.', 'FALSE', 'Paragraph I: "one fingernail and two toenails were recovered during later excavations".', 'I'),
              q(14, 'The fungus that grew on Ötzi\'s skin caused lasting damage to the body.', 'NOT GIVEN', 'Paragraph K says only that "Fungus also began growing on his skin while he was at the mortuary" and that scientists then worked to stabilize the mummy; it does not say whether the fungus caused lasting damage.', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
