// Vocably Listening 36 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-36',
  title: 'Listening 36: Body Language for Public Speaking',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'body-language-help-public-speaking',
        contextText: 'You will hear a talk about how body language can improve public speaking.',
        questionGroups: [
          {
            id: 'l36-multi', type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 1,
                promptHtml: 'Which TWO of the following does Charles LeBeau say are part of body language?',
                options: [
                  { key: 'A', text: 'posture' },
                  { key: 'B', text: 'clothing' },
                  { key: 'C', text: 'facial expressions' },
                  { key: 'D', text: 'gestures' },
                  { key: 'E', text: 'voice volume' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: 'The speaker says "body language includes posture, eye contact and gestures".',
              },
            ],
          },
          {
            id: 'l36-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Common problems and solutions</strong></p><ul><li>LeBeau thinks most problems with posture, eye contact and gestures come from {{q2}}</li><li>nervous speakers often move from {{q3}} to side</li><li>whole-body movement should be slow and {{q4}}</li><li>for notes, use images and a few {{q5}} instead of sentences</li><li>when introducing three ideas, hold up three {{q6}}</li></ul>',
            questions: [
              q(2, null, 'nervousness', 'LeBeau says "I think a lot of this comes from nervousness."'),
              q(3, null, 'side', 'The speaker says "One effect of being nervous is moving from side to side."'),
              q(4, null, 'planned', 'The speaker says "Whole-body movement should be slow and planned to command attention."'),
              q(5, null, 'words', 'The speaker says the best way is "to use images and few words for notes instead of sentences".'),
              q(6, null, 'fingers', 'The speaker says "when talking about three ideas, hold up three fingers to introduce them".'),
            ],
          },
          {
            id: 'l36-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(7, 'What do other experts advise speakers to do?', ['stand perfectly still', 'move to a different place for each idea', 'walk slowly across the stage all the time', 'sit down while speaking'], 'B', 'The speaker says "Other experts advise moving your body to a different place for each idea."'),
              mc(8, 'What does LeBeau suggest is a good way to change your body language?', ['ask a friend to watch you', 'practise in front of a mirror', 'make a video of your presentation', 'read a book about gestures'], 'C', 'The speaker says a good way "is to make a video of your presentation and watch yourself".'),
              mc(9, 'Why does LeBeau start his courses with the physical message?', ['It is the hardest skill to learn.', 'Students get a positive experience quickly.', 'It takes the most time to teach.', 'Students usually ask for it.'], 'B', 'LeBeau says the reason is "so students can have a real positive experience really quickly".'),
              mc(10, 'What will the next programme in the series be about?', ['grammar for presentations', 'the visual message and the story message', 'how to answer questions from the audience', 'how to reduce nervousness'], 'B', 'The speaker says "we will look at the visual message" and "the story message, how to organize the ideas you present".'),
            ],
          },
        ],
      }),
    ],
  },
};
