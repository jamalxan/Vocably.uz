// Vocably Listening 91 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-91',
  title: 'Listening 91: Great Smoky Mountains',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-great-smoky-mountains',
        contextText: 'You will hear a talk about the most visited national park in the United States.',
        questionGroups: [
          {
            id: 'l91-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Creating the park</strong></p><ul><li>the park lies in two states: Tennessee and North {{q1}}</li><li>in {{q2}} Ann Davis visited national parks in the west and proposed one for the Smokies</li><li>as a state politician she proposed buying over {{q3}} hectares from a lumber company</li><li>the park was established in 1934 but officially dedicated by President Roosevelt in {{q4}}</li></ul>',
            questions: [
              q(1, null, 'Carolina', 'The speaker says the park stretches across "Tennessee and North Carolina".'),
              q(2, null, '1923', 'The speaker says "In 1923, Davis visited some of the national parks in the western United States."'),
              q(3, null, ['30,000', '30000'], 'The speaker says her bill would "permit the purchase of more than 30,000 hectares of land from the Little River Lumber Company".'),
              q(4, null, '1940', 'The speaker says "the official dedication did not take place until 1940".'),
            ],
          },
          {
            id: 'l91-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What is unusual about the Great Smoky Mountains National Park?', ['It is the largest park in the country.', 'Visitors do not have to pay to enter.', 'It has no roads for cars.', 'It is only open in summer.'], 'B', 'The speaker says "it is one of the few national parks that is free to enter".'),
              mc(6, 'About how many black bears live in the park?', ['110', '270', '1,500', '9,000'], 'C', 'The speaker says "Scientists say around 1,500 black bears live in the Great Smoky Mountains National Park."'),
              mc(7, 'What does the speaker say about Cades Cove?', ['It was never lived in by Europeans.', 'Around 270 people lived there in the 1830s.', 'Its old buildings have all been removed.', 'It is closed to protect the bears.'], 'B', 'The speaker says "around 270 people lived in Cades Cove".'),
            ],
          },
          {
            id: 'l91-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'How high, in metres, is Clingmans Dome?', ['2,024', '2024'], 'The speaker says "At the top of the 2,024-meter-tall mountain is an observation tower."'),
              q(9, 'Apart from cars, where does most of the air pollution come from?', ['electric power centers', 'power centers', 'electric power centres', 'power centres'], 'The speaker says "Most comes from electric power centers and cars."'),
              q(10, 'From which city can visitors take a trolley car into the park?', 'Gatlinburg', 'The speaker says visitors should "consider using public transportation from the city of Gatlinburg, Tennessee".'),
            ],
          },
        ],
      }),
    ],
  },
};
