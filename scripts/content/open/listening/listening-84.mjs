// Vocably Listening 84 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-84',
  title: 'Listening 84: Mammoth Cave National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-mammoth-cave',
        contextText: 'You will hear a talk about the longest cave system in the world and the people who explored it.',
        questionGroups: [
          {
            id: 'l84-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Mammoth Cave National Park, Kentucky</strong></p><ul><li>the longest known cave system in the world – {{q1}} times the size of the second largest</li><li>the park covers more than {{q2}} hectares</li><li>made a national park by Congress in {{q3}}</li><li>over {{q4}} kilometres of passageways have been mapped so far</li><li>water sinks quickly into soil made of broken-down {{q5}}</li></ul>',
            questions: [
              q(1, null, ['two', '2'], 'The speaker says "It is two times as large as the world\'s second-biggest cave system."'),
              q(2, null, ['20,000', '20000'], 'The speaker says "The park covers over 20,000 hectares."'),
              q(3, null, '1941', 'The speaker says Congress "formed Mammoth Cave National Park in 1941".'),
              q(4, null, '600', 'The speaker says researchers have mapped "600 kilometers of passageways in Mammoth Cave".'),
              q(5, null, 'limestone', 'The speaker says "Soil made of broken-down limestone absorbs the water."'),
            ],
          },
          {
            id: 'l84-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the speaker say about the bats of Mammoth Cave?', ['There are around 10 million of them today.', 'Their numbers have fallen greatly.', 'They all belong to a single species.', 'They never leave the cave.'], 'B', 'The speaker says the cave "was once home to about 10 million bats" but "Now, they number in the thousands."'),
              mc(7, 'According to the stories, how did John Houchins find the cave?', ['He was searching for minerals.', 'He fell through the entrance while hunting.', 'He followed a bear he had wounded.', 'He was shown the entrance by local people.'], 'C', 'The speaker says "Houchins shot the bear, but he failed to kill it. The bear ran, and Houchins followed. It led him into the cave."'),
              mc(8, 'During the War of 1812, slaves worked in the cave in order to', ['guide visitors on tours.', 'mine a mineral used for ammunition.', 'draw maps of the passages.', 'search for underground rivers.'], 'B', 'The speaker says "slaves mined the cave for a mineral called saltpeter. It was used to produce ammunition".'),
            ],
          },
          {
            id: 'l84-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'The map Stephen Bishop drew in the early 1840s was used for more than ______ years.', ['40', 'forty'], 'The speaker says "His map remained in use for more than 40 years."'),
              q(10, 'About ______ people take a tour of the cave every year.', ['500,000', '500000'], 'The speaker says "About 500,000 people tour the cave each year."'),
            ],
          },
        ],
      }),
    ],
  },
};
