// Vocably Reading 108 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-108',
  title: 'Reading 108: Anesthesia',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'anesthesia', title: 'Anesthesia: A Controlled Loss of Sensation', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r108-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'the proportion of patients who dream while they are anesthetized', 'I', 'Paragraph I: "An estimated 22% of people do dream under general anesthesia".', 'I'),
              q(2, 'a recommendation about who should be responsible for giving anesthesia', 'K', 'Paragraph K: international standards "highly recommend that anesthesia should be provided, overseen or led by anesthesiologists".', 'K'),
              q(3, 'a list of the kinds of drug a clinician can choose from', 'C', 'Paragraph C: "The types of drugs used include general anesthetics, local anesthetics, hypnotics, dissociatives, sedatives, adjuncts, neuromuscular-blocking drugs, narcotics, and analgesics."', 'C'),
              q(4, 'a comparison of how useful the different parts of a pre-operative assessment are', 'J', 'Paragraph J: "A well-completed medical history will arrive at the correct diagnosis 56% of the time, which increases to 73% with a physical examination. Lab tests help in diagnosis but only in 3% of cases".', 'J'),
            ],
          },
          {
            id: 'r108-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'A patient who is given regional anesthesia is always unconscious.', 'FALSE', 'Paragraph B: regional and local anesthesia "may be used either on its own (in which case the individual remains fully conscious), or in combination with general anesthesia or sedation".', 'B'),
              q(6, 'The patient\'s state of health is the factor with the biggest influence on the risk of complications.', 'TRUE', 'Paragraph D: "Of these factors, the individual\'s health has the greatest impact."', 'D'),
              q(7, 'Benzodiazepine sedatives mainly produce a loss of memory.', 'TRUE', 'Paragraph F: "benzodiazepine-type sedatives" used for sedation "favor amnesia".', 'F'),
              q(8, 'Inhaled anesthetics cause memory loss only at doses that also make the patient unconscious.', 'FALSE', 'Paragraph H: "Inhalational anesthetics will reliably produce amnesia through general suppression of the nuclei at doses below those required for loss of consciousness."', 'H'),
              q(9, 'Anesthesia awareness is more common among older patients.', 'NOT GIVEN', 'Paragraph I says "one or two cases in a thousand have some consciousness" but gives no information about the age of these patients.', 'I'),
            ],
          },
          {
            id: 'r108-notes', type: 'note_completion', wordLimit: W1N,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Preparing a patient for anesthesia</strong></p><ul><li>Anesthesia is not a treatment in itself; it makes other treatments possible</li><li>First stage: risk assessment, consisting of the medical history, a physical examination and {{q10}} tests</li><li>Medical history alone gives the correct diagnosis {{q11}}% of the time; this rises to 73% when a physical examination is added</li><li>Lab tests help with diagnosis in only 3% of cases</li><li>Poor assessment or preparation is the root cause of {{q12}}% of all adverse anesthetic events</li><li>Doctors who specialise in anesthesia are called {{q13}}</li></ul>',
            questions: [
              q(10, null, 'lab', 'Paragraph J: "pre-operative risk assessment consisting of the medical history, physical examination and lab tests".', 'J'),
              q(11, null, '56', 'Paragraph J: "A well-completed medical history will arrive at the correct diagnosis 56% of the time".', 'J'),
              q(12, null, '11', 'Paragraph J: "Incorrect pre-operative assessments or preparations are the root cause of 11% of all adverse anesthetic events."', 'J'),
              q(13, null, 'anesthesiologists', 'Paragraph K: "doctors specialized in the field are termed anesthesiologists".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
