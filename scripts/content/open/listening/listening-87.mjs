// Vocably Listening 87 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-listening-87',
  title: 'Listening 87: Sequoia and Kings Canyon',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-sequoia-kings-canyon-california',
        contextText: 'You will hear a talk about two Californian parks that are home to the largest trees on Earth.',
        questionGroups: [
          {
            id: 'l87-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Giant sequoias', 'Details'], [
              ['General Sherman', 'the largest tree; 31 metres around and almost {{q1}} metres tall'],
              ['Giant Forest', 'where General Sherman stands; over {{q2}} sequoias'],
              ['Age of General Sherman', 'more than {{q3}} years'],
            ], 'The giant trees of Sequoia National Park'),
            questions: [
              q(1, null, '84', 'The speaker says "It stands almost 84 meters tall."'),
              q(2, null, ['8,000', '8000'], 'The speaker says "The forest is home to over 8,000 sequoia trees."'),
              q(3, null, ['2,200', '2200'], 'The speaker says "General Sherman is more than 2,200 years old."'),
            ],
          },
          {
            id: 'l87-flow', type: 'flowchart_completion', wordLimit: W1W,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>How Walter Fry changed his career</strong></p><p>1888: Fry comes to the Sierra Nevada working as a {{q4}}</p><p>↓</p><p>He spends five days with a team cutting down one giant sequoia</p><p>↓</p><p>He counts the {{q5}} of the tree and finds it is over 3,200 years old</p><p>↓</p><p>Fry becomes a {{q6}} and joins the campaign to protect the trees</p><p>↓</p><p>He is the third person to sign a petition asking Congress for a national park</p>',
            questions: [
              q(4, null, 'logger', 'The speaker says "In 1888, he came to the Sierra Nevada Mountains as a logger himself."'),
              q(5, null, 'rings', 'The speaker says "Fry then decided to count the tree\'s rings to learn its age."'),
              q(6, null, 'naturalist', 'The speaker says "The experience led Fry to change jobs. He became a naturalist."'),
            ],
          },
          {
            id: 'l87-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(7, 'What does the speaker say about Sequoia National Park?', ['It was the first national park in the country.', 'It was the second national park, after Yellowstone.', 'It was created at the same time as Kings Canyon.', 'It was established by Walter Fry.'], 'B', 'The speaker says "It became the country\'s second national park, after Yellowstone."'),
              mc(8, 'What do we learn about climbing Mount Whitney?', ['Most visitors come to the park to climb it.', 'The trail starts close to sea level.', 'Only about a third of climbers reach the top.', 'Climbers need a special permit.'], 'C', 'The speaker says "More than 30,000 people try to climb Mount Whitney each year. Only about 10,000 reach the top."'),
              mc(9, 'Why is the Moro Rock trail less demanding?', ['It is completely flat.', 'Hikers only climb the final 90 metres.', 'A bus takes visitors most of the way.', 'It is only one kilometre long.'], 'B', 'The speaker says "hikers only need to climb the final 90 meters to reach the top".'),
              mc(10, 'Which animal does the speaker hope visitors will NOT meet?', ['a black bear', 'a bobcat', 'a rattlesnake', 'a grey fox'], 'C', 'The speaker says "If you are lucky, you will not run into one of the park\'s poisonous wild rattlesnakes."'),
            ],
          },
        ],
      }),
    ],
  },
};
