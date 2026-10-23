// Vocably Listening 119 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-119',
  title: 'Listening 119: New Orleans Jazz Park',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-new-orleans-jazz-national-historical-park',
        contextText: 'You will hear a report about New Orleans, Louis Armstrong and a national park dedicated to jazz.',
        questionGroups: [
          {
            id: 'l119-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>New Orleans and Jazz Fest</strong></p><ul><li>New Orleans is a port at the mouth of the {{q1}} River</li><li>the first Jazz and Heritage Festival was held in {{q2}}</li><li>about {{q3}} people came to the first festival</li><li>five years later about {{q4}} people attended</li></ul>',
            questions: [
              q(1, null, 'Mississippi', 'The speaker says "New Orleans is a port city at the mouth of the Mississippi River."'),
              q(2, null, '1970', 'The speaker says "The first New Orleans Jazz and Heritage Festival took place in 1970."'),
              q(3, null, '350', 'The speaker says "That year, about 350 people attended the five-day celebration."'),
              q(4, null, '80,000', 'The speaker says "Five years later, about 80,000 people attended the festival."'),
            ],
          },
          {
            id: 'l119-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Which band did Louis Armstrong join when he was 18?', ['the Kid Ory Band', 'Louis Armstrong and his Orchestra', 'the Preservation Hall Jazz Band', 'a ragtime band in Chicago'], 'A', 'The speaker says "By the time he was 18, he joined the Kid Ory Band, one of the finest bands in New Orleans."'),
              mc(6, 'Which song was Armstrong\'s final big hit?', ['Hello Dolly', 'What a Wonderful World', 'When the Saints Go Marching In', 'a song from the 1930s'], 'B', 'The speaker says "the song What a Wonderful World, recorded in 1968, was his final big hit".'),
              mc(7, 'What was Congo Square once used for?', ['dances and drumming performed by slaves', 'making coins for the government', 'recording rhythm and blues artists', 'rock and roll concerts'], 'A', 'The speaker says "Congo Square was once used as an area where slaves were permitted to perform African and Caribbean dances and drumming."'),
            ],
          },
          {
            id: 'l119-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Park site', 'Details'],
              [
                ['J&amp;M Recording Studio', 'operated from 1945 to 1955; today the building is a {{q8}}'],
                ['The Mint', 'museum displays Armstrong\'s first {{q9}}, bought when he was 15'],
                ['Preservation Hall', 'opened in 1961 by Allan and Sandra Jaffe; Allan played the {{q10}}'],
              ],
              'Sites in the New Orleans Jazz National Historical Park',
            ),
            questions: [
              q(8, null, 'laundromat', 'The speaker says "Today, the spot is a laundromat."'),
              q(9, null, 'cornet', 'The speaker says "visitors can see Louis Armstrong\'s first cornet".'),
              q(10, null, 'tuba', 'The speaker says "Allan Jaffe was a tuba player."'),
            ],
          },
        ],
      }),
    ],
  },
};
