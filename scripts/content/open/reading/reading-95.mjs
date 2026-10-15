// Vocably Reading 95 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-95',
  title: 'Reading 95: Acid Rain',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'acid-rain', title: 'Acid Rain: Causes, Effects and the Scientists Who Found It', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r95-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'examples of the damage acid rain does to man-made structures', 'B', 'Paragraph B: "the peeling of paint, corrosion of steel structures, and weathering of stone buildings and statues".', 'B'),
              q(2, 'the names of two pieces of legislation intended to cut harmful emissions', 'C', 'Paragraph C: "the US Clean Air Act and the EU Ambient Air Quality Directive".', 'C'),
              q(3, 'a mention of exceptionally acidic readings taken in industrial regions', 'E', 'Paragraph E: "Occasional pH readings in rain and fog water of well below 2.4 have been reported in industrialized areas."', 'E'),
              q(4, 'a reference to the role of a newspaper in informing the American public', 'H', 'Paragraph H: "public awareness of acid rain in the US increased in the 1970s after The New York Times reported on these findings".', 'H'),
              q(5, 'a description of a long-term government-backed programme of research', 'J', 'Paragraph J: "This Act established an 18-year assessment and research program under the direction of the National Acid Precipitation Assessment Program (NAPAP)."', 'J'),
            ],
          },
          {
            id: 'r95-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Date', 'Scientist(s)', 'Contribution'],
              [
                ['1852', 'Robert Angus Smith', 'demonstrated the connection between acid rain and air pollution in the English city of {{q6}}'],
                ['1955', 'two {{q7}} scientists', 'noted that rain over their country was more acidic than carbon dioxide alone could explain'],
                ['(no date given)', 'Waldemar Christofer Brøgger', 'first recognised that pollutants were carried across borders from the UK to {{q8}}'],
                ['1968', 'Svante Odén', 'drew attention to the problem in the press and published a {{q9}} paper'],
              ],
              'Early research into acid rain in Europe',
            ),
            questions: [
              q(6, null, 'Manchester', 'Paragraph F: "Robert Angus Smith was the first to show the relationship between acid rain and atmospheric pollution in Manchester, England".', 'F'),
              q(7, null, 'Swedish', 'Paragraph G: "In 1955 two Swedish scientists had already quoted that".', 'G'),
              q(8, null, 'Norway', 'Paragraph G: "long-distance transportation of pollutants crossing borders from the United Kingdom to Norway".', 'G'),
              q(9, null, 'landmark', 'Paragraph G: Odén "wrote a landmark paper on the subject in 1968".', 'G'),
            ],
          },
          {
            id: 'r95-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Ordinary drinking water typically has a pH below 6.5.', 'FALSE', 'Paragraph A: "Most water, including drinking water, has a neutral pH that exists between 6.5 and 8.5".', 'A'),
              q(11, 'Lightning is a natural source of nitrogen oxides.', 'TRUE', 'Paragraph C: "nitrogen oxides can also be produced naturally by lightning strikes".', 'C'),
              q(12, 'Rain that is free of pollution is slightly acidic.', 'TRUE', 'Paragraph D: unpolluted rain "has a pH greater than 5 but still less than 7 owing to the acidity caused by carbonic acid".', 'D'),
              q(13, 'Making Norris Brook more acidic resulted in a wider variety of species living there.', 'FALSE', 'Paragraph I: "There was a decrease in species diversity, an increase in community dominants, and a reduction in the food web complexity."', 'I'),
              q(14, 'NAPAP investigated the effects of acid rain on human health.', 'NOT GIVEN', 'Paragraph J lists studies of "freshwater and terrestrial ecosystems", of "historical buildings, monuments, and building materials" and of "atmospheric processes and potential control programs", but says nothing about human health.', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
