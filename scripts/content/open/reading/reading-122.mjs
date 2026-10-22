// Vocably Reading 122 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-122',
  title: 'Reading 122: Tulip Mania',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'tulip-mania', title: 'Tulip Mania', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r122-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Tulip mania is widely regarded as the earliest documented speculative bubble.', 'TRUE', 'Paragraph A: "It is generally considered to have been the first recorded speculative bubble or asset bubble in history."', 'A'),
              q(2, 'The fall in tulip prices seriously damaged the economy of the Dutch Republic.', 'FALSE', 'Paragraph B: "It had no critical influence on the prosperity of the Dutch Republic".', 'B'),
              q(3, 'Reliable economic records from the 1630s are plentiful.', 'FALSE', 'Paragraph C: "Research is difficult because of the limited economic data from the 1630s, much of which comes from biased and speculative sources."', 'C'),
              q(4, 'Charles Mackay visited the Netherlands while researching his book.', 'NOT GIVEN', 'Paragraph D says the book was "written by Scottish journalist Charles Mackay" but gives no information about how he researched it.', 'D'),
              q(5, 'Clusius discovered that tulips could survive the climate of the Low Countries.', 'TRUE', 'Paragraph F: he "found that they were able to tolerate the harsher conditions of the Low Countries".', 'F'),
            ],
          },
          {
            id: 'r122-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the passage, why do some modern economists doubt that the price rise was an irrational mania?', ['Prices of other newly introduced flowers behaved in a similar way.', 'Tulip bulbs were genuinely rare and difficult to grow.', 'Most buyers were wealthy merchants who could afford their losses.', 'The Dutch authorities fixed the price of bulbs.'], 'A', 'Paragraph C: "other flowers such as the hyacinth also had high initial prices at the time of their introduction, which then fell as the plants were propagated".', 'C'),
              mc(7, 'What does the passage say about Mackay\'s account of the events?', ['It was the first book to mention the crash of 1637.', 'It is frequently cited but its accuracy is disputed.', 'It was based on official Dutch trade records.', 'It argued that the mania had few lasting effects.'], 'B', 'Paragraph D: "Although Mackay\'s book is often referenced, his account is contested."', 'D'),
              mc(8, 'Ogier de Busbecq is credited with', ['planting the first tulips in Leiden.', 'writing the first major work on tulips.', 'sending tulip bulbs from the Ottoman Empire to Vienna.', 'carrying tulips to Amsterdam himself.'], 'C', 'Paragraph E: he "sent the first tulip bulbs and seeds to Vienna in 1554 from the Ottoman Empire".', 'E'),
              mc(9, 'What is now known to produce the streaked petals of the most prized tulips?', ['careful cross-breeding by Dutch growers', 'the harsh climate of the Low Countries', 'a virus that infects the bulbs', 'the soil in which the bulbs were planted'], 'C', 'Paragraph H: "this effect is produced when the bulbs are infected with a type of tulip-specific mosaic virus".', 'H'),
            ],
          },
          {
            id: 'r122-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'At the height of the mania, some bulbs cost more than ten times the yearly earnings of a skilled ______.', 'artisan', 'Paragraph C: "certain tulip bulbs sold for more than 10 times the annual income of a skilled artisan".', 'C'),
              q(11, 'Mackay writes that 5 hectares of ______ were once offered in exchange for one Semper Augustus bulb.', 'land', 'Paragraph D: "at one point 5 hectares (12 acres) of land were offered for a Semper Augustus bulb".', 'D'),
              q(12, 'A ceramic object called a ______ was invented so that cut flowers could be displayed one stem at a time.', 'tulipiere', 'Paragraph G: "the ceramic tulipiere was devised for the display of cut flowers stem by stem".', 'G'),
              q(13, 'The rarest tulips, with yellow or white streaks on a dark background, were called the ______.', ['Bizarden', 'Bizarres'], 'Paragraph H: "the rarest of all, the Bizarden (\'Bizarres\') (yellow or white streaks on a red, brown, or purple background)".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
