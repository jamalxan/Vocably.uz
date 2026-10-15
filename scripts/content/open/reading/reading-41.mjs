// Vocably Reading 41 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-41',
  title: 'Reading 41: Plastic Pollution',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'plastic-pollution', title: 'The Plastic Problem', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r41-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'a prediction that plastic could one day outweigh the fish in the sea', 'I', 'Paragraph I: "by 2050 there could be more plastic than fish in the oceans by weight".', 'I'),
              q(2, 'an explanation of why manufacturers prefer plastic to other materials', 'A', 'Paragraph A: "Plastics are inexpensive and durable, making them very adaptable for different uses".', 'A'),
              q(3, 'a list of countries whose rivers carry the most plastic into the sea', 'B', 'Paragraph B: "The top ten were, from the most to the least: Philippines, India, Malaysia, China, Indonesia, Myanmar, Brazil, Vietnam, Bangladesh, and Thailand."', 'B'),
              q(4, 'a reference to a health emergency that increased the amount of plastic waste', 'D', 'Paragraph D: "increased during the COVID-19 pandemic due to increased demand for protective equipment and packaging materials".', 'D'),
              q(5, 'the proportion of seabirds found to have plastic in their bodies', 'E', 'Paragraph E: "studies suggest that the bodies of 90% of seabirds contain plastic debris".', 'E'),
            ],
          },
          {
            id: 'r41-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Most plastics are broken down quickly by natural processes.', 'FALSE', 'Paragraph A: most plastics are "resistant to many natural processes of degradation and as a result they are slow to degrade".', 'A'),
              q(7, 'Different research groups produced different estimates of how much plastic entered the water in 2016.', 'TRUE', 'Paragraph C: one study estimated that "19–23 million tonnes of plastic waste entered aquatic ecosystems in 2016", while another estimated that "9–14 million tonnes of plastic waste ended up in the oceans the same year".', 'C'),
              q(8, 'The plastic industry was accused of trying to profit from the pandemic.', 'TRUE', 'Paragraph D: "Several news reports point to a plastic industry trying to take advantage of the health concerns and desire for disposable masks".', 'D'),
              q(9, 'Asia recycles a higher proportion of its plastic than other regions.', 'NOT GIVEN', 'Paragraph E says that "51% in Asia" of plastic is produced, but gives no comparison of recycling rates between regions.', 'E'),
              q(10, 'Losses of plastic to the environment are expected to fall as a result of current global efforts.', 'FALSE', 'Paragraph H: "Despite global efforts to reduce the generation of plastic waste, losses to the environment are predicted to increase."', 'H'),
            ],
          },
          {
            id: 'r41-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Plastic production and waste</strong></p><p>Between the 1950s and 2018, around {{q11}} billion tonnes of plastic were produced worldwide, but only about {{q12}}% of this has been recycled. In 2018 the great majority of the plastic waste generated was post-consumer waste; the remainder came from resin production and manufacturing, for example materials rejected because of their colour or hardness. The OECD expects the amount of plastic waste to reach more than 900 million tons by {{q13}}, with {{q14}} waste continuing to be the largest part of the waste stream.</p>',
            questions: [
              q(11, null, '6.3', 'Paragraph E: "an estimated 6.3 billion tonnes of plastic has been produced worldwide".', 'E'),
              q(12, null, '9', 'Paragraph E: "of which an estimated 9% has been recycled".', 'E'),
              q(13, null, '2060', 'Paragraph I: "the amount of plastic waste produced by 2060 will reach more than 900 million tons".', 'I'),
              q(14, null, 'packaging', 'Paragraph I: "packaging waste will remain the principal fraction of the waste stream".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
