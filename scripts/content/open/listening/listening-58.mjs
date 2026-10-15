// Vocably Listening 58 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-58',
  title: 'Listening 58: Thinking in English',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'train-your-mind-to-think-in-english',
        contextText: 'You will hear a talk in which two English teachers suggest mental exercises for thinking in English.',
        questionGroups: [
          {
            id: 'l58-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Which teacher does each statement refer to? Write the correct letter, <strong>A or B</strong>, next to Questions 1-4. You may use any letter more than once.',
            bank: bank(['Charles Thomas', 'Andrew Hinshaw']),
            questions: [
              q(1, 'has helped to open schools in a number of countries', 'A', 'The speaker says of Charles Thomas: "He has also helped open schools in several countries."'),
              q(2, 'recommends beginning with nouns and adding verbs later', 'A', 'The speaker says "Start with nouns and then add in verbs, he suggests."'),
              q(3, 'has been an English teacher for twelve years', 'B', 'The speaker says of Andrew Hinshaw: "He has been teaching English for 12 years".'),
              q(4, 'describes students who put labels on objects where they live', 'B', 'Hinshaw says students "label everything in their room or their apartments so that these English words, kind of, stick in their heads".'),
            ],
          },
          {
            id: 'l58-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>More mental exercises</strong></p><ul><li><strong>Describe unknown words</strong> – e.g. a garage is "the place inside where I put my {{q5}}"; Hinshaw does this himself as a learner of {{q6}}</li><li><strong>Think in sentences</strong> – e.g. simple sentences while sitting in a {{q7}}</li><li><strong>Describe your day</strong> – beginners use the simple {{q8}} verb form</li></ul>',
            questions: [
              q(5, null, 'car', 'Thomas gives the example "The place inside where I put my car."'),
              q(6, null, 'Spanish', 'The speaker says "As a Spanish learner, he does it himself."'),
              q(7, null, 'park', 'The speaker says "if you are sitting in a park, you can tell yourself things like" a beautiful day.'),
              q(8, null, 'present', 'The speaker says Thomas asks beginners "to describe their day using the simple present verb form".'),
            ],
          },
          {
            id: 'l58-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'How many new words and phrases does Hinshaw suggest writing down each day?', ['five to 10', '5 to 10', 'five to ten', '5-10'], 'The speaker says "Hinshaw suggests writing down just five to 10 new words and phrases each day."'),
              q(10, 'How often does Thomas say learners should do these exercises?', ['every day', 'daily'], 'The speaker says "Thomas says do a little every day."'),
            ],
          },
        ],
      }),
    ],
  },
};
