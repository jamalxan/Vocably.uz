// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION } from './_html.mjs';

const UMBRELLA_DIAGRAM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="420" fill="#f7f9fb"/>
  <text x="200" y="24" font-weight="bold" fill="#333">A modern folding umbrella</text>
  <path d="M60 170 Q300 -50 540 170 Z" fill="#90caf9" stroke="#1565c0" stroke-width="2"/>
  <path d="M300 60 L60 170 M300 60 L180 170 M300 60 L420 170 M300 60 L540 170" stroke="#37474f" stroke-width="2"/>
  <path d="M300 230 L150 150 M300 230 L450 150" stroke="#78909c" stroke-width="2"/>
  <rect x="290" y="220" width="20" height="22" fill="#546e7a"/>
  <rect x="296" y="50" width="8" height="310" fill="#455a64"/>
  <path d="M300 360 Q300 400 270 400 Q250 400 250 380" stroke="#6d4c41" stroke-width="10" fill="none"/>
  <circle cx="300" cy="46" r="7" fill="#263238"/>
</svg>`);

export default {
  slug: 'vocably-practice-test-33',
  title: 'Vocably Practice Test 33',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'A short history of the umbrella',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>Few everyday objects have changed so little in their basic form over so many centuries as the umbrella. A canopy supported by ribs, attached to a central stick, and able to be opened and closed: the principle would be recognised by people who lived thousands of years ago. What has changed, remarkably, is the umbrella's purpose. For most of its history, it was used not to keep off the rain but to provide shade from the sun, and it was a symbol of power rather than a practical tool for ordinary people.</p>" },
          { label: 'B', html: "<p>Carvings and paintings from ancient Egypt, Assyria and India show servants holding sunshades over the heads of kings and nobles. In these societies, the shade itself was a mark of rank: only the most important people were permitted to have one carried above them, and in some kingdoms the number of layers on a ruler's sunshade indicated his status. In ancient Greece and Rome, sunshades were used mainly by wealthy women, and were often carried by slaves.</p>" },
          { label: 'C', html: "<p>It was in China, according to most historians, that the umbrella was first made waterproof. Early Chinese umbrellas were made of silk, which was later replaced by paper treated with oil or wax so that it would repel water. Chinese craftsmen also developed collapsible frames, and by the fourth century there are records of umbrellas that could be folded when not in use. The design spread to Korea and Japan, where oiled-paper umbrellas with bamboo frames are still made by hand today, and are valued both as practical objects and as works of art.</p>" },
          { label: 'D', html: "<p>In Europe, the sunshade largely disappeared after the fall of Rome, surviving mainly as a ceremonial object in the Christian church. It returned as a fashion accessory for women in Italy and France in the sixteenth and seventeenth centuries, and the French developed lighter models which could be carried by the user rather than by a servant. Men, however, regarded umbrellas as unmanly. A gentleman caught in the rain was expected either to get wet or to hire a carriage.</p>" },
          { label: 'E', html: "<p>The person usually credited with changing this attitude in Britain is Jonas Hanway, a merchant and writer who had travelled widely in Persia, where he had seen umbrellas in use. From the 1750s, he carried one through the streets of London for some thirty years. He was mocked and shouted at, particularly by the drivers of hired carriages, who feared that if umbrellas became popular they would lose business. By the time of his death, however, umbrellas had become common among men as well as women, and for a time they were even known in English as 'Hanways'.</p>" },
          { label: 'F', html: "<p>Early European umbrellas were heavy and awkward. Their ribs were made of whalebone or cane, and the cover was usually oiled cloth or silk, so that a large umbrella could weigh several kilograms, and it often became even heavier when wet. The decisive improvement came in 1852, when an English manufacturer named Samuel Fox introduced a frame with ribs made of steel. His design, which used a U-shaped cross-section to give strength with little weight, was lighter, stronger and cheaper than anything before it, and it remains the basis of most umbrella frames today.</p>" },
          { label: 'G', html: "<p>The next major development was the folding umbrella. In 1928, a German engineer named Hans Haupt, who had been injured in the First World War and walked with a stick, designed a small umbrella with a shaft that could be shortened like a telescope, so that it fitted into a bag. Folding umbrellas became hugely popular after the Second World War, and today they account for a large share of the hundreds of millions of umbrellas sold around the world each year.</p>" },
          { label: 'H', html: "<p>The structure of a modern folding umbrella is more complex than it appears. The waterproof cover, called the canopy, is usually made of nylon or polyester. It is supported by thin metal ribs, which are hinged at the top of the shaft. Below the ribs are shorter rods called stretchers, which connect each rib to a sliding piece known as the runner. When the runner is pushed up the shaft, the stretchers push the ribs outwards and the canopy opens; a small spring catch holds the runner in place. At the top, a cap called the ferrule protects the point where the ribs meet, while at the bottom is a curved handle, traditionally made of wood. Some modern umbrellas also include a second, larger spring that opens the canopy automatically at the press of a button, a feature that has become common on folding models.</p>" },
        ],
        questionGroups: [
          {
            id: 't33-r1-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 1 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              { number: 1, promptHtml: 'the reason a group of workers opposed the use of umbrellas', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: carriage drivers "feared that if umbrellas became popular they would lose business".', locatorParagraph: 'E' },
              { number: 2, promptHtml: 'a change in the main function of the umbrella', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: "it was used not to keep off the rain but to provide shade from the sun".', locatorParagraph: 'A' },
              { number: 3, promptHtml: 'a reference to umbrellas that are still produced using traditional methods', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: "oiled-paper umbrellas with bamboo frames are still made by hand today".', locatorParagraph: 'C' },
              { number: 4, promptHtml: 'the way the size of a sunshade could show a person\'s importance', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: "the number of layers on a ruler\'s sunshade indicated his status".', locatorParagraph: 'B' },
            ],
          },
          {
            id: 't33-r1-nations',
            type: 'matching_features',
            instructionHtml: 'Look at the following developments and the list of nationalities below. Match each development with the correct nationality, <strong>A-F</strong>.',
            bank: [
              { key: 'A', text: 'Chinese' },
              { key: 'B', text: 'Persian' },
              { key: 'C', text: 'French' },
              { key: 'D', text: 'British' },
              { key: 'E', text: 'German' },
              { key: 'F', text: 'Greek' },
            ],
            questions: [
              { number: 5, promptHtml: 'the first umbrella designed to keep out water', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: "It was in China ... that the umbrella was first made waterproof."', locatorParagraph: 'C' },
              { number: 6, promptHtml: 'a strong but light frame made of metal', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph F: Samuel Fox, "an English manufacturer".', locatorParagraph: 'F' },
              { number: 7, promptHtml: 'an umbrella that could be made shorter', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph G: "a German engineer named Hans Haupt".', locatorParagraph: 'G' },
              { number: 8, promptHtml: 'sunshades that users could carry themselves', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: "the French developed lighter models which could be carried by the user".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't33-r1-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: UMBRELLA_DIAGRAM,
            imageAlt: 'Diagram of an open umbrella: a blue cover on top, thin dark rods radiating from the top of a central pole, shorter rods lower down connecting to a small sliding block on the pole, a small cap at the very top, and a curved handle at the bottom.',
            imageHotspots: [
              { questionNumber: 9, x: 18, y: 34 },
              { questionNumber: 10, x: 58, y: 25 },
              { questionNumber: 11, x: 65, y: 47 },
              { questionNumber: 12, x: 54, y: 55 },
              { questionNumber: 13, x: 54, y: 9 },
            ],
            questions: [
              { number: 9, answer: { accepted: ['canopy'] }, explanationHtml: 'Paragraph H: "The waterproof cover, called the canopy".' },
              { number: 10, answer: { accepted: ['ribs', 'metal ribs'] }, explanationHtml: 'Paragraph H: "supported by thin metal ribs".' },
              { number: 11, answer: { accepted: ['stretchers'] }, explanationHtml: 'Paragraph H: "shorter rods called stretchers".' },
              { number: 12, answer: { accepted: ['runner'] }, explanationHtml: 'Paragraph H: "a sliding piece known as the runner".' },
              { number: 13, answer: { accepted: ['ferrule'] }, explanationHtml: 'Paragraph H: "a cap called the ferrule".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Turning back the clocks',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>Twice a year, in around seventy countries, hundreds of millions of people change their clocks by an hour: forward in spring and back again in autumn. The practice, known as daylight saving time or summer time, is so familiar that many people give it little thought, apart from complaining about losing an hour's sleep. Yet it has been controversial since it was first proposed, and in recent years the arguments against it have grown stronger.</p>" },
          { label: 'B', html: "<p>The idea is often attributed to the American statesman Benjamin Franklin, who, while living in Paris in 1784, wrote a letter to a newspaper suggesting that Parisians could save money on candles by getting up earlier. His letter, however, was a joke, and he did not propose changing the clocks. The first serious proposal came from a New Zealand entomologist, George Hudson, who in 1895 suggested a two-hour shift so that he would have more daylight after work to collect insects. In Britain, a builder named William Willett, who was annoyed to see curtains closed on sunny summer mornings, campaigned for the idea from 1907 until his death, without success.</p>" },
          { label: 'C', html: "<p>It took a war to turn the idea into law. In 1916, Germany became the first country to introduce daylight saving on a national scale, in order to save coal needed for the war effort. Britain and many other countries followed within weeks, and the United States adopted it in 1918. After the war, several countries abandoned the practice, only to reintroduce it during the Second World War. In the 1970s, when oil prices rose sharply, many more countries adopted it in the hope of reducing energy consumption. Since then, the pattern around the world has become remarkably varied. Most countries close to the equator have never used daylight saving, because the length of the day changes very little during the year, while several countries that once used it, including Russia and a number of countries in Asia, have since abandoned it.</p>" },
          { label: 'D', html: "<p>Whether daylight saving actually saves energy is far from clear. In the early twentieth century, when electricity was used mainly for lighting, an extra hour of evening daylight probably did reduce consumption. Today, lighting accounts for a much smaller share of energy use, and any savings may be cancelled out by other effects: in hot regions, for example, longer sunny evenings can increase the use of air conditioning. Studies of the effects on energy consumption have reached conflicting conclusions, and most find that the overall difference is very small.</p>" },
          { label: 'E', html: "<p>Supporters point to other benefits. Lighter evenings encourage people to spend more time outdoors, which is good for health and for businesses such as shops, restaurants and sports facilities. Some research also suggests that road accidents fall when evenings are lighter, because more people are travelling home in daylight. Many people simply enjoy the long summer evenings, and polls in several countries show strong support for keeping them.</p>" },
          { label: 'F', html: "<p>The main arguments against daylight saving concern the change itself. The human body clock does not adjust instantly, and the loss of an hour in spring affects sleep for several days. Studies have reported a small but measurable increase in heart attacks and workplace injuries in the days immediately after the spring change. Farmers have long complained that animals, which do not follow clocks, are disturbed by the sudden shift in their feeding and milking routines. Sleep scientists add that winter mornings under permanent summer time would remain dark until late in many northern regions, which could make it harder for people, especially teenagers, to wake up.</p>" },
          { label: 'G', html: "<p>In 2019, the European Parliament voted to end the seasonal clock change, leaving each member country free to choose whether to remain permanently on summer time or on winter time. The decision, however, has not been put into effect, largely because countries could not agree on which time to adopt, and there were fears that neighbouring countries might end up in different time zones. The debate continues, and it seems that, for the time being at least, the clocks will continue to go forward and back, much as they have done for more than a century, and people will go on complaining about the lost hour of sleep every spring.</p>" },
        ],
        questionGroups: [
          {
            id: 't33-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for paragraphs B-G from the list of headings below.<br/><em>Example: Paragraph A — ii</em>',
            bank: [
              { key: 'i', text: 'Doubts about the main justification' },
              { key: 'iii', text: 'Early suggestions that were not adopted' },
              { key: 'iv', text: 'The positive effects on daily life' },
              { key: 'v', text: 'A plan to end the practice that has stalled' },
              { key: 'vi', text: 'The problems caused by changing the clocks' },
              { key: 'vii', text: 'The influence of international conflicts' },
              { key: 'viii', text: 'The effect on international trade' },
              { key: 'ix', text: 'Different time zones around the world' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph B', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph B: Franklin\'s joke, Hudson\'s proposal and Willett\'s unsuccessful campaign.', locatorParagraph: 'B' },
              { number: 15, promptHtml: 'Paragraph C', answer: { accepted: ['vii'] }, explanationHtml: 'Paragraph C: "It took a war to turn the idea into law."', locatorParagraph: 'C' },
              { number: 16, promptHtml: 'Paragraph D', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph D: "Whether daylight saving actually saves energy is far from clear."', locatorParagraph: 'D' },
              { number: 17, promptHtml: 'Paragraph E', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph E: time outdoors, fewer accidents, enjoyable evenings.', locatorParagraph: 'E' },
              { number: 18, promptHtml: 'Paragraph F', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph F: "The main arguments against daylight saving concern the change itself."', locatorParagraph: 'F' },
              { number: 19, promptHtml: 'Paragraph G', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph G: the 2019 vote "has not been put into effect".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't33-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 20, promptHtml: 'Benjamin Franklin seriously proposed changing the clocks in summer.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B: "His letter, however, was a joke, and he did not propose changing the clocks."' },
              { number: 21, promptHtml: 'George Hudson wanted more daylight for his hobby.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph B: "so that he would have more daylight after work to collect insects".' },
              { number: 22, promptHtml: 'William Willett lived to see daylight saving introduced in Britain.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B: he campaigned "until his death, without success"; Britain adopted it in 1916 (Paragraph C).' },
              { number: 23, promptHtml: 'Germany introduced daylight saving to reduce the use of coal.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph C: "in order to save coal needed for the war effort".' },
              { number: 24, promptHtml: 'Most studies show that daylight saving leads to large energy savings.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph D: "most find that the overall difference is very small".' },
              { number: 25, promptHtml: 'Restaurants make more profit in countries without daylight saving.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph E mentions benefits to restaurants but makes no comparison with countries without it.' },
              { number: 26, promptHtml: 'Some people are concerned that the 2019 decision could create differences between neighbouring countries.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph G: "there were fears that neighbouring countries might end up in different time zones".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Do plants talk to each other?',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Plants cannot run away from danger, and for a long time they were regarded as passive organisms that simply grew where they were planted and suffered whatever happened to them. Over the past few decades, however, researchers have discovered that plants are far more active than they appear. They detect changes in their surroundings, respond to attacks, and, according to some scientists, exchange information with one another. Whether this can properly be called communication is one of the more lively debates in modern biology. The question matters not only to scientists but also to farmers, gardeners and foresters, because the ways in which plants defend themselves could offer new methods of protecting crops without relying so heavily on chemicals.</p>" },
          { label: '', html: "<p>The first evidence came in the early 1980s, when researchers in the United States reported that willow trees attacked by caterpillars appeared to warn nearby trees that were not under attack. The undamaged trees produced chemicals in their leaves that made them less nutritious to insects, even though they had no physical connection with the damaged ones. The researchers suggested that the damaged trees were releasing chemicals into the air which the others could detect. The idea was met with scepticism, and critics pointed out weaknesses in the experimental design, but later studies confirmed that many plants do release airborne chemicals when they are damaged.</p>" },
          { label: '', html: "<p>One of the best-studied examples involves sagebrush, a shrub found in the western United States. The ecologist Richard Karban found that when he cut the leaves of sagebrush plants, wild tobacco plants growing nearby suffered less damage from insects, apparently because they responded to the chemicals released by the cut sagebrush. Later, he showed that sagebrush plants respond more strongly to signals from their own close relatives than to those from unrelated plants of the same species, which some researchers have compared to recognising family members.</p>" },
          { label: '', html: "<p>Plants may also be able to send information below ground. In the 1990s, the Canadian forest ecologist Suzanne Simard used radioactive forms of carbon to show that trees in a forest were connected by networks of fungi growing among their roots, and that sugars could pass from one tree to another through these networks. Her work suggested that large, old trees might support younger ones growing in the shade. The idea of a 'wood wide web' attracted enormous public interest, although some scientists now argue that the evidence for trees deliberately helping each other has been overstated.</p>" },
          { label: '', html: "<p>Other researchers have focused on how plants sense their environment. The plant scientists Heidi Appel and Rex Cocroft recorded the vibrations made by caterpillars chewing leaves and played them back to plants of the same species that had never been attacked. The plants that heard the recordings produced more of the chemicals they use to defend themselves than plants that were exposed to silence or to the vibrations of wind. The ecologist Monica Gagliano has reported that the roots of pea plants grow towards the sound of running water, even when no water is present in the soil. Findings such as these remain controversial, and some have proved difficult for other laboratories to repeat, but they have encouraged researchers to take the sensory abilities of plants much more seriously.</p>" },
          { label: '', html: "<p>These findings raise difficult questions about language. Critics argue that words such as 'talk', 'warn' and 'help' suggest that plants have intentions, which they cannot have without a brain. A damaged plant, they say, releases chemicals for its own benefit, perhaps to send signals to its own distant leaves or to attract insects that eat its attackers, and neighbouring plants simply take advantage of the information, rather as a person might overhear a conversation not intended for them. Supporters reply that communication in biology does not require intention, only that one organism produces a signal and another responds to it.</p>" },
          { label: '', html: "<p>Whatever words are used, the research has practical implications. If farmers could trigger plants' natural defences before pests arrive, for example by spraying crops with the chemicals that damaged plants release, they might be able to reduce their use of pesticides. Field trials of this approach are already under way, and although the results so far have been mixed, many scientists believe that understanding how plants sense and respond to their surroundings could transform the way crops are grown.</p>" },
        ],
        questionGroups: [
          {
            id: 't33-r3-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-G, below.',
            bank: [
              { key: 'A', text: 'was criticised for the way the experiment was carried out.' },
              { key: 'B', text: 'may have been exaggerated.' },
              { key: 'C', text: 'is only possible for animals with brains.' },
              { key: 'D', text: 'could help to reduce the use of chemicals on farms.' },
              { key: 'E', text: 'is controlled entirely by the weather.' },
              { key: 'F', text: 'has been confirmed in all species of tree.' },
              { key: 'G', text: 'only takes place between related plants.' },
            ],
            questions: [
              { number: 27, promptHtml: 'The research on willow trees in the early 1980s', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 2: "critics pointed out weaknesses in the experimental design".' },
              { number: 28, promptHtml: 'The claim that trees deliberately help each other', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 4: "the evidence for trees deliberately helping each other has been overstated".' },
              { number: 29, promptHtml: 'According to critics, having intentions', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 6: plants cannot have intentions "without a brain".' },
              { number: 30, promptHtml: 'Triggering plants\' natural defences in advance', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 7: farmers "might be able to reduce their use of pesticides".' },
            ],
          },
          {
            id: 't33-r3-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            stemHtml: table(
              ['Researcher(s)', 'Plants studied', 'Method', 'Finding'],
              [
                ['US researchers (1980s)', 'willow trees', 'observed trees attacked by {{q31}}', 'undamaged trees made their leaves less {{q32}}'],
                ['Richard Karban', 'sagebrush and wild tobacco', 'cut sagebrush leaves', 'responses stronger to signals from {{q33}}'],
                ['Suzanne Simard', 'forest trees', 'used radioactive forms of {{q34}}', '{{q35}} passed between trees through fungi'],
                ['Heidi Appel and Rex Cocroft', 'plants never attacked', 'played recordings of {{q36}}', 'plants produced more {{q37}}'],
                ['Monica Gagliano', 'pea plants', 'observed roots', 'roots grew towards the sound of {{q38}}'],
              ]
            ) + '<p>Critics compare neighbouring plants to a person who might {{q39}} a conversation. Chemicals released by damaged plants are already being tested in {{q40}}.</p>',
            questions: [
              { number: 31, answer: { accepted: ['caterpillars'] }, explanationHtml: 'Paragraph 2: "willow trees attacked by caterpillars".' },
              { number: 32, answer: { accepted: ['nutritious'] }, explanationHtml: 'Paragraph 2: "chemicals ... that made them less nutritious to insects".' },
              { number: 33, answer: { accepted: ['close relatives', 'their close relatives', 'own close relatives'] }, explanationHtml: 'Paragraph 3: they "respond more strongly to signals from their own close relatives".' },
              { number: 34, answer: { accepted: ['carbon'] }, explanationHtml: 'Paragraph 4: "used radioactive forms of carbon".' },
              { number: 35, answer: { accepted: ['sugars'] }, explanationHtml: 'Paragraph 4: "sugars could pass from one tree to another".' },
              { number: 36, answer: { accepted: ['vibrations', 'chewing vibrations', 'caterpillars chewing leaves'] }, explanationHtml: 'Paragraph 5: they "recorded the vibrations made by caterpillars chewing leaves and played them back".' },
              { number: 37, answer: { accepted: ['chemicals', 'defence chemicals'] }, explanationHtml: 'Paragraph 5: plants "produced more of the chemicals they use to defend themselves".' },
              { number: 38, answer: { accepted: ['running water', 'water'] }, explanationHtml: 'Paragraph 5: "grow towards the sound of running water".' },
              { number: 39, answer: { accepted: ['overhear'] }, explanationHtml: 'Paragraph 6: "as a person might overhear a conversation not intended for them".' },
              { number: 40, answer: { accepted: ['field trials'] }, explanationHtml: 'Paragraph 7: "Field trials of this approach are already under way".' },
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
        contextText: 'You will hear a man phoning to book a whale-watching boat trip.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, Ocean Spirit Boat Trips. How can I help?" },
          { speaker: 'B', voice: 'david', text: "Hello. I'd like to book a whale-watching trip for next week, please. We're on holiday in the area." },
          { speaker: 'A', voice: 'zira', text: "Lovely. We have two trips. The short trip lasts two hours and stays fairly close to the coast. The long trip is five hours and goes out much further, where we're more likely to see the larger whales." },
          { speaker: 'B', voice: 'david', text: "We've got two young children, so I think five hours would be too much. Let's go for the short one." },
          { speaker: 'A', voice: 'zira', text: "Good choice for families. And which day would you like?" },
          { speaker: 'B', voice: 'david', text: "We were thinking of Wednesday, but I see the forecast isn't good. Is Thursday possible?" },
          { speaker: 'A', voice: 'zira', text: "Thursday's fine. There's a trip at ten and one at two thirty." },
          { speaker: 'B', voice: 'david', text: "The morning, please. The children are better in the mornings." },
          { speaker: 'A', voice: 'zira', text: "OK. So that's Thursday at ten. Can I take your name?" },
          { speaker: 'B', voice: 'david', text: "Yes, it's Martin Delacroix. That's D-E-L-A-C-R-O-I-X." },
          { speaker: 'A', voice: 'zira', text: "Thank you. And how many people altogether?" },
          { speaker: 'B', voice: 'david', text: "Two adults and two children. The children are six and nine." },
          { speaker: 'A', voice: 'zira', text: "The adult price is thirty-two pounds, and children under twelve are eighteen. So that comes to a hundred pounds in total." },
          { speaker: 'B', voice: 'david', text: "That's fine. Where do we meet?" },
          { speaker: 'A', voice: 'zira', text: "At the harbour, next to the lifeboat station. Please arrive twenty minutes before departure, so that we can give everyone a safety briefing." },
          { speaker: 'B', voice: 'david', text: "What should we bring?" },
          { speaker: 'A', voice: 'zira', text: "It can be cold out at sea, even in summer, so bring warm clothes and a waterproof jacket. We provide life jackets for everyone. And I'd recommend binoculars, if you have them." },
          { speaker: 'B', voice: 'david', text: "What happens if the weather's bad on the day?" },
          { speaker: 'A', voice: 'zira', text: "If we have to cancel, we'll send you a text message by eight o'clock that morning, and you can either move to another day or have a full refund." },
          { speaker: 'B', voice: 'david', text: "And can I have your phone number, in case we're delayed?" },
          { speaker: 'A', voice: 'zira', text: "It's oh one seven three six, five five nine, two four one." },
        ],
        questionGroups: [
          {
            id: 't33-l1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 1, promptHtml: 'Which trip does the man choose?', options: [{ key: 'A', text: 'a two-hour trip near the coast' }, { key: 'B', text: 'a five-hour trip further out' }, { key: 'C', text: 'an evening trip' }], answer: { accepted: ['A'] }, explanationHtml: '"I think five hours would be too much. Let\'s go for the short one." The short trip lasts two hours.' },
              { number: 2, promptHtml: 'Why does the man not book for Wednesday?', options: [{ key: 'A', text: 'The trip is full.' }, { key: 'B', text: 'The weather may be bad.' }, { key: 'C', text: 'The children are busy.' }], answer: { accepted: ['B'] }, explanationHtml: '"I see the forecast isn\'t good."' },
            ],
          },
          {
            id: 't33-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Ocean Spirit Boat Trips — Booking</strong></p>' +
              '<p>Date and time: Thursday, {{q3}}<br/>Name: Martin {{q4}}<br/>Number of people: 2 adults, 2 children<br/>Total cost: £{{q5}}</p>' +
              '<p>Meeting point: the harbour, next to the {{q6}}<br/>Arrive {{q7}} before departure for a safety briefing</p>' +
              '<p>Bring: warm clothes, a waterproof jacket and {{q8}}</p>' +
              '<p>If cancelled: a {{q9}} will be sent by 8 am<br/>Company phone: {{q10}}</p>',
            questions: [
              { number: 3, answer: { accepted: ['10 am', '10.00', '10:00', 'ten', '10', '10 o\'clock', 'ten o\'clock'] }, explanationHtml: '"So that\'s Thursday at ten."' },
              { number: 4, answer: { accepted: ['delacroix'] }, explanationHtml: 'Spelled "D-E-L-A-C-R-O-I-X".' },
              { number: 5, answer: { accepted: ['100', 'a hundred', 'one hundred'] }, explanationHtml: '"So that comes to a hundred pounds in total."' },
              { number: 6, answer: { accepted: ['lifeboat station'] }, explanationHtml: '"At the harbour, next to the lifeboat station."' },
              { number: 7, answer: { accepted: ['20 minutes', 'twenty minutes'] }, explanationHtml: '"arrive twenty minutes before departure".' },
              { number: 8, answer: { accepted: ['binoculars'] }, explanationHtml: '"I\'d recommend binoculars". Life jackets are provided.' },
              { number: 9, answer: { accepted: ['text message', 'text'] }, explanationHtml: '"we\'ll send you a text message by eight o\'clock".' },
              { number: 10, answer: { accepted: ['01736559241', '01736 559241', '01736 559 241'] }, explanationHtml: '"oh one seven three six, five five nine, two four one".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a radio interview about a new bicycle-sharing scheme in the city of Linford.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Today I'm talking to Dev Patel, who manages Linford's new bike-share scheme, which starts next month. Dev, how will it work?" },
          { speaker: 'B', voice: 'david', text: "It's very simple. There will be around eight hundred bikes at sixty docking stations across the city. You unlock a bike using an app on your phone, ride it wherever you want, and leave it at any station." },
          { speaker: 'A', voice: 'zira', text: "What about people who don't have a smartphone?" },
          { speaker: 'B', voice: 'david', text: "They can buy a membership card from the library or the main bus station, and use that instead." },
          { speaker: 'A', voice: 'zira', text: "How much will it cost?" },
          { speaker: 'B', voice: 'david', text: "A single ride of up to thirty minutes is one pound fifty. But most regular users will buy an annual membership, which is sixty pounds and includes unlimited rides of up to forty-five minutes." },
          { speaker: 'A', voice: 'zira', text: "Are the bikes electric?" },
          { speaker: 'B', voice: 'david', text: "About a quarter of them are, because Linford has some quite steep hills, particularly around the university. The electric bikes cost a little more to use." },
          { speaker: 'A', voice: 'zira', text: "Some people have raised concerns about safety." },
          { speaker: 'B', voice: 'david', text: "Yes, and we take that seriously. All the bikes have lights that come on automatically, and we're working with the council, which is building twelve kilometres of new protected cycle lanes this year." },
          { speaker: 'A', voice: 'zira', text: "What do users need to do?" },
          { speaker: 'B', voice: 'david', text: "There are a few things we ask. Before you set off, please check the brakes and the tyres. It only takes a few seconds. If you notice a problem, report it in the app, so we can repair the bike. And when you finish, make sure the bike is properly locked into the dock, otherwise the timer keeps running and you'll be charged." },
          { speaker: 'A', voice: 'zira', text: "Do riders have to wear helmets?" },
          { speaker: 'B', voice: 'david', text: "It's not a legal requirement here, so we don't insist on it, although we do recommend it. And we don't provide them, for hygiene reasons." },
          { speaker: 'A', voice: 'zira', text: "Who do you think will use the scheme most?" },
          { speaker: 'B', voice: 'david', text: "In other cities, the biggest group of users is commuters, people travelling to and from work. We also expect a lot of students, and tourists at weekends. And what's interesting is that these schemes often encourage people who haven't cycled for years to start again." },
          { speaker: 'A', voice: 'zira', text: "And how is it being paid for?" },
          { speaker: 'B', voice: 'david', text: "Mainly by a sponsorship deal with a local energy company, whose name will be on the bikes. The council contributed to the cost of the docking stations, but the scheme is expected to cover its running costs from fees within three years." },
          { speaker: 'A', voice: 'zira', text: "Dev Patel, thank you very much." },
        ],
        questionGroups: [
          {
            id: 't33-l2-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              { number: 11, promptHtml: 'The scheme will have bikes at {{q11}} docking stations.', answer: { accepted: ['60', 'sixty'] }, explanationHtml: '"around eight hundred bikes at sixty docking stations".' },
              { number: 12, promptHtml: 'People without a smartphone can use a {{q12}}.', answer: { accepted: ['membership card'] }, explanationHtml: '"They can buy a membership card".' },
              { number: 13, promptHtml: 'Annual membership costs £{{q13}}.', answer: { accepted: ['60', 'sixty'] }, explanationHtml: '"an annual membership, which is sixty pounds".' },
              { number: 14, promptHtml: 'Electric bikes are useful because of the {{q14}} in some parts of the city.', answer: { accepted: ['hills', 'steep hills'] }, explanationHtml: '"Linford has some quite steep hills".' },
              { number: 15, promptHtml: 'All the bikes have {{q15}} which switch on automatically.', answer: { accepted: ['lights'] }, explanationHtml: '"All the bikes have lights that come on automatically".' },
              { number: 16, promptHtml: 'The council is building {{q16}} of protected cycle lanes.', answer: { accepted: ['12 km', '12 kilometres', 'twelve kilometres'] }, explanationHtml: '"twelve kilometres of new protected cycle lanes".' },
            ],
          },
          {
            id: 't33-l2-multi3',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-G.',
            questions: [
              {
                number: 17,
                promptHtml: 'Which THREE things are users asked to do?',
                options: [
                  { key: 'A', text: 'wear a helmet' },
                  { key: 'B', text: 'check the brakes and tyres' },
                  { key: 'C', text: 'clean the bike after use' },
                  { key: 'D', text: 'report problems using the app' },
                  { key: 'E', text: 'book a bike in advance' },
                  { key: 'F', text: 'lock the bike properly into the dock' },
                  { key: 'G', text: 'return the bike to the same station' },
                ],
                selectCount: 3,
                answer: { accepted: ['B', 'D', 'F'] },
                explanationHtml: '"check the brakes and the tyres", "report it in the app", "make sure the bike is properly locked into the dock". Helmets are only recommended.',
              },
            ],
          },
          {
            id: 't33-l2-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 18,
                promptHtml: 'Which TWO groups does Dev expect to use the scheme, apart from commuters?',
                options: [
                  { key: 'A', text: 'schoolchildren' },
                  { key: 'B', text: 'students' },
                  { key: 'C', text: 'delivery workers' },
                  { key: 'D', text: 'tourists' },
                  { key: 'E', text: 'elderly people' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"We also expect a lot of students, and tourists at weekends."',
              },
            ],
          },
          {
            id: 't33-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 19, promptHtml: 'Why are helmets not provided?', options: [{ key: 'A', text: 'They are too expensive.' }, { key: 'B', text: 'for reasons of hygiene' }, { key: 'C', text: 'They are often stolen.' }], answer: { accepted: ['B'] }, explanationHtml: '"we don\'t provide them, for hygiene reasons".' },
              { number: 20, promptHtml: 'The scheme is mainly funded by', options: [{ key: 'A', text: 'the council.' }, { key: 'B', text: 'user fees.' }, { key: 'C', text: 'a local company.' }], answer: { accepted: ['C'] }, explanationHtml: '"Mainly by a sponsorship deal with a local energy company".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a student, Chloe, discussing her dissertation plans with her tutor.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Chloe, you've chosen your dissertation topic. Remind me what it is." },
          { speaker: 'B', voice: 'zira', text: "It's about clothing waste. I want to look at what happens to clothes that people give to charity shops." },
          { speaker: 'A', voice: 'david', text: "Why that topic?" },
          { speaker: 'B', voice: 'zira', text: "I volunteered in a charity shop last summer, and I was amazed by how many donations couldn't be sold. I'd always assumed everything given to charity was reused." },
          { speaker: 'A', voice: 'david', text: "It's a good topic, and there isn't much research on it. What proportion of donations do shops actually sell?" },
          { speaker: 'B', voice: 'zira', text: "The shop I worked in sold about a quarter. The rest was sent to textile merchants, who sort it and export most of it abroad." },
          { speaker: 'A', voice: 'david', text: "How are you planning to collect your data?" },
          { speaker: 'B', voice: 'zira', text: "Mainly by interviewing shop managers. I was going to send out a questionnaire, but I think interviews will give me more detailed information." },
          { speaker: 'A', voice: 'david', text: "I agree. How many shops?" },
          { speaker: 'B', voice: 'zira', text: "I've contacted twelve so far, and eight have agreed." },
          { speaker: 'A', voice: 'david', text: "That's a reasonable number. What will you ask them about?" },
          { speaker: 'B', voice: 'zira', text: "How they decide what to sell, what happens to the rest, and whether the quality of donations has changed. Several managers have told me informally that it's got worse, because of cheap fashion. And I'd like to ask what would help them sell more." },
          { speaker: 'A', voice: 'david', text: "Good. You might also look at the environmental side, what happens to the clothes that are exported." },
          { speaker: 'B', voice: 'zira', text: "I'd like to, but I think it's too big a question for a dissertation. I'll mention it in the conclusion as an area for future research." },
          { speaker: 'A', voice: 'david', text: "Fair enough. Now, have you started the literature review?" },
          { speaker: 'B', voice: 'zira', text: "Yes. There are some good government reports, and quite a lot on the fashion industry generally, but hardly anything specifically about charity shops." },
          { speaker: 'A', voice: 'david', text: "That gap is actually useful, because it shows why your research matters. Make that point clearly. What about your timetable?" },
          { speaker: 'B', voice: 'zira', text: "I'm hoping to do the interviews in February, and start writing in March." },
          { speaker: 'A', voice: 'david', text: "That sounds fine. One practical point: you'll need to get ethical approval before you interview anyone. The form is on the department website, and it takes about two weeks." },
          { speaker: 'B', voice: 'zira', text: "I'll do that this week. And should I record the interviews?" },
          { speaker: 'A', voice: 'david', text: "Yes, but ask permission first, and make sure you store the recordings securely. You'll need to delete them once you've finished." },
          { speaker: 'B', voice: 'zira', text: "OK. And how long should the dissertation be?" },
          { speaker: 'A', voice: 'david', text: "Ten thousand words, with a limit of ten per cent either way." },
        ],
        questionGroups: [
          {
            id: 't33-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Why did Chloe choose her topic?', options: [{ key: 'A', text: 'Her tutor suggested it.' }, { key: 'B', text: 'She was surprised by something she saw while volunteering.' }, { key: 'C', text: 'She wants to work in fashion.' }], answer: { accepted: ['B'] }, explanationHtml: '"I was amazed by how many donations couldn\'t be sold."' },
              { number: 22, promptHtml: 'What proportion of donations did the shop Chloe worked in sell?', options: [{ key: 'A', text: 'about 25%' }, { key: 'B', text: 'about 50%' }, { key: 'C', text: 'about 75%' }], answer: { accepted: ['A'] }, explanationHtml: '"The shop I worked in sold about a quarter."' },
              { number: 23, promptHtml: 'Why has Chloe decided to use interviews?', options: [{ key: 'A', text: 'They are quicker.' }, { key: 'B', text: 'They provide more detail.' }, { key: 'C', text: 'Managers prefer them.' }], answer: { accepted: ['B'] }, explanationHtml: '"interviews will give me more detailed information".' },
              { number: 24, promptHtml: 'How many shops have agreed to take part?', options: [{ key: 'A', text: '8' }, { key: 'B', text: '10' }, { key: 'C', text: '12' }], answer: { accepted: ['A'] }, explanationHtml: '"I\'ve contacted twelve so far, and eight have agreed."' },
            ],
          },
          {
            id: 't33-l3-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-G.',
            questions: [
              {
                number: 25,
                promptHtml: 'Which THREE topics will Chloe ask shop managers about?',
                options: [
                  { key: 'A', text: 'how they decide what to sell' },
                  { key: 'B', text: 'how much staff are paid' },
                  { key: 'C', text: 'changes in the quality of donations' },
                  { key: 'D', text: 'the environmental impact of exported clothes' },
                  { key: 'E', text: 'what would help them sell more' },
                  { key: 'F', text: 'the prices of items' },
                  { key: 'G', text: 'the number of volunteers' },
                ],
                selectCount: 3,
                answer: { accepted: ['A', 'C', 'E'] },
                explanationHtml: '"How they decide what to sell ... whether the quality of donations has changed ... what would help them sell more." The environmental side is left for future research.',
              },
            ],
          },
          {
            id: 't33-l3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            questions: [
              { number: 26, promptHtml: 'The lack of research on charity shops shows why Chloe\'s study is {{q26}}.', answer: { accepted: ['important', 'matters'] }, explanationHtml: '"it shows why your research matters".' },
              { number: 27, promptHtml: 'Chloe plans to carry out her interviews in {{q27}}.', answer: { accepted: ['february'] }, explanationHtml: '"I\'m hoping to do the interviews in February".' },
              { number: 28, promptHtml: 'Getting ethical approval takes about {{q28}} weeks.', answer: { accepted: ['2', 'two'] }, explanationHtml: '"it takes about two weeks".' },
              { number: 29, promptHtml: 'Recordings must be {{q29}} when the research is finished.', answer: { accepted: ['deleted'] }, explanationHtml: '"You\'ll need to delete them once you\'ve finished."' },
              { number: 30, promptHtml: 'The dissertation should be about {{q30}} words long.', answer: { accepted: ['10000', '10,000'] }, explanationHtml: '"Ten thousand words".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the history of map-making.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today I'm going to talk about the history of maps, and how they reflect not only geographical knowledge but also the beliefs and purposes of the people who made them." },
          { speaker: 'A', voice: 'david', text: "Some of the oldest surviving maps come from ancient Babylon. One famous example, carved on a clay tablet around two and a half thousand years ago, shows the world as a flat disc surrounded by an ocean, with Babylon at its centre. This tells us something important: early maps were often more concerned with a people's view of their place in the world than with accurate measurement." },
          { speaker: 'A', voice: 'david', text: "The ancient Greeks took a more scientific approach. They knew that the Earth was a sphere, and in the second century the scholar Ptolemy produced a guide to making maps that listed the positions of thousands of places using a grid of lines, similar to what we now call latitude and longitude." },
          { speaker: 'A', voice: 'david', text: "In medieval Europe, many maps were religious rather than practical. They placed the holy city of Jerusalem at the centre and were decorated with scenes from the Bible, and they weren't intended to help anyone find their way." },
          { speaker: 'A', voice: 'david', text: "Sailors, however, needed accurate maps. From the thirteenth century, Mediterranean sailors used charts that showed coastlines in great detail, with lines radiating from central points to indicate compass directions." },
          { speaker: 'A', voice: 'david', text: "A major problem for map-makers was how to show the curved surface of the Earth on a flat sheet of paper. In 1569, the Flemish map-maker Gerardus Mercator developed a projection in which lines of constant compass direction appear straight, which was extremely useful for navigation. But it has a serious disadvantage: it greatly exaggerates the size of areas far from the equator, so that Greenland appears roughly the same size as Africa, although Africa is about fourteen times larger." },
          { speaker: 'A', voice: 'david', text: "In the eighteenth and nineteenth centuries, governments began to carry out national surveys, measuring the land systematically using a technique called triangulation. These surveys were often motivated by military needs, and in Britain the national mapping agency still has a name that reflects its military origins." },
          { speaker: 'A', voice: 'david', text: "The twentieth century brought aerial photography, and later satellites, which made it possible to map the whole planet in detail. And today, of course, most of us carry a map on our phones, using satellite positioning to show exactly where we are." },
          { speaker: 'A', voice: 'david', text: "But digital maps raise new questions. They're produced mainly by a few large companies, and what they choose to show, or not to show, can influence where people go and which businesses they visit. So, just as with the Babylonian tablet, it's worth asking who made a map, and why." },
        ],
        questionGroups: [
          {
            id: 't33-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>The history of maps</strong></p>' +
              '<p><em>Babylon</em><br/>• world shown as a flat disc on a {{q31}} tablet</p>' +
              '<p><em>Ancient Greece</em><br/>• Ptolemy used a {{q32}} of lines to record positions</p>' +
              '<p><em>Medieval Europe</em><br/>• maps were mainly {{q33}}, with Jerusalem at the centre</p>' +
              '<p><em>Sailors\' charts</em><br/>• lines showed {{q34}} directions</p>' +
              '<p><em>Mercator (1569)</em><br/>• useful for {{q35}}<br/>• exaggerates areas far from the {{q36}}</p>' +
              '<p><em>National surveys</em><br/>• used a technique called {{q37}}<br/>• often had {{q38}} purposes</p>' +
              '<p><em>Modern maps</em><br/>• aerial photography and {{q39}}<br/>• digital maps made by a few large {{q40}}</p>',
            questions: [
              { number: 31, answer: { accepted: ['clay'] }, explanationHtml: '"carved on a clay tablet".' },
              { number: 32, answer: { accepted: ['grid'] }, explanationHtml: '"using a grid of lines".' },
              { number: 33, answer: { accepted: ['religious'] }, explanationHtml: '"many maps were religious rather than practical".' },
              { number: 34, answer: { accepted: ['compass'] }, explanationHtml: '"lines radiating from central points to indicate compass directions".' },
              { number: 35, answer: { accepted: ['navigation'] }, explanationHtml: '"which was extremely useful for navigation".' },
              { number: 36, answer: { accepted: ['equator'] }, explanationHtml: '"it greatly exaggerates the size of areas far from the equator".' },
              { number: 37, answer: { accepted: ['triangulation'] }, explanationHtml: '"a technique called triangulation".' },
              { number: 38, answer: { accepted: ['military'] }, explanationHtml: '"These surveys were often motivated by military needs".' },
              { number: 39, answer: { accepted: ['satellites'] }, explanationHtml: '"aerial photography, and later satellites".' },
              { number: 40, answer: { accepted: ['companies'] }, explanationHtml: '"produced mainly by a few large companies".' },
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
        '<p>The chart below shows the sources of income of a city council in 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'pie',
        title: 'City council income by source, 2023',
        unit: '%',
        categories: ['Government grants', 'Local property tax', 'Parking charges', 'Fees for services', 'Business rates', 'Other'],
        series: [{ name: 'Share of income', data: [38, 27, 6, 11, 14, 4] }],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that famous people have a responsibility to set a good example to young people. Others believe that their private lives should not be judged in this way.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
