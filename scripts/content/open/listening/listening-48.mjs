// Vocably Listening 48 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-48',
  title: 'Listening 48: Grammar Lessons from Memes',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'memes-can-teach-us-english-grammar',
        contextText: 'You will hear a programme explaining the grammar behind three popular internet memes.',
        questionGroups: [
          {
            id: 'l48-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Meme 1: the coffee sentence</strong></p><ul><li><em>had</em> may be the only English word that can be repeated {{q1}} many times and still be correct</li><li>past perfect = had + past {{q2}}</li><li>it shows that something happened {{q3}} another past action</li><li>the sentence also contains an adjective clause, which has its own subject and {{q4}}</li></ul>',
            questions: [
              q(1, null, 'consecutively', 'The speaker says "It is probably the only word that can appear consecutively many times and still be grammatically correct."'),
              q(2, null, 'participle', 'The speaker says "An easy way to think of this is had + past participle."'),
              q(3, null, 'before', 'The speaker says "We use the past perfect to express that something happened before another action in the past."'),
              q(4, null, 'verb', 'The speaker says an adjective clause is "a part of a sentence that acts as an adjective and has its own subject and verb".'),
            ],
          },
          {
            id: 'l48-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why was the word <em>that</em> left out of the coffee meme?', ['It would make the sentence incorrect.', 'Its use is not required.', 'It sounds too formal.', 'It changes the meaning.'], 'B', 'The speaker says the word was not used in the meme "because its use is not required".'),
              mc(6, 'In the sentence <em>Let&#39;s eat, Grandma</em>, what does the pause after <em>eat</em> show?', ['The speaker is very hungry.', 'The speaker is talking directly to Grandma.', 'The speaker is not sure what to do.', 'The sentence is a question.'], 'B', 'The speaker says "it shows that we are speaking directly to that person".'),
              mc(7, 'According to the speaker, what is a homophone?', ['a word with the same spelling but a different meaning', 'a word that sounds like another but has a different meaning and spelling', 'a common spelling mistake', 'a word used only on social media'], 'B', 'The speaker says "A homophone is a word that sounds like another word but has a different meaning and spelling."'),
            ],
          },
          {
            id: 'l48-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Without the comma, the sentence suggests we are talking to ______ else about Grandma.', 'someone', 'The speaker says "This suggests we are speaking to someone else about Grandma."'),
              q(9, 'The writer of the third meme clearly finds spelling mistakes ______.', 'problematic', 'The speaker says "The writer of this meme is clearly someone who finds spelling mistakes problematic."'),
              q(10, 'Memes can help us laugh at mistakes that even ______ speakers make.', 'native', 'The speaker says "They can also help us to laugh at common mistakes even native English speakers make."'),
            ],
          },
        ],
      }),
    ],
  },
};
