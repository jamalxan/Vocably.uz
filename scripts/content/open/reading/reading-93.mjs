// Vocably Reading 93 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-93',
  title: 'Reading 93: The Baobab Tree',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'adansonia', title: 'The Baobab: The Upside-Down Tree', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r93-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'a suggested explanation for an unexplained wave of tree deaths', 'C', 'Paragraph C: "some have speculated that the cause may have been mass dehydration".', 'C'),
              q(2, 'the reason why counting rings cannot reveal how old a baobab is', 'D', 'Paragraph D: "rings are not always formed annually and so cannot be used to determine the age of individual trees".', 'D'),
              q(3, 'a species whose fruit splits open before it falls', 'H', 'Paragraph H: "A. gibbosa is the only species with fruit that crack while still on the tree".', 'H'),
              q(4, 'a possible origin of the word "baobab"', 'I', 'Paragraph I: "They were called Bahobab, possibly from the Arabic".', 'I'),
              q(5, 'a reference to the animals that pollinate most baobab species', 'G', 'Paragraph G: "Most Adansonia species are pollinated by bats."', 'G'),
            ],
          },
          {
            id: 'r93-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Genetic and ecological research indicates that the genus Adansonia first arose in ______.', 'Madagascar', 'Paragraph A: "A genomic and ecological analysis further suggests that the genus itself originated in Madagascar."', 'A'),
              q(7, 'A baobab flower remains capable of reproduction for no longer than ______.', '15 hours', 'Paragraph B: the flowers "are reproductive for a maximum of 15 hours".', 'B'),
              q(8, 'Because the width of the trunk varies with rainfall, it is believed that the tree may store ______ in it.', 'water', 'Paragraph D: "Tree diameter fluctuates with rainfall so it is thought that water may be stored in the trunk."', 'D'),
              q(9, 'Baobabs drop their leaves during the ______.', 'dry season', 'Paragraph F: "Baobabs are deciduous, shedding leaves during the dry season."', 'F'),
            ],
          },
          {
            id: 'r93-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'The opening of a baobab flower is too slow to be seen without special equipment.', 'FALSE', 'Paragraph B: "The flowers open around dusk with sufficiently rapid movement that is detectable by the naked eye."', 'B'),
              q(11, 'Adansonia gregorii frequently grows with more than one trunk.', 'TRUE', 'Paragraph E: Adansonia gregorii is "rarely getting to over 10 m (33 ft) tall and often with multiple trunks".', 'E'),
              q(12, 'Baobab seedlings always have compound leaves.', 'FALSE', 'Paragraph F: "seedlings and regenerating shoots may have simple leaves".', 'F'),
              q(13, 'Baobab flowers normally grow one at a time from each leaf axil.', 'TRUE', 'Paragraph G: "There is usually only a single flower in an axil, but sometimes flowers occur in pairs."', 'G'),
              q(14, 'Ibn Battuta\'s account of the baobab included a drawing of the tree.', 'NOT GIVEN', 'Paragraph I: "The earliest written reports of baobab are from a 14th-century travelogue by the Arab traveler Ibn Battuta." Nothing is said about a drawing; the first illustrations mentioned are those of Adanson.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
