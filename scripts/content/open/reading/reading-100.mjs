// Vocably Reading 100 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-100',
  title: 'Reading 100: The Electrical Telegraph',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'electrical-telegraph', title: 'The Electrical Telegraph: Messages at the Speed of Electricity', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r100-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.<br/><strong>NB</strong> There are two names you will not need.',
            bank: bank(['Samuel Morse', 'Guglielmo Marconi', 'Georges-Louis Le Sage', 'Alessandro Volta', 'Samuel Thomas von Sömmering', 'Francisco Salva Campillo', 'the writer known as C.M.']),
            questions: [
              q(1, 'devised a system whose code, in a modified form, became the international standard', 'A', 'Paragraph B: "In 1865, the Morse system became the standard for international communication, using a modified form of Morse\'s code".', 'B'),
              q(2, 'began work on communication by radio waves', 'B', 'Paragraph D: Marconi\'s wireless telegraphy was "the first means of radiowave telecommunication, which he began in 1894".', 'D'),
              q(3, 'built a telegraph that worked only over a very short distance inside his house', 'C', 'Paragraph H: Le Sage\'s telegraph had a range that "was only between two rooms of his home".', 'H'),
              q(4, 'invented a device that supplied a steady flow of electricity', 'D', 'Paragraph I: "Alessandro Volta invented the voltaic pile, providing a continuous current of electricity for experimentation".', 'I'),
              q(5, 'constructed a telegraph based on another man\'s earlier design', 'E', 'Paragraph J: von Sömmering\'s telegraph of 1809 was "based on an earlier 1804 design by Spanish polymath and scientist Francisco Salva Campillo".', 'J'),
            ],
          },
          {
            id: 'r100-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The earliest needle telegraphs required several wires between stations.', 'TRUE', 'Paragraph B: "Early needle telegraph models used multiple needles, thus requiring multiple wires to be installed between stations."', 'B'),
              q(7, 'By the late nineteenth century, people in most developed countries could pay to send a telegram to anyone in the country.', 'TRUE', 'Paragraph C: "most developed nations had commercial telegraph networks with local telegraph offices in most cities and towns, allowing the public to send messages (called telegrams) addressed to any person in the country, for a fee".', 'C'),
              q(8, 'The first underwater telegraph cable linked Britain and France.', 'NOT GIVEN', 'Paragraph D says only that "Beginning in 1850, submarine telegraph cables allowed for the first rapid communication between people on different continents"; it does not name the countries connected by the first cable.', 'D'),
              q(9, 'The telephone was the main reason why telegraph networks finally became obsolete.', 'FALSE', 'Paragraph E: the telephone "pushed telegraphy into only a few specialist uses", but it was "The rise of the Internet and email in the 1990s" that "largely made dedicated telegraphy networks obsolete".', 'E'),
              q(10, 'Electrostatic telegraphs were developed into a practical system of communication in Europe.', 'FALSE', 'Paragraph G: they "were abandoned as being impractical and were never developed into a useful communication system".', 'G'),
            ],
          },
          {
            id: 'r100-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The 1753 proposal</strong></p><p>In 1753 an unnamed contributor to a Scottish {{q11}} proposed a telegraph based on static electricity. The design used a separate wire for every {{q12}} of the alphabet; each wire in turn was connected to an electrostatic machine, and at the receiving end the message was read by watching the movement of small balls made of {{q13}}. The letter was signed with the initials C.M. and was sent from the town of {{q14}}.</p>',
            questions: [
              q(11, null, 'magazine', 'Paragraph G: "an anonymous writer in the Scots Magazine suggested an electrostatic telegraph".', 'G'),
              q(12, null, 'letter', 'Paragraph G: "Using one wire for each letter of the alphabet".', 'G'),
              q(13, null, 'pith', 'Paragraph G: "observing the deflection of pith balls at the far end".', 'G'),
              q(14, null, 'Renfrew', 'Paragraph G: "the letter was signed C.M. and posted from Renfrew".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
