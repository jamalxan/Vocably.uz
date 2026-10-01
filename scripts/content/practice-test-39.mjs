// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

const FOG_COLLECTOR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f7f9fb"/>
  <text x="200" y="24" font-weight="bold" fill="#333">A fog-collecting net</text>
  <path d="M20 60 Q60 40 100 60 Q140 40 180 60" stroke="#9aa9b8" stroke-width="3" fill="none"/>
  <text x="40" y="90" fill="#6b7b8c">wind carrying fog →</text>
  <rect x="140" y="60" width="8" height="300" fill="#6d4c41"/>
  <rect x="452" y="60" width="8" height="300" fill="#6d4c41"/>
  <rect x="148" y="80" width="304" height="170" fill="#e3edf5" stroke="#555"/>
  <path d="M148 100 H452 M148 120 H452 M148 140 H452 M148 160 H452 M148 180 H452 M148 200 H452 M148 220 H452 M148 240 H452" stroke="#90a4ae"/>
  <path d="M168 80 V250 M188 80 V250 M208 80 V250 M228 80 V250 M248 80 V250 M268 80 V250 M288 80 V250 M308 80 V250 M328 80 V250 M348 80 V250 M368 80 V250 M388 80 V250 M408 80 V250 M428 80 V250" stroke="#90a4ae"/>
  <path d="M148 250 L452 262" stroke="#1565c0" stroke-width="10"/>
  <path d="M452 262 L480 262 L480 330" stroke="#1565c0" stroke-width="6" fill="none"/>
  <rect x="455" y="330" width="110" height="55" fill="#bbdefb" stroke="#1565c0"/>
  <path d="M140 60 L60 360 M460 60 L560 360" stroke="#999" stroke-dasharray="5 4"/>
  <circle cx="300" cy="170" r="3" fill="#1565c0"/><circle cx="330" cy="195" r="3" fill="#1565c0"/><circle cx="260" cy="210" r="3" fill="#1565c0"/>
</svg>`);

export default {
  slug: 'vocably-practice-test-39',
  title: 'Vocably Practice Test 39',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Is handwriting worth teaching?',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>In many classrooms, the pencil is losing ground to the keyboard. Children who once spent hours practising joined-up letters now learn to type in their first years at school, and some education systems have stopped requiring pupils to learn cursive, the style of handwriting in which letters are connected. The argument for this change is straightforward. Adults today write almost everything on screens, from emails to reports, and it seems sensible to prepare children for the world they will actually live in. Time is limited, the argument continues, and every hour spent on the shapes of letters is an hour taken from science, mathematics or reading. Supporters of the change also point out that typing can help children who find handwriting physically difficult, and that spelling and grammar tools allow pupils to concentrate on what they want to say rather than on the mechanics of forming letters.</p>" },
          { label: '', html: "<p>I understand this reasoning, and I have no wish to defend handwriting simply because it is traditional. Many of us remember handwriting lessons as tedious exercises in copying, in which neatness was valued more highly than the content of what we wrote, and I do not believe children should be judged on the beauty of their script. Nor do I think that typing should be delayed; it is an essential skill, and children who cannot type quickly are at a disadvantage in secondary school and beyond. My concern is that in rushing to replace handwriting, we may be discarding something whose value we do not yet fully understand.</p>" },
          { label: '', html: "<p>There is now a considerable body of research suggesting that writing by hand plays a special role in learning to read. When young children form letters themselves, rather than selecting them on a keyboard, they appear to recognise them more easily afterwards. In one study, children who had practised writing letters by hand showed more activity in the areas of the brain associated with reading than children who had practised typing the same letters or tracing them. The explanation seems to be that producing a letter from memory forces the child to pay attention to its shape in a way that pressing a key does not. On a keyboard, every letter is produced by the same simple movement, and the letter appears already perfectly formed. With a pencil, by contrast, each letter requires a different sequence of movements, and the child's early attempts are often irregular, so that he or she must compare them constantly with the model. Researchers believe that this process of producing, checking and correcting helps the brain to build a more detailed picture of each letter.</p>" },
          { label: '', html: "<p>The benefits may continue into adult life. Several experiments with university students have compared those who take lecture notes by hand with those who use laptops. The laptop users typically write more, often recording the lecturer's words almost exactly. Yet when tested later, the students who wrote by hand frequently understood the ideas better. Because handwriting is slower, they could not copy everything, and had to decide what was important and express it in their own words. The effort of summarising, it appears, helps to fix ideas in the memory. These findings are not universal, and the difference between the groups is often small, but they point in a consistent direction.</p>" },
          { label: '', html: "<p>Critics reply that such research tells us about the value of thinking carefully, not about the value of handwriting as such, and that students could be trained to take better notes on a laptop. That may be true, but it overlooks the fact that most people will not receive such training. It also ignores a practical point: in many examinations, including some of the most important ones a young person will ever take, answers must still be written by hand. A pupil who has had little practice will write more slowly and tire more quickly, and may therefore be unable to show what he or she really knows.</p>" },
          { label: '', html: "<p>The answer, surely, is not to choose between handwriting and typing, but to recognise that they serve different purposes. Children need to become fluent typists, and they need to write by hand comfortably and quickly enough that the physical act of writing does not get in the way of their thinking. Whether they use a joined-up style matters much less than whether their handwriting is fast and legible. What would be a mistake is to abandon handwriting entirely on the assumption that technology has made it obsolete, when the evidence suggests that it may help children, and adults, to learn in ways that technology cannot yet replace.</p>" },
        ],
        questionGroups: [
          {
            id: 't39-r1-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'Handwriting should be defended mainly because it has a long history.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 2: "I have no wish to defend handwriting simply because it is traditional."' },
              { number: 2, promptHtml: 'Children should not be assessed on how attractive their handwriting is.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 2: "I do not believe children should be judged on the beauty of their script."' },
              { number: 3, promptHtml: 'Children should learn to type only after they have mastered handwriting.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 2: "Nor do I think that typing should be delayed".' },
              { number: 4, promptHtml: 'Most teachers are in favour of stopping handwriting lessons.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not report the views of most teachers.' },
              { number: 5, promptHtml: 'The research on students\' note-taking always shows a large difference between the two groups.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 4: "These findings are not universal, and the difference between the groups is often small".' },
              { number: 6, promptHtml: 'Most students are unlikely to be trained to take better notes on a laptop.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 5: "most people will not receive such training".' },
              { number: 7, promptHtml: 'Lack of handwriting practice may cause pupils to perform badly in some examinations.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 5: they "may therefore be unable to show what he or she really knows".' },
              { number: 8, promptHtml: 'Joined-up handwriting is more legible than other styles.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 6 says the style matters less than speed and legibility, but does not compare the legibility of styles.' },
            ],
          },
          {
            id: 't39-r1-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-I, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'shape' },
              { key: 'B', text: 'memory' },
              { key: 'C', text: 'speed' },
              { key: 'D', text: 'reading' },
              { key: 'E', text: 'words' },
              { key: 'F', text: 'colour' },
              { key: 'G', text: 'lecturer' },
              { key: 'H', text: 'keyboard' },
              { key: 'I', text: 'textbook' },
            ],
            stemHtml:
              '<p><strong>Research on handwriting</strong></p><p>Children who write letters by hand seem to recognise them better, and brain scans show more activity in areas linked to {{q9}}. This may be because forming a letter makes a child notice its {{q10}}. Students who take notes on laptops often copy the {{q11}} almost exactly, while those who write by hand must summarise ideas, which helps to store them in the {{q12}}.</p>',
            questions: [
              { number: 9, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 3: "more activity in the areas of the brain associated with reading".' },
              { number: 10, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: it "forces the child to pay attention to its shape".' },
              { number: 11, answer: { accepted: ['G'] }, explanationHtml: 'Paragraph 4: "recording the lecturer\'s words almost exactly".' },
              { number: 12, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 4: summarising "helps to fix ideas in the memory".' },
            ],
          },
          {
            id: 't39-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 13,
                promptHtml: 'What is the writer\'s main purpose in the passage?',
                options: [
                  { key: 'A', text: 'to argue that typing should not be taught in primary schools' },
                  { key: 'B', text: 'to describe the history of handwriting lessons' },
                  { key: 'C', text: 'to argue that handwriting still has an important place in education' },
                  { key: 'D', text: 'to compare different styles of handwriting' },
                ],
                answer: { accepted: ['C'] },
                explanationHtml: 'The writer accepts the value of typing but argues it would be "a mistake ... to abandon handwriting entirely".',
              },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Water from the air',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>Some of the driest places on Earth lie close to the sea. Along the Pacific coast of South America, and on parts of the Atlantic coast of Africa, rain may not fall for years at a time, yet on many mornings the hills are covered in thick fog. The fog forms when moist air above the ocean is cooled by cold sea currents, and the wind then carries it inland, where it meets rising ground. For centuries, local people have noticed that trees on these hillsides drip with water even when there has been no rain, as tiny droplets of fog collect on their leaves and run down to the ground.</p>" },
          { label: 'B', html: "<p>Fog harvesting imitates this natural process. The basic device is remarkably simple: a large, fine net stretched between two posts and placed at right angles to the wind. As fog blows through the net, droplets collide with the fibres and stick to them. When enough droplets have gathered, they join together to form larger drops, which become heavy enough to run down the net into a gutter along its lower edge. From there, a pipe carries the water to a storage tank. No energy is needed apart from the wind itself, and apart from occasional repairs, the system requires little maintenance. The water collected in this way is usually clean enough to drink after simple filtering, although in areas near industry or busy roads it may contain dust or other pollutants picked up by the fog, and so it must be tested regularly.</p>" },
          { label: 'C', html: "<p>The amount of water collected depends on several factors. The most important is the frequency and density of the fog, which varies greatly from place to place and from season to season. The height and position of the nets also matter: they work best on ridges and slopes facing the prevailing wind, usually between four hundred and a thousand metres above sea level. Under good conditions, a standard net of around forty square metres can produce several hundred litres of water a day, enough to supply a small household or to irrigate a vegetable garden. In poorer conditions the yield may fall to almost nothing for weeks at a time, which is why most projects include large storage tanks to keep water from the foggiest months for use later in the year. Before any nets are built, researchers normally set up a small test collector, often only a square metre in size, and measure how much water it gathers over a full year.</p>" },
          { label: 'D', html: "<p>Early projects achieved mixed results. In one well-known case in the 1990s, a village in northern Chile received water from dozens of nets for several years, but the system was eventually abandoned. The reasons were partly technical, since the nets were damaged by strong winds and were not repaired, but mainly social: the community had not been closely involved in planning the project, and when the scientists who had built it left, nobody felt responsible for its upkeep. Later projects have learned from this, and now typically train local people to maintain the equipment and give them a share in managing the water.</p>" },
          { label: 'E', html: "<p>Researchers have also improved the nets themselves. Traditional nets, made of a type of plastic mesh widely used for shading crops, capture only a small proportion of the water in the fog passing through them. Laboratory studies have shown that the thickness of the fibres and the size of the gaps between them make a significant difference, and newer designs, some of them using a double layer of mesh or fibres with special coatings, can collect several times as much. Other designs replace the net with thin vertical wires, like the strings of a harp, which allow water to run down more quickly without blocking the gaps.</p>" },
          { label: 'F', html: "<p>Fog harvesting is not a solution for large cities, and it cannot replace conventional water supplies in most places. However, for small, isolated communities in foggy dry regions, it can provide a reliable source of clean water at very low cost. In one project in the mountains of south-west Morocco, water from nets is piped directly to more than a dozen villages, saving women and girls hours each day that they previously spent fetching water from distant wells. Supporters point out that the benefits go beyond drinking water: in some areas, fog water has been used to grow trees, which in time may begin to collect fog themselves, gradually restoring forests that were lost long ago.</p>" },
        ],
        questionGroups: [
          {
            id: 't39-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has six paragraphs, A-F. Which paragraph contains the following information? <em>Choose the correct letter, A-F.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              { number: 14, promptHtml: 'an explanation of why one project failed', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: the nets were not repaired and "nobody felt responsible for its upkeep".', locatorParagraph: 'D' },
              { number: 15, promptHtml: 'a description of how fog is formed', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: "The fog forms when moist air above the ocean is cooled by cold sea currents".', locatorParagraph: 'A' },
              { number: 16, promptHtml: 'the best locations for placing nets', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: "they work best on ridges and slopes facing the prevailing wind".', locatorParagraph: 'C' },
              { number: 17, promptHtml: 'an example of a social benefit of fog harvesting', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: "saving women and girls hours each day".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't39-r2-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-H.',
            questions: [
              {
                number: 18,
                promptHtml: 'Which THREE of the following are mentioned as ways of improving the amount of water collected?',
                options: [
                  { key: 'A', text: 'changing the thickness of the fibres' },
                  { key: 'B', text: 'painting the posts a dark colour' },
                  { key: 'C', text: 'using two layers of mesh' },
                  { key: 'D', text: 'placing nets closer to the sea' },
                  { key: 'E', text: 'heating the net at night' },
                  { key: 'F', text: 'using vertical wires instead of a net' },
                  { key: 'G', text: 'making the storage tank larger' },
                  { key: 'H', text: 'adding a fan to increase the wind' },
                ],
                selectCount: 3,
                answer: { accepted: ['A', 'C', 'F'] },
                explanationHtml: 'Paragraph E: fibre thickness "make[s] a significant difference", "a double layer of mesh", and "thin vertical wires, like the strings of a harp".',
              },
            ],
          },
          {
            id: 't39-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 19, promptHtml: 'Fog harvesting systems need an electricity supply to operate.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B: "No energy is needed apart from the wind itself".' },
              { number: 20, promptHtml: 'The Chilean village project was paid for by a foreign government.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph D does not say who paid for the project.' },
              { number: 21, promptHtml: 'The plastic mesh used in traditional nets was originally designed for another purpose.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph E: it is a mesh "widely used for shading crops".' },
            ],
          },
          {
            id: 't39-r2-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: FOG_COLLECTOR,
            imageAlt: 'Diagram of a fog-collecting net: fog blows from the left through a large mesh stretched between two wooden posts; droplets form on the mesh; a channel runs along the bottom edge, leading to a pipe that goes down into a container on the ground.',
            imageHotspots: [
              { questionNumber: 22, x: 27, y: 18 },
              { questionNumber: 23, x: 55, y: 45 },
              { questionNumber: 24, x: 40, y: 67 },
              { questionNumber: 25, x: 83, y: 74 },
              { questionNumber: 26, x: 86, y: 90 },
            ],
            questions: [
              { number: 22, answer: { accepted: ['posts', 'post'] }, explanationHtml: 'Paragraph B: "a large, fine net stretched between two posts".' },
              { number: 23, answer: { accepted: ['droplets', 'larger drops', 'drops'] }, explanationHtml: 'Paragraph B: droplets "join together to form larger drops".' },
              { number: 24, answer: { accepted: ['gutter'] }, explanationHtml: 'Paragraph B: "into a gutter along its lower edge".' },
              { number: 25, answer: { accepted: ['pipe'] }, explanationHtml: 'Paragraph B: "a pipe carries the water".' },
              { number: 26, answer: { accepted: ['storage tank', 'tank'] }, explanationHtml: 'Paragraph B: "to a storage tank".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'The conquest of pain',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Before the middle of the nineteenth century, surgery was an ordeal that most people would do almost anything to avoid. Without any effective way of preventing pain, operations had to be carried out as quickly as possible while the patient was held down by assistants. Surgeons were admired above all for their speed: the best could remove a leg in less than a minute. Complex operations inside the body were almost impossible, and many patients who needed surgery refused it, preferring to take their chances with the disease. Doctors tried many ways of reducing the suffering, including alcohol, opium and even pressing on nerves to make a limb go numb, but none of these was reliable, and some were dangerous in themselves. Accounts written by patients who survived operations in this period describe the experience as the most terrible of their lives.</p>" },
          { label: 'B', html: "<p>The means of relieving pain had, in fact, been available for decades. In 1800, the young English chemist Humphry Davy published a report on nitrous oxide, a gas he had inhaled himself many times. He noted that it made him laugh uncontrollably, which led to its popular name, 'laughing gas', and that it seemed to reduce the pain of an inflamed tooth. He even suggested that it might be used during surgical operations. Nobody followed up the suggestion. Instead, nitrous oxide became a form of entertainment, and travelling showmen invited members of the public to inhale it on stage for the amusement of audiences.</p>" },
          { label: 'C', html: "<p>It was at one of these shows, in the 1840s, that an American dentist named Horace Wells noticed that a man who injured his leg while under the influence of the gas appeared to feel nothing. Wells began using nitrous oxide in his own practice, and in 1845 he arranged a public demonstration at a hospital in Boston. Unfortunately, the patient cried out during the procedure, perhaps because too little gas had been given, and the audience of doctors and students dismissed the demonstration as a failure. Wells never recovered from the humiliation.</p>" },
          { label: 'D', html: "<p>The following year, another Boston dentist, William Morton, who had briefly been Wells's partner, tried a different substance: ether, a liquid whose vapour had also been used for entertainment. In October 1846, at the same hospital, Morton gave ether to a patient while a surgeon removed a growth from his neck. The patient remained still and silent, and when he woke, he reported that he had felt no pain. The news spread across the Atlantic within weeks, and by the end of the year operations under ether were being performed in London. Morton, however, tried to keep the nature of his substance secret so that he could profit from it, and spent much of the rest of his life in bitter disputes over who deserved the credit.</p>" },
          { label: 'E', html: "<p>Ether had disadvantages. It irritated the lungs, often made patients sick, and was highly flammable, a serious danger in rooms lit by candles and gas lamps. In 1847, the Scottish doctor James Young Simpson, searching for an alternative, tested a number of chemicals on himself and his friends after dinner and found that chloroform worked quickly and was more pleasant to breathe. Simpson was particularly interested in relieving the pain of childbirth, and his use of chloroform for this purpose was fiercely opposed by some religious leaders. The debate was largely settled in 1853, when Queen Victoria accepted chloroform during the birth of her eighth child and afterwards praised its effects.</p>" },
          { label: 'F', html: "<p>Chloroform brought its own problems, since it could stop the heart, and a number of patients died suddenly under its influence. For the rest of the century, doctors argued about which substance was safer, and the choice often depended on national preference. What was not in doubt was the scale of the change. Surgeons no longer needed to work at great speed, so they could attempt longer and more delicate operations. Combined with the introduction of antiseptic methods a few decades later, anaesthesia transformed surgery from a last resort into a routine part of medicine. Today, anaesthesia is a medical speciality in its own right, and the drugs used are far safer and more precisely controlled than those of the nineteenth century. Yet the basic principle, that a patient can be made temporarily unaware of pain and then safely woken, remains the one demonstrated in Boston in 1846.</p>" },
        ],
        questionGroups: [
          {
            id: 't39-r3-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 3 has six paragraphs, A-F. Which paragraph contains the following information? <em>Choose the correct letter, A-F.</em>',
            questions: [
              { number: 27, promptHtml: 'an event that helped to end opposition to a new practice', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: the debate "was largely settled in 1853, when Queen Victoria accepted chloroform".', locatorParagraph: 'E' },
              { number: 28, promptHtml: 'a reference to a quality that surgeons were valued for before anaesthesia', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: "Surgeons were admired above all for their speed".', locatorParagraph: 'A' },
              { number: 29, promptHtml: 'an attempt to earn money from a discovery', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: Morton "tried to keep the nature of his substance secret so that he could profit from it".', locatorParagraph: 'D' },
              { number: 30, promptHtml: 'a suggestion that was ignored', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: Davy suggested surgical use; "Nobody followed up the suggestion."', locatorParagraph: 'B' },
              { number: 31, promptHtml: 'a possible reason why a demonstration went wrong', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: "perhaps because too little gas had been given".', locatorParagraph: 'C' },
              { number: 32, promptHtml: 'the long-term effect of anaesthesia on the kind of operations surgeons performed', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: surgeons "could attempt longer and more delicate operations".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't39-r3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Early anaesthetics</strong></p>' +
              '<p><em>Nitrous oxide</em>: Davy found it reduced the pain of an inflamed {{q33}}; later used by showmen for entertainment</p>' +
              '<p><em>Ether</em>: Morton used it while a growth was removed from a patient\'s {{q34}}; problems: irritated the lungs, made patients sick, and was highly {{q35}}</p>' +
              '<p><em>Chloroform</em>: Simpson tested chemicals on himself and his friends after {{q36}}; main danger: it could stop the {{q37}}</p>',
            questions: [
              { number: 33, answer: { accepted: ['tooth'] }, explanationHtml: 'Paragraph B: "reduce the pain of an inflamed tooth".', locatorParagraph: 'B' },
              { number: 34, answer: { accepted: ['neck'] }, explanationHtml: 'Paragraph D: "removed a growth from his neck".', locatorParagraph: 'D' },
              { number: 35, answer: { accepted: ['flammable'] }, explanationHtml: 'Paragraph E: "was highly flammable".', locatorParagraph: 'E' },
              { number: 36, answer: { accepted: ['dinner'] }, explanationHtml: 'Paragraph E: "tested a number of chemicals on himself and his friends after dinner".', locatorParagraph: 'E' },
              { number: 37, answer: { accepted: ['heart'] }, explanationHtml: 'Paragraph F: "it could stop the heart".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't39-r3-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 38, promptHtml: 'Davy tested nitrous oxide on himself.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph B: a gas "he had inhaled himself many times".' },
              { number: 39, promptHtml: 'Wells continued to use nitrous oxide successfully for many years after 1845.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph C says he "never recovered from the humiliation" but gives no information on his later use of the gas.' },
              { number: 40, promptHtml: 'News of Morton\'s operation took several years to reach Britain.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph D: "The news spread across the Atlantic within weeks".' },
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
        contextText: 'You will hear a woman phoning a bicycle hire company.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning, Lakeside Cycle Hire." },
          { speaker: 'B', voice: 'zira', text: "Hello. I'm coming to the lakes with my husband next month, and we'd like to hire bikes for a few days. Could you tell me what you have?" },
          { speaker: 'A', voice: 'david', text: "Certainly. We have three main types. The most popular is our hybrid bike. It's good on roads and on the easier forest tracks. That's eighteen pounds a day." },
          { speaker: 'B', voice: 'zira', text: "Eighteen. And is a helmet included?" },
          { speaker: 'A', voice: 'david', text: "Helmets are included with all our bikes. With the hybrid you also get a lock and a small repair kit." },
          { speaker: 'B', voice: 'zira', text: "OK. What else?" },
          { speaker: 'A', voice: 'david', text: "Then there's the mountain bike, which is for the steeper, rougher routes up in the hills. That's twenty-five pounds a day, and it comes with a map of the mountain trails." },
          { speaker: 'B', voice: 'zira', text: "I don't think we'll be doing anything that adventurous. And the third type?" },
          { speaker: 'A', voice: 'david', text: "The electric bike. It's very popular with people who want to go further without getting too tired. That's thirty-five pounds a day, and the price includes a spare battery, so you won't run out of power." },
          { speaker: 'B', voice: 'zira', text: "That sounds tempting. How far can you go on one battery?" },
          { speaker: 'A', voice: 'david', text: "About sixty kilometres, depending on the hills. With the spare, over a hundred." },
          { speaker: 'B', voice: 'zira', text: "My husband has a bad knee, so an electric bike might be good for him. I'll take a hybrid. Now, you mentioned guided rides on your website." },
          { speaker: 'A', voice: 'david', text: "Yes, we run two. The first is the Lake Shore ride, which goes all the way round the lake. It's on Tuesdays, and it's about thirty kilometres, mostly flat." },
          { speaker: 'B', voice: 'zira', text: "Where does it start?" },
          { speaker: 'A', voice: 'david', text: "From our shop, at nine thirty. It costs twelve pounds per person on top of the hire, and that includes a stop for lunch at a café in the village of Elterby." },
          { speaker: 'B', voice: 'zira', text: "And the other one?" },
          { speaker: 'A', voice: 'david', text: "That's the Castle ride, on Thursdays. It's shorter, about twenty kilometres, but there are some steep sections. It starts from the car park at Grayson Bridge, not from the shop, so you'd need to cycle there first, or we can take the bikes in our van for a small charge. It's fifteen pounds per person, which includes entry to the castle." },
          { speaker: 'B', voice: 'zira', text: "I think the Lake Shore ride would suit us better. Can I book now?" },
          { speaker: 'A', voice: 'david', text: "Of course. Can I have your name?" },
          { speaker: 'B', voice: 'zira', text: "It's Mrs Pennington. P-E-double N-I-N-G-T-O-N." },
          { speaker: 'A', voice: 'david', text: "Thank you. We'll need a deposit of twenty pounds per bike, and you'll get it back when you return them." },
        ],
        questionGroups: [
          {
            id: 't39-l1-bikes',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Type of bike', 'Price per day', 'Extras included'],
              [
                ['Hybrid', '£{{q1}}', 'helmet, lock and repair kit'],
                ['Mountain', '£25', 'helmet and a {{q2}} of trails'],
                ['{{q3}}', '£{{q4}}', 'helmet and a spare {{q5}}'],
              ],
              'Lakeside Cycle Hire'
            ),
            questions: [
              { number: 1, answer: { accepted: ['18', 'eighteen'] }, explanationHtml: '"That\'s eighteen pounds a day."' },
              { number: 2, answer: { accepted: ['map'] }, explanationHtml: '"it comes with a map of the mountain trails".' },
              { number: 3, answer: { accepted: ['electric'] }, explanationHtml: '"The electric bike."' },
              { number: 4, answer: { accepted: ['35', 'thirty-five'] }, explanationHtml: '"That\'s thirty-five pounds a day".' },
              { number: 5, answer: { accepted: ['battery'] }, explanationHtml: '"the price includes a spare battery".' },
            ],
          },
          {
            id: 't39-l1-rides',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Ride', 'Day', 'Distance', 'Start', 'Price includes'],
              [
                ['Lake Shore', '{{q6}}', '30 km', 'the shop, 9.30', 'lunch in the village of {{q7}}'],
                ['Castle', 'Thursday', '{{q8}} km', 'car park at Grayson Bridge', 'entry to the {{q9}}'],
              ],
              'Guided rides'
            ) + '<p>Customer name: Mrs {{q10}}</p>',
            questions: [
              { number: 6, answer: { accepted: ['tuesday', 'tuesdays'] }, explanationHtml: '"It\'s on Tuesdays".' },
              { number: 7, answer: { accepted: ['elterby'] }, explanationHtml: '"a stop for lunch at a café in the village of Elterby".' },
              { number: 8, answer: { accepted: ['20', 'twenty'] }, explanationHtml: '"It\'s shorter, about twenty kilometres".' },
              { number: 9, answer: { accepted: ['castle'] }, explanationHtml: '"which includes entry to the castle".' },
              { number: 10, answer: { accepted: ['pennington'] }, explanationHtml: 'Spelled "P-E-double N-I-N-G-T-O-N".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the owner of a farm shop and café talking to new seasonal staff.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone, and welcome to Brookfield Farm. I'm Helen Marsh, and my husband and I have run the farm for about twenty years. Thank you for joining us for the summer season." },
          { speaker: 'A', voice: 'zira', text: "Let me tell you a little about how the business started. Many people think we opened the shop because the farm was in financial trouble, but that wasn't really the case. What happened was that visitors kept stopping at the gate to ask if they could buy our strawberries, and we realised there was a demand. So we started with a small table by the road, and it grew from there." },
          { speaker: 'A', voice: 'zira', text: "Today the shop sells mainly our own produce, but we also stock goods from about twenty other local farms and producers. The café opened five years ago, and it's now actually the busiest part of the business, especially at weekends." },
          { speaker: 'A', voice: 'zira', text: "The one thing I'd ask all of you to remember is that customers come here because they want to know where their food comes from. So please don't be afraid to talk to them. If you don't know the answer to a question, find someone who does. That's more important than working quickly." },
          { speaker: 'A', voice: 'zira', text: "Now, let me tell you who's responsible for what, so you know who to go to. My husband, Tom, looks after the farm itself, the animals and the fields, so you won't see much of him in the shop. If you're working on the pick-your-own fields, though, he's the person in charge." },
          { speaker: 'A', voice: 'zira', text: "Our daughter, Katie, manages the café. She plans the menus and she's also responsible for all the baking, so if a customer asks about ingredients, for example because of an allergy, she's the person to ask." },
          { speaker: 'A', voice: 'zira', text: "Raj is our shop manager. He deals with the suppliers and orders all the stock. He also organises the staff rota, so if you need to change a shift, you should speak to him, not to me." },
          { speaker: 'A', voice: 'zira', text: "Sue has been with us since the beginning. She's in charge of our events, like the summer fair and the children's farm days, and she also runs our social media, so if you take any nice photos, send them to her." },
          { speaker: 'A', voice: 'zira', text: "And finally, Martin is our part-time bookkeeper. You'll see him on Fridays. He handles all the wages, so any questions about pay go to him. He also deals with health and safety, so if there's any kind of accident, however small, it must be reported to Martin and written in the book." },
          { speaker: 'A', voice: 'zira', text: "Now, some practical details. There are two shifts each day. The early shift starts at seven thirty, when we put out the fresh produce, and finishes at two. The late shift is from one thirty until the café closes, and it overlaps with the early shift for half an hour so that you can hand over. The rate of pay for everyone is twelve pounds fifty an hour, and you'll get a free lunch on every shift." },
          { speaker: 'A', voice: 'zira', text: "Right, let's go and have a look around." },
        ],
        questionGroups: [
          {
            id: 't39-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'Why did the farm first start selling to the public?', options: [{ key: 'A', text: 'The farm was losing money.' }, { key: 'B', text: 'People asked to buy fruit.' }, { key: 'C', text: 'A local shop closed down.' }], answer: { accepted: ['B'] }, explanationHtml: '"visitors kept stopping at the gate to ask if they could buy our strawberries".' },
              { number: 12, promptHtml: 'Which part of the business is the busiest now?', options: [{ key: 'A', text: 'the shop' }, { key: 'B', text: 'the pick-your-own fields' }, { key: 'C', text: 'the café' }], answer: { accepted: ['C'] }, explanationHtml: '"The café ... it\'s now actually the busiest part of the business".' },
              { number: 13, promptHtml: 'What does Helen say is most important for staff?', options: [{ key: 'A', text: 'talking to customers' }, { key: 'B', text: 'working quickly' }, { key: 'C', text: 'keeping the shop tidy' }], answer: { accepted: ['A'] }, explanationHtml: '"please don\'t be afraid to talk to them ... That\'s more important than working quickly."' },
            ],
          },
          {
            id: 't39-l2-people',
            type: 'matching_features',
            instructionHtml:
              'Who should staff speak to about each of the following? Choose <strong>FIVE</strong> answers from the box and write the correct letter, A-H, next to Questions 14-18.',
            bank: [
              { key: 'A', text: 'food allergies' },
              { key: 'B', text: 'changing a shift' },
              { key: 'C', text: 'photographs' },
              { key: 'D', text: 'pay and accidents' },
              { key: 'E', text: 'the pick-your-own fields' },
              { key: 'F', text: 'uniforms' },
              { key: 'G', text: 'parking' },
              { key: 'H', text: 'training courses' },
            ],
            questions: [
              { number: 14, promptHtml: 'Tom', answer: { accepted: ['E'] }, explanationHtml: '"If you\'re working on the pick-your-own fields, though, he\'s the person in charge."' },
              { number: 15, promptHtml: 'Katie', answer: { accepted: ['A'] }, explanationHtml: '"if a customer asks about ingredients, for example because of an allergy, she\'s the person to ask".' },
              { number: 16, promptHtml: 'Raj', answer: { accepted: ['B'] }, explanationHtml: '"if you need to change a shift, you should speak to him".' },
              { number: 17, promptHtml: 'Sue', answer: { accepted: ['C'] }, explanationHtml: '"if you take any nice photos, send them to her".' },
              { number: 18, promptHtml: 'Martin', answer: { accepted: ['D'] }, explanationHtml: '"any questions about pay go to him ... if there\'s any kind of accident ... reported to Martin".' },
            ],
          },
          {
            id: 't39-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR NUMBERS</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 2, label: 'ONE WORD AND/OR NUMBERS' },
            stemHtml: table(
              ['Shift', 'Times'],
              [
                ['Early', '{{q19}} – 2.00'],
                ['Late', '1.30 – when the {{q20}} closes'],
              ],
              'Working hours'
            ),
            questions: [
              { number: 19, answer: { accepted: ['7.30', '7:30'] }, explanationHtml: '"The early shift starts at seven thirty".' },
              { number: 20, answer: { accepted: ['café', 'cafe'] }, explanationHtml: '"The late shift is from one thirty until the café closes".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a student, Maya, talking to her tutor about a poster she is preparing for a student research conference.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Hello, Maya. So, the poster conference is in three weeks. How are you getting on?" },
          { speaker: 'B', voice: 'zira', text: "I've got a first draft. It's about my project on bird feeders in gardens, whether feeding birds in winter changes which species visit." },
          { speaker: 'A', voice: 'david', text: "Right. Let's have a look. My first impression is that there's too much text. People walking past a poster will only stop for a minute or two, so they need to understand the main point very quickly." },
          { speaker: 'B', voice: 'zira', text: "I was worried about that. How many words should there be?" },
          { speaker: 'A', voice: 'david', text: "As a rough guide, no more than about five hundred in total. At the moment you've got nearly twice that. The introduction in particular could be much shorter. One or two sentences explaining why the question matters would be enough." },
          { speaker: 'B', voice: 'zira', text: "OK. What about the title?" },
          { speaker: 'A', voice: 'david', text: "It's accurate, but it's rather long. A good poster title is often a question, or a short statement of the main finding. And it needs to be readable from about two metres away, so make the letters bigger." },
          { speaker: 'B', voice: 'zira', text: "I'll try a question. What do you think of the graphs?" },
          { speaker: 'A', voice: 'david', text: "The bar chart showing the number of species is very clear. But the table of results in the middle is hard to read. I'd turn that into a graph too. And think about colour. Some people can't distinguish red and green, so it's better to avoid putting those two colours next to each other." },
          { speaker: 'B', voice: 'zira', text: "I didn't know that. I'll change them to blue and orange." },
          { speaker: 'A', voice: 'david', text: "Good. Now, your methods section. You've described the feeders in a lot of detail, but you haven't said how many gardens were included." },
          { speaker: 'B', voice: 'zira', text: "It was twenty-four gardens, half with feeders and half without." },
          { speaker: 'A', voice: 'david', text: "Put that in clearly, because it's one of the first things people will ask. And add a photograph of one of the gardens, which will make the poster more attractive." },
          { speaker: 'B', voice: 'zira', text: "Should I put all the references on the poster?" },
          { speaker: 'A', voice: 'david', text: "Just the three or four most important, in a small font at the bottom. You can have a handout with the full list for anyone who's interested." },
          { speaker: 'B', voice: 'zira', text: "And during the conference, will I have to give a talk?" },
          { speaker: 'A', voice: 'david', text: "Not a formal talk. You stand by your poster, and people come and ask you questions. The judges will also come round, and they'll ask you to summarise the project in about two minutes, so it's worth practising that." },
          { speaker: 'B', voice: 'zira', text: "Two minutes. OK. Is there anything else they'll be looking for?" },
          { speaker: 'A', voice: 'david', text: "They'll want to see that you understand the limitations of your study. For example, you only collected data over one winter, so it would be good to mention that, and to suggest what further research could be done." },
          { speaker: 'B', voice: 'zira', text: "That's really helpful. When do you need the final version?" },
          { speaker: 'A', voice: 'david', text: "Send it to me by the twenty-third, so there's time to print it." },
        ],
        questionGroups: [
          {
            id: 't39-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Advice on Maya\'s poster</strong></p>' +
              '<p><em>Text</em>: maximum of about {{q21}} words in total; shorten the {{q22}}</p>' +
              '<p><em>Title</em>: could be a {{q23}}; must be readable from 2 metres</p>' +
              '<p><em>Graphs</em>: change the {{q24}} into a graph; avoid red and green together</p>' +
              '<p><em>Methods</em>: state that {{q25}} gardens were studied; add a {{q26}} of a garden</p>' +
              '<p><em>References</em>: only the most important; full list on a {{q27}}</p>' +
              '<p><em>Conference</em>: be ready to summarise the project in about {{q28}}; mention the {{q29}} of the study, e.g. data from only one {{q30}}</p>',
            questions: [
              { number: 21, answer: { accepted: ['500', 'five hundred'] }, explanationHtml: '"no more than about five hundred in total".' },
              { number: 22, answer: { accepted: ['introduction'] }, explanationHtml: '"The introduction in particular could be much shorter."' },
              { number: 23, answer: { accepted: ['question'] }, explanationHtml: '"A good poster title is often a question".' },
              { number: 24, answer: { accepted: ['table', 'table of results'] }, explanationHtml: '"the table of results ... I\'d turn that into a graph too".' },
              { number: 25, answer: { accepted: ['24', 'twenty-four'] }, explanationHtml: '"It was twenty-four gardens".' },
              { number: 26, answer: { accepted: ['photograph', 'photo'] }, explanationHtml: '"add a photograph of one of the gardens".' },
              { number: 27, answer: { accepted: ['handout'] }, explanationHtml: '"a handout with the full list".' },
              { number: 28, answer: { accepted: ['two minutes', '2 minutes'] }, explanationHtml: '"summarise the project in about two minutes".' },
              { number: 29, answer: { accepted: ['limitations'] }, explanationHtml: '"understand the limitations of your study".' },
              { number: 30, answer: { accepted: ['winter'] }, explanationHtml: '"you only collected data over one winter".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about a seed bank built inside a mountain in the Arctic.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "In today's lecture on food security, I want to look at one of the most unusual buildings in the world: a seed vault on the island of Spitsbergen, in the Svalbard archipelago, far to the north of mainland Norway." },
          { speaker: 'A', voice: 'david', text: "First, some background. Around the world there are more than a thousand gene banks, collections of seeds kept so that plant varieties can be preserved for future use. Many of the crop varieties farmers grew in the past have disappeared from the fields, but their genes may one day be needed, for instance to breed plants that can resist a new disease or cope with a changing climate." },
          { speaker: 'A', voice: 'david', text: "The problem is that gene banks themselves are vulnerable. Some have been damaged by war, others by natural disasters, and many simply by a lack of money, which means that equipment such as freezers isn't properly maintained. The vault in Svalbard was designed as a back-up, a kind of insurance policy for all the others." },
          { speaker: 'A', voice: 'david', text: "It opened in 2008. The seeds aren't owned by the vault; they remain the property of the gene banks that send them, rather like valuables kept in a bank's safe-deposit boxes. Only the institution that deposited the seeds can take them out again." },
          { speaker: 'A', voice: 'david', text: "Why build it in the Arctic? There were several reasons. The main one was the permafrost, the ground that stays frozen all year round. Even if the power supply failed, the natural temperature inside the mountain would keep the seeds frozen for a long time. The site is also high enough above sea level to remain dry even if all the ice in the world were to melt. And the region is politically stable and far from any conflict." },
          { speaker: 'A', voice: 'david', text: "The vault itself is a tunnel cut more than a hundred metres into the mountain. At the end are three storage rooms, although at present only one or two are in use. The seeds are dried, sealed in special foil packets, and stored in boxes on shelves at a temperature of minus eighteen degrees Celsius. At that temperature, the seeds of many crops can remain alive for hundreds of years." },
          { speaker: 'A', voice: 'david', text: "The vault can hold four and a half million different samples, each containing on average around five hundred seeds. At the moment it holds well over a million samples, and more arrive several times a year." },
          { speaker: 'A', voice: 'david', text: "For its first few years, nothing was taken out. But in 2015, a research centre that had been based near the Syrian city of Aleppo became the first to make a withdrawal. The war had forced it to leave its gene bank, so it asked for its seeds back in order to set up new collections in Lebanon and Morocco. Several years later, it was able to return fresh seeds to the vault." },
          { speaker: 'A', voice: 'david', text: "The vault hasn't been without problems. In 2016, after an unusually warm period, water from melting snow and ice entered the entrance tunnel. It didn't reach the seeds, but the incident was a reminder that climate change affects the Arctic more than almost anywhere else. As a result, the entrance has since been rebuilt and waterproofed." },
          { speaker: 'A', voice: 'david', text: "So, what's the significance of all this? The vault is sometimes described as a 'doomsday' store, but I think that's misleading. Its real value is in dealing with the everyday losses that happen in gene banks all the time, and in reminding us that genetic diversity in crops is a resource we cannot afford to lose." },
        ],
        questionGroups: [
          {
            id: 't39-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'According to the lecturer, many gene banks are at risk mainly because of', options: [{ key: 'A', text: 'rising temperatures.' }, { key: 'B', text: 'a shortage of funding.' }, { key: 'C', text: 'poor scientific training.' }], answer: { accepted: ['B'] }, explanationHtml: '"many simply by a lack of money, which means that equipment such as freezers isn\'t properly maintained".' },
              { number: 32, promptHtml: 'Who owns the seeds kept in the vault?', options: [{ key: 'A', text: 'the Norwegian government' }, { key: 'B', text: 'the organisation that runs the vault' }, { key: 'C', text: 'the gene banks that deposit them' }], answer: { accepted: ['C'] }, explanationHtml: '"they remain the property of the gene banks that send them".' },
            ],
          },
          {
            id: 't39-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>The Svalbard seed vault</strong></p>' +
              '<p><em>Reasons for location</em><br/>• {{q33}} keeps seeds frozen if power fails<br/>• high enough to stay dry<br/>• region is politically {{q34}}</p>' +
              '<p><em>Design</em><br/>• a tunnel more than 100 metres into the mountain<br/>• seeds are dried and sealed in {{q35}} packets<br/>• stored at minus {{q36}} degrees Celsius</p>' +
              '<p><em>Contents</em><br/>• each sample contains about {{q37}} seeds</p>' +
              '<p><em>History</em><br/>• first withdrawal in 2015 by a research centre from {{q38}}<br/>• new collections set up in Lebanon and {{q39}}<br/>• 2016: water from melting snow and ice entered the {{q40}} tunnel</p>',
            questions: [
              { number: 33, answer: { accepted: ['permafrost'] }, explanationHtml: '"The main one was the permafrost".' },
              { number: 34, answer: { accepted: ['stable'] }, explanationHtml: '"the region is politically stable".' },
              { number: 35, answer: { accepted: ['foil'] }, explanationHtml: '"sealed in special foil packets".' },
              { number: 36, answer: { accepted: ['18', 'eighteen'] }, explanationHtml: '"a temperature of minus eighteen degrees Celsius".' },
              { number: 37, answer: { accepted: ['500', 'five hundred'] }, explanationHtml: '"each containing on average around five hundred seeds".' },
              { number: 38, answer: { accepted: ['aleppo', 'syria'] }, explanationHtml: '"a research centre that had been based in the Syrian city of Aleppo".' },
              { number: 39, answer: { accepted: ['morocco'] }, explanationHtml: '"to set up new collections in Lebanon and Morocco".' },
              { number: 40, answer: { accepted: ['entrance'] }, explanationHtml: '"water from melting snow and ice entered the entrance tunnel".' },
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
        '<p>The chart below shows the percentage of electricity generated from renewable sources in four countries in 2000, 2010 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Electricity generated from renewable sources (%)',
        unit: '%',
        categories: ['Country A', 'Country B', 'Country C', 'Country D'],
        xAxisLabel: 'Country',
        yAxisLabel: 'Percentage of electricity',
        series: [
          { name: '2000', data: [12, 3, 28, 6] },
          { name: '2010', data: [19, 9, 34, 11] },
          { name: '2020', data: [43, 27, 41, 15] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that governments should continue to spend money on public libraries. Others believe that libraries are no longer necessary because so much information is available online.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
