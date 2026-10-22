// Vocably Reading 151 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-151',
  title: 'Reading 151: The Gregorian Calendar',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'gregorian-calendar', title: 'The Gregorian Calendar', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r151-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'the number of weeks contained in one complete calendar cycle', 'H', 'Paragraph H: "The cycle contains exactly 20,871 weeks".', 'H'),
              q(2, 'the name of the last European state to switch to the new calendar', 'D', 'Paragraph D: "with Greece being the last European country to adopt the calendar (for civil use only) in 1923".', 'D'),
              q(3, 'a description of the way the extra day was originally added to the year', 'F', 'Paragraph F: "the leap day, historically, was inserted by doubling 24 February".', 'F'),
              q(4, 'how long it took for Christians to agree on a common date for a festival', 'I', 'Paragraph I: "it took almost five centuries before virtually all Christians achieved that objective".', 'I'),
              q(5, 'a correction to the method used by the Church to predict new moons', 'C', 'Paragraph C: "the reform also altered the lunar cycle used by the Church to calculate the date for Easter, because astronomical new moons were occurring four days before the calculated dates".', 'C'),
            ],
          },
          {
            id: 'r151-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Under the Gregorian rule, both 1600 and 2000 were treated as ordinary years.', 'FALSE', 'Paragraph B: "1800 and 1900 were not leap years, but 1600 and 2000 were".', 'B'),
              q(7, 'The Julian estimate of the length of the year was too long by slightly less than a day every hundred years.', 'TRUE', 'Paragraph C: the Julian calendar was based on "an overestimate of a little under one day per century".', 'C'),
              q(8, 'The reform of 1582 removed ten days from the calendar.', 'TRUE', 'Paragraph C: "the reform advanced the date by 10 days: Thursday 4 October 1582 was followed by Friday 15 October 1582".', 'C'),
              q(9, 'Protestant countries adopted the new calendar as quickly as Catholic ones.', 'FALSE', 'Paragraph D: "Over the next three centuries, the Protestant and Eastern Orthodox countries also gradually moved" to the new calendar.', 'D'),
              q(10, 'The Catholic Church revised its General Roman Calendar in 1969 in order to simplify the dating of feasts.', 'NOT GIVEN', 'Paragraph F mentions "the 1969 revision of its General Roman Calendar" but says nothing about why the revision was made.', 'F'),
            ],
          },
          {
            id: 'r151-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'The Gregorian year of 365.2425 days is a closer match to the ______ year, which is determined by the Earth\'s orbit around the Sun.', ['tropical', 'solar'], 'Paragraph A: "more closely approximating the 365.2422-day tropical, or solar, year that is determined by the Earth\'s revolution around the Sun".', 'A'),
              q(12, 'The date of the March equinox mattered to the churches because it is used to work out when ______ falls.', 'Easter', 'Paragraph C: "This date was important to the Christian churches because it is fundamental to the calculation of the date of Easter."', 'C'),
              q(13, 'During the changeover period, dates were labelled either \'Old Style\' or ______ to avoid confusion.', 'New Style', 'Paragraph D: "both notations were given, tagged as \'Old Style\' or \'New Style\' as appropriate".', 'D'),
              q(14, 'Over a full 400-year cycle there are ______ leap years.', '97', 'Paragraph H: "303 are regular years of 365 days and 97 are leap years of 366 days".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
