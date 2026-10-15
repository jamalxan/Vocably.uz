// Vocably Reading 80 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-80',
  title: 'Reading 80: Salt',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'salt', title: 'Salt: A Mineral That Shaped Civilisation', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r80-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              q(1, 'the maximum daily amount of salt that a health body advises adults to eat', 'D', 'Paragraph D: "The World Health Organization recommends that adults consume less than 2,000 mg of sodium, equivalent to 5 grams of salt, per day."', 'D'),
              q(2, 'an account of salt being used against a defeated city which is probably untrue', 'G', 'Paragraph G: the story of Carthage being sowed with salt, "although this story is now considered to be entirely apocryphal".', 'G'),
              q(3, 'why people whose diet is based on crops need to add salt to their food', 'F', 'Paragraph F: "agriculturalists, feeding mainly on cereals and vegetable matter, need to supplement their diet with salt".', 'F'),
              q(4, 'an example of salt products being exchanged for goods from another country', 'H', 'Paragraph H: "the Egyptians began exporting salt fish to the Phoenicians in return for Lebanon cedar, glass, and the dye Tyrian purple".', 'H'),
            ],
          },
          {
            id: 'r80-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Salt production and use today</strong></p><p>Salt is obtained from mines and by evaporating seawater or spring water in {{q5}} pools. Most of the roughly 300 million tonnes produced each year is used not for food but as a raw material for making {{q6}}, including caustic soda and chlorine. Salt is also used to treat water, to remove ice from {{q7}}, and in agriculture. Table salt generally contains a substance that stops it forming lumps, and it may have {{q8}} added to it to prevent a dietary deficiency. Although sodium is essential for health, eating too much salt raises the risk of {{q9}} disease.</p>',
            questions: [
              q(5, null, 'shallow', 'Paragraph C: "by the evaporation of seawater (sea salt) and mineral-rich spring water in shallow pools".', 'C'),
              q(6, null, 'chemicals', 'Paragraph C: "The greatest single use for salt (sodium chloride) is as a feedstock for the production of chemicals."', 'C'),
              q(7, null, 'highways', 'Paragraph C: "Other uses include water conditioning processes, de-icing highways, and agricultural use."', 'C'),
              q(8, null, 'iodine', 'Paragraph C: "Table salt usually contains an anti-caking agent and may be iodised to prevent iodine deficiency."', 'C'),
              q(9, null, 'cardiovascular', 'Paragraph D: "excessive salt consumption increases the risk of cardiovascular diseases such as hypertension".', 'D'),
            ],
          },
          {
            id: 'r80-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'According to the passage, what happened in El Paso in the late 1860s?', [
                'A new salt mine was opened.',
                'A conflict broke out over salt.',
                'A tax on salt was abolished.',
                'A salt road was constructed.',
              ], 'B', 'Paragraph B: the need for salt has led nations "to go to war over it and use it to raise tax revenues, for instance triggering the El Paso Salt War which took place in El Paso in the late 1860s".', 'B'),
              mc(11, 'What does the writer say about Solnitsata?', [
                'It was the first salt mine in Asia.',
                'It was located beside a salt spring in Romania.',
                'It was abandoned during the Neolithic period.',
                'It may have been the earliest city in Europe.',
              ], 'D', 'Paragraph E: "What is now thought to have been the first city in Europe is Solnitsata, in Bulgaria, which was a salt mine".', 'E'),
              mc(12, 'What effect may salt production have had at Poiana Slatinei?', [
                'It caused the population of the community to grow quickly.',
                'It caused the salt spring to run dry.',
                'It attracted traders from China.',
                'It replaced meat as the main source of food.',
              ], 'A', 'Paragraph E: "The salt extracted from this operation may have directly correlated with the rapid growth of this society\'s population soon after production began."', 'E'),
              mc(13, 'In the ancient Middle East, salt was used to', [
                'pay soldiers.',
                'preserve the bodies of the dead.',
                'confirm agreements.',
                'mark the boundaries of territory.',
              ], 'C', 'Paragraph F: "In the Middle East, salt was used to seal an agreement ceremonially, and the ancient Hebrews made a" covenant of salt with God.', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
