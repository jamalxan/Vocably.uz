// Vocably Reading 149 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, table, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-149',
  title: 'Reading 149: Roller Coasters',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'roller-coaster', title: 'The History of the Roller Coaster', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r149-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Ride', 'Date', 'Place', 'Features'],
              [
                ['Russian Mountains', '17th century', 'Saint Petersburg', 'ice slides 70-80 feet high with a {{q1}}-degree drop'],
                ['Katalnaya gora', '1754-1757', 'Tsarskoye Selo', 'trail with {{q2}} hills; in summer, trolleys on wheels ran in grooves'],
                ['Promenades Aériennes', '{{q3}}', 'Paris', 'wheeled cars locked to the track, guide rails and higher speeds'],
                ['Mauch Chunk Switchback Railway', '1827', 'Pennsylvania', 'gravity railroad built to carry {{q4}}; later sold rides'],
                ['Switchback Railway', '1884', 'Coney Island', 'bench-like car travelled down a {{q5}}-foot track'],
              ],
              'Early rides',
            ),
            questions: [
              q(1, null, '50', 'Paragraph C: the slides "had a 50-degree drop, and were reinforced by wooden supports".', 'C'),
              q(2, null, ['five', '5'], 'Paragraph D: "It had a trail with five hills, which could be covered with ice in winter."', 'D'),
              q(3, null, ['1817', 'July 1817'], 'Paragraph E: "The Promenades Aériennes, opened in Parc Beaujon in Paris on July 8, 1817 had wheeled cars securely locked to the track".', 'E'),
              q(4, null, 'coal', 'Paragraph G: "a downhill gravity railroad used to deliver coal to Mauch Chunk, Pennsylvania".', 'G'),
              q(5, null, '600', 'Paragraph H: "Passengers climbed to the top of a platform and rode a bench-like car down the 600-foot (183 m) track".', 'H'),
            ],
          },
          {
            id: 'r149-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Write the correct letter, A-I.</em>',
            questions: [
              q(6, 'a figure for the number of roller coasters that exist today', 'A', 'Paragraph A: "The Roller Coaster DataBase records over 6,000 extant roller coasters as of January 2026."', 'A'),
              q(7, 'a reference to what now stands where an early ride used to be', 'D', 'Paragraph D: "Currently in its place is the Granite Terrace in the Catherine Park."', 'D'),
              q(8, 'an example of a ride whose track was later extended', 'F', 'Paragraph F: "656 feet (200 m) of track laid out in a double-eight, later enlarged to four figure-eight-shaped loops".', 'F'),
              q(9, 'the effect of an economic crisis on the amusement park business', 'I', 'Paragraph I: "The onset of the Great Depression in the 1930s, however, significantly impacted the amusement park industry and brought an end to the rapid growth".', 'I'),
            ],
          },
          {
            id: 'r149-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Every roller coaster is designed to frighten its passengers.', 'FALSE', 'Paragraph A: "though some roller coasters aim to provide a more gentle experience".', 'A'),
              q(11, 'Wooden roller coasters have completely disappeared.', 'FALSE', 'Paragraph B: "although modernized versions of wooden coasters still exist".', 'B'),
              q(12, 'Thompson\'s 1886 patent included tunnels decorated with painted scenes.', 'TRUE', 'Paragraph H: "in 1886 Thompson patented his design of roller coaster that included dark tunnels with painted scenery".', 'H'),
              q(13, 'The Cyclone at Coney Island is still in operation today.', 'NOT GIVEN', 'Paragraph I mentions "the historical Cyclone that opened at Coney Island in 1927" but does not say whether it still runs.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
