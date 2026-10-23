// Vocably Listening 134 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-134',
  title: 'Listening 134: Idioms from a Deck of Cards',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'show-your-hand-other-card-idioms',
        contextText: 'You will hear a talk about English idioms that come from playing cards.',
        questionGroups: [
          {
            id: 'l134-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Playing cards</strong></p><ul><li>a popular pastime for people of all {{q1}}</li><li>a set of cards is called a {{q2}} – cheap and sold almost anywhere</li><li>one set contains {{q3}} cards</li><li>the cards a player is dealt are known as their {{q4}}</li></ul>',
            questions: [
              q(1, null, 'ages', 'The speaker says "Playing cards is a popular pastime for people of all ages."'),
              q(2, null, 'deck', 'The speaker says "A set of playing cards is called a deck."'),
              q(3, null, '52', 'The speaker says "With one deck of 52 cards, you can play many different games."'),
              q(4, null, 'hand', 'The speaker says "the cards you are dealt and play with are called your hand".'),
            ],
          },
          {
            id: 'l134-idioms', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each idiom mean? Choose the correct letter, <strong>A-F</strong>.',
            bank: bank(['keep your plans and methods secret', 'reveal plans you had kept hidden', 'accept things that are out of your control', 'cheat in order to gain an unfair advantage', 'win a game by luck alone', 'force another player to show their cards']),
            questions: [
              q(5, 'keep your cards close to your chest', 'A', 'The speaker says "This idiom means to keep your plans, intentions or methods secret."'),
              q(6, 'lay your cards on the table', 'B', 'The speaker says "When we put our cards on the table, we show something that we have kept hidden."'),
              q(7, 'play the hand you are dealt', 'C', 'The speaker says "Sometimes we must deal with things that are out of our control. We must play with the cards we are dealt."'),
              q(8, 'stack the deck', 'D', 'The speaker says "When you stack the deck, you add cards to the deck that will help you win. This gives you an unfair advantage."'),
            ],
          },
          {
            id: 'l134-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'In many card games, what must players do at some point?', ['hold their cards against their chest', 'place their cards face up on the table', 'add more cards to the deck', 'give their cards to another player'], 'B', 'The speaker says "the players must show their cards by placing them face up on the table for everyone to see".'),
              mc(10, 'What is true when "the deck is stacked against you"?', ['You are certain to win.', 'You have been given a good hand.', 'The odds are not in your favour.', 'You have cheated the other players.'], 'C', 'The speaker says "if the deck is stacked against you, the odds are not in your favor".'),
            ],
          },
        ],
      }),
    ],
  },
};
