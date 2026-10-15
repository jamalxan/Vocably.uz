// Vocably Listening 11 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-11',
  title: 'Listening 11: Louisiana\'s Creole Culture',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'louisiana-s-creole-culture-extends-far-and-wide',
        contextText: 'You will hear a report about Creole culture in the US state of Louisiana and what the word "Creole" means.',
        questionGroups: [
          {
            id: 'l11-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Creole culture in Louisiana</strong></p><ul><li>up to {{q1}} people still speak Louisiana Creole</li><li>Creole and Cajun music, such as {{q2}}, is often heard on the radio</li><li>Christina Bragg belongs to a {{q3}} group for Black and mixed-race women</li></ul>',
            questions: [
              q(1, null, '10,000', 'The speaker says "as many as 10,000 people still speak the French-based language Louisiana Creole".'),
              q(2, null, 'zydeco', 'The speaker says the airwaves are "often filled with the driving, rhythmic sound of zydeco and other Creole and Cajun music".'),
              q(3, null, 'parade', 'The speaker says Bragg "is a member of the Mahogany Blue Babydolls, a parade group for Black and mixed-race women".'),
            ],
          },
          {
            id: 'l11-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which person makes each of the following statements? Choose the correct letter, <strong>A-D</strong>.',
            bank: bank(['Christina Bragg', 'Mona Lisa Saloy', 'Vance Vaucresson', 'Don Vappie']),
            questions: [
              q(4, 'Celebrating Creole culture is simply part of everyday life.', 'A', 'Bragg says "Celebrating Creole is celebrating our day-to-day lives."'),
              q(5, 'Creole cultures around the world are similar to the one in Louisiana.', 'B', 'The speaker says Saloy "said Creole cultures all over the world have similarities to Louisiana\'s".'),
              q(6, 'Anyone born in Louisiana can be considered Creole.', 'C', 'Vaucresson says "By that definition, anyone born in Louisiana could be Creole."'),
              q(7, 'Before the Civil War, Creole society was divided into three levels.', 'D', 'The speaker says Vappie "described the idea of Creole before the Civil war as organized into three levels".'),
            ],
          },
          {
            id: 'l11-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'The word "Creole" is thought to have come from a ______ word.', 'Portuguese', 'The speaker says the word "is believed to have come from the Portuguese word crioulo".'),
              q(9, 'Settlers from the North began arriving after the Louisiana Purchase of ______.', '1803', 'The speaker says "settlers who were coming from Northern states after The Louisiana Purchase from France in 1803".'),
              q(10, 'Saloy believes that Creole food, music and architecture are all linked to ______ culture.', 'West African', 'Saloy says "it\'s all connected to West African culture".'),
            ],
          },
        ],
      }),
    ],
  },
};
