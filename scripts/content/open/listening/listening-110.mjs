// Vocably Listening 110 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-110',
  title: 'Listening 110: Ups and Downs, Highs and Lows',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'ups-and-downs-highs-and-lows',
        contextText: 'You will hear a talk about English expressions that use the words "down", "low" and "high".',
        questionGroups: [
          {
            id: 'l110-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each expression mean? Choose the correct letter, <strong>A-G</strong>.',
            bank: bank(['to be poor', 'to feel unhappy', 'to keep information secret', 'to get information', 'to behave in a morally correct way', 'to be fancy or pompous', 'to be very late']),
            questions: [
              q(1, 'down and out', 'A', 'The speaker says "If you are down and out, that means you are poor, without enough money for the things you need."'),
              q(2, 'down in the dumps', 'B', 'The speaker says "if you are down in the dumps, that means you feel unhappy or depressed".'),
              q(3, 'on the down-low', 'C', 'The speaker says "To keep something on the down-low means to keep information secret."'),
              q(4, 'the low-down', 'D', 'The speaker says "getting the low-down means you are getting information".'),
              q(5, 'take the high road', 'E', 'The speaker says "To take the high road means to behave in a way that is morally correct, even when other people around you are not behaving well."'),
            ],
          },
          {
            id: 'l110-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why do many cultures link the words "low" and "down" with something negative?', ['Low places are cold and dark.', 'Our minds connect low places with dirt.', 'Poor people live in low places.', 'The idea comes from religious texts.'], 'B', 'The speaker says "our minds can easily connect low places, like the floor or the ground, with dirt".'),
              mc(7, 'What is Maria planning to do?', ['move to another city', 'leave her job next month', 'get married', 'take a long holiday'], 'B', 'One speaker says "keep this on the down-low—she\'s going to quit her job next month".'),
              mc(8, 'In the driving example, why does the driver behind you get angry?', ['You stopped to let another car turn.', 'You were driving too fast.', 'You took their parking space.', 'You shouted at them first.'], 'A', 'The speaker says "you stop and let that car make the turn. But this makes the car behind you slow down."'),
            ],
          },
          {
            id: 'l110-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Which word describes a person who is overly fancy or pompous?', 'highfalutin', 'The speaker says "If you say someone is highfalutin, that means you think the person is overly fancy or pompous."'),
              q(10, 'In which year was this word first known to be used?', '1839', 'The speaker says "the first known use of this word was in 1839 in the United States".'),
            ],
          },
        ],
      }),
    ],
  },
};
