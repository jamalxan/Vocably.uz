// Vocably Listening 64 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS' };

export default {
  slug: 'vocably-listening-64',
  title: 'Listening 64: Writing a School Paper',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'having-problems-with-a-school-paper',
        contextText: 'You will hear an education report in which a university writing teacher gives advice on writing a research paper.',
        questionGroups: [
          {
            id: 'l64-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>Jennifer Ahern-Dodson</strong></p><ul><li>assistant professor at {{q1}} University</li><li>also serves as {{q2}} director for the Thompson Writing Program</li><li>says writing feels easy when the writer has something {{q3}} to say</li><li>advises trying some writing before you have finished all the {{q4}}</li></ul>',
            questions: [
              q(1, null, 'Duke', 'The speaker says she is "assistant professor of The Practice in Writing Studies at Duke University".'),
              q(2, null, 'outreach', 'The speaker says "Ms. Ahern-Dodson serves as outreach director".'),
              q(3, null, 'important', 'The speaker says "when writing seems easy, it is usually because he or she has something important to say".'),
              q(4, null, 'research', 'The speaker says "Suppose you have done some research for your paper, but you still have more research to do."'),
            ],
          },
          {
            id: 'l64-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why can research make a writer feel intimidated?', ['Other people seem to have said everything already.', 'The library has too many books.', 'The teacher is very strict.', 'There is not enough time to read.'], 'A', 'The teacher is quoted: "People have said everything already."'),
              mc(6, 'What does Ahern-Dodson suggest thinking about during the research?', ['what you find interesting in the process', 'how long the paper should be', 'which experts to quote', 'when the deadline is'], 'A', 'She asks "What is it you find interesting in the middle of this process?"'),
              mc(7, 'According to Ahern-Dodson, what causes much of the anxiety about writing?', ['sharing writing in very important situations', 'making grammar mistakes', 'having too little time', 'writing on a computer'], 'A', 'She says "So much of our anxiety about writing stems from sharing our writing in high-stakes" situations.'),
            ],
          },
          {
            id: 'l64-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            questions: [
              q(8, 'Who does Ahern-Dodson strongly advise students to work with?', ['other writers', 'writers'], 'The speaker says "Ms. Ahern-Dodson strongly advises working with other writers."'),
              q(9, 'What does Ahern-Dodson spend much of her time helping students and professors to form?', ['writing groups'], 'The speaker says "She spends a lot of her time helping students and professors form writing groups."'),
              q(10, 'What quality of your writing can the reaction of other people reveal?', ['interesting'], 'The speaker says "It can show if your writing is interesting."'),
            ],
          },
        ],
      }),
    ],
  },
};
