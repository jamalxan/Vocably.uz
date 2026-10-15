// Vocably Listening 14 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-14',
  title: 'Listening 14: Laser Communication in Deep Space',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'nasa-extends-laser-communication-in-space-to-226-million-kilometers',
        contextText: 'You will hear a science report about a new way of sending data across space.',
        questionGroups: [
          {
            id: 'l14-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Deep Space Optical Communications (DSOC)</strong></p><ul><li>new experiment sent data over {{q1}} million kilometres</li><li>earlier tests covered only {{q2}} million kilometres</li><li>NASA has traditionally used {{q3}} communications, which have limited bandwidth</li><li>lasers could send up to {{q4}} times more data than radio</li><li>data is carried as {{q5}} inside the laser\'s photons</li></ul>',
            questions: [
              q(1, null, '226', 'The speaker says "sent data over 226 million kilometers in space".'),
              q(2, null, '31', 'The speaker says "previous tests that measured data transfers over 31 million kilometers".'),
              q(3, null, 'radio', 'The speaker says "NASA has depended on radio communications to send data back and forth through space".'),
              q(4, null, '100', 'The speaker says the technology will permit "up to 100 times more data" to be sent back to Earth.'),
              q(5, null, 'bits', 'The speaker says "Data transferred by laser takes the form of bits".'),
            ],
          },
          {
            id: 'l14-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What is the Psyche spacecraft travelling to study?', ['an asteroid made mostly of metal', 'the surface of the moon', 'the planet Mars', 'a telescope in California'], 'A', 'The speaker says Psyche is "on its way to observe a mostly metal asteroid".'),
              mc(7, 'How long would it take to send a complete map of Mars using the laser method?', ['nine weeks', 'nine days', 'nine hours', 'nine minutes'], 'B', 'The speaker says "with a laser-based method, the time would be cut to nine days".'),
              mc(8, 'According to the research team, what is new about this experiment?', ['It is the first successful test of laser communication in deep space.', 'It is the first test of lasers in low Earth orbit.', 'It is the first time data has been sent from the moon.', 'It is the first time a spacecraft has used radio waves.'], 'A', 'The speaker says "this is the first time the method has been successfully tested in deep space".'),
            ],
          },
          {
            id: 'l14-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'During the experiment on April 8, the system sent about ______ of data.', ['10 minutes', 'ten minutes'], 'The speaker says the system "was able to transfer about 10 minutes of data".'),
              q(10, 'When Psyche is farthest from Earth, its photons will take about ______ to arrive.', ['20 minutes', 'twenty minutes'], 'The speaker says "the DSOC system\'s photons will take about 20 minutes to travel back to Earth".'),
            ],
          },
        ],
      }),
    ],
  },
};
