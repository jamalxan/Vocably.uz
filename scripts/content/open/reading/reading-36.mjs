// Vocably Reading 36 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-36',
  title: 'Reading 36: The Stones of Salisbury Plain',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'stonehenge', title: 'The Stones of Salisbury Plain', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r36-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a definition of a technical term used by archaeologists', 'F', 'Paragraph F: "Archaeologists define henges as earthworks consisting of a circular banked enclosure with an internal ditch."', 'F'),
              q(2, 'a reference to a site believed to be the oldest calendar in the world', 'I', 'Paragraph I: "Warren Field in Aberdeenshire, which is considered the world\'s oldest lunisolar calendar".', 'I'),
              q(3, 'details of who owns and looks after the monument today', 'C', 'Paragraph C: "Stonehenge is owned by the Crown Estate and managed by English Heritage; the surrounding land is owned by the National Trust."', 'C'),
              q(4, 'a mention of a building technique not found at any other monument of the period', 'A', 'Paragraph A: lintels "held in place with mortise and tenon joints—a feature unique among contemporary monuments".', 'A'),
              q(5, 'reasons why it is hard to date the different stages of construction', 'H', 'Paragraph H: "Dating and understanding the various phases of activity are complicated by disturbance of the natural chalk by periglacial effects and animal burrowing, poor quality early excavation records, and a lack of accurate, scientifically verified dates."', 'H'),
            ],
          },
          {
            id: 'r36-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Key dates in the Stonehenge landscape</strong></p><ul><li>c. 8000 BC: holes beneath the former car park held large {{q6}} posts, which eventually rotted where they stood</li><li>c. 3500 BC: a Stonehenge {{q7}} built about 700 metres north of the site as farmers cleared the woodland</li><li>c. 3100 BC: earliest phase of the monument – the circular bank and {{q8}}</li><li>2600–{{q9}} BC: the famous circle of large sarsen stones put in place</li></ul>',
            questions: [
              q(6, null, 'pine', 'Paragraph I: "These held pine posts around two feet six inches (0.75 m) in diameter, which were erected and eventually rotted in place."', 'I'),
              q(7, null, 'Cursus', 'Paragraph J: "In approximately 3500 BC, a Stonehenge Cursus was built 2,300 feet (700 m) north of the site as the first farmers began clearing the trees".', 'J'),
              q(8, null, 'ditch', 'Paragraph B: "The surrounding circular earth bank and ditch, which constitute the earliest phase of the monument, have been dated to about 3100 BC."', 'B'),
              q(9, null, '2400', 'Paragraph B: "The famous circle of large sarsen stones was placed between 2600 BC and 2400 BC."', 'B'),
            ],
          },
          {
            id: 'r36-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'What does the writer say about the origin of the name "Stonehenge"?', [
                'It was invented by William Stukeley in 1740.',
                'It may derive from Old English words meaning hanging or hinged stones.',
                'It refers to the ring of smaller bluestones.',
                'Its meaning has been lost completely.',
              ], 'B', 'Paragraph E: Stukeley wrote that "Stonehenge in Saxon signifies the hanging stones", and Chippindale derives it "from the Old English words stān \'stone\', and either hencg \'hinge\'" or a word meaning to hang.', 'E'),
              mc(11, 'What is said about human remains found at Stonehenge?', [
                'They all date from the period of the sarsen stones.',
                'They were discovered only in the surrounding burial mounds.',
                'They were all placed there within a single century.',
                'They show that burials began when the ditch and bank were first dug.',
              ], 'D', 'Paragraph D: "Deposits containing human bone date from as early as 3000 BC, when the ditch and bank were first dug, and continued for at least another 500 years."', 'D'),
              mc(12, 'What does the writer say about Blick Mead?', [
                'It is a spring where people may have lived at the time the Mesolithic posts were erected.',
                'It is the quarry from which the sarsen stones were taken.',
                'It is a lunisolar calendar similar to Warren Field.',
                'It was built by the first farmers around 3500 BC.',
              ], 'A', 'Paragraph I: "A settlement that may have been contemporaneous with the posts has been found at Blick Mead, a reliable year-round spring one mile (1.6 km) from Stonehenge."', 'I'),
              mc(13, 'According to the University of Buckingham\'s researchers, the people who built Stonehenge', [
                'came to the area from Scandinavia.',
                'cleared Salisbury Plain of trees in a single generation.',
                'lived in the area for thousands of years.',
                'abandoned the site soon after it was finished.',
              ], 'C', 'Paragraph J: the institute "believes that the community who built Stonehenge lived there for several millennia".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
