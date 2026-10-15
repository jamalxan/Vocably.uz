// Vocably Reading 88 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-88',
  title: 'Reading 88: Green Roofs',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'green-roof', title: 'Green Roofs: Gardens above the City', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r88-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'Which of the following is NOT usually regarded as a true green roof?', ['a roof covered with soil and vegetation', 'a rooftop pond used to clean greywater', 'plants kept in pots on a roof', 'a roof with a root barrier and drainage layers'], 'C', 'Paragraph A: "Container gardens on roofs, where plants are maintained in pots, are not generally considered to be true green roofs".', 'A'),
              mc(2, 'How do intensive green roofs differ from extensive ones?', ['They weigh less.', 'They need more looking after.', 'They support fewer kinds of plant.', 'They have a shallower growing medium.'], 'B', 'Paragraph B: "intensive roofs, which are thicker" and "can support a wider variety of plants but are heavier and require more maintenance".', 'B'),
              mc(3, 'What did the modelling study of Toronto suggest?', ['Greening half of the suitable surfaces would lower the temperature of the whole city.', 'Green roofs would cut heat loss from buildings in winter.', 'Every building in the city centre should have a green roof.', 'Green roofs would slightly raise summer temperatures.'], 'A', 'Paragraph D: "adding green roofs to 50 percent of the available surfaces in downtown Toronto would cool the entire city by 0.1 to 0.8 °C".', 'D'),
              mc(4, 'Why was the green roof on Chicago City Hall originally planted?', ['to comply with new city building codes', 'to test its effect on conditions on the roof itself', 'to reduce the amount of stormwater runoff', 'to qualify for financial incentives'], 'B', 'Paragraph G: "it was planted as an experiment to determine the effects a green roof would have on the microclimate of the roof".', 'G'),
            ],
          },
          {
            id: 'r88-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(5, 'a list of other names used for green roofs', 'C', 'Paragraph C: "Green roofs are also referred to as eco-roofs, oikosteges, vegetated roofs, living roofs, greenroofs and VCPH".', 'C'),
              q(6, 'a comparison of roof temperatures on neighbouring buildings', 'E', 'Paragraph E: "roof temperatures on a hot day are typically 1.4–4.4 °C (2.5–7.9 °F) cooler than they are on traditionally roofed buildings nearby".', 'E'),
              q(7, 'what can happen to a sewage system during a heavy storm', 'I', 'Paragraph I: "heavy storms can overload the wastewater system and cause it to flood, dumping raw sewage into the local waterways".', 'I'),
              q(8, 'the findings of a review that combined the results of a large number of studies', 'F', 'Paragraph F: "A 2023 systematic review of 86 studies reported that extensive green roofs typically reduce roof surface temperatures by 15–30 °C".', 'F'),
              q(9, 'a reference to the range of building sizes on which green roofs can be installed', 'B', 'Paragraph B: "can be installed on small garages or larger industrial, commercial and municipal buildings".', 'B'),
            ],
          },
          {
            id: 'r88-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In which year did Brad Bass publish his study of green roofs in winter?', '2005', 'Paragraph D: "A 2005 study by Brad Bass of the University of Toronto showed that green roofs can also reduce heat loss and energy consumption in winter conditions."', 'D'),
              q(11, 'Which natural process do green roofs increase in order to reduce the heat island effect?', 'evapotranspiration', 'Paragraph D: "can reduce the heat island effect by increasing evapotranspiration".', 'D'),
              q(12, 'By how many degrees Celsius might a major city be cooled if all its roofs were greened?', ['7 °C', '7 degrees', '7'], 'Paragraph G: "urban temperatures could be reduced by as much as 7 °C (13 °F)".', 'G'),
              q(13, 'By what percentage was water runoff reduced during rainstorms, according to the 2004 study?', ['75%', '75 percent', 'over 75%'], 'Paragraph H: "found water runoff was reduced by over 75% during rainstorms".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
