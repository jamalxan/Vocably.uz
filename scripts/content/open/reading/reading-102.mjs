// Vocably Reading 102 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1W = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-102',
  title: 'Reading 102: Honey',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'honey', title: 'How Bees Make Honey', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r102-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Some honey is made from a substance produced by other insects rather than from flowers.', 'TRUE', 'Paragraph A: bees refine "the sugary secretions of plants (primarily floral nectar) or the secretions of other insects, like the honeydew of aphids".', 'A'),
              q(2, 'Stingless bees keep their honey in a structure that is different from honeycomb.', 'TRUE', 'Paragraph B: "Other honey-producing species of bee store the substance in different structures, such as the pots made of wax and resin used by the stingless bee."', 'B'),
              q(3, 'Honey tastes noticeably sweeter than ordinary table sugar.', 'FALSE', 'Paragraph D: "It has about the same relative sweetness as sucrose (table sugar)."', 'D'),
              q(4, 'The cave paintings in Spain are the oldest known pictures of people collecting honey.', 'NOT GIVEN', 'Paragraph E says the paintings "depict humans foraging for honey at least 8,000 years ago" but does not say whether they are the oldest such pictures.', 'E'),
              q(5, 'Most of the nectar a bee gathers is used straight away as fuel for flying.', 'FALSE', 'Paragraph F: "The majority of nectar collected is not used to directly nourish the insects but is instead destined for regurgitation, enzymatic digestion, and finally long-term storage as honey."', 'F'),
            ],
          },
          {
            id: 'r102-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Collecting nectar</strong></p><p>Nectar is a thin liquid that is 70 to 80% water, whereas finished honey has a water content of roughly 18%. Honeydew is usually even more {{q6}} than nectar. The bee draws these liquids up through its {{q7}} into a special cavity called the honey crop, which lies above the stomach used for the bee\'s own digestion. In Apis mellifera this cavity holds about 40 mg of liquid, roughly {{q8}} the weight of an empty bee, and filling it may require visits to over a thousand {{q9}}. Enzymes released into the honey stomach then begin to break complex sugars such as sucrose into simpler ones.</p>',
            questions: [
              q(6, null, 'dilute', 'Paragraph G: honeydew "is usually somewhat more dilute than nectar".', 'G'),
              q(7, null, 'proboscis', 'Paragraph G: "the bee sucks these runny fluids through its proboscis".', 'G'),
              q(8, null, 'half', 'Paragraph H: "This is about half the weight of an unladen bee."', 'H'),
              q(9, null, 'flowers', 'Paragraph H: "Collecting this quantity in nectar can require visits to more than one thousand flowers."', 'H'),
            ],
          },
          {
            id: 'r102-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'According to the passage, why does properly stored honey keep for so long?', ['It is sealed inside wax cells.', 'Its sugar content and acidity prevent microbes from growing.', 'It contains enzymes that kill bacteria.', 'Its water content continues to fall during storage.'], 'B', 'Paragraph D: "Due to honey\'s high sugar concentration and acidic pH level many microorganisms cannot grow in it and, when properly stored, honey therefore does not spoil."', 'D'),
              mc(11, 'What does the passage say about the Mayans?', ['They were the first people to keep Apis mellifera.', 'They painted scenes of honey gathering in caves.', 'They farmed stingless bees on a large scale before Europeans arrived.', 'They brought Old World bees to the Americas.'], 'C', 'Paragraph E: "large-scale meliponiculture of New World stingless bees has been practiced by Mayans since pre-Columbian times".', 'E'),
              mc(12, 'Stored honey is important to a bee colony because it', ['is eaten when other food is hard to find.', 'is needed to build the honeycomb.', 'is given only to the larvae.', 'is easier to digest than fresh nectar.'], 'A', 'Paragraph F: "During cold weather or when other food sources are scarce, adult and larval bees consume stored honey".', 'F'),
              mc(13, 'How do hive bees reduce the water content of the nectar?', ['by storing it in the warmest part of the hive', 'by passing it from bee to bee for several days', 'by repeatedly forming bubbles with it between their jaws', 'by mixing it with pollen from the food stomach'], 'C', 'Paragraph I: "the hive bees regurgitate the nectar, repeatedly forming bubbles between their mandibles, speeding its digestion and concentration".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
