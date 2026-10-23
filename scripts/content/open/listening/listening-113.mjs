// Vocably Listening 113 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-113',
  title: 'Listening 113: Nose to the Grindstone',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'keep-your-nose-to-the-grindstone',
        contextText: 'You will hear a talk about the expression "keep your nose to the grindstone" and where it may have come from.',
        questionGroups: [
          {
            id: 'l113-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Learners who ______ with their language goals usually achieve good results.', 'persist', 'The speaker says "People who persist with their language goals often get good results."'),
              q(2, 'A grindstone is a round stone with a ______ in the centre.', 'hole', 'The speaker says a grindstone is a "circular stone with a hole in the middle".'),
              q(3, 'The stone spins on an ______ and can sharpen, shape or smooth a tool.', 'axle', 'The speaker says "An axle fits through that hole."'),
            ],
          },
          {
            id: 'l113-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(4, 'Who is Gary Martin?', ['a miller from England', 'a writer and language researcher', 'a tool-sharpening worker', 'a VOA reporter'], 'B', 'The speaker says "writer and language researcher Gary Martin suggests two possible beginnings".'),
              mc(5, 'According to some online sources, why did mill workers keep their noses close to the stone?', ['to hear whether the stone was turning', 'to smell whether the grain was burning', 'to check the speed of the stone', 'to keep warm in winter'], 'B', 'The speaker says "workers would have to keep their noses close to the stone and smell for any sign of burning".'),
              mc(6, 'Why does Martin doubt the grain-mill explanation?', ['Grain mills used millstones, not grindstones.', 'Grain never burns while it is being ground.', 'Mills did not exist hundreds of years ago.', 'Mill workers stood far away from the stone.'], 'A', 'The speaker says "He claims that these mills used millstones."'),
              mc(7, 'In the old English workshops, what could happen if a worker spent a moment too long on the wheel?', ['The stone could break.', 'The worker could be burned.', 'The steel could overheat and be ruined.', 'The bench could collapse.'], 'C', 'Martin writes that "a moment too long on the wheel could cause the steel to overheat and be ruined".'),
            ],
          },
          {
            id: 'l113-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Conversation about Marisa</strong></p><ul><li>she has not called or texted for {{q8}}</li><li>she is working hard to finish her year-end {{q9}}</li><li>her friends decide to bring her some {{q10}}</li></ul>',
            questions: [
              q(8, null, 'weeks', 'The first speaker says "She hasn\'t called or texted in weeks!"'),
              q(9, null, 'report', 'The second speaker says Marisa "has her nose to the grindstone trying to finish her year-end report".'),
              q(10, null, 'dinner', 'The first speaker says "In that case, let\'s take her some dinner."'),
            ],
          },
        ],
      }),
    ],
  },
};
