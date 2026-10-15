// Vocably Listening 72 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-72',
  title: 'Listening 72: Theodore Roosevelt',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-theodore-roosevelt',
        contextText: 'You will hear a talk about Theodore Roosevelt, the 26th president of the United States.',
        questionGroups: [
          {
            id: 'l72-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Roosevelt was born and brought up in the city of ______.', 'New York', 'The speaker says "he was born and raised on the East Coast, in New York City".'),
              q(2, 'As a boy he suffered from ______, a condition affecting the lungs.', 'asthma', 'The speaker says "He had asthma, a lung condition that could make physical activity difficult."'),
              q(3, 'His first wife died of ______ disease soon after their daughter was born.', 'kidney', 'The speaker says "two days after the baby was born, Roosevelt\'s wife died of kidney disease".'),
              q(4, 'After this loss, Roosevelt went west and lived as a ______.', 'cowboy', 'The speaker says "There, Roosevelt lived as a cowboy".'),
            ],
          },
          {
            id: 'l72-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why did Republican Party officials want Roosevelt to become vice president?', ['They admired his independence.', 'They thought he would cause them less trouble in that job.', 'They believed he would make a strong president.', 'He had asked them for the position.'], 'B', 'The speaker says "They believed Roosevelt would not be able to give them much trouble in that position."'),
              mc(6, 'What was the aim of Roosevelt\'s "Square Deal"?', ['to lower taxes for farmers', 'to treat all groups in society fairly', 'to increase the power of big business', 'to build the Panama Canal'], 'B', 'The speaker says "He is known for trying to balance the needs of many groups in society, including business owners, farmers and workers."'),
              mc(7, 'What did Roosevelt add to the Monroe Doctrine?', ['The U.S. would stay out of South American affairs.', 'European powers could keep their existing colonies.', 'The U.S. would police the Western Hemisphere.', 'Panama would become part of the U.S.'], 'C', 'The speaker says the U.S. would police the Western Hemisphere and "make sure that countries honored their international obligations".'),
            ],
          },
          {
            id: 'l72-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'In which year did Roosevelt win the presidency in his own right?', '1904', 'The speaker says "In 1904, Roosevelt easily won the presidency in his own right."'),
              q(9, 'What animal name was given to Roosevelt\'s new Progressive Party?', ['Bull Moose', 'bull moose'], 'The speaker says it was "called the Progressive Party" or, as some called it, "the Bull Moose Party".'),
              q(10, 'How old was Roosevelt when he died?', '60', 'The speaker says "he died unexpectedly in his sleep at age 60".'),
            ],
          },
        ],
      }),
    ],
  },
};
