// Vocably Listening 122 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-122',
  title: 'Listening 122: Isle Royale National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-peace-and-solitude-nps-100',
        contextText: 'You will hear a talk about a remote island national park in the United States.',
        questionGroups: [
          {
            id: 'l122-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Isle Royale National Park</strong></p><ul><li>lies in Lake {{q1}}, the largest freshwater lake on Earth by area</li><li>no {{q2}} or other wheeled vehicles allowed</li><li>crossing by shuttle boat takes {{q3}} to five hours</li><li>the main island is {{q4}} kilometres long</li><li>became a national park in {{q5}}</li></ul>',
            questions: [
              q(1, null, 'Superior', 'The speaker says "Isle Royale is surrounded by the deep blue waters of Lake Superior, the largest freshwater lake on Earth by area."'),
              q(2, null, 'cars', 'The speaker says "No cars or other wheeled vehicles are permitted on Isle Royale."'),
              q(3, null, ['three', '3'], 'The speaker says the trip to Isle Royale "takes three to five hours".'),
              q(4, null, '72', 'The speaker says "It is 72 kilometers long."'),
              q(5, null, '1940', 'The speaker says "Isle Royale became a national park in 1940."'),
            ],
          },
          {
            id: 'l122-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'How long do visitors to Isle Royale usually stay?', ['about four hours', 'about one day', 'about 3.5 days', 'about a week'], 'C', 'The speaker says "The average stay for visitors to Isle Royale National Park is 3.5 days."'),
              mc(7, 'Why are the shipwrecks around the island in such good condition?', ['The Park Service repairs them regularly.', 'The very cold water preserves them.', 'They sank only recently.', 'Divers are not allowed to touch them.'], 'B', 'The speaker says "The extremely cold waters of Lake Superior help keep shipwrecks in excellent condition."'),
              mc(8, 'What do many divers photograph on the wreck of the America?', ['the ballroom', 'the passengers\' mail', 'a flag painted on the engine', 'the ship\'s name'], 'C', 'The speaker says "Painted on the ship\'s engine is an American flag. Many divers take pictures of this sight."'),
            ],
          },
          {
            id: 'l122-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'The Rock Harbor lighthouse was built to guide ships to the island\'s ______ mines.', 'copper', 'The speaker says "Workers built the lighthouse in the 1850s to help guide ships safely to the island\'s copper mines."'),
              q(10, 'In early 2016 researchers counted only ______ wolves left on the island.', ['two', '2'], 'The speaker says "researchers from Michigan Tech University observed just two remaining wolves on Isle Royale".'),
            ],
          },
        ],
      }),
    ],
  },
};
