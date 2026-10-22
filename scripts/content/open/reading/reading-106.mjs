// Vocably Reading 106 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-106',
  title: 'Reading 106: The Aral Sea',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'aral-sea', title: 'The Shrinking Aral Sea', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r106-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>A disappearing lake</strong></p><p>The Aral Sea lies between Kazakhstan and Uzbekistan. Its name means \'Sea of Islands\', because more than {{q1}} islands once lay within it. Once the {{q2}} lake in the world, it began to shrink in the 1960s after Soviet {{q3}} projects diverted the rivers that fed it. By 2007 it had split into four separate lakes, and in 2014 satellite images showed that the eastern basin had dried up entirely; this area is now known as the {{q4}} Desert.</p>',
            questions: [
              q(1, null, ['1,100', '1100'], 'Paragraph A: "a reference to the large number of islands (over 1,100) that once dotted its waters".', 'A'),
              q(2, null, ['third-largest', 'third largest'], 'Paragraph B: "Formerly the third-largest lake in the world with an area of 68,000 km2".', 'B'),
              q(3, null, 'irrigation', 'Paragraph B: "the Aral Sea began shrinking in the 1960s after the rivers that fed it were diverted by Soviet irrigation projects".', 'B'),
              q(4, null, 'Aralkum', 'Paragraph B: "The eastern basin is now called the Aralkum Desert."', 'B'),
            ],
          },
          {
            id: 'r106-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'The Kokaral dam was built by Kazakhstan to help restore the northern part of the sea.', 'TRUE', 'Paragraph C: "In a Kazakhstani effort to save and replenish the North Aral Sea, the Dike Kokaral dam was completed in 2005."', 'C'),
              q(6, 'Fishing in the North Aral Sea has returned to the level it had before the 1960s.', 'NOT GIVEN', 'Paragraph C says that by 2013 "fish were again present in sufficient numbers for some fishing to be viable" but makes no comparison with earlier levels of fishing.', 'C'),
              q(7, 'The Amu Darya still flows into what remains of the Aral Sea.', 'FALSE', 'Paragraph E: "Today the Amu Darya does not reach the Aral Sea, and its mouth is in a dried-up area of what was once the Aral Sea."', 'E'),
              q(8, 'Before it shrank, the Aral Sea was home to an unusually wide range of native species.', 'FALSE', 'Paragraph F: "Despite its former vast size, the Aral Sea had relatively low indigenous biodiversity."', 'F'),
              q(9, 'The stickleback survived the rise in the salinity of the lake.', 'TRUE', 'Paragraph G: all other native fish were extirpated "barring the stickleback (which persisted during the lake\'s shrinkage and salinity increase)".', 'G'),
            ],
          },
          {
            id: 'r106-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'Which of the following is mentioned as a consequence of the shrinking of the Aral Sea?', ['the flooding of farmland in the Ferghana Valley', 'a fall in pollution levels in the region', 'the removal of historical documents from the region', 'the loss of jobs in the fishing industry'], 'D', 'Paragraph D: "The region\'s once-prosperous fishing industry has been devastated, bringing unemployment and economic hardship."', 'D'),
              mc(11, 'According to Nick Middleton, the Amu Darya', ['has always flowed into the Aral Sea.', 'only started feeding the Aral Sea in the Holocene.', 'still reaches the Caspian Sea through the Uzboy Channel.', 'changed course because of Soviet irrigation.'], 'B', 'Paragraph E: the river fed the Aral Sea from the Holocene, and "Geographer Nick Middleton believes it did not begin to flow into the Aral Sea until that time."', 'E'),
              mc(12, 'What does the passage say about the salt-tolerant fish that appeared in the 1960s?', ['They were all introduced deliberately.', 'They were brought in from the Caspian Sea.', 'Some of them arrived by accident.', 'None of them survived the later rise in salinity.'], 'C', 'Paragraph H: "Other salt-tolerant fish species were intentionally or inadvertently introduced during the 1960s".', 'H'),
              mc(13, 'What effect did the herring, sand smelt and gobies have on the lake?', ['They caused the lake\'s zooplankton to collapse.', 'They drove the native sturgeon to extinction.', 'They increased the salinity of the water.', 'They were quickly eaten by the European flounder.'], 'A', 'Paragraph I: "The herring, sand smelt, and gobies were the first planktivorous fish in the lake, leading to a collapse of the lake\'s zooplankton population."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
