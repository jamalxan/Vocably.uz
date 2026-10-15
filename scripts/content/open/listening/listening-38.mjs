// Vocably Listening 38 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-38',
  title: 'Listening 38: Better Listening Through Transcription',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'education-tips-imrove-listening-by-transcribing',
        contextText: 'You will hear an education programme about improving listening skills by transcribing.',
        questionGroups: [
          {
            id: 'l38-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Pascal Hamon is the academic ______ of an English language institute.', 'director', 'The speaker says Pascal Hamon is "the Academic Director for the English Language Institute at Missouri State University".'),
              q(2, 'Students often find the usual ways of studying listening ______.', 'boring', 'The speaker says "Students often study listening comprehension in less than interesting, even boring ways".'),
              q(3, 'International students usually have to pass the ______ exam to enter an American university.', 'TOEFL', 'The speaker says international students "are often required to pass TOEFL".'),
              q(4, 'Listening exercises should make learners turn the sounds they hear into ______.', 'words', 'The speaker says exercises should "focus on turning the sounds that they hear into words".'),
            ],
          },
          {
            id: 'l38-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does Hamon think about listening comprehension activities?', ['They are a waste of time.', 'They are useful but do not make students decode individual sounds.', 'They are too difficult for most learners.', 'They should replace transcription.'], 'B', 'The speaker says Hamon "believes that such exercises have value but do not force the student to decode individual sounds".'),
              mc(6, 'What should students do after checking their transcription against the original?', ['choose a harder recording', 'write a summary of the text', 'try to learn from their mistakes', 'send it to their teacher'], 'C', 'The speaker says "students should always try to learn from their mistakes".'),
            ],
          },
          {
            id: 'l38-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>How to practise transcription</strong></p><p>1. Find audio that has a printed {{q7}}, but do not read it</p><p>↓</p><p>2. Listen to a {{q8}} section many times, then write down what you hear</p><p>↓</p><p>3. {{q9}} what you wrote with the original story</p><p>↓</p><p>4. Think about where you had {{q10}} and what you need to improve</p>',
            questions: [
              q(7, null, 'transcript', 'The speaker says "find audio that has a printed transcript, but do not look at the words".'),
              q(8, null, 'short', 'The speaker says "listen to a short section of the audio many times".'),
              q(9, null, 'Compare', 'The speaker says "compare what you wrote against the story".'),
              q(10, null, 'problems', 'The speaker says "where you had problems. Ask yourself the following questions".'),
            ],
          },
        ],
      }),
    ],
  },
};
