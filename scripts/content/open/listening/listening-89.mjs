// Vocably Listening 89 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-89',
  title: 'Listening 89: Big Bend National Park',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'big-bend-national-park-texas',
        contextText: 'You will hear a talk about a large desert park on the border between Texas and Mexico.',
        questionGroups: [
          {
            id: 'l89-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Fact', 'Figure'], [
              ['kinds of birds found in the park', 'over {{q1}}'],
              ['length of the Rio Grande', 'more than {{q2}} kilometres'],
              ['length of the park\'s border with Mexico', '{{q3}} kilometres'],
              ['share of the park that is desert', '{{q4}} percent'],
            ], 'Big Bend in numbers'),
            questions: [
              q(1, null, '450', 'The speaker says "Over 450 kinds of birds can be found within the park".'),
              q(2, null, ['3,000', '3000'], 'The speaker says "It travels more than 3,000 kilometers on its way to the Gulf of Mexico."'),
              q(3, null, '189', 'The speaker says "The park itself shares a border with Mexico for 189 kilometers."'),
              q(4, null, ['80', 'eighty'], 'The speaker says "Eighty percent of the park is desert."'),
            ],
          },
          {
            id: 'l89-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, <strong>A-E</strong>.',
            questions: [
              {
                number: 5,
                promptHtml: 'Which TWO animals does the speaker say live in the Chihuahuan Desert?',
                options: [
                  { key: 'A', text: 'jackrabbits' },
                  { key: 'B', text: 'black bears' },
                  { key: 'C', text: 'mountain lions' },
                  { key: 'D', text: 'mule deer' },
                  { key: 'E', text: 'grey foxes' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: 'The speaker says "Animals like jackrabbits, roadrunner birds and mule deer live in the Chihuahuan." Bears, lions and foxes live in the mountain woodland.',
              },
            ],
          },
          {
            id: 'l89-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>History and visiting the park</strong></p><ul><li>much of the area belonged to Mexico until {{q6}}</li><li>became a national park on 12 June {{q7}}</li><li>established by President {{q8}} one week after D-Day</li><li>an {{q9}}-kilometre road was built to the Chisos Mountains Basin</li><li>most visitors come between November and {{q10}}, when it is cooler</li></ul>',
            questions: [
              q(6, null, '1848', 'The speaker says "Much of what is now Big Bend National Park was Mexican territory until 1848."'),
              q(7, null, '1944', 'The speaker says "Big Bend became a national park on June 12, 1944."'),
              q(8, null, 'Roosevelt', 'The speaker says "President Franklin D. Roosevelt established the park just one week after D-Day."'),
              q(9, null, '11', 'The speaker says "They built the 11-kilometer road that leads to the Chisos Mountains Basin."'),
              q(10, null, 'April', 'The speaker says "Most come between November and April, when the weather is cooler."'),
            ],
          },
        ],
      }),
    ],
  },
};
