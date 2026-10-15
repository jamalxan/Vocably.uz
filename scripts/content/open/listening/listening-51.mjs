// Vocably Listening 51 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-51',
  title: 'Listening 51: Pronunciation and Selfie Videos',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'prounciation-english-selfie-videos',
        contextText: 'You will hear a report about how English learners can improve their pronunciation using ideas from singing and smartphone videos.',
        questionGroups: [
          {
            id: 'l51-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Michael Berman&#39;s advice</strong></p><ul><li>Berman works at Montgomery College in the state of {{q1}}</li><li>many learners have problems with word stress and {{q2}}</li><li>up to a {{q3}} of his students became easier to understand by slowing down and speaking up</li><li>some learners speak quickly or softly to hide their {{q4}}</li></ul>',
            questions: [
              q(1, null, 'Maryland', 'The speaker says Berman works "at Montgomery College in the American state of Maryland".'),
              q(2, null, 'intonation', 'The speaker says "Many students of a foreign language have trouble with word stress and intonation".'),
              q(3, null, 'third', 'The speaker says "Up to a third of his students, he says, have increased their ability to be understood".'),
              q(4, null, 'mistakes', 'The speaker says "English learners may want to hide their mistakes by speaking quickly or softly."'),
            ],
          },
          {
            id: 'l51-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'In the video example, why can Anna not understand Pete?', ['He pronounces words incorrectly.', 'He does not speak loudly enough.', 'He speaks too quickly.', 'He uses the wrong words.'], 'B', 'The speaker says "The reason Anna does not understand Pete is because he is not speaking loudly."'),
              mc(6, 'Why do singers open their mouths wider when training?', ['to breathe more easily', 'to get a better tone and pitch', 'to be seen by the audience', 'to sing more quickly'], 'B', 'The speaker says "This enables them to get a better tone and a better pitch when they perform."'),
              mc(7, 'Singers imagine their voice travelling to a target that is', ['one metre away.', 'three to five metres away.', 'ten metres away.', 'on the other side of a wall.'], 'B', 'The speaker says "Singers will often imagine their voice coming up on a string to a target 3 to 5 meters away."'),
            ],
          },
          {
            id: 'l51-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'At which university does Sarah Lynn teach?', ['Harvard', 'Harvard University'], 'The speaker says "Lynn teaches at Harvard University\'s Bridge Program in Massachusetts."'),
              q(9, 'Apart from friends, who can give the learner advice about the videos?', 'teachers', 'The speaker says "You can share the videos with friends or your teachers. They can give you advice, too."'),
              q(10, 'Where do young people place a high value on posting videos?', 'social media', 'The speaker says young people "place a high value on the idea of posting videos on social media".'),
            ],
          },
        ],
      }),
    ],
  },
};
