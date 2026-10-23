// Vocably Listening 136 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-136',
  title: 'Listening 136: When in Rome',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'when-in-rome',
        contextText: 'You will hear a talk about the expression "When in Rome, do as the Romans do" and where it comes from.',
        questionGroups: [
          {
            id: 'l136-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the speaker say is one of the best things about travelling to a new country?', ['trying unusual food', 'learning about new traditions and customs', 'meeting old friends', 'practising a foreign language'], 'B', 'The speaker says "One of the best things about traveling to a new country is learning about new traditions and customs."'),
              mc(2, 'Which example does the speaker give of following the rules of a place?', ['whispering in an art museum or library', 'wearing local clothes', 'eating with your hands', 'taking off your shoes indoors'], 'A', 'The speaker says "But when visiting an art museum or library, you whisper in a low voice. You follow the rules of that place."'),
              mc(3, 'What is the second meaning of the expression?', ['You should visit Italy at least once.', 'You should follow the lead of those who know the rules.', 'You should always speak quietly.', 'You should travel alone.'], 'B', 'The speaker says "When you are in an unfamiliar situation, you should follow the lead of those who know the rules."'),
            ],
          },
          {
            id: 'l136-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Origin of the expression</strong></p><ul><li>Roman Empire, more than {{q4}} years ago</li><li>Saint Augustine moved from Rome to {{q5}}</li><li>in Rome he fasted on {{q6}} – people in his new city did not</li><li>advice came from another church leader, Saint {{q7}}</li><li>the proverb first appeared in English around {{q8}} years ago</li></ul>',
            questions: [
              q(4, null, ['1500', '1,500'], 'The speaker says "During the time of the Roman Empire more than 1500 years ago, a Christian leader, Saint Augustine, moved from Rome to Milan."'),
              q(5, null, 'Milan', 'The speaker says Saint Augustine "moved from Rome to Milan".'),
              q(6, null, 'Saturday', 'The speaker says "in Rome he fasted, or did not eat, on Saturday. But in Milan, people did not fast on Saturday."'),
              q(7, null, 'Ambrose', 'The speaker says "Another church leader, Saint Ambrose, gave him some advice."'),
              q(8, null, '500', 'The speaker says "Some word experts say it first appeared in English around 500 years ago."'),
            ],
          },
          {
            id: 'l136-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'In the conversation, where does the brother\'s family live?', ['the country', 'country'], 'The second speaker says "they live in the country and love to hunt and fish".'),
              q(10, 'What kind of person did the first speaker think the second speaker was not?', ['outdoorsy type', 'outdoorsy'], 'The first speaker says "I didn\'t think you were the outdoorsy type."'),
            ],
          },
        ],
      }),
    ],
  },
};
