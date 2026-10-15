// Vocably Listening 79 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-79',
  title: 'Listening 79: Olympic National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'theres-something-for-everyone-at-olympic-national-park',
        contextText: 'You will hear a talk about Olympic National Park in the state of Washington.',
        questionGroups: [
          {
            id: 'l79-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'The park covers more than ______ hectares.', ['400,000', '400000'], 'The speaker says "The park covers more than 400,000 hectares."'),
              q(2, 'The park includes almost ______ kilometres of wild coastline.', '120', 'The speaker says there are "almost 120 kilometers of wild coastline".'),
            ],
          },
          {
            id: 'l79-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(3, 'Why did travellers from many countries come to the peninsula in the late 1700s?', ['to search for gold', 'to look for the Northwest Passage', 'to hunt whales', 'to start farms'], 'B', 'The speaker says "They were searching for the Northwest Passage."'),
              mc(4, 'What did George Vancouver do in 1792?', ['He built the first road on the peninsula.', 'He gave names to many of the natural features.', 'He founded a settlement on the coast.', 'He claimed the peninsula for England.'], 'B', 'The speaker says "He named many of the natural features in the area."'),
              mc(5, 'Why did the early settlers first build their homes on the coast?', ['The coast was easier to reach and good for farming.', 'The forests were full of dangerous animals.', 'They wanted to fish for salmon.', 'The government gave them land there.'], 'A', 'The speaker says "This area was easier to access, and had good land for farming."'),
            ],
          },
          {
            id: 'l79-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Area', 'Location', 'Features'], [
              ['Elwha Valley', 'central part of the park', 'the largest {{q6}} on the peninsula; two dams removed to help the salmon return'],
              ['Hoh River Valley', 'west side', 'an 80-kilometre river; about {{q7}} centimetres of rain a year; temperate rainforest'],
              ['Hurricane Ridge', 'northern part', 'hiking; skiing and other winter sports; snow from December to the end of {{q8}}'],
              ['The Coast', 'westernmost part', 'Rialto Beach: tall {{q9}}; Kalaloch Beach: white {{q10}} and three wildlife refuges'],
            ], 'Places to go in Olympic National Park'),
            questions: [
              q(6, null, 'watershed', 'The speaker says "It is the Olympic Peninsula\'s largest watershed."'),
              q(7, null, '400', 'The speaker says "The area receives about 400 centimeters of rain each year."'),
              q(8, null, 'March', 'The speaker says "Hurricane Ridge usually has snow from December through the end of March."'),
              q(9, null, ['seastacks', 'sea stacks'], 'The speaker says "Rialto Beach is known for its tall seastacks."'),
              q(10, null, 'sand', 'The speaker says "Kalaloch Beach is known for its white sand."'),
            ],
          },
        ],
      }),
    ],
  },
};
