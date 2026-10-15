// Vocably Reading 7 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-7',
  title: 'Reading 7: The Monarch Butterfly',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'monarch-butterfly', title: 'Naming the Monarch', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r7-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Carl Linnaeus', 'Jan Krzysztof Kluk', 'Samuel Hubbard Scudder', 'Robert Michael Pyle', 'Pieter Cramer', 'William D\'Urban']),
            questions: [
              q(1, 'proposed a name that reflected the insect\'s size and the extent of its territory', 'C', 'Paragraph D: "In 1874, entomologist Samuel Hubbard Scudder suggested naming the butterfly" the Monarch, citing "its large size and the notion that it" rules a vast domain.', 'D'),
              q(2, 'was the first to describe the southern monarch', 'E', 'Paragraph I: "the southern monarch, was described by Pieter Cramer in 1775".', 'I'),
              q(3, 'made the monarch the type species of a newly created genus', 'B', 'Paragraph C: "In 1780, Jan Krzysztof Kluk used the monarch as the type species for a new genus, Danaus."', 'C'),
              q(4, 'thought the genus name was better explained by a woman whom Zeus visited as golden rain', 'D', 'Paragraph G: "Robert Michael Pyle suggested Danaus is a masculinized version of Danaë" ... "to whom Zeus came as a shower of gold".', 'G'),
              q(5, 'originally placed the species in the genus Papilio', 'A', 'Paragraph C: "The species was originally described by Carl Linnaeus in his Systema Naturae of 1758 and placed in the genus Papilio."', 'C'),
            ],
          },
          {
            id: 'r7-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(6, 'a remark about how poorly the monarch pollinates its main food plant', 'A', 'Paragraph A: "it is not an especially effective pollinator of milkweeds".', 'A'),
              q(7, 'a reference to the study of the monarch\'s complete genetic code', 'K', 'Paragraph K: "The monarch was the first butterfly to have its genome sequenced."', 'K'),
              q(8, 'the suggestion that two present-day monarch species were once a single species', 'I', 'Paragraph I: "The South American monarch and the North American monarch may have been one species at one time."', 'I'),
              q(9, 'a figure for the proportion of unusually coloured monarchs in one place', 'J', 'Paragraph J: "The population level of the white morph in Oahu is nearing 10%."', 'J'),
              q(10, 'the reason why an earlier division of the genus was rejected', 'E', 'Paragraph E: "they concluded that the earlier classification was unsustainable and should be abandoned".', 'E'),
            ],
          },
          {
            id: 'r7-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'The viceroy can be told apart from the monarch by its smaller size and by an additional ______ on each hindwing.', 'black stripe', 'Paragraph A: the viceroy "is markedly smaller and has an extra black stripe across each hindwing".', 'A'),
              q(12, 'Monarchs living west of the Rockies usually spend the winter in ______, although some have been found in Mexico.', 'southern California', 'Paragraph B: "The western North American population of monarchs west of the Rocky Mountains often migrates to sites in southern California".', 'B'),
              q(13, 'In Homeric Greek, the name Plexippus means \'rider\' or ______.', 'charioteer', 'Paragraph F: "In Homeric Greek, his name means \'one who urges on horses\', i.e., \'rider\' or \'charioteer\'."', 'F'),
              q(14, 'Some scientists believe the southern monarch became a separate population about ______ years ago.', ['two million', '2 million'], 'Paragraph I: "Some researchers believe the southern monarch separated from the monarch\'s population some two million years ago".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
