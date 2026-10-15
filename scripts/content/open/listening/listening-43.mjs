// Vocably Listening 43 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-43',
  title: 'Listening 43: Learning Words Through Movement',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-your-english-by-using-movements',
        contextText: 'You will hear an education programme about using physical movement to improve pronunciation and memory.',
        questionGroups: [
          {
            id: 'l43-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What simple object does Tamara Jones suggest studying with?', ['a mirror', 'a rubber band', 'a pencil', 'a ball'], 'B', 'The speaker says learners can improve "by studying with something really simple: a rubber band".'),
              mc(2, 'What did the study by Morsella and Krauss suggest?', ['The brain controls every movement of the body.', 'Repetition is the only way to remember words.', 'The body may help the brain to find memories.', 'Hand gestures make speech harder to understand.'], 'C', 'The speaker says the study "suggests that your body might help your brain to find memories".'),
              mc(3, 'What does the CALLA approach call the use of movements?', ['Using Your Kinesthetic Sense', 'Learning by Repetition', 'Body and Brain Training', 'Moving to Remember'], 'A', 'The speaker says CALLA "calls the use of movements \'Using Your Kinesthetic Sense.\'"'),
            ],
          },
          {
            id: 'l43-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Word stress</strong></p><ul><li>word stress = saying some syllables {{q4}} than others</li><li>English speakers remember words by their stress {{q5}}</li><li>free online {{q6}} show the phonetic spelling of a word</li><li>the {{q7}} sign at the front of the phonetic spelling marks the stressed part</li></ul>',
            questions: [
              q(4, null, 'louder', 'The speaker says "Word stress means saying some syllables in a word louder than other syllables."'),
              q(5, null, 'pattern', 'The speaker says "English speakers remember words according to the stress pattern."'),
              q(6, null, 'dictionaries', 'The speaker says "English learners can find many free online dictionaries that give pronunciation guidance."'),
              q(7, null, 'apostrophe', 'The speaker says "The apostrophe (\') sign at the front of the phonetic spelling shows that it is the part of the word that should be stressed."'),
            ],
          },
          {
            id: 'l43-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Using a rubber band</strong></p><p>1. Look up a new word in a {{q8}} to find its stress pattern</p><p>↓</p><p>2. Say the stressed syllable longer and with a higher {{q9}}</p><p>↓</p><p>3. Repeat the word many times while {{q10}} the rubber band on the stressed syllable</p>',
            questions: [
              q(8, null, 'dictionary', 'The speaker says "Look up a new word in the dictionary to learn the stress pattern."'),
              q(9, null, ['pitch', 'tone'], 'The speaker says learners "should pronounce the stressed syllable longer and with higher tone or pitch".'),
              q(10, null, 'pulling', 'The speaker says "Practice saying the word many times while pulling a rubber band."'),
            ],
          },
        ],
      }),
    ],
  },
};
