// Vocably Listening 124 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-124',
  title: 'Listening 124: Getting the Greenlight',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'what-does-it-mean-to-get-the-greenlight',
        contextText: 'You will hear a talk about the expressions "greenlight" and "red light", including a conversation between two co-workers.',
        questionGroups: [
          {
            id: 'l124-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Traffic lights and English</strong></p><ul><li>traffic lights usually have {{q1}} colours</li><li>yellow = go carefully and be ready to {{q2}}</li><li>"greenlight" = {{q3}} to go ahead with a project</li><li>very common in the film and {{q4}} industry, where projects need many resources</li></ul>',
            questions: [
              q(1, null, ['three', '3'], 'The speaker says "Typically, they have three colors: green, yellow, and red."'),
              q(2, null, 'stop', 'The speaker says "Yellow means proceed with care and be prepared to stop."'),
              q(3, null, 'permission', 'The speaker says "Greenlight means to have permission to go ahead with a project."'),
              q(4, null, ['theater', 'theatre'], 'The speaker says "This term is especially common in the film and theater industry."'),
            ],
          },
          {
            id: 'l124-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why did the company refuse to greenlight the friend\'s film at first?', ['The budget was too high.', 'He had to rewrite a large part of the script.', 'The main actor was not available.', 'The film was too long.'], 'B', 'The speaker says the company "refused to green-light production until he did a big rewrite on his script".'),
              mc(6, 'According to the first co-worker, how did the boss give the greenlight in the meeting?', ['She sent an email.', 'She signed a document.', 'She nodded her head.', 'She said yes out loud.'], 'C', 'The first speaker says "I saw her. She nodded her head!"'),
              mc(7, 'Why does the first co-worker think the boss\'s subtle way of approving projects is smart?', ['It saves time in meetings.', 'She can later deny that she agreed.', 'It keeps new projects secret.', 'It avoids extra paperwork.'], 'B', 'The first speaker says "If it doesn\'t work out, she can say she never gave consent."'),
              mc(8, 'What does the second co-worker want before starting the project?', ['a wink and a nod', 'a formal meeting with the boss', 'extra resources', 'something in writing'], 'D', 'The second speaker says "maybe something in writing" like an email.'),
            ],
          },
          {
            id: 'l124-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'During the pandemic, many companies put a red light on all unnecessary ______.', 'costs', 'The speaker says "During the pandemic, many companies put a red light on all unnecessary costs."'),
              q(10, 'When "red light" is used as a warning, another expression with the same meaning is "red ______".', 'flag', 'The speaker says "Used this way as a warning, we could also say red flag."'),
            ],
          },
        ],
      }),
    ],
  },
};
