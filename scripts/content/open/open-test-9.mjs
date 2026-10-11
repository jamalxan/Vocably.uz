// Vocably Open Test 9 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-9',
  title: "Hot Air Balloons, Paper, Volcanoes",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'hot-air-balloon', title: 'The Hot Air Balloon', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o9-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'the record for the highest flight in a hot air balloon', 'F', 'Paragraph F: Singhania "set the world altitude record for highest hot air balloon flight, reaching 21,027 m".', 'F'),
              q(2, 'an early use of flying lanterns for military purposes', 'C', 'Paragraph C: Zhuge Liang "used these airborne lanterns for military signaling".', 'C'),
              q(3, 'the people who were originally chosen to be the first pilots', 'D', 'Paragraph D: "King Louis XVI had originally decreed that condemned criminals would be the first pilots".', 'D'),
              q(4, 'the first trip around the world by balloon without stopping', 'H', 'Paragraph H: "It was the first nonstop trip around the world by balloon."', 'H'),
              q(5, 'the use of a city\'s gas supply to fill a balloon', 'I', 'Paragraph I: "His design utilized gas from municipal lines to inflate the balloon".', 'I'),
            ],
          },
          {
            id: 'o9-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The envelope of a hot air balloon has to be sealed at the bottom.', 'FALSE', 'Paragraph A: "The envelope does not have to be sealed at the bottom".', 'A'),
              q(7, 'The Montgolfier brothers\' first public demonstration had no people on board.', 'TRUE', 'Paragraph D: they "demonstrated it publicly on September 19, 1783, making an unmanned flight lasting 10 minutes".', 'D'),
              q(8, 'The envelope of the Virgin Pacific Flyer was the largest ever built for a hot air craft.', 'TRUE', 'Paragraph G: "the balloon envelope was the largest ever built for a hot air craft".', 'G'),
              q(9, 'Ed Yost and Jim Winker developed their balloons for the US Army.', 'NOT GIVEN', 'Paragraph E says they developed modern balloons in the 1950s but not who they worked for.', 'E'),
            ],
          },
          {
            id: 'o9-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In most balloons, the source of heat is a flame from burning liquid ______.', 'propane', 'Paragraph A: "an open flame caused by burning liquid propane".', 'A'),
              q(11, 'On his tethered flight, Pilatre de Rozier rose to a height of ______ metres.', '26', 'Paragraph D: "reaching an altitude of 26 m (85 ft), the length of the tether".', 'D'),
              q(12, 'The first modern hot air balloon made in the UK was called the ______.', 'Bristol Belle', 'Paragraph E: "The first modern hot air balloon to be made in the United Kingdom (UK) was the Bristol Belle".', 'E'),
              q(13, 'Piccard and Jones travelled for 19 days, 21 hours and ______ minutes.', '55', 'Paragraph H: "traveling 19 days, 21 hours, and 55 minutes".', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'paper', title: 'Paper', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o9-r2-bank', type: 'summary_completion_bank', bankReusable: false,
            instructionHtml: 'Complete the summary using the list of words, <strong>A-I</strong>, below.',
            bank: [
              { key: 'A', text: 'Cai Lun' }, { key: 'B', text: 'textiles' }, { key: 'C', text: 'Baghdad' },
              { key: 'D', text: 'mills' }, { key: 'E', text: 'wood' }, { key: 'F', text: 'Panjikent' },
              { key: 'G', text: 'papyrus' }, { key: 'H', text: 'Talas' }, { key: 'I', text: 'cotton' },
            ],
            stemHtml: '<p><strong>The spread of paper</strong></p><p>Papermaking is traditionally credited to {{q14}}, an official at the Han court, in about 105 CE. Before production became industrial, most paper was made from old {{q15}} collected by ragpickers. Paper reached the Islamic world, and it was being made in {{q16}} by the late 8th century. In the 13th century it spread to Europe, where the first water-powered {{q17}} were built. In the 19th century, new methods of pulping {{q18}} made paper much cheaper.</p>',
            questions: [
              q(14, null, 'A', 'Paragraph B: "developed in East Asia at least as early as 105 CE by the Han court eunuch Cai Lun".', 'B'),
              q(15, null, 'B', 'Paragraph B: "rag paper, made from discarded natural fiber textiles collected by ragpickers".', 'B'),
              q(16, null, 'C', 'Paragraph F: "Paper was being made in Baghdad by the late 8th century."', 'F'),
              q(17, null, 'D', 'Paragraph G: "where the first water-powered paper mills were built".', 'G'),
              q(18, null, 'E', 'Paragraph H: "independently developed processes for pulping wood fibres".', 'H'),
            ],
          },
          {
            id: 'o9-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(19, 'Which of these is NOT given as a reason why papyrus was replaced by paper?', 'D', 'Paragraph D lists limited geography, cost and fragility; it says nothing about ink.', opts('It came from a plant grown mainly in Egypt.', 'It was more expensive to produce.', 'It broke apart easily in damp conditions.', 'It could not be written on with ink.'), 'D'),
              mc(20, 'What does the archive found in Panjikent suggest?', 'B', 'Paragraph F: "When Muslims first encountered paper in the 7th and 8th centuries, it had already been in the region for centuries."', opts('Paper was invented in Central Asia.', 'Paper was used in the region before the Battle of Talas.', 'Chinese prisoners taught Arabs to make paper.', 'Paper was first made from cotton.'), 'F'),
              mc(21, 'Why was paper first called "bagdatikos" in the West?', 'A', 'Paragraph G: "Because paper was introduced to the West through the city of Baghdad, it was first called bagdatikos."', opts('It reached the West through Baghdad.', 'It was invented in Baghdad.', 'It was named after a merchant.', 'It was sold in Baghdad markets.'), 'G'),
              mc(22, 'What happened to paper-based information storage between 1986 and 2007?', 'C', 'Paragraph I: its share fell from 0.33% to 0.007%, "even though, in absolute terms, the world\'s capacity to store information on paper increased".', opts('Both its share and its total capacity fell.', 'Its share of total storage increased.', 'Its share fell, although its total capacity rose.', 'It was replaced completely by digital storage.'), 'I'),
            ],
          },
          {
            id: 'o9-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'Papyrus and paper are made using the same production methods.', 'FALSE', 'Paragraph C: "the two are separate technological developments that use different materials and production methods".', 'C'),
              q(24, 'Worldwide paper consumption has risen by 400% in the past 40 years.', 'TRUE', 'Paragraph K: "Worldwide consumption of paper has risen by 400% over the past 40 years".', 'K'),
              q(25, 'Most paper companies do not plant new trees.', 'FALSE', 'Paragraph K: "Most paper companies also plant trees to help regrow forests."', 'K'),
              q(26, 'Office workers in the US print more pages each day than office workers in Europe.', 'NOT GIVEN', 'Paragraph L gives a figure for US office workers only.', 'L'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'volcano', title: 'Volcanoes', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o9-r3-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 3 has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(27, 'an explanation of how a chain of islands may have been formed', 'C', 'Paragraph C: "The Hawaiian Islands are thought to have been formed in such a manner".', 'C'),
              q(28, 'an event that may have greatly reduced the number of humans', 'H', 'Paragraph H: "This may have created a population bottleneck that affected the genetic inheritance of all humans today."', 'H'),
              q(29, 'examples of places where volcanoes will probably never erupt again', 'F', 'Paragraph F lists extinct volcanoes such as "Hohentwiel in Germany, Shiprock in New Mexico".', 'F'),
              q(30, 'a proposed definition that would include volcanoes on other worlds', 'B', 'Paragraph B: "an opening on a planet or moon\'s surface from which magma ... is erupted".', 'B'),
              q(31, 'a possible link between an eruption and a famine in Russia', 'G', 'Paragraph G: "Sulfur dioxide from the eruption of Huaynaputina may have caused the Russian famine of 1601–1603."', 'G'),
              q(32, 'a way of producing energy from the Earth\'s heat', 'J', 'Paragraph J: "These can be tapped as geothermal power."', 'J'),
            ],
          },
          {
            id: 'o9-r3-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(33, 'Dormant volcanoes have generally not erupted since the beginning of the ______.', 'Holocene', 'Paragraph A: "generally accepted as since the start of the Holocene, about 12,000 years ago".', 'A'),
              q(34, 'Only ______ supervolcano eruptions are known from the last million years.', ['four', '4'], 'Paragraph D: "four are known from the last million years".', 'D'),
              q(35, 'The eruption of Mount Tambora in 1815 led to what became known as the "Year Without a ______".', 'Summer', 'Paragraph I: "became known as the \'Year Without a Summer\'".', 'I'),
              q(36, 'Fluoride salts from eruptions have poisoned ______ in Iceland.', 'livestock', 'Paragraph G: "Excessive fluoride salts from eruptions have poisoned livestock in Iceland on multiple occasions."', 'G'),
            ],
          },
          {
            id: 'o9-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(37, 'Extinct volcanoes no longer have a supply of magma.', 'TRUE', 'Paragraph F: "the volcano no longer has a magma supply".', 'F'),
              q(38, 'All scientists accept the mantle plume hypothesis.', 'FALSE', 'Paragraph C: "However, the mantle plume hypothesis has been questioned."', 'C'),
              q(39, 'Edinburgh Castle is built on top of an active volcano.', 'FALSE', 'Paragraph F: "Edinburgh Castle in Scotland is located atop an extinct volcano".', 'F'),
              q(40, 'Volcanic soil is especially good for growing rice.', 'NOT GIVEN', 'Paragraph J says volcanic soil is very fertile but does not mention any particular crop.', 'J'),
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
        order: 1, key: 'what-is-juneteenth-in-the-us',
        contextText: 'You will hear a report about the history of a holiday in the United States.',
        questionGroups: [
          {
            id: 'o9-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Juneteenth</strong></p><ul><li>the name combines "June" with the number {{q1}}</li><li>Union troops arrived in the city of Galveston, {{q2}}</li><li>there were {{q3}} enslaved people in the state</li><li>Lincoln had declared them free on January 1, {{q4}}</li><li>the first state holiday was declared in {{q5}}</li><li>it became a national holiday in June {{q6}}</li></ul>',
            questions: [
              q(1, null, ['19', 'nineteen'], '"The word \'Juneteenth\' combines the month \'June\' with the number 19."'),
              q(2, null, 'Texas', '"arrived in the city of Galveston, Texas".'),
              q(3, null, ['250,000', '250000'], '"The 250,000 enslaved people in Texas did not know".'),
              q(4, null, '1863', '"on January 1, 1863".'),
              q(5, null, '1980', '"Texas became the first state to declare the day an official state holiday in 1980."'),
              q(6, null, '2021', '"In June 2021, U.S. President Joe Biden declared Juneteenth as the country\'s newest national holiday."'),
            ],
          },
          {
            id: 'o9-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(7, 'Why did enslaved people in Texas not know they were free?', 'B', '"Few Union soldiers were there to communicate or enforce Lincoln\'s order."', opts('Newspapers in Texas were not allowed to report it.', 'There were few Union soldiers there to tell them or enforce the order.', 'The order did not include Texas.')),
              mc(8, 'Why did Black families celebrate near rivers and lakes?', 'C', '"Texas officials refused to permit black people to gather in public spaces. So, black families and friends celebrated Juneteenth near rivers and lakes".', opts('It was a religious tradition.', 'It was too hot in the cities.', 'They were not allowed to gather in public spaces.')),
              mc(9, 'How many states recognised Juneteenth as a public holiday last year?', 'A', '"at least 28 American states and the city government of Washington, D.C. recognized Juneteenth".', opts('at least 28', 'exactly 19', 'all 50')),
              mc(10, 'How do many Black Americans think of Juneteenth?', 'B', '"it is considered the \'country\'s second independence day\' by Black Americans".', opts('as a day of rest', 'as the country\'s second independence day', 'as the start of summer')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'learning-english-with-english-clubs-starting-and-organizing-your-club',
        contextText: 'You will hear an education programme about starting an English club.',
        questionGroups: [
          {
            id: 'o9-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(11, 'What is the most important reason why English clubs help learners?', 'A', '"they offer learners a chance to practice English by actually speaking it".', opts('They give learners a chance to actually speak English.', 'They are cheaper than English classes.', 'They prepare learners for exams.')),
              mc(12, 'For a teacher, what is the easiest way to find club members?', 'C', '"the easiest way is to put up signs in classrooms advertising the club\'s first meeting".', opts('sending emails to parents', 'using social media', 'putting up signs in classrooms')),
              mc(13, 'Which two things should you consider when choosing a meeting place?', 'B', '"how easy is it for members to find and get to the location?" and "it is important to find a location that is safe".', opts('cost and size', 'how easy it is to reach and whether it is safe', 'noise and lighting')),
              mc(14, 'What kind of leadership is suggested for a large club?', 'A', '"if your club is large, it is a good idea to have a group of people that can help run the club".', opts('a group of people sharing the work', 'one experienced teacher', 'a different leader at every meeting')),
            ],
          },
          {
            id: 'o9-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>to find members online, use websites such as Meetup or {{q15}}</li><li>outside school or work, meet at a cafe, restaurant or {{q16}}</li><li>always get {{q17}} from the owners of the place</li><li>at the first meeting, talk about {{q18}} such as fees and how often to meet</li><li>consider holding {{q19}} to choose new leaders</li><li>giving tasks to many members makes them feel {{q20}}</li></ul>',
            questions: [
              q(15, null, 'Facebook', '"Websites such as Meetup or Facebook are great places to announce club meetings".'),
              q(16, null, 'bar', '"consider holding meetings at a cafe, restaurant or bar".'),
              q(17, null, 'permission', '"make sure to speak with the owners of the business or building and get their permission".'),
              q(18, null, 'logistics', '"use the first meeting as a chance to talk with members about logistics".'),
              q(19, null, 'elections', '"You should consider holding elections to choose new leaders."'),
              q(20, null, 'important', '"This makes the members feel important."'),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'five-tips-for-great-language-exchanges',
        contextText: 'You will hear an education programme giving advice about language exchanges.',
        questionGroups: [
          {
            id: 'o9-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>Harry Qiu studies international {{q21}}</li><li>at college he is learning Russian and {{q22}}</li><li>The Mixxer has more than {{q23}} active users</li><li>try to find at least {{q24}} exchange partners</li><li>Bryant recommends giving only one or two {{q25}} after each piece of dialogue</li></ul>',
            questions: [
              q(21, null, 'relations', '"he studies international relations".'),
              q(22, null, 'Japanese', '"he is learning two more languages – Russian and Japanese".'),
              q(23, null, ['35,000', '35000'], '"a website with more than 35,000 active users".'),
              q(24, null, ['two', '2'], '"it is better to find at least two exchange partners".'),
              q(25, null, 'corrections', '"Bryant recommends giving only one or two corrections after each piece of dialogue."'),
            ],
          },
          {
            id: 'o9-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(26, 'According to Bryant, what is the most important question to ask yourself?', 'C', '"the most important question to ask yourself is why you want to learn the language".', opts('how good your English is', 'which website to use', 'why you want to learn the language')),
              mc(27, 'Which is given as a serious reason for learning a language?', 'A', '"moving to another country or using the language for work".', opts('moving to another country', 'meeting new people', 'going on holiday abroad')),
              mc(28, 'Which people are likely to be good partners, according to Bryant?', 'B', '"People who have been on the site and have been active and have a reason to learn the language are much more likely to be good partners".', opts('people who are learning several languages', 'people who are active and have a reason to learn', 'people who have just joined the site')),
              mc(29, 'Why should you prepare topics before each meeting?', 'A', '"Preparing topics ahead of time will also help you avoid having nothing to say at your meetings".', opts('so that you do not run out of things to say', 'so that your partner can correct you', 'so that the meeting is shorter')),
              mc(30, 'When does Qiu correct his partner?', 'C', '"Qiu says he corrects a partner only if the person is struggling to think of a word or cannot finish a sentence."', opts('after every sentence', 'only at the end of the meeting', 'only when the partner cannot find a word or finish a sentence')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'how-to-write-a-college-paper',
        contextText: 'You will hear an education report about writing papers at an American college.',
        questionGroups: [
          {
            id: 'o9-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Writing a college paper</strong></p><ul><li>a college paper can be {{q31}} or more pages long</li><li>Deborah Dessaso works at the University of the District of {{q32}}</li><li>a credible source provides {{q33}} information from experts</li><li>the {{q34}} statement is a one-sentence summary of the main argument</li><li>Nabila Hijazi is an international student from {{q35}}</li></ul>',
            questions: [
              q(31, null, '20', '"A college paper is a piece of writing than can be as long as 20 or more pages."'),
              q(32, null, 'Columbia', '"the Writing Resource Coordinator at the University of the District of Columbia".'),
              q(33, null, 'verifiable', '"A credible source provides verifiable information from experts."'),
              q(34, null, 'thesis', '"This statement is a one-sentence summary of the paper\'s main argument."'),
              q(35, null, 'Syria', '"an international student from Syria".'),
            ],
          },
          {
            id: 'o9-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'According to Dessaso, what do many high schools focus on?', 'B', '"a lot of high schools stress a lot of creative type writing".', opts('research papers', 'creative writing', 'grammar exercises')),
              mc(37, 'According to Hijazi, what is the biggest problem for many international students?', 'C', '"they do not know about the writing systems that we have here, in terms of organization, thesis, transition".', opts('their English grammar', 'their spelling', 'not knowing how American papers are organised')),
              mc(38, 'What does Dessaso say is the best way to improve your writing?', 'A', '"the best option for a student who wants improve their writing is to read".', opts('reading', 'writing every day', 'working with a tutor')),
              mc(39, 'What does Hijazi try to teach students?', 'B', '"the first draft is not the final draft".', opts('that copying is sometimes acceptable', 'that the first draft is not the final one', 'that short papers get better marks')),
              mc(40, 'In the "Present a Fact" example, what percentage of SAT test-takers in 2013 were considered prepared for college?', 'A', '"only 43 percent of test-takers met the SAT\'s definition for being prepared for college".', opts('43 percent', '16 percent', '50 percent')),
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
      promptHtml: `<p>The graph below shows carbon dioxide (CO₂) emissions per person in four countries and the world average between 1990 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'line', title: 'CO₂ emissions per person (tonnes)', unit: 'tonnes',
        categories: ['1990', '2000', '2010', '2020', '2023'], xAxisLabel: 'Year', yAxisLabel: 'Tonnes per person',
        series: [
          { name: 'United States', data: [20.3, 21.4, 18.2, 13.8, 14.3] },
          { name: 'Kazakhstan', data: [15.6, 9.2, 14.7, 14.5, 14.1] },
          { name: 'South Korea', data: [5.7, 9.4, 12.2, 11.5, 11.4] },
          { name: 'China', data: [2.2, 2.9, 6.4, 7.6, 8.6] },
          { name: 'World', data: [4.3, 4.1, 4.7, 4.5, 4.7] },
        ],
      },
      source: { kind: 'owid', dataset: 'co-emissions-per-capita', url: 'https://ourworldindata.org/grapher/co-emissions-per-capita', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people think that the best way to learn a foreign language is to live in a country where it is spoken. Others believe it can be learned just as well at home.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
