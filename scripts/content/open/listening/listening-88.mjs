// Vocably Listening 88 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-88',
  title: 'Listening 88: Hot Springs National Park',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'relaxing-waters-of-hot-springs-national-park',
        contextText: 'You will hear a talk about a national park in Arkansas known for its natural thermal baths.',
        questionGroups: [
          {
            id: 'l88-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Hot Springs National Park</strong></p><ul><li>located in the state of {{q1}}</li><li>covers more than {{q2}} hectares in and around a city</li><li>became a national park in {{q3}}</li><li>average water temperature: {{q4}} degrees Celsius</li><li>the springs come out along the {{q5}} side of Hot Springs Mountain</li></ul>',
            questions: [
              q(1, null, 'Arkansas', 'The speaker says "So we head south to the state of Arkansas."'),
              q(2, null, ['2,200', '2200'], 'The speaker says "It covers more than 2,200 hectares in and around the city of Hot Springs".'),
              q(3, null, '1921', 'The speaker says "it became a national park in 1921".'),
              q(4, null, '61', 'The speaker says "The average temperature of the hot springs is 61 degrees Celsius."'),
              q(5, null, 'western', 'The speaker says "The springs emerge along the western edge of Hot Springs Mountain."'),
            ],
          },
          {
            id: 'l88-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What happened to the early wooden bathhouses?', ['They were moved to a museum.', 'They were often damaged by fire, water and steam.', 'They were taken over by the city.', 'They were washed away by the creek.'], 'B', 'The speaker says "those structures were frequently damaged by fires and from exposure to water and steam".'),
              mc(7, 'How did some of the springs get their names?', ['from the businessmen who owned them', 'from the part of the body their water was supposed to help', 'from the mountains nearby', 'from the people who discovered them'], 'B', 'The speaker says "Others were named after the part of the body that its waters could best help."'),
              mc(8, 'What are most of the buildings on Bathhouse Row used for today?', ['traditional water treatments', 'park shops and a visitor centre', 'hotel rooms for visitors', 'offices for park scientists'], 'B', 'The speaker says most no longer offer treatments; instead "they house park shops and the visitor\'s center".'),
            ],
          },
          {
            id: 'l88-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'The Buckstaff Bathhouse has been open without a break since ______.', '1912', 'The speaker says "The Buckstaff Bathhouse has operated continuously since 1912."'),
              q(10, 'The park has more than ______ kilometres of walking trails.', '43', 'The speaker says "Visitors can hike along the more than 43 kilometers of trails in the park."'),
            ],
          },
        ],
      }),
    ],
  },
};
