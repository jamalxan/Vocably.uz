// Vocably Reading 48 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-48',
  title: 'Reading 48: The Global Positioning System',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'global-positioning-system', title: 'How GPS Came About', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r48-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'A GPS receiver needs an Internet connection in order to work.', 'FALSE', 'Paragraph A: GPS "operates independently of any telephone or Internet reception".', 'A'),
              q(2, 'The decision to open GPS to civilians followed the shooting down of a passenger aircraft.', 'TRUE', 'Paragraph B: "After Korean Air Lines Flight 007 was shot down when it mistakenly entered Soviet airspace, President Ronald Reagan determined that the GPS system would be made available for civilian use".', 'B'),
              q(3, 'During the Gulf War, many American soldiers used GPS receivers that were not military equipment.', 'TRUE', 'Paragraph C: "many US soldiers were using civilian GPS units sent from home".', 'C'),
              q(4, 'Selective Availability was switched off in 2007.', 'FALSE', 'Paragraph C: Bill Clinton ordered "that Selective Availability be disabled on May 1, 2000".', 'C'),
              q(5, 'Receivers used for land surveying cost more than consumer devices.', 'NOT GIVEN', 'Paragraph D says surveying receivers "are accurate to within 2 cm" but gives no information about their price.', 'D'),
            ],
          },
          {
            id: 'r48-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 6-9) and the list of people below. Match each statement with the correct person or people, <strong>A-E</strong>.',
            bank: bank(['Gladys West', 'Friedwardt Winterberg', 'William Guier and George Weiffenbach', 'Frank McClure', 'Roger L. Easton']),
            questions: [
              q(6, 'suggested using clocks in orbit to test a scientific theory', 'B', 'Paragraph F: "In 1955, Friedwardt Winterberg proposed a test of general relativity".', 'F'),
              q(7, 'worked out the position of a spacecraft from its radio signals', 'C', 'Paragraph G: "because of the Doppler effect, they could pinpoint where the satellite was along its orbit".', 'G'),
              q(8, 'proposed turning a calculation around in order to locate a user on the ground', 'D', 'Paragraph H: Frank McClure "asked Guier and Weiffenbach to investigate the inverse problem".', 'H'),
              q(9, 'produced a mathematical model of the shape of the Earth', 'A', 'Paragraph E: "The work of Gladys West of the Ballistic Sciences Branch at Dahlgren Naval Proving Ground on the creation of the mathematical geodetic Earth model".', 'E'),
            ],
          },
          {
            id: 'r48-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'How many satellites made up the complete GPS system when it became operational in 1993?', '24', 'Paragraph B: "the full constellation of 24 satellites became operational in 1993".', 'B'),
              q(11, 'What was the average accuracy of civilian GPS while Selective Availability was in use?', ['100 meters', '100 metres', '100m'], 'Paragraph B: "initially this civilian use was limited to an average accuracy of 100 meters (330 ft)".', 'B'),
              q(12, 'Which signal band do receivers with an accuracy of 30 centimetres use?', ['L5', 'the L5 band', 'L5 band'], 'Paragraph D: "GPS receivers that use the L5 band have much higher accuracy of 30 centimeters".', 'D'),
              q(13, 'By how many microseconds a day do the satellite clocks run faster than clocks on Earth?', '38', 'Paragraph F: "run 38 microseconds faster per day than those on the Earth".', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
