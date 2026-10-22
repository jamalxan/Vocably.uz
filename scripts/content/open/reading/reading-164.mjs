// Vocably Reading 164 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, YNNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-164',
  title: 'Reading 164: Handwriting',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'handwriting', title: 'Handwriting: Why It Still Matters', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r164-ynng', type: 'yes_no_notgiven', instructionHtml: YNNG_INSTRUCTION,
            questions: [
              q(1, 'A person\'s handwriting can be used to confirm who wrote a particular document.', 'YES', 'Paragraph A: "Because each person\'s handwriting is unique and different, it can be used to verify a document\'s writer."', 'A'),
              q(2, 'Identical twins usually produce almost identical handwriting.', 'NO', 'Paragraph B: "Even identical twins who share appearance and genetics do not have the same handwriting."', 'B'),
              q(3, 'Graphology is a dependable way of predicting how well a candidate will perform in a job.', 'NO', 'Paragraph E: it is used for "predicting personality traits and job performance, despite research showing consistently null correlations for these uses".', 'E'),
              q(4, 'Neatly written work tends to be marked more generously.', 'YES', 'Paragraph G: "clearer handwriting tends to receive better marks than illegible or messier handwriting".', 'G'),
              q(5, 'Teaching handwriting with digital tablets is more effective than individualised instruction.', 'NOT GIVEN', 'Paragraph H says that "teaching handwriting through digital tablets/technology, individualized instruction, and rote motor practice produced statistically significant increases in legibility and writing fluency" but does not compare the three methods with each other.', 'H'),
            ],
          },
          {
            id: 'r164-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Write the correct letter, A-I.</em>',
            questions: [
              q(6, 'the name given to the influence of neatness on grades', 'G', 'Paragraph G: "clearer handwriting tends to receive better marks than illegible or messier handwriting, the phenomenon of which has been coined" the presentation effect.', 'G'),
              q(7, 'a model that links the different mental processes involved in writing', 'I', 'Paragraph I: "The Hayes & Berninger framework is a stratified web of interconnected thought processes which relate different cognitive processes to each other".', 'I'),
              q(8, 'the main factors that shape an individual\'s handwriting style', 'B', 'Paragraph B: "Cultural environment and the characteristics of the written form of the first language that one learns to write are the primary influences on the development of one\'s own unique handwriting style."', 'B'),
              q(9, 'a description of how children with attention difficulties handle their pen', 'D', 'Paragraph D: "children with ADHD were more likely to make slower movements during the handwriting task and hold the pen longer in the air between movements".', 'D'),
              q(10, 'uncertainty about how many people with attention problems have an undiagnosed learning disability', 'C', 'Paragraph C: "It is unknown how many individuals with ADD/ADHD who also struggle with penmanship actually have undiagnosed specific learning disabilities".', 'C'),
            ],
          },
          {
            id: 'r164-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'What is the term for being unable to produce clear, coherent handwriting?', 'dysgraphia', 'Paragraph A: "The inability to produce clear and coherent handwriting is also known as dysgraphia."', 'A'),
              q(12, 'At what stage of childhood can handwriting practice improve the recognition of letters?', 'late preschool', 'Paragraph F: "Better letter recognition can be facilitated by practicing handwriting in late preschool".', 'F'),
              q(13, 'Besides higher-level cognition, what kind of thinking do poor handwriting skills often damage?', 'creative thinking', 'Paragraph G: "Poor handwriting skills and autonomy have been shown to often impair higher-level cognition and creative thinking in children".', 'G'),
              q(14, 'Which type of memory is given as an example of an underdeveloped low-level resource?', 'long-term memory', 'Paragraph I: "underdevelopment of long-term memory" is placed in the lower level of the cognitive strata and "can then be linked to underdeveloped motor planning for hand-writing individual letters".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
