// Vocably Listening 83 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

/** multiple_choice_multi savoli: `multi(8, 'savol', ['a','b','c','d','e'], ['B','D'], 'izoh')` */
const multi = (number, promptHtml, texts, answers, explanationHtml) => ({
  number,
  promptHtml,
  options: texts.map((text, i) => ({ key: 'ABCDEFGH'[i], text })),
  selectCount: answers.length,
  answer: { accepted: answers },
  explanationHtml,
});

export default {
  slug: 'vocably-listening-83',
  title: 'Listening 83: Biscayne National Park',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-biscayne-underwater-explorations',
        contextText: 'You will hear a talk about Biscayne National Park, a mostly underwater park in southern Florida.',
        questionGroups: [
          {
            id: 'l83-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Biscayne became a national park in ______.', '1980', 'The speaker says "It became a national park in 1980."'),
              q(2, '______ percent of the park is water.', ['95', 'ninety-five', 'ninety five'], 'The speaker says that 95 "percent of the park is water".'),
              q(3, 'The park\'s waters are home to more than ______ species of fish.', '500', 'The speaker says there are "more than 500 species of fish".'),
            ],
          },
          {
            id: 'l83-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['', 'Erl King', 'Lugano'], [
              ['Type / origin', 'built in 1865', 'British steamship'],
              ['Year it sank', '{{q4}}', '1913'],
              ['Cargo and passengers', 'goods and rich passengers; traded between China and {{q5}}', 'goods and more than 100 passengers travelling to Havana, {{q6}}'],
              ['Today', 'lies on the sea floor near Long Reef', 'lies along Long Reef almost {{q7}} metres below the water'],
            ], 'Two shipwrecks that divers can explore'),
            questions: [
              q(4, null, '1891', 'The speaker says "Among them is the Erl King, which sank in 1891."'),
              q(5, null, 'Australia', 'The speaker says "it was used for trading between China and Australia".'),
              q(6, null, 'Cuba', 'The speaker says "It was traveling to Havana, Cuba, carrying goods".'),
              q(7, null, ['8', 'eight'], 'The speaker says "the Lugano remains along Long Reef, almost 8 meters below water".'),
            ],
          },
          {
            id: 'l83-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, <strong>A-E</strong>, for each question.',
            questions: [
              multi(8, 'Which TWO kinds of guided trip does the speaker mention?', ['fishing', 'snorkelling', 'sailing', 'scuba diving', 'bird-watching'], ['B', 'D'], 'The speaker says "Guides lead snorkeling and scuba diving trips."'),
              multi(9, 'Which TWO ways of enjoying the mangrove forests are mentioned?', ['canoeing', 'swimming', 'cycling', 'hiking', 'kayaking'], ['A', 'E'], 'The speaker says "Canoeing and kayaking are great ways to enjoy" the mangrove forests.'),
              multi(10, 'Which TWO things can be seen from the top of the Boca Chita lighthouse?', ['the Everglades', 'the ocean and nearby islands', 'shipwrecks', 'the Miami Beach skyline', 'coral reefs'], ['B', 'D'], 'The speaker says the deck "provides beautiful views of the ocean and the nearby islands" and "offers views of Miami Beach\'s famous skyline".'),
            ],
          },
        ],
      }),
    ],
  },
};
