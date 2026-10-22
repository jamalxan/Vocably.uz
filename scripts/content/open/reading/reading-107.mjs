// Vocably Reading 107 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-107',
  title: 'Reading 107: Maglev Trains',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'maglev', title: 'Floating on Magnets: The Story of Maglev', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r107-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Eric Laithwaite', 'Albert C. Albertson', 'Alfred Zehden', 'Tom L. Johnson', 'Hermann Kemper', 'Émile Bachelet']),
            questions: [
              q(1, 'received a series of patents in Germany over a period of several years', 'E', 'Paragraph H: "A series of German patents for magnetic levitation trains propelled by linear motors were awarded to Hermann Kemper between 1937 and 1941."', 'H'),
              q(2, 'found a way of using one linear motor to provide both lift and forward movement', 'A', 'Paragraph E: "Laithwaite discovered a new arrangement of magnets, the magnetic river, that allowed a single linear motor to produce both lift and forward thrust".', 'E'),
              q(3, 'tested a vehicle on a track built inside his own home', 'D', 'Paragraph H: Tom L. Johnson\'s "suspended car operated on a 90-foot test track in Johnson\'s basement".', 'H'),
              q(4, 'was granted a patent in which magnets only reduced the load carried by the wheels', 'B', 'Paragraph G: the patent issued to Albert C. Albertson "used magnetic levitation to take part of the weight off of the wheels while using conventional propulsion".', 'G'),
              q(5, 'showed a working model in two different countries', 'F', 'Paragraph I: Bachelet "demonstrated a model train with electromagnetic levitation and propulsion in Mount Vernon, New York" and later went "to demonstrate his model in London, England in 1914".', 'I'),
            ],
          },
          {
            id: 'r107-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Maglev lines are cheaper to construct than conventional railways.', 'FALSE', 'Paragraph A: "they are more expensive to build, cannot use existing infrastructure, and use more energy at high speeds".', 'A'),
              q(7, 'The Shanghai maglev held the record for the fastest passenger service for almost twenty years.', 'TRUE', 'Paragraph B: "From 2002 until 2021, the record for the highest operational speed of a passenger train of 431 kilometres per hour (268 mph) was held by the Shanghai maglev train".', 'B'),
              q(8, 'Most of the energy used by a high-speed maglev goes into keeping the train off the track.', 'FALSE', 'Paragraph C: "The power needed for levitation is typically not a large percentage of the overall energy consumption of a high-speed maglev system. Instead, overcoming drag takes the most energy."', 'C'),
              q(9, 'The Birmingham maglev was replaced by a more reliable system.', 'NOT GIVEN', 'Paragraph F says "The system was closed in 1995 due to reliability problems" but does not mention what, if anything, replaced it.', 'F'),
            ],
          },
          {
            id: 'r107-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In 2015 the Japanese L0 Series reached a record speed of ______ km/h.', '603', 'Paragraph B: "The train speed record of 603 km/h (375 mph) was set by the experimental Japanese L0 Series maglev in 2015."', 'B'),
              q(11, 'Laithwaite joined a British project known as the Tracked ______, which was abandoned in 1973.', ['Hovercraft', 'Hovercraft RTV-31'], 'Paragraph D: "Laithwaite joined one such project, the Tracked Hovercraft RTV-31, based near Cambridge, UK, although the project was canceled in 1973."', 'D'),
              q(12, 'The first commercial maglev people mover ran on a raised section of ______ track about 600 metres long.', 'monorail', 'Paragraph F: "It operated on an elevated 600 metres (2,000 ft) section of monorail track".', 'F'),
              q(13, 'In Bachelet\'s 1912 model, levitation came from the repulsion between electromagnets under the track and an aluminium ______ on the train.', 'base plate', 'Paragraph I: "The electromagnetic levitation was due to the repulsion between the train\'s aluminum base plate and the pulsating-current electromagnets beneath the track."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
