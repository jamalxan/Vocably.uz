// Vocably Reading 157 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-157',
  title: 'Reading 157: Tidal Power',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'tidal-power', title: 'Tidal Power', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r157-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'a comparison between tidal generators and another renewable technology', 'H', 'Paragraph H: "Tidal stream generators make use of the kinetic energy of moving water to power turbines, in a similar way to wind turbines that use the wind to power turbines."', 'H'),
              q(2, 'the effect of the tides on the length of a day over geological time', 'G', 'Paragraph G: "the period of rotation of the Earth (length of a day) has increased from 21.9 hours to 24 hours".', 'G'),
              q(3, 'two factors that have historically held back the use of tidal energy', 'A', 'Paragraph A: "tidal energy has traditionally suffered from relatively high cost and limited availability of sites with sufficiently high tidal ranges or flow velocities".', 'A'),
              q(4, 'a description of how early mills made use of the tides', 'B', 'Paragraph B: "Incoming water was contained in large storage ponds, and as the tide goes out, it turns waterwheels that use the mechanical power to mill grain."', 'B'),
              q(5, 'the proportions of two different sources of the Earth\'s internal heat', 'E', 'Paragraph E: the Earth\'s internal heat "comes from a combination of residual heat from planetary accretion (about 20%) and heat produced through radioactive decay (80%)".', 'E'),
            ],
          },
          {
            id: 'r157-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Compared with wind and sunshine, the tides are more ______.', 'predictable', 'Paragraph A: "Tides are more predictable than the wind and the sun."', 'A'),
              q(7, 'The first large-scale tidal power plant in the world was the ______ Tidal Power Station in France, which began operating in 1966.', 'Rance', 'Paragraph C: "The world\'s first large-scale tidal power plant was France\'s Rance Tidal Power Station, which became operational in 1966."', 'C'),
              q(8, 'The Sihwa Lake station has ______ turbines and generates 254 MW.', ['10', 'ten'], 'Paragraph C: "The Sihwa station uses sea wall defense barriers complete with 10 turbines generating 254 MW."', 'C'),
              q(9, 'Tidal power is the only technology that uses energy contained in the ______ of the Earth-Moon system.', 'orbital characteristics', 'Paragraph E: "Tidal power is the only technology that draws on energy inherent in the orbital characteristics of the Earth–Moon system".', 'E'),
              q(10, 'Over the last 620 million years, the Earth-Moon system has lost ______ of its rotational energy.', ['17%', '17 percent'], 'Paragraph G: "in this period the Earth-Moon system has lost 17% of its rotational energy".', 'G'),
            ],
          },
          {
            id: 'r157-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'Why are the tides so regular and predictable?', ['The shape of the seafloor is the same everywhere.', 'The rotation of the Earth and the orbit of the Moon follow a consistent pattern.', 'The gravitational pull of the Sun never changes.', 'Sea levels remain constant over time.'], 'B', 'Paragraph D: "These changes are highly regular and predictable, due to the consistent pattern of the Earth\'s rotation and the Moon\'s orbit around the Earth."', 'D'),
              mc(12, 'What does the writer say about the long-term effect of tidal power on the Earth-Moon system?', ['It will make the Earth rotate faster.', 'It will bring the Moon closer to the Earth.', 'It will halt the natural loss of energy.', 'It will remove energy from the system, but not noticeably.'], 'D', 'Paragraph G: "While tidal power will take additional energy from the system, the effect is negligible and would not be noticeable in the foreseeable future."', 'G'),
              mc(13, 'One advantage of some tidal stream generators mentioned in the passage is that they', ['can be kept out of sight.', 'do not need turbines.', 'can operate in any location.', 'produce more power than barrages.'], 'A', 'Paragraph H: "Some tidal generators can be built into the structures of existing bridges or are entirely submersed, thus avoiding concerns over aesthetics or visual impact."', 'H'),
              mc(14, 'How does a tidal barrage produce electricity?', ['Waterwheels are turned by the incoming tide.', 'Turbines float on the surface of an estuary.', 'Water held behind a dam is released through turbines as the tide goes out.', 'Fast currents in narrow straits are captured by ducted turbines.'], 'C', 'Paragraph I: "With the receding tide, this energy is then converted into mechanical energy as the water is released through large turbines that create electrical power through the use of generators."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
