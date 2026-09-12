// Original content, written for Vocably — NOT copied from any real Cambridge/IELTS
// book (see TZ-vocably-v2.md old-TZ BUG-021: real Cambridge material is a
// copyright risk, so this platform uses original content with generic naming).
// Consumed by scripts/seed-practice-tests.mjs, which turns `chart`/`transcriptLines`
// into a real imageUrl (via src/lib/chartSvg.js) and synthesized audio (offline TTS).

const passage1 = {
  order: 1,
  title: 'The History of Tea',
  subtitle: 'Read the text and answer questions 1-13.',
  paragraphs: [
    {
      label: 'A',
      html: '<p>According to a well-known legend, tea was discovered in China around 2737 BC, when a scholar named Shennong was boiling water beneath a tree and a few leaves blew into the pot by chance. Curious about the pleasant smell, he tasted the resulting liquid and found it refreshing, and reportedly went on to catalogue it among hundreds of other plants he tested for their medicinal properties. Whether or not the story is entirely true, it reflects the belief that tea was, for centuries, valued first as a medicine rather than as an everyday drink, prescribed by physicians for a range of ailments long before it became a routine part of daily life.</p>',
    },
    {
      label: 'B',
      html: '<p>Over the following centuries, tea drinking spread throughout China and gradually became a cultural practice rather than simply a remedy. During the Tang and Song dynasties, elaborate methods of preparing and serving tea developed, and the drink took on ceremonial importance, with entire manuals written on the correct selection of water, the ideal temperature, and the proper etiquette for serving guests. This appreciation for ritual later reached Japan, where tea was refined into the elegant <em>matcha</em> ceremony, involving whisking powdered green tea to a light foam in a series of precisely choreographed movements that could take years to master fully.</p>',
    },
    {
      label: 'C',
      html: '<p>Tea did not reach Europe until the early seventeenth century, when Dutch traders began importing small quantities from China. It arrived as an exotic and extremely expensive luxury, affordable only to the wealthiest households, who often kept it locked away in ornate caddies to prevent theft by household staff. It would take many decades before it became a drink for ordinary people, as import volumes gradually increased and prices fell within reach of the growing middle classes.</p>',
    },
    {
      label: 'D',
      html: '<p>Britain, in particular, developed a lasting attachment to tea. The British East India Company came to dominate the tea trade with China, importing vast quantities to satisfy growing domestic demand that showed no sign of slowing, regardless of the price. When the Chinese supply became politically difficult to rely on, the British began cultivating tea plantations of their own, most famously in the Assam region of India, where the climate proved well suited to large-scale production under colonial administration, transforming the region\'s economy and landscape within a few decades.</p>',
    },
    {
      label: 'E',
      html: '<p>Today, tea is grown across many countries, including China, India, Kenya and Sri Lanka, and it remains one of the most widely consumed beverages in the world, second only to water in many countries\' daily consumption figures. The many varieties available — black, green, oolong and white — all come from the same plant, <em>Camellia sinensis</em>; the differences arise mainly from how much the leaves are allowed to oxidise during processing, with black tea undergoing full oxidation and green tea very little, a distinction that determines not only the colour and flavour of the finished drink but also its caffeine content and shelf life.</p>',
    },
  ],
  questionGroups: [
    {
      id: 't3-r1-tfng',
      type: 'true_false_notgiven',
      instructionHtml:
        'Do the following statements agree with the information given in Reading Passage 1?<br/><strong>TRUE</strong> if the statement agrees with the information<br/><strong>FALSE</strong> if the statement contradicts the information<br/><strong>NOT GIVEN</strong> if there is no information on this',
      questions: [
        { number: 1, promptHtml: 'Tea was discovered completely by accident.', answer: { accepted: ['TRUE'] }, explanationHtml: 'The legend describes leaves blowing into the pot by chance.', locatorParagraph: 'A' },
        { number: 2, promptHtml: 'Formal tea ceremonies developed only in Japan.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Ceremonial preparation first developed in China during the Tang and Song dynasties, before reaching Japan.', locatorParagraph: 'B' },
        { number: 3, promptHtml: 'Tea was cheap and widely available when it first reached Europe.', answer: { accepted: ['FALSE'] }, explanationHtml: 'It arrived as an extremely expensive luxury.', locatorParagraph: 'C' },
        { number: 4, promptHtml: 'The British East India Company had a major role in trading tea from China.', answer: { accepted: ['TRUE'] }, explanationHtml: 'The Company is described as dominating the tea trade with China.', locatorParagraph: 'D' },
        { number: 5, promptHtml: 'Kenya now produces more tea than any other country.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Several producing countries are named but no comparison between them is given.', locatorParagraph: 'E' },
      ],
    },
    {
      id: 't3-r1-features',
      type: 'matching_features',
      instructionHtml: 'Which country is associated with each statement below? Choose the correct letter, A-D.',
      bank: [
        { key: 'A', text: 'China' },
        { key: 'B', text: 'The Netherlands' },
        { key: 'C', text: 'Britain' },
        { key: 'D', text: 'India' },
      ],
      questions: [
        { number: 6, promptHtml: 'Was the first to cultivate tea, largely for its medicinal properties.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A places the discovery, and early medicinal use, in China.', locatorParagraph: 'A' },
        { number: 7, promptHtml: 'Brought tea to Europe as a traded commodity.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C credits Dutch traders with the first imports to Europe.', locatorParagraph: 'C' },
        { number: 8, promptHtml: 'Came to control the tea trade with China through a large trading company.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D describes the British East India Company dominating this trade.', locatorParagraph: 'D' },
        { number: 9, promptHtml: 'Developed large tea plantations under colonial rule.', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D names Assam, in India, as the site of large-scale colonial-era plantations.', locatorParagraph: 'D' },
      ],
    },
    {
      id: 't3-r1-short',
      type: 'short_answer',
      instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
      wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
      questions: [
        { number: 10, promptHtml: 'According to legend, in what year did Shennong discover tea?', answer: { accepted: ['2737 bc', '2737'] }, explanationHtml: 'Paragraph A gives the year as around 2737 BC.', locatorParagraph: 'A' },
        { number: 11, promptHtml: 'What is the Japanese ceremony involving whisked powdered green tea called?', answer: { accepted: ['matcha', 'matcha ceremony'] }, explanationHtml: 'Paragraph B names the matcha ceremony.', locatorParagraph: 'B' },
        { number: 12, promptHtml: 'Which region of India became known for large-scale tea plantations?', answer: { accepted: ['assam'] }, explanationHtml: 'Paragraph D names Assam.', locatorParagraph: 'D' },
        { number: 13, promptHtml: 'What chemical process during production distinguishes black tea from green tea?', answer: { accepted: ['oxidation', 'oxidisation', 'oxidization'] }, explanationHtml: 'Paragraph E explains the difference arises from how much the leaves oxidise.', locatorParagraph: 'E' },
      ],
    },
  ],
};

const passage2 = {
  order: 2,
  title: 'Coral Reef Conservation',
  subtitle: 'Read the text and answer questions 14-26.',
  paragraphs: [
    {
      label: 'A',
      html: "<p>Often described as the rainforests of the sea, coral reefs are among the most biologically diverse ecosystems on Earth, despite covering less than one percent of the ocean floor. They are built not by plants but by tiny animals called coral polyps, which secrete calcium carbonate to form hard skeletons that, over thousands of years, accumulate into the vast structures we recognise as reefs. A single reef system can take many centuries to form, growing only a few centimetres per year under favourable conditions, which makes the speed of the damage now being observed all the more striking by comparison.</p>",
    },
    {
      label: 'B',
      html: '<p>Major reef systems are found around the world, including the Great Barrier Reef off the coast of Australia, the Coral Triangle in South-East Asia, and numerous reefs throughout the Caribbean. These ecosystems support local fisheries and tourism industries that millions of people depend on for their livelihoods, and they also provide a natural barrier that protects coastal communities from the full force of storms and rising waves.</p>',
    },
    {
      label: 'C',
      html: '<p>Reefs face a growing number of threats, many linked to climate change. Rising sea temperatures can cause coral bleaching, a process in which corals expel the symbiotic algae, known as zooxanthellae, living within their tissues; without these algae, the coral loses both its colour and its main source of energy, and if conditions do not improve quickly, it may die. Ocean acidification, caused by higher levels of dissolved carbon dioxide, further weakens coral skeletons and slows their growth, making it harder for damaged reefs to recover even once temperatures fall back to a more tolerable range.</p>',
    },
    {
      label: 'D',
      html: '<p>Beyond climate-related pressures, reefs are also damaged directly by human activity, particularly overfishing and pollution from agricultural runoff, alongside unsustainable tourism practices and coastal construction near shorelines. Sediment washed into the sea from construction and farming can smother coral by blocking the sunlight it needs, while chemical run-off can encourage the growth of algae that compete with coral for space.</p>',
    },
    {
      label: 'E',
      html: '<p>In response, conservationists have developed several approaches to help reefs recover. Coral nurseries grow fragments of healthy coral in controlled conditions before transplanting them onto damaged reefs, a labour-intensive process that nonetheless has shown promising results in several pilot locations. Selective breeding programmes aim to produce corals that are more resistant to heat stress, drawing on naturally occurring variation between individual coral colonies. Marine protected areas also help by limiting fishing and other damaging activities in especially vulnerable locations, giving ecosystems a chance to recover from existing stress before new pressures are added.</p>',
    },
    {
      label: 'F',
      html: '<p>However, most researchers agree that local conservation measures alone will not be enough. Since rising sea temperatures are the underlying driver of coral bleaching worldwide, meaningfully reducing global carbon emissions is widely regarded as essential to addressing the root cause of reef decline, meaning that the long-term survival of reefs depends as much on international climate policy as on any conservation work carried out at the reef itself.</p>',
    },
  ],
  questionGroups: [
    {
      id: 't3-r2-table',
      type: 'table_completion',
      instructionHtml: 'Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.',
      wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
      stemHtml:
        '<table><thead><tr><th>Threat</th><th>Cause</th><th>Effect</th></tr></thead><tbody>' +
        '<tr><td>Coral bleaching</td><td>rising sea {{q14}}</td><td>corals lose their {{q15}} and turn {{q16}}</td></tr>' +
        '<tr><td>Ocean acidification</td><td>higher levels of dissolved {{q17}}</td><td>weakened coral {{q18}} and slower {{q19}}</td></tr>' +
        '</tbody></table>',
      questions: [
        { number: 14, answer: { accepted: ['temperatures', 'temperature'] }, explanationHtml: 'Paragraph C: "Rising sea temperatures can cause coral bleaching".', locatorParagraph: 'C' },
        { number: 15, answer: { accepted: ['algae', 'zooxanthellae'] }, explanationHtml: 'Paragraph C: corals expel the symbiotic algae (zooxanthellae).', locatorParagraph: 'C' },
        { number: 16, answer: { accepted: ['pale', 'white', 'colourless', 'colorless'] }, explanationHtml: 'Paragraph C: the coral "loses both its colour".', locatorParagraph: 'C' },
        { number: 17, answer: { accepted: ['carbon dioxide', 'co2'] }, explanationHtml: 'Paragraph C: acidification is "caused by higher levels of dissolved carbon dioxide".', locatorParagraph: 'C' },
        { number: 18, answer: { accepted: ['skeletons', 'skeleton'] }, explanationHtml: 'Paragraph C: acidification "weakens coral skeletons".', locatorParagraph: 'C' },
        { number: 19, answer: { accepted: ['growth'] }, explanationHtml: 'Paragraph C: acidification "slows their growth".', locatorParagraph: 'C' },
      ],
    },
    {
      id: 't3-r2-multi-a',
      type: 'multiple_choice_multi',
      instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.<br/>Which TWO methods are described as directly helping damaged corals recover?',
      questions: [
        {
          number: 20,
          promptHtml: 'Which TWO methods are described as directly helping damaged corals recover?',
          selectCount: 2,
          options: [
            { key: 'A', text: 'Marine protected areas' },
            { key: 'B', text: 'Coral nurseries growing transplantable fragments' },
            { key: 'C', text: 'Selective breeding for heat-resistant corals' },
            { key: 'D', text: 'Banning all tourism near reefs' },
            { key: 'E', text: 'Planting coastal mangrove forests' },
          ],
          answer: { accepted: ['B', 'C'] },
          explanationHtml: 'Paragraph E describes coral nurseries and selective breeding for heat resistance as direct recovery methods.',
          locatorParagraph: 'E',
        },
      ],
    },
    {
      id: 't3-r2-multi-b',
      type: 'multiple_choice_multi',
      instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.<br/>Which TWO human activities are named as damaging reefs directly, rather than through climate change?',
      questions: [
        {
          number: 21,
          promptHtml: 'Which TWO human activities are named as damaging reefs directly, rather than through climate change?',
          selectCount: 2,
          options: [
            { key: 'A', text: 'Overfishing' },
            { key: 'B', text: 'Pollution from agricultural runoff' },
            { key: 'C', text: 'Ocean acidification' },
            { key: 'D', text: 'Rising sea temperatures' },
            { key: 'E', text: 'Loss of biodiversity' },
          ],
          answer: { accepted: ['A', 'B'] },
          explanationHtml: 'Paragraph D names overfishing and pollution from agricultural runoff as direct human damage.',
          locatorParagraph: 'D',
        },
      ],
    },
    {
      id: 't3-r2-tfng',
      type: 'true_false_notgiven',
      instructionHtml:
        'Do the following statements agree with the information given in Reading Passage 2?<br/><strong>TRUE</strong> if the statement agrees with the information<br/><strong>FALSE</strong> if the statement contradicts the information<br/><strong>NOT GIVEN</strong> if there is no information on this',
      questions: [
        { number: 22, promptHtml: 'Coral reefs are built by plant organisms.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph A states reefs are built by tiny animals, coral polyps, not plants.', locatorParagraph: 'A' },
        { number: 23, promptHtml: 'The Great Barrier Reef is the only major reef system in the world.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B also names the Coral Triangle and Caribbean reefs.', locatorParagraph: 'B' },
        { number: 24, promptHtml: 'Rising ocean temperatures can cause corals to expel the algae living inside them.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph C describes exactly this bleaching process.', locatorParagraph: 'C' },
        { number: 25, promptHtml: 'All countries have signed a single binding agreement to protect coral reefs.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'No such agreement is mentioned anywhere in the passage.' },
        { number: 26, promptHtml: 'Reducing carbon emissions is presented as necessary to address the root cause of reef decline.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph F states this directly.', locatorParagraph: 'F' },
      ],
    },
  ],
};

const passage3 = {
  order: 3,
  title: 'The Science of Sleep',
  subtitle: 'Read the text and answer questions 27-40.',
  paragraphs: [
    {
      label: 'A',
      html: '<p>Despite occupying roughly a third of human life, sleep remained scientifically mysterious until relatively recently, often dismissed by earlier researchers as simply a passive state in which the brain switched off. Modern sleep laboratories use a technique called polysomnography, which records brain activity, eye movement and muscle tone simultaneously, to study what actually happens while we sleep, and these recordings revealed a far more active and structured process than scientists had previously assumed.</p>',
    },
    {
      label: 'B',
      html: '<p>Sleep is not a single uniform state but a cycle of distinct stages. Non-REM sleep is divided into three stages, progressing from light sleep towards deep sleep, during which the body carries out much of its physical repair and restoration. After this, the brain enters REM (rapid eye movement) sleep, during which brain activity increases sharply, closely resembling patterns seen during wakefulness, and most dreaming occurs. A full cycle through these stages lasts approximately ninety minutes and repeats several times each night, with the proportion of REM sleep generally increasing in each successive cycle towards morning.</p>',
    },
    {
      label: 'C',
      html: "<p>The timing of sleep is governed by the body's circadian rhythm, controlled by a region of the brain called the suprachiasmatic nucleus, which acts as a kind of master clock coordinating numerous other biological rhythms throughout the body. This internal clock responds strongly to light exposure, particularly the blue-tinted light of early morning, and regulates the release of melatonin, a hormone that rises in the evening and promotes drowsiness before falling again close to the body's usual waking time.</p>",
    },
    {
      label: 'D',
      html: '<p>Chronic sleep deprivation carries serious consequences. It impairs memory consolidation, since much of the process by which the brain files away the day\'s new information into long-term memory appears to happen specifically during sleep, weakens immune function, and negatively affects mood, sometimes producing symptoms that closely resemble those of clinical depression. Long-term sleep loss has been linked to a higher risk of cardiovascular disease and metabolic disorders such as diabetes, prompting public health bodies in several countries to treat insufficient sleep as a genuine population-level health concern.</p>',
    },
    {
      label: 'E',
      html: "<p>Sleep needs and patterns also vary between individuals. Some people are naturally more alert in the morning while others function better in the evening, a difference often described in terms of a person's chronotype, and research suggests this tendency is influenced by genetics rather than being purely a matter of habit or willpower. Age also plays a role: teenagers' circadian rhythms tend to shift to a later schedule than in childhood, a change that has led some schools to experiment with later start times, while older adults typically experience lighter and more fragmented sleep, often waking several times during the night without necessarily remembering doing so.</p>",
    },
    {
      label: 'F',
      html: '<p>Modern life introduces further disruption. Blue light emitted by phone and computer screens can suppress the release of melatonin, delaying the onset of sleep by tricking the suprachiasmatic nucleus into behaving as though it were still daytime, while irregular schedules and consuming caffeine late in the day can also interfere with the ability to fall asleep, since caffeine\'s effects can persist in the body for several hours after it is consumed.</p>',
    },
    {
      label: 'G',
      html: '<p>Sleep experts generally recommend a set of habits known as sleep hygiene: maintaining a consistent sleep schedule even on weekends, keeping the bedroom dark and cool, and limiting screen use in the hour before bed. Many sleep clinics now incorporate these recommendations into a structured programme, alongside relaxation techniques, as a first-line treatment for mild insomnia before considering medication.</p>',
    },
  ],
  questionGroups: [
    {
      id: 't3-r3-endings',
      type: 'matching_sentence_endings',
      instructionHtml: 'Complete each sentence with the correct ending, A-L, from the box below.',
      bank: [
        { key: 'A', text: 'becomes highly active and most dreaming occurs' },
        { key: 'B', text: "regulates the body's internal circadian clock" },
        { key: 'C', text: 'has been linked to a higher risk of heart disease' },
        { key: 'D', text: 'tend to shift to a later schedule than in childhood' },
        { key: 'E', text: 'can suppress the release of melatonin' },
        { key: 'F', text: 'is measured using polysomnography in a laboratory' },
        { key: 'G', text: 'remains completely inactive throughout the night' },
        { key: 'H', text: 'is unaffected by age or lifestyle' },
      ],
      questions: [
        { number: 27, promptHtml: 'During REM sleep, the brain', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph B: REM sleep is when brain activity increases sharply and most dreaming occurs.', locatorParagraph: 'B' },
        { number: 28, promptHtml: 'The suprachiasmatic nucleus', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C describes this region as controlling the circadian rhythm.', locatorParagraph: 'C' },
        { number: 29, promptHtml: 'Chronic sleep deprivation', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D links long-term sleep loss to cardiovascular disease.', locatorParagraph: 'D' },
        { number: 30, promptHtml: "Teenagers' circadian rhythms", answer: { accepted: ['D'] }, explanationHtml: 'Paragraph E states this directly.', locatorParagraph: 'E' },
        { number: 31, promptHtml: 'Blue light emitted by screens', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph F states this directly.', locatorParagraph: 'F' },
      ],
    },
    {
      id: 't3-r3-short',
      type: 'short_answer',
      instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
      wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
      questions: [
        { number: 32, promptHtml: 'What technique do researchers use to record brain activity, eye movement and muscle tone during sleep?', answer: { accepted: ['polysomnography'] }, explanationHtml: 'Paragraph A names polysomnography.', locatorParagraph: 'A' },
        { number: 33, promptHtml: 'What hormone rises in the evening and promotes drowsiness?', answer: { accepted: ['melatonin'] }, explanationHtml: 'Paragraph C names melatonin.', locatorParagraph: 'C' },
        { number: 34, promptHtml: "What term describes a person's natural preference for being active at a certain time of day?", answer: { accepted: ['chronotype'] }, explanationHtml: 'Paragraph E names this term.', locatorParagraph: 'E' },
        { number: 35, promptHtml: 'Approximately how long does one full sleep cycle last?', answer: { accepted: ['90 minutes', 'ninety minutes'] }, explanationHtml: 'Paragraph B gives approximately ninety minutes.', locatorParagraph: 'B' },
      ],
    },
    {
      id: 't3-r3-sentence',
      type: 'sentence_completion',
      instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> from the passage for each answer.',
      wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
      questions: [
        { number: 36, promptHtml: 'Non-REM sleep progresses from light sleep towards {{q36}} sleep.', answer: { accepted: ['deep'] }, explanationHtml: 'Paragraph B.', locatorParagraph: 'B' },
        { number: 37, promptHtml: 'Older adults typically experience more {{q37}} sleep than younger adults.', answer: { accepted: ['fragmented'] }, explanationHtml: 'Paragraph E.', locatorParagraph: 'E' },
        { number: 38, promptHtml: 'Consuming {{q38}} late in the day can interfere with falling asleep.', answer: { accepted: ['caffeine'] }, explanationHtml: 'Paragraph F.', locatorParagraph: 'F' },
        { number: 39, promptHtml: 'Keeping the bedroom dark and {{q39}} is part of good sleep hygiene.', answer: { accepted: ['cool'] }, explanationHtml: 'Paragraph G.', locatorParagraph: 'G' },
        { number: 40, promptHtml: "Maintaining a consistent sleep {{q40}} helps regulate the body's circadian rhythm.", answer: { accepted: ['schedule'] }, explanationHtml: 'Paragraph G.', locatorParagraph: 'G' },
      ],
    },
  ],
};

const listeningPart1 = {
  order: 1,
  contextText: 'You will hear a customer making a booking with a guesthouse receptionist.',
  gapAfterSec: 30,
  transcriptLines: [
    { speaker: 'A', voice: 'zira', text: 'Good afternoon, Lakeside Guesthouse, how can I help you today?' },
    { speaker: 'B', voice: 'david', text: "Hi, I'd like to book a room for a few nights in June, please." },
    { speaker: 'A', voice: 'zira', text: 'Of course. Could I take your full name first?' },
    { speaker: 'B', voice: 'david', text: "Yes, it's Michael Turner." },
    { speaker: 'A', voice: 'zira', text: 'Thank you, Mr Turner. And what date would you like to check in?' },
    { speaker: 'B', voice: 'david', text: 'The fourteenth of June, if that is available.' },
    { speaker: 'A', voice: 'zira', text: "Let me check... yes, that's fine. And how many nights will you be staying?" },
    { speaker: 'B', voice: 'david', text: 'Three nights, so checking out on the seventeenth.' },
    { speaker: 'A', voice: 'zira', text: 'Great. Would you prefer a single or a double room?' },
    { speaker: 'B', voice: 'david', text: "A double room, please, there'll be two of us." },
    { speaker: 'A', voice: 'zira', text: 'No problem. For three nights in a double room, the total comes to two hundred and forty pounds.' },
    { speaker: 'B', voice: 'david', text: 'That sounds reasonable.' },
    { speaker: 'A', voice: 'zira', text: 'We do ask for a deposit to secure the booking — that would be fifty pounds, refundable if you cancel before the seventh of June.' },
    { speaker: 'B', voice: 'david', text: "That's fine, I'll pay that now." },
    { speaker: 'A', voice: 'zira', text: 'Perfect. Could I also get a contact email address, in case we need to reach you?' },
    { speaker: 'B', voice: 'david', text: 'Sure, it is michael dot turner, at gmail dot com.' },
    { speaker: 'A', voice: 'zira', text: 'Got it. And roughly what time do you think you will arrive on the day?' },
    { speaker: 'B', voice: 'david', text: 'Probably around three in the afternoon, after checking out of our current place.' },
    { speaker: 'A', voice: 'zira', text: 'That is no problem, reception is open until six. One more thing — do you need parking? We do have spaces, and they are free for guests.' },
    { speaker: 'B', voice: 'david', text: 'Yes, that would be great, thank you.' },
    { speaker: 'A', voice: 'zira', text: 'Wonderful. Your booking reference number is B R two two four nine — I will also send that by email.' },
    { speaker: 'B', voice: 'david', text: 'Perfect, thank you very much.' },
    { speaker: 'A', voice: 'zira', text: 'You are welcome, Mr Turner. We look forward to seeing you on the fourteenth.' },
  ],
  questionGroups: [
    {
      id: 't3-l1-notes',
      type: 'note_completion',
      instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
      wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
      stemHtml:
        '<p><strong>Booking form</strong><br/>' +
        'Guest name: {{q1}}<br/>' +
        'Check-in date: {{q2}} June<br/>' +
        'Number of nights: {{q3}}<br/>' +
        'Room type: {{q4}}<br/>' +
        'Total price: £{{q5}}<br/>' +
        'Deposit required: £{{q6}}<br/>' +
        'Contact email domain: {{q7}}<br/>' +
        'Estimated arrival time: {{q8}}<br/>' +
        'Parking: {{q9}}<br/>' +
        'Booking reference: {{q10}}</p>',
      questions: [
        { number: 1, answer: { accepted: ['michael turner'] }, explanationHtml: 'The customer gives his name as Michael Turner.' },
        { number: 2, answer: { accepted: ['14', 'fourteenth', '14th'] }, explanationHtml: 'Check-in is the fourteenth of June.' },
        { number: 3, answer: { accepted: ['3', 'three'] }, explanationHtml: 'Three nights, checking out on the seventeenth.' },
        { number: 4, answer: { accepted: ['double', 'a double', 'double room'] }, explanationHtml: 'The customer asks for a double room.' },
        { number: 5, answer: { accepted: ['240', '240 pounds'] }, explanationHtml: 'The total is two hundred and forty pounds.' },
        { number: 6, answer: { accepted: ['50', '50 pounds'] }, explanationHtml: 'The deposit is fifty pounds.' },
        { number: 7, answer: { accepted: ['gmail.com', 'gmail'] }, explanationHtml: 'The email is given as ...@gmail.com.' },
        { number: 8, answer: { accepted: ['3pm', '3 pm', 'three pm'] }, explanationHtml: 'Around three in the afternoon.' },
        { number: 9, answer: { accepted: ['free', 'yes'] }, explanationHtml: 'Parking spaces are available and free for guests.' },
        { number: 10, answer: { accepted: ['br2249', 'b r 2249'] }, explanationHtml: 'The reference is given as B R two two four nine.' },
      ],
    },
  ],
};

const listeningPart2 = {
  order: 2,
  contextText: "You will hear a talk about a city's public transport network.",
  gapAfterSec: 30,
  transcriptLines: [
    { speaker: 'A', voice: 'zira', text: "Good morning everyone, and welcome to this introduction to our city's public transport network, which I'll be talking about for the next few minutes." },
    { speaker: 'A', voice: 'zira', text: "The network is made up of three main systems: the bus network, which is the oldest and covers the widest area; the tram network, which was reintroduced about fifteen years ago after being removed back in the 1960s; and the metro, which currently has only one line, although a second is already under construction." },
    { speaker: 'A', voice: 'zira', text: 'Let us start with buses. There are currently over forty routes operating across the city, and most run from five in the morning until midnight, though a small number of night routes continue running throughout the night, but only on weekends.' },
    { speaker: 'A', voice: 'zira', text: "The tram network, in contrast, is much smaller, with just two lines, but it is extremely popular because it runs in a dedicated lane separate from car traffic, meaning it is rarely affected by congestion. Trams run every eight minutes during peak hours." },
    { speaker: 'A', voice: 'zira', text: 'The metro line currently connects the airport to the central station, and the journey takes about twenty-five minutes. A second line, connecting the university district to the eastern suburbs, is expected to open in around three years.' },
    { speaker: 'A', voice: 'zira', text: 'In terms of payment, the city introduced a single smart card system last year, which can be used across all three types of transport, and also offers a daily price cap, so you never pay more than a set maximum no matter how many trips you take.' },
    { speaker: 'A', voice: 'zira', text: "For visitors, I would recommend the tram for short trips in the centre, since stops are close together, and the metro if you are travelling to or from the airport, since it avoids traffic entirely." },
    { speaker: 'A', voice: 'zira', text: 'Finally, a quick note on accessibility: all trams and metro trains are step-free, but only about half of the bus fleet currently has low floors, though the city has promised that the whole fleet will be accessible within five years.' },
  ],
  questionGroups: [
    {
      id: 't3-l2-mc',
      type: 'multiple_choice_single',
      instructionHtml: 'Choose the correct letter, A, B or C.',
      questions: [
        { number: 11, promptHtml: 'How many main systems make up the transport network?', options: [{ key: 'A', text: 'Two' }, { key: 'B', text: 'Three' }, { key: 'C', text: 'Four' }], answer: { accepted: ['B'] }, explanationHtml: 'Bus, tram and metro — three systems.' },
        { number: 12, promptHtml: 'When was the tram network reintroduced?', options: [{ key: 'A', text: 'About 5 years ago' }, { key: 'B', text: 'About 10 years ago' }, { key: 'C', text: 'About 15 years ago' }], answer: { accepted: ['C'] }, explanationHtml: 'The speaker says "about fifteen years ago".' },
        { number: 13, promptHtml: 'How many bus routes currently operate?', options: [{ key: 'A', text: 'Around 20' }, { key: 'B', text: 'Over 40' }, { key: 'C', text: 'Exactly 100' }], answer: { accepted: ['B'] }, explanationHtml: 'The speaker says "over forty routes".' },
        { number: 14, promptHtml: 'When do most bus routes stop running?', options: [{ key: 'A', text: 'At midnight' }, { key: 'B', text: 'At 5am' }, { key: 'C', text: 'At 6pm' }], answer: { accepted: ['A'] }, explanationHtml: 'Most buses run "until midnight".' },
        { number: 15, promptHtml: 'Why does the tram rarely get delayed?', options: [{ key: 'A', text: 'It runs underground' }, { key: 'B', text: 'It has priority at traffic lights' }, { key: 'C', text: 'It runs in a dedicated lane' }], answer: { accepted: ['C'] }, explanationHtml: 'The tram "runs in a dedicated lane separate from car traffic".' },
        { number: 16, promptHtml: 'How often do trams run at peak times?', options: [{ key: 'A', text: 'Every 4 minutes' }, { key: 'B', text: 'Every 8 minutes' }, { key: 'C', text: 'Every 15 minutes' }], answer: { accepted: ['B'] }, explanationHtml: 'The speaker says "every eight minutes".' },
        { number: 17, promptHtml: 'What does the current metro line connect?', options: [{ key: 'A', text: 'Two suburbs' }, { key: 'B', text: 'The university and the eastern suburbs' }, { key: 'C', text: 'The airport and the central station' }], answer: { accepted: ['C'] }, explanationHtml: 'The current line "connects the airport to the central station".' },
        { number: 18, promptHtml: 'When is the second metro line expected to open?', options: [{ key: 'A', text: 'Next year' }, { key: 'B', text: 'In about 3 years' }, { key: 'C', text: 'It has already opened' }], answer: { accepted: ['B'] }, explanationHtml: 'The speaker says "expected to open in around three years".' },
        { number: 19, promptHtml: 'What is a benefit of the new smart card system?', options: [{ key: 'A', text: "It's only valid on the metro" }, { key: 'B', text: 'It offers a daily price cap' }, { key: 'C', text: "It's free for students" }], answer: { accepted: ['B'] }, explanationHtml: 'The system "offers a daily price cap".' },
        { number: 20, promptHtml: 'What proportion of the bus fleet currently has low floors?', options: [{ key: 'A', text: 'All of it' }, { key: 'B', text: 'About half' }, { key: 'C', text: 'Almost none' }], answer: { accepted: ['B'] }, explanationHtml: 'The speaker says "about half of the bus fleet".' },
      ],
    },
  ],
};

const listeningPart3 = {
  order: 3,
  contextText: 'You will hear a student discussing an internship opportunity with a university careers advisor.',
  gapAfterSec: 30,
  transcriptLines: [
    { speaker: 'A', voice: 'zira', text: 'Come in! I understand you wanted to talk about the internship programme with GreenTech Solutions.' },
    { speaker: 'B', voice: 'david', text: 'Yes, I saw the posting but I have a few questions before I apply.' },
    { speaker: 'A', voice: 'zira', text: 'Of course. What would you like to know first?' },
    { speaker: 'B', voice: 'david', text: 'When is the application deadline?' },
    { speaker: 'A', voice: 'zira', text: 'You need to submit everything by the thirtieth of April, no exceptions.' },
    { speaker: 'B', voice: 'david', text: 'And what documents do I need to submit?' },
    { speaker: 'A', voice: 'zira', text: 'Just a CV and a short cover letter — no reference letters are required at this stage.' },
    { speaker: 'B', voice: 'david', text: "What's the interview process like?" },
    { speaker: 'A', voice: 'zira', text: "It's a single interview, conducted online rather than in person." },
    { speaker: 'B', voice: 'david', text: 'How long does the internship last?' },
    { speaker: 'A', voice: 'zira', text: 'Ten weeks, running from July to September.' },
    { speaker: 'B', voice: 'david', text: 'Is it paid?' },
    { speaker: 'A', voice: 'zira', text: "Yes, interns receive a monthly stipend, though it's described as modest rather than a full salary." },
    { speaker: 'B', voice: 'david', text: 'Will I have a mentor during the internship?' },
    { speaker: 'A', voice: 'zira', text: 'Yes, every intern is paired with a senior engineer who provides weekly guidance.' },
    { speaker: 'B', voice: 'david', text: 'Can any part of it be done remotely?' },
    { speaker: 'A', voice: 'zira', text: 'Only the final two weeks can be done remotely — the rest is on-site.' },
    { speaker: 'B', voice: 'david', text: 'How will my performance be evaluated?' },
    { speaker: 'A', voice: 'zira', text: 'Through a final project presentation, rather than written exams.' },
    { speaker: 'B', voice: 'david', text: 'Do I get a certificate afterwards?' },
    { speaker: 'A', voice: 'zira', text: 'Yes, a certificate of completion is provided automatically.' },
    { speaker: 'B', voice: 'david', text: 'And is there a chance of a job offer afterwards?' },
    { speaker: 'A', voice: 'zira', text: "It does happen sometimes, but the company doesn't guarantee it." },
  ],
  questionGroups: [
    {
      id: 't3-l3-endings',
      type: 'matching_sentence_endings',
      instructionHtml: 'Complete each sentence with the correct ending, A-L, from the box below.',
      bank: [
        { key: 'A', text: 'falls at the end of April' },
        { key: 'B', text: 'consist of a CV and a cover letter only' },
        { key: 'C', text: 'takes place online rather than face-to-face' },
        { key: 'D', text: 'lasts for ten weeks over the summer' },
        { key: 'E', text: 'is described as modest rather than generous' },
        { key: 'F', text: 'is a senior engineer who meets them weekly' },
        { key: 'G', text: 'is only possible during the final two weeks' },
        { key: 'H', text: 'is based on a final project presentation' },
        { key: 'I', text: 'is given automatically to every intern' },
        { key: 'J', text: 'is possible but not guaranteed by the company' },
        { key: 'K', text: 'requires at least two reference letters' },
        { key: 'L', text: 'is guaranteed to every intern who completes the programme' },
      ],
      questions: [
        { number: 21, promptHtml: 'The application deadline', answer: { accepted: ['A'] }, explanationHtml: 'The deadline is the thirtieth of April.' },
        { number: 22, promptHtml: 'The required documents', answer: { accepted: ['B'] }, explanationHtml: 'Just a CV and a cover letter are required.' },
        { number: 23, promptHtml: 'The interview', answer: { accepted: ['C'] }, explanationHtml: 'It is conducted online.' },
        { number: 24, promptHtml: 'The internship itself', answer: { accepted: ['D'] }, explanationHtml: 'Ten weeks, July to September.' },
        { number: 25, promptHtml: 'The monthly stipend', answer: { accepted: ['E'] }, explanationHtml: 'Described as modest rather than a full salary.' },
        { number: 26, promptHtml: "Each intern's mentor", answer: { accepted: ['F'] }, explanationHtml: 'A senior engineer providing weekly guidance.' },
        { number: 27, promptHtml: 'Remote working', answer: { accepted: ['G'] }, explanationHtml: 'Only the final two weeks can be remote.' },
        { number: 28, promptHtml: 'Performance evaluation', answer: { accepted: ['H'] }, explanationHtml: 'A final project presentation, not written exams.' },
        { number: 29, promptHtml: 'The certificate of completion', answer: { accepted: ['I'] }, explanationHtml: 'Given automatically to every intern.' },
        { number: 30, promptHtml: 'A job offer afterwards', answer: { accepted: ['J'] }, explanationHtml: 'Possible, but not guaranteed.' },
      ],
    },
  ],
};

const listeningPart4 = {
  order: 4,
  contextText: 'You will hear part of a lecture on volcanic activity.',
  transcriptLines: [
    { speaker: 'A', voice: 'david', text: 'Today I want to explain, step by step, how a typical explosive volcanic eruption develops.' },
    { speaker: 'A', voice: 'david', text: 'It begins deep underground, where molten rock, known as magma, accumulates in a magma chamber beneath the volcano.' },
    { speaker: 'A', voice: 'david', text: 'As more magma flows in from below, the pressure inside the chamber gradually increases.' },
    { speaker: 'A', voice: 'david', text: 'Dissolved gases within the magma, particularly water vapour and carbon dioxide, begin to form bubbles as the pressure rises.' },
    { speaker: 'A', voice: 'david', text: "Eventually, the pressure becomes too great for the surrounding rock to contain, and cracks start to form, allowing magma to move upward through what's called a volcanic conduit." },
    { speaker: 'A', voice: 'david', text: 'As the magma rises, the drop in pressure causes the gas bubbles to expand rapidly.' },
    { speaker: 'A', voice: 'david', text: 'This rapid expansion fragments the magma into small pieces of ash and rock, a process known as fragmentation.' },
    { speaker: 'A', voice: 'david', text: "The fragmented material, along with hot gases, is then violently ejected from the vent at the surface, producing what we call an eruption column." },
    { speaker: 'A', voice: 'david', text: 'Larger fragments, known as volcanic bombs, fall back near the vent, while fine ash can be carried high into the atmosphere and spread over huge distances by wind.' },
    { speaker: 'A', voice: 'david', text: 'After the initial explosive phase, the eruption often continues with the flow of lava down the slopes of the volcano, cooling gradually to form new solid rock.' },
    { speaker: 'A', voice: 'david', text: "Finally, over time, repeated eruptions build up layers of ash and lava, which is exactly how the cone-shaped structure of the volcano itself is formed." },
  ],
  questionGroups: [
    {
      id: 't3-l4-flow',
      type: 'flowchart_completion',
      instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
      wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
      stemHtml:
        '<p>1. Magma accumulates in a {{q31}} beneath the volcano.</p>' +
        '<p>2. Pressure inside the chamber gradually {{q32}} as more magma arrives.</p>' +
        '<p>3. Dissolved gases begin to form {{q33}} as pressure rises.</p>' +
        '<p>4. Cracks form and magma rises through the volcanic {{q34}}.</p>' +
        '<p>5. The drop in pressure causes gas bubbles to {{q35}} rapidly.</p>' +
        '<p>6. The magma breaks apart in a process called {{q36}}.</p>' +
        '<p>7. Magma and gases are ejected, forming an eruption {{q37}}.</p>' +
        '<p>8. Large fragments called volcanic {{q38}} fall near the vent.</p>' +
        '<p>9. {{q39}} flows down the slopes and cools into new rock.</p>' +
        '<p>10. Repeated eruptions build up the volcano\'s {{q40}} shape.</p>',
      questions: [
        { number: 31, answer: { accepted: ['chamber', 'magma chamber'] }, explanationHtml: 'Magma accumulates in a magma chamber.' },
        { number: 32, answer: { accepted: ['increases'] }, explanationHtml: 'Pressure gradually increases.' },
        { number: 33, answer: { accepted: ['bubbles'] }, explanationHtml: 'Dissolved gases form bubbles.' },
        { number: 34, answer: { accepted: ['conduit'] }, explanationHtml: 'Magma rises through the volcanic conduit.' },
        { number: 35, answer: { accepted: ['expand'] }, explanationHtml: 'Gas bubbles expand rapidly.' },
        { number: 36, answer: { accepted: ['fragmentation'] }, explanationHtml: 'The process is called fragmentation.' },
        { number: 37, answer: { accepted: ['column'] }, explanationHtml: 'An eruption column is formed.' },
        { number: 38, answer: { accepted: ['bombs'] }, explanationHtml: 'Large fragments are called volcanic bombs.' },
        { number: 39, answer: { accepted: ['lava'] }, explanationHtml: 'Lava flows down the slopes.' },
        { number: 40, answer: { accepted: ['cone'] }, explanationHtml: "Repeated eruptions build the volcano's cone shape." },
      ],
    },
  ],
};

export default {
  slug: 'vocably-practice-test-3',
  title: 'Vocably Practice Test 3',
  difficulty: 'medium',
  reading: {
    durationSec: 3600,
    passages: [passage1, passage2, passage3],
  },
  listening: {
    durationSec: 1800,
    checkTimeSec: 120,
    parts: [listeningPart1, listeningPart2, listeningPart3, listeningPart4],
  },
  writing: {
    durationSec: 3600,
    task1: {
      order: 1,
      minWords: 150,
      recommendedMin: 20,
      promptHtml:
        '<p>The chart below shows the average breakdown of household spending in one country in 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'pie',
        title: 'Household spending by category, 2020',
        categories: ['Housing', 'Food', 'Transport', 'Leisure', 'Other'],
        series: [{ name: 'Share of spending', data: [32, 22, 18, 15, 13] }],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>In recent years, more companies have allowed employees to work remotely or to follow a hybrid pattern, working partly from home and partly from the office.</p><p>Discuss the advantages and disadvantages of this trend and give your own opinion.</p>',
    },
  },
};
