// Vocably Listening 3 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-3',
  title: 'Listening 3: An Old New York Subway Station',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'art-culture-of-an-old-new-york-train-station',
        contextText: 'You will hear a report about a beautiful but disused subway station in New York City.',
        questionGroups: [
          {
            id: 'l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the speaker say is the main concern of subway designers today?', ['that stations look impressive', 'that the systems function properly', 'that all trains run underground', 'that building costs stay low'], 'B', 'The speaker says "the main concern of subway designers is that their systems work correctly".'),
              mc(2, 'Why was City Hall Station built to look so grand?', ['to attract visitors from Europe', 'to show New York could rival European cities', 'to celebrate the opening of the subway in 1904', 'to please the city\'s politicians'], 'B', 'The speaker says "The goal was to demonstrate that New York could compete culturally with great European cities".'),
              mc(3, 'What is Clifton Hood\'s profession?', ['subway designer', 'museum guide', 'history professor', 'architect'], 'C', 'The speaker says "Hood is a history professor".'),
            ],
          },
          {
            id: 'l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Inside Old City Hall Station</strong></p><ul><li>the top of the station is not flat but {{q4}}</li><li>the high, rounded shape of the walls is called a {{q5}}</li><li>the hanging lights, known as {{q6}}, look like large pieces of jewellery</li><li>Polly Desjarlais has heard it described as a celebration of {{q7}}</li><li>the platform is only a little more than {{q8}} feet long</li></ul>',
            questions: [
              q(4, null, 'curved', 'The speaker says "the top is not flat in shape but curved instead".'),
              q(5, null, 'vault', 'The speaker says "The walls rise up to create a high, round shape known as a vault."'),
              q(6, null, 'chandeliers', 'The speaker says "Some of the lights in the station are called chandeliers."'),
              q(7, null, 'curves', 'Desjarlais says she has heard the station "be described as a celebration of curves".'),
              q(8, null, '200', 'Desjarlais says "the platform itself is just over 200 feet long".'),
            ],
          },
          {
            id: 'l3-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'How much do museum members pay to see the station?', ['50', '$50', '50 dollars'], 'The speaker says members "can see the station a few times a year at a cost of about $50".'),
              q(10, 'What prevented the station from becoming a restaurant?', ['security concerns', 'security'], 'The speaker says "security concerns put those ideas to rest".'),
            ],
          },
        ],
      }),
    ],
  },
};
