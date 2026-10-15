// Vocably Listening 47 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-47',
  title: 'Listening 47: Writing and Critical Thinking',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-your-writing-studying-critical-thinking',
        contextText: 'You will hear a report about how critical thinking helps students develop ideas in their writing.',
        questionGroups: [
          {
            id: 'l47-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Babi Kruchin on writing</strong></p><ul><li>works as a {{q1}} at Columbia University in New York</li><li>students can learn language rules, vocabulary and how to structure {{q2}}</li><li>developing ideas is the hardest part</li><li>critical thinking = thinking clearly and forming a {{q3}}</li><li>writing reveals how a person {{q4}}</li></ul>',
            questions: [
              q(1, null, 'lecturer', 'The speaker says "She serves as a lecturer in the American Language Program at Columbia University in New York City."'),
              q(2, null, 'essays', 'The speaker says students "can learn language rules, vocabulary words, and even how to structure essays".'),
              q(3, null, 'judgment', 'The speaker says critical thinking is "the ability to think clearly and form a judgment".'),
              q(4, null, 'thinks', 'The speaker says "Writing, she says, shows how a person thinks."'),
            ],
          },
          {
            id: 'l47-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What do standardised tests such as the SAT measure, according to the speaker?', ['how quickly students read', 'how well students understand arguments and judge information', 'how many words students know', 'how neatly students write'], 'B', 'The speaker says "Such tests measure how well students understand arguments, judge information, and make inferences."'),
              mc(6, 'Diane Halpern believes that critical thinking is', ['only useful at school.', 'easy for most students to learn.', 'important in the modern job market.', 'less important than grammar.'], 'C', 'The speaker says "Halpern adds that critical thinking is a skill that is important in the modern job market."'),
              mc(7, 'According to Kruchin, what do students find most difficult?', ['learning grammar rules', 'remembering new vocabulary', 'developing and supporting an original idea', 'writing a good topic sentence'], 'C', 'The speaker says "Developing an original idea, then supporting it, is what students find difficult."'),
            ],
          },
          {
            id: 'l47-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Kruchin suggests that students begin improving their skills by ______.', 'reading', 'The speaker says "students can start improving their writing and critical thinking skills by reading".'),
              q(9, 'Active readers study how other writers build their ______.', 'arguments', 'The speaker says "Students should be active readers by studying how other writers build their arguments."'),
              q(10, 'The exercise also helps students discover the critical thinking ______ they already have.', 'resources', 'The speaker says "it helps students to discover the critical thinking resources that they have inside themselves".'),
            ],
          },
        ],
      }),
    ],
  },
};
