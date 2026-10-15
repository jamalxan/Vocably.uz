// Vocably Listening 2 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-2',
  title: 'Listening 2: America\'s Best-selling Truck',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'america-s-best-selling-vehicle-still-on-top-after-42-years',
        contextText: 'You will hear a report about the vehicle that has sold more than any other in the United States for decades.',
        questionGroups: [
          {
            id: 'l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Ford F-150</strong></p><ul><li>a new truck leaves the Dearborn factory every {{q1}} seconds</li><li>has been the best-selling truck in the US for {{q2}} years</li><li>owner Vaux Adams likes the truck so much that he has just bought his {{q3}} one</li><li>he needs it because he has just bought a {{q4}} and must move furniture</li><li>he especially likes the large {{q5}} inside</li></ul>',
            questions: [
              q(1, null, '53', 'The speaker says a new F-150 "rolls off the manufacturing line at its Dearborn, Michigan truck factory every 53 seconds".'),
              q(2, null, '47', 'The speaker says the F-150 "has also been the best-selling truck in the United States for 47 years".'),
              q(3, null, 'second', 'The speaker says "Adams has liked the truck so much that he just got his second one".'),
              q(4, null, 'house', 'Adams says "I bought a house, and I\'ve got to move furniture".'),
              q(5, null, 'touchscreen', 'Adams says "I have one with a big touchscreen, which is amazing."'),
            ],
          },
          {
            id: 'l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to Ford officials, the truck\'s success is the result of', ['low prices.', 'continuous innovation.', 'large factories.', 'clever advertising.'], 'B', 'The speaker says Ford officials "believe the vehicle\'s success is linked to the company\'s ongoing innovation".'),
              mc(7, 'According to Kevin Joostema, Ford was the first carmaker to', ['build an electric pickup.', 'sell trucks outside the US.', 'design a pickup for ordinary people.', 'offer a choice of engines.'], 'C', 'The speaker says "Ford was the first carmaker to design a pickup truck for normal citizens instead of just for business use".'),
              mc(8, 'What does Corey Williams say about the workstations in the factory?', ['Each one has its own computer.', 'They are operated by robots.', 'They are about to be replaced.', 'Two employees share each one.'], 'A', 'The speaker says "every workstation has its own computer that helps employees design the vehicles".'),
            ],
          },
          {
            id: 'l2-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Williams says that inside the truck it feels like a ______ vehicle.', 'luxury', 'Williams says "it\'s like a luxury vehicle".'),
              q(10, 'The one weakness of the F-150 that experts mention is its high use of ______.', 'gas', 'The speaker says "one of the less desirable things about the F-150 is its high gas usage".'),
            ],
          },
        ],
      }),
    ],
  },
};
