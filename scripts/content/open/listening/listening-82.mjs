// Vocably Listening 82 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-82',
  title: 'Listening 82: Glacier Bay National Park',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'glacier-bay-a-land-reborn',
        contextText: 'You will hear a talk about Glacier Bay National Park in Alaska.',
        questionGroups: [
          {
            id: 'l82-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'How much of the park is covered by glaciers?', ['more than 1 million hectares', 'more than 5,000 square kilometres', 'one-fifth of the park', 'about 50 square kilometres'], 'B', 'The speaker says "Glaciers cover more than 5,000 square kilometers of the park."'),
              mc(2, 'What happened in the 1700s?', ['The Little Ice Age began.', 'The climate began to warm and the ice started to melt.', 'The glacier reached its largest size.', 'The Tlingit left the area.'], 'B', 'The speaker says "That growth continued until the 1700s, when the climate began to warm."'),
              mc(3, 'Why did the Huna Tlingit stop harvesting gull eggs in the 1960s?', ['The gulls had left the area.', 'A law on migratory birds forced them to stop.', 'The National Park Service bought the land.', 'Younger people lost interest in the tradition.'], 'B', 'The speaker says "the Migratory Bird Treaty Act forced them to stop collecting gull eggs".'),
            ],
          },
          {
            id: 'l82-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Discovery and protection</strong></p><p>In 1794 an expedition led by George Vancouver reached the area. At that time the bay was almost completely filled with {{q4}}. In 1879 the naturalist John {{q5}} came to do research and found that the ice had melted back almost {{q6}} kilometres, forming a bay. In 1925 President Coolidge made Glacier Bay a national monument, but it did not become a national park until {{q7}}.</p>',
            questions: [
              q(4, null, 'ice', 'The speaker says "the bay was still almost completely filled with ice".'),
              q(5, null, 'Muir', 'The speaker says "In 1879 the naturalist John Muir visited the area to do research."'),
              q(6, null, '50', 'The speaker says "glacial ice had melted back almost 50 kilometers".'),
              q(7, null, '1980', 'The speaker says "It did not become an official national park, however, until 1980."'),
            ],
          },
          {
            id: 'l82-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Animal', 'Details'], [
              ['Bears', 'brown and black bears; eat berries, plants and fish'],
              ['Humpback whales', 'come every summer mainly for {{q8}}; eat more than {{q9}} kilograms a day; stay about five months'],
              ['Birds', '{{q10}} species, including gulls, puffins and cormorants; many nest on cliffs'],
            ], 'Coastal wildlife in Glacier Bay'),
            questions: [
              q(8, null, 'food', 'The speaker says "They come to Glacier Bay every summer for one main reason: food."'),
              q(9, null, '450', 'The speaker says "They eat more than 450 kilograms of food each day."'),
              q(10, null, '281', 'The speaker says "There are also 281 species of birds in Glacier Bay."'),
            ],
          },
        ],
      }),
    ],
  },
};
