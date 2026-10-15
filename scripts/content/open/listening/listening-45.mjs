// Vocably Listening 45 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-45',
  title: 'Listening 45: Training Your Ears',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-your-pronunciation-by-training-your-ears',
        contextText: 'You will hear an education report about improving pronunciation by learning to listen for reduced words.',
        questionGroups: [
          {
            id: 'l45-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Two pronunciation experts</strong></p><ul><li>Judy Gilbert: for the past {{q1}} years most teachers have not been trained to teach pronunciation</li><li>William Stout: has led pronunciation workshops for {{q2}} years</li><li>goal = being easily understood, not removing your {{q3}}</li><li>his workshops focus on training students\' {{q4}}</li></ul>',
            questions: [
              q(1, null, '50', 'The speaker says "for the past 50 years, most English language teachers have not been trained to teach pronunciation".'),
              q(2, null, ['10', 'ten'], 'The speaker says "He has been leading pronunciation workshops for 10 years."'),
              q(3, null, 'accent', 'The speaker says the goal is being easily understood, "not removing your accent, which is often difficult or impossible".'),
              q(4, null, 'ears', 'The speaker says his workshops "mainly center on training his students\' ears to listen for these things".'),
            ],
          },
          {
            id: 'l45-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Words', 'How they are pronounced'],
              [
                ['content words, e.g. "what", "get", "birthday"', 'heard clearly, even by beginners'],
                ['the words in between', '{{q5}}'],
                ['pronouns, helping verbs, {{q6}}, articles, prepositions', 'almost always reduced'],
                ['nouns, verbs, {{q7}}, adverbs', 'almost always pronounced clearly'],
              ],
              'Reduced and clear words in everyday speech',
            ),
            questions: [
              q(5, null, 'reduced', 'Stout says "But the words in between are reduced."'),
              q(6, null, 'conjunctions', 'The speaker lists "conjunctions, articles and prepositions".'),
              q(7, null, 'adjectives', 'The speaker says other parts of speech are pronounced clearly, "such as nouns, verbs, adjectives and adverbs".'),
            ],
          },
          {
            id: 'l45-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(8, 'What has Stout noticed about students who like singing in English?', ['They have trouble with rhythm.', 'They improve their pronunciation very quickly.', 'They prefer limericks to songs.', 'They find reduced words harder to hear.'], 'B', 'Stout says "students who like to sing in English generally improve their pronunciation very quickly".'),
              mc(9, 'What is Stout\'s main piece of advice?', ['Wait until you reach an advanced level.', 'Do not wait – start noticing patterns now.', 'Imitate only native speakers.', 'Practise one phrase every day.'], 'B', 'Stout says "But my main advice is not to wait."'),
              mc(10, 'How do most Americans feel about accents, according to Stout?', ['They find them difficult to understand.', 'They prefer not to hear them.', 'They like them as long as they can understand the speaker.', 'They do not notice them.'], 'C', 'Stout says "most Americans like to hear an accent" so long as they can easily understand the person.'),
            ],
          },
        ],
      }),
    ],
  },
};
