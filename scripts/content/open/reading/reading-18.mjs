// Vocably Reading 18 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-18',
  title: 'Reading 18: The Helicopter',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'helicopter', title: 'How Helicopters Fly', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r18-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Helicopters can operate in places where aircraft that need a runway cannot.', 'TRUE', 'Paragraph A: helicopters can be used "in congested or isolated areas where fixed-wing aircraft and many forms of short take-off and landing (STOL) or short take-off and vertical landing (STOVL) aircraft cannot perform without a runway".', 'A'),
              q(2, 'The Sikorsky R-4 was the first helicopter that could be fully controlled.', 'FALSE', 'Paragraph B: "The Focke-Wulf Fw 61 was the first successful, practical, and fully controllable helicopter in 1936".', 'B'),
              q(3, 'Most early helicopter designs had only one main rotor.', 'FALSE', 'Paragraph C: "most earlier designs used more than one main rotor".', 'C'),
              q(4, 'Twin-rotor helicopters cost more to build than single-rotor designs.', 'NOT GIVEN', 'Paragraph C says twin-rotor helicopters are used "due to their greater payload capacity than the monorotor design", but nothing is said about their cost.', 'C'),
              q(5, 'The French word for helicopter was formed from two Greek words.', 'TRUE', 'Paragraph D: the word hélicoptère was "coined by Gustave Ponton d\'Amécourt in 1861, which is composed of the Ancient Greek roots helix" and pteron.', 'D'),
            ],
          },
          {
            id: 'r18-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the passage, how does an autogyro differ from a helicopter?', [
                'Its rotor is turned by the airflow rather than by the engine.',
                'It has no separate system to push it forwards.',
                'It has two rotors turning in opposite directions.',
                'It is not classed as a rotorcraft.',
              ], 'A', 'Paragraph F: the autogyro and gyrodyne "have a free-spinning rotor for all or part of the flight envelope, relying on a separate thrust system to propel the craft forwards, so that the airflow sets the rotor spinning to provide lift".', 'F'),
              mc(7, 'What is the purpose of a tail rotor?', [
                'to provide extra lift when the aircraft is heavily loaded',
                'to counteract the twisting force produced by the main rotor',
                'to allow the helicopter to fly backwards',
                'to reduce the drag created by the tail boom',
              ], 'B', 'Paragraph I: "The tail rotor pushes or pulls against the tail to counter the torque effect".', 'I'),
              mc(8, 'How does the NOTAR system work?', [
                'It uses a fan enclosed inside the tail.',
                'It uses a second main rotor turning the opposite way.',
                'It creates a force on the tail boom in the same way a wing creates lift.',
                'It uses a hingeless rotor system.',
              ], 'C', 'Paragraph J: "NOTAR provides anti-torque similar to the way a wing develops lift through the use of the Coandă effect on the tail boom."', 'J'),
              mc(9, 'What advantage of using two rotors turning in opposite directions is mentioned?', [
                'The aircraft is easier to control.',
                'All of the engine\'s power can go to the main rotors.',
                'The aircraft produces less noise.',
                'The aircraft is cheaper to maintain.',
              ], 'B', 'Paragraph K: "This allows the power normally required to be diverted for the tail rotor to be applied fully to the main rotors, increasing the aircraft\'s power efficiency and lifting capacity."', 'K'),
            ],
          },
          {
            id: 'r18-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The rotor system</strong></p><ul><li>A rotor mounted horizontally (the main rotor) provides {{q10}}</li><li>A rotor mounted vertically (the tail rotor) provides horizontal {{q11}}</li><li>Parts of a rotor: a mast, a hub and the rotor {{q12}}</li><li>The mast is a metal shaft that rises from the {{q13}}</li><li>Three basic types of main rotor system: hingeless, fully articulated and {{q14}}</li></ul>',
            questions: [
              q(10, null, 'lift', 'Paragraph G: "A rotor system may be mounted horizontally, as main rotors are, providing lift vertically".', 'G'),
              q(11, null, 'thrust', 'Paragraph G: "it may be mounted vertically, such as a tail rotor, to provide horizontal thrust to counteract torque from the main rotors".', 'G'),
              q(12, null, 'blades', 'Paragraph G: "The rotor consists of a mast, hub and rotor blades."', 'G'),
              q(13, null, 'transmission', 'Paragraph H: "The mast is a cylindrical metal shaft that extends upwards from the transmission."', 'H'),
              q(14, null, 'teetering', 'Paragraph H: "There are three basic types: hingeless, fully articulated, and teetering".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
