// Vocably Reading 55 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
// Eslatma: rejadagi "desertification" manbasi yaroqsiz (A va G paragraflari aynan
// takrorlangan, E paragrafi uzuq-yuluq), shuning uchun zaxira "parachute" ishlatildi.
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-55',
  title: 'Reading 55: The Early History of the Parachute',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'parachute', title: 'Falling Safely: The Early History of the Parachute', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r55-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the writer say about the earliest recorded parachute-like jump?', [
                'It was made with a device built for the purpose.',
                'It relied on a cloak to reduce the speed of the fall.',
                'It took place in the eighteenth century.',
                'It ended in the death of the jumper.',
              ], 'B', 'Paragraph B: "Armen Firman, in Córdoba, Spain, made the first recorded jump with a large cloak to slow his fall."', 'B'),
              mc(2, 'The word parachute was invented by', [
                'Louis-Sébastien Lenormand.',
                'André Garnerin.',
                'Leonardo da Vinci.',
                'Charles Broadwick.',
              ], 'A', 'Paragraph B: "Frenchman Louis-Sébastien Lenormand made the first public jump in 1783, and he coined the term".', 'B'),
              mc(3, 'What weakness does the writer identify in the design attributed to Francesco di Giorgio Martini?', [
                'The straps were fixed in the wrong place.',
                'The canopy was conical rather than pyramidal.',
                'The canopy was too small to produce enough resistance.',
                'It had no frame to keep the canopy open.',
              ], 'C', 'Paragraph E: "the surface area of the parachute design appears to be too small to offer effective air resistance".', 'E'),
              mc(4, 'According to the passage, the test of Leonardo\'s design carried out in 2000', [
                'proved that the design could not work.',
                'was performed by a Swiss skydiver.',
                'showed that the design was workable.',
                'was repeated several times in the same year.',
              ], 'C', 'Paragraph G: "The feasibility of Leonardo\'s pyramidal design was successfully tested in 2000 by Briton Adrian Nicholas".', 'G'),
            ],
          },
          {
            id: 'r55-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 5-9) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.',
            bank: bank(['Armen Firman', 'Francesco di Giorgio Martini', 'Leonardo da Vinci', 'Faust Vrančić', 'John Wilkins', 'Lynn White', 'Charles Broadwick']),
            questions: [
              q(5, 'replaced a rigid canopy with a piece of fabric that curved outwards', 'D', 'Paragraph H: Vrančić "kept the square frame but replaced the canopy with a bulging sail-like piece of cloth".', 'H'),
              q(6, 'produced the oldest known drawing of a parachute', 'B', 'Paragraph E: "The oldest parachute design appears in a manuscript from the 1470s attributed to Francesco di Giorgio Martini".', 'E'),
              q(7, 'wrote about flight but did not mention parachutes', 'E', 'Paragraph I: "Wilkins wrote about flying, not parachutes, and does not mention Vrančić, a parachute jump, or any event in 1617".', 'I'),
              q(8, 'regarded the Renaissance designs as the true beginning of the modern parachute', 'F', 'Paragraph G: "According to historian of technology Lynn White, these conical and pyramidal designs, much more elaborate than early artistic jumps with rigid parasols in Asia, mark the origin of" the parachute as we know it.', 'G'),
              q(9, 'changed the shape of the canopy by using a square frame', 'C', 'Paragraph G: "A square wooden frame, which alters the shape of the parachute from conical to pyramidal, held open Leonardo\'s canopy."', 'G'),
            ],
          },
          {
            id: 'r55-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>From Vrančić to the modern parachute</strong></p><p>Faust Vrančić called his design Homo Volans and published a picture of it in a book on {{q10}} in 1615 or 1616. For a long time it was believed that, at the age of {{q11}}, he tested the parachute himself by jumping from a tower in Venice, but the absence of any {{q12}} suggests that this never happened. Centuries later, parachutes became essential equipment for pilots in the First World War, and after the Second World War {{q13}} took the place of silk as the main material.</p>',
            questions: [
              q(10, null, 'mechanics', 'Paragraph H: "appeared in his book on mechanics, Machinae Novae".', 'H'),
              q(11, null, '65', 'Paragraph I: "It was once widely believed that in 1617, Vrančić, then aged 65 and seriously ill, implemented his design and tested the parachute by jumping from St Mark\'s Campanile".', 'I'),
              q(12, null, 'written evidence', 'Paragraph I: "Doubts about this test, which include a lack of written evidence, suggest it never occurred".', 'I'),
              q(13, null, 'nylon', 'Paragraph C: "After World War II, parachuting became a popular sport, and new materials like nylon replaced silk."', 'C'),
            ],
          },
        ],
      }),
    ],
  },
};
