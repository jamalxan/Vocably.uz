// Vocably Reading 2 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-2',
  title: 'Reading 2: The Steam Engine',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'steam-engine', title: 'The Rise of the Steam Engine', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r2-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-6) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.',
            bank: bank(['Thomas Savery', 'Thomas Newcomen', 'James Watt', 'Jacob Leupold', 'Denis Papin', 'Jerónimo de Ayanz', 'Hero of Alexandria']),
            questions: [
              q(1, 'took the used steam away to be condensed in a separate container', 'C', 'Paragraph B: "James Watt made a critical improvement by removing spent steam to a separate vessel for condensation".', 'B'),
              q(2, 'described an engine in which the pistons fell back to their starting position under their own weight', 'D', 'Paragraph H: "Jacob Leupold described a two-cylinder high-pressure steam engine" whose pistons were "returned to its original position by gravity".', 'H'),
              q(3, 'built a cheap device that could not raise water very far', 'A', 'Paragraph F: Savery\'s pumps "had a very limited lift height" and "One advantage of Savery\'s engine was its low cost."', 'F'),
              q(4, 'was the first person to lift a weight using a piston', 'E', 'Paragraph E: "Denis Papin did some useful work on the steam digester in 1679, and first used a piston to raise weights in 1690."', 'E'),
              q(5, 'created the first commercially successful engine able to supply continuous power to machinery', 'B', 'Paragraph G: "The first commercially successful engine that could transmit continuous power to a machine was the atmospheric engine" ... "invented by Thomas Newcomen around 1712".', 'G'),
              q(6, 'was granted patents for a large number of steam-powered devices', 'F', 'Paragraph E: "The Spanish inventor Jerónimo de Ayanz received patents in 1606 for 50 steam-powered inventions".', 'E'),
            ],
          },
          {
            id: 'r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(7, 'In a steam engine, the steam never comes into contact with the gases produced by burning the fuel.', 'TRUE', 'Paragraph A: steam engines "are external combustion engines, where the working fluid is separated from the combustion products".', 'A'),
              q(8, 'Watt\'s modification meant that engines needed more fuel to produce the same amount of work.', 'FALSE', 'Paragraph B: the improvement was "greatly improving the amount of work obtained per unit of fuel consumed".', 'B'),
              q(9, 'For centuries after Hero, steam devices were built mainly to show what steam could do rather than to perform useful tasks.', 'TRUE', 'Paragraph D: "the few steam-powered engines known were, like the aeolipile, essentially experimental devices used by inventors to demonstrate the properties of steam".', 'D'),
              q(10, 'Savery\'s engines were manufactured in several different countries.', 'NOT GIVEN', 'Paragraph F says the engine "continued to be manufactured until the late 18th century" but gives no information about where it was made.', 'F'),
            ],
          },
          {
            id: 'r2-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Early pumping engines</strong></p><ul><li><strong>Savery\'s pump (1698)</strong><ul><li>condensing steam produced a {{q11}}, which drew water up from below</li><li>larger versions were liable to suffer {{q12}}</li></ul></li><li><strong>Newcomen\'s atmospheric engine (c. 1712)</strong><ul><li>used a piston, as suggested by Papin</li><li>used mainly for {{q13}}, e.g. draining deep mine workings</li><li>at factories, water that had already driven a wheel was pumped back into a {{q14}} above it</li></ul></li></ul>',
            questions: [
              q(11, null, 'vacuum', 'Paragraph F: "It used condensing steam to create a vacuum which raised water from below".', 'F'),
              q(12, null, 'boiler explosions', 'Paragraph F: "They had a very limited lift height and were prone to boiler explosions."', 'F'),
              q(13, null, 'pumping water', 'Paragraph G: "Newcomen\'s engine was relatively inefficient, and mostly used for pumping water."', 'G'),
              q(14, null, 'storage reservoir', 'Paragraph G: "Water that passed over the wheel was pumped up into a storage reservoir above the wheel."', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
