// Vocably Reading 58 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-58',
  title: 'Reading 58: Atolls',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'atoll', title: 'Rings of Coral: How Atolls Form', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r58-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to Darwin\'s model, the lagoon of an atoll', [
                'is the crater of the original volcano.',
                'occupies the place where the volcano once stood.',
                'forms before the fringing reef appears.',
                'is created by rain dissolving the limestone.',
              ], 'B', 'Paragraph B: "a lagoon has taken the place of the former volcano. The lagoon is not the former volcanic crater."', 'B'),
              mc(2, 'In the antecedent karst model, the island develops a raised rim because', [
                'coral grows faster at the edges than in the centre.',
                'the volcano beneath pushes the edges upwards.',
                'rain dissolves the exposed reef more slowly at its edge.',
                'the sea deposits sand around the outside.',
              ], 'C', 'Paragraph C: "the rate of dissolution of the exposed coral is lowest along its rim and the rate of dissolution increases inward to its maximum at the center of the island".', 'C'),
              mc(3, 'The word atoll reached European languages through', [
                'an ancient Sanskrit text.',
                'Darwin\'s monograph on coral reefs.',
                'a French writer in the seventeenth century.',
                'sailors from the Maldives.',
              ], 'C', 'Paragraph D: "The word was first transmitted to François Pyrard de Laval\'s French as atollon in 1625".', 'D'),
              mc(4, 'Bermuda is described as a pseudo-atoll because', [
                'it lies too far north for coral to grow.',
                'it is warmed by the Gulf Stream.',
                'it differs from a true atoll in several ways.',
                'its reefs are entirely above the water.',
              ], 'C', 'Paragraph H: "Bermuda is termed a pseudo-atoll because its general form resembles that of an atoll but has several distinguishing characteristics: high elevations, mostly submerged reefs, and a wide reef-front terrace".', 'H'),
            ],
          },
          {
            id: 'r58-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Where atolls are found</strong></p><p>There are roughly {{q5}} atolls in the world. Most of them lie in the {{q6}}, with others in the Indian Ocean and around Indonesia. The Atlantic has no large groups of atolls apart from eight that lie to the east of {{q7}}. Because reef-building corals need warm water, atolls occur only in the tropics and subtropics: the most northerly is {{q8}}, while the most southerly are Elizabeth Reef and Middleton Reef in the {{q9}}.</p>',
            questions: [
              q(5, null, ['440', 'approximately 440'], 'Paragraph F: "There are approximately 440 atolls in the world."', 'F'),
              q(6, null, 'Pacific Ocean', 'Paragraph F: "Most of the world\'s atolls are in the Pacific Ocean".', 'F'),
              q(7, null, 'Nicaragua', 'Paragraph F: "The Atlantic Ocean has no large groups of atolls, other than eight atolls east of Nicaragua".', 'F'),
              q(8, null, 'Kure Atoll', 'Paragraph G: "The northernmost atoll in the world is Kure Atoll".', 'G'),
              q(9, null, 'Tasman Sea', 'Paragraph G: "The southernmost atolls in the world are Elizabeth Reef at 29°57′ S, and nearby Middleton Reef at 29°27′ S, in the Tasman Sea".', 'G'),
            ],
          },
          {
            id: 'r58-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'For an atoll to survive, the growth of its coral must keep pace with changes in sea level.', 'TRUE', 'Paragraph B: "For the atoll to persist, the coral reef must be maintained at the sea surface, with coral growth matching any relative change in sea level".', 'B'),
              q(11, 'Without the Gulf Stream, coral reefs could not develop at the latitude of Bermuda.', 'TRUE', 'Paragraph H: "At this latitude, coral reefs would not develop without the warming waters of the Gulf Stream."', 'H'),
              q(12, 'The land of an atoll usually makes up most of its total area.', 'FALSE', 'Paragraph I: "In most cases, the land area of an atoll is very small in comparison to the total area."', 'I'),
              q(13, 'Kiritimati has a larger population than any other atoll.', 'NOT GIVEN', 'Paragraph I says that some sources "list Kiritimati as the largest atoll in the world in terms of land area", but nothing is said about its population.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
