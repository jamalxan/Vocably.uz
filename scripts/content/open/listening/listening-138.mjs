// Vocably Listening 138 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-138',
  title: "Listening 138: Running America's National Parks",
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'us-park-service-director-has-a-dream-job',
        contextText: 'You will hear a report about the US National Park Service and an interview with its director.',
        questionGroups: [
          {
            id: 'l138-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The US National Park Service</strong></p><ul><li>more than {{q1}} million visitors from around the world each year</li><li>this year: its {{q2}} anniversary</li><li>Director Jonathan Jarvis: {{q3}} years with the service, director since 2009</li><li>parks cover over 32 million {{q4}}, from Guam to the Virgin Islands to Alaska</li><li>{{q5}} sites in all</li></ul>',
            questions: [
              q(1, null, '300', 'The speaker says "More than 300 million people from around the world visit America\'s national parks each year."'),
              q(2, null, ['100th', '100'], 'The speaker says "This year it is celebrating its centennial, or 100th anniversary."'),
              q(3, null, '40', 'The speaker says "He has worked at the park service for 40 years, and been the director since 2009."'),
              q(4, null, 'hectares', 'The speaker says "They cover over 32 million hectares from Guam to the Virgin Islands to Alaska."'),
              q(5, null, '412', 'The speaker says "There are 412 sites in all."'),
            ],
          },
          {
            id: 'l138-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to Jarvis, what makes the Park Service different from other federal agencies?', ['It has the most employees.', 'It is responsible for making sure the public has fun.', 'It is the oldest agency.', 'It manages the most land.'], 'B', 'Jarvis says "the National Park Service is the only federal agency with the responsibility to ensure the public actually has fun".'),
              mc(7, 'What story does the Manzanar National Historic Site tell?', ['the Civil War battles in California', 'the building of the first railroads', 'the internment of Japanese-Americans during World War Two', 'the life of President Franklin Roosevelt'], 'C', 'The speaker says "This is the place that tells the story of the internment of Japanese-Americans in military-like camps during World War Two."'),
              mc(8, 'What does Jarvis say about the glaciers in Glacier National Park?', ['They are growing again.', 'They have already disappeared.', 'They are protected from warming temperatures.', 'They will disappear within 20 to 25 years.'], 'D', 'The speaker says Jarvis "says they will be" gone "within 20-25 years".'),
            ],
          },
          {
            id: 'l138-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'How many volunteers help the Park Service?', ['400,000', '400000'], 'The speaker says "The agency has 22,000 employees and gets help from another 400,000 volunteers."'),
              q(10, 'How much longer are wildfires burning than in the past?', ['a month', 'month'], 'The speaker says the wildfires "are burning" at least "a month longer" than in years past.'),
            ],
          },
        ],
      }),
    ],
  },
};
