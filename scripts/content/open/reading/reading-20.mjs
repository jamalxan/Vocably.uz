// Vocably Reading 20 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, table, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-20',
  title: 'Reading 20: The Story of Jeans',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'jeans', title: 'From Workwear to Fashion: The Story of Jeans', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r20-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              q(1, 'a reference to a navy that needed cloth suitable for both wet and dry conditions', 'D', 'Paragraph D: "The Genoese navy equipped its sailors with jeans, as they needed a fabric that could be worn wet or dry."', 'D'),
              q(2, 'a mention of film actors who helped to make jeans popular', 'B', 'Paragraph B: jeans "were popularized as casual wear by Marlon Brando and James Dean in their 1950s films".', 'B'),
              q(3, 'an explanation of how the pronunciation of an Indian word changed in English', 'F', 'Paragraph F: "In English, the word &quot;dungri&quot; became pronounced as &quot;dungaree&quot;."', 'F'),
              q(4, 'a description of a group of paintings showing poor people wearing a denim-like cloth', 'E', 'Paragraph E: "The ten paintings depict impoverished scenes with lower-class figures wearing a fabric that looks like denim."', 'E'),
              q(5, 'a mention of an artificial substitute for a natural dye', 'C', 'Paragraph C: "Nearly all indigo, needed for dyeing, came from indigo bush plantations in India, until replaced by indigo synthesis methods developed in Germany in 1878."', 'C'),
            ],
          },
          {
            id: 'r20-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the passage say about the term "blue jeans" before 1873?', [
                'It referred only to trousers.',
                'It was already used for various kinds of denim work clothing.',
                'It was invented by Levi Strauss.',
                'It described clothing made in Genoa.',
              ], 'B', 'Paragraph A: "Prior to the patent, the term &quot;blue jeans&quot; had been long in use for various items of workwear (including trousers, overalls, and coats)".', 'A'),
              mc(7, 'Why were rivets originally added to jeans?', [
                'to make the trousers more fashionable',
                'to make the pocket seams stronger for workers such as miners',
                'to attach the trousers to the wearer\'s belt',
                'to identify the maker of the trousers',
              ], 'B', 'Paragraph B: "designed as attire for manual workers such as miners for whom rivets were added to strengthen pocket seams".', 'B'),
              mc(8, 'How did the cloth made in Nîmes differ from Genoese jean?', [
                'It was rougher but considered to be of better quality.',
                'It was used only by sailors.',
                'It was cheaper to produce.',
                'It was woven from wool rather than cotton.',
              ], 'A', 'Paragraph D: Nîmes\'s denim "was coarser, considered higher quality, and was used" for over garments, while Genoese jean was "very similar to cotton corduroy".', 'D'),
              mc(9, 'What part did Jacob Davis play in the history of jeans?', [
                'He ran a dry goods business in San Francisco.',
                'He proposed to Strauss that they patent riveted clothing together.',
                'He imported dungaree cloth from India.',
                'He moved from Germany to New York in 1851.',
              ], 'B', 'Paragraph H: "In 1872, Davis wrote to Strauss asking to partner with him to patent and sell clothing reinforced with rivets."', 'H'),
            ],
          },
          {
            id: 'r20-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Date', 'Event'],
              [
                ['16th century', 'jean fabric first produced in the Italian city of {{q10}}'],
                ['1576', 'a cargo of jean fustians arrives at the English port of {{q11}}'],
                ['1613', 'first record of dungaree, described as a coarse {{q12}} cloth'],
                ['1853', 'Levi Strauss opens his own business in {{q13}}'],
                ['1872', 'Davis writes to Strauss suggesting that they patent clothing strengthened with {{q14}}'],
              ],
              'Key dates in the history of jeans'
            ),
            questions: [
              q(10, null, 'Genoa', 'Paragraph D: "it emerged in the city of Genoa, Italy, in the 16th century".', 'D'),
              q(11, null, 'Barnstaple', 'Paragraph D: "In 1576, a quantity of &quot;jean fustians&quot; arrived into the port of Barnstaple on a vessel from Bristol."', 'D'),
              q(12, null, 'calico', 'Paragraph F: "Dungaree, a type of fabric, was mentioned for the first time in 1613, when it was referred to as coarse calico cloth".', 'F'),
              q(13, null, 'San Francisco', 'Paragraph H: "In 1853, he moved to San Francisco to open his own dry goods business."', 'H'),
              q(14, null, 'rivets', 'Paragraph H: "Davis wrote to Strauss asking to partner with him to patent and sell clothing reinforced with rivets".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
