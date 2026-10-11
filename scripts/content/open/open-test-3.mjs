// Vocably Open Test 3 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-3',
  title: "Silk Road, Octopus, Desalination",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'silk-road', title: 'The Silk Road', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o3-r1-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.<br/><strong>NB</strong> There is one extra person you will not need.',
            bank: [
              { key: 'A', text: 'Ferdinand von Richthofen' }, { key: 'B', text: 'Sven Hedin' }, { key: 'C', text: 'Warwick Ball' },
              { key: 'D', text: 'William Dalrymple' }, { key: 'E', text: 'Zhang Qian' }, { key: 'F', text: 'Marco Polo' },
            ],
            questions: [
              q(1, 'wrote the first book with the title <em>The Silk Road</em>', 'B', 'Paragraph C: "The first book entitled The Silk Road was by Swedish geographer Sven Hedin in 1938."', 'C'),
              q(2, 'made popular the German term from which the name "Silk Road" comes', 'A', 'Paragraph C: "first popularized in 1877 by Ferdinand von Richthofen".', 'C'),
              q(3, 'pointed out that sea travel cost much less than travel over land', 'D', 'Paragraph D: "William Dalrymple points out that in pre-modern times, maritime travel cost only a fifth of overland transport".', 'D'),
              q(4, 'described the Silk Road as a "myth" created by modern scholars', 'C', 'Paragraph D: "Going as far as to call the whole thing a \'myth\' of modern academia, Ball argues".', 'D'),
              q(5, 'reported on countries that he had not visited himself', 'E', 'Paragraph F: "He also made reports on neighbouring countries that he did not visit".', 'F'),
            ],
          },
          {
            id: 'o3-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The land routes of the Silk Road covered more than 6,000 kilometres.', 'TRUE', 'Paragraph A: "Spanning over 6,400 km (4,000 mi) on land".', 'A'),
              q(7, 'Marco Polo regularly used the term "Silk Road" in his writing.', 'FALSE', 'Paragraph B: "Even Marco Polo, often linked to the Silk Road, never used the term".', 'B'),
              q(8, 'Ferdinand von Richthofen was the first person ever to use the term "Silk Road".', 'FALSE', 'Paragraph C: "However, the term itself had been in use in decades prior to that."', 'C'),
              q(9, 'The "heavenly horses" of the Dayuan were faster than the horses of the Xiongnu.', 'NOT GIVEN', 'Paragraph G says the horses were tall and powerful and important in fighting the Xiongnu, but does not compare their speed.', 'G'),
            ],
          },
          {
            id: 'o3-r1-notes', type: 'note_completion', wordLimit: W1W,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Goods on the northern Silk Road</strong></p><ul><li>from Persia: dates, saffron powder and {{q10}} nuts</li><li>from India: {{q11}}</li><li>from Egypt: glass {{q12}}</li><li>sent back from China: silk brocade, lacquer-ware and {{q13}}</li></ul>',
            questions: [
              q(10, null, 'pistachio', 'Paragraph E: "dates, saffron powder and pistachio nuts from Persia".', 'E'),
              q(11, null, 'sandalwood', 'Paragraph E: "sandalwood from India".', 'E'),
              q(12, null, 'bottles', 'Paragraph E: "glass bottles from Egypt".', 'E'),
              q(13, null, 'porcelain', 'Paragraph E: "the caravans sent back bolts of silk brocade, lacquer-ware, and porcelain".', 'E'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'octopus', title: 'The Remarkable Octopus', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o3-r2-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(14, 'The order Octopoda contains around ______ species.', '300', 'Paragraph A: "The order consists of some 300 species".', 'A'),
              q(15, 'The largest scientifically documented giant Pacific octopus weighed ______ kg.', '71', 'Paragraph B: "reached a live mass of 71 kg".', 'B'),
              q(16, 'Octopus blood carries oxygen using a copper-rich protein called ______.', 'haemocyanin', 'Paragraph C: "the copper-rich protein haemocyanin to transport oxygen".', 'C'),
              q(17, 'Most octopuses live for no longer than ______ years.', ['four', '4'], 'Paragraph D: "Octopuses have short lifespans, living up to four years."', 'D'),
              q(18, 'The veined octopus uses coconut shells to build a ______.', 'shelter', 'Paragraph F: "uses them to build a shelter".', 'F'),
            ],
          },
          {
            id: 'o3-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(19, 'Why do octopuses mostly crawl rather than swim?', 'A', 'Paragraph C: "The systemic heart becomes inactive when the animal is swimming. Thus, the octopus loses energy quickly and mostly crawls."', opts('Their main heart stops working while they swim, so they tire quickly.', 'Their arms are not strong enough for swimming.', 'Swimming attracts the attention of predators.', 'They cannot see well while swimming.'), 'C'),
              mc(20, 'According to the passage, what triggers senescence in octopuses?', 'B', 'Paragraph D: "Senescence is triggered by the optic glands".', opts('a shortage of food', 'the optic glands', 'mating with several partners', 'low water temperatures'), 'D'),
              mc(21, 'Walking on two arms while copying plant matter allows octopuses to', 'B', 'Paragraph E: it allows them "to move quickly away from a potential predator without being recognised".', opts('find food more easily.', 'escape from predators without being recognised.', 'attract a partner.', 'carry objects such as shells.'), 'E'),
              mc(22, 'How much energy is needed to fully activate the chromatophore system?', 'B', 'Paragraph G: it is high, "nearly matching the energy used at rest".', opts('very little energy', 'almost as much as the octopus uses at rest', 'twice as much as it uses when swimming', 'Scientists have not been able to measure it.'), 'G'),
            ],
          },
          {
            id: 'o3-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'An octopus has more than one heart.', 'TRUE', 'Paragraph C: "They have three hearts".', 'C'),
              q(24, 'All scientists accept the evidence that octopuses learn by watching others.', 'FALSE', 'Paragraph F: "the validity of these findings is contested".', 'F'),
              q(25, 'Some octopuses can grow a new arm after losing one to a predator.', 'TRUE', 'Paragraph H: "some octopuses can detach their arm, which can grow back".', 'H'),
              q(26, 'The mimic octopus is the most intelligent species of octopus.', 'NOT GIVEN', 'Paragraph H describes how the mimic octopus copies dangerous animals, but nothing is said about its intelligence compared with other species.', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'desalination', title: 'Turning Sea Water into Fresh Water', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o3-r3-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 3 has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(27, 'an early belief about a material that could absorb salt', 'D', 'Paragraph D: bamboo mats "believed to have salt-absorbing properties".', 'D'),
              q(28, 'a comparison of the energy needed for desalination in two different years', 'C', 'Paragraph C: "about 3 kWh/m3 ... improved by a factor of 10 from 20–30 kWh/m3 in 1970".', 'C'),
              q(29, 'the opening of the first industrial desalination plant in one country', 'G', 'Paragraph G: "The first industrial desalination plant in the United States opened in Freeport, Texas, in 1961".', 'G'),
              q(30, 'examples of cities where moving water could cost as much as desalinating it', 'I', 'Paragraph I: "In places far from the sea, like New Delhi, or in high places, like Mexico City, transport costs could match desalination costs."', 'I'),
              q(31, 'the creation of a government office to support research', 'E', 'Paragraph E: "the Office of Saline Water was established ... to promote research and development in desalination".', 'E'),
              q(32, 'a design that stops salt from blocking the process', 'J', 'Paragraph J: the panels deposit salts on the "passive" region, "ensuring that the salt does not clog the active region".', 'J'),
            ],
          },
          {
            id: 'o3-r3-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Reverse osmosis</strong></p><p>Reverse osmosis is a {{q33}}-based process in which pressure forces salty water through a semi-permeable membrane that keeps back dissolved salts. In the late 1960s and early 1970s it came to be seen as a promising alternative to {{q34}} desalination. The first plant to use the process on sea water started operating in {{q35}}. Today it is the leading desalination process, and its membrane systems usually need less {{q36}} than thermal processes.</p>',
            questions: [
              q(33, null, 'membrane', 'Paragraph F: "reverse osmosis (RO), a membrane-based process".', 'F'),
              q(34, null, 'thermal', 'Paragraph F: "RO had emerged as a promising alternative to thermal desalination".', 'F'),
              q(35, null, '1975', 'Paragraph G: "In 1975, the first seawater reverse osmosis desalination plant came into operation."', 'G'),
              q(36, null, 'energy', 'Paragraph K: "Reverse osmosis plant membrane systems typically use less energy than thermal desalination processes."', 'K'),
            ],
          },
          {
            id: 'o3-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(37, 'Desalinated sea water is usually cheaper than groundwater.', 'FALSE', 'Paragraph B: "desalinating sea water is generally more costly than fresh water from surface water or groundwater".', 'B'),
              q(38, 'In 2016, desalination used about a quarter of all the energy consumed by the water sector.', 'TRUE', 'Paragraph C: "desalination represented about 25% of the energy consumed by the water sector in 2016".', 'C'),
              q(39, 'Desalinated water from Jubail is pumped more than 300 kilometres to reach Riyadh.', 'TRUE', 'Paragraph I: "water is pumped 320 km inland to Riyadh".', 'I'),
              q(40, 'Singapore produces more desalinated water than California.', 'NOT GIVEN', 'Paragraph H names both as places of extensive use but does not compare the amounts.', 'H'),
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
        order: 1, key: 'american-inventors-rocket-scientist-robert-goddard',
        contextText: 'You will hear a radio programme about an American rocket scientist.',
        questionGroups: [
          {
            id: 'o3-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Robert Goddard</strong></p><ul><li>NASA calls him "the father of modern rocket {{q1}}"</li><li>he said the dream of yesterday is the hope of today and the {{q2}} of tomorrow</li><li>his early rockets used {{q3}} fuels</li><li>1926: launched the world\'s first {{q4}}-fuel rocket</li><li>received money and support from the Smithsonian {{q5}}</li><li>report: "A Method of Reaching Extreme {{q6}}"</li><li>aim: to send weather instruments higher than {{q7}} could fly</li><li>suggested that a rocket might one day reach the {{q8}}</li></ul>',
            questions: [
              q(1, null, 'propulsion', '"the father of modern rocket propulsion".'),
              q(2, null, 'reality', '"the dream of yesterday is the hope of today and the reality of tomorrow".'),
              q(3, null, 'solid', '"rockets that got their power from solid fuels".'),
              q(4, null, 'liquid', '"he successfully launched the world\'s first liquid-fuel rocket".'),
              q(5, null, 'Institution', '"he received money and support from the U.S. Smithsonian Institution".'),
              q(6, null, 'Altitudes', '"A Method of Reaching Extreme Altitudes".'),
              q(7, null, 'balloons', '"to send weather recording instruments higher than balloons could fly".'),
              q(8, null, 'moon', '"the possibility of a rocket someday reaching the moon".'),
            ],
          },
          {
            id: 'o3-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(9, 'Many historians believe that liquid-fuel rocket flight was as important as', 'A', '"as important as the first airplane flight by the American brothers Orville and Wilbur Wright".', opts('the first airplane flight.', 'the first moon landing.', 'the invention of radio.')),
              mc(10, 'How did many people react to Goddard\'s idea about the moon?', 'A', '"Many people thought he was foolish for suggesting something that seemed so impossible."', opts('They thought he was foolish.', 'They offered him money.', 'They took no notice of it.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'american-places-gettysburg-pennsylvania',
        contextText: 'You will hear a report about a famous battlefield and museum in the United States.',
        questionGroups: [
          {
            id: 'o3-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Gettysburg</strong></p><ul><li>a small town in the state of {{q11}}</li><li>the US army was commanded by General George {{q12}}</li><li>the battle began on July {{q13}}, 1863</li><li>about {{q14}} soldiers fought for three days</li><li>more than {{q15}} soldiers were dead, wounded or missing</li><li>the museum has more than 1 million {{q16}}</li><li>a cyclorama painting completely {{q17}} the people looking at it</li><li>the final major attack is called Pickett\'s {{q18}}</li><li>the furthest point reached is called the "High Water {{q19}}"</li><li>Lincoln\'s famous speech lasted just {{q20}} minutes</li></ul>',
            questions: [
              q(11, null, 'Pennsylvania', '"in the eastern state of Pennsylvania".'),
              q(12, null, 'Meade', '"commanded by General George Meade".'),
              q(13, null, ['1', '1st', 'first'], '"The battle of Gettysburg began on July 1, 1863."'),
              q(14, null, ['170,000', '170000'], '"About 170,000 soldiers fought for three days."'),
              q(15, null, ['50,000', '50000'], '"more than 50,000 soldiers were dead, wounded or missing".'),
              q(16, null, 'artifacts', '"The museum has more than 1 million artifacts".'),
              q(17, null, 'surrounds', '"This kind of artwork completely surrounds the people looking at it."'),
              q(18, null, 'Charge', '"it has come to be called Pickett\'s Charge".'),
              q(19, null, 'Mark', '"the point is called the \'High Water Mark.\'"'),
              q(20, null, ['two', '2'], '"Lincoln spoke for just two minutes."'),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'improve-your-learning-by-teaching',
        contextText: 'You will hear an education programme about how teaching others can improve your own learning.',
        questionGroups: [
          {
            id: 'o3-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(21, 'What did the 1982 study find about tutoring?', 'B', '"A 1982 study found that tutoring helped both the tutors and the people who studied with them."', opts('It helped only the students who were tutored.', 'It helped both the tutors and their students.', 'It helped only the tutors.')),
              mc(22, 'Who was Jean-Pol Martin?', 'B', '"Jean-Pol Martin, a French teacher in Germany".', opts('a German researcher', 'a French teacher working in Germany', 'an American university professor')),
              mc(23, 'The 2013 study compared people who taught a lesson with people who', 'A', '"compared the learning results of people who actually taught a lesson to those who simply prepared but did not teach".', opts('only prepared to teach.', 'only read the lesson.', 'taught the lesson online.')),
              mc(24, 'The 2018 study suggests that teaching helps learning mainly because of', 'B', '"you have to remember the information you have learned as you continue to teach. Experts call this \'retrieval.\'"', opts('repetition of new words.', 'retrieval of information from memory.', 'reduced stress.')),
              mc(25, 'Why is asking for feedback important when you teach?', 'A', '"will help you realize that you may not understand some things as well as you thought you did".', opts('It shows you that you may not understand something as well as you thought.', 'It makes your lessons shorter.', 'It helps you get better marks in exams.')),
            ],
          },
          {
            id: 'o3-l3-sent', type: 'sentence_completion', wordLimit: W1W,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(26, 'Tutoring means teaching one person or a very small ______ of students.', 'group', '"Tutoring means teaching one person or a very small group of students."'),
              q(27, 'Martin\'s "Learning by Teaching" method is also known as ______.', 'LdL', '"his \'Learning by Teaching\' method, also called LdL".'),
              q(28, 'The word ______ means continuing beyond the usual or expected amount of time.', 'persistent', '"Persistent is a term that means continuing beyond the usual or expected amount of time."'),
              q(29, 'David Robson suggests writing an ______ that describes what you have learned.', 'email', '"you could write an email describing what you have learned in great detail".'),
              q(30, 'You could record a ______ of yourself teaching and share it with friends.', 'video', '"You could record video of yourself teaching information."'),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'education-tips-what-is-good-digital-citizenship',
        contextText: 'You will hear an education programme about young people and social media.',
        questionGroups: [
          {
            id: 'o3-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Survey of students</strong></p><ul><li>{{q31}} out of ten said some people think too much about their posts</li><li>about a {{q32}} said it was acceptable to post a version of yourself that is not completely real</li><li>more than {{q33}} said social media are "tearing us apart"</li><li>Common Sense Media is a non-profit group based in {{q34}}</li><li>it offers free lesson {{q35}} on digital citizenship</li></ul>',
            questions: [
              q(31, null, ['eight', '8'], '"Eight out of ten students said".'),
              q(32, null, 'third', '"About a third said it was acceptable".'),
              q(33, null, 'half', '"More than half of those questioned said that social media are \'tearing us apart\'".'),
              q(34, null, 'California', '"a non-profit group based in California".'),
              q(35, null, 'plans', '"Common Sense Media has free lesson plans for all grade levels on digital citizenship."'),
            ],
          },
          {
            id: 'o3-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'What does "digital drama" mean?', 'A', '"\'Digital drama\' is the everyday arguments and small problems that come up between friends".', opts('everyday arguments and small problems between people online', 'television programmes about the internet', 'expressing hatred of a group of people')),
              mc(37, 'Why did Bayly DiPilato decide not to use Facebook with her students?', 'A', '"she did not want to use Facebook to communicate with students because it is too personal".', opts('She felt it was too personal.', 'Her students did not use it.', 'Her school did not allow it.')),
              mc(38, 'Why did she not rely on email?', 'A', '"Although her students have email, she found they do not often look at it."', opts('Her students did not often check it.', 'It was too slow.', 'Parents could read the messages.')),
              mc(39, 'What time limit is given as an example for answering students\' questions?', 'B', '"they will only answer questions until nine at night on school nights".', opts('until six in the evening', 'until nine at night', 'until midnight')),
              mc(40, 'When sharing class work online, teachers should post pictures of', 'B', '"teachers must remember to post pictures of students\' work but not of the students themselves".', opts('the students themselves.', 'the students\' work, but not the students.', 'the classroom only.')),
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
      promptHtml: `<p>The graph below shows the percentage of electricity generated from renewable sources in four countries between 2000 and 2024.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'line', title: 'Share of electricity from renewables (%)', unit: '%',
        categories: ['2000', '2005', '2010', '2015', '2020', '2024'], xAxisLabel: 'Year', yAxisLabel: '% of electricity',
        series: [
          { name: 'Germany', data: [6.2, 10.3, 16.9, 29.4, 44.4, 58.6] },
          { name: 'United Kingdom', data: [2.6, 4.3, 6.9, 24.6, 43.1, 50.6] },
          { name: 'China', data: [16.6, 16.2, 18.7, 24.0, 28.1, 33.7] },
          { name: 'United States', data: [9.2, 8.7, 10.3, 13.6, 20.3, 24.1] },
        ],
      },
      source: { kind: 'owid', dataset: 'share-electricity-renewables', url: 'https://ourworldindata.org/grapher/share-electricity-renewables', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>In many parts of the world, fresh water is becoming increasingly scarce.</p><p>What are the causes of this problem, and what measures could be taken to solve it?</p>',
    },
  },
};
