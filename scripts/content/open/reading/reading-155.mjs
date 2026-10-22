// Vocably Reading 155 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, YNNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-155',
  title: 'Reading 155: Curiosity',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'curiosity', title: 'Curiosity: The Urge to Know', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r155-ynng', type: 'yes_no_notgiven', instructionHtml: YNNG_INSTRUCTION,
            questions: [
              q(1, 'Curiosity is the main force behind human progress in areas such as science.', 'YES', 'Paragraph B: "Curiosity as a behavior and emotion is the driving force behind human development, such as progress in science, language, and industry."', 'B'),
              q(2, 'Among animals, attraction to new things is more common than fear of them.', 'NO', 'Paragraph C: "For animals, a fear of the unknown or the new, neophobia, is much more common, especially later in life."', 'C'),
              q(3, 'A person\'s level of curiosity is fixed from birth.', 'NO', 'Paragraph D: "curiosity is not a fixed attribute amongst humans but rather can be nurtured and developed throughout life".', 'D'),
              q(4, 'Curiosity can be observed in people of every age.', 'YES', 'Paragraph D: "It is common in human beings at all ages from infancy through adulthood."', 'D'),
              q(5, 'Berlyne\'s classification of variables is the most influential theory of curiosity.', 'NOT GIVEN', 'Paragraph F explains that "Daniel Berlyne recognized three classes of variables playing a role in evoking curiosity" but says nothing about how influential his ideas are compared with others.', 'F'),
            ],
          },
          {
            id: 'r155-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to Berlyne, \'collative variables\' involve', ['the physical strength of a stimulus.', 'how relevant a stimulus is to a task.', 'comparing one stimulus or feature with another.', 'the complete absence of stimulation.'], 'C', 'Paragraph F: "Collative variables involve a comparison between different stimuli or features, which may be actually perceived or which may be recalled from memory."', 'F'),
              mc(7, 'What does the writer say about \'diversive exploration\'?', ['It is a reaction to a surprising stimulus.', 'It is triggered by having too little to do.', 'It consists mainly of asking questions.', 'It occurs only in human beings.'], 'B', 'Paragraph F: curiosity may also be aroused "by a lack of stimulation, out of" boredom, which Berlyne called diversive exploration.', 'F'),
              mc(8, 'Curiosity-driven behaviour is defined in the passage as behaviour that', ['reduces the amount of sensory information received.', 'is always expressed through speech.', 'only takes place in response to a reward.', 'results in knowledge being acquired.'], 'D', 'Paragraph G: "Curiosity-driven behavior is often defined as behavior through which knowledge is gained – a form of exploratory behavior."', 'G'),
              mc(9, 'According to curiosity-drive theory, exploratory behaviour stops when', ['a person has made sense of something unfamiliar.', 'the person becomes bored.', 'a new stimulus appears.', 'basic needs such as hunger take over.'], 'A', 'Paragraph I: "Once understanding of the unfamiliar has been achieved and coherence has been restored, these behaviors and desires subside."', 'I'),
            ],
          },
          {
            id: 'r155-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'An object that provokes curiosity may be called a ______.', 'curio', 'Paragraph A: "When it is for an object it may be called a curio".', 'A'),
              q(11, 'Animals that seek out information in order to adapt to their surroundings display a behaviour called ______.', 'neophilia', 'Paragraph C: "This behavior is termed neophilia, the love of new things."', 'C'),
              q(12, 'Berlyne named four collative variables: novelty, complexity, uncertainty and ______.', 'conflict', 'Paragraph F: "Berlyne mentioned four collative variables: novelty, complexity, uncertainty, and conflict".', 'F'),
              q(13, 'Once aroused, curiosity is regarded as inherently ______ and pleasurable.', 'rewarding', 'Paragraph H: "when one\'s curiosity has been aroused it is considered inherently rewarding and pleasurable".', 'H'),
              q(14, 'The curiosity-drive model cannot account for curiosity that appears when no ______ stimuli are present.', ['novel', 'new', 'arousing'], 'Paragraph J: "The observation of curiosity even in the absence of novel stimuli pinpoints one of the major shortcomings in the curiosity-drive model."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
