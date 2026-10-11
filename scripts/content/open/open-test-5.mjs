// Vocably Open Test 5 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-5',
  title: "Great Wall, Honey Bees, Penicillin",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'great-wall-of-china', title: 'The Great Wall of China', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o5-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'the reason why a ruler destroyed some existing walls', 'D', 'Paragraph D: he wanted "to centralize rule and prevent the resurgence of feudal lords" and ordered the destruction of walls "that divided his empire".', 'D'),
              q(2, 'a popular but false belief about what was put into the wall', 'G', 'Paragraph G: "no human bones or body parts were ever incorporated into the mortar or any part of the wall, contrary to urban legend".', 'G'),
              q(3, 'the number of watchtowers built under one general\'s supervision', 'E', 'Paragraph E: "Under general Qi Jiguang\'s supervision, 1,200 watchtowers ... were constructed".', 'E'),
              q(4, 'a comparison that shows how hard the wall would be to see from very far away', 'I', 'Paragraph I: it would look like "a human hair viewed from 3 km (2 mi) away".', 'I'),
              q(5, 'criticism of a modern repair to the wall', 'H', 'Paragraph H: "In 2014 a portion of the wall ... was repaired with concrete. The work has been much criticized."', 'H'),
            ],
          },
          {
            id: 'o5-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The first walls were built in the 7th century BC.', 'TRUE', 'Paragraph A: "The first walls date to the 7th century BC".', 'A'),
              q(7, 'The Great Wall was also used to collect payments on goods carried along the Silk Road.', 'TRUE', 'Paragraph B: "the imposition of duties on goods transported along the Silk Road".', 'B'),
              q(8, 'Bricks were harder to work with than earth and stone.', 'FALSE', 'Paragraph F: "The size and weight of the bricks made them easier to work with than earth and stone".', 'F'),
              q(9, 'The sections of the wall in Gansu province are the most visited by tourists.', 'NOT GIVEN', 'Paragraph H mentions erosion of the Gansu section but says nothing about tourist numbers.', 'H'),
            ],
          },
          {
            id: 'o5-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The earliest walls were made mostly of stone or by stamping earth and ______ between board frames.', 'gravel', 'Paragraph C: "by stamping earth and gravel between board frames".', 'C'),
              q(11, 'The mortar used to hold bricks together was made from sticky rice soup mixed with ______.', ['slaked lime', 'lime'], 'Paragraph G: "sticky rice soup mixed with slaked lime".', 'G'),
              q(12, 'According to a 2012 report, ______ of the Ming Great Wall has disappeared.', ['22%', '22 percent'], 'Paragraph H: "22% of the Ming Great Wall, or 1,961 km (1,219 mi), has disappeared".', 'H'),
              q(13, 'Signal towers were built on hill tops and other high points because of their ______.', 'visibility', 'Paragraph G: "Signal towers were built upon hill tops or other high points along the wall for their visibility."', 'G'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'western-honey-bee', title: 'The Western Honey Bee', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o5-r2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The life of a worker bee</strong></p><ul><li>first 10 days: clean the hive and feed the {{q14}}</li><li>next: build comb {{q15}}</li><li>days 16 to 20: receive and store nectar and {{q16}}</li><li>after day {{q17}}: spends the rest of its life as a forager</li></ul><p><strong>The queen</strong></p><ul><li>average lifespan: three to {{q18}} years</li></ul>',
            questions: [
              q(14, null, 'larvae', 'Paragraph E: "worker bees clean the hive and feed the larvae".', 'E'),
              q(15, null, 'cells', 'Paragraph E: "they begin building comb cells".', 'E'),
              q(16, null, 'pollen', 'Paragraph E: "workers receive nectar and pollen from older workers and store it".', 'E'),
              q(17, null, ['20', '20th'], 'Paragraph E: "After the 20th day, a worker leaves the hive and spends the remainder of its life as a forager."', 'E'),
              q(18, null, ['five', '5'], 'Paragraph F: "the average lifespan of a queen in most subspecies is three to five years".', 'F'),
            ],
          },
          {
            id: 'o5-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(19, 'Why can western honey bee colonies be considered "superorganisms"?', 'C', 'Paragraph C: "reproduction of the colony, rather than individual bees, is the biologically significant unit".', opts('They contain more bees than any other insect colony.', 'Each bee can survive for several years.', 'The reproduction of the colony matters more than that of individual bees.', 'They can live on every continent.'), 'C'),
              mc(20, 'When a colony swarms, the old queen leaves together with', 'B', 'Paragraph D: "the old queen and approximately two-thirds of the adult workers leave the colony in a swarm".', opts('all of the worker bees.', 'about two-thirds of the adult workers.', 'the new daughter queens.', 'only the male bees.'), 'D'),
              mc(21, 'Why do beekeepers often replace queens every year or two?', 'D', 'Paragraph F: "Because a queen\'s store of sperm is depleted near the end of her life, she begins laying more unfertilised eggs".', opts('Older queens become aggressive.', 'Older queens stop producing wax.', 'New queens collect more nectar.', 'Older queens lay more unfertilised eggs.'), 'F'),
              mc(22, 'What does the round dance tell other foragers?', 'A', 'Paragraph I: "the round dance tells other foragers that food is within 50 metres (160 ft) of the hive".', opts('that food is less than 50 metres from the hive', 'the exact direction of the food', 'which type of flower to visit', 'that the hive is too hot'), 'I'),
            ],
          },
          {
            id: 'o5-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'European honey bees were brought to North America by humans in the early 1600s.', 'TRUE', 'Paragraph B: "introducing European subspecies into North America (early 1600s)".', 'B'),
              q(24, 'Honey bees can fly whatever their body temperature is.', 'FALSE', 'Paragraph G: "The western honey bee needs an internal body temperature of 35 °C (95 °F) to fly".', 'G'),
              q(25, 'A "honeycrop droplet" can lower the temperature of a bee\'s head by 10 °C.', 'TRUE', 'Paragraph H: it "reduces the temperature of its head by 10 °C".', 'H'),
              q(26, 'Karl von Frisch kept bees as a hobby before he began studying them.', 'NOT GIVEN', 'Paragraph I describes his prize-winning research but nothing about a hobby.', 'I'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'penicillin', title: 'The Story of Penicillin', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o5-r3-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 27-32) and the list of people below. Match each statement with the correct person or people, <strong>A-F</strong>.',
            bank: [
              { key: 'A', text: 'Alexander Fleming' }, { key: 'B', text: 'Cecil George Paine' }, { key: 'C', text: 'Howard Florey' },
              { key: 'D', text: 'Ernst Chain and Edward Abraham' }, { key: 'E', text: 'G. Raymond Rettew' }, { key: 'F', text: 'Andrew Jackson Moyer' },
            ],
            questions: [
              q(27, 'was the first to use penicillin successfully to treat an eye infection', 'B', 'Paragraph A: "Cecil George Paine was the first to successfully use penicillin to treat eye infection".', 'A'),
              q(28, 'found that some bacteria produce an enzyme that breaks down penicillin', 'D', 'Paragraph I: "they discovered that unsusceptible bacteria like Escherichia coli produced specific enzymes that can break down penicillin molecules".', 'I'),
              q(29, 'patented methods for producing penicillin in large quantities', 'F', 'Paragraph G: "Methods for mass production of penicillin were patented by Andrew Jackson Moyer in 1945."', 'G'),
              q(30, 'was advised that patenting penicillin would be unethical', 'C', 'Paragraph G: "Florey had not patented penicillin, having been advised by Sir Henry Dale that doing so would be unethical."', 'G'),
              q(31, 'combined knowledge of mushroom spawn with a cream separator', 'E', 'Paragraph G: "he combined his knowledge of mushroom spawn with the function of the Sharples Cream Separator".', 'G'),
              q(32, 'did not persuade other scientists that his discovery mattered', 'A', 'Paragraph C: "Fleming did not convince anyone that his discovery was important."', 'C'),
            ],
          },
          {
            id: 'o5-r3-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The first patients</strong></p><p>In 1941, Florey\'s team treated a policeman with a severe infection of the face. His condition improved, but he died when {{q33}} of penicillin ran out. The first successful use of pure penicillin came in {{q34}}, when Fleming cured Harry Lambert of an infection of the nervous system. Lambert was completely cured within a {{q35}}, and Fleming published his clinical trial in <em>The {{q36}}</em> the following year.</p>',
            questions: [
              q(33, null, 'supplies', 'Paragraph D: "his condition improved, but then supplies of penicillin ran out and he died".', 'D'),
              q(34, null, '1942', 'Paragraph E: "The first successful use of pure penicillin was in 1942".', 'E'),
              q(35, null, 'week', 'Paragraph E: "was completely cured within a week".', 'E'),
              q(36, null, 'Lancet', 'Paragraph E: "Fleming published his clinical trial in The Lancet in 1943."', 'E'),
            ],
          },
          {
            id: 'o5-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(37, 'Fleming noticed the effect of the mould on bacteria by chance.', 'TRUE', 'Paragraph B: "he observed by chance that fungal contamination of a bacterial culture ... appeared to kill the bacteria".', 'B'),
              q(38, 'The Oxford team were able to make large amounts of penicillin in their own laboratory.', 'FALSE', 'Paragraph F: "the Oxford team found that it was impossible to produce usable amounts in their laboratory".', 'F'),
              q(39, 'The United States was the first country to make penicillin available to ordinary people after the war.', 'FALSE', 'Paragraph H: "After the Second World War Australia was the first country to make the drug available for civilian use."', 'H'),
              q(40, 'Harry Lambert later trained to become a doctor.', 'NOT GIVEN', 'Paragraph E describes Lambert\'s cure but says nothing about his later life.', 'E'),
            ],
          },
        ],
      }),
    ],
  },

  listening: {
    checkTimeSec: 120,
    parts: [
      voaPart({
        order: 1, key: 'george-washington-first-president',
        contextText: 'You will hear a radio programme about the first president of the United States.',
        questionGroups: [
          {
            id: 'o5-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>George Washington</strong></p><ul><li>served as president from 1789 to {{q1}}</li><li>presided over the convention that created the US {{q2}}</li><li>the founders wanted him to move to New {{q3}}</li><li>set up a group of advisors called the {{q4}}</li><li>appointed a {{q5}}-member Supreme Court</li><li>the Department of Foreign Affairs is now called the {{q6}} Department</li></ul>',
            questions: [
              q(1, null, '1797', '"He served from 1789 to 1797."'),
              q(2, null, 'Constitution', '"he presided over the convention that created the U.S. Constitution".'),
              q(3, null, 'York', '"the country\'s founders wanted him to move to New York".'),
              q(4, null, 'cabinet', '"He established a group of advisors — called the cabinet".'),
              q(5, null, ['six', '6'], '"He appointed a six-member Supreme Court."'),
              q(6, null, 'State', '"the Department of Foreign Affairs, now called the State Department".'),
            ],
          },
          {
            id: 'o5-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(7, 'According to Joseph Ellis, one of the best things about Washington was', 'C', '"one of the best things about George Washington was his ability to give up power".', opts('his skill as a general.', 'his talent as a speaker.', 'his ability to give up power.')),
              mc(8, 'What did Washington\'s will order?', 'B', '"He left a will ordering his survivors to free his slaves after his wife\'s death."', opts('that his land should be sold', 'that his slaves should be freed after his wife died', 'that his sword should be returned to the army')),
              mc(9, 'When did Washington die?', 'A', '"On December 14, 1799, he died in his bed".', opts('in December 1799', 'in March 1797', 'in July 1789')),
              mc(10, 'How old was Washington when he died?', 'B', '"He was 67."', opts('57', '67', '76')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'independence-day-in-the-us',
        contextText: 'You will hear a report about the history of a national holiday in the United States.',
        questionGroups: [
          {
            id: 'o5-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Independence Day</strong></p><ul><li>Congress voted for independence on July {{q11}}, 1776</li><li>the Declaration of Independence was mainly written by Thomas {{q12}}</li><li>Pauline Maier\'s book about the Declaration was published in {{q13}}</li><li>celebrations spread after the War of {{q14}}</li><li>July 4th became an official holiday in {{q15}}</li><li>the US population today: {{q16}} million</li></ul>',
            questions: [
              q(11, null, ['2', '2nd', 'second'], '"July 2 is the day the Continental Congress of the original 13 colonies voted for independence from Britain."'),
              q(12, null, 'Jefferson', '"the Declaration of Independence, mainly written by Thomas Jefferson".'),
              q(13, null, '1997', '"wrote the 1997 book American Scripture".'),
              q(14, null, '1812', '"The tradition of celebrating Independence Day started to expand after the War of 1812".'),
              q(15, null, '1870', '"In 1870, the U.S. Congress made July 4th an official holiday."'),
              q(16, null, '336', '"It is now a country of 336 million".'),
            ],
          },
          {
            id: 'o5-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(17, 'Why did members of Congress celebrate on July 4 in 1777?', 'B', '"They remembered on July 3. It was too late to celebrate on July 2."', opts('It was the day the Declaration was written.', 'They remembered the anniversary too late to celebrate on July 2.', 'John Adams asked them to choose that date.')),
              mc(18, 'What happened on July 4, 1826?', 'C', '"Adams died on July 4, 1826. That same day, Thomas Jefferson also died."', opts('Congress made the day an official holiday.', 'The first fireworks show was held in New York.', 'John Adams and Thomas Jefferson both died.')),
              mc(19, 'Where is the biggest Fourth of July fireworks show?', 'A', '"the biggest Fourth of July fireworks show is in New York City".', opts('New York City', 'Philadelphia', 'Los Angeles')),
              mc(20, 'Why does the fireworks show in Anchorage start at midnight?', 'C', '"With 19 hours of daylight this time of year, the fireworks show does not start until midnight."', opts('It is too cold earlier in the evening.', 'People are busy with games until then.', 'It stays light for about 19 hours a day.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'nasa-identifies-cause-of-mars-helicopter-s-final-crash',
        contextText: 'You will hear a science report about the end of a helicopter mission on Mars.',
        questionGroups: [
          {
            id: 'o5-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Ingenuity helicopter</strong></p><ul><li>arrived on Mars in February 2021 with the {{q21}} rover</li><li>its last flight was number {{q22}}</li><li>on that flight it climbed to about {{q23}} metres</li><li>its navigation system uses a {{q24}} that points downward</li><li>it was flying in an area called Jezero {{q25}}</li><li>all four rotor {{q26}} broke at their weakest point</li></ul>',
            questions: [
              q(21, null, 'Perseverance', '"Ingenuity arrived on Mars along with NASA\'s Perseverance explorer, or rover, in February 2021."'),
              q(22, null, '72', '"The experimental helicopter took its last flight, number 72, in January."'),
              q(23, null, '12', '"the aircraft climb to about 12 meters".'),
              q(24, null, 'camera', '"The helicopter uses a camera that points downward".'),
              q(25, null, 'Crater', '"in an area of Mars known as Jezero Crater".'),
              q(26, null, 'blades', '"all four of Ingenuity\'s rotor blades broke at their weakest point".'),
            ],
          },
          {
            id: 'o5-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(27, 'What caused the crash?', 'B', '"the aircraft\'s navigation system could not find enough of these features to choose a good landing spot".', opts('A dust storm damaged the helicopter.', 'The navigation system could not find enough surface features.', 'The batteries stopped working during the flight.')),
              mc(28, 'What can Ingenuity still do after the crash?', 'A', '"it is still able to provide and send back weather information and other kinds of data".', opts('send back weather information', 'make short flights', 'collect rock samples')),
              mc(29, 'How does the Mars Chopper compare with Ingenuity?', 'C', '"Chopper is about 20 times heavier than Ingenuity".', opts('It is about the same size.', 'It is half as heavy.', 'It is about 20 times heavier.')),
              mc(30, 'How far could the Mars Chopper fly in a day?', 'B', '"flying up to 3 kilometers in a day".', opts('up to 704 metres', 'up to 3 kilometres', 'up to 20 kilometres')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'make-a-habit-of-learning-english',
        contextText: 'You will hear an education programme about building good study habits.',
        questionGroups: [
          {
            id: 'o5-l4-notes', type: 'note_completion', wordLimit: W1W,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<ul><li>Wendy Wood: a habit turns your context into a {{q31}} to act</li><li>James Clear\'s four steps: cue, craving, {{q32}}, reward</li><li>a good habit should be obvious, attractive, simple and {{q33}}</li><li>leave English books or {{q34}} in a very clear place</li><li>begin with short study periods, for example two {{q35}}</li></ul>',
            questions: [
              q(31, null, 'trigger', '"A habit turns the world around you—your context—into a trigger to act."'),
              q(32, null, 'response', '"These steps are cue, craving, response, and reward."'),
              q(33, null, 'satisfying', '"The habit should also be attractive, simple and satisfying."'),
              q(34, null, 'notes', '"leave English books or notes in a very clear place".'),
              q(35, null, 'minutes', '"two minutes for example".'),
            ],
          },
          {
            id: 'o5-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'In the social media example, what might the cue be?', 'C', '"The cue might be a feeling of boredom while you are near your computer or phone."', opts('a message from a friend', 'seeing something interesting', 'a feeling of boredom')),
              mc(37, 'How does Clear suggest making a study habit attractive?', 'A', '"Clear recommends joining a culture where your new desired behavior is the normal behavior."', opts('by joining a group where the behaviour is normal', 'by buying new books', 'by studying at the same time every day')),
              mc(38, 'What may happen if you place too many demands on yourself?', 'B', '"you are more likely to give up on your new habit".', opts('You will learn more slowly.', 'You are more likely to give up.', 'You will need longer rewards.')),
              mc(39, 'What reward is suggested after 15 minutes of study?', 'A', '"you could reward yourself by listening to a song you like".', opts('listening to a song you like', 'watching a film', 'having a snack')),
              mc(40, 'According to Wood, when should a reward come?', 'C', '"your reward should come right after you do your new habit".', opts('at the end of each week', 'before you begin studying', 'right after the new habit')),
            ],
          },
        ],
      }),
    ],
  },

  writing: {
    durationSec: 3600,
    task1: {
      order: 1, minWords: 150, recommendedMin: 20,
      promptHtml: `<p>The graph below shows life expectancy at birth in five countries between 1950 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'line', title: 'Life expectancy at birth (years)', unit: 'years',
        categories: ['1950', '1970', '1990', '2010', '2023'], xAxisLabel: 'Year', yAxisLabel: 'Years',
        series: [
          { name: 'Japan', data: [59.3, 72.0, 79.0, 82.9, 84.7] },
          { name: 'South Korea', data: [22.2, 62.2, 71.0, 80.7, 84.3] },
          { name: 'China', data: [43.8, 56.8, 68.2, 75.7, 78.0] },
          { name: 'India', data: [41.2, 48.6, 58.6, 67.2, 72.0] },
          { name: 'Nigeria', data: [35.5, 40.0, 45.7, 51.3, 54.5] },
        ],
      },
      source: { kind: 'owid', dataset: 'life-expectancy', url: 'https://ourworldindata.org/grapher/life-expectancy', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people think that governments should spend large amounts of money protecting historic buildings and monuments. Others believe this money would be better spent on the needs of people living today.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
