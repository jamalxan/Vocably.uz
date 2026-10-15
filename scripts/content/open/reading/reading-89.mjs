// Vocably Reading 89 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-89',
  title: 'Reading 89: The Channel Tunnel',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'channel-tunnel', title: 'The Channel Tunnel', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r89-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The Channel Tunnel is the only fixed connection between Britain and mainland Europe.', 'TRUE', 'Paragraph A: "it remains the only fixed link between Great Britain and the European mainland".', 'A'),
              q(2, 'Trains travel through the tunnel more slowly than its design allows.', 'TRUE', 'Paragraph B: "Although the tunnel was designed for speeds up to 200 km/h (120 mph), trains are limited to a maximum speed of 160 km/h (99 mph) for safety reasons."', 'B'),
              q(3, 'In 2017, Eurostar carried more passengers than travelled by sea through Dover.', 'FALSE', 'Paragraph C: "In 2017, Eurostar trains carried 10.3 million passengers" and "That compares with 11.7 million passengers" transported by sea.', 'C'),
              q(4, 'The ventilation tunnel under the River Mersey took less than a year to build.', 'NOT GIVEN', 'Paragraph H says only that in 1883 the machine "was used to bore a railway ventilation tunnel" under the Mersey; nothing is said about how long the work took.', 'H'),
              q(5, 'The French government welcomed Lloyd George\'s 1919 proposal.', 'FALSE', 'Paragraph I: "The French did not take the idea seriously, and nothing came of the proposal."', 'I'),
            ],
          },
          {
            id: 'r89-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'At its deepest point, the tunnel lies ______ below sea level.', ['75 m', '75 metres', '75 meters'], 'Paragraph B: "reaching a depth of 75 m (246 ft) below sea level".', 'B'),
              q(7, 'The earliest proposals for a tunnel under the Channel were made in ______.', '1802', 'Paragraph D: "Proposals for a cross-Channel tunnel date back as early as 1802".', 'D'),
              q(8, 'In Europe, only the ______ Base Tunnel in Switzerland is longer than the Channel Tunnel.', 'Gotthard', 'Paragraph D: "has only been surpassed by the Gotthard Base Tunnel in Switzerland".', 'D'),
              q(9, 'For his 1866 survey Brunel invented the ______, a tool still used by geologists.', 'gravity corer', 'Paragraph G: "For this survey, he invented the gravity corer, which is still used in geology."', 'G'),
            ],
          },
          {
            id: 'r89-endings', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, from the box below.',
            bank: bank([
              'was financed by the French Suez Canal Company.',
              'included an artificial island in the middle of the Channel.',
              'showed that the seabed consisted of the same rock as the nearby cliffs.',
              'was abandoned because the British army opposed it.',
              'rejected the fear that an enemy could use the tunnel to invade.',
              'was put to the French emperor together with an estimated cost.',
              'led to the digging of a tunnel under the River Mersey.',
            ]),
            questions: [
              q(10, 'Albert Mathieu-Favier\'s 1802 design', 'B', 'Paragraph E: "an artificial island positioned mid-Channel for changing horses".', 'E'),
              q(11, 'Thomé de Gamond\'s 1856 scheme', 'F', 'Paragraph F: "presented a proposal to Napoleon III for a mined railway tunnel" at "a cost of 170 million francs, or less than £7 million".', 'F'),
              q(12, 'Henry Marc Brunel\'s survey', 'C', 'Paragraph G: "The results of his survey proved that the sea floor was composed of chalk, like the adjoining cliffs".', 'G'),
              q(13, 'Winston Churchill\'s 1924 essay', 'E', 'Paragraph J: "argued vehemently against the idea that the tunnel could be used by a Continental enemy in an invasion of Britain".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
