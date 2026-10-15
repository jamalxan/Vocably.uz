// Vocably Reading 17 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-17',
  title: 'Reading 17: Göbekli Tepe',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'gobekli-tepe', title: 'Göbekli Tepe: The World\'s Oldest Monuments', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r17-head', type: 'matching_headings',
            instructionHtml: 'The passage has nine paragraphs, A-I. Choose the correct heading for paragraphs B, C, D, F and G from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Signs that people lived at the site all year round',
              'A site at the heart of an argument about farming and settlement',
              'Discovery, excavation and international recognition',
              'A landscape that was richer than it is today',
              'A well-chosen position with materials and water close at hand',
              'How the great pillars were carved and raised',
              'Trade links with distant regions',
              'The religious beliefs of the builders',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: prehistorians "disagree on whether farming caused people to settle down or vice versa" and Göbekli Tepe "has played a prominent role in this debate".', 'B'),
              q(2, 'Paragraph C', 'i', 'Paragraph C: "Findings published in 2019 suggest a settlement at Göbekli Tepe, with domestic structures, extensive cereal processing, a water supply, and tools associated with daily life."', 'C'),
              q(3, 'Paragraph D', 'iii', 'Paragraph D: "The site was first noted in a 1963 archaeological survey", Schmidt "began excavations there the following year", and it "was designated a UNESCO World Heritage Site in 2018".', 'D'),
              q(4, 'Paragraph F', 'iv', 'Paragraph F: "The climate of the area was wetter when Göbekli Tepe was occupied than it is today" and the site "was surrounded by an open steppe grassland, with abundant wild cereals".', 'F'),
              q(5, 'Paragraph G', 'v', 'Paragraph G: "This location also gave the builders good access to raw material" and the village "acquired drinking water through a rainwater harvesting system".', 'G'),
            ],
          },
          {
            id: 'r17-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The stone pillars at the site are among the oldest known anywhere in the world.', 'TRUE', 'Paragraph A: "large stone pillars – among the world\'s oldest known megaliths".', 'A'),
              q(7, 'The large circular structures were probably open to the sky.', 'FALSE', 'Paragraph C: "They were likely roofed and appear to have regularly collapsed".', 'C'),
              q(8, 'By 2021 most of the site had been dug out by archaeologists.', 'FALSE', 'Paragraph D: "As of 2021, around 10% of the site has been excavated."', 'D'),
              q(9, 'The cave on the western side of the site was used for burials.', 'NOT GIVEN', 'Paragraph H says only that "a small cave was discovered, and a small relief depicting a bovid was found" there; the passage does not say what the cave was used for.', 'H'),
            ],
          },
          {
            id: 'r17-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Who has directed the excavations since the death of Klaus Schmidt?', ['Necmi Karul', 'Karul'], 'Paragraph D: "work continued as a joint project of Istanbul University, Şanlıurfa Museum, and the German Archaeological Institute, under the direction of Turkish prehistorian Necmi Karul".', 'D'),
              q(11, 'What is the minimum number of large enclosures that surveys have detected in the mound?', ['20', 'twenty'], 'Paragraph D: geophysical surveys "showed the mound to contain at least 20 large enclosures".', 'D'),
              q(12, 'What kind of rock forms the plateau on which the site stands?', 'limestone', 'Paragraph E: "The site is a tell (artificial mound) on a flat limestone plateau."', 'E'),
              q(13, 'Which tree, together with the almond, provided almost all of the charcoal found at the site?', 'pistachio', 'Paragraph F: "90% of the charcoal recovered at the site was from pistachio or almond trees".', 'F'),
              q(14, 'What material did the builders use to make tools for shaping the stone?', 'flint', 'Paragraph G: "the soft limestone bedrock from which the complex was built and the flint to make the tools to work the limestone".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
