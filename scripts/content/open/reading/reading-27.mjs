// Vocably Reading 27 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-27',
  title: 'Reading 27: The Stethoscope',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'stethoscope', title: 'Listening to the Body: The Stethoscope', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r27-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following descriptions (Questions 1-5) and the list of people below. Match each description with the correct inventor or inventors, <strong>A-G</strong>.<br/><strong>NB</strong> There are two names you will not need.',
            bank: bank(['René Laennec', 'Arthur Leared', 'George Philip Cammann', 'Somerville Scott Alison', 'Rappaport and Sprague', 'David Littmann', 'Richard Deslauriers']),
            questions: [
              q(1, 'created a model with one side for the lungs and another for the heart', 'E', 'Paragraph E: "Rappaport and Sprague designed a new stethoscope in the 1940s" consisting "of two sides, one of which is used for the respiratory system, the other for the cardiovascular system".', 'E'),
              q(2, 'patented a device that blocks unwanted sound from the surroundings', 'G', 'Paragraph G: "In 1999, Richard Deslauriers patented the first external noise reducing stethoscope, the DRG Puretone."', 'G'),
              q(3, 'produced a lighter instrument with better sound quality', 'F', 'Paragraph F: "David Littmann, a Harvard Medical School professor, created a new stethoscope that was lighter than previous models and had improved acoustics".', 'F'),
              q(4, 'prepared a design for mass production that has hardly changed since', 'C', 'Paragraph B: "George Philip Cammann, a physician practicing in New York City, perfected for commercial production the design of a stethoscope" and "his design has remained essentially unchanged ever since".', 'B'),
              q(5, 'presented an instrument with two bells for comparing sounds from different places', 'D', 'Paragraph C: "Somerville Scott Alison described his invention of the stethophone at the Royal Society in 1858; the stethophone had two separate bells, allowing the user to hear and compare sounds derived from two discrete locations."', 'C'),
            ],
          },
          {
            id: 'r27-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'A stethoscope is generally used on its own to measure blood pressure.', 'FALSE', 'Paragraph A: "In combination with a manual sphygmomanometer, it is commonly used when measuring blood pressure."', 'A'),
              q(7, 'The differential stethoscope of the 1870s became a standard instrument for doctors.', 'FALSE', 'Paragraph B: "though this did not become a standard tool in clinical practice".', 'B'),
              q(8, 'According to Jacalyn Duffin, the stethoscope helped to change the way disease itself was understood.', 'TRUE', 'Paragraph D: "the invention of the stethoscope marked a major step in the redefinition of disease from being a bundle of symptoms, to the current sense of a disease as a problem with an anatomical system".', 'D'),
              q(9, 'The Rappaport-Sprague stethoscope was more expensive than other models of its time.', 'NOT GIVEN', 'Paragraph E describes the model as "heavy and short" with "an antiquated appearance", but says nothing about its price.', 'E'),
              q(10, 'Research in 2012 found that a stethoscope made a practitioner appear more trustworthy than any other item of equipment did.', 'TRUE', 'Paragraph H: "A 2012 research paper claimed that the stethoscope, when compared to other medical equipment, had the highest positive impact on the perceived trustworthiness of the practitioner seen with it."', 'H'),
            ],
          },
          {
            id: 'r27-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How an acoustic stethoscope works</strong></p><p>Sound travels from the chest piece to the ears through hollow tubes that are filled with {{q11}}. The chest piece normally has two sides. One is a plastic disc known as the {{q12}}, which passes on sounds of higher frequency; the other is a hollow cup called the bell, which carries {{q13}} frequency sounds. The tube leading into the chamber between the two sides is open on one side only and can be turned through {{q14}} degrees to switch from one side to the other.</p>',
            questions: [
              q(11, null, 'air', 'Paragraph J: "Acoustic stethoscopes operate on the transmission of sound from the chest piece, via air-filled hollow tubes, to the listener\'s ears."', 'J'),
              q(12, null, 'diaphragm', 'Paragraph J: "a diaphragm (plastic disc) or bell (hollow cup)" and "the diaphragm transmits higher frequency sounds".', 'J'),
              q(13, null, 'low', 'Paragraph J: "The bell transmits low frequency sounds, while the diaphragm transmits higher frequency sounds."', 'J'),
              q(14, null, '180', 'Paragraph J: "Rotating the tube 180 degrees in the head connects it to the diaphragm."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
