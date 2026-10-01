// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, TFNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-47',
  title: 'Vocably Practice Test 47',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The mineral that built empires',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>Today salt is so cheap and plentiful that it is hard to believe it was once one of the most valuable goods in the world. Yet for most of human history, salt was essential not only as a seasoning but as a means of survival. Before refrigeration, it was the main way of preserving meat and fish through the winter or on long journeys, because it draws water out of food and prevents the growth of the bacteria that cause decay. Animals, too, need salt, and farmers who kept cattle or sheep required a regular supply. Salt was also used in tanning leather, in making certain dyes and in medicine, so that a community without access to it was at a serious disadvantage.</p>" },
          { label: '', html: "<p>The earliest known salt works, in what is now China, date back around eight thousand years. There, people boiled the water of a salt lake to extract the crystals. Later, Chinese engineers drilled wells hundreds of metres deep to reach underground salt water, using bamboo pipes to carry it to the surface, and burned natural gas from the same wells as fuel for boiling it. Because salt was so important, Chinese rulers turned its production into a state monopoly, and for many centuries the tax on salt provided a large share of government income.</p>" },
          { label: '', html: "<p>In the Mediterranean world, salt was produced mainly by allowing seawater to evaporate in shallow pools in the sun. The Romans built roads specifically to carry salt, and one of the oldest roads leading to Rome was known as the Salt Road. It is often said that Roman soldiers were paid in salt, and that the English word 'salary' comes from this practice. Historians point out that there is no firm evidence that soldiers were paid in salt itself, although it seems likely that they received an allowance to buy it.</p>" },
          { label: '', html: "<p>In Europe, some towns grew rich on salt. In central Europe, salt was mined deep underground, and in one famous mine in southern Poland, miners over the centuries carved entire chapels, with statues and chandeliers, out of the rock salt itself. In West Africa, salt from the Sahara was carried south by camel caravans and exchanged for gold, sometimes, according to travellers' reports, weight for weight. Cities such as Timbuktu became wealthy through this trade.</p>" },
          { label: '', html: "<p>Because everyone needed it, salt was an attractive target for taxation, and salt taxes were deeply unpopular. In France, a hated salt tax called the gabelle required every household to buy a minimum quantity of salt each year at a price fixed by the government. The tax varied enormously from region to region, which encouraged widespread smuggling, and it was one of the grievances that contributed to the French Revolution. It was abolished in 1790, although it was later brought back and not finally ended until 1945.</p>" },
          { label: '', html: "<p>The most famous protest against a salt tax took place in India in 1930. Under British rule, Indians were forbidden to collect or sell salt, and had to buy it from the government, which included a tax in the price. Mahatma Gandhi chose this law as the target of a campaign of peaceful disobedience, because it affected everyone, rich and poor. He and a group of followers walked for twenty-four days to the coast, where he picked up a handful of natural salt from the shore, breaking the law. Tens of thousands of people followed his example, and the march attracted attention around the world. Newspapers in Europe and North America reported on it in detail, and many historians regard it as a turning point in the campaign for Indian independence, because it showed how a simple, symbolic act could unite people across the country.</p>" },
          { label: '', html: "<p>The importance of salt declined in the twentieth century. Modern geology revealed that salt deposits exist in many parts of the world, and new methods of mining and processing made it cheap. Refrigeration and canning replaced salt as the main methods of preserving food. Today, most salt produced is not eaten at all but used by industry, particularly in making chemicals, and in cold countries large quantities are spread on roads in winter to melt ice. Ironically, doctors now warn that most people in wealthy countries eat far too much of the substance that people once struggled so hard, and sometimes fought wars, to obtain.</p>" },
        ],
        questionGroups: [
          {
            id: 't47-r1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>The history of salt</strong></p>' +
              '<p><em>Uses</em><br/>• preserved food by preventing the growth of {{q1}}</p>' +
              '<p><em>China</em><br/>• deep wells; salt water brought up through {{q2}} pipes<br/>• natural {{q3}} burned as fuel<br/>• salt production became a state {{q4}}</p>' +
              '<p><em>Rome</em><br/>• salt made by letting seawater {{q5}} in the sun</p>' +
              '<p><em>Poland</em><br/>• miners carved {{q6}} out of rock salt</p>' +
              '<p><em>West Africa</em><br/>• salt carried by camel and exchanged for {{q7}}</p>' +
              '<p><em>France</em><br/>• the gabelle encouraged {{q8}}</p>' +
              '<p><em>Today</em><br/>• salt spread on roads to melt {{q9}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['bacteria'] }, explanationHtml: 'Paragraph 1: it "prevents the growth of the bacteria that cause decay".' },
              { number: 2, answer: { accepted: ['bamboo'] }, explanationHtml: 'Paragraph 2: "using bamboo pipes to carry it to the surface".' },
              { number: 3, answer: { accepted: ['gas'] }, explanationHtml: 'Paragraph 2: "burned natural gas from the same wells as fuel".' },
              { number: 4, answer: { accepted: ['monopoly'] }, explanationHtml: 'Paragraph 2: "turned its production into a state monopoly".' },
              { number: 5, answer: { accepted: ['evaporate'] }, explanationHtml: 'Paragraph 3: "allowing seawater to evaporate in shallow pools".' },
              { number: 6, answer: { accepted: ['chapels'] }, explanationHtml: 'Paragraph 4: "miners ... carved entire chapels".' },
              { number: 7, answer: { accepted: ['gold'] }, explanationHtml: 'Paragraph 4: "exchanged for gold".' },
              { number: 8, answer: { accepted: ['smuggling'] }, explanationHtml: 'Paragraph 5: "which encouraged widespread smuggling".' },
              { number: 9, answer: { accepted: ['ice'] }, explanationHtml: 'Paragraph 7: "spread on roads in winter to melt ice".' },
            ],
          },
          {
            id: 't47-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 10, promptHtml: 'There is clear evidence that Roman soldiers received their wages in salt.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: "there is no firm evidence that soldiers were paid in salt itself".' },
              { number: 11, promptHtml: 'The rate of the gabelle was the same throughout France.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 5: "The tax varied enormously from region to region".' },
              { number: 12, promptHtml: 'Gandhi chose the salt law because it affected people of all social classes.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 6: "because it affected everyone, rich and poor".' },
              { number: 13, promptHtml: 'The British government abolished the salt law immediately after the march.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not say what happened to the law after the march.' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The cuckoo\'s deception',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>Every spring, the common cuckoo arrives in Europe from its winter home in Africa, and its familiar two-note call has long been celebrated as a sign of the new season. Yet the cuckoo's way of life is anything but gentle. It is a brood parasite: instead of building a nest and raising its own young, the female lays her eggs in the nests of other species, leaving the unwitting hosts to raise her chicks at the expense of their own. The behaviour has fascinated naturalists for more than two thousand years; the Greek philosopher Aristotle described it, and later writers often treated the cuckoo as a symbol of deceit. Only in the past few decades, however, have careful field studies revealed how sophisticated the cuckoo's methods are, and how its hosts fight back.</p>" },
          { label: '', html: "<p>The female cuckoo's behaviour is carefully timed. She watches potential host nests, often for days, waiting until the host has begun laying. Then, while the host bird is away, she flies down, removes one of the host's eggs, and lays one of her own in its place, a process that takes as little as ten seconds. She may repeat this in up to twenty different nests in a single season, laying one egg in each.</p>" },
          { label: '', html: "<p>The cuckoo chick usually hatches before the host's own chicks, because its egg needs a shorter period of incubation. Within hours of hatching, while it is still blind and featherless, the young cuckoo pushes every other egg or chick out of the nest, one by one, balancing them on a hollow in its back and forcing them over the edge. From then on, it has the undivided attention of its foster parents.</p>" },
          { label: '', html: "<p>A single cuckoo chick soon grows much larger than the birds feeding it, and one might expect the hosts to notice that something is wrong. Research has shown how the cuckoo avoids this. A study of cuckoos raised by reed warblers found that the chick makes an unusually rapid begging call that sounds like a whole nest of hungry warbler chicks. This encourages the adults to bring enough food for an entire brood, which the growing cuckoo needs. The chick also has a bright orange-red mouth, and when it opens it wide, the colour acts as a powerful signal that stimulates the adults to feed it. By the time it leaves the nest, the young cuckoo may be several times the size of its foster parents, which continue to feed it for some time afterwards, sometimes standing on its back to reach its mouth.</p>" },
          { label: '', html: "<p>Host species have not accepted this treatment without resistance. Many have learned to recognise cuckoo eggs and either throw them out or abandon the nest and start again. In response, cuckoos have evolved eggs that closely match those of their hosts in colour and pattern. Remarkably, different female cuckoos specialise in different host species, each laying eggs that mimic those of a particular host, even though all cuckoos belong to the same species. This specialisation seems to be passed down from mother to daughter.</p>" },
          { label: '', html: "<p>Scientists describe the relationship between cuckoos and their hosts as an evolutionary 'arms race', in which each improvement in the hosts' defences is followed by a new trick on the part of the cuckoo. Some hosts, for example, now attack cuckoos that come near their nests, and in response some cuckoos have evolved grey and white markings on their chests that make them resemble a hawk, which frightens small birds away. Other hosts have become more careful about which eggs they accept, and in turn, cuckoo eggs have become harder to tell apart from their own. Researchers have found that in areas where cuckoos have been present for a long time, hosts are generally much better at rejecting foreign eggs than in areas where cuckoos have arrived only recently.</p>" },
          { label: '', html: "<p>In recent decades, the number of cuckoos in parts of Europe has fallen sharply; in Britain, the population has more than halved since the early 1980s. To understand why, researchers have fitted cuckoos with small satellite tags and followed their journeys to Africa. The data revealed that birds taking different routes had very different survival rates, suggesting that problems during migration, such as drought, are an important cause of the decline, alongside a fall in the number of large caterpillars that adult cuckoos feed on in Europe.</p>" },
        ],
        questionGroups: [
          {
            id: 't47-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 14, promptHtml: 'A female cuckoo lays several eggs in the same nest.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: she lays "one egg in each" nest.' },
              { number: 15, promptHtml: 'A cuckoo can lay an egg in a host\'s nest in a very short time.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: "a process that takes as little as ten seconds".' },
              { number: 16, promptHtml: 'Cuckoo eggs take longer to hatch than host eggs.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: the cuckoo\'s egg "needs a shorter period of incubation".' },
              { number: 17, promptHtml: 'Reed warblers are the most common host of the cuckoo in Europe.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Reed warblers are mentioned in a study, but not described as the most common host.' },
              { number: 18, promptHtml: 'All female cuckoos lay eggs of the same colour.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 5: "different female cuckoos ... each laying eggs that mimic those of a particular host".' },
            ],
          },
          {
            id: 't47-r2-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-G, below.',
            bank: [
              { key: 'A', text: 'makes the hosts bring more food.' },
              { key: 'B', text: 'frightens small birds away.' },
              { key: 'C', text: 'allows the chick to remove eggs from the nest.' },
              { key: 'D', text: 'may be inherited from the mother.' },
              { key: 'E', text: 'helps cuckoos find their way to Africa.' },
              { key: 'F', text: 'attracts other cuckoos in spring.' },
              { key: 'G', text: 'causes hosts to build larger nests.' },
            ],
            questions: [
              { number: 19, promptHtml: 'A hollow in the young cuckoo\'s back', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: "balancing them on a hollow in its back and forcing them over the edge".' },
              { number: 20, promptHtml: 'The rapid begging call of a cuckoo chick', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: it "encourages the adults to bring enough food for an entire brood".' },
              { number: 21, promptHtml: 'A preference for a particular host species', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 5: "This specialisation seems to be passed down from mother to daughter."' },
              { number: 22, promptHtml: 'A resemblance to a hawk', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 6: markings "make them resemble a hawk, which frightens small birds away".' },
            ],
          },
          {
            id: 't47-r2-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>The decline of the cuckoo</strong></p><p>In Britain, cuckoo numbers have fallen by more than half since the early 1980s. Researchers used {{q23}} tags to follow the birds to Africa, and found that survival depended on the {{q24}} they took. Problems such as {{q25}} during migration appear to be important, as does a fall in the number of large {{q26}} in Europe.</p>',
            questions: [
              { number: 23, answer: { accepted: ['satellite'] }, explanationHtml: 'Paragraph 7: "fitted cuckoos with small satellite tags".' },
              { number: 24, answer: { accepted: ['routes', 'route'] }, explanationHtml: 'Paragraph 7: "birds taking different routes had very different survival rates".' },
              { number: 25, answer: { accepted: ['drought'] }, explanationHtml: 'Paragraph 7: "problems during migration, such as drought".' },
              { number: 26, answer: { accepted: ['caterpillars'] }, explanationHtml: 'Paragraph 7: "a fall in the number of large caterpillars".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Cities made for walking',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>For most of the twentieth century, cities in many parts of the world were designed around the car. Wide roads, large car parks and out-of-town shopping centres were seen as signs of progress, and planners measured the success of a street by how many vehicles it could carry. Walking, the oldest form of transport, was treated almost as an afterthought. Pavements were narrowed to make room for traffic, pedestrians were sent into underground passages or over footbridges, and in some new suburbs pavements were not built at all. Shops, schools and workplaces were separated from housing by planning rules, so that even short everyday journeys required a car, and people who could not drive, including children and many older people, became dependent on others.</p>" },
          { label: 'B', html: "<p>That thinking is now changing. A growing body of research shows that cities in which people walk more are healthier, safer and more prosperous. Walking is the simplest form of exercise, and people who live in walkable neighbourhoods are, on average, less likely to be overweight and suffer less from heart disease and diabetes. Streets that are busy with pedestrians also tend to have lower crime rates, because there are more people to notice what is happening, an idea first put forward by a writer on city life in the 1960s.</p>" },
          { label: 'C', html: "<p>The economic benefits are also considerable. Studies of shopping streets have repeatedly found that shopkeepers overestimate the proportion of their customers who arrive by car. People who walk or cycle to local shops typically spend less on each visit, but they visit more often, and over a month they often spend more in total. When busy roads have been turned into pedestrian streets, the number of visitors, and the rents that property owners can charge, have usually risen.</p>" },
          { label: 'D', html: "<p>What makes a street pleasant to walk along? Research suggests that the most important factor is not the width of the pavement but what happens alongside it. People prefer streets with frequent doors, shop windows and variety, and find long blank walls or car parks boring and even threatening. Trees, which provide shade and a sense of enclosure, make a large difference, as do places to sit. The speed of traffic matters more than its volume: a busy street with slow-moving cars feels much safer than a quieter one where vehicles travel fast.</p>" },
          { label: 'E', html: "<p>Distance is also crucial. Most people are willing to walk for about five to ten minutes to reach everyday services, such as a food shop, a school or a bus stop. Some cities have adopted the goal that every resident should be able to meet most of their daily needs within a fifteen-minute walk or cycle ride from home. Supporters say the idea strengthens local communities and reduces traffic; critics worry that it could be used to restrict people's freedom to drive, although most versions of the plan contain no such restrictions.</p>" },
          { label: 'F', html: "<p>Changing a city built for cars is slow and expensive, but some improvements can be made quickly and cheaply. Several cities have experimented with temporary changes, closing streets to traffic for a few weeks using painted lines, planters and moveable seating, and then asking residents what they think. If a scheme proves popular, it can be made permanent; if not, it can easily be removed. This approach allows ideas to be tested before large sums are spent. It also helps to overcome opposition: residents who are strongly against a proposal on paper often change their minds once they have experienced a quieter street for themselves, while problems that no one predicted, such as difficulties for delivery vehicles, can be identified and solved before the design is fixed.</p>" },
          { label: 'G', html: "<p>Walkable cities must also be designed for everyone. Older people, parents with pushchairs and people with disabilities need level pavements, dropped kerbs at crossings, and enough time to cross the road before the lights change. Children, in particular, have lost much of their freedom to walk independently in recent decades, largely because of parents' fears about traffic. Some cities have responded by closing the streets outside schools to cars at the beginning and end of the school day, with encouraging results. More children walk or cycle to school, air quality around the school gates improves, and parents report that the streets feel calmer and friendlier.</p>" },
        ],
        questionGroups: [
          {
            id: 't47-r3-matchinfo',
            type: 'matching_information',
            instructionHtml:
              'Reading Passage 3 has seven sections, A-G. Which section contains the following information? <em>Choose the correct letter, A-G.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              { number: 27, promptHtml: 'a way of testing changes before committing to them', answer: { accepted: ['F'] }, explanationHtml: 'Section F: temporary changes "allow ideas to be tested before large sums are spent".', locatorParagraph: 'F' },
              { number: 28, promptHtml: 'a reason why pedestrians may make streets safer from crime', answer: { accepted: ['B'] }, explanationHtml: 'Section B: "there are more people to notice what is happening".', locatorParagraph: 'B' },
              { number: 29, promptHtml: 'a mistaken belief held by shopkeepers', answer: { accepted: ['C'] }, explanationHtml: 'Section C: "shopkeepers overestimate the proportion of their customers who arrive by car".', locatorParagraph: 'C' },
              { number: 30, promptHtml: 'the needs of people who find walking more difficult', answer: { accepted: ['G'] }, explanationHtml: 'Section G: "Older people, parents with pushchairs and people with disabilities need level pavements".', locatorParagraph: 'G' },
              { number: 31, promptHtml: 'examples of how pedestrians were given less space', answer: { accepted: ['A'] }, explanationHtml: 'Section A: "Pavements were narrowed ... pedestrians were sent into underground passages".', locatorParagraph: 'A' },
              { number: 32, promptHtml: 'a concern about a planning goal', answer: { accepted: ['E'] }, explanationHtml: 'Section E: "critics worry that it could be used to restrict people\'s freedom to drive".', locatorParagraph: 'E' },
              { number: 33, promptHtml: 'the features that make a street attractive to walk along', answer: { accepted: ['D'] }, explanationHtml: 'Section D: doors, shop windows, variety, trees and places to sit.', locatorParagraph: 'D' },
              { number: 34, promptHtml: 'the health benefits of living in areas where people walk', answer: { accepted: ['B'] }, explanationHtml: 'Section B: people "are ... less likely to be overweight and suffer less from heart disease".', locatorParagraph: 'B' },
            ],
          },
          {
            id: 't47-r3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 35, promptHtml: 'In some new suburbs, no {{q35}} were built.', answer: { accepted: ['pavements'] }, explanationHtml: 'Section A: "in some new suburbs pavements were not built at all".', locatorParagraph: 'A' },
              { number: 36, promptHtml: 'When roads become pedestrian streets, property {{q36}} usually increase.', answer: { accepted: ['rents'] }, explanationHtml: 'Section C: "the rents that property owners can charge, have usually risen".', locatorParagraph: 'C' },
              { number: 37, promptHtml: 'The {{q37}} of traffic affects how safe a street feels more than the amount of traffic.', answer: { accepted: ['speed'] }, explanationHtml: 'Section D: "The speed of traffic matters more than its volume".', locatorParagraph: 'D' },
              { number: 38, promptHtml: 'Trees give shade and a sense of {{q38}}.', answer: { accepted: ['enclosure'] }, explanationHtml: 'Section D: "Trees, which provide shade and a sense of enclosure".', locatorParagraph: 'D' },
              { number: 39, promptHtml: 'Temporary street closures may use painted lines, {{q39}} and moveable seating.', answer: { accepted: ['planters'] }, explanationHtml: 'Section F: "using painted lines, planters and moveable seating".', locatorParagraph: 'F' },
              { number: 40, promptHtml: 'Children have lost freedom to walk alone mainly because of parents\' fears about {{q40}}.', answer: { accepted: ['traffic'] }, explanationHtml: 'Section G: "largely because of parents\' fears about traffic".', locatorParagraph: 'G' },
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
        contextText: 'You will hear a man phoning a theatre box office about a children\'s show.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, Playhouse Theatre box office." },
          { speaker: 'B', voice: 'david', text: "Hello. I'd like some information about the children's show, 'The Paper Dragon'. I'm thinking of taking my two daughters." },
          { speaker: 'A', voice: 'zira', text: "Of course. How old are they?" },
          { speaker: 'B', voice: 'david', text: "Six and nine." },
          { speaker: 'A', voice: 'zira', text: "That's perfect. The show is recommended for ages five to eleven. It lasts about seventy minutes, with no interval." },
          { speaker: 'B', voice: 'david', text: "Right. When are the performances?" },
          { speaker: 'A', voice: 'zira', text: "During the school holidays there are two a day, at eleven and at two thirty. We used to have an evening show as well, but it wasn't popular with families, so we stopped it." },
          { speaker: 'B', voice: 'david', text: "The afternoon would suit us. How much are tickets?" },
          { speaker: 'A', voice: 'zira', text: "Adults are fourteen pounds, and children are nine. But we have a family ticket for two adults and two children, or one adult and three children, for forty pounds." },
          { speaker: 'B', voice: 'david', text: "It'll just be me and the two girls, so I'll buy separate tickets. Is the show suitable for younger children? It's not frightening, is it?" },
          { speaker: 'A', voice: 'zira', text: "The dragon does look rather fierce at first, but it turns out to be friendly. We haven't had any complaints. Some parents say the loudest part is actually the audience, because the children are encouraged to shout and sing." },
          { speaker: 'B', voice: 'david', text: "That sounds fun. Where would you recommend we sit?" },
          { speaker: 'A', voice: 'zira', text: "For children, I'd recommend the front of the circle, upstairs. The seats are raised, so they can see over the heads of the adults. The stalls are closer, but smaller children sometimes can't see." },
          { speaker: 'B', voice: 'david', text: "OK, the circle, then. I also saw something about workshops." },
          { speaker: 'A', voice: 'zira', text: "Yes. Before the afternoon show, there's a workshop where children learn to make their own dragon puppets. It's run by the designer of the show. It starts at one o'clock and lasts an hour." },
          { speaker: 'B', voice: 'david', text: "Do they need to bring anything?" },
          { speaker: 'A', voice: 'zira', text: "No, we provide all the materials, but they might get a bit messy with the glue, so old clothes are a good idea." },
          { speaker: 'B', voice: 'david', text: "And is there anywhere to eat?" },
          { speaker: 'A', voice: 'zira', text: "There's a café on the ground floor that serves sandwiches and cakes. Or if you prefer, there's a small park just behind the theatre where lots of families have a picnic when the weather's nice." },
          { speaker: 'B', voice: 'david', text: "And parking?" },
          { speaker: 'A', voice: 'zira', text: "The theatre doesn't have its own car park, but the multi-storey on Bridge Street is only two minutes away, and if you show your ticket, you'll get a discount." },
        ],
        questionGroups: [
          {
            id: 't47-l1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 1, promptHtml: 'How long does the show last?', options: [{ key: 'A', text: 'about 50 minutes' }, { key: 'B', text: 'about 70 minutes' }, { key: 'C', text: 'about 90 minutes' }], answer: { accepted: ['B'] }, explanationHtml: '"It lasts about seventy minutes, with no interval."' },
              { number: 2, promptHtml: 'Why was the evening performance stopped?', options: [{ key: 'A', text: 'Families did not like it.' }, { key: 'B', text: 'The actors were too tired.' }, { key: 'C', text: 'The theatre was needed for other shows.' }], answer: { accepted: ['A'] }, explanationHtml: '"it wasn\'t popular with families, so we stopped it".' },
              { number: 3, promptHtml: 'How much will the man pay for tickets?', options: [{ key: 'A', text: '£32' }, { key: 'B', text: '£40' }, { key: 'C', text: '£46' }], answer: { accepted: ['A'] }, explanationHtml: 'One adult (£14) and two children (£9 each) = £32; the family ticket (£40) is not suitable.' },
              { number: 4, promptHtml: 'What does the woman say about the show?', options: [{ key: 'A', text: 'Some children find the dragon frightening.' }, { key: 'B', text: 'The audience is encouraged to join in.' }, { key: 'C', text: 'It is too loud for young children.' }], answer: { accepted: ['B'] }, explanationHtml: '"the children are encouraged to shout and sing".' },
              { number: 5, promptHtml: 'Where does the woman recommend sitting?', options: [{ key: 'A', text: 'in the front of the stalls' }, { key: 'B', text: 'at the back of the stalls' }, { key: 'C', text: 'in the front of the circle' }], answer: { accepted: ['C'] }, explanationHtml: '"I\'d recommend the front of the circle, upstairs".' },
              { number: 6, promptHtml: 'Who runs the workshop?', options: [{ key: 'A', text: 'one of the actors' }, { key: 'B', text: 'the designer of the show' }, { key: 'C', text: 'a local artist' }], answer: { accepted: ['B'] }, explanationHtml: '"It\'s run by the designer of the show."' },
            ],
          },
          {
            id: 't47-l1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 7, promptHtml: 'In the workshop, children make dragon {{q7}}.', answer: { accepted: ['puppets'] }, explanationHtml: '"children learn to make their own dragon puppets".' },
              { number: 8, promptHtml: 'Children may get messy because of the {{q8}}.', answer: { accepted: ['glue'] }, explanationHtml: '"they might get a bit messy with the glue".' },
              { number: 9, promptHtml: 'Many families have a picnic in the {{q9}} behind the theatre.', answer: { accepted: ['park'] }, explanationHtml: '"a small park just behind the theatre where lots of families have a picnic".' },
              { number: 10, promptHtml: 'Showing a theatre ticket gives a {{q10}} at the car park.', answer: { accepted: ['discount'] }, explanationHtml: '"if you show your ticket, you\'ll get a discount".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the director of a city arts festival talking about this year\'s programme.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good evening, everyone. I'm Sarah Holt, the director of the Merton Arts Festival, and I'm very pleased to tell you about this year's programme." },
          { speaker: 'A', voice: 'david', text: "This is the festival's twenty-fifth year. It began as a small music event organised by a group of teachers, and it's now one of the largest arts festivals in the region, attracting around eighty thousand visitors." },
          { speaker: 'A', voice: 'david', text: "This year we've made one important change. In the past, most events were in the city centre, and people living in the outer areas told us they felt the festival wasn't for them. So this year, a third of the events will take place in neighbourhoods outside the centre." },
          { speaker: 'A', voice: 'david', text: "We've also kept ticket prices the same as last year, despite rising costs, and around half of all events are completely free. That's thanks to our sponsors, especially a local building society, which has doubled its support." },
          { speaker: 'A', voice: 'david', text: "People often ask me which part of the festival sells out first. It's not the big concerts, as you might think, but the comedy nights, so book early if you're interested." },
          { speaker: 'A', voice: 'david', text: "And finally, a request. We rely on around two hundred volunteers, and this year we particularly need people who can drive, to help transport equipment between venues." },
          { speaker: 'A', voice: 'david', text: "Now, let me tell you about some of the main venues. The Corn Exchange, our largest venue, will host the opening concert, which this year features a youth orchestra from Brazil. It's the first time they've performed in Europe." },
          { speaker: 'A', voice: 'david', text: "At the Old Library, which has only recently reopened after renovation, there will be a series of talks by well-known writers. Each talk is followed by a book signing." },
          { speaker: 'A', voice: 'david', text: "Riverside Park will be the home of the food market, running every day of the festival, with stalls from more than forty local producers." },
          { speaker: 'A', voice: 'david', text: "In St Anne's Church, we have a series of early morning concerts, starting at seven thirty. They're short, just forty minutes, so people can attend before going to work." },
          { speaker: 'A', voice: 'david', text: "And finally, the Castle. This year, for the first time, the castle walls will be used as a giant screen, with images projected onto them every evening after dark, telling the history of the city." },
          { speaker: 'A', voice: 'david', text: "The full programme is available on our website, and printed copies are in the library and the tourist information centre. Thank you." },
        ],
        questionGroups: [
          {
            id: 't47-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'The festival was started by', options: [{ key: 'A', text: 'teachers.' }, { key: 'B', text: 'musicians.' }, { key: 'C', text: 'the city council.' }], answer: { accepted: ['A'] }, explanationHtml: '"a small music event organised by a group of teachers".' },
              { number: 12, promptHtml: 'What is the main change this year?', options: [{ key: 'A', text: 'The festival is longer.' }, { key: 'B', text: 'More events are outside the city centre.' }, { key: 'C', text: 'There are new sponsors.' }], answer: { accepted: ['B'] }, explanationHtml: '"a third of the events will take place in neighbourhoods outside the centre".' },
              { number: 13, promptHtml: 'What does Sarah say about ticket prices?', options: [{ key: 'A', text: 'They have not increased.' }, { key: 'B', text: 'They have risen slightly.' }, { key: 'C', text: 'All events are free.' }], answer: { accepted: ['A'] }, explanationHtml: '"we\'ve also kept ticket prices the same as last year".' },
              { number: 14, promptHtml: 'Which events sell out most quickly?', options: [{ key: 'A', text: 'the concerts' }, { key: 'B', text: 'the comedy nights' }, { key: 'C', text: 'the writers\' talks' }], answer: { accepted: ['B'] }, explanationHtml: '"It\'s not the big concerts ... but the comedy nights".' },
              { number: 15, promptHtml: 'What kind of volunteers are particularly needed?', options: [{ key: 'A', text: 'people who can speak other languages' }, { key: 'B', text: 'people with first aid training' }, { key: 'C', text: 'people who can drive' }], answer: { accepted: ['C'] }, explanationHtml: '"we particularly need people who can drive".' },
            ],
          },
          {
            id: 't47-l2-venues',
            type: 'matching_features',
            instructionHtml:
              'What will happen at each of the following venues? Choose <strong>FIVE</strong> answers from the box and write the correct letter, A-G, next to Questions 16-20.',
            bank: [
              { key: 'A', text: 'a performance by visiting young musicians' },
              { key: 'B', text: 'short events before the working day' },
              { key: 'C', text: 'images shown on walls at night' },
              { key: 'D', text: 'a daily market' },
              { key: 'E', text: 'talks followed by book signings' },
              { key: 'F', text: 'comedy performances' },
              { key: 'G', text: 'children\'s workshops' },
            ],
            questions: [
              { number: 16, promptHtml: 'Corn Exchange', answer: { accepted: ['A'] }, explanationHtml: '"the opening concert ... features a youth orchestra from Brazil".' },
              { number: 17, promptHtml: 'Old Library', answer: { accepted: ['E'] }, explanationHtml: '"talks by well-known writers. Each talk is followed by a book signing."' },
              { number: 18, promptHtml: 'Riverside Park', answer: { accepted: ['D'] }, explanationHtml: '"the food market, running every day of the festival".' },
              { number: 19, promptHtml: 'St Anne\'s Church', answer: { accepted: ['B'] }, explanationHtml: '"early morning concerts ... so people can attend before going to work".' },
              { number: 20, promptHtml: 'Castle', answer: { accepted: ['C'] }, explanationHtml: '"images projected onto them every evening after dark".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two geology students, Mia and Tom, planning a field trip.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Tom, we need to finalise the plan for our field trip. Shall we go through the sites?" },
          { speaker: 'B', voice: 'david', text: "Sure. The first stop is the quarry at Hallam Edge. We're going there to look at the fossils in the limestone." },
          { speaker: 'A', voice: 'zira', text: "Right, and everyone will need a helmet there, because of the risk of falling rocks. The quarry company says they'll provide them." },
          { speaker: 'B', voice: 'david', text: "Good. Then the second site is the river gorge. That's where we'll study the layers of rock exposed by the river." },
          { speaker: 'A', voice: 'zira', text: "The path down to the gorge can be very slippery, so we'll tell everyone to wear proper boots." },
          { speaker: 'B', voice: 'david', text: "Yes. And the third site is the beach at Port Carrow, where we'll look at the cliffs." },
          { speaker: 'A', voice: 'zira', text: "What are we studying there, exactly?" },
          { speaker: 'B', voice: 'david', text: "Erosion, mainly. How the sea is wearing the cliffs away. The tutor wants us to measure how far back the cliff has moved since the last survey." },
          { speaker: 'A', voice: 'zira', text: "So we'll need a long measuring tape. And we have to check the tide times, because parts of the beach are cut off at high tide." },
          { speaker: 'B', voice: 'david', text: "Definitely. OK, now we need to decide who's doing what. First, the minibus. Somebody needs to book it through the department office." },
          { speaker: 'A', voice: 'zira', text: "I'll do that. I have to go to the office tomorrow anyway." },
          { speaker: 'B', voice: 'david', text: "Thanks. Then there's the risk assessment. The department needs one for every trip." },
          { speaker: 'A', voice: 'zira', text: "That's quite a big job. Shall we do it together? You know the gorge better than me, and I've been to the beach before." },
          { speaker: 'B', voice: 'david', text: "Good idea, we'll share it. Then someone needs to contact the landowner at the gorge to get permission." },
          { speaker: 'A', voice: 'zira', text: "Actually, the tutor told me she already has permission from last year, so neither of us needs to do that." },
          { speaker: 'B', voice: 'david', text: "Oh, great. And finally, the maps. We need to print a map of each site for everyone." },
          { speaker: 'A', voice: 'zira', text: "You're better with the mapping software than I am. Would you mind doing those?" },
          { speaker: 'B', voice: 'david', text: "No problem, I'll do them this weekend." },
        ],
        questionGroups: [
          {
            id: 't47-l3-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['Site', 'What to study', 'Notes'],
              [
                ['Quarry at Hallam Edge', '{{q21}} in the limestone', 'everyone needs a {{q22}}'],
                ['River gorge', '{{q23}} of rock', 'path is slippery: wear {{q24}}'],
                ['Beach at Port Carrow', 'cliff {{q25}}', 'check the times of the {{q26}}'],
              ]
            ),
            questions: [
              { number: 21, answer: { accepted: ['fossils'] }, explanationHtml: '"to look at the fossils in the limestone".' },
              { number: 22, answer: { accepted: ['helmet'] }, explanationHtml: '"everyone will need a helmet there".' },
              { number: 23, answer: { accepted: ['layers'] }, explanationHtml: '"we\'ll study the layers of rock exposed by the river".' },
              { number: 24, answer: { accepted: ['boots'] }, explanationHtml: '"tell everyone to wear proper boots".' },
              { number: 25, answer: { accepted: ['erosion'] }, explanationHtml: '"Erosion, mainly."' },
              { number: 26, answer: { accepted: ['tide', 'tides'] }, explanationHtml: '"we have to check the tide times".' },
            ],
          },
          {
            id: 't47-l3-who',
            type: 'matching_features',
            instructionHtml: 'Who is going to do each of the following tasks? Choose the correct letter, <strong>A-D</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Mia only' },
              { key: 'B', text: 'Tom only' },
              { key: 'C', text: 'both Mia and Tom' },
              { key: 'D', text: 'neither Mia nor Tom' },
            ],
            questions: [
              { number: 27, promptHtml: 'booking the minibus', answer: { accepted: ['A'] }, explanationHtml: 'Mia: "I\'ll do that."' },
              { number: 28, promptHtml: 'writing the risk assessment', answer: { accepted: ['C'] }, explanationHtml: '"we\'ll share it".' },
              { number: 29, promptHtml: 'contacting the landowner', answer: { accepted: ['D'] }, explanationHtml: '"the tutor ... already has permission ... so neither of us needs to do that".' },
              { number: 30, promptHtml: 'preparing the maps', answer: { accepted: ['B'] }, explanationHtml: 'Tom: "No problem, I\'ll do them this weekend."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the trade in tulips in the seventeenth-century Netherlands.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "In today's lecture on economic history, I'm going to talk about an episode that's often described as the first speculative bubble in history: the so-called tulip mania in the Netherlands in the sixteen thirties." },
          { speaker: 'A', voice: 'zira', text: "Tulips aren't native to western Europe. They grow wild in Central Asia, and they were cultivated in the gardens of the Ottoman Empire, in what is now Turkey, long before they reached Europe. They arrived in the Netherlands in the late sixteenth century, and a botanist who worked at the university in the city of Leiden played an important part in spreading them." },
          { speaker: 'A', voice: 'zira', text: "Tulips quickly became a symbol of wealth and status. The Dutch Republic was then one of the richest societies in Europe, with a growing class of merchants who had money to spend, and a fine garden was a way of displaying success." },
          { speaker: 'A', voice: 'zira', text: "The most valuable tulips were those known as 'broken' tulips, whose petals had dramatic streaks or flames of colour. Nobody at the time understood what caused these patterns, and they couldn't be reliably reproduced. We now know that they were caused by a virus, which is carried from plant to plant by small insects called aphids. The virus also weakened the bulbs, which made them even rarer." },
          { speaker: 'A', voice: 'zira', text: "The trade had an unusual feature. Tulip bulbs can only be dug up and moved for a few months in the summer. For the rest of the year, they're in the ground. So traders began buying and selling bulbs that were still in the ground, signing contracts to pay a certain price when the bulbs were lifted. Much of this trading took place not in formal markets but in taverns." },
          { speaker: 'A', voice: 'zira', text: "During the winter of sixteen thirty-six to thirty-seven, prices rose extremely rapidly. There are famous stories of a single bulb of the rarest variety being offered for the price of a large house in Amsterdam. Then, in February sixteen thirty-seven, at an auction in the city of Haarlem, buyers suddenly failed to appear. Within days, prices collapsed, and many traders were left with contracts to pay far more than the bulbs were now worth." },
          { speaker: 'A', voice: 'zira', text: "For a long time, the story was told as a warning about human foolishness, and it was said to have ruined large numbers of people and damaged the Dutch economy. But more recent research by historians who studied the original archives suggests that the impact has been greatly exaggerated. They found very few cases of people who were actually ruined, and most of the disputed contracts were eventually settled for a small fraction of the agreed price. Many of the most dramatic stories seem to have come from moral pamphlets published after the crash, which were intended to criticise greed." },
          { speaker: 'A', voice: 'zira', text: "Nevertheless, the episode remains a useful example for economists, because it shows how prices can become disconnected from any underlying value when people buy things mainly in the hope of selling them to someone else at a higher price." },
        ],
        questionGroups: [
          {
            id: 't47-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Tulip mania</strong></p>' +
              '<p><em>Background</em><br/>• tulips originally grew wild in Central {{q31}}<br/>• a {{q32}} in Leiden helped to spread them<br/>• tulips were a symbol of wealth and {{q33}}</p>' +
              '<p><em>Broken tulips</em><br/>• patterns caused by a {{q34}}, spread by aphids</p>' +
              '<p><em>Trade</em><br/>• bulbs sold while still in the {{q35}}<br/>• much trading took place in {{q36}}<br/>• a rare bulb reportedly offered for the price of a {{q37}}<br/>• crash began at an {{q38}} in Haarlem</p>' +
              '<p><em>Recent research</em><br/>• few people were actually {{q39}}<br/>• dramatic stories came from {{q40}} criticising greed</p>',
            questions: [
              { number: 31, answer: { accepted: ['asia'] }, explanationHtml: '"They grow wild in Central Asia".' },
              { number: 32, answer: { accepted: ['botanist'] }, explanationHtml: '"a botanist who worked at the university in the city of Leiden".' },
              { number: 33, answer: { accepted: ['status'] }, explanationHtml: '"a symbol of wealth and status".' },
              { number: 34, answer: { accepted: ['virus'] }, explanationHtml: '"they were caused by a virus, which is carried ... by ... aphids".' },
              { number: 35, answer: { accepted: ['ground'] }, explanationHtml: '"buying and selling bulbs that were still in the ground".' },
              { number: 36, answer: { accepted: ['taverns'] }, explanationHtml: '"Much of this trading took place ... in taverns."' },
              { number: 37, answer: { accepted: ['house'] }, explanationHtml: '"offered for the price of a large house in Amsterdam".' },
              { number: 38, answer: { accepted: ['auction'] }, explanationHtml: '"at an auction in the city of Haarlem, buyers suddenly failed to appear".' },
              { number: 39, answer: { accepted: ['ruined'] }, explanationHtml: '"They found very few cases of people who were actually ruined".' },
              { number: 40, answer: { accepted: ['pamphlets'] }, explanationHtml: '"moral pamphlets published after the crash, which were intended to criticise greed".' },
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
        '<p>The graph below shows the average consumption of three types of drink per person in one country between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'Drinks consumed per person per year, 1990-2020 (litres)',
        unit: 'litres',
        categories: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Litres per person',
        series: [
          { name: 'Bottled water', data: [18, 27, 41, 58, 70, 82, 95] },
          { name: 'Fizzy drinks', data: [85, 92, 98, 94, 86, 74, 66] },
          { name: 'Fruit juice', data: [22, 26, 31, 33, 29, 24, 20] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that children should start formal schooling at the age of four. Others believe that it is better for children to start school at the age of six or seven.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
