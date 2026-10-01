// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-29',
  title: 'Vocably Practice Test 29',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The lines that changed shopping',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>Almost every product sold in a shop today carries a small pattern of black and white stripes. When it is passed over a scanner at the checkout, the price appears instantly on a screen, the item is recorded in the shop's stock system, and the customer receives an itemised receipt. The barcode is so familiar that it is almost invisible, yet it transformed retailing, manufacturing and transport, and its origins lie in a moment of inspiration on a beach. Before barcodes, every item in a shop had to be marked with a price by hand, and at the checkout, cashiers typed each price into the till, a slow process that led to long queues and frequent mistakes.</p>" },
          { label: 'B', html: "<p>In 1948, a graduate student in the United States named Bernard Silver overheard the president of a local food chain asking a university dean for help in finding a way to record product information automatically at the checkout. The dean was not interested, but Silver mentioned the conversation to his friend Norman Joseph Woodland, a fellow student with a background in engineering. Woodland became fascinated by the problem and, it is said, gave up his studies to work on it full time.</p>" },
          { label: 'C', html: "<p>The breakthrough came while Woodland was sitting on a beach in Florida. He had learned Morse code as a boy scout, and he began thinking about how its dots and dashes might be used to represent information visually. Idly pushing his fingers into the sand, he drew them towards him and saw that he had created a series of lines, some thick and some thin. The lines could represent data in the same way that dots and dashes do. Woodland and Silver later developed a circular version, like a target, so that it could be read from any direction, and they were granted a patent for their invention in 1952.</p>" },
          { label: 'D', html: "<p>The idea was ahead of its time. Reading the code required a powerful light source and a way of converting the reflected light into electrical signals, and the equipment of the day was large, expensive and unreliable. For about twenty years, barcodes were used only in a few specialised areas. One early system, for example, used coloured labels to identify railway wagons as they passed a scanner beside the track, but it was abandoned after dirt on the labels caused too many errors. It was the development of cheap lasers and small computers in the 1960s and 1970s that finally made barcodes practical.</p>" },
          { label: 'E', html: "<p>In the early 1970s, the American grocery industry formed a committee to agree on a single standard code that all manufacturers and shops would use. Several companies submitted designs, and the committee chose one developed by an engineer at IBM, which used a rectangular pattern of vertical bars rather than a circle, because it was easier to print accurately. The first product to be scanned using the new system was a packet of chewing gum, in a supermarket in Ohio, in June 1974. That packet is now kept in a museum in Washington. Within a decade, barcodes were used in most supermarkets in North America and Europe, and they were soon adopted in factories, warehouses, hospitals and libraries.</p>" },
          { label: 'F', html: "<p>The benefits went far beyond faster checkouts. For the first time, shops had precise, up-to-date information on exactly what they were selling, which allowed them to reorder stock automatically and to reduce the amount of goods kept in storerooms. Manufacturers could track products through every stage of production and distribution. Critics at the time worried that shoppers would lose track of prices once they were no longer marked on individual items, and in some places laws were passed requiring prices to be displayed on shelves. Some people also feared that the codes would be used to collect information about customers, a concern that has not entirely disappeared.</p>" },
          { label: 'G', html: "<p>The barcode has continued to evolve. In 1994, an engineer at a Japanese car parts company, looking for a way to track components more efficiently, developed a square code made up of small black and white squares, which can hold far more information than a traditional barcode and can be read quickly by a camera from any angle. Known as the QR code, short for 'quick response', it was made freely available, and it has since become widely used on posters, menus and tickets, allowing people to open websites simply by pointing a phone at it, and to pay in shops without cash or cards. Woodland lived to see the success of his idea and received a national medal for technology in 1992, although, since his patent had expired long before barcodes came into general use, he earned very little from it.</p>" },
        ],
        questionGroups: [
          {
            id: 't29-r1-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 1 has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              { number: 1, promptHtml: 'the reason a system for identifying vehicles failed', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: the railway system "was abandoned after dirt on the labels caused too many errors".', locatorParagraph: 'D' },
              { number: 2, promptHtml: 'a description of how shopping worked before barcodes', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: "every item in a shop had to be marked with a price by hand".', locatorParagraph: 'A' },
              { number: 3, promptHtml: 'concerns that were expressed about the new technology', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: "Critics at the time worried ..." and fears about collecting information.', locatorParagraph: 'F' },
              { number: 4, promptHtml: 'how an earlier skill helped to inspire an invention', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: Woodland "had learned Morse code as a boy scout".', locatorParagraph: 'C' },
              { number: 5, promptHtml: 'the reason one design was preferred to another', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: the rectangular design was chosen "because it was easier to print accurately".', locatorParagraph: 'E' },
            ],
          },
          {
            id: 't29-r1-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>The beginnings of the barcode</strong></p><p>Bernard Silver heard the head of a food chain asking a university {{q6}} for help. His friend Woodland, who had studied {{q7}}, took up the challenge. While sitting on a beach, he drew lines in the {{q8}}. The first design was circular, like a {{q9}}, so that it could be read from any direction.</p>',
            questions: [
              { number: 6, answer: { accepted: ['dean'] }, explanationHtml: 'Paragraph B: "asking a university dean for help".', locatorParagraph: 'B' },
              { number: 7, answer: { accepted: ['engineering'] }, explanationHtml: 'Paragraph B: "a fellow student with a background in engineering".', locatorParagraph: 'B' },
              { number: 8, answer: { accepted: ['sand'] }, explanationHtml: 'Paragraph C: "pushing his fingers into the sand".', locatorParagraph: 'C' },
              { number: 9, answer: { accepted: ['target'] }, explanationHtml: 'Paragraph C: "a circular version, like a target".', locatorParagraph: 'C' },
            ],
          },
          {
            id: 't29-r1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 10, promptHtml: 'Barcodes became practical after the development of cheap lasers and small {{q10}}.', answer: { accepted: ['computers'] }, explanationHtml: 'Paragraph D: "cheap lasers and small computers".', locatorParagraph: 'D' },
              { number: 11, promptHtml: 'The first scanned product was a packet of {{q11}}.', answer: { accepted: ['chewing gum', 'gum'] }, explanationHtml: 'Paragraph E: "a packet of chewing gum".', locatorParagraph: 'E' },
              { number: 12, promptHtml: 'Barcodes allowed shops to reduce the goods kept in {{q12}}.', answer: { accepted: ['storerooms'] }, explanationHtml: 'Paragraph F: "reduce the amount of goods kept in storerooms".', locatorParagraph: 'F' },
              { number: 13, promptHtml: 'The QR code was originally developed to track car {{q13}}.', answer: { accepted: ['components', 'parts'] }, explanationHtml: 'Paragraph G: "looking for a way to track components more efficiently".', locatorParagraph: 'G' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The true price of a parking space',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>Most drivers regard parking as something that should be easy to find and cheap or free to use. When a city introduces parking charges or removes spaces, the reaction is often furious. Yet a growing number of urban planners argue that the way cities manage parking is one of the least understood and most damaging aspects of modern urban life, and that free or underpriced parking imposes large hidden costs on everyone, including people who do not own cars.</p>" },
          { label: 'B', html: "<p>Parking takes up an extraordinary amount of space. It has been estimated that in some American cities there are several parking spaces for every car, spread between homes, workplaces, shops and streets, and that the land devoted to parking exceeds the land occupied by buildings. Each space, including the lanes needed to reach it, takes up roughly as much room as a small bedroom, and a car spends around ninety-five per cent of its life parked. In the centres of many cities, where land is most valuable, huge areas that could be used for housing, shops or parks are instead occupied by vehicles that are not moving.</p>" },
          { label: 'C', html: "<p>Much of this parking exists because the law requires it. For decades, planning rules in many countries have obliged developers to provide a minimum number of spaces with every new building: so many per apartment, per square metre of office space or per restaurant seat. These minimums were usually set with little evidence, often by copying the rules of other cities, and designed to ensure that there would be enough spaces on the busiest day of the year. As a result, most parking stands empty for most of the time.</p>" },
          { label: 'D', html: "<p>The costs are considerable. Building a single space in a multi-storey or underground car park can cost tens of thousands of dollars, and these costs are passed on to everyone through higher rents and prices, whether or not they drive. Parking requirements also make some developments impossible: on a small or awkward site, there may simply be no room for the required spaces, and so the housing or shops are never built. Critics argue that this has contributed to housing shortages in many cities.</p>" },
          { label: 'E', html: "<p>Free parking on streets causes a different problem. When spaces are free, drivers circle around looking for one, adding to congestion and pollution. Studies in busy city districts have found that a significant proportion of the traffic at certain times consists of drivers searching for parking. The solution proposed by many economists is to charge prices that vary with demand, set so that one or two spaces are always free on every street. Drivers would then find a space immediately, and those who valued a space most would be able to get one.</p>" },
          { label: 'F', html: "<p>Several cities have tested this idea. In one American city, sensors were installed in thousands of parking spaces, and prices were adjusted every few months according to how full each street was. Prices rose on the busiest streets and fell on quieter ones, and the time drivers spent searching for spaces fell noticeably. Some cities have also returned the money raised from parking charges to the neighbourhoods where it was collected, using it to improve pavements and street lighting, which has made the charges much more popular with local shopkeepers.</p>" },
          { label: 'G', html: "<p>In recent years, a number of cities, including some in the United States, have abolished minimum parking requirements altogether, allowing developers to decide how many spaces to provide. The early evidence suggests that developers continue to build parking where there is demand for it, but build less than before, particularly near public transport, and that more new homes are being built as a result. The change has attracted little attention outside planning circles, but its long-term effects on the shape of cities could be considerable.</p>" },
          { label: 'H', html: "<p>I do not believe that the answer is to make driving impossible or to remove parking overnight. Many people, particularly in suburbs and rural areas, have no practical alternative to the car. But I am convinced that cities should stop forcing developers to build parking that is not needed, and should charge for street parking at prices that reflect its true value. The money saved and raised could be used to improve the alternatives, so that fewer people need to drive in the first place.</p>" },
        ],
        questionGroups: [
          {
            id: 't29-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has eight paragraphs, A-H. Choose the correct heading for paragraphs A and C-H from the list of headings below.<br/><em>Example: Paragraph B — iii</em>',
            bank: [
              { key: 'i', text: 'Rules that create too many spaces' },
              { key: 'ii', text: 'An unpopular but important issue' },
              { key: 'iv', text: 'The hidden cost to everyone' },
              { key: 'v', text: 'A balanced personal view' },
              { key: 'vi', text: 'The effects of free street parking' },
              { key: 'vii', text: 'Removing a legal requirement' },
              { key: 'viii', text: 'Experiments with flexible pricing' },
              { key: 'ix', text: 'The design of modern car parks' },
              { key: 'x', text: 'The rise of electric cars' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph A', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph A: reactions are "furious", yet planners argue parking is poorly understood and damaging.', locatorParagraph: 'A' },
              { number: 15, promptHtml: 'Paragraph C', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph C: "Much of this parking exists because the law requires it."', locatorParagraph: 'C' },
              { number: 16, promptHtml: 'Paragraph D', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph D: costs "are passed on to everyone through higher rents and prices".', locatorParagraph: 'D' },
              { number: 17, promptHtml: 'Paragraph E', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph E: "Free parking on streets causes a different problem."', locatorParagraph: 'E' },
              { number: 18, promptHtml: 'Paragraph F', answer: { accepted: ['viii'] }, explanationHtml: 'Paragraph F: prices "adjusted every few months according to how full each street was".', locatorParagraph: 'F' },
              { number: 19, promptHtml: 'Paragraph G', answer: { accepted: ['vii'] }, explanationHtml: 'Paragraph G: cities "have abolished minimum parking requirements altogether".', locatorParagraph: 'G' },
              { number: 20, promptHtml: 'Paragraph H', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph H: the writer rejects extreme measures but supports reform.', locatorParagraph: 'H' },
            ],
          },
          {
            id: 't29-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 21, promptHtml: 'People without cars are unaffected by the cost of parking.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph A: parking "imposes large hidden costs on everyone, including people who do not own cars".' },
              { number: 22, promptHtml: 'Minimum parking requirements were generally based on careful research.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph C: they "were usually set with little evidence".' },
              { number: 23, promptHtml: 'Parking requirements may have prevented some housing from being built.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph D: "the housing or shops are never built".' },
              { number: 24, promptHtml: 'Electric cars will solve the problem of congestion.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Electric cars are not discussed.' },
              { number: 25, promptHtml: 'Parking should be removed from cities as quickly as possible.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph H: "I do not believe that the answer is ... to remove parking overnight."' },
              { number: 26, promptHtml: 'Money from parking charges could be used to improve alternatives to driving.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph H: "The money saved and raised could be used to improve the alternatives".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Winning land from the sea',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>About a quarter of the Netherlands lies below sea level, and much of the rest would be regularly flooded without human protection. The country's name itself means 'the low lands'. Over more than a thousand years, the Dutch have not only defended their land against the sea and rivers but also created large areas of new land where there was once water. Their experience has made them world leaders in water engineering, and it offers important lessons at a time when rising sea levels threaten coastal regions everywhere.</p>" },
          { label: '', html: "<p>The earliest inhabitants of the coastal areas lived on artificial mounds, built up gradually from earth and waste so that their houses stayed dry during floods. From around the eleventh century, communities began to build continuous dykes, or embankments, to keep out the sea and rivers. Land enclosed by dykes and drained of water is known as a polder. The problem was that once the land was drained, the peat soil dried out and sank, so that the polders gradually fell lower and lower, making them harder to keep dry. Managing the dykes and drainage required close cooperation between neighbours, and local water boards were set up to organise the work and collect contributions from landowners. Some of these boards, which date back to the thirteenth century, still exist today, making them among the oldest democratic institutions in the country.</p>" },
          { label: '', html: "<p>The solution was the windmill. From the fifteenth century onwards, thousands of windmills were built to pump water out of the polders and into rivers and canals that carried it to the sea. By linking several windmills in a series, each lifting the water a little higher, engineers could drain land that lay several metres below the surrounding water. In the seventeenth century, when the Netherlands was one of the wealthiest countries in Europe, merchants invested their profits in draining entire lakes to create farmland, and several of these projects produced large, rich polders that are still farmed today.</p>" },
          { label: '', html: "<p>The age of steam brought larger ambitions. In the nineteenth century, a large lake close to Amsterdam, which had grown steadily by eating away at its shores and threatened the city itself, was drained using three enormous steam-powered pumping stations. One of them, now a museum, contains the largest steam engine ever built. The work took only a few years, compared with the decades that would have been needed with windmills.</p>" },
          { label: '', html: "<p>The most ambitious project of all followed a disastrous flood in 1916. The Zuiderzee, a shallow inland sea in the centre of the country, was to be closed off from the North Sea by a dam more than thirty kilometres long, completed in 1932. The salt water behind the dam gradually became fresh, forming a large lake, and parts of it were then drained to create new polders. On one of these, an entirely new province was established, with new towns, roads and farms, on land that had been at the bottom of the sea less than a century earlier.</p>" },
          { label: '', html: "<p>In 1953, a storm surge broke through the dykes in the south-west of the country, killing more than eighteen hundred people. In response, the government launched the Delta Works, a vast system of dams, barriers and locks designed to shorten the coastline and protect the region from the sea. Its most famous element is a storm surge barrier with huge gates that normally remain open, allowing the tide to flow in and out and preserving the environment of the estuary, but which can be closed when a dangerous storm approaches.</p>" },
          { label: '', html: "<p>In recent decades, Dutch thinking about water has changed. Rather than simply building higher defences, engineers now aim to 'make room for the river', lowering flood plains, moving dykes further back and creating areas that can safely flood when water levels are high. Some polders have been deliberately returned to water. Dutch engineers argue that working with natural processes, rather than against them, is both cheaper and more sustainable, and they are now advising governments around the world on how to adapt to rising seas.</p>" },
        ],
        questionGroups: [
          {
            id: 't29-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 27, promptHtml: 'Why did polders become harder to keep dry over time?', options: [{ key: 'A', text: 'The dykes were poorly built.' }, { key: 'B', text: 'The soil sank after it was drained.' }, { key: 'C', text: 'Sea levels rose rapidly.' }, { key: 'D', text: 'Windmills were not powerful enough.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "the peat soil dried out and sank, so that the polders gradually fell lower".' },
              { number: 28, promptHtml: 'How were windmills able to drain very low land?', options: [{ key: 'A', text: 'by using very large sails' }, { key: 'B', text: 'by working in a series' }, { key: 'C', text: 'by using steam power' }, { key: 'D', text: 'by storing water underground' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "By linking several windmills in a series, each lifting the water a little higher".' },
              { number: 29, promptHtml: 'Why was the lake near Amsterdam drained?', options: [{ key: 'A', text: 'It was growing and endangered the city.' }, { key: 'B', text: 'The city needed drinking water.' }, { key: 'C', text: 'It was polluted.' }, { key: 'D', text: 'Merchants wanted farmland.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: it "had grown steadily ... and threatened the city itself".' },
              { number: 30, promptHtml: 'What is special about the storm surge barrier?', options: [{ key: 'A', text: 'It is the longest dam in the world.' }, { key: 'B', text: 'Its gates are normally left open.' }, { key: 'C', text: 'It was built before 1953.' }, { key: 'D', text: 'It uses windmills.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 6: "huge gates that normally remain open".' },
            ],
          },
          {
            id: 't29-r3-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 31, promptHtml: 'The earliest coastal settlers built dykes to protect their homes.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: they "lived on artificial mounds"; dykes came later, from around the eleventh century.' },
              { number: 32, promptHtml: 'Some polders created in the seventeenth century are still used for farming.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 3: they "are still farmed today".' },
              { number: 33, promptHtml: 'The steam engine in the museum was built in Britain.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not say where the engine was built.' },
              { number: 34, promptHtml: 'The water behind the Zuiderzee dam remained salty.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 5: "The salt water behind the dam gradually became fresh".' },
              { number: 35, promptHtml: 'The 1953 flood killed over 1,800 people.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 6: "killing more than eighteen hundred people".' },
              { number: 36, promptHtml: 'All Dutch polders are now protected by higher dykes.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Final paragraph: "Some polders have been deliberately returned to water."' },
            ],
          },
          {
            id: 't29-r3-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-K, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'province' },
              { key: 'B', text: 'room' },
              { key: 'C', text: 'natural' },
              { key: 'D', text: 'cheaper' },
              { key: 'E', text: 'higher' },
              { key: 'F', text: 'expensive' },
              { key: 'G', text: 'city' },
              { key: 'H', text: 'artificial' },
              { key: 'I', text: 'sea' },
              { key: 'J', text: 'river' },
              { key: 'K', text: 'slower' },
            ],
            stemHtml:
              '<p><strong>Modern Dutch water management</strong></p><p>After the Zuiderzee was closed, a new {{q37}} was created on reclaimed land. Today, instead of only building {{q38}} defences, engineers try to make {{q39}} for rivers. They believe that working with {{q40}} processes is more sustainable.</p>',
            questions: [
              { number: 37, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 5: "an entirely new province was established".' },
              { number: 38, answer: { accepted: ['E'] }, explanationHtml: 'Final paragraph: "Rather than simply building higher defences".' },
              { number: 39, answer: { accepted: ['B'] }, explanationHtml: 'Final paragraph: "make room for the river".' },
              { number: 40, answer: { accepted: ['C'] }, explanationHtml: 'Final paragraph: "working with natural processes".' },
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
        contextText: 'You will hear a man asking for advice about where to hold his daughter\'s birthday party, and then making a booking.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, Riverside Family Centre. How can I help?" },
          { speaker: 'B', voice: 'david', text: "Hi. I'm organising a birthday party for my daughter. She's going to be eight. I wondered what options you have." },
          { speaker: 'A', voice: 'zira', text: "We've got a few. The most popular is the soft play area, but that's really best for children under six, so it might be a bit young for her." },
          { speaker: 'B', voice: 'david', text: "Yes, she'd probably think that was babyish. What else?" },
          { speaker: 'A', voice: 'zira', text: "There's the climbing wall. The children love it, but it's only suitable for groups of up to eight, because each child needs an instructor." },
          { speaker: 'B', voice: 'david', text: "We'll have about fifteen children, so that won't work." },
          { speaker: 'A', voice: 'zira', text: "Then I'd suggest the art studio. The children make a craft item, and it's very popular with this age group. The only thing is that it needs to be booked at least three weeks in advance." },
          { speaker: 'B', voice: 'david', text: "That's fine, the party's next month. What would they make?" },
          { speaker: 'A', voice: 'zira', text: "This month it's decorated photo frames. And we also do a mini disco in the main hall, which is cheaper, but you'd need to provide your own food." },
          { speaker: 'B', voice: 'david', text: "I think the art studio sounds best. Could I book it?" },
          { speaker: 'A', voice: 'zira', text: "Of course. What date were you thinking of?" },
          { speaker: 'B', voice: 'david', text: "Saturday the twenty-first of June." },
          { speaker: 'A', voice: 'zira', text: "We have a slot starting at two o'clock. Parties last two hours." },
          { speaker: 'B', voice: 'david', text: "Perfect." },
          { speaker: 'A', voice: 'zira', text: "Can I have your name?" },
          { speaker: 'B', voice: 'david', text: "Daniel Fairbrother. That's F-A-I-R-B-R-O-T-H-E-R." },
          { speaker: 'A', voice: 'zira', text: "And your daughter's name?" },
          { speaker: 'B', voice: 'david', text: "Isla. I-S-L-A." },
          { speaker: 'A', voice: 'zira', text: "Lovely. Now, food. We provide a party meal; would you like the standard menu or the healthy option?" },
          { speaker: 'B', voice: 'david', text: "The healthy option, please. What does that include?" },
          { speaker: 'A', voice: 'zira', text: "Sandwiches, vegetable sticks and fruit, and a drink. And we'll need a deposit of thirty pounds today to confirm the booking." },
        ],
        questionGroups: [
          {
            id: 't29-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            stemHtml:
              '<p><strong>Party options</strong></p>' +
              '<p>• soft play area – best for children under {{q1}}<br/>• climbing wall – maximum of eight children, as each needs an {{q2}}<br/>• art studio – book at least {{q3}} in advance; making {{q4}} this month<br/>• mini disco – cheaper, but must bring own {{q5}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['six', '6', 'six years', '6 years'] }, explanationHtml: '"that\'s really best for children under six".' },
              { number: 2, answer: { accepted: ['instructor'] }, explanationHtml: '"each child needs an instructor".' },
              { number: 3, answer: { accepted: ['three weeks', '3 weeks'] }, explanationHtml: '"booked at least three weeks in advance".' },
              { number: 4, answer: { accepted: ['photo frames', 'decorated photo frames'] }, explanationHtml: '"This month it\'s decorated photo frames."' },
              { number: 5, answer: { accepted: ['food'] }, explanationHtml: '"you\'d need to provide your own food".' },
            ],
          },
          {
            id: 't29-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the booking form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Party Booking Form</strong></p>' +
              '<p>Activity: art studio<br/>Date: Saturday 21 {{q6}}<br/>Start time: {{q7}} pm<br/>Parent\'s name: Daniel {{q8}}<br/>Child\'s name: {{q9}}<br/>Menu: {{q10}} option<br/>Deposit: £30</p>',
            questions: [
              { number: 6, answer: { accepted: ['june'] }, explanationHtml: '"Saturday the twenty-first of June."' },
              { number: 7, answer: { accepted: ['2', 'two', '2.00'] }, explanationHtml: '"a slot starting at two o\'clock".' },
              { number: 8, answer: { accepted: ['fairbrother'] }, explanationHtml: 'Spelled "F-A-I-R-B-R-O-T-H-E-R".' },
              { number: 9, answer: { accepted: ['isla'] }, explanationHtml: 'Spelled "I-S-L-A".' },
              { number: 10, answer: { accepted: ['healthy'] }, explanationHtml: '"The healthy option, please."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the owner of a hostel company talking to a group of travel agents.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good afternoon, everyone. I'm Tom Garrett, and I set up Wanderbase Hostels twelve years ago. We started with a single hostel in Edinburgh, and today we have eighteen, in eleven different countries." },
          { speaker: 'A', voice: 'david', text: "Most of our hostels are in Spain, where we opened our first overseas hostel, although we're growing fastest in Portugal at the moment." },
          { speaker: 'A', voice: 'david', text: "People sometimes think hostels are only for young backpackers, but actually our fastest-growing group of customers is families, and we now have family rooms in all our hostels. We've also seen more older travellers, particularly people travelling on their own." },
          { speaker: 'A', voice: 'david', text: "Every evening we organise a free activity in each hostel. The one that's run every single day, in every hostel, is a walking tour of the local area, led by one of our staff. Other activities, like cooking evenings and quiz nights, vary from place to place." },
          { speaker: 'A', voice: 'david', text: "We're also very aware of noise. Many of our hostels are in busy city centres, so we have a quiet period in all the sleeping areas from ten thirty at night until seven in the morning." },
          { speaker: 'A', voice: 'david', text: "We offer a loyalty scheme: once a customer has stayed with us five times, they receive a free night at any of our hostels. We don't offer discounts for group bookings, I'm afraid, because we're usually almost full anyway." },
          { speaker: 'A', voice: 'david', text: "Now, some of your customers will ask about facilities. Let me explain. Lockers are provided in every room, so guests can keep their valuables safe. They just need to bring their own padlock, or buy one at reception." },
          { speaker: 'A', voice: 'david', text: "Towels are not provided automatically, to reduce washing, but guests can ask for one at reception at any time, free of charge." },
          { speaker: 'A', voice: 'david', text: "Kitchens are shared, and they're in the main communal area on the ground floor of each hostel. Guests can store food there, labelled with their name." },
          { speaker: 'A', voice: 'david', text: "And bicycles: we have bikes available in most hostels, but you have to ask for them in advance, because we only have a small number." },
        ],
        questionGroups: [
          {
            id: 't29-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'How many hostels does the company have now?', options: [{ key: 'A', text: '11' }, { key: 'B', text: '12' }, { key: 'C', text: '18' }], answer: { accepted: ['C'] }, explanationHtml: '"today we have eighteen, in eleven different countries".' },
              { number: 12, promptHtml: 'In which country does the company have most hostels?', options: [{ key: 'A', text: 'Scotland' }, { key: 'B', text: 'Spain' }, { key: 'C', text: 'Portugal' }], answer: { accepted: ['B'] }, explanationHtml: '"Most of our hostels are in Spain". They are growing fastest in Portugal.' },
              { number: 13, promptHtml: 'Which group of customers is increasing most quickly?', options: [{ key: 'A', text: 'young backpackers' }, { key: 'B', text: 'families' }, { key: 'C', text: 'older travellers' }], answer: { accepted: ['B'] }, explanationHtml: '"our fastest-growing group of customers is families".' },
              { number: 14, promptHtml: 'Which activity is available every day in every hostel?', options: [{ key: 'A', text: 'a walking tour' }, { key: 'B', text: 'a cooking evening' }, { key: 'C', text: 'a quiz night' }], answer: { accepted: ['A'] }, explanationHtml: '"The one that\'s run every single day, in every hostel, is a walking tour".' },
              { number: 15, promptHtml: 'The quiet period in sleeping areas begins at', options: [{ key: 'A', text: '10 pm.' }, { key: 'B', text: '10.30 pm.' }, { key: 'C', text: '11 pm.' }], answer: { accepted: ['B'] }, explanationHtml: '"from ten thirty at night until seven in the morning".' },
              { number: 16, promptHtml: 'What do regular customers receive?', options: [{ key: 'A', text: 'a free night' }, { key: 'B', text: 'a group discount' }, { key: 'C', text: 'a room upgrade' }], answer: { accepted: ['A'] }, explanationHtml: '"they receive a free night at any of our hostels".' },
            ],
          },
          {
            id: 't29-l2-facilities',
            type: 'matching_features',
            instructionHtml: 'What does the speaker say about the following facilities? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'They are provided in every room.' },
              { key: 'B', text: 'They are in a shared area.' },
              { key: 'C', text: 'They are available if guests ask.' },
            ],
            questions: [
              { number: 17, promptHtml: 'lockers', answer: { accepted: ['A'] }, explanationHtml: '"Lockers are provided in every room".' },
              { number: 18, promptHtml: 'towels', answer: { accepted: ['C'] }, explanationHtml: '"guests can ask for one at reception at any time".' },
              { number: 19, promptHtml: 'kitchens', answer: { accepted: ['B'] }, explanationHtml: '"they\'re in the main communal area".' },
              { number: 20, promptHtml: 'bicycles', answer: { accepted: ['C'] }, explanationHtml: '"you have to ask for them in advance".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Kate and Sam, discussing their research on how people use a public library with their tutor.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Kate and Sam, what did your observation of the city library show?" },
          { speaker: 'B', voice: 'zira', text: "The most interesting thing was how few people were actually borrowing books. People came to the library for all sorts of other reasons." },
          { speaker: 'C', voice: 'david2', text: "Yes. The biggest group were people using the free internet. Then there were students studying, mainly because it's quiet and warm. And quite a lot of parents with young children came for the story sessions." },
          { speaker: 'A', voice: 'david', text: "Interesting. So how did you collect your data?" },
          { speaker: 'B', voice: 'zira', text: "We sat in different parts of the library for two hours at a time, and recorded what people were doing every fifteen minutes." },
          { speaker: 'A', voice: 'david', text: "Did the staff mind?" },
          { speaker: 'C', voice: 'david2', text: "No, they were very helpful. In fact, the head librarian said our results would help her to argue for more funding." },
          { speaker: 'A', voice: 'david', text: "That's good. What surprised you most?" },
          { speaker: 'B', voice: 'zira', text: "How many people came in just to be around other people. Several older people told us they came every day, mainly for the company." },
          { speaker: 'A', voice: 'david', text: "That fits with other research on loneliness. What do you think the library should do with your findings?" },
          { speaker: 'C', voice: 'david2', text: "I think they should provide more space for people to work together. At the moment, it's all designed for silent study." },
          { speaker: 'B', voice: 'zira', text: "I'm not sure. The students we spoke to really valued the quiet. I think it needs separate areas, some quiet and some for groups." },
          { speaker: 'A', voice: 'david', text: "That sounds like a sensible compromise. Now, for your report, I'd like you to think about some broader points. First, every library manager needs to understand their users, but also to recognise the library's history, what it has traditionally offered." },
          { speaker: 'C', voice: 'david2', text: "OK." },
          { speaker: 'A', voice: 'david', text: "Second, when libraries change, maintaining public trust is often more important than saving money. People are very attached to their libraries." },
          { speaker: 'B', voice: 'zira', text: "That's true. There were protests when they tried to close the branch near my house." },
          { speaker: 'A', voice: 'david', text: "Exactly. And third, during periods of change, managers often have to deal with increased amounts of criticism, both from the public and from staff. Include some discussion of how that can be handled." },
        ],
        questionGroups: [
          {
            id: 't29-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Why people visit the library</strong></p><p>• to use the free {{q21}}<br/>• students: because it is quiet and {{q22}}<br/>• parents with children: for story {{q23}}</p>',
            questions: [
              { number: 21, answer: { accepted: ['internet'] }, explanationHtml: '"people using the free internet".' },
              { number: 22, answer: { accepted: ['warm'] }, explanationHtml: '"mainly because it\'s quiet and warm".' },
              { number: 23, answer: { accepted: ['sessions'] }, explanationHtml: '"came for the story sessions".' },
            ],
          },
          {
            id: 't29-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 24, promptHtml: 'How often did the students record what people were doing?', options: [{ key: 'A', text: 'every 15 minutes' }, { key: 'B', text: 'every 30 minutes' }, { key: 'C', text: 'every two hours' }], answer: { accepted: ['A'] }, explanationHtml: '"recorded what people were doing every fifteen minutes".' },
              { number: 25, promptHtml: 'How did the head librarian react to the research?', options: [{ key: 'A', text: 'She was worried about privacy.' }, { key: 'B', text: 'She thought it could help obtain money.' }, { key: 'C', text: 'She asked for a copy of the report.' }], answer: { accepted: ['B'] }, explanationHtml: '"our results would help her to argue for more funding".' },
              { number: 26, promptHtml: 'What surprised Kate most?', options: [{ key: 'A', text: 'people visiting for social contact' }, { key: 'B', text: 'the number of students' }, { key: 'C', text: 'the lack of computers' }], answer: { accepted: ['A'] }, explanationHtml: '"How many people came in just to be around other people".' },
              { number: 27, promptHtml: 'What does Kate think the library should do?', options: [{ key: 'A', text: 'provide more space for group work' }, { key: 'B', text: 'keep all areas silent' }, { key: 'C', text: 'create separate areas for different uses' }], answer: { accepted: ['C'] }, explanationHtml: '"I think it needs separate areas, some quiet and some for groups."' },
            ],
          },
          {
            id: 't29-l3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 28, promptHtml: 'Library managers need to understand their users and recognise the library\'s {{q28}}.', answer: { accepted: ['history'] }, explanationHtml: '"to recognise the library\'s history".' },
              { number: 29, promptHtml: 'When libraries change, maintaining public {{q29}} may matter more than saving money.', answer: { accepted: ['trust'] }, explanationHtml: '"maintaining public trust is often more important than saving money".' },
              { number: 30, promptHtml: 'During change, managers may have to deal with more {{q30}}.', answer: { accepted: ['criticism'] }, explanationHtml: '"deal with increased amounts of criticism".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about honey and beekeeping.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "In today's lecture, I'm going to talk about honey, one of the oldest foods known to humans, and about how modern beekeepers can work in a way that protects bees." },
          { speaker: 'A', voice: 'zira', text: "People have collected honey from wild bees for at least eight thousand years. A cave painting in Spain shows a figure climbing a rope to reach a bees' nest, and honey was so valuable in ancient Egypt that it was sometimes used to pay taxes." },
          { speaker: 'A', voice: 'zira', text: "How do bees make honey? Worker bees collect nectar, a sugary liquid, from flowers, and store it in a special stomach. Back at the hive, they pass it to other bees, who add enzymes that break down the sugar. The bees then spread it in the cells of the honeycomb and fan it with their wings, so that water evaporates and the nectar thickens into honey. Finally, they seal each cell with wax." },
          { speaker: 'A', voice: 'zira', text: "Honey has a remarkable property: it almost never goes bad. Because it contains very little water and is naturally acidic, bacteria can't survive in it. Archaeologists have found pots of honey in ancient tombs that were still edible." },
          { speaker: 'A', voice: 'zira', text: "Honey has also been used as medicine. It was applied to wounds in many ancient cultures, and some hospitals today use a special medical-grade honey to treat certain infections." },
          { speaker: 'A', voice: 'zira', text: "Now, let me say something about good practice for beekeepers. First, position is important. If you place a hive facing the morning sun, the bees will start work earlier in the day." },
          { speaker: 'A', voice: 'zira', text: "Second, it's disrespectful to your neighbours to put a hive right next to a path or garden fence, because bees fly out in a straight line and may frighten people." },
          { speaker: 'A', voice: 'zira', text: "Third, avoid opening the hive in cold or wet weather, because the young bees inside may be damaged by the cold." },
          { speaker: 'A', voice: 'zira', text: "Fourth, avoid using chemical sprays in your garden, as even small amounts can harm bees." },
          { speaker: 'A', voice: 'zira', text: "And finally, always leave enough honey in the hive for the bees to survive the winter. Taking too much is the most common mistake made by new beekeepers." },
        ],
        questionGroups: [
          {
            id: 't29-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Honey</strong></p>' +
              '<p>• in ancient Egypt, honey was used to pay {{q31}}<br/>• bees collect {{q32}} from flowers<br/>• other bees add {{q33}} to break down the sugar<br/>• honey rarely goes bad because it is low in water and naturally {{q34}}<br/>• used on {{q35}} in ancient medicine</p>',
            questions: [
              { number: 31, answer: { accepted: ['taxes'] }, explanationHtml: '"it was sometimes used to pay taxes".' },
              { number: 32, answer: { accepted: ['nectar'] }, explanationHtml: '"Worker bees collect nectar".' },
              { number: 33, answer: { accepted: ['enzymes'] }, explanationHtml: '"who add enzymes that break down the sugar".' },
              { number: 34, answer: { accepted: ['acidic'] }, explanationHtml: '"it contains very little water and is naturally acidic".' },
              { number: 35, answer: { accepted: ['wounds'] }, explanationHtml: '"It was applied to wounds".' },
            ],
          },
          {
            id: 't29-l4-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 36, promptHtml: 'A hive facing the morning {{q36}} helps bees to start work earlier.', answer: { accepted: ['sun'] }, explanationHtml: '"If you place a hive facing the morning sun".' },
              { number: 37, promptHtml: 'Placing a hive next to a path is disrespectful to {{q37}}.', answer: { accepted: ['neighbours', 'neighbors'] }, explanationHtml: '"it\'s disrespectful to your neighbours".' },
              { number: 38, promptHtml: 'Opening a hive in cold weather may damage the {{q38}} bees.', answer: { accepted: ['young'] }, explanationHtml: '"the young bees inside may be damaged by the cold".' },
              { number: 39, promptHtml: 'Beekeepers should avoid chemical {{q39}} in the garden.', answer: { accepted: ['sprays'] }, explanationHtml: '"avoid using chemical sprays".' },
              { number: 40, promptHtml: 'Enough honey must be left for the bees to survive the {{q40}}.', answer: { accepted: ['winter'] }, explanationHtml: '"leave enough honey in the hive for the bees to survive the winter".' },
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
        '<p>The chart below shows the percentage of household income spent on housing in five countries in 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Share of household income spent on housing (%)',
        unit: '%',
        categories: ['Country A', 'Country B', 'Country C', 'Country D', 'Country E'],
        xAxisLabel: 'Country',
        yAxisLabel: 'Percentage of income',
        series: [
          { name: '2000', data: [22, 18, 27, 15, 31] },
          { name: '2020', data: [29, 21, 33, 14, 38] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that cooking should be a compulsory subject at school. Others believe that this is a skill children should learn at home.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
