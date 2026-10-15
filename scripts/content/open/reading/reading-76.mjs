// Vocably Reading 76 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-76',
  title: 'Reading 76: Keeping Food Cold',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'refrigerator', title: 'Keeping Food Cold: A History of Refrigeration', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r76-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.<br/><strong>NB</strong> There are two people you will not need.',
            bank: bank([
              'William Cullen',
              'Oliver Evans',
              'Michael Faraday',
              'Jacob Perkins',
              'John Gorrie',
              'James Harrison',
              'Alexander Twining',
            ]),
            questions: [
              q(1, 'built a working machine that was not a commercial success', 'E', 'Paragraph H: John Gorrie "built a working prototype, but it was a commercial failure".', 'H'),
              q(2, 'produced a small amount of ice in an experiment that had no practical use', 'A', 'Paragraph G: Cullen\'s experiment "even created a small amount of ice, but had no practical application at that time".', 'G'),
              q(3, 'supplied cooling systems to the brewing and meat industries', 'F', 'Paragraph I: Harrison "introduced commercial vapor-compression refrigeration to breweries and meat packing houses".', 'I'),
              q(4, 'turned ammonia into a liquid using pressure and cold', 'C', 'Paragraph H: Faraday "liquefied ammonia and other gases by using high pressures and low temperatures".', 'H'),
              q(5, 'gave a description of a closed cycle for producing ice with ether', 'B', 'Paragraph H: Oliver Evans "described a closed vapor-compression refrigeration cycle for the production of ice by ether under vacuum".', 'H'),
            ],
          },
          {
            id: 'r76-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The icebox was a familiar household item for roughly 150 years before the refrigerator took its place.', 'TRUE', 'Paragraph A: "The refrigerator replaced the icebox, which had been a common household appliance for almost a century and a half."', 'A'),
              q(7, 'Frozen food was already an everyday purchase before 1940.', 'FALSE', 'Paragraph B: home freezers "were introduced in 1940. Frozen foods, previously a luxury item, became commonplace."', 'B'),
              q(8, 'Businesses were using refrigeration units for decades before they became common in homes.', 'TRUE', 'Paragraph C: "Commercial refrigerator and freezer units were in use for almost 40 years prior to the common home models."', 'C'),
              q(9, 'Peltier-type refrigerators are the cheapest kind of domestic refrigerator.', 'NOT GIVEN', 'Paragraph D says only that "Among the smallest are Peltier-type refrigerators designed to chill beverages" — their price is not mentioned.', 'D'),
              q(10, 'Natural methods of cooling food are no longer used.', 'FALSE', 'Paragraph F: "Natural means are still used to cool foods today."', 'F'),
            ],
          },
          {
            id: 'r76-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Food spoils more slowly in a refrigerator because the cold reduces the rate at which ______ multiply.', 'bacteria', 'Paragraph A: "The low temperature reduces the reproduction rate of bacteria, so the refrigerator lowers the rate of spoilage."', 'A'),
              q(12, 'The arrival of ______ in the 1920s helped the refrigerator market to grow during the following decade.', 'Freon', 'Paragraph B: "The introduction of Freon in the 1920s expanded the refrigerator market during the 1930s."', 'B'),
              q(13, 'A large domestic refrigerator is about ______ wide.', ['one metre', '1 metre', 'one meter', '1 m'], 'Paragraph D: "A large domestic refrigerator stands as tall as a person and may be about one metre (3 ft 3 in) wide".', 'D'),
              q(14, 'Ancient Iranian coolers were fitted with wind-catchers called ______.', 'badgirs', 'Paragraph E: the yakhchāls were "outfitted with badgirs (wind-catchers) and series of qanats (aqueducts)".', 'E'),
            ],
          },
        ],
      }),
    ],
  },
};
