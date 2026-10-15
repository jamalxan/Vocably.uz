// Vocably Reading 63 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-63',
  title: 'Reading 63: Caffeine',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'caffeine', title: 'Caffeine: The World\'s Favourite Stimulant', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r63-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(1, 'Which insects are encouraged by caffeine to feed on the plants that produce it?', ['honey bees', 'honeybees'], 'Paragraph B: "encouraging consumption by select animals such as honey bees".', 'B'),
              q(2, 'What is the name of the process of soaking plant material in water to extract caffeine?', 'infusion', 'Paragraph B: "Steeping the plant product in water—a process called infusion—extracts the caffeine".', 'B'),
              q(3, 'Roughly how many tonnes of coffee beans were consumed around the world in 2020?', ['10 million', 'almost 10 million', '10 million tonnes'], 'Paragraph B: "In 2020, almost 10 million tonnes of coffee beans were consumed globally."', 'B'),
              q(4, 'Which disease may caffeine offer some protection against?', ['Parkinson\'s disease', 'Parkinson\'s', 'Parkinsons disease'], 'Paragraph C: "a modest protective effect against some diseases, including Parkinson\'s disease".', 'C'),
            ],
          },
          {
            id: 'r63-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'According to paragraph A, caffeine keeps people awake mainly because it', ['increases the amount of adenosine in the brain.', 'prevents adenosine from attaching to its receptors.', 'destroys adenosine in the bloodstream.', 'lowers the level of calcium in cells.'], 'B', 'Paragraph A: "Caffeine acts by blocking the binding of adenosine at a number of adenosine receptor types".', 'A'),
              mc(6, 'What does the writer say about caffeine during pregnancy?', ['It is clearly harmful to the unborn child.', 'Pregnant women are advised to avoid it completely.', 'The evidence of risk is unclear, so some authorities suggest a limit.', 'It has no effect at all during pregnancy.'], 'C', 'Paragraph C: "Evidence of a risk during pregnancy is equivocal; some authorities recommend that pregnant women limit caffeine to the equivalent of two cups of coffee per day or less."', 'C'),
              mc(7, 'Why is an ordinary coffee drinker unlikely to reach a fatal dose?', ['Coffee contains almost no caffeine.', 'The body breaks down caffeine within minutes.', 'Regular drinkers are protected by tolerance.', 'It would take something like 50 to 100 cups of coffee.'], 'D', 'Paragraph D: "roughly 50–100 ordinary cups of coffee would be required to reach a lethal dose".', 'D'),
              mc(8, 'How does caffeine compare with other treatments for children with ADHD?', ['It works better than methylphenidate.', 'It is weaker than standard drugs but better than a placebo.', 'It is no more effective than a placebo.', 'It has never been tested on children.'], 'B', 'Paragraph G: "It is considered less effective than methylphenidate or amphetamine but more so than placebo for children with ADHD."', 'G'),
            ],
          },
          {
            id: 'r63-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(9, 'Caffeine helps plants by stopping nearby seeds from sprouting.', 'TRUE', 'Paragraph B: it protects them "from competition by preventing the germination of nearby seeds".', 'B'),
              q(10, 'The sale of caffeine is strictly controlled by law in most countries.', 'FALSE', 'Paragraph B: "caffeine remains largely unregulated and legal in nearly all parts of the world".', 'B'),
              q(11, 'Giving up caffeine after regular use can cause headaches.', 'TRUE', 'Paragraph C: "withdrawal symptoms such as sleepiness, headache, and irritability".', 'C'),
              q(12, 'Powdered caffeine supplements are more popular than coffee.', 'NOT GIVEN', 'Paragraph D says only that "pure powdered caffeine, which is available as a dietary supplement, can be lethal in tablespoon-sized amounts"; nothing is said about how popular it is.', 'D'),
              q(13, 'There is strong evidence that coffee is an effective treatment for asthma.', 'FALSE', 'Paragraph F: "Evidence to support this practice is poor."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
