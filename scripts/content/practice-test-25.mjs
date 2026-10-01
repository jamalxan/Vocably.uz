// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, TFNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-25',
  title: 'Vocably Practice Test 25',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Gardens that climb the walls',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>On the side of a museum in Paris, a wall more than two hundred metres long and twelve metres high is covered from top to bottom in living plants: ferns, grasses, flowering shrubs and even small trees, arranged in flowing bands of green, red and gold. It is one of the best-known examples of a vertical garden, and its creator, the French botanist Patrick Blanc, has done more than anyone to turn the idea of planting on walls from a curiosity into an important element of modern architecture. Today, green walls can be found on offices, hotels, shopping centres and apartment blocks in cities around the world.</p>" },
          { label: 'B', html: "<p>Blanc's inspiration came from nature rather than from gardening. As a young scientist studying plants in tropical forests, he noticed that many species grew not in soil but on rocks, cliffs and the trunks of trees, drawing water and nutrients from the rain and from material that collected around their roots. He concluded that soil itself was not essential; what plants needed was water, minerals, light and something to hold on to. In the 1980s, he began experimenting with growing plants on vertical surfaces in his own home, and in 1988 he patented his system.</p>" },
          { label: 'C', html: "<p>The system is surprisingly simple. A metal frame is fixed to the wall, leaving a gap so that air can circulate and the building does not become damp. A sheet of waterproof plastic is attached to the frame, and on top of this are two layers of a synthetic felt, similar to the material used in carpets. The plants are inserted into pockets cut into the felt, and their roots spread through it. Water containing dissolved nutrients is pumped to the top of the wall and trickles down through the felt, and any water that is not absorbed is collected in a gutter at the bottom and reused. The whole structure weighs less than thirty kilograms per square metre, light enough to be attached to almost any building.</p>" },
          { label: 'D', html: "<p>Supporters of green walls point to a range of benefits. Plants cool the air around them as water evaporates from their leaves, and a green wall can reduce the temperature of the surface behind it by several degrees on a hot day, lowering the need for air conditioning inside. The plants also trap dust and absorb some pollutants, and the layers of felt and vegetation reduce noise from traffic. Several studies have found that people working in offices with views of plants report lower levels of stress and are absent from work less often. Green walls can also provide a habitat for insects and small birds in areas where there is little other vegetation, and some owners report that they help to protect the surface of the building from sun and rain, extending its life.</p>" },
          { label: 'E', html: "<p>The approach has been copied widely, and many companies now sell their own versions. Some use panels filled with soil or a soil-like material, rather than felt; others use modules of plastic or metal that can be removed and replaced individually. Researchers are also developing walls in which the plants are chosen specifically to clean indoor air, and systems that use waste water from buildings, such as water from sinks and showers, which would reduce the need for fresh water. These systems are still being tested and are not yet in commercial use.</p>" },
          { label: 'F', html: "<p>Green walls have critics as well as admirers. They are expensive to install, and even more expensive to maintain: the pumps and pipes must be checked regularly, plants that die must be replaced, and if the water supply fails, a wall can be destroyed within days. Some early walls on public buildings were removed after a few years because the owners could not afford to look after them. Critics also point out that the environmental benefits of a single wall are small compared with those of planting trees at street level, which is usually much cheaper. Blanc himself accepts that a green wall is not a substitute for parks and street trees, but argues that in the densest parts of cities, walls may be the only surfaces available for planting.</p>" },
        ],
        questionGroups: [
          {
            id: 't25-r1-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 1 has six paragraphs, A-F. Which paragraph contains the following information? <em>Choose the correct letter, A-F.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              { number: 1, promptHtml: 'the natural observation that led to an invention', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: plants growing "on rocks, cliffs and the trunks of trees".', locatorParagraph: 'B' },
              { number: 2, promptHtml: 'a description of how water moves through the system', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: water "is pumped to the top of the wall and trickles down through the felt".', locatorParagraph: 'C' },
              { number: 3, promptHtml: 'the effect of plants on people at work', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: office workers "report lower levels of stress".', locatorParagraph: 'D' },
              { number: 4, promptHtml: 'examples of green walls that were taken down', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: "Some early walls ... were removed after a few years".', locatorParagraph: 'F' },
              { number: 5, promptHtml: 'the variety of buildings where green walls are now found', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: "offices, hotels, shopping centres and apartment blocks".', locatorParagraph: 'A' },
              { number: 6, promptHtml: 'the reason a gap is left between the system and the wall', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: "so that air can circulate and the building does not become damp".', locatorParagraph: 'C' },
              { number: 7, promptHtml: 'a comparison between green walls and a cheaper alternative', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: "planting trees at street level, which is usually much cheaper".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't25-r1-classify',
            type: 'matching_features',
            instructionHtml: 'Classify the following as<br/><strong>A</strong> part of Blanc\'s original system<br/><strong>B</strong> used by some other companies<br/><strong>C</strong> still being tested',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'part of Blanc\'s original system' },
              { key: 'B', text: 'used by some other companies' },
              { key: 'C', text: 'still being tested' },
            ],
            questions: [
              { number: 8, promptHtml: 'layers of synthetic felt', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: "two layers of a synthetic felt".', locatorParagraph: 'C' },
              { number: 9, promptHtml: 'removable modules', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph E: others use "modules ... that can be removed and replaced individually".', locatorParagraph: 'E' },
              { number: 10, promptHtml: 'the use of water from sinks and showers', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph E: "These systems are still being tested".', locatorParagraph: 'E' },
              { number: 11, promptHtml: 'panels containing soil', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph E: "Some use panels filled with soil".', locatorParagraph: 'E' },
            ],
          },
          {
            id: 't25-r1-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            questions: [
              { number: 12, promptHtml: 'In which year did Blanc patent his system?', answer: { accepted: ['1988'] }, explanationHtml: 'Paragraph B: "in 1988 he patented his system".', locatorParagraph: 'B' },
              { number: 13, promptHtml: 'What collects the water that is not absorbed?', answer: { accepted: ['a gutter', 'gutter'] }, explanationHtml: 'Paragraph C: "collected in a gutter at the bottom".', locatorParagraph: 'C' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Setting the clocks of the world',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>Until the nineteenth century, every town kept its own time. Noon was the moment when the Sun reached its highest point in the sky, and because the Sun appears to move from east to west, noon arrived a few minutes earlier in a town in the east than in one further west. In Britain, for example, noon in Bristol came about ten minutes after noon in London. For most people, this made no practical difference. Journeys were slow, and nobody could tell whether a clock in another town showed a different time from their own.</p>" },
          { label: 'B', html: "<p>The railways changed this. Trains made it possible to travel between cities in hours, and timetables had to show departure and arrival times. When every station kept its own local time, timetables became extremely confusing, and there was a real risk of accidents on lines where trains ran in both directions. In 1840, one British railway company began using London time at all its stations, and within a few years most other companies had done the same. Many towns kept their local time for other purposes, and some public clocks had two minute hands, one showing local time and one showing railway time.</p>" },
          { label: 'C', html: "<p>The problem was far worse in large countries. In the United States, dozens of railway companies each used their own time, often based on the city where the company had its headquarters, and a single large station might display several clocks showing different times. In 1883, the railway companies themselves, without waiting for the government, introduced a system of four standard time zones across the country, each exactly one hour apart. The change took place on a single day, which became known as 'the day of two noons', because in many places clocks had to be set back and noon occurred twice.</p>" },
          { label: 'D', html: "<p>The following year, representatives of twenty-five countries met in Washington to agree on a single starting point for measuring longitude and time around the world. After a month of discussion, they chose the meridian passing through the Royal Observatory at Greenwich, near London, partly because most of the world's ships already used charts based on it. France, which had hoped that Paris would be chosen, abstained from the vote and continued to use its own meridian for several decades.</p>" },
          { label: 'E', html: "<p>The conference did not create the system of time zones used today; it simply established Greenwich as the reference point. Countries adopted standard time gradually over the following decades, each deciding for itself how its time would relate to Greenwich. Most chose zones that were a whole number of hours ahead or behind, but a few, such as India, chose times that differ from Greenwich by half an hour, and one or two by three quarters of an hour.</p>" },
          { label: 'F', html: "<p>Time zones are often shaped more by politics than by geography. China, which stretches across an area that would naturally cover five time zones, uses a single time throughout the country, so that in the far west the Sun may not rise until ten o'clock in the morning. Spain, which lies in line with Britain, uses the same time as central Europe, a decision that dates from the Second World War and that some economists believe contributes to the late hours at which Spaniards traditionally eat and sleep.</p>" },
          { label: 'G', html: "<p>The way time is measured has also changed. Greenwich Mean Time was based on the movement of the Earth, which turned out to be slightly irregular. Since 1972, the world's official time has been based on atomic clocks, which measure time by the vibrations of atoms and are accurate to within a second over millions of years. To keep atomic time in line with the Earth's rotation, an extra second, known as a leap second, has occasionally been added, although international scientists have now agreed to stop this practice in the coming years because it causes problems for computer systems.</p>" },
          { label: 'H', html: "<p>Accurate timekeeping has become essential to modern life in ways that are rarely noticed. Satellite navigation systems work by measuring the time taken for signals to travel from satellites to a receiver, and an error of one millionth of a second would place a user hundreds of metres away from their true position. Financial markets, mobile phone networks and electricity grids all depend on clocks that agree with each other to within tiny fractions of a second.</p>" },
          { label: 'I', html: "<p>It is remarkable to think that, less than two centuries ago, the idea of a single time shared by an entire country would have seemed strange. Today, the whole planet is linked by a common system, and most people give it no thought at all. Yet the story of how that system was created is a reminder that even something as apparently natural as the time of day is, in large part, a human invention.</p>" },
        ],
        questionGroups: [
          {
            id: 't25-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              { number: 14, promptHtml: 'a country whose time zone does not match its geographical position', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: Spain "lies in line with Britain" but uses central European time.', locatorParagraph: 'F' },
              { number: 15, promptHtml: 'a safety concern caused by different local times', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: "a real risk of accidents on lines where trains ran in both directions".', locatorParagraph: 'B' },
              { number: 16, promptHtml: 'the consequences of a very small error in timing', answer: { accepted: ['H'] }, explanationHtml: 'Paragraph H: "an error of one millionth of a second would place a user hundreds of metres away".', locatorParagraph: 'H' },
              { number: 17, promptHtml: 'a country that refused to take part in a decision', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: "France ... abstained from the vote".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't25-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 18, promptHtml: 'Before railways, most people were unaware of differences in local time.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph A: "nobody could tell whether a clock in another town showed a different time".' },
              { number: 19, promptHtml: 'The US government introduced time zones in 1883.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph C: "the railway companies themselves, without waiting for the government".' },
              { number: 20, promptHtml: 'The Washington conference lasted about a month.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph D: "After a month of discussion".' },
              { number: 21, promptHtml: 'All countries adopted standard time immediately after 1884.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph E: "Countries adopted standard time gradually over the following decades".' },
              { number: 22, promptHtml: 'People in western China generally prefer to use a different local time.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph F describes the late sunrise but not people\'s preferences.' },
            ],
          },
          {
            id: 't25-r2-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-K, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'atoms' },
              { key: 'B', text: 'computers' },
              { key: 'C', text: 'irregular' },
              { key: 'D', text: 'satellites' },
              { key: 'E', text: 'constant' },
              { key: 'F', text: 'ships' },
              { key: 'G', text: 'second' },
              { key: 'H', text: 'minute' },
              { key: 'I', text: 'the Sun' },
              { key: 'J', text: 'observatories' },
              { key: 'K', text: 'railways' },
            ],
            stemHtml:
              '<p><strong>Measuring time today</strong></p><p>Greenwich Mean Time depended on the rotation of the Earth, which is slightly {{q23}}. Official time is now based on clocks that measure the vibrations of {{q24}}. A leap {{q25}} has sometimes been added, but this will stop because it causes difficulties for {{q26}}.</p>',
            questions: [
              { number: 23, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph G: the Earth\'s movement "turned out to be slightly irregular".' },
              { number: 24, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph G: "measure time by the vibrations of atoms".' },
              { number: 25, answer: { accepted: ['G'] }, explanationHtml: 'Paragraph G: "an extra second, known as a leap second".' },
              { number: 26, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph G: "because it causes problems for computer systems".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'The sea that disappeared',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Fifty years ago, the Aral Sea in Central Asia was the fourth-largest lake in the world, covering an area about the size of Ireland. Today, most of it has vanished. What remains is a handful of separate lakes surrounded by a vast salty desert, dotted with the rusting hulls of fishing boats that once sailed on open water. The shrinking of the Aral Sea is often described as one of the worst environmental disasters of the twentieth century, and it was caused not by natural forces but by deliberate human decisions. Its story has been studied by scientists, economists and historians around the world, because it shows so clearly how the management of a single resource can affect the lives of millions of people.</p>" },
          { label: 'B', html: "<p>The sea had no outlet to the ocean. It was fed by two great rivers flowing from the mountains to the south and east, and it lost water only through evaporation. For thousands of years, the two processes had been roughly in balance. In the 1960s, however, the government of the Soviet Union, which then controlled the region, decided to divert much of the water from both rivers to irrigate the surrounding desert, with the aim of making the region a major producer of cotton.</p>" },
          { label: 'C', html: "<p>The plan succeeded in its immediate aims. Vast areas of desert were turned into cotton fields, and for a time the region was one of the largest cotton producers in the world. But the irrigation canals were poorly built; many were simply trenches dug in the sand, and large amounts of water were lost through leakage and evaporation before they reached the fields. As less and less water reached the sea, it began to shrink rapidly. Some officials regarded this as an acceptable price to pay, and a few even argued that the water was 'wasted' if it simply flowed into the sea.</p>" },
          { label: 'D', html: "<p>The effects on local people were devastating. The sea had supported a large fishing industry, employing tens of thousands of people and supplying a significant share of the country's fish. As the water retreated and became saltier, the fish died, and by the 1980s commercial fishing had come to an end. The port towns, which had once stood on the shore, found themselves many kilometres from the water. People left in large numbers, and many of those who stayed lost their livelihoods.</p>" },
          { label: 'E', html: "<p>Health problems followed. The exposed sea bed was covered with salt and with the residues of fertilisers and pesticides that had been washed into the sea from the cotton fields for decades. Strong winds lifted this dust into the air and carried it over hundreds of kilometres, and doctors in the region reported high rates of respiratory diseases, as well as problems linked to contaminated drinking water. The loss of the sea also changed the local climate: without the large body of water to moderate temperatures, summers became hotter and winters colder, and the growing season became shorter.</p>" },
          { label: 'F', html: "<p>By the time the Soviet Union collapsed in 1991, the sea had split into two parts. The northern part lies in Kazakhstan, and in 2005, with support from the World Bank, the Kazakh government completed a dam that prevents water from the northern part flowing south, where it would evaporate. The results were faster than expected: the water level of the northern sea rose significantly within a few years, salt levels fell, fish returned, and a small fishing industry has revived. Some towns that had been abandoned by the water now have a coastline again, although it is still some distance away.</p>" },
          { label: 'G', html: "<p>The southern part has fared much worse. Its eastern basin dried out almost completely in 2014, and with the surrounding countries still heavily dependent on cotton and other irrigated crops, there is little prospect of restoring it. Scientists and aid organisations have instead focused on planting salt-tolerant shrubs on the dry sea bed to reduce dust storms. The story of the Aral Sea, however, continues to serve as a warning: water resources that seem limitless can be exhausted remarkably quickly when they are managed without regard for the wider consequences.</p>" },
        ],
        questionGroups: [
          {
            id: 't25-r3-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 3 has seven paragraphs, A-G. Choose the correct heading for paragraphs B-G from the list of headings below.<br/><em>Example: Paragraph A — vii</em>',
            bank: [
              { key: 'i', text: 'A partial recovery' },
              { key: 'ii', text: 'Threats to human health and climate' },
              { key: 'iii', text: 'An economic success with hidden costs' },
              { key: 'iv', text: 'A delicate balance is upset' },
              { key: 'v', text: 'The collapse of a local industry' },
              { key: 'vi', text: 'A lost cause and a lasting lesson' },
              { key: 'viii', text: 'International disputes over water' },
              { key: 'ix', text: 'Tourism in the new desert' },
            ],
            questions: [
              { number: 27, promptHtml: 'Paragraph B', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph B: inflow and evaporation "had been roughly in balance", until the rivers were diverted.', locatorParagraph: 'B' },
              { number: 28, promptHtml: 'Paragraph C', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph C: "The plan succeeded in its immediate aims" but the sea shrank.', locatorParagraph: 'C' },
              { number: 29, promptHtml: 'Paragraph D', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph D: "commercial fishing had come to an end".', locatorParagraph: 'D' },
              { number: 30, promptHtml: 'Paragraph E', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph E: respiratory diseases and changes to the local climate.', locatorParagraph: 'E' },
              { number: 31, promptHtml: 'Paragraph F', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph F: the northern sea rose and "fish returned".', locatorParagraph: 'F' },
              { number: 32, promptHtml: 'Paragraph G', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph G: "little prospect of restoring it" and the story "continues to serve as a warning".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't25-r3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary of paragraphs C and D below. Choose <strong>NO MORE THAN TWO WORDS</strong> from paragraphs C and D for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p>Water from the rivers turned desert into {{q33}}, making the region one of the world\'s largest producers. However, many {{q34}} were poorly constructed, and water was lost through {{q35}} and evaporation. Some {{q36}} considered the shrinking of the sea acceptable. The sea had supported a large {{q37}}, but as the water became {{q38}}, the fish died. By the 1980s, {{q39}} had ended, and the former {{q40}} were left far from the water.</p>',
            questions: [
              { number: 33, answer: { accepted: ['cotton fields'] }, explanationHtml: 'Paragraph C: "Vast areas of desert were turned into cotton fields".' },
              { number: 34, answer: { accepted: ['irrigation canals', 'canals'] }, explanationHtml: 'Paragraph C: "the irrigation canals were poorly built".' },
              { number: 35, answer: { accepted: ['leakage'] }, explanationHtml: 'Paragraph C: "lost through leakage and evaporation".' },
              { number: 36, answer: { accepted: ['officials'] }, explanationHtml: 'Paragraph C: "Some officials regarded this as an acceptable price".' },
              { number: 37, answer: { accepted: ['fishing industry'] }, explanationHtml: 'Paragraph D: "The sea had supported a large fishing industry".' },
              { number: 38, answer: { accepted: ['saltier'] }, explanationHtml: 'Paragraph D: "As the water retreated and became saltier, the fish died".' },
              { number: 39, answer: { accepted: ['commercial fishing'] }, explanationHtml: 'Paragraph D: "commercial fishing had come to an end".' },
              { number: 40, answer: { accepted: ['port towns'] }, explanationHtml: 'Paragraph D: "The port towns ... found themselves many kilometres from the water".' },
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
        contextText: 'You will hear a woman phoning a pottery studio to ask about classes.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning, Riverbank Pottery Studio." },
          { speaker: 'B', voice: 'zira', text: "Hello. I'm interested in learning pottery, and a friend recommended your studio. Could you tell me what you offer?" },
          { speaker: 'A', voice: 'david', text: "Of course. We have two workshops. The main one has twelve potter's wheels, and there's a smaller room for hand-building, which is making pots without a wheel." },
          { speaker: 'B', voice: 'zira', text: "And do you fire the pots here?" },
          { speaker: 'A', voice: 'david', text: "Yes, we have two electric kilns. And we've recently added a glazing area, where students can colour and finish their work." },
          { speaker: 'B', voice: 'zira', text: "Is there anywhere to buy materials?" },
          { speaker: 'A', voice: 'david', text: "There's a small shop in reception that sells clay and tools. And next month we're opening a gallery, where students can display and sell their work." },
          { speaker: 'B', voice: 'zira', text: "Lovely. What courses do you run?" },
          { speaker: 'A', voice: 'david', text: "There are three. The beginners' course is six weeks long, with one two-hour class a week, and it costs ninety pounds, including clay and firing." },
          { speaker: 'B', voice: 'zira', text: "And the others?" },
          { speaker: 'A', voice: 'david', text: "The improvers' course is eight weeks, also two hours a week, and that's a hundred and twenty pounds. And then there's an intensive weekend course: that's two full days, about twelve hours in total, and it costs a hundred and forty-five." },
          { speaker: 'B', voice: 'zira', text: "I've never done any pottery, so I think the beginners' course is best." },
          { speaker: 'A', voice: 'david', text: "Good choice. There's a class on Tuesday evenings and one on Saturday mornings." },
          { speaker: 'B', voice: 'zira', text: "Tuesday evenings would be better." },
          { speaker: 'A', voice: 'david', text: "Just one thing: please wear an apron or old clothes, because clay can stain. And you'll need to keep your fingernails short, otherwise they'll leave marks on the pots." },
          { speaker: 'B', voice: 'zira', text: "Good to know. How do I book?" },
          { speaker: 'A', voice: 'david', text: "You can book online, or speak to our manager, Carol Pemberton." },
        ],
        questionGroups: [
          {
            id: 't25-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            stemHtml:
              '<p><strong>Riverbank Pottery Studio</strong></p><p>Facilities: main workshop with wheels; a room for {{q1}}<br/>• two electric kilns<br/>• a new {{q2}}<br/>• a shop in reception selling {{q3}}<br/>• opening next month: a {{q4}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['hand-building', 'hand building'] }, explanationHtml: '"a smaller room for hand-building".' },
              { number: 2, answer: { accepted: ['glazing area'] }, explanationHtml: '"we\'ve recently added a glazing area".' },
              { number: 3, answer: { accepted: ['clay and tools'] }, explanationHtml: '"a small shop in reception that sells clay and tools".' },
              { number: 4, answer: { accepted: ['gallery'] }, explanationHtml: '"next month we\'re opening a gallery".' },
            ],
          },
          {
            id: 't25-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO NUMBERS</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 2, label: 'NO MORE THAN TWO NUMBERS' },
            stemHtml: table(
              ['Course', 'Length', 'Time per week', 'Price'],
              [
                ['Beginners', '{{q5}} weeks', '2 hours', '£90'],
                ['Improvers', '8 weeks', '2 hours', '£{{q6}}'],
                ['Intensive weekend', '2 days', 'about {{q7}} hours in total', '£{{q8}}'],
              ]
            ),
            questions: [
              { number: 5, answer: { accepted: ['6', 'six'] }, explanationHtml: '"The beginners\' course is six weeks long".' },
              { number: 6, answer: { accepted: ['120'] }, explanationHtml: '"that\'s a hundred and twenty pounds".' },
              { number: 7, answer: { accepted: ['12', 'twelve'] }, explanationHtml: '"about twelve hours in total".' },
              { number: 8, answer: { accepted: ['145'] }, explanationHtml: '"it costs a hundred and forty-five".' },
            ],
          },
          {
            id: 't25-l1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 9, promptHtml: 'Students should keep their {{q9}} short.', answer: { accepted: ['fingernails', 'nails'] }, explanationHtml: '"you\'ll need to keep your fingernails short".' },
              { number: 10, promptHtml: 'To book, speak to Carol {{q10}}.', answer: { accepted: ['pemberton'] }, explanationHtml: '"our manager, Carol Pemberton".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear an announcement about changes at a regional airport.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning. I'm Helen Ward, from the management team at Northmoor Airport, and I'd like to tell you about the changes we've made to the terminal over the past year, and about some new routes." },
          { speaker: 'A', voice: 'zira', text: "Let's start at the check-in area. Most passengers now check in online, so we've replaced about half of the old desks with self-service machines, where you can print your boarding pass and baggage labels." },
          { speaker: 'A', voice: 'zira', text: "Security used to be a real bottleneck, so we've doubled the size of the security area, and there are now eight lanes instead of four." },
          { speaker: 'A', voice: 'zira', text: "The shops have moved. They used to be before security, but they're now after security, in the departure lounge, so you can shop while you wait for your flight." },
          { speaker: 'A', voice: 'zira', text: "The children's play area is closed at the moment while new equipment is installed, but it should reopen next month." },
          { speaker: 'A', voice: 'zira', text: "Wi-Fi was previously limited to thirty minutes, but it's now free for as long as you like." },
          { speaker: 'A', voice: 'zira', text: "And finally, the café by the arrivals hall is now open twenty-four hours a day, for people meeting late flights." },
          { speaker: 'A', voice: 'zira', text: "Now, the new routes. From the first of April, there'll be a new service to Lisbon, operating twice a week, on Mondays and Fridays, with fares from forty-nine pounds." },
          { speaker: 'A', voice: 'zira', text: "And from May, a new route to Krakow in Poland, on Wednesdays and Saturdays. Introductory fares start at just thirty-five pounds." },
        ],
        questionGroups: [
          {
            id: 't25-l2-changes',
            type: 'matching_features',
            instructionHtml:
              'What change has been made to each part of the airport? Choose <strong>SIX</strong> answers from the box and write the correct letter, A-G, next to Questions 11-16.',
            bank: [
              { key: 'A', text: 'doubled in size' },
              { key: 'B', text: 'partly replaced by machines' },
              { key: 'C', text: 'moved to a new location' },
              { key: 'D', text: 'temporarily closed' },
              { key: 'E', text: 'made free without a time limit' },
              { key: 'F', text: 'open all day and night' },
              { key: 'G', text: 'reduced in number' },
            ],
            questions: [
              { number: 11, promptHtml: 'check-in desks', answer: { accepted: ['B'] }, explanationHtml: '"we\'ve replaced about half of the old desks with self-service machines".' },
              { number: 12, promptHtml: 'security area', answer: { accepted: ['A'] }, explanationHtml: '"we\'ve doubled the size of the security area".' },
              { number: 13, promptHtml: 'shops', answer: { accepted: ['C'] }, explanationHtml: '"The shops have moved."' },
              { number: 14, promptHtml: 'children\'s play area', answer: { accepted: ['D'] }, explanationHtml: '"closed at the moment ... should reopen next month".' },
              { number: 15, promptHtml: 'Wi-Fi', answer: { accepted: ['E'] }, explanationHtml: '"it\'s now free for as long as you like".' },
              { number: 16, promptHtml: 'arrivals café', answer: { accepted: ['F'] }, explanationHtml: '"now open twenty-four hours a day".' },
            ],
          },
          {
            id: 't25-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Destination', 'Start', 'Days', 'Fares from'],
              [
                ['Lisbon', '1 April', 'Mondays and {{q17}}', '£{{q18}}'],
                ['{{q19}}', 'May', 'Wednesdays and Saturdays', '£{{q20}}'],
              ]
            ),
            questions: [
              { number: 17, answer: { accepted: ['fridays', 'friday'] }, explanationHtml: '"on Mondays and Fridays".' },
              { number: 18, answer: { accepted: ['49'] }, explanationHtml: '"with fares from forty-nine pounds".' },
              { number: 19, answer: { accepted: ['krakow'] }, explanationHtml: '"a new route to Krakow in Poland".' },
              { number: 20, answer: { accepted: ['35'] }, explanationHtml: '"Introductory fares start at just thirty-five pounds."' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a new research student, Kim, talking to a laboratory manager, Dr Hughes.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Welcome to the lab, Kim. Before you start, I need to go through a few things. First, what are you planning to do this week?" },
          { speaker: 'B', voice: 'zira', text: "My supervisor suggested I should read the lab manual before doing anything practical." },
          { speaker: 'A', voice: 'david', text: "Good. And you'll need to attend the safety induction, which is on Thursday. Now, some basic rules. Food and drink aren't allowed anywhere in the lab itself; you can eat in the common room next door." },
          { speaker: 'B', voice: 'zira', text: "OK." },
          { speaker: 'A', voice: 'david', text: "Lab coats must be worn at all times, and they have to stay in the lab. Don't take them home to wash; we have them cleaned every Friday." },
          { speaker: 'B', voice: 'zira', text: "What about working late?" },
          { speaker: 'A', voice: 'david', text: "You can work after six, but never alone. There must always be at least one other person in the building." },
          { speaker: 'B', voice: 'zira', text: "And chemicals? Where are they kept?" },
          { speaker: 'A', voice: 'david', text: "In locked cabinets. You'll need to ask the technician for the key and sign a register." },
          { speaker: 'A', voice: 'david', text: "Now, equipment. The main pieces of equipment, like the microscopes and the centrifuge, have to be booked in advance using the online calendar. You can book up to two weeks ahead." },
          { speaker: 'B', voice: 'zira', text: "Is there a limit on how long I can use them?" },
          { speaker: 'A', voice: 'david', text: "Three hours at a time during the day. At weekends there's no limit. And if you damage anything, even slightly, report it to the technician straight away, so it can be repaired before someone else uses it." },
          { speaker: 'B', voice: 'zira', text: "Of course." },
          { speaker: 'A', voice: 'david', text: "Finally, keep a detailed notebook of every experiment. Your supervisor will check it once a month." },
        ],
        questionGroups: [
          {
            id: 't25-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'What is Kim going to do first?', options: [{ key: 'A', text: 'read the lab manual' }, { key: 'B', text: 'start an experiment' }, { key: 'C', text: 'meet the other students' }], answer: { accepted: ['A'] }, explanationHtml: '"My supervisor suggested I should read the lab manual before doing anything practical."' },
            ],
          },
          {
            id: 't25-l3-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Topic', 'Rule'],
              [
                ['Food and drink', 'only allowed in the {{q22}}'],
                ['Lab coats', 'must not be taken home; cleaned every {{q23}}'],
                ['Working after six', 'never work {{q24}}'],
                ['Chemicals', 'kept in locked {{q25}}'],
              ]
            ),
            questions: [
              { number: 22, answer: { accepted: ['common room'] }, explanationHtml: '"you can eat in the common room next door".' },
              { number: 23, answer: { accepted: ['friday'] }, explanationHtml: '"we have them cleaned every Friday".' },
              { number: 24, answer: { accepted: ['alone'] }, explanationHtml: '"You can work after six, but never alone."' },
              { number: 25, answer: { accepted: ['cabinets'] }, explanationHtml: '"In locked cabinets."' },
            ],
          },
          {
            id: 't25-l3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Using equipment</strong></p><p>Microscopes and the centrifuge must be booked using the {{q26}}, up to {{q27}} in advance. During the day, equipment can be used for {{q28}} at a time, but there is no limit at {{q29}}. Any damage must be reported to the technician. Kim\'s notebook will be checked once a {{q30}}.</p>',
            questions: [
              { number: 26, answer: { accepted: ['online calendar'] }, explanationHtml: '"booked in advance using the online calendar".' },
              { number: 27, answer: { accepted: ['two weeks', '2 weeks'] }, explanationHtml: '"You can book up to two weeks ahead."' },
              { number: 28, answer: { accepted: ['three hours', '3 hours'] }, explanationHtml: '"Three hours at a time during the day."' },
              { number: 29, answer: { accepted: ['weekends'] }, explanationHtml: '"At weekends there\'s no limit."' },
              { number: 30, answer: { accepted: ['month'] }, explanationHtml: '"Your supervisor will check it once a month."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the history of glassmaking in Venice.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today I'm going to talk about the history of glassmaking in Venice, which for several centuries produced the finest glass in the world." },
          { speaker: 'A', voice: 'david', text: "Glass was already being made in Venice in the tenth century. In those early years, the city's glassmakers produced mainly simple items such as bottles and small beads, which were traded across the Mediterranean." },
          { speaker: 'A', voice: 'david', text: "In 1291, the city government ordered all glassmakers to move their furnaces to the nearby island of Murano. The official reason was the danger of fire, since most buildings in the city were made of wood. But it also allowed the authorities to keep the secrets of glassmaking under control." },
          { speaker: 'A', voice: 'david', text: "Glassmakers on Murano enjoyed a high social status, and their daughters were allowed to marry into noble families. However, they were forbidden to leave the Venetian republic, and those who tried to set up workshops abroad could face severe punishment." },
          { speaker: 'A', voice: 'david', text: "In the fifteenth century, a Murano glassmaker developed a new type of glass that was almost perfectly clear, and it was named cristallo, because it resembled rock crystal. This made Venetian glass the most sought-after in Europe." },
          { speaker: 'A', voice: 'david', text: "In the sixteenth century, Murano became famous for mirrors, which were made by coating glass with a thin layer of metal. They were extremely expensive, and only the wealthiest families could afford them." },
          { speaker: 'A', voice: 'david', text: "In the seventeenth century, however, the French government managed to persuade several Venetian mirror makers to move to France, and this marked the beginning of the decline of Venice's dominance." },
          { speaker: 'A', voice: 'david', text: "In the nineteenth century, there was a revival, as Murano workshops began producing mosaics for churches and public buildings across Europe." },
          { speaker: 'A', voice: 'david', text: "In the twentieth century, tourism became the main market, and visitors could watch glassblowers at work." },
          { speaker: 'A', voice: 'david', text: "Today, the industry faces serious difficulties. The furnaces run on gas, so rising energy prices have hit the workshops hard. There's competition from cheap imitations, often sold as genuine Murano glass. And fewer young people are willing to spend years as apprentices to learn the craft. The number of workshops has fallen sharply as a result." },
        ],
        questionGroups: [
          {
            id: 't25-l4-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Period', 'Situation'],
              [
                ['10th century', 'glassmakers produced bottles and small {{q31}}'],
                ['1291', 'furnaces moved to Murano because of the risk of {{q32}}; also helped keep {{q33}} under control'],
                ['Following centuries', 'glassmakers could not {{q34}} the republic'],
                ['15th century', 'clear glass called {{q35}}'],
                ['16th century', 'famous for {{q36}}'],
                ['17th century', 'workers moved to {{q37}}'],
                ['19th century', 'revival: {{q38}} for churches'],
                ['20th century', '{{q39}} became the main market'],
              ]
            ),
            questions: [
              { number: 31, answer: { accepted: ['beads'] }, explanationHtml: '"bottles and small beads".' },
              { number: 32, answer: { accepted: ['fire'] }, explanationHtml: '"The official reason was the danger of fire".' },
              { number: 33, answer: { accepted: ['secrets'] }, explanationHtml: '"to keep the secrets of glassmaking under control".' },
              { number: 34, answer: { accepted: ['leave'] }, explanationHtml: '"they were forbidden to leave the Venetian republic".' },
              { number: 35, answer: { accepted: ['cristallo'] }, explanationHtml: '"it was named cristallo".' },
              { number: 36, answer: { accepted: ['mirrors'] }, explanationHtml: '"Murano became famous for mirrors".' },
              { number: 37, answer: { accepted: ['france'] }, explanationHtml: '"persuade several Venetian mirror makers to move to France".' },
              { number: 38, answer: { accepted: ['mosaics'] }, explanationHtml: '"producing mosaics for churches".' },
              { number: 39, answer: { accepted: ['tourism'] }, explanationHtml: '"tourism became the main market".' },
            ],
          },
          {
            id: 't25-l4-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-G.',
            questions: [
              {
                number: 40,
                promptHtml: 'Which THREE problems facing the Murano glass industry today are mentioned?',
                options: [
                  { key: 'A', text: 'rising energy costs' },
                  { key: 'B', text: 'flooding of workshops' },
                  { key: 'C', text: 'cheap imitations' },
                  { key: 'D', text: 'a shortage of sand' },
                  { key: 'E', text: 'fewer apprentices' },
                  { key: 'F', text: 'high taxes' },
                  { key: 'G', text: 'fewer tourists' },
                ],
                selectCount: 3,
                answer: { accepted: ['A', 'C', 'E'] },
                explanationHtml: '"rising energy prices", "competition from cheap imitations", "fewer young people are willing to spend years as apprentices".',
              },
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
        '<p>The graph below shows world production of three metals between 1960 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'World metal production, 1960-2020 (million tonnes)',
        unit: 'million tonnes',
        categories: ['1960', '1970', '1980', '1990', '2000', '2010', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Million tonnes',
        series: [
          { name: 'Aluminium', data: [4.5, 10, 16, 19, 24, 41, 65] },
          { name: 'Copper', data: [4.2, 6.4, 7.7, 9, 13, 16, 21] },
          { name: 'Zinc', data: [3, 5.3, 6, 7.2, 8.8, 12, 13] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Advertising aimed at children should be banned.</p><p>To what extent do you agree or disagree with this statement?</p>',
    },
  },
};
