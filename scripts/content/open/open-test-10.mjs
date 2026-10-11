// Vocably Open Test 10 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-10',
  title: "Pyramids, Sundials, Dogs",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'egyptian-pyramids', title: 'The Egyptian Pyramids', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o10-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has twelve paragraphs, A-L. Which paragraph contains the following information? <em>Choose the correct letter, A-L.</em>',
            questions: [
              q(1, 'evidence that a harbour helped to move building materials', 'D', 'Paragraph D: "Sediment cores show evidence of a Nile-connected harbor functioning along the Giza plateau".', 'D'),
              q(2, 'a written record of how stone was transported', 'K', 'Paragraph K: logbooks that "documented the transport of white limestone from the Tura quarries".', 'K'),
              q(3, 'a pyramid that was lost and later found again', 'I', 'Paragraph I: the "Headless Pyramid" was lost "for a second time" and "found again only during an archaeological dig conducted in 2008".', 'I'),
              q(4, 'the reason why pyramids were built on one side of a river', 'H', 'Paragraph H: the west bank, "as the site of the setting sun, was associated with the realm of the dead".', 'H'),
              q(5, 'a pyramid that appears larger than it really is', 'J', 'Paragraph J: Khafre\'s pyramid "appears larger than the adjacent Khufu pyramid ... it is, in fact, smaller in both height and volume".', 'J'),
            ],
          },
          {
            id: 'o10-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The Pyramid of Khufu is the oldest of the Seven Wonders of the Ancient World.', 'TRUE', 'Paragraph C: it is the last Wonder still in existence, "despite being the oldest by about 2,000 years".', 'C'),
              q(7, 'Ancient Egyptian writings said that Imhotep designed the Pyramid of Djoser.', 'FALSE', 'Paragraph E: the Egyptians "did not credit him with either designing Djoser\'s pyramid or the invention of stone architecture".', 'E'),
              q(8, 'The large pyramids of the Middle Kingdom were mainly built of stone.', 'FALSE', 'Paragraph F: "instead of stone, mudbrick was the main construction material".', 'F'),
              q(9, 'Lepsius personally visited every pyramid on his list.', 'NOT GIVEN', 'Paragraph I says Lepsius produced the list but not how he collected the information.', 'I'),
            ],
          },
          {
            id: 'o10-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Approximately ______ pyramids were built in the Kingdom of Kush.', '80', 'Paragraph A: "Approximately 80 pyramids were built within the Kingdom of Kush".', 'A'),
              q(11, 'Most pyramids were covered in polished, highly reflective white ______.', 'limestone', 'Paragraph G: "most pyramids were faced with polished, highly reflective white limestone".', 'G'),
              q(12, 'Lepsius\'s list of 1842 counted ______ pyramids.', '67', 'Paragraph I: "in which he counted 67".', 'I'),
              q(13, 'The sand in front of the sleds was ______ to reduce friction.', 'wetted', 'Paragraph L: "with sand in front of the sled wetted to reduce friction".', 'L'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'sundial', title: 'Telling the Time by the Sun', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o10-r2-notes', type: 'note_completion', wordLimit: W1W,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Parts of a sundial</strong></p><ul><li>the {{q14}} casts a shadow onto the dial</li><li>the edge of it that tells the time is called the {{q15}}</li><li>this edge must be parallel to the axis of the Earth\'s {{q16}}</li><li>its angle from the horizontal is equal to the sundial\'s geographical {{q17}}</li><li>to install many dials you need to know the direction to true {{q18}}</li></ul>',
            questions: [
              q(14, null, 'gnomon', 'Paragraph A: "a gnomon, which casts a shadow onto the dial".', 'A'),
              q(15, null, 'style', 'Paragraph A: "The style is the time-telling edge of the gnomon".', 'A'),
              q(16, null, 'rotation', 'Paragraph A: "The style must be parallel to the axis of the Earth\'s rotation".', 'A'),
              q(17, null, 'latitude', 'Paragraph A: "The style\'s angle from horizontal is equal to the sundial\'s geographical latitude."', 'A'),
              q(18, null, 'north', 'Paragraph D: installation "requires knowing the local latitude ... and the direction to true north".', 'D'),
            ],
          },
          {
            id: 'o10-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(19, 'Why do many cheap decorative sundials not tell the correct time?', 'C', 'Paragraph B: they "have incorrectly aligned gnomons, shadow lengths, and hour-lines, which cannot be adjusted".', opts('They are made of poor materials.', 'They are usually placed in the shade.', 'Their parts are wrongly aligned and cannot be adjusted.', 'They do not include daylight saving time.'), 'B'),
              mc(20, 'What are the earliest sundials known from archaeology?', 'A', 'Paragraph E: "The earliest sundials known from the archaeological record are shadow clocks (1500 BC or BCE) from ancient Egyptian astronomy and Babylonian astronomy."', opts('Egyptian and Babylonian shadow clocks', 'Greek water clocks', 'Roman canonical sundials', 'Italian mural sundials'), 'E'),
              mc(21, 'What were canonical sundials used for?', 'D', 'Paragraph E: "A canonical sundial is one that indicates the canonical hours of liturgical acts".', opts('measuring the size of the Earth', 'showing the months of the year', 'navigating at sea', 'showing the times of religious services'), 'E'),
              mc(22, 'What are sundial mottos often like, according to the passage?', 'B', 'Paragraph G: "sometimes sombre reflections on the passing of time ... but equally often humorous witticisms".', opts('instructions for reading the dial', 'either serious thoughts about time or jokes', 'the names of the dial makers', 'religious prayers'), 'G'),
            ],
          },
          {
            id: 'o10-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'A sundial made for the Northern Hemisphere can be used unchanged in the Southern Hemisphere.', 'FALSE', 'Paragraph H: it "must be reversed for use at the opposite latitude in the other hemisphere".', 'H'),
              q(24, 'In the Southern Hemisphere, the hour numbers on a horizontal dial run anticlockwise.', 'TRUE', 'Paragraph H: "on a horizontal dial they run anticlockwise (US: counterclockwise) rather than clockwise".', 'H'),
              q(25, 'Daylight saving time usually changes the official time by one hour.', 'TRUE', 'Paragraph I: it "changes the official time, usually by one hour".', 'I'),
              q(26, 'Giovanni Padovani\'s treatise was later translated into English.', 'NOT GIVEN', 'Paragraph E mentions the 1570 treatise but says nothing about translations.', 'E'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'domestication-of-the-dog', title: 'From Wolf to Dog', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o10-r3-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 3 has six paragraphs, A-F. Which paragraph contains the following information? <em>Choose the correct letter, A-F.</em><br/><strong>NB</strong> You may use any letter more than once.',
            questions: [
              q(27, 'the oldest known burial of a human together with a dog', 'C', 'Paragraph C: "the oldest known human-dog coburial, Bonn–Oberkassel dog (14,500 cal BP)".', 'C'),
              q(28, 'reasons why it is difficult to date when dogs split from wolves', 'E', 'Paragraph E: the split "occurred over a short period of time, so that the time of the divergence is difficult to date".', 'E'),
              q(29, 'the claim that the dog is an example of social rather than artificial selection', 'B', 'Paragraph B: "the domestication of the dog is a prominent example of social selection rather than artificial selection".', 'B'),
              q(30, 'a list of places where samples of five ancient dog lineages were found', 'D', 'Paragraph D: "five ancestral lineages ... found in the Levant ..., Karelia ..., Lake Baikal".', 'D'),
              q(31, 'a change in the position of wolves in the food chain', 'F', 'Paragraph F: "one type of wolf population rose to become today\'s apex predator".', 'F'),
            ],
          },
          {
            id: 'o10-r3-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The first dogs</strong></p><p>The domestication of animals began with a long association between wolves and hunter-gatherers more than {{q32}} years ago. The dog was the first species, and the only large {{q33}}, to be domesticated. The remains of the Erralla dog are thought to be the first {{q34}} dog, although other remains are older. The oldest known dog skeletons, found in Siberia and in a cave in {{q35}}, are about 33,000 years old.</p>',
            questions: [
              q(32, null, ['17,500', '17500'], 'Paragraph B: "hunter–gatherers more than 17,500 years ago".', 'B'),
              q(33, null, 'carnivore', 'Paragraph B: "the only large carnivore to have been domesticated".', 'B'),
              q(34, null, 'undisputed', 'Paragraph B: "the Erralla dog 17,500 years ago to be the first undisputed dog".', 'B'),
              q(35, null, 'Belgium', 'Paragraph B: "found in the Altai Mountains of Siberia and a cave in Belgium".', 'B'),
            ],
          },
          {
            id: 'o10-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(36, 'Modern grey wolves are the direct ancestors of dogs.', 'FALSE', 'Paragraph E: "modern wolves not being directly ancestral to it".', 'E'),
              q(37, 'Dogs were domesticated before people began farming.', 'TRUE', 'Paragraph C: "The domestication of the dog predates agriculture".', 'C'),
              q(38, 'Scientists agree on exactly where dogs were first domesticated.', 'FALSE', 'Paragraph C: "Where the domestication of the dog took place remains debated".', 'C'),
              q(39, 'The New Guinea singing dog is the most intelligent of the ancient dog lineages.', 'NOT GIVEN', 'Paragraph D lists the New Guinea singing dog as one lineage but says nothing about intelligence.', 'D'),
              q(40, 'Dogs and wolves have continued to interbreed since domestication.', 'TRUE', 'Paragraph E: "the cross-breeding that has occurred between dogs and wolves since domestication".', 'E'),
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
        order: 1, key: 'tips-to-address-cyberbullying',
        contextText: 'You will hear a report about bullying on the internet.',
        questionGroups: [
          {
            id: 'o10-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Cyberbullying</strong></p><ul><li>more than {{q1}} state attorneys general wrote a letter to Facebook\'s founder</li><li>2019 survey: {{q2}} percent of students bullied online were girls</li><li>teenagers use entertainment media for 7 hours and {{q3}} minutes a day</li><li>38 percent of young people were depressed in 2020, up from {{q4}} percent two years before</li><li>October is National Bullying Prevention Awareness {{q5}}</li></ul>',
            questions: [
              q(1, null, '40', '"More than 40 state attorneys general wrote a letter".'),
              q(2, null, '20.4', '"While 20.4 percent of students bullied online were girls".'),
              q(3, null, '22', '"teenagers use an average of 7 hours, 22 minutes of entertainment media a day".'),
              q(4, null, '25', '"38 percent of teens and young adults were depressed in 2020, up from 25 percent two years before".'),
              q(5, null, 'Month', '"October is National Bullying Prevention Awareness Month."'),
            ],
          },
          {
            id: 'o10-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(6, 'What did Facebook delay?', 'B', '"Facebook delayed the development of its child version of Instagram".', opts('a new messaging service', 'a version of Instagram for children', 'a study of teenagers\' mental health')),
              mc(7, 'What does the report say about ignoring hateful posts?', 'C', '"While ignoring posts might seem easier than blocking someone, it will not make the problem go away."', opts('It is the best way to deal with them.', 'It is against most websites\' rules.', 'It will not make the problem go away.')),
              mc(8, 'Adults should try to make children feel more', 'A', '"Adults can try to make their kids feel more empathy towards others".', opts('empathy towards others.', 'confident online.', 'interested in school.')),
              mc(9, 'What did France create in January?', 'B', '"the country created a special court to try online crimes".', opts('a law banning social media for children', 'a special court for online crimes', 'a website for reporting bullying')),
              mc(10, 'How many people were convicted of harassing a teenage girl online?', 'C', '"Eleven people were convicted this summer".', opts('four', 'seven', 'eleven')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'tips-for-writing-they-say-i-say',
        contextText: 'You will hear an education report about a popular book on academic writing.',
        questionGroups: [
          {
            id: 'o10-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong><em>They Say, I Say</em></strong></p><ul><li>the book is required at more than {{q11}} universities</li><li>the difficult part is learning to read and think {{q12}}</li><li>a paper should begin with what {{q13}} have already said about the subject</li><li>Graff: most published journalism and {{q14}} follow this basic form</li><li>a new edition will be released on February {{q15}}</li></ul>',
            questions: [
              q(11, null, ['1,000', '1000'], '"It is a required book at more than 1,000 universities."'),
              q(12, null, 'critically', '"The difficult part is learning to read and think critically."'),
              q(13, null, 'others', '"A paper should begin with what others have already said about the subject".'),
              q(14, null, 'scholarship', '"Most published journalism and scholarship follows this basic form."'),
              q(15, null, ['first', '1st', '1'], '"An expanded third edition of \'They Say I Say\' will be released on February first."'),
            ],
          },
          {
            id: 'o10-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(16, 'What is the goal of the book?', 'A', '"The goal of this short book is to take the mystery out of academic writing."', opts('to take the mystery out of academic writing', 'to teach English grammar', 'to help students pass exams')),
              mc(17, 'What do English learners often think academic writing is about?', 'C', '"English learners often think that academic writing is all about spelling, grammar, and organization."', opts('reading as many books as possible', 'giving strong personal opinions', 'spelling, grammar and organisation')),
              mc(18, 'According to the authors, a college paper should show the writer', 'B', '"A college paper should show the writer entering a debate among experts."', opts('agreeing with famous experts.', 'entering a debate among experts.', 'avoiding any personal opinion.')),
              mc(19, 'Where else does Birkenstein say the "they say, I say" form is used?', 'A', '"whether you\'re writing on Facebook and whether you\'re sending an email, whether you\'re writing a poem or a novel".', opts('on Facebook, in emails and even in poems', 'only in university writing', 'only in newspapers')),
              mc(20, 'What should you do if you are not sure what to write about?', 'C', '"summarize a good author, find out who that author is responding to".', opts('ask your teacher for a topic', 'write down your own opinion first', 'summarise a good author and find the debate')),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'how-to-gain-confidence-in-your-english-speaking',
        contextText: 'You will hear an education programme about speaking English with more confidence.',
        questionGroups: [
          {
            id: 'o10-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>Yuliana Vasquez is a researcher at the University of {{q21}}</li><li>Magdi Saleh is based in {{q22}}, Egypt</li><li>tip 1: use positive self-{{q23}}</li><li>tip 2: speak louder and {{q24}} down your speech</li><li>Vasquez advises practising for at least {{q25}} minutes every day</li></ul>',
            questions: [
              q(21, null, 'Panama', '"a language researcher at the University of Panama".'),
              q(22, null, 'Cairo', '"Magdi Saleh is an English teacher and teacher trainer based in Cairo, Egypt."'),
              q(23, null, 'talk', '"So our first piece of advice is to use positive self-talk."'),
              q(24, null, 'slow', '"The next tip is to speak louder and slow down your speech."'),
              q(25, null, '30', '"spend at least 30 minutes each day practicing your English".'),
            ],
          },
          {
            id: 'o10-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(26, 'What did the speaker notice about students who lacked confidence?', 'B', '"Those who lacked confidence spoke too softly."', opts('They spoke too fast.', 'They spoke too softly.', 'They never asked questions.')),
              mc(27, 'What did the speaker ask for in Brazil?', 'C', '"I remember asking a building doorman for the fitness center key."', opts('directions to a hotel', 'a taxi', 'the key to the fitness centre')),
              mc(28, 'What does Saleh advise when reading for pleasure?', 'A', '"he advises not stopping to check word meanings in a dictionary while reading".', opts('Do not stop to look words up in a dictionary.', 'Read only short texts.', 'Read the same story several times.')),
              mc(29, 'What does the speaker say is the purpose of speaking a language?', 'B', '"the purpose of speaking a language is to communicate".', opts('to avoid mistakes', 'to communicate', 'to sound like a native speaker')),
              mc(30, 'What may happen if you try something too difficult for your level?', 'A', '"you may fail. This can harm your confidence."', opts('It can harm your confidence.', 'You will learn faster.', 'Your teacher will be disappointed.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'four-tips-to-combat-the-fear-of-laughter',
        contextText: 'You will hear an education programme about dealing with the fear of being laughed at when speaking a new language.',
        questionGroups: [
          {
            id: 'o10-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>Amy Melendez ordered a corn-based drink called {{q31}}</li><li>her conversation with the man was entirely in {{q32}}</li><li>Josh Plotkin is an American who lives in {{q33}}</li><li>in a role {{q34}}, people act out an imaginary situation</li><li>Oshiberu suggests that you {{q35}} your voice when you practise alone</li></ul>',
            questions: [
              q(31, null, 'atole', '"a corn-based beverage from Central America called atole".'),
              q(32, null, 'Spanish', '"Her spoken exchange with the man was entirely in Spanish."'),
              q(33, null, 'Brazil', '"Josh Plotkin is an American living in Brazil."'),
              q(34, null, 'play', '"In a role play, two or more people act out an imaginary situation".'),
              q(35, null, 'record', '"another solution is to record your voice as you train by yourself".'),
            ],
          },
          {
            id: 'o10-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'According to Oshiberu, why do most people laugh at language learners?', 'C', '"most people who laugh are not trying to be mean or hurtful. Instead, a language learner\'s pronunciation ... may sound unusual".', opts('They want to hurt the learner.', 'They think the learner is not trying hard enough.', 'The learner\'s speech sounds unusual and surprises them.')),
              mc(37, 'Why do some Brazilians laugh at Plotkin?', 'B', '"they aren\'t \'used to hearing an American speaking Portuguese.\'"', opts('His Portuguese is very poor.', 'They are not used to hearing an American speak Portuguese.', 'He tells a lot of jokes.')),
              mc(38, 'What does Oshiberu say about learning goals?', 'A', '"Oshiberu also suggests learners avoid setting learning goals that are too strict".', opts('They should not be too strict.', 'They should be set by a teacher.', 'They should be changed every week.')),
              mc(39, 'What can you ask a person who laughs at what you said?', 'C', '"\'Is there a different way that I could have said it?\'".', opts('"Why are you laughing at me?"', '"Do you speak English?"', '"Is there a different way I could have said it?"')),
              mc(40, 'How does Plotkin react to laughter now?', 'B', '"These days, he even laughs along with the people, using it as a way to make new friends."', opts('He stops speaking Portuguese.', 'He laughs along and uses it to make friends.', 'He asks people to be more polite.')),
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
      promptHtml: `<p>The chart below shows the percentage of the population using the Internet in six countries in 2010 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'bar', title: 'Share of the population using the Internet (%)', unit: '%',
        categories: ['South Korea', 'Kazakhstan', 'Uzbekistan', 'Brazil', 'Egypt', 'Nigeria'], xAxisLabel: 'Country', yAxisLabel: '% of population',
        series: [
          { name: '2010', data: [83.7, 31.6, 15.9, 40.6, 21.6, 11.5] },
          { name: '2023', data: [97.4, 92.9, 89.0, 84.2, 74.0, 40.1] },
        ],
      },
      source: { kind: 'owid', dataset: 'share-of-individuals-using-the-internet', url: 'https://ourworldindata.org/grapher/share-of-individuals-using-the-internet', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people believe that parents are responsible for protecting children from harm on the internet. Others think that social media companies and governments should take this responsibility.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
