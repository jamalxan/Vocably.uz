// Vocably Reading 72 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-72',
  title: 'Reading 72: The Trans-Siberian Railway',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'trans-siberian-railway', title: 'The Trans-Siberian Railway', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r72-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'No railway line anywhere in the world is longer than the Trans-Siberian.', 'TRUE', 'Paragraph A: "it is the longest railway line in the world".', 'A'),
              q(2, 'People wrote accounts of travelling on the line before it had been finished.', 'TRUE', 'Paragraph B: "Even before its completion, the line attracted travelers who documented their experiences".', 'B'),
              q(3, 'A rail connection between the Russian mainland and Japan has already been built.', 'FALSE', 'Paragraph B: "there have been proposals and talks to expand the network to Tokyo, Japan, with new bridges or tunnels" — it is only proposed, not built.', 'B'),
              q(4, 'The Moscow–Vladivostok service is the longest continuous rail service in the world.', 'FALSE', 'Paragraph C: "it was the third-longest single continuous service in the world, after the Moscow–Pyongyang service" and the former Kyiv–Vladivostok service.', 'C'),
              q(5, 'The Baikal–Amur Mainline was built mainly to transport mineral resources.', 'NOT GIVEN', 'Paragraph E says only that "a fourth route running further to the north was finally completed, after more than five decades of sporadic work" and describes its route; its purpose is not mentioned.', 'E'),
            ],
          },
          {
            id: 'r72-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'In the late 19th century, rivers were the main form of transport in Siberia for about ______ of the year.', 'five months', 'Paragraph F: "For about five months of the year, rivers were the main means of transport."', 'F'),
              q(7, 'In winter, goods and people were carried over frozen rivers by ______.', ['horse-drawn sledges', 'sledges'], 'Paragraph F: "cargo and passengers traveled by horse-drawn sledges over the winter roads, many of which were the same rivers but frozen".', 'F'),
              q(8, 'The first steamboat on the River Ob, which was launched in 1844, was named the ______.', 'Osnova', 'Paragraph G: "The first steamboat on the River Ob, Nikita Myasnikov\'s Osnova, was launched in 1844."', 'G'),
              q(9, 'Steamboat services began on the ______ in 1863.', 'Yenisei', 'Paragraph G: "Steamboats began operation on the Yenisei in 1863".', 'G'),
            ],
          },
          {
            id: 'r72-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'What does the writer say about the Trans-Manchurian route?', [
                'It shares track with the Trans-Siberian between Chita and Tarskaya.',
                'It separates from the main line at Ulan-Ude.',
                'It finishes in Beijing rather than Vladivostok.',
                'It was not completed until 1991.',
              ], 'A', 'Paragraph D: the Trans-Manchurian "coincides with the Trans-Siberian east of Chita as far as Tarskaya". Ulan-Ude is where the Trans-Mongolian leaves the line (paragraph E), and 1991 refers to the Baikal–Amur Mainline.', 'D'),
              mc(11, 'According to the passage, why was west–east travel difficult in Eastern Siberia?', [
                'Steamboats were not introduced there until the 1870s.',
                'The rivers were frozen for most of the year.',
                'The main rivers could mostly be navigated only from north to south.',
                'The land was too flat for canals to be built.',
              ], 'C', 'Paragraph G: the Yenisei, the Angara and the Lena "were mostly navigable only in the north–south direction, making west–east transportation difficult".', 'G'),
              mc(12, 'Why were Muravyov-Amursky\'s plans for the Russian Far East unworkable?', [
                'The Transport Minister refused to support them.',
                'Settlers depended on food brought in from neighbouring countries.',
                'No surveys had been carried out in the Khabarovsk region.',
                'Perry Collins withdrew his support for the project.',
              ], 'B', 'Paragraph H: "his plans were unfeasible due to colonists importing grain and food from China and Korea".', 'H'),
              mc(13, 'What worried the Russian government by 1880?', [
                'The design process had already lasted ten years.',
                'Siberian businesses were too weak to build railways.',
                'Most applications to build railways had been rejected.',
                'Proposed lines would link Siberia to the Pacific but not to the rest of Russia.',
              ], 'D', 'Paragraph I: applications aimed "to connect Siberia with the Pacific, but not Eastern Russia. This worried the government and made connecting Siberia with Central Russia a pressing concern."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
