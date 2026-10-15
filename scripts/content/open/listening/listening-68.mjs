// Vocably Listening 68 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-68',
  title: 'Listening 68: James Monroe',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-james-monroe',
        contextText: 'You will hear a talk about James Monroe, the fifth president of the United States.',
        questionGroups: [
          {
            id: 'l68-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'Why did many voters feel a special connection to Monroe?', ['He had been a famous general.', 'He was seen as a link to the founding generation.', 'He was the youngest candidate.', 'He came from the North.'], 'B', 'The speaker says "many saw him as a last connection to the country\'s founding generation".'),
              mc(2, 'Why could the Monroes not move into the president\'s house immediately?', ['It had not yet been built.', 'It was being repaired after a British attack.', 'The previous president still lived there.', 'Monroe preferred to live in Virginia.'], 'B', 'The speaker says "The British had burned it badly in an attack on Washington" and "Workers were busy making repairs."'),
              mc(3, 'What did Monroe do on his trip through New England?', ['He gave land to new settlers.', 'He met Native American leaders.', 'He wore clothes in an old-fashioned style.', 'He visited new factories.'], 'C', 'The speaker says "He even wore clothes in the old colonial style."'),
            ],
          },
          {
            id: 'l68-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Missouri Compromise</strong></p><p>By the end of {{q4}}: eleven Southern states permit slavery, eleven Northern states do not</p><p>↓</p><p>Settlers ask Congress to make {{q5}} a state</p><p>↓</p><p>A Northern congressman proposes that the new state must ban slavery; the debate lasts more than a {{q6}}</p><p>↓</p><p>Compromise: {{q7}} enters as a free state, Missouri as a slave state; no new slave states north of a line on the map</p>',
            questions: [
              q(4, null, '1819', 'The speaker says "By the end of 1819, eleven states, all in the South, permitted slavery."'),
              q(5, null, 'Missouri', 'The speaker says "settlers asked Congress permission for Missouri Territory to become a state".'),
              q(6, null, 'year', 'The speaker says "That proposal started a debate that lasted more than a year."'),
              q(7, null, 'Maine', 'The speaker says "They said Maine could be admitted as a free state and Missouri as a slave state."'),
            ],
          },
          {
            id: 'l68-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Together with John Quincy Adams, Monroe arranged to buy ______ from Spain.', 'Florida', 'The speaker says he and his secretary of state "successfully negotiated with Spain to buy Florida for the United States".'),
              q(9, 'The Monroe Doctrine became a base of American ______ during the 19th century.', 'foreign policy', 'The speaker says "it became a base of American foreign policy and supported U.S. expansion throughout the 19th century".'),
              q(10, 'Monroe\'s daughter Eliza attended a school for girls in ______.', 'Paris', 'The speaker says "young Eliza Monroe attended the best school for girls in Paris".'),
            ],
          },
        ],
      }),
    ],
  },
};
