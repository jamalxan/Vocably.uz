// Vocably Reading 28 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-28',
  title: 'Reading 28: Hummingbirds',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'hummingbird', title: 'Hummingbirds: Small Birds, Big Engines', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r28-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The majority of hummingbird species live in North America.', 'FALSE', 'Paragraph A: "most species are found in Central and South America".', 'A'),
              q(2, 'Female hummingbirds display a wider range of colours than males.', 'FALSE', 'Paragraph B: "Among all birds, male hummingbirds have the widest diversity of plumage color".', 'B'),
              q(3, 'Every species of hummingbird eats insects as well as nectar.', 'TRUE', 'Paragraph B: "hummingbirds are specialized for feeding on flower nectar, but all species also consume small insects".', 'B'),
              q(4, 'A hummingbird in torpor lowers its body temperature by half.', 'NOT GIVEN', 'Paragraph D says only that in torpor they "slow their metabolic rate to 1⁄15 of its normal rate"; body temperature is not mentioned.', 'D'),
              q(5, 'Most hummingbird species make long migratory journeys.', 'FALSE', 'Paragraph D: "While most hummingbirds do not migrate, the rufous hummingbird has one of the longest migrations among birds".', 'D'),
            ],
          },
          {
            id: 'r28-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'The largest hummingbirds beat their wings about ______ times a second while hovering.', ['12', 'twelve'], 'Paragraph C: wing-flapping rates "vary from around 12 beats per second in the largest species to 99 per second in small hummingbirds".', 'C'),
              q(7, 'Twice a year the rufous hummingbird travels roughly ______ miles between Alaska and Mexico.', ['3,900', '3900'], 'Paragraph D: "traveling twice per year between Alaska and Mexico, a distance of about 3,900 miles (6,300 km)".', 'D'),
              q(8, 'Ridges on the toes help a hummingbird to hold on to the ______ of flowers.', ['stems', 'petals'], 'Paragraph H: "The toes of hummingbirds are formed as claws with ridged inner surfaces to aid gripping onto flower stems or petals."', 'H'),
              q(9, 'The iridescent patch of neck feathers found on most males is called the ______.', 'gorget', 'Paragraph K: "The most typical feather ornament in males is the gorget – a bib-like iridescent neck-feather patch".', 'K'),
            ],
          },
          {
            id: 'r28-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(10, 'examples of names that hummingbirds have been given because of their appearance', 'E', 'Paragraph E: "give some hummingbirds exotic common names, such as sun gem, fairy, woodstar, sapphire or sylph".', 'E'),
              q(11, 'how hummingbirds move about when they are not in the air', 'H', 'Paragraph H: "Hummingbirds do not walk on the ground or hop like most birds, but rather shuffle laterally".', 'H'),
              q(12, 'the number of hummingbird species whose survival is under threat', 'A', 'Paragraph A: "As of 2026, 21 hummingbird species are listed as endangered or critically endangered, with about 255 species declining in population."', 'A'),
              q(13, 'the speed reached by some males during courtship', 'J', 'Paragraph J: "During courtship, some male species dive from 30 metres (100 ft) of height above a female at speeds around 23 m/s".', 'J'),
              q(14, 'the position of the feet while a hummingbird is flying', 'I', 'Paragraph I: "During flight, hummingbird feet are tucked up under the body, enabling optimal aerodynamics and maneuverability."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
