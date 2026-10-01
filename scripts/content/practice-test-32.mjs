// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION } from './_html.mjs';

const HARBOUR_PLAN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f6f7f2"/>
  <text x="200" y="22" font-weight="bold" fill="#333">Portside Quay — new harbour area</text>
  <rect x="0" y="250" width="600" height="150" fill="#bcd9ee"/>
  <text x="270" y="380" fill="#2c5d80">Harbour</text>
  <path d="M40 250 L560 250" stroke="#8d6e63" stroke-width="6"/>
  <rect x="60" y="150" width="120" height="80" fill="#e7e1d3" stroke="#999"/>
  <text x="80" y="195" fill="#333">Fish market</text>
  <rect x="240" y="150" width="120" height="80" fill="#e7e1d3" stroke="#999"/>
  <rect x="420" y="150" width="120" height="80" fill="#e7e1d3" stroke="#999"/>
  <rect x="440" y="250" width="16" height="100" fill="#8d6e63"/>
  <rect x="456" y="330" width="80" height="14" fill="#8d6e63"/>
  <rect x="240" y="50" width="120" height="70" fill="#e7e1d3" stroke="#999"/>
  <text x="258" y="90" fill="#333">Bus station</text>
  <path d="M40 60 L200 60 L200 120 L40 120 Z" fill="#c5e1a5" stroke="#7cb342"/>
  <text x="95" y="95" fill="#33691e">Park</text>
  <path d="M560 380 L560 355 M552 365 L560 352 L568 365" stroke="#333" stroke-width="2" fill="none"/>
  <text x="555" y="396" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-32',
  title: 'Vocably Practice Test 32',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The ancient computer from the sea',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>In 1900, a group of sponge divers sheltering from a storm near the small Greek island of Antikythera discovered the wreck of an ancient ship on the sea bed, more than forty metres below the surface. Over the following months, divers recovered bronze and marble statues, pottery, glassware and coins, which suggested that the ship had sunk in the first century BCE while carrying luxury goods, probably to Rome. Among the objects brought to the surface was a shapeless lump of corroded bronze and wood, about the size of a shoebox, which at first attracted little attention. The archaeologists were far more interested in the statues, which were among the finest bronzes ever found from the ancient world, and the lump was placed in a storeroom with other minor finds. Recovering the cargo had been dangerous work: the divers had no modern equipment, and one of them died while working on the wreck.</p>" },
          { label: '', html: "<p>Some months later, as the lump dried out in the National Archaeological Museum in Athens, it split apart, revealing the remains of gear wheels with finely cut triangular teeth. Nothing like it was known from the ancient world. Gearing of this complexity was not thought to have existed until the development of mechanical clocks in medieval Europe, more than a thousand years later. Some scholars, unable to accept that ancient craftsmen could have made it, suggested that the object must have fallen into the wreck at a later date, but the evidence was clear that it belonged with the rest of the cargo.</p>" },
          { label: '', html: "<p>For decades, the object remained a puzzle. The first serious study was made in the 1950s by a British historian of science, Derek de Solla Price, who used X-ray images, a new technique at the time, to look inside the fragments. He concluded that it was an astronomical calculator, a device that used gears to model the movements of the Sun and Moon, and he described it as a kind of ancient computer. His conclusions were greeted with scepticism by many other historians, who found it difficult to believe that the ancient Greeks had possessed such advanced technology.</p>" },
          { label: '', html: "<p>A much clearer picture emerged in the early twenty-first century, when an international team used powerful X-ray scanners, similar to those used in hospitals but far more detailed, to examine the eighty-two surviving fragments. The scans revealed about thirty gears, as well as thousands of tiny inscriptions on the surfaces, many of which had not been seen for two thousand years. The inscriptions turned out to be a kind of instruction manual, explaining what the device showed.</p>" },
          { label: '', html: "<p>The researchers concluded that the mechanism was operated by turning a handle on the side. On the front, pointers showed the positions of the Sun and Moon against the stars, the date according to the Egyptian calendar, and the phase of the Moon, displayed by a small rotating ball that was half silver and half black. On the back, two large spiral dials predicted eclipses of the Sun and Moon many years in advance, and a smaller dial showed the four-year cycle of athletic games held in different parts of Greece, including the Olympic Games. It is likely that the device also showed the positions of the five planets known at the time, although most of these gears have been lost.</p>" },
          { label: '', html: "<p>Who made it, and why, remains uncertain. The style of the lettering and the calendar used suggest that it was made in the second or first century BCE, possibly on the island of Rhodes, which was a centre of astronomy at the time. Some ancient writers mention devices that modelled the heavens, including one said to have been built by the mathematician Archimedes, but no other example has ever been found. The mechanism may have been used for teaching, or it may have been an expensive showpiece made for a wealthy customer.</p>" },
          { label: '', html: "<p>The discovery forces us to rethink what ancient technology was capable of. It is almost certain that the Antikythera mechanism was not the only one of its kind: the precision of its construction suggests that its makers had considerable experience. Yet the knowledge required to build such devices seems to have been lost, and it was many centuries before anything comparable was made again. Why such knowledge disappeared is unclear; it may have been confined to a small number of workshops, whose skills were not written down and died with their owners. Researchers continue to study the fragments, and each new technique reveals further details of what has been called the most sophisticated object to survive from the ancient world.</p>" },
        ],
        questionGroups: [
          {
            id: 't32-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'The wreck was found by divers who were searching for ancient objects.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: they were "sponge divers sheltering from a storm".' },
              { number: 2, promptHtml: 'The mechanism was immediately recognised as important.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: it "at first attracted little attention".' },
              { number: 3, promptHtml: 'The ship was probably travelling to Rome.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "carrying luxury goods, probably to Rome".' },
              { number: 4, promptHtml: 'Many historians initially accepted Price\'s conclusions.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: they "were greeted with scepticism by many other historians".' },
              { number: 5, promptHtml: 'Some of the fragments of the mechanism are now kept outside Greece.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage mentions a museum in Athens but not where all fragments are kept.' },
              { number: 6, promptHtml: 'The inscriptions explained how the device should be understood.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 4: they were "a kind of instruction manual, explaining what the device showed".' },
              { number: 7, promptHtml: 'A similar device built by Archimedes has been found.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 6: "no other example has ever been found".' },
            ],
          },
          {
            id: 't32-r1-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>How the mechanism worked</strong></p><p>The device was operated by turning a {{q8}}. On the front, a small ball that was half silver and half black showed the {{q9}} of the Moon. On the back, two {{q10}} predicted eclipses. Another dial showed the cycle of athletic {{q11}}. The device was probably made on the island of {{q12}}, and may have been used for {{q13}} or as a showpiece.</p>',
            questions: [
              { number: 8, answer: { accepted: ['handle'] }, explanationHtml: 'Paragraph 5: "operated by turning a handle on the side".' },
              { number: 9, answer: { accepted: ['phase'] }, explanationHtml: 'Paragraph 5: "the phase of the Moon".' },
              { number: 10, answer: { accepted: ['spiral dials', 'large spiral dials'] }, explanationHtml: 'Paragraph 5: "two large spiral dials predicted eclipses".' },
              { number: 11, answer: { accepted: ['games'] }, explanationHtml: 'Paragraph 5: "the four-year cycle of athletic games".' },
              { number: 12, answer: { accepted: ['rhodes'] }, explanationHtml: 'Paragraph 6: "possibly on the island of Rhodes".' },
              { number: 13, answer: { accepted: ['teaching'] }, explanationHtml: 'Paragraph 6: "may have been used for teaching".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The return of the cargo bike',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>A hundred years ago, bicycles with large baskets or boxes were a common sight in European cities. Bakers, butchers and postmen used them to deliver goods to homes and shops. As motor vans became cheaper after the Second World War, these cargo bikes largely disappeared. Now they are returning, and many transport planners believe they could play an important role in solving one of the biggest problems facing modern cities: the rapid growth of delivery traffic.</p>" },
          { label: '', html: "<p>The rise of online shopping has transformed city streets. Every day, millions of parcels are delivered to homes and offices, most of them by diesel vans, which contribute to congestion and air pollution. The final stage of the journey, from a local depot to the customer's door, is known in the industry as the 'last mile', and it is the most expensive and inefficient part of the delivery process, accounting for around half the total cost. Vans often spend long periods parked illegally while drivers deliver parcels, blocking roads and cycle lanes. Many deliveries also fail because nobody is at home, so the same parcel may be carried around the city two or three times before it finally reaches its owner. In some cities, delivery vehicles now account for a significant share of all traffic during the working day, and the number is expected to keep rising as online shopping continues to grow.</p>" },
          { label: '', html: "<p>Modern cargo bikes are very different from their predecessors. Many have electric motors that assist the rider, allowing them to carry loads of well over a hundred kilograms up hills with little effort. Some have three or four wheels and a large container behind the rider, capable of carrying dozens of parcels. They can use cycle lanes, avoid traffic jams and park almost anywhere, which in crowded city centres often makes them faster than vans. They are also much cheaper to buy and run: an electric cargo bike costs a fraction of the price of a van, needs no fuel, and can be charged from an ordinary socket. In some countries, riders do not need a driving licence, which widens the pool of people who can do the work.</p>" },
          { label: '', html: "<p>Several studies have compared the two. In one study in London, researchers followed a delivery company that replaced some of its vans with electric cargo bikes. They found that the bikes delivered parcels more quickly on average, because they spent less time stuck in traffic and looking for parking, and that carbon emissions fell by around ninety per cent. The riders were also able to make more deliveries per hour in the busiest areas.</p>" },
          { label: '', html: "<p>Cargo bikes have limitations. They cannot carry very large or heavy items, such as furniture, and they have a limited range, so they work best in dense urban areas close to a depot. Riding in bad weather is unpleasant, and some riders have raised concerns about pay and working conditions. Delivery companies also need small depots, sometimes called micro-hubs, in or near city centres, where parcels can be transferred from lorries to bikes, and space for these is expensive.</p>" },
          { label: '', html: "<p>Cities have tried different ways of encouraging the change. Some offer grants to help businesses buy cargo bikes, while others have created low-emission zones in which diesel vans must pay a charge. Several have provided public land for micro-hubs, sometimes in unused parking areas or under railway bridges. In some places, cargo bikes are also being used by tradespeople, such as plumbers and electricians, and by parents taking children to school.</p>" },
          { label: '', html: "<p>Cargo bikes will not replace vans entirely, but many experts believe that they could handle a significant share of deliveries in city centres. With the number of parcels continuing to grow, and cities under pressure to reduce pollution and congestion, the humble delivery bike may once again become a familiar feature of urban life. Its success, however, will depend on decisions made by city authorities about road space, since cargo bikes need wide, well-maintained cycle lanes, as well as on whether delivery companies are willing to change systems built entirely around vans. Some companies have already committed to using bikes for most deliveries in certain city centres, and their experience will be closely watched by the rest of the industry.</p>" },
        ],
        questionGroups: [
          {
            id: 't32-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 14, promptHtml: 'Cargo bikes became less common after motor vans became cheaper.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "As motor vans became cheaper ... these cargo bikes largely disappeared."' },
              { number: 15, promptHtml: 'The last mile is the cheapest part of the delivery process.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: it is "the most expensive and inefficient part".' },
              { number: 16, promptHtml: 'Most parcels are currently delivered by electric vans.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "most of them by diesel vans".' },
              { number: 17, promptHtml: 'Electric cargo bikes can carry more than 100 kilograms.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 3: "loads of well over a hundred kilograms".' },
              { number: 18, promptHtml: 'The London study found that bikes were slower than vans.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: "the bikes delivered parcels more quickly on average".' },
              { number: 19, promptHtml: 'Cargo bike riders earn more than van drivers.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 5 mentions concerns about pay but gives no comparison.' },
              { number: 20, promptHtml: 'Some parents use cargo bikes to take their children to school.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 6: "by parents taking children to school".' },
            ],
          },
          {
            id: 't32-r2-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-K, below.',
            bank: [
              { key: 'A', text: 'often block roads and cycle lanes.' },
              { key: 'B', text: 'work best near a depot in dense areas.' },
              { key: 'C', text: 'must pay a charge in some zones.' },
              { key: 'D', text: 'fell by around ninety per cent.' },
              { key: 'E', text: 'are where parcels move from lorries to bikes.' },
              { key: 'F', text: 'help businesses to buy cargo bikes.' },
              { key: 'G', text: 'were used mainly by farmers.' },
              { key: 'H', text: 'will replace all vans within ten years.' },
              { key: 'I', text: 'are cheaper to build than car parks.' },
              { key: 'J', text: 'increased the price of parcels.' },
              { key: 'K', text: 'can only be used in summer.' },
            ],
            questions: [
              { number: 21, promptHtml: 'Vans parked while drivers deliver parcels', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 2: they are "blocking roads and cycle lanes".' },
              { number: 22, promptHtml: 'In the London study, carbon emissions', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 4: "carbon emissions fell by around ninety per cent".' },
              { number: 23, promptHtml: 'Because of their limited range, cargo bikes', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "they work best in dense urban areas close to a depot".' },
              { number: 24, promptHtml: 'Micro-hubs', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 5: "where parcels can be transferred from lorries to bikes".' },
              { number: 25, promptHtml: 'Grants from some cities', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph 6: "grants to help businesses buy cargo bikes".' },
              { number: 26, promptHtml: 'Diesel vans', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 6: "low-emission zones in which diesel vans must pay a charge".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'The wisdom of crowds',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>For more than a century, crowds have had a bad reputation. In 1895, the French writer Gustave Le Bon published an influential book arguing that when people gather in large groups, they lose their individual judgement and become irrational, emotional and easily led. A person in a crowd, he claimed, 'descends several rungs in the ladder of civilisation'. His ideas were widely accepted, and they shaped the way authorities thought about crowds, and the way police responded to them, for much of the twentieth century.</p>" },
          { label: '', html: "<p>In recent decades, however, psychologists have challenged this view. One of the most influential alternatives, developed by the social psychologist Stephen Reicher and colleagues, argues that people in crowds do not lose their identity but take on a shared social identity with others in the group. Their behaviour is therefore not random but guided by the norms and values of the group. A crowd of peaceful protesters, for example, may police itself, discouraging members who try to cause trouble. Reicher's early work examined disturbances in British cities in the 1980s and found that even during apparent riots, the targets of violence were highly selective: participants attacked symbols of authority they saw as hostile, but left alone local shops and homes that they identified with. Such behaviour, he argued, could hardly be described as mindless.</p>" },
          { label: '', html: "<p>This has important implications for how crowds are managed. The psychologist Clifford Stott studied football supporters travelling to international tournaments. He found that when police treated all fans as potential troublemakers, using force against the whole crowd, peaceful fans began to identify with the minority who were causing trouble, and violence increased. When police instead took a friendly, low-profile approach and dealt only with individuals who broke the law, the crowd itself tended to isolate troublemakers. His research has influenced policing strategies in several countries.</p>" },
          { label: '', html: "<p>The same insights apply in emergencies. It is often assumed that people panic in disasters, pushing others aside to escape. Research by the psychologist John Drury, who interviewed survivors of bombings, fires and other emergencies, suggests that this is rare. In most cases, strangers helped one another, sharing information and assisting the injured, even at risk to themselves. Drury argues that the shared experience of danger creates a sense of common identity, which encourages cooperation rather than selfishness.</p>" },
          { label: '', html: "<p>This does not mean that crowds are never dangerous. Many of the worst crowd disasters have been caused not by panic or bad behaviour but by simple physics. When the density of people rises above a certain level, individuals can no longer control their movements, and pressure can build up to the point where people are crushed. Crowd safety experts such as Keith Still argue that disasters of this kind are almost always the result of poor planning, such as too few exits, rather than of the crowd itself. Blaming victims for 'panicking', he suggests, distracts attention from the real causes.</p>" },
          { label: '', html: "<p>There is also a more positive sense in which crowds can be wise. When large numbers of people independently estimate a quantity, such as the weight of an animal at a country fair, the average of their guesses is often remarkably accurate, sometimes more accurate than the estimate of any individual expert. This effect only works, however, when people make their judgements independently; if they are influenced by one another, errors tend to be multiplied rather than cancelled out. This helps to explain why financial markets sometimes behave wisely and at other times swing wildly, as investors copy each other's decisions instead of making their own independent judgements.</p>" },
          { label: '', html: "<p>Taken together, this research suggests that Le Bon's picture of the crowd as a mindless mob was largely mistaken. Crowds are made up of people who think and act, usually sensibly, and who are strongly influenced by the way they are treated. Understanding this is not only of academic interest; it can save lives. Event organisers, police forces and architects increasingly draw on this research, designing spaces with enough room for people to move freely, communicating clearly with crowds rather than simply controlling them, and treating those who attend large events as partners in keeping everyone safe.</p>" },
        ],
        questionGroups: [
          {
            id: 't32-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 27, promptHtml: 'According to the first paragraph, Le Bon\'s ideas', options: [{ key: 'A', text: 'were rejected by the police.' }, { key: 'B', text: 'affected the way crowds were managed.' }, { key: 'C', text: 'were based on careful experiments.' }, { key: 'D', text: 'were published after his death.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 1: they "shaped the way authorities thought about crowds, and the way police responded to them".' },
              { number: 28, promptHtml: 'What happens to the \'wisdom of crowds\' when people influence each other?', options: [{ key: 'A', text: 'Their estimates become more accurate.' }, { key: 'B', text: 'Errors become larger.' }, { key: 'C', text: 'They agree more quickly.' }, { key: 'D', text: 'Experts become more reliable.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 6: "errors tend to be multiplied rather than cancelled out".' },
              { number: 29, promptHtml: 'What is the writer\'s conclusion?', options: [{ key: 'A', text: 'Crowds should be avoided whenever possible.' }, { key: 'B', text: 'Le Bon was right about most crowds.' }, { key: 'C', text: 'Crowds generally behave sensibly.' }, { key: 'D', text: 'Crowd research has no practical value.' }], answer: { accepted: ['C'] }, explanationHtml: 'Final paragraph: people in crowds "think and act, usually sensibly".' },
            ],
          },
          {
            id: 't32-r3-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-J, below.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'identity' },
              { key: 'B', text: 'force' },
              { key: 'C', text: 'density' },
              { key: 'D', text: 'panic' },
              { key: 'E', text: 'planning' },
              { key: 'F', text: 'exits' },
              { key: 'G', text: 'cooperation' },
              { key: 'H', text: 'leaders' },
              { key: 'I', text: 'rules' },
              { key: 'J', text: 'weather' },
            ],
            stemHtml:
              '<p><strong>Crowds and safety</strong></p><p>Research suggests that people in crowds share a social {{q30}}. When police use {{q31}} against everyone, violence may increase. In emergencies, people rarely {{q32}}; instead, shared danger encourages {{q33}}. Serious crowd disasters are usually caused by high {{q34}} and poor planning.</p>',
            questions: [
              { number: 30, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 2: "take on a shared social identity".' },
              { number: 31, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "using force against the whole crowd".' },
              { number: 32, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 4: panic "is rare".' },
              { number: 33, answer: { accepted: ['G'] }, explanationHtml: 'Paragraph 4: shared danger "encourages cooperation rather than selfishness".' },
              { number: 34, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: "When the density of people rises above a certain level".' },
            ],
          },
          {
            id: 't32-r3-people',
            type: 'matching_features',
            instructionHtml: 'Look at the following statements and the list of people below. Match each statement with the correct person, <strong>A-E</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Gustave Le Bon' },
              { key: 'B', text: 'Stephen Reicher' },
              { key: 'C', text: 'Clifford Stott' },
              { key: 'D', text: 'John Drury' },
              { key: 'E', text: 'Keith Still' },
            ],
            questions: [
              { number: 35, promptHtml: 'People in crowds help strangers during emergencies.', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 4: Drury found "strangers helped one another".' },
              { number: 36, promptHtml: 'Individuals in crowds become less rational.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 1: Le Bon argued people "become irrational, emotional and easily led".' },
              { number: 37, promptHtml: 'A friendly approach by police can help crowds control troublemakers themselves.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: Stott found "the crowd itself tended to isolate troublemakers".' },
              { number: 38, promptHtml: 'Crowd disasters are usually caused by poor organisation.', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 5: Still argues they are "the result of poor planning".' },
              { number: 39, promptHtml: 'Crowds are guided by the values of the group.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: Reicher\'s view that behaviour is "guided by the norms and values of the group".' },
              { number: 40, promptHtml: 'Blaming victims hides the true causes of disasters.', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 5: "Blaming victims ... distracts attention from the real causes."' },
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
        contextText: 'You will hear a man registering his bicycle with a police bicycle-marking scheme.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Hello, welcome to the bike marking stall. Would you like to register your bike?" },
          { speaker: 'B', voice: 'david', text: "Yes, please. I had a bike stolen last year, so I want to make sure I can get this one back if it happens again." },
          { speaker: 'A', voice: 'zira', text: "Good idea. We'll mark it with a code and put it on the national database. Could I have your name?" },
          { speaker: 'B', voice: 'david', text: "It's Oliver Grant." },
          { speaker: 'A', voice: 'zira', text: "And your address?" },
          { speaker: 'B', voice: 'david', text: "14 Albert Terrace, Southgate." },
          { speaker: 'A', voice: 'zira', text: "Thank you. What make is the bike?" },
          { speaker: 'B', voice: 'david', text: "It's a Raleigh. A hybrid, fairly new." },
          { speaker: 'A', voice: 'zira', text: "And what colour would you call it?" },
          { speaker: 'B', voice: 'david', text: "Dark blue, with a white stripe." },
          { speaker: 'A', voice: 'zira', text: "Any distinguishing features?" },
          { speaker: 'B', voice: 'david', text: "It's got a child seat on the back, for my daughter." },
          { speaker: 'A', voice: 'zira', text: "That's helpful. And roughly how much is it worth?" },
          { speaker: 'B', voice: 'david', text: "I paid about four hundred and fifty pounds for it." },
          { speaker: 'A', voice: 'zira', text: "OK. Now, a few questions for our survey. Where do you usually leave your bike during the day?" },
          { speaker: 'B', voice: 'david', text: "At the railway station. I cycle there and get the train to work." },
          { speaker: 'A', voice: 'zira', text: "What kind of lock do you use?" },
          { speaker: 'B', voice: 'david', text: "A D-lock. I used to have a cable lock, but that's how the last bike was stolen." },
          { speaker: 'A', voice: 'zira', text: "Very sensible. And how did you hear about today's event?" },
          { speaker: 'B', voice: 'david', text: "There was a notice in the local newspaper." },
          { speaker: 'A', voice: 'zira', text: "And when would you like us to send you a reminder to check your details are up to date?" },
          { speaker: 'B', voice: 'david', text: "Once a year is fine. Maybe in January." },
        ],
        questionGroups: [
          {
            id: 't32-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Bicycle Registration</strong></p><p><em>Example:</em> Owner: Oliver Grant</p>' +
              '<p>Address: {{q1}}, Southgate<br/>Make: {{q2}}<br/>Type: hybrid<br/>Colour: {{q3}} with a white stripe<br/>Special feature: a {{q4}} on the back<br/>Value: £{{q5}}<br/>Reason for registering: previous bike was {{q6}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['14 albert terrace'] }, explanationHtml: '"14 Albert Terrace, Southgate."' },
              { number: 2, answer: { accepted: ['raleigh'] }, explanationHtml: '"It\'s a Raleigh."' },
              { number: 3, answer: { accepted: ['dark blue'] }, explanationHtml: '"Dark blue, with a white stripe."' },
              { number: 4, answer: { accepted: ['child seat'] }, explanationHtml: '"It\'s got a child seat on the back".' },
              { number: 5, answer: { accepted: ['450'] }, explanationHtml: '"about four hundred and fifty pounds".' },
              { number: 6, answer: { accepted: ['stolen'] }, explanationHtml: '"I had a bike stolen last year".' },
            ],
          },
          {
            id: 't32-l1-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 7, promptHtml: 'Where does the man usually leave his bike?', answer: { accepted: ['railway station', 'the station', 'station'] }, explanationHtml: '"At the railway station."' },
              { number: 8, promptHtml: 'What type of lock does he use now?', answer: { accepted: ['d-lock', 'a d-lock', 'd lock'] }, explanationHtml: '"A D-lock."' },
              { number: 9, promptHtml: 'Where did he learn about the event?', answer: { accepted: ['local newspaper', 'newspaper', 'a newspaper'] }, explanationHtml: '"There was a notice in the local newspaper."' },
              { number: 10, promptHtml: 'In which month would he like a reminder?', answer: { accepted: ['january'] }, explanationHtml: '"Maybe in January."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a guide leading a walking tour of a redeveloped harbour area.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Welcome, everyone, to Portside Quay. I'm Sam, and I'll be showing you around the new harbour area this morning." },
          { speaker: 'A', voice: 'david', text: "This is a walking tour, so I hope you're wearing comfortable shoes. We'll be walking for about ninety minutes." },
          { speaker: 'A', voice: 'david', text: "For more than two hundred years, this was a busy commercial port. The buildings you can see were originally warehouses, used for storing goods such as grain and wool. When the port closed in the nineteen seventies, the area was abandoned for many years." },
          { speaker: 'A', voice: 'david', text: "When plans for redevelopment were announced, local people wanted the area to be used for leisure, rather than for expensive apartments, and in the end, that's mostly what happened." },
          { speaker: 'A', voice: 'david', text: "Now, let me show you the plan. We're standing by the bus station, at the top. In front of us, the park is on the left, and beyond it, on the waterfront, is the fish market, which is still used by local fishermen every morning." },
          { speaker: 'A', voice: 'david', text: "The building in the middle of the waterfront, directly in front of us, is the maritime museum. It's in the largest of the old warehouses." },
          { speaker: 'A', voice: 'david', text: "To the right of the museum, in the eastern warehouse, is the new arts centre, with a cinema and a theatre." },
          { speaker: 'A', voice: 'david', text: "And the jetty you can see going out into the harbour, in front of the arts centre, is where the ferry leaves for the islands." },
          { speaker: 'A', voice: 'david', text: "There are three areas I'd particularly recommend. In the museum, there's a gallery about the history of shipbuilding, with a full-size wooden boat that you can climb aboard." },
          { speaker: 'A', voice: 'david', text: "The park has a new children's playground built in the shape of a ship, and the most popular activity there is the water fountains in summer." },
          { speaker: 'A', voice: 'david', text: "And the arts centre has a rooftop terrace with views across the harbour, which is a great place to watch the sunset." },
        ],
        questionGroups: [
          {
            id: 't32-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'How long will the walking tour last?', options: [{ key: 'A', text: 'one hour' }, { key: 'B', text: 'ninety minutes' }, { key: 'C', text: 'two hours' }], answer: { accepted: ['B'] }, explanationHtml: '"We\'ll be walking for about ninety minutes."' },
              { number: 12, promptHtml: 'What were the buildings originally used for?', options: [{ key: 'A', text: 'building ships' }, { key: 'B', text: 'storing goods' }, { key: 'C', text: 'housing workers' }], answer: { accepted: ['B'] }, explanationHtml: '"The buildings ... were originally warehouses, used for storing goods".' },
              { number: 13, promptHtml: 'When did the port close?', options: [{ key: 'A', text: 'in the 1950s' }, { key: 'B', text: 'in the 1970s' }, { key: 'C', text: 'in the 1990s' }], answer: { accepted: ['B'] }, explanationHtml: '"When the port closed in the nineteen seventies".' },
              { number: 14, promptHtml: 'What did local people want the area to be used for?', options: [{ key: 'A', text: 'leisure' }, { key: 'B', text: 'apartments' }, { key: 'C', text: 'offices' }], answer: { accepted: ['A'] }, explanationHtml: '"local people wanted the area to be used for leisure".' },
            ],
          },
          {
            id: 't32-l2-plan',
            type: 'diagram_label',
            instructionHtml: 'Label the plan below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: HARBOUR_PLAN,
            imageAlt: 'Plan of a harbour area: the bus station is at the top centre with a park to its left; along the waterfront are the fish market on the left and two unlabelled buildings in the middle and on the right; a jetty extends into the harbour in front of the right-hand building.',
            imageHotspots: [
              { questionNumber: 15, x: 50, y: 47 },
              { questionNumber: 16, x: 80, y: 47 },
              { questionNumber: 17, x: 80, y: 80 },
            ],
            questions: [
              { number: 15, answer: { accepted: ['maritime museum', 'museum'] }, explanationHtml: '"The building in the middle of the waterfront ... is the maritime museum."' },
              { number: 16, answer: { accepted: ['arts centre', 'art centre'] }, explanationHtml: '"To the right of the museum ... is the new arts centre".' },
              { number: 17, answer: { accepted: ['ferry', 'the ferry'] }, explanationHtml: '"the jetty ... is where the ferry leaves for the islands".' },
            ],
          },
          {
            id: 't32-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Place', 'Recommended feature'],
              [
                ['Museum', 'gallery about {{q18}}'],
                ['Park', 'playground with {{q19}} in summer'],
                ['Arts centre', 'a rooftop {{q20}}'],
              ]
            ),
            questions: [
              { number: 18, answer: { accepted: ['shipbuilding'] }, explanationHtml: '"a gallery about the history of shipbuilding".' },
              { number: 19, answer: { accepted: ['water fountains', 'fountains'] }, explanationHtml: '"the most popular activity there is the water fountains in summer".' },
              { number: 20, answer: { accepted: ['terrace'] }, explanationHtml: '"a rooftop terrace with views across the harbour".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two marketing students, Leah and Tom, planning a survey for an assignment.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Tom, we need to plan the survey for our marketing assignment. It's about why students choose particular coffee shops, isn't it?" },
          { speaker: 'B', voice: 'david', text: "That's right. The tutor said the questionnaire shouldn't take more than ten minutes to complete." },
          { speaker: 'A', voice: 'zira', text: "And we need at least eighty responses for the results to be reliable." },
          { speaker: 'B', voice: 'david', text: "OK. Let's decide what to include. Price, obviously." },
          { speaker: 'A', voice: 'zira', text: "Definitely. That's the most important factor for most students." },
          { speaker: 'B', voice: 'david', text: "What about the atmosphere, like the music and the furniture?" },
          { speaker: 'A', voice: 'zira', text: "Maybe. It depends on how long the questionnaire is. Let's decide later." },
          { speaker: 'B', voice: 'david', text: "And whether they have Wi-Fi and places to plug in laptops?" },
          { speaker: 'A', voice: 'zira', text: "Yes, that's essential. Students use coffee shops as places to study." },
          { speaker: 'B', voice: 'david', text: "And the brand? Whether people prefer big chains or independent cafés?" },
          { speaker: 'A', voice: 'zira', text: "I think that's too complicated for this assignment. Let's leave it out." },
          { speaker: 'B', voice: 'david', text: "Fair enough. Now, what information do we need for the background section?" },
          { speaker: 'A', voice: 'zira', text: "We need to know how many coffee shops there are near the campus. We could get that from the city council website." },
          { speaker: 'B', voice: 'david', text: "And the national figures on coffee consumption, we can find those in a market research report in the library." },
          { speaker: 'A', voice: 'zira', text: "And for student spending, the Students' Union did a survey last year. We can ask them for it." },
          { speaker: 'B', voice: 'david', text: "And for the graphs, we'll use the university's statistics software." },
        ],
        questionGroups: [
          {
            id: 't32-l3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            questions: [
              { number: 21, promptHtml: 'The questionnaire should take no more than {{q21}} minutes.', answer: { accepted: ['10', 'ten'] }, explanationHtml: '"shouldn\'t take more than ten minutes".' },
              { number: 22, promptHtml: 'The students need at least {{q22}} responses.', answer: { accepted: ['80', 'eighty'] }, explanationHtml: '"we need at least eighty responses".' },
            ],
          },
          {
            id: 't32-l3-topics',
            type: 'matching_features',
            instructionHtml: 'What do the students decide about each topic for the questionnaire? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'They will definitely include this topic.' },
              { key: 'B', text: 'They might include this topic.' },
              { key: 'C', text: 'They will not include this topic.' },
            ],
            questions: [
              { number: 23, promptHtml: 'price', answer: { accepted: ['A'] }, explanationHtml: '"Definitely."' },
              { number: 24, promptHtml: 'atmosphere', answer: { accepted: ['B'] }, explanationHtml: '"Maybe ... Let\'s decide later."' },
              { number: 25, promptHtml: 'Wi-Fi and power sockets', answer: { accepted: ['A'] }, explanationHtml: '"Yes, that\'s essential."' },
              { number: 26, promptHtml: 'brand preference', answer: { accepted: ['C'] }, explanationHtml: '"Let\'s leave it out."' },
            ],
          },
          {
            id: 't32-l3-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Information', 'Source'],
              [
                ['number of coffee shops near campus', 'the council {{q27}}'],
                ['national coffee consumption', 'a market research report in the {{q28}}'],
                ['student spending', 'a survey by the {{q29}}'],
                ['graphs', 'the university\'s {{q30}}'],
              ]
            ),
            questions: [
              { number: 27, answer: { accepted: ['website'] }, explanationHtml: '"from the city council website".' },
              { number: 28, answer: { accepted: ['library'] }, explanationHtml: '"a market research report in the library".' },
              { number: 29, answer: { accepted: ["students' union", 'students union', 'student union'] }, explanationHtml: '"the Students\' Union did a survey last year".' },
              { number: 30, answer: { accepted: ['statistics software', 'software'] }, explanationHtml: '"we\'ll use the university\'s statistics software".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about chilli peppers.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today's lecture is about chilli peppers, and in particular about the substance that makes them hot." },
          { speaker: 'A', voice: 'david', text: "Chillies originated in the Americas, and they were domesticated in what is now Mexico around six thousand years ago. After Europeans reached the Americas at the end of the fifteenth century, Portuguese and Spanish traders carried chillies around the world with remarkable speed. Within a century, they had become a central ingredient in the cooking of India, Thailand and many other countries, where it's now hard to imagine food without them." },
          { speaker: 'A', voice: 'david', text: "The heat of chillies comes from a chemical called capsaicin. Capsaicin doesn't actually raise the temperature of the mouth. Instead, it activates the nerve receptors that normally detect heat, so the brain is tricked into thinking the mouth is burning." },
          { speaker: 'A', voice: 'david', text: "In 1912, an American pharmacist devised a scale to measure the heat of chillies. Originally, it relied on a panel of tasters who diluted a chilli extract with sugar water until they could no longer detect any heat. Today the measurement is done using laboratory equipment, but the scale still carries his name." },
          { speaker: 'A', voice: 'david', text: "Why do chillies produce capsaicin? The most likely explanation involves the animals that eat their fruit. Mammals, which chew the seeds and destroy them, are put off by the heat. Birds, on the other hand, don't have the receptors that respond to capsaicin, so they can eat the fruit without discomfort. And because birds swallow the seeds whole, they spread them over long distances, which helps the plant." },
          { speaker: 'A', voice: 'david', text: "Capsaicin also has medical uses. Because repeated exposure makes the nerve endings less sensitive, it's used in creams that relieve certain kinds of pain." },
          { speaker: 'A', voice: 'david', text: "Finally, a practical tip. If you've eaten a chilli that's too hot, water won't help much, because capsaicin doesn't dissolve in water. Milk is much more effective, because it contains a protein that breaks down the capsaicin." },
        ],
        questionGroups: [
          {
            id: 't32-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'Where were chillies first domesticated?', options: [{ key: 'A', text: 'India' }, { key: 'B', text: 'Mexico' }, { key: 'C', text: 'Portugal' }], answer: { accepted: ['B'] }, explanationHtml: '"domesticated in what is now Mexico".' },
              { number: 32, promptHtml: 'What does the lecturer say about the spread of chillies?', options: [{ key: 'A', text: 'It happened very quickly.' }, { key: 'B', text: 'It took several thousand years.' }, { key: 'C', text: 'It was limited to Europe.' }], answer: { accepted: ['A'] }, explanationHtml: '"carried chillies around the world with remarkable speed".' },
              { number: 33, promptHtml: 'How does capsaicin produce a burning feeling?', options: [{ key: 'A', text: 'It raises the temperature of the mouth.' }, { key: 'B', text: 'It damages the tongue.' }, { key: 'C', text: 'It activates heat receptors.' }], answer: { accepted: ['C'] }, explanationHtml: '"it activates the nerve receptors that normally detect heat".' },
            ],
          },
          {
            id: 't32-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Chilli peppers</strong></p>' +
              '<p>• the heat scale was devised by an American {{q34}}<br/>• tasters diluted chilli extract with {{q35}}<br/>• today, heat is measured with {{q36}}</p>' +
              '<p><em>Why chillies are hot</em><br/>• mammals destroy the {{q37}}, so they are put off<br/>• birds swallow seeds whole and {{q38}} them</p>' +
              '<p><em>Other points</em><br/>• capsaicin is used in creams to relieve {{q39}}<br/>• {{q40}} is better than water for reducing heat</p>',
            questions: [
              { number: 34, answer: { accepted: ['pharmacist'] }, explanationHtml: '"an American pharmacist devised a scale".' },
              { number: 35, answer: { accepted: ['sugar water'] }, explanationHtml: '"diluted a chilli extract with sugar water".' },
              { number: 36, answer: { accepted: ['laboratory equipment'] }, explanationHtml: '"the measurement is done using laboratory equipment".' },
              { number: 37, answer: { accepted: ['seeds'] }, explanationHtml: '"Mammals, which chew the seeds and destroy them".' },
              { number: 38, answer: { accepted: ['spread'] }, explanationHtml: '"they spread them over long distances".' },
              { number: 39, answer: { accepted: ['pain'] }, explanationHtml: '"creams that relieve certain kinds of pain".' },
              { number: 40, answer: { accepted: ['milk'] }, explanationHtml: '"Milk is much more effective".' },
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
        '<p>The graph below shows the number of visitors to three national parks in one country between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'Visitors to national parks, 2000-2020 (thousands)',
        unit: 'thousand',
        categories: ['2000', '2004', '2008', '2012', '2016', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Visitors (thousands)',
        series: [
          { name: 'Park A', data: [450, 480, 520, 610, 700, 520] },
          { name: 'Park B', data: [300, 290, 310, 305, 330, 280] },
          { name: 'Park C', data: [120, 160, 230, 320, 410, 390] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people believe that governments should spend more money on preventing illness, for example by promoting healthy lifestyles, than on treating people who are already ill.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
