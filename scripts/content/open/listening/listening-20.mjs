// Vocably Listening 20 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-20',
  title: 'Listening 20: America\'s Oldest Pet Cemetery',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'oldest-pet-burial-ground-in-america-is-final-resting-place-for-thousands',
        contextText: 'You will hear a report about a cemetery in New York where people bury their pets.',
        questionGroups: [
          {
            id: 'l20-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'How does Mark Lindenberg describe the pet cemetery?', ['one of the most cheerful places', 'a very sad place', 'an expensive place', 'a place that is hard to reach'], 'A', 'The speaker quotes Lindenberg: "This is one of the most cheerful places."'),
              mc(2, 'How did pet burials at Hartsdale begin?', ['A vet let a woman bury her dog on his land.', 'A princess buried a lion cub there.', 'The city opened a cemetery for animals.', 'A singer buried her cat there.'], 'A', 'The speaker says "animal doctor Samuel Johnson let a woman bury her dog on his property of apple trees".'),
            ],
          },
          {
            id: 'l20-form', type: 'form_completion', wordLimit: W1,
            instructionHtml: 'Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Hartsdale Pet Cemetery – facts</strong></p><ul><li>First burial: {{q3}}</li><li>Distance from New York City: about {{q4}} kilometres</li><li>Animals buried so far: about {{q5}}</li><li>Burials each year: between 250 and {{q6}}</li></ul>',
            questions: [
              q(3, null, '1896', 'The speaker says "Pet burials started in Hartsdale in 1896".'),
              q(4, null, '30', 'The speaker says "The place is about 30 kilometers north of New York City."'),
              q(5, null, ['70,000', '70000'], 'The speaker says "about 70,000 animals have been laid to rest".'),
              q(6, null, '300', 'The speaker says "Between 250 and 300 burials take place at Hartsdale each year."'),
            ],
          },
          {
            id: 'l20-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(7, 'If the yearly payments stop, the pet is cremated and its remains are ______ over the grass.', 'scattered', 'The speaker quotes Martin Jr.: "Their remains are scattered over the cemetery grass."'),
              q(8, 'The war dog memorial was established in ______.', '1923', 'The speaker says "Established in 1923, the memorial honored World War I service dogs."'),
              q(9, 'The cremated remains of about ______ people are buried with their pets.', '800', 'The speaker says "the cremated remains of about 800 humans are buried here with their pets".'),
              q(10, 'Lindenberg lives a ______ walk from the cemetery.', ['10-minute', '10 minute', 'ten-minute', 'ten minute'], 'The speaker says "Lindenberg, who lives a 10-minute walk away, will continue to visit his old friend almost daily."'),
            ],
          },
        ],
      }),
    ],
  },
};
