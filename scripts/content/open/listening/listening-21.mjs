// Vocably Listening 21 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-21',
  title: 'Listening 21: Language and National Identity',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'report-language-traditions-central-to-national-identity',
        contextText: 'You will hear a report about a study of what people think makes someone a true member of their nation.',
        questionGroups: [
          {
            id: 'l21-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Pew Research Center study</strong></p><ul><li>included people in more than {{q1}} countries</li><li>asked about four aspects of national identity: language, traditions, {{q2}} and religion</li><li>a median of {{q3}} percent said speaking the main language is important</li><li>in Mexico, {{q4}} percent said speaking Spanish is important</li></ul>',
            questions: [
              q(1, null, '20', 'The speaker says "It included answers from people in more than 20 countries."'),
              q(2, null, 'birthplace', 'The speaker says the four aspects were "language, traditions, birthplace and religion".'),
              q(3, null, '91', 'The speaker says "a median of 91 percent of people across 21 countries said that speaking a country\'s most common language is" important.'),
              q(4, null, '93', 'The speaker says "93 percent of respondents from Mexico said that speaking the country\'s main language" is important.'),
            ],
          },
          {
            id: 'l21-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Which person expresses each of the following views? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bank: bank(['Luciana de Oliveira', 'Jorge Catalan', 'Agatha Janzen']),
            questions: [
              q(5, 'regrets that the government has promoted one language over the others', 'B', 'The speaker says Catalan "noted that the government has pushed Spanish as the main language throughout history".'),
              q(6, 'thinks speaking an official language matters for practical reasons', 'C', 'The speaker quotes Janzen: "speaking one of the official languages is important to being Canadian for practical reasons".'),
              q(7, 'stays connected to their culture through clothing and sport', 'A', 'The speaker says de Oliveira "wears jewelry and shoes from Brazil and follows and supports Brazilian soccer".'),
              q(8, 'does not believe birthplace has anything to do with nationality', 'C', 'The speaker quotes Janzen: "Being born in Canada has nothing to do with being Canadian".'),
            ],
          },
          {
            id: 'l21-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'Which countries tend to see birthplace as more important to national identity?', ['those where immigrants are a smaller share of the population', 'those with a larger share of immigrants', 'those where many languages are spoken', 'those with a single main religion'], 'A', 'The speaker says "Countries where immigrants make up a smaller share of the population tend to see birthplace as a more important aspect of national identity."'),
              mc(10, 'According to Christine Huang, who do people most often report feeling close to?', ['others in their own country', 'people all over the world', 'people in their local community', 'members of their own religion'], 'A', 'The speaker quotes Huang: "people most frequently report feeling close to others in their country".'),
            ],
          },
        ],
      }),
    ],
  },
};
