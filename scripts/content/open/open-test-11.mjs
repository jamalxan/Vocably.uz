// Vocably Open Test 11 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-11',
  title: 'Bicycles, Silk, Tsunamis',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'bicycle', title: 'The Bicycle', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o11-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a device that helps cyclists to climb a steep hill', 'F', 'Paragraph F: "the Trampe bicycle lift has been developed to encourage cyclists by giving assistance on a steep hill".', 'F'),
              q(2, 'a campaigner\'s words about what the bicycle did for women', 'I', 'Paragraph I: Susan B. Anthony said, "I think it has done more to emancipate woman than any one thing in the world."', 'I'),
              q(3, 'the share of air resistance caused by the rider\'s body', 'D', 'Paragraph D: "the rider\'s body creates about 75% of the total drag".', 'D'),
              q(4, 'a change in clothing connected with the popularity of cycling', 'H', 'Paragraph H: "a movement for so-called rational dress, which helped liberate women from corsets and ankle-length skirts".', 'H'),
              q(5, 'a reason why the number of stolen bicycles is hard to know', 'K', 'Paragraph K: "a large number of crimes are not reported".', 'K'),
            ],
          },
          {
            id: 'o11-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'There were more than a billion bicycles in the world by the early 21st century.', 'TRUE', 'Paragraph A: "By the early 21st century, there were more than 1 billion bicycles."', 'A'),
              q(7, 'Using gears increases the amount of the rider\'s energy that reaches the wheels.', 'FALSE', 'Paragraph C: "the use of gearing mechanisms may reduce this by 10–15%".', 'C'),
              q(8, 'Early cyclists used more energy than people who walked the same distance.', 'FALSE', 'Paragraph E: "bicycles were three times as energy efficient as walking".', 'E'),
              q(9, 'There are more bicycles than people in the Netherlands.', 'NOT GIVEN', 'Paragraph F describes free parking at Dutch train stations but gives no figures for the number of bicycles.', 'F'),
            ],
          },
          {
            id: 'o11-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'At speeds of 16–24 km/h, a cyclist uses only the power needed to ______.', 'walk', 'Paragraph D: a cyclist at these speeds "uses only the power required to walk".', 'D'),
              q(11, 'The hour record set in 2016 reached a speed of over ______ km/h.', '92', 'Paragraph D: "over 92 km/h (57 mph) with a highly streamlined bicycle".', 'D'),
              q(12, 'Ball bearings and ______ tires were first invented for bicycles before being used in cars.', 'pneumatic', 'Paragraph B: "including ball bearings, pneumatic tires, chain-driven sprockets".', 'B'),
              q(13, 'Bicycle manufacturing led to the development of advanced ______ techniques.', 'metalworking', 'Paragraph J: "led to the development of advanced metalworking techniques".', 'J'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'silk', title: 'The Story of Silk', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o11-r2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Silk: key dates</strong></p><ul><li>the earliest evidence of silk, found in tombs at Jiahu, is about {{q14}} years old</li><li>the oldest surviving silk fabric dates from about {{q15}} BC</li><li>legend says silk was developed by the empress {{q16}}</li><li>silk production reached India by AD {{q17}}</li><li>1845: a disease called {{q18}} destroyed many European silkworms</li></ul>',
            questions: [
              q(14, null, ['8,500', '8500'], 'Paragraph B: soil samples from two tombs at Jiahu "date back about 8,500 years".', 'B'),
              q(15, null, '3630', 'Paragraph B: "The earliest surviving example of silk fabric dates from about 3630 BC".', 'B'),
              q(16, null, 'Leizu', 'Paragraph C: "Legend gives credit for developing silk to a Chinese empress, Leizu".', 'C'),
              q(17, null, '140', 'Paragraph D: sericulture reached "India by AD 140".', 'D'),
              q(18, null, 'flacherie', 'Paragraph F: "an epidemic of flacherie among European silkworms devastated the silk industry there".', 'F'),
            ],
          },
          {
            id: 'o11-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(19, 'Why was silk a good material for writing on?', 'C', 'Paragraph C: "The fabric was light, it survived the damp climate of the Yangtze region, absorbed ink well, and provided a white background for the text."', opts('It was cheaper than paper.', 'It could be written on with any colour of ink.', 'It was light, survived damp conditions and absorbed ink well.', 'Only emperors were allowed to use it.'), 'C'),
              mc(20, 'Why did Japan become the world\'s largest silk exporter?', 'A', 'Paragraph G: "mostly due to the economic reforms during the Meiji period and the decline of the Qing dynasty in China".', opts('because of economic reforms in Japan and the decline of the Qing dynasty', 'because Japanese silkworms were healthier', 'because Europe stopped buying Chinese silk', 'because Japan invented artificial silk'), 'G'),
              mc(21, 'How many silkworms are needed to produce 1 kg of silk?', 'B', 'Paragraph I: "To produce 1 kg of silk, 104 kg of mulberry leaves must be eaten by 3000 silkworms."', opts('104', '3,000', '5,000', '10,400'), 'I'),
              mc(22, 'What happens to silk when it is wet?', 'D', 'Paragraph J: "it loses up to 20% of its strength when wet".', opts('It shrinks by half.', 'It becomes stronger.', 'It changes colour.', 'It loses up to a fifth of its strength.'), 'J'),
            ],
          },
          {
            id: 'o11-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'Chinese emperors tried to keep the methods of silk production secret.', 'TRUE', 'Paragraph D: "The Chinese emperors strove to keep knowledge of sericulture secret".', 'D'),
              q(24, 'India produces more silk than China.', 'FALSE', 'Paragraph H: "India is the second largest producer of silk in the world after China."', 'H'),
              q(25, 'Silk clothing recovered from a shipwreck was still in perfect condition, although its lining had gone.', 'TRUE', 'Paragraph K: "of which the silk was perfect, but the lining entirely gone".', 'K'),
              q(26, 'Most of the silk produced in Karnataka is exported to other countries.', 'NOT GIVEN', 'Paragraph H describes silk production in Karnataka but says nothing about exports.', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'tsunami', title: 'Tsunamis', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o11-r3-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 3 has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(27, 'an account of a child who helped to save lives', 'J', 'Paragraph J: Tilly Smith "told her family that a tsunami might be imminent. Her parents warned others minutes before the wave arrived, saving dozens of lives."', 'J'),
              q(28, 'the reason for a Japanese name for these waves', 'G', 'Paragraph G: "The reason for the Japanese name \'harbour wave\' is that sometimes a village\'s fishermen would sail out".', 'G'),
              q(29, 'the highest wave ever recorded', 'D', 'Paragraph D: "caused the highest wave ever recorded, which had a height of 524 metres".', 'D'),
              q(30, 'why scientists do not like the term "tidal wave"', 'B', 'Paragraph B: "the causes of tsunamis have nothing to do with those of tides".', 'B'),
              q(31, 'a comparison of the number of tsunamis in two neighbouring places', 'H', 'Paragraph H: "Japan has had more than a hundred tsunamis in recorded history, while the neighbouring island of Taiwan has registered only two".', 'H'),
              q(32, 'a situation in which the sea suddenly moves away from the shore', 'I', 'Paragraph I: "a drawback will occur as the shoreline recedes dramatically".', 'I'),
            ],
          },
          {
            id: 'o11-r3-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(33, 'The 2004 Indian Ocean tsunami left at least ______ people dead or missing.', ['230,000', '230000'], 'Paragraph A: "with at least 230,000 people killed or missing in 14 countries".', 'A'),
              q(34, 'Thucydides was the first to argue that ocean ______ must cause tsunamis.', 'earthquakes', 'Paragraph C: he "was the first to argue that ocean earthquakes must be the cause".', 'C'),
              q(35, 'The wave caused by the landslide into the Vajont reservoir killed around ______ people.', ['2,000', '2000'], 'Paragraph E: "Around 2,000 people died."', 'E'),
              q(36, 'In the deep ocean, a tsunami can travel at well over ______ kilometres per hour.', '800', 'Paragraph F: "Such a wave travels at well over 800 kilometres per hour".', 'F'),
            ],
          },
          {
            id: 'o11-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(37, 'At first, a tsunami may look like a tide that is rising very quickly.', 'TRUE', 'Paragraph A: "a tsunami may instead initially resemble a rapidly rising tide".', 'A'),
              q(38, 'Ships in the deep ocean can easily feel a tsunami passing beneath them.', 'FALSE', 'Paragraph F: tsunamis are "difficult to detect over deep water, where ships are unable to feel their passage".', 'F'),
              q(39, 'Tsunamis can happen in lakes as well as oceans.', 'TRUE', 'Paragraph H: "they are possible wherever there are large bodies of water, including lakes".', 'H'),
              q(40, 'Tilly Smith later became a geography teacher herself.', 'NOT GIVEN', 'Paragraph J credits her geography teacher but says nothing about her later career.', 'J'),
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
        order: 1, key: 'boston-common-america-s-first-public-park',
        contextText: 'You will hear a report about the oldest public park in the United States.',
        questionGroups: [
          {
            id: 'o11-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Boston Common</strong></p><ul><li>each household paid a tax of about ${{q1}} in today\'s money</li><li>Bostonians did not have {{q2}} behind their homes</li><li>each household had the right to keep one {{q3}} there</li><li>these animals were banned in {{q4}}</li><li>the park covers {{q5}} hectares</li><li>it has about {{q6}} million visitors a year</li><li>it began as a park in {{q7}}</li></ul>',
            questions: [
              q(1, null, '70', '"about $70 in today\'s money".'),
              q(2, null, 'backyards', '"Bostonians did not have backyards".'),
              q(3, null, 'cow', '"everyone had the right to keep one cow per household".'),
              q(4, null, '1830', '"The cows became outlawed in 1830".'),
              q(5, null, '20', '"the 20-hectare park".'),
              q(6, null, ['7', 'seven'], '"Boston Common sees 7 million visitors each year".'),
              q(7, null, '1634', '"ever since it began as a park in 1634".'),
            ],
          },
          {
            id: 'o11-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(8, 'What does the sculpture "The Embrace" show?', 'B', '"a sculpture that shows civil rights leader Martin Luther King, Jr. holding his wife, Coretta Scott King".', opts('George Washington and John Adams', 'Martin Luther King, Jr. holding his wife', 'a Native American family')),
              mc(9, 'What did the Brewer Fountain win?', 'C', '"It won the top award at the 1855 World\'s Fair in Paris, France."', opts('a prize for the oldest fountain in America', 'a competition in Boston', 'the top award at a World\'s Fair in Paris')),
              mc(10, 'By when does the team hope to recognise the Massachusett tribe in the park?', 'A', '"They hope to have something in place by 2026, when America will celebrate its 250th birthday."', opts('by 2026', 'by 2030', 'by 2050')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'nasa-details-plans-for-railway-system-on-the-moon',
        contextText: 'You will hear a science report about plans for transport on the moon.',
        questionGroups: [
          {
            id: 'o11-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>A railway on the moon</strong></p><ul><li>part of NASA\'s {{q11}} program</li><li>target date for landing astronauts: September {{q12}}</li><li>FLOAT stands for Flexible {{q13}} on a Track</li><li>lunar soil, called {{q14}}, may contain water and oxygen</li><li>being developed at NASA\'s Jet Propulsion {{q15}}</li><li>the small version can carry loads of up to {{q16}} kilograms</li></ul>',
            questions: [
              q(11, null, 'Artemis', '"The railway would be part of NASA\'s Artemis program."'),
              q(12, null, '2026', '"a target landing date of September 2026".'),
              q(13, null, 'Levitation', '"The lunar rail proposal is called the Flexible Levitation on a Track, or FLOAT."'),
              q(14, null, 'regolith', '"such soil, called regolith".'),
              q(15, null, 'Laboratory', '"engineers at NASA\'s Jet Propulsion Laboratory (JPL) in California".'),
              q(16, null, '30', '"to transport loads up to 30 kilograms".'),
            ],
          },
          {
            id: 'o11-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(17, 'What is special about the FLOAT robots?', 'C', '"The robots have no moving parts and are unpowered. They are pushed along the track by electromagnetic energy."', opts('They are driven by astronauts.', 'They run on solar power.', 'They have no moving parts and no power of their own.')),
              mc(18, 'What is an advantage of the FLOAT tracks?', 'A', '"The system\'s tracks can be placed directly on the lunar surface, avoiding the need to build a complex, permanent structure."', opts('They can be placed directly on the surface and moved.', 'They are built deep underground.', 'They can carry astronauts at high speed.')),
              mc(19, 'How much money did each project receive?', 'B', '"up to $600,000 to continue working over the next two years".', opts('up to $100,000', 'up to $600,000', 'up to $1 million')),
              mc(20, 'What else could a future moon base be used for?', 'C', '"It could also serve as a possible launch site for future exploration of Mars."', opts('a hotel for tourists', 'a factory for spacecraft', 'a launch site for exploring Mars')),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'things-to-do-before-you-study',
        contextText: 'You will hear an education programme about things to do before you study.',
        questionGroups: [
          {
            id: 'o11-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(21, 'What did the 2018 study find about young people who exercised before studying?', 'B', '"a group of young people who did 15 minutes of high-intensity training on a treadmill remembered more words".', opts('They felt less tired.', 'They remembered more words.', 'They studied for longer.')),
              mc(22, 'What have researchers suggested about different kinds of exercise?', 'A', '"Researchers have suggested combining the two to get the best effects for your memory."', opts('combining slow exercise and high-intensity exercise', 'doing only high-intensity exercise', 'exercising only after studying')),
              mc(23, 'In the study by Smith, Glenberg and Bjork, people who learned in two different contexts', 'C', '"subjects who learned in two different contexts remembered an average of 24.4 words".', opts('remembered fewer words.', 'remembered the same number of words.', 'remembered more words.')),
              mc(24, 'What does the speaker suggest about where to study?', 'A', '"You might want to try studying in different places."', opts('Try studying in different places.', 'Always study at the same desk.', 'Study only in a library.')),
              mc(25, 'What happened to the students who took a test before learning new material?', 'B', '"The students failed on the tests, but they were better able to remember the material".', opts('They passed the tests easily.', 'They failed the tests but remembered the material better.', 'They stopped studying.')),
            ],
          },
          {
            id: 'o11-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<ul><li>three ideas: exercise, study {{q26}}, and pre-study tests</li><li>the 2018 exercise study appeared in the journal <em>Physiology and {{q27}}</em></li><li>people who learned from one list remembered an average of {{q28}} words</li><li>the pre-study test research was published in the <em>Journal of Experimental {{q29}}</em></li><li>before reading a textbook, try the practice questions at the end of the {{q30}}</li></ul>',
            questions: [
              q(26, null, 'location', '"Three important ideas to think about before studying include exercise, study location and pre-study tests."'),
              q(27, null, ['Behavior', 'Behaviour'], '"published in the journal Physiology and Behavior".'),
              q(28, null, '15.9', '"subjects who learned from a list remembered an average of 15.9 words".'),
              q(29, null, 'Psychology', '"The research was published in the Journal of Experimental Psychology."'),
              q(30, null, 'chapter', '"you might want to look to the end of the chapter and do a few practice questions".'),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'improve-your-reading-through-context-clues',
        contextText: 'You will hear an education programme about understanding new words when reading.',
        questionGroups: [
          {
            id: 'o11-l4-notes', type: 'note_completion', wordLimit: W1W,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>Context clues</strong></p><ul><li>a context clue is information near an unknown word that makes its meaning {{q31}}</li><li>clue 1: {{q32}} — words with a similar meaning</li><li>clue 2: antonyms — look for {{q33}} words such as "but" and "however"</li><li>clue 3: {{q34}} — usually have a comma before and after them</li><li>clue 4: {{q35}} — often introduced by "for example" or "such as"</li></ul>',
            questions: [
              q(31, null, 'clearer', '"makes its meaning clearer".'),
              q(32, null, 'synonyms', '"The first kind is synonyms."'),
              q(33, null, 'contrast', '"look for contrast words, such as \'but,\' \'however\'".'),
              q(34, null, 'appositives', '"Appositives usually have a comma before and after them."'),
              q(35, null, 'examples', '"The fourth kind of clue is examples."'),
            ],
          },
          {
            id: 'o11-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'What is the problem with stopping to look up every new word?', 'A', '"pausing to look up every word can slow down your reading".', opts('It slows down your reading.', 'Dictionaries are often wrong.', 'You forget the words quickly.')),
              mc(37, 'From the example, what is a "fundraiser"?', 'C', '"a ticketed social event that raises money for a cause".', opts('a person who sells tickets', 'a type of Japanese music', 'a social event that raises money')),
              mc(38, 'What does the speaker guess a "critic" is?', 'B', '"we might guess that a critic is a person who disapproves of something".', opts('a government official', 'a person who disapproves of something', 'a person who travels abroad')),
              mc(39, 'What are "constellations"?', 'A', '"Constellations, or groups of stars that form shapes in the sky".', opts('groups of stars that form shapes', 'stories about gods', 'lights in a city at night')),
              mc(40, 'What is a "superbug"?', 'B', '"an infection that is not easily treated with antibiotics anymore".', opts('a very large insect', 'an infection that antibiotics cannot easily treat', 'a new type of medicine')),
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
      promptHtml: `<p>The chart below shows life expectancy at birth in six countries in 1950 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'bar', title: 'Life expectancy at birth (years)', unit: 'years',
        categories: ['United Kingdom', 'Brazil', 'Kazakhstan', 'Uzbekistan', 'Egypt', 'Nigeria'], xAxisLabel: 'Country', yAxisLabel: 'Years',
        series: [
          { name: '1950', data: [68.6, 48.5, 55.6, 53.3, 34.0, 35.5] },
          { name: '2023', data: [81.3, 75.8, 74.4, 72.4, 71.6, 54.5] },
        ],
      },
      source: { kind: 'owid', dataset: 'life-expectancy', url: 'https://ourworldindata.org/grapher/life-expectancy', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people believe that cities should spend more money on cycle lanes and bicycle parking instead of building new roads for cars.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
