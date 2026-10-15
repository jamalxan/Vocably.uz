// Vocably Reading 1 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-1',
  title: 'Reading 1: The Rosetta Stone',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'rosetta-stone', title: 'The Rosetta Stone', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em>',
            questions: [
              q(1, 'an explanation of why the stone was once thought to be made of a different kind of rock', 'E', 'Paragraph E: the wax and chalk "gave a dark colour to the stone that led to its mistaken identification as black basalt".', 'E'),
              q(2, 'the reason why one side of the stone was left unfinished', 'F', 'Paragraph F: "the back is only roughly worked, presumably because it would have not been visible when the stele was erected".', 'F'),
              q(3, 'a mention of similar inscriptions that are older than the Rosetta Stone', 'D', 'Paragraph D: "several similar Egyptian bilingual or trilingual inscriptions are now known, including three slightly earlier Ptolemaic decrees".', 'D'),
              q(4, 'details of how the stone came to be in Britain', 'B', 'Paragraph B: "When the British defeated the French, they took the stone to London under the terms of the Capitulation of Alexandria in 1801."', 'B'),
              q(5, 'a comparison of how much of each of the three texts has survived', 'G', 'Paragraph G: "The top register, written in Egyptian hieroglyphs, has suffered the most damage" and "the middle register of demotic text has survived best".', 'G'),
            ],
          },
          {
            id: 'r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The three versions of the decree on the stone are word-for-word identical.', 'FALSE', 'Paragraph A: "The decree has only minor differences across the three versions".', 'A'),
              q(7, 'The stone was discovered by a member of the French army.', 'TRUE', 'Paragraph B: "It was found there in July 1799 by French army officer Pierre-François Bouchard".', 'B'),
              q(8, 'The Rosetta Stone is the only known copy of the decree.', 'FALSE', 'Paragraph D: "Three other fragmentary copies of the same decree were discovered later".', 'D'),
              q(9, 'Visitors to the British Museum are no longer allowed to touch the stone.', 'NOT GIVEN', 'Paragraph E mentions a wax layer "designed to protect it from visitors\' fingers" but says nothing about current rules for visitors.', 'E'),
            ],
          },
          {
            id: 'r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Before its discovery, the stone had been used as building material in the construction of ______.', ['Fort Julien', 'a fort'], 'Paragraph B: "eventually used as building material in the construction of Fort Julien near the town of Rashid".', 'B'),
              q(11, 'Since 1802 the stone has been on display at the ______ in London.', 'British Museum', 'Paragraph B: "Since 1802, it has been on public display at the British Museum almost continuously".', 'B'),
              q(12, 'Today the term "Rosetta Stone" can describe the essential ______ to a new area of knowledge.', 'clue', 'Paragraph D: the term "is now used in a general sense to refer to the essential clue to a new field of knowledge".', 'D'),
              q(13, 'The stone weighs about ______ kilograms.', '760', 'Paragraph F: "It weighs approximately 760 kilograms (1,680 lb)."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
