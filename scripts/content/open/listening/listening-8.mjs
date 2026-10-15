// Vocably Listening 8 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-8',
  title: 'Listening 8: The History of Happy',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'happy-thanksgiving',
        contextText: 'You will hear an English lesson about the history and modern use of the word "happy".',
        questionGroups: [
          {
            id: 'l8-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The word "happy"</strong></p><p>The lesson looks at the history and usage of "happy", a common five-letter {{q1}}. The speaker says that learning the history of words makes them seem like close {{q2}}. According to the Online Etymology Dictionary, "happy" originally meant {{q3}} as well as "very glad", and words for "happy" in most European languages had this same first meaning. The adjective is used much more often than the noun "happiness", according to an online database that examines thousands of {{q4}}. Today, "happy" is most commonly used after {{q5}} verbs.</p>',
            questions: [
              q(1, null, 'adjective', 'The speaker says "You will learn about the history and usage of this common, five-letter adjective".'),
              q(2, null, 'friends', 'The speaker says "words become like close friends".'),
              q(3, null, 'lucky', 'The speaker says "At the time, it meant" lucky, and that most European words for happy "first meant" lucky.'),
              q(4, null, 'books', 'The speaker says the Ngram Viewer is "an online database that examines thousands of books".'),
              q(5, null, 'linking', 'The speaker says "Perhaps the most common usage is after linking verbs."'),
            ],
          },
          {
            id: 'l8-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to Google\'s Ngram Viewer, which verb is most often used with "happy"?', ['feel', 'seem', 'be', 'look'], 'C', 'The speaker says "some of the most common structures involve the verb BE".'),
              mc(7, 'What are intensifiers?', ['verbs that connect a subject with its predicate', 'words that make an adjective stronger', 'nouns formed from adjectives', 'sentences without a subject'], 'B', 'The speaker says intensifiers are "words that make an adjective stronger".'),
            ],
          },
          {
            id: 'l8-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Apart from "so", which intensifier is most commonly used with "happy"?', 'very', 'The speaker says "Two of the most common, Google\'s Ngram Viewer tells us, are" so and very.'),
              q(9, 'What kind of sentence is "Happy Thanksgiving!"?', ['fragment', 'sentence fragment', 'incomplete sentence', 'incomplete'], 'The speaker says "These statements are a kind of sentence fragment, or an incomplete sentence."'),
              q(10, 'Which part of the sentence is missing from such statements?', ['subject', 'the subject'], 'The speaker says "There is no subject."'),
            ],
          },
        ],
      }),
    ],
  },
};
