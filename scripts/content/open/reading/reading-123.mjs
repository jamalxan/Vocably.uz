// Vocably Reading 123 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-123',
  title: 'Reading 123: Bukhara',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'bukhara', title: 'Bukhara: A City of Many Names', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r123-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.',
            bank: bank(['Imam Bukhari', 'Ubaidullah bin Ziad', 'Muhammad ibn Jafar Narshakhi', 'Rudaki', 'Genghis Khan', 'Sheikh Baha\' al-Din Naqshband', 'Agha Mohammad Khan Qajar']),
            questions: [
              q(1, 'described Bukhara as a Buddhist land governed by a woman on behalf of her child', 'B', 'Paragraph D: "Ubaidullah bin Ziad, who noted Bukhara to be a Buddhist country with Buddhist monasteries ruled by a queen regent acting on behalf of her son".', 'D'),
              q(2, 'recorded the many different names the city has been given', 'C', 'Paragraph E: "Muhammad ibn Jafar Narshakhi in his History of Bukhara (completed AD 943–44) mentions: Bukhara has many names."', 'E'),
              q(3, 'composed a celebrated poem in praise of the city', 'D', 'Paragraph G: "Rudaki, the father of Persian poetry, was born and raised in Bukhara and wrote his most famous poem about the beauty of the city."', 'G'),
              q(4, 'tried to take the city shortly before being killed', 'G', 'Paragraph J: "Agha Mohammad Khan Qajar was the last Persian emperor who attempted to capture the city just before his assassination".', 'J'),
              q(5, 'had a key role in shaping a Sufi order', 'F', 'Paragraph I: Sheikh Baha\' al-Din Naqshband "was a central figure in the development of the Naqshbandi Sufi order".', 'I'),
            ],
          },
          {
            id: 'r123-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Bukhara has the largest population of any city in Uzbekistan.', 'FALSE', 'Paragraph A: "Bukhara is the seventh-largest city in Uzbekistan by population".', 'A'),
              q(7, 'In ancient times the name Bukhara referred to the whole oasis rather than to the city.', 'TRUE', 'Paragraph C: "The whole oasis was called Bukhara in ancient times, and probably only in the tenth century was it finally transferred to the city."', 'C'),
              q(8, 'A large number of Buddhist objects have survived in the city.', 'FALSE', 'Paragraph D: "Very few artifacts related to Buddhism have survived into the modern day in the city."', 'D'),
              q(9, 'The Kalyan Minaret was the tallest structure built by the Karakhanids.', 'NOT GIVEN', 'Paragraph H says "The Karakhanids built many buildings in Bukhara: the Kalyan Minaret, the Magok-i-Attari Mosque, palaces and parks" but says nothing about their height.', 'H'),
            ],
          },
          {
            id: 'r123-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>From the Samanids to the slave trade</strong></p><p>By 850 Bukhara was the capital of the Samanid Empire, whose rulers claimed to be descended from a Sasanian general called {{q10}}. Far from Baghdad, the Samanids revived Persian culture, and the city became famous for its many {{q11}}. In 1220 the city was besieged for {{q12}} days and then completely destroyed. In later centuries Bukhara and Khiva became notorious as centres of the {{q13}}.</p>',
            questions: [
              q(10, null, 'Bahram Chobin', 'Paragraph G: "The Samanids claimed descent from Bahram Chobin, the Sasanian general and king."', 'G'),
              q(11, null, 'libraries', 'Paragraph G: "Bukhara was a major intellectual center of the Islamic world, renowned for its numerous libraries".', 'G'),
              q(12, null, ['15', 'fifteen'], 'Paragraph H: "Genghis Khan besieged Bukhara for 15 days in 1220, followed by its complete destruction."', 'H'),
              q(13, null, 'slave trade', 'Paragraph I: "the cities of Bukhara and Khiva were known as major centers of the slave trade".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
