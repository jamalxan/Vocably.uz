// Vocably Listening 65 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-65',
  title: 'Listening 65: Grammar from the Film Titanic',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'titanic-and-english-grammar',
        contextText: 'You will hear a talk that uses a scene from the film Titanic to explain tag questions and polite speech.',
        questionGroups: [
          {
            id: 'l65-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The film and the scene</strong></p><ul><li>Titanic was released in {{q1}}</li><li>the real ship sank in {{q2}}</li><li>a tag question is a short question added to a {{q3}}</li><li>Jack (Leonardo DiCaprio) is poor and does not have a {{q4}}</li></ul>',
            questions: [
              q(1, null, '1997', 'The speaker says "The 1997 film Titanic is one of the most popular movies ever made."'),
              q(2, null, '1912', 'The speaker says "The film is a love story set against the sinking of the famous ship in 1912."'),
              q(3, null, 'statement', 'The speaker says "A tag question is a short question added to a statement."'),
              q(4, null, 'home', 'The speaker says "He does not have a home."'),
            ],
          },
          {
            id: 'l65-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does the wealthy woman ask Jack?', ['whether he enjoys his homeless life', 'where his family comes from', 'how he got a ticket for the ship', 'whether he likes the dinner'], 'A', 'The speaker says "She asks if he enjoys his homeless life."'),
              mc(6, 'What is the main verb in the woman\'s statement?', ['find', 'appealing', 'do', 'existence'], 'A', 'The speaker says "Notice that the main verb is find."'),
              mc(7, 'When a statement uses a verb other than "be", what does the tag question often use?', ['the same verb again', 'an auxiliary verb such as do or have', 'a modal verb', 'only a pronoun'], 'B', 'The speaker says "then the tag question often uses an auxiliary verb such as do or have".'),
            ],
          },
          {
            id: 'l65-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(8, 'Speakers often say "well" when they are about to give an ______.', 'explanation', 'The speaker says "Speakers often use well when giving an explanation."'),
              q(9, 'Americans do not use the word "ma\'am" together with a woman\'s ______.', 'name', 'The speaker says "Americans do not use the term ma\'am along with a woman\'s name."'),
              q(10, 'The speaker advises choosing a clip from a film or show you have ______ before.', 'seen', 'The speaker says "perhaps a film or a show that you have seen before".'),
            ],
          },
        ],
      }),
    ],
  },
};
