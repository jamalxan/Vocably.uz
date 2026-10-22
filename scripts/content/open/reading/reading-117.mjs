// Vocably Reading 117 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-117',
  title: 'Reading 117: Lightning',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'lightning', title: 'Understanding Lightning', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r117-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Both of the charged regions involved in a lightning discharge are always in the atmosphere.', 'FALSE', 'Paragraph A: "One or both regions are within the atmosphere, with the second region sometimes occurring on the ground."', 'A'),
              q(2, 'The air near a lightning flash is heated to roughly 30,000 degrees Celsius.', 'TRUE', 'Paragraph B: "The air around the lightning flash rapidly heats to temperatures of about 30,000 °C (54,000 °F)."', 'B'),
              q(3, 'Lightning can be produced by volcanic eruptions.', 'TRUE', 'Paragraph C: lightning can "also commonly occur in other types of energetic weather systems, such as volcanic eruptions".', 'C'),
              q(4, 'Dry lightning is the main cause of forest fires.', 'NOT GIVEN', 'Paragraph D says only that dry lightning is a type "which can cause forest fires"; it does not say how many fires it causes compared with other causes.', 'D'),
              q(5, 'Ball lightning has been studied in detail by scientists.', 'FALSE', 'Paragraph D: "ball lightning, which is rarely observed scientifically".', 'D'),
            ],
          },
          {
            id: 'r117-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the passage say about intra-cloud and cloud-to-cloud lightning?', ['They have no effect on humans.', 'They occur less often than cloud-to-ground lightning.', 'They affect people indirectly by changing the chemistry of the atmosphere.', 'They are the easiest types of lightning to study.'], 'C', 'Paragraph E: "Intra-cloud and cloud-to-cloud lightning indirectly affect humans through their influence on atmospheric chemistry."', 'E'),
              mc(7, 'How does a cloud-to-ground discharge start?', ['A streamer moves down from the cloud to the ground.', 'A stepped leader comes down from the cloud and meets a streamer rising from the ground.', 'A return stroke travels up from the ground.', 'A dart leader joins the cloud to the ground.'], 'B', 'Paragraph F: "It is initiated by a stepped leader moving down from the cloud, which is met by a streamer moving up from the ground."', 'F'),
              mc(8, 'Why is cloud-to-ground lightning the best understood type?', ['It happens more often than any other type.', 'It ends on a physical object and can be measured by instruments on the ground.', 'It carries more electrical energy than other types.', 'It has the greatest influence on atmospheric chemistry.'], 'B', 'Paragraph G: "It is easier to study scientifically because it terminates on a physical object, namely the ground, and lends itself to being measured by instruments on the ground."', 'G'),
              mc(9, 'In most cloud-to-ground flashes,', ['electrons travel upwards along the lightning channel.', 'a positive charge is carried down to the ground.', 'a negative charge is transferred down to the ground.', 'the conventional current flows from the cloud to the ground.'], 'C', 'Paragraph I: "Most CG lightning is negative, meaning that a negative charge is transferred (electrons flow) downwards to ground along the lightning channel".', 'I'),
            ],
          },
          {
            id: 'r117-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The complete discharge, made up of several different processes, is known as a ______.', 'flash', 'Paragraph H: "The overall discharge, termed a flash, is composed of a number of processes".', 'H'),
              q(11, 'Changes in cloud charging may be caused by variations in precipitation or in vertical ______.', 'wind shear', 'Paragraph J: "Such changes in cloud charging may come about as a result of variations in vertical wind shear or precipitation, or dissipation of the storm."', 'J'),
              q(12, 'A typical bolt of negative lightning carries a current of ______ amperes.', ['30,000', '30000'], 'Paragraph K: "An average bolt of negative lightning creates an electric current of 30,000 amperes (30 kA)".', 'K'),
              q(13, 'Positive ground flashes with high peak currents are often followed by long ______.', 'continuing currents', 'Paragraph K: "positive ground flashes with high peak currents are commonly followed by long continuing currents, a correlation not seen in negative ground flashes".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
