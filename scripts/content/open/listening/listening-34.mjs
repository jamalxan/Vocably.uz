// Vocably Listening 34 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-34',
  title: 'Listening 34: Giving a Persuasive Speech',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'give-a-persuasive-speech',
        contextText: 'You will hear a talk about how to prepare and organise a speech that persuades listeners.',
        questionGroups: [
          {
            id: 'l34-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Choosing a topic</strong></p><ul><li>pick a subject you know about or have {{q1}} well</li><li>it should be something people have different {{q2}} about</li><li>example: a speech about how {{q3}} harms the appearance of your town</li></ul><p><strong>Knowing your audience</strong></p><ul><li>Zelenskyy compared the invasion to Pearl Harbor and 9/11 for the US, and spoke of the {{q4}} to leaders in Israel</li></ul>',
            questions: [
              q(1, null, 'researched', 'The speaker says "you should choose a topic you know something about or have researched well".'),
              q(2, null, 'opinions', 'The speaker says "Make sure it is a subject about which people have different opinions."'),
              q(3, null, 'littering', 'The speaker says "giving a speech about why littering harms your town\'s appearance might persuade people who do it to stop".'),
              q(4, null, 'Holocaust', 'The speaker says "In his speech to the leaders of Israel, he spoke of the Holocaust".'),
            ],
          },
          {
            id: 'l34-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which kind of appeal does each example of Zelenskyy\'s speeches show? Choose the correct letter, <strong>A, B or C</strong>.',
            bank: bank(['Ethos (ethics or morals)', 'Pathos (emotions)', 'Logos (logic)']),
            questions: [
              q(5, 'He said some German businesses cared more about money than about morality.', 'A', 'The speaker says "Representing Ethos, in speaking to the German leaders, he said some German businesses had put more importance on economic gain than on morality."'),
              q(6, 'He showed a video of injured children to the US Congress.', 'B', 'The speaker says "In an appeal to Pathos, Zelenskyy played a video showing injured Ukrainian children".'),
              q(7, 'He told the British Parliament that Ukrainians would never stop fighting.', 'C', 'The speaker says "in his speech to the British Parliament in London, he made an appeal to Logos".'),
            ],
          },
          {
            id: 'l34-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flowchart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Organising the speech</strong></p><p>1. Open with a statement that gets the listeners\' {{q8}}.</p><p>2. Explain the main idea and give {{q9}} to support it.</p><p>3. List your points and prepare answers to opposing arguments.</p><p>4. End with a call to {{q10}}.</p><p>5. Practise until you need only a note card.</p>',
            questions: [
              q(8, null, 'attention', 'The speaker says "Start with an attention-getting statement."'),
              q(9, null, 'evidence', 'The speaker says "Then explain your main idea and give evidence to support your argument."'),
              q(10, null, 'action', 'The speaker says "Finish with a call to action" and asks what you want your listeners to do.'),
            ],
          },
        ],
      }),
    ],
  },
};
