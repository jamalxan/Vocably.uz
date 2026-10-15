// Vocably Reading 86 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-86',
  title: 'Reading 86: How Geysers Work',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'geyser', title: 'How Geysers Work', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r86-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs C, G, H, I and K from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'What separates a geyser from an ordinary hot spring',
              'Eruptions beyond our planet',
              'The three conditions that geysers need',
              'The end of one eruption and the start of the next',
              'Measuring the temperature of magma',
              'How a mineral coating builds up',
              'Why the water can get hotter than its normal boiling point',
              'The moment steam bursts out of the vent',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'ii', 'Paragraph C: "geysers are not unique to Earth" and "Jet-like eruptions, often called cryogeysers, have been observed on several of the moons of the outer Solar System."', 'C'),
              q(2, 'Paragraph G', 'vi', 'Paragraph G: "Geysers tend to be coated with geyserite" and "Gradually the opal anneals into quartz, forming geyserite."', 'G'),
              q(3, 'Paragraph H', 'i', 'Paragraph H: "Geysers also differ from non-eruptive hot springs in their subterranean structure".', 'H'),
              q(4, 'Paragraph I', 'vii', 'Paragraph I: "allowing the water in the reservoir to become superheated, i.e. to remain liquid at temperatures well above the standard-pressure boiling point".', 'I'),
              q(5, 'Paragraph K', 'iv', 'Paragraph K: "the eruption ends; heated groundwater begins seeping back into the reservoir, and the whole cycle begins again".', 'K'),
            ],
          },
          {
            id: 'r86-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Geysers occur in many different parts of the world.', 'FALSE', 'Paragraph A: "The formation of geysers is fairly rare and is caused by particular hydrogeological conditions that exist only in a few places on Earth."', 'A'),
              q(7, 'Human activity can cause a geyser to stop erupting.', 'TRUE', 'Paragraph C: "A geyser\'s eruptive activity may change or cease due to ... human intervention".', 'C'),
              q(8, 'The plumes on Enceladus are believed to be powered by heat from the Sun.', 'FALSE', 'Paragraph D: "In the case of Enceladus, the plumes are believed to be driven by internal energy."', 'D'),
              q(9, 'The microbial mats found in geysers are harmful to people.', 'NOT GIVEN', 'Paragraph G says only that "Geyserite often covers the microbial mats that grow in geysers"; nothing is said about any effect on people.', 'G'),
            ],
          },
          {
            id: 'r86-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Inside a geyser</strong></p><ul><li>Three requirements, usually found in volcanic areas: heat, water and an underground {{q10}} system of the right shape</li><li>The heat is supplied by {{q11}} lying close to the surface</li><li>Unlike ordinary hot springs, geysers have {{q12}} in their plumbing which make pressure build up</li><li>Cooler water at the top presses down on the hotter water below, like the lid of a pressure {{q13}}, so the water becomes superheated</li></ul>',
            questions: [
              q(10, null, ['hydraulic', 'plumbing'], 'Paragraph E: "heat, water, and a subsurface hydraulic system with the right geometry".', 'E'),
              q(11, null, 'magma', 'Paragraph F: "The heat needed for geyser formation comes from magma that needs to be close to the surface of the Earth."', 'F'),
              q(12, null, 'constrictions', 'Paragraph H: "geysers have constrictions in their plumbing that create pressure build-up".', 'H'),
              q(13, null, 'cooker', 'Paragraph I: "The cooler water above presses down on the hotter water beneath, not unlike the lid of a pressure cooker".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
