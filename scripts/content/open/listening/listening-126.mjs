// Vocably Listening 126 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-126',
  title: 'Listening 126: Inside Baseball',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'inside-baseball-other-inside-expressions',
        contextText: 'You will hear a talk about the expression "inside baseball" and other English expressions with the word "inside".',
        questionGroups: [
          {
            id: 'l126-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does "inside baseball" describe?', ['a popular American sport', 'a dramatic way of scoring', 'something only a small group understands', 'a report in the news'], 'C', 'The speaker says "Inside baseball is something that is known or understood only by a small group of people."'),
              mc(2, 'With which subjects is the expression commonly used?', ['sport, music and art', 'politics, science and finance', 'cooking, travel and fashion', 'history, religion and law'], 'B', 'The speaker says "We commonly use this expression with subjects like politics, science, or finance."'),
              mc(3, 'What do the urban voters in the example care about?', ['the details of constitutional reform', 'lower taxes', 'new sports facilities', 'schools, safety and jobs'], 'D', 'The speaker says "they still might support reforms promising good schools, safe neighborhoods, and jobs".'),
            ],
          },
          {
            id: 'l126-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Where the phrase comes from</strong></p><ul><li>Merriam-Webster: the phrase began in the {{q4}}</li><li>to score, a player must reach first, second and third bases and then home {{q5}}</li><li>a home run always pleases the {{q6}}</li><li>a bunt: the bat touches the ball {{q7}} so it stays infield</li></ul>',
            questions: [
              q(4, null, '1890s', 'The speaker says "Merriam Webster online dictionary explains how this phrase began back in the 1890s".'),
              q(5, null, 'plate', 'The speaker says "a player needs to land on first, second, and third bases before reaching home plate".'),
              q(6, null, 'crowd', 'The speaker says "That big hit will always please the crowd!"'),
              q(7, null, 'lightly', 'The speaker says "very short hits called bunts, where the bat touches the ball lightly to keep it infield".'),
            ],
          },
          {
            id: 'l126-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'What does each expression mean? Choose the correct letter, <strong>A-E</strong>.',
            bank: bank(['a joke that only a few people understand', 'a good position in a situation', 'something done with help from a person within an organization', 'information that may give you an advantage over others', 'an obvious, dramatic way of scoring']),
            questions: [
              q(8, 'insider knowledge', 'D', 'The speaker says "This insider knowledge may give you an advantage over others."'),
              q(9, 'inside track', 'B', 'The speaker says "An inside track is a good position in a situation."'),
              q(10, 'inside job', 'C', 'The speaker says "an inside job is something done with the help of someone inside an organization".'),
            ],
          },
        ],
      }),
    ],
  },
};
