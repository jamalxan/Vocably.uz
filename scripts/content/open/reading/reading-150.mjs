// Vocably Reading 150 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-150',
  title: 'Reading 150: Procrastination',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'procrastination', title: 'Procrastination', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r150-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to the passage, procrastination can occasionally be beneficial because it', ['makes a person more productive.', 'may stop someone acting on a harmful intention.', 'reduces feelings of guilt.', 'forces people to meet their deadlines.'], 'B', 'Paragraph A: "For instance, procrastinating can prevent a person from acting on suicidal intent."', 'A'),
              mc(2, 'Students from non-Western cultures tend to procrastinate because they', ['want to avoid doing worse than they did before.', 'have a linear view of time.', 'fear appearing incapable in front of other students.', 'place little value on accuracy.'], 'C', 'Paragraph B: "students from non-Western cultures tend to procrastinate in order to avoid looking incompetent or demonstrating a lack of ability in front of their peers".', 'B'),
              mc(3, 'What did the experiments with pigeons indicate?', ['Pigeons are unable to delay gratification.', 'Pigeons prefer an easy task that has to be done quickly.', 'Procrastination occurs in animals other than humans.', 'Pigeons learn more quickly than humans.'], 'C', 'Paragraph C: "procrastination is not unique to humans but can also be observed in some other animals".', 'C'),
              mc(4, 'In 2010, Piers Steel argued that', ['anxiety always leads people to procrastinate.', 'research should concentrate on impulsiveness.', 'cognitive impairments are the main cause of procrastination.', 'the pleasure principle fully explains procrastination.'], 'B', 'Paragraph H: "Piers Steel indicated in 2010 that anxiety is just as likely to induce people to start working early as late, and that the focus of studies on procrastination should be impulsiveness."', 'H'),
            ],
          },
          {
            id: 'r150-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following findings (Questions 5-8) and the list of researchers below. Match each finding with the correct researcher or researchers, <strong>A-E</strong>.',
            bank: bank(['Schraw, Wadkins and Olafson', 'Steel', 'Sabini and Silver', 'Pogorskiy and Beckmann', 'Rinaldi et al.']),
            questions: [
              q(5, 'set out three conditions that a behaviour must meet to count as academic procrastination', 'A', 'Paragraph G: "Gregory Schraw, Theresa Wadkins, and Lori Olafson in 2007 proposed three criteria for a behavior to be classified as academic procrastination: it must be counterproductive, needless, and delaying."', 'G'),
              q(6, 'claimed that a delay with a sensible reason behind it is not procrastination', 'C', 'Paragraph G: "Delaying a task is not deemed as procrastination, they argue, if there are rational reasons behind the delay."', 'G'),
              q(7, 'found that procrastination shows up as regular patterns in online behaviour', 'D', 'Paragraph G: "in a study conducted by Pogorskiy and Beckmann, learners\' procrastination is characterised by stable sequential patterns in learners\' web navigation behaviour".', 'G'),
              q(8, 'suggested that measurable problems with thinking may contribute to procrastination', 'E', 'Paragraph H: "a research conducted by Rinaldi et al. indicated that measurable cognitive impairments may play a role in procrastination".', 'H'),
            ],
          },
          {
            id: 'r150-summary', type: 'summary_completion', wordLimit: W1N,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Surveys of student procrastination</strong></p><p>In a 1984 study at the University of Vermont, {{q9}}% of the subjects said they always or nearly always put off writing papers, and around 30% delayed studying for exams and doing their weekly {{q10}}. Even so, 65% said they wanted to procrastinate less when writing papers. A study from {{q11}} found that 52% of the students surveyed had a moderate to high need for help with procrastination, and in 2004 as many as {{q12}}% of university students described themselves as procrastinators. Research also shows that students procrastinate more over tasks they find {{q13}}, or regard as impositions, than over tasks they feel they lack the skills to do.</p>',
            questions: [
              q(9, null, '46', 'Paragraph D: "46% of the subjects reported that they" always or nearly always "procrastinated writing papers".', 'D'),
              q(10, null, 'assignments', 'Paragraph D: "approximately 30% reported procrastinating studying for exams and reading weekly assignments".', 'D'),
              q(11, null, '1992', 'Paragraph E: "A 1992 study showed that" 52% of surveyed students "indicated having a moderate to high need for help concerning procrastination".', 'E'),
              q(12, null, '70', 'Paragraph E: "A study done in 2004 showed that 70% of university students categorized themselves as procrastinators".', 'E'),
              q(13, null, 'unpleasant', 'Paragraph E: "procrastination was shown to be greater with tasks that were perceived as unpleasant or as impositions than with tasks for which the student believed they lacked the required skills".', 'E'),
            ],
          },
        ],
      }),
    ],
  },
};
