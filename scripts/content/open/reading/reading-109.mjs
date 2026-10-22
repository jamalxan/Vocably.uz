// Vocably Reading 109 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-109',
  title: 'Reading 109: Concrete',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'concrete', title: 'Concrete: From the Nabataeans to Today', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r109-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Concrete is the most widely used substance in the world.', 'FALSE', 'Paragraph A: "It is the second-most-used substance (after water), the most widely used building material".', 'A'),
              q(2, 'The temperature of the surroundings affects how quickly concrete sets.', 'TRUE', 'Paragraph B: "The hydration process is exothermic, which means that ambient temperature plays a significant role in how long it takes concrete to set."', 'B'),
              q(3, 'Mortar contains both large and small aggregate particles.', 'FALSE', 'Paragraph D: "mortar contains only fine aggregates and is mainly used as a bonding agent".', 'D'),
              q(4, 'The Nabataeans shared the design of their cisterns with neighbouring peoples.', 'FALSE', 'Paragraph F: "They kept the cisterns secret as these enabled the Nabataeans to thrive in the desert."', 'F'),
              q(5, 'The Colosseum took longer to build than the Pantheon.', 'NOT GIVEN', 'Paragraph G says "The Colosseum in Rome was built largely of concrete" and "The Pantheon has the world\'s largest unreinforced concrete dome" but gives no information about how long either took to build.', 'G'),
            ],
          },
          {
            id: 'r109-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Place', 'Date', 'Use of concrete or lime'],
              [
                ['Tiryns, Greece', 'c. 1400-1200 BC', 'concrete {{q6}} in a royal palace'],
                ['Assyria', '688 BC', 'the {{q7}} Aqueduct, built with waterproof concrete'],
                ['Southern Syria and northern Jordan', 'from the 4th century BC', 'Nabataean traders used {{q8}} lime for houses, floors and underground cisterns'],
                ['Rome', '300 BC - AD 476', 'Roman concrete made from quicklime, pozzolana and an aggregate of {{q9}}'],
              ],
              'Early uses of concrete',
            ),
            questions: [
              q(6, null, 'floors', 'Paragraph E: "Concrete floors were found in the royal palace of Tiryns, Greece, which dates roughly to 1400 to 1200 BC."', 'E'),
              q(7, null, 'Jerwan', 'Paragraph E: "The Assyrian Jerwan Aqueduct (688 BC) made use of waterproof concrete."', 'E'),
              q(8, null, 'hydraulic', 'Paragraph F: "They discovered the advantages of hydraulic lime, with some self-cementing properties, by 700 BC."', 'F'),
              q(9, null, 'pumice', 'Paragraph G: "Roman concrete (or opus caementicium) was made from quicklime, pozzolana, and an aggregate of pumice".', 'G'),
            ],
          },
          {
            id: 'r109-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'What is the purpose of embedding steel rebar in concrete?', ['to speed up the curing process', 'to make the mixture easier to pour', 'to give the concrete strength under tension', 'to reduce the heat produced by hydration'], 'C', 'Paragraph B: "Most structural concrete is poured with reinforcing materials (such as steel rebar) embedded to provide tensile strength, yielding reinforced concrete."', 'B'),
              mc(11, 'According to the passage, Roman concrete differed from stone and brick in that it', ['was more expensive to produce.', 'hardened quickly and avoided many internal stresses.', 'could only be used for floors.', 'needed many more workers to lay it.'], 'B', 'Paragraph H: "it quickly hardened into a rigid mass, free from many of the internal thrusts and strains that troubled the builders of similar structures in stone or brick".', 'H'),
              mc(12, 'How does the compressive strength of Roman concrete compare with that of modern concrete?', ['It is much lower.', 'It is much higher.', 'It has never been tested.', 'It is about the same.'], 'D', 'Paragraph I: "Modern tests show that opus caementicium had a similar compressive strength to modern Portland-cement concrete".', 'I'),
              mc(13, 'Why does Roman concrete resist seawater better than modern concrete?', ['Its volcanic ingredients react with seawater to form new crystals.', 'It contains steel that does not rust.', 'It was always laid above the waterline.', 'It was mixed to a fluid, homogeneous consistency.'], 'A', 'Paragraph K: "the aforementioned pyroclastic materials react with seawater to form Al-tobermorite crystals over time".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
