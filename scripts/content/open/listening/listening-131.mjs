// Vocably Listening 131 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-131',
  title: "Listening 131: Pushing Someone's Buttons",
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'what-does-it-mean-to-push-someone-s-buttons',
        contextText: 'You will hear a talk about English expressions that use the word "button".',
        questionGroups: [
          {
            id: 'l131-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Buttons we push</strong></p><ul><li>young {{q1}} enjoy pushing buttons even when nothing happens</li><li>people\'s "buttons" are not physical – they trigger our {{q2}}</li><li>button-pushers upset others by raising {{q3}} subjects</li><li>example: a woman kept mentioning the speaker\'s old {{q4}}</li><li>pushing someone\'s buttons can also happen {{q5}}</li></ul>',
            questions: [
              q(1, null, 'children', 'The speaker says "Young children like to push buttons, even if nothing happens."'),
              q(2, null, 'feelings', 'The speaker says "Our buttons activate or trigger our feelings."'),
              q(3, null, 'sore', 'The speaker says "Button-pushers like to upset people by bringing up sore subjects."'),
              q(4, null, 'boyfriend', 'The speaker says "a woman I used to know always tried to push my buttons by bringing up an old boyfriend".'),
              q(5, null, 'accidentally', 'The speaker says "pushing someone\'s buttons can also happen accidentally".'),
            ],
          },
          {
            id: 'l131-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the speaker say about expressions such as "button your lip" and "button it"?', ['They are polite requests.', 'They are rude ways of telling someone to be quiet.', 'They are used only by children.', 'They refer to repairing clothes.'], 'B', 'The speaker says "If I tell someone to button their mouth, button their lip or to simply button it, I am telling them to shut up. Like I said, the expressions are rude."'),
              mc(7, 'Why does the speaker compare buttonholing a person to a buttonhole?', ['Both are very small.', 'Both are found on clothing.', 'Both trap something so it cannot escape.', 'Both are enjoyable.'], 'C', 'The speaker says "Like a button that has slipped into a buttonhole, they cannot escape."'),
              mc(8, 'When is the word "buttonhole" usually used?', ['when someone tells an amusing story', 'when someone talks for a long time about something you do not want to hear', 'when someone leaves a conversation early', 'when someone asks you for help'], 'B', 'The speaker says "usually, we use this term when someone talks to you for a long time about something you don\'t want to hear".'),
            ],
          },
          {
            id: 'l131-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'In the conversation, how long did Jen talk to the second speaker about her work project?', ['an hour', 'hour'], 'The second speaker says "Jen had me buttonholed for an hour about her work project."'),
              q(10, 'According to the first speaker, what is the best way to deal with a button-pusher?', ['not caring'], 'The first speaker says "Not caring is the best way to deal with a button-pusher."'),
            ],
          },
        ],
      }),
    ],
  },
};
