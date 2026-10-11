// Vocably Open Test 2 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-2',
  title: "Tea, Living Light, Urban Heat Islands",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'tea', title: 'The Spread of Tea', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o2-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              q(1, 'an example of tea being used as money', 'H', 'Paragraph H: "tea bricks were ubiquitous enough to be used as a form of currency".', 'H'),
              q(2, 'a person who at first did not want to accept a gift of tea', 'E', 'Paragraph E: "Starkov at first refused, seeing no use for a load of dead leaves".', 'E'),
              q(3, 'the reason why a European power first brought tea plants to India', 'F', 'Paragraph F: "in an attempt to break the Chinese monopoly on tea".', 'F'),
              q(4, 'an ancient word that may have referred to several different plants', 'C', 'Paragraph C: "it is possible that it referred to many different plants".', 'C'),
              q(5, 'a new way of using tea that was discovered by customers', 'G', 'Paragraph G: "Consumers noticed they could simply leave the tea in the bag".', 'G'),
            ],
          },
          {
            id: 'o2-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Tea is the most widely drunk beverage in the world apart from plain water.', 'TRUE', 'Paragraph A: "After plain drinking water, tea is the most widely consumed beverage in the world."', 'A'),
              q(7, 'The earliest European reference to tea was written by a Dutch author.', 'FALSE', 'Paragraph D: it "came from Delle navigationi e viaggi written by Venetian Giambattista Ramusio in 1545".', 'D'),
              q(8, 'Robert Fortune travelled to China openly, with the approval of the Chinese authorities.', 'FALSE', 'Paragraph F: "He began his journey in high secrecy".', 'F'),
              q(9, 'In 1953, Tetley was the largest tea company in the United Kingdom.', 'NOT GIVEN', 'Paragraph G says Tetley launched the tea bag in the UK in 1953 but says nothing about the size of the company.', 'G'),
            ],
          },
          {
            id: 'o2-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In 1679, Russia agreed to receive regular supplies of tea from China in exchange for ______.', 'furs', 'Paragraph E: "via camel caravan in exchange for furs".', 'E'),
              q(11, 'Tea became widely drunk in India in the 1950s thanks to a successful ______ campaign.', 'advertising', 'Paragraph F: "because of a successful advertising campaign by the India Tea Board".', 'F'),
              q(12, 'The British introduced the tea industry to Sri Lanka in ______.', '1867', 'Paragraph F: "The British introduced tea industry to Sri Lanka (then Ceylon) in 1867."', 'F'),
              q(13, 'Himalayan peoples make butter tea by combining compressed tea with yak butter and ______.', 'salt', 'Paragraph H: "combining it with yak butter and salt".', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'bioluminescence', title: 'Living Light', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o2-r2-headings', type: 'matching_headings',
            instructionHtml: 'Reading Passage 2 has eight paragraphs, A-H. Choose the correct heading for paragraphs B-G from the list of headings below.',
            bank: [
              { key: 'i', text: 'Early observations and the discovery that oxygen is involved' },
              { key: 'ii', text: 'A weak light for a dangerous workplace, and early scientific records' },
              { key: 'iii', text: 'A military interest in glowing water' },
              { key: 'iv', text: 'Hiding by matching the light from above' },
              { key: 'v', text: 'Using light to find a partner or a meal' },
              { key: 'vi', text: 'Escaping attackers with a burst of light' },
              { key: 'vii', text: 'Using living light to illuminate city streets' },
              { key: 'viii', text: 'Why deep-sea animals have lost their eyes' },
              { key: 'ix', text: 'Making light-producing chemicals in the laboratory' },
            ],
            questions: [
              q(14, 'Paragraph B', 'i', 'Paragraph B: Aristotle and Pliny observed glowing wood, and "Robert Boyle showed that oxygen was involved".', 'B'),
              q(15, 'Paragraph C', 'ii', 'Paragraph C: dried fish skins were "a weak source of light" in coal mines, followed by Harvey\'s summary of early work.', 'C'),
              q(16, 'Paragraph D', 'iii', 'Paragraph D: "Bioluminescence attracted the attention of the United States Navy".', 'D'),
              q(17, 'Paragraph E', 'iv', 'Paragraph E: "the animal matches the overhead environmental light as seen from below".', 'E'),
              q(18, 'Paragraph F', 'v', 'Paragraph F: fireflies "use light to attract mates" and larvae attract "the flying insects on which they feed".', 'F'),
              q(19, 'Paragraph G', 'vi', 'Paragraph G: "A cloud of luminescent material is expelled, distracting or repelling a potential predator".', 'G'),
            ],
          },
          {
            id: 'o2-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(20, 'Bioluminescence first appeared in octocorals around 540 million years ago.', 'TRUE', 'Paragraph A: "first emerging in octocorals some 540 million years ago".', 'A'),
              q(21, 'Harvey\'s monograph of 1920 was the first book ever written about bioluminescence.', 'NOT GIVEN', 'Paragraph C says the monograph summarised early work, but not whether it was the first book on the subject.', 'C'),
              q(22, 'Dried fish skins were used in coal mines because they gave a strong light.', 'FALSE', 'Paragraph C: they were used "as a weak source of light".', 'C'),
              q(23, 'Most bioluminescent organisms live on land.', 'FALSE', 'Paragraph B: "The phenomenon is widely distributed among animal groups, especially in marine environments."', 'B'),
            ],
          },
          {
            id: 'o2-r2-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(24, 'The larvae of one click beetle species live in termite mounds in ______.', 'Brazil', 'Paragraph F: "live in the surface layers of termite mounds in Brazil".', 'F'),
              q(25, 'Some squid release a cloud of luminous material in the same way that many squid use ______.', 'ink', 'Paragraph G: "in the same way as many squid use ink".', 'G'),
              q(26, 'In 1986, the firefly luciferase gene was used in research on transgenic ______ plants.', 'tobacco', 'Paragraph H: "used as early as 1986 for research using transgenic tobacco plants".', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'urban-heat-island', title: 'Urban Heat Islands', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o2-r3-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 3 has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(27, 'a comparison of the number of deaths caused by different kinds of weather', 'G', 'Paragraph G: "heat waves kill more people in the U.S. than hurricanes, floods, and tornadoes combined".', 'G'),
              q(28, 'an estimate of the financial cost of the effect in one city', 'H', 'Paragraph H: "The heat island effect costs Los Angeles about US$ 100 million per year in energy".', 'H'),
              q(29, 'a description of how air near the ground stays warm after dark', 'C', 'Paragraph C: an inversion layer "traps urban air near the surface, keeping surface air warm".', 'C'),
              q(30, 'a figure for the number of trees lost each year in one country', 'E', 'Paragraph E: "cities in the United States are losing 36 million trees each year".', 'E'),
              q(31, 'the name given to an effect caused by tall buildings', 'F', 'Paragraph F: "This is called the \'urban canyon effect\'."', 'F'),
            ],
          },
          {
            id: 'o2-r3-bank', type: 'summary_completion_bank', bankReusable: false,
            instructionHtml: 'Complete the summary using the list of words, <strong>A-I</strong>, below.',
            bank: [
              { key: 'A', text: 'deciduous' }, { key: 'B', text: 'evergreen' }, { key: 'C', text: 'carbon dioxide' },
              { key: 'D', text: 'albedo' }, { key: 'E', text: 'warmer' }, { key: 'F', text: 'insulation' },
              { key: 'G', text: 'pollution' }, { key: 'H', text: 'humidity' }, { key: 'I', text: 'colder' },
            ],
            stemHtml: '<p><strong>Reducing the heat island effect</strong></p><p>Planting {{q32}} trees is recommended because they give shade in summer without blocking warmth in winter. As well as lowering air temperatures, trees absorb {{q33}} from the atmosphere. Painting rooftops white increases the {{q34}} of a city. Cool roofs are especially effective in {{q35}} regions, while green roofs may be more useful in colder climates because they provide {{q36}}.</p>',
            questions: [
              q(32, null, 'A', 'Paragraph I: "It is recommended to plant deciduous trees".', 'I'),
              q(33, null, 'C', 'Paragraph I: "trees also help fight global warming by absorbing CO2 from the atmosphere".', 'I'),
              q(34, null, 'D', 'Paragraph J: white rooftops are "increasing the albedo of the city".', 'J'),
              q(35, null, 'E', 'Paragraph J: "In warmer regions, cool roofs were especially effective".', 'J'),
              q(36, null, 'F', 'Paragraph J: green roofs "provide insulation".', 'J'),
            ],
          },
          {
            id: 'o2-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(37, 'The temperature difference between cities and the countryside is usually greater during the day than at night.', 'FALSE', 'Paragraph A: "The temperature difference is usually larger at night than during the day".', 'A'),
              q(38, 'Waste heat from energy use is the main cause of urban heat islands.', 'FALSE', 'Paragraph B: "waste heat generated by energy usage is a secondary contributor".', 'B'),
              q(39, 'Concrete can hold much more heat than the same volume of air.', 'TRUE', 'Paragraph C: "concrete can hold roughly 2,000 times as much heat as an equivalent volume of air".', 'C'),
              q(40, 'Toronto has saved more energy than Chicago by reducing its heat island.', 'NOT GIVEN', 'Paragraph H mentions savings for both cities but does not compare them.', 'H'),
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
        order: 1, key: 'wilbur-and-orville-wright-the-first-airplane',
        contextText: 'You will hear a radio programme about the inventors of the first airplane.',
        questionGroups: [
          {
            id: 'o2-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Wright brothers</strong></p><ul><li>Orville was born in {{q1}}, Ohio</li><li>early ideas came from a toy helicopter, kites, the printing machine and {{q2}}</li><li>tested gliders near the town of Kitty {{q3}}</li><li>the 1903 plane had wings {{q4}} metres across</li><li>it weighed about {{q5}} kilograms, including the pilot</li><li>first powered flight: December {{q6}}, 1903</li><li>one of the four men who watched the first flights took {{q7}}</li><li>he stayed in the air for {{q8}} seconds</li><li>in 1908, Wilbur gave demonstration flights in {{q9}}</li><li>Wilbur died of typhoid fever in {{q10}}</li></ul>',
            questions: [
              q(1, null, 'Dayton', '"His brother Orville was born four years later in Dayton, Ohio."'),
              q(2, null, 'bicycles', '"a toy helicopter, kites, the printing machine and bicycles".'),
              q(3, null, 'Hawk', '"near the town of Kitty Hawk".'),
              q(4, null, '12', '"The plane had wings 12 meters across."'),
              q(5, null, '340', '"It weighed about 340 kilograms, including the pilot."'),
              q(6, null, ['17th', '17'], '"On December 17th, 1903, they made the world\'s first flight".'),
              q(7, null, 'pictures', '"One of the men took pictures."'),
              q(8, null, '12', '"He was in the air for 12 seconds."'),
              q(9, null, 'France', '"In 1908, Wilbur went to France. He gave demonstration flights".'),
              q(10, null, '1912', '"Wilbur Wright died of typhoid fever in 1912."'),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'lincoln-s-cottage-a-country-house-for-the-president',
        contextText: 'You will hear a report about a historic house used by an American president.',
        questionGroups: [
          {
            id: 'o2-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(11, 'How far is the cottage from the White House?', 'A', '"About five kilometers from the White House".', opts('about five kilometres', 'about thirty kilometres', 'about fifty kilometres')),
              mc(12, 'Why did Lincoln use the country house?', 'B', '"President Lincoln used a country house to escape the worst of the heat."', opts('to meet foreign visitors', 'to escape the summer heat', 'to be closer to the army')),
              mc(13, 'How did Lincoln travel between the two houses?', 'B', '"Lincoln rode between the two houses on horseback, unguarded."', opts('by carriage, with guards', 'on horseback, without guards', 'on foot')),
              mc(14, 'Which important document did Lincoln work on at the cottage?', 'B', '"early versions of ... The Emancipation Proclamation".', opts('the Gettysburg Address', 'the Emancipation Proclamation', 'the United States Constitution')),
              mc(15, 'How did Lincoln feel about the soldiers at first?', 'A', '"At first, Lincoln did not welcome the soldiers."', opts('He did not welcome them.', 'He was grateful for their protection.', 'He was afraid of them.')),
            ],
          },
          {
            id: 'o2-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>much of what historians know comes from stories told by the {{q16}}</li><li>1864: a bullet went through the president\'s {{q17}}</li><li>last visit to the cottage: April {{q18}}, 1865</li><li>Lincoln was shot at Ford\'s {{q19}}</li><li>the cottage opened to the public in {{q20}}</li></ul>',
            questions: [
              q(16, null, 'soldiers', '"much of what historians know about the president\'s time at the house is from stories told by those soldiers".'),
              q(17, null, 'hat', '"Soldiers found the hat and saw that a bullet had torn through it."'),
              q(18, null, ['13', '13th'], '"he visited his country house for the last time on April 13, 1865".'),
              q(19, null, ['Theatre', 'Theater'], '"shot President Lincoln at Ford\'s Theatre in Washington".'),
              q(20, null, '2008', '"President Lincoln\'s Cottage opened to the public in 2008."'),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'how-to-break-bad-habits',
        contextText: 'You will hear an education programme about how to break bad habits.',
        questionGroups: [
          {
            id: 'o2-l3-notes', type: 'note_completion', wordLimit: W1W,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>James Clear\'s ideas</strong></p><ul><li>book: <em>Atomic {{q21}}</em></li><li>four steps in making a habit: cue, {{q22}}, response, reward</li><li>"{{q23}} are the end goal of every habit"</li><li>to break a habit, make it invisible, unattractive, {{q24}} and unsatisfying</li><li>a habit {{q25}}: ask a family member to watch your behaviour</li></ul>',
            questions: [
              q(21, null, 'Habits', '"James Clear, in his book Atomic Habits".'),
              q(22, null, 'craving', '"These steps are cue, craving, response, and reward."'),
              q(23, null, 'Rewards', '"Rewards are the end goal of every habit," Clear writes.'),
              q(24, null, 'difficult', '"making the bad habit invisible, unattractive, difficult and unsatisfying".'),
              q(25, null, 'contract', '"you could make a habit contract".'),
            ],
          },
          {
            id: 'o2-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(26, 'What is the title of Wendy Wood\'s book?', 'B', '"In the book Good Habits, Bad Habits".', opts('Atomic Habits', 'Good Habits, Bad Habits', 'Breaking Habits')),
              mc(27, 'Why does Wood suggest wearing a wristwatch?', 'B', '"This will limit at least one reason for looking at the phone – checking the time."', opts('to time study sessions', 'to remove one reason for looking at the phone', 'to reward good behaviour')),
              mc(28, 'Where does Wood suggest putting your phone?', 'A', '"you can put your phone inside a backpack".', opts('inside a backpack', 'in another room', 'under a pillow')),
              mc(29, 'What healthy habit does Wood suggest adding to phone use?', 'B', '"every time you check your phone, you call one member of your family".', opts('doing some exercise', 'calling a member of your family', 'reading a page of a book')),
              mc(30, 'What reward does Wood suggest for not looking at your phone?', 'A', '"reading a good book".', opts('reading a good book', 'watching a film', 'eating something sweet')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'another-big-year-for-space-exploration',
        contextText: 'You will hear a report looking back at the biggest space stories of 2024.',
        questionGroups: [
          {
            id: 'o2-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Space exploration in 2024</strong></p><ul><li>Odysseus touched down on the moon on February {{q31}}</li><li>it was developed by the company Intuitive {{q32}}</li><li>Japan\'s SLIM landed within {{q33}} metres of its target</li><li>China\'s Chang\'e 6 brought back samples from the moon\'s far {{q34}}</li><li>Europe\'s Hera spacecraft is going to the asteroid {{q35}}</li><li>NASA crashed its DART spacecraft into it in {{q36}}</li><li>Europa Clipper should reach Jupiter by {{q37}}</li></ul>',
            questions: [
              q(31, null, ['22', '22nd'], '"had touched down on the lunar surface February 22".'),
              q(32, null, 'Machines', '"the Texas-based company Intuitive Machines".'),
              q(33, null, '10', '"SLIM was able to land within 10 meters of its planned target".'),
              q(34, null, 'side', '"collect and bring back lunar samples from the far side of the moon".'),
              q(35, null, 'Dimorphos', '"Hera is headed to the asteroid Dimorphos."'),
              q(36, null, '2022', '"NASA crashed its DART spacecraft into the space rock in 2022".'),
              q(37, null, '2030', '"to get the spacecraft to Jupiter by 2030".'),
            ],
          },
          {
            id: 'o2-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(38, 'Why could the two astronauts not return on Starliner?', 'A', '"ongoing technical issues with the Starliner spacecraft prevented a return trip".', opts('There were technical problems with the spacecraft.', 'The weather was too bad.', 'They were needed on the space station.')),
              mc(39, 'How are Wilmore and Williams expected to return to Earth?', 'A', '"for Wilmore and Williams to return on a SpaceX Dragon spacecraft".', opts('on a SpaceX Dragon spacecraft', 'on a Russian spacecraft', 'on the Starship rocket')),
              mc(40, 'What happened during one Starship test in October?', 'A', '"Starship\'s Super Heavy booster rocket was \'caught\' and secured by a huge structure that includes metal arms".', opts('The booster rocket was caught by metal arms.', 'The rocket landed on the moon.', 'The second stage came down in the Atlantic Ocean.')),
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
      promptHtml: `<p>The chart below shows carbon dioxide (CO₂) emissions per person in six countries in 1990 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'bar', title: 'CO₂ emissions per person (tonnes)', unit: 'tonnes',
        categories: ['United States', 'Germany', 'United Kingdom', 'China', 'Uzbekistan', 'India'], xAxisLabel: 'Country', yAxisLabel: 'Tonnes per person',
        series: [
          { name: '1990', data: [20.3, 13.2, 10.5, 2.2, 5.0, 0.7] },
          { name: '2023', data: [14.3, 7.0, 4.5, 8.6, 3.4, 2.1] },
        ],
      },
      source: { kind: 'owid', dataset: 'co-emissions-per-capita', url: 'https://ourworldindata.org/grapher/co-emissions-per-capita', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Cities around the world are becoming hotter. Some people think the best solution is to plant more trees and create green spaces, while others believe governments should control the building materials and designs that are used in cities.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
