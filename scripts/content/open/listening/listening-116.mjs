// Vocably Listening 116 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-116',
  title: 'Listening 116: Expressions with Rub',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'learn-to-rub-elbows-other-rub-expressions',
        contextText: 'You will hear a talk about the many meanings of the word "rub" in English.',
        questionGroups: [
          {
            id: 'l116-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>"Rub" as a noun and a verb</strong></p><ul><li>in cooking, a rub is a mixture of dry {{q1}} put on food before it is cooked</li><li>"What\'s the rub?" is an informal way of asking "What\'s the {{q2}}?"</li><li>if something hurts a lot, you might rub in some {{q3}}</li></ul>',
            questions: [
              q(1, null, 'seasonings', 'The speaker says "A rub is a collection of dry seasonings that can be added to meat, tofu or vegetables before cooking."'),
              q(2, null, 'problem', 'The speaker says "I am asking" What\'s the problem?'),
              q(3, null, 'medicine', 'The speaker says "I might rub in some medicine to help reduce the pain".'),
            ],
          },
          {
            id: 'l116-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(4, 'In the conversation, why does the second man say "Stop rubbing it in"?', ['His team lost the game by a large margin.', 'He was hurt during the game.', 'He missed the game completely.', 'His friend keeps asking for a rematch.'], 'A', 'The second speaker says "Your team beat mine by a lot!"'),
              mc(5, 'What do you do when you rub someone\'s nose in something?', ['You remind them of a failure or mistake.', 'You help them solve a problem.', 'You praise them for a success.', 'You ignore what they have done.'], 'A', 'The speaker says "we remind them that they have failed or got something wrong".'),
            ],
          },
          {
            id: 'l116-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each expression mean? Choose the correct letter, <strong>A-G</strong>.',
            bank: bank(['keep reminding someone of a failure', 'annoy someone, often through your personality or behaviour', 'be at the same event as important people', 'make a bad situation even worse', 'lack something', 'get rid of or kill someone', 'do more than is expected']),
            questions: [
              q(6, 'to rub someone the wrong way', 'B', 'The speaker says "It means you have irritated them, usually for something in your personality or behavior."'),
              q(7, 'to rub elbows with someone', 'C', 'The speaker says "Often, the people we rub elbows with are famous, important, or influential."'),
              q(8, 'to rub salt in the wound', 'D', 'The speaker says "This means you make a bad situation worse for someone else."'),
              q(9, 'not to have two dimes to rub together', 'E', 'The speaker says "We use this with other words to say that we lack something."'),
              q(10, 'to rub someone out', 'F', 'The speaker says "If a bad person rubs someone out, they do away with them."'),
            ],
          },
        ],
      }),
    ],
  },
};
