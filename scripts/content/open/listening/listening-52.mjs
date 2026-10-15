// Vocably Listening 52 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-52',
  title: 'Listening 52: Reshaping an Asteroid',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'study-nasa-space-strike-might-have-reshaped-an-asteroid',
        contextText: 'You will hear a news report about a study of what happened when a NASA spacecraft crashed into an asteroid.',
        questionGroups: [
          {
            id: 'l52-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The DART experiment</strong></p><ul><li>the DART spacecraft hit the asteroid Dimorphos in {{q1}}</li><li>the strike happened about {{q2}} million kilometres from Earth</li><li>aim: to test a way of changing an asteroid&#39;s {{q3}}</li><li>result: the orbital period of Dimorphos was reduced by {{q4}} minutes</li><li>new study: the crash changed the {{q5}} of the whole asteroid, not just made a hole</li></ul>',
            questions: [
              q(1, null, '2022', 'The speaker says "NASA crashed the DART spacecraft into the asteroid Dimorphos in 2022."'),
              q(2, null, '11', 'The speaker says "The asteroid strike happened about 11 million kilometers from Earth."'),
              q(3, null, 'orbit', 'The speaker says "The experiment tested a method for changing the orbit of some asteroids".'),
              q(4, null, '33', 'The speaker says "the strike reduced the orbital period of Dimorphos by 33 minutes".'),
              q(5, null, 'shape', 'The speaker says "it likely changed the shape of the whole asteroid".'),
            ],
          },
          {
            id: 'l52-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Where was the new research carried out?', ['at a NASA laboratory', 'at the University of Bern in Switzerland', 'at a Japanese space centre', 'at the European Space Agency'], 'B', 'The speaker says "Astronomers at the University of Bern, in Switzerland carried out the research."'),
              mc(7, 'The team\'s simulation method had previously been used to', ['plan the DART mission.', 'confirm the results of a Japanese sample mission.', 'measure the size of Didymos.', 'design the Hera spacecraft.'], 'B', 'The speaker says "the team said it confirmed the results of a Japanese spacecraft collecting a sample from the Ryugu asteroid".'),
              mc(8, 'How many simulations did the researchers complete?', ['25', '50', '250', '2,000'], 'C', 'The speaker says "she said 250 simulations were completed".'),
            ],
          },
          {
            id: 'l52-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'The crash turned Dimorphos into a weak ______ asteroid held together only by gravity.', 'rubble pile', 'The speaker says the results showed that "the crash turned Dimorphos into a relatively weak" rubble pile asteroid.'),
              q(10, 'The European spacecraft Hera may be launched in ______.', 'October', 'The speaker says "The spacecraft, called Hera, is preparing for a possible launch in October."'),
            ],
          },
        ],
      }),
    ],
  },
};
