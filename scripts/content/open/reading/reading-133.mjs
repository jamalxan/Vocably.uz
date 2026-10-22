// Vocably Reading 133 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-133',
  title: 'Reading 133: The Snowflake',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'snowflake', title: 'No Two Alike: How Snowflakes Form', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r133-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs B, C, D, F and H from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Why snow looks white although ice is clear',
              'Particles that trigger freezing, both natural and man-made',
              'Record sizes of snowflakes and crystals',
              'A photographer\'s long search for two matching flakes',
              'How a flake begins and the main categories of crystal shape',
              'Growth of ice crystals at the cost of water droplets',
              'The six arms and their independent growth',
              'Temperature and humidity determine a flake\'s form',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'v', 'Paragraph B: "Each flake begins by forming around a tiny particle, called its nucleus" and "they may be categorized in eight broad classifications and at least 80 individual variants".', 'B'),
              q(2, 'Paragraph C', 'ii', 'Paragraph C: "The particles that make ice nuclei are very rare compared to nuclei upon which liquid cloud droplets form" and "Artificial nuclei include particles of silver iodide and dry ice".', 'C'),
              q(3, 'Paragraph D', 'vi', 'Paragraph D: "the crystals are able to grow to hundreds of micrometers or millimeters in size at the expense of the water droplets".', 'D'),
              q(4, 'Paragraph F', 'iii', 'Paragraph F: "Guinness World Records lists the world\'s largest aggregated snowflakes as those of January 1887 at Fort Keogh, Montana".', 'F'),
              q(5, 'Paragraph H', 'viii', 'Paragraph H: "The shape of the snowflake is determined broadly by the temperature and humidity at which it is formed."', 'H'),
            ],
          },
          {
            id: 'r133-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Scientists have a clear understanding of what makes certain particles effective ice nuclei.', 'FALSE', 'Paragraph C: "it is not understood what makes them efficient".', 'C'),
              q(7, 'Cloud droplets freeze spontaneously, without a nucleus, only at temperatures below −35 °C.', 'TRUE', 'Paragraph C: homogeneous "nucleation of cloud droplets only occurs at temperatures lower than −35 °C".', 'C'),
              q(8, 'Clusters of crystals are the form in which snow most often reaches the ground.', 'TRUE', 'Paragraph E: "These aggregates are usually the type of ice particle that falls to the ground."', 'E'),
              q(9, 'The giant snowflakes reported in Montana in 1887 were measured by scientists.', 'NOT GIVEN', 'Paragraph F says the flakes "were claimed to be 38 cm (15 inches) wide" but gives no information about who measured them.', 'F'),
            ],
          },
          {
            id: 'r133-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Why snowflakes are symmetrical but never identical</strong></p><p>A snowflake that has not joined with others usually shows six-fold symmetry, a consequence of the {{q10}} structure of ice. From the corners of the tiny hexagon, six branches known as {{q11}} grow outwards independently. Because the conditions immediately around the flake are almost the same on every side, the arms generally develop in a similar way, although the underlying growth {{q12}} also influences how quickly each part of the crystal grows. Flakes that are almost identical have been produced in {{q13}}, but they are very unlikely to occur in nature.</p>',
            questions: [
              q(10, null, 'hexagonal', 'Paragraph I: six-fold symmetry "arising from the hexagonal crystalline structure of ice".', 'I'),
              q(11, null, 'dendrites', 'Paragraph I: the six arms, "or dendrites, then grow independently from each of the corners of the hexagon".', 'I'),
              q(12, null, 'mechanism', 'Paragraph J: "the underlying crystal growth mechanism also affects how fast each surface region of a crystal grows".', 'J'),
              q(13, null, 'laboratories', 'Paragraph K: "Although nearly-identical snowflakes have been made in laboratories, they are very unlikely to be found in nature."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
