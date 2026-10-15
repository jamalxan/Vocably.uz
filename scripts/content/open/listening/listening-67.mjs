// Vocably Listening 67 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-67',
  title: 'Listening 67: James Madison',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-james-madison',
        contextText: 'You will hear a talk about James Madison, the fourth president of the United States, and the War of 1812.',
        questionGroups: [
          {
            id: 'l67-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Madison was elected president in ______.', '1808', 'The speaker says "James Madison was elected in 1808."'),
              q(2, 'Madison\'s plan for a government with ______ parts became the basis of the Constitution.', ['three', '3'], 'The speaker says "Madison\'s vision for a three-part government" became "the basis for the Constitution we still use today".'),
              q(3, 'Madison\'s work earned him the title "Father of the ______".', 'Constitution', 'The speaker says "These actions earned Madison the name" Father of the Constitution.'),
              q(4, 'As a young man he studied at the college that later became ______ University.', 'Princeton', 'The speaker says "He went to college at the school that later became Princeton University in New Jersey."'),
            ],
          },
          {
            id: 'l67-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What do we learn about Madison\'s wife, Dolley?', ['She had been married before.', 'She was older than Madison.', 'She had several children with him.', 'She disliked social events.'], 'A', 'The speaker says "Many people were surprised when he married a young widow named Dolley Payne Todd."'),
              mc(6, 'Why were Dolley Madison\'s weekly gatherings called "squeezes"?', ['Guests had to wear tight clothing.', 'They were extremely crowded.', 'They were held in a very small room.', 'They lasted only a short time.'], 'B', 'The speaker says "Her weekly gatherings at the president\'s house were so crowded that they became known as" squeezes.'),
              mc(7, 'What did Dolley Madison do when she learned the British were approaching?', ['She hid inside the president\'s house.', 'She rode out to find her husband.', 'She had a painting of George Washington removed.', 'She ordered the servants to set fire to the house.'], 'C', 'The speaker says she ordered her servants "to take down a painting of George Washington".'),
            ],
          },
          {
            id: 'l67-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Battle of New Orleans</strong></p><ul><li>American forces led by General Andrew {{q8}}</li><li>British losses: more than 2,000 dead and wounded; 500 captured</li><li>American losses: {{q9}} killed</li><li>the war had actually ended by treaty {{q10}} weeks earlier</li></ul>',
            questions: [
              q(8, null, 'Jackson', 'The speaker says "A militia general named Andrew Jackson led a ragtag army against a British attack in New Orleans".'),
              q(9, null, ['13', 'thirteen'], 'The speaker says "Thirteen Americans were killed."'),
              q(10, null, ['two', '2'], 'The speaker says "The war had ended, by treaty, two weeks earlier."'),
            ],
          },
        ],
      }),
    ],
  },
};
