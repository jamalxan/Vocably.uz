// Vocably Listening 132 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-132',
  title: 'Listening 132: Pulling Your Punches',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'to-pull-or-not-to-pull-punches',
        contextText: 'You will hear a talk about the expression "to pull your punches" and related ways of talking about honesty.',
        questionGroups: [
          {
            id: 'l132-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does a person who is "pulling their punches" do when giving bad news?', ['They refuse to speak at all.', 'They tell only part of the truth.', 'They present only the hard facts.', 'They make a joke about it.'], 'B', 'The speaker says "We might tell only part of the truth. When we do this, we are pulling our punches."'),
              mc(2, 'In which situation does the speaker say people usually do NOT pull punches?', ['at a party', 'when talking to strangers', 'in an emergency or when facing danger', 'when talking to children'], 'C', 'The speaker says "We might do this in emergencies, when facing danger, or other times when the complete truth is required."'),
              mc(3, 'What does "mincing words" mean?', ['speaking very quickly', 'weakening your words in order to be polite', 'refusing to listen to criticism', 'using expressions from boxing'], 'B', 'The speaker says "Mincing words means to soften or weaken your words especially for the sake of being polite."'),
            ],
          },
          {
            id: 'l132-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>People who do not pull punches</strong></p><p>Such people may be described as straight-talking, {{q4}} or frank. When we talk to them, we always know where we {{q5}}. However, when we are on the receiving end, we need a thick {{q6}}. In the same way that it protects some {{q7}} from attacks, a thick skin protects people from hard, cold truths.</p>',
            questions: [
              q(4, null, 'blunt', 'The speaker says "People who don\'t pull punches can also be called straight-talking, blunt, or frank."'),
              q(5, null, 'stand', 'The speaker says "When talking with this kind of person, we always know where we stand."'),
              q(6, null, 'skin', 'The speaker says "we also need a thick skin".'),
              q(7, null, 'animals', 'The speaker says "Just as a thick skin protects some animals from attacks, it also protects people from hard, cold truths".'),
            ],
          },
          {
            id: 'l132-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Which sport does the expression come from?', 'boxing', 'The speaker says the phrase "comes from boxing" and explains: "If you pull a punch in the boxing ring, it means you restrain your power."'),
              q(9, 'In which decade did people start to use the phrase more widely?', '1930s', 'The speaker says "Word experts say that in the 1930s people began to use this phrase more widely."'),
              q(10, 'In the conversation, what has the first speaker just finished writing?', ['movie script', 'script'], 'The first speaker says "Okay, here is my movie script." and the friend replies "You finished it!"'),
            ],
          },
        ],
      }),
    ],
  },
};
