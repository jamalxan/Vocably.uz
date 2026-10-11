// Vocably Open Test 8 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-8',
  title: "Lighthouses, Chocolate, Wind Power",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'lighthouse', title: 'Lighthouses', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o8-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a reason why fewer lighthouses are in use today', 'B', 'Paragraph B: the number has declined "due to the expense of maintenance and the advent of much cheaper, more sophisticated, and more effective electronic navigational systems".', 'B'),
              q(2, 'how natural shapes inspired the design of a tower', 'E', 'Paragraph E: "He modeled the shape of his lighthouse on that of an oak tree".', 'E'),
              q(3, 'a comparison of how long two types of light source last', 'J', 'Paragraph J: "The lifetime of the LED light source is 50,000 to 100,000 hours, compared with about 1,000 hours for a filament source."', 'J'),
              q(4, 'how the role of lighthouses was different in ancient times', 'C', 'Paragraph C: "In antiquity, the lighthouse functioned more as an entrance marker to ports than as a warning signal for reefs".', 'C'),
              q(5, 'a non-navigational reason for keeping people at one lighthouse', 'I', 'Paragraph I: Machias Seal Island "is staffed to assert Canadian sovereignty".', 'I'),
            ],
          },
          {
            id: 'o8-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The Pharos of Alexandria was destroyed by a single earthquake.', 'FALSE', 'Paragraph C: it "collapsed following a series of earthquakes between 956 and 1323".', 'C'),
              q(7, 'Winstanley\'s lighthouse was the first tower in the world fully exposed to the open sea.', 'TRUE', 'Paragraph D: "His lighthouse was the first tower in the world to have been fully exposed to the open sea."', 'D'),
              q(8, 'Smeaton\'s lighthouse was replaced because it was damaged by a storm.', 'NOT GIVEN', 'Paragraph E says the tower "remained in use until 1877" but gives no reason why it stopped being used.', 'E'),
              q(9, 'People living near a lighthouse usually notice when it is converted to LED light.', 'FALSE', 'Paragraph J: "The change is often not noticed by people in the region".', 'J'),
            ],
          },
          {
            id: 'o8-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Smeaton used "hydraulic lime", a type of concrete that can set ______.', 'under water', 'Paragraph E: "a form of concrete that will set under water used by the Romans".', 'E'),
              q(11, 'The Argand lamp was invented in ______.', '1782', 'Paragraph F: "The Argand lamp, invented in 1782 by the Swiss scientist Aimé Argand".', 'F'),
              q(12, 'The light from the first Fresnel lens could be seen from more than ______ miles away.', '20', 'Paragraph H: "its light could be seen from more than 20 miles (32 km) out".', 'H'),
              q(13, 'Canada still has ______ lighthouses with staff.', '51', 'Paragraph I: "Canada still maintains 51 staffed lighthouses".', 'I'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'chocolate', title: 'The History of Chocolate', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o8-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(14, 'Where was the cacao tree first used as a source of food?', 'B', 'Paragraph B: "The cacao tree was first used as a source for food in what is today Ecuador".', opts('in Mexico', 'in present-day Ecuador', 'in West Africa', 'in Spain'), 'B'),
              mc(15, 'How did people in Mesoamerica create foam on their chocolate drink?', 'D', 'Paragraph D: the foam was "created by pouring the liquid from a height between containers".', opts('by adding vanilla and chili', 'by heating the liquid', 'by beating it with sticks', 'by pouring it from a height between containers'), 'D'),
              mc(16, 'What did van Houten\'s hydraulic press make possible?', 'A', 'Paragraph G: it "separated cocoa butter from chocolate liquor, enabling the mass production of defatted cocoa powder".', opts('the mass production of cocoa powder', 'the first milk chocolate', 'the tempering of chocolate', 'the growing of cacao in Asia'), 'G'),
              mc(17, 'What does the conching process do?', 'C', 'Paragraph J: it "produces cocoa and sugar particles smaller than the tongue can detect ... hence the smooth feel in the mouth".', opts('It adds lecithin to the chocolate.', 'It cools the chocolate quickly.', 'It makes the chocolate smooth.', 'It separates the beans from the pods.'), 'J'),
            ],
          },
          {
            id: 'o8-r2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Chocolate timeline</strong></p><ul><li>1520: Cortés saw chocolate at the court of {{q18}} II</li><li>{{q19}}: the first official record of cocoa beans being shipped to Europe</li><li>1828: van Houten patented a hydraulic press</li><li>by 1890: a worker could produce {{q20}} times more chocolate than before the Industrial Revolution</li><li>{{q21}}: a report described conditions on Portuguese cacao farms as "de facto slavery"</li></ul>',
            questions: [
              q(18, null, 'Moctezuma', 'Paragraph E: "when he observed it in the court of Moctezuma II in 1520".', 'E'),
              q(19, null, '1585', 'Paragraph E: "it took until 1585 for the first official recording of a shipment of cocoa beans to Europe".', 'E'),
              q(20, null, ['fifty', '50'], 'Paragraph G: "a worker in 1890 could produce fifty times more chocolate with the same labor".', 'G'),
              q(21, null, '1908', 'Paragraph H: "A 1908 report by a Cadbury agent described conditions as \'de facto slavery.\'"', 'H'),
            ],
          },
          {
            id: 'o8-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(22, 'Ivory Coast and Ghana produce about 60% of the world\'s cocoa.', 'TRUE', 'Paragraph B: they "contribute about 60% of the world\'s cocoa supply".', 'B'),
              q(23, 'Europeans liked the taste of chocolate as soon as they tried it.', 'FALSE', 'Paragraph E: "It proved to be an acquired taste".', 'E'),
              q(24, 'The name Theobroma means "food of the gods".', 'TRUE', 'Paragraph I: "The scientific name, Theobroma, means \'food of the gods\'."', 'I'),
              q(25, 'Chocolate affected by bloom is unsafe to eat.', 'FALSE', 'Paragraph K: "chocolate suffering from bloom is safe for consumption and taste is unaffected".', 'K'),
              q(26, 'Cadbury stopped buying cocoa from Portuguese farms in Africa in 1908.', 'NOT GIVEN', 'Paragraph H mentions the 1908 report and a boycott, but gives no date for when Cadbury stopped buying.', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'wind-power', title: 'Wind Power', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o8-r3-headings', type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has nine paragraphs, A-I. Choose the correct heading for paragraphs B-H from the list of headings below.',
            bank: [
              { key: 'i', text: 'A rapidly growing share of world electricity' },
              { key: 'ii', text: 'Advantages and drawbacks compared with other sources' },
              { key: 'iii', text: 'Grinding grain and pumping water' },
              { key: 'iv', text: 'An offer of free street lighting is refused' },
              { key: 'v', text: 'A large early machine in America' },
              { key: 'vi', text: 'A fuel crisis leads to bigger turbines' },
              { key: 'vii', text: 'Payment for homeowners living near turbines' },
              { key: 'viii', text: 'The danger of turbines to birds' },
              { key: 'ix', text: 'Why turbines are painted white' },
            ],
            questions: [
              q(27, 'Paragraph B', 'i', 'Paragraph B: "wind supplied about 2,700 TWh of electricity, which was over 8% of world electricity".', 'B'),
              q(28, 'Paragraph C', 'ii', 'Paragraph C compares wind with fossil fuels: "a much smaller impact on the environment", but "Wind power is variable".', 'C'),
              q(29, 'Paragraph D', 'iii', 'Paragraph D: "Wind-powered machines used to grind grain and pump water".', 'D'),
              q(30, 'Paragraph E', 'iv', 'Paragraph E: "Blyth offered the surplus electric power to the people of Marykirk for lighting the main street, however, they turned down the offer".', 'E'),
              q(31, 'Paragraph F', 'v', 'Paragraph F: "in Cleveland, Ohio, a larger and heavily engineered machine was designed and constructed".', 'F'),
              q(32, 'Paragraph G', 'vi', 'Paragraph G: "The 1973 oil crisis triggered the investigation ... that led to larger utility-scale wind generators".', 'G'),
              q(33, 'Paragraph H', 'vii', 'Paragraph H: people can "claim compensation for loss of value of their property if it is caused by proximity to a wind turbine".', 'H'),
            ],
          },
          {
            id: 'o8-r3-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(34, 'The first wind turbine used to produce electricity was built in ______ in 1887.', 'Scotland', 'Paragraph E: "The first wind turbine used for the production of electric power was built in Scotland in July 1887".', 'E'),
              q(35, 'The people of Marykirk believed that electric power was "the work of the ______".', 'devil', 'Paragraph E: "they thought electric power was \'the work of the devil\'".', 'E'),
              q(36, 'Although the Brush turbine was large, it was only rated at ______.', ['12 kW', '12 kilowatts'], 'Paragraph F: "the machine was only rated at 12 kW".', 'F'),
              q(37, 'Grid parity is the point at which the cost of wind power matches ______.', 'traditional sources', 'Paragraph I: "grid parity (the point at which the cost of wind power matches traditional sources)".', 'I'),
            ],
          },
          {
            id: 'o8-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(38, 'Offshore wind farms are generally cheaper than those on land.', 'FALSE', 'Paragraph C: offshore farms "are generally more expensive".', 'C'),
              q(39, 'In Denmark, compensation can be claimed if a property loses at least 1% of its value.', 'TRUE', 'Paragraph H: "The loss must be at least 1% of the property\'s value."', 'H'),
              q(40, 'Blyth\'s turbine at Marykirk was later moved to Glasgow.', 'NOT GIVEN', 'Paragraph E describes the turbine and a later one at Montrose, but nothing about moving it to Glasgow.', 'E'),
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
        order: 1, key: 'americans-observe-memorial-day',
        contextText: 'You will hear a report about how Americans remember those who died in war.',
        questionGroups: [
          {
            id: 'o8-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Memorial Day</strong></p><ul><li>the tradition began in {{q1}}, when flowers were placed on soldiers\' graves</li><li>it was originally called {{q2}} Day</li><li>Arlington National Cemetery covers {{q3}} hectares</li><li>the Vietnam memorial was designed by a {{q4}}-year-old student</li><li>its walls are made of black {{q5}}</li><li>the names of more than {{q6}} Americans are cut into the walls</li></ul>',
            questions: [
              q(1, null, '1868', '"The tradition began on May 30th, 1868".'),
              q(2, null, 'Decoration', '"It was called Decoration Day back then."'),
              q(3, null, '80', '"the 80-hectare cemetery".'),
              q(4, null, '21', '"Maya Lin, a 21-year-old student at Yale University".'),
              q(5, null, 'stone', '"two walls of black stone about 76 meters long".'),
              q(6, null, ['58,000', '58000'], '"The names of more than 58,000 Americans killed or declared missing-in-action are cut into the stone."'),
            ],
          },
          {
            id: 'o8-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(7, 'Which two presidents are buried at Arlington?', 'C', '"Two presidents are buried there: William Howard Taft and John F. Kennedy."', opts('Lincoln and Washington', 'Kennedy and Lincoln', 'Taft and Kennedy')),
              mc(8, 'What do many visitors to the Vietnam Veterans Memorial do?', 'A', '"many rub a pencil on paper over the letters to copy it".', opts('copy a name by rubbing a pencil over paper', 'leave flags in front of the walls', 'read the names aloud')),
              mc(9, 'What do the 56 stone pillars of the World War II Memorial represent?', 'B', '"They represent each of the American states and territories, plus the District of Columbia".', opts('the years of the war', 'the states and territories at the time', 'the battles of the war')),
              mc(10, 'What are Americans asked to do at three o\'clock on Memorial Day?', 'C', '"Americans are called to stop for one minute at three o\'clock local time".', opts('visit a cemetery', 'fly a flag', 'stop for one minute')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'thanksgiving-american-tradition-2017',
        contextText: 'You will hear a report about a traditional American holiday.',
        questionGroups: [
          {
            id: 'o8-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(11, 'When is Thanksgiving celebrated?', 'B', '"celebrated every year on the fourth Thursday in November".', opts('on the last Monday in November', 'on the fourth Thursday in November', 'on the first Sunday in December')),
              mc(12, 'What does the word "quintessential" mean?', 'A', '"\'Quintessential\' means the perfect example of something."', opts('the perfect example of something', 'something very old', 'something served at the end of a meal')),
              mc(13, 'Which is the busiest travel day of the year?', 'C', '"the Sunday after Thanksgiving is the busiest travel day of the entire year".', opts('the day before Thanksgiving', 'Thanksgiving Day itself', 'the Sunday after Thanksgiving')),
              mc(14, 'What is a "potluck"?', 'B', '"a meal where everyone who is invited brings food to share with others".', opts('a meal in a restaurant', 'a meal where each guest brings food to share', 'a meal for people who are alone')),
            ],
          },
          {
            id: 'o8-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>gravy is made from the fatty liquid that comes off the {{q15}}</li><li>Macy\'s first parade was organised in {{q16}}</li><li>the workers borrowed some animals from the {{q17}}</li><li>"Turkey Trot" races are usually {{q18}} kilometres long</li><li>runners are asked to bring canned food for local food {{q19}}</li><li>the writer O. {{q20}} called it the one purely American holiday</li></ul>',
            questions: [
              q(15, null, 'turkey', '"This rich sauce is made from the fatty liquid that comes off the turkey as it cooks."'),
              q(16, null, '1924', '"Workers of the Macy\'s store on Herald Square organized the first parade in 1924."'),
              q(17, null, 'zoo', '"they dressed in costumes and borrowed some animals from the zoo".'),
              q(18, null, ['five', '5'], '"running a short distance -- usually five kilometers".'),
              q(19, null, 'banks', '"bring canned food to donate to local food banks".'),
              q(20, null, 'Henry', '"The writer O. Henry called Thanksgiving the one holiday that is purely American."'),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'us-workers-secretly-take-workations',
        contextText: 'You will hear a report about a new trend among American workers.',
        questionGroups: [
          {
            id: 'o8-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Workations</strong></p><ul><li>staying at home during a vacation is called a "{{q21}}"</li><li>the Mews study: about {{q22}} percent of employees had secretly worked from a vacation place</li><li>according to Riekstins, productivity rises by {{q23}} percent when people are happy</li><li>the Gray Havens Inn is in Georgetown, {{q24}}</li><li>its special offer: {{q25}} percent off a seven-day stay</li><li>one in {{q26}} Gen Z workers used a false home office background</li></ul>',
            questions: [
              q(21, null, 'staycation', '"Another example is \'staycation.\'"'),
              q(22, null, '29', '"about 29 percent of employees said they had worked remotely from a vacation place without telling employers".'),
              q(23, null, '70', '"Productivity goes up by 70 percent on average when people are happier".'),
              q(24, null, 'Maine', '"In Georgetown, Maine, the 13-room Gray Havens Inn".'),
              q(25, null, '25', '"The special includes 25 percent off the room rate for a seven-day stay."'),
              q(26, null, ['six', '6'], '"one in six Gen Z workers used a false online background of a home office".'),
            ],
          },
          {
            id: 'o8-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(27, 'According to Riekstins, what did the pandemic make people do?', 'A', '"the pandemic made people question what they really wanted in their work and personal lives".', opts('question what they wanted from work and life', 'travel less often', 'look for higher salaries')),
              mc(28, 'Why did the Gray Havens Inn start its workation programme?', 'C', '"We have a lot of younger travelers, but not as many as we would like. This is part of the reason we started this program".', opts('to fill rooms during the winter', 'because its owner used to work remotely', 'to attract more young travellers')),
              mc(29, 'What does Riekstins say about the organisations he works with?', 'B', '"don\'t care where their employees work, as long as they produce the results and it\'s done within the office hours".', opts('They do not allow remote work.', 'They do not mind where employees work if the results are good.', 'They pay for employees\' holidays.')),
              mc(30, 'Which group of people does "Gen Z" refer to?', 'A', '"Gen Z is a name for the generation of people born in the late 1990s through the early 2000s."', opts('people born from the late 1990s to the early 2000s', 'people born in the 1980s', 'people who work for hotel companies')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'tips-for-better-conversations-at-work',
        contextText: 'You will hear an education programme giving advice to someone who uses English at work.',
        questionGroups: [
          {
            id: 'o8-l4-flow', type: 'flowchart_completion', wordLimit: W1W,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>Four strategies for conversations with customers</strong></p><p>1. {{q31}} what you will hear, e.g. customers often use the word "order"</p><p>↓</p><p>2. Make a list of key words and {{q32}} on them when you listen</p><p>↓</p><p>3. Ask the customer to speak more slowly, or ask a short question to {{q33}}</p><p>↓</p><p>4. Prepare answers and {{q34}} them in your free time; keep them in a {{q35}}</p>',
            questions: [
              q(31, null, 'Predict', '"The first strategy is to predict what you will hear."'),
              q(32, null, 'focus', '"I call this \'focusing when you listen.\'"'),
              q(33, null, 'clarify', '"The other kind of question is one I call, \'asking to clarify.\'"'),
              q(34, null, 'rehearse', '"You can prepare your answers to customers\' questions and rehearse them in your free time."'),
              q(35, null, 'notebook', '"You may want to keep a notebook with your usual answers."'),
            ],
          },
          {
            id: 'o8-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'What did the reader, Emre, ask for advice about?', 'B', '"He recently asked for advice on how he can improve his listening skills."', opts('writing emails to customers', 'improving his listening skills', 'finding a new job')),
              mc(37, 'What is a learning strategy, according to the speaker?', 'C', '"A learning strategy can be a thought or an action you take to make learning easier."', opts('a test you take to check your level', 'a list of useful words', 'a thought or action that makes learning easier')),
              mc(38, 'In the example, what does the customer want to buy?', 'A', '"I want to order some face cream".', opts('face cream', 'a phone', 'a book')),
              mc(39, 'What does the speaker suggest telling customers?', 'B', '"You can let the customer know you are an English learner."', opts('that you are new at the company', 'that you are an English learner', 'that you will call them back')),
              mc(40, 'What other way of preparing does the speaker recommend?', 'C', '"listen to English movies and podcasts as often as you can".', opts('taking an evening class', 'reading business books', 'listening to English movies and podcasts')),
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
      promptHtml: `<p>The chart below shows the share of electricity generated from renewable sources in six countries in 2000 and 2024.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'bar', title: 'Share of electricity from renewables (%)', unit: '%',
        categories: ['Brazil', 'Germany', 'United Kingdom', 'France', 'Egypt', 'South Korea'], xAxisLabel: 'Country', yAxisLabel: '% of electricity',
        series: [
          { name: '2000', data: [89.5, 6.2, 2.6, 12.7, 19.4, 1.4] },
          { name: '2024', data: [87.3, 58.6, 50.6, 27.2, 11.2, 9.7] },
        ],
      },
      source: { kind: 'owid', dataset: 'share-electricity-renewables', url: 'https://ourworldindata.org/grapher/share-electricity-renewables', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people believe that new wind farms should be built close to towns and villages, even if local residents object. Others think local people should have the final decision.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
