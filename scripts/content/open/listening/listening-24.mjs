// Vocably Listening 24 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-24',
  title: 'Listening 24: Digital IDs in Google Wallet',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'tech-tip-google-wallet-now-creates-digital-ids-from-photos',
        contextText: 'You will hear a technology report about a new tool for storing cards and documents on a phone.',
        questionGroups: [
          {
            id: 'l24-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Google Wallet\'s new tool</strong></p><ul><li>first announced in {{q1}}, together with Android 15</li><li>credit cards in a digital wallet are linked to the {{q2}} that issue them</li><li>supporters say digital wallets mean people carry fewer {{q3}}</li><li>new kinds of documents: gym memberships, medical or {{q4}} cards</li><li>a digital copy is made by taking a {{q5}} of the document or a screen capture</li></ul>',
            questions: [
              q(1, null, 'May', 'The speaker says "It was first announced in May along with other changes to the latest operating system".'),
              q(2, null, 'banks', 'The speaker says "Credit cards in wallets are linked directly to the banks that offer them".'),
              q(3, null, 'cards', 'The speaker says "this reduces the need to carry a lot of cards in a physical wallet".'),
              q(4, null, 'insurance', 'The speaker says "such as gym memberships and medical or insurance cards".'),
              q(5, null, ['picture', 'photo'], 'The speaker says "created by the user taking a picture of the physical document".'),
            ],
          },
          {
            id: 'l24-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'How does Google Wallet turn the photo into a new pass?', ['It reads a barcode on every document.', 'It uses artificial intelligence.', 'It sends the photo to the card issuer.', 'It asks the user to type in the details.'], 'B', 'The speaker says "Google Wallet then uses artificial intelligence" to use information from the photo.'),
              mc(7, 'What is the name of the new category in Google Wallet?', ['Payment Card', 'Transit Pass', 'ID Card', 'Everything Else'], 'D', 'The speaker says "The new Google Wallet has a new category, called Everything Else".'),
              mc(8, 'Where is the data from official digital documents stored?', ['on Google servers', 'only on the device', 'with the state government', 'in the Android Authority database'], 'B', 'The speaker says "data contained in official digital documents is only saved on the device as an extra security measure".'),
            ],
          },
          {
            id: 'l24-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Which organisation accepts state digital IDs at many major airports?', ['TSA', 'Transportation Security Administration'], 'The speaker says "The Transportation Security Administration (TSA) even accepts this form of state ID at many major" airports.'),
              q(10, 'Which technology website reported that Google Wallet will soon create digital passports?', 'Android Authority', 'The speaker says "Online technology website Android Authority recently reported Google Wallet will soon be equipped" to create digital passports.'),
            ],
          },
        ],
      }),
    ],
  },
};
