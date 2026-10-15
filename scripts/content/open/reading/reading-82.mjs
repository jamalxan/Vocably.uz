// Vocably Reading 82 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-82',
  title: 'Reading 82: Angkor Wat',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'angkor-wat', title: 'Angkor Wat: the City of Temples', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r82-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What makes Angkor Wat different from most other temples at Angkor?', ['It is surrounded by a wide moat.', 'It faces towards the west.', 'It was built by a Khmer king.', 'Its walls are decorated with carvings.'], 'B', 'Paragraph A: "Unlike most Angkorian temples, it is oriented toward the west."', 'A'),
              mc(2, 'The writer says that one reason the temple has been preserved is that', ['it was protected by a thick outer wall.', 'it was hidden by the forest for centuries.', 'it has never stopped being used for worship.', 'it was restored soon after it was abandoned.'], 'C', 'Paragraph C: "has remained in continuous religious use, a factor that contributed to its preservation and survival".', 'C'),
              mc(3, 'Recent studies of the site suggest that Angkor Wat', ['was named on a foundation stone.', 'was finished before the king died.', 'was never lived in.', 'was home to a few thousand people.'], 'D', 'Paragraph G: "modern analyses of the site suggest that it housed a population of between 3,000 and 4,300 residents".', 'G'),
              mc(4, 'Why was the Bayon dedicated to Buddhism?', ['The Chams had destroyed the Hindu shrines.', 'The king was persuaded by his wife to convert.', 'The king had been a Buddhist since childhood.', 'Most of the population had become Buddhist.'], 'B', 'Paragraph H: "The temple was dedicated to Buddhism as the king\'s wife Indradevi was a devout Mahayana Buddhist who encouraged him to convert."', 'H'),
            ],
          },
          {
            id: 'r82-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'No other religious complex in the world is bigger than Angkor Wat.', 'TRUE', 'Paragraph A: "It is the largest religious complex in the world."', 'A'),
              q(6, 'France was the only foreign country that took part in restoring the temple.', 'FALSE', 'Paragraph D: "Major contributors included France (via the École française d\'Extrême-Orient), Japan (JASA), India (Archaeological Survey of India), Germany (GACP), the United States (World Monuments Fund), South Korea, China, and Italy."', 'D'),
              q(7, 'The number of tourists visiting Angkor Wat has grown every year since 1992.', 'NOT GIVEN', 'Paragraph E only says the temple "attracts more than 2.5 million visitors every year"; nothing is said about whether this number is rising.', 'E'),
              q(8, 'Building work on the temple carried on for several years after Suryavarman II died.', 'FALSE', 'Paragraph G: "The work on the temple ceased after the king\'s death, leaving some of the bas-relief decoration unfinished."', 'G'),
              q(9, 'Jayavarman VII located his new state temple to the north of Angkor Wat.', 'TRUE', 'Paragraph H: "established a new capital at Angkor Thom and the Bayon as the state temple, situated to the north".', 'H'),
            ],
          },
          {
            id: 'r82-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'When it was first built, the temple was dedicated to the Hindu god ______.', 'Vishnu', 'Paragraph A: "as a Hindu temple dedicated to Vishnu".', 'A'),
              q(11, 'Inside the outer wall, three galleries rise towards a central group of five ______.', 'towers', 'Paragraph B: "three progressively elevated galleries rise toward a central quincunx of towers".', 'B'),
              q(12, 'The committee that coordinated the restoration was created under UNESCO in ______.', '1993', 'Paragraph D: "established in 1993 under UNESCO".', 'D'),
              q(13, 'The Sanskrit/Pali word from which "Wat" is derived means ______.', 'enclosure', 'Paragraph F: the word for temple grounds is "also derived from Sanskrit/Pali" and its original meaning is given as enclosure.', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
