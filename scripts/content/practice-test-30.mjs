// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, YNNG_INSTRUCTION } from './_html.mjs';

const RAILWAY_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="320" fill="#f4f7ee"/>
  <text x="170" y="24" font-weight="bold" fill="#333">Moorvale Steam Railway</text>
  <path d="M40 250 C160 250 180 120 300 140 C420 160 440 70 560 70" stroke="#5d4037" stroke-width="6" fill="none" stroke-dasharray="14 6"/>
  <circle cx="40" cy="250" r="9" fill="#c62828"/><text x="20" y="280" fill="#333">Station A</text>
  <text x="20" y="296" fill="#333">Moorvale Town</text>
  <circle cx="190" cy="175" r="9" fill="#c62828"/><text x="150" y="208" fill="#333">Station B</text>
  <circle cx="330" cy="143" r="9" fill="#c62828"/><text x="300" y="178" fill="#333">Station C</text>
  <circle cx="560" cy="70" r="9" fill="#c62828"/><text x="520" y="100" fill="#333">Station D</text>
  <path d="M300 200 Q330 230 360 200 Q390 170 420 200" stroke="#6f9fc4" stroke-width="10" fill="none"/>
  <text x="440" y="210" fill="#2c5d80">River Wend</text>
  <path d="M80 60 L110 20 L140 60 Z M120 60 L150 25 L180 60 Z" fill="#90a4ae"/>
  <text x="80" y="80" fill="#555">Hills</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-30',
  title: 'Vocably Practice Test 30',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Roads of empire',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>Empires depend on communication. To govern distant provinces, collect taxes and move armies quickly, rulers need reliable routes across their territory. Two of the greatest road-building civilisations in history arose on opposite sides of the world, with no knowledge of each other: the Romans, whose empire at its height stretched from Britain to the Middle East, and the Incas, who controlled much of western South America in the fifteenth and early sixteenth centuries. Comparing their achievements reveals both striking similarities and fundamental differences, and I believe that the Inca achievement has been seriously underestimated.</p>" },
          { label: '', html: "<p>The Roman network eventually included around eighty thousand kilometres of paved roads, supplemented by many more unpaved tracks. Roman engineers were famous for building roads as straight as the landscape allowed, cutting through hills and bridging valleys rather than going around them. A typical major road was built in layers: a foundation of large stones, followed by smaller stones and gravel, and finally a surface of tightly fitted paving slabs, slightly curved so that rainwater ran off into ditches at the sides. Stone markers were placed at regular intervals to show the distance to the nearest town. Roads were built mainly by soldiers, who were expected to be skilled labourers as well as fighters, and the network allowed legions to march from one end of a province to the other in a matter of days. Detailed road maps and lists of stopping places were produced for travellers, and some copies have survived.</p>" },
          { label: '', html: "<p>The Inca road system, known in the Quechua language as the Qhapaq Ñan, covered around forty thousand kilometres and ran through some of the most difficult terrain on Earth, from coastal deserts to high mountain passes more than four thousand metres above sea level. Unlike the Romans, the Incas did not use the wheel for transport, and they had no horses; goods were carried by people and by llamas. As a result, their roads did not need to be level or wide. Where the ground was steep, they built stone staircases, and to cross deep river gorges they constructed suspension bridges made of woven grass rope, which had to be replaced regularly. One such bridge is still rebuilt every year by local communities using traditional methods.</p>" },
          { label: '', html: "<p>Both empires built rest stations along their roads at regular intervals. In the Roman system, official inns provided accommodation, food and fresh horses for government messengers and officials. The Incas built similar way stations, which also served as storehouses for food, cloth and weapons, allowing armies to travel long distances without carrying large supplies. Both systems were intended primarily for official use, although ordinary travellers and traders also used them.</p>" },
          { label: '', html: "<p>The Incas developed an extraordinarily efficient system for carrying messages. Teams of runners were stationed in small huts a few kilometres apart. A runner would sprint to the next hut and pass on his message, together with a set of knotted strings used to record numbers, to a fresh runner, who would carry it on to the next stage. In this way, a message could travel more than two hundred kilometres in a day, faster than the Roman postal service, which relied on horses. Fresh fish, it was said, could be carried from the coast to the ruler in the mountain capital while it was still edible.</p>" },
          { label: '', html: "<p>The two systems had very different fates. Many Roman roads remained in use long after the empire collapsed, and the routes of some are still followed by modern roads today. The Inca network, by contrast, was severely damaged after the Spanish conquest of the sixteenth century. Spanish horses and wheeled carts damaged the stone steps, the system of runners and storehouses was abandoned, and many sections were neglected. Yet large parts survived, and in 2014 the Qhapaq Ñan was recognised as a World Heritage Site, shared between six South American countries.</p>" },
          { label: '', html: "<p>It is sometimes suggested that the Roman roads were the more advanced achievement because of their durability and engineering. I think this comparison is unfair. Each system was perfectly adapted to its environment and to the needs of the society that built it. The Inca roads were constructed without iron tools, without the wheel and without a written language, across a landscape far more challenging than anything the Romans faced. That they functioned so effectively is, in my view, one of the most remarkable achievements of the ancient world.</p>" },
        ],
        questionGroups: [
          {
            id: 't30-r1-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'The Inca road system has not received the recognition it deserves.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 1: "I believe that the Inca achievement has been seriously underestimated."' },
              { number: 2, promptHtml: 'The Romans and the Incas learned road-building techniques from each other.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 1: they arose "with no knowledge of each other".' },
              { number: 3, promptHtml: 'The Roman roads were more advanced than the Inca roads.', answer: { accepted: ['NO'] }, explanationHtml: 'Final paragraph: "I think this comparison is unfair."' },
              { number: 4, promptHtml: 'The Inca roads should be restored for use by modern tourists.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer does not discuss restoring the roads for tourism.' },
            ],
          },
          {
            id: 't30-r1-classify',
            type: 'matching_features',
            instructionHtml: 'Classify the following features as belonging to<br/><strong>A</strong> both the Roman and the Inca roads<br/><strong>B</strong> the Roman roads only<br/><strong>C</strong> the Inca roads only',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'both the Roman and the Inca roads' },
              { key: 'B', text: 'the Roman roads only' },
              { key: 'C', text: 'the Inca roads only' },
            ],
            questions: [
              { number: 5, promptHtml: 'steps built on steep slopes', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: "they built stone staircases".' },
              { number: 6, promptHtml: 'stations where travellers could stop', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: "Both empires built rest stations".' },
              { number: 7, promptHtml: 'markers showing distances', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: Roman "Stone markers were placed at regular intervals".' },
              { number: 8, promptHtml: 'bridges made from plant material', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: "suspension bridges made of woven grass rope".' },
              { number: 9, promptHtml: 'messages carried on horseback', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "the Roman postal service, which relied on horses".' },
              { number: 10, promptHtml: 'use mainly by officials', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: "Both systems were intended primarily for official use".' },
            ],
          },
          {
            id: 't30-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 11, promptHtml: 'Why did Roman roads have a slightly curved surface?', options: [{ key: 'A', text: 'to make them stronger' }, { key: 'B', text: 'to allow water to drain away' }, { key: 'C', text: 'to slow down vehicles' }, { key: 'D', text: 'to follow the shape of hills' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "slightly curved so that rainwater ran off into ditches".' },
              { number: 12, promptHtml: 'Inca roads did not need to be level or wide because', options: [{ key: 'A', text: 'few people used them.' }, { key: 'B', text: 'the Incas did not use wheeled transport.' }, { key: 'C', text: 'they were only used in dry weather.' }, { key: 'D', text: 'they were built by the army.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "the Incas did not use the wheel for transport ... As a result, their roads did not need to be level or wide."' },
              { number: 13, promptHtml: 'What damaged the Inca roads after the Spanish conquest?', options: [{ key: 'A', text: 'earthquakes' }, { key: 'B', text: 'heavy rain' }, { key: 'C', text: 'horses and carts' }, { key: 'D', text: 'new road building' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 6: "Spanish horses and wheeled carts damaged the stone steps".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Losing the night',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>For most of human history, the night sky was a source of wonder, guidance and inspiration. Today, more than eighty per cent of the world's population, and almost everyone living in Europe and North America, lives under skies polluted by artificial light. For around a third of humanity, the Milky Way is no longer visible at all. Light pollution is often dismissed as a problem only for astronomers, but I believe it deserves to be taken far more seriously, because its effects reach deep into the natural world and into our own health.</p>" },
          { label: 'B', html: "<p>Artificial light at night takes several forms. There is the glow over cities that can be seen from many kilometres away, caused by light scattered in the atmosphere; glare from badly designed lamps that shine into drivers' eyes; and light trespass, when light from street lamps or neighbouring buildings shines into places where it is not wanted, such as bedrooms. Much of this light is simply wasted, directed upwards or sideways rather than onto the ground where it is needed. One estimate suggests that around a third of all outdoor lighting in the United States is wasted in this way, at a cost of billions of dollars a year.</p>" },
          { label: 'C', html: "<p>The effects on wildlife can be dramatic. Newly hatched sea turtles find their way to the ocean by moving towards the brightest horizon, which on a natural beach is the sea, reflecting the light of the moon and stars. On beaches near towns, the hatchlings often head inland towards street lights instead, where many die. Migrating birds, many of which travel at night, are attracted to brightly lit buildings and may circle them until they are exhausted or collide with windows. Insects are drawn to lights in enormous numbers, and scientists believe that artificial light may be one of several factors behind the dramatic decline in insect populations in many parts of the world.</p>" },
          { label: 'D', html: "<p>Humans are affected too. Our bodies have evolved to follow a daily cycle of light and darkness, and exposure to light at night interferes with the production of melatonin, a hormone that helps to regulate sleep and which the body normally releases as darkness falls. The blue light produced by many modern LED lamps and screens is particularly effective at suppressing it. Studies have linked long-term disruption of the body clock with a range of health problems, although the precise role of outdoor lighting, as opposed to indoor light and screens, is difficult to separate.</p>" },
          { label: 'E', html: "<p>Unlike many environmental problems, light pollution is relatively easy to solve. Lamps can be shielded so that they shine only downwards; lights can be dimmed or switched off late at night when few people are about; motion sensors can ensure that lights come on only when they are needed; and warmer colours of light can be used, which scatter less and have less effect on wildlife and sleep. Unlike other forms of pollution, light pollution disappears immediately once the source is removed.</p>" },
          { label: 'F', html: "<p>Some places have already acted. A growing number of areas around the world have been designated as dark sky reserves, where lighting is carefully controlled and the night sky is protected. Several have become popular with tourists, who travel long distances simply to see the stars. Some countries have introduced national laws limiting unnecessary lighting, for example requiring shop windows and office buildings to switch off their lights during the night. Towns that have reduced street lighting late at night have generally found no increase in crime or road accidents, contrary to the fears often expressed before such changes, while saving considerable sums on electricity.</p>" },
          { label: 'G', html: "<p>There is a risk, however, that the switch to energy-efficient LED lighting may make the problem worse. Because LEDs are so cheap to run, some cities have installed more lights, or brighter ones, than before, cancelling out the environmental benefits. Satellite images suggest that the area of the Earth's surface that is artificially lit at night has continued to grow by around two per cent a year. Unless the way we use light changes, the stars may continue to fade from our skies. Yet the solution lies in simple choices: using only as much light as we need, only where and when we need it. If communities make those choices, a clear night sky full of stars could once again become part of ordinary life rather than a rare experience that people must travel far to enjoy.</p>" },
        ],
        questionGroups: [
          {
            id: 't30-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              { number: 14, promptHtml: 'a reason why a new technology may increase light pollution', answer: { accepted: ['G'] }, explanationHtml: 'Paragraph G: "Because LEDs are so cheap to run, some cities have installed more lights".', locatorParagraph: 'G' },
              { number: 15, promptHtml: 'the financial cost of wasted light', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: "at a cost of billions of dollars a year".', locatorParagraph: 'B' },
              { number: 16, promptHtml: 'a way in which artificial light misleads young animals', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: hatchlings "head inland towards street lights instead".', locatorParagraph: 'C' },
              { number: 17, promptHtml: 'an economic benefit of protecting dark skies', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: dark sky reserves "have become popular with tourists".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't30-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 18, promptHtml: 'Light pollution is mainly a concern for astronomers.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph A: "its effects reach deep into the natural world and into our own health".' },
              { number: 19, promptHtml: 'It is easy to measure how much outdoor lighting affects human health.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph D: its precise role "is difficult to separate".' },
              { number: 20, promptHtml: 'Light pollution is easier to deal with than many other environmental problems.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph E: "Unlike many environmental problems, light pollution is relatively easy to solve."' },
              { number: 21, promptHtml: 'All countries should ban advertising lights at night.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer does not propose a ban on advertising lights.' },
            ],
          },
          {
            id: 't30-r2-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            stemHtml:
              '<p><strong>Reducing light pollution</strong></p><p>Lamps can be {{q22}} so that light is directed only downwards. Lights can be dimmed late at night, and {{q23}} can switch them on only when necessary. Using {{q24}} of light reduces the effect on wildlife and sleep. Some areas have become {{q25}}, where lighting is strictly controlled. However, the area lit at night is still growing by about {{q26}} each year.</p>',
            questions: [
              { number: 22, answer: { accepted: ['shielded'] }, explanationHtml: 'Paragraph E: "Lamps can be shielded".', locatorParagraph: 'E' },
              { number: 23, answer: { accepted: ['motion sensors'] }, explanationHtml: 'Paragraph E: "motion sensors can ensure that lights come on only when they are needed".', locatorParagraph: 'E' },
              { number: 24, answer: { accepted: ['warmer colours', 'warmer colors'] }, explanationHtml: 'Paragraph E: "warmer colours of light can be used".', locatorParagraph: 'E' },
              { number: 25, answer: { accepted: ['dark sky reserves'] }, explanationHtml: 'Paragraph F: "designated as dark sky reserves".', locatorParagraph: 'F' },
              { number: 26, answer: { accepted: ['two per cent', '2 per cent', '2%', 'two percent'] }, explanationHtml: 'Paragraph G: "by around two per cent a year".', locatorParagraph: 'G' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Small loans, big promises',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>In the 1970s, an economics professor in Bangladesh began lending small sums of his own money to poor women in a village near his university, so that they could buy materials for their businesses without borrowing from moneylenders who charged extremely high interest. The loans were tiny, but almost all were repaid. From this experiment grew a bank that would eventually serve millions of borrowers, and a global movement known as microfinance. In 2006, the professor and his bank were jointly awarded the Nobel Peace Prize. By then, similar organisations had been set up in dozens of countries across Asia, Africa and Latin America, and even in some wealthy countries, where they aimed to help people who could not obtain loans from ordinary banks.</p>" },
          { label: 'B', html: "<p>The model was based on several innovations. Borrowers did not need to provide security, such as land or property, which the poor do not have. Instead, loans were made to members of small groups, who met regularly and felt responsible for one another's repayments. Most borrowers were women, partly because they were found to be more reliable in repaying and partly because it was hoped that giving women access to money would improve their position in the family. Repayments were made in small weekly instalments, which made them easier to manage. Loans were usually intended for small businesses, such as buying a cow, a sewing machine or stock for a market stall, and borrowers who repaid successfully could take out larger loans in the future.</p>" },
          { label: 'C', html: "<p>By the early 2000s, microfinance had become enormously popular with governments, charities and international organisations. It seemed to offer a way of reducing poverty that did not depend on endless donations: the poor would lift themselves out of poverty through their own efforts, and the lenders could cover their costs, or even make a profit. Supporters made bold claims, suggesting that microfinance could end poverty within a generation. Large commercial banks and investment funds, seeing the high repayment rates, began to put money into the sector, and some microfinance organisations became highly profitable companies listed on stock markets.</p>" },
          { label: 'D', html: "<p>Rigorous testing of these claims came later. In the 2010s, economists carried out a series of carefully designed studies in several countries, comparing areas where microfinance was offered with similar areas where it was not. The results were disappointing to supporters. Access to small loans did allow some people to start or expand businesses, and it helped families to cope with emergencies, such as illness. But on average, it did not significantly increase incomes, improve health or raise children's school attendance. Many of the new businesses remained very small, and in some cases loans were used to buy household goods rather than to invest, which is not necessarily a bad thing but does not create income. The economists concluded that the effects were real but modest, and far smaller than the early claims had suggested.</p>" },
          { label: 'E', html: "<p>There were also problems as the industry grew. Some lenders, attracted by the prospect of profit, charged high interest rates and pushed loans onto people who could not afford them. In one Indian state in 2010, a wave of over-indebtedness led to protests, and the government introduced strict controls that caused much of the local industry to collapse. Critics argued that microfinance had moved away from its original purpose of helping the poor.</p>" },
          { label: 'F', html: "<p>In my view, the lesson is not that microfinance has failed, but that it was oversold. It is a useful tool, particularly for providing poor families with a safe way to borrow and save, but it is not a solution to poverty on its own. Most poor people are not natural entrepreneurs, any more than most rich people are, and many would benefit more from a secure job than from a loan to start a tiny business. Microfinance works best as one part of a wider approach, alongside education, health care and policies that create employment. Perhaps the most valuable legacy of the movement is its demonstration that poor people can be trusted with credit, an idea that many banks once rejected, and the growth of simple savings services, which research suggests may benefit poor households even more than loans.</p>" },
        ],
        questionGroups: [
          {
            id: 't30-r3-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 3 has six sections, A-F. Choose the correct heading for sections B, C, E and F from the list of headings below.<br/><em>Example: Section A — iv</em><br/><em>Example: Section D — vii</em>',
            bank: [
              { key: 'i', text: 'Growing enthusiasm and ambitious claims' },
              { key: 'ii', text: 'A more modest role for microfinance' },
              { key: 'iii', text: 'How the system worked' },
              { key: 'v', text: 'When profit replaced principle' },
              { key: 'vi', text: 'The role of male borrowers' },
              { key: 'viii', text: 'Microfinance in wealthy countries' },
            ],
            questions: [
              { number: 27, promptHtml: 'Section B', answer: { accepted: ['iii'] }, explanationHtml: 'Section B: "The model was based on several innovations."', locatorParagraph: 'B' },
              { number: 28, promptHtml: 'Section C', answer: { accepted: ['i'] }, explanationHtml: 'Section C: "enormously popular ... Supporters made bold claims".', locatorParagraph: 'C' },
              { number: 29, promptHtml: 'Section E', answer: { accepted: ['v'] }, explanationHtml: 'Section E: lenders "attracted by the prospect of profit ... moved away from its original purpose".', locatorParagraph: 'E' },
              { number: 30, promptHtml: 'Section F', answer: { accepted: ['ii'] }, explanationHtml: 'Section F: "a useful tool ... but it is not a solution to poverty on its own".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't30-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 31, promptHtml: 'Most of the first small loans were repaid.', answer: { accepted: ['YES'] }, explanationHtml: 'Section A: "almost all were repaid".' },
              { number: 32, promptHtml: 'Microfinance has been a complete failure.', answer: { accepted: ['NO'] }, explanationHtml: 'Section F: "the lesson is not that microfinance has failed, but that it was oversold".' },
              { number: 33, promptHtml: 'Poor people are less capable of running businesses than rich people.', answer: { accepted: ['NO'] }, explanationHtml: 'Section F: "Most poor people are not natural entrepreneurs, any more than most rich people are".' },
              { number: 34, promptHtml: 'Many poor people would gain more from regular employment than from a loan.', answer: { accepted: ['YES'] }, explanationHtml: 'Section F: "many would benefit more from a secure job than from a loan".' },
              { number: 35, promptHtml: 'Interest rates on microloans should be controlled by law in all countries.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer mentions controls in one state but gives no general view on legal limits.' },
            ],
          },
          {
            id: 't30-r3-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-J, below.',
            bank: [
              { key: 'A', text: 'did not have to provide security.' },
              { key: 'B', text: 'made repayments easier to manage.' },
              { key: 'C', text: 'helped families deal with emergencies.' },
              { key: 'D', text: 'led to protests and strict controls.' },
              { key: 'E', text: 'increased children\'s school attendance.' },
              { key: 'F', text: 'was awarded to the whole village.' },
              { key: 'G', text: 'were mainly given to men.' },
              { key: 'H', text: 'required large deposits.' },
              { key: 'I', text: 'ended poverty in Bangladesh.' },
              { key: 'J', text: 'were run by the government.' },
            ],
            questions: [
              { number: 36, promptHtml: 'Borrowers in the original model', answer: { accepted: ['A'] }, explanationHtml: 'Section B: "Borrowers did not need to provide security".' },
              { number: 37, promptHtml: 'Small weekly instalments', answer: { accepted: ['B'] }, explanationHtml: 'Section B: "which made them easier to manage".' },
              { number: 38, promptHtml: 'Access to small loans', answer: { accepted: ['C'] }, explanationHtml: 'Section D: "it helped families to cope with emergencies".' },
              { number: 39, promptHtml: 'Over-indebtedness in one Indian state', answer: { accepted: ['D'] }, explanationHtml: 'Section E: it "led to protests, and the government introduced strict controls".' },
            ],
          },
          {
            id: 't30-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 40,
                promptHtml: 'What is the writer\'s main purpose in the passage?',
                options: [
                  { key: 'A', text: 'to argue that microfinance should be abandoned' },
                  { key: 'B', text: 'to give a balanced assessment of microfinance' },
                  { key: 'C', text: 'to describe the life of the founder of microfinance' },
                  { key: 'D', text: 'to explain how banks make a profit' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'The passage describes the origins, popularity, evidence and problems, and concludes with a measured view.',
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
        contextText: 'You will hear a woman joining a fitness centre.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning, Peak Fitness. How can I help?" },
          { speaker: 'B', voice: 'zira', text: "Hi. I'd like to join the gym, please." },
          { speaker: 'A', voice: 'david', text: "Great. I'll just fill in the application form with you. Could I have your full name?" },
          { speaker: 'B', voice: 'zira', text: "Yes, it's Laura Chen." },
          { speaker: 'A', voice: 'david', text: "And your address?" },
          { speaker: 'B', voice: 'zira', text: "It's 58 Beacon Road, Northfield." },
          { speaker: 'A', voice: 'david', text: "And a contact number?" },
          { speaker: 'B', voice: 'zira', text: "Oh seven nine five six, three one two, four four eight." },
          { speaker: 'A', voice: 'david', text: "Thank you. And what do you do for a living?" },
          { speaker: 'B', voice: 'zira', text: "I'm a pharmacist. I work shifts, so I'll need to come at different times." },
          { speaker: 'A', voice: 'david', text: "In that case, I'd recommend the Anytime membership, which gives you access twenty-four hours a day. It's forty-two pounds a month." },
          { speaker: 'B', voice: 'zira', text: "That's fine. Are classes included?" },
          { speaker: 'A', voice: 'david', text: "Yes, all classes are included. Is there anything you're particularly interested in?" },
          { speaker: 'B', voice: 'zira', text: "I'd like to try the swimming classes, and maybe yoga." },
          { speaker: 'A', voice: 'david', text: "OK. Now, do you have any health problems we should know about?" },
          { speaker: 'B', voice: 'zira', text: "I hurt my knee a couple of years ago, running. It's fine now, but I avoid running on hard surfaces." },
          { speaker: 'A', voice: 'david', text: "I'll note that. All new members have a free induction session with a personal trainer. When would suit you?" },
          { speaker: 'B', voice: 'zira', text: "Could I do it next Monday afternoon?" },
          { speaker: 'A', voice: 'david', text: "Yes, how about three o'clock?" },
          { speaker: 'B', voice: 'zira', text: "Perfect." },
          { speaker: 'A', voice: 'david', text: "And how did you hear about us?" },
          { speaker: 'B', voice: 'zira', text: "I saw a leaflet at the library." },
          { speaker: 'A', voice: 'david', text: "Great. Just bring a photo with you on Monday for your membership card." },
        ],
        questionGroups: [
          {
            id: 't30-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Peak Fitness — Membership Application</strong></p>' +
              '<p>Name: Laura {{q1}}<br/>Address: {{q2}}, Northfield<br/>Phone: {{q3}}<br/>Occupation: {{q4}}</p>' +
              '<p>Membership type: {{q5}}<br/>Monthly cost: £{{q6}}<br/>Interested in: swimming classes and {{q7}}</p>' +
              '<p>Health: old injury to the {{q8}}<br/>Induction: next Monday at {{q9}}<br/>Heard about gym from: a leaflet at the {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['chen'] }, explanationHtml: '"it\'s Laura Chen".' },
              { number: 2, answer: { accepted: ['58 beacon road'] }, explanationHtml: '"It\'s 58 Beacon Road, Northfield."' },
              { number: 3, answer: { accepted: ['07956312448', '07956 312448', '07956 312 448'] }, explanationHtml: '"Oh seven nine five six, three one two, four four eight."' },
              { number: 4, answer: { accepted: ['pharmacist'] }, explanationHtml: '"I\'m a pharmacist."' },
              { number: 5, answer: { accepted: ['anytime'] }, explanationHtml: '"I\'d recommend the Anytime membership".' },
              { number: 6, answer: { accepted: ['42', 'forty-two'] }, explanationHtml: '"It\'s forty-two pounds a month."' },
              { number: 7, answer: { accepted: ['yoga'] }, explanationHtml: '"the swimming classes, and maybe yoga".' },
              { number: 8, answer: { accepted: ['knee'] }, explanationHtml: '"I hurt my knee".' },
              { number: 9, answer: { accepted: ['3 pm', '3pm', '3.00', '3', 'three', 'three o\'clock'] }, explanationHtml: '"how about three o\'clock?"' },
              { number: 10, answer: { accepted: ['library'] }, explanationHtml: '"I saw a leaflet at the library."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a guide talking to passengers at the start of a trip on a heritage steam railway.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone, and welcome aboard the Moorvale Steam Railway. My name's Jenny, and I'll be telling you about the line and the stops along the way. If you look at the map in your leaflet, we're starting here at Station A, in Moorvale Town." },
          { speaker: 'A', voice: 'zira', text: "Our first stop, Station B, is at the foot of the hills. It's called Fernley Halt, and it's the best place to get off if you'd like to walk up to the viewpoint. The walk takes about forty minutes, and on a clear day you can see the sea." },
          { speaker: 'A', voice: 'zira', text: "Then comes Station C, which is next to the River Wend. There, you'll find the old watermill, which has been restored and still grinds flour. There's a small bakery beside it that sells bread made from the mill's flour." },
          { speaker: 'A', voice: 'zira', text: "Our final stop, Station D, is called Heathfield Junction. It's the end of the line, and it's where the railway museum is. The museum has a collection of old locomotives, and children can climb into the driver's cab of one of them." },
          { speaker: 'A', voice: 'zira', text: "The station at Heathfield also has the railway workshop, where volunteers repair the engines. You can watch them at work through a viewing window, but only on weekdays." },
          { speaker: 'A', voice: 'zira', text: "Back to Station C for a moment: I should mention that the café there is only open from April to September, so today you'll need to bring your own lunch if you get off there." },
          { speaker: 'A', voice: 'zira', text: "Now, a few practical details. Trains run every ninety minutes throughout the day, and your ticket allows you to get on and off as many times as you like." },
          { speaker: 'A', voice: 'zira', text: "The last train back to Moorvale leaves Heathfield Junction at five fifteen, so please don't miss it." },
          { speaker: 'A', voice: 'zira', text: "Enjoy the journey!" },
        ],
        questionGroups: [
          {
            id: 't30-l2-map',
            type: 'diagram_label',
            instructionHtml: 'Label the map below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: RAILWAY_MAP,
            imageAlt: 'Map of a railway line running from Station A, Moorvale Town, in the south-west, past Station B near some hills, Station C near a river, to Station D in the north-east.',
            imageHotspots: [
              { questionNumber: 11, x: 36, y: 48 },
              { questionNumber: 12, x: 92, y: 36 },
            ],
            questions: [
              { number: 11, answer: { accepted: ['fernley halt', 'fernley'] }, explanationHtml: '"Station B ... It\'s called Fernley Halt".' },
              { number: 12, answer: { accepted: ['heathfield junction', 'heathfield'] }, explanationHtml: '"Station D, is called Heathfield Junction".' },
            ],
          },
          {
            id: 't30-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Stop', 'Attraction', 'Further information'],
              [
                ['Station B', 'walk to the {{q13}}', 'takes about {{q14}}; sea visible on clear days'],
                ['Station C', 'restored {{q15}}', 'bakery sells bread; café open April to {{q16}}'],
                ['Station D', 'railway museum', 'children can sit in the driver\'s {{q17}}; watch volunteers on {{q18}}'],
              ]
            ),
            questions: [
              { number: 13, answer: { accepted: ['viewpoint'] }, explanationHtml: '"walk up to the viewpoint".' },
              { number: 14, answer: { accepted: ['forty minutes', '40 minutes'] }, explanationHtml: '"The walk takes about forty minutes".' },
              { number: 15, answer: { accepted: ['watermill', 'water mill', 'mill'] }, explanationHtml: '"the old watermill, which has been restored".' },
              { number: 16, answer: { accepted: ['september'] }, explanationHtml: '"only open from April to September".' },
              { number: 17, answer: { accepted: ['cab'] }, explanationHtml: '"children can climb into the driver\'s cab".' },
              { number: 18, answer: { accepted: ['weekdays'] }, explanationHtml: '"but only on weekdays".' },
            ],
          },
          {
            id: 't30-l2-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            questions: [
              { number: 19, promptHtml: 'How often do trains run?', answer: { accepted: ['every ninety minutes', 'every 90 minutes', 'ninety minutes', '90 minutes'] }, explanationHtml: '"Trains run every ninety minutes".' },
              { number: 20, promptHtml: 'What time does the last train leave Heathfield Junction?', answer: { accepted: ['5.15', '5:15', '17.15', 'five fifteen', '5.15 pm'] }, explanationHtml: '"The last train back ... leaves Heathfield Junction at five fifteen".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Ben and Priya, talking to a museum curator about the history of space stations.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Welcome to the space gallery. I understand you're preparing a presentation on space stations?" },
          { speaker: 'B', voice: 'david', text: "Yes, for our physics course. We chose it because it combines science, engineering and international politics." },
          { speaker: 'A', voice: 'zira', text: "It certainly does. Where would you like to start?" },
          { speaker: 'C', voice: 'zira2', text: "Could you tell us why this museum decided to create a space gallery? It's quite unusual for a city museum." },
          { speaker: 'A', voice: 'zira', text: "Mainly because a local engineering company made parts for one of the early space stations. We wanted to show that connection. Visitors are often surprised to learn about it." },
          { speaker: 'B', voice: 'david', text: "What's the main purpose of the gallery?" },
          { speaker: 'A', voice: 'zira', text: "To encourage young people, especially girls, to consider careers in science and engineering. We run workshops for schools every week." },
          { speaker: 'C', voice: 'zira2', text: "And what do you think is the most important thing space stations have taught us?" },
          { speaker: 'A', voice: 'zira', text: "How the human body changes in space. Astronauts lose bone and muscle, and their eyesight can be affected. That research is essential if people are ever to travel to Mars." },
          { speaker: 'B', voice: 'david', text: "Why is it so hard to live in space for a long time?" },
          { speaker: 'A', voice: 'zira', text: "The biggest problem is actually radiation, rather than lack of gravity. Outside the Earth's atmosphere, astronauts are exposed to much higher levels." },
          { speaker: 'C', voice: 'zira2', text: "Is this model of the International Space Station accurate?" },
          { speaker: 'A', voice: 'zira', text: "It's to scale, yes, although it was made before the most recent modules were added, so it's slightly out of date." },
          { speaker: 'B', voice: 'david', text: "Could you give us some key dates?" },
          { speaker: 'A', voice: 'zira', text: "The first space station was launched in 1971. Then, the first part of the International Space Station was launched in 1998, and the main construction continued until 2011. People have lived on board continuously since November 2000." },
          { speaker: 'C', voice: 'zira2', text: "What would you say are its main achievements?" },
          { speaker: 'A', voice: 'zira', text: "Two stand out. First, international cooperation: countries that were once rivals have worked together on it for decades. And second, the scientific research, particularly on how the body adapts to space. It hasn't been cheap, and it hasn't led to any new medicines as some people hoped, but those two achievements are real." },
          { speaker: 'B', voice: 'david', text: "And what will happen to it in the future?" },
          { speaker: 'A', voice: 'zira', text: "It's expected to be brought down into the ocean in the early 2030s, and replaced by smaller stations run by private companies." },
        ],
        questionGroups: [
          {
            id: 't30-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Why did the museum create a space gallery?', options: [{ key: 'A', text: 'It received a donation of objects.' }, { key: 'B', text: 'A local company made space station parts.' }, { key: 'C', text: 'Visitors asked for one.' }], answer: { accepted: ['B'] }, explanationHtml: '"Mainly because a local engineering company made parts for one of the early space stations."' },
              { number: 22, promptHtml: 'What is the main purpose of the gallery?', options: [{ key: 'A', text: 'to attract tourists' }, { key: 'B', text: 'to encourage interest in science careers' }, { key: 'C', text: 'to raise money for research' }], answer: { accepted: ['B'] }, explanationHtml: '"To encourage young people ... to consider careers in science and engineering."' },
              { number: 23, promptHtml: 'According to the curator, the most important lesson from space stations concerns', options: [{ key: 'A', text: 'the effects of space on the human body.' }, { key: 'B', text: 'the design of rockets.' }, { key: 'C', text: 'growing food in space.' }], answer: { accepted: ['A'] }, explanationHtml: '"How the human body changes in space."' },
              { number: 24, promptHtml: 'What is the biggest problem for people living in space?', options: [{ key: 'A', text: 'lack of gravity' }, { key: 'B', text: 'radiation' }, { key: 'C', text: 'isolation' }], answer: { accepted: ['B'] }, explanationHtml: '"The biggest problem is actually radiation, rather than lack of gravity."' },
              { number: 25, promptHtml: 'What does the curator say about the model?', options: [{ key: 'A', text: 'It is not to scale.' }, { key: 'B', text: 'It does not show the newest parts.' }, { key: 'C', text: 'It was made by students.' }], answer: { accepted: ['B'] }, explanationHtml: '"it was made before the most recent modules were added".' },
              { number: 26, promptHtml: 'What will happen to the International Space Station?', options: [{ key: 'A', text: 'It will be moved to a higher orbit.' }, { key: 'B', text: 'It will be brought down into the ocean.' }, { key: 'C', text: 'It will become a museum.' }], answer: { accepted: ['B'] }, explanationHtml: '"brought down into the ocean in the early 2030s".' },
            ],
          },
          {
            id: 't30-l3-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR TWO NUMBERS</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 2, label: 'ONE WORD AND/OR TWO NUMBERS' },
            stemHtml: table(
              ['Date', 'Event'],
              [
                ['1971', 'first space station launched'],
                ['{{q27}}', 'main construction of the International Space Station'],
                ['November 2000', 'people began to live on board {{q28}}'],
              ]
            ),
            questions: [
              { number: 27, answer: { accepted: ['1998-2011', '1998 to 2011', '1998 - 2011', '1998–2011'] }, explanationHtml: '"the first part ... was launched in 1998, and the main construction continued until 2011".' },
              { number: 28, answer: { accepted: ['continuously'] }, explanationHtml: '"People have lived on board continuously since November 2000."' },
            ],
          },
          {
            id: 't30-l3-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 29,
                promptHtml: 'Which TWO achievements of the International Space Station does the curator mention?',
                options: [
                  { key: 'A', text: 'international cooperation' },
                  { key: 'B', text: 'low cost' },
                  { key: 'C', text: 'new medicines' },
                  { key: 'D', text: 'research on the body in space' },
                  { key: 'E', text: 'tourist visits' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: '"international cooperation" and "the scientific research, particularly on how the body adapts". It "hasn\'t been cheap" and has not led to new medicines.',
              },
            ],
          },
          {
            id: 't30-l3-mc2',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 30, promptHtml: 'Why did the students choose this topic?', options: [{ key: 'A', text: 'It combines several different fields.' }, { key: 'B', text: 'Their tutor suggested it.' }, { key: 'C', text: 'They want to become astronauts.' }], answer: { accepted: ['A'] }, explanationHtml: '"it combines science, engineering and international politics".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about how different animals see colour.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today I'm going to talk about colour vision in animals, and how it varies from one species to another." },
          { speaker: 'A', voice: 'david', text: "It's easy to assume that other animals see the world as we do. But colour isn't a property of objects themselves. It's created by the brain, using signals from cells in the eye called cones, each of which responds to a different range of light. Humans have three types of cone, which allows us to see a wide range of colours." },
          { speaker: 'A', voice: 'david', text: "Most mammals, by contrast, have only two types of cone. It's thought that early mammals were active mainly at night, when colour vision is of little use, and they lost some of the cone types their ancestors had. Primates, including humans, later regained a third type, perhaps because it helped them to spot ripe fruit among green leaves." },
          { speaker: 'A', voice: 'david', text: "Many birds, reptiles and fish, which never went through a nocturnal stage, have four types of cone, and many can see ultraviolet light, which is invisible to us. Some birds have patterns on their feathers that can only be seen in ultraviolet, which they use to choose a mate." },
          { speaker: 'A', voice: 'david', text: "Research in this area has also changed ideas about camouflage. An animal that looks well hidden to a human observer may be clearly visible to a predator with different colour vision, and vice versa." },
          { speaker: 'A', voice: 'david', text: "Let me give you some specific examples, which you can see summarised in the table on your handout. First, dogs. Like most mammals, they have two types of cone, which means they see mainly blues and yellows. They can't easily tell red from green. A red ball on green grass is actually quite hard for a dog to see." },
          { speaker: 'A', voice: 'david', text: "Next, honeybees. Bees also have three types of cone, but their range is shifted compared with ours: they can see ultraviolet but not red. Many flowers have ultraviolet markings, which guide bees towards the nectar." },
          { speaker: 'A', voice: 'david', text: "Then there's the mantis shrimp, a small sea creature which has as many as sixteen types of light-sensitive cell. For a long time, scientists assumed it must see an extraordinary range of colours. In fact, experiments show it's rather poor at distinguishing similar colours. It seems to recognise colours very quickly rather than very accurately." },
          { speaker: 'A', voice: 'david', text: "And finally, cats. Cats have relatively few cones, but a large number of the cells that work in low light, which gives them excellent night vision, about six times better than ours." },
        ],
        questionGroups: [
          {
            id: 't30-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'According to the lecturer, colour is', options: [{ key: 'A', text: 'a property of objects.' }, { key: 'B', text: 'produced by the brain.' }, { key: 'C', text: 'the same for all animals.' }], answer: { accepted: ['B'] }, explanationHtml: '"colour isn\'t a property of objects themselves. It\'s created by the brain".' },
              { number: 32, promptHtml: 'Why do most mammals have only two types of cone?', options: [{ key: 'A', text: 'Their ancestors were active at night.' }, { key: 'B', text: 'They live mainly underground.' }, { key: 'C', text: 'They do not eat fruit.' }], answer: { accepted: ['A'] }, explanationHtml: '"early mammals were active mainly at night ... they lost some of the cone types".' },
              { number: 33, promptHtml: 'Why may primates have regained a third type of cone?', options: [{ key: 'A', text: 'to recognise other primates' }, { key: 'B', text: 'to find ripe fruit' }, { key: 'C', text: 'to avoid predators' }], answer: { accepted: ['B'] }, explanationHtml: '"perhaps because it helped them to spot ripe fruit".' },
              { number: 34, promptHtml: 'Some birds use ultraviolet patterns on their feathers to', options: [{ key: 'A', text: 'hide from predators.' }, { key: 'B', text: 'choose a partner.' }, { key: 'C', text: 'find their way.' }], answer: { accepted: ['B'] }, explanationHtml: '"which they use to choose a mate".' },
              { number: 35, promptHtml: 'What has research shown about camouflage?', options: [{ key: 'A', text: 'It works equally well against all predators.' }, { key: 'B', text: 'Its effectiveness depends on the viewer\'s vision.' }, { key: 'C', text: 'It is only found in insects.' }], answer: { accepted: ['B'] }, explanationHtml: '"An animal that looks well hidden to a human observer may be clearly visible to a predator with different colour vision".' },
            ],
          },
          {
            id: 't30-l4-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Animal', 'Colour vision', 'Comments'],
              [
                ['Dog', 'two types of cone', 'finds it hard to tell red from {{q36}}'],
                ['Honeybee', 'three types of cone', 'can see ultraviolet but not {{q37}}'],
                ['Mantis shrimp', 'up to {{q38}} types of cell', 'recognises colours quickly but not {{q39}}'],
                ['Cat', 'few cones', 'night vision about {{q40}} times better than humans'],
              ]
            ),
            questions: [
              { number: 36, answer: { accepted: ['green'] }, explanationHtml: '"They can\'t easily tell red from green."' },
              { number: 37, answer: { accepted: ['red'] }, explanationHtml: '"they can see ultraviolet but not red".' },
              { number: 38, answer: { accepted: ['16', 'sixteen'] }, explanationHtml: '"as many as sixteen types of light-sensitive cell".' },
              { number: 39, answer: { accepted: ['accurately'] }, explanationHtml: '"very quickly rather than very accurately".' },
              { number: 40, answer: { accepted: ['6', 'six'] }, explanationHtml: '"about six times better than ours".' },
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
        '<p>The graph below shows sales of four types of new car in one country between 2010 and 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'New car sales by type, 2010-2022 (thousands)',
        unit: 'thousand',
        categories: ['2010', '2012', '2014', '2016', '2018', '2020', '2022'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Sales (thousands)',
        series: [
          { name: 'Petrol', data: [980, 1010, 1050, 1020, 940, 690, 560] },
          { name: 'Diesel', data: [760, 820, 850, 700, 480, 240, 110] },
          { name: 'Hybrid', data: [20, 35, 60, 110, 180, 260, 340] },
          { name: 'Electric', data: [0, 2, 8, 15, 40, 110, 270] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people believe that news reports focus too much on negative events. Others think that it is the duty of the media to report problems.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
