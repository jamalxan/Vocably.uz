// Vocably Reading 73 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-73',
  title: 'Reading 73: The Chemistry of Soap',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'soap', title: 'The Chemistry of Soap', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r73-head', type: 'matching_headings',
            instructionHtml: 'The passage has nine paragraphs, A-I. Choose the correct heading for paragraphs C, D, F, G and I from the list of headings below.',
            bank: bank([
              'How soap removes dirt and destroys germs',
              'Soaps used in machinery and in art',
              'Turning oils and fats into soap',
              'Why some soaps are hard and others are soft',
              'Adding extra fat to make soap kinder to the skin',
              'Soaps produced from tree resin',
              'The raw materials chosen for toilet soap',
              'The chemical formula of toilet soap',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'i', 'Paragraph C: "soap solubilizes particles and grime" and "soap kills microorganisms by disorganizing their membrane lipid bilayer".', 'C'),
              q(2, 'Paragraph D', 'ii', 'Paragraph D: "metallic soaps are key components of most lubricating greases and thickeners" and "Metal soaps are also included in modern artists\' oil paints formulations".', 'D'),
              q(3, 'Paragraph F', 'iii', 'Paragraph F: "The production of toilet soaps usually entails the saponification of triglycerides, which are vegetable or animal oils and fats."', 'F'),
              q(4, 'Paragraph G', 'iv', 'Paragraph G: "Sodium soaps prepared from sodium hydroxide (soda lye) are firm, whereas potassium soaps, derived from potassium hydroxide (potash lye), are softer or often liquid."', 'G'),
              q(5, 'Paragraph I', 'v', 'Paragraph I: "Superfatted soap is more skin-friendly than one without extra fat".', 'I'),
            ],
          },
          {
            id: 'r73-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Making toilet soap</strong></p><p>Toilet soap is usually produced by saponifying triglycerides, the oils and fats obtained from plants or animals. An alkaline solution, commonly known as {{q6}}, makes the fats break down into salts of fatty acids and releases {{q7}}, which is often kept in the product to make it softer. The alkali used determines the result: soaps based on sodium are firm, while those based on {{q8}} are softer or even liquid. The fats come from coconut, olive or palm oil, or from {{q9}}, the rendered fat of animals. Soap produced from pure olive oil, often called Castile soap, is well known for its particular {{q10}}.</p>',
            questions: [
              q(6, null, 'lye', 'Paragraph F: "An alkaline solution (often lye) induces saponification".', 'F'),
              q(7, null, ['glycerol', 'glycerin'], 'Paragraph F: "Glycerol (glycerin) is then liberated. The glycerin is sometimes left in the soap product as a softening agent".', 'F'),
              q(8, null, 'potassium', 'Paragraph G: "potassium soaps, derived from potassium hydroxide (potash lye), are softer or often liquid".', 'G'),
              q(9, null, 'tallow', 'Paragraph H: "Tallow, rendered fat, is the most available triglyceride from animals."', 'H'),
              q(10, null, 'mildness', 'Paragraph H: "Soap made from pure olive oil, sometimes called Castile soap or Marseille soap, is reputed for its particular mildness."', 'H'),
            ],
          },
          {
            id: 'r73-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(11, 'Micelles keep oil molecules apart from water so that they can be dissolved.', 'TRUE', 'Paragraph C: a micelle encases a lipophilic pocket "that shields the oil/fat molecules from the water, making them soluble".', 'C'),
              q(12, 'Resin soaps are a product of the textile industry.', 'FALSE', 'Paragraph E: resin soaps "are produced in the paper industry by the action of tree rosin with alkaline reagents".', 'E'),
              q(13, 'Potassium hydroxide is still obtained from plant ashes today.', 'NOT GIVEN', 'Paragraph G says only that "Historically, potassium hydroxide was extracted from the ashes of bracken or other plants" — nothing is said about how it is obtained today.', 'G'),
              q(14, 'Superfatted soap can leave the skin feeling greasy.', 'TRUE', 'Paragraph I: "Superfatted soap is more skin-friendly than one without extra fat, although it can leave a ... feel" that the writer describes as greasy.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
