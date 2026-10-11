// Vocably Open Test 6 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-6',
  title: "Antikythera, Terracotta Army, Recycling",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'antikythera-mechanism', title: 'The Antikythera Mechanism', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o6-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              q(1, 'the depth of the water where the wreck was found', 'D', 'Paragraph D: the ship "was found at a depth of 45 metres (148 ft)".', 'D'),
              q(2, 'a reason why the mechanism was ignored after it reached the museum', 'E', 'Paragraph E: "It went unnoticed for two years, while museum staff worked on piecing together more obvious treasures".', 'E'),
              q(3, 'how long it was before machines of similar complexity appeared again', 'C', 'Paragraph C: "Machines with similar complexity did not appear again until the 14th century in western Europe."', 'C'),
              q(4, 'a description of technology used to read faint writing on the device', 'B', 'Paragraph B: "used computer X-ray tomography and high resolution scanning ... and read faint inscriptions".', 'B'),
              q(5, 'the suggestion that earlier devices of this kind probably existed', 'H', 'Paragraph H: it "must have had undiscovered predecessors during the Hellenistic period".', 'H'),
            ],
          },
          {
            id: 'o6-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The mechanism was originally found as a single lump.', 'TRUE', 'Paragraph A: it "was found as one lump, later separated into three main fragments".', 'A'),
              q(7, 'Most scholars agreed with Valerios Stais that the device was an astronomical clock.', 'FALSE', 'Paragraph F: "most scholars considered the device to be prochronistic, too complex to have been constructed during the same period".', 'F'),
              q(8, 'Derek de Solla Price became interested in the mechanism in 1951.', 'TRUE', 'Paragraph G: Price "became interested in 1951".', 'G'),
              q(9, 'The sponge divers were paid by the Greek government for the objects they found.', 'NOT GIVEN', 'Paragraph D describes the divers and what they recovered, but not whether they were paid.', 'D'),
            ],
          },
          {
            id: 'o6-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The largest gear originally had ______ teeth.', '223', 'Paragraph A: "originally had 223 teeth".', 'A'),
              q(11, 'The 2005 scans suggest that the mechanism had ______ meshing bronze gears.', '35', 'Paragraph B: "the mechanism had 35 meshing bronze gears".', 'B'),
              q(12, 'When the device was brought up from the sea, the bronze had turned into ______, which cracked and shrank.', 'atacamite', 'Paragraph E: "The bronze had turned into atacamite which cracked and shrank".', 'E'),
              q(13, 'In 2016, the inscriptions revealed numbers connected with the cycles of Venus and ______.', 'Saturn', 'Paragraph B: "numbers connected with the synodic cycles of Venus and Saturn".', 'B'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'terracotta-army', title: 'The Terracotta Army', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o6-r2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The discovery</strong></p><ul><li>date: 29 March {{q14}}</li><li>found by farmers who were digging a {{q15}}</li><li>location: about 1.5 km {{q16}} of the emperor\'s tomb mound</li><li>2007 estimate: more than {{q17}} soldiers in three pits</li></ul>',
            questions: [
              q(14, null, '1974', 'Paragraph C: "The Terracotta Army was discovered on 29 March 1974".', 'C'),
              q(15, null, 'well', 'Paragraph C: "who were digging a well".', 'C'),
              q(16, null, 'east', 'Paragraph C: "approximately 1.5 km (0.93 mi) east of the Qin Emperor\'s tomb mound".', 'C'),
              q(17, null, ['8,000', '8000'], 'Paragraph B: "the three pits containing the Terracotta Army hold more than 8,000 soldiers".', 'B'),
            ],
          },
          {
            id: 'o6-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(18, 'The figures were buried to protect the emperor in his afterlife.', 'TRUE', 'Paragraph A: "with the purpose of protecting him in his afterlife".', 'A'),
              q(19, 'All of the figures have the same face.', 'FALSE', 'Paragraph F: "Their faces appear to be different for each individual figure."', 'F'),
              q(20, 'Much of the paint on the figures came off within minutes of the mud being removed.', 'TRUE', 'Paragraph G: it "would flake off in less than four minutes after removing the mud".', 'G'),
              q(21, 'The sculptors were paid according to the number of figures they produced.', 'NOT GIVEN', 'Paragraph H says the sculptors signed their names, but nothing is said about how they were paid.', 'H'),
            ],
          },
          {
            id: 'o6-r2-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How the figures were made</strong></p><p>The figures were made in workshops by government laborers and local craftsmen, who used local {{q22}}. Heads, arms, legs and bodies were made separately and then {{q23}}. The faces were created using {{q24}}, and clay was added afterwards so that each figure looked different. The legs were probably made in the same way as drainage {{q25}} at the time. Each workshop had to inscribe its {{q26}} on the items it produced, so that quality could be controlled.</p>',
            questions: [
              q(22, null, 'materials', 'Paragraph I: "by government laborers and local craftsmen using local materials".', 'I'),
              q(23, null, 'assembled', 'Paragraph I: "were created separately and then assembled".', 'I'),
              q(24, null, 'molds', 'Paragraph I: "The faces were created using molds".', 'I'),
              q(25, null, 'pipes', 'Paragraph I: "the same way that terracotta drainage pipes were manufactured".', 'I'),
              q(26, null, 'name', 'Paragraph I: "each workshop was required to inscribe its name on items produced to ensure quality control".', 'I'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'recycling', title: 'A Short History of Recycling', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o6-r3-headings', type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has nine paragraphs, A-I. Choose the correct heading for paragraphs C-I from the list of headings below.',
            bank: [
              { key: 'i', text: 'What ancient rubbish tells us about times of shortage' },
              { key: 'ii', text: 'Early recycling driven by profit and crowded towns' },
              { key: 'iii', text: 'Early deposit schemes with very high return rates' },
              { key: 'iv', text: 'Collecting materials as a patriotic duty' },
              { key: 'v', text: 'Rising energy prices lead to investment' },
              { key: 'vi', text: 'One country\'s new rules cause problems worldwide' },
              { key: 'vii', text: 'A small extra charge, and arguments about who should pay' },
              { key: 'viii', text: 'Why some plastics can never be recycled' },
              { key: 'ix', text: 'Recycling electronics in Asian factories' },
            ],
            questions: [
              q(27, 'Paragraph C', 'i', 'Paragraph C: "archaeological studies of ancient waste dumps show less household waste".', 'C'),
              q(28, 'Paragraph D', 'ii', 'Paragraph D: recycling "driven by the economic advantage ... and the need for waste removal in ever-more-densely populated areas".', 'D'),
              q(29, 'Paragraph E', 'iii', 'Paragraph E: refundable deposits "led to recycling rates of 84–99%".', 'E'),
              q(30, 'Paragraph F', 'iv', 'Paragraph F: citizens were urged "to donate metal, paper, rags, and rubber as a patriotic duty".', 'F'),
              q(31, 'Paragraph G', 'v', 'Paragraph G: "A considerable investment in recycling occurred in the 1970s due to rising energy costs."', 'G'),
              q(32, 'Paragraph H', 'vi', 'Paragraph H: China\'s policy "caused drastic disruptions in the global recycling market".', 'H'),
              q(33, 'Paragraph I', 'vii', 'Paragraph I: "a small surcharge is added", and the shift in costs "has created strong opposition in some areas".', 'I'),
            ],
          },
          {
            id: 'o6-r3-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(34, 'Recycling is the ______ step in the "Reduce, Reuse, and Recycle" waste hierarchy.', 'third', 'Paragraph B: it "represents the third step in the \'Reduce, Reuse, and Recycle\' waste hierarchy".', 'B'),
              q(35, 'Paper recycling was first recorded in ______, when shops in Japan sold repulped paper.', '1031', 'Paragraph D: "Paper recycling was first recorded in 1031 when Japanese shops sold repulped paper."', 'D'),
              q(36, 'Recycling aluminium uses only ______ of the energy needed for new production.', ['5%', '5 percent'], 'Paragraph G: "Recycling aluminium uses only 5% of the energy of virgin production."', 'G'),
              q(37, 'China\'s new import policy, announced at the end of 2017, was called "National ______".', 'Sword', 'Paragraph H: "China announced its \'National Sword\' policy".', 'H'),
            ],
          },
          {
            id: 'o6-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(38, 'A glass bottle can be refilled about 20 times.', 'TRUE', 'Paragraph E: "glass bottles can be refilled around 20 times".', 'E'),
              q(39, 'China\'s policy led to higher prices for scrap plastic.', 'FALSE', 'Paragraph H: it "reduced the prices of scrap plastic and low-grade paper".', 'H'),
              q(40, 'Sweden now recycles more aluminium cans than any other country.', 'NOT GIVEN', 'Paragraph E gives Swedish recycling rates but makes no comparison with other countries.', 'E'),
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
        order: 1, key: 'thomas-edison-inventor-and-busy-team-leader',
        contextText: 'You will hear a radio programme about a famous American inventor.',
        questionGroups: [
          {
            id: 'o6-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Thomas Edison</strong></p><ul><li>born on February 11, {{q1}}, in Milan, Ohio</li><li>his {{q2}} taught him reading, writing and mathematics</li><li>at 16, he worked as a {{q3}} operator</li><li>invented an electrical {{q4}} machine</li><li>started his own company in {{q5}}</li><li>1913: a magazine called him the most {{q6}} man in America</li><li>usually worked {{q7}} hours a day</li></ul>',
            questions: [
              q(1, null, '1847', '"Edison was born on February 11, 1847, in Milan, Ohio."'),
              q(2, null, 'mother', '"His mother taught him reading, writing, and mathematics."'),
              q(3, null, 'telegraph', '"at the age of 16, he went to work as a telegraph operator".'),
              q(4, null, 'voting', '"he invented an electrical voting machine".'),
              q(5, null, '1871', '"to start his own company in 1871".'),
              q(6, null, 'useful', '"called Thomas Edison the most useful man in America".'),
              q(7, null, '18', '"He usually worked 18 hours each day".'),
            ],
          },
          {
            id: 'o6-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(8, 'Which invention did Edison say was the most interesting?', 'B', '"the phonograph was really the most interesting".', opts('the electric light', 'the phonograph', 'motion picture film')),
              mc(9, 'Which invention did he say was the hardest to develop?', 'C', '"The hardest invention to develop, he said, was the electric light."', opts('the phonograph', 'the telegraph', 'the electric light')),
              mc(10, 'What did Edison receive in 1928?', 'A', '"In 1928, he received a special medal of honor from the Congress of the United States."', opts('a medal of honor from Congress', 'a prize from a popular magazine', 'his first patent')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'halloween-in-america-costumes-candy-costs-for-night-of-fright',
        contextText: 'You will hear a report about how Americans celebrate and spend money on a holiday.',
        questionGroups: [
          {
            id: 'o6-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Halloween</strong></p><ul><li>expected total spending in 2024: about ${{q11}} billion</li><li>record spending in 2023: ${{q12}} billion</li><li>traditions come from {{q13}} beliefs in ancient Britain</li><li>people built huge {{q14}} to frighten away evil spirits</li><li>most popular children\'s costume this year: {{q15}}</li><li>expected spending on costumes: ${{q16}} billion</li><li>expected spending on candy: ${{q17}} billion</li></ul>',
            questions: [
              q(11, null, '11.6', '"It expects total Halloween spending in 2024 to reach about $11.6 billion."'),
              q(12, null, '12.2', '"total Halloween spending in 2023 was a record-setting $12.2 billion".'),
              q(13, null, 'Celtic', '"Halloween traditions in America are linked to Celtic beliefs in ancient Britain."'),
              q(14, null, 'fires', '"Celts would build huge fires to frighten away any evil spirits".'),
              q(15, null, ['Spider-Man', 'Spiderman'], '"the N.R.F. expects the superhero character Spider-Man to be the most popular children\'s costume".'),
              q(16, null, '3.8', '"total spending on costumes for Halloween 2024 is expected to reach a total of $3.8 billion".'),
              q(17, null, '3.5', '"buyers will spend $3.5 billion on Halloween candy".'),
            ],
          },
          {
            id: 'o6-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(18, 'Who brought Halloween ideas to America?', 'C', '"People from Scotland and Ireland brought these ideas with them when they came to America."', opts('people from France and Spain', 'people from Germany', 'people from Scotland and Ireland')),
              mc(19, 'What do children shout when someone opens the door?', 'A', '"the children yell \'trick or treat.\'"', opts('"trick or treat"', '"happy Halloween"', '"sweets please"')),
              mc(20, 'What do people do with pumpkins?', 'B', '"They also cut scary faces into pumpkins and light them".', opts('They give them to children as prizes.', 'They cut scary faces into them and light them.', 'They hang them from trees.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'top-technology-stories-of-2024',
        contextText: 'You will hear a report looking back at the biggest technology stories of 2024.',
        questionGroups: [
          {
            id: 'o6-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(21, 'What are Microsoft\'s "personal agents" designed to do?', 'B', '"designed to help users complete business activities with little or no human involvement".', opts('replace mobile phones', 'help users complete business tasks with little human involvement', 'write news reports')),
              mc(22, 'What is special about Apple\'s new iPhones?', 'A', '"equipped with special chips to support AI operations".', opts('They have chips to support AI.', 'They can be folded.', 'They work without batteries.')),
              mc(23, 'The new laws in California ban the use of AI to create false images during', 'C', '"to ban the use of AI tools to create false images and videos during election campaigns".', opts('sports events.', 'court cases.', 'election campaigns.')),
              mc(24, 'At the meeting in Seoul, technology companies promised to', 'B', '"signed a promise to develop AI technology in ways that limit possible public harms".', opts('share their profits with governments.', 'develop AI in ways that limit public harm.', 'stop selling AI tools in Asia.')),
              mc(25, 'A judge ruled that Google had broken trade laws with its', 'A', '"a federal judge ruled that Google had violated trade laws by operating its search engine as a monopoly".', opts('search engine.', 'video service.', 'smartphones.')),
            ],
          },
          {
            id: 'o6-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>TikTok\'s Chinese parent company: {{q26}}</li><li>Aurora Innovation\'s driverless trucks: service to begin in {{q27}}</li><li>{{q28}} tractor-trailers will carry goods between Dallas and Houston</li><li>air taxis are called Advanced Air {{q29}} flyers</li><li>"the first new category of aircraft in nearly {{q30}} years"</li></ul>',
            questions: [
              q(26, null, 'ByteDance', '"a law requiring its Chinese parent, ByteDance, to divest itself of TikTok".'),
              q(27, null, 'Texas', '"it planned to begin the service in Texas".'),
              q(28, null, '20', '"with 20 tractor-trailers transporting goods between Dallas and Houston".'),
              q(29, null, 'Mobility', '"a kind of aircraft known as Advanced Air Mobility (AAM) flyers".'),
              q(30, null, '80', '"the first new category of aircraft in nearly 80 years".'),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'improve-english-words-by-testing-yourself',
        contextText: 'You will hear an education report about learning vocabulary.',
        questionGroups: [
          {
            id: 'o6-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>Biler and Knight teach at the University of South {{q31}}</li><li>to read a newspaper you need about {{q32}} words</li><li>for university study you need about {{q33}} words</li><li>learners need to see or hear a word about {{q34}} times</li><li>each flashcard should be no bigger than your {{q35}}</li></ul>',
            questions: [
              q(31, null, 'Carolina', '"the English Programs for Internationals at the University of South Carolina".'),
              q(32, null, ['5,000', '5000'], '"the suggested range for reading a newspaper is around 5,000 words".'),
              q(33, null, ['10,000', '10000'], '"they need to know somewhere around 10,000 words".'),
              q(34, null, ['10', 'ten'], '"English learners need to see or hear a word about 10 times".'),
              q(35, null, 'hand', '"Each card is no bigger than your hand."'),
            ],
          },
          {
            id: 'o6-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'According to Biler, why does English need a large vocabulary?', 'C', '"English uses vocabulary to do that job".', opts('English has more speakers than other languages.', 'English grammar is very difficult.', 'English uses vocabulary, not grammar or word endings, to express meanings.')),
              mc(37, 'What does Mary Pyc say is a helpful method for long-term learning?', 'A', '"Pyc says one helpful method for long-term learning is to test yourself."', opts('testing yourself', 'studying with a partner', 'reading aloud')),
              mc(38, 'What is the problem with cramming, according to Pyc?', 'B', '"the day later you\'re not going to remember any of that information".', opts('It takes too much time.', 'You forget the information the next day.', 'It makes students nervous.')),
              mc(39, 'Which websites does Ray Knight suggest?', 'C', '"He suggests that sites such as Quizlet, Memrise, and English Central can be useful".', opts('YouTube and Facebook', 'Duolingo and Babbel', 'Quizlet, Memrise and English Central')),
              mc(40, 'What can Nation\'s vocabulary test do, according to Biler?', 'A', '"it can help show you where you need to improve".', opts('show you where you need to improve', 'give you an official English certificate', 'tell you exactly how good your English is')),
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
      promptHtml: `<p>The graph below shows the number of mobile phone subscriptions per 100 people in five countries between 2000 and 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'line', title: 'Mobile phone subscriptions per 100 people', unit: 'per 100 people',
        categories: ['2000', '2005', '2010', '2015', '2020', '2022'], xAxisLabel: 'Year', yAxisLabel: 'Subscriptions per 100 people',
        series: [
          { name: 'Japan', data: [52.6, 75.4, 96.2, 126.2, 154.4, 168.6] },
          { name: 'United Kingdom', data: [73.6, 108.0, 121.8, 121.2, 117.3, 119.8] },
          { name: 'Uzbekistan', data: [0.2, 2.7, 73.8, 70.8, 99.4, 105.5] },
          { name: 'Nigeria', data: [0.0, 12.8, 52.4, 79.1, 95.4, 99.6] },
          { name: 'India', data: [0.3, 7.8, 60.5, 75.4, 82.3, 80.2] },
        ],
      },
      source: { kind: 'owid', dataset: 'mobile-cellular-subscriptions-per-100-people', url: 'https://ourworldindata.org/grapher/mobile-cellular-subscriptions-per-100-people', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people think that recycling should be made compulsory by law, with fines for households that do not separate their waste.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
