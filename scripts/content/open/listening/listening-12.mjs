// Vocably Listening 12 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-12',
  title: 'Listening 12: Curiosity Explores Mars',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'mars-explorer-arrives-at-new-area-in-search-for-evidence-of-water-life',
        contextText: 'You will hear a news report about a NASA rover searching for signs of water and life on Mars.',
        questionGroups: [
          {
            id: 'l12-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'Why was the Gediz Vallis Channel chosen for exploration?', ['It is close to where the rover landed.', 'Evidence suggests it once contained a lot of liquid water.', 'It is the highest point on Mars.', 'It can be seen clearly by the rover\'s cameras.'], 'B', 'The speaker says "the area was chosen because evidence suggested that it once held large amounts of liquid water".'),
              mc(2, 'How does the speaker describe Mars today?', ['a cold, dry desert', 'a planet covered in ice', 'a world with many small lakes', 'a hot, dusty place'], 'A', 'The speaker says "Mars is a cold, dry desert today."'),
              mc(3, 'What is believed to have created Gale Crater?', ['a volcano', 'a large meteor strike', 'an ancient river', 'melting snow'], 'B', 'The speaker says "A large meteor strike" billions of years ago "is believed to have formed the crater".'),
            ],
          },
          {
            id: 'l12-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Curiosity\'s recent work</strong></p><p>Since 2014: exploring Mount Sharp, about {{q4}} kilometres above the crater floor</p><p>↓</p><p>Studying how the channel formed: scientists reject {{q5}} as the cause, because the sides are too high</p><p>↓</p><p>From space, the channel looks like an ancient {{q6}}; it later filled with rocks and debris</p><p>↓</p><p>Next: examining formations that contain {{q7}}, salty minerals left behind when water evaporates</p>',
            questions: [
              q(4, null, ['five', '5'], 'The speaker says Mount Sharp "sits about five kilometers above the floor of Gale Crater".'),
              q(5, null, 'wind', 'The speaker says "NASA scientists said they do not think wind formed it because the sides of it are too high."'),
              q(6, null, 'riverbed', 'The speaker says "From space, the channel looks like an ancient riverbed, the agency said."'),
              q(7, null, 'sulfates', 'The speaker says "The first formations to be examined contain sulfates, which are salty minerals often created when liquid water evaporates."'),
            ],
          },
          {
            id: 'l12-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'The clay minerals found near Mount Sharp suggest that large amounts of water once interacted with ______.', 'rock', 'The speaker says "This suggests past interactions between large amounts of water and rock."'),
              q(9, 'NASA\'s other rover, Perseverance, has been exploring Jezero Crater since September ______.', '2021', 'The speaker says Perseverance "has been exploring the planet\'s Jezero Crater since September 2021".'),
              q(10, 'The rovers\' samples are expected to be brought back to Earth in ______.', '2028', 'The speaker says the joint NASA-ESA mission "is planned for 2028".'),
            ],
          },
        ],
      }),
    ],
  },
};
