// Vocably Listening 133 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-133',
  title: 'Listening 133: The Many Meanings of Season',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'tis-the-season',
        contextText: 'You will hear a talk about the different ways English speakers use the word "season".',
        questionGroups: [
          {
            id: 'l133-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Uses of the word "season"</strong></p><ul><li>Washington, D.C. has four seasons; some parts of the US do not</li><li>warmer, lighter days: the {{q1}} season begins for some plants</li><li>colder, darker days: the {{q2}} season begins for some animals</li><li>weather-only seasons: rainy and dry seasons, {{q3}} season in parts of the US, monsoon seasons</li><li>December is a busy {{q4}} season – a time to take a break from work</li><li>"\'Tis the season": e.g. giving a co-worker a big box of homemade {{q5}}</li></ul>',
            questions: [
              q(1, null, 'growing', 'The speaker says "when the weather becomes warmer and days are lighter longer, the growing season begins for some plants".'),
              q(2, null, 'hibernation', 'The speaker says "When the weather gets colder and the days darker, the hibernation season begins for some animals."'),
              q(3, null, 'tornado', 'The speaker says "Some parts of the U.S. have tornado season."'),
              q(4, null, 'holiday', 'The speaker says "December is a busy holiday season in many parts of the world."'),
              q(5, null, 'cookies', 'The speaker says "let\'s say I give a co-worker a big box of homemade cookies".'),
            ],
          },
          {
            id: 'l133-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the speaker mean by "open season on shopping deals"?', ['The shops are closed for the holiday.', 'Deals are being hunted and targeted by shoppers.', 'Prices rise sharply before Christmas.', 'Only certain people are allowed to shop.'], 'B', 'The speaker says "Open season on something means that it is being hunted, targeted, or in this case … bought."'),
              mc(7, 'Where does the term "open season" probably come from?', ['sport', 'travel', 'farming', 'hunting'], 'D', 'The speaker says "This term probably comes from hunting."'),
              mc(8, 'Why does the speaker recommend travelling off-season?', ['The weather is usually better.', 'It is easier to find cheap flights, hotels and rental cars.', 'Beaches are more popular then.', 'There are fewer rules for tourists.'], 'B', 'The speaker says "If few people are traveling, it is a good time to find cheap air travel, hotels, and rental cars."'),
            ],
          },
          {
            id: 'l133-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'People with allergies probably dislike hay fever season or ______ season.', 'allergy', 'The speaker says "people with allergies probably do not like hay fever season or allergy season".'),
              q(10, 'Starting a new career or starting ______ is one of the different seasons of life.', 'retirement', 'The speaker says "starting new careers or starting retirement. These are all different seasons of life."'),
            ],
          },
        ],
      }),
    ],
  },
};
