// Vocably Listening 94 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-94',
  title: 'Listening 94: How a Bill Becomes a Law',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'how-laws-are-made-in-the-u-s',
        contextText: 'You will hear an explanation of the steps a proposal goes through before it becomes a federal law in the United States.',
        questionGroups: [
          {
            id: 'l94-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>The path of a law</strong></p><p>An idea reaches a lawmaker and is written up as a proposal called a {{q1}}</p><p>↓</p><p>A member of Congress officially {{q2}} the proposal</p><p>↓</p><p>It is passed to a small group of lawmakers known as a {{q3}}</p><p>↓</p><p>The group may hold {{q4}} to collect more information, change the proposal or let it die</p><p>↓</p><p>The whole House or Senate {{q5}} on it</p>',
            questions: [
              q(1, null, 'bill', 'The speaker says "the idea is further developed into a written proposal, called a bill".'),
              q(2, null, 'sponsors', 'The speaker says "In other words, a lawmaker sponsors it."'),
              q(3, null, 'committee', 'The speaker says "it is sent to a small group of lawmakers, called a committee".'),
              q(4, null, 'hearings', 'The speaker says "Sometimes committee members seek more information about the proposal by holding hearings."'),
              q(5, null, 'votes', 'The speaker says "Finally, the full House or Senate votes on the bill."'),
            ],
          },
          {
            id: 'l94-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What happens to a bill that fails to win a majority of votes?', ['It is returned to the committee.', 'It goes no further.', 'It is sent to the other chamber.', 'It is sent to the president.'], 'B', 'The speaker says "If it does not earn the majority of votes, the bill does not advance."'),
              mc(7, 'What may lawmakers have to do after both chambers approve a bill?', ['send two versions to the president', 'hold new hearings', 'talk again to settle their differences', 'start the whole process again'], 'C', 'The speaker says "lawmakers from both the House and the Senate may have to discuss it again to settle any differences".'),
              mc(8, 'When does a bill become law without the president signing it?', ['when Congress is not in session', 'when the president does nothing while Congress is meeting', 'when the committee approves it a second time', 'when the president vetoes it'], 'B', 'The speaker says "If the president does nothing and Congress is officially meeting, the bill becomes a law."'),
            ],
          },
          {
            id: 'l94-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'A vetoed bill is sent back to both the Senate and the ______.', 'House', 'The speaker says "it is returned to both the Senate and the House".'),
              q(10, 'Congress can override a veto if ______ of each chamber approve the bill again.', ['two-thirds', 'two thirds'], 'The speaker says "If two-thirds of the senators and two-thirds of the House members approve the bill once again, they override the veto."'),
            ],
          },
        ],
      }),
    ],
  },
};
