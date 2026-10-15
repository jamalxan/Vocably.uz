// Vocably Reading 29 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-29',
  title: 'Reading 29: The Axolotl',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'axolotl', title: 'The Axolotl: A Salamander That Never Grows Up', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r29-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a comparison between the genetic material of the axolotl and that of humans', 'K', 'Paragraph K: "Although the axolotl genome is about ten times the size of the human genome, it encodes a similar number of proteins".', 'K'),
              q(2, 'the various meanings that have been given to the animal\'s name', 'D', 'Paragraph D: the name "is a Nahuatl word which has been translated variably as" a list of meanings such as water servant or water dog.', 'D'),
              q(3, 'the reasons why most of the animal\'s original habitat no longer exists', 'B', 'Paragraph B: "The desiccation of these lakes, initiated by the Aztecs and accelerated during the 20th century, has led to the destruction of much of the axolotl\'s natural habitat".', 'B'),
              q(4, 'how to tell a male axolotl from a female', 'G', 'Paragraph G: "Males can be identified by their swollen cloacae lined with papillae, while females have noticeably wider bodies when gravid and full of eggs."', 'G'),
            ],
          },
          {
            id: 'r29-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The axolotl</strong></p><ul><li>Type of animal: a {{q5}} salamander that remains in the water throughout its adult life</li><li>Status: as few as 50 adults may be left in the wild; classed as critically endangered by the {{q6}}</li><li>Scientific value: able to {{q7}} limbs, gills and parts of the eyes and brain</li><li>Adult size: most often about {{q8}} cm in length; more than 30 cm is rare</li><li>Feeding: mainly by {{q9}}, with the gill slits closed</li></ul>',
            questions: [
              q(5, null, 'mole', 'Paragraph A: "The axolotl is a species of mole salamander."', 'A'),
              q(6, null, 'IUCN', 'Paragraph B: "the species has been assessed as critically endangered by the International Union for Conservation of Nature (IUCN)".', 'B'),
              q(7, null, 'regenerate', 'Paragraph C: "their unusual ability to regenerate body parts, including limbs, gills and parts of their eyes and brains".', 'C'),
              q(8, null, '23', 'Paragraph F: "a size close to 23 cm (9 in) is most common, and any greater than 30 cm (12 in) is rare".', 'F'),
              q(9, null, 'suction', 'Paragraph H: "Their primary method of feeding is by suction, during which their rakers interlock to close the gill slits."', 'H'),
            ],
          },
          {
            id: 'r29-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'Why can axolotls be confused with other animals?', [
                'They change colour to match their surroundings.',
                'They look like the young of related salamanders.',
                'They share their lakes with tiger salamanders.',
                'They lose their gills when they become adults.',
              ], 'B', 'Paragraph A: "Axolotls may be difficult to distinguish from the larval stage of other neotenic adult mole salamanders, in particular the tiger salamander".', 'A'),
              mc(11, 'According to the passage, wild axolotls have come close to extinction mainly because of', [
                'collection for the pet trade.',
                'the demands of scientific research.',
                'fish that were brought in from elsewhere.',
                'pollution from Mexico City.',
              ], 'C', 'Paragraph B: "Wild axolotls have been driven to near extinction by the introduction of invasive species such as tilapia and carp".', 'B'),
              mc(12, 'What is the purpose of the filaments on an axolotl\'s gill stalks?', [
                'to stop food entering the gills',
                'to provide a larger area for exchanging gases',
                'to help the animal move through the water',
                'to filter small particles of food',
              ], 'B', 'Paragraph G: "These are lined with filaments (fimbriae) to increase the surface area for gas exchange."', 'G'),
              mc(13, 'Why is the axolotl genome so much larger than the human genome?', [
                'It codes for far more proteins.',
                'It contains a great deal of repeated sequence.',
                'It has many more chromosomes.',
                'It includes special genes for regrowing limbs.',
              ], 'B', 'Paragraph K: "The size difference is mostly explained by a large fraction of repetitive sequences".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
