// Vocably Listening 53 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-53',
  title: 'Listening 53: An Exoplanet with an Ocean',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'study-new-evidence-suggests-earth-like-exoplanet-may-hold-liquid-ocean',
        contextText: 'You will hear a news report about a distant planet that may have a large ocean of liquid water.',
        questionGroups: [
          {
            id: 'l53-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>LHS 1140 b</strong></p><p>The exoplanet is thought to be about {{q1}} light years from Earth. The study, led by astronomers in {{q2}}, used observations made by the James Webb Space Telescope in December {{q3}}. Earlier research suggested the planet could be a gas giant, but the new data indicate it is more likely a {{q4}}-Earth, a rocky planet larger than our own. Scientists had already placed the planet inside its star&#39;s habitable {{q5}}, where temperatures allow liquid water.</p>',
            questions: [
              q(1, null, '48', 'The speaker says "Astronomers believe it sits about 48 light years away from Earth."'),
              q(2, null, ['Canada', 'Montreal'], 'The speaker says the research was "led by astronomers at the University of Montreal in Canada".'),
              q(3, null, '2023', 'The speaker says "The study is based on observations collected in December 2023 by the James Webb Space Telescope."'),
              q(4, null, 'super', 'The speaker says the planet is "more likely a super-Earth, a rocky planet bigger than Earth".'),
              q(5, null, 'zone', 'The speaker says "Exoplanets found within this zone are believed to have temperatures that would permit water to exist in liquid form."'),
            ],
          },
          {
            id: 'l53-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What did the James Webb measurements show about the planet?', ['It is denser than expected.', 'It is less dense than expected for a rocky body.', 'It is smaller than Earth.', 'It has no atmosphere.'], 'B', 'The speaker says the data suggest the exoplanet "is less dense" than expected for a rocky, Earth-like body.'),
              mc(7, 'How much of the planet\'s mass might be made up of water?', ['1 to 2 percent', '10 to 20 percent', 'about 50 percent', 'more than 90 percent'], 'B', 'The speaker says "The researchers estimated that 10 to 20 percent" of the mass might be made up of water.'),
              mc(8, 'What does the new data suggest about the atmosphere?', ['It is mostly hydrogen.', 'It is rich in nitrogen.', 'It does not exist.', 'It is mostly carbon dioxide.'], 'B', 'The speaker says "the exoplanet might also have a nitrogen-rich atmosphere".'),
            ],
          },
          {
            id: 'l53-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'According to Doyon, how much more observation time is needed to confirm that the planet has an atmosphere?', ['one more year', 'one year'], 'The speaker says "He estimated that at least one more year of observations will be needed".'),
              q(10, 'Which gas will take several years to confirm in the atmosphere?', 'carbon dioxide', 'The speaker says "The process of confirming whether carbon dioxide is present in the atmosphere" would "require several years of observations".'),
            ],
          },
        ],
      }),
    ],
  },
};
