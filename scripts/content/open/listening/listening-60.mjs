// Vocably Listening 60 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-60',
  title: 'Listening 60: Pronunciation Apps',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'try-these-apps-to-improve-your-pronunciation',
        contextText: 'You will hear a talk about four apps for practising American English pronunciation.',
        questionGroups: [
          {
            id: 'l60-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What happened to the speaker in a cafe in France?', ['A server could not understand a word she said.', 'She was unable to read the menu.', 'She was given the wrong dish.', 'She forgot the French word for egg.'], 'A', 'The speaker says "When I said the word" egg in French, "the server did not understand me".'),
              mc(2, 'What does the speaker say about pronunciation apps in general?', ['They can replace a speaking partner completely.', 'Most are imperfect but may still help.', 'They are too expensive for most learners.', 'They only teach British English.'], 'B', 'The speaker says "While most such apps are imperfect, they may support your overall efforts to be better understood in English."'),
            ],
          },
          {
            id: 'l60-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['App', 'Details', 'Cost'],
              [
                ['Say It: Pronunciation', 'developed by {{q3}} University Press; more than {{q4}} words to practise', 'free version limited; paid version $6.99'],
                ['ELSA Speak', 'uses {{q5}} intelligence; includes a speaking test with a score', 'free trial of {{q6}} days, then paid'],
                ['Accent Training', 'the iPhone version offers {{q7}} practices', 'free, but with ads'],
                ['English Pronunciation Tutor', 'useful for specific sounds that cause trouble', 'free for the first {{q8}} only'],
              ],
              'Four pronunciation apps',
            ),
            questions: [
              q(3, null, 'Oxford', 'The speaker says "It was developed by Oxford University Press".'),
              q(4, null, ['35,000', '35000'], 'The speaker says users "can practice more than 35,000 words".'),
              q(5, null, 'artificial', 'The speaker says the app "uses artificial intelligence, or AI, to act as your own American English pronunciation teacher".'),
              q(6, null, ['7', 'seven'], 'The speaker says "ELSA Speak has a free 7-day trial version that lets you take the speaking test".'),
              q(7, null, ['16', 'sixteen'], 'The speaker says "The iPhone version offers 16 practices."'),
              q(8, null, 'unit', 'The speaker says "The app is free for the first unit only."'),
            ],
          },
          {
            id: 'l60-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(9, 'The speaker advises aiming for better ______ rather than perfection.', 'communication', 'The speaker says "Aim for better communication rather than perfection."'),
              q(10, 'Many Americans actually ______ the accents of English learners.', 'admire', 'The speaker says "many Americans, in fact, admire the accents of English learners".'),
            ],
          },
        ],
      }),
    ],
  },
};
