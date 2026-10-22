// Vocably Reading 154 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-154',
  title: 'Reading 154: The Pencil',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'pencil', title: 'The Pencil: A Short History', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r154-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'the reason why the core of a pencil came to be wrongly described as lead', 'E', 'Paragraph E: "Chemistry was in its infancy, and the substance was thought to be a form of lead."', 'E'),
              q(2, 'a description of the method still used to make wood-cased pencils', 'H', 'Paragraph H: "two wooden halves were carved, a graphite stick inserted, and the halves then glued together—essentially the same method in use to this day".', 'H'),
              q(3, 'a military use of graphite that led to a mine being guarded', 'F', 'Paragraph F: graphite "could be used to line the moulds for cannonballs; the mines were taken over by the Crown and were guarded".', 'F'),
              q(4, 'a kind of pencil that can mark very smooth surfaces', 'B', 'Paragraph B: "Grease pencils have a softer, oily core that can leave marks on smooth surfaces such as glass or porcelain."', 'B'),
              q(5, 'how the hardness of a pencil core can be adjusted', 'I', 'Paragraph I: "By varying the ratio of graphite to clay, the hardness of the graphite rod could also be varied."', 'I'),
            ],
          },
          {
            id: 'r154-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How graphite became the pencil</strong></p><p>Before the pencil, the nearest drawing technique was silverpoint or leadpoint. In 1565 a large deposit of unusually pure graphite was found near the hamlet of {{q6}} in Cumbria, England; it was solid enough to be cut into {{q7}}, and it remains the only such deposit ever discovered. Because graphite is soft, the earliest pieces were wrapped in string or {{q8}} to keep them stable. England held a monopoly on pencil production until a way of reconstituting powdered graphite was found in {{q9}} in 1662. Even so, the square English pencils cut from natural graphite went on being made into the {{q10}}.</p>',
            questions: [
              q(6, null, 'Seathwaite', 'Paragraph E: "a large deposit of graphite was discovered on the approach to Grey Knotts from the hamlet of Seathwaite in Borrowdale parish, Cumbria, England".', 'E'),
              q(7, null, 'sticks', 'Paragraph E: "This particular deposit of graphite was extremely pure and solid, and it could easily be sawn into sticks."', 'E'),
              q(8, null, 'sheepskin', 'Paragraph G: "Graphite sticks were initially wrapped in string or sheepskin for stability."', 'G'),
              q(9, null, 'Germany', 'Paragraph G: "England would enjoy a monopoly on the production of pencils until a method for reconstituting graphite powder was discovered in Germany in 1662."', 'G'),
              q(10, null, '1860s', 'Paragraph G: "the distinctively square English pencils continued to be made with sticks cut from natural graphite into the 1860s".', 'G'),
            ],
          },
          {
            id: 'r154-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'According to the passage, what distinguishes a pencil from a pen?', ['A pencil is always made with graphite.', 'A pencil has a casing made of wood.', 'A pencil leaves solid material on the surface.', 'A pencil can be erased more easily.'], 'C', 'Paragraph A: pencils work "leaving a trail of solid core material that adheres to a sheet of paper or other surface" and "are distinct from pens, which dispense liquid or gel ink onto the marked surface".', 'A'),
              mc(12, 'What does the writer say about coloured pencils?', ['They are mostly used by teachers and editors.', 'They are generally seen as materials for artists.', 'They resist moisture and ultraviolet light.', 'They are easy to erase without smearing.'], 'B', 'Paragraph B: "Coloured pencils are sometimes used by teachers or editors to correct submitted texts, but are typically regarded as art supplies".', 'B'),
              mc(13, 'The word \'pencil\' originally referred to', ['a stick of lead used for writing.', 'a small piece of chalk.', 'the tail of a camel.', 'a fine brush made of animal hair.'], 'D', 'Paragraph D: the word "originally referred to an artist\'s fine brush of camel hair, also used for writing before modern lead or chalk pencils".', 'D'),
              mc(14, 'Why did France need to find its own way of making pencils?', ['A blockade stopped it importing graphite.', 'German pencils were of too poor a quality to use.', 'The French had no clay suitable for pencil cores.', 'Napoleon banned the use of English goods.'], 'A', 'Paragraph I: "France, under a naval blockade imposed by Great Britain, was unable to import the pure graphite sticks from the British Grey Knotts mines".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
