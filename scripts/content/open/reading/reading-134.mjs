// Vocably Reading 134 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-134',
  title: 'Reading 134: The Submarine',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'submarine', title: 'Boats Beneath the Waves: The Submarine', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r134-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to the passage, how does a submersible differ from a submarine?', ['It is always much smaller.', 'It is less able to operate on its own underwater.', 'It is controlled remotely.', 'It is used only for civilian work.'], 'B', 'Paragraph A: a submarine "differs from a submersible, which has more limited underwater capability".', 'A'),
              mc(2, 'What does the writer say about the conning tower?', ['It is the American term for the sail.', 'It was a separate pressure hull on older designs.', 'It contains the propeller and control fins.', 'It is typical of small, deep-diving craft.'], 'B', 'Paragraph C: the conning tower was "a separate pressure hull above the main body of the boat that enabled the use of shorter periscopes".', 'C'),
              mc(3, 'Which statement about present-day submarine construction is made in the passage?', ['Russia builds more submarines than any other nation.', 'Fewer countries operate submarines than in the past.', 'The number of countries building submarines has never been higher.', 'Most new submarines are intended for tourism.'], 'C', 'Paragraph D: "More countries are building and operating submarines today than ever before in modern history, and China is leading the construction surge."', 'D'),
              mc(4, 'What does the passage say about the word for a submarine in other languages?', ['Every language has shortened the original phrase.', 'Some languages still use a term meaning submarine boat.', 'The French word was borrowed from English.', 'Russian uses a completely unrelated word.'], 'B', 'Paragraph E: "although others retain the original term, such as Dutch (Onderzeeboot), German (Unterseeboot)".', 'E'),
            ],
          },
          {
            id: 'r134-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Early underwater craft</strong></p><ul><li>1578: William Bourne, an English {{q5}}, recorded one of the first plans for an underwater vehicle</li><li>1596: John Napier wrote that he hoped to build devices for travelling under water, but may never have done so</li><li>Jerónimo de Ayanz y Beaumont designed two vehicles fitted with oars, snorkels, portholes and {{q6}}; he intended to use them to attach explosive charges to enemy ships</li><li>1620: Cornelis Drebbel, working for the English king, built the first reliably documented submersible, which was driven by {{q7}}</li><li>1747: Nathaniel Symons built the first working {{q8}}, using leather bags that filled with water</li><li>1749: a magazine reported that Giovanni Borelli had suggested a similar idea in {{q9}}</li></ul>',
            questions: [
              q(5, null, 'mathematician', 'Paragraph G: "the English mathematician William Bourne recorded in his book Inventions or Devises one of the first plans for an underwater navigation vehicle".', 'G'),
              q(6, null, 'gloves', 'Paragraph H: "They were equipped with oars, autonomous floating snorkels worked by inner pumps, portholes and gloves used for the crew to manipulate underwater objects."', 'H'),
              q(7, null, 'oars', 'Paragraph I: "It was propelled by means of oars."', 'I'),
              q(8, null, 'ballast tank', 'Paragraph J: "Nathaniel Symons patented and built the first known working example of the use of a ballast tank for submersion".', 'J'),
              q(9, null, '1680', 'Paragraph J: "a similar design had initially been proposed by Giovanni Borelli in 1680".', 'J'),
            ],
          },
          {
            id: 'r134-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Submarines were used on a large scale for the first time during the Second World War.', 'FALSE', 'Paragraph B: "They were first used widely during World War I (1914–1918)".', 'B'),
              q(11, 'Modern deep-diving submarines developed from the bathyscaphe.', 'TRUE', 'Paragraph B: "Modern deep-diving submarines derive from the bathyscaphe, which evolved from the diving bell."', 'B'),
              q(12, 'The Typhoon class is the largest type of submarine ever constructed.', 'TRUE', 'Paragraph D: "the Russian Typhoon class (the biggest submarines ever built)".', 'D'),
              q(13, 'The two Greeks who went underwater in the Tagus used a craft of their own design.', 'NOT GIVEN', 'Paragraph F says that "Two Greeks submerged and surfaced in the river Tagus near the City of Toledo several times" but says nothing about who designed their craft.', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
