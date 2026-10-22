// Vocably Reading 132 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-132',
  title: 'Reading 132: Easter Island',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'easter-island', title: 'Easter Island: The Navel of the World', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r132-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Write the correct letter, A-J.</em>',
            questions: [
              q(1, 'the distances separating the island from its nearest neighbours', 'D', 'Paragraph D: "the nearest continental point lies in central Chile, 3,512 km (2,182 mi) away".', 'D'),
              q(2, 'a claim that the name Rapa originally belonged to Easter Island rather than to another island', 'F', 'Paragraph F: "Thor Heyerdahl argued that Rapa was Easter Island\'s original name".', 'F'),
              q(3, 'the circumstances in which a European gave the island its name', 'E', 'Paragraph E: "the Dutch explorer Jacob Roggeveen, who encountered it on Easter Sunday (5 April) in 1722".', 'E'),
              q(4, 'a legend about a leader who had repeatedly been defeated in battle', 'J', 'Paragraph J: "Hotu deemed it a worthwhile place to flee from a neighboring chief, one to whom he had already lost three battles".', 'J'),
              q(5, 'a disagreement among scholars about the date of first settlement', 'B', 'Paragraph B: "Experts differ on when the island\'s Polynesian inhabitants first reached the island."', 'B'),
            ],
          },
          {
            id: 'r132-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Which animal brought by the Polynesians contributed to the loss of the island\'s forests?', ['Polynesian rat', 'the Polynesian rat', 'rat'], 'Paragraph B: "Land clearing for cultivation and the introduction of the Polynesian rat led to gradual deforestation."', 'B'),
              q(7, 'How many native inhabitants were left on the island in 1877?', '111', 'Paragraph B: "reducing it to a low of 111 native inhabitants in 1877".', 'B'),
              q(8, 'In which year did the island\'s people become citizens of Chile?', '1966', 'Paragraph C: "In 1966, the Rapa Nui were granted Chilean citizenship."', 'C'),
              q(9, 'According to Churchill\'s informants, what did the three \'te pito o te henua\' refer to?', ['three capes', 'the three capes', 'capes'], 'Paragraph G: "these being the three capes (land\'s ends) of the island".', 'G'),
            ],
          },
          {
            id: 'r132-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Spanish is an official language in several parts of Polynesia.', 'FALSE', 'Paragraph A: "Easter Island is also the only territory in Polynesia where Spanish is an official language."', 'A'),
              q(11, 'Fewer than half of the people counted in the 2017 census described themselves as Rapa Nui.', 'TRUE', 'Paragraph C: "The 2017 Chilean census registered 7,750 people on the island, of which 3,512 (45%) identified as Rapa Nui."', 'C'),
              q(12, 'Roggeveen was looking for a different land when he came across the island.', 'TRUE', 'Paragraph E: Roggeveen "encountered it on Easter Sunday (5 April) in 1722, while searching for" Davis Land.', 'E'),
              q(13, 'Alphonse Pinart visited Easter Island more than once.', 'NOT GIVEN', 'Paragraph G says only that "French ethnologist Alphonse Pinart gave it the romantic translation" in a book "published in 1877"; nothing is said about how many times he visited.', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
