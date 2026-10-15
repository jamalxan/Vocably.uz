// Vocably Listening 63 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-63',
  title: 'Listening 63: Preparing for the TOEFL',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'prepare-yourself-for-a-better-toefl-score',
        contextText: 'You will hear a talk giving advice to students who plan to take the TOEFL English test.',
        questionGroups: [
          {
            id: 'l63-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Who needs the TOEFL?</strong></p><p>The TOEFL is the most widely used English exam for American colleges, and a score may be needed to obtain a student {{q1}}. The most competitive universities usually expect an internet-based test score of {{q2}} or higher. Before taking the test, students should have finished at least upper {{q3}} level classes. Anyone scoring under {{q4}} on the iBT is advised to keep studying for a few months first.</p>',
            questions: [
              q(1, null, 'visa', 'The speaker says "A TOEFL score may be necessary to get a student visa to an English-speaking country."'),
              q(2, null, ['90', 'ninety'], 'The speaker says "The most competitive universities generally expect an internet-based test, or iBT score of 90 or above."'),
              q(3, null, 'intermediate', 'The speaker says "You should have completed at least upper intermediate level English classes before you take the test."'),
              q(4, null, ['70', 'seventy'], 'The speaker says "If you scored below 70 on the iBT" it is wise to continue studying.'),
            ],
          },
          {
            id: 'l63-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Version', 'Where / cost', 'Format'],
              [
                ['paper-based test (PBT)', 'given where the {{q5}} is not widely available; costs around US${{q6}}', 'three areas; takes 2 hours 50 minutes'],
                ['internet-based test (iBT)', 'offered in most of the world; more expensive', 'four parts; lasts {{q7}} and a half hours; speaking section has {{q8}} questions in 20 minutes'],
              ],
              'The two versions of the TOEFL',
            ),
            questions: [
              q(5, null, 'internet', 'The speaker says "The PBT is given in places where the internet is not widely available."'),
              q(6, null, ['180', '$180'], 'The speaker says "The revised PBT costs less, around US$180, than the iBT".'),
              q(7, null, ['four', '4'], 'The speaker says "the iBT test lasts four and one-half hours".'),
              q(8, null, ['six', '6'], 'The speaker says "Test-takers spend 20 minutes answering six questions involving speech."'),
            ],
          },
          {
            id: 'l63-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'How long do experts say you should study before taking the test?', ['at least two weeks', 'at least two months', 'at least six months', 'at least two years'], 'B', 'The speaker says "you should study for at least two months before taking the test".'),
              mc(10, 'Why should you not study for the TOEFL if you have no plans to study abroad soon?', ['The test changes every year.', 'Colleges only accept scores for up to two years.', 'You will forget the material.', 'The fees increase each year.'], 'B', 'The speaker says "colleges will only accept the test score for up to two years".'),
            ],
          },
        ],
      }),
    ],
  },
};
