// Vocably Listening 31 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-31',
  title: 'Listening 31: Phrasal Verbs for Travel',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'words-to-travel-with-part-1',
        contextText: 'You will hear an English lesson about phrasal verbs that are useful when travelling, including a short conversation between two friends.',
        questionGroups: [
          {
            id: 'l31-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>A friend\'s trip</strong></p><ul><li>the airport was crowded because of flight {{q1}}</li><li>they queued for {{q2}} minutes to collect their tickets</li><li>the flight was delayed by {{q3}} hours</li><li>the driver dropped them at the {{q4}}</li></ul>',
            questions: [
              q(1, null, 'delays', 'The speaker says "The airport was so crowded because of flight delays."'),
              q(2, null, '45', 'The speaker says "we stood in line for 45 minutes just to pick up the tickets".'),
              q(3, null, ['two', '2'], 'The speaker says "our flight had a two-hour delay".'),
              q(4, null, 'hotel', 'The speaker says "He dropped us off at the hotel and we checked in without any trouble."'),
            ],
          },
          {
            id: 'l31-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does a transitive verb need in order to express a complete thought?', ['a preposition', 'a direct object', 'an adverb', 'a second verb'], 'B', 'The speaker says "A transitive verb needs a direct object to express a complete thought."'),
              mc(6, 'If a phrasal verb is separable, where can the direct object appear?', ['only before the verb', 'in the middle of the verb', 'only at the end of the sentence', 'anywhere in the sentence'], 'B', 'The speaker says "If a phrasal verb is separable, the direct object may appear in the middle of the verb."'),
              mc(7, 'How is "check into" different from "check in"?', ['It is used only for airports.', 'It must have a direct object.', 'It is separable.', 'It has no clear meaning.'], 'B', 'The speaker says "The difference is that check into must have a direct object."'),
            ],
          },
          {
            id: 'l31-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Phrasal verb', 'Grammar', 'Meaning'],
              [
                ['pick up', 'transitive and {{q8}}', 'to go somewhere to get something'],
                ['take off', 'intransitive', 'to begin to {{q9}}'],
                ['look forward to', 'transitive and inseparable', 'to expect something with {{q10}}'],
              ],
              'Travel phrasal verbs',
            ),
            questions: [
              q(8, null, 'separable', 'The speaker says pick up "is transitive and separable".'),
              q(9, null, 'fly', 'The speaker says take off "is intransitive and means to begin to fly".'),
              q(10, null, 'pleasure', 'The speaker says "To look forward to something means to expect it with pleasure."'),
            ],
          },
        ],
      }),
    ],
  },
};
