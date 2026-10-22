// Vocably Reading 163 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-163',
  title: 'Reading 163: Sleep',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sleep', title: 'The Science of Sleep', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r163-head', type: 'matching_headings',
            instructionHtml: 'The passage has nine paragraphs, A-I. Choose the correct heading for paragraphs C, D, E, F and I from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Instruments used to record what happens during sleep',
              'The order and timing of the stages in a night\'s sleep',
              'How the brain saves energy while we sleep',
              'Why some people need more sleep than others',
              'Problems with sleeping and the effect of modern lighting',
              'What sleep does for the body and why it may have evolved',
              'How the content of dreams can be interpreted',
              'Treatments for the most common sleep disorders',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'vi', 'Paragraph C: "most of the body\'s systems are in an anabolic state, helping to restore the immune, nervous, skeletal, and muscular systems" and "Sleep is a highly conserved behavior across animal evolution".', 'C'),
              q(2, 'Paragraph D', 'v', 'Paragraph D: "Humans may suffer from various sleep disorders" and "The use of artificial light has substantially altered humanity\'s sleep patterns."', 'D'),
              q(3, 'Paragraph E', 'iii', 'Paragraph E: "The brain uses significantly less energy during sleep than it does when awake, especially during non-REM sleep."', 'E'),
              q(4, 'Paragraph F', 'i', 'Paragraph F: "Key physiological methods for monitoring and measuring changes during sleep include electroencephalography (EEG) of brain waves, electrooculography (EOG) of eye movements, and electromyography (EMG) of skeletal muscle activity."', 'F'),
              q(5, 'Paragraph I', 'ii', 'Paragraph I: "The sleep cycle of alternate NREM and REM sleep takes an average of 90 minutes, occurring 4–6 times in a good night\'s sleep" and "The whole period normally proceeds in the order".', 'I'),
            ],
          },
          {
            id: 'r163-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'A sleeping person is less responsive than someone in a coma.', 'FALSE', 'Paragraph A: sleep "still involves active brain patterns, making it more reactive than a coma or disorders of consciousness".', 'A'),
              q(7, 'Short daytime naps are currently being investigated by researchers.', 'TRUE', 'Paragraph C: "current research is studying power naps".', 'C'),
              q(8, 'Light from digital screens interferes with the release of a hormone that regulates sleep.', 'TRUE', 'Paragraph D: screens "emit large amounts of blue light" and "This disrupts the release of the hormone melatonin needed to regulate the sleep cycle."', 'D'),
              q(9, 'Gamma waves are the most difficult brain waves to detect.', 'NOT GIVEN', 'Paragraph G says "Gamma waves are seen when a person is highly focused on a task or using all their concentration" but says nothing about how hard any wave is to detect.', 'G'),
            ],
          },
          {
            id: 'r163-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The two types of sleep</strong></p><p>Physiologists treat non-REM and REM sleep as separate {{q10}} because the two differ so greatly. Non-REM sleep comes first; after a transitional period it is known as slow-wave sleep or {{q11}}, and during this phase body temperature and heart rate drop. REM sleep, sometimes called {{q12}}, takes up a smaller share of the night and is when most dreaming happens; it involves fast brain waves, eye movements and a loss of {{q13}}. A complete cycle of NREM and REM lasts about {{q14}} minutes on average and is repeated four to six times in a good night\'s sleep.</p>',
            questions: [
              q(10, null, 'behavioral states', 'Paragraph H: "Non-REM and REM sleep are so different that physiologists identify them as distinct behavioral states."', 'H'),
              q(11, null, 'deep sleep', 'Paragraph H: "Non-REM sleep occurs first and after a transitional period is called slow-wave sleep or deep sleep."', 'H'),
              q(12, null, 'paradoxical sleep', 'Paragraph H: "REM sleep, also known as paradoxical sleep, represents a smaller portion of total sleep time."', 'H'),
              q(13, null, 'muscle tone', 'Paragraph H: REM sleep "is associated with desynchronized and fast brain waves, eye movements, loss of muscle tone, and suspension of homeostasis".', 'H'),
              q(14, null, '90', 'Paragraph I: "The sleep cycle of alternate NREM and REM sleep takes an average of 90 minutes, occurring 4–6 times in a good night\'s sleep."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
