// Vocably Reading 160 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-160',
  title: 'Reading 160: The Telescope',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'telescope', title: 'The Telescope', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r160-features', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of telescopes below. Match each statement with the correct telescope, <strong>A-F</strong>.',
            bank: bank(['Hubble Space Telescope', 'Spitzer Space Telescope', 'Kepler Space Telescope', 'James Webb Space Telescope', 'James Clerk Maxwell Telescope', 'TRACE and SOHO']),
            questions: [
              q(1, 'found a large number of planets outside our solar system', 'C', 'Paragraph H: "the Kepler Space Telescope that discovered thousands of exoplanets".', 'H'),
              q(2, 'gathers radiation with an antenna rather than a mirror', 'E', 'Paragraph I: "the James Clerk Maxwell Telescope observes from wavelengths from 3 μm (0.003 mm) to 2000 μm (2 mm), but uses a parabolic aluminum antenna".', 'I'),
              q(3, 'was carried into space by a European rocket in 2021', 'D', 'Paragraph H: "The latest telescope that was launched was the James Webb Space Telescope on 25 December 2021, in Kourou, French Guiana with an Ariane 5 rocket."', 'H'),
              q(4, 'use specially designed mirrors to reflect extreme ultraviolet radiation', 'F', 'Paragraph J: "Telescopes such as TRACE and SOHO use special mirrors to reflect extreme ultraviolet, producing higher resolution and brighter images than are otherwise possible."', 'J'),
              q(5, 'can observe from ultraviolet to infrared light with a single camera', 'A', 'Paragraph I: "the Hubble Space Telescope with Wide Field Camera 3 can observe in the frequency range from about 0.2 μm (0.0002 mm) to 1.7 μm (0.0017 mm) (from ultra-violet to infrared light)".', 'I'),
            ],
          },
          {
            id: 'r160-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The word \'telescope\' was invented by Galileo himself.', 'FALSE', 'Paragraph B: "The word telescope was coined in 1611 by the Greek mathematician Giovanni Demisiani for one of Galileo Galilei\'s instruments".', 'B'),
              q(7, 'Nobody knows for certain who invented the telescope.', 'TRUE', 'Paragraph C: "The actual inventor is unknown but word of it spread through Europe."', 'C'),
              q(8, 'Newton built his reflecting telescope in order to study the planets.', 'NOT GIVEN', 'Paragraph D says "In 1668, Isaac Newton built the first practical reflecting telescope" but gives no reason why he built it.', 'D'),
              q(9, 'Refracting telescopes can be built to any size.', 'FALSE', 'Paragraph E: "The maximum physical size limit for refracting telescopes is about 1 meter (39 inches)".', 'E'),
            ],
          },
          {
            id: 'r160-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Year', 'Development'],
              [
                ['1608', 'patent for a refracting telescope submitted by the spectacle maker Hans {{q10}}'],
                ['1733', 'invention of the {{q11}} lens, which partly corrected colour aberration'],
                ['1857', 'introduction of glass mirrors coated with {{q12}}'],
                ['{{q13}}', 'the first purpose-built radio telescope starts operating'],
                ['1956', 'John Dobson invents the {{q14}} telescope'],
              ],
              'Milestones in the history of the telescope',
            ),
            questions: [
              q(10, null, 'Lipperhey', 'Paragraph C: "a 1608 patent submitted to the government in the Netherlands by Middelburg spectacle maker Hans Lipperhey for a refracting telescope".', 'C'),
              q(11, null, 'achromatic', 'Paragraph E: "The invention of the achromatic lens in 1733 partially corrected color aberrations present in the simple lens".', 'E'),
              q(12, null, 'silver', 'Paragraph E: "a problem alleviated by the introduction of silver coated glass mirrors in 1857, and aluminized mirrors in 1932".', 'E'),
              q(13, null, '1937', 'Paragraph F: "The first purpose-built radio telescope went into operation in 1937."', 'F'),
              q(14, null, 'Dobsonian', 'Paragraph D: "John Dobson invented the Dobsonian telescope in 1956."', 'D'),
            ],
          },
        ],
      }),
    ],
  },
};
