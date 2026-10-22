// Vocably Reading 135 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-135',
  title: 'Reading 135: The Daguerreotype',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'daguerreotype', title: 'Images on Silver: The Daguerreotype', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r135-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'Why had the daguerreotype largely disappeared by 1856?', ['It was banned for health reasons.', 'Cheaper processes produced images that were easier to view.', 'Daguerre stopped licensing his method.', 'Photographers preferred paper negatives.'], 'B', 'Paragraph A: "the daguerreotype was almost completely superseded by 1856 with new, less expensive processes, such as the ambrotype (collodion process), that yield more readily viewable images".', 'A'),
              mc(2, 'What determined how long a plate was exposed in the camera?', ['The thickness of the silver plating.', 'The temperature of the mercury.', 'The amount of light on the subject.', 'The size of the protective case.'], 'C', 'Paragraph B: the exposure "could be as little as a few seconds for brightly sunlit subjects or much longer with less intense lighting".', 'B'),
              mc(3, 'What does the writer say about the darkest parts of a daguerreotype image?', ['They have a fine light-scattering texture.', 'They are simply areas of plain silver.', 'They are caused by tarnish.', 'They appear only when a dark background is reflected.'], 'B', 'Paragraph C: "The darkest areas of the image are simply bare silver".', 'C'),
              mc(4, 'Why are other old photographs often wrongly identified as daguerreotypes?', ['They were made by the same photographers.', 'They have a similar mirror-like surface.', 'They are sometimes kept in the same kind of decorated case.', 'They were produced in the same decade.'], 'C', 'Paragraph D: "especially if they are in the small, ornamented cases in which daguerreotypes made in the US and the UK were usually housed".', 'D'),
            ],
          },
          {
            id: 'r135-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 5-9) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Albertus Magnus', 'Johann Heinrich Schulze', 'Thomas Wedgwood', 'Nicéphore Niépce', 'Hippolyte Bayard', 'Louis Daguerre']),
            questions: [
              q(5, 'made the first reliably recorded attempt to fix the image of a camera obscura', 'C', 'Paragraph H: "The first reliably documented attempt to capture the image formed in a camera obscura was made by Thomas Wedgwood as early as the 1790s".', 'H'),
              q(6, 'was advised to delay announcing a paper-based process', 'E', 'Paragraph F: "Hippolyte Bayard had been persuaded by François Arago to wait before making his paper process public."', 'F'),
              q(7, 'developed a process that relied on bitumen', 'D', 'Paragraph G: "Joseph Niépce\'s bitumen-based heliography in 1822".', 'G'),
              q(8, 'experimented with a mixture of silver and chalk', 'B', 'Paragraph G: "a silver and chalk mixture by Johann Heinrich Schulze in 1724".', 'G'),
              q(9, 'acquired a camera obscura in connection with painting stage scenery', 'F', 'Paragraph J: "Louis Daguerre, when obtaining a camera obscura for his work on theatrical scene painting from the optician Chevalier".', 'J'),
            ],
          },
          {
            id: 'r135-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            questions: [
              q(10, 'Before it was fumed with mercury, the exposed plate carried an invisible, or ______, image.', 'latent', 'Paragraph B: "made the resulting latent image on it visible by fuming it with mercury vapor".', 'B'),
              q(11, 'Even very gentle ______ can leave permanent marks on the surface of a daguerreotype.', 'wiping', 'Paragraph C: "even the lightest wiping can permanently scuff it".', 'C'),
              q(12, 'With a camera obscura, artists could work out problems of ______ and parallax.', 'perspective', 'Paragraph E: "use the optical image as a basis for solving the problems of perspective and parallax".', 'E'),
              q(13, 'To protect their secrets, Daguerre and Niépce wrote to each other using a ______.', 'numerical code', 'Paragraph K: "they used a numerical code for security".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
