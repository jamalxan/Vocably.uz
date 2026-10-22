// Vocably Reading 148 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-148',
  title: 'Reading 148: Machu Picchu',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'machu-picchu', title: 'Machu Picchu', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r148-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs B, F, H, I and J from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Where the site is located',
              'A famous site whose purpose is not confirmed by written records',
              'Official recognition and visitor numbers',
              'What the site may originally have been called',
              'Why the estate was built and why it was given up',
              'The people who lived and worked at the estate',
              'Evidence of animals brought in from elsewhere',
              'How the stones were cut and transported',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: "it is believed to have served as an estate for the Inca emperor Pachacuti, though no contemporary written records exist to confirm this".', 'B'),
              q(2, 'Paragraph F', 'iv', 'Paragraph F: "the original name given to the settlement by its builders is not definitively known" and a 2021 study "suggests that the site was likely called" Huayna Picchu or simply Picchu.', 'F'),
              q(3, 'Paragraph H', 'v', 'Paragraph H: "Pachacutec ordered the construction of the royal estate after his conquest of the middle and lower Urubamba" and "it was used for 80 years before being abandoned, seemingly because of the Spanish conquests".', 'H'),
              q(4, 'Paragraph I', 'vi', 'Paragraph I: "it is estimated that about 750 people lived there, with most serving as support staff (yanaconas) who lived there permanently".', 'I'),
              q(5, 'Paragraph J', 'vii', 'Paragraph J: "Animals are also suspected to have been brought to Machu Picchu, as there were several bones found that were not native to the area."', 'J'),
            ],
          },
          {
            id: 'r148-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Approximately how far is Machu Picchu from Cusco?', ['80 kilometers', '80 kilometres', '80 km', '80', '50 miles'], 'Paragraph A: "about 80 kilometers (50 miles) northwest of Cusco".', 'A'),
              q(7, 'Which Peruvian explorer reached the site before Hiram Bingham?', ['Agustín Lizárraga', 'Lizárraga', 'Agustin Lizarraga', 'Lizarraga'], 'Paragraph C: "reached in the early 20th century by the Peruvian explorer Agustín Lizárraga".', 'C'),
              q(8, 'What does the Quechua word pikchu refer to?', ['summit', 'peak', 'pyramid', 'a summit', 'a peak'], 'Paragraph E: "pikchu refers to a \'summit\', \'peak\', or \'pyramid\'".', 'E'),
              q(9, 'How many radiocarbon measurements did Richard Burger\'s team report?', '26', 'Paragraph G: "reporting 26 AMS radiocarbon measurements from human remains".', 'G'),
            ],
          },
          {
            id: 'r148-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Machu Picchu was deserted about a hundred years after it was built.', 'TRUE', 'Paragraph B: "The site was abandoned roughly a century later, likely during the Spanish conquest."', 'B'),
              q(11, 'Ownership of the estate passed from Pachacutec to his successors.', 'FALSE', 'Paragraph H: "it would not have been passed down in the line of succession".', 'H'),
              q(12, 'Fewer people stayed at the site during the winter months.', 'TRUE', 'Paragraph I: "During winter, which was usually the harsher season, staffing was reduced to a few hundred servants".', 'I'),
              q(13, 'The dogs found at the site had been killed as sacrifices.', 'NOT GIVEN', 'Paragraph J says the dogs are "believed that they served as companions of the dead" because of where they were placed, but nothing is said about how they died.', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
