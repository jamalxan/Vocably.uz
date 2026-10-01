// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-43',
  title: 'Vocably Practice Test 43',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The puzzle of the tip',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>Every day, millions of people hand over money they are not legally required to pay. In restaurants, taxis, hotels and hairdressers across many parts of the world, customers add a tip to the bill, often calculated as a percentage of the total. The practice varies enormously between countries. In some it is expected, and failing to leave a tip is considered rude; in others it is unusual, and in a few it may even cause offence. For economists, tipping is something of a puzzle, because it seems to contradict the assumption that people act in their own financial interest. The sums involved are far from trivial: in some countries, tips paid in restaurants alone are estimated to be worth tens of billions of dollars a year, and for many workers they make up a large part of their income.</p>" },
          { label: 'B', html: "<p>The origins of the custom are uncertain. One popular story claims that the word comes from a sign in eighteenth-century English coffee houses reading 'To Insure Promptness', but historians of language dismiss this as an invention. What is clear is that wealthy households in Europe gave small sums to servants, and that the practice spread to inns and restaurants. When it reached the United States in the late nineteenth century, it was at first widely criticised as undemocratic, a European habit that encouraged a class of servants dependent on the goodwill of the rich. Several states even passed laws against it, although none of them lasted long. Ironically, in several European countries the custom later declined, as service charges were added to bills or wages were raised, so that tipping is now far more firmly established in North America than in the places where it began.</p>" },
          { label: 'C', html: "<p>Why do people tip? The obvious answer is that it rewards good service and so encourages staff to work harder. Research, however, suggests that the link between the quality of service and the size of the tip is surprisingly weak. In studies in which customers rated their service and the tips were recorded, the quality of service explained only a small part of the difference between large and small tips. Other factors had a greater influence: the size of the bill, the number of people at the table, the weather, and even whether the server introduced themselves by name or drew a smiling face on the bill.</p>" },
          { label: 'D', html: "<p>A more convincing explanation may be social. People tip because they feel it is expected, because they want to be seen as generous, and because they would feel guilty if they did not. This helps to explain a curious finding: customers leave tips even in restaurants they will never visit again, where there is no possibility of receiving better service in future. Tipping, in this view, is less about rewarding staff than about following a social rule and avoiding embarrassment. Studies have found that customers tip more when they are with friends or on a date than when they eat alone, which suggests that the wish to make a good impression on companions plays a part. Rules about tipping are also learned: visitors from countries where it is uncommon often find the custom confusing, and are unsure how much to give or to whom.</p>" },
          { label: 'E', html: "<p>Critics argue that tipping has serious disadvantages. Because staff depend on customers' generosity, their income can vary greatly from week to week, and in some countries employers are allowed to pay tipped workers less than the normal minimum wage. Studies have also found that tips can be influenced by customers' prejudices about the age, appearance or background of the server. Some restaurant owners have tried abolishing tips and raising menu prices to pay staff higher wages, but several have returned to the old system after finding that customers disliked the higher prices and that experienced staff left for restaurants where they could earn more through tips. The debate seems likely to continue, particularly as digital payment systems, which often suggest a tip automatically, spread the custom into places such as cafés and shops where it was never previously expected.</p>" },
        ],
        questionGroups: [
          {
            id: 't43-r1-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 1 has five paragraphs, A-E. Choose the correct heading for paragraphs B-E from the list of headings below.<br/><em>Example: Paragraph A — iii</em>',
            bank: [
              { key: 'i', text: 'Uncertain beginnings and early opposition' },
              { key: 'ii', text: 'The problems caused by tipping' },
              { key: 'iv', text: 'A weak connection with service' },
              { key: 'v', text: 'How much to tip in different countries' },
              { key: 'vi', text: 'Tipping as a response to social pressure' },
              { key: 'vii', text: 'The rise of cashless payment' },
            ],
            questions: [
              { number: 1, promptHtml: 'Paragraph B', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph B: "The origins of the custom are uncertain" and it "was at first widely criticised".', locatorParagraph: 'B' },
              { number: 2, promptHtml: 'Paragraph C', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph C: "the link between the quality of service and the size of the tip is surprisingly weak".', locatorParagraph: 'C' },
              { number: 3, promptHtml: 'Paragraph D', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph D: "People tip because they feel it is expected".', locatorParagraph: 'D' },
              { number: 4, promptHtml: 'Paragraph E', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph E: "tipping has serious disadvantages".', locatorParagraph: 'E' },
            ],
          },
          {
            id: 't43-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 5, promptHtml: 'In some countries, leaving a tip may be considered offensive.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph A: "in a few it may even cause offence".', locatorParagraph: 'A' },
              { number: 6, promptHtml: 'Historians accept that the word "tip" comes from a sign in English coffee houses.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B: "historians of language dismiss this as an invention".', locatorParagraph: 'B' },
              { number: 7, promptHtml: 'Laws against tipping in the United States remained in force for many decades.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B: "none of them lasted long".', locatorParagraph: 'B' },
              { number: 8, promptHtml: 'Servers who introduce themselves by name may receive larger tips.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph C: tips were influenced by "whether the server introduced themselves by name".', locatorParagraph: 'C' },
              { number: 9, promptHtml: 'Customers tip more generously in expensive restaurants than in cheap ones.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph C mentions the size of the bill but not a comparison of expensive and cheap restaurants.', locatorParagraph: 'C' },
              { number: 10, promptHtml: 'People leave tips even when they do not expect to return to a restaurant.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph D: "customers leave tips even in restaurants they will never visit again".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't43-r1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            questions: [
              { number: 11, promptHtml: 'Tipping appears to go against the idea that people act in their own {{q11}}.', answer: { accepted: ['financial interest'] }, explanationHtml: 'Paragraph A: "people act in their own financial interest".', locatorParagraph: 'A' },
              { number: 12, promptHtml: 'In some countries, tipped workers may receive less than the normal {{q12}}.', answer: { accepted: ['minimum wage'] }, explanationHtml: 'Paragraph E: "pay tipped workers less than the normal minimum wage".', locatorParagraph: 'E' },
              { number: 13, promptHtml: 'Some restaurants that stopped tipping lost {{q13}} to competitors.', answer: { accepted: ['experienced staff'] }, explanationHtml: 'Paragraph E: "experienced staff left for restaurants where they could earn more".', locatorParagraph: 'E' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The long journey of the eel',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>For thousands of years, the European eel has been one of the most familiar fish in the rivers and lakes of Europe, caught and eaten from Scandinavia to the Mediterranean. Yet for most of that time, nobody knew where eels came from. Unlike salmon or trout, eels were never seen carrying eggs, and no one had ever found a young eel smaller than a few centimetres. The mystery occupied some of the greatest minds in the history of science.</p>" },
          { label: 'B', html: "<p>The Greek philosopher Aristotle, who studied animals closely, concluded that eels did not reproduce at all but arose spontaneously from the mud at the bottom of ponds and rivers. Later writers suggested that they grew from horse hairs that fell into water, or from the skin that adult eels rubbed off against rocks. These ideas seem absurd today, but they were reasonable attempts to explain the complete absence of any evidence of eel reproduction.</p>" },
          { label: 'C', html: "<p>In the nineteenth century, scientists began searching for the reproductive organs of eels. One young researcher who joined the hunt, in the Italian port of Trieste, was a medical student named Sigmund Freud, later famous as the founder of psychoanalysis. He dissected around four hundred eels in search of male organs, without success, and published a short paper admitting his failure. It was eventually established that the organs of eels living in rivers are undeveloped, and only mature when the eels begin their final journey.</p>" },
          { label: 'D', html: "<p>An important clue came from a small, transparent, leaf-shaped fish found in the sea, which had been described as a separate species. In the 1890s, two Italian scientists kept some of these creatures in an aquarium and watched them change into young eels. The leaf-shaped fish was in fact the larva of the eel. The question now became where these larvae came from.</p>" },
          { label: 'E', html: "<p>The answer was found by the Danish biologist Johannes Schmidt, who spent nearly twenty years, from 1904 onwards, collecting eel larvae with fine nets from ships all over the North Atlantic. He noticed that the further west he went, the smaller the larvae became. By plotting their sizes on a map, he traced them back to the Sargasso Sea, an area of the Atlantic east of the Bahamas, where he found the smallest larvae of all. He concluded that this was where eels were born, thousands of kilometres from the rivers where they spent their lives.</p>" },
          { label: 'F', html: "<p>We now know that the life cycle of the eel includes several stages. The larvae drift with ocean currents towards Europe, a journey that takes at least a year. As they approach the coast, they change into transparent 'glass eels', which enter rivers and estuaries, often in enormous numbers, and gradually darken in colour. The eels then spend anywhere between five and twenty years or more in fresh water, feeding and growing. Finally, as adults, they turn silver, their eyes grow larger and their digestive systems shrink, and they swim back to the sea to begin the long return journey.</p>" },
          { label: 'G', html: "<p>Remarkably, no one has ever seen eels breeding in the wild, and no adult eel has ever been caught in the Sargasso Sea. In recent years, researchers have attached small electronic tags to adult eels released from European coasts. The tags detach after a fixed period and float to the surface, where they transmit data to satellites. The results show that eels travel at great depths, rising towards the surface at night and diving deeper during the day, but most tags stopped transmitting long before the eels could have reached their destination.</p>" },
          { label: 'H', html: "<p>The mystery has taken on new urgency, because the European eel is now critically endangered. The number of glass eels arriving on European coasts has fallen by more than ninety per cent since the 1980s. The causes probably include dams that block rivers, pollution, disease, changes in ocean currents and overfishing. Young eels are especially valuable because they cannot be bred in captivity and must be caught in the wild to supply eel farms.</p>" },
          { label: 'I', html: "<p>The high price of glass eels has led to a large illegal trade, in which millions of young eels are smuggled out of Europe each year, packed in suitcases, to farms in Asia. Several countries have introduced strict controls, and conservation groups have helped to build special passages that allow eels to travel around dams. Scientists warn, however, that until the eel's breeding grounds and the full details of its life cycle are understood, it will be difficult to know whether these measures are enough.</p>" },
        ],
        questionGroups: [
          {
            id: 't43-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              { number: 14, promptHtml: 'a method used to track eels as they swim across the ocean', answer: { accepted: ['G'] }, explanationHtml: 'Paragraph G: "small electronic tags ... transmit data to satellites".', locatorParagraph: 'G' },
              { number: 15, promptHtml: 'the discovery that a creature thought to be a different species was a young eel', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: "The leaf-shaped fish was in fact the larva of the eel."', locatorParagraph: 'D' },
              { number: 16, promptHtml: 'the reason young eels must be taken from the wild', answer: { accepted: ['H'] }, explanationHtml: 'Paragraph H: "they cannot be bred in captivity".', locatorParagraph: 'H' },
              { number: 17, promptHtml: 'ancient explanations of where eels came from', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: Aristotle\'s view and later theories about horse hairs and skin.', locatorParagraph: 'B' },
              { number: 18, promptHtml: 'an illegal method of transporting young eels', answer: { accepted: ['I'] }, explanationHtml: 'Paragraph I: "smuggled out of Europe each year, packed in suitcases".', locatorParagraph: 'I' },
            ],
          },
          {
            id: 't43-r2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Life cycle of the European eel</strong></p>' +
              '<p>• larvae carried towards Europe by ocean {{q19}}<br/>• near the coast, they become glass eels and slowly get darker<br/>• live in fresh water for 5-20 years or more<br/>• adults turn {{q20}}; their {{q21}} become larger<br/>• in the ocean, eels dive deeper during the {{q22}}</p>',
            questions: [
              { number: 19, answer: { accepted: ['currents'] }, explanationHtml: 'Paragraph F: "The larvae drift with ocean currents towards Europe".', locatorParagraph: 'F' },
              { number: 20, answer: { accepted: ['silver'] }, explanationHtml: 'Paragraph F: "as adults, they turn silver".', locatorParagraph: 'F' },
              { number: 21, answer: { accepted: ['eyes'] }, explanationHtml: 'Paragraph F: "their eyes grow larger".', locatorParagraph: 'F' },
              { number: 22, answer: { accepted: ['day'] }, explanationHtml: 'Paragraph G: "diving deeper during the day".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't43-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 23, promptHtml: 'Freud found the male organs of eels after examining hundreds of fish.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph C: he dissected around four hundred eels "without success".', locatorParagraph: 'C' },
              { number: 24, promptHtml: 'Schmidt found that eel larvae became smaller towards the west.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph E: "the further west he went, the smaller the larvae became".', locatorParagraph: 'E' },
              { number: 25, promptHtml: 'Adult eels have been caught while breeding in the Sargasso Sea.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph G: "no adult eel has ever been caught in the Sargasso Sea".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't43-r2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 26,
                promptHtml: 'What is the main point of the final paragraph?',
                options: [
                  { key: 'A', text: 'Smuggling is the main cause of the decline of eels.' },
                  { key: 'B', text: 'Conservation measures have saved the eel.' },
                  { key: 'C', text: 'It is unclear whether current efforts to protect eels will work.' },
                  { key: 'D', text: 'Eel farms in Asia should be closed.' },
                ],
                answer: { accepted: ['C'] },
                explanationHtml: 'Paragraph I: "it will be difficult to know whether these measures are enough".',
              },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Philosophy for children',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Is it ever right to tell a lie? Can a machine think? If you replaced every part of a bicycle, one at a time, would it still be the same bicycle? Questions like these have occupied philosophers for thousands of years, and it is often assumed that they belong in universities, where adults with years of training can discuss them. Yet in classrooms in more than sixty countries, children as young as five are being encouraged to think about exactly these kinds of questions, through an approach known as philosophy for children.</p>" },
          { label: '', html: "<p>The idea was developed in the United States in the 1970s by a philosophy professor who had become concerned that his university students could not reason clearly. He decided that the problem began much earlier, and that children should be taught to think carefully from a young age. He wrote a series of short novels in which children discover philosophical questions in the course of everyday life, and these were used as the starting point for classroom discussions. Today, teachers more often begin with a picture book, a short film or an object, which the class uses to generate its own questions.</p>" },
          { label: '', html: "<p>A typical session follows a pattern. The children sit in a circle, look at or listen to the stimulus, and then take a few minutes to think of questions it raises. The class votes on which question to discuss, and the teacher's role is not to provide answers but to guide the discussion, asking children to give reasons for their views, to listen to one another, and to consider examples that might challenge their opinions. There are no right or wrong answers in the usual sense, but some answers are better supported than others, and the children learn to recognise the difference.</p>" },
          { label: '', html: "<p>The benefits claimed for this approach are considerable, and some of them are supported by evidence. In one large study in England, involving thousands of pupils in dozens of primary schools, children who took part in weekly philosophy sessions for a year made more progress in reading and mathematics than similar children who did not. The effect was particularly strong among children from disadvantaged backgrounds. Teachers also reported improvements in pupils' confidence, their ability to listen, and their patience with those who disagreed with them.</p>" },
          { label: '', html: "<p>I find these results encouraging, but I think it would be a mistake to justify philosophy for children mainly by its effect on test scores. The value of learning to think carefully about difficult questions does not depend on whether it improves a child's mathematics. It lies in the ability to examine one's own beliefs, to consider other points of view, and to disagree without hostility, abilities that seem more necessary than ever in a world of instant opinions and online arguments. If the approach also helps with reading and arithmetic, so much the better.</p>" },
          { label: '', html: "<p>Not everyone is convinced. Some parents worry that encouraging children to question everything will undermine respect for adults or for traditional values. Others argue that young children are simply not capable of abstract thought, and that the discussions produce little more than confused chatter. In my experience, both concerns are exaggerated. Children in these sessions are not taught to reject authority but to ask for reasons, which is quite different. And anyone who has listened to a group of seven-year-olds seriously debating whether it is fair to punish a whole class for the behaviour of one pupil will know that young children are capable of remarkably sophisticated reasoning.</p>" },
          { label: '', html: "<p>There are, however, genuine difficulties. Leading a good philosophical discussion is a demanding skill, and many teachers feel uncomfortable in a role in which they do not know the answers. Training is essential, and it takes time and money that schools often lack. There is also the pressure of a crowded timetable. When schools are judged largely on examination results, an hour a week spent on questions with no clear answers can seem a luxury.</p>" },
          { label: '', html: "<p>My own view is that this is short-sighted. Schools exist not only to pass on knowledge but to prepare young people to take part in a society in which they will have to make difficult decisions, weigh conflicting evidence and live alongside people who think differently. It is hard to imagine a better preparation for that than regular practice in thinking together, and it is a practice that costs very little beyond a teacher's time and a willingness to listen.</p>" },
        ],
        questionGroups: [
          {
            id: 't43-r3-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-J, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'reasons' },
              { key: 'B', text: 'answers' },
              { key: 'C', text: 'circle' },
              { key: 'D', text: 'novels' },
              { key: 'E', text: 'votes' },
              { key: 'F', text: 'examinations' },
              { key: 'G', text: 'picture book' },
              { key: 'H', text: 'rules' },
              { key: 'I', text: 'rows' },
              { key: 'J', text: 'prizes' },
            ],
            stemHtml:
              '<p><strong>A philosophy session</strong></p><p>Originally, discussions began with specially written {{q27}}, but today a teacher may start with a {{q28}}, a film or an object. The children sit in a {{q29}} and think of questions, and the class {{q30}} to choose one to discuss. The teacher does not give {{q31}}, but helps the children to explain and support their views.</p>',
            questions: [
              { number: 27, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 2: "He wrote a series of short novels ... used as the starting point".' },
              { number: 28, answer: { accepted: ['G'] }, explanationHtml: 'Paragraph 2: "teachers more often begin with a picture book, a short film or an object".' },
              { number: 29, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: "The children sit in a circle".' },
              { number: 30, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 3: "The class votes on which question to discuss".' },
              { number: 31, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "the teacher\'s role is not to provide answers".' },
            ],
          },
          {
            id: 't43-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 32, promptHtml: 'Why did the professor develop philosophy for children?', options: [{ key: 'A', text: 'He wanted to sell more books.' }, { key: 'B', text: 'His university students reasoned poorly.' }, { key: 'C', text: 'Schools asked him for help.' }, { key: 'D', text: 'He was interested in child psychology.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: he was "concerned that his university students could not reason clearly".' },
              { number: 33, promptHtml: 'The study in England found that the approach', options: [{ key: 'A', text: 'had no effect on reading.' }, { key: 'B', text: 'helped disadvantaged pupils most.' }, { key: 'C', text: 'was unpopular with teachers.' }, { key: 'D', text: 'only worked with older children.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 4: "The effect was particularly strong among children from disadvantaged backgrounds."' },
              { number: 34, promptHtml: 'What is the writer\'s view of the study\'s results?', options: [{ key: 'A', text: 'They are the main reason to teach philosophy.' }, { key: 'B', text: 'They are unreliable.' }, { key: 'C', text: 'They are welcome but not the most important point.' }, { key: 'D', text: 'They show that philosophy should replace mathematics.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: "encouraging, but ... a mistake to justify philosophy ... mainly by its effect on test scores".' },
              { number: 35, promptHtml: 'The writer mentions a discussion among seven-year-olds to show that', options: [{ key: 'A', text: 'young children can reason in complex ways.' }, { key: 'B', text: 'children often behave badly in class.' }, { key: 'C', text: 'punishment is usually unfair.' }, { key: 'D', text: 'discussions need clear rules.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 6: "young children are capable of remarkably sophisticated reasoning".' },
            ],
          },
          {
            id: 't43-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 36, promptHtml: 'The ability to disagree without hostility is particularly important today.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 5: such abilities "seem more necessary than ever in a world of instant opinions".' },
              { number: 37, promptHtml: 'Philosophy sessions teach children to reject the authority of adults.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 6: "Children ... are not taught to reject authority but to ask for reasons".' },
              { number: 38, promptHtml: 'Philosophy for children is more popular in Asia than in Europe.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage mentions more than sixty countries but does not compare regions.' },
              { number: 39, promptHtml: 'Teachers need training to lead philosophical discussions well.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 7: "Training is essential".' },
              { number: 40, promptHtml: 'Schools are right to give priority to examination subjects over philosophy.', answer: { accepted: ['NO'] }, explanationHtml: 'Final paragraph: "My own view is that this is short-sighted."' },
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
        contextText: 'You will hear a man joining a car-sharing club.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, CityWheels Car Club. How can I help?" },
          { speaker: 'B', voice: 'david', text: "Hi. I've just sold my car, and a friend told me about your club. I'd like to join." },
          { speaker: 'A', voice: 'zira', text: "Great. I can register you over the phone. Could I have your full name?" },
          { speaker: 'B', voice: 'david', text: "Yes, it's Thomas Okafor. That's O-K-A-F-O-R." },
          { speaker: 'A', voice: 'zira', text: "Thank you. And your address?" },
          { speaker: 'B', voice: 'david', text: "It's flat 3, 27 Brenton Road. That's B-R-E-N-T-O-N." },
          { speaker: 'A', voice: 'zira', text: "And the postcode?" },
          { speaker: 'B', voice: 'david', text: "N-W-8, 4-J-Q." },
          { speaker: 'A', voice: 'zira', text: "Thanks. Now, how long have you held a full driving licence? We need members to have had one for at least two years." },
          { speaker: 'B', voice: 'david', text: "Oh, much longer than that. About eleven years." },
          { speaker: 'A', voice: 'zira', text: "Fine. And have you had any accidents in the last five years?" },
          { speaker: 'B', voice: 'david', text: "No, none." },
          { speaker: 'A', voice: 'zira', text: "Good. Now, we have two membership plans. The Occasional plan has no monthly fee, but the hourly rate is higher. The Regular plan costs eight pounds a month, and the hourly rate is lower. Which would suit you?" },
          { speaker: 'B', voice: 'david', text: "I'll probably use a car every weekend, so the Regular plan, I think." },
          { speaker: 'A', voice: 'zira', text: "OK. And what kind of car would you usually need? We have small city cars, family cars and vans." },
          { speaker: 'B', voice: 'david', text: "Mostly a small car. But I might need a van now and then, when I'm moving furniture." },
          { speaker: 'A', voice: 'zira', text: "I'll put 'small' as your usual choice. Your nearest parking bay would probably be the one in Hadley Square. Is that close to you?" },
          { speaker: 'B', voice: 'david', text: "Yes, it's just round the corner." },
          { speaker: 'A', voice: 'zira', text: "Now, how would you like to pay? We take payments by direct debit, or by credit card." },
          { speaker: 'B', voice: 'david', text: "Direct debit, please." },
          { speaker: 'A', voice: 'zira', text: "OK, I'll send you the form. And finally, can I ask how you heard about us? Was it through our website, or an advertisement?" },
          { speaker: 'B', voice: 'david', text: "Neither, actually. It was a colleague at work who recommended you. I said a friend, but she's really a colleague." },
          { speaker: 'A', voice: 'zira', text: "That's fine. Once your licence has been checked, we'll send you a membership card. You just hold it against the windscreen to unlock the car." },
        ],
        questionGroups: [
          {
            id: 't43-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>CityWheels Car Club — Membership Application</strong></p>' +
              '<p><em>Example:</em> Reason for joining: has sold his car</p>' +
              '<p>Name: Thomas {{q1}}<br/>Address: Flat 3, 27 {{q2}} Road<br/>Years with full licence: {{q3}}<br/>Accidents in last 5 years: {{q4}}</p>' +
              '<p>Plan: {{q5}} (£{{q6}} a month)<br/>Usual type of car: {{q7}}<br/>Nearest parking bay: {{q8}} Square</p>' +
              '<p>Payment method: direct {{q9}}<br/>Heard about the club from: a {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['okafor'] }, explanationHtml: 'Spelled "O-K-A-F-O-R".' },
              { number: 2, answer: { accepted: ['brenton'] }, explanationHtml: 'Spelled "B-R-E-N-T-O-N".' },
              { number: 3, answer: { accepted: ['11', 'eleven'] }, explanationHtml: '"About eleven years."' },
              { number: 4, answer: { accepted: ['none', '0', 'zero'] }, explanationHtml: '"No, none."' },
              { number: 5, answer: { accepted: ['regular'] }, explanationHtml: '"the Regular plan, I think".' },
              { number: 6, answer: { accepted: ['8', 'eight'] }, explanationHtml: '"The Regular plan costs eight pounds a month".' },
              { number: 7, answer: { accepted: ['small'] }, explanationHtml: '"I\'ll put \'small\' as your usual choice." A van is only occasional.' },
              { number: 8, answer: { accepted: ['hadley'] }, explanationHtml: '"the one in Hadley Square".' },
              { number: 9, answer: { accepted: ['debit'] }, explanationHtml: '"Direct debit, please."' },
              { number: 10, answer: { accepted: ['colleague'] }, explanationHtml: '"It was a colleague at work who recommended you."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a tourist information officer talking about walking trails around the town of Kelbridge.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Hello, everyone, and thank you for coming to this short talk at the Kelbridge tourist information centre. My name's Peter, and I'm going to tell you about the walking trails around the town." },
          { speaker: 'A', voice: 'david', text: "First, a few general points. All four of our trails are marked with coloured signs, so they're easy to follow. And we've just produced a new trail guide, which you can pick up free from the desk. It includes a map and information about the history and wildlife of each route. There's also a free app, which works even where there's no phone signal." },
          { speaker: 'A', voice: 'david', text: "We also run guided walks at weekends. These used to be free, but we now make a small charge, and the money goes towards repairing paths." },
          { speaker: 'A', voice: 'david', text: "People often ask me which trail is the most popular. It's not the longest or the most dramatic, but the one that's easiest to reach, the Riverside Trail, because it starts right here in the town centre." },
          { speaker: 'A', voice: 'david', text: "In terms of safety, the main thing I'd ask is that you check the weather before setting out, because conditions can change very quickly on the hills. Mobile phone coverage is actually quite good in most areas." },
          { speaker: 'A', voice: 'david', text: "And please remember that dogs must be kept on a lead from March to July, because it's the nesting season for birds that nest on the ground." },
          { speaker: 'A', voice: 'david', text: "Now let me say a little about each trail. The Riverside Trail, as I said, starts in the town centre. It's completely flat, and it's the only one that's suitable for wheelchairs and pushchairs all the way along." },
          { speaker: 'A', voice: 'david', text: "The Castle Trail goes up to the ruins of Kelbridge Castle. It's quite steep in places, but the views from the top are the best in the area. There's a small café at the castle, which is the only place on any of the trails where you can buy food." },
          { speaker: 'A', voice: 'david', text: "The Forest Trail is a circular route through the old woodland to the west of the town. It's the best trail for wildlife. You may see deer, especially early in the morning. Part of it is closed at the moment, though, because of tree felling, so you'll need to follow the diversion signs." },
          { speaker: 'A', voice: 'david', text: "And finally, the Coastal Trail. It's the longest, at eighteen kilometres, and it's not a circular route, so you'll need to catch a bus back to Kelbridge at the end. The buses run every hour. It also has the best beaches, although swimming isn't safe everywhere, so look out for the warning signs." },
          { speaker: 'A', voice: 'david', text: "Right, if you have any questions, I'll be at the desk." },
        ],
        questionGroups: [
          {
            id: 't43-l2-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 11,
                promptHtml: 'Which TWO things are available free of charge from the centre?',
                options: [
                  { key: 'A', text: 'guided walks' },
                  { key: 'B', text: 'a trail guide' },
                  { key: 'C', text: 'walking boots' },
                  { key: 'D', text: 'an app' },
                  { key: 'E', text: 'parking' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"a new trail guide, which you can pick up free" and "a free app". Guided walks now have a charge.',
              },
            ],
          },
          {
            id: 't43-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 12, promptHtml: 'Money from the guided walks is used to', options: [{ key: 'A', text: 'pay the guides.' }, { key: 'B', text: 'repair paths.' }, { key: 'C', text: 'print new maps.' }], answer: { accepted: ['B'] }, explanationHtml: '"the money goes towards repairing paths".' },
              { number: 13, promptHtml: 'Why is the Riverside Trail the most popular?', options: [{ key: 'A', text: 'It is easy to get to.' }, { key: 'B', text: 'It is the shortest.' }, { key: 'C', text: 'It has the best scenery.' }], answer: { accepted: ['A'] }, explanationHtml: '"the one that\'s easiest to reach ... because it starts right here in the town centre".' },
              { number: 14, promptHtml: 'What safety advice does Peter give?', options: [{ key: 'A', text: 'Take a mobile phone.' }, { key: 'B', text: 'Walk in groups.' }, { key: 'C', text: 'Check the weather.' }], answer: { accepted: ['C'] }, explanationHtml: '"the main thing I\'d ask is that you check the weather before setting out".' },
              { number: 15, promptHtml: 'Dogs must be kept on a lead from March to July because', options: [{ key: 'A', text: 'farm animals are grazing.' }, { key: 'B', text: 'birds are nesting on the ground.' }, { key: 'C', text: 'the trails are busier.' }], answer: { accepted: ['B'] }, explanationHtml: '"it\'s the nesting season for birds that nest on the ground".' },
            ],
          },
          {
            id: 't43-l2-trails',
            type: 'matching_features',
            instructionHtml: 'Which trail does each statement refer to? Choose the correct letter, <strong>A-D</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Riverside Trail' },
              { key: 'B', text: 'Castle Trail' },
              { key: 'C', text: 'Forest Trail' },
              { key: 'D', text: 'Coastal Trail' },
            ],
            questions: [
              { number: 16, promptHtml: 'It is suitable for wheelchairs.', answer: { accepted: ['A'] }, explanationHtml: '"it\'s the only one that\'s suitable for wheelchairs".' },
              { number: 17, promptHtml: 'Food can be bought there.', answer: { accepted: ['B'] }, explanationHtml: '"a small café at the castle, which is the only place ... where you can buy food".' },
              { number: 18, promptHtml: 'Part of it is currently closed.', answer: { accepted: ['C'] }, explanationHtml: '"Part of it is closed at the moment, though, because of tree felling".' },
              { number: 19, promptHtml: 'Walkers need to take a bus at the end.', answer: { accepted: ['D'] }, explanationHtml: '"you\'ll need to catch a bus back to Kelbridge at the end".' },
              { number: 20, promptHtml: 'It offers the best views.', answer: { accepted: ['B'] }, explanationHtml: '"the views from the top are the best in the area".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Amy and Jack, talking to their tutor about organising a charity fun run.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Amy and Jack, you're organising the fun run for the Students' Union charity this year. How are the plans going?" },
          { speaker: 'B', voice: 'zira', text: "Quite well, I think. We've decided to hold it in April, rather than March, like last year." },
          { speaker: 'A', voice: 'david', text: "Why the change? Was it the weather?" },
          { speaker: 'C', voice: 'david2', text: "That was part of it, but mainly it's because March is when a lot of students have assignments due. We think more people will take part after the Easter break." },
          { speaker: 'A', voice: 'david', text: "Makes sense. How many runners are you hoping for?" },
          { speaker: 'B', voice: 'zira', text: "Last year there were about a hundred and fifty. We'd like to double that, so three hundred." },
          { speaker: 'A', voice: 'david', text: "That's ambitious. Which charity will benefit?" },
          { speaker: 'C', voice: 'david2', text: "We asked students to vote on it, and they chose a local mental health charity. We thought they'd choose something international, but the local one won easily." },
          { speaker: 'A', voice: 'david', text: "Interesting. And what's been the biggest challenge so far?" },
          { speaker: 'B', voice: 'zira', text: "Honestly, finding enough volunteers to help on the day. Lots of people want to run, but far fewer want to stand around marshalling." },
          { speaker: 'A', voice: 'david', text: "That's always the way. Have you thought about offering them something in return, like a free T-shirt?" },
          { speaker: 'C', voice: 'david2', text: "Yes, we're going to give them a certificate that they can use for the university's volunteering award. That seems to be working." },
          { speaker: 'A', voice: 'david', text: "Good idea. Now, let's go through the stages of the project and what you'll do at each one. First, choosing the route." },
          { speaker: 'B', voice: 'zira', text: "We're going to walk the whole route together with someone from the sports department, so that we can check for any dangers." },
          { speaker: 'A', voice: 'david', text: "Good. And getting permission?" },
          { speaker: 'C', voice: 'david2', text: "Part of the route goes through the park, so we have to fill in an application form for the city council. That needs to be done at least six weeks before the event." },
          { speaker: 'A', voice: 'david', text: "What about publicity?" },
          { speaker: 'B', voice: 'zira', text: "We've found that the most effective thing is short videos on social media, so we're going to make a series of those, featuring some of the runners from last year." },
          { speaker: 'A', voice: 'david', text: "And on the day itself?" },
          { speaker: 'C', voice: 'david2', text: "The main thing is safety. We're going to have a first-aid team at the finish line, and we'll give every marshal a radio so they can call for help." },
          { speaker: 'A', voice: 'david', text: "And after the event?" },
          { speaker: 'B', voice: 'zira', text: "We'll send a questionnaire to all the runners, to find out what they thought and what we could improve next year." },
          { speaker: 'A', voice: 'david', text: "Excellent. And how will you collect the money raised?" },
          { speaker: 'C', voice: 'david2', text: "Through an online page. We'll publish the total on the Students' Union website so everyone can see what they achieved." },
        ],
        questionGroups: [
          {
            id: 't43-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Why has the run been moved to April?', options: [{ key: 'A', text: 'The weather is better.' }, { key: 'B', text: 'Students are less busy.' }, { key: 'C', text: 'The park is not available in March.' }], answer: { accepted: ['B'] }, explanationHtml: '"mainly it\'s because March is when a lot of students have assignments due".' },
              { number: 22, promptHtml: 'How many runners do the students hope will take part?', options: [{ key: 'A', text: '150' }, { key: 'B', text: '200' }, { key: 'C', text: '300' }], answer: { accepted: ['C'] }, explanationHtml: '"We\'d like to double that, so three hundred."' },
              { number: 23, promptHtml: 'What surprised the students about the vote on the charity?', options: [{ key: 'A', text: 'Few students voted.' }, { key: 'B', text: 'A local charity was chosen.' }, { key: 'C', text: 'The result was very close.' }], answer: { accepted: ['B'] }, explanationHtml: '"We thought they\'d choose something international, but the local one won easily."' },
              { number: 24, promptHtml: 'What has been the main difficulty so far?', options: [{ key: 'A', text: 'finding helpers' }, { key: 'B', text: 'finding runners' }, { key: 'C', text: 'finding a sponsor' }], answer: { accepted: ['A'] }, explanationHtml: '"finding enough volunteers to help on the day".' },
              { number: 25, promptHtml: 'What will volunteers receive?', options: [{ key: 'A', text: 'a free T-shirt' }, { key: 'B', text: 'a certificate' }, { key: 'C', text: 'a free meal' }], answer: { accepted: ['B'] }, explanationHtml: '"we\'re going to give them a certificate". The T-shirt was only the tutor\'s suggestion.' },
            ],
          },
          {
            id: 't43-l3-stages',
            type: 'matching_features',
            instructionHtml:
              'What will the students do at each stage of the project? Choose <strong>FIVE</strong> answers from the box and write the correct letter, A-G, next to Questions 26-30.',
            bank: [
              { key: 'A', text: 'hire professional runners' },
              { key: 'B', text: 'send out a survey' },
              { key: 'C', text: 'provide communication equipment' },
              { key: 'D', text: 'make short films' },
              { key: 'E', text: 'complete an official document' },
              { key: 'F', text: 'check for hazards' },
              { key: 'G', text: 'print posters' },
            ],
            questions: [
              { number: 26, promptHtml: 'choosing the route', answer: { accepted: ['F'] }, explanationHtml: '"walk the whole route ... so that we can check for any dangers".' },
              { number: 27, promptHtml: 'getting permission', answer: { accepted: ['E'] }, explanationHtml: '"we have to fill in an application form for the city council".' },
              { number: 28, promptHtml: 'publicity', answer: { accepted: ['D'] }, explanationHtml: '"short videos on social media, so we\'re going to make a series of those".' },
              { number: 29, promptHtml: 'the day of the event', answer: { accepted: ['C'] }, explanationHtml: '"we\'ll give every marshal a radio".' },
              { number: 30, promptHtml: 'after the event', answer: { accepted: ['B'] }, explanationHtml: '"We\'ll send a questionnaire to all the runners".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about sleep in the animal kingdom.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning. In today's lecture on animal behaviour, I'm going to talk about sleep. Sleep is so familiar to us that we rarely stop to think how strange it is. For several hours a day, an animal stops paying attention to its surroundings and becomes vulnerable to predators. For such a risky behaviour to have survived through evolution, it must be extremely important." },
          { speaker: 'A', voice: 'zira', text: "Scientists define sleep by a few features. The animal is inactive, it usually adopts a particular posture or chooses a particular place, it is harder to wake than when resting, and, importantly, if it is prevented from sleeping, it sleeps for longer afterwards to make up for the loss." },
          { speaker: 'A', voice: 'zira', text: "Using this definition, sleep has been found in almost every animal that has been studied, including insects. Fruit flies, for example, have periods of inactivity during which they're less responsive, and if they're kept awake, they sleep more the next day. Even some jellyfish, which don't have a brain at all, show a sleep-like state at night." },
          { speaker: 'A', voice: 'zira', text: "The amount of sleep varies enormously. Some species of bat sleep for up to twenty hours a day. At the other extreme, large grazing animals such as horses and giraffes sleep for only a few hours, often in short periods, and much of it standing up. One explanation is diet: animals that eat grass need to spend a long time feeding, whereas predators such as lions can afford to sleep for long periods after a large meal." },
          { speaker: 'A', voice: 'zira', text: "Some animals have developed remarkable ways of sleeping. Dolphins, which must come to the surface to breathe, sleep with only half of their brain at a time. One half sleeps while the other remains alert, and one eye stays open. After a while, the two halves change over." },
          { speaker: 'A', voice: 'zira', text: "Some birds can do the same thing. Ducks sleeping in a row have been observed keeping the outer eye open, on the side facing away from the group, to watch for predators. And a few years ago, researchers who attached small recording devices to seabirds called frigatebirds discovered that they sleep while flying, during journeys that can last for weeks over the ocean. Interestingly, they slept for less than an hour a day in flight, compared with more than twelve hours on land." },
          { speaker: 'A', voice: 'zira', text: "So why do animals sleep? There are several theories. One is that sleep saves energy. Another is that it allows the body to repair itself. A third, which has received a lot of support recently, is that sleep helps the brain to clear away waste products that build up during the day. And there's strong evidence that sleep is important for memory, because experiments show that animals learn tasks better when they are allowed to sleep afterwards." },
          { speaker: 'A', voice: 'zira', text: "Finally, what happens when animals are deprived of sleep? In laboratory experiments, the effects are serious. Rats kept awake for long periods lose weight even though they eat more, and eventually their immune systems fail. This is one reason why researchers believe sleep has a basic biological function that no animal can do without." },
        ],
        questionGroups: [
          {
            id: 't43-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Sleep in animals</strong></p>' +
              '<p><em>Definition</em><br/>• the animal is inactive and adopts a particular {{q31}}<br/>• if prevented from sleeping, it later sleeps for {{q32}}</p>' +
              '<p><em>Examples</em><br/>• some {{q33}} show a sleep-like state without a brain<br/>• some bats sleep up to 20 hours a day<br/>• grazing animals sleep little, perhaps because of their {{q34}}</p>' +
              '<p><em>Unusual methods</em><br/>• dolphins sleep with half the brain, keeping one {{q35}} open<br/>• ducks watch for {{q36}} while sleeping<br/>• frigatebirds sleep while {{q37}}</p>' +
              '<p><em>Theories</em><br/>• saves energy; repairs the body; clears {{q38}} from the brain<br/>• important for {{q39}}</p>' +
              '<p><em>Sleep deprivation in rats</em><br/>• loss of weight and failure of the {{q40}} system</p>',
            questions: [
              { number: 31, answer: { accepted: ['posture'] }, explanationHtml: '"it usually adopts a particular posture".' },
              { number: 32, answer: { accepted: ['longer'] }, explanationHtml: '"it sleeps for longer afterwards".' },
              { number: 33, answer: { accepted: ['jellyfish'] }, explanationHtml: '"some jellyfish, which don\'t have a brain at all, show a sleep-like state".' },
              { number: 34, answer: { accepted: ['diet'] }, explanationHtml: '"One explanation is diet".' },
              { number: 35, answer: { accepted: ['eye'] }, explanationHtml: '"one eye stays open".' },
              { number: 36, answer: { accepted: ['predators'] }, explanationHtml: '"keeping the outer eye open ... to watch for predators".' },
              { number: 37, answer: { accepted: ['flying'] }, explanationHtml: '"they sleep while flying".' },
              { number: 38, answer: { accepted: ['waste'] }, explanationHtml: '"clear away waste products".' },
              { number: 39, answer: { accepted: ['memory', 'learning'] }, explanationHtml: '"sleep is important for memory".' },
              { number: 40, answer: { accepted: ['immune'] }, explanationHtml: '"eventually their immune systems fail".' },
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
        '<p>The chart below shows the number of visitors to four museums in one city in 2019 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Museum visitors, 2019 and 2023 (thousands)',
        unit: 'thousand',
        categories: ['Science Museum', 'Art Gallery', 'History Museum', 'Transport Museum'],
        xAxisLabel: 'Museum',
        yAxisLabel: 'Visitors (thousands)',
        series: [
          { name: '2019', data: [820, 540, 410, 160] },
          { name: '2023', data: [760, 610, 300, 230] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>In many countries, a growing number of people are choosing to live alone.</p><p>Is this a positive or negative development?</p>',
    },
  },
};
