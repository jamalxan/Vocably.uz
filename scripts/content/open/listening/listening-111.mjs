// Vocably Listening 111 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-111',
  title: 'Listening 111: Just a Phone Call Away',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'sometimes-help-is-just-a-phone-call-away',
        contextText: 'You will hear a talk about English expressions that use the word "phone".',
        questionGroups: [
          {
            id: 'l111-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each expression mean? Choose the correct letter, <strong>A-F</strong>.',
            bank: bank(['to be available to help someone', 'to contact someone again and again', 'to wait or stop', 'to keep missing each other\'s calls', 'to make no real effort at something', 'to have information easily available']),
            questions: [
              q(1, 'to be a phone call away', 'A', 'The speaker says "what we are really telling them is that we are available".'),
              q(2, 'to blow up someone\'s phone', 'B', 'The speaker says "When your phone blows up, someone is trying to contact you repeatedly."'),
              q(3, 'hold the phone', 'C', 'The speaker says "The expression hold the phone is a way to say" wait or stop.'),
              q(4, 'to play phone tag', 'D', 'The speaker says "phone tag is when two people try to contact each other but their calls go unanswered".'),
              q(5, 'to phone it in', 'E', 'The speaker says "When we phone it in, we don\'t try our best at something."'),
            ],
          },
          {
            id: 'l111-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why does the speaker\'s friend need help?', ['He has lost his phone.', 'He is struggling with an English course.', 'He has argued with his neighbour.', 'He has lost interest in his job.'], 'B', 'The speaker says "my friend is having a hard time with an advanced English course".'),
              mc(7, 'What is the problem with the neighbours Jana and Jake?', ['They never answer their phones.', 'They are arguing and both keep contacting the listener.', 'They want to move away.', 'They refuse to speak to the listener.'], 'B', 'The speaker says "They are both blowing up your phone with calls and texts about their disagreement."'),
              mc(8, 'Apart from having had enough of a situation, when do people say "hold the phone"?', ['when they hear something surprising', 'when they are too busy to talk', 'when they want someone to call back later', 'when they are about to end a call'], 'A', 'The speaker says "We use it when we hear something surprising or when we have had enough of a situation."'),
            ],
          },
          {
            id: 'l111-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Jana and Jake kept missing each other\'s calls for several ______.', 'days', 'The speaker says "They play phone tag like this for days until they finally speak to each other."'),
              q(10, 'People who have lost interest in their ______ may start phoning it in.', 'jobs', 'The speaker says "some people who lose interest in their jobs might start phoning it in".'),
            ],
          },
        ],
      }),
    ],
  },
};
