// Vocably Reading 96 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-96',
  title: 'Reading 96: The Camel',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'camel', title: 'The Camel: Built for the Desert', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r96-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Dromedaries account for the great majority of the world\'s camels.', 'TRUE', 'Paragraph A: "The one-humped dromedary makes up 94% of the world\'s camel population".', 'A'),
              q(2, 'The domestic Bactrian camel is descended from the wild Bactrian camel.', 'FALSE', 'Paragraph A: "The wild Bactrian camel is a distinct species that is not ancestral to the domestic Bactrian camel".', 'A'),
              q(3, 'The camel family first evolved in Asia.', 'FALSE', 'Paragraph B: "Camelids originated in North America during the Eocene".', 'B'),
              q(4, 'Bactrian camels live longer than dromedaries.', 'NOT GIVEN', 'Paragraph C gives a single figure for all camels, "The average life expectancy of a camel is 40 to 50 years", and does not compare the two species.', 'C'),
              q(5, 'Camelids are unusual among hoofed animals in mating while seated.', 'TRUE', 'Paragraph D: "Camelids are the only ungulates to mate in a sitting position."', 'D'),
            ],
          },
          {
            id: 'r96-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the writer say about a camel\'s hump?', ['It holds a reserve of water.', 'It contains fat that can be used for energy.', 'It shrinks when the camel drinks.', 'It produces a net gain of water in dry climates.'], 'B', 'Paragraph E: "the humps in fact are reservoirs of fatty tissue, which can be used as a reserve source of calories, not water".', 'E'),
              mc(7, 'According to the writer, the water a camel drinks is kept in its', ['humps.', 'stomach.', 'bloodstream.', 'kidneys.'], 'C', 'Paragraph F: "this is stored in the animal\'s bloodstream, not, as popularly believed, in its humps".', 'F'),
              mc(8, 'The shape of a camel\'s red blood cells helps the animal to', ['produce extra blood when dehydrated.', 'avoid damage to the cells when it drinks a large amount of water.', 'carry more oxygen in hot weather.', 'stop bleeding quickly after an injury.'], 'B', 'Paragraph G: the oval cells are "better at withstanding high osmotic variation without rupturing when drinking large amounts of water".', 'G'),
              mc(9, 'What is the function of the rete mirabile?', ['It prevents the brain from overheating.', 'It reduces the amount the camel sweats.', 'It raises body temperature during the night.', 'It traps moisture in the nostrils.'], 'A', 'Paragraph H: the rete mirabile "utilizes countercurrent blood flow to cool blood flowing to the brain".', 'H'),
            ],
          },
          {
            id: 'r96-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'A camel loses only 1.3 litres of fluid a day, whereas other farm animals lose between 20 and ______ litres.', '40', 'Paragraph H: "the other livestock lose 20 to 40 liters per day".', 'H'),
              q(11, 'Even in extreme heat, camels hardly ever ______.', 'sweat', 'Paragraph H: "Camels rarely sweat, even when ambient temperatures reach 49 °C (120 °F)."', 'H'),
              q(12, 'In most mammals, losing around 12-14% of their body water leads to ______.', 'cardiac failure', 'Paragraph H: "most other mammals can withstand only about 12–14% dehydration before cardiac failure results from circulatory disturbance".', 'H'),
              q(13, 'Water vapour in a camel\'s breath is caught in its ______ and absorbed back into the body.', 'nostrils', 'Paragraph I: "water vapor becomes trapped in their nostrils and is reabsorbed into the body".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
