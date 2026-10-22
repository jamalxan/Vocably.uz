// Vocably Reading 124 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-124',
  title: 'Reading 124: Daylight Saving Time',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'daylight-saving-time', title: 'Daylight Saving Time', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r124-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs D, F, G, H and I from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Early ideas that stopped short of moving the clocks',
              'Why the benefit depends on position within a time zone',
              'Fixed timetables versus routines governed by the sun',
              'The practical case for treating an early hour as a later one',
              'Arguments in favour and the dispute over energy savings',
              'How resetting the clocks moves an hour of daylight to the evening',
              'The first towns and nations to put the idea into practice',
              'The share of the world\'s countries that use DST today',
            ], true),
            questions: [
              q(1, 'Paragraph D', 'i', 'Paragraph D: Franklin "did not propose changing the clocks", Hudson\'s proposal "was not implemented until 1928 and in another form", and Willett\'s "was not implemented until 1916".', 'D'),
              q(2, 'Paragraph F', 'iii', 'Paragraph F: "Industrialized societies usually follow a clock-based schedule for daily activities that do not change throughout the course of the year" whereas "an agrarian society\'s daily routines for work and personal conduct are more likely governed by the length of daylight hours and by solar time".', 'F'),
              q(3, 'Paragraph G', 'vi', 'Paragraph G: after the clocks are reset, people "will have the hour of daylight that was shifted from the morning available to them after their workday activities".', 'G'),
              q(4, 'Paragraph H', 'iv', 'Paragraph H: "The clock shift is partly motivated by practicality." Since most people are asleep at 04:30, "it is seen as practical to treat 04:30 as if it were 05:30".', 'H'),
              q(5, 'Paragraph I', 'v', 'Paragraph I: "Proponents of daylight saving time argue that most people prefer more daylight hours" and "the actual effect on overall energy use is heavily disputed".', 'I'),
            ],
          },
          {
            id: 'r124-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Where DST is used, the period on DST is never longer than the period on standard time.', 'FALSE', 'Paragraph B: "In many countries, the part of the year when DST is observed is much longer than the part aligned to standard time."', 'B'),
              q(7, 'Every part of Canada observes DST.', 'FALSE', 'Paragraph C: "Six of the ten provinces and one of the three territories in Canada observe DST, with some regional exceptions."', 'C'),
              q(8, 'Benjamin Franklin\'s letter about Parisians was written in a humorous spirit.', 'TRUE', 'Paragraph D: "In a satirical letter to the editor of the Journal de Paris in 1784, Benjamin Franklin suggested that if Parisians could only wake up earlier in the summer they would economize on candle and oil usage".', 'D'),
              q(9, 'George Hudson\'s interest in changing the clocks was connected to his work as an entomologist.', 'NOT GIVEN', 'Paragraph D describes him as "New Zealand entomologist and astronomer George Hudson" but gives no reason for his proposal.', 'D'),
            ],
          },
          {
            id: 'r124-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Which two empires were the first to introduce DST across a whole country?', 'German and Austro-Hungarian', 'Paragraph E: "The first nation-wide implementations were by the German and Austro-Hungarian Empires, both starting on 30 April 1916."', 'E'),
              q(11, 'Which event led many countries to adopt DST in the second half of the twentieth century?', ['1970s energy crisis', 'energy crisis'], 'Paragraph E: "many countries have adopted DST at various times, particularly since the 1970s energy crisis".', 'E'),
              q(12, 'In which locations does DST offer little benefit?', ['near the Equator', 'the Equator', 'Equator'], 'Paragraph F: "DST is of little use for locations near the Equator, because these regions see only a small variation in daylight over the course of the year."', 'F'),
              q(13, 'Apart from lighting, heating and cooling, what other use of energy must be considered when judging the effect of DST?', ['driving vehicles', 'driving'], 'Paragraph I: it is necessary to "consider the energy used for heating or cooling buildings and driving vehicles".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
