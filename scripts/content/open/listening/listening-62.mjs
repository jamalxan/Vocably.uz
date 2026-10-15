// Vocably Listening 62 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS' };

const multi = (number, promptHtml, texts, accepted, explanationHtml) => ({
  number, promptHtml, selectCount: accepted.length,
  options: texts.map((text, i) => ({ key: 'ABCDE'[i], text })),
  answer: { accepted }, explanationHtml,
});

export default {
  slug: 'vocably-listening-62',
  title: 'Listening 62: Four Ways to Study Better',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'ways-to-make-studying-more-powerful',
        contextText: 'You will hear a talk about four methods that make studying more effective.',
        questionGroups: [
          {
            id: 'l62-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              multi(1, 'Which TWO rewards does the speaker suggest when the Pomodoro timer goes off?', ['listening to music', 'having a cup of tea', 'checking your email', 'sending a text message', 'going for a walk'], ['A', 'B'], 'The speaker says "you can reward yourself by listening to some music or having a drink of tea".'),
              multi(2, 'Which TWO kinds of questions does the speaker recommend adding to flash cards?', ['why questions', 'how questions', 'what questions', 'when questions', 'who questions'], ['A', 'B'], 'The speaker says "be sure to make other kinds of questions" such as "why questions or how questions".'),
            ],
          },
          {
            id: 'l62-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Interleaving and teaching</strong></p><ul><li>"blocked" practice = studying only one {{q3}} at a time</li><li>interleaving = mixing topics, e.g. testing yourself on vocabulary and then on {{q4}}</li><li>2020 study of maths classes: one {{q5}} later, students took a surprise test</li><li>the interleaved group scored {{q6}}% compared with 38% for the blocked group</li><li>students who teach a lesson gain a deeper and more {{q7}} understanding</li></ul>',
            questions: [
              q(3, null, 'topic', 'The speaker says "they only study one topic at a time".'),
              q(4, null, 'grammar', 'The speaker says "you might spend time testing yourself on vocabulary words and then test yourself on grammar".'),
              q(5, null, 'month', 'The speaker says "One month later, students took a surprise test."'),
              q(6, null, ['61', '61%'], 'The speaker says "The interleaved group outscored the blocked group, 61% versus 38%".'),
              q(7, null, 'persistent', 'The speaker says students who teach "develop a deeper and more persistent understanding of the material".'),
            ],
          },
          {
            id: 'l62-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.',
            questions: [
              q(8, 'According to David Robson, what could you draft to explain what you have learned if you are alone?', ['an email', 'email'], 'The speaker quotes Robson: "you could imagine describing it to someone, or draft an email".'),
              q(9, 'What happens to your brain when you focus on tasks at the right level of difficulty?', ['it becomes tired', 'it gets tired', 'tired'], 'The speaker says "your brain will become tired".'),
              q(10, 'What will a future Education Tips story be about?', ['rest and recovery', 'rest and recover', 'resting', 'rest'], 'The speaker says "you will surely need to rest and recover" and that topic will be explored in a future story.'),
            ],
          },
        ],
      }),
    ],
  },
};
