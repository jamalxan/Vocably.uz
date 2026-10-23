// Vocably Listening 118 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-118',
  title: 'Listening 118: Casting a Wide Net',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'what-good-comes-from-casting-a-wide-net',
        contextText: 'You will hear a talk about the expression "cast a wide net", followed by two short conversations that use it.',
        questionGroups: [
          {
            id: 'l118-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Casting a wide net</strong></p><ul><li>example situation: someone looking for a new {{q1}}</li><li>the expression probably comes from {{q2}}</li><li>a hook on a line catches only {{q3}} fish, but a net catches many</li><li>people who cast a wide net want to have many {{q4}}</li></ul>',
            questions: [
              q(1, null, 'job', 'The speaker says "For example, let\'s say you need a new job."'),
              q(2, null, 'fishing', 'The speaker says "To cast a wide net is an expression that probably comes from fishing."'),
              q(3, null, ['one', '1'], 'The speaker says "Then you cast the hook into the water. This will only catch one fish."'),
              q(4, null, ['choices', 'options'], 'The speaker says "People who cast a wide net want to have many choices or options."'),
            ],
          },
          {
            id: 'l118-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(5, 'How many people have applied for the web designer job so far?', ['five', '5'], 'The second speaker says "So far, only five applicants have responded to the job announcement."'),
              q(6, 'What is the minimum height the online dater wants a partner to be?', ['1.9 meters', '1.9 metres', '1.9'], 'The dater says "I\'m looking for a person who is tall, 1.9 meters or taller".'),
              q(7, 'Within what distance of the dater must the partner live?', ['10 kilometers', '10 kilometres', '10 km', '10'], 'The dater says "They must also live within 10 kilometers of me".'),
            ],
          },
          {
            id: 'l118-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(8, 'Which outdoor activities does the dater especially want a partner to enjoy?', ['water skiing and rock climbing', 'running and cycling', 'swimming and hiking', 'fishing and camping'], 'A', 'The dater says the partner "must be active outdoors but especially with water skiing and rock climbing".'),
              mc(9, 'What does the dater say about the partner\'s diet?', ['The partner must eat meat.', 'The partner must be a vegetarian.', 'The partner must cook well.', 'The partner must not drink coffee.'], 'B', 'The dater says "Oh, and they must be a vegetarian."'),
              mc(10, 'Which requirement does the dater agree to remove at the end?', ['the height requirement', 'the rule about smoking', 'the requirement about dogs', 'the distance requirement'], 'C', 'The dater says "I\'ll take off the dog criteria."'),
            ],
          },
        ],
      }),
    ],
  },
};
