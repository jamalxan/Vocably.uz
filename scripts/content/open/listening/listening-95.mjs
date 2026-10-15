// Vocably Listening 95 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-95',
  title: 'Listening 95: A History of the US Capitol',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'history-of-us-capitol-building',
        contextText: 'You will hear a talk about the history of the United States Capitol building in Washington.',
        questionGroups: [
          {
            id: 'l95-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Date', 'Event'], [
              ['1793', 'George Washington laid the {{q1}} of the building'],
              ['1800 and 1807', 'lawmakers began meeting in the two sides, crossing on a wooden {{q2}}'],
              ['1814', 'British troops set {{q3}} to the building; a storm saved it'],
              ['after the war', 'a dome of wood covered in {{q4}} was added'],
              ['1850', 'lawmakers agreed the building was too {{q5}}'],
            ], 'The Capitol building: key dates'),
            questions: [
              q(1, null, 'cornerstone', 'The speaker says "George Washington, set the cornerstone for the building in 1793".'),
              q(2, null, 'walkway', 'The speaker says "They passed from one side to the other on a wooden walkway."'),
              q(3, null, 'fire', 'The speaker says "British troops set fire to the Capitol building. Only rain from an unexpected storm put out the fire."'),
              q(4, null, 'copper', 'The speaker says "It was made of wood and covered in copper."'),
              q(5, null, 'small', 'The speaker says "By 1850, lawmakers agreed that the building was too small."'),
            ],
          },
          {
            id: 'l95-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(6, 'During the Civil War the building was used as a place for soldiers to sleep and as a ______.', 'hospital', 'The speaker says "the building served as a place for soldiers to sleep, a hospital, and even a place where baked goods were made".'),
              q(7, 'Philip Reid, a formerly enslaved man, was an expert at shaping ______.', 'metal', 'The speaker says "Reid was an expert in shaping metal."'),
              q(8, 'The figure on top of the dome is known as the Statue of ______.', 'Freedom', 'The speaker says "The figure, called the Statue of Freedom, still stands on top of the Capitol’s white, iron dome."'),
            ],
          },
          {
            id: 'l95-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 9,
                promptHtml: 'Which TWO things were added to the Capitol in the years right after the Civil War ended?',
                options: [
                  { key: 'A', text: 'elevators' }, { key: 'B', text: 'televisions' }, { key: 'C', text: 'running water' }, { key: 'D', text: 'electric lighting' }, { key: 'E', text: 'a visitor center' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: 'The speaker says "Elevators, electric lighting, and more rooms were added."',
              },
              {
                number: 10,
                promptHtml: 'Which TWO buildings near the Capitol does the speaker mention?',
                options: [
                  { key: 'A', text: 'the Supreme Court' }, { key: 'B', text: 'the White House' }, { key: 'C', text: 'the Library of Congress' }, { key: 'D', text: 'the Washington Monument' }, { key: 'E', text: 'the Pentagon' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'The speaker says "They include the U.S. Supreme Court, the Library of Congress, and even the Voice of America."',
              },
            ],
          },
        ],
      }),
    ],
  },
};
