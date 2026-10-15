// Vocably Listening 19 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-19',
  title: 'Listening 19: A Mine and Its Watchdog',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'nickel-mine-environmental-activists-exist-together-in-michigan',
        contextText: 'You will hear a report about how a mining company and environmental activists learned to work together.',
        questionGroups: [
          {
            id: 'l19-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What did Rio Tinto promise people living near the mine?', ['good jobs', 'clean water', 'a new park', 'cheaper electricity'], 'A', 'The speaker says "Rio Tinto promised good jobs for people in the area close to Canada."'),
              mc(2, 'What did many observers expect to happen?', ['a long legal battle', 'the mine would open quickly', 'the activists would give up', 'the company would move to Canada'], 'A', 'The speaker says "Many observers expected a long legal fight between the two sides."'),
              mc(3, 'What does the speaker say about the Eagle mine today?', ['It has operated for over ten years without pollution problems.', 'It closed after ten years.', 'It has had several accidents.', 'It has still not opened.'], 'A', 'The speaker says "the Eagle mine has been open for more than 10 years" and "There have been no accidents or pollution problems."'),
            ],
          },
          {
            id: 'l19-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Which person says or does each of the following? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bank: bank(['Maura Davenport', 'Simon Nish', 'Rochelle Dale']),
            questions: [
              q(4, 'was strongly against the mine at first but later changed their view', 'A', 'The speaker quotes Davenport: "I was fiercely opposed to the mine, and I changed".'),
              q(5, 'says the mine proposal split the local community', 'A', 'The speaker says Davenport "said the Eagle mine proposal" and quotes "divided our community".'),
              q(6, 'learned from working in Australia that both sides\' interests must be understood', 'B', 'The speaker says Nish "worked in Australia" when "mining companies wanted to use land where native Aboriginal people lived".'),
              q(7, 'worries that problems may appear only after the mine closes', 'C', 'The speaker quotes Dale: "a lot of the sulfide mines in the past haven\'t really had a problem until after closure".'),
            ],
          },
          {
            id: 'l19-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The monitoring agreement</strong></p><ul><li>the environmental group needed open {{q8}} to the mine</li><li>it also had to be allowed to test a processing centre {{q9}} kilometres away</li><li>the agreement was signed in {{q10}}</li></ul>',
            questions: [
              q(8, null, 'access', 'The speaker says "The group required open access to the mine."'),
              q(9, null, '30', 'The speaker says "it required permission to test a processing center 30 kilometers away".'),
              q(10, null, '2012', 'The speaker says the agreement "was signed in 2012".'),
            ],
          },
        ],
      }),
    ],
  },
};
