// Vocably Reading 166 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-166',
  title: 'Reading 166: Morse Code',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'morse-code', title: 'Dots and Dashes: The Story of Morse Code', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r166-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person or people, <strong>A-G</strong>.',
            bank: bank(['Samuel Morse', 'Alfred Vail', 'Friedrich Gerke', 'Hans Christian Ørsted', 'William Sturgeon', 'Cooke and Wheatstone', 'Gauss and Weber']),
            questions: [
              q(1, 'produced the version of the code that was taken up in Europe', 'C', 'Paragraph A: "Friedrich Gerke simplified Vail\'s code to produce the code adopted in Europe".', 'A'),
              q(2, 'invented the electromagnet', 'E', 'Paragraph F: "the invention of the electromagnet by William Sturgeon in 1824".', 'F'),
              q(3, 'gave the shortest signals to the characters used most often', 'B', 'Paragraph D: "Vail designed the original alphabetic code so the duration of each symbol was approximately inverse to the frequency that the character it represents occurs in English text".', 'D'),
              q(4, 'demonstrated the first telegraph to be used commercially', 'F', 'Paragraph G: Cooke and Wheatstone "demonstrated it on the London and Birmingham Railway, making it the first commercial telegraph".', 'G'),
              q(5, 'used a code in which the words were of different lengths', 'G', 'Paragraph G: "Carl Friedrich Gauss and Wilhelm Eduard Weber (1833) as well as Carl August von Steinheil (1837) used codes with varying word lengths for their telegraph systems."', 'G'),
            ],
          },
          {
            id: 'r166-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Besides letters and numerals, the ITU code includes punctuation and procedural signals known as ______.', 'prosigns', 'Paragraph B: "some punctuation and messaging procedural signals (prosigns)".', 'B'),
              q(7, 'A dah lasts ______ times as long as a dit.', ['three', '3'], 'Paragraph B: "The duration of a dah is three times the duration of a dit."', 'B'),
              q(8, 'Words are separated by a silence equal to ______ dits.', ['seven', '7'], 'Paragraph B: "words are separated by a space equal to seven dits".', 'B'),
              q(9, 'Morse alphabets for languages with more than 26 letters were mostly created by ______ of existing codes.', 'transliteration', 'Paragraph C: "Morse alphabets have been developed for those, largely by transliteration of existing codes".', 'C'),
              q(10, 'In English, the letter E has the shortest code because it is the ______ letter.', 'most common', 'Paragraph D: "the most common letter in English, E, has the shortest code – a single dit".', 'D'),
            ],
          },
          {
            id: 'r166-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'What was the main drawback of the single-needle telegraph?', ['It was easily damaged in use.', 'The operator could not watch the needle and write at the same time.', 'It could not be used over long distances.', 'Two operators were needed to receive a message.'], 'B', 'Paragraph F: "it was slow because the receiving operator had to alternate between looking at the needle and writing down the message".', 'F'),
              mc(12, 'How were messages on the single-needle device made audible?', ['by adding a bell to the receiver', 'by connecting the device to a loudspeaker', 'by fitting two stops made of different materials', 'by making the needle move more quickly'], 'C', 'Paragraph F: "By making the two clicks sound different (by installing one ivory and one metal stop), transmissions on the single needle device became audible as well as visible".', 'F'),
              mc(13, 'What did Cooke and Wheatstone build in 1841?', ['a telegraph that printed letters', 'the first telegraph used on a railway', 'a more powerful electromagnet', 'a receiver that marked paper tape'], 'A', 'Paragraph G: "In 1841, Cooke and Wheatstone built a telegraph that printed the letters from a wheel of typefaces struck by a hammer."', 'G'),
              mc(14, 'In Morse\'s original receiver, what happened when the electric current stopped?', ['The clockwork stopped moving the paper tape.', 'A spring pulled the stylus away from the tape.', 'The electromagnet pressed the stylus onto the tape.', 'The tape was automatically cut.'], 'B', 'Paragraph I: "When the current was interrupted, a spring retracted the stylus and that portion of the moving tape remained unmarked."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
