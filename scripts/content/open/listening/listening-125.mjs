// Vocably Listening 125 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-125',
  title: 'Listening 125: When Things Go South',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'let-s-talk-about-going-south',
        contextText: 'You will hear a talk about two American expressions for when things do not go as planned: "go south" and "go sideways".',
        questionGroups: [
          {
            id: 'l125-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>To go south</strong></p><ul><li>something stops working or falls {{q1}}</li><li>can also mean something decreases in {{q2}} or loses quality</li><li>a relationship that goes south is heading toward a {{q3}}</li><li>a trip that goes south: you miss your plane, your {{q4}} is stolen and the hotel loses your reservation</li></ul>',
            questions: [
              q(1, null, 'apart', 'The speaker says "If something goes south, it stops working or falls apart."'),
              q(2, null, 'value', 'The speaker says "It can also mean that something decreases in value or loses quality."'),
              q(3, null, 'breakup', 'The speaker says "If a relationship goes south, the two people are heading toward a breakup."'),
              q(4, null, 'passport', 'The speaker says "You miss your plane, your passport gets stolen, and the hotel loses your reservation."'),
            ],
          },
          {
            id: 'l125-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What was the first problem the friend\'s new bakery ran into?', ['Her head baker left.', 'Her investor withdrew.', 'Her prices were too high.', 'She opened too late in the year.'], 'B', 'The second speaker says "But then she ran into trouble. Her investor pulled out. And then her head baker quit."'),
              mc(6, 'Why was the bakery "bound to go south" in the end?', ['A cheaper bakery opened nearby.', 'The rent was increased.', 'She could not find a new baker.', 'Customers complained about the bread.'], 'A', 'The second speaker says "it didn\'t help that another bakery with lower prices opened down the street".'),
              mc(7, 'When is "going sideways" a good thing, according to the speaker?', ['when a business changes its plans', 'when a story takes an unexpected turn', 'when a trip is cancelled', 'when nothing at all changes'], 'B', 'The speaker says "a good story often goes sideways" and "the story goes in an unexpected direction".'),
            ],
          },
          {
            id: 'l125-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'Which animal took the camper\'s food on the first night?', ['raccoon', 'a raccoon'], 'The camper says "the first night a raccoon stole all my food".'),
              q(9, 'What did spiders cover the camper\'s tent with on the second night?', ['webs', 'spider webs'], 'The camper says "spiders spun webs all over my tent".'),
              q(10, 'What bit the camper while he was swimming in the lake?', ['fish', 'a fish'], 'The camper says "while I was swimming in the lake, a fish bit me".'),
            ],
          },
        ],
      }),
    ],
  },
};
