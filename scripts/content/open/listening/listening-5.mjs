// Vocably Listening 5 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

/** multiple_choice_multi savoli: `multi(5, 'savol', ['a','b','c','d','e'], ['B','D'], 'izoh')` */
const multi = (number, promptHtml, texts, accepted, explanationHtml) => ({
  number, promptHtml, options: texts.map((text, i) => ({ key: 'ABCDE'[i], text })), selectCount: accepted.length, answer: { accepted }, explanationHtml,
});

export default {
  slug: 'vocably-listening-5',
  title: 'Listening 5: Talking about Aliens',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'discussing-alien-life',
        contextText: 'You will hear an English lesson about the language people use when they discuss the possibility of alien life.',
        questionGroups: [
          {
            id: 'l5-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Talking about aliens</strong></p><ul><li>strange objects seen in the sky are sometimes called {{q1}}</li><li>to "believe" something means to accept it as {{q2}}</li><li>possibility = the {{q3}} of something happening</li><li>in the dialogue, Joy thinks the UFOs are probably kept in Area {{q4}}</li></ul>',
            questions: [
              q(1, null, 'UFOs', 'The speaker mentions "strange objects in the skies, sometimes called UFOs".'),
              q(2, null, 'true', 'The speaker says to believe something "means to accept something as true".'),
              q(3, null, 'likelihood', 'The speaker says "Possibility is the likelihood of something happening."'),
              q(4, null, '51', 'Joy says "The UFOs are probably held in Area 51!"'),
            ],
          },
          {
            id: 'l5-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, <strong>A-E</strong>.',
            questions: [
              multi(5, 'Which TWO adverbs does the speaker give as examples of a weaker chance of something happening?', ['definitely', 'maybe', 'certainly', 'perhaps', 'clearly'], ['B', 'D'], 'The speaker lists "adverbs to show a weaker chance or probability of something occurring" - maybe, probably and perhaps.'),
              multi(6, 'Which TWO adverbs does Joy use to add emphasis and confidence to her opinions?', ['maybe', 'certainly', 'probably', 'clearly', 'perhaps'], ['B', 'D'], 'The speaker says the adverbs certainly and clearly "are used to add emphasis and confidence".'),
            ],
          },
          {
            id: 'l5-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(7, 'Where are adverbs of possibility usually placed in a sentence?', ['at the end of the sentence', 'before the main verb', 'immediately after the subject', 'after the object'], 'B', 'The speaker says "Typically, we place adverbs before the main verb in the sentence."'),
              mc(8, 'When a sentence contains an auxiliary verb such as "be" or "have", the adverb goes', ['before the auxiliary verb.', 'after the base verb.', 'between the auxiliary verb and the base verb.', 'at the start of the sentence.'], 'C', 'The speaker says "Adverbs always come after the auxiliary verb, but before the base verb".'),
              mc(9, 'What punctuation usually follows an interjection?', ['a question mark', 'a comma', 'an exclamation mark', 'a full stop'], 'C', 'The speaker says interjections "usually have an exclamation mark".'),
              mc(10, 'What does the speaker ask listeners to do at the end of the lesson?', ['send their opinions by email', 'watch a video about UFOs', 'practise the dialogue with a friend', 'read a news report about aliens'], 'A', 'The speaker says "Share your opinions of aliens using the expressions and grammar above." and asks listeners to "Let us know in an email".'),
            ],
          },
        ],
      }),
    ],
  },
};
