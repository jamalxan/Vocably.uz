// Vocably Reading 104 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-104',
  title: 'Reading 104: The History of the Button',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'button', title: 'A Short History of the Button', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r104-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'a legal measure intended to support textile producers', 'I', 'Paragraph I: "French law, concerned with protecting the silk industry in Paris and Lyons, required buttons to be covered in silk."', 'I'),
              q(2, 'how valuable buttons were attached so that they could be taken off again', 'G', 'Paragraph G: "their shanks were pushed through the fabric and were held in place with metal strips inserted through the shank".', 'G'),
              q(3, 'a description of how clothes were closed before buttonholes existed', 'E', 'Paragraph E: "two pieces of fabric were butted together, rather than overlapped, and toggles, belts, or lacings were used".', 'E'),
              q(4, 'a reference to the use of buttons for criminal purposes', 'J', 'Paragraph J: "buttons have been one of the items in which drug smugglers have attempted to hide and transport illegal substances".', 'J'),
              q(5, 'the claim that the oldest known button was not used to fasten clothing', 'C', 'Paragraph C: "the button was originally used more as an ornament than as a fastening, the earliest known being found at Mohenjo-daro in the Indus Valley".', 'C'),
            ],
          },
          {
            id: 'r104-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Some of the earliest buttonholes are found in ______ from the Roman Empire.', 'leatherwork', 'Paragraph D: "Leatherwork from the Roman Empire incorporates some of the first buttonholes".', 'D'),
              q(7, 'Buttonholes used to close clothing first appeared in Germany in the ______ century.', '13th', 'Paragraph E: "Buttonholes to fasten clothing first appeared in 13th-century Germany."', 'E'),
              q(8, 'In the Renaissance, garments could have ______ that were removed for washing or exchanged for finer ones.', 'detachable sleeves', 'Paragraph F: buttons were used with "detachable sleeves" because "Sleeves could be switched out to be washed or to be replaced by fancier sleeves demanded by particular settings".', 'F'),
              q(9, 'Collectors refer to buttons made by individual artists as ______.', ['studio buttons', 'studios'], 'Paragraph K: "Buttons made by artists are art objects, known to button collectors as" ‘studio buttons’.', 'K'),
            ],
          },
          {
            id: 'r104-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'What does the passage say about the buttons of the Indus Valley Civilization?', ['They were made of metal.', 'They were used as decoration rather than to fasten clothes.', 'They are the oldest buttons found in China.', 'They were worn only by rulers.'], 'B', 'Paragraph C: "Buttons made from seashell were used by the Indus Valley Civilization for ornamental purposes by 2000 BC."', 'C'),
              mc(11, 'According to the passage, how may the button loop have reached Europe?', ['Viking traders brought it from China.', 'Roman soldiers introduced it with their leather bags.', 'Crusaders brought it back from the Middle East.', 'German tailors invented it in the 13th century.'], 'C', 'Paragraph E: "It has been proposed that the European Crusaders brought the innovation of the button loop back from the Middle East".', 'E'),
              mc(12, 'Why were the buttons on Renaissance women\'s clothing mostly decorative?', ['Women\'s clothes were still fastened with laces.', 'Women were not allowed to wear metal buttons.', 'Buttons were too heavy for the fabrics women wore.', 'Women\'s garments had no buttonholes until the 17th century.'], 'A', 'Paragraph F: "Women\'s fashion at this time still used lacings, and thus buttons on their clothing were generally decorative."', 'F'),
              mc(13, 'Why did fabric-covered buttons worry the button makers\' guild in England?', ['They were much more expensive to produce.', 'They were imported from France.', 'Tailors could make them from spare cloth.', 'They were banned by French law.'], 'C', 'Paragraph I: "Tailors could make fabric-covered buttons with leftover fabric, which threatened the guild of button makers."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
