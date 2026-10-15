// Vocably Listening 78 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-78',
  title: 'Listening 78: Theodore Roosevelt National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-theodore-roosevelt-national-park-dakota',
        contextText: 'You will hear a talk about a national park in North Dakota named after President Theodore Roosevelt.',
        questionGroups: [
          {
            id: 'l78-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Roosevelt in the Dakota Territory</strong></p><p>September {{q1}}: Roosevelt arrives in Dakota, hoping to hunt {{q2}}</p><p>↓</p><p>He invests ${{q3}} in building the Maltese Cross Ranch</p><p>↓</p><p>February 1884: his mother and his wife die on the same day</p><p>↓</p><p>Summer 1884: he builds a second, more remote ranch called {{q4}}</p><p>↓</p><p>{{q5}}: he publishes his first book, predicting that cattle ranching in the badlands would not last</p><p>↓</p><p>1886-87: severe winter weather kills over half his cattle and he leaves the business</p>',
            questions: [
              q(1, null, '1883', 'The speaker says "Theodore Roosevelt came to Dakota Territory in September 1883."'),
              q(2, null, 'bison', 'The speaker says "He came to Dakota in hopes of hunting huge animals called bison."'),
              q(3, null, ['14,000', '14000'], 'The speaker says "Roosevelt invested $14,000 to build the Maltese Cross Ranch."'),
              q(4, null, 'Elkhorn', 'The speaker says "He called that ranch Elkhorn."'),
              q(5, null, '1885', 'The speaker says "In 1885, Roosevelt published his first book about his experiences as a rancher and hunter."'),
            ],
          },
          {
            id: 'l78-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the speaker, what are badlands?', ['wet areas with thick forest', 'very dry places with little vegetation', 'farmland that has been abandoned', 'mountains covered in snow'], 'B', 'The speaker says "Badlands are very dry places with little vegetation."'),
              mc(7, 'Why is Painted Canyon so called?', ['An artist once lived there.', 'Native Americans painted its walls.', 'Its exposed rocks are colourful.', 'It turns red at sunset.'], 'C', 'The speaker says "It gets its name from the colorful exposed rocks there."'),
            ],
          },
          {
            id: 'l78-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Exploring the park</strong></p><ul><li>prairie dogs near Painted Canyon are not dogs but {{q8}}</li><li>North Unit: the Achenbach trail is {{q9}} kilometres long and crosses the Little Missouri River</li><li>Elkhorn Ranch Unit: the cabin has gone; only {{q10}} remain where it once stood</li></ul>',
            questions: [
              q(8, null, 'rodents', 'The speaker says "These animals are not really dogs. They are rodents."'),
              q(9, null, '28', 'The speaker says "The Achenbach trail is a 28-kilometer-long path."'),
              q(10, null, 'rocks', 'The speaker says "Visitors will find only stone rocks where the cabin once was."'),
            ],
          },
        ],
      }),
    ],
  },
};
