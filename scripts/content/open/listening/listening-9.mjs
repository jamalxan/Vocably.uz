// Vocably Listening 9 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-9',
  title: 'Listening 9: Feeling Connected to the World',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'how-connected-are-you-to-the-world',
        contextText: 'You will hear a report about a survey of how connected people in different countries feel to the rest of the world.',
        questionGroups: [
          {
            id: 'l9-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Two people</strong></p><p><em>Saodat Sadikova</em> - English teacher in Uzbekistan</p><ul><li>as a girl, wanted to be a flight {{q1}}</li><li>her parents said she would need at least {{q2}} languages</li><li>has never been outside Uzbekistan</li></ul><p><em>Trina Bright</em> - retired American teacher</p><ul><li>worked in education for almost {{q3}} years</li><li>has been to more than {{q4}} countries</li></ul>',
            questions: [
              q(1, null, 'attendant', 'The speaker says "she dreamed of becoming a flight attendant and traveling the world".'),
              q(2, null, ['three', '3'], 'The speaker says "she would have to learn at least three languages in order to reach that goal".'),
              q(3, null, '25', 'The speaker says "American Trina Bright worked in education for nearly 25 years."'),
              q(4, null, '20', 'The speaker says "Bright has visited more than 20 countries."'),
            ],
          },
          {
            id: 'l9-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What is the aim of the Pew Research Center?', ['to encourage international travel', 'to inform the public about issues and trends', 'to teach foreign languages', 'to organise cultural exchanges'], 'B', 'The speaker says Pew is "an organization that aims to inform the public about the issues, beliefs and trends shaping the world".'),
              mc(6, 'How many countries took part in the Pew survey?', ['6', '24', '35', '99'], 'B', 'The speaker says "Pew recently asked people in 24 countries a series of questions".'),
            ],
          },
          {
            id: 'l9-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Country', 'Feel at least somewhat close to people worldwide', 'Have visited another country'],
              [
                ['United States', '{{q7}}%', '-'],
                ['Argentina', '28%', '-'],
                ['Netherlands', '{{q8}}%', '99%'],
                ['Sweden', '{{q9}}%', '99%'],
                ['India', '68%', '{{q10}}%'],
              ],
              'Pew survey results',
            ),
            questions: [
              q(7, null, '35', 'The speaker says "In the United States, only 35 percent of the respondents said they feel at least somewhat connected to those in other countries."'),
              q(8, null, '77', 'The speaker says "77 percent of respondents from the Netherlands said they feel at least somewhat close to people all over the world".'),
              q(9, null, '47', 'The speaker says "a much smaller share of Swedish respondents" - "47 percent" - "report feeling close to people all over the world".'),
              q(10, null, '3', 'The speaker says "just 3 percent of respondents from India said they had traveled to another country".'),
            ],
          },
        ],
      }),
    ],
  },
};
