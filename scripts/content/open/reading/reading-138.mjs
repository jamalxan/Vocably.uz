// Vocably Reading 138 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-138',
  title: 'Reading 138: The Yawn',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'yawn', title: 'Why Do We Yawn?', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r138-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'a reference to soldiers yawning shortly before a dangerous act', 'G', 'Paragraph G: "Paratroopers have been noted to yawn during the moments before they exit their aircraft."', 'G'),
              q(2, 'the name of the scientific study of yawning', 'A', 'Paragraph A: "The study of yawning is called chasmology."', 'A'),
              q(3, 'a comparison between yawning and a sound made by another social animal', 'K', 'Paragraph K: "similar to howling in a wolf pack".', 'K'),
              q(4, 'the source of a noise that seems to come from inside the head', 'C', 'Paragraph C: "The tensor tympani muscle in the middle ear contracts, which creates a rumbling noise perceived as coming from within the head".', 'C'),
              q(5, 'experiments in which cooling the head reduced the urge to yawn', 'H', 'Paragraph H: "subjects with cold packs attached to their foreheads and subjects asked to breathe strictly nasally exhibited reduced contagious yawning".', 'H'),
            ],
          },
          {
            id: 'r138-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the writer say about the psychological explanations for yawning?', ['Scholars have settled on one main cause.', 'Around twenty have been suggested, but none is agreed to be the most important.', 'Most have been disproved by experiments.', 'They apply only to human beings.'], 'B', 'Paragraph B: "Approximately twenty psychological reasons for yawning have been proposed by scholars, but there is little agreement on the primacy of any one."', 'B'),
              mc(7, 'What is said about the idea that yawning supplies the body with extra oxygen?', ['It is supported by the fact that extra oxygen reduces yawning.', 'Yawning may in fact take in less oxygen than ordinary breathing.', 'It was confirmed by a study in 2007.', 'It explains why animals yawn in groups.'], 'B', 'Paragraph E: "Yawning may reduce oxygen intake compared to normal respiration; however, the frequency of yawning is not decreased by providing more oxygen or reducing carbon dioxide in the air."', 'E'),
              mc(8, 'The study mentioned in Paragraph F suggests that contagious yawning may have developed in order to', ['help a group of animals fall asleep at the same time.', 'cool the brains of animals in hot climates.', 'keep the members of a group ready for action.', 'warn predators to stay away.'], 'C', 'Paragraph F: contagious yawning "may have developed as a way of keeping a group of animals alert".', 'F'),
              mc(9, 'What did Guttmann and Dopart conclude about yawning?', ['It always lowers the pressure inside the brain.', 'It produces one of three possible changes in the brain.', 'It temporarily prevents people from hearing.', 'It raises the level of cortisol in the body.'], 'B', 'Paragraph I: "Guttmann and Dopart determined that a yawn causes one of three possible situations to occur".', 'I'),
            ],
          },
          {
            id: 'r138-sent', type: 'sentence_completion', wordLimit: W3,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In fish and birds, a yawn is defined as the mouth remaining open for at least ______.', ['three seconds', '3 seconds'], 'Paragraph A: "staying open for at least three seconds and subsequently a rapid closure of the mouth".', 'A'),
              q(11, 'Copying another person\'s yawn is described as an example of ______ as well as positive feedback.', 'echopraxia', 'Paragraph B: "This is a typical example of echopraxia and positive feedback."', 'B'),
              q(12, 'During a yawn, the airway widens to ______ times its normal size.', 'three or four', 'Paragraph C: "the airway (lungs and throat) dilates to three or four times its original size".', 'C'),
              q(13, 'Research at Bournemouth University has shown that levels of ______ increase while a person is yawning.', 'cortisol', 'Paragraph J: "A professor of clinical and forensic neuropsychology at Bournemouth University has demonstrated that cortisol levels rise during yawning."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
