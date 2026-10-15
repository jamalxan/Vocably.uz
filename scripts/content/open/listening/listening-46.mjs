// Vocably Listening 46 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-46',
  title: 'Listening 46: Making a How-to Video',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-your-speaking-by-making-how-to-videos',
        contextText: 'You will hear a talk giving advice on making a simple how-to video to practise speaking English.',
        questionGroups: [
          {
            id: 'l46-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to the speaker, what is the purpose of making the video?', ['to share it with friends', 'to put it on the internet', 'to observe your own speaking skills', 'to learn a new practical skill'], 'C', 'The speaker says "the goal is to use the video to observe your own English speaking skills".'),
              mc(2, 'Recording yourself is said to be especially helpful when you', ['have no one to practise speaking with.', 'are preparing for an exam.', 'want to improve your writing.', 'already speak English well.'], 'A', 'The speaker says "This is especially true if you cannot find someone to practice speaking with."'),
              mc(3, 'How long should the video be at most?', ['two or three minutes', 'six or seven minutes', 'ten minutes', 'fifteen minutes'], 'B', 'The speaker says "Set a goal of not going over six or seven minutes for video length."'),
            ],
          },
          {
            id: 'l46-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Preparing a how-to video</strong></p><p>1. Choose a subject that looks good on camera and can be divided into {{q4}}</p><p>↓</p><p>2. Gather information: list the steps; write unknown words in your own {{q5}}, then find them in English; watch similar videos online (YouTube lets you reduce the {{q6}} of a video)</p><p>↓</p><p>3. Aim for simple instructions: taking {{q7}} helps you organise the steps; avoid special video {{q8}} for now</p><p>↓</p><p>4. Record the video</p>',
            questions: [
              q(4, null, 'steps', 'The speaker says "your subject will be something that is visually appealing and can be divided into steps".'),
              q(5, null, 'language', 'The speaker says "you can write the words in your own language and then take time to find and practice saying them in English".'),
              q(6, null, 'speed', 'The speaker says "YouTube permits you to slow the speed of the video".'),
              q(7, null, 'notes', 'The speaker says "Taking notes can help organize your steps and decide which to include."'),
              q(8, null, 'software', 'The speaker says "Some how-to videos use special video software to cut parts" and advises you to "avoid such software for now".'),
            ],
          },
          {
            id: 'l46-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'If the video is about food, you could explain how the dish got its ______.', 'name', 'The speaker says "if you are preparing food, you might tell how the dish got its name".'),
              q(10, 'After the introduction, say which ______ are needed.', 'supplies', 'The speaker says "Then, say what supplies are needed."'),
            ],
          },
        ],
      }),
    ],
  },
};
