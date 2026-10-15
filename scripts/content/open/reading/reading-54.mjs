// Vocably Reading 54 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-54',
  title: 'Reading 54: The Story of the Tomato',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'tomato', title: 'The Story of the Tomato', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r54-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Galen', 'Luigi Anguillara', 'Bernardino de Sahagún', 'Hernán Cortés', 'Pietro Andrea Mattioli', 'Ira and George Gershwin']),
            questions: [
              q(1, 'used a name for a plant whose identity has never been established', 'A', 'Paragraph D: "originated with Galen, who used it to denote a plant that has never been identified".', 'D'),
              q(2, 'described the tomato as a new kind of eggplant', 'E', 'Paragraph K: "He suggested that a new type of eggplant had been brought to Italy."', 'K'),
              q(3, 'recorded the wide range of tomatoes on sale in an Aztec market', 'C', 'Paragraph J: "Bernardino de Sahagún reported seeing a great variety of tomatoes in the Aztec market at Tenochtitlán".', 'J'),
              q(4, 'wrote a song that refers to the two ways of saying the word', 'F', 'Paragraph E: "The word\'s dual pronunciations were immortalized in Ira and George Gershwin\'s 1937 song".', 'E'),
              q(5, 'proposed a link between a classical plant name and the tomato', 'B', 'Paragraph D: "Luigi Anguillara speculated in the 16th century that Galen\'s lycopersicum might be the tomato".', 'D'),
            ],
          },
          {
            id: 'r54-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Breeding tomatoes to turn an even red colour has made them taste worse.', 'TRUE', 'Paragraph B: "Modern varieties have been bred to ripen uniformly red, in a process that has impaired the fruit\'s sweetness and flavor."', 'B'),
              q(7, 'Tomato plants can withstand freezing temperatures when grown outdoors.', 'FALSE', 'Paragraph B: "Tomato plants are vines, largely annual, and vulnerable to frost, though sometimes living longer in greenhouses."', 'B'),
              q(8, 'Genetic research has established exactly when humans began to cultivate the tomato.', 'FALSE', 'Paragraph G: "the cultivated tomato originated around 7,000 years ago (5,000 BCE), with substantial uncertainty, making it unclear how humans may have been involved in the process".', 'G'),
              q(9, 'The Aztecs grew tomatoes mainly in order to sell them.', 'NOT GIVEN', 'Paragraph J says "The Aztecs raised several varieties of tomato" and that sauces were served "in city markets", but nothing is said about the main purpose of growing them.', 'J'),
              q(10, 'In most of Europe the tomato was at first grown for decoration because it was thought to be poisonous.', 'TRUE', 'Paragraph H: "Elsewhere in Europe, its first use was ornamental, not least because it was understood to be related to the nightshades and assumed to be poisonous."', 'H'),
            ],
          },
          {
            id: 'r54-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'The English name of the fruit comes, via Spanish, from a word in the ______ language.', 'Nahuatl', 'Paragraph D: "The word tomato comes from the Spanish tomate, which in turn comes from the Nahuatl word tomatl".', 'D'),
              q(12, 'Tomatoes were already being farmed in the south of Mexico by ______.', ['500 BCE', '500 BC'], 'Paragraph I: "By 500 BCE, it was already being cultivated in southern Mexico and probably other areas."', 'I'),
              q(13, 'Mattioli eventually printed an Italian name for the fruit which means ______.', ['golden apples', 'pomi d\'oro'], 'Paragraph K: "Ten years later, Mattioli named the fruits in print as pomi d\'oro, or" golden apples.', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
