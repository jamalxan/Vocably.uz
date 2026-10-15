// Vocably Listening 90 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-90',
  title: 'Listening 90: The Everglades',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'everglades-national-park-liquid-heart-of-florida',
        contextText: 'You will hear a talk about a huge wetland park in Florida and the changes people have made to it.',
        questionGroups: [
          {
            id: 'l90-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Everglades National Park</strong></p><ul><li>the largest {{q1}} wilderness in the United States</li><li>covers over {{q2}} hectares of wetlands</li><li>officially opened in 1947 by President {{q3}}</li><li>described by the writer Marjory Stoneman Douglas as the liquid {{q4}} of Florida</li></ul>',
            questions: [
              q(1, null, 'subtropical', 'The speaker says the park is "the largest subtropical wilderness" in the country.'),
              q(2, null, ['600,000', '600000'], 'The speaker says it is "covering more than 600,000 hectares of wetlands".'),
              q(3, null, 'Truman', 'The speaker says "In 1947, President Harry Truman spoke at the official opening of Everglades National Park."'),
              q(4, null, 'heart', 'The speaker says she described the area as "the liquid heart of Florida".'),
            ],
          },
          {
            id: 'l90-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Which plant does the speaker warn visitors to be careful of?', ['the mangrove', 'the gumbo-limbo tree', 'sawgrass', 'the royal palm'], 'C', 'The speaker says "Be careful – sawgrass is very sharp, with teeth just like a saw."'),
              mc(6, 'Why do most visitors prefer to come in the dry season?', ['The weather is cooler.', 'Insects are less of a problem.', 'More animals can be seen.', 'The park is less crowded.'], 'B', 'The speaker says it is "the favorite of most visitors, when insects like mosquitoes are less of a problem".'),
              mc(7, 'What makes the Everglades unusual, according to the speaker?', ['It is the only home of the Florida panther.', 'Alligators and crocodiles live in the same area.', 'Its birds cannot be seen anywhere else.', 'It has no dry land at all.'], 'B', 'The speaker says it is "one of the only places in the world where freshwater alligators and saltwater crocodiles live in the same area".'),
            ],
          },
          {
            id: 'l90-flow', type: 'flowchart_completion', wordLimit: W1W,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>How people changed the Everglades</strong></p><p>1880s: developers dig {{q8}} to lower the water level</p><p>↓</p><p>1905–1910: more of the wetland is drained and {{q9}} are built on large areas of land</p><p>↓</p><p>Mid-century: the government builds roads, canals and water-control systems</p><p>↓</p><p>Today: the number of wading birds has fallen by {{q10}} percent</p><p>↓</p><p>2000: Congress approves a plan to restore the Everglades</p>',
            questions: [
              q(8, null, 'canals', 'The speaker says "developers began digging canals to reduce water levels".'),
              q(9, null, 'farms', 'The speaker says "Farms were built on large pieces of land."'),
              q(10, null, ['90', 'ninety'], 'The speaker says "Populations of wading birds have been reduced by 90 percent."'),
            ],
          },
        ],
      }),
    ],
  },
};
