// Vocably Listening 61 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-61',
  title: 'Listening 61: Learning English from Movie Trailers',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'watch-movie-trailers-to-improve-your-english',
        contextText: 'You will hear a talk about using short movie trailers to improve your English.',
        questionGroups: [
          {
            id: 'l61-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Movies and movie trailers</strong></p><ul><li>American films show natural spoken English: speed, word choice, expressions, short forms and {{q1}}</li><li>captions disappear quickly because of fast {{q2}}</li><li>a trailer is a short video {{q3}} for a film</li><li>trailers usually last two to {{q4}} minutes</li></ul>',
            questions: [
              q(1, null, 'accents', 'The speaker says films show "the speed of speech, word choice, expressions, shortened word forms and accents".'),
              q(2, null, 'speech', 'The speaker says "Fast speech, however, means captions disappear quickly."'),
              q(3, null, 'advertisement', 'The speaker says "A movie trailer is a short video advertisement for a film."'),
              q(4, null, ['three', '3'], 'The speaker says "movie trailers are usually just two to three minutes".'),
            ],
          },
          {
            id: 'l61-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Steps for studying a trailer</strong></p><p>Search YouTube for official trailers – {{q5}} films are a good choice for any age</p><p>↓</p><p>Check the video has closed captions; trailers over five or {{q6}} years old may not have them</p><p>↓</p><p>Watch at normal speed without captions, then watch again for more {{q7}}</p><p>↓</p><p>Watch with captions on and write new words in a {{q8}} or on your phone</p><p>↓</p><p>If the speech is still too fast, slow the playback speed and watch again</p><p>↓</p><p>Finally, watch once more at normal speed without captions</p>',
            questions: [
              q(5, null, 'animated', 'The speaker says "Animated films can be an especially good choice for English practice, no matter your age."'),
              q(6, null, ['seven', '7'], 'The speaker says "trailers more than five or seven years old may not offer closed captions on YouTube".'),
              q(7, null, 'details', 'The speaker says "Then, watch it again to seek more details."'),
              q(8, null, 'notebook', 'The speaker says "You can also write down a few of the new words in a notebook or on your mobile phone."'),
            ],
          },
          {
            id: 'l61-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'What warning does the speaker give about slower playback?', ['The music and sound effects may sound strange.', 'The captions stop working.', 'The picture quality becomes worse.', 'It uses more internet data.'], 'A', 'The speaker says "Movie trailers generally contain music and sound effects. They might sound a little strange at the slower speed."'),
              mc(10, 'How much practice can one short trailer provide?', ['about 5 minutes', 'about 30 minutes', 'about an hour', 'a whole day'], 'B', 'The speaker says "A short movie trailer can offer a good 30 minutes of practice".'),
            ],
          },
        ],
      }),
    ],
  },
};
