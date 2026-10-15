// Vocably Listening 6 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-6',
  title: 'Listening 6: Mission to an Asteroid',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'europe-launches-spacecraft-to-explore-asteroid-hit-by-nasa',
        contextText: 'You will hear a news report about a European spacecraft sent to study an asteroid.',
        questionGroups: [
          {
            id: 'l6-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Hera mission</strong></p><ul><li>launched from Cape Canaveral on October {{q1}}</li><li>carried into space by a SpaceX Falcon 9 {{q2}}</li><li>heading for the asteroid Dimorphos, which NASA\'s DART spacecraft crashed into in {{q3}}</li><li>that crash shortened the orbit of Dimorphos by {{q4}} minutes</li></ul>',
            questions: [
              q(1, null, '7', 'The speaker says the "Hera spacecraft launched October 7 from NASA\'s Cape Canaveral in Florida".'),
              q(2, null, 'rocket', 'The speaker says it "was carried to space aboard a SpaceX Falcon 9 rocket".'),
              q(3, null, '2022', 'The speaker says "NASA crashed its DART spacecraft into the space rock in 2022".'),
              q(4, null, '33', 'The speaker says "the strike reduced the orbital period of Dimorphos by 33 minutes".'),
            ],
          },
          {
            id: 'l6-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'ESA officials have compared the Hera mission to', ['a rescue operation.', 'a crash scene investigation.', 'a treasure hunt.', 'a long road trip.'], 'B', 'ESA officials describe it as a "crash scene investigation", and Ian Carnelli said the spacecraft was "going back to the crime site".'),
              mc(6, 'What have studies of the DART mission suggested about Dimorphos?', ['It is a single solid rock.', 'It is made of loose pieces held together by gravity.', 'It has a metal centre.', 'It is bigger than Didymos.'], 'B', 'The speaker says "Dimorphos was more of a collection of rubble pieces held together by gravity".'),
              mc(7, 'According to Ignacio Tanco, what could be a danger to the spacecraft?', ['extreme cold', 'loss of radio contact', 'rocks and other material around the asteroid', 'a shortage of fuel'], 'C', 'The speaker says "some large rocks and other materials could still be following the asteroid".'),
            ],
          },
          {
            id: 'l6-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'What will one of the nanosatellites use to collect data after landing on Dimorphos?', 'radar', 'The speaker says "One will land on Dimorphos and capture data on the asteroid with radar."'),
              q(9, 'How often is an asteroid wider than one kilometre expected to hit Earth?', ['500,000 years', '500,000', '500000 years'], 'The speaker says such an asteroid "is estimated to strike Earth about every 500,000 years".'),
              q(10, 'What percentage of 140-metre asteroids are believed to have been identified so far?', ['40 percent', '40%', '40'], 'The speaker says "only 40 percent of those space rocks are believed to have been identified".'),
            ],
          },
        ],
      }),
    ],
  },
};
