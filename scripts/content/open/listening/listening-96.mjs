// Vocably Listening 96 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-96',
  title: 'Listening 96: The Story of Santa Claus',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'the-story-of-santa-claus',
        contextText: 'You will hear a talk about where the figure of Santa Claus and his many names came from.',
        questionGroups: [
          {
            id: 'l96-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>The American Santa Claus</strong></p><ul><li>leaves the North Pole on Christmas {{q1}}</li><li>travels on a sleigh pulled by {{q2}}</li><li>gets into each house through the {{q3}}</li><li>based on St Nicholas, a clergyman from Myra in present-day {{q4}}</li></ul>',
            questions: [
              q(1, null, 'Eve', 'The speaker says Santa "flies from his home at the North Pole on Christmas Eve".'),
              q(2, null, 'reindeer', 'The speaker says "He usually flies on a sleigh led by his reindeer."'),
              q(3, null, 'chimney', 'The speaker says "Santa enters each home through the chimney and fills children’s stockings".'),
              q(4, null, 'Turkey', 'The speaker says St Nicholas lived "in the Mediterranean port city of Myra, part of modern-day Turkey".'),
            ],
          },
          {
            id: 'l96-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which group of people or country is each gift-bringer connected with? Choose the correct letter, <strong>A-F</strong>.',
            bank: bank(['Dutch immigrants in New York', 'German farmers in Pennsylvania', 'Britain', 'France', 'Scandinavia', 'Italy']),
            questions: [
              q(5, 'Sinterklaas', 'A', 'The speaker says "Dutch immigrants brought the story of Saint Nikolaas and the tradition of gift-giving to New York City."'),
              q(6, 'Pelznickel', 'B', 'The speaker says "German immigrants working as farmers in the American state of Pennsylvania" called him Pelznickel.'),
              q(7, 'Jultomten', 'E', 'The speaker says "In Scandinavia, an elf named Jultomten was thought to deliver gifts in a sleigh drawn by goats."'),
              q(8, 'La Befana', 'F', 'The speaker says "In Italy, a woman called La Befana rides a broomstick down the chimneys of homes".'),
            ],
          },
          {
            id: 'l96-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'Why did Thomas Nast paint Santa Claus the way he did?', ['He copied the description in a famous poem.', 'He remembered a kind old man from his childhood.', 'He used a picture of his own father.', 'He followed a Dutch tradition.'], 'B', 'The speaker says "when Nast painted Santa Claus, he looked like the old man from his childhood".'),
              mc(10, 'What do American children leave for the reindeer on Christmas Eve?', ['cookies', 'milk', 'carrots', 'cakes'], 'C', 'The speaker says "they leave cookies and milk for Santa and carrots for his reindeer".'),
            ],
          },
        ],
      }),
    ],
  },
};
