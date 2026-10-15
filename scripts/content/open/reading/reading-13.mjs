// Vocably Reading 13 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-13',
  title: 'Reading 13: The Microwave Oven',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'microwave-oven', title: 'From Radar to the Kitchen: The Microwave Oven', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r13-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs C, D, E, F, I and J from the list of headings below. <em>Write the correct number, i-ix.</em>',
            bank: bank([
              'A secret handed to an ally in return for support',
              'Why professional chefs make little use of microwaves',
              'Cooking with radio waves demonstrated before the war',
              'Health concerns about exposure to microwaves',
              'From costly novelty to everyday household appliance',
              'A new device that produced much shorter wavelengths',
              'What a microwave oven does well and what it cannot do',
              'How much electricity a microwave oven consumes',
              'The engineer who patented the first commercial oven',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'v', 'Paragraph C: the first home oven "was still too large and expensive for general home use", but "After microwave ovens became affordable for residential use in the late 1970s, their use spread into residential kitchens around the world".', 'C'),
              q(2, 'Paragraph D', 'vii', 'Paragraph D: microwaves "rapidly heat foods which can easily burn or turn lumpy if cooked rapidly in conventional pans" but "usually do not directly brown or caramelize food".', 'D'),
              q(3, 'Paragraph E', 'ii', 'Paragraph E: "Microwave ovens have a limited role in professional cooking, because the boiling-range temperatures of a microwave oven do not produce the flavorful chemical reactions".', 'E'),
              q(4, 'Paragraph F', 'iii', 'Paragraph F: "At the 1933 Chicago World\'s Fair, Westinghouse demonstrated the cooking of foods between two metal plates".', 'F'),
              q(5, 'Paragraph I', 'vi', 'Paragraph I: "A higher-powered microwave generator that worked at shorter wavelengths was needed" and Randall and Boot "invented a valve that could produce pulses of microwave radio energy at a wavelength of 10 cm".', 'I'),
              q(6, 'Paragraph J', 'i', 'Paragraph J: Tizard travelled to the US "to offer Britain\'s most valuable technical secrets including the cavity magnetron in exchange for US financial and industrial support".', 'J'),
            ],
          },
          {
            id: 'r13-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(7, 'Percy Spencer\'s oven was based on technology originally developed for military use.', 'TRUE', 'Paragraph B: "He based it on British radar technology which had been developed before and during World War II."', 'B'),
              q(8, 'The first microwave oven for the home was an immediate success with consumers.', 'FALSE', 'Paragraph C: the Tappan oven "was still too large and expensive for general home use".', 'C'),
              q(9, 'Microwave heating is used in industry as well as in the home.', 'TRUE', 'Paragraph C: "In addition to cooking food, microwave ovens are used for heating in many industrial processes."', 'C'),
              q(10, 'The Westinghouse demonstration in 1933 drew large crowds.', 'NOT GIVEN', 'Paragraph F describes what was demonstrated and that "foods like steaks and potatoes could be cooked in minutes", but says nothing about how many people watched.', 'F'),
            ],
          },
          {
            id: 'r13-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The cavity magnetron</strong></p><p>The cavity magnetron was an essential part of the development of short-wavelength {{q11}} during the Second World War. It was built in Britain by Sir John Randall and his colleagues, and in 1940 Randall and Harry {{q12}} produced a working prototype at the University of Birmingham. Later that year the device was taken to the United States, and a 6 kW version made by the General Electric Company was handed to the American government. An American historian later called it the most valuable {{q13}} ever to reach his country, and companies such as {{q14}} were given contracts to manufacture it in large numbers.</p>',
            questions: [
              q(11, null, 'radar', 'Paragraph I: "The cavity magnetron was a crucial component in the development of short wavelength radar during World War II."', 'I'),
              q(12, null, 'Boot', 'Paragraph I: "Randall and Harry Boot produced a working prototype".', 'I'),
              q(13, null, 'cargo', 'Paragraph J: described by James Phinney Baxter III as the "most valuable cargo ever brought to our shores".', 'J'),
              q(14, null, 'Raytheon', 'Paragraph J: "Contracts were awarded to Raytheon and other companies for the mass production of the cavity magnetron."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
