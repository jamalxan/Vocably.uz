// Vocably Listening 54 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-54',
  title: 'Listening 54: The Icy Crust of Titan',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'study-saturn-s-moon-titan-has-huge-layer-of-methane-filled-ice',
        contextText: 'You will hear a news report about a study of the icy surface of Saturn\'s moon Titan.',
        questionGroups: [
          {
            id: 'l54-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Titan</strong></p><ul><li>new study carried out at the University of {{q1}}</li><li>atmosphere is rich in nitrogen and {{q2}}</li><li>Saturn has a total of {{q3}} moons; Titan is the largest</li><li>the Cassini spacecraft studied Saturn for more than {{q4}} years</li></ul>',
            questions: [
              q(1, null, 'Hawaii', 'The speaker says "Scientists at the University of Hawaii carried out the new study."'),
              q(2, null, 'methane', 'The speaker says Titan is thought to have "a dense atmosphere rich in nitrogen and methane".'),
              q(3, null, '146', 'The speaker says "NASA reports Saturn has a total of 146 moons orbiting it".'),
              q(4, null, ['10', 'ten'], 'The speaker says "For more than 10 years" the Cassini spacecraft studied Saturn.'),
            ],
          },
          {
            id: 'l54-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What surprised the researchers about the craters on Titan?', ['There were more than expected.', 'They were shallower than expected.', 'They were extremely deep.', 'They were filled with water.'], 'B', 'The speaker says "many craters examined on Titan\'s surface were not as deep as some other moons".'),
              mc(6, 'How many craters were identified on the whole moon?', ['9', '19', '90', '900'], 'C', 'The speaker says "only 90 craters were identified on the whole moon".'),
              mc(7, 'What do the researchers think is removing the signs of craters?', ['heavy rainfall', 'strong winds', 'a thick layer of ice containing methane', 'active volcanoes'], 'C', 'The speaker says "the moon\'s icy surface is covered with a thick layer of solid water ice, with methane gas trapped inside".'),
            ],
          },
          {
            id: 'l54-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'The icy crust is thought to be between five and ______ kilometres thick.', ['10', 'ten'], 'The speaker says Titan has "a methane-filled icy crust that is from five to 10 kilometers thick".'),
              q(9, 'The surface temperature of Titan is about minus ______ degrees Celsius.', '179', 'The speaker says "The surface of Titan is estimated to be about minus 179 degrees Celsius."'),
              q(10, 'NASA plans to send a rotorcraft called ______ to Titan in 2028.', 'Dragonfly', 'The speaker says "That mission calls for a spacecraft called Dragonfly to travel to Titan".'),
            ],
          },
        ],
      }),
    ],
  },
};
