// Vocably Listening 130 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-130',
  title: 'Listening 130: Gilding the Lily',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'no-need-to-gild-the-lily',
        contextText: 'You will hear a talk about the words "gilt" and "gild" and the idiom "gild the lily".',
        questionGroups: [
          {
            id: 'l130-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Gilt and gild</strong></p><ul><li>gilt (noun) – gold, or something that looks like gold, laid on a {{q1}}</li><li>often added to a plain material such as {{q2}} to improve its appearance</li><li>Mark Twain\'s novel <em>The Gilded Age</em> – published in {{q3}}</li><li>the novel made fun of the newly {{q4}}, who covered objects with thin gold</li></ul>',
            questions: [
              q(1, null, 'surface', 'The speaker says "Gilt as a noun is the gold, or something that looks like gold, laid on a surface."'),
              q(2, null, 'wood', 'The speaker says "Sometimes we add gilt to a plain material like wood to make it look better."'),
              q(3, null, '1873', 'The speaker says "In the 1873 novel, The Gilded Age: A Tale of Today".'),
              q(4, null, 'rich', 'The speaker says Twain and his co-writer "made fun of newly rich people".'),
            ],
          },
          {
            id: 'l130-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What is the problem with the bright gold frame in the Mona Lisa example?', ['It would damage the painting.', 'It makes the woman\'s smile hard to see.', 'It would be far too expensive.', 'It does not match the museum walls.'], 'B', 'The speaker says "The frame is so bright that it is hard to see the smile on the famous woman."'),
              mc(6, 'Why is the speaker\'s friend "gilding the lily" when she wears makeup?', ['She wears far too much of it.', 'She is already naturally attractive.', 'Makeup is a waste of money.', 'She works as an artist.'], 'B', 'The speaker says "my friend has good bone structure and lovely skin. She\'s just gilding the lily when she wears makeup."'),
              mc(7, 'What was the tall structure in the garden made of?', ['gold', 'carved wood', 'stained glass', 'white stone'], 'C', 'The speaker says the structure was made "of stained glass, like church windows".'),
            ],
          },
          {
            id: 'l130-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'In the conversation, what did the second speaker say there were too many of on the birthday cake?', ['sprinkles', 'the sprinkles'], 'The second speaker says "you really went overboard with the sprinkles".'),
              q(9, 'According to Merriam-Webster, which writer does the expression come from?', 'Shakespeare', 'The speaker says "The website says that gild the lily comes from Shakespeare."'),
              q(10, 'Which verb was used instead of "gild" in the original line from the play King John?', 'paint', 'The speaker says "In his play The Life and Death of King John the line is actually to paint the lily."'),
            ],
          },
        ],
      }),
    ],
  },
};
