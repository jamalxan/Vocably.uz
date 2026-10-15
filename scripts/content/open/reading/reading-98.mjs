// Vocably Reading 98 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-98',
  title: 'Reading 98: The Giant Sequoia',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sequoiadendron-giganteum', title: 'The Giant Sequoia: The Largest Trees on Earth', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r98-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Giant sequoias occur naturally in only one mountain range.', 'TRUE', 'Paragraph A: "They are native to the groves on the western slopes of the Sierra Nevada mountain range of California".', 'A'),
              q(2, 'Giant sequoia timber is widely used for building houses.', 'FALSE', 'Paragraph C: "The wood is unsuitable for construction and instead is used for fence posts or match sticks."', 'C'),
              q(3, 'The genus was named after the inventor of the Cherokee writing system.', 'FALSE', 'Paragraph D: a 2012 study concluded that Endlicher "derived the name from the Latin word sequi (meaning to follow)".', 'D'),
              q(4, 'The trunks of coast redwoods begin to narrow at a lower height than those of giant sequoias.', 'TRUE', 'Paragraph E: "The trunks of coast redwoods taper at lower heights than those of giant sequoias".', 'E'),
              q(5, 'The 10,000-year-old sequoia log was discovered by university researchers.', 'NOT GIVEN', 'Paragraph G says the log "has been discovered 800 m (0.50 mi) south of the Nelder Grove" but does not say who found it.', 'G'),
            ],
          },
          {
            id: 'r98-endings', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'keep the branches lower down the trunk.',
              'start producing cones within their first five years.',
              'contains a substance that gives protection from fire.',
              'do not grow new shoots from their stumps.',
              'can be grown from cuttings as well as from seed.',
              'are released when insects damage the cone or fire dries it out.',
              'have thinner bark than coast redwoods.',
            ]),
            questions: [
              q(6, 'The sap of the giant sequoia', 'C', 'Paragraph F: "The sap contains tannic acid, which provides significant protection from fire damage."', 'F'),
              q(7, 'Most giant sequoia seeds', 'F', 'Paragraph H: "most are liberated by insect damage or when the cone dries from the heat of fire".', 'H'),
              q(8, 'Unlike coast redwoods, mature giant sequoias', 'D', 'Paragraph I: "shoots do not form on the stumps of more mature trees as they do on coast redwoods".', 'I'),
              q(9, 'Giant sequoias that grow on their own', 'A', 'Paragraph K: "solitary trees retain lower branches".', 'K'),
            ],
          },
          {
            id: 'r98-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Cones and seeds of the giant sequoia</strong></p><ul><li>each cone contains on average {{q10}} seeds</li><li>trees do not produce cones until they reach the age of {{q11}}</li><li>a single large tree may carry up to {{q12}} cones</li><li>seeds can travel up to {{q13}} from the parent tree</li></ul>',
            questions: [
              q(10, null, '230', 'Paragraph H: "giving an average of 230 seeds per cone".', 'H'),
              q(11, null, '12', 'Paragraph H: "The trees do not begin to bear cones until they are 12 years old."', 'H'),
              q(12, null, ['11,000', '11000'], 'Paragraph J: "A large tree may have as many as 11,000 cones."', 'J'),
              q(13, null, ['180 m', '180m', '180 metres', '180 meters'], 'Paragraph J: "The winged seeds may fly as far as 180 m (590 ft) from the parent tree."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
