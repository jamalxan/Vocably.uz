// Vocably Listening 10 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-10',
  title: 'Listening 10: A Little-known National Garden',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'little-known-garden-supports-us-nursery-industry',
        contextText: 'You will hear a report about a large public garden in the United States and the scientific work done there.',
        questionGroups: [
          {
            id: 'l10-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'In which city is the National Arboretum located?', ['Washington', 'Washington D.C.', 'Washington DC'], 'The speaker says "Placed among the busy streets of Washington, D.C. is a large public garden".'),
              q(2, 'How large is the area that government scientists look after?', ['183 hectares', '183'], 'The speaker says "Government scientists are in charge of the 183-hectare area."'),
              q(3, 'Which industry does the arboretum mainly support?', ['nursery industry', 'nursery'], 'Richard Olsen says "What we do is support the American nursery industry".'),
              q(4, 'According to the USDA, how much do sales of ornamental and landscape plants total each year?', ['$13.8 billion', '13.8 billion'], 'The speaker says the industry "creates $13.8 billion in sales each year".'),
            ],
          },
          {
            id: 'l10-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'When was the garden established?', ['1927', '1947', '1972', '1983'], 'A', 'The speaker says "The garden was established by Congress in 1927."'),
              mc(6, 'What does the National Arboretum Herbarium hold?', ['650 kinds of tree', 'around 700,000 example seeds', '450 types of azalea', '25 million plants'], 'B', 'The speaker says "The National Arboretum Herbarium houses around 700,000 example seeds."'),
              mc(7, 'Why do scientists collect genetically different seeds?', ['to sell them to farmers', 'to protect plants from dangers such as climate change', 'to decorate the National Mall', 'to replace non-native plants'], 'B', 'The speaker says the reason is "to protect plants from harmful situations like climate change".'),
            ],
          },
          {
            id: 'l10-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Kevin Conrad</strong></p><ul><li>lead plant {{q8}} at the arboretum</li><li>says a gene from a plant such as wheat or {{q9}} has saved important crops in the past</li><li>around {{q10}} people visit the gardens every year</li><li>goal: to make the landscape green, welcoming and safe</li></ul>',
            questions: [
              q(8, null, 'scientist', 'The speaker says "Kevin Conrad is a lead plant scientist at the arboretum."'),
              q(9, null, 'grapes', 'The speaker says "a gene from a plant like wheat or grapes has been able to solve a disaster".'),
              q(10, null, '600,000', 'The speaker says "About 600,000 people visit the gardens each year."'),
            ],
          },
        ],
      }),
    ],
  },
};
