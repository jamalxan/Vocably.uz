// Vocably Reading 97 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-97',
  title: 'Reading 97: The Monsoon',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'monsoon', title: 'The Monsoon: Winds That Bring the Rain', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r97-head', type: 'matching_headings',
            instructionHtml: 'The passage has eight paragraphs, A-H. Choose the correct heading for paragraphs D-H from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'How uneven heating produces summer rainfall over land',
              'Dating the birth of the Asian monsoon',
              'Why the sea changes temperature more slowly than the land',
              'An ocean current whose weakening affected monsoon strength',
              'Falling sea levels and the closing of a seaway',
              'The economic cost of monsoon flooding',
              'Forecasting the monsoon with satellite data',
              'The first use of the word in the English language',
            ], true),
            questions: [
              q(1, 'Paragraph D', 'ii', 'Paragraph D: "many geologists believe the monsoon first became strong around 8 million years ago", with other studies suggesting "the monsoon beginning 15–20 million years ago".', 'D'),
              q(2, 'Paragraph E', 'v', 'Paragraph E: "during ice periods, the sea level fell and the Indonesian Seaway closed".', 'E'),
              q(3, 'Paragraph F', 'iv', 'Paragraph F: five episodes "showed a weakening of the Leeuwin Current (LC)" which "would have influenced Indian monsoon intensity".', 'F'),
              q(4, 'Paragraph G', 'iii', 'Paragraph G: "bodies of water stay at a more even temperature, while land temperatures are more variable".', 'G'),
              q(5, 'Paragraph H', 'i', 'Paragraph H: "land temperatures rise more quickly" and the resulting pressure difference ends up "causing summer monsoons to rain over land".', 'H'),
            ],
          },
          {
            id: 'r97-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The word "monsoon" is generally applied to the wet part of the seasonal cycle.', 'TRUE', 'Paragraph B: "the term monsoon is used to refer to the rainy phase of a seasonally changing pattern".', 'B'),
              q(7, 'The term entered the English language through contact with Arab sailors.', 'NOT GIVEN', 'Paragraph C says only that "The term was first used in English in British India and neighbouring countries"; it does not say how the word reached English.', 'C'),
              q(8, 'During the Eemian interglacial, Asian monsoon cycles lasted far longer than they do today.', 'FALSE', 'Paragraph D: the cycles "had an average duration of around 64 years, with the minimum duration being around 50 years and the maximum approximately 80 years, similar to today".', 'D'),
              q(9, 'The South Asian Monsoon delivered less rain during glacial periods than during interglacial ones.', 'TRUE', 'Paragraph E: "precipitation resulting from the monsoon was significantly reduced during glacial periods compared to interglacial periods like the present day".', 'E'),
            ],
          },
          {
            id: 'r97-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How a summer monsoon forms</strong></p><p>In the warmer months the land heats up faster than the sea. The air above the land {{q10}}, and a region of low {{q11}} develops, while the air over the cooler ocean keeps a higher pressure. Winds therefore blow from the sea towards the land, carrying {{q12}} air inland. As this air rises over the land it {{q13}}, which reduces its capacity to hold water, and rain falls over the land.</p>',
            questions: [
              q(10, null, 'expands', 'Paragraph H: "As the land\'s surface becomes warmer, the air above it expands".', 'H'),
              q(11, null, 'pressure', 'Paragraph H: "an area of low pressure develops".', 'H'),
              q(12, null, 'moist', 'Paragraph H: sea breezes blow "from the ocean to the land, bringing moist air inland".', 'H'),
              q(13, null, 'cools', 'Paragraph H: "when the air rises, and while it is still over the land, the air cools".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
