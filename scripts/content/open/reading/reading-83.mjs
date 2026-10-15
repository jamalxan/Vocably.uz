// Vocably Reading 83 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-83',
  title: 'Reading 83: The Platypus',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'platypus', title: 'The Platypus: an Animal that Puzzled Science', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r83-head', type: 'matching_headings',
            instructionHtml: 'The passage has nine paragraphs, A-I. Choose the correct heading for paragraphs B, C, E, G and I from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Legal protection and present-day threats',
              'A specimen suspected of being a forgery',
              'Fur, bill and tail: the body of the platypus',
              'Choosing a plural and other popular names',
              'A creature that confused scientists and matters to Aboriginal peoples',
              'How the platypus finds its prey underwater',
              'Breeding success in zoos around the world',
              'Fossil relatives discovered in other countries',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'v', 'Paragraph B: "at first baffled European naturalists" and "It is culturally significant to several Aboriginal peoples".', 'B'),
              q(2, 'Paragraph C', 'i', 'Paragraph C: "since 1912 it has been a legally protected species" and "it is vulnerable to pollution, bycatching and climate change".', 'C'),
              q(3, 'Paragraph E', 'ii', 'Paragraph E: "British scientists\' initial hunch was that the attributes were a hoax" and "Shaw used a pair of scissors to check for stitches."', 'E'),
              q(4, 'Paragraph G', 'iv', 'Paragraph G: "Various dictionaries list" different plurals, and "Early European settlers called it by many names".', 'G'),
              q(5, 'Paragraph I', 'iii', 'Paragraph I describes the "short, dense, brown fur", "The duck-like bill" and the "wide, flat tail".', 'I'),
            ],
          },
          {
            id: 'r83-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Naming the platypus</strong></p><p>The common name comes from Greek and means {{q6}}. When George Shaw first described the species he called it Platypus anatinus, but this genus name was soon found to belong already to a kind of {{q7}}. In 1800 Johann Blumenbach independently described the animal from a specimen he had received from Sir Joseph {{q8}}, and the species was eventually recognised as Ornithorhynchus anatinus. The genus name is Greek for duck-like bird-snout, while the species name comes from the {{q9}} word for duck.</p>',
            questions: [
              q(6, null, 'flat-foot', 'Paragraph F: the common name "means \'flat-foot\', deriving from the Greek word".', 'F'),
              q(7, null, 'beetle', 'Paragraph F: "the genus term was quickly discovered to already be in use as the name of a beetle genus Platypus".', 'F'),
              q(8, null, 'Banks', 'Paragraph F: "described as Ornithorhynchus paradoxus by Johann Blumenbach in 1800 (from a specimen given to him by Sir Joseph Banks)".', 'F'),
              q(9, null, 'Latin', 'Paragraph H: "Its species name is derived from Latin anatinus".', 'H'),
            ],
          },
          {
            id: 'r83-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'The platypus is the only surviving member of its family.', 'TRUE', 'Paragraph A: "The platypus is the sole living representative of the family Ornithorhynchidae".', 'A'),
              q(11, 'Both male and female platypuses are able to inject venom.', 'FALSE', 'Paragraph A: "the male platypus has a spur on each hind foot that delivers an extremely painful venom".', 'A'),
              q(12, 'The otter is the only mammal with denser fur than the platypus.', 'TRUE', 'Paragraph I: "It is one of the most densely furred mammals, behind only otters."', 'I'),
              q(13, 'The colour of platypus fur varies from one region to another.', 'NOT GIVEN', 'Paragraph I mentions only "short, dense, brown fur"; there is no information about regional differences in colour.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
