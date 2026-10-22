// Vocably Reading 167 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-167',
  title: 'Reading 167: The Homing Pigeon',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'homing-pigeon', title: 'The Homing Pigeon', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r167-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Pigeons were used commercially to carry messages until telephones were introduced.', 'TRUE', 'Paragraph A: "Until the introduction of telephones, they were used commercially to deliver communication".', 'A'),
              q(2, 'The homing pigeon and the English carrier are the same breed.', 'FALSE', 'Paragraph B: "it is distinct from the English carrier, an ancient breed of fancy pigeon".', 'B'),
              q(3, 'Racing pigeons have been recorded flying distances of 1,800 km.', 'TRUE', 'Paragraph C: "Flights as long as 1,800 km (1,100 miles) have been recorded by birds in competitive homing pigeon racing".', 'C'),
              q(4, 'Pedro Tafur correctly understood how the pigeons he saw were used.', 'FALSE', 'Paragraph E: "though he imagined that the birds made round trips, out and back".', 'E'),
              q(5, 'Paul Reuter\'s pigeons delivered news faster than the telegraph could.', 'NOT GIVEN', 'Paragraph F says he "used a fleet of over 45 pigeons to deliver news and stock prices between Brussels and Aachen, the terminus of early telegraph lines", but does not compare their speed with the telegraph.', 'F'),
            ],
          },
          {
            id: 'r167-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Date', 'Place', 'Details'],
              [
                ['by 1350 BCE', 'Ancient {{q6}}', 'messages were tied around the birds\' legs'],
                ['1167', 'Baghdad to {{q7}}', 'a regular service set up by Sultan Nur ad-Din'],
                ['1750-1799', 'Srirangapatna, Mysore', 'birds returned to the {{q8}} that served as Tipu Sultan\'s headquarters'],
                ['December 1870', 'Perpignan to Brussels', 'a pigeon carrying {{q9}} took ten hours'],
                ['November 1897', 'Newton (Auckland) to Great Barrier Island', 'possibly the first regular {{q10}} service in the world'],
              ],
              'Pigeon post through history',
            ),
            questions: [
              q(6, null, 'Egypt', 'Paragraph D: "Evidence exists suggesting that homing pigeons were used for pigeon post in Ancient Egypt by 1350 BCE."', 'D'),
              q(7, null, 'Syria', 'Paragraph E: "By 1167 a regular service between Baghdad and Syria had been established by Sultan Nur ad-Din."', 'E'),
              q(8, null, 'mosque', 'Paragraph E: "they returned to the Jamia Masjid mosque in Srirangapatna, which was his headquarters".', 'E'),
              q(9, null, 'microfilms', 'Paragraph F: "In December 1870, it took ten hours for a pigeon carrying microfilms to fly from Perpignan to Brussels."', 'F'),
              q(10, null, ['air mail', 'airmail'], 'Paragraph G: "the Great Barrier Pigeongram Service established between the Auckland, New Zealand, suburb of Newton and Great Barrier Island in November 1897, possibly the first regular air mail service in the world".', 'G'),
            ],
          },
          {
            id: 'r167-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'In which Canadian city did reporters wait for ships arriving from Europe?', 'Halifax', 'Paragraph H: "So reporters stationed themselves in Halifax, wrote the information received from incoming ships".', 'H'),
              q(12, 'For how many years had the Swiss army used pigeons before it stopped?', ['77', '77 years'], 'Paragraph I: "The military had used pigeons for 77 years".', 'I'),
              q(13, 'What development led to the retirement of the Police Pigeon Service in Odisha?', ['the Internet', 'Internet'], 'Paragraph J: the service "was to be retired, due to the expanded use of the Internet".', 'J'),
              q(14, 'According to most researchers, what does the compass part of a pigeon\'s navigation seem to depend on?', ['the sun', 'sun'], 'Paragraph K: "While the compass mechanism appears to rely on the sun, the map mechanism has been highly debated."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
