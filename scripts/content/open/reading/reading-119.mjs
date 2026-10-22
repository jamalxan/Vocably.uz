// Vocably Reading 119 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-119',
  title: 'Reading 119: Bicycle-Sharing Systems',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'bicycle-sharing-system', title: 'Sharing the Ride: Public Bicycle Schemes', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r119-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Write the correct letter, A-J.</em>',
            questions: [
              q(1, 'an admission that a well-known scheme was far smaller than people believe', 'E', 'Paragraph E: Schimmelpennink admitted that "the Sixties experiment never existed in the way people believe".', 'E'),
              q(2, 'a description of bicycle sharing in a work of fiction', 'F', 'Paragraph F: in his novel "Callenbach described a bicycle sharing system which is available to inhabitants as an integrated part of a wider public transportation system".', 'F'),
              q(3, 'a scheme that was replaced by a programme giving bicycles to people on low incomes', 'G', 'Paragraph G: "The Yellow Bike Project was eventually terminated, and replaced with the Create A Commuter (CAC) program, which provides free secondhand bicycles to low-income individuals".', 'G'),
              q(4, 'the personal experience that inspired two founders to set up a scheme', 'H', 'Paragraph H: "The idea was developed after both founders were victims of bicycle theft one night in 1989."', 'H'),
              q(5, 'figures for the number of bicycles in the largest schemes in one country', 'J', 'Paragraph J: "in 2012, the largest were in Wuhan and Hangzhou, with around 90,000 and 60,000 bikes respectively".', 'J'),
            ],
          },
          {
            id: 'r119-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Bicycle-sharing schemes first appeared in North America.', 'FALSE', 'Paragraph C: "Bicycle-sharing systems originated in grassroot efforts in Europe in the mid-1960s."', 'C'),
              q(7, 'The White Bicycle Plan was the only plan of its kind proposed by the Provo movement.', 'FALSE', 'Paragraph D: "The scheme was one of a number of" White Plans "proposed by the movement, which comprised various strategies for improving livability or transportation in Amsterdam".', 'D'),
              q(8, 'The bicycles used in Copenhagen had parts that could not be fitted to other bikes.', 'TRUE', 'Paragraph H: ByCylken "was the first large-scale urban bike share program to feature specially designed bikes with parts that could not be used on other bikes".', 'H'),
              q(9, 'When it opened, the Paris system was the largest in Europe.', 'NOT GIVEN', 'Paragraph I says that "the Paris system captured the attention of the world and catalyzed steep growth in bikesharing systems" but does not say how it compared in size with other European systems.', 'I'),
            ],
          },
          {
            id: 'r119-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Approximately how many cities had bike-share schemes by 2022?', ['3,000', '3000', 'approximately 3,000', 'about 3,000'], 'Paragraph C: "By 2022, bike share schemes were offered in approximately 3,000 cities worldwide".', 'C'),
              q(11, 'In which Dutch national park can bicycles still be used free of charge?', 'Hoge Veluwe', 'Paragraph E: "at Hoge Veluwe National Park, where a set of bicycles may be used freely within the park".', 'E'),
              q(12, 'What did ByCylken riders have to pay before they could take a bike?', ['a refundable deposit', 'refundable deposit', 'a deposit'], 'Paragraph H: "Riders paid a refundable deposit at one of 100 special locking bike stands".', 'H'),
              q(13, 'Which company bought the Public Bike System Company in 2022?', 'Lyft', 'Paragraph I: "The PBSC was privatised in 2014 and was later acquired by Lyft in 2022."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
