// Vocably Listening 25 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-25',
  title: 'Listening 25: A Land Bridge for Thailand',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'thailand-pushes-land-bridge-to-speed-trade',
        contextText: 'You will hear a news report about a plan to carry cargo across southern Thailand by land.',
        questionGroups: [
          {
            id: 'l25-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'The land bridge would let cargo avoid the Malacca Strait and ______.', 'Singapore', 'The speaker says "without having to go through the Malacca Strait and Singapore".'),
              q(2, 'Cargo would be carried by highway and ______ between Chumpon and Ranong.', 'railroad', 'The speaker says "cargo would travel by highway and railroad from the area of Chumpon".'),
              q(3, 'The project is expected to cost $______.', ['28 billion', '28-billion'], 'The speaker says "seeking support for the $28-billion project from investors around the world".'),
              q(4, 'The transport minister said more than ______ American companies were interested.', '10', 'The speaker says "more than 10 American companies expressed interest without naming them".'),
            ],
          },
          {
            id: 'l25-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What has China said about the land bridge plan?', ['It strongly supports it.', 'It has made no comment.', 'It prefers to invest in Singapore.', 'It wants to build it alone.'], 'B', 'The speaker says China "has not commented on the plan for the land bridge".'),
              mc(6, 'Why has the Kra Canal project never started?', ['China withdrew its support.', 'Singapore objected to it.', 'The cost and possible harm to the environment.', 'A new government cancelled it.'], 'C', 'The speaker says "it has never started because of the cost and possible environmental damage".'),
              mc(7, 'According to critics, why would the land bridge not save time?', ['The highways are too slow.', 'Cargo would have to be moved on and off ships.', 'Ships would still pass Singapore.', 'The railway has not been built.'], 'B', 'The speaker says "a land bridge would require loading and unloading cargo from ships and would not save any time".'),
            ],
          },
          {
            id: 'l25-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which person makes each of the following statements? Choose the correct letter, <strong>A, B or C</strong>.',
            bank: bank(['Srettha Thavisin, Prime Minister', 'Sompong Putivisutisak, university professor', 'Somboon Kamhang, committee chairman']),
            questions: [
              q(8, 'The project is important for the whole world, not only Thailand.', 'A', 'The speaker quotes him calling it a "very important project, not just for Thailand, but also for the world".'),
              q(9, 'China is waiting to see what other investors do.', 'B', 'The speaker quotes him: China "won\'t give away its position that easily until it sees the other investors".'),
              q(10, 'Building a land bridge would be too expensive and slow.', 'C', 'The speaker quotes him: "Building a land bridge is just way too costly and time-consuming".'),
            ],
          },
        ],
      }),
    ],
  },
};
