// Vocably Reading 15 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-15',
  title: 'Reading 15: The Marathon',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'marathon', title: 'The Marathon: From Legend to Olympic Event', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r15-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the passage say about most people who run marathons?', [
                'They compete in wheelchair divisions.',
                'They are not professional athletes.',
                'They complete the course by walking.',
                'They take part in several marathons a year.',
              ], 'B', 'Paragraph A: "the vast majority of competitors being recreational athletes".', 'A'),
              mc(2, 'According to the passage, the marathon is unusual because it', [
                'was the first event held at the 1896 Olympics.',
                'has had a fixed distance since 1896.',
                'is the only running road race held at both major championships.',
                'is always run on trails rather than roads.',
              ], 'C', 'Paragraph B: "It is the only running road race included in both championship competitions".', 'B'),
              mc(3, 'According to the legend, why did Pheidippides run to Athens?', [
                'to ask the Spartans for military help',
                'to stop the Persians reaching the city and claiming victory',
                'to deliver weapons to the assembly',
                'to report that the Greek army had been defeated',
              ], 'B', 'Paragraph C: "He interpreted this as an attempt by the defeated Persians to rush into the city to claim a false victory or simply raid".', 'C'),
              mc(4, 'Why is Lucian\'s version of the story treated with caution?', [
                'It was written in the first century AD.',
                'It names Thersipus as the runner.',
                'It is written humorously and uses a different name for the runner.',
                'It was based on a lost work by Plutarch.',
              ], 'C', 'Paragraph D: "its historical veracity is disputed based on its tongue-in-cheek writing and the runner being referred to as Philippides and not Pheidippides".', 'D'),
            ],
          },
          {
            id: 'r15-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'Herodotus describes a messenger running from Marathon to Athens.', 'FALSE', 'Paragraph E: "Herodotus makes no mention of a messenger sent from Marathon to Athens".', 'E'),
              q(6, 'According to Herodotus, the Athenian army got back to Athens on the day of the battle.', 'TRUE', 'Paragraph E: the army "marched quickly back from the battle to Athens, arriving the same day".', 'E'),
              q(7, 'The modern road from Marathon to Athens passes to the north of Mount Pentelicus.', 'FALSE', 'Paragraph F: the mountain could be passed "either to the north or to the south. The latter and more obvious route is followed by the modern Marathon-Athens highway".', 'F'),
              q(8, 'The shorter route over the mountain begins with a steep climb.', 'TRUE', 'Paragraph F: "This route is slightly shorter, 35 kilometres (22 mi), but includes a very steep climb over the first 5 kilometres".', 'F'),
              q(9, 'Spyridon Louis trained for the 1896 race by carrying water.', 'NOT GIVEN', 'Paragraph G describes him only as "Spyridon Louis, a Greek water-carrier"; nothing is said about how he trained.', 'G'),
            ],
          },
          {
            id: 'r15-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In which year was the length of the marathon finally fixed?', '1921', 'Paragraph B: "The distance did not become standardized until 1921."', 'B'),
              q(11, 'Approximately how long was the Marathon-Athens route when the Olympics were revived?', ['40 kilometres', '40 km', '40', '25 miles', '25 mi'], 'Paragraph F: "As it existed when the Olympics were revived in 1896, this route was approximately 40 kilometres (25 mi) long."', 'F'),
              q(12, 'Who first suggested including a marathon in the modern Olympic Games?', ['Michel Bréal', 'Bréal', 'Michel Breal', 'Breal'], 'Paragraph G: "The idea of a marathon race came from Michel Bréal, who wanted the event to feature in the first modern Olympic Games in 1896 in Athens."', 'G'),
              q(13, 'Who won the men\'s marathon at the 2004 Olympics?', ['Stefano Baldini', 'Baldini'], 'Paragraph G: "That men\'s marathon was won by Italian Stefano Baldini in 2 hours 10 minutes and 55 seconds".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
