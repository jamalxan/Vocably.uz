// Vocably Listening 139 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-139',
  title: 'Listening 139: Head and Shoulder Expressions',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'expressions-using-our-head-and-shoulders',
        contextText: 'You will hear a talk about English expressions that use the words "shoulder" and "head".',
        questionGroups: [
          {
            id: 'l139-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does having "a green thumb" mean?', ['being very expensive', 'being good at growing plants', 'feeling unwell', 'being jealous of others'], 'B', 'The speaker says "a green thumb means to be good at growing vegetables, flowers and other plants".'),
              mc(2, 'If you "shoulder" something, what do you do?', ['You refuse to deal with it.', 'You carry it on your back.', 'You accept it as your responsibility.', 'You forget about it.'], 'C', 'The speaker says "If you shoulder something, you accept it as your responsibility; you give support, or you take the blame."'),
              mc(3, 'Why does the speaker say friends with a good shoulder to cry on are great?', ['They give useful advice.', 'They do not ask questions and just listen.', 'They always agree with us.', 'They make us laugh.'], 'B', 'The speaker says "These friends are great because they don\'t ask questions. They just listen and let us cry."'),
            ],
          },
          {
            id: 'l139-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Shoulders that support us</strong></p><p>People who give us a shoulder to lean on or cry on are called our support {{q4}}. If you are successful but others came before you, you are standing on the shoulders of {{q5}}. This expression is often used in {{q6}}, where discoveries are built on the work of others; well-known examples include Isaac {{q7}} and Albert Einstein.</p>',
            questions: [
              q(4, null, 'system', 'The speaker says "We call people who give us a shoulder to lean on or cry on our support system."'),
              q(5, null, 'giants', 'The speaker says "you can say you are standing on the shoulders of giants".'),
              q(6, null, 'science', 'The speaker says "This expression is often used in science."'),
              q(7, null, 'Newton', 'The speaker says "in the world of science, the giants may include Isaac Newton or Albert Einstein".'),
            ],
          },
          {
            id: 'l139-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Someone with a good head on their shoulders is thoughtful and ______.', 'smart', 'The speaker says "If you have a good head on your shoulders, you are thoughtful and smart."'),
              q(9, 'In the job example, the applicant has more education and much more ______ than the job requires.', 'experience', 'The speaker says "You have more education and much more experience than the job requires."'),
              q(10, 'In the race example, the runner has recorded the ______ time.', 'fastest', 'The speaker says "You have clocked the fastest time, and you have trained more than all the other runners."'),
            ],
          },
        ],
      }),
    ],
  },
};
