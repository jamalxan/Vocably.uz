// Vocably Reading 26 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-26',
  title: 'Reading 26: Aspirin',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'aspirin', title: 'Aspirin: The Story of an Everyday Drug', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r26-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a danger that must be controlled during the manufacture of tablets', 'H', 'Paragraph H: factories "must control the amount of the powder that becomes airborne inside the building, because the powder-air mixture can be explosive".', 'H'),
              q(2, 'an explanation of the different parts of the drug\'s name', 'F', 'Paragraph F: "The name is ultimately a blend of the prefix" and "the common suffix for drugs near the end of the 19th century".', 'F'),
              q(3, 'figures showing how widely the drug is used around the world', 'E', 'Paragraph E: "It is one of the most widely used medications globally, with an estimated 40,000 tonnes (44,000 tons) (50 to 120 billion pills) consumed each year".', 'E'),
              q(4, 'the natural source of a substance related to aspirin', 'D', 'Paragraph D: "A precursor to aspirin found in the bark of the willow tree (genus Salix), salicin".', 'D'),
              q(5, 'groups of people for whom the drug is not advised', 'C', 'Paragraph C: "Aspirin is not recommended in the last part of pregnancy. It is not generally recommended in children with viral infections because of the risk of Reye syndrome."', 'C'),
            ],
          },
          {
            id: 'r26-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'When taken for pain or fever, aspirin usually begins to work within ______.', ['30 minutes', 'thirty minutes'], 'Paragraph B: "For pain or fever, effects typically begin within 30 minutes."', 'B'),
              q(7, 'Taking very large amounts of aspirin can cause ______ in the ears.', 'ringing', 'Paragraph C: "High doses may result in ringing in the ears."', 'C'),
              q(8, 'A chemist at Bayer first made pure, stable acetylsalicylic acid in ______.', '1897', 'Paragraph D: "Felix Hoffmann (or perhaps Arthur Eichengrün) of Bayer was the first to produce acetylsalicylic acid in a pure, stable form in 1897."', 'D'),
              q(9, 'When exposed to moisture, aspirin slowly breaks down into acetic acid and ______ acid.', 'salicylic', 'Paragraph G: "It is stable in dry air, but gradually hydrolyses in contact with moisture to acetic and salicylic acids."', 'G'),
            ],
          },
          {
            id: 'r26-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'What does the passage say about Charles Frédéric Gerhardt?', [
                'He worked for the German company Bayer.',
                'He was the first person to make acetylsalicylic acid.',
                'He sold the drug under the name Aspirin.',
                'He discovered salicin in willow bark.',
              ], 'B', 'Paragraph D: "In 1853, the chemist Charles Frédéric Gerhardt treated the medicine sodium salicylate with acetyl chloride to produce acetylsalicylic acid for the first time."', 'D'),
              mc(11, 'What happened to Bayer\'s rights to the name Aspirin?', [
                'They are still held by Bayer everywhere.',
                'They were never officially registered.',
                'They were lost or sold in many countries.',
                'They were transferred to a rival company.',
              ], 'C', 'Paragraph F: "The word Aspirin was Bayer\'s brand name; however, its rights to the trademark were lost or sold in many countries."', 'F'),
              mc(12, 'In 1993, the legal limit on aspirin dust in US workplaces', [
                'was increased.',
                'was cancelled following a court case.',
                'was reduced to 5 mg/m3.',
                'was introduced for the first time.',
              ], 'B', 'Paragraph H: OSHA set a limit in 1989, "but this was vacated by the AFL-CIO v. OSHA decision in 1993".', 'H'),
              mc(13, 'Why is a reagent containing no water preferred when aspirin is made from acetic acid?', [
                'Water can cause the aspirin to break down again.',
                'Water slows the reaction down.',
                'Water makes a catalyst necessary.',
                'Water produces an unwanted byproduct.',
              ], 'A', 'Paragraph J: "this esterification reaction is reversible and the presence of water can lead to hydrolysis of the aspirin. So, an anhydrous reagent is preferred."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
