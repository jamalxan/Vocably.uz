// Vocably Open Test 4 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-4',
  title: "Glaciers, Mangroves, Vertical Farming",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'glacier', title: 'Glaciers', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o4-r1-headings', type: 'matching_headings',
            instructionHtml: 'Reading Passage 1 has eight paragraphs, A-H. Choose the correct heading for paragraphs B-G from the list of headings below.',
            bank: [
              { key: 'i', text: 'The world\'s biggest store of fresh water' },
              { key: 'ii', text: 'Why glacier ice is not white' },
              { key: 'iii', text: 'The two giant ice masses that remain today' },
              { key: 'iv', text: 'Where glaciers meet the ocean' },
              { key: 'v', text: 'From falling snow to moving ice' },
              { key: 'vi', text: 'A long period of shrinking, briefly interrupted' },
              { key: 'vii', text: 'How scientists measure the speed of ice' },
              { key: 'viii', text: 'Glaciers in the world\'s hot deserts' },
            ],
            questions: [
              q(1, 'Paragraph B', 'i', 'Paragraph B: "Glacial ice is the largest reservoir of fresh water on Earth".', 'B'),
              q(2, 'Paragraph C', 'ii', 'Paragraph C explains why a glacier "appears blue", including "the lack of air bubbles".', 'C'),
              q(3, 'Paragraph D', 'iii', 'Paragraph D: "The only extant ice sheets are the two that cover most of Antarctica and Greenland."', 'D'),
              q(4, 'Paragraph E', 'iv', 'Paragraph E: "Tidewater glaciers are glaciers that terminate in the sea".', 'E'),
              q(5, 'Paragraph F', 'v', 'Paragraph F describes snow turning into névé, firn and glacial ice until "it begins to move".', 'F'),
              q(6, 'Paragraph G', 'vi', 'Paragraph G: glaciers "have retreated substantially", apart from an advance "between 1950 and 1985".', 'G'),
            ],
          },
          {
            id: 'o4-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(7, 'Glaciers can be found on every continent, including the Australian mainland.', 'FALSE', 'Paragraph A: glaciers are found "on every continent other than the Australian mainland".', 'A'),
              q(8, 'Pakistan has more glacial ice than any other country outside the polar regions.', 'TRUE', 'Paragraph A: "Pakistan has more glacial ice than any other country outside the polar regions."', 'A'),
              q(9, 'Most tidewater glaciers break off below the level of the sea.', 'FALSE', 'Paragraph E: "Most tidewater glaciers calve above sea level".', 'E'),
              q(10, 'James Forbes worked as a professor at a Scottish university.', 'NOT GIVEN', 'Paragraph H says Forbes gave the correct explanation in the 1840s but gives no information about his job.', 'H'),
            ],
          },
          {
            id: 'o4-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'If the ice sheets of Antarctica and Greenland both melted, sea levels would rise by over ______ metres.', '70', 'Paragraph D: "global sea levels would rise by over 70 m".', 'D'),
              q(12, 'A glacier usually begins in an armchair-shaped landform known as a ______.', ['cirque', 'corrie', 'cwm'], 'Paragraph F: "A glacier usually originates from a cirque landform (alternatively known as a corrie or as a cwm)".', 'F'),
              q(13, 'On steeper slopes, a glacier can start to move with as little as ______ metres of snow-ice.', '15', 'Paragraph F: "this can occur with as little as 15 m (49 ft) of snow-ice".', 'F'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'mangrove', title: 'Mangrove Forests', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o4-r2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Getting oxygen in waterlogged mud</strong></p><ul><li>Red mangrove: holds itself above the water with stilt or {{q14}} roots, and takes in air through lenticels in its {{q15}}</li><li>Black mangrove: grows pneumatophores, which stick up out of the soil like {{q16}}</li><li>these "breathing tubes" can be over {{q17}} metres tall in some species</li></ul>',
            questions: [
              q(14, null, 'prop', 'Paragraph D: "props itself above the water level with stilt or prop roots".', 'D'),
              q(15, null, 'bark', 'Paragraph D: "absorbs air through lenticels in its bark".', 'D'),
              q(16, null, 'straws', 'Paragraph E: "which stick up out of the soil like straws for breathing".', 'E'),
              q(17, null, '3', 'Paragraph F: "and in some species, over 3 m".', 'F'),
            ],
          },
          {
            id: 'o4-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(18, 'Which country has the largest area of mangroves?', 'B', 'Paragraph C: "Indonesia has the world\'s largest extent of mangroves".', opts('Brazil', 'Indonesia', 'Australia', 'Nigeria'), 'C'),
              mc(19, 'What does recent research on the red mangrove suggest about the "sacrificial leaf" idea?', 'A', 'Paragraph G: "the older, yellowing leaves have no more measurable salt content than the other, greener leaves".', opts('Older yellow leaves contain no more salt than green leaves.', 'It is true for every species of mangrove.', 'Old leaves hold almost all of the plant\'s salt.', 'Leaves take in salt directly from sea water.'), 'G'),
              mc(20, 'Mangroves described as "viviparous" have seeds that', 'B', 'Paragraph H: "their seeds germinate while still attached to the parent tree".', opts('can float for long periods.', 'begin to grow while still attached to the parent tree.', 'can only grow in very salty water.', 'are spread by animals.'), 'H'),
              mc(21, 'What happens to a propagule when it reaches water with low salinity?', 'B', 'Paragraph I: "the elongated shape now floats vertically rather than horizontally. In this position, it is more likely to lodge in the mud and root."', opts('It sinks quickly to the bottom.', 'It floats upright and is more likely to take root.', 'It dries out and dies.', 'It produces new seeds.'), 'I'),
            ],
          },
          {
            id: 'o4-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(22, 'Most mangroves grow between latitudes 30° N and 30° S.', 'TRUE', 'Paragraph A: "mainly between latitudes 30° N and 30° S".', 'A'),
              q(23, 'Europe has a small area of mangrove forest.', 'FALSE', 'Paragraph C: "Europe reported no mangrove area".', 'C'),
              q(24, 'Red mangrove propagules can remain alive for up to a year while floating.', 'TRUE', 'Paragraph I: they "remain buoyant and viable for up to a year".', 'I'),
              q(25, 'Mangroves store more carbon than any other type of forest.', 'NOT GIVEN', 'Paragraph L gives the amount of carbon stored by mangroves but makes no comparison with other forests.', 'L'),
              q(26, 'The roots of mangroves make tidal water move faster.', 'FALSE', 'Paragraph K: "they slow down tidal water".', 'K'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'vertical-farming', title: 'Vertical Farming', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o4-r3-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 3 has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(27, 'the original meaning of a term, which differs from its present meaning', 'E', 'Paragraph E: "His use of the term differs from the current meaning".', 'E'),
              q(28, 'a business that failed even though it used only renewable electricity', 'I', 'Paragraph I: "powered only by renewable electricity. The company failed to make a profit".', 'I'),
              q(29, 'figures showing how much more productive farming can be when it continues all year', 'G', 'Paragraph G: "All-season farming multiplies the productivity of the farmed surface by a factor of 4 to 6".', 'G'),
              q(30, 'a description of container farms that use much less water', 'F', 'Paragraph F: "using 97% less water through water recapture".', 'F'),
              q(31, 'examples of extreme weather that can damage outdoor crops', 'H', 'Paragraph H: crops "suffer from undesirable temperatures, rain, monsoon, hailstorm, tornado, flooding, wildfires and drought".', 'H'),
            ],
          },
          {
            id: 'o4-r3-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The modern vertical farm</strong></p><p>The modern idea of vertical farming was proposed in {{q32}} by Dickson Despommier of Columbia University. He and his students designed a skyscraper farm that could feed {{q33}} people. Although this design has never been {{q34}}, it made the idea popular. Today, combined with technologies such as specialised {{q35}} lights, vertical farms can produce more than ten times the crop yield of traditional methods.</p>',
            questions: [
              q(32, null, '1999', 'Paragraph B: "proposed in 1999 by Dickson Despommier".', 'B'),
              q(33, null, ['50,000', '50000'], 'Paragraph B: "a skyscraper farm that could feed 50,000 people".', 'B'),
              q(34, null, 'built', 'Paragraph B: "Although the design has not yet been built".', 'B'),
              q(35, null, 'LED', 'Paragraph B: "such as specialized LED lights".', 'B'),
            ],
          },
          {
            id: 'o4-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(36, 'Vertical farms can grow every kind of crop cost-effectively.', 'FALSE', 'Paragraph D: "They cannot grow all types of crops".', 'D'),
              q(37, 'If they use electricity that is not low-carbon, vertical farms may pollute more than traditional farms.', 'TRUE', 'Paragraph D: "vertical farms could produce more pollution than traditional farms or greenhouses".', 'D'),
              q(38, 'Greenhouses usually keep carbon dioxide at the same level as the outside air.', 'FALSE', 'Paragraph J: "Greenhouses commonly supplement CO2 levels to three–four times the atmospheric rate."', 'J'),
              q(39, 'With strawberries, year-round indoor farming can be up to 30 times as productive.', 'TRUE', 'Paragraph G: "With crops such as strawberries, the factor may be as high as 30."', 'G'),
              q(40, 'TerraFarms sold more container systems in Asia than in North America.', 'NOT GIVEN', 'Paragraph F describes the TerraFarms system but says nothing about where it was sold.', 'F'),
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
        order: 1, key: 'pearl-s-buck-the-first-american-woman-to-win-a-nobel-prize-in-literature',
        contextText: 'You will hear a radio programme about an American writer.',
        questionGroups: [
          {
            id: 'o4-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Pearl S. Buck</strong></p><ul><li>1931: the top-selling book in the US was <em>The Good {{q1}}</em></li><li>the following year she won the {{q2}} Prize</li><li>{{q3}}: became the first American woman to win the Nobel Prize in Literature</li><li>China was her home for nearly {{q4}} years</li><li>studied {{q5}} at a college in Virginia</li><li>her husband was a religious worker who studied {{q6}}</li><li>they lived in a small {{q7}} in the north of China</li></ul>',
            questions: [
              q(1, null, 'Earth', '"The top selling book in the United States was The Good Earth".'),
              q(2, null, 'Pulitzer', '"Buck won the Pulitzer Prize for the best novel".'),
              q(3, null, '1938', '"In 1938, Buck became the first American woman to be awarded the Nobel Prize in Literature."'),
              q(4, null, ['40', 'forty'], '"For nearly 40 years, China was her home."'),
              q(5, null, 'philosophy', '"to study philosophy at Randolph-Macon Woman\'s College".'),
              q(6, null, 'agriculture', '"He was a religious worker who studied agriculture."'),
              q(7, null, 'village', '"moved to a small village in the north of China".'),
            ],
          },
          {
            id: 'o4-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(8, '<em>The Good Earth</em> tells the story of', 'A', '"The Good Earth is the story of a poor Chinese man named Wang Lung. His wife is O-Lan."', opts('a poor Chinese man and his wife.', 'an American family living in China.', 'a rich Chinese merchant.')),
              mc(9, 'Where did Buck buy a farm after returning to the United States?', 'B', '"She bought Green Hills Farm in eastern Pennsylvania."', opts('Virginia', 'Pennsylvania', 'Ohio')),
              mc(10, 'What did Buck tell young people?', 'B', '"they needed to know more about other people around the world".', opts('They should learn to speak Chinese.', 'They needed to know more about people around the world.', 'They should become writers.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'mary-kay-a-leader-in-the-beauty-product-industry',
        contextText: 'You will hear a report about the woman who started a beauty products company.',
        questionGroups: [
          {
            id: 'o4-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Mary Kay Cosmetics</strong></p><ul><li>the business started in the 1960s with an investment of ${{q11}}</li><li>Mary Kay was born in Texas in {{q12}}</li><li>she married when she was {{q13}} years old</li><li>the skin care products were first made by J.W. Heath in {{q14}}</li><li>she paid ${{q15}} for the legal rights to the products</li><li>the company began operating in 1963 in {{q16}}, Texas</li></ul>',
            questions: [
              q(11, null, ['5,000', '5000'], '"with an investment of $5,000".'),
              q(12, null, '1918', '"born in the state of Texas in 1918".'),
              q(13, null, '17', '"Mary Kay married Ben Rogers when she was 17 years old."'),
              q(14, null, 'Arkansas', '"developed by her father, J.W. Heath, in Arkansas".'),
              q(15, null, '500', '"She paid $500 for the legal rights to the products."'),
              q(16, null, 'Dallas', '"The Mary Kay Cosmetics company began operating in Dallas, Texas."'),
            ],
          },
          {
            id: 'o4-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(17, 'How did the company sell its products?', 'B', '"to sell skin care products through demonstrations in homes and offices".', opts('in department stores', 'through demonstrations in homes and offices', 'by mail order')),
              mc(18, 'Why were experienced sales representatives willing to train new ones?', 'A', '"each representative who brought other saleswomen into the company would receive part of the new person\'s earnings".', opts('They received part of the new person\'s earnings.', 'They were paid extra for each hour of training.', 'They were given a company car.')),
              mc(19, 'Until a few years ago, one of the top prizes was', 'A', '"Until a few years ago, a pink Cadillac was a top prize."', opts('a pink car.', 'a diamond ring.', 'a house.')),
              mc(20, 'The Mary Kay Ash Charitable Foundation provides money for research on', 'B', '"provides money to support research on cancers affecting women".', opts('heart disease.', 'cancers that affect women.', 'children\'s illnesses.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'finally-a-world-series-for-baseball',
        contextText: 'You will hear a sports report about baseball\'s championship series.',
        questionGroups: [
          {
            id: 'o4-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The World Series</strong></p><ul><li>the first official World Series was played in {{q21}}</li><li>the New York Yankees have won {{q22}} titles</li><li>the championship is a best-of-{{q23}}-game series</li><li>Ohtani\'s 10-year contract was worth ${{q24}} million</li><li>this year Ohtani hit {{q25}} home runs</li><li>Judge set the American League record of 62 home runs in {{q26}}</li></ul>',
            questions: [
              q(21, null, '1905', '"the first official World Series, as it is known today, was in 1905".'),
              q(22, null, '27', '"the New York Yankees have won 27 World Series titles".'),
              q(23, null, ['seven', '7'], '"The competition is a best-of-seven-game championship."'),
              q(24, null, '700', '"a record 10-year contract valued at $700 million".'),
              q(25, null, '54', '"Ohtani hit 54 home runs".'),
              q(26, null, '2022', '"Judge himself holds the American League record with 62 home runs in 2022."'),
            ],
          },
          {
            id: 'o4-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(27, 'Which two teams are playing in this year\'s World Series?', 'A', '"the Yankees will face the Los Angeles Dodgers".', opts('the Yankees and the Dodgers', 'the Yankees and the Mets', 'the Dodgers and the Mets')),
              mc(28, 'Where is Juan Soto from?', 'B', '"Juan Soto of the Dominican Republic".', opts('Japan', 'the Dominican Republic', 'the United States')),
              mc(29, 'How much can the best seats cost on the reselling market?', 'B', '"up to $10,000 for the best seats".', opts('about $1,000', 'up to $10,000', 'about $700')),
              mc(30, 'In which country is the television broadcast expected to set a record?', 'B', '"expected to set a record for people watching in Ohtani\'s home country of Japan".', opts('the United States', 'Japan', 'Canada')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'four-ways-to-find-an-english-speaking-partner',
        contextText: 'You will hear an education programme giving advice on finding someone to practise English with.',
        questionGroups: [
          {
            id: 'o4-l4-notes', type: 'note_completion', wordLimit: W1W,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>Four tips for finding a speaking partner</strong></p><ul><li>Tip 1: join Facebook {{q31}}, not just pages</li><li>very large groups may be less {{q32}} than smaller ones</li><li>Tip 2: Meetup.com is a {{q33}} website for people with similar interests</li><li>members often meet in public places such as coffee {{q34}}</li><li>Tip 3: try a language {{q35}}</li><li>Tip 4: "cast a wide {{q36}}"</li></ul>',
            questions: [
              q(31, null, 'groups', '"Facebook groups are excellent for finding people who share your interests".'),
              q(32, null, 'active', '"groups with thousands of members may not be as active as smaller groups".'),
              q(33, null, 'free', '"Meetup is a free website".'),
              q(34, null, 'houses', '"meet in public places, such as coffee houses".'),
              q(35, null, 'exchange', '"Our third tip is to try a language exchange."'),
              q(36, null, 'net', '"Our final tip for today is to \'cast a wide net.\'"'),
            ],
          },
          {
            id: 'o4-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(37, 'Which group members does the speaker suggest messaging?', 'A', '"If you notice that someone writes a lot of useful comments or questions, they are probably serious about learning English."', opts('people who write a lot of useful comments or questions', 'the people who run the group', 'only native speakers of English')),
              mc(38, 'What is special about a language exchange?', 'A', '"In a language exchange, a meeting is divided into practicing two languages."', opts('The meeting is divided between two languages.', 'Only English is spoken.', 'A teacher leads each meeting.')),
              mc(39, 'Which of these is NOT given as a way to use a language exchange wisely?', 'B', '"decide on clear goals, choose the right partner, state your expectations and prepare for your meetings".', opts('deciding on clear goals', 'paying your partner', 'preparing for your meetings')),
              mc(40, 'What does the speaker say about your practice partner?', 'B', '"He or she may not live in your city – or even your country".', opts('They should live in your city.', 'They might not live in your country.', 'They should be a qualified teacher.')),
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
      promptHtml: `<p>The chart below shows the percentage of the population living in urban areas in five countries in 1960, 2000 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'bar', title: 'Share of the population living in urban areas (%)', unit: '%',
        categories: ['Japan', 'Brazil', 'China', 'Nigeria', 'India'], xAxisLabel: 'Country', yAxisLabel: '% of population',
        series: [
          { name: '1960', data: [63.3, 44.7, 19.7, 14.2, 17.9] },
          { name: '2000', data: [78.6, 81.1, 36.4, 43.3, 27.6] },
          { name: '2023', data: [92.1, 87.6, 65.5, 62.2, 35.1] },
        ],
      },
      source: { kind: 'owid', dataset: 'share-of-population-urban', url: 'https://ourworldindata.org/grapher/share-of-population-urban', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people believe that growing food inside cities, for example in vertical farms, is the best way to feed the world\'s growing urban population.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
