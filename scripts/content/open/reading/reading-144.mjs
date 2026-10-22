// Vocably Reading 144 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, table, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-144',
  title: 'Reading 144: Container Ships',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'container-ship', title: 'Container Ships', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r144-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs C, D, E, G and J from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'The two kinds of dry cargo that ships carry',
              'How containers changed the handling of goods',
              'Early vessels built to carry standard load units',
              'A converted tanker starts a shipping revolution',
              'The world\'s first fully cellular vessel',
              'The inside of a container ship compared with a large building',
              'The size and number of today\'s container ships',
              'The steel framework that strengthens the hull',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'ii', 'Paragraph C: "Containerization has increased the efficiency of moving traditional break-bulk cargoes significantly, reducing shipping time by 84% and costs by 35%."', 'C'),
              q(2, 'Paragraph D', 'iii', 'Paragraph D: "The first ships designed to carry standardized load units were used in the late 18th century in England."', 'D'),
              q(3, 'Paragraph E', 'iv', 'Paragraph E: "The first commercially successful container ship was Ideal X, a T2 tanker" and "a new revolution in modern shipping resulted".', 'E'),
              q(4, 'Paragraph G', 'vi', 'Paragraph G: "The hull of a typical container ship is similar to an airport hangar, or a huge warehouse, which is divided into individual holding cells".', 'G'),
              q(5, 'Paragraph J', 'viii', 'Paragraph J: "The beams not only support the deck, but along with the deck, frames, and transverse bulkheads, strengthen and reinforce the shell."', 'J'),
            ],
          },
          {
            id: 'r144-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Vessel', 'Year', 'Notes'],
              [
                ['Starvationer', '1766', 'box boat designed by {{q6}} to carry coal along a canal'],
                ['SS Autocarrier', '{{q7}}', 'the first container ship in the world, owned by the Southern Railway'],
                ['Ideal X', '1956', 'converted tanker that carried {{q8}} metal containers on its first voyage'],
                ['MV Kooringa', '{{q9}}', 'the first fully cellular, purpose-built container ship, built in Australia'],
              ],
              'Milestones in container shipping',
            ),
            questions: [
              q(6, null, ['James Brindley', 'Brindley'], 'Paragraph D: "In 1766 James Brindley designed the box boat" named Starvationer "with 10 wooden containers, to transport coal from Worsley Delph to Manchester via the Bridgewater Canal".', 'D'),
              q(7, null, ['1931', 'February 1931'], 'Paragraph D: "In February 1931, the first container ship in the world was launched; the SS Autocarrier, owned by the Southern Railway."', 'D'),
              q(8, null, '58', 'Paragraph E: Ideal X "carried 58 metal containers between Newark, New Jersey and Houston, Texas, on its first voyage".', 'E'),
              q(9, null, ['1964', 'May 1964'], 'Paragraph F: "MV Kooringa was the world\'s first fully cellular, purpose-built container ship" and was "commissioned in May 1964".', 'F'),
            ],
          },
          {
            id: 'r144-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Bulk cargo mainly consists of manufactured products.', 'FALSE', 'Paragraph B: "Bulk cargoes, like grain or coal, are transported unpackaged in the hull of the ship"; it is break-bulk cargoes that "are generally manufactured goods".', 'B'),
              q(11, 'Before containerization, each item of break-bulk cargo had to be handled on its own.', 'TRUE', 'Paragraph C: "break-bulk items required manual loading, lashing, unlashing and unloading from the ship one piece at a time".', 'C'),
              q(12, 'Shipping containers are always made of steel.', 'FALSE', 'Paragraph G: containers "are typically constructed of steel, though sometimes of aluminum, fiberglass or plywood".', 'G'),
              q(13, 'The number of container ships in service is expected to rise.', 'NOT GIVEN', 'Paragraph H gives the current figure, "about 50,000 container ships", but says nothing about future numbers.', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
