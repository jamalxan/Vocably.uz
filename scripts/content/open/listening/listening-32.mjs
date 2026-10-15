// Vocably Listening 32 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-32',
  title: 'Listening 32: English at the Airport',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'words-to-travel-with-part-2-airports',
        contextText: 'You will hear an English lesson about the phrases travellers hear at an airport, from check-in to customs.',
        questionGroups: [
          {
            id: 'l32-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Check-in</strong></p><ul><li>the boarding pass is proof that you {{q1}} the flight</li><li>your ID may be a passport or a {{q2}} document</li><li>at a machine, enter your ticket or {{q3}} number</li><li>checked bags are placed on a {{q4}} to be weighed</li><li>a small bag you keep with you is called a {{q5}}</li></ul>',
            questions: [
              q(1, null, 'purchased', 'The speaker says "It is proof that you purchased the flight."'),
              q(2, null, 'driving', 'The speaker says "Your ID is your identification, such as a passport or driving document."'),
              q(3, null, 'reservation', 'The speaker says "you can enter the ticket or reservation number you received when you purchased the flight".'),
              q(4, null, 'scale', 'The speaker says "Please place your bag on the scale."'),
              q(5, null, 'carry-on','The speaker says "The bag you keep with you on the plane is called a carry-on bag".'),
            ],
          },
          {
            id: 'l32-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What might security workers ask you to put your belongings in?', ['a locker', 'a plastic container', 'your checked bag', 'a paper envelope'], 'B', 'The speaker says "Sometimes, you have to place such things in a plastic container called a bin."'),
              mc(7, 'Why has the flight to Chicago been delayed?', ['a technical problem', 'bad weather', 'a late crew', 'security checks'], 'B', 'The announcement says "Your flight has been delayed due to weather conditions."'),
              mc(8, 'What is a "layover"?', ['a night spent in an airport hotel', 'a flight change at a city before your final destination', 'a flight that has been cancelled', 'a delay of more than three hours'], 'B', 'The speaker says "You are supposed to fly another plane from Chicago to your final destination" and "That is called a layover in American English."'),
            ],
          },
          {
            id: 'l32-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Where might an airline put you for the night if you miss a connecting flight?', ['hotel', 'a hotel'], 'The speaker says airlines have solutions "such as putting you on the next flight or putting you in a hotel for the night".'),
              q(10, 'Who decides whether you may enter the country at customs?', ['government officers', 'officers'], 'The speaker says customs "is where government officers approve or reject entrance into the country".'),
            ],
          },
        ],
      }),
    ],
  },
};
