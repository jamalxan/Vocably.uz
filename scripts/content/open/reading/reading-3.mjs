// Vocably Reading 3 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-3',
  title: 'Reading 3: Roman Roads',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'roman-roads', title: 'The Roads of Rome', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r3-head', type: 'matching_headings',
            instructionHtml: 'The passage has eight paragraphs, A-H. Choose the correct heading for paragraphs B, C, D, F, G and H from the list of headings below. Write the correct number, <strong>i-ix</strong>.',
            bank: bank([
              'Rights of passage and limits on vehicles in towns',
              'The scale of the network at its height',
              'How the roads were paid for',
              'Roads mentioned in early accounts that were probably not yet paved',
              'Legal rules on road width and the aim of building to last',
              'Techniques for crossing water and marshy ground',
              'What buried coins reveal about roads and trade',
              'Tracks that existed before the Romans arrived',
              'Where the roads reached, and where they did not',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: "no fewer than 29 great military highways radiated from the capital, and the empire\'s 113 provinces were interconnected by 372 great roads".', 'B'),
              q(2, 'Paragraph C', 'iv', 'Paragraph C: "Livy mentions some of the most familiar roads near Rome" and they "were probably at the time little more than levelled earthen tracks".', 'C'),
              q(3, 'Paragraph D', 'ix', 'Paragraph D: "With the exception of some outlying portions" ... "the whole Empire was penetrated by these itinera".', 'D'),
              q(4, 'Paragraph F', 'vii', 'Paragraph F: research "has used coin-hoard evidence to examine the economic role of Roman roads".', 'F'),
              q(5, 'Paragraph G', 'v', 'Paragraph G: the Tables "required that any public road (Latin via) be 8 Roman feet" wide, and "Building roads that would not need frequent repair therefore became an ideological objective".', 'G'),
              q(6, 'Paragraph H', 'i', 'Paragraph H: "Roman law defined the right to use a road as a servitus" and "Roman law and tradition forbade the use of vehicles in urban areas".', 'H'),
            ],
          },
          {
            id: 'r3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(7, 'What does the writer suggest about the roads that Livy refers to?', ['They were the first roads in Italy to be paved with stone.', 'At the time, they were probably no more than tracks of levelled earth.', 'They were all constructed after the Appian Way.', 'Livy invented them to make his history more convincing.'], 'B', 'Paragraph C: "the roads referred to were probably at the time little more than levelled earthen tracks".', 'C'),
              mc(8, 'According to the coin-hoard study, what happened to the influence of distance on the circulation of money?', ['It became stronger as the empire grew.', 'It stayed the same throughout the period studied.', 'It became weaker over time.', 'It could not be measured reliably.'], 'C', 'Paragraph F: "the effect of distance on circulation weakened over time, suggesting that the expansion of roads and related infrastructure helped integrate more distant regions".', 'F'),
              mc(9, 'Why did the Romans try to build their roads as straight as possible?', ['to make them easier to defend', 'to reduce the amount of material required', 'to allow two carts to pass each other', 'to comply with the width laid down in the Twelve Tables'], 'B', 'Paragraph G: "as straight as practicable to construct the shortest possible roads, and thus save on material".', 'G'),
              mc(10, 'Who was normally allowed to travel by vehicle inside a Roman city?', ['soldiers returning from a campaign', 'married women and officials on government business', 'merchants delivering goods during the day', 'anyone who paid a toll at the gate'], 'B', 'Paragraph H: "Married women and government officials on business could ride."', 'H'),
            ],
          },
          {
            id: 'r3-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Across the whole empire, more than ______ kilometres of road had a stone surface.', ['80,500', '80500'], 'Paragraph B: "over 80,500 kilometres (50,000 mi) were stone-paved".', 'B'),
              q(12, 'Livy\'s account indicates that the Via Salaria already existed in ______ BC.', '361', 'Paragraph C: "and the Via Salaria in 361 BC".', 'C'),
              q(13, 'The Ridgeway and the Icknield Way are examples of ancient ______ in Britain that predate the Romans.', 'trackways', 'Paragraph E: "some pre-Roman ancient trackways in Britain, such as the Ridgeway and the Icknield Way".', 'E'),
              q(14, 'In the countryside of the later republic, public roads were generally wide enough for two ______ to pass one another.', 'carts', 'Paragraph G: "permitting the passing of two carts of standard (4 foot) width without interference to pedestrian traffic".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
