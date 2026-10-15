// Vocably Listening 22 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-22',
  title: 'Listening 22: Breeding Heat-Resistant Corals',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'scientists-say-they-have-bred-corals-to-better-resist-warm-oceans',
        contextText: 'You will hear a science report about an attempt to help corals survive in warmer oceans.',
        questionGroups: [
          {
            id: 'l22-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What happens when corals bleach?', ['They release the algae that give them energy and colour.', 'They move to cooler water.', 'They turn into hard rock.', 'They grow much faster.'], 'A', 'The speaker says bleaching happens when corals react to climate pressures "by releasing algae organisms that provide them with energy and give them their color".'),
              mc(2, 'How many countries, territories or economies reported bleaching since February 2023?', ['at least 53', 'at least 25', 'at least 10', 'at least 35'], 'A', 'The speaker says "at least 53 countries, territories, or local economies reported ongoing bleaching events".'),
              mc(3, 'What does the speaker say about selective breeding?', ['Scientists have used it for a long time to produce plants and animals with desirable qualities.', 'It was invented at Newcastle University.', 'It is a way of cooling the oceans.', 'It measures ocean temperatures.'], 'A', 'The speaker says "Scientists have long used this method to produce animals and plants with more desirable characteristics."'),
            ],
          },
          {
            id: 'l22-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Newcastle University study</strong></p><p>The study, published in Nature Communications, found that heat tolerance improved even within a single {{q4}}. Corals that already show heat-resistant qualities are used as the {{q5}} of new corals. However, the team warned that breeding alone would not be enough, because ocean warming will continue without urgent climate {{q6}}. The experiments were part of a {{q7}}-year project launched by James Guest.</p>',
            questions: [
              q(4, null, 'generation', 'The speaker says the methods "resulted in improved heat tolerance of adult corals, even within a single generation".'),
              q(5, null, 'parents', 'The speaker says "These corals are used as the parents for new corals."'),
              q(6, null, 'action', 'The speaker says the methods "must be a part of overall efforts that require" what the scientists call "urgent climate action".'),
              q(7, null, ['five', '5'], 'The speaker says the experiments "were carried out during a five-year project launched by Newcastle\'s James Guest".'),
            ],
          },
          {
            id: 'l22-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'How many days did the short, intense heat test last?', ['10 days', '10', 'ten days', 'ten'], 'The speaker says the first test was "over 10 days with a temperature rise".'),
              q(9, 'What percentage of the increased heat tolerance was linked to genes from the parent corals?', ['25 percent', '25', '25%'], 'The speaker says "about 25 percent of the increased heat tolerance was linked to genes passed down from parents".'),
              q(10, 'Where do the researchers plan to carry out large experiments next?', ['in the wild', 'the wild', 'wild', 'on ocean reefs', 'ocean reefs'], 'The speaker says they plan "to carry out large experiments on corals in the wild to confirm the study results".'),
            ],
          },
        ],
      }),
    ],
  },
};
