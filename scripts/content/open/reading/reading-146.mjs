// Vocably Reading 146 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-146',
  title: 'Reading 146: Porcelain',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'porcelain', title: 'Porcelain', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r146-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'the origin of the English word for porcelain', 'C', 'Paragraph C: "The European name, porcelain in English, comes from the old Italian porcellana (cowrie shell) because of its resemblance to the surface of the shell."', 'C'),
              q(2, 'a reference to the absence of an agreed definition of the term', 'D', 'Paragraph D: the term porcelain "lacks a universal definition".', 'D'),
              q(3, 'a change of ingredients that allowed firing at a lower heat', 'F', 'Paragraph F: "the alabaster was replaced by feldspar and quartz, allowing the pieces to be fired at lower temperatures".', 'F'),
              q(4, 'why early European imitations of Chinese porcelain were costly to make', 'G', 'Paragraph G: "As these early formulations suffered from high pyroplastic deformation, or slumping in the kiln at high temperatures, they were uneconomic to produce and of low quality."', 'G'),
              q(5, 'a theory about the beginnings of bone china that experts now reject', 'I', 'Paragraph I: "One writer has speculated that a misunderstanding of the text could possibly have been responsible for the first attempts to use bone-ash as an ingredient in English porcelain, although this is not supported by modern researchers and historians."', 'I'),
            ],
          },
          {
            id: 'r146-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Hard-paste porcelain in Europe</strong></p><p>The first porcelain made in Europe came from the {{q6}} factory at the start of the 18th century. It was produced from a paste of kaolin and {{q7}}, fired at up to 1,400 °C in a kiln heated by {{q8}}, and the result was extremely hard, strong and translucent. The recipe was later altered so that the pieces could be fired at lower temperatures. Today the basic ingredients of most continental European hard-paste porcelains are kaolinite, feldspar and {{q9}} or another form of silica.</p>',
            questions: [
              q(6, null, 'Meissen', 'Paragraph F: "The earliest European porcelains were produced at the Meissen factory in the early 18th century".', 'F'),
              q(7, null, 'alabaster', 'Paragraph F: "they were formed from a paste composed of kaolin and alabaster".', 'F'),
              q(8, null, 'wood', 'Paragraph F: "fired at temperatures up to 1,400 °C (2,552 °F) in a wood-fired kiln".', 'F'),
              q(9, null, 'quartz', 'Paragraph F: "Kaolinite, feldspar, and quartz (or other forms of silica) continue to constitute the basic ingredients for most continental European hard-paste porcelains."', 'F'),
            ],
          },
          {
            id: 'r146-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Porcelain is more difficult to make than earthenware or stoneware.', 'TRUE', 'Paragraph B: the process is similar to that for earthenware and stoneware, "although it can be more challenging to produce".', 'B'),
              q(11, 'Porcelain was first brought into English-speaking countries in the 16th century.', 'FALSE', 'Paragraph C: "it was first seen in imports from China during the 17th century".', 'C'),
              q(12, 'Soft-paste porcelain was first made in France.', 'NOT GIVEN', 'Paragraph G says only that soft-paste porcelains "date back to early attempts by European potters to replicate Chinese porcelain"; no country is named.', 'G'),
              q(13, 'Bone china is still produced only in England.', 'FALSE', 'Paragraph I: "bone china is now made worldwide, including in China".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
