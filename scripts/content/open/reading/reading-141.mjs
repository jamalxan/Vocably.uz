// Vocably Reading 141 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-141',
  title: 'Reading 141: Icebergs',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'iceberg', title: 'Icebergs', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r141-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'a comparison between the size of an iceberg and the size of a country', 'B', 'Paragraph B: "This iceberg was larger than Belgium."', 'B'),
              q(2, 'an explanation of the noise that icebergs make while they melt', 'H', 'Paragraph H: "These bubbles are released during melting, producing a fizzing sound".', 'H'),
              q(3, 'the reasons why icebergs are not always white', 'J', 'Paragraph J: "Seawater, algae and lack of air bubbles in the ice can create diverse colors."', 'J'),
              q(4, 'what can happen to an iceberg that is carried towards the land', 'G', 'Paragraph G: "Winds and currents may move icebergs close to coastlines, where they can become frozen into pack ice".', 'G'),
            ],
          },
          {
            id: 'r141-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'Any floating piece of glacier ice counts as an iceberg, whatever its size.', 'FALSE', 'Paragraph A: "An iceberg is a piece of fresh water ice more than 15 meters (16 yards) long"; smaller chunks are called growlers or bergy bits.', 'A'),
              q(6, 'Icebergs from Greenland usually have a flat, table-like shape.', 'FALSE', 'Paragraph B: "Icebergs that calve from glaciers in Greenland are often irregularly shaped while Antarctic ice shelves often produce large tabular (table top) icebergs".', 'B'),
              q(7, 'It is hard to work out the shape of the underwater part of an iceberg from the part that is visible.', 'TRUE', 'Paragraph C: "The contour of the underwater portion can be difficult to judge by looking at the portion above the surface."', 'C'),
              q(8, 'The icebreaker Eastwind was damaged by the iceberg it reported in 1958.', 'NOT GIVEN', 'Paragraph D says the iceberg was "reported by the USCG icebreaker Eastwind in 1958" but says nothing about any damage to the ship.', 'D'),
              q(9, 'Icebergs give clear warning signs before they turn over.', 'FALSE', 'Paragraph I: "Icebergs are unpredictable and can capsize anytime and without warning."', 'I'),
            ],
          },
          {
            id: 'r141-notes', type: 'note_completion', wordLimit: W3,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Icebergs: facts and figures</strong></p><ul><li>Roughly {{q10}} of an iceberg\'s volume is above the water</li><li>The biggest icebergs ever recorded broke away from Antarctica\'s {{q11}}</li><li>Tallest iceberg known in the North Atlantic: {{q12}} metres above sea level</li><li>Air bubbles can make up as much as {{q13}} of an iceberg\'s volume</li></ul>',
            questions: [
              q(10, null, ['one-tenth', 'one tenth', 'a tenth'], 'Paragraph C: "Typically about one-tenth of the volume of an iceberg is above water".', 'C'),
              q(11, null, 'Ross Ice Shelf', 'Paragraph D: "The largest icebergs recorded have been calved, or broken off, from the Ross Ice Shelf of Antarctica."', 'D'),
              q(12, null, '168', 'Paragraph D: "The largest known iceberg in the North Atlantic was 168 metres (551 ft) above sea level".', 'D'),
              q(13, null, ['10%', '10 percent', '10 per cent'], 'Paragraph H: "Icebergs can contain up to 10% air bubbles by volume."', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
