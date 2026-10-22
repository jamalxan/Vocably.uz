// Vocably Reading 130 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-130',
  title: 'Reading 130: Habit',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'habit', title: 'The Science of Habit', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r130-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of researchers below. Match each statement with the correct researcher, <strong>A-D</strong>. <em>You may use any letter more than once.</em>',
            bank: bank(['Wendy Wood', 'William James', 'Nikolai Bernstein', 'Lally et al.']),
            questions: [
              q(1, 'measured how large a share of everyday actions are habitual', 'A', 'Paragraph A: "A 2002 daily experience study by habit researcher Wendy Wood and her colleagues found that approximately 43% of daily behaviors are performed out of habit."', 'A'),
              q(2, 'described living things as collections of habits', 'B', 'Paragraph D: to James, living creatures "are bundles of habits".', 'D'),
              q(3, 'built equipment to record the movements of novices and experts', 'C', 'Paragraph E: "Bernstein invented his own devices of tracking physical motions of learners and experts in some activities."', 'E'),
              q(4, 'found that the time needed for a behaviour to become automatic varied greatly', 'D', 'Paragraph G: "Lally et al. found the average time for participants to reach the asymptote of automaticity was 66 days with a range of 18–254 days."', 'G'),
              q(5, 'argued that a frequently repeated mental sequence tends to recur without any conscious intention', 'B', 'Paragraph D: James states, "Any sequence of mental action which has been frequently repeated tends to perpetuate itself" ... "without any consciously formed purpose".', 'D'),
            ],
          },
          {
            id: 'r130-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'People are usually conscious of their own habitual behaviour.', 'FALSE', 'Paragraph A: "Habitual behavior often goes unnoticed by persons exhibiting it".', 'A'),
              q(7, 'In the 13th century the word habit referred only to clothing.', 'TRUE', 'Paragraph C: "In the 13th century CE, the word habit first just referred to clothing."', 'C'),
              q(8, 'Bernstein regarded all five of his levels of behaviour regulation as automatic.', 'FALSE', 'Paragraph F: three levels could be seen as automatic, the "fourth as a semi-conscious level and fifth as a level of higher reasoning".', 'F'),
              q(9, 'Habitica is the most widely used habit-tracking app.', 'NOT GIVEN', 'Paragraph I says only that "Habitica uses gamification, implementing strategies found in video games to real-life tasks"; nothing is said about how many people use it.', 'I'),
            ],
          },
          {
            id: 'r130-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Repeating a behaviour in the same setting strengthens the connection between the ______ and the action.', 'context', 'Paragraph B: "there is an incremental increase in the link between the context and the action".', 'B'),
              q(11, 'The ______ is described as the motivating force behind a habit.', 'craving', 'Paragraph H: "The craving is the motivational force behind the habit."', 'H'),
              q(12, 'Rewards that are ______ or uncertain are especially effective in encouraging habit learning.', 'intermittent', 'Paragraph H: "Intermittent or uncertain rewards have been found to be particularly effective in promoting habit learning."', 'H'),
              q(13, 'Habits that affect the formation of other habits are known as ______ habits.', 'keystone', 'Paragraph K: some habits are known as keystone habits, "and these influence the formation of other habits".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
