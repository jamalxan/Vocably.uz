// Vocably Reading 61 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-61',
  title: 'Reading 61: The Paralympic Games',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'paralympic-games', title: 'The Paralympic Games', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r61-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'examples of competitors with disabilities who took part in the Olympics before the Paralympics existed', 'E', 'Paragraph E: "Athletes with disabilities did compete at the Olympic Games prior to the advent of the Paralympics".', 'E'),
              q(2, 'a list of the kinds of impairment that make an athlete eligible to compete', 'D', 'Paragraph D: "The allowable disabilities are divided into ten eligible impairment types".', 'D'),
              q(3, 'a reference to where future torch relays will start', 'G', 'Paragraph G: "future Paralympic torch relays will officially begin in Stoke Mandeville".', 'G'),
              q(4, 'how the first official Paralympic Games were paid for', 'H', 'Paragraph H: the Games "were financed almost entirely by Maglio\'s employer, the Workers National Accident Insurance Fund of Italy".', 'H'),
              q(5, 'an agreement between two organisations that has since been extended', 'I', 'Paragraph I: "formalized in an agreement between the International Paralympic Committee (IPC) and the International Olympic Committee (IOC) in 2001" and later "extended their contract to 2032".', 'I'),
            ],
          },
          {
            id: 'r61-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Games for deaf athletes were established before the first Paralympic-style event.', 'TRUE', 'Paragraph C: "the Deaflympics held since 1924 are exclusive for deaf athletes"; Paragraph B says the Paralympics began in 1948.', 'C'),
              q(7, 'Lis Hartel won the top prize in her equestrian event in 1952.', 'FALSE', 'Paragraph E: she "won a silver medal in the dressage event in the 1952 Summer Olympics", not gold.', 'E'),
              q(8, 'Wheelchair athletes made up the majority of competitors at the 1976 Summer Games.', 'NOT GIVEN', 'Paragraph H says "athletes with different disabilities were included for the first time at a Summer Paralympics" and gives a total of 1,600 athletes, but gives no breakdown of competitors by type of disability.', 'H'),
              q(9, 'The 1992 Winter Paralympics shared competition venues with the Winter Olympics.', 'FALSE', 'Paragraph I: "the 1992 Winter Paralympics used different competition venues than those used for the Olympic Games".', 'I'),
            ],
          },
          {
            id: 'r61-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Milestones in the Paralympic movement</strong></p><ul><li><strong>Rome, 1960</strong> – first official Games; {{q10}} competitors from 23 countries</li><li>early Games restricted to athletes who used {{q11}}</li><li><strong>1976 Summer Games</strong> – wider range of disabilities admitted; {{q12}} athletes from 40 countries</li><li><strong>Seoul, 1988</strong> – Paralympics held immediately after the Olympics in the same {{q13}}, sharing most of the venues</li></ul>',
            questions: [
              q(10, null, ['400', 'four hundred'], 'Paragraph H: "Four hundred athletes from 23 countries competed at the 1960 Games."', 'H'),
              q(11, null, 'wheelchairs', 'Paragraph H: "The Games were initially open only to athletes in wheelchairs".', 'H'),
              q(12, null, ['1,600', '1600'], 'Paragraph H: "the 1976 Summer Games expanded to 1,600 athletes from 40 countries".', 'H'),
              q(13, null, ['host city', 'city'], 'Paragraph I: "held directly after the 1988 Summer Olympics, in the same host city, and using the majority of the venues".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
