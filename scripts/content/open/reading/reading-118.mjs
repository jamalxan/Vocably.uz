// Vocably Reading 118 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-118',
  title: 'Reading 118: The Smoke Detector',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'smoke-detector', title: 'The Smoke Detector', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r118-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Francis Robbins Upton', 'George Andrew Darby', 'Walter Jaeger', 'Ernst Meili', 'Duane D. Pearsall', 'Thomas Edison']),
            questions: [
              q(1, 'found out by chance that smoke could alter an electric current', 'C', 'Paragraph E: "Frustrated, Jaeger lit a cigarette and was surprised to notice that a meter on the instrument had registered a drop in current."', 'E'),
              q(2, 'patented a device for detecting heat in England', 'B', 'Paragraph E: "In 1902, George Andrew Darby patented the first European electrical heat detector in Birmingham, England."', 'E'),
              q(3, 'built an instrument to detect dangerous gases underground', 'D', 'Paragraph E: "Swiss physicist Ernst Meili devised an ionization chamber device capable of detecting combustible gases in mines".', 'E'),
              q(4, 'helped to produce the first inexpensive smoke detector for the home', 'E', 'Paragraph F: "In 1965, the first low-cost smoke detector for domestic use was developed by Duane D. Pearsall and Stanley Bennett Peterson."', 'F'),
              q(5, 'was granted the first patent for an automatic electric fire alarm', 'A', 'Paragraph E: "The first automatic electric fire alarm was patented in 1890 by Francis Robbins Upton, an associate of Thomas Edison."', 'E'),
            ],
          },
          {
            id: 'r118-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Interlinked household alarms stop working when the electricity supply fails.', 'FALSE', 'Paragraph B: "if any unit detects smoke, alarms will trigger all of the units. This happens even if household power has gone out."', 'B'),
              q(7, 'Most individual commercial smoke detectors sound an alarm themselves.', 'FALSE', 'Paragraph C: "Usually, an individual commercial smoke detector unit does not issue an alarm; some, however, have built-in sounders."', 'C'),
              q(8, 'Working smoke detectors halve the chance of dying in a house fire.', 'TRUE', 'Paragraph D: "The risk of dying in a residential fire is cut in half in houses with working smoke detectors."', 'D'),
              q(9, 'Heat detectors cost less than smoke detectors.', 'NOT GIVEN', 'Paragraph D says that in a kitchen "a heat detector would be more suitable instead" but gives no information about prices.', 'D'),
            ],
          },
          {
            id: 'r118-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Smoke detectors in the United States</strong></p><ul><li>1951: ionization detectors went on sale, but were at first used only in big commercial and industrial buildings because of their {{q10}} and high cost</li><li>1963: first licence granted to distribute detectors containing {{q11}} material</li><li>1965: the SmokeGard 700 – a battery-powered unit shaped like a {{q12}} and made of steel</li><li>1971-1976: cold-cathode tubes replaced by {{q13}} electronics, which cut both the cost and the size of detectors</li></ul>',
            questions: [
              q(10, null, ['large size', 'size'], 'Paragraph F: "they were used only in major commercial and industrial facilities due to their large size and high cost".', 'F'),
              q(11, null, 'radioactive', 'Paragraph F: "granted the first license to distribute smoke detectors that used radioactive material".', 'F'),
              q(12, null, 'beehive', 'Paragraph F: the SmokeGard 700 "was beehive-shaped, fire-resistant, and made of steel".', 'F'),
              q(13, null, ['solid-state', 'solid state'], 'Paragraph G: "including the replacement of cold-cathode tubes with solid-state electronics. This greatly reduced the detectors\' cost and size".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
