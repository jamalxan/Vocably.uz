// Vocably Reading 147 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-147',
  title: 'Reading 147: Cloud Seeding',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'cloud-seeding', title: 'Cloud Seeding', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r147-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(1, 'As well as increasing rain or snow, cloud seeding may be used to reduce hail or to clear ______.', 'fog', 'Paragraph A: cloud seeding "aims to change the amount or type of precipitation, mitigate hail, or disperse fog".', 'A'),
              q(2, 'Hygroscopic substances such as ______ are becoming more popular because they draw in moisture.', 'table salt', 'Paragraph B: "hygroscopic materials like table salt gaining popularity due to their ability to attract moisture".', 'B'),
              q(3, 'Dynamic seeding is intended to boost the growth of convective clouds by releasing ______.', 'latent heat', 'Paragraph B: "dynamic seeding, designed to enhance convective cloud development through the release of latent heat".', 'B'),
              q(4, 'Liquid propane can form ice crystals at ______ temperatures than silver iodide can.', 'higher', 'Paragraph E: liquid propane "can produce ice crystals at higher temperatures than silver iodide".', 'E'),
            ],
          },
          {
            id: 'r147-orgs', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 5-9) and the list of organisations below. Match each statement with the correct organisation, <strong>A-F</strong>.',
            bank: bank(['United Arab Emirates', 'University of Geneva', 'US Government Accountability Office', 'US National Academy of Sciences', 'Wyoming Weather Modification Pilot Project', 'US National Research Council']),
            questions: [
              q(5, 'has operated drones that give an electric charge to the air', 'A', 'Paragraph G: "the United Arab Emirates have been using drones equipped with a payload of electric-charge emission instruments and customized sensors that fly at low altitudes and deliver an electric charge to air molecules".', 'G'),
              q(6, 'fired laser pulses into the air above a European capital', 'B', 'Paragraph H: "infrared laser pulses were directed to the air above Berlin by researchers from the University of Geneva".', 'H'),
              q(7, 'issued a report in December 2024 noting mixed findings on effectiveness', 'C', 'Paragraph I: "studies offering mixed results on its impact on precipitation enhancement, according to a report issued by the US Government Accountability Office in December 2024".', 'I'),
              q(8, 'estimated that seeding could add at most 3% to the snowpack of a season', 'E', 'Paragraph J: the WWMPP study concluded that seeding "could augment the snowpack by a maximum of 3% over an entire season".', 'J'),
              q(9, 'stated in 2003 that acceptable scientific proof of significant effects was still lacking', 'F', 'Paragraph K: "In 2003, the US National Research Council (NRC) released a report stating" that "scientifically acceptable proof for significant seeding effects has not been achieved".', 'K'),
            ],
          },
          {
            id: 'r147-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Cloud seeding is sometimes carried out in order to stop precipitation falling on later days.', 'TRUE', 'Paragraph A: "either for its own sake or to prevent precipitation from occurring in days afterward".', 'A'),
              q(11, 'Scientists agree that cloud seeding works.', 'FALSE', 'Paragraph C: "cloud seeding\'s effectiveness remains a subject of debate among scientists, with studies offering mixed results".', 'C'),
              q(12, 'The first cloud-seeding experiments were carried out in the United States.', 'NOT GIVEN', 'Paragraph D mentions "initial experiments dating back to the 1940s" but does not say where they took place.', 'D'),
              q(13, 'Jerry Bradley believes that cloud seeding can dependably increase precipitation.', 'FALSE', 'Paragraph J: Bradley said "I think you can squeeze out a little more snow or rain in some places under some conditions, but that\'s quite different from a program claiming to reliably increase precipitation".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
