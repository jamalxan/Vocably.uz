// Vocably Listening 127 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-127',
  title: 'Listening 127: When the Walls Are Closing In',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'have-you-felt-the-walls-are-closing-in-on-you',
        contextText: 'You will hear a talk about the expression "the walls are closing in" and the word "claustrophobic".',
        questionGroups: [
          {
            id: 'l127-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'If we stay in a room too long, its walls can begin to feel like a ______.', 'prison', 'The speaker says "Those same walls can start to feel like a prison."'),
              q(2, 'When the walls are closing in, you feel confined or ______ in a place.', 'stuck', 'The speaker says "This means you are feeling confined, or stuck, in an area."'),
              q(3, 'When the speaker felt trapped at home during the pandemic, she went out for a ______.', 'walk', 'The speaker says "I knew I needed to go outside for a walk!"'),
              q(4, 'A change of ______ helps when you feel the walls are closing in.', 'scenery', 'The speaker says "A change of scenery can help when you feel like the walls are closing in."'),
            ],
          },
          {
            id: 'l127-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'When the "walls" are not real walls, what situation does the speaker give as an example?', ['living in a very small apartment', 'having no chance to advance in your job', 'being ill for a long time', 'living in a crowded city'], 'B', 'The speaker says "if you unable to make advances in your job, you could feel like the walls have closed in on your career".'),
              mc(6, 'For someone in a controlling relationship, what is the "change of scenery"?', ['a holiday in the woods', 'a new relationship', 'a bigger home', 'more time alone'], 'B', 'The speaker says "The change of scenery is a new job or a new relationship."'),
              mc(7, 'How is claustrophobia defined?', ['a fear of large crowds', 'a fear of open spaces', 'an abnormal fear of closed spaces', 'a fear of heights'], 'C', 'The speaker says "Claustrophobia is defined as an abnormal fear of being in closed or confined spaces."'),
            ],
          },
          {
            id: 'l127-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Where did Chad move to during the pandemic?', ['the desert', 'desert', 'a desert'], 'The second speaker says "he moved out west…somewhere in the desert".'),
              q(9, 'Besides more space, what did Chad say he needed?', ['open skies', 'skies'], 'The second speaker says "He needed more space and open skies!"'),
              q(10, 'How long does it take Chad to drive to the nearest store?', ['30 minutes', 'thirty minutes'], 'The second speaker says "it takes him 30 minutes to drive to the nearest store".'),
            ],
          },
        ],
      }),
    ],
  },
};
