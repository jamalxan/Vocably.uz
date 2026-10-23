// Vocably Listening 128 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-128',
  title: 'Listening 128: Housekeeping and Cleaning House',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'housekeeping-and-clean-house-mean-more-cleaning',
        contextText: 'You will hear a talk about the expressions "clean house" and "housekeeping".',
        questionGroups: [
          {
            id: 'l128-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Spring cleaning</strong></p><ul><li>a chance to throw out {{q1}} items</li><li>big jobs, e.g. taking down and washing the {{q2}}</li><li>shaking out rugs and cleaning {{q3}}</li><li>everyday jobs like the {{q4}} or the dishes do not count as spring cleaning</li></ul>',
            questions: [
              q(1, null, 'unnecessary', 'The speaker says "It is a chance to get rid of unnecessary items and get their homes clean and organized."'),
              q(2, null, 'curtains', 'The speaker says spring cleaning involves "taking down and washing curtains".'),
              q(3, null, 'carpets', 'The speaker says "shaking out rugs and cleaning carpets".'),
              q(4, null, 'laundry', 'The speaker says "Daily cleaning tasks like doing the laundry or dishes are not considered spring cleaning."'),
            ],
          },
          {
            id: 'l128-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What does a business do when it "cleans house"?', ['It hires more staff.', 'It gets rid of troublesome people or policies.', 'It moves to a new building.', 'It tidies up the office.'], 'B', 'The speaker says a group that cleans house "gets rid of people or policies that make trouble or that do not work".'),
              mc(6, 'When "cleaning house" means removing corruption, who is usually being discussed?', ['a school', 'a family', 'a political party or government office', 'a hotel'], 'C', 'The speaker says "we are often talking about a political party or a governmental office".'),
              mc(7, 'How did the business partners "clean their financial house"?', ['They cut everyone\'s salary.', 'They closed the company.', 'They borrowed more money.', 'They hired an honest financial manager.'], 'D', 'The speaker says "that meant hiring a new financial manager" – one that wouldn\'t steal from them.'),
            ],
          },
          {
            id: 'l128-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Housekeeping</strong></p><p>Housekeeping is the act of managing a household: cleaning, organizing, paying the {{q8}} and keeping food in stock. Another way to describe this is putting our house in {{q9}}. In a hotel, housekeeping is the department that keeps rooms clean and supplied with things such as towels and {{q10}}. In business, housekeeping issues are the day-to-day tasks that keep an organization running smoothly.</p>',
            questions: [
              q(8, null, 'bills', 'The speaker says "Cleaning, organizing, paying the bills, and keeping food stocked can all be called housekeeping."'),
              q(9, null, 'order', 'The speaker says "Sometimes we call this putting our house in order."'),
              q(10, null, 'soap', 'The speaker says housekeeping is the hotel department "in charge of keeping your room clean and stocked with necessary items like towels and soap".'),
            ],
          },
        ],
      }),
    ],
  },
};
