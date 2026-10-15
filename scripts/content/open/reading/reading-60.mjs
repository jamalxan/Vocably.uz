// Vocably Reading 60 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-60',
  title: 'Reading 60: The History of Sign Language',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sign-language', title: 'Speaking with the Hands: The History of Sign Language', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r60-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a reference to the sign language with the greatest number of users', 'D', 'Paragraph D: "As of 2021, Indo-Pakistani Sign Language is the most widely used sign language in the world".', 'D'),
              q(2, 'an explanation of why little is known about sign languages before the nineteenth century', 'E', 'Paragraph E: "Most of what is known about pre-19th-century sign languages is limited to the manual alphabets (fingerspelling systems) that were invented to facilitate the transfer of words from a spoken language to a sign language".', 'E'),
              q(3, 'examples of hearing people who use sign language', 'B', 'Paragraph B: "it is also used by hearing individuals, such as those with deaf family members including children of deaf adults".', 'B'),
              q(4, 'a mention of a sign language that was already in use before Europeans arrived in a region', 'G', 'Paragraph G: "a fully formed sign language already in use by the time of the Europeans\' arrival there".', 'G'),
            ],
          },
          {
            id: 'r60-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 5-9) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.',
            bank: bank(['Plato', 'Pedro Ponce de León', 'Juan Pablo Bonet', 'John Bulwer', 'George Dalgarno', 'Cabeza de Vaca', 'the author of Digiti Lingua']),
            questions: [
              q(5, 'described a deaf man whose wife could communicate with him by touch', 'D', 'Paragraph I: "In 1648, John Bulwer described" a deaf man "whose wife could converse with him easily, even in the dark through the use of tactile signing".', 'I'),
              q(6, 'wrote what is regarded as the first modern study of the sound system of sign language', 'C', 'Paragraph H: "It is considered the first modern treatise of sign language phonetics, setting out a method of oral education for deaf people and a manual alphabet."', 'H'),
              q(7, 'published his own approach to the education of deaf people', 'E', 'Paragraph J: "In 1680, George Dalgarno published Didascalocophus, or, The deaf and dumb mans tutor, in which he presented his own method of deaf education".', 'J'),
              q(8, 'suggested that the manual alphabet could be used simply for fun', 'G', 'Paragraph K: "He suggested that the manual alphabet could also be used by mutes, for silence and secrecy, or purely for entertainment."', 'K'),
              q(9, 'created a manual alphabet that was based on signs used in monasteries', 'B', 'Paragraph F: "Monastic sign languages were the basis for the first known manual alphabet used in deaf schools, developed by Pedro Ponce de León."', 'F'),
            ],
          },
          {
            id: 'r60-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The two-handed alphabet</strong></p><p>The {{q10}} of Dalgarno\'s alphabet are still used today in the alphabets of British Sign Language, Auslan and New Zealand Sign Language. The first known printed pictures of the consonants appeared in 1698 in a pamphlet called Digiti Lingua, whose anonymous author was himself unable to {{q11}}. {{q12}} of the letters in the pamphlet can be traced back to earlier alphabets, and 17 letters of the present-day two-handed alphabet appear among the two sets of {{q13}} handshapes that it illustrates.</p>',
            questions: [
              q(10, null, 'vowels', 'Paragraph K: "The vowels of this alphabet have survived in the modern alphabets used in British Sign Language, Auslan and New Zealand Sign Language."', 'K'),
              q(11, null, 'speak', 'Paragraph K: "a pamphlet by an anonymous author who was himself unable to speak".', 'K'),
              q(12, null, ['Nine', '9'], 'Paragraph K: "Nine of its letters can be traced to earlier alphabets".', 'K'),
              q(13, null, ['26', 'twenty-six'], 'Paragraph K: "17 letters of the modern two-handed alphabet can be found among the two sets of 26 handshapes depicted".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
