// Vocably Listening 57 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-57',
  title: 'Listening 57: What to Do After Studying',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'things-to-do-after-you-study',
        contextText: 'You will hear a talk about two things students can do after a study session to remember more.',
        questionGroups: [
          {
            id: 'l57-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What do many students do as soon as they finish studying?', ['go to sleep', 'look at a phone or computer', 'have something to eat', 'do some exercise'], 'B', 'The speaker says "Perhaps they look at their phone or computer."'),
              mc(2, 'According to the speaker, why is resting difficult?', ['Students feel guilty about doing nothing.', 'Electronic devices and games provide too much stimulation.', 'Students have no free time.', 'Study rooms are usually noisy.'], 'B', 'The speaker says "Resting is difficult when you have too much stimulation from electronic devices, games, lights and so on."'),
              mc(3, 'What did researchers find about older adults who rested after learning new words?', ['They remembered the words better.', 'They forgot the words within a week.', 'They learned fewer words.', 'They fell asleep during the test.'], 'A', 'The speaker says the adults who rested "had better memory of those words".'),
            ],
          },
          {
            id: 'l57-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Study', 'Participants', 'Method and results'],
              [
                ['published in <em>PLOS One</em>', 'older people in good {{q4}}', 'rested for {{q5}} minutes after learning words; results still strong after {{q6}} days'],
                ['2019 study in <em>Neuroscience Letters</em>', 'both young and older adults', 'better recollection of information from {{q7}} passages'],
              ],
              'Research on wakeful rest',
            ),
            questions: [
              q(4, null, 'health', 'The speaker says the study "examined how well older people who were in good health could remember certain words".'),
              q(5, null, ['10', 'ten'], 'The speaker says "older adults who rested for 10 minutes after learning new words had better memory of those words".'),
              q(6, null, ['7', 'seven'], 'The speaker says "The results were strong even after seven days".'),
              q(7, null, 'prose', 'The speaker says adults "were able to better remember, or recollect, information from prose passages after doing wakeful rest".'),
            ],
          },
          {
            id: 'l57-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Sleep and learning</strong></p><ul><li>Harvard Medical School: a sleep-deprived person cannot focus {{q8}} properly</li><li>Robert Stickgold: new memories are in a raw and {{q9}} form</li><li>National Sleep Foundation: adults aged 18 to 64 need between {{q10}} and 9 hours of sleep a day</li></ul>',
            questions: [
              q(8, null, 'attention', 'The speaker says "a sleep-deprived person cannot focus attention optimally and therefore cannot learn efficiently".'),
              q(9, null, 'fragile', 'The speaker quotes Stickgold: new memories are "in a very raw and fragile form".'),
              q(10, null, ['7', 'seven'], 'The speaker says adults should "get between 7 and 9 hours of sleep per day".'),
            ],
          },
        ],
      }),
    ],
  },
};
