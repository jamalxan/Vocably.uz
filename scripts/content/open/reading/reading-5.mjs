// Vocably Reading 5 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-5',
  title: 'Reading 5: Jet Lag',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'jet-lag', title: 'Jet Lag: When the Body Clock Falls Behind', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r5-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Flying eastwards generally causes more difficulty in adjusting than flying westwards.', 'TRUE', 'Paragraph A: "Most travellers find that it is harder to adjust time zones when travelling east."', 'A'),
              q(2, 'Jet lag is officially classed as a type of ordinary travel tiredness.', 'FALSE', 'Paragraph A: it is classified as "a circadian rhythm sleep disorder, reflecting its basis in disrupted biological timing rather than general travel fatigue".', 'A'),
              q(3, 'Recovery from jet lag typically takes about a day for each time zone crossed.', 'TRUE', 'Paragraph B: "it takes on average one day per hour of time zone change to reach circadian re-entrainment".', 'B'),
              q(4, 'Airlines pay pilots extra for flights that cross many time zones.', 'NOT GIVEN', 'Paragraph B says only that "Airlines have regulations aimed at combating pilot fatigue caused by jet lag"; nothing is said about pay.', 'B'),
              q(5, 'Before the jet age, most long journeys were made by road.', 'FALSE', 'Paragraph D: "most long distance travel was done by sea and rail".', 'D'),
            ],
          },
          {
            id: 'r5-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the passage, the word "lag" in "jet lag" refers to', ['the delay before an aircraft is able to take off.', 'the time the body needs to adapt to a new time zone.', 'the relatively slow speed of early jet aircraft.', 'the hours that are lost when flying east.'], 'B', 'Paragraph F: "The body\'s feeling of having to adjust to the new time zone serves as the inspiration for the" lag part of the term.', 'F'),
              mc(7, 'In his 1966 article, Horace Sutton compared jet lag to', ['seasickness.', 'a hangover.', 'a fever.', 'exhaustion after a long walk.'], 'B', 'Paragraph F: Sutton called it "a debility not unakin to a hangover".', 'F'),
              mc(8, 'What has research shown about simple analogue scales?', ['They are the most accurate way of measuring jet lag.', 'They fail to capture the full range of jet lag problems.', 'They were first developed in Liverpool.', 'They are only suitable for use with athletes.'], 'B', 'Paragraph G: "a study has shown that these are relatively blunt for assessing all the problems associated with jet lag".', 'G'),
              mc(9, 'How do many athletes deal with jet lag before major international competitions?', ['They train only in their home time zone.', 'They take medication during the flight.', 'They arrive several weeks before the event.', 'They avoid travelling in an easterly direction.'], 'C', 'Paragraph H: "many athletes arrive at least 2–4 weeks ahead of these events, to help adjust from any jet lag issues".', 'H'),
            ],
          },
          {
            id: 'r5-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In which newspaper did the term "jet lag" first appear in print?', 'Los Angeles Times', 'Paragraph F: "The term\'s first use was found in a Los Angeles Times article on February 13, 1966."', 'F'),
              q(11, 'In which decade did researchers begin to connect jet lag with circadian rhythms?', ['1970s', 'the 1970s'], 'Paragraph E: "Jet lag started to be associated with circadian rhythms in the 1970s".', 'E'),
              q(12, 'What kind of sleep problem is typical after a flight in a westerly direction?', 'early awakening', 'Paragraph G: "trouble falling asleep (when flying east), early awakening (when flying west)".', 'G'),
              q(13, 'How many hours of time zone change are usually needed before jet lag occurs?', ['three', '3', 'three or more'], 'Paragraph H: "Jet lag may require three or more hours of time zone change to occur".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
