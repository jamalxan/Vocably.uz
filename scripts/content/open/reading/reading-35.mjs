// Vocably Reading 35 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-35',
  title: 'Reading 35: The Discovery of X-rays',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'x-ray', title: 'The Discovery of X-rays', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r35-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of scientists below. Match each statement with the correct person or people, <strong>A-G</strong>.',
            bank: bank(['William Morgan', 'Philipp Lenard', 'Hermann von Helmholtz', 'William Jennings and Arthur Goodspeed', 'Fernando Sanford', 'Nikola Tesla', 'Wilhelm Röntgen']),
            questions: [
              q(1, 'developed a mathematical theory of X-rays without ever experimenting with them', 'C', 'Paragraph F: Helmholtz "formulated mathematical equations for X-rays" but "he did not work with actual X-rays".', 'F'),
              q(2, 'is thought to have produced X-rays as early as the eighteenth century', 'A', 'Paragraph D: "The earliest experimenter thought to have (unknowingly) produced X-rays was William Morgan. In 1785, he presented a paper to the Royal Society of London".', 'D'),
              q(3, 'took an X-ray photograph by accident and only recognised it several years later', 'D', 'Paragraph G: "Only in 1896 they realized that they accidentally made an X-ray photograph".', 'G'),
              q(4, 'began an investigation after noticing that photographic film had been spoiled', 'F', 'Paragraph I: Tesla "noticed damaged film in his lab that seemed to be associated with Crookes tube experiments and began investigating this invisible, radiant energy".', 'I'),
              q(5, 'fitted a tube with a thin metal window so that rays could pass out of it', 'B', 'Paragraph E: Lenard built a Crookes tube with a window "at the end made of thin aluminium, facing the cathode so the cathode rays would strike it".', 'E'),
            ],
          },
          {
            id: 'r35-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Stage', 'Detail'], [
              ['8 November 1895', 'discovers X-rays while working with Lenard tubes and {{q6}} tubes'],
              ['28 December 1895', 'submits his first {{q7}} on the rays to a journal in Würzburg'],
              ['Reconstruction of the discovery', 'covers the tube in black {{q8}} so that its light cannot interfere'],
              ['', 'sees a faint green glow on a screen roughly {{q9}} from the tube'],
            ], 'Röntgen and the X-ray'),
            questions: [
              q(6, null, 'Crookes', 'Paragraph J: "discovered X-rays while experimenting with Lenard tubes and Crookes tubes".', 'J'),
              q(7, null, ['report', 'paper'], 'Paragraph J: "He wrote an initial report" and "This was the first paper written on X-rays."', 'J'),
              q(8, null, 'cardboard', 'Paragraph K: "a Crookes tube which he had wrapped in black cardboard so that the visible light from the tube would not interfere".', 'K'),
              q(9, null, ['1 meter', 'one meter', '1 metre', '1 m'], 'Paragraph K: "He noticed a faint green glow from the screen, about 1 meter (3.3 ft) away."', 'K'),
            ],
          },
          {
            id: 'r35-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'X-rays have a longer wavelength than ultraviolet light.', 'FALSE', 'Paragraph A: X-rays have "a wavelength shorter than those of ultraviolet rays and longer than those of gamma rays".', 'A'),
              q(11, 'Public health bodies regulate the production and use of X-rays.', 'TRUE', 'Paragraph B: "Their generation and use is strictly controlled by public health authorities."', 'B'),
              q(12, 'Crookes tubes operated at voltages of up to 100 kV.', 'TRUE', 'Paragraph C: "a high DC voltage of anywhere between a few kilovolts and 100 kV".', 'C'),
              q(13, 'Sanford\'s newspaper article attracted wide public interest.', 'NOT GIVEN', 'Paragraph H says an article "appeared in the San Francisco Examiner" but says nothing about how the public reacted to it.', 'H'),
              q(14, 'Röntgen\'s own laboratory notes allow historians to reconstruct his discovery precisely.', 'FALSE', 'Paragraph K: "There are conflicting accounts of his discovery because Röntgen had his lab notes burned after his death".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
