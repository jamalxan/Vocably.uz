// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION } from './_html.mjs';

const VISITOR_CENTRE_PLAN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f4f7ee"/>
  <text x="170" y="22" font-weight="bold" fill="#333">Marshfield Wetland Reserve — visitor centre</text>
  <rect x="40" y="40" width="520" height="300" fill="#fff" stroke="#333" stroke-width="3"/>
  <rect x="40" y="340" width="520" height="45" fill="#bcd9ee"/>
  <text x="250" y="368" fill="#2c5d80">Lake</text>
  <rect x="50" y="50" width="160" height="110" fill="#eceff1" stroke="#777"/>
  <rect x="220" y="50" width="160" height="110" fill="#e0c9a6" stroke="#777"/>
  <text x="275" y="110" fill="#5d4037">Café</text>
  <rect x="390" y="50" width="160" height="110" fill="#eceff1" stroke="#777"/>
  <rect x="50" y="200" width="160" height="130" fill="#eceff1" stroke="#777"/>
  <rect x="390" y="200" width="160" height="130" fill="#dfe6ef" stroke="#7a8ca3"/>
  <text x="435" y="270" fill="#333">Toilets</text>
  <rect x="270" y="30" width="60" height="14" fill="#fff" stroke="#333"/>
  <text x="258" y="200" fill="#999">Entrance hall</text>
  <text x="275" y="42" fill="#333" font-size="11">Door</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-34',
  title: 'Vocably Practice Test 34',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'From sand to bottle',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>Glass is one of the oldest materials made by humans, and for thousands of years glass containers were luxury objects. The technique of blowing glass, in which a worker gathers molten glass on the end of a long metal tube and blows into it to form a hollow shape, was developed in the eastern Mediterranean around two thousand years ago, and it remained the main method of making bottles until the beginning of the twentieth century. Skilled glassblowers worked in teams, and even the fastest team could produce only a few thousand bottles a day. The work was hot, exhausting and often dangerous, and much of it was done by boys, some as young as ten, who carried the hot bottles from one worker to another.</p>" },
          { label: '', html: "<p>The transformation of the industry began in the United States in 1903, when an engineer named Michael Owens, who had himself started work in a glass factory at the age of ten, patented a fully automatic bottle-making machine. His machine used a vacuum to suck molten glass into a mould and then blew it into shape with compressed air, without any human hands touching the glass. A single machine could produce several times as many bottles as a team of skilled workers, and each bottle was almost identical to the next. Within twenty years, hand-blown bottles had almost disappeared from mass production, and the use of child labour in the industry fell dramatically.</p>" },
          { label: '', html: "<p>The raw materials used today are much the same as they were in ancient times. The main ingredient is sand, which is almost pure silica. Soda ash is added to lower the temperature at which the sand melts, and limestone makes the finished glass more durable and resistant to water. In addition, most factories now add large quantities of broken recycled glass, known as cullet. Because cullet melts at a lower temperature than the raw ingredients, it reduces the amount of energy needed, and each tonne of cullet used saves more than a tonne of raw materials.</p>" },
          { label: '', html: "<p>The ingredients are weighed, mixed and fed into a furnace, where they are heated to around 1,500 degrees Celsius until they form a thick, glowing liquid. The molten glass flows out of the furnace and is cut by shears into pieces of exactly the right weight for one bottle. Each piece, called a gob, drops into a machine that shapes it in two stages. In the first mould, the gob is pressed or blown into a rough shape with the neck already formed, known as a parison. The parison is then turned upside down and transferred to a second mould, where compressed air blows it out into the final shape of the bottle.</p>" },
          { label: '', html: "<p>At this point the bottles are still very hot, and if they were allowed to cool quickly, stresses would develop within the glass and they would break easily. They therefore pass slowly through a long oven called a lehr, in which the temperature is carefully reduced over a period of about an hour. This process, known as annealing, removes the internal stresses and makes the glass much stronger. Some bottles are also given a thin coating on the outside, which reduces scratching when they rub against each other on production lines.</p>" },
          { label: '', html: "<p>Finally, every bottle is inspected. Modern factories use cameras and lasers to check each bottle for cracks, bubbles, uneven walls and other faults, rejecting any that do not meet the required standard. Rejected bottles are not wasted: they are crushed and returned to the furnace as cullet. A modern production line can make several hundred bottles a minute, working continuously day and night, since a glass furnace, once lit, is normally kept burning for many years without being switched off.</p>" },
          { label: '', html: "<p>Glass has important environmental advantages. It can be recycled again and again without any loss of quality, and it does not release chemicals into the food or drink it contains. On the other hand, it is heavy, which means that transporting glass bottles uses more fuel than transporting plastic ones, and producing new glass requires a great deal of energy. For this reason, some countries have introduced systems in which bottles are collected, washed and refilled many times, rather than being crushed and melted down. A strong refillable bottle can be used forty or fifty times before it needs to be replaced, which makes it one of the most environmentally friendly forms of packaging available.</p>" },
        ],
        questionGroups: [
          {
            id: 't34-r1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Stage', 'Details'],
              [
                ['Ingredients', 'sand; {{q1}} to lower the melting temperature; limestone for durability; recycled glass (cullet)'],
                ['Melting', 'furnace at about 1,500°C; molten glass cut by {{q2}}'],
                ['First mould', 'the gob is formed into a {{q3}}, with the neck already made'],
                ['Second mould', '{{q4}} blows the glass into its final shape'],
                ['Cooling', 'bottles pass through a {{q5}}; process called {{q6}}'],
                ['Coating', 'reduces {{q7}} on production lines'],
                ['Inspection', 'cameras and {{q8}} check for faults'],
              ]
            ),
            questions: [
              { number: 1, answer: { accepted: ['soda ash'] }, explanationHtml: 'Paragraph 3: "Soda ash is added to lower the temperature at which the sand melts".' },
              { number: 2, answer: { accepted: ['shears'] }, explanationHtml: 'Paragraph 4: "is cut by shears".' },
              { number: 3, answer: { accepted: ['parison', 'rough shape'] }, explanationHtml: 'Paragraph 4: "a rough shape with the neck already formed, known as a parison".' },
              { number: 4, answer: { accepted: ['compressed air'] }, explanationHtml: 'Paragraph 4: "compressed air blows it out into the final shape".' },
              { number: 5, answer: { accepted: ['lehr', 'long oven'] }, explanationHtml: 'Paragraph 5: "a long oven called a lehr".' },
              { number: 6, answer: { accepted: ['annealing'] }, explanationHtml: 'Paragraph 5: "This process, known as annealing".' },
              { number: 7, answer: { accepted: ['scratching'] }, explanationHtml: 'Paragraph 5: "a thin coating ... which reduces scratching".' },
              { number: 8, answer: { accepted: ['lasers'] }, explanationHtml: 'Paragraph 6: "use cameras and lasers to check each bottle".' },
            ],
          },
          {
            id: 't34-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 9, promptHtml: 'Children were employed in glass factories before automatic machines were introduced.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "much of it was done by boys, some as young as ten".' },
              { number: 10, promptHtml: 'Michael Owens had trained as a glassblower in Europe.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 2 says he started work in a glass factory at ten, but nothing about training in Europe.' },
              { number: 11, promptHtml: 'Using recycled glass increases the energy needed to make new glass.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: cullet "reduces the amount of energy needed".' },
              { number: 12, promptHtml: 'Glass furnaces are usually turned off every night.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 6: a furnace "is normally kept burning for many years without being switched off".' },
              { number: 13, promptHtml: 'Transporting glass bottles requires more fuel than transporting plastic bottles.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 7: "transporting glass bottles uses more fuel than transporting plastic ones".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The roads that linked the world',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>The term 'Silk Road' was invented in the nineteenth century by a German geographer to describe the trade routes that connected China with Central Asia, the Middle East and, eventually, Europe. The name is misleading in two ways. First, there was never a single road, but rather a shifting network of routes across deserts, mountains and seas. Second, silk was only one of many goods carried along them, and for much of the network's history, it was not the most important. Historians today often prefer to speak of the Silk Roads, in the plural.</p>" },
          { label: 'B', html: "<p>Few traders ever travelled the whole length of the routes. Instead, goods passed from one merchant to another, changing hands many times as they moved slowly across the continent, with their price rising at every stage. A bale of silk might leave China on the back of a camel, be sold in a Central Asian oasis town, and reach the Mediterranean months or years later, having been bought and sold by a dozen different people, none of whom had seen both ends of the journey. Along the way, the goods passed through a series of cities that grew rich on the trade, providing markets, warehouses and inns where caravans could rest. Many of these cities, built around oases at the edges of deserts, were home to communities of merchants from many different lands, who spoke several languages and followed different religions. The goods themselves were remarkably varied: horses, spices, precious stones, glass, metalwork, furs and slaves all travelled along the routes, in both directions.</p>" },
          { label: 'C', html: "<p>The first great period of the routes began in the second century BCE, when the Han dynasty of China sent an envoy westwards to seek allies against nomadic peoples who threatened its northern border. The envoy was captured and held prisoner for ten years, but when he finally returned, his reports of wealthy kingdoms to the west encouraged the emperor to expand Chinese control into Central Asia. Chinese silk soon reached Rome, where it became so fashionable that some Roman writers complained that it was draining the empire of gold.</p>" },
          { label: 'D', html: "<p>Ideas travelled along the routes as well as goods. Buddhism spread from India into Central Asia and China, carried by monks and merchants, and the caves and temples built along the routes, filled with paintings and sculptures, are among the most remarkable monuments of the ancient world. Later, Islam, Christianity and other religions also spread along the same paths. Technologies moved too: the knowledge of how to make paper travelled from China to the Islamic world in the eighth century, and from there, several centuries later, to Europe. Plants and animals were exchanged as well, including grapes, walnuts and new varieties of horse, which had lasting effects on farming in the regions that received them. Musical instruments, games such as chess, and styles of art also travelled along the routes, so that their influence can still be traced across a vast area today.</p>" },
          { label: 'E', html: "<p>The routes flourished again under the Tang dynasty, from the seventh to the tenth century, when the Chinese capital was one of the largest and most international cities in the world, home to merchants from Persia, Central Asia and beyond. Foreign music, food and fashions were popular among the wealthy, and Chinese pottery was exported in large quantities. After the collapse of the Tang, however, the overland routes became dangerous and trade declined.</p>" },
          { label: 'F', html: "<p>The final great period came in the thirteenth century, when the Mongols conquered an empire stretching from China to Eastern Europe. For about a hundred years, a single power controlled most of the overland routes, and travel became safer than it had ever been. Merchants, diplomats and missionaries journeyed across Asia in larger numbers than before. Yet the same connections that allowed trade to flourish also allowed disease to spread: the great plague of the fourteenth century is thought to have travelled westwards along these routes. After the Mongol empire broke up, and as European ships began to sail directly to Asia, the overland routes gradually lost their importance. Today, the phrase has been revived to describe modern projects to build railways, ports and pipelines linking China with other parts of Asia, Africa and Europe, a sign of how powerfully the image of the ancient routes still shapes the way people think about connections between East and West.</p>" },
        ],
        questionGroups: [
          {
            id: 't34-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has six paragraphs, A-F. Choose the correct heading for paragraphs B and D-F from the list of headings below.<br/><em>Example: Paragraph A — iii</em><br/><em>Example: Paragraph C — vii</em>',
            bank: [
              { key: 'i', text: 'A cosmopolitan period followed by decline' },
              { key: 'ii', text: 'The spread of beliefs and knowledge' },
              { key: 'iv', text: 'A single empire and its consequences' },
              { key: 'v', text: 'Why silk was so expensive to produce' },
              { key: 'vi', text: 'A chain of buyers and sellers' },
              { key: 'viii', text: 'The dangers faced by travellers' },
              { key: 'ix', text: 'The role of sea routes in ancient times' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph B', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph B: goods passed "from one merchant to another, changing hands many times".', locatorParagraph: 'B' },
              { number: 15, promptHtml: 'Paragraph D', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph D: "Ideas travelled along the routes as well as goods" — religions and papermaking.', locatorParagraph: 'D' },
              { number: 16, promptHtml: 'Paragraph E', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph E: an "international" capital under the Tang, then "trade declined".', locatorParagraph: 'E' },
              { number: 17, promptHtml: 'Paragraph F', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph F: "a single power controlled most of the overland routes", with both trade and plague as results.', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't34-r2-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-I, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'envoy' },
              { key: 'B', text: 'gold' },
              { key: 'C', text: 'paper' },
              { key: 'D', text: 'geographer' },
              { key: 'E', text: 'network' },
              { key: 'F', text: 'monks' },
              { key: 'G', text: 'soldiers' },
              { key: 'H', text: 'silver' },
              { key: 'I', text: 'glass' },
            ],
            stemHtml:
              '<p><strong>The Silk Roads</strong></p><p>The name \'Silk Road\' was created by a nineteenth-century {{q18}}, but the routes were really a changing {{q19}}. Under the Han dynasty, an {{q20}} travelled west and reported on the kingdoms he had seen. Silk became popular in Rome, and some writers feared it was causing a loss of {{q21}}. Buddhism was spread by {{q22}} and merchants.</p>',
            questions: [
              { number: 18, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph A: "invented in the nineteenth century by a German geographer".', locatorParagraph: 'A' },
              { number: 19, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph A: "a shifting network of routes".', locatorParagraph: 'A' },
              { number: 20, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: "the Han dynasty of China sent an envoy westwards".', locatorParagraph: 'C' },
              { number: 21, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C: "it was draining the empire of gold".', locatorParagraph: 'C' },
              { number: 22, answer: { accepted: ['F'] }, explanationHtml: 'Paragraph D: "carried by monks and merchants".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't34-r2-periods',
            type: 'matching_features',
            instructionHtml: 'Classify the following events as occurring during the period of the <strong>A</strong> Han dynasty, <strong>B</strong> Tang dynasty, or <strong>C</strong> Mongol empire.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'the Han dynasty' },
              { key: 'B', text: 'the Tang dynasty' },
              { key: 'C', text: 'the Mongol empire' },
            ],
            questions: [
              { number: 23, promptHtml: 'A serious disease spread along the trade routes.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph F: "the great plague of the fourteenth century is thought to have travelled westwards along these routes".', locatorParagraph: 'F' },
              { number: 24, promptHtml: 'Chinese pottery was sold abroad in large amounts.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph E: under the Tang, "Chinese pottery was exported in large quantities".', locatorParagraph: 'E' },
              { number: 25, promptHtml: 'A Chinese traveller was held captive for a decade.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: the Han envoy "was captured and held prisoner for ten years".', locatorParagraph: 'C' },
              { number: 26, promptHtml: 'Travelling across Asia became safer than before.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph F: "travel became safer than it had ever been".', locatorParagraph: 'F' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'How birds find their way',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Every year, billions of birds make journeys that would challenge the most experienced human navigator. A small songbird weighing less than twenty grams may fly thousands of kilometres from Europe to southern Africa, crossing seas and deserts, often at night and alone, and then return the following spring to the same garden where it nested the year before. Some seabirds cross entire oceans. For centuries, how they achieve this was a complete mystery; even today, although scientists have learned a great deal, many questions remain. Ancient writers believed that some birds spent the winter asleep at the bottom of ponds, or even that they flew to the Moon, and it was only when birds were fitted with numbered metal rings on their legs, from the end of the nineteenth century, that their routes began to be mapped. Today, tiny electronic tracking devices, some weighing less than a gram, allow individual birds to be followed across entire continents.</p>" },
          { label: 'B', html: "<p>The first step in understanding bird navigation was to distinguish between two different abilities. One is the ability to maintain a particular direction, which requires a compass of some kind. The other, much more demanding, is the ability to work out one's position relative to a goal, as if using a map. A bird that has only a compass can fly south, but if it is blown off course by a storm, it will not know how to correct its route. Experiments in which birds were moved hundreds of kilometres before being released showed that experienced adults could correct for the change, while young birds on their first migration usually could not, suggesting that the map sense is learned.</p>" },
          { label: 'C', html: "<p>Birds appear to have several compasses. Those that fly by day can use the position of the Sun, taking into account the time of day by means of their internal body clock. Birds that migrate at night can use the stars. In a famous series of experiments in the 1960s, an American researcher kept young birds in a planetarium, a building in which an artificial night sky is projected onto a ceiling. The birds learned to orient themselves using the stars that appeared to rotate around a fixed point, and when the researcher changed the position of that point, the birds changed their direction accordingly.</p>" },
          { label: 'D', html: "<p>The most intriguing compass is magnetic. Experiments have shown that birds kept in cages with artificial magnetic fields change the direction in which they try to fly when the field is altered. How they detect the Earth's magnetic field is still debated. One theory is that birds have tiny particles of a magnetic mineral in their beaks. Another, which has gained support in recent years, is that a special protein in the eye reacts to magnetic fields in a way that depends on light, so that birds may literally see the field as a pattern overlaid on their vision. It is possible that both mechanisms exist, one providing a sense of direction and the other information about position.</p>" },
          { label: 'E', html: "<p>Other senses may also play a part. Some seabirds, such as shearwaters, appear to use smell to find their way across the open ocean, and birds whose sense of smell has been temporarily blocked have been found to have difficulty returning home. It has also been suggested that birds can hear very low-frequency sounds, produced by waves or wind blowing over mountains, that travel over great distances and could act as signposts. Near the end of a journey, familiar landmarks such as coastlines, rivers and mountains become increasingly important.</p>" },
          { label: 'F', html: "<p>Understanding how birds navigate is not merely of academic interest. Artificial light in cities can confuse night-migrating birds, drawing them off course and into buildings, where many millions die each year. Electromagnetic noise from electrical equipment has been shown in some studies to disrupt birds' magnetic compass. Some cities now encourage owners of tall buildings to switch off unnecessary lights during the peak migration seasons, a simple measure that can save large numbers of birds. Climate change poses a different kind of challenge: if birds rely partly on inherited instructions about when and where to fly, they may not be able to adjust quickly enough when the timing of spring or the location of suitable habitats changes.</p>" },
        ],
        questionGroups: [
          {
            id: 't34-r3-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below.',
            bank: [
              { key: 'i', text: 'Using the night sky' },
              { key: 'ii', text: 'Protecting birds from human interference' },
              { key: 'iii', text: 'An impressive and puzzling ability' },
              { key: 'iv', text: 'A sense we cannot easily imagine' },
              { key: 'v', text: 'Two separate skills' },
              { key: 'vi', text: 'Additional sources of information' },
              { key: 'vii', text: 'Why some birds do not migrate' },
              { key: 'viii', text: 'Training birds to carry messages' },
            ],
            questions: [
              { number: 27, promptHtml: 'Paragraph A', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph A: remarkable journeys, and "how they achieve this was a complete mystery".', locatorParagraph: 'A' },
              { number: 28, promptHtml: 'Paragraph B', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph B: "to distinguish between two different abilities".', locatorParagraph: 'B' },
              { number: 29, promptHtml: 'Paragraph C', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph C: night migrants "can use the stars"; the planetarium experiments.', locatorParagraph: 'C' },
              { number: 30, promptHtml: 'Paragraph D', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph D: birds "may literally see the field as a pattern".', locatorParagraph: 'D' },
              { number: 31, promptHtml: 'Paragraph E', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph E: "Other senses may also play a part."', locatorParagraph: 'E' },
              { number: 32, promptHtml: 'Paragraph F', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph F: artificial light and electromagnetic noise, and switching off lights.', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't34-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 33, promptHtml: 'What did experiments with moved birds show?', options: [{ key: 'A', text: 'All birds could find their way back.' }, { key: 'B', text: 'Young birds were better at correcting their route.' }, { key: 'C', text: 'Experienced birds could adjust for the change.' }, { key: 'D', text: 'Birds did not need a compass.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph B: "experienced adults could correct for the change, while young birds ... usually could not".' },
              { number: 34, promptHtml: 'Birds that fly by day use the Sun together with', options: [{ key: 'A', text: 'their body clock.' }, { key: 'B', text: 'the stars.' }, { key: 'C', text: 'the shape of the coastline.' }, { key: 'D', text: 'the direction of the wind.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: "taking into account the time of day by means of their internal body clock".' },
              { number: 35, promptHtml: 'In the planetarium experiments, the birds', options: [{ key: 'A', text: 'ignored the artificial sky.' }, { key: 'B', text: 'used a fixed point in the sky to orient themselves.' }, { key: 'C', text: 'only flew when the real sky was visible.' }, { key: 'D', text: 'were unable to learn.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C: they used stars rotating "around a fixed point" and changed direction when it moved.' },
              { number: 36, promptHtml: 'What does the recent theory about magnetic sense suggest?', options: [{ key: 'A', text: 'Birds detect magnetic fields through their beaks.' }, { key: 'B', text: 'The magnetic sense only works at night.' }, { key: 'C', text: 'A protein in the eye is involved.' }, { key: 'D', text: 'Birds cannot detect magnetic fields.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: "a special protein in the eye reacts to magnetic fields".' },
            ],
          },
          {
            id: 't34-r3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 37, promptHtml: 'Shearwaters may use their sense of {{q37}} to navigate over the ocean.', answer: { accepted: ['smell'] }, explanationHtml: 'Paragraph E: "shearwaters, appear to use smell".', locatorParagraph: 'E' },
              { number: 38, promptHtml: 'Low-frequency sounds could act as {{q38}} for birds.', answer: { accepted: ['signposts'] }, explanationHtml: 'Paragraph E: sounds "could act as signposts".', locatorParagraph: 'E' },
              { number: 39, promptHtml: 'Artificial light can draw night-migrating birds into {{q39}}.', answer: { accepted: ['buildings'] }, explanationHtml: 'Paragraph F: "drawing them off course and into buildings".', locatorParagraph: 'F' },
              { number: 40, promptHtml: 'Some cities ask building owners to turn off {{q40}} during migration seasons.', answer: { accepted: ['lights'] }, explanationHtml: 'Paragraph F: "switch off unnecessary lights".', locatorParagraph: 'F' },
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
        contextText: 'You will hear a woman booking places for her children at a holiday adventure camp.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Hello, Pinewood Adventure Camp, bookings." },
          { speaker: 'B', voice: 'zira', text: "Hi, I'd like to book places for my two children on the day camp in August." },
          { speaker: 'A', voice: 'david', text: "Certainly. I'll start with your details. What's your name?" },
          { speaker: 'B', voice: 'zira', text: "Karen Whitfield." },
          { speaker: 'A', voice: 'david', text: "And your address?" },
          { speaker: 'B', voice: 'zira', text: "It's 14 Orchard Close, Bramley." },
          { speaker: 'A', voice: 'david', text: "And a phone number we can use in an emergency?" },
          { speaker: 'B', voice: 'zira', text: "My mobile is best. It's oh seven eight four five, two two nine, six one oh." },
          { speaker: 'A', voice: 'david', text: "Thanks. Now, the camp runs for five days, and there's a different main activity each day. Would you like me to go through them?" },
          { speaker: 'B', voice: 'zira', text: "Yes, please." },
          { speaker: 'A', voice: 'david', text: "On Monday it's climbing, on our indoor wall. The children just need to wear trainers; we provide harnesses and helmets." },
          { speaker: 'B', voice: 'zira', text: "OK." },
          { speaker: 'A', voice: 'david', text: "Tuesday is canoeing on the lake. For that, they'll need a complete change of clothes, because they're quite likely to fall in." },
          { speaker: 'B', voice: 'zira', text: "I'm sure they will! And Wednesday?" },
          { speaker: 'A', voice: 'david', text: "Wednesday is archery. That's in the field behind the main building, and they need to bring a hat, because there's no shade there." },
          { speaker: 'B', voice: 'zira', text: "And Thursday?" },
          { speaker: 'A', voice: 'david', text: "Thursday is a day in the forest, learning bushcraft, things like building shelters and cooking on a fire. They need long trousers for that, because of insects and nettles." },
          { speaker: 'B', voice: 'zira', text: "Good idea. And Friday?" },
          { speaker: 'A', voice: 'david', text: "On Friday the children put on a show for parents, in the barn, at three o'clock. Parents are very welcome." },
          { speaker: 'B', voice: 'zira', text: "Lovely. And what does it cost?" },
          { speaker: 'A', voice: 'david', text: "It's one hundred and forty-five pounds per child for the week, but there's a discount of fifteen pounds for the second child." },
          { speaker: 'B', voice: 'zira', text: "Do they need to bring lunch?" },
          { speaker: 'A', voice: 'david', text: "No, a hot lunch is included every day. Just let us know about any allergies." },
        ],
        questionGroups: [
          {
            id: 't34-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Pinewood Adventure Camp — Booking</strong></p><p>Parent: Karen {{q1}}<br/>Address: {{q2}}, Bramley<br/>Emergency phone: {{q3}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['whitfield'] }, explanationHtml: '"Karen Whitfield."' },
              { number: 2, answer: { accepted: ['14 orchard close'] }, explanationHtml: '"It\'s 14 Orchard Close, Bramley."' },
              { number: 3, answer: { accepted: ['07845229610', '07845 229610', '07845 229 610'] }, explanationHtml: '"oh seven eight four five, two two nine, six one oh".' },
            ],
          },
          {
            id: 't34-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Day', 'Activity', 'Children should bring / notes'],
              [
                ['Monday', '{{q4}}', 'trainers'],
                ['Tuesday', 'canoeing', 'a complete change of {{q5}}'],
                ['Wednesday', 'archery', 'a {{q6}}'],
                ['Thursday', '{{q7}}', 'long trousers'],
                ['Friday', 'show for parents', 'in the {{q8}} at 3 pm'],
              ]
            ) + '<p>Cost: £145 per child; £{{q9}} discount for the second child<br/>A hot {{q10}} is provided every day</p>',
            questions: [
              { number: 4, answer: { accepted: ['climbing'] }, explanationHtml: '"On Monday it\'s climbing".' },
              { number: 5, answer: { accepted: ['clothes'] }, explanationHtml: '"they\'ll need a complete change of clothes".' },
              { number: 6, answer: { accepted: ['hat'] }, explanationHtml: '"they need to bring a hat".' },
              { number: 7, answer: { accepted: ['bushcraft'] }, explanationHtml: '"a day in the forest, learning bushcraft".' },
              { number: 8, answer: { accepted: ['barn'] }, explanationHtml: '"in the barn, at three o\'clock".' },
              { number: 9, answer: { accepted: ['15', 'fifteen'] }, explanationHtml: '"a discount of fifteen pounds for the second child".' },
              { number: 10, answer: { accepted: ['lunch'] }, explanationHtml: '"a hot lunch is included every day".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a warden welcoming visitors to a wetland nature reserve.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, and welcome to Marshfield Wetland Reserve. I'm Anna, one of the wardens here." },
          { speaker: 'A', voice: 'zira', text: "The reserve was created about thirty years ago on land that had been used for digging gravel. When the digging stopped, the pits filled with water, and a local wildlife trust bought the site and turned it into the wetland you see today." },
          { speaker: 'A', voice: 'zira', text: "Before you go out, let me show you around the visitor centre. You can see the plan here. We're in the entrance hall, and the door you came through is at the top of the plan. The café is straight ahead as you come in, next to the door." },
          { speaker: 'A', voice: 'zira', text: "The room on the left of the café, in the top left-hand corner, is the gift shop, where you can buy bird food, books and binoculars." },
          { speaker: 'A', voice: 'zira', text: "Down at the bottom right, overlooking the lake, are the toilets. And next to them, at the bottom left, also looking out over the lake, is the viewing gallery. It has big windows and telescopes, so if the weather's bad, it's the best place to watch the birds." },
          { speaker: 'A', voice: 'zira', text: "The room in the top right-hand corner is the education room, where school groups have their lessons. It's also where we hold talks in the evenings." },
          { speaker: 'A', voice: 'zira', text: "Now, some advice before you set off. The main trail is about three kilometres long and takes around an hour and a half at a gentle pace. There are four hides along the way, small wooden huts where you can watch birds without disturbing them." },
          { speaker: 'A', voice: 'zira', text: "The best time to see most birds is early morning or late afternoon, when they're feeding. At this time of year, you've got a good chance of seeing kingfishers along the river, and the hide at the far end of the lake is the best place for those." },
          { speaker: 'A', voice: 'zira', text: "We ask all visitors to keep to the paths. Some areas are closed during the breeding season, and those are marked with signs. And please don't bring dogs onto the reserve, even on a lead; the only exception is assistance dogs." },
          { speaker: 'A', voice: 'zira', text: "Membership of the trust gives you free entry to all its reserves, and at the moment we're offering a free guidebook to anyone who joins today." },
          { speaker: 'A', voice: 'zira', text: "Finally, if you see anything unusual, please record it in the sightings book, which you'll find at the café counter. Our volunteers use the records to monitor bird numbers." },
        ],
        questionGroups: [
          {
            id: 't34-l2-mc1',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'What was the land used for before the reserve was created?', options: [{ key: 'A', text: 'farming' }, { key: 'B', text: 'digging gravel' }, { key: 'C', text: 'a rubbish dump' }], answer: { accepted: ['B'] }, explanationHtml: '"on land that had been used for digging gravel".' },
            ],
          },
          {
            id: 't34-l2-plan',
            type: 'diagram_label',
            instructionHtml: 'Label the plan below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: VISITOR_CENTRE_PLAN,
            imageAlt: 'Plan of a visitor centre: the door is at the top centre; the café is next to it at the top; there are unlabelled rooms in the top left, top right and bottom left corners; toilets are in the bottom right; a lake runs along the bottom.',
            imageHotspots: [
              { questionNumber: 12, x: 22, y: 26 },
              { questionNumber: 13, x: 22, y: 66 },
              { questionNumber: 14, x: 78, y: 26 },
            ],
            questions: [
              { number: 12, answer: { accepted: ['gift shop', 'shop'] }, explanationHtml: '"The room on the left of the café, in the top left-hand corner, is the gift shop".' },
              { number: 13, answer: { accepted: ['viewing gallery'] }, explanationHtml: '"at the bottom left, also looking out over the lake, is the viewing gallery".' },
              { number: 14, answer: { accepted: ['education room'] }, explanationHtml: '"The room in the top right-hand corner is the education room".' },
            ],
          },
          {
            id: 't34-l2-mc2',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 15, promptHtml: 'How long does the main trail take to walk?', options: [{ key: 'A', text: 'about an hour' }, { key: 'B', text: 'about an hour and a half' }, { key: 'C', text: 'about three hours' }], answer: { accepted: ['B'] }, explanationHtml: '"takes around an hour and a half at a gentle pace".' },
              { number: 16, promptHtml: 'When is the best time to see most birds?', options: [{ key: 'A', text: 'in the middle of the day' }, { key: 'B', text: 'early morning or late afternoon' }, { key: 'C', text: 'after rain' }], answer: { accepted: ['B'] }, explanationHtml: '"The best time to see most birds is early morning or late afternoon".' },
              { number: 17, promptHtml: 'Where is the best place to see kingfishers?', options: [{ key: 'A', text: 'the viewing gallery' }, { key: 'B', text: 'the hide at the far end of the lake' }, { key: 'C', text: 'near the café' }], answer: { accepted: ['B'] }, explanationHtml: '"the hide at the far end of the lake is the best place for those".' },
              { number: 18, promptHtml: 'Which dogs are allowed on the reserve?', options: [{ key: 'A', text: 'dogs on a lead' }, { key: 'B', text: 'assistance dogs only' }, { key: 'C', text: 'no dogs at all' }], answer: { accepted: ['B'] }, explanationHtml: '"the only exception is assistance dogs".' },
              { number: 19, promptHtml: 'What do people who join the trust today receive?', options: [{ key: 'A', text: 'a free guidebook' }, { key: 'B', text: 'a free coffee' }, { key: 'C', text: 'free parking' }], answer: { accepted: ['A'] }, explanationHtml: '"a free guidebook to anyone who joins today".' },
              { number: 20, promptHtml: 'Where can visitors record unusual sightings?', options: [{ key: 'A', text: 'in the gift shop' }, { key: 'B', text: 'online' }, { key: 'C', text: 'at the café counter' }], answer: { accepted: ['C'] }, explanationHtml: '"the sightings book, which you\'ll find at the café counter".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a student, Leo, talking to his tutor about his research project on urban foxes.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "So, Leo, how's your fox project going?" },
          { speaker: 'B', voice: 'david', text: "Really well, thanks. I've got about six weeks of data now from the camera traps." },
          { speaker: 'A', voice: 'zira', text: "Remind me how many cameras you're using." },
          { speaker: 'B', voice: 'david', text: "Ten, in different gardens around the university. I'd hoped to use fifteen, but two of the householders changed their minds, and three cameras were stolen, so I'm down to ten." },
          { speaker: 'A', voice: 'zira', text: "That's a pity, but ten is still enough. What made you choose foxes?" },
          { speaker: 'B', voice: 'david', text: "Partly because they're so common in cities now, but mainly because people have such strong opinions about them. Some people love them, others think they're pests." },
          { speaker: 'A', voice: 'zira', text: "And what have you found so far?" },
          { speaker: 'B', voice: 'david', text: "The biggest surprise is how much time they spend in gardens during the day. I'd assumed they'd only come out at night, but about a fifth of the sightings are in daylight, mostly in quiet gardens." },
          { speaker: 'A', voice: 'zira', text: "Interesting. What are they doing?" },
          { speaker: 'B', voice: 'david', text: "Mostly resting or looking for food. I've got some lovely footage of cubs playing, too." },
          { speaker: 'A', voice: 'zira', text: "Now, you're going to write this up as a report. Let's think about the summary of your methods. Where did you put the cameras?" },
          { speaker: 'B', voice: 'david', text: "I attached them to fences or trees, about fifty centimetres above the ground, pointing towards places where foxes had been seen, such as gaps under fences." },
          { speaker: 'A', voice: 'zira', text: "And what triggers them?" },
          { speaker: 'B', voice: 'david', text: "They have a sensor that detects movement and heat. The only problem is that they also record a lot of cats. About half the videos are cats." },
          { speaker: 'A', voice: 'zira', text: "That's typical. How are you identifying individual foxes?" },
          { speaker: 'B', voice: 'david', text: "By their markings, mainly. Some have scars, or a distinctive tail. One has a white tip on its tail that's much larger than normal, so it's easy to recognise." },
          { speaker: 'A', voice: 'zira', text: "Good. And how do you store the data?" },
          { speaker: 'B', voice: 'david', text: "I collect the memory cards every week and put all the videos into a spreadsheet, with the date, time, garden and what the fox was doing." },
          { speaker: 'A', voice: 'zira', text: "Excellent. One suggestion: you might also interview some of the householders about their attitudes to foxes. That would connect nicely with your original interest." },
          { speaker: 'B', voice: 'david', text: "That's a good idea. I'll do that." },
        ],
        questionGroups: [
          {
            id: 't34-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'How many cameras is Leo using?', options: [{ key: 'A', text: '10' }, { key: 'B', text: '13' }, { key: 'C', text: '15' }], answer: { accepted: ['A'] }, explanationHtml: '"so I\'m down to ten".' },
              { number: 22, promptHtml: 'Why did Leo mainly choose foxes?', options: [{ key: 'A', text: 'They are easy to film.' }, { key: 'B', text: 'People have strong views about them.' }, { key: 'C', text: 'His tutor studies them.' }], answer: { accepted: ['B'] }, explanationHtml: '"mainly because people have such strong opinions about them".' },
              { number: 23, promptHtml: 'What surprised Leo?', options: [{ key: 'A', text: 'the number of cubs' }, { key: 'B', text: 'how often foxes appeared during the day' }, { key: 'C', text: 'how few foxes there were' }], answer: { accepted: ['B'] }, explanationHtml: '"about a fifth of the sightings are in daylight".' },
              { number: 24, promptHtml: 'What are foxes mostly doing in the daytime?', options: [{ key: 'A', text: 'fighting' }, { key: 'B', text: 'digging' }, { key: 'C', text: 'resting or looking for food' }], answer: { accepted: ['C'] }, explanationHtml: '"Mostly resting or looking for food."' },
            ],
          },
          {
            id: 't34-l3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Methods</strong></p><p>Cameras were attached to {{q25}} or trees, about 50 cm above the ground, pointing towards gaps where foxes had been seen. A sensor detects movement and {{q26}}, but about half the videos show {{q27}}. Individual foxes are identified by their {{q28}}, such as scars. Every week, Leo collects the memory cards and records the details in a {{q29}}. His tutor suggests he should also interview {{q30}}.</p>',
            questions: [
              { number: 25, answer: { accepted: ['fences'] }, explanationHtml: '"I attached them to fences or trees".' },
              { number: 26, answer: { accepted: ['heat'] }, explanationHtml: '"a sensor that detects movement and heat".' },
              { number: 27, answer: { accepted: ['cats'] }, explanationHtml: '"About half the videos are cats."' },
              { number: 28, answer: { accepted: ['markings'] }, explanationHtml: '"By their markings, mainly."' },
              { number: 29, answer: { accepted: ['spreadsheet'] }, explanationHtml: '"put all the videos into a spreadsheet".' },
              { number: 30, answer: { accepted: ['householders'] }, explanationHtml: '"interview some of the householders".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the invention of the ballpoint pen.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today, as part of our course on the history of everyday technology, I'm going to talk about the ballpoint pen, which is now the most widely used writing instrument in the world." },
          { speaker: 'A', voice: 'david', text: "Before the ballpoint, most people wrote with fountain pens, which had to be refilled from a bottle of ink and often leaked. The ink also took time to dry, so it was easy to smudge." },
          { speaker: 'A', voice: 'david', text: "The basic idea of a pen with a small rotating ball at its tip was patented as early as 1888 by an American, John Loud. But Loud's pen was intended for marking rough surfaces such as leather, and it was too crude for writing on paper. The patent expired without the pen ever being sold." },
          { speaker: 'A', voice: 'david', text: "The real breakthrough came from László Bíró, a journalist working in Hungary in the nineteen thirties. He noticed that the ink used for printing newspapers dried very quickly and didn't smudge. However, it was too thick to flow through the nib of a fountain pen. Working with his brother, György, who was a chemist, he developed a pen with a tiny ball that rolled the thick ink onto the paper." },
          { speaker: 'A', voice: 'david', text: "Bíró patented his pen in 1938, but soon afterwards he left Europe, because of the war, and moved to Argentina, where he set up a company to manufacture the pens. One of the first large customers was the British air force, which found that the new pens, unlike fountain pens, didn't leak at high altitude." },
          { speaker: 'A', voice: 'david', text: "In 1945, an American businessman, Milton Reynolds, saw Bíró pens on a trip to Argentina. He produced his own version, which avoided Bíró's patent, and launched it in a New York department store. The pens were enormously expensive, but thousands were sold on the first day. The early pens, however, were unreliable. They often leaked or skipped, and within a few years sales collapsed." },
          { speaker: 'A', voice: 'david', text: "The person who made the ballpoint a mass product was the French manufacturer Marcel Bich. He bought the rights to Bíró's design and concentrated on making the pens cheaper and more reliable. His company's pen, launched in 1950, had a transparent plastic case so that users could see how much ink was left, and a small hole in the side to keep the air pressure equal. It was so cheap that people could simply throw it away when it ran out." },
          { speaker: 'A', voice: 'david', text: "Interestingly, in Argentina, where Bíró lived for the rest of his life, the ballpoint pen is still commonly called a birome, and his birthday is celebrated there as Inventors' Day." },
        ],
        questionGroups: [
          {
            id: 't34-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'What was a disadvantage of fountain pens?', options: [{ key: 'A', text: 'They were very expensive.' }, { key: 'B', text: 'The ink was slow to dry.' }, { key: 'C', text: 'They were difficult to hold.' }], answer: { accepted: ['B'] }, explanationHtml: '"The ink also took time to dry, so it was easy to smudge."' },
              { number: 32, promptHtml: 'John Loud\'s pen was designed for', options: [{ key: 'A', text: 'writing on paper.' }, { key: 'B', text: 'marking rough surfaces.' }, { key: 'C', text: 'drawing maps.' }], answer: { accepted: ['B'] }, explanationHtml: '"intended for marking rough surfaces such as leather".' },
              { number: 33, promptHtml: 'What gave Bíró the idea for his pen?', options: [{ key: 'A', text: 'the ink used for newspapers' }, { key: 'B', text: 'a broken fountain pen' }, { key: 'C', text: 'a conversation with a scientist' }], answer: { accepted: ['A'] }, explanationHtml: '"the ink used for printing newspapers dried very quickly and didn\'t smudge".' },
              { number: 34, promptHtml: 'Why did the air force like the new pens?', options: [{ key: 'A', text: 'They were cheap.' }, { key: 'B', text: 'They did not leak at high altitude.' }, { key: 'C', text: 'They wrote in several colours.' }], answer: { accepted: ['B'] }, explanationHtml: '"the new pens ... didn\'t leak at high altitude".' },
              { number: 35, promptHtml: 'What happened to the first pens sold in New York?', options: [{ key: 'A', text: 'Few people bought them.' }, { key: 'B', text: 'Sales were high at first but then fell.' }, { key: 'C', text: 'They were sold only to businesses.' }], answer: { accepted: ['B'] }, explanationHtml: '"thousands were sold on the first day ... within a few years sales collapsed".' },
              { number: 36, promptHtml: 'Why did Bich\'s pen have a transparent case?', options: [{ key: 'A', text: 'to make it cheaper' }, { key: 'B', text: 'to show the amount of ink remaining' }, { key: 'C', text: 'to keep the air pressure equal' }], answer: { accepted: ['B'] }, explanationHtml: '"so that users could see how much ink was left".' },
            ],
          },
          {
            id: 't34-l4-people',
            type: 'matching_features',
            instructionHtml: 'Which statement applies to each of the following people? Choose <strong>FOUR</strong> answers from the box and write the correct letter, A-F, next to Questions 37-40.',
            bank: [
              { key: 'A', text: 'His invention was never sold.' },
              { key: 'B', text: 'He provided scientific knowledge for the pen.' },
              { key: 'C', text: 'He made the pen cheap enough to throw away.' },
              { key: 'D', text: 'He was the first to sell ballpoints in the United States.' },
              { key: 'E', text: 'He sold his company to a British firm.' },
              { key: 'F', text: 'He invented the fountain pen.' },
            ],
            questions: [
              { number: 37, promptHtml: 'John Loud', answer: { accepted: ['A'] }, explanationHtml: '"The patent expired without the pen ever being sold."' },
              { number: 38, promptHtml: 'György Bíró', answer: { accepted: ['B'] }, explanationHtml: '"his brother, György, who was a chemist".' },
              { number: 39, promptHtml: 'Milton Reynolds', answer: { accepted: ['D'] }, explanationHtml: '"launched it in a New York department store".' },
              { number: 40, promptHtml: 'Marcel Bich', answer: { accepted: ['C'] }, explanationHtml: '"It was so cheap that people could simply throw it away".' },
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
        '<p>The chart below shows how a school spent its annual budget in 2004, 2014 and 2024.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'School spending by category (% of total budget)',
        unit: '%',
        categories: ['Teachers\' salaries', 'Other staff', 'Technology', 'Buildings', 'Books and materials'],
        xAxisLabel: 'Category',
        yAxisLabel: 'Percentage of budget',
        series: [
          { name: '2004', data: [52, 16, 4, 18, 10] },
          { name: '2014', data: [49, 18, 11, 14, 8] },
          { name: '2024', data: [47, 19, 16, 12, 6] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Nowadays, many people change their jobs several times during their working lives.</p><p>Why do you think this is happening? Is this a positive or negative development?</p>',
    },
  },
};
