// Vocably Listening 13 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-13',
  title: 'Listening 13: A Mammoth Tusk in a Coal Mine',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'miners-find-mammoth-remains-buried-in-north-dakota',
        contextText: 'You will hear a news report about an unusual discovery made by workers at a coal mine.',
        questionGroups: [
          {
            id: 'l13-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The discovery</strong></p><ul><li>the first worker to notice something white was operating a {{q1}}</li><li>the tusk is {{q2}} metres long</li><li>mammoths disappeared from the area about {{q3}} years ago</li><li>the workers stopped digging and called in {{q4}}</li><li>the tusk could be as much as {{q5}} years old</li></ul>',
            questions: [
              q(1, null, 'shovel', 'The speaker says "The worker, a shovel operator, saw something white".'),
              q(2, null, ['2', 'two'], 'The speaker says "a 2-meter-long mammoth tusk that had been buried for thousands of years".'),
              q(3, null, ['10,000', '10000'], 'The speaker says "The animal went extinct, or disappeared, about 10,000 years ago".'),
              q(4, null, 'experts', 'The speaker says "the workers stopped digging in the area and called in experts".'),
              q(5, null, ['100,000', '100000'], 'The speaker says the tusk is "anywhere from 10,000 to 100,000 years old".'),
            ],
          },
          {
            id: 'l13-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why did Jeff Person call the find "miraculous"?', ['The tusk survived the heavy machinery used at the mine.', 'It was the first mammoth ever found in North Dakota.', 'The tusk was found by a worker at night.', 'The tusk was in perfect condition.'], 'A', 'The speaker says the tusk "had not been more damaged, considering the large equipment that miners use at the site".'),
              mc(7, 'What is unusual about this discovery in North Dakota?', ['Many bones from one animal were found together.', 'The bones were frozen in ice.', 'Only a single tooth was found.', 'The bones belonged to two animals.'], 'A', 'The speaker says "It is likely the most complete mammoth found in North Dakota, where it is more common to find one mammoth bone, tooth or piece of a tusk."'),
              mc(8, 'According to Paul Ullmann, why are mammoth remains rare in the area?', ['Moving ice sheets destroyed them.', 'Coal mining has crushed them.', 'The animals never lived there.', 'They were taken to other states.'], 'A', 'The speaker says "Many remains of the animals alive during the last Ice Age were destroyed by movements of ice sheets".'),
            ],
          },
          {
            id: 'l13-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'The tusk was wrapped in ______ to control how quickly it dries out.', 'plastic', 'The speaker says "Experts covered the tusk in plastic in order to control how fast the tusk loses water."'),
              q(10, 'The bones will be given to the state for ______ purposes.', 'educational', 'The speaker says "The mining company plans to donate the bones to the state for educational purposes."'),
            ],
          },
        ],
      }),
    ],
  },
};
