// Vocably Open Test 7 — matn/audio ochiq manbalardan (_lib.mjs sarlavhasiga qarang),
// savollar va javob kalitlari Vocably uchun yozilgan.
import { q, TFNG_INSTRUCTION, OWID_NOTE, wikiPassage, voaPart } from './_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const opts = (...texts) => texts.map((text, i) => ({ key: 'ABCD'[i], text }));
const mc = (n, prompt, answer, expl, options, loc) => ({ ...q(n, prompt, answer, expl, loc), options });

export default {
  slug: 'vocably-open-test-7',
  title: "Coffee, Bird Migration, Library of Alexandria",
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      wikiPassage({
        order: 1, slug: 'coffee', title: 'How Coffee Spread Around the World', from: 1, to: 13,
        questionGroups: [
          {
            id: 'o7-r1-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'Reading Passage 1 has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'the possible original meaning of the Arabic word from which "coffee" comes', 'B', 'Paragraph B: "The word qahwah most likely meant \'the dark one\'".', 'B'),
              q(2, 'the amount of water needed to grow the coffee for one cup', 'I', 'Paragraph I: "it takes about 140 liters (37 U.S. gal) of water to grow the coffee beans needed to produce one cup of coffee".', 'I'),
              q(3, 'a religious leader\'s decision that helped coffee become accepted', 'D', 'Paragraph D: "Coffee became more widely accepted in Europe after Pope Clement VIII declared it a Christian beverage in 1600".', 'D'),
              q(4, 'a link between working conditions and a revolution', 'F', 'Paragraph F: "The conditions that the enslaved people worked in on coffee plantations were a factor in the Haitian Revolution".', 'F'),
              q(5, 'early medical writing that may describe something other than coffee', 'C', 'Paragraph C: "According to later accounts, bunchum was made from a root rather than from coffee beans."', 'C'),
            ],
          },
          {
            id: 'o7-r1-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Until the end of the 17th century, most of the world\'s coffee came from Yemen.', 'TRUE', 'Paragraph A: "Up to the end of the 17th century, most of the world\'s coffee was imported from Yemen."', 'A'),
              q(7, 'There is clear evidence that people drank coffee before the 15th century.', 'FALSE', 'Paragraph C: "There is no confirmed evidence, either historical or archaeological, of coffee as a drink being consumed before the 15th century."', 'C'),
              q(8, 'The first coffeehouse in Venice opened earlier than the first one in Istanbul.', 'FALSE', 'Paragraph D: Istanbul\'s "first coffeehouse opened in 1555"; the Venice coffeehouse "opened in Venice in 1647".', 'D'),
              q(9, 'Gabriel de Clieu became wealthy as a result of the coffee plant he took to Martinique.', 'NOT GIVEN', 'Paragraph F describes the plant and its descendants but nothing about de Clieu\'s wealth.', 'F'),
            ],
          },
          {
            id: 'o7-r1-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The first exports of coffee from Java to the Netherlands took place in ______.', '1711', 'Paragraph E: "The first exports of Indonesian coffee from Java to the Netherlands occurred in 1711."', 'E'),
              q(11, 'Coffee growing in Brazil only gathered momentum after ______ in 1822.', 'independence', 'Paragraph G: "its cultivation did not gather momentum until independence in 1822".', 'G'),
              q(12, 'Brazil had become the world\'s largest coffee producer by ______.', '1852', 'Paragraph G: "to being the largest producer in the world by 1852".', 'G'),
              q(13, 'In 2020, Brazil produced ______ of the world\'s green coffee beans.', ['39%', '39 percent'], 'Paragraph H: "led by Brazil with 39% of the total".', 'H'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 2, slug: 'bird-migration', title: 'Bird Migration', from: 14, to: 26,
        questionGroups: [
          {
            id: 'o7-r2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(14, 'What mainly controls the timing of migration?', 'C', 'Paragraph C: "The timing of migration seems to be controlled primarily by changes in day length."', opts('changes in temperature', 'the amount of food available', 'changes in day length', 'the direction of the wind'), 'C'),
              mc(15, 'Why was the stork found in Mecklenburg in 1822 important?', 'A', 'Paragraph D: it "provided some of the earliest evidence of long-distance stork migration".', opts('It was early evidence that storks travel long distances.', 'It was the first stork ever seen in Germany.', 'It showed that storks can survive serious injuries.', 'It proved that storks fly at night.'), 'D'),
              mc(16, 'Why do some hummingbirds choose not to migrate?', 'D', 'Paragraph E: "some hummingbirds choose not to migrate if fed through the winter".', opts('They are too small to fly long distances.', 'Their breeding season is very late.', 'They prefer cold weather.', 'They are fed during the winter.'), 'E'),
              mc(17, 'How does Eleonora\'s falcon take advantage of bird migration?', 'B', 'Paragraph F: it "has a very late breeding season, coordinated with the autumn passage of southbound passerine migrants, which it feeds to its young".', opts('It follows migrating birds to Africa.', 'It breeds late so that it can feed migrating birds to its young.', 'It steals the nests of migrating birds.', 'It flies in flocks with migrating birds.'), 'F'),
            ],
          },
          {
            id: 'o7-r2-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Some facts about migrating birds</strong></p><ul><li>red knots fly {{q18}} km/h faster in flocks than alone</li><li>bar-headed geese have been recorded flying at up to {{q19}} metres</li><li>most migration takes place between 150 and {{q20}} metres</li><li>great snipes fly non-stop for 60 to {{q21}} hours</li><li>bar-tailed godwits fly 11,000 km from Alaska to {{q22}}</li></ul>',
            questions: [
              q(18, null, '5', 'Paragraph G: they "fly 5 km/h (2.5 kn) faster in flocks than when they were flying alone".', 'G'),
              q(19, null, ['6,540', '6540'], 'Paragraph H: "flying at up to 6,540 m (21,460 ft)".', 'H'),
              q(20, null, '600', 'Paragraph H: "most bird migration is in the range of 150 to 600 m".', 'H'),
              q(21, null, '90', 'Paragraph J: "lasting 60–90 h".', 'J'),
              q(22, null, 'New Zealand', 'Paragraph K: "flying 11,000 km from Alaska to their New Zealand non-breeding areas".', 'K'),
            ],
          },
          {
            id: 'o7-r2-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(23, 'Manx shearwaters migrate 14,000 kilometres between their breeding grounds and the Southern Ocean.', 'TRUE', 'Paragraph B: "Manx shearwaters migrate 14,000 km (8,700 mi) between their northern breeding grounds and the Southern Ocean".', 'B'),
              q(24, 'Long migrations are more common than short ones.', 'FALSE', 'Paragraph B: "Shorter migrations are common, while longer ones are not."', 'B'),
              q(25, 'Before migrating, bar-tailed godwits store more than half of their body weight as fat.', 'TRUE', 'Paragraph K: "55 percent of their bodyweight is stored as fat".', 'K'),
              q(26, 'Birds that migrate at night do not lose any sleep.', 'FALSE', 'Paragraph L: "One cost of nocturnal migration is the loss of sleep."', 'L'),
            ],
          },
        ],
      }),
      wikiPassage({
        order: 3, slug: 'library-of-alexandria', title: 'The Library of Alexandria', from: 27, to: 40,
        questionGroups: [
          {
            id: 'o7-r3-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 27-32) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.<br/><strong>NB</strong> There is one extra person you will not need.',
            bank: [
              { key: 'A', text: 'Demetrius of Phalerum' }, { key: 'B', text: 'Ptolemy II Philadelphus' }, { key: 'C', text: 'Strabo' },
              { key: 'D', text: 'Zenodotus of Ephesus' }, { key: 'E', text: 'Seneca the Younger' }, { key: 'F', text: 'Theophilus of Alexandria' },
              { key: 'G', text: 'Amr ibn al-As' },
            ],
            questions: [
              q(27, 'may have first suggested the idea of a library in Alexandria', 'A', 'Paragraph A: "The idea of the library in Alexandria may have been proposed by Demetrius of Phalerum".', 'A'),
              q(28, 'described the salary and other benefits given to the scholars', 'C', 'Paragraph D: scholars "according to the first-century BC Greek geographer Strabo, were provided with a large salary, free food and lodging, and exemption from taxes".', 'D'),
              q(29, 'was the first person known to arrange words in alphabetical order', 'D', 'Paragraph E: "making him the first person known to have employed alphabetical order as a method of organization".', 'E'),
              q(30, 'issued an order that led to the destruction of a building', 'F', 'Paragraph B: the Serapeum "was vandalized and demolished in 391 AD under a decree issued by bishop Theophilus of Alexandria".', 'B'),
              q(31, 'quoted an earlier writer who said that 40,000 scrolls had been destroyed', 'E', 'Paragraph F: "Seneca the Younger quotes Livy\'s Ab Urbe Condita Libri ... as saying that the fire started by Caesar destroyed 40,000 scrolls".', 'F'),
              q(32, 'is said to have been very interested in animals', 'B', 'Paragraph D: "Ptolemy II Philadelphus is said to have had a keen interest in zoology".', 'D'),
            ],
          },
          {
            id: 'o7-r3-summary', type: 'summary_completion', wordLimit: W1W,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The Library and its scholars</strong></p><p>The Library was part of a research institution called the {{q33}}, which was dedicated to the nine goddesses of the arts. Its main purpose was to show off the {{q34}} of Egypt, and research was only a lesser goal. Ancient sources describe reading rooms, meeting rooms, gardens and lecture halls, which together created a model for the modern university {{q35}}. The scholars ate their meals together in a large circular hall with a high domed {{q36}}.</p>',
            questions: [
              q(33, null, 'Mouseion', 'Paragraph A: "a larger research institution called the Mouseion".', 'A'),
              q(34, null, 'wealth', 'Paragraph C: "Its main purpose was to show off the wealth of Egypt".', 'C'),
              q(35, null, 'campus', 'Paragraph C: "creating a model for the modern university campus".', 'C'),
              q(36, null, 'ceiling', 'Paragraph D: "a large, circular dining hall with a high domed ceiling".', 'D'),
            ],
          },
          {
            id: 'o7-r3-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(37, 'Historians know exactly how many scrolls the Library contained.', 'FALSE', 'Paragraph A: "It is unknown how many scrolls were housed at any given time".', 'A'),
              q(38, 'Zenodotus\'s alphabetical system used every letter of a word.', 'FALSE', 'Paragraph E: "Zenodotus\'s system of alphabetization, however, only used the first letter of the word".', 'E'),
              q(39, 'According to Florus and Lucan, the fire burned the fleet and some houses near the sea.', 'TRUE', 'Paragraph F: "Florus and Lucan only mention that the flames burned the fleet itself and some \'houses near the sea\'".', 'F'),
              q(40, 'Most of the books said to have been burned in the city baths were written in Greek.', 'NOT GIVEN', 'Paragraph G tells the story of the books heating the baths but says nothing about their language.', 'G'),
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
        order: 1, key: 'what-is-veterans-day-in-the-us',
        contextText: 'You will hear a report about the history of a national holiday in the United States.',
        questionGroups: [
          {
            id: 'o7-l1-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Veterans Day</strong></p><ul><li>the Treaty of Versailles was signed on June 28, {{q1}}</li><li>fighting had stopped {{q2}} months earlier</li><li>the day was first celebrated as {{q3}} Day</li><li>1938: November 11 became a legal {{q4}}</li><li>the name Veterans Day was introduced in {{q5}}</li><li>the Uniform Holiday Act was signed in {{q6}}</li></ul>',
            questions: [
              q(1, null, '1919', '"the Treaty of Versailles in France on June 28, 1919".'),
              q(2, null, ['seven', '7'], '"fighting had stopped seven months earlier with an armistice".'),
              q(3, null, 'Armistice', '"The celebration first started on November 11, 1919, as Armistice Day."'),
              q(4, null, 'holiday', '"to make the 11th of November in each year a legal holiday".'),
              q(5, null, '1954', '"Congress changed the law in 1954 to call it Veterans Day".'),
              q(6, null, '1968', '"The date for Veterans Day was changed in 1968 with the signing of the Uniform Holiday Act."'),
            ],
          },
          {
            id: 'o7-l1-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(7, 'Why did Congress move the holiday to a Monday?', 'B', '"Congress intended to create a three-day weekend for Americans".', opts('to avoid confusion with Memorial Day', 'to create a three-day weekend', 'because veterans\' groups asked for the change')),
              mc(8, 'When is Memorial Day observed?', 'C', '"Memorial Day ... which is observed on the last Monday in May".', opts('on November 11', 'on the first Monday in June', 'on the last Monday in May')),
              mc(9, 'Who is Veterans Day mainly intended to honour?', 'A', '"Veterans Day is largely intended to thank and honor all those who served honorably in the military, living or dead".', opts('everyone who served in the military, living or dead', 'only soldiers who died in war', 'only veterans of World War I')),
              mc(10, 'How long is the national moment of silence on Veterans Day?', 'B', '"to observe a two-minute national moment of silence on Veterans Day at 2:11 p.m.".', opts('one minute', 'two minutes', 'eleven minutes')),
            ],
          },
        ],
      }),
      voaPart({
        order: 2, key: 'museum-tells-stories-of-arab-americans',
        contextText: 'You will hear a report about a museum in the United States.',
        questionGroups: [
          {
            id: 'o7-l2-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Arab American National Museum</strong></p><ul><li>location: Dearborn, {{q11}}</li><li>Joseph Haggar founded his clothing company in {{q12}}</li><li>he created the word "{{q13}}" for relaxed trousers</li><li>these were worn by President Lyndon {{q14}}</li><li>one exhibit is about immigrants in North {{q15}}</li><li>another lists Arab American passengers on the {{q16}}</li></ul>',
            questions: [
              q(11, null, 'Michigan', '"A small museum in Dearborn, Michigan is trying to tell their stories."'),
              q(12, null, '1926', '"who founded Haggar\'s clothing company in 1926".'),
              q(13, null, 'slacks', '"Haggar came up with the word \'slacks\' to describe pants".'),
              q(14, null, 'Johnson', '"the 36th U.S. president, Lyndon Johnson".'),
              q(15, null, 'Dakota', '"immigrants in North Dakota between 1890 and World War I".'),
              q(16, null, 'Titanic', '"lists of Arab American passengers on the Titanic".'),
            ],
          },
          {
            id: 'o7-l2-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(17, 'According to Abouali, what proportion of the Arab American community is Christian?', 'B', '"Half of the Arab American community is Christian," Abouali said.', opts('about a quarter', 'about half', 'almost all')),
              mc(18, 'What was Helen Thomas known for?', 'C', '"known as the first woman to end a White House press conference by saying, \'Thank you, Mr. President.\'"', opts('She was the first Arab American in Congress.', 'She started a famous clothing company.', 'She was the first woman to end a White House press conference.')),
              mc(19, 'What did Candace Lightner do in 1980?', 'A', '"Candace Lightner, who founded Mothers Against Drunk Driving in 1980".', opts('She founded an organisation against drunk driving.', 'She became Secretary of Health.', 'She opened the museum in Dearborn.')),
              mc(20, 'How many countries do Arab Americans come from?', 'B', '"Although Arab Americans come from 22 countries".', opts('12', '22', '36')),
            ],
          },
        ],
      }),
      voaPart({
        order: 3, key: 'nasa-reconnects-with-voyager-longest-serving-mission-in-history',
        contextText: 'You will hear a science report about two very old spacecraft.',
        questionGroups: [
          {
            id: 'o7-l3-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Voyager mission</strong></p><ul><li>both spacecraft were launched in {{q21}}</li><li>NASA was out of touch with Voyager 1 for {{q22}} months</li><li>the problem was caused by a {{q23}} inside one of its computers</li><li>NASA had to listen on the S-band instead of the usual {{q24}}-band</li><li>the S-band had not been used since {{q25}}</li><li>Voyager 2 observed Uranus and Neptune in {{q26}}</li></ul>',
            questions: [
              q(21, null, '1977', '"launched within weeks of each other in 1977".'),
              q(22, null, ['five', '5'], '"it had remained out of touch with the spacecraft for the previous five months".'),
              q(23, null, 'chip', '"the problem was linked to a chip inside one of Voyager 1\'s onboard computers".'),
              q(24, null, 'X', '"NASA had to listen for the signals on the S-band instead of the usual X-band".'),
              q(25, null, '1981', '"NASA said the agency had not used the S-band since 1981."'),
              q(26, null, '1989', '"Voyager 2 made the first-ever close observations of Uranus and Neptune in 1989".'),
            ],
          },
          {
            id: 'o7-l3-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(27, 'How far from Earth is Voyager 1?', 'C', '"Voyager 1 is exploring space from about 24 billion kilometers from Earth".', opts('about 17.7 billion kilometres', 'about 20.5 billion kilometres', 'about 24 billion kilometres')),
              mc(28, 'How long does it take to receive data from the Voyagers?', 'A', '"its communication with the two Voyagers takes about one day to receive data".', opts('about one day', 'about one hour', 'about one week')),
              mc(29, 'When did NASA announce that Voyager 1 had entered interstellar space?', 'B', '"In 2013, NASA announced Voyager 1 had crossed over the border dividing our solar system from interstellar space."', opts('in 1989', 'in 2013', 'in 2018')),
              mc(30, 'According to Suzanne Dodd, why have the Voyagers lasted so long?', 'C', '"the engineers who built them provided multiple backup systems to avoid future problems".', opts('They use very little power.', 'They are repaired regularly.', 'Their builders gave them many backup systems.')),
            ],
          },
        ],
      }),
      voaPart({
        order: 4, key: 'use-a-language-corpus-to-improve-your-vocabulary',
        contextText: 'You will hear an education programme about using a language corpus to learn vocabulary.',
        questionGroups: [
          {
            id: 'o7-l4-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Corpus of Contemporary American English (COCA)</strong></p><ul><li>contains more than one {{q31}} words</li><li>covers texts from 1990 to {{q32}}</li><li>a free account allows {{q33}} searches in 24 hours</li><li>a paid account allows {{q34}} searches in 24 hours</li><li>the noun that most often follows "deep" is {{q35}}</li></ul>',
            questions: [
              q(31, null, 'billion', '"COCA contains more than one billion words from 1990-2019."'),
              q(32, null, '2019', '"COCA contains more than one billion words from 1990-2019."'),
              q(33, null, '20', '"A free account limits you to 20 searches for words within any 24-hour period."'),
              q(34, null, '200', '"A paid account will give you 200 searches within any 24-hour period."'),
              q(35, null, 'breath', '"the noun breath occurs the most after the adjective deep".'),
            ],
          },
          {
            id: 'o7-l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(36, 'What does the speaker say about describing water as "profound"?', 'B', '"So, you might think English speakers will say that a body of water is profound. But English speakers never say that."', opts('It is common in formal writing.', 'English speakers never say it.', 'It is only used in poetry.')),
              mc(37, 'Which words most commonly follow "profound"?', 'A', '"the most common words that follow profound are effect or ability".', opts('effect or ability', 'breath or water', 'thought or feeling')),
              mc(38, 'What is a collocation?', 'C', '"A collocation is a word or phrase that is often used with another word or phrase."', opts('a list of words in alphabetical order', 'a word with two different meanings', 'a word or phrase often used with another word or phrase')),
              mc(39, 'Why must you tell COCA to search only for adjectives when you look up "utter"?', 'A', '"Utter is both a verb and an adjective, so you must tell COCA to only search for adjectives."', opts('because "utter" is also a verb', 'because adjectives are more common', 'because free accounts only search adjectives')),
              mc(40, 'Where else can you find tutorials on using COCA?', 'B', '"You can also find tutorials on YouTube."', opts('in printed dictionaries', 'on YouTube', 'on the VOA website')),
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
      promptHtml: `<p>The chart below shows the number of international tourist arrivals in five countries in 2019, 2020 and 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${OWID_NOTE}</em></p>`,
      chart: {
        chartType: 'bar', title: 'International tourist arrivals (millions)', unit: 'millions',
        categories: ['United States', 'Germany', 'United Kingdom', 'India', 'Egypt'], xAxisLabel: 'Country', yAxisLabel: 'Arrivals (millions)',
        series: [
          { name: '2019', data: [79.4, 39.6, 39.4, 17.8, 12.9] },
          { name: '2020', data: [19.2, 12.4, 10.7, 2.7, 3.6] },
          { name: '2022', data: [50.8, 28.4, 30.7, 6.4, 11.6] },
        ],
      },
      source: { kind: 'owid', dataset: 'international-tourist-arrivals', url: 'https://ourworldindata.org/grapher/international-tourist-arrivals', licence: 'CC BY 4.0' },
    },
    task2: {
      order: 2, minWords: 250, recommendedMin: 40,
      promptHtml: '<p>Some people say that public libraries are no longer necessary because most information can now be found on the internet.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
