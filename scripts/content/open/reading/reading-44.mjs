// Vocably Reading 44 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-44',
  title: 'Reading 44: Esperanto',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'esperanto', title: 'Esperanto: A Language of Hope', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r44-head', type: 'matching_headings',
            instructionHtml: 'The passage has eight paragraphs, A-H. Choose the correct heading for paragraphs B-G from the list of headings below. <em>Write the correct number, i-ix.</em>',
            bank: bank([
              'An earlier project whose collapse helped Esperanto to grow',
              'How many people speak Esperanto, and where',
              'Esperanto becomes an official language in several countries',
              'The background of the creator and the appearance of the first book',
              'Where the vocabulary comes from and how new words are formed',
              'Criticism of Esperanto from professional linguists',
              'Suggested modifications to the language',
              'The hopes the creator had for his language',
              'A comparison between Esperanto and English as world languages',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'v', 'Paragraph B: "A substantial majority of its vocabulary (approximately 80%) derives from Romance languages" and "prefixes and suffixes may be freely combined with roots to generate words".', 'B'),
              q(2, 'Paragraph C', 'ii', 'Paragraph C: "two estimates put the number of Esperantists at around 100,000. Concentration of speakers is highest in Europe, East Asia, and South America."', 'C'),
              q(3, 'Paragraph D', 'vii', 'Paragraph D: "A number of reforms to Esperanto, including an official 1894 proposal by Zamenhof, gender reforms" have been proposed.', 'D'),
              q(4, 'Paragraph E', 'i', 'Paragraph E: "the internal collapse of the Volapük movement caused its gradual replacement by Esperanto" and Volapük "set the stage for the widespread usage of constructed languages".', 'E'),
              q(5, 'Paragraph F', 'iv', 'Paragraph F: Zamenhof was "a Jewish ophthalmologist from Białystok" who "self-published the first book of Esperanto grammar (Unua Libro) on 26 July 1887".', 'F'),
              q(6, 'Paragraph G', 'viii', 'Paragraph G: "Zamenhof\'s goal was to create an easy and flexible language that would serve as a universal second language, to foster world peace and international understanding".', 'G'),
            ],
          },
          {
            id: 'r44-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(7, 'Zamenhof originally chose Esperanto as the name of his language.', 'FALSE', 'Paragraph A: he called it the International Language, and early adopters liked the name Esperanto so much that "they soon used it to describe the language itself".', 'A'),
              q(8, 'About four-fifths of Esperanto words come from Romance languages.', 'TRUE', 'Paragraph B: "A substantial majority of its vocabulary (approximately 80%) derives from Romance languages".', 'B'),
              q(9, 'Esperanto is taught in schools in most European countries.', 'NOT GIVEN', 'Paragraph C says that "Concentration of speakers is highest in Europe, East Asia, and South America" but says nothing about schools.', 'C'),
              q(10, 'The town where Zamenhof was born is now in Poland.', 'TRUE', 'Paragraph F: "from Białystok, then part of the Russian Empire, but now part of Poland".', 'F'),
            ],
          },
          {
            id: 'r44-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Why Zamenhof created Esperanto</strong></p><p>Zamenhof hoped that an easy, flexible second language would encourage international understanding and world {{q11}}. He grew up in Białystok, where the Russians, Poles, Germans and Jews each spoke their own language and regarded the other groups as {{q12}}. He came to see linguistic diversity as the main cause of the {{q13}} of humanity into hostile groups. Although he had been brought up as an {{q14}}, in the street he felt that people existed only as members of separate nationalities.</p>',
            questions: [
              q(11, null, 'peace', 'Paragraph G: "to foster world peace and international understanding".', 'G'),
              q(12, null, 'enemies', 'Paragraph H: "each of these spoke their own language and looked on all the others as enemies".', 'H'),
              q(13, null, 'separation', 'Paragraph H: "the most influential, basis for the separation of the human family into groups of enemies".', 'H'),
              q(14, null, 'idealist', 'Paragraph H: "I was brought up as an idealist".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
