// Vocably Listening 35 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-35',
  title: 'Listening 35: Planning a Presentation',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'planning-powerful-presentations',
        contextText: 'You will hear a talk about how to plan the visual and story parts of a presentation in English.',
        questionGroups: [
          {
            id: 'l35-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The visual message and the story message</strong></p><ul><li>visual message = pictures, {{q1}} and other aids shown during the talk</li><li>Robert Kaplan studied cultural thought {{q2}} in different languages</li><li>English speakers prefer a {{q3}} style built around one main idea</li><li>in English, the main point should be made at the {{q4}} of the talk</li></ul>',
            questions: [
              q(1, null, 'charts', 'The speaker says "The visual message includes pictures, charts and other aids a speaker presents during the talk."'),
              q(2, null, 'patterns', 'The speaker says Robert Kaplan "studied different cultural thought patterns".'),
              q(3, null, 'linear', 'The speaker says "English speakers prefer a \'linear\' style, which has one main idea."'),
              q(4, null, 'beginning', 'The speaker says "the best time to make that point is at the beginning".'),
            ],
          },
          {
            id: 'l35-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What problem does Professor LeBeau notice in the presentations of the engineers he works with?', ['They speak too quietly.', 'They include too much technical information.', 'They use too many images.', 'They finish too early.'], 'B', 'The speaker says the engineers "give a lot of technical information in their speeches".'),
              mc(6, 'According to LeBeau, what is the purpose of using data and numbers in an English presentation?', ['to show how much the speaker knows', 'to fill the time available', 'to help tell the story more clearly', 'to replace the main point'], 'C', 'LeBeau says "we use numbers, but only to help us tell the story more clearly".'),
            ],
          },
          {
            id: 'l35-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Five tips for an academic presentation</strong></p><p>1. Choose a specific {{q7}} that explains the benefit of your subject (not just a general topic)</p><p>↓</p><p>2. Give non-experts an image and explain how your research connects to other {{q8}}</p><p>↓</p><p>3. Work on transitions – they act as {{q9}} to each new image</p><p>↓</p><p>4. Look at every image from the audience\'s point of view and prepare an extra image for the hardest question</p><p>↓</p><p>5. Rehearse using a timing {{q10}} and cut the talk to fit the time allowed</p>',
            questions: [
              q(7, null, 'title', 'The speaker says "A topic is general, but a title is more specific."'),
              q(8, null, 'fields', 'The speaker says "Explain how your research relates to other fields."'),
              q(9, null, 'bridges', 'The speaker says "transitions serve as bridges to each new image".'),
              q(10, null, 'device', 'The speaker says "Rehearse your presentation with a timing device."'),
            ],
          },
        ],
      }),
    ],
  },
};
