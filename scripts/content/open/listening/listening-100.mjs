// Vocably Listening 100 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-100',
  title: 'Listening 100: A Museum Nobody Can Visit',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'secret-museum-that-visitors-will-never-see',
        contextText: 'You will hear a report about a museum inside the headquarters of the United States Secret Service.',
        questionGroups: [
          {
            id: 'l100-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Secret Service Museum</strong></p><ul><li>located inside the agency\'s headquarters; has only {{q1}} room</li><li>honours the {{q2}} members of the service who died on duty</li><li>open only to agency workers, their {{q3}} and some special guests</li><li>closed to the public because of {{q4}} concerns and a lack of resources</li></ul>',
            questions: [
              q(1, null, ['one', '1'], 'The speaker says "the one-room museum shows objects from the agency’s history".'),
              q(2, null, ['40', 'forty'], 'The speaker says "It also honors the 40 men and women of the service who have died while performing their duty."'),
              q(3, null, 'families', 'The speaker says "the museum is only open to agency workers, their families, and some special guests".'),
              q(4, null, 'security', 'The speaker says "concerns about security and lack of resources are the reasons the museum is closed".'),
            ],
          },
          {
            id: 'l100-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What was the original purpose of the Secret Service?', ['to protect the president', 'to fight fake money', 'to spy on foreign governments', 'to guard government buildings'], 'B', 'The speaker says Hugh McCulloch suggested creating "an agency to fight counterfeit, or fake money".'),
              mc(6, 'According to Jason Kendrick, how much of the currency around the time of the Civil War was counterfeit?', ['a tenth', 'a quarter', 'a third', 'a half'], 'C', 'Kendrick says "one-third of all the currency in the U.S. during and post-Civil War was counterfeit".'),
              mc(7, 'When did the Secret Service take on the job of protecting the president?', ['in 1865, after Lincoln was killed', 'in 1868, when its powers were widened', 'in 1901, after McKinley was assassinated', 'in 1975, after an attack on Gerald Ford'], 'C', 'The speaker says it was "after the assassination of President William McKinley, that the Secret Service added the job of protecting the president".'),
            ],
          },
          {
            id: 'l100-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Which object from the 1975 attack on President Ford is on display?', ['gun', 'a gun', 'the gun'], 'The speaker says the museum shows "the gun used during the 1975 assassination attempt on President Gerald Ford".'),
              q(9, 'In which city was a government building bombed in 1995?', ['Oklahoma City', 'Oklahoma'], 'The speaker mentions "the bombing of a government building on April 19, 1995, in Oklahoma City".'),
              q(10, 'Which building in New York was attacked on September 11, 2001?', 'World Trade Center', 'The speaker mentions "the September 11, 2001, attack on the World Trade Center in New York City".'),
            ],
          },
        ],
      }),
    ],
  },
};
