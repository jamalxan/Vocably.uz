// Vocably Reading 158 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-158',
  title: 'Reading 158: Pompeii',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'pompeii', title: 'Pompeii: A City Frozen in Time', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r158-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs B, C, F, I and J from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'The position of the site between volcano and sea',
              'Pompeii\'s part in Roman military history',
              'Control without conquest under a new power',
              'A window on everyday life in the Roman world',
              'The origin of the city\'s name',
              'A single town takes shape behind an unusually large wall',
              'Centuries of neglect followed by careless digging',
              'The eruption that destroyed the city',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'iv', 'Paragraph B: "Pompeii offers a snapshot of Roman life, frozen at the moment it was buried, as well as insight into ancient urban planning".', 'B'),
              q(2, 'Paragraph C', 'vii', 'Paragraph C: "Pompeii remained largely undisturbed until its rediscovery in the late 16th century" and "Initial efforts to unearth the city were haphazard or marred by looting".', 'C'),
              q(3, 'Paragraph F', 'i', 'Paragraph F: "Pompeii was built approximately 40 m (130 ft) above sea level on a coastal lava plateau created by earlier eruptions of Mount Vesuvius" and "The city, once by the shoreline, is today circa 700 m (2,300 ft) inland."', 'F'),
              q(4, 'Paragraph I', 'vi', 'Paragraph I: "the settlement merged into a single community" and "The first wall (which was also used as a base for the later wall) unusually enclosed a much greater area than the early town".', 'I'),
              q(5, 'Paragraph J', 'iii', 'Paragraph J: "Like the Greeks, the Etruscans did not conquer the city militarily, but simply controlled it, and Pompeii enjoyed a sort of autonomy."', 'J'),
            ],
          },
          {
            id: 'r158-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Pompeii was the only settlement buried by the eruption of 79 AD.', 'FALSE', 'Paragraph A: "Along with Herculaneum, Stabiae, and many surrounding villas, it was buried under 4 to 6 m (13 to 20 ft) of volcanic ash and pumice".', 'A'),
              q(7, 'The graffiti found at Pompeii show how ordinary people actually spoke.', 'TRUE', 'Paragraph B: "The numerous graffiti carved on outside walls and inside rooms provide a wealth of examples of the largely lost Vulgar Latin spoken colloquially at the time".', 'B'),
              q(8, 'By 1960 the greater part of the city had been dug out.', 'TRUE', 'Paragraph C: "By 1960, most of Pompeii had been uncovered but left in decay".', 'C'),
              q(9, 'Pompeii attracts more visitors than any other site in Italy.', 'NOT GIVEN', 'Paragraph D says only that "It is among the most popular tourist attractions in Italy, with approximately 2.5 million visitors annually"; it does not say it is the most visited.', 'D'),
              q(10, 'The Doric Temple stood in the centre of the Greek-period settlement.', 'FALSE', 'Paragraph H: "The most important building of this period is the Doric Temple, built away from the centre in what would later become the Triangular Forum."', 'H'),
            ],
          },
          {
            id: 'r158-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Pompeii: key facts</strong></p><ul><li>Buried under 4-6 metres of volcanic ash and {{q11}}</li><li>Population when destroyed: between 10,000 and {{q12}}</li><li>Casts of victims were possible because {{q13}} remains, such as wood and bodies, decayed inside the ash</li><li>Name possibly derived from the Oscan word for the number {{q14}}</li></ul>',
            questions: [
              q(11, null, 'pumice', 'Paragraph A: "it was buried under 4 to 6 m (13 to 20 ft) of volcanic ash and pumice".', 'A'),
              q(12, null, ['20,000', '20000'], 'Paragraph B: "It was a wealthy town of 10,000 to 20,000 residents at the time it was destroyed."', 'B'),
              q(13, null, 'organic', 'Paragraph B: "Organic remains, including wooden objects and human bodies, were interred in the ash; their decay allowed archaeologists to create moulds of figures in their final moments of life."', 'B'),
              q(14, null, ['five', 'pompe'], 'Paragraph E: "The root of the word Pompeii would appear to be the Oscan word for the number five, pompe".', 'E'),
            ],
          },
        ],
      }),
    ],
  },
};
