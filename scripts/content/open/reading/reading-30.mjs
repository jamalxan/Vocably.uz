// Vocably Reading 30 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-30',
  title: 'Reading 30: The Elevator',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'elevator', title: 'Going Up: A Short History of the Elevator', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r30-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'All modern elevators are driven by electric motors.', 'FALSE', 'Paragraph A: "They are typically powered by electric motors that drive traction cables and counterweight systems such as a hoist, although some pump hydraulic fluid to raise a cylindrical piston like a jack."', 'A'),
              q(2, 'Some elevators are able to travel sideways.', 'TRUE', 'Paragraph B: "Some elevators can even move horizontally."', 'B'),
              q(3, 'Archimedes built his elevator for military purposes.', 'NOT GIVEN', 'Paragraph C only says that Vitruvius "reported that Archimedes (c. 287 BC – c. 212 BC) built his first elevator probably in 236 BC"; no purpose is given.', 'C'),
              q(4, 'Each elevator in the Colosseum could be worked by as many as eight people.', 'TRUE', 'Paragraph D: "Each elevator could carry about 600 pounds (270 kg) (roughly the weight of two lions) 23 feet (7.0 m) up when powered by up to eight men."', 'D'),
              q(5, 'The flying chair at Versailles was built for the king\'s own use.', 'FALSE', 'Paragraph E: Louis XV "had a so-called \'flying chair\' built for one of his mistresses at the Château de Versailles in 1743".', 'E'),
            ],
          },
          {
            id: 'r30-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Date', 'Place / people', 'Development'],
              [
                ['1793', 'Ivan Kulibin, Winter Palace', 'first elevator to use a {{q6}} drive'],
                ['1823', 'Burton and Homer, London', 'the "ascending room": a {{q7}} attraction with a panoramic view'],
                ['1835', 'Frost and Stutt, England', 'the Teagle: belt-driven, with a {{q8}} for extra lifting power'],
                ['{{q9}}', 'Sir William Armstrong, Tyneside', 'hydraulic crane for loading cargo at the docks'],
                ['1857', '488 Broadway, New York City', 'first passenger elevator of the {{q10}} type introduced by Otis'],
              ],
              'Milestones in elevator history',
            ),
            questions: [
              q(6, null, 'screw', 'Paragraph F: "The first screw-drive elevator was built by Ivan Kulibin and installed in the Winter Palace in 1793".', 'F'),
              q(7, null, 'tourist', 'Paragraph G: "Burton and Homer, two architects in London, built and operated a novel tourist attraction which they called the "ascending room"".', 'G'),
              q(8, null, 'counterweight', 'Paragraph H: "It was belt-driven and used a counterweight for extra lifting ability."', 'H'),
              q(9, null, '1846', 'Paragraph J: "The hydraulic crane was invented by Sir William Armstrong in 1846, primarily for use at the Tyneside docks for loading cargo."', 'J'),
              q(10, null, 'safety', 'Paragraph K: "In 1852, Elisha Otis introduced the safety elevator" and "the first such passenger elevator was installed at 488 Broadway in New York City on 23 March 1857".', 'K'),
            ],
          },
          {
            id: 'r30-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'What does the writer say about the elevator installed in the Royal Palace of Caserta?', [
                'It was powered by steam.',
                'It could be set in motion from outside the cab.',
                'It had no protection against a broken cord.',
                'It was made entirely of metal.',
              ], 'B', 'Paragraph I: it "could be activated from the outside, without any effort by the occupants" and "A safety system was designed to take effect if the cords broke".', 'I'),
              mc(12, 'According to the passage, hydraulic cranes quickly replaced steam-driven elevators because they', [
                'were cheaper to build.',
                'did not need counterweights.',
                'could exert far greater force.',
                'were easier to operate.',
              ], 'C', 'Paragraph J: "They quickly supplanted the earlier steam-driven elevators, exploiting Pascal\'s law to provide much greater force."', 'J'),
              mc(13, 'What was special about the elevator Elisha Otis introduced in 1852?', [
                'It was the first elevator to carry passengers.',
                'It was faster than any previous elevator.',
                'It stopped the cab from falling if the cable broke.',
                'It was the first to be driven by electricity.',
              ], 'C', 'Paragraph K: "Elisha Otis introduced the safety elevator, which prevented the fall of the cab if the cable broke".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
