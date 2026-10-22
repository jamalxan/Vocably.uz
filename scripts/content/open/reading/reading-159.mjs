// Vocably Reading 159 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-159',
  title: 'Reading 159: Tornadoes',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'tornado', title: 'Tornadoes', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r159-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the passage say about the majority of tornadoes?', ['They are more than 3 kilometres wide.', 'They are roughly 80 metres across.', 'They stay on the ground for over 100 kilometres.', 'They reach wind speeds above 480 km/h.'], 'B', 'Paragraph A: "Most tornadoes have wind speeds less than 180 kilometers per hour (110 miles per hour), are about 80 meters (250 feet) across, and travel several kilometers (a few miles) before dissipating."', 'A'),
              mc(2, 'Why is there uncertainty about waterspouts?', ['They never connect to a cloud.', 'They occur only at high latitudes.', 'They cannot be seen from land.', 'Experts disagree over whether they are genuine tornadoes.'], 'D', 'Paragraph B: "there is disagreement about whether to classify them as true tornadoes".', 'B'),
              mc(3, 'How can tornadoes be detected before they form?', ['By recognising particular patterns in radar data.', 'By measuring the pressure inside the funnel.', 'By studying marks left on the ground.', 'By analysing photographs of the cloud base.'], 'A', 'Paragraph C: "Tornadoes can be detected before or as they occur through the use of pulse-Doppler radar by recognizing patterns in velocity and reflectivity data, such as hook echoes or debris balls".', 'C'),
              mc(4, 'According to the passage, how does a cyclone differ from a tornado?', ['A cyclone always has a visible funnel.', 'A cyclone occurs only in the Southern Hemisphere.', 'A cyclone is a large system rotating around an area of low pressure.', 'A cyclone produces stronger winds.'], 'C', 'Paragraph G: "in meteorology, the word cyclone specifically refers to a large weather system that rotates around a center of low atmospheric pressure" and "Cyclones do not feature cloud funnels."', 'G'),
            ],
          },
          {
            id: 'r159-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'Every tornado can be seen as a condensation funnel.', 'FALSE', 'Paragraph A: "Tornadoes are often (but not always) visible in the form of a condensation funnel".', 'A'),
              q(6, 'More tornadoes occur in the United States than in any other country.', 'TRUE', 'Paragraph C: "the United States has by far the most tornadoes of any country in the world".', 'C'),
              q(7, 'Every country that once used the Fujita scale has now adopted the Enhanced Fujita Scale.', 'FALSE', 'Paragraph D: "The Fujita scale rates tornadoes by damage caused and has been replaced in some countries by the updated Enhanced Fujita Scale."', 'D'),
              q(8, 'The TORRO scale was developed before the Fujita scale.', 'NOT GIVEN', 'Paragraph D says "The similar TORRO scale ranges from T0 for extremely weak tornadoes to T11 for the most powerful known tornadoes" but gives no dates for either scale.', 'D'),
              q(9, 'The English spelling of tornado was influenced by two different Spanish words.', 'TRUE', 'Paragraph E: "The word tornado comes from the Spanish tronada" and "The metathesis of the r and o in the English spelling was influenced by the Spanish tornado".', 'E'),
            ],
          },
          {
            id: 'r159-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Defining a tornado</strong></p><p>A tornado is a violently rotating column of air that must touch both the {{q10}} and the base of the cloud. The term describes the vortex of wind rather than the {{q11}} cloud. A tornado is not always visible, but its intense low pressure and rapid rotation usually make water vapour condense into {{q12}} through adiabatic cooling, creating a visible funnel. Many meteorologists use the term {{q13}} only for a rotating cloud that is not linked to strong winds at the surface. Most tornadoes already produce strong surface winds while the funnel is still {{q14}} the ground, which makes the two hard to tell apart from a distance.</p>',
            questions: [
              q(10, null, 'ground', 'Paragraph F: "For a vortex to be classified as a tornado, it must be in contact with both the ground and the cloud base."', 'F'),
              q(11, null, 'condensation', 'Paragraph F: "Tornado refers to the vortex of wind, not the condensation cloud."', 'F'),
              q(12, null, 'cloud droplets', 'Paragraph H: the low pressure and rotation "usually cause water vapor in the air to condense into cloud droplets due to adiabatic cooling".', 'H'),
              q(13, null, 'funnel cloud', 'Paragraph I: among many meteorologists the term is "strictly defined as a rotating cloud which is not associated with strong winds at the surface".', 'I'),
              q(14, null, 'above', 'Paragraph J: "Most tornadoes produce strong winds at the surface while the visible funnel is still above the ground".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
