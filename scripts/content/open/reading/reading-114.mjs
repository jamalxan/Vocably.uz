// Vocably Reading 114 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 0, label: 'NO MORE THAN THREE WORDS' };

export default {
  slug: 'vocably-reading-114',
  title: 'Reading 114: Mushrooms',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'mushroom', title: 'What Is a Mushroom?', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r114-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The word \'mushroom\' is applied only to fungi that have a stem, a cap and gills.', 'FALSE', 'Paragraph A: the word "also describes a variety of other gilled fungi, with or without stems; therefore the term is used to describe the fleshy fruiting bodies of some Ascomycota".', 'A'),
              q(2, 'In the 15th and 16th centuries the word was spelt in a number of different ways.', 'TRUE', 'Paragraph D: "During the 15th and 16th centuries, the terms mushrom, mushrum, muscheron, mousheroms, mussheron, or musserouns were used."', 'D'),
              q(3, 'The word \'toadstool\' was first used in France.', 'FALSE', 'Paragraph E: "The word toadstool appeared first in 14th-century England".', 'E'),
              q(4, 'Blue spore prints are extremely uncommon.', 'TRUE', 'Paragraph F: spore print colours include many shades "but almost never blue, green, or red".', 'F'),
              q(5, 'Professional mycologists use chemical tests more often than amateurs do.', 'NOT GIVEN', 'Paragraph G says that "Chemical tests are also used for some genera" but does not compare how often professionals and amateurs use them.', 'G'),
            ],
          },
          {
            id: 'r114-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why does a cap left gill-side-down overnight leave a pattern on the surface beneath it?', ['The gills dissolve into a fine powder.', 'Spores are released from the gills and fall onto the surface.', 'The cap absorbs moisture from the surface.', 'Liquid leaks from the edges of the gills.'], 'B', 'Paragraph F: "the basidiospores are shot off basidia and then fall between the gills in the dead air space. As a result, for most mushrooms, if the cap is cut off and placed gill-side-down overnight, a powdery impression reflecting the shape of the gills" is formed.', 'F'),
              mc(7, 'What does the writer say about traditional methods of identifying mushrooms?', ['They have been completely replaced by molecular techniques.', 'They are used only by amateurs.', 'They are still the methods most people rely on.', 'They were first developed in the Victorian era.'], 'C', 'Paragraph G: "While modern identification of mushrooms is quickly becoming molecular, the standard methods for identification are still used by most".', 'G'),
              mc(8, 'According to the passage, identifying a mushroom to species level', ['can usually be done in the field.', 'requires a specimen that has reached maturity.', 'depends on having a local field guide.', 'is only possible with chemical tests.'], 'B', 'Paragraph H: "A mushroom develops from a button stage into a mature structure, and only the latter can provide certain characteristics needed for the identification of the species."', 'H'),
              mc(9, 'What does the writer say about the order Agaricales in modern classifications?', ['All of its members produce mushroom fruit bodies.', 'It no longer includes the genus Agaricus.', 'Some of its members do not produce mushroom fruit bodies.', 'It has been combined with the Cantharellales.'], 'C', 'Paragraph I: "in modern molecularly defined classifications, not all members of the order Agaricales produce mushroom fruit bodies".', 'I'),
            ],
          },
          {
            id: 'r114-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            questions: [
              q(10, 'What is the name given to the powdery pattern that a cap leaves on paper?', ['spore print', 'a spore print'], 'Paragraph F: "The color of the powdery print, called a spore print, is useful in both classifying and identifying mushrooms."', 'F'),
              q(11, 'Which order do chanterelles belong to?', ['Cantharellales', 'the Cantharellales'], 'Paragraph I: "chanterelles are in the Cantharellales".', 'I'),
              q(12, 'In which order are the tough, leathery genera Lentinus and Panus placed?', ['Polyporales', 'the Polyporales'], 'Paragraph I: "the tough, leathery genera Lentinus and Panus are among the Polyporales".', 'I'),
              q(13, 'What kind of organism deforms a Russula or Lactarius to produce a lobster mushroom?', ['a parasitic fungus', 'parasitic fungus', 'Hypomyces lactifluorum'], 'Paragraph K: a lobster mushroom "is a fruit body of a Russula or Lactarius mushroom that has been deformed by the parasitic fungus Hypomyces lactifluorum".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
