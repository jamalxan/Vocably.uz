// Vocably Listening 107 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-107',
  title: 'Listening 107: Working Like a Charm',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'does-a-good-luck-charm-work-like-a-charm',
        contextText: 'You will hear a talk about the meanings of the word "charm" and two expressions that use it.',
        questionGroups: [
          {
            id: 'l107-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Meanings of "charm"</strong></p><ul><li>a word, action or thing believed to have {{q1}} power</li><li>a small item worn on a chain or a {{q2}}</li><li>a quality that attracts and {{q3}} people</li><li>in Cinderella, the prince is called Prince {{q4}}</li></ul>',
            questions: [
              q(1, null, 'magic', 'The speaker says "It can be a word, action, or thing believed to have magic power, to keep away evil, or to bring good luck."'),
              q(2, null, 'bracelet', 'The speaker says "It can be a small item worn on a chain or bracelet."'),
              q(3, null, 'pleases', 'The speaker says "Charm is also a quality that attracts and pleases people."'),
              q(4, null, 'Charming', 'The speaker says "In the story of Cinderella, the prince is called… Prince Charming."'),
            ],
          },
          {
            id: 'l107-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does something that "works like a charm" do?', ['It fails unexpectedly.', 'It works perfectly.', 'It takes a long time.', 'It costs very little.'], 'B', 'The speaker says "If something works like a charm it works perfectly."'),
              mc(6, 'Why did the roommate finally agree to look after Milo?', ['She had grown fond of the dog.', 'She was offered money.', 'She was told that many men come to play with the dog at the park.', 'She wanted to go boating herself.'], 'C', 'The dog owner says "I told her that when I take Milo to the dog park lots of men want to play with such a big, friendly dog."'),
              mc(7, 'How many of James\'s previous businesses failed?', ['one', 'two', 'three', 'none'], 'B', 'One friend asks "Didn\'t his past two businesses fail?" and the other replies "They did."'),
              mc(8, 'What is James\'s new business?', ['a dog park', 'a summer camp for dogs', 'a pet toy shop', 'a boat rental company'], 'B', 'The speaker says "He is opening a dog summer camp."'),
            ],
          },
          {
            id: 'l107-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'What are the boxes that James\'s friend is carrying filled with?', ['dog treats', 'treats', 'toys'], 'The friend says "Those boxes are filled with dog treats and toys."'),
              q(10, 'Which number did some cultures in history see as lucky?', ['three', '3'], 'The speaker says "Word experts say that some cultures throughout history viewed three as a lucky number."'),
            ],
          },
        ],
      }),
    ],
  },
};
