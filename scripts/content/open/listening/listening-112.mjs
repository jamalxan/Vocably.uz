// Vocably Listening 112 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-112',
  title: 'Listening 112: Visiting Every National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'young-traveler-hopes-to-visit-every-national-park-in-america',
        contextText: 'You will hear a report about a young man who plans to visit every site in the US National Park system.',
        questionGroups: [
          {
            id: 'l112-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Mikah Meyer\'s road trip</strong></p><ul><li>Meyer is {{q1}} years old when the trip begins</li><li>aims to see all {{q2}} National Park Service sites in one continuous journey</li><li>his father died at the age of {{q3}}</li><li>the trip starts on Father\'s Day, June {{q4}}</li><li>there are about {{q5}} national parks within 30 miles of his home in Washington</li></ul>',
            questions: [
              q(1, null, '30', 'The speaker says "At 30 years old, he is about to start an all-American road trip".'),
              q(2, null, '411', 'The speaker says "he will become the youngest person to visit all 411 sites within the National Park Service".'),
              q(3, null, '58', 'Meyer says "My dad passed away at age 58 before he got to retire".'),
              q(4, null, '19', 'The speaker says "Meyer will start his trip on June 19, Father\'s Day in the United States".'),
              q(5, null, '40', 'Meyer says "there were about 40 national parks within 30 miles of my house".'),
            ],
          },
          {
            id: 'l112-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What was Meyer\'s original plan?', ['to visit the 59 major national parks', 'to visit only the sites near Washington', 'to visit a national park in each of the 50 states', 'to visit the Grand Canyon and Yellowstone only'], 'A', 'The speaker says "Meyer\'s first plan was to visit all 59 of the major national parks in America".'),
              mc(7, 'How long is the whole trip expected to take?', ['about one year', 'about three years', 'about four years', 'until he retires'], 'B', 'The speaker says "He will be on the road for about three years, driving and living in a special van."'),
              mc(8, 'Which site gave Meyer his first passport stamp of the trip?', ['the Grand Canyon', 'the Washington Monument', 'the Lincoln Memorial', 'Yellowstone National Park'], 'B', 'The speaker says "His first stamp of the trip came from his visit to the Washington Monument."'),
            ],
          },
          {
            id: 'l112-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'How many jobs did Meyer work while saving for the trip?', ['two', '2'], 'The speaker says "He saved for his trip for four years and worked two jobs."'),
              q(10, 'What is the average age of a visitor to Yellowstone National Park?', '54', 'The speaker says "The average age of visitors to Yellowstone National Park, for example, is 54."'),
            ],
          },
        ],
      }),
    ],
  },
};
