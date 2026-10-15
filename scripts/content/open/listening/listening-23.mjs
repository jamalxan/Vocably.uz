// Vocably Listening 23 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

/** Ikki javobli MC: `multi(8, 'savol', ['a','b','c','d','e'], ['A','B'], 'izoh')` */
const multi = (number, promptHtml, texts, accepted, explanationHtml) => ({
  number,
  promptHtml,
  options: texts.map((text, i) => ({ key: 'ABCDEFGH'[i], text })),
  selectCount: accepted.length,
  answer: { accepted },
  explanationHtml,
});

export default {
  slug: 'vocably-listening-23',
  title: 'Listening 23: Saying Goodbye to the Lawn',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'some-americans-want-fewer-grass-lawns',
        contextText: 'You will hear a report about a family who replaced their grass lawn with native plants.',
        questionGroups: [
          {
            id: 'l23-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Replacing lawns</strong></p><ul><li>instead of grass, the Crouches have small trees and many {{q1}} plants</li><li>replacing a lawn with native plants is called {{q2}}</li><li>the number of Americans planning to plant wildflowers {{q3}} between 2019 and 2021</li><li>by 2021 the figure had reached {{q4}} percent</li><li>the Crouches\' neighbours complained to the homeowner\'s {{q5}}</li></ul>',
            questions: [
              q(1, null, 'native', 'The speaker says "they have some small trees and many native plants".'),
              q(2, null, 'rewilding', 'The speaker says "The process is called rewilding."'),
              q(3, null, 'doubled', 'The speaker says the number of Americans planning to turn part of their lawn to native wildflowers "doubled between 2019 and 2021".'),
              q(4, null, '19', 'The speaker says "By 2021, it rose to 19 percent."'),
              q(5, null, 'association', 'The speaker says "People living in a house next to them complained to their homeowner\'s association".'),
            ],
          },
          {
            id: 'l23-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What did the HOA tell the Crouches to do?', ['remove their native plants and plant grass', 'pay a large fine', 'move to another neighbourhood', 'cut down their trees'], 'A', 'The speaker says "The HOA ordered the Crouches to pull out their native plants and put in grass."'),
              mc(7, 'Why are lawns called environmental dead zones?', ['They give wildlife no food or shelter.', 'They turn brown in summer.', 'They kill nearby trees.', 'Nothing can grow on them.'], 'A', 'The speaker says lawns are called environmental dead zones "in part because they provide no food or shelter for wildlife".'),
            ],
          },
          {
            id: 'l23-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, <strong>A-E</strong>, for each question.',
            questions: [
              multi(8, 'Which TWO reasons does Ted Steinberg give for lawns being bad for the environment?', ['They need a lot of water.', 'They need chemicals.', 'They attract harmful insects.', 'They take up too much land.', 'They are expensive to mow.'], ['A', 'B'], 'The speaker says "He said they require a lot of water and chemicals."'),
              multi(9, 'Which TWO things does the speaker say about Nancy Lawson?', ['She wrote The Humane Gardener.', 'She is Janet Crouch\'s sister.', 'She works for the HOA.', 'She is a scientist.', 'She lives next door to the Crouches.'], ['A', 'B'], 'The speaker says "Nancy Lawson is the writer of The Humane Gardener and Wildscapes" and "She is also Janet Crouch\'s sister".'),
              multi(10, 'Which TWO things does the speaker say about the Crouches\' fight with the HOA?', ['It cost them $60,000.', 'It led to a new law in Maryland.', 'It lasted ten years.', 'They lost the case.', 'They had to sell their house.'], ['A', 'B'], 'The speaker says "They say they spent $60,000 fighting to keep their natural garden" and "the state of Maryland passed a law that lets people grow native plants instead of grass".'),
            ],
          },
        ],
      }),
    ],
  },
};
