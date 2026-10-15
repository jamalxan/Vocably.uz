// Vocably Listening 98 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-98',
  title: 'Listening 98: How the Turkey Got Its Name',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'thanksgiving-turkey-name-around-the-world',
        contextText: 'You will hear a talk about why the Thanksgiving bird is called a turkey in English and what it is called in other languages.',
        questionGroups: [
          {
            id: 'l98-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'When did "turkey" first appear in English as the name of a bird?', ['in ancient times', 'in the mid-1500s', 'in the 1700s', 'in the 1800s'], 'B', 'The speaker says the word "first appeared in the English language" in the mid-1500s.'),
              mc(2, 'Who brought the guinea fowl to Europe?', ['Turkish traders', 'Portuguese traders', 'English sailors', 'French farmers'], 'B', 'The speaker says "Portuguese traders brought the guinea fowl to Europe through North Africa."'),
              mc(3, 'According to Orin Hargraves, why did Europeans give the North American bird the name "turkey"?', ['It was shipped to Europe from Turkey.', 'They mistook it for the guinea fowl, then called the turkey cock.', 'Turkish traders were the first to sell it.', 'It was named after a town in Turkey.'], 'B', 'Hargraves says some Europeans "thought that it was the guinea fowl, which at that time was called the turkey cock".'),
            ],
          },
          {
            id: 'l98-match', type: 'matching_features', bankReusable: true,
            instructionHtml: 'What does the name for the bird refer to in each language? Choose the correct letter, <strong>A-F</strong>. You may use any letter more than once.',
            bank: bank(['India', 'Peru', 'a western chicken', 'an elephant chicken', 'Turkey', 'a big bird']),
            questions: [
              q(4, 'Turkish', 'A', 'The speaker says "The Turkish, for their part, call turkey hindi, the Turkish name for India."'),
              q(5, 'French', 'A', 'The speaker says "The French call it dinde, a name that also connects the bird to India."'),
              q(6, 'Portuguese', 'B', 'The speaker says "In Portuguese, the same bird is called Peru, after the South American nation."'),
              q(7, 'Vietnamese', 'C', 'The speaker says "The Vietnamese word for the bird is ... western chicken".'),
              q(8, 'Burmese', 'D', 'The speaker says of the Burmese word "The name translates to elephant chicken in English."'),
            ],
          },
          {
            id: 'l98-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(9, 'Abdulla Kawer says the Dari name reflects the ______ of the meal.', 'size', 'The speaker reads his words: "here in Afghanistan this name represents the size of this delicious meal".'),
              q(10, 'He believes a descriptive name is better than a ______ name.', 'country', 'The speaker says he thinks the descriptive name is "better than a country name".'),
            ],
          },
        ],
      }),
    ],
  },
};
