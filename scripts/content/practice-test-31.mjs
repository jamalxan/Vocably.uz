// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION } from './_html.mjs';

const BALLOON_DIAGRAM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="420" fill="#f7f9fb"/>
  <text x="190" y="24" font-weight="bold" fill="#333">Student weather balloon</text>
  <ellipse cx="300" cy="110" rx="90" ry="80" fill="#ffffff" stroke="#90a4ae" stroke-width="3"/>
  <path d="M300 190 L300 230" stroke="#555" stroke-width="2"/>
  <path d="M250 230 Q300 200 350 230 Z" fill="#ef5350" stroke="#b71c1c"/>
  <path d="M255 232 L295 290 M345 232 L305 290" stroke="#555"/>
  <path d="M300 230 L300 290" stroke="#555" stroke-width="2"/>
  <rect x="260" y="290" width="80" height="60" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
  <circle cx="300" cy="320" r="10" fill="#263238"/>
  <rect x="345" y="300" width="18" height="30" fill="#ffca28" stroke="#f57f17"/>
  <path d="M340 290 L370 260" stroke="#37474f" stroke-width="3"/>
</svg>`);

export default {
  slug: 'vocably-practice-test-31',
  title: 'Vocably Practice Test 31',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The journey of paper',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>Before paper, people wrote on almost anything they could find: clay tablets in Mesopotamia, papyrus made from reeds in Egypt, strips of bamboo and pieces of silk in China, and animal skins in Europe. Each had its drawbacks. Clay was heavy, bamboo was bulky, silk was expensive, and papyrus grew only in a few places and became brittle in damp climates. The invention of paper, a thin sheet made from plant fibres that have been broken down in water and then pressed and dried, provided a material that was light, cheap and could be produced almost anywhere.</p>" },
          { label: '', html: "<p>According to Chinese tradition, paper was invented in the year 105 by an official at the imperial court named Cai Lun, who presented the emperor with sheets made from the bark of mulberry trees, hemp, old rags and fishing nets. Archaeologists have since found fragments of paper that are older than this, so it seems that Cai Lun improved and standardised an existing process rather than inventing it from nothing. His role in promoting paper was nevertheless important, and he was honoured for it during his lifetime.</p>" },
          { label: '', html: "<p>For several centuries, the Chinese kept the technique largely to themselves, although it spread gradually to Korea, Vietnam and Japan. Paper was used not only for writing but also for wrapping, clothing, windows and even armour made from many layers glued together. The Chinese also invented paper money, and by the eleventh century the government was printing banknotes in large quantities. Chinese inventors also developed printing, first by carving whole pages into blocks of wood and later using individual characters that could be rearranged, so that by the time paper reached Europe, China had been producing printed books for centuries. The earliest surviving printed book with a date, a Buddhist text, was produced in the ninth century on a long roll of paper.</p>" },
          { label: '', html: "<p>The knowledge of papermaking reached the Islamic world in the eighth century. A popular story claims that Chinese papermakers were taken prisoner after a battle in Central Asia in 751 and forced to reveal their secrets in the city of Samarkand, but historians now think that the technique had probably spread along trade routes before then. Whatever the truth, paper mills were soon established in Baghdad and other cities, and the availability of cheap paper contributed to a remarkable growth in scholarship, as books on science, medicine and philosophy were copied and circulated widely.</p>" },
          { label: '', html: "<p>Paper reached Europe through Spain and Italy in the eleventh and twelfth centuries. At first it was treated with suspicion; some authorities considered it less durable than the animal skins traditionally used for important documents, and in some places it was forbidden for official records. Italian papermakers, particularly in the town of Fabriano, introduced important improvements, including water-powered hammers to beat the fibres, and the watermark, a faint design pressed into the paper during manufacture that identified the maker.</p>" },
          { label: '', html: "<p>The invention of the printing press in Europe in the fifteenth century greatly increased the demand for paper, and for the next four centuries, the main raw material was rags of linen and cotton. As demand grew, rags became scarce, and some countries banned their export. Rag collectors went from door to door buying old clothing, and in some countries people were even required to bury the dead in wool rather than linen so that linen could be saved for paper. Papermakers experimented with many alternatives, including straw, but the solution was wood. The idea had been suggested more than a century earlier by a French scientist who had observed wasps chewing wood to build their paper-like nests. In the 1840s, a German weaver developed a method of grinding wood into pulp, and later chemical processes made it possible to produce strong paper cheaply from trees.</p>" },
          { label: '', html: "<p>At the same time, the process itself was mechanised. A machine patented in the early nineteenth century produced paper in a continuous roll rather than in individual sheets, and by the end of the century, paper was so cheap that newspapers, books and packaging could be produced on an enormous scale. Today, despite the growth of digital communication, the world uses more paper than ever, although an increasing share is used for packaging rather than printing, and much of it is now made from recycled material. In several countries, more than two thirds of all paper and cardboard is collected and recycled, making it one of the most widely recycled materials in the world.</p>" },
        ],
        questionGroups: [
          {
            id: 't31-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'Papyrus could be produced in many different regions.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: papyrus "grew only in a few places".' },
              { number: 2, promptHtml: 'Paper has been found that is older than the date traditionally given for its invention.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: "fragments of paper that are older than this".' },
              { number: 3, promptHtml: 'Cai Lun became wealthy as a result of his work on paper.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 2 says he was honoured, but not that he became wealthy.' },
              { number: 4, promptHtml: 'Historians accept the story about papermakers captured in 751.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: "historians now think that the technique had probably spread along trade routes before then".' },
              { number: 5, promptHtml: 'Some European authorities did not allow paper to be used for official documents.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 5: "in some places it was forbidden for official records".' },
              { number: 6, promptHtml: 'Today, most paper is used for printing books and newspapers.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Final paragraph says an increasing share is used for packaging, but not what most paper is used for.' },
            ],
          },
          {
            id: 't31-r1-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-O, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'armour' },
              { key: 'B', text: 'money' },
              { key: 'C', text: 'watermark' },
              { key: 'D', text: 'hammers' },
              { key: 'E', text: 'rags' },
              { key: 'F', text: 'straw' },
              { key: 'G', text: 'wood' },
              { key: 'H', text: 'roll' },
              { key: 'I', text: 'scholarship' },
              { key: 'J', text: 'silk' },
              { key: 'K', text: 'trade' },
              { key: 'L', text: 'sheets' },
              { key: 'M', text: 'war' },
              { key: 'N', text: 'glue' },
              { key: 'O', text: 'ink' },
            ],
            stemHtml:
              '<p><strong>How paper spread</strong></p><p>In China, paper was even used to make {{q7}}, and the government printed paper {{q8}}. In the Islamic world, cheap paper encouraged the growth of {{q9}}. In Italy, papermakers used water-powered {{q10}} and introduced the {{q11}} to identify the maker. For centuries, European paper was made from {{q12}}, but eventually {{q13}} became the main raw material.</p>',
            questions: [
              { number: 7, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: "even armour made from many layers glued together".' },
              { number: 8, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "The Chinese also invented paper money".' },
              { number: 9, answer: { accepted: ['I'] }, explanationHtml: 'Paragraph 4: "contributed to a remarkable growth in scholarship".' },
              { number: 10, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 5: "water-powered hammers to beat the fibres".' },
              { number: 11, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: "the watermark ... that identified the maker".' },
              { number: 12, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 6: "the main raw material was rags of linen and cotton".' },
              { number: 13, answer: { accepted: ['G'] }, explanationHtml: 'Paragraph 6: "the solution was wood".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The story of tea',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>After water, tea is the most widely drunk beverage in the world. All true tea comes from a single plant, an evergreen shrub native to the region where China, India and Myanmar meet. According to a Chinese legend, tea was discovered almost five thousand years ago when leaves from a nearby bush blew into a pot of water being boiled for an emperor. The story cannot be proved, but tea was certainly being drunk in China more than two thousand years ago, at first mainly as a medicine. Early writers recommended it for tiredness, headaches and poor eyesight, and it was often mixed with other ingredients such as ginger, onion or salt, producing a drink that would taste very strange to modern tea drinkers.</p>" },
          { label: 'B', html: "<p>Tea became a popular drink in China under the Tang dynasty, in the seventh to tenth centuries. In this period a scholar named Lu Yu wrote the first book devoted entirely to tea, describing how to grow the plant, prepare the leaves and serve the drink, and even which kinds of water and cups were best. Tea was then usually pressed into hard cakes, which were ground into powder and whisked with hot water. The book helped to turn tea drinking into an art, associated with scholarship and refined taste.</p>" },
          { label: 'C', html: "<p>Buddhist monks who had studied in China brought tea to Japan, where it was valued for helping them stay awake during long periods of meditation. Over the following centuries, the Japanese developed an elaborate tea ceremony, in which every movement of the host and guests follows strict rules, and which is still practised today as an expression of calm, respect and appreciation of simple beauty.</p>" },
          { label: 'D', html: "<p>Tea arrived in Europe in the early seventeenth century, brought by Dutch traders. It was initially very expensive and was sold in pharmacies as a medicine. In England it became fashionable after the marriage of King Charles II to a Portuguese princess in 1662, who was already accustomed to drinking tea and made it popular at court. Coffee houses began to serve it, and gradually it spread from the aristocracy to the rest of society. The custom of adding milk became common in Britain, and some historians suggest it began partly to protect delicate china cups, which could crack when very hot tea was poured into them. By the end of the eighteenth century, tea had become a daily drink for ordinary working people, and the British were consuming enormous quantities.</p>" },
          { label: 'E', html: "<p>For much of the eighteenth century, the British government imposed extremely high taxes on tea, which encouraged widespread smuggling. At one point, it is estimated, more tea entered Britain illegally than legally, and some smugglers mixed it with other leaves, or even sheep dung, to increase their profits. In 1784, the government cut the tax dramatically, which made legal tea affordable and almost eliminated the smuggling trade overnight.</p>" },
          { label: 'F', html: "<p>Until the nineteenth century, almost all the tea drunk in Britain came from China, and the British were anxious to find another source. In the 1840s, a Scottish botanist was sent to China, disguised in local clothing, to collect tea plants and seeds and to learn the secrets of processing. He succeeded in sending thousands of plants to India, where, together with a variety of the plant that grew wild in the north-east of the country, they formed the basis of vast new plantations. Within a few decades, India had overtaken China as Britain's main supplier.</p>" },
          { label: 'G', html: "<p>Although there are thousands of varieties of tea, the main types differ mainly in how the leaves are processed after picking. For green tea, the leaves are heated soon after they are picked, by steaming or pan-frying, which stops them from reacting with the air and keeps their colour and fresh, grassy flavour. For black tea, the leaves are rolled and left exposed to the air until they turn dark brown, a process known as oxidation, which produces a stronger flavour; black tea also keeps its flavour longer, which made it better suited to long sea voyages. Oolong tea is partly oxidised, and so falls between the two; it is particularly associated with the south-east coast of China and with Taiwan, and the leaves are often rolled into small balls.</p>" },
        ],
        questionGroups: [
          {
            id: 't31-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has seven sections, A-G. Choose the correct headings for sections A-F from the list of headings below.<br/><em>Example: Section G — viii</em>',
            bank: [
              { key: 'i', text: 'A royal marriage and a new fashion' },
              { key: 'ii', text: 'A secret mission to find new supplies' },
              { key: 'iii', text: 'The first written guide' },
              { key: 'iv', text: 'Early origins and medical use' },
              { key: 'v', text: 'A drink for meditation and ceremony' },
              { key: 'vi', text: 'How high taxes encouraged crime' },
              { key: 'vii', text: 'The health benefits of green tea' },
              { key: 'ix', text: 'The growth of tea shops' },
            ],
            questions: [
              { number: 14, promptHtml: 'Section A', answer: { accepted: ['iv'] }, explanationHtml: 'Section A: the legend, and tea drunk "at first mainly as a medicine".', locatorParagraph: 'A' },
              { number: 15, promptHtml: 'Section B', answer: { accepted: ['iii'] }, explanationHtml: 'Section B: "the first book devoted entirely to tea".', locatorParagraph: 'B' },
              { number: 16, promptHtml: 'Section C', answer: { accepted: ['v'] }, explanationHtml: 'Section C: monks used tea for meditation; the Japanese tea ceremony.', locatorParagraph: 'C' },
              { number: 17, promptHtml: 'Section D', answer: { accepted: ['i'] }, explanationHtml: 'Section D: tea became fashionable after the king\'s marriage.', locatorParagraph: 'D' },
              { number: 18, promptHtml: 'Section E', answer: { accepted: ['vi'] }, explanationHtml: 'Section E: high taxes "encouraged widespread smuggling".', locatorParagraph: 'E' },
              { number: 19, promptHtml: 'Section F', answer: { accepted: ['ii'] }, explanationHtml: 'Section F: a botanist "disguised in local clothing" collected plants.', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't31-r2-mc1',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 20, promptHtml: 'How was tea prepared under the Tang dynasty?', options: [{ key: 'A', text: 'Whole leaves were boiled in milk.' }, { key: 'B', text: 'Powder from pressed cakes was whisked with water.' }, { key: 'C', text: 'Leaves were rolled into balls.' }, { key: 'D', text: 'It was mixed with fruit juice.' }], answer: { accepted: ['B'] }, explanationHtml: 'Section B: "pressed into hard cakes, which were ground into powder and whisked with hot water".' },
              { number: 21, promptHtml: 'What was the effect of the tax cut in 1784?', options: [{ key: 'A', text: 'Tea became more expensive.' }, { key: 'B', text: 'Smuggling almost stopped.' }, { key: 'C', text: 'Coffee became more popular.' }, { key: 'D', text: 'Imports from China fell.' }], answer: { accepted: ['B'] }, explanationHtml: 'Section E: it "almost eliminated the smuggling trade overnight".' },
            ],
          },
          {
            id: 't31-r2-classify',
            type: 'matching_features',
            instructionHtml: 'Classify the following statements as referring to<br/><strong>A</strong> green tea<br/><strong>B</strong> oolong tea<br/><strong>C</strong> black tea',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'green tea' },
              { key: 'B', text: 'oolong tea' },
              { key: 'C', text: 'black tea' },
            ],
            questions: [
              { number: 22, promptHtml: 'It keeps its flavour for a long time.', answer: { accepted: ['C'] }, explanationHtml: 'Section G: "black tea also keeps its flavour longer".', locatorParagraph: 'G' },
              { number: 23, promptHtml: 'It is heated soon after picking.', answer: { accepted: ['A'] }, explanationHtml: 'Section G: "For green tea, the leaves are heated soon after they are picked".', locatorParagraph: 'G' },
              { number: 24, promptHtml: 'It is partly oxidised.', answer: { accepted: ['B'] }, explanationHtml: 'Section G: "Oolong tea is partly oxidised".', locatorParagraph: 'G' },
              { number: 25, promptHtml: 'It has a grassy flavour.', answer: { accepted: ['A'] }, explanationHtml: 'Section G: green tea keeps its "fresh, grassy flavour".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't31-r2-mc2',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 26, promptHtml: 'What does the passage say about the tea plants sent to India?', options: [{ key: 'A', text: 'They all died on the journey.' }, { key: 'B', text: 'They were combined with a local variety.' }, { key: 'C', text: 'They produced only green tea.' }, { key: 'D', text: 'They were grown only in the south.' }], answer: { accepted: ['B'] }, explanationHtml: 'Section F: "together with a variety of the plant that grew wild in the north-east of the country, they formed the basis of vast new plantations".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Reviving the Games',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>The ancient Olympic Games were held at Olympia in Greece every four years for more than a thousand years, until they were abolished at the end of the fourth century. For almost fifteen centuries afterwards, the idea of the Olympics survived mainly in books. Several attempts were made to revive them in the nineteenth century, including local festivals in England and a series of national games in Greece, but none achieved international importance. Interest in the ancient Games was nevertheless growing, partly because archaeologists had begun excavating the site at Olympia in the 1870s, uncovering the stadium, temples and training grounds where athletes had competed more than two thousand years earlier. The discoveries were widely reported in newspapers across Europe and captured the imagination of the public.</p>" },
          { label: '', html: "<p>The man who finally succeeded was a French aristocrat, Pierre de Coubertin. Coubertin was not himself a notable athlete. His main interest was education: he believed that French schools placed too much emphasis on academic study and too little on physical activity, and he had been impressed by the role of sport in English private schools, which he had visited. He also believed that international sporting competition could promote understanding between nations and help to preserve peace.</p>" },
          { label: '', html: "<p>In 1894, Coubertin organised a congress in Paris, attended by representatives from a dozen countries. It was agreed that modern Olympic Games would be held every four years, that they would move from country to country, and that the first would be held in Athens in 1896, in honour of the ancient tradition. An International Olympic Committee was established to oversee them. The congress also decided that the Games would be open only to amateur athletes, a rule that would cause controversy for most of the following century.</p>" },
          { label: '', html: "<p>The first modern Games, in 1896, were modest by today's standards: around 250 athletes, all men, from fourteen countries took part. The most popular event was the marathon, a race invented for the occasion, which was based on a legend about a messenger who ran from the battlefield of Marathon to Athens. To the delight of the crowds, it was won by a Greek water-carrier named Spyridon Louis. Greek athletes had performed poorly in other events, and his victory made him a national hero overnight. Many of the other competitors were students or tourists who happened to be in Athens at the time, and some entered events on the day of the competition, which shows how informal the early Games were.</p>" },
          { label: '', html: "<p>The next two Games came close to disaster. In 1900, in Paris, the events were held as part of the World's Fair and spread over five months, and many competitors did not realise they were taking part in the Olympics at all. These Games were notable, however, as the first in which women competed. The 1904 Games in the United States were similarly overshadowed by a fair, and few athletes from Europe made the long journey.</p>" },
          { label: '', html: "<p>The Games gradually became more organised. In London in 1908, a stadium was built specially for the Games, and the length of the marathon was set at just over forty-two kilometres, reportedly so that the race could start at Windsor Castle and finish in front of the royal box. This distance was later adopted as the official standard. The Stockholm Games of 1912 introduced electronic timing and a photograph to decide close finishes. In 1920, in Antwerp, the Olympic flag, with its five interlocking rings representing the continents, was flown for the first time, and athletes took an oath promising to compete fairly.</p>" },
          { label: '', html: "<p>Coubertin served as president of the International Olympic Committee until 1925, and the Paris Games of 1924, the last under his leadership, were the most successful yet, with more than three thousand athletes from forty-four nations and the first Olympic village to house them. When he died in 1937, he was buried in Switzerland, but at his request, his heart was placed in a monument at Olympia. His belief that sport could bring nations together was sorely tested during the twentieth century, but the Games he revived have become the largest regular international gathering in the world. Today, more than two hundred nations send athletes to the Summer Games, and billions of people follow them on television and online, a scale that the delegates at the Paris congress of 1894 could hardly have imagined.</p>" },
        ],
        questionGroups: [
          {
            id: 't31-r3-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 27, promptHtml: 'Earlier attempts to revive the Olympics took place in England and Greece.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "local festivals in England and a series of national games in Greece".' },
              { number: 28, promptHtml: 'Coubertin was a successful athlete in his youth.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "Coubertin was not himself a notable athlete."' },
              { number: 29, promptHtml: 'Coubertin thought French schools should give more attention to physical activity.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: schools "placed ... too little on physical activity".' },
              { number: 30, promptHtml: 'The amateur rule was accepted by everyone throughout the twentieth century.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: it "would cause controversy for most of the following century".' },
              { number: 31, promptHtml: 'Spyridon Louis had trained as a professional runner.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 4 says he was a water-carrier, but nothing about his training.' },
              { number: 32, promptHtml: 'Some competitors in 1900 were unaware that they were in the Olympic Games.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 5: "many competitors did not realise they were taking part in the Olympics at all".' },
              { number: 33, promptHtml: 'Coubertin was buried at Olympia.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Final paragraph: "he was buried in Switzerland", although his heart was placed at Olympia.' },
            ],
          },
          {
            id: 't31-r3-games',
            type: 'matching_features',
            instructionHtml: 'Which Games does each of the following statements refer to? Choose the correct letter, <strong>A-F</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Athens 1896' },
              { key: 'B', text: 'Paris 1900' },
              { key: 'C', text: 'London 1908' },
              { key: 'D', text: 'Stockholm 1912' },
              { key: 'E', text: 'Antwerp 1920' },
              { key: 'F', text: 'Paris 1924' },
            ],
            questions: [
              { number: 34, promptHtml: 'Photographs were used to decide the winner of close races.', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 6: Stockholm 1912 introduced "a photograph to decide close finishes".' },
              { number: 35, promptHtml: 'Athletes lived together in a special village.', answer: { accepted: ['F'] }, explanationHtml: 'Final paragraph: Paris 1924 had "the first Olympic village".' },
              { number: 36, promptHtml: 'Women took part for the first time.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: Paris 1900 was "the first in which women competed".' },
              { number: 37, promptHtml: 'A symbol of the continents was displayed for the first time.', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 6: Antwerp 1920, the flag with "five interlocking rings representing the continents".' },
              { number: 38, promptHtml: 'A race was created specially for the event.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: the marathon, "a race invented for the occasion".' },
              { number: 39, promptHtml: 'A standard distance for a race was established.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 6: in London 1908, the marathon length was set, and "later adopted as the official standard".' },
            ],
          },
          {
            id: 't31-r3-title',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 40,
                promptHtml: 'What is the best title for Reading Passage 3?',
                options: [
                  { key: 'A', text: 'The ancient Olympic Games' },
                  { key: 'B', text: 'How the modern Olympics began and developed' },
                  { key: 'C', text: 'The history of the marathon' },
                  { key: 'D', text: 'Sport in French schools' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'The passage describes Coubertin\'s revival of the Games and their early development.',
              },
            ],
          },
        ],
      },
    ],
  },

  listening: {
    durationSec: 1800,
    checkTimeSec: 120,
    parts: [
      {
        order: 1,
        contextText: 'You will hear a woman phoning an animal rescue centre about volunteering.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Hello, Greenacres Animal Rescue, Mike speaking." },
          { speaker: 'B', voice: 'zira', text: "Hi. I'd like to volunteer at the centre. I saw on your website that you need help." },
          { speaker: 'A', voice: 'david', text: "We certainly do. Can I ask a bit about you first? Are you working or studying at the moment?" },
          { speaker: 'B', voice: 'zira', text: "I'm studying veterinary nursing at the college." },
          { speaker: 'A', voice: 'david', text: "That's useful. Which year are you in?" },
          { speaker: 'B', voice: 'zira', text: "The second year, out of three." },
          { speaker: 'A', voice: 'david', text: "OK. We have a few roles at the moment. There's dog walking, which happens in the fields behind the centre. The only problem is that we need people early, at seven in the morning." },
          { speaker: 'B', voice: 'zira', text: "That might be difficult. I have lectures some mornings." },
          { speaker: 'A', voice: 'david', text: "Then there's helping in the cattery, looking after the cats. That's in the main building, but that role is only at weekends." },
          { speaker: 'B', voice: 'zira', text: "Weekends are hard too, I work in a shop on Saturdays." },
          { speaker: 'A', voice: 'david', text: "And the third is working in our charity shop in the town centre, which raises money for the centre. That's weekday afternoons." },
          { speaker: 'B', voice: 'zira', text: "Actually, that would be fine. Could I do that?" },
          { speaker: 'A', voice: 'david', text: "Of course. Let me take some details. What's your name?" },
          { speaker: 'B', voice: 'zira', text: "Ellie Marchant. M-A-R-C-H-A-N-T." },
          { speaker: 'A', voice: 'david', text: "And your address?" },
          { speaker: 'B', voice: 'zira', text: "Flat 4, 19 Castle Road." },
          { speaker: 'A', voice: 'david', text: "Thanks. Do you have any other skills that might be useful?" },
          { speaker: 'B', voice: 'zira', text: "I'm quite good with social media. I run the online accounts for a local sports club." },
          { speaker: 'A', voice: 'david', text: "That would be very helpful. We'd love some help with publicity. Now, we ask all volunteers to come in for a short interview. Could you come in on Wednesday?" },
          { speaker: 'B', voice: 'zira', text: "Yes. What time?" },
          { speaker: 'A', voice: 'david', text: "Half past four, if that suits you." },
          { speaker: 'B', voice: 'zira', text: "That's fine." },
        ],
        questionGroups: [
          {
            id: 't31-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml: '<p><em>Example:</em> Role wanted: volunteer</p><p>Caller is studying {{q1}}<br/>She is in the {{q2}} year of the course</p>',
            questions: [
              { number: 1, answer: { accepted: ['veterinary nursing'] }, explanationHtml: '"I\'m studying veterinary nursing".' },
              { number: 2, answer: { accepted: ['second', '2nd'] }, explanationHtml: '"The second year, out of three."' },
            ],
          },
          {
            id: 't31-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Role', 'Where', 'Problem'],
              [
                ['Dog walking', 'in the {{q3}}', 'too early'],
                ['{{q4}}', 'in the main building', 'weekends only'],
                ['Charity shop', 'in the {{q5}}', 'none'],
              ]
            ),
            questions: [
              { number: 3, answer: { accepted: ['fields'] }, explanationHtml: '"in the fields behind the centre".' },
              { number: 4, answer: { accepted: ['cattery', 'the cattery'] }, explanationHtml: '"helping in the cattery".' },
              { number: 5, answer: { accepted: ['town centre'] }, explanationHtml: '"our charity shop in the town centre".' },
            ],
          },
          {
            id: 't31-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Volunteer details</strong></p><p>Name: Ellie {{q6}}<br/>Address: Flat 4, {{q7}}<br/>Other skills: good with {{q8}}<br/>Could help with: {{q9}}<br/>Interview: Wednesday at {{q10}}</p>',
            questions: [
              { number: 6, answer: { accepted: ['marchant'] }, explanationHtml: 'Spelled "M-A-R-C-H-A-N-T".' },
              { number: 7, answer: { accepted: ['19 castle road'] }, explanationHtml: '"Flat 4, 19 Castle Road."' },
              { number: 8, answer: { accepted: ['social media'] }, explanationHtml: '"I\'m quite good with social media."' },
              { number: 9, answer: { accepted: ['publicity'] }, explanationHtml: '"We\'d love some help with publicity."' },
              { number: 10, answer: { accepted: ['4.30', '4:30', 'half past four', '16.30'] }, explanationHtml: '"Half past four".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a talk about a new community orchard.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good evening, everyone. I'm Margaret, and I chair the committee of the Brookside Community Orchard. Thank you for coming to find out about the project." },
          { speaker: 'A', voice: 'zira', text: "The orchard is on land that used to be a school playing field. When the school moved, the land was going to be sold for housing, but local residents persuaded the council to let the community use it instead." },
          { speaker: 'A', voice: 'zira', text: "We planted the first trees three years ago, and there are now just over a hundred and twenty. Most of them are apple trees, but we also have pears, plums and cherries." },
          { speaker: 'A', voice: 'zira', text: "We deliberately chose old local varieties of apple, many of which are no longer grown commercially, so the orchard is also helping to preserve them." },
          { speaker: 'A', voice: 'zira', text: "The orchard is open to everyone, and anyone can pick fruit for their own use. We just ask people not to take more than they need, and not to sell it." },
          { speaker: 'A', voice: 'zira', text: "The biggest challenge so far has been deer, which ate the bark of many young trees in our first winter. We've now put guards around the trunks." },
          { speaker: 'A', voice: 'zira', text: "The project is funded mainly by membership fees, which are ten pounds a year, and by selling juice made from surplus fruit." },
          { speaker: 'A', voice: 'zira', text: "Now let me tell you about the year's events. In January, we hold a traditional ceremony called wassailing, where we sing to the trees to encourage a good harvest. It's great fun, especially for children." },
          { speaker: 'A', voice: 'zira', text: "In March, there's a workshop on pruning, where an expert shows how to cut back trees." },
          { speaker: 'A', voice: 'zira', text: "In May, we have a picnic among the blossom." },
          { speaker: 'A', voice: 'zira', text: "And in October, there's our apple day, when we press apples to make juice. That's our biggest event of the year." },
          { speaker: 'A', voice: 'zira', text: "Finally, we're always looking for new members to help with planting, weeding and harvesting." },
        ],
        questionGroups: [
          {
            id: 't31-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'What was the land used for before?', options: [{ key: 'A', text: 'housing' }, { key: 'B', text: 'a school playing field' }, { key: 'C', text: 'a farm' }], answer: { accepted: ['B'] }, explanationHtml: '"land that used to be a school playing field".' },
              { number: 12, promptHtml: 'How many trees are there now?', options: [{ key: 'A', text: 'about 100' }, { key: 'B', text: 'about 120' }, { key: 'C', text: 'about 300' }], answer: { accepted: ['B'] }, explanationHtml: '"there are now just over a hundred and twenty".' },
              { number: 13, promptHtml: 'Why were old varieties of apple chosen?', options: [{ key: 'A', text: 'to help preserve them' }, { key: 'B', text: 'because they grow faster' }, { key: 'C', text: 'because they are cheaper' }], answer: { accepted: ['A'] }, explanationHtml: '"the orchard is also helping to preserve them".' },
              { number: 14, promptHtml: 'Visitors who pick fruit are asked not to', options: [{ key: 'A', text: 'pick unripe fruit.' }, { key: 'B', text: 'sell it.' }, { key: 'C', text: 'visit at weekends.' }], answer: { accepted: ['B'] }, explanationHtml: '"not to take more than they need, and not to sell it".' },
              { number: 15, promptHtml: 'What has been the biggest problem?', options: [{ key: 'A', text: 'deer' }, { key: 'B', text: 'dry weather' }, { key: 'C', text: 'theft' }], answer: { accepted: ['A'] }, explanationHtml: '"The biggest challenge so far has been deer".' },
              { number: 16, promptHtml: 'The project is mainly funded by', options: [{ key: 'A', text: 'the council.' }, { key: 'B', text: 'membership fees and juice sales.' }, { key: 'C', text: 'a local business.' }], answer: { accepted: ['B'] }, explanationHtml: '"funded mainly by membership fees ... and by selling juice".' },
            ],
          },
          {
            id: 't31-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['Month', 'Event'],
              [
                ['January', 'wassailing: people {{q17}} to the trees'],
                ['March', 'workshop on {{q18}}'],
                ['May', 'a {{q19}} among the blossom'],
                ['October', 'apple day: apples pressed to make {{q20}}'],
              ]
            ),
            questions: [
              { number: 17, answer: { accepted: ['sing'] }, explanationHtml: '"we sing to the trees".' },
              { number: 18, answer: { accepted: ['pruning'] }, explanationHtml: '"a workshop on pruning".' },
              { number: 19, answer: { accepted: ['picnic'] }, explanationHtml: '"we have a picnic among the blossom".' },
              { number: 20, answer: { accepted: ['juice'] }, explanationHtml: '"we press apples to make juice".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two physics students, Anna and Chris, discussing their weather balloon project with their tutor.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Anna and Chris, how's the weather balloon project going?" },
          { speaker: 'B', voice: 'zira', text: "Really well. We're planning to launch it in about six weeks. It should reach a height of around thirty kilometres." },
          { speaker: 'C', voice: 'david2', text: "And we've got permission from the aviation authority, which took a long time. We needed to show that it wouldn't be a danger to aircraft." },
          { speaker: 'A', voice: 'david', text: "Good. Remind me how it works." },
          { speaker: 'B', voice: 'zira', text: "Well, the balloon itself is filled with helium. As it rises, the air pressure falls and the balloon expands, until eventually it bursts. Then a parachute opens, and the equipment floats back down." },
          { speaker: 'A', voice: 'david', text: "And what's in the box?" },
          { speaker: 'C', voice: 'david2', text: "The box is made of polystyrene, which is light and protects the instruments from the cold. Inside there's a camera, which takes a photo every ten seconds, and sensors to measure temperature and pressure. And on the side, there's a GPS tracker, so we can find it after it lands." },
          { speaker: 'A', voice: 'david', text: "Where do you expect it to land?" },
          { speaker: 'B', voice: 'zira', text: "It depends on the wind, but probably about a hundred kilometres east of here." },
          { speaker: 'A', voice: 'david', text: "OK. And have you planned the next stages?" },
          { speaker: 'C', voice: 'david2', text: "Yes. This week, we're going to test the batteries in the freezer, to make sure they work at low temperatures." },
          { speaker: 'B', voice: 'zira', text: "And next month, we'll do a practice run with the tracking software, using a car instead of the balloon." },
          { speaker: 'A', voice: 'david', text: "What about writing up the results?" },
          { speaker: 'C', voice: 'david2', text: "That'll be after the launch, obviously. And we also want to give a talk to local schools after the launch, with the photos." },
          { speaker: 'A', voice: 'david', text: "And the insurance?" },
          { speaker: 'B', voice: 'zira', text: "The department's arranging that this week." },
          { speaker: 'A', voice: 'david', text: "And buying the helium?" },
          { speaker: 'C', voice: 'david2', text: "We'll order that next month, because it needs to be delivered close to the launch date." },
        ],
        questionGroups: [
          {
            id: 't31-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: '<p><strong>Weather balloon project</strong></p><p>• expected height: about {{q21}} km<br/>• permission obtained from the {{q22}} authority</p>',
            questions: [
              { number: 21, answer: { accepted: ['30', 'thirty'] }, explanationHtml: '"a height of around thirty kilometres".' },
              { number: 22, answer: { accepted: ['aviation'] }, explanationHtml: '"permission from the aviation authority".' },
            ],
          },
          {
            id: 't31-l3-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            imageUrl: BALLOON_DIAGRAM,
            imageAlt: 'Diagram of a weather balloon: a large white balloon at the top, below it a red canopy, then a box containing a round lens, with a small yellow device on the side and a short aerial.',
            imageHotspots: [
              { questionNumber: 23, x: 36, y: 53 },
              { questionNumber: 24, x: 50, y: 83 },
              { questionNumber: 25, x: 64, y: 81 },
            ],
            questions: [
              { number: 23, answer: { accepted: ['parachute'] }, explanationHtml: '"Then a parachute opens".' },
              { number: 24, answer: { accepted: ['camera'] }, explanationHtml: '"Inside there\'s a camera".' },
              { number: 25, answer: { accepted: ['gps', 'tracker'] }, explanationHtml: '"on the side, there\'s a GPS tracker".' },
            ],
          },
          {
            id: 't31-l3-when',
            type: 'matching_features',
            instructionHtml: 'When will each of the following tasks be done? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'this week' },
              { key: 'B', text: 'next month' },
              { key: 'C', text: 'after the launch' },
            ],
            questions: [
              { number: 26, promptHtml: 'testing the batteries', answer: { accepted: ['A'] }, explanationHtml: '"This week, we\'re going to test the batteries".' },
              { number: 27, promptHtml: 'a practice run with tracking software', answer: { accepted: ['B'] }, explanationHtml: '"next month, we\'ll do a practice run".' },
              { number: 28, promptHtml: 'giving a talk to schools', answer: { accepted: ['C'] }, explanationHtml: '"give a talk to local schools after the launch".' },
              { number: 29, promptHtml: 'arranging insurance', answer: { accepted: ['A'] }, explanationHtml: '"The department\'s arranging that this week."' },
              { number: 30, promptHtml: 'ordering helium', answer: { accepted: ['B'] }, explanationHtml: '"We\'ll order that next month".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the history of chess.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Today I'm going to talk about the history of chess, a game that has been played for around fifteen hundred years and is still enjoyed by millions of people around the world." },
          { speaker: 'A', voice: 'zira', text: "Most historians believe that chess originated in India, around the sixth century. The early game represented the four divisions of an Indian army: foot soldiers, horsemen, elephants and chariots, which became the modern pawns, knights, bishops and rooks." },
          { speaker: 'A', voice: 'zira', text: "From India, the game spread to Persia, where it acquired many of the terms still used today. The word 'checkmate', for instance, comes from a Persian phrase meaning 'the king is helpless'. When the Arabs conquered Persia in the seventh century, they took up the game enthusiastically, and Arab players wrote the first books analysing chess strategy." },
          { speaker: 'A', voice: 'zira', text: "Chess reached Europe through Spain and Italy around the tenth century, and it became popular among the nobility. It was considered an essential skill for a knight, alongside riding and swimming." },
          { speaker: 'A', voice: 'zira', text: "In the early game, the pieces were much weaker than today. The piece that became the queen could only move one square diagonally, so games were slow. Then, in the late fifteenth century, probably in Spain, the queen was given the ability to move any distance in any direction, making her the most powerful piece on the board. The new rules made the game much faster and more exciting, and they spread rapidly across Europe." },
          { speaker: 'A', voice: 'zira', text: "In the nineteenth century, chess became more organised. Chess clubs were founded in many cities, and international tournaments began. Players started using clocks to limit the time for each move, and the first official world championship match was held in 1886." },
          { speaker: 'A', voice: 'zira', text: "In the twentieth century, chess became closely linked with politics, as players from the Soviet Union dominated the game and matches against Western players were treated as contests between rival systems." },
          { speaker: 'A', voice: 'zira', text: "Finally, computers. For decades, researchers used chess as a test of artificial intelligence, and in 1997 a computer defeated the world champion in a match for the first time. Today, even a phone can beat the best human players, but interestingly, chess is more popular than ever, partly because people can now play online against opponents anywhere in the world." },
        ],
        questionGroups: [
          {
            id: 't31-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'The early pieces in chess represented', options: [{ key: 'A', text: 'members of a royal court.' }, { key: 'B', text: 'parts of an army.' }, { key: 'C', text: 'animals.' }], answer: { accepted: ['B'] }, explanationHtml: '"The early game represented the four divisions of an Indian army".' },
              { number: 32, promptHtml: 'What did Arab players contribute to chess?', options: [{ key: 'A', text: 'new pieces' }, { key: 'B', text: 'the first books on strategy' }, { key: 'C', text: 'the word \'checkmate\'' }], answer: { accepted: ['B'] }, explanationHtml: '"Arab players wrote the first books analysing chess strategy". Checkmate comes from Persian.' },
              { number: 33, promptHtml: 'In medieval Europe, chess was considered', options: [{ key: 'A', text: 'a game for children.' }, { key: 'B', text: 'an important skill for knights.' }, { key: 'C', text: 'a dangerous activity.' }], answer: { accepted: ['B'] }, explanationHtml: '"It was considered an essential skill for a knight".' },
              { number: 34, promptHtml: 'What was the effect of the new rules for the queen?', options: [{ key: 'A', text: 'Games became faster.' }, { key: 'B', text: 'Games became longer.' }, { key: 'C', text: 'The game became less popular.' }], answer: { accepted: ['A'] }, explanationHtml: '"The new rules made the game much faster and more exciting".' },
            ],
          },
          {
            id: 't31-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Chess</strong></p>' +
              '<p>• \'checkmate\' comes from a {{q35}} phrase<br/>• in Europe, the game was popular among the {{q36}}<br/>• in the 19th century, players began to use {{q37}} to limit time<br/>• in the 20th century, chess was linked with {{q38}}<br/>• researchers used chess to test artificial {{q39}}<br/>• today, many people play {{q40}}</p>',
            questions: [
              { number: 35, answer: { accepted: ['persian'] }, explanationHtml: '"The word \'checkmate\' ... comes from a Persian phrase".' },
              { number: 36, answer: { accepted: ['nobility'] }, explanationHtml: '"it became popular among the nobility".' },
              { number: 37, answer: { accepted: ['clocks'] }, explanationHtml: '"Players started using clocks to limit the time".' },
              { number: 38, answer: { accepted: ['politics'] }, explanationHtml: '"chess became closely linked with politics".' },
              { number: 39, answer: { accepted: ['intelligence'] }, explanationHtml: '"as a test of artificial intelligence".' },
              { number: 40, answer: { accepted: ['online'] }, explanationHtml: '"people can now play online".' },
            ],
          },
        ],
      },
    ],
  },

  writing: {
    durationSec: 3600,
    task1: {
      order: 1,
      minWords: 150,
      recommendedMin: 20,
      promptHtml:
        '<p>The chart below shows the percentage change in the number of tourists visiting five cities in two periods, compared with 2010.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Change in tourist numbers compared with 2010 (%)',
        unit: '%',
        categories: ['City A', 'City B', 'City C', 'City D', 'City E'],
        xAxisLabel: 'City',
        yAxisLabel: 'Percentage change',
        series: [
          { name: '2011-2015 average', data: [6, -3, 12, 2, -5] },
          { name: '2016-2020 average', data: [14, 4, -2, 9, 18] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>More and more people are moving from rural areas to live in cities.</p><p>Why is this happening? Is it a positive or negative development?</p>',
    },
  },
};
