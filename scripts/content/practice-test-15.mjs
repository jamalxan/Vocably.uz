// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE follows a standard Academic test
// layout; every topic, passage, transcript, question and answer is written from scratch.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION, svgDataUri, q, paras, mc, bank } from './_html.mjs';

const TOWN_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#eef1e8"/>
  <text x="215" y="22" font-weight="bold" fill="#333">Town centre: Ashby</text>
  <rect x="30" y="190" width="540" height="20" fill="#c9c2b0"/>
  <text x="440" y="205" fill="#444" font-size="12">High Street</text>
  <rect x="100" y="210" width="20" height="120" fill="#c9c2b0"/>
  <text x="125" y="290" fill="#444" font-size="12">Station Road</text>
  <rect x="40" y="330" width="140" height="50" fill="#cfd8dc" stroke="#78909c"/>
  <text x="62" y="360" fill="#37474f">Railway station</text>
  <rect x="250" y="220" width="100" height="80" fill="#d7e7cf" stroke="#7aa56c"/>
  <text x="262" y="265" fill="#2f5a25">Market Square</text>
  <rect x="130" y="100" width="90" height="80" fill="#f7f7f2" stroke="#999" stroke-dasharray="4"/>
  <rect x="250" y="100" width="100" height="80" fill="#f7f7f2" stroke="#999" stroke-dasharray="4"/>
  <rect x="380" y="100" width="90" height="80" fill="#f7f7f2" stroke="#999" stroke-dasharray="4"/>
  <rect x="380" y="220" width="90" height="80" fill="#f7f7f2" stroke="#999" stroke-dasharray="4"/>
  <rect x="20" y="230" width="70" height="70" fill="#f7f7f2" stroke="#999" stroke-dasharray="4"/>
  <path d="M570 60 L570 35 M562 45 L570 32 L578 45" stroke="#333" stroke-width="2" fill="none"/>
  <text x="565" y="75" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-15',
  title: 'Vocably Practice Test 15',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Cities on the water',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: paras(
          ['A', `As sea levels rise and coastal populations grow, a growing number of architects and engineers are asking a question that would once have seemed fanciful: could cities float? In one sense, people have always lived on the water. On Lake Titicaca, in the Andes, the Uros people have built islands from layers of reeds for centuries, and when the reeds at the bottom rot, they simply add more on top. In Lagos, the Makoko community lives in houses on stilts above a lagoon, moving between them in canoes. In Benin, the lake village of Ganvie has been home to thousands of people since the eighteenth century. These communities show that life on the water is possible, but they are small, poor and often at risk, and the idea of a modern floating city is a much more ambitious one.`],
          ['B', `The modern idea gained momentum in 2019, when a United Nations agency held a roundtable discussion on the subject, and since then several companies have published designs. Prototypes already exist on a small scale. In Amsterdam, a district of floating homes has been built on a lake, with families living in houses that rise and fall with the water. In Rotterdam, a floating dairy farm, where cows are kept on a platform in a harbour, supplies milk to the city's shops with hardly any transport. These projects are modest, but they show that floating buildings can be comfortable and practical, and that they can be connected to the electricity and sewage systems of a city on land.`],
          ['C', `The engineering principles are simple but demanding. A floating platform is usually made of concrete or steel, filled with air or foam so that it displaces enough water to support its weight and that of the buildings on it. The platforms are held in place not by rigid connections, which would snap in a storm, but by flexible moorings that allow them to rise and fall with the tide and the waves. The designs proposed for larger communities consist of modular units, often hexagonal in shape, that can be joined together, rearranged or towed away. Electricity would come from solar panels, drinking water from rainwater collection and desalination, and food from gardens and fish farms on the platforms, with waste recycled on board.`],
          ['D', `Supporters list many advantages. The most obvious is that floating buildings rise with the water and so cannot be flooded, which makes them a natural response to rising seas. They also allow cities to expand without the land reclamation that has destroyed so much of the marine life along the world's coasts, because the seabed below a floating structure is left intact. Floating districts can be built in a factory and towed into place, which is quicker than building on land, and they can be moved if the needs of a community change. Some planners also see in them a way to house people who would otherwise be forced to leave low-lying countries.`],
          ['E', `The obstacles are also considerable. The costs are far higher than those of building on land, and because cities on the water would lie outside the area controlled by any one country, there are difficult legal questions about who would own and govern them. Storms and large waves pose dangers that no design can entirely remove. Critics also worry about social equality: several plans that have been announced are for luxury developments, and they fear that floating cities would become enclaves for the wealthy, rather than solutions for the millions of people who are most at risk from rising seas. Plans for a floating city in the Maldives, which is threatened by the ocean, have attracted attention, but have so far not gone beyond the design stage.`],
          ['F', `In my judgement, floating cities are neither the fantasy their critics claim nor the solution their promoters suggest. They are unlikely to replace cities on land, which would be far too expensive to duplicate. But as a way of adding homes, workplaces and farms to low-lying coastal cities such as Rotterdam, which have little space to grow and a great deal of water to manage, they make a good deal of sense. The most realistic future is probably one in which floating districts are a modest, but useful, extension of existing cities, rather than an entire new kind of settlement.`]
        ),
        questionGroups: [
          {
            id: 't15-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'The Uros people of Lake Titicaca live on', ['houses on stilts', 'islands made of reeds', 'concrete platforms', 'boats'], 'B', 'Paragraph A: "islands from layers of reeds".', 'A'),
              mc(2, 'What is distinctive about the floating farm in Rotterdam?', ['It grows vegetables in the sea.', 'It keeps cows on a platform in a harbour.', 'It is powered by wind.', 'It sells milk abroad.'], 'B', 'Paragraph B: "cows are kept on a platform in a harbour".', 'B'),
              mc(3, 'How are floating platforms kept in place?', ['by rigid connections to the sea bed', 'by flexible moorings', 'by engines', 'by heavy stones'], 'B', 'Paragraph C: "flexible moorings that allow them to rise and fall".', 'C'),
              mc(4, 'What is the writer\'s view of floating cities?', ['They will replace cities on land.', 'They are a fantasy.', 'They are a useful but modest extension of existing cities.', 'They should only be built for the wealthy.'], 'C', 'Paragraph F: "a modest, but useful, extension of existing cities".', 'F'),
            ],
          },
          {
            id: 't15-r1-sentences',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              q(5, 'In 2019, a United Nations agency held a {{q5}} discussion about floating cities.', ['roundtable'], 'Paragraph B: "a roundtable discussion".', 'B'),
              q(6, 'Floating platforms are usually made of concrete or {{q6}}.', ['steel'], 'Paragraph C: "concrete or steel".', 'C'),
              q(7, 'Electricity would come from {{q7}} panels.', ['solar'], 'Paragraph C: "solar panels".', 'C'),
              q(8, 'Floating cities avoid the land {{q8}} that has destroyed marine life.', ['reclamation'], 'Paragraph D: "land reclamation".', 'D'),
              q(9, 'Some critics fear that floating cities would become {{q9}} for the wealthy.', ['enclaves'], 'Paragraph E: "enclaves for the wealthy".', 'E'),
            ],
          },
          {
            id: 't15-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'The Makoko community is located in Lagos.', 'TRUE', 'Paragraph A: "In Lagos, the Makoko community".', 'A'),
              q(11, 'Floating homes have already been built in Amsterdam.', 'TRUE', 'Paragraph B: "In Amsterdam, a district of floating homes has been built".', 'B'),
              q(12, 'Floating cities would be unaffected by storms.', 'FALSE', 'Paragraph E: "Storms and large waves pose dangers that no design can entirely remove."', 'E'),
              q(13, 'Construction of a floating city in the Maldives has started.', 'FALSE', 'Paragraph E: the plans "have so far not gone beyond the design stage".', 'E'),
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Is English breaking apart?',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: paras(
          ['A', `About one and a half billion people speak English, and most of them are not native speakers. It is the language of air traffic control, of international science and of much of the internet, and it is spoken in hundreds of different accents and dialects, some of which are barely intelligible to others. This diversity has led some people to predict that English will eventually divide into separate languages, just as Latin did, and that our descendants will need translators to talk to each other. Linguists tend to be sceptical, but the question is a good way of examining how languages change.`],
          ['B', `The Latin parallel is often cited. After the Roman Empire collapsed, its spoken Latin developed differently in different regions, and over several centuries it turned into French, Spanish, Italian, Portuguese and Romanian. But the circumstances were very different. In the early Middle Ages, most people never travelled more than a few kilometres from their birthplace, and there were no newspapers, no schools for ordinary people and no means of hearing a speaker from another region. Today, hundreds of millions of people watch the same films, read the same websites and use the same phones, and a teenager in Manchester may talk to a friend in Mumbai every day. The forces that pull a language apart are much weaker than those that hold it together.`],
          ['C', `That does not mean that English is uniform. Wherever it has taken root, it has developed a local character. In India, speakers use words like "prepone", which means to bring an appointment forward, the opposite of postpone, and which does not exist in British English. In Singapore, a colourful mixture known as Singlish combines English with elements of Chinese, Malay and Tamil, with its own grammar and expressions. In Nigeria, English is enriched by words and rhythms from local languages. Linguists refer to these as World Englishes, and most of them take the view that each is a legitimate variety with its own rules, rather than a corrupted form of a British or American original.`],
          ['D', `Another important force is the way in which English is used. Most conversations in English today do not involve a native speaker at all; they take place between people from different countries who use it as a common language, such as a Brazilian engineer and a Korean customer. Researchers who study this use have found that such speakers do not try to imitate native speakers, but develop their own simplified style: they drop the final "s" from verbs, use fewer idioms and often avoid the most difficult sounds. The result is not a broken English but an efficient one, and it is hard to see how it would lead to the creation of new languages, since its whole purpose is to be understood by others.`],
          ['E', `Technology pulls in two directions. Spelling and grammar checkers, translation programs and voice assistants tend to push users towards a single standard, because they have been designed around it. At the same time, social media allows new words and expressions to spread across the world in a matter of weeks, so that a joke that begins in one country may become part of everyday speech in another. The effect is to increase contact between varieties rather than to isolate them, and to make speakers more familiar with forms of English that differ from their own.`],
          ['F', `Every generation of speakers has complained that the language is in decline. Critics in the eighteenth century disliked the new fashion for shortening words, and in the nineteenth, a number of writers deplored the arrival of American expressions. Modern linguists take a different view: change is a natural feature of living languages, and Shakespeare's English, which seems rich and elegant to us, sounded strange to people who had known the language only a few generations earlier. The worry today often takes the form of complaints about the influence of texting or the spread of simplified forms, but there is no evidence that these have made English less expressive.`],
          ['G', `The most likely future, therefore, is not a division into separate languages but a flexible system, in which speakers move between local and international forms depending on whom they are talking to, as many people already do. A woman in Lagos may speak one way with her family, another with colleagues and a third with customers overseas, and this ability to switch, known as code-switching, is a mark of skill, not of confusion. English may well continue to change, but it is unlikely to fall apart.`]
        ),
        questionGroups: [
          {
            id: 't15-r2-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for paragraphs B-G from the list of headings below.<br/><em>Example: Paragraph A — ix</em>',
            bank: [
              { key: 'i', text: 'Local varieties that have developed their own character' },
              { key: 'ii', text: 'A historical parallel and why it may not apply' },
              { key: 'iii', text: 'The cost of learning English' },
              { key: 'iv', text: 'A flexible future' },
              { key: 'v', text: 'Communication between people who are not native speakers' },
              { key: 'vi', text: 'The spread of English by empire' },
              { key: 'vii', text: 'Persistent fears about decline' },
              { key: 'viii', text: 'Ways of teaching pronunciation' },
              { key: 'ix', text: 'A widely spoken language and a prediction' },
              { key: 'x', text: 'Forces of standardisation and contact in technology' },
            ],
            questions: [
              q(14, 'Paragraph B', 'ii', 'Paragraph B compares English with Latin and explains why circumstances differ.', 'B'),
              q(15, 'Paragraph C', 'i', 'Paragraph C: Indian English, Singlish and Nigerian English.', 'C'),
              q(16, 'Paragraph D', 'v', 'Paragraph D: conversations between people from different countries who use English as a common language.', 'D'),
              q(17, 'Paragraph E', 'x', 'Paragraph E: spelling checkers and social media.', 'E'),
              q(18, 'Paragraph F', 'vii', 'Paragraph F: "Every generation of speakers has complained that the language is in decline."', 'F'),
              q(19, 'Paragraph G', 'iv', 'Paragraph G: "a flexible system".', 'G'),
            ],
          },
          {
            id: 't15-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              q(20, 'English is likely to divide into separate languages in the way that Latin did.', 'NO', 'Paragraph G: "it is unlikely to fall apart".', 'G'),
              q(21, 'Modern communications make it less likely that English will split.', 'YES', 'Paragraph B: "The forces that pull a language apart are much weaker than those that hold it together."', 'B'),
              q(22, '"Prepone" is an incorrect word that Indian speakers ought to avoid.', 'NO', 'Paragraph C: each variety is "a legitimate variety".', 'C'),
              q(23, 'Most conversations in English today involve at least one native speaker.', 'NO', 'Paragraph D: "do not involve a native speaker at all".', 'D'),
              q(24, 'Simplified forms of English are a sign that the language is becoming less expressive.', 'NO', 'Paragraph F: "no evidence that these have made English less expressive".', 'F'),
              q(25, 'Social media can spread new words around the world very quickly.', 'YES', 'Paragraph E: "in a matter of weeks".', 'E'),
              q(26, 'Examination boards should stop setting a standard for English.', 'NOT GIVEN', 'Examination boards are not mentioned.'),
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Sharks: the misunderstood predators',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: paras(
          ['A', `The mere sight of a dorsal fin in the water is enough to frighten many swimmers. The reality is that fewer than ten people are killed by sharks each year worldwide, less than the number who die from being struck by falling coconuts or from minor accidents in the bath. The toll in the opposite direction is staggering. Estimates suggest that humans kill as many as a hundred million sharks every year, mainly for their fins and as accidental catch in fishing nets, and populations of many species have fallen by more than half in a few decades. There are more than five hundred species of shark, and they are much more varied than their reputation suggests.`],
          ['B', `The great white shark, which is the source of most people's fears, can grow to six metres in length and is one of the most powerful predators in the ocean. It hunts seals and sea lions by approaching from beneath, at depth, and then rising at speed to strike, sometimes leaping clear of the water in the process. Unlike most fish, it is partly warm-blooded, which allows it to keep its muscles at a high temperature and swim in cold water. Yet great whites do not hunt people; most of the bites on record appear to be exploratory, made by a shark that has mistaken a swimmer or surfer for its usual prey, and that loses interest after the first mouthful.`],
          ['C', `The largest fish in the world is also a shark, and one of the most harmless. The whale shark can reach twelve metres in length, but it feeds on plankton and other small organisms, which it filters from the water as it cruises slowly along with its enormous mouth open. Divers swim alongside these gentle animals in places where they gather, and their spotted patterns, which are unique to each individual, allow scientists to identify them from photographs and to follow their journeys across the oceans.`],
          ['D', `The hammerhead looks like no other fish, with its flattened head extending sideways into two broad lobes. The shape seems to be a remarkable adaptation for hunting. The wide spacing of the eyes gives the shark an unusually wide field of view, and the underside of the head carries a large number of tiny pores that detect the faint electrical fields produced by other animals. A hammerhead can sweep its head over the sea bed like a metal detector and locate a stingray, its favourite prey, buried in the sand.`],
          ['E', `The bull shark is perhaps the most dangerous to people, not because it is the largest but because of where it lives. Unlike most sharks, it can tolerate fresh water, and has been found hundreds of kilometres up rivers, including the Mississippi and the Amazon. It often hunts in shallow, murky water close to shore, where people swim, and is responsible for a large share of attacks in tropical regions. Its aggressive temperament and strong build, together with this habit of living near people, make it a real hazard, though even here, the risk to any individual is very small.`],
          ['F', `Sharks matter far more than their numbers suggest, because they are apex predators, at the top of the marine food web, and they help to keep the whole system in balance. The consequences of removing them were shown on the east coast of the United States, where overfishing reduced the populations of large sharks. The rays that the sharks had once eaten multiplied, and they consumed so many scallops that a long-established scallop fishery collapsed. Similar chains of effects have been recorded in coral reefs and kelp forests, and ecologists warn that removing a top predator can cause changes that nobody predicts.`],
          ['G', `The greatest single threat is the demand for shark fin soup, a dish traditionally served at celebrations in parts of Asia. Fishermen catch sharks, cut off their fins and often throw the bodies back into the sea, a practice known as finning, which is now banned in many countries. Conservationists have had some success in reducing demand, and several nations have created protected areas where sharks cannot be caught. Economists have also pointed out that, for communities that depend on tourism, a living shark is far more valuable than a dead one, since divers will pay large sums to swim with sharks, and diving tourism now generates hundreds of millions of dollars a year.`]
        ),
        questionGroups: [
          {
            id: 't15-r3-classify',
            type: 'matching_features',
            instructionHtml: 'Look at the following statements (Questions 27-32) and the list of sharks below. Match each statement with the correct shark, <strong>A, B, C or D</strong>.<br/>You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'great white shark' },
              { key: 'B', text: 'whale shark' },
              { key: 'C', text: 'hammerhead shark' },
              { key: 'D', text: 'bull shark' },
            ],
            questions: [
              q(27, 'feeds mainly on plankton', 'B', 'Paragraph C: "feeds on plankton".', 'C'),
              q(28, 'can travel far up rivers', 'D', 'Paragraph E: "hundreds of kilometres up rivers".', 'E'),
              q(29, 'detects electrical signals from prey buried in sand', 'C', 'Paragraph D: "detect the faint electrical fields ... a stingray ... buried in the sand".', 'D'),
              q(30, 'attacks its prey from below', 'A', 'Paragraph B: "approaching from beneath".', 'B'),
              q(31, 'is the largest fish in the world', 'B', 'Paragraph C: "The largest fish in the world".', 'C'),
              q(32, 'is responsible for many attacks in shallow tropical water', 'D', 'Paragraph E: "a large share of attacks in tropical regions".', 'E'),
            ],
          },
          {
            id: 't15-r3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary of paragraph F below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: '<p>Sharks are apex predators that keep the marine food web in {{q33}}. When large sharks were overfished on the east coast of the United States, the number of {{q34}} rose, and they ate so many {{q35}} that the fishery {{q36}}.</p>',
            questions: [
              q(33, null, ['balance'], 'Paragraph F: "keep the whole system in balance".', 'F'),
              q(34, null, ['rays'], 'Paragraph F: "The rays ... multiplied".', 'F'),
              q(35, null, ['scallops'], 'Paragraph F: "consumed so many scallops".', 'F'),
              q(36, null, ['collapsed'], 'Paragraph F: "a long-established scallop fishery collapsed".', 'F'),
            ],
          },
          {
            id: 't15-r3-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            questions: [
              q(37, 'How many people are killed by sharks each year worldwide?', ['fewer than ten', 'less than ten'], 'Paragraph A: "fewer than ten people".', 'A'),
              q(38, 'What traditional dish creates the greatest demand for shark fins?', ['shark fin soup'], 'Paragraph G: "shark fin soup".', 'G'),
              q(39, 'What name is given to cutting off a shark\'s fins and throwing the body back?', ['finning'], 'Paragraph G: "a practice known as finning".', 'G'),
              q(40, 'What kind of tourism makes a living shark more valuable than a dead one?', ['diving tourism', 'diving'], 'Paragraph G: "diving tourism now generates hundreds of millions of dollars".', 'G'),
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
        contextText: 'You will hear a man phoning a taxi company to arrange an airport transfer.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Metro Cars, good evening." },
          { speaker: 'B', voice: 'david', text: "Good evening. I'd like to book a taxi to the airport for next week, please." },
          { speaker: 'A', voice: 'zira', text: "Certainly. What date would you like?" },
          { speaker: 'B', voice: 'david', text: "Thursday the ninth of May. My flight leaves at ten past seven in the morning, so I need to be at the airport by five." },
          { speaker: 'A', voice: 'zira', text: "Then the taxi should collect you at four, as it takes about forty minutes at that time. Where from?" },
          { speaker: 'B', voice: 'david', text: "From my home: forty-one Beechwood Avenue. That's B-E-E-C-H-W-O-O-D." },
          { speaker: 'A', voice: 'zira', text: "And your name?" },
          { speaker: 'B', voice: 'david', text: "Ian Gallagher, G-A-L-L-A-G-H-E-R." },
          { speaker: 'A', voice: 'zira', text: "How many passengers?" },
          { speaker: 'B', voice: 'david', text: "Two, myself and my wife, and we've got three large suitcases." },
          { speaker: 'A', voice: 'zira', text: "Then we'd better send the estate car rather than a saloon, because it has a bigger boot. The price is forty-five pounds, which includes the airport parking fee." },
          { speaker: 'B', voice: 'david', text: "That's fine. Can I pay by card?" },
          { speaker: 'A', voice: 'zira', text: "Yes, to the driver, or in advance online, which is five per cent cheaper." },
          { speaker: 'B', voice: 'david', text: "I'll pay in advance. And could we book a return journey as well? We come back on the twenty-third." },
          { speaker: 'A', voice: 'zira', text: "Of course. What time does your flight arrive?" },
          { speaker: 'B', voice: 'david', text: "At twenty to eleven in the evening, Terminal Two." },
          { speaker: 'A', voice: 'zira', text: "The driver will meet you at the arrivals hall, holding a sign with your name. If your flight is delayed, we monitor it, so there's no need to phone us." },
          { speaker: 'B', voice: 'david', text: "That's very helpful. Could you send a confirmation by email?" },
          { speaker: 'A', voice: 'zira', text: "Certainly. What's your email address?" },
          { speaker: 'B', voice: 'david', text: "It's i-gallagher at fastmail dot com." },
        ],
        questionGroups: [
          {
            id: 't15-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Metro Cars: Booking form', ''],
              [
                ['Date of outward journey', '{{q1}} May'],
                ['Flight departs at', '{{q2}} a.m.'],
                ['Pick-up time', '{{q3}} a.m.'],
                ['Address', '41 {{q4}} Avenue'],
                ['Surname', '{{q5}}'],
                ['Passengers', '{{q6}}'],
                ['Type of car', '{{q7}}'],
                ['Price', '£{{q8}}'],
                ['Return flight arrives at', '{{q9}} p.m.'],
                ['Return terminal', 'Terminal {{q10}}'],
              ]
            ),
            questions: [
              q(1, null, ['9', 'ninth', '9th'], '"Thursday the ninth of May".'),
              q(2, null, ['7.10', '7:10', 'ten past seven', 'seven ten'], '"ten past seven in the morning".'),
              q(3, null, ['4', 'four', '4.00', '4:00'], '"the taxi should collect you at four".'),
              q(4, null, ['beechwood'], '"Beechwood Avenue".'),
              q(5, null, ['gallagher'], 'Spelled out: G-A-L-L-A-G-H-E-R.'),
              q(6, null, ['2', 'two'], '"Two, myself and my wife".'),
              q(7, null, ['estate', 'estate car'], '"we\'d better send the estate car".'),
              q(8, null, ['45', 'forty-five', 'forty five'], '"forty-five pounds".'),
              q(9, null, ['10.40', '10:40', 'twenty to eleven', 'ten forty'], '"twenty to eleven in the evening".'),
              q(10, null, ['2', 'two'], '"Terminal Two".'),
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a tourist information officer giving directions to visitors arriving at the railway station in the town of Ashby.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Welcome to Ashby. I'm Sue, from the tourist information office, and I'd like to tell you how to find your way around the town centre. It's small, and you can see most of it in an afternoon." },
          { speaker: 'A', voice: 'zira', text: "We're at the railway station, at the bottom left of the map. Leave the station and walk up Station Road, going north, to the junction with High Street. The road runs straight, so you can't get lost." },
          { speaker: 'A', voice: 'zira', text: "On Station Road, just before you reach High Street, on the left-hand side, is the pharmacy, which is handy if you've forgotten anything. It's open until eight every evening." },
          { speaker: 'A', voice: 'zira', text: "When you reach High Street, turn right, heading east. On the left, on the north side of the street, the first building you'll see is the post office, which is also the place to buy stamps and to change foreign money." },
          { speaker: 'A', voice: 'zira', text: "Continue along the street, and in the centre of the north side, opposite Market Square, is the town hall, a fine Victorian building. Its doors are open to the public, and there's a small exhibition on the history of the town in the entrance hall." },
          { speaker: 'A', voice: 'zira', text: "Next to the town hall, on the right-hand side of the north side of the street, is the museum. It contains a collection of objects found locally, from Roman coins to old farm tools, and it's free." },
          { speaker: 'A', voice: 'zira', text: "On the south side of the street, you'll see Market Square, where there's a market every Wednesday and Saturday. And just past the square, on the east side, is the library, which has free internet access if you need to check your email." },
          { speaker: 'A', voice: 'zira', text: "Now a few practical details. The museum is open from ten until four, from Tuesday to Saturday. The library closes at five thirty, but it's shut on Sundays. Banks are open from nine until half past four on weekdays." },
          { speaker: 'A', voice: 'zira', text: "If you'd like to eat, there are several cafés around Market Square, and a restaurant above the library that serves a good lunch. And if you'd like a guided walk, we run one every Saturday morning, at half past ten from the town hall steps, for four pounds." },
          { speaker: 'A', voice: 'zira', text: "I hope you enjoy your visit, and please call in at the office if you need any more information." },
        ],
        questionGroups: [
          {
            id: 't15-l2-map',
            type: 'map_label',
            instructionHtml: 'Label the map below. Choose the correct answer, <strong>A-H</strong>, for each numbered place (Questions 11-15).',
            imageUrl: TOWN_MAP,
            imageAlt: 'Map of the centre of a town: a railway station in the south-west; Station Road running north to High Street; Market Square on the south side of High Street in the centre; five unlabelled buildings: three on the north side of High Street (west, centre and east), one on the south side east of Market Square, and one beside Station Road near the station.',
            bank: bank(['Library', 'Museum', 'Bank', 'Post office', 'Pharmacy', 'Bakery', 'Town hall', 'Cinema']),
            imageHotspots: [
              { questionNumber: 11, x: 29, y: 35 },
              { questionNumber: 12, x: 50, y: 35 },
              { questionNumber: 13, x: 71, y: 35 },
              { questionNumber: 14, x: 71, y: 65 },
              { questionNumber: 15, x: 9, y: 66 },
            ],
            questions: [
              q(11, null, 'D', '"the first building you\'ll see is the post office".'),
              q(12, null, 'G', '"in the centre of the north side, opposite Market Square, is the town hall".'),
              q(13, null, 'B', '"Next to the town hall ... is the museum".'),
              q(14, null, 'A', '"just past the square, on the east side, is the library".'),
              q(15, null, 'E', '"on Station Road ... on the left-hand side, is the pharmacy".'),
            ],
          },
          {
            id: 't15-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>Information</strong></p><p>• pharmacy open until {{q16}} p.m.<br/>• post office also offers foreign {{q17}}<br/>• market in Market Square every Wednesday and {{q18}}<br/>• museum open 10 a.m. to {{q19}} p.m., Tuesday to Saturday<br/>• guided walk on Saturdays costs £{{q20}}</p>',
            questions: [
              q(16, null, ['8', 'eight'], '"It\'s open until eight every evening."'),
              q(17, null, ['money', 'currency'], '"to change foreign money".'),
              q(18, null, ['saturday'], '"every Wednesday and Saturday".'),
              q(19, null, ['4', 'four'], '"open from ten until four".'),
              q(20, null, ['4', 'four'], '"for four pounds".'),
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Nadia and Tom, discussing a documentary film they have watched for a media studies course.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "So, Tom, what did you think of the documentary?" },
          { speaker: 'B', voice: 'david', text: "I found it fascinating, particularly the first half, about the fishing community. The filmmaker lived there for a year, and you could tell that people trusted her." },
          { speaker: 'A', voice: 'zira', text: "I agree, but I thought the second half lost its way. There were too many interviews with experts, and they explained things that the footage had already shown." },
          { speaker: 'B', voice: 'david', text: "Perhaps. I liked the experts, though. They gave the context that the villagers couldn't." },
          { speaker: 'A', voice: 'zira', text: "What about the music? I thought it was too dramatic. It told you how to feel, instead of letting you decide." },
          { speaker: 'B', voice: 'david', text: "I noticed it, too, but only in the final scene. Before that, I barely noticed it." },
          { speaker: 'A', voice: 'zira', text: "What was your impression of the ending?" },
          { speaker: 'B', voice: 'david', text: "I found it moving. The last shot of the boat heading out in the dark was a perfect image." },
          { speaker: 'A', voice: 'zira', text: "It was beautiful, but it also seemed a bit staged to me. I wondered whether the boat really went out at that time, or whether they had asked the fishermen to do it again for the camera." },
          { speaker: 'B', voice: 'david', text: "That's a good question, and it's actually the topic we've been asked to write about: how far a documentary should intervene in the events it films." },
          { speaker: 'A', voice: 'zira', text: "Right. My view is that some intervention is unavoidable, because the presence of a camera changes behaviour anyway." },
          { speaker: 'B', voice: 'david', text: "I'd go further. I think directors are entitled to arrange scenes, provided that they tell the audience. It's deception that's the problem, not the arrangement." },
          { speaker: 'A', voice: 'zira', text: "I'm not sure. Once viewers know that some scenes are arranged, they might doubt the rest." },
          { speaker: 'B', voice: 'david', text: "Fair point. Shall we divide the essay? You take the history of the genre, and I'll look at modern examples." },
          { speaker: 'A', voice: 'zira', text: "Fine, and we can write the conclusion together. The deadline's the third of March, and it's two thousand words each." },
          { speaker: 'B', voice: 'david', text: "Great. Let's meet on Friday in the library to compare notes." },
        ],
        questionGroups: [
          {
            id: 't15-l3-match',
            type: 'matching_features',
            instructionHtml: 'Who expresses each opinion? Choose the correct answer and write the correct letter, <strong>A, B or C</strong>, next to Questions 21-26.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Nadia' },
              { key: 'B', text: 'Tom' },
              { key: 'C', text: 'both Nadia and Tom' },
            ],
            questions: [
              q(21, 'The first half of the film was the most interesting.', 'C', 'Tom: "particularly the first half"; Nadia: "I agree, but ... the second half lost its way".'),
              q(22, 'The second half had too many interviews.', 'A', 'Nadia: "too many interviews with experts".'),
              q(23, 'The experts provided useful context.', 'B', 'Tom: "They gave the context that the villagers couldn\'t."'),
              q(24, 'The music was too dramatic.', 'A', 'Nadia: "I thought it was too dramatic."'),
              q(25, 'The last shot was beautiful.', 'C', 'Tom: "a perfect image"; Nadia: "It was beautiful".'),
              q(26, 'Directors may arrange scenes, provided that they tell the audience.', 'B', 'Tom: "directors are entitled to arrange scenes, provided that they tell the audience".'),
            ],
          },
          {
            id: 't15-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>Essay plan</strong></p><p>• topic: how far a documentary should {{q27}} in the events it films<br/>• Nadia will write about the history of the {{q28}}<br/>• Tom will look at modern {{q29}}<br/>• the {{q30}} will be written together</p>',
            questions: [
              q(27, null, ['intervene', 'interfere'], '"how far a documentary should intervene in the events it films".'),
              q(28, null, ['genre'], '"You take the history of the genre".'),
              q(29, null, ['examples'], '"I\'ll look at modern examples".'),
              q(30, null, ['conclusion'], '"we can write the conclusion together".'),
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about how the steel frame changed the skyscraper.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Until the late nineteenth century, tall buildings were limited by one simple fact: the walls had to carry the weight of the building. The higher the building, the thicker the walls at the bottom, until there was hardly any room left inside. The tallest buildings of this type, in the eighteen-nineties, were about sixteen storeys, and their ground-floor walls were two metres thick." },
          { speaker: 'A', voice: 'david', text: "Two developments changed this. The first was the steel frame, in which a skeleton of steel beams and columns carries the weight, and the walls merely hang from it, like curtains. The first building to rely on a frame of this kind was built in Chicago in eighteen eighty-five, and had ten storeys, though it was later raised to twelve." },
          { speaker: 'A', voice: 'david', text: "Steel was ideal. It is strong in both tension and compression, it is much lighter than stone or brick for the same strength, and the parts can be made in a factory and assembled quickly on site. Some buildings rose at a rate of a floor every few days." },
          { speaker: 'A', voice: 'david', text: "The second development was the safety lift. In eighteen fifty-four, an American inventor named Elisha Otis demonstrated a lift with a device that would catch the platform if the rope broke. He famously stood on the platform at a public exhibition while an assistant cut the rope, and the platform dropped only a few centimetres. After that, people trusted lifts." },
          { speaker: 'A', voice: 'david', text: "With these two technologies in place, buildings grew rapidly. The Woolworth Building in New York, completed in nineteen-thirteen, had fifty-seven floors, and in nineteen thirty-one, the Empire State Building reached a hundred and two. It took only a year and forty-five days to build, which remains an astonishing pace." },
          { speaker: 'A', voice: 'david', text: "Skyscrapers did not just change skylines; they changed the economics of cities. Land in city centres was expensive, and building upwards allowed a large number of offices to occupy a small piece of land. They also encouraged the growth of big companies, which wanted to be in the same place as banks and lawyers." },
          { speaker: 'A', voice: 'david', text: "However, there were concerns. Tall buildings cast long shadows over the streets, blocked the wind, and overloaded the traffic. In nineteen sixteen, New York introduced the world's first zoning rules, which required upper floors to be set back from the street, giving the stepped look of many older skyscrapers." },
          { speaker: 'A', voice: 'david', text: "Today, the tallest buildings, reaching more than eight hundred metres, rely on a central concrete core as well as a steel frame, and on dampers to reduce their swaying. The basic idea of a frame supporting the building, however, is still the same as in the eighteen-eighties." },
        ],
        questionGroups: [
          {
            id: 't15-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>The skyscraper</strong></p><p><em>Before the steel frame</em><br/>• the {{q31}} had to carry the weight of the building<br/>• in the 1890s, the highest buildings had about {{q32}} storeys</p><p><em>Steel frame</em><br/>• the first was built in {{q33}} in 1885<br/>• steel is strong in tension and {{q34}}, and much lighter than stone<br/>• parts were made in a {{q35}} and assembled on site</p><p><em>The safety lift</em><br/>• Otis demonstrated a lift in {{q36}}<br/>• a device caught the platform if the {{q37}} broke</p><p><em>Height and effects</em><br/>• Empire State Building (1931) reached {{q38}} floors<br/>• skyscrapers allowed many offices on a small piece of {{q39}}<br/>• in 1916, New York required upper floors to be set {{q40}}</p>',
            questions: [
              q(31, null, ['walls'], '"the walls had to carry the weight of the building".'),
              q(32, null, ['16', 'sixteen'], '"about sixteen storeys".'),
              q(33, null, ['chicago'], '"built in Chicago in eighteen eighty-five".'),
              q(34, null, ['compression'], '"strong in both tension and compression".'),
              q(35, null, ['factory'], '"made in a factory".'),
              q(36, null, ['1854'], '"In eighteen fifty-four".'),
              q(37, null, ['rope'], '"if the rope broke".'),
              q(38, null, ['102', 'a hundred and two', 'one hundred and two'], '"reached a hundred and two".'),
              q(39, null, ['land'], '"a small piece of land".'),
              q(40, null, ['back'], '"set back from the street".'),
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
        '<p>The pie charts below show the share of electricity generated from different sources in a country in 1990 and in 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'pie',
        title: 'Electricity generation by source, 2020 (%)',
        unit: '%',
        categories: ['Natural gas', 'Wind', 'Solar', 'Nuclear', 'Coal', 'Hydro'],
        series: [{ name: 'Share of electricity', data: [34, 22, 11, 16, 9, 8] }],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>English is increasingly used as a common language across the world. Some people think this is a positive development, while others believe it threatens local languages.</p><p>Discuss both views and give your own opinion.</p>',
    },
  },
};
