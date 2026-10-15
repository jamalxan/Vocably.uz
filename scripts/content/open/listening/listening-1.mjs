// Vocably Listening 1 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-1',
  title: 'Listening 1: Keeping a Betta Fish',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'how-to-keep-a-betta-fish',
        contextText: 'You will hear a talk about how to look after a popular pet fish.',
        questionGroups: [
          {
            id: 'l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Setting up a betta tank</strong></p><ul><li>the tank should hold at least {{q1}} litres of water</li><li>the sand or small stones at the bottom are known as {{q2}}</li><li>a {{q3}} keeps the water clean</li><li>the water should be between 24 and {{q4}} degrees Celsius</li><li>artificial {{q5}} are an alternative to real ones</li></ul>',
            questions: [
              q(1, null, '11', 'The speaker says "A tank that holds at least 11 liters of water is suggested although 19 liters is better."'),
              q(2, null, 'substrate', 'The speaker says "In the pet fish industry, this is called substrate."'),
              q(3, null, 'filter', 'The speaker says "a filter is needed to purify the water".'),
              q(4, null, '28', 'The speaker says the fish prefer warmer water, "usually between 24 and 28 degrees Celsius".'),
              q(5, null, 'plants', 'The speaker says "If real plants seem like too much work, plastic plants work as well."'),
            ],
          },
          {
            id: 'l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the speaker, why is a larger tank better?', ['It is cheaper to heat.', 'The water does not need changing as often.', 'The fish grow bigger in it.', 'It is easier to decorate.'], 'B', 'The speaker says "Larger tanks are better because the water needs to be changed less often".'),
              mc(7, 'What does Krista Keller advise people who fill the tank with tap water to do?', ['boil the water before using it', 'buy water from a pet store instead', 'remove the chlorine and test for heavy metals', 'add salt to the water'], 'C', 'Her advice is quoted: "it is recommended to use a dechlorinating product and test for heavy metals".'),
              mc(8, 'What should any betta food contain?', ['vegetables', 'meat or insects', 'vitamins', 'rice'], 'B', 'The speaker says "make sure it contains meat or insects because that is what bettas eat in the wild".'),
            ],
          },
          {
            id: 'l1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Male bettas are also called Siamese ______ fish.', 'fighting', 'The speaker says "Another name for bettas is Siamese fighting fish."'),
              q(10, 'The filter may need extra cleaning roughly once a ______.', 'month', 'The speaker says "Your filter also may require some additional cleaning every month or so."'),
            ],
          },
        ],
      }),
    ],
  },
};
