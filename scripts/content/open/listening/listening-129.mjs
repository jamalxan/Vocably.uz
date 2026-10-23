// Vocably Listening 129 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-129',
  title: 'Listening 129: A Pioneering Nerve Operation',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'italian-man-might-regain-use-of-hand-after-nerve-operation',
        contextText: 'You will hear a news report about a new kind of nerve operation performed on a patient in Italy.',
        questionGroups: [
          {
            id: 'l129-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The operation</strong></p><ul><li>carried out by surgeons at {{q1}} City Hospital in northern Italy</li><li>used part of the {{q2}} nerve from the leg, which helps control the foot</li><li>moved to the brachial plexus – nerves linking the {{q3}} to the shoulder, arm and hand</li><li>patient: a {{q4}}-year-old healthcare worker</li><li>injured when a {{q5}} hit him while he was riding a moped to work</li></ul>',
            questions: [
              q(1, null, 'Turin', 'The speaker says "Surgeons at Turin City Hospital took part of the man\'s sciatic nerve from his leg."'),
              q(2, null, 'sciatic', 'The speaker says they took "part of the man\'s sciatic nerve from his leg. That is the nerve which helps control movement in the foot."'),
              q(3, null, 'spinal cord', 'The speaker says the brachial plexus "is a network of nerves connecting the spinal cord to the shoulder, arm, and hand".'),
              q(4, null, '55', 'The speaker says "The patient is Marcello Gaviglio, a 55-year-old healthcare worker."'),
              q(5, null, 'motorbike', 'The speaker says "He had half of his left leg amputated after he was hit by a motorbike five months ago."'),
            ],
          },
          {
            id: 'l129-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why could part of the sciatic nerve be moved to the shoulder area?', ['It had already healed completely.', 'It was the strongest nerve in his body.', 'It was no longer needed after the amputation.', 'A donor had provided a replacement nerve.'], 'C', 'The speaker says "Because the part of the sciatic nerve that controlled his left foot was no longer needed, it could be transferred to the shoulder area."'),
              mc(7, 'Why do the doctors describe the surgery as "pioneering"?', ['Nerve transfer surgery had never been done before.', 'A nerve that controls the foot was used for the hand.', 'The operation was done without anaesthetic.', 'It was the fastest operation of its kind.'], 'B', 'The speaker says "Nerve transfer surgery is not new. But normally it does not involve moving a nerve that controls the foot to an area that controls the hand."'),
              mc(8, 'What is the main aim of the operation?', ['to let the man hold objects with his hand', 'to give full movement to both hands', 'to help the man walk again', 'to reduce the pain in his arm'], 'A', 'The speaker says "The aim is to restore some grasp function to the hand. That means the ability to hold objects."'),
            ],
          },
          {
            id: 'l129-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'For roughly how many months will the patient need special care after the operation?', ['five', '5', 'five months', '5 months', 'about five'], 'The speaker says the patient "will need about five months of special care after the operation".'),
              q(10, 'In which medical journal was the research published?', 'Injury', 'The speaker says "It was published in the medical journal Injury."'),
            ],
          },
        ],
      }),
    ],
  },
};
