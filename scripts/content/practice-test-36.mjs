// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { svgDataUri, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

const CASTLE_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#eef4e4"/>
  <text x="215" y="22" font-weight="bold" fill="#333">Rowan Castle — grounds</text>
  <rect x="240" y="140" width="120" height="100" fill="#b0a58a" stroke="#5d4037" stroke-width="3"/>
  <text x="275" y="195" fill="#3e2723" font-weight="bold">Castle</text>
  <path d="M300 380 L300 240" stroke="#c2a878" stroke-width="12"/>
  <path d="M60 300 L540 300" stroke="#c2a878" stroke-width="10"/>
  <path d="M300 140 L300 60" stroke="#c2a878" stroke-width="8"/>
  <rect x="270" y="380" width="60" height="14" fill="#555"/>
  <text x="340" y="394" fill="#333">Main gate</text>
  <rect x="190" y="320" width="80" height="45" fill="#e7e1d3" stroke="#999"/>
  <rect x="330" y="320" width="80" height="45" fill="#e7e1d3" stroke="#999"/>
  <rect x="40" y="230" width="100" height="55" fill="#e7e1d3" stroke="#999"/>
  <rect x="460" y="230" width="100" height="55" fill="#e7e1d3" stroke="#999"/>
  <rect x="60" y="60" width="120" height="80" fill="#c5e1a5" stroke="#7cb342"/>
  <rect x="420" y="60" width="120" height="80" fill="#c5e1a5" stroke="#7cb342"/>
  <rect x="250" y="35" width="100" height="30" fill="#e7e1d3" stroke="#999"/>
  <ellipse cx="480" cy="360" rx="50" ry="22" fill="#bcd9ee" stroke="#6f9fc4"/>
  <text x="465" y="365" fill="#2c5d80">Pond</text>
  <path d="M560 60 L560 35 M552 45 L560 32 L568 45" stroke="#333" stroke-width="2" fill="none"/>
  <text x="555" y="75" fill="#333" font-size="12">N</text>
</svg>`);

const RAIN_GAUGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f7f9fb"/>
  <text x="180" y="24" font-weight="bold" fill="#333">A tipping-bucket rain gauge</text>
  <path d="M200 50 L400 50 L310 130 L290 130 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
  <path d="M300 130 L300 170" stroke="#455a64" stroke-width="4"/>
  <path d="M220 190 L300 220 L380 190 L380 200 L300 232 L220 200 Z" fill="#90caf9" stroke="#1565c0" stroke-width="2"/>
  <circle cx="300" cy="226" r="7" fill="#263238"/>
  <rect x="385" y="205" width="30" height="16" fill="#ef5350" stroke="#b71c1c"/>
  <path d="M415 213 L500 213" stroke="#333" stroke-width="2"/>
  <rect x="500" y="195" width="60" height="36" fill="#eceff1" stroke="#455a64"/>
  <path d="M170 40 L170 340 L430 340 L430 40" stroke="#607d8b" stroke-width="3" fill="none"/>
  <path d="M260 340 L260 380 M340 340 L340 380" stroke="#607d8b" stroke-width="3"/>
  <path d="M290 340 L290 390 L310 390 L310 340" stroke="#1565c0" stroke-width="2" fill="#bbdefb"/>
</svg>`);

export default {
  slug: 'vocably-practice-test-36',
  title: 'Vocably Practice Test 36',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The city that chose the bicycle',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>In many cities, cycling is an activity for enthusiasts: people who wear special clothing, ride expensive bicycles and are prepared to share busy roads with cars and lorries. In Copenhagen, the capital of Denmark, it is simply the normal way to get around. More than forty per cent of all journeys to work or study in the city are made by bicycle, and on an ordinary weekday morning the main cycle lanes are filled with office workers in suits, parents with children in cargo bikes, and elderly people doing their shopping. Visitors often assume that this is part of Danish culture and has always been so. The truth is more interesting.</p>" },
          { label: 'B', html: "<p>In the first half of the twentieth century, cycling was indeed extremely common in Copenhagen, as it was in many European cities, because few people could afford cars. But in the 1950s and 1960s, as incomes rose, car ownership increased rapidly, and the city began to be redesigned around motor traffic. Cycle lanes were removed, and plans were drawn up to build motorways through the centre, including one across a series of lakes near the old city. By the early 1970s, cycling had declined sharply, and the city seemed to be following the same path as others across the world. Road deaths had also risen sharply, and many parents were no longer willing to let their children cycle to school, which further reduced the number of young people who grew up regarding the bicycle as a normal means of transport.</p>" },
          { label: 'C', html: "<p>What changed the direction was a combination of events. The oil crisis of 1973, which caused fuel prices to soar, led the Danish government to introduce 'car-free Sundays' to save petrol, and people who had not ridden a bicycle for years rediscovered it. At the same time, citizens' groups organised large demonstrations demanding safer conditions for cyclists, and opposition grew to the motorway plans, which would have destroyed popular parts of the city. The lakes motorway was never built.</p>" },
          { label: 'D', html: "<p>Over the following decades, the city gradually built one of the best networks of cycle routes in the world. A key principle was that cycle lanes should be physically separated from motor traffic, usually by a raised kerb, rather than simply painted on the road. Traffic lights on major routes were timed to suit the speed of cyclists, so that a rider travelling at around twenty kilometres an hour meets a series of green lights. More recently, the city has built dedicated bridges for cyclists and pedestrians, and 'cycle superhighways' linking the suburbs with the centre. Equally important were the smaller details: footrests at traffic lights so that cyclists can wait without getting off, bins angled so that riders can throw rubbish away without stopping, and generous parking at railway stations. Snow is cleared from the main cycle routes before it is cleared from the roads, a clear signal of the city's priorities.</p>" },
          { label: 'E', html: "<p>The city's planners are clear that people in Copenhagen do not cycle mainly for environmental reasons or to improve their health. When asked why they choose the bicycle, most residents give a much more practical answer: it is the fastest and easiest way to get around. Cycling is quicker than driving for most journeys in the centre, parking is simple, and it costs almost nothing. The lesson that planners draw from this is that if you want people to cycle, you must make cycling the most convenient option, rather than trying to persuade them that it is morally better.</p>" },
          { label: 'F', html: "<p>The benefits to the city have been considerable. Studies suggest that every kilometre cycled rather than driven brings a net gain to society, through reduced healthcare costs, less congestion and cleaner air. The city has also become a model for others: planners from around the world visit to study its methods, and some have begun to speak of 'copenhagenising' their own cities. Copenhagen's experience shows that there is nothing inevitable about the dominance of the car. Cities are shaped by the decisions people make, and those decisions can be changed. Copenhagen's own planners are quick to point out that their city is not finished: congestion on the busiest cycle routes is now a problem in its own right, and the city is widening lanes and building new routes to cope with the growing numbers of riders. Some critics also argue that the city's flat landscape and compact size gave it advantages that hilly or sprawling cities do not share.</p>" },
        ],
        questionGroups: [
          {
            id: 't36-r1-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 1 has six sections, A-F. Choose the correct heading for sections B-F from the list of headings below.<br/><em>Example: Section A — iv</em>',
            bank: [
              { key: 'i', text: 'Convenience rather than conviction' },
              { key: 'ii', text: 'A crisis and a protest movement' },
              { key: 'iii', text: 'Gains for the city and lessons for others' },
              { key: 'v', text: 'A period of decline' },
              { key: 'vi', text: 'The cost of building cycle lanes' },
              { key: 'vii', text: 'Designing a network for bicycles' },
              { key: 'viii', text: 'Why cycling is dangerous in winter' },
              { key: 'ix', text: 'The role of the national government' },
            ],
            questions: [
              { number: 1, promptHtml: 'Section B', answer: { accepted: ['v'] }, explanationHtml: 'Section B: car ownership increased and "cycling had declined sharply".', locatorParagraph: 'B' },
              { number: 2, promptHtml: 'Section C', answer: { accepted: ['ii'] }, explanationHtml: 'Section C: the oil crisis of 1973 and demonstrations by citizens\' groups.', locatorParagraph: 'C' },
              { number: 3, promptHtml: 'Section D', answer: { accepted: ['vii'] }, explanationHtml: 'Section D: separated lanes, timed lights, bridges and superhighways.', locatorParagraph: 'D' },
              { number: 4, promptHtml: 'Section E', answer: { accepted: ['i'] }, explanationHtml: 'Section E: people cycle because "it is the fastest and easiest way to get around", not for environmental or moral reasons.', locatorParagraph: 'E' },
              { number: 5, promptHtml: 'Section F', answer: { accepted: ['iii'] }, explanationHtml: 'Section F: benefits to society and planners visiting from around the world.', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't36-r1-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 6, promptHtml: 'Cycling has always been popular in Copenhagen without interruption.', answer: { accepted: ['NO'] }, explanationHtml: 'Section B: "By the early 1970s, cycling had declined sharply".', locatorParagraph: 'B' },
              { number: 7, promptHtml: 'Painted cycle lanes are as safe as lanes separated by a kerb.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Section D states the principle of physical separation but does not compare safety.', locatorParagraph: 'D' },
              { number: 8, promptHtml: 'Persuading people that cycling is morally better is the most effective approach.', answer: { accepted: ['NO'] }, explanationHtml: 'Section E: "you must make cycling the most convenient option, rather than trying to persuade them that it is morally better".', locatorParagraph: 'E' },
              { number: 9, promptHtml: 'The dominance of the car in cities can be reversed.', answer: { accepted: ['YES'] }, explanationHtml: 'Section F: "there is nothing inevitable about the dominance of the car ... those decisions can be changed".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't36-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 10, promptHtml: 'According to Section A, cyclists in Copenhagen', options: [{ key: 'A', text: 'are mostly young enthusiasts.' }, { key: 'B', text: 'come from a wide range of people.' }, { key: 'C', text: 'usually wear special clothing.' }, { key: 'D', text: 'ride mainly at weekends.' }], answer: { accepted: ['B'] }, explanationHtml: 'Section A: office workers, parents with children, elderly people.' },
              { number: 11, promptHtml: 'What happened to the plan for a motorway across the lakes?', options: [{ key: 'A', text: 'It was completed in the 1970s.' }, { key: 'B', text: 'It was changed to include cycle lanes.' }, { key: 'C', text: 'It was abandoned.' }, { key: 'D', text: 'It was delayed by the oil crisis.' }], answer: { accepted: ['C'] }, explanationHtml: 'Section C: "The lakes motorway was never built."' },
              { number: 12, promptHtml: 'Why are traffic lights timed on major routes?', options: [{ key: 'A', text: 'to reduce the speed of cars' }, { key: 'B', text: 'to let cyclists meet green lights' }, { key: 'C', text: 'to save electricity' }, { key: 'D', text: 'to help pedestrians cross' }], answer: { accepted: ['B'] }, explanationHtml: 'Section D: "a rider travelling at around twenty kilometres an hour meets a series of green lights".' },
              { number: 13, promptHtml: 'What is the main reason residents give for cycling?', options: [{ key: 'A', text: 'to protect the environment' }, { key: 'B', text: 'to improve their health' }, { key: 'C', text: 'because it is quick and easy' }, { key: 'D', text: 'because cars are banned' }], answer: { accepted: ['C'] }, explanationHtml: 'Section E: "it is the fastest and easiest way to get around".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The return of the beaver',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>Four hundred years ago, the Eurasian beaver was hunted to extinction in Britain for its fur, its meat and a substance from its glands that was used in medicine and perfume. Across much of Europe, the story was similar, and by the early twentieth century only a few thousand beavers survived, in small isolated populations. Today, thanks to legal protection and reintroduction programmes, there are more than a million beavers in Europe, and the animal is returning to rivers from which it had been absent for centuries.</p>" },
          { label: '', html: "<p>Beavers are often described as 'ecosystem engineers', because few animals, apart from humans, change their surroundings so dramatically. They fell trees with their powerful teeth, and use the branches, together with mud and stones, to build dams across small streams. The dams create ponds, which protect the entrances to the beavers' homes from predators and allow them to move around safely. Over time, a single family of beavers can transform a narrow stream into a complex wetland of ponds, channels and marshes.</p>" },
          { label: '', html: "<p>These changes have striking effects on other wildlife. Studies at reintroduction sites have found large increases in the number of plant species, insects, amphibians and birds in areas where beavers are active. Dead trees standing in the water provide homes for woodpeckers and bats, while the ponds offer breeding sites for frogs and feeding areas for young fish. In this sense, bringing back one species can help many others to return. Beavers do not eat fish, as is sometimes assumed; they are entirely vegetarian, feeding on bark, leaves and water plants, and they are most active at dusk and during the night, which is why many people living close to them never actually see one. Their presence is usually revealed by gnawed tree stumps with a distinctive pointed shape.</p>" },
          { label: '', html: "<p>The benefits are not only for wildlife. In one well-studied site in the south-west of England, where beavers were released into an enclosure, researchers measured the flow of water in the stream before and after the dams were built. They found that during heavy rain, the dams slowed the flow of water, reducing peak flows downstream by around a third and lowering the risk of flooding in nearby towns. The ponds also trapped soil and farm fertilisers that would otherwise have been washed into rivers, significantly improving water quality. In dry periods, the stored water was released slowly, helping streams to keep flowing.</p>" },
          { label: '', html: "<p>Not everyone welcomes the beaver's return. Farmers have complained that beaver dams flood valuable fields and that the animals damage trees and crops. Beavers can also block drainage ditches and burrow into riverbanks, weakening them. Some anglers fear that dams prevent fish such as salmon from moving upstream to breed, although most research suggests that fish are generally able to pass beaver dams, particularly when water levels are high. There are also concerns about disease, since beavers can carry parasites, and all animals released in reintroduction projects are therefore carefully tested beforehand.</p>" },
          { label: '', html: "<p>In my view, these concerns are real and must be addressed, but they are not a reason to oppose the return of beavers. In most cases, conflicts can be managed with relatively simple measures: pipes can be installed through dams to control water levels, valuable trees can be protected with wire, and in a small number of cases, beavers can be moved to other locations. Farmers who lose land to flooding should be compensated, and the cost of doing so is modest compared with the savings in flood damage that beavers can provide.</p>" },
          { label: '', html: "<p>The deeper question is what kind of countryside we want. For centuries, rivers in much of Europe have been straightened, drained and controlled, and many people have come to regard this tidy landscape as natural. The beaver reminds us that it is not. A river with beavers is messier, less predictable and harder to manage, but it is also richer, more resilient and, arguably, closer to what nature intended. Learning to share the landscape with an animal that reshapes it may prove to be one of the more valuable lessons of the modern conservation movement. If we can learn to live alongside the beaver, we may find it easier to accept the return of other species that once shared our landscape, and to value the untidy, living rivers that they help to create.</p>" },
        ],
        questionGroups: [
          {
            id: 't36-r2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 14, promptHtml: 'Why did beavers disappear from Britain?', options: [{ key: 'A', text: 'Their habitat was destroyed.' }, { key: 'B', text: 'They were hunted.' }, { key: 'C', text: 'They were killed by disease.' }, { key: 'D', text: 'Rivers became polluted.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 1: "hunted to extinction in Britain".' },
              { number: 15, promptHtml: 'Why are beavers called \'ecosystem engineers\'?', options: [{ key: 'A', text: 'They build homes underground.' }, { key: 'B', text: 'They greatly change their environment.' }, { key: 'C', text: 'They work together in large groups.' }, { key: 'D', text: 'They can be trained by humans.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "few animals ... change their surroundings so dramatically".' },
              { number: 16, promptHtml: 'What did the study in the south-west of England find?', options: [{ key: 'A', text: 'Beaver dams increased flooding downstream.' }, { key: 'B', text: 'Beaver dams had no effect on water flow.' }, { key: 'C', text: 'Beaver dams reduced the highest flows during heavy rain.' }, { key: 'D', text: 'Beaver dams caused streams to dry up.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 4: "reducing peak flows downstream by around a third".' },
              { number: 17, promptHtml: 'What does most research suggest about fish and beaver dams?', options: [{ key: 'A', text: 'Fish cannot pass the dams.' }, { key: 'B', text: 'Fish can usually get past the dams.' }, { key: 'C', text: 'Fish numbers fall where there are dams.' }, { key: 'D', text: 'Fish only live in beaver ponds.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "fish are generally able to pass beaver dams".' },
            ],
          },
          {
            id: 't36-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 18, promptHtml: 'The problems caused by beavers are imaginary.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 6: "these concerns are real and must be addressed".' },
              { number: 19, promptHtml: 'Farmers who lose land because of beavers should receive payment.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 6: "Farmers who lose land to flooding should be compensated".' },
              { number: 20, promptHtml: 'Beavers should be released in city parks.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer does not mention city parks.' },
              { number: 21, promptHtml: 'The controlled rivers of Europe represent a natural landscape.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 7: people regard the tidy landscape as natural, but "The beaver reminds us that it is not."' },
            ],
          },
          {
            id: 't36-r2-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-I, below.',
            bank: [
              { key: 'A', text: 'provide homes for woodpeckers and bats.' },
              { key: 'B', text: 'protect the entrances to beavers\' homes.' },
              { key: 'C', text: 'keep streams flowing in dry weather.' },
              { key: 'D', text: 'can prevent beavers from damaging them.' },
              { key: 'E', text: 'can be used to control the level of water.' },
              { key: 'F', text: 'were used in medicine and perfume.' },
              { key: 'G', text: 'cause fish to die.' },
              { key: 'H', text: 'are mainly found in cities.' },
              { key: 'I', text: 'prevent birds from nesting.' },
            ],
            questions: [
              { number: 22, promptHtml: 'The ponds created by beaver dams', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "The dams create ponds, which protect the entrances to the beavers\' homes".' },
              { number: 23, promptHtml: 'Dead trees standing in the water', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: they "provide homes for woodpeckers and bats".' },
              { number: 24, promptHtml: 'Water released slowly from beaver ponds can', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 4: "helping streams to keep flowing".' },
              { number: 25, promptHtml: 'Pipes installed through dams', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 6: "pipes can be installed through dams to control water levels".' },
              { number: 26, promptHtml: 'Wire around valuable trees', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 6: "valuable trees can be protected with wire".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Measuring the rain',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Rainfall is one of the most important measurements in science. Farmers need to know how much rain has fallen to plan irrigation and harvests; engineers use rainfall records to design drains, bridges and reservoirs; and climate scientists rely on long records to detect changes in weather patterns. Yet measuring rain accurately is surprisingly difficult, and several very different methods are used, each with its own strengths and weaknesses.</p>" },
          { label: '', html: "<p>The simplest and oldest method is the standard rain gauge. Records of rainfall measurement go back more than two thousand years in India, and in Korea, a network of official rain gauges was established in the fifteenth century. The modern standard gauge consists of a funnel that collects rain and directs it into a narrow container, so that small amounts of rainfall can be measured precisely. Once a day, usually at the same time each morning, an observer empties the container into a measuring cylinder and records the total. Standard gauges are cheap, reliable and require no electricity, which makes them ideal for volunteer observers, and thousands of such volunteers around the world contribute daily readings to national weather services. Their main limitation is that they only give a single total for each day, with no information about when during the day the rain fell or how intense it was.</p>" },
          { label: '', html: "<p>For more detailed information, weather services use automatic gauges, the most common of which is the tipping-bucket gauge. Rain collected by a funnel falls into one of two small buckets, which are balanced on a pivot like a seesaw. When one bucket has filled with a fixed, very small amount of water, its weight causes it to tip over, emptying it and bringing the other bucket into position beneath the funnel. Each time the buckets tip, a small magnet attached to them passes a switch, which sends an electrical signal to a recorder. The number of tips shows how much rain has fallen, and the timing of the tips shows its intensity. The water drains away through the base of the gauge. The weakness of this design is that during very heavy rain, some water is lost while the buckets are tipping, so that the gauge tends to underestimate intense rainfall.</p>" },
          { label: '', html: "<p>All gauges share a more fundamental problem: they measure rain at a single point, while rainfall can vary greatly over short distances, especially during summer storms. A heavy shower may drench one village and leave the next one dry. Gauges can also be affected by wind, which blows raindrops across the top of the funnel, and by their surroundings: a gauge placed too close to trees or buildings will catch less rain than it should.</p>" },
          { label: '', html: "<p>Weather radar overcomes the first of these problems. A radar station sends out pulses of microwave energy, which are reflected by raindrops, and measures the strength of the returning signal to estimate how heavily it is raining over a wide area, often up to two hundred kilometres away. Radar images, updated every few minutes, allow forecasters to track storms as they move and to issue warnings of flash floods. However, radar does not measure rain directly: it measures reflections, which must be converted into rainfall using assumptions about the size of raindrops, and it can be confused by hail, snow and even flocks of birds. For this reason, radar estimates are regularly checked against readings from gauges on the ground.</p>" },
          { label: '', html: "<p>Over the oceans and in remote regions where there are few gauges or radar stations, scientists depend on satellites. Some satellites estimate rainfall from the temperature of cloud tops, since the coldest, highest clouds tend to produce the heaviest rain; others carry their own radar or instruments that detect microwave radiation from raindrops. Satellites provide the only truly global picture of rainfall, but their estimates are less precise than those of other methods, particularly for light rain.</p>" },
          { label: '', html: "<p>No single method is perfect, and modern weather services combine all of them. Interestingly, the humble standard gauge, essentially unchanged in design for more than a century, remains the reference against which all the others are measured. Many long-running gauges have been in the same place for more than a century, and their records are among the most valuable evidence we have of how the climate is changing.</p>" },
        ],
        questionGroups: [
          {
            id: 't36-r3-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 27, promptHtml: 'Korea had an official network of rain gauges by the fifteenth century.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: "in Korea, a network of official rain gauges was established in the fifteenth century".' },
              { number: 28, promptHtml: 'Most volunteer observers are retired scientists.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not say who the volunteers are.' },
              { number: 29, promptHtml: 'A gauge placed near trees will record more rain than it should.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: it "will catch less rain than it should".' },
              { number: 30, promptHtml: 'Weather radar can detect rain up to around 200 kilometres away.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 5: "often up to two hundred kilometres away".' },
            ],
          },
          {
            id: 't36-r3-classify',
            type: 'matching_features',
            instructionHtml: 'Classify the following statements as referring to<br/><strong>A</strong> standard rain gauges<br/><strong>B</strong> tipping-bucket gauges<br/><strong>C</strong> weather radar<br/><strong>D</strong> satellites',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'standard rain gauges' },
              { key: 'B', text: 'tipping-bucket gauges' },
              { key: 'C', text: 'weather radar' },
              { key: 'D', text: 'satellites' },
            ],
            questions: [
              { number: 31, promptHtml: 'They may give lower readings than the true amount when rain is very heavy.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "the gauge tends to underestimate intense rainfall".' },
              { number: 32, promptHtml: 'They can be confused by birds.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: radar "can be confused by hail, snow and even flocks of birds".' },
              { number: 33, promptHtml: 'They do not need a power supply.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 2: standard gauges "require no electricity".' },
              { number: 34, promptHtml: 'They are the only method that covers the whole planet.', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 6: "Satellites provide the only truly global picture of rainfall".' },
              { number: 35, promptHtml: 'They are used as the standard for checking other methods.', answer: { accepted: ['A'] }, explanationHtml: 'Final paragraph: "the humble standard gauge remains the reference against which the others are measured".' },
              { number: 36, promptHtml: 'They help forecasters to follow storms as they move.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: radar images "allow forecasters to track storms".' },
            ],
          },
          {
            id: 't36-r3-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: RAIN_GAUGE,
            imageAlt: 'Diagram of a rain gauge: a funnel at the top directs water down onto a pair of balanced containers resting on a central point; a small red block on the side of the containers is next to a box connected by a wire; water leaves through an opening at the bottom of the casing.',
            imageHotspots: [
              { questionNumber: 37, x: 46, y: 53 },
              { questionNumber: 38, x: 53, y: 60 },
              { questionNumber: 39, x: 69, y: 58 },
              { questionNumber: 40, x: 88, y: 58 },
            ],
            questions: [
              { number: 37, answer: { accepted: ['buckets', 'bucket', 'two buckets'] }, explanationHtml: 'Paragraph 3: "falls into one of two small buckets".' },
              { number: 38, answer: { accepted: ['pivot'] }, explanationHtml: 'Paragraph 3: "balanced on a pivot like a seesaw".' },
              { number: 39, answer: { accepted: ['magnet', 'small magnet'] }, explanationHtml: 'Paragraph 3: "a small magnet attached to them".' },
              { number: 40, answer: { accepted: ['switch', 'recorder'] }, explanationHtml: 'Paragraph 3: the magnet "passes a switch, which sends an electrical signal to a recorder".' },
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
        contextText: 'You will hear a man phoning a garage to book his car in for a repair.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, Hillside Garage, Sophie speaking." },
          { speaker: 'B', voice: 'david', text: "Hello. I'd like to book my car in. It's making a strange noise." },
          { speaker: 'A', voice: 'zira', text: "Of course. What make of car is it?" },
          { speaker: 'B', voice: 'david', text: "It's a Renault, a small hatchback, about eight years old." },
          { speaker: 'A', voice: 'zira', text: "And the registration number?" },
          { speaker: 'B', voice: 'david', text: "It's L-M-one-seven, K-W-P." },
          { speaker: 'A', voice: 'zira', text: "Thank you. Can you describe the noise?" },
          { speaker: 'B', voice: 'david', text: "It's a kind of grinding sound, and it happens when I brake. Especially when I'm going downhill." },
          { speaker: 'A', voice: 'zira', text: "It sounds as if the brake pads might need replacing. We'd need to have a look. When would you like to bring it in?" },
          { speaker: 'B', voice: 'david', text: "As soon as possible, really. I need it for work." },
          { speaker: 'A', voice: 'zira', text: "We could do Thursday. Could you bring it in by eight fifteen?" },
          { speaker: 'B', voice: 'david', text: "Yes, that's fine. When would it be ready?" },
          { speaker: 'A', voice: 'zira', text: "Probably by the end of the afternoon, around five." },
          { speaker: 'B', voice: 'david', text: "Is there any way I can get to work? I work about ten miles away." },
          { speaker: 'A', voice: 'zira', text: "We can lend you a courtesy car for the day. There's no charge, but you'll need to bring your driving licence." },
          { speaker: 'B', voice: 'david', text: "That's great. And roughly how much will the repair cost?" },
          { speaker: 'A', voice: 'zira', text: "If it's just the front brake pads, it'll be about ninety pounds, including labour. If the discs need replacing too, it'll be more, but we'll phone you before we do any extra work." },
          { speaker: 'B', voice: 'david', text: "Fine. And while it's with you, could you check the tyres? I think one of them might be a bit low." },
          { speaker: 'A', voice: 'zira', text: "Certainly, we'll check the tyre pressures for free. Can I have your name?" },
          { speaker: 'B', voice: 'david', text: "It's Peter Ashworth. A-S-H-W-O-R-T-H." },
          { speaker: 'A', voice: 'zira', text: "Thank you, Mr Ashworth. We're at 22 Station Road, next to the fire station." },
        ],
        questionGroups: [
          {
            id: 't36-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Hillside Garage — booking</strong></p>' +
              '<p>Car: Renault {{q1}}, about 8 years old<br/>Problem: a {{q2}} noise when braking<br/>Likely cause: the brake {{q3}}</p>' +
              '<p>Day: {{q4}}; bring car by {{q5}}<br/>Ready: about 5 pm<br/>Courtesy car: free, but must bring {{q6}}<br/>Estimated cost: £{{q7}}<br/>Also check: {{q8}}</p>' +
              '<p>Customer name: Peter {{q9}}<br/>Garage address: 22 Station Road, next to the {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['hatchback'] }, explanationHtml: '"It\'s a Renault, a small hatchback".' },
              { number: 2, answer: { accepted: ['grinding'] }, explanationHtml: '"It\'s a kind of grinding sound".' },
              { number: 3, answer: { accepted: ['pads'] }, explanationHtml: '"the brake pads might need replacing".' },
              { number: 4, answer: { accepted: ['thursday'] }, explanationHtml: '"We could do Thursday."' },
              { number: 5, answer: { accepted: ['8.15', '8:15', 'eight fifteen'] }, explanationHtml: '"Could you bring it in by eight fifteen?"' },
              { number: 6, answer: { accepted: ['driving licence', 'licence', 'driving license'] }, explanationHtml: '"you\'ll need to bring your driving licence".' },
              { number: 7, answer: { accepted: ['90', 'ninety'] }, explanationHtml: '"it\'ll be about ninety pounds, including labour".' },
              { number: 8, answer: { accepted: ['tyres', 'tyre pressures', 'the tyres'] }, explanationHtml: '"could you check the tyres?"' },
              { number: 9, answer: { accepted: ['ashworth'] }, explanationHtml: 'Spelled "A-S-H-W-O-R-T-H".' },
              { number: 10, answer: { accepted: ['fire station'] }, explanationHtml: '"next to the fire station".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a guide welcoming visitors to the grounds of a historic castle.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning, everyone, and welcome to Rowan Castle. My name is Colin, and I'm one of the guides here." },
          { speaker: 'A', voice: 'david', text: "The castle was built in the thirteenth century, originally to guard the river crossing, and it was lived in by the same family for over six hundred years. People often assume it was damaged in a war, but in fact the worst damage was caused by a fire in the eighteen hundreds, which destroyed the roof of the great hall." },
          { speaker: 'A', voice: 'david', text: "The castle is now owned by a heritage charity, which has spent the last ten years repairing it. The most recent project was restoring the kitchen gardens, which reopened this spring." },
          { speaker: 'A', voice: 'david', text: "Please note that the castle towers are closed today because of the high winds, although the rest of the castle is open as usual." },
          { speaker: 'A', voice: 'david', text: "Right, let me show you where everything is on the map. We're at the main gate, at the bottom. The path goes straight up to the castle, and there's a path crossing it from west to east." },
          { speaker: 'A', voice: 'david', text: "Just inside the gate, on your left, is the gift shop. And opposite that, on the right of the path, is the tea room, which serves lunches and homemade cakes." },
          { speaker: 'A', voice: 'david', text: "If you follow the cross path to the west, at the far end, just above the path, is the children's play area. At the other end of that path, in the east, is the toilet block." },
          { speaker: 'A', voice: 'david', text: "Now, behind the castle, to the north, there are two gardens. The one in the north-west corner is the herb garden, where the medieval cooks grew plants for cooking and medicine. The one in the north-east corner is the kitchen garden I mentioned, where we grow fruit and vegetables." },
          { speaker: 'A', voice: 'david', text: "The path from the back of the castle leads north to a small building at the very top of the map. That's the falconry centre, where there's a flying display at two o'clock every afternoon. It's the highlight of many people's visit, so do try to see it." },
          { speaker: 'A', voice: 'david', text: "And the pond in the south-east corner is home to a family of ducks, so please don't let children feed them bread; you can buy special duck food in the gift shop." },
        ],
        questionGroups: [
          {
            id: 't36-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'What caused the most serious damage to the castle?', options: [{ key: 'A', text: 'a war' }, { key: 'B', text: 'a fire' }, { key: 'C', text: 'a flood' }], answer: { accepted: ['B'] }, explanationHtml: '"the worst damage was caused by a fire in the eighteen hundreds".' },
              { number: 12, promptHtml: 'What was the most recent restoration project?', options: [{ key: 'A', text: 'the great hall roof' }, { key: 'B', text: 'the towers' }, { key: 'C', text: 'the kitchen gardens' }], answer: { accepted: ['C'] }, explanationHtml: '"The most recent project was restoring the kitchen gardens".' },
              { number: 13, promptHtml: 'Why are the towers closed today?', options: [{ key: 'A', text: 'repair work' }, { key: 'B', text: 'strong winds' }, { key: 'C', text: 'a private event' }], answer: { accepted: ['B'] }, explanationHtml: '"the castle towers are closed today because of the high winds".' },
            ],
          },
          {
            id: 't36-l2-map',
            type: 'map_label',
            instructionHtml: 'Label the map below. Choose the correct answer, <strong>A-H</strong>, for each numbered place.',
            imageUrl: CASTLE_MAP,
            imageAlt: 'Map of castle grounds: the castle is in the centre; a path runs north from the main gate at the bottom to the castle and on to a small building at the top; a path crosses from west to east below the castle; there are unlabelled buildings on each side of the path near the gate and at each end of the cross path, two garden areas in the north-west and north-east, and a pond in the south-east.',
            bank: [
              { key: 'A', text: 'Gift shop' },
              { key: 'B', text: 'Tea room' },
              { key: 'C', text: 'Children\'s play area' },
              { key: 'D', text: 'Toilets' },
              { key: 'E', text: 'Herb garden' },
              { key: 'F', text: 'Kitchen garden' },
              { key: 'G', text: 'Falconry centre' },
              { key: 'H', text: 'Ticket office' },
            ],
            imageHotspots: [
              { questionNumber: 14, x: 38, y: 86 },
              { questionNumber: 15, x: 62, y: 86 },
              { questionNumber: 16, x: 15, y: 64 },
              { questionNumber: 17, x: 85, y: 64 },
              { questionNumber: 18, x: 20, y: 25 },
              { questionNumber: 19, x: 80, y: 25 },
              { questionNumber: 20, x: 50, y: 12 },
            ],
            questions: [
              { number: 14, answer: { accepted: ['A'] }, explanationHtml: '"Just inside the gate, on your left, is the gift shop."' },
              { number: 15, answer: { accepted: ['B'] }, explanationHtml: '"opposite that, on the right of the path, is the tea room".' },
              { number: 16, answer: { accepted: ['C'] }, explanationHtml: '"to the west, at the far end ... is the children\'s play area".' },
              { number: 17, answer: { accepted: ['D'] }, explanationHtml: '"At the other end of that path, in the east, is the toilet block."' },
              { number: 18, answer: { accepted: ['E'] }, explanationHtml: '"The one in the north-west corner is the herb garden".' },
              { number: 19, answer: { accepted: ['F'] }, explanationHtml: '"The one in the north-east corner is the kitchen garden".' },
              { number: 20, answer: { accepted: ['G'] }, explanationHtml: '"a small building at the very top of the map. That\'s the falconry centre".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two part-time students, Rosa and Ahmed, talking about studying on an online course.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Ahmed, how are you finding the online course so far?" },
          { speaker: 'B', voice: 'david', text: "Mostly good. I chose it because I couldn't give up my job, and because I can study at any time, often late at night when the children are asleep. What about you?" },
          { speaker: 'A', voice: 'zira', text: "Similar, really. I live a long way from the university, so travelling there twice a week would have been impossible. And the fees were lower than for the campus course." },
          { speaker: 'B', voice: 'david', text: "What problems have you had?" },
          { speaker: 'A', voice: 'zira', text: "The biggest one is feeling isolated. I miss having other students to talk to. And my internet connection keeps failing during the live seminars, which is really frustrating." },
          { speaker: 'B', voice: 'david', text: "I've found it hard to stay motivated, especially when I'm tired after work. And like you, I miss the social side." },
          { speaker: 'A', voice: 'zira', text: "What do you think of the recorded lectures?" },
          { speaker: 'B', voice: 'david', text: "They're good, but some are far too long. I'd prefer them divided into shorter sections, so I could watch one on the bus." },
          { speaker: 'A', voice: 'zira', text: "I agree. And the tutors? I've found them very quick to reply to emails." },
          { speaker: 'B', voice: 'david', text: "Yes, they're very responsive. Although the feedback on assignments is sometimes a bit brief." },
          { speaker: 'A', voice: 'zira', text: "Actually, I've been thinking we should set up an online study group, to deal with the isolation problem. Would you be interested?" },
          { speaker: 'B', voice: 'david', text: "Definitely. How would we go about it?" },
          { speaker: 'A', voice: 'zira', text: "Well, first, I think we should post a message on the course forum, asking who's interested. Then, once we know how many people there are, we need to agree on a time that suits everyone. That'll be the hardest part, with people working different hours." },
          { speaker: 'B', voice: 'david', text: "We could use an online poll for that." },
          { speaker: 'A', voice: 'zira', text: "Good idea. Then we should decide on some ground rules, such as how long each meeting will last, maybe one hour. And after that, we could choose a different person each week to lead the discussion, so the work is shared." },
          { speaker: 'B', voice: 'david', text: "And we should keep a shared document with notes from each meeting, for anyone who misses one." },
          { speaker: 'A', voice: 'zira', text: "Perfect. I'll post the message tonight." },
        ],
        questionGroups: [
          {
            id: 't36-l3-multi1',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 21,
                promptHtml: 'Which TWO reasons does Rosa give for choosing the online course?',
                options: [
                  { key: 'A', text: 'She could not give up her job.' },
                  { key: 'B', text: 'She lives far from the university.' },
                  { key: 'C', text: 'She prefers studying at night.' },
                  { key: 'D', text: 'It was cheaper.' },
                  { key: 'E', text: 'A friend recommended it.' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"I live a long way from the university" and "the fees were lower than for the campus course". A and C are Ahmed\'s reasons.',
              },
            ],
          },
          {
            id: 't36-l3-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 22,
                promptHtml: 'Which TWO problems has Rosa experienced?',
                options: [
                  { key: 'A', text: 'feeling isolated' },
                  { key: 'B', text: 'lack of motivation' },
                  { key: 'C', text: 'an unreliable internet connection' },
                  { key: 'D', text: 'difficult assignments' },
                  { key: 'E', text: 'high fees' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: '"The biggest one is feeling isolated ... And my internet connection keeps failing". Motivation is Ahmed\'s problem.',
              },
            ],
          },
          {
            id: 't36-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 23, promptHtml: 'What does Ahmed say about the recorded lectures?', options: [{ key: 'A', text: 'Some are too long.' }, { key: 'B', text: 'They are poorly organised.' }, { key: 'C', text: 'They are too difficult.' }], answer: { accepted: ['A'] }, explanationHtml: '"some are far too long".' },
              { number: 24, promptHtml: 'What do they agree about the tutors?', options: [{ key: 'A', text: 'They give detailed feedback.' }, { key: 'B', text: 'They answer emails quickly.' }, { key: 'C', text: 'They are hard to contact.' }], answer: { accepted: ['B'] }, explanationHtml: '"very quick to reply to emails" — "they\'re very responsive".' },
              { number: 25, promptHtml: 'Why does Rosa suggest a study group?', options: [{ key: 'A', text: 'to help with assignments' }, { key: 'B', text: 'to reduce feelings of isolation' }, { key: 'C', text: 'to share the cost of books' }], answer: { accepted: ['B'] }, explanationHtml: '"to deal with the isolation problem".' },
              { number: 26, promptHtml: 'What does Rosa think will be the most difficult part?', options: [{ key: 'A', text: 'finding people who are interested' }, { key: 'B', text: 'finding a suitable time' }, { key: 'C', text: 'choosing a leader' }], answer: { accepted: ['B'] }, explanationHtml: '"agree on a time that suits everyone. That\'ll be the hardest part".' },
            ],
          },
          {
            id: 't36-l3-flow',
            type: 'flowchart_completion',
            instructionHtml: 'Complete the flow-chart below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Setting up an online study group</strong></p>' +
              '<p>Post a message on the course {{q27}}</p><p>↓</p>' +
              '<p>Use an online {{q28}} to agree on a time</p><p>↓</p>' +
              '<p>Set ground rules, e.g. meetings last {{q29}}</p><p>↓</p>' +
              '<p>A different person leads the discussion each week</p><p>↓</p>' +
              '<p>Keep a shared {{q30}} with notes from each meeting</p>',
            questions: [
              { number: 27, answer: { accepted: ['forum'] }, explanationHtml: '"post a message on the course forum".' },
              { number: 28, answer: { accepted: ['poll'] }, explanationHtml: '"We could use an online poll for that."' },
              { number: 29, answer: { accepted: ['one hour', '1 hour', 'an hour'] }, explanationHtml: '"how long each meeting will last, maybe one hour".' },
              { number: 30, answer: { accepted: ['document'] }, explanationHtml: '"keep a shared document with notes".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about different types of volcano.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "In today's geography lecture, I'm going to describe three of the main types of volcano, and then say a little about how scientists monitor them." },
          { speaker: 'A', voice: 'david', text: "The first type is the shield volcano. These are the largest volcanoes on Earth, but they don't look very dramatic, because their slopes are very gentle, rather like a warrior's shield lying on the ground, which is where the name comes from. They're formed by very runny lava, which flows long distances before it cools. Eruptions are usually fairly calm, with lava pouring out rather than exploding. The best-known examples are in Hawaii." },
          { speaker: 'A', voice: 'david', text: "The second type is the cinder cone. These are the smallest type, often only a few hundred metres high, with steep sides and a bowl-shaped crater at the top. They're built from fragments of lava thrown into the air, which cool and fall around the vent. Many cinder cones erupt only once, over a period of a few years, and then never again." },
          { speaker: 'A', voice: 'david', text: "The third type is the stratovolcano, sometimes called a composite volcano. These are the classic cone-shaped mountains that most people imagine when they think of a volcano, such as Mount Fuji in Japan. They're built up from many alternating layers of lava and ash. Their lava is thick and sticky, which means that gas becomes trapped, and pressure builds up, so their eruptions tend to be highly explosive and are the most dangerous to people living nearby." },
          { speaker: 'A', voice: 'david', text: "Now, how do scientists monitor volcanoes? At a volcano observatory I visited last year, the team uses several methods. First, they record small earthquakes. As magma rises, it breaks the surrounding rock, causing many tiny tremors, and an increase in their number is often the first warning sign." },
          { speaker: 'A', voice: 'david', text: "Second, they measure changes in the shape of the ground. Rising magma can make the volcano swell slightly, and this can be detected using satellite measurements accurate to within a few millimetres." },
          { speaker: 'A', voice: 'david', text: "Third, they measure the gases coming out of the volcano, particularly sulphur dioxide. A sudden increase can indicate that fresh magma is approaching the surface." },
          { speaker: 'A', voice: 'david', text: "The scientists told me that the biggest challenge isn't collecting data. It's communicating the risk to the public. If they issue warnings and nothing happens, people may ignore the next warning. So they work closely with local communities, running practice evacuations every year, so that people know exactly what to do." },
        ],
        questionGroups: [
          {
            id: 't36-l4-types',
            type: 'matching_features',
            instructionHtml: 'Which type of volcano has each of the following features? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'shield volcano' },
              { key: 'B', text: 'cinder cone' },
              { key: 'C', text: 'stratovolcano' },
            ],
            questions: [
              { number: 31, promptHtml: 'the largest in size', answer: { accepted: ['A'] }, explanationHtml: '"These are the largest volcanoes on Earth".' },
              { number: 32, promptHtml: 'may only erupt once', answer: { accepted: ['B'] }, explanationHtml: '"Many cinder cones erupt only once".' },
              { number: 33, promptHtml: 'made of alternating layers', answer: { accepted: ['C'] }, explanationHtml: '"built up from many alternating layers of lava and ash".' },
              { number: 34, promptHtml: 'produced by very runny lava', answer: { accepted: ['A'] }, explanationHtml: '"They\'re formed by very runny lava".' },
              { number: 35, promptHtml: 'has a bowl-shaped crater', answer: { accepted: ['B'] }, explanationHtml: '"with steep sides and a bowl-shaped crater at the top".' },
              { number: 36, promptHtml: 'the most dangerous eruptions', answer: { accepted: ['C'] }, explanationHtml: '"their eruptions tend to be highly explosive and are the most dangerous".' },
            ],
          },
          {
            id: 't36-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Monitoring volcanoes</strong></p>' +
              '<p>• an increase in small {{q37}} is often the first warning<br/>• swelling of the ground detected by {{q38}}<br/>• a rise in {{q39}} may show that magma is near the surface<br/>• communities take part in practice {{q40}} every year</p>',
            questions: [
              { number: 37, answer: { accepted: ['earthquakes', 'tremors'] }, explanationHtml: '"they record small earthquakes ... an increase in their number is often the first warning sign".' },
              { number: 38, answer: { accepted: ['satellite measurements', 'satellites'] }, explanationHtml: '"detected using satellite measurements".' },
              { number: 39, answer: { accepted: ['sulphur dioxide', 'sulfur dioxide', 'gases'] }, explanationHtml: '"particularly sulphur dioxide. A sudden increase can indicate that fresh magma is approaching".' },
              { number: 40, answer: { accepted: ['evacuations'] }, explanationHtml: '"running practice evacuations every year".' },
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
        '<p>The graph below shows the number of journeys made by four types of transport in one city between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'Journeys by type of transport, 1990-2020 (millions per year)',
        unit: 'million',
        categories: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Journeys (millions)',
        series: [
          { name: 'Car', data: [210, 235, 250, 245, 230, 215, 190] },
          { name: 'Bus', data: [140, 125, 115, 120, 128, 132, 110] },
          { name: 'Tram', data: [0, 0, 20, 45, 60, 72, 68] },
          { name: 'Bicycle', data: [15, 14, 16, 22, 35, 52, 75] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Many people who live in large cities say that they often feel lonely, even though they are surrounded by other people.</p><p>What are the causes of this problem, and what measures could be taken to solve it?</p>',
    },
  },
};
