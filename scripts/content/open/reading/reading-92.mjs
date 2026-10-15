// Vocably Reading 92 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-92',
  title: 'Reading 92: Bamboo',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'bamboo', title: 'Bamboo: The Giant Grass', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r92-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The stalks of the largest bamboo species can weigh more than 400 kilograms.', 'TRUE', 'Paragraph A: Dendrocalamus sinicus culms reach "a weight of up to 450 kilograms (1,000 lb)".', 'A'),
              q(2, 'The English word "bamboo" was taken directly from Malay.', 'FALSE', 'Paragraph A: it "most likely comes from the Dutch or Portuguese language, which originally borrowed it from Malay".', 'A'),
              q(3, 'Bamboo stems become narrower towards the top, as the trunks of conifers do.', 'FALSE', 'Paragraph B: the absence of secondary growth wood causes the stems "to be columnar rather than tapering".', 'B'),
              q(4, 'The fastest growth ever recorded in bamboo was observed in a tropical species.', 'NOT GIVEN', 'Paragraph C names "Japanese giant timber bamboo (Phyllostachys bambusoides)" as the record holder but does not say whether it is a tropical or temperate species.', 'C'),
              q(5, 'The bamboo thickets of the south-eastern United States are now under serious threat.', 'TRUE', 'Paragraph I: canebrakes "are now considered critically endangered ecosystems".', 'I'),
            ],
          },
          {
            id: 'r92-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Bamboo as a material and as a plant group</strong></p><p>Bamboo is important in several parts of Asia, where it serves as a building material, a food and a raw product, and it is frequently represented in the region\'s {{q6}}. Like wood, it is a natural {{q7}} with a high ratio of strength to weight, and one species from Bangladesh and India has shown exceptional {{q8}} strength under test conditions. In botanical terms, bamboos were for a long time regarded as the most {{q9}} of the grasses, largely because of features of their flowers.</p>',
            questions: [
              q(6, null, 'arts', 'Paragraph D: bamboo is "depicted often in arts, such as in bamboo paintings and bambooworking".', 'D'),
              q(7, null, 'composite', 'Paragraph D: "Bamboo, like wood, is a natural composite material with a high strength-to-weight ratio".', 'D'),
              q(8, null, 'tensile', 'Paragraph D: "Bambusa tulda of Bangladesh and adjoining India has tested as high as 60,000 psi (400 MPa) in tensile strength."', 'D'),
              q(9, null, 'basal', 'Paragraph E: "Bamboos have long been considered the most basal grass genera".', 'E'),
            ],
          },
          {
            id: 'r92-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'According to the writer, what accounts for the exceptional growth rate of bamboo?', ['the hollow structure of its stems', 'its distinctive system of rhizomes', 'its ability to survive on poor land', 'the arrangement of its vascular bundles'], 'B', 'Paragraph C: bamboos are among the fastest-growing plants "due to a unique rhizome-dependent system".', 'C'),
              mc(11, 'What does the writer say about the relationships between the three tribes of bamboo?', ['The woody bamboos form a single natural group.', 'The temperate woody bamboos are most closely related to the herbaceous bamboos.', 'The tropical woody bamboos are more closely related to the herbaceous bamboos than to the temperate woody ones.', 'The herbaceous bamboos are the ancestors of both woody groups.'], 'C', 'Paragraph F: "the tropical woody and herbaceous bamboos are sister to the temperate woody bamboos".', 'F'),
              mc(12, 'Which group of bamboos has the greatest number of chromosome sets?', ['the herbaceous bamboos', 'the temperate woody bamboos', 'the neotropical woody bamboos', 'the paleotropical woody bamboos'], 'D', 'Paragraph G: "the paleotropical woody ones are hexaploid", whereas the others are diploid or tetraploid.', 'G'),
              mc(13, 'Where is there a notable break in the natural range of bamboo in the Americas?', ['in southern Argentina', 'in the beech forests of Chile', 'in the Atacama Desert', 'in the Andes of Ecuador'], 'C', 'Paragraph H: "with a noticeable gap through the Atacama Desert".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
