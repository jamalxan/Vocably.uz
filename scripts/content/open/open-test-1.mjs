// Vocably Open Test 1 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-open-test-1',
  title: "Printing Press, Coral Reefs, Placebo",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'printing-press', title: 'The Printing Press', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o1-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              q(1, 'a list of existing technologies that were combined in a single machine', 'B', 'Paragraph B: "utilizing four existing technologies: the screw press, movable type, the codex book format, and mechanized paper production".', 'B'),
              q(2, 'figures comparing the daily output of different printing methods', 'F', 'Paragraph F compares "1,500 and 3,600 impressions per workday" with woodblock printing and the Kabin type.', 'F'),
              q(3, 'a change from listening to texts in groups to reading alone', 'G', 'Paragraph G: "away from communal oral recitation toward silent and private reading".', 'G'),
              q(4, 'a reference to a legal case that gives early evidence of the inventor\'s work', 'C', 'Paragraph C: "The first known mention of Gutenberg\'s work is in a 1439 lawsuit".', 'C'),
              q(5, 'an explanation of why scientific texts were replaced more quickly after printing', 'H', 'Paragraph H: scholars "could now circulate them with printing to more people".', 'H'),
            ],
          },
          {
            id: 'o1-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Before Gutenberg\'s press, fewer hand-written books were available than people wanted.', 'TRUE', 'Paragraph B: "the supply of manuscripts was much less than the demand".', 'B'),
              q(7, 'Gutenberg had trained as a gemcutter before he began work on the press.', 'FALSE', 'Paragraph C: he "had formerly worked as a professional goldsmith"; the gemcutter was his partner, Andreas Dritzehn.', 'C'),
              q(8, 'Every copy of the Gutenberg Bible contains some colour printing.', 'FALSE', 'Paragraph D: the colour trial is "present only in some copies".', 'D'),
              q(9, 'Martin Luther paid printers himself to reproduce his works.', 'NOT GIVEN', 'Paragraph F gives the number of editions and copies of Luther\'s works but says nothing about who paid for them.', 'F'),
              q(10, 'By 1480, printing was taking place in more than one hundred locations.', 'TRUE', 'Paragraph E: "As early as 1480, there were printers active in 110 different places".', 'E'),
            ],
          },
          {
            id: 'o1-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Gutenberg\'s metal type was made from a mixture of lead, tin and ______.', 'antimony', 'Paragraph C: "an alloy of lead, tin, and antimony".', 'C'),
              q(12, 'Compared with the water-based inks used earlier, Gutenberg\'s oil-based ink was more ______.', 'durable', 'Paragraph D: "more durable than the previously used water-based inks".', 'D'),
              q(13, 'The Korean Kabin metal type of 1434 could print ______ sheets per day.', ['40', 'forty'], 'Paragraph F: "could print 40 sheets per day".', 'F'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'coral-reef', title: 'Coral Reefs', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o1-r2-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Darwin\'s theory of atoll formation</strong></p><p>Charles Darwin developed his theory during the voyage of the {{q14}}. He believed that atolls were created by the uplift and {{q15}} of the oceanic crust. First, a fringing reef grows around an extinct {{q16}} island; later it becomes a barrier reef and finally an atoll. Darwin also predicted that a base of {{q17}} would be found under each lagoon, and later research supported this. His theory reflected his knowledge that coral polyps thrive in tropical water that is {{q18}}.</p>',
            questions: [
              q(14, null, 'Beagle', 'Paragraph D: "during the voyage of the Beagle".', 'D'),
              q(15, null, 'subsidence', 'Paragraph D: "uplift and subsidence of Earth\'s oceanic crust".', 'D'),
              q(16, null, 'volcanic', 'Paragraph D: "around an extinct volcanic island".', 'D'),
              q(17, null, 'bedrock', 'Paragraph E: "underneath each lagoon would be a bedrock base".', 'E'),
              q(18, null, 'agitated', 'Paragraph E: "thrive in the tropics where the water is agitated".', 'E'),
            ],
          },
          {
            id: 'o1-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              { ...q(19, 'The total area of shallow coral reefs is roughly equal to', 'B', 'Paragraph A: "about half the area of France".', 'A'), options: [{ key: 'A', text: 'the area of France.' }, { key: 'B', text: 'half the area of France.' }, { key: 'C', text: 'a quarter of the ocean.' }, { key: 'D', text: 'the area of all tropical seas.' }] },
              { ...q(20, 'Why are barrier reefs rarer than fringing reefs?', 'C', 'Paragraph G: "Formation takes considerably longer than for a fringing reef; thus, barrier reefs are much rarer."', 'G'), options: [{ key: 'A', text: 'They need warmer water.' }, { key: 'B', text: 'Their lagoons are too deep for coral.' }, { key: 'C', text: 'They take much longer to form.' }, { key: 'D', text: 'They can only form next to a shoreline.' }] },
              { ...q(21, 'What happens when a reef reaches a "Darwin Point"?', 'B', 'Paragraph I: production "no longer keeps pace with relative sea level, and the reef structure permanently drowns".', 'I'), options: [{ key: 'A', text: 'The reef begins to grow above sea level.' }, { key: 'B', text: 'Reef growth can no longer keep up with sea level and the reef drowns.' }, { key: 'C', text: 'A fringing reef turns into an atoll.' }, { key: 'D', text: 'Corals start to grow in temperate waters.' }] },
              { ...q(22, 'What do corals provide for the zooxanthellae that live in them?', 'C', 'Paragraph J: "the corals shelter the zooxanthellae ... and provide a constant supply of the carbon dioxide".', 'J'), options: [{ key: 'A', text: 'glucose and amino acids' }, { key: 'B', text: 'direct sunlight' }, { key: 'C', text: 'shelter and carbon dioxide' }, { key: 'D', text: 'nitrogen and phosphorus' }] },
            ],
          },
          {
            id: 'o1-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'Most of the coral reefs that exist today are less than 10,000 years old.', 'TRUE', 'Paragraph C: "Most coral reefs are less than 10,000 years old."', 'C'),
              q(24, 'Sunscreen is the most serious threat facing coral reefs.', 'NOT GIVEN', 'Paragraph B lists sunscreen among several threats but does not rank them.', 'B'),
              q(25, 'Coral reefs are able to grow above sea level.', 'FALSE', 'Paragraph F: they "cannot grow above sea level".', 'F'),
              q(26, 'Few coral reefs are found in water colder than 18 °C.', 'TRUE', 'Paragraph I: "few reefs exist in waters below 18 °C".', 'I'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'placebo', title: 'The Placebo Effect', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o1-r3-features', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following findings (Questions 27-31) and the list of studies below. Match each finding with the correct study, <strong>A-E</strong>.',
            bank: [
              { key: 'A', text: 'the 2010 Cochrane review by Hróbjartsson and Gøtzsche' },
              { key: 'B', text: 'the 2008 meta-analysis led by Irving Kirsch' },
              { key: 'C', text: 'the reanalysis of the same FDA data' },
              { key: 'D', text: 'the 2001 meta-analysis' },
              { key: 'E', text: 'the 2021 systematic review' },
            ],
            questions: [
              q(27, 'A significant placebo effect was shown only for pain, out of 40 medical conditions.', 'D', 'Paragraph C: "A 2001 meta-analysis ... in 40 different medical conditions ... the only one ... was for pain".', 'C'),
              q(28, 'Most of the response to antidepressants could be explained by placebos.', 'B', 'Paragraph E: "82% of the response to antidepressants was accounted for by placebos".', 'E'),
              q(29, 'An earlier study contained serious errors in its calculations.', 'C', 'Paragraph E: the reanalysis found "important flaws in the calculations".', 'E'),
              q(30, 'Research into open-label placebos is still at an early stage.', 'E', 'Paragraph D: "research on OLPs is still in its infancy".', 'D'),
              q(31, 'Placebo interventions do not generally have important clinical effects.', 'A', 'Paragraph C: Hróbjartsson and Gøtzsche "did not find that placebo interventions have important clinical effects in general".', 'C'),
            ],
          },
          {
            id: 'o1-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(32, 'In an ideal placebo-controlled trial, participants cannot tell the placebo from the treatment being tested.', 'TRUE', 'Paragraph A: placebos "should ideally be indistinguishable" from the treatments under investigation.', 'A'),
              q(33, 'Placebos have been shown to cure the underlying disease in many patients.', 'FALSE', 'Paragraph C: "placebos do not appear to affect the actual diseases".', 'C'),
              q(34, 'The early trials of open-label placebos involved large numbers of participants.', 'FALSE', 'Paragraph D: they "were done with a small number of participants".', 'D'),
              q(35, 'The word "nocebo" comes from a Latin expression meaning "I shall harm".', 'TRUE', 'Paragraph F: "nocebo (Latin nocebo = \'I shall harm\')".', 'F'),
              q(36, 'Most doctors in the United States have prescribed a placebo at some time.', 'NOT GIVEN', 'Paragraph G discusses whether prescribing placebos is ethical but gives no figures for doctors in any country.', 'G'),
            ],
          },
          {
            id: 'o1-r3-sent', type: 'sentence_completion', wordLimit: W1W,
            instructionHtml: 'Complete the sentences below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            questions: [
              q(37, 'An unusually high or low measurement followed by a less extreme one is an example of regression to the ______.', 'mean', 'Paragraph B: "regression to the mean (a statistical effect where an unusually high or low measurement is likely to be followed by a less extreme one)".', 'B'),
              q(38, 'Critics argue that using placebos can delay the proper ______ and treatment of serious medical conditions.', 'diagnosis', 'Paragraph G: "can delay the proper diagnosis and treatment of serious medical conditions".', 'G'),
              q(39, 'In 1811, a placebo was defined as a medicine adapted more to ______ than to benefit the patient.', 'please', 'Paragraph H: "any medicine adapted more to please than to benefit the patient".', 'H'),
              q(40, 'In double-blinded trials, the ______ also do not know which subjects are receiving the placebo.', 'researchers', 'Paragraph I: "so that the researchers also do not know which test subjects are receiving the active or placebo treatment".', 'I'),
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
        order: 1, key: 'american-inventions-the-television',
        contextText: 'You will hear a radio programme about the inventor of the television.',
        questionGroups: [
          {
            id: 'o1-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Philo Taylor Farnsworth</strong></p><ul><li>born in August 1906 in the state of {{q1}}</li><li>his first home had no {{q2}}</li><li>at fourteen, he believed a device for sending pictures would have to be {{q3}}, not mechanical</li><li>he called his idea "light in a {{q4}}"</li><li>he showed his drawing to his {{q5}}, Justin Tolman</li><li>September {{q6}}: the first working television receiver</li><li>1930: received {{q7}} documents from the US government</li><li>had legal disputes with a powerful company called {{q8}}</li><li>developed more than {{q9}} devices for modern television</li><li>also invented the first electronic {{q10}}</li></ul>',
            questions: [
              q(1, null, 'Utah', '"near Indian Creek in the western state of Utah".'),
              q(2, null, 'electricity', '"The house he lived in ... had no electricity."'),
              q(3, null, 'electronic', '"Philo believed such a device would have to be electronic."'),
              q(4, null, 'bottle', '"Philo called it \'light in a bottle.\'"'),
              q(5, null, 'teacher', '"Philo\'s teacher was Justin Tolman."'),
              q(6, null, '1927', '"In September 1927, Philo turned on ... the first working television receiver."'),
              q(7, null, 'patent', '"the United States government gave Philo patent documents".'),
              q(8, null, 'RCA', '"a powerful company at the time known as RCA".'),
              q(9, null, '100', '"He developed more than 100 devices".'),
              q(10, null, 'microscope', '"invented the first electronic microscope".'),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'yellowstone-the-world-s-first-national-park',
        contextText: 'You will hear a report about a famous national park in the United States.',
        questionGroups: [
          {
            id: 'o1-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Yellowstone National Park</strong></p><ul><li>established in {{q11}}</li><li>covers almost {{q12}} square kilometres</li><li>most of the park is in the state of {{q13}}</li><li>sits on top of an ancient super {{q14}}</li><li>hot liquid rock lies about {{q15}} kilometres under the park</li><li>has more than {{q16}} geysers</li><li>"Old Faithful" erupts about every {{q17}} minutes</li></ul>',
            questions: [
              q(11, null, '1872', '"Established in 1872".'),
              q(12, null, ['9,000', '9000'], '"It takes up almost 9,000 square kilometers."'),
              q(13, null, 'Wyoming', '"Most of the park lies within the western state of Wyoming."'),
              q(14, null, 'volcano', '"It sits on top of an ancient super volcano".'),
              q(15, null, ['six', '6'], '"A lake of hot liquid rock is about six kilometers under the park."'),
              q(16, null, '300', '"The park is home to more than 300 geysers."'),
              q(17, null, ['90', 'ninety'], '"it erupts about every 90 minutes".'),
            ],
          },
          {
            id: 'o1-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              { ...q(18, 'What is the average height of the Yellowstone plateau?', 'B', '"an average height of 2,400 meters above sea level".'), options: [{ key: 'A', text: '365 metres' }, { key: 'B', text: '2,400 metres' }, { key: 'C', text: '93 metres' }] },
              { ...q(19, 'What happened in the park in the summer of 1988?', 'B', '"In summer of 1988, forest fires burned large areas of the park."'), options: [{ key: 'A', text: 'A volcano erupted.' }, { key: 'B', text: 'Forest fires burned large areas.' }, { key: 'C', text: 'The park was closed to visitors.' }] },
              { ...q(20, 'In 2024, the bison population of the park was estimated at about', 'A', '"park officials estimated the bison population to be about 4,500 animals".'), options: [{ key: 'A', text: '4,500.' }, { key: 'B', text: '9,000.' }, { key: 'C', text: '300.' }] },
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'education-tips-avoid-ineffective-study-methods',
        contextText: 'You will hear an education programme about ways of studying for tests.',
        questionGroups: [
          {
            id: 'o1-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              { ...q(21, 'Mary Pyc is described as', 'B', '"American Mary Pyc is a cognitive scientist."'), options: [{ key: 'A', text: 'a school teacher.' }, { key: 'B', text: 'a cognitive scientist.' }, { key: 'C', text: 'a writer of study guides.' }] },
              { ...q(22, 'According to Pyc, rereading is not very effective because students', 'B', '"you are not trying to actively retrieve the information".'), options: [{ key: 'A', text: 'quickly become bored.' }, { key: 'B', text: 'do not actively try to retrieve information.' }, { key: 'C', text: 'read the material too quickly.' }] },
              { ...q(23, 'Rereading can give students a false sense of', 'A', '"you have this sense of fluency that is leading you to think \'Ok, yes, I know the information.\'"'), options: [{ key: 'A', text: 'fluency.' }, { key: 'B', text: 'tiredness.' }, { key: 'C', text: 'speed.' }] },
              { ...q(24, 'What second problem with highlighting does Pyc mention?', 'B', '"Students aren\'t always aware of what the most important information is."'), options: [{ key: 'A', text: 'Students highlight too much of the text.' }, { key: 'B', text: 'Students may not know which information is most important.' }, { key: 'C', text: 'Students forget to review what they have highlighted.' }] },
              { ...q(25, 'Compared with not studying at all, rereading and highlighting are', 'A', '"While better than not studying at all, she believes they are not as useful as other habits."'), options: [{ key: 'A', text: 'better.' }, { key: 'B', text: 'worse.' }, { key: 'C', text: 'equally useful.' }] },
            ],
          },
          {
            id: 'o1-l3-sent', type: 'sentence_completion', wordLimit: W1W,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(26, 'Students often underline information with a writing instrument such as a ______.', 'marker', '"with a writing instrument such as a marker".'),
              q(27, 'One better idea is to ______ yourself.', 'test', '"One idea is to test yourself."'),
              q(28, 'Simple ______ and practice exams can help you check what you have learned.', 'flashcards', '"Simple flashcards and practice exams can help".'),
              q(29, 'Spaced practice means practising remembering new information over ______.', 'time', '"practice remembering the new information over time".'),
              q(30, 'Effective learning takes time and it takes ______.', 'effort', '"effective learning takes time and it takes effort".'),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'can-bees-dogs-identify-cancer-earlier-than-machines',
        contextText: 'You will hear a report about research into animals that can detect disease.',
        questionGroups: [
          {
            id: 'o1-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Detecting cancer by smell</strong></p><ul><li>bees sense chemicals using their {{q31}}</li><li>honeybees can sniff out {{q32}} cancer on a patient\'s breath</li><li>bees told cancer breath from healthy breath {{q33}} percent of the time</li><li>aim: a portable system that delivers test results {{q34}}</li><li>Saha hopes for a working system within the next {{q35}} years</li><li>a dog\'s sense of smell is 10,000 to 100,000 times sharper than that of {{q36}}</li></ul>',
            questions: [
              q(31, null, 'antennae', '"using antennae, structures on their heads".'),
              q(32, null, 'lung', '"honeybees can sniff out lung cancer on a patient\'s breath".'),
              q(33, null, ['93', 'ninety-three'], '"93 percent of the time".'),
              q(34, null, 'immediately', '"This would deliver test results immediately."'),
              q(35, null, ['five', '5'], '"within the next five years".'),
              q(36, null, 'humans', '"10,000 to 100,000 times sharper than that of humans".'),
            ],
          },
          {
            id: 'o1-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              { ...q(37, 'Debajit Saha works at', 'B', '"an assistant professor of biomedical engineering at Michigan State University".'), options: [{ key: 'A', text: 'the University of Pennsylvania.' }, { key: 'B', text: 'Michigan State University.' }, { key: 'C', text: 'a hospital in Philadelphia.' }] },
              { ...q(38, 'According to Cindy Otto, what makes dogs especially good at this work?', 'B', '"part of what makes dogs so good is that they cooperate with humans".'), options: [{ key: 'A', text: 'They are cheaper than machines.' }, { key: 'B', text: 'They cooperate with humans.' }, { key: 'C', text: 'They need very little training.' }] },
              { ...q(39, 'The dogs in the Penn Vet programme', 'B', '"they live with families and are brought to \'work\' each day".'), options: [{ key: 'A', text: 'live at the research centre.' }, { key: 'B', text: 'live with families.' }, { key: 'C', text: 'work only at weekends.' }] },
              { ...q(40, 'What did doctors in ancient Greece and Rome do, according to Otto?', 'B', '"doctors in ancient Greece and Rome used odor as a tool to identify disease".'), options: [{ key: 'A', text: 'They trained dogs to find illness.' }, { key: 'B', text: 'They used smell to identify disease.' }, { key: 'C', text: 'They kept bees for medicine.' }] },
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
      promptHtml: `<p>The graph below shows the percentage of the population using the Internet in five countries between 2000 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'line', title: 'Share of the population using the Internet (%)', unit: '%',
        categories: ['2000', '2005', '2010', '2015', '2020', '2023'], xAxisLabel: 'Year', yAxisLabel: '% of population',
        series: [
          { name: 'United Kingdom', data: [26.8, 70.0, 85.0, 92.0, 94.8, 95.4] },
          { name: 'China', data: [1.8, 8.5, 34.3, 50.3, 70.1, 90.6] },
          { name: 'Uzbekistan', data: [0.5, 3.3, 15.9, 42.8, 71.1, 89.0] },
          { name: 'India', data: [0.5, 2.4, 7.5, 14.9, 43.4, 60.3] },
          { name: 'Nigeria', data: [0.1, 3.5, 11.5, 22.5, 31.9, 40.1] },
        ],
      },
      source: { kind: 'owid', dataset: 'share-of-individuals-using-the-internet', url: 'https://ourworldindata.org/grapher/share-of-individuals-using-the-internet', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people believe that printed books will soon disappear because people can now read everything on screens. Others think that printed books will always have a place in our lives.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
