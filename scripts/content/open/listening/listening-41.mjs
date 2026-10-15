// Vocably Listening 41 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-41',
  title: 'Listening 41: Pitch Humming',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-pronunciation-pitch-humming',
        contextText: 'You will hear an education programme about improving pronunciation with a technique called pitch humming.',
        questionGroups: [
          {
            id: 'l41-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Tamara Jones on pronunciation</strong></p><ul><li>works at a community college in the state of {{q1}}</li><li>learners often think they are understood if they pronounce individual sounds {{q2}}</li><li>other parts of pronunciation: rhythm, intonation and word {{q3}}</li><li>together these are called the {{q4}} of English</li></ul>',
            questions: [
              q(1, null, 'Maryland', 'The speaker says she works at "Howard Community College in the American state of Maryland".'),
              q(2, null, 'clearly', 'The speaker says learners think they can be understood "if all they do is pronounce individual sounds clearly".'),
              q(3, null, 'emphasis', 'The speaker says "Other parts of pronunciation include rhythm, intonation, and word emphasis."'),
              q(4, null, 'music', 'The speaker says "Together, they form what we call the \'music of English.\'"'),
            ],
          },
          {
            id: 'l41-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'How do English speakers give two grammatically identical sentences different meanings?', ['by changing the word order', 'by using pitch', 'by adding extra words', 'by speaking more slowly'], 'B', 'The speaker says "speakers use pitch -- high or low sounds -- to give sentences different meanings".'),
              mc(6, 'What does Jones mean when she stresses the word "coffee"?', ['The coffee was the best part of the breakfast.', 'She did not drink the coffee.', 'The rest of the breakfast was probably not very good.', 'She wants more coffee.'], 'C', 'Jones says "probably the rest of the breakfast was not very good".'),
              mc(7, 'What do learners NOT need to do when they practise pitch humming?', ['listen to a speaker', 'understand every word', 'copy the up and down patterns', 'hum along with the voice'], 'B', 'The speaker says "You do not even need to understand all of the words they are saying".'),
            ],
          },
          {
            id: 'l41-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Learners should start by listening to a brief radio or television ______.', 'broadcast', 'The speaker says learners should start "by listening to a brief radio or television broadcast".'),
              q(9, 'A capable speaker who learned English as a ______ language can also be a good model.', 'second', 'The speaker says learners can listen to "a capable English speaker who has learned English as a second language".'),
              q(10, 'Ideally, the model speaker should share the learner\'s ______ language.', 'native', 'The speaker says "Ideally, she says, the speaker will share the learner\'s native language."'),
            ],
          },
        ],
      }),
    ],
  },
};
