// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-28',
  title: 'Vocably Practice Test 28',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The trouble with open-plan offices',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>The open-plan office, in which dozens or even hundreds of employees work side by side without walls or doors, is now so common that it is easy to forget how recent it is. The idea was developed in Germany in the 1950s by a team of consultants who called it the 'office landscape'. Their aim was genuinely progressive: they wanted to break down the rigid hierarchies of traditional offices, where managers sat in private rooms and junior staff in rows, and to create a more democratic workplace in which information could flow freely between people at every level.</p>" },
          { label: 'B', html: "<p>Over the following decades, open-plan designs spread throughout the world, and in the early twenty-first century they became almost universal, particularly in the technology industry. Their supporters promised a range of benefits. Without walls to separate them, employees would bump into each other more often, share ideas, solve problems together and develop a stronger sense of belonging to a team. Managers would be more visible and approachable. The office itself, it was said, would become a place of creativity and energy. Architects produced bright, airy designs with long shared tables, sofas and coffee bars, and companies proudly showed them off to visitors and journalists as evidence of their modern, forward-looking culture. For a time, a private office came to be seen almost as a sign of an old-fashioned organisation that had failed to keep up with the times.</p>" },
          { label: 'C', html: "<p>The research, however, tells a rather different story. In one widely discussed study, researchers used electronic badges and email records to track the behaviour of employees at two large companies before and after they moved from traditional offices into open-plan spaces. Contrary to all expectations, the amount of face-to-face interaction fell by around seventy per cent, while the use of email and instant messaging increased. It appears that when people lose their privacy, they protect themselves by withdrawing, avoiding conversations that might be overheard by everyone around them.</p>" },
          { label: 'D', html: "<p>The most common complaint about open-plan offices is noise. Surveys consistently find that workers are distracted by telephone calls, conversations and the general movement of people around them. Speech is particularly disruptive, because the brain cannot help trying to follow words it can understand. Tasks that require deep concentration, such as writing, analysing data or programming, suffer most. Many employees respond by wearing headphones, but this is hardly a solution; it simply shuts people off from the very colleagues they were supposed to be collaborating with.</p>" },
          { label: 'E', html: "<p>There is also evidence that open-plan offices may be bad for health. A large study in Denmark found that employees who shared an office with several other people took significantly more days of sick leave than those who had an office of their own. The likely explanation is simple: when many people share the same air and the same surfaces, infections such as colds and flu spread more easily. Stress caused by noise and lack of control over one's surroundings may also play a part. Several studies have found that people who cannot adjust the lighting, temperature or noise around them report more headaches and fatigue, and feel less satisfied with their jobs. Even the constant awareness of being watched by colleagues, some psychologists suggest, can be a quiet but persistent source of strain over a working day.</p>" },
          { label: 'F', html: "<p>If open-plan offices perform so poorly, why have they become so popular? I am convinced that the answer has less to do with collaboration than with money. Removing walls and private rooms allows companies to fit far more employees into the same floor space, and property is one of the largest costs that any business faces. The language of teamwork and creativity has, in many cases, provided an attractive justification for what is essentially a decision to save money.</p>" },
          { label: 'G', html: "<p>None of this means that we should return to the rows of closed doors of the past. The best modern workplaces offer a variety of spaces: open areas for teamwork and informal conversation, but also quiet rooms for concentrated work, small booths for phone calls, and places where people can meet in private. In some offices, employees no longer have a fixed desk at all, but choose each day the space that best suits the task in hand. What matters is that people are given a choice, because different kinds of work, and different kinds of people, need different environments.</p>" },
        ],
        questionGroups: [
          {
            id: 't28-r1-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 1 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below.',
            bank: [
              { key: 'i', text: 'A threat to physical health' },
              { key: 'ii', text: 'The hidden financial motive' },
              { key: 'iii', text: 'An idea with idealistic origins' },
              { key: 'iv', text: 'Offering people a range of spaces' },
              { key: 'v', text: 'The promise of better teamwork' },
              { key: 'vi', text: 'The effects of constant distraction' },
              { key: 'vii', text: 'An unexpected research result' },
              { key: 'viii', text: 'The rise of working from home' },
              { key: 'ix', text: 'Why managers prefer private offices' },
              { key: 'x', text: 'Designing the ideal desk' },
            ],
            questions: [
              { number: 1, promptHtml: 'Paragraph A', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph A: "Their aim was genuinely progressive ... a more democratic workplace".', locatorParagraph: 'A' },
              { number: 2, promptHtml: 'Paragraph B', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph B: employees would "share ideas, solve problems together".', locatorParagraph: 'B' },
              { number: 3, promptHtml: 'Paragraph C', answer: { accepted: ['vii'] }, explanationHtml: 'Paragraph C: "Contrary to all expectations, the amount of face-to-face interaction fell".', locatorParagraph: 'C' },
              { number: 4, promptHtml: 'Paragraph D', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph D: workers "are distracted by telephone calls, conversations".', locatorParagraph: 'D' },
              { number: 5, promptHtml: 'Paragraph E', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph E: "open-plan offices may be bad for health".', locatorParagraph: 'E' },
              { number: 6, promptHtml: 'Paragraph F', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph F: "the answer has less to do with collaboration than with money".', locatorParagraph: 'F' },
              { number: 7, promptHtml: 'Paragraph G', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph G: "The best modern workplaces offer a variety of spaces".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't28-r1-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 8, promptHtml: 'The people who first developed open-plan offices had good intentions.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph A: "Their aim was genuinely progressive".' },
              { number: 9, promptHtml: 'Moving to an open-plan office usually increases face-to-face conversation.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph C: face-to-face interaction "fell by around seventy per cent".' },
              { number: 10, promptHtml: 'Wearing headphones is a good way of dealing with noise in the office.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph D: "this is hardly a solution".' },
              { number: 11, promptHtml: 'People who share an office with many others are more likely to take sick leave.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph E: they "took significantly more days of sick leave".' },
              { number: 12, promptHtml: 'Most companies will abandon open-plan offices in the next ten years.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer makes no prediction about what companies will do.' },
              { number: 13, promptHtml: 'Saving money has been the main reason for the popularity of open-plan offices.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph F: "I am convinced that the answer has less to do with collaboration than with money."' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Farming upwards',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>In a converted warehouse on the edge of a large city, rows of lettuces, herbs and salad leaves grow in trays stacked from floor to ceiling. There is no soil and no sunlight. Instead, the plants' roots hang in a mist or a thin stream of water containing all the nutrients they need, and they are lit by thousands of LED lamps tuned to the wavelengths of light that plants use most efficiently. Temperature, humidity and even the level of carbon dioxide in the air are controlled by computer. This is vertical farming, and its supporters believe it could transform the way cities are fed.</p>" },
          { label: '', html: "<p>The advantages claimed for vertical farms are impressive. Because the plants are grown in layers, a vertical farm can produce many times more food per square metre of land than a conventional field. Because the environment is sealed, there is no need for pesticides, and crops can be grown all year round, regardless of the weather outside. Water is recycled, so that a vertical farm may use as little as five per cent of the water needed to grow the same crop in a field. And because the farms can be built inside cities, close to the people who eat the food, the distance that produce must travel, and the fuel that transport requires, is greatly reduced.</p>" },
          { label: '', html: "<p>These benefits are real, but in my view they are often exaggerated. The most important limitation is energy. A field of lettuce receives its light from the sun, free of charge. A vertical farm must provide every photon artificially, and even the most efficient LED lamps consume large amounts of electricity. Heating, cooling and pumping water add further to the bill. Unless that electricity comes from renewable sources, the carbon emissions of vertical farming may actually be higher than those of conventional agriculture, even after the savings in transport are taken into account.</p>" },
          { label: '', html: "<p>Energy costs also explain why vertical farms grow such a narrow range of crops. Leafy greens and herbs grow quickly, are light, and can be sold at high prices, so they make economic sense. Staple crops such as wheat, rice and potatoes, which provide most of the calories that people eat, do not. One researcher calculated that growing the wheat needed for a single loaf of bread in a vertical farm would cost many times the price of the loaf. Vertical farming, in other words, is not going to feed the world; at best, it will supply the salad.</p>" },
          { label: '', html: "<p>The industry's financial record has been mixed. During the last decade, investors poured billions of dollars into vertical farming companies, attracted by the promise of high-tech agriculture. Several of the best-known companies have since gone out of business, often after a sharp rise in energy prices made their operations unprofitable. The survivors tend to be those that have kept costs low, built farms in places where cheap renewable electricity is available, or focused on high-value products for which customers are willing to pay a premium. Some have also found additional sources of income, for example by selling their growing systems and software to supermarkets, restaurants and even schools, which install small units on their own premises.</p>" },
          { label: '', html: "<p>Nevertheless, I believe that vertical farming has a useful, if limited, role to play. In places where land and water are scarce, such as desert countries in the Middle East or crowded island states like Singapore, which imports most of its food, growing vegetables indoors can reduce dependence on imports and provide security against disruptions to supply. Vertical farms can also provide fresher produce, since vegetables can be harvested and sold on the same day. And the technology continues to improve: lamps are becoming more efficient, and researchers are developing plant varieties designed specifically for indoor conditions.</p>" },
          { label: '', html: "<p>The danger is that the excitement surrounding vertical farming may distract attention from more important challenges. Most of the world's food will continue to be grown in fields, and the greatest gains in sustainability are likely to come from improving the way those fields are managed: reducing the waste of fertiliser and water, protecting soil, and cutting the enormous amount of food that is thrown away after harvest. Vertical farms may make an attractive photograph, but they are a supplement to traditional agriculture, not a replacement for it.</p>" },
        ],
        questionGroups: [
          {
            id: 't28-r2-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-J, below.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'soil' },
              { key: 'B', text: 'pesticides' },
              { key: 'C', text: 'water' },
              { key: 'D', text: 'transport' },
              { key: 'E', text: 'electricity' },
              { key: 'F', text: 'sunlight' },
              { key: 'G', text: 'weather' },
              { key: 'H', text: 'labour' },
              { key: 'I', text: 'fertiliser' },
              { key: 'J', text: 'land' },
            ],
            stemHtml:
              '<p><strong>How vertical farms work</strong></p><p>In a vertical farm, plants grow without {{q14}} or natural light. Because the plants are stacked in layers, the farms need far less {{q15}} than a field to produce the same amount. The sealed environment means that no {{q16}} are required, and a vertical farm may use only five per cent of the {{q17}} used in a field. However, the lamps consume large amounts of {{q18}}, which is the main limitation of the system.</p>',
            questions: [
              { number: 14, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 1: "There is no soil and no sunlight."' },
              { number: 15, answer: { accepted: ['J'] }, explanationHtml: 'Paragraph 2: "many times more food per square metre of land".' },
              { number: 16, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "there is no need for pesticides".' },
              { number: 17, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 2: "as little as five per cent of the water".' },
              { number: 18, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 3: LED lamps "consume large amounts of electricity".' },
            ],
          },
          {
            id: 't28-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 19, promptHtml: 'The benefits of vertical farming are frequently overstated.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 3: "in my view they are often exaggerated".' },
              { number: 20, promptHtml: 'Vertical farming always produces lower carbon emissions than conventional farming.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 3: emissions "may actually be higher".' },
              { number: 21, promptHtml: 'Vertical farms could eventually supply most of the world\'s calories.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 4: "Vertical farming ... is not going to feed the world".' },
              { number: 22, promptHtml: 'Investors should avoid putting money into vertical farming companies.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer describes investors\' losses but gives no advice to investors.' },
              { number: 23, promptHtml: 'Vertical farming has a worthwhile part to play in some countries.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 6: "vertical farming has a useful, if limited, role to play".' },
              { number: 24, promptHtml: 'Improving conventional farming is more important than developing vertical farms.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 7: "the greatest gains ... are likely to come from improving the way those fields are managed".' },
            ],
          },
          {
            id: 't28-r2-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 25,
                promptHtml: 'Which TWO reasons does the writer give for the survival of some vertical farming companies?',
                options: [
                  { key: 'A', text: 'access to cheap renewable energy' },
                  { key: 'B', text: 'support from national governments' },
                  { key: 'C', text: 'a focus on expensive products' },
                  { key: 'D', text: 'growing staple crops' },
                  { key: 'E', text: 'building farms far from cities' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'Paragraph 5: "places where cheap renewable electricity is available, or focused on high-value products".',
              },
            ],
          },
          {
            id: 't28-r2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              { number: 26, promptHtml: 'What is the writer\'s main conclusion about vertical farming?', options: [{ key: 'A', text: 'It will soon replace traditional agriculture.' }, { key: 'B', text: 'It has no future because of energy costs.' }, { key: 'C', text: 'It can add to, but not replace, conventional farming.' }, { key: 'D', text: 'It is the best way to reduce food waste.' }], answer: { accepted: ['C'] }, explanationHtml: 'Final paragraph: "they are a supplement to traditional agriculture, not a replacement for it".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Finding the way across the Pacific',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Scattered across the Pacific Ocean, often separated by thousands of kilometres of open water, are the islands of Polynesia, from Hawaii in the north to New Zealand in the south-west and Easter Island in the east. When European explorers arrived in the region in the sixteenth and seventeenth centuries, they found almost every habitable island already occupied by people who shared closely related languages and cultures. How these people had reached such remote specks of land, centuries before Europeans had the compass or accurate maps, became one of the great puzzles of history. Archaeological and linguistic evidence now suggests that the ancestors of the Polynesians began moving eastwards from islands near New Guinea about three thousand years ago, and that the most remote islands, including Hawaii and New Zealand, were reached only in the last thousand years or so. This was one of the greatest migrations in human history, accomplished over vast distances of open sea.</p>" },
          { label: 'B', html: "<p>For a long time, many Western scholars refused to believe that the islands could have been settled deliberately. In the 1950s, one influential historian argued that the Polynesians' canoes had simply been blown off course by storms, and that the islands had been populated by lucky accidents. Another researcher, the Norwegian adventurer Thor Heyerdahl, proposed that the settlers had come from South America, drifting westwards with the winds and currents; in 1947 he sailed a raft from Peru to Polynesia to show that such a voyage was possible. Both theories shared an assumption that Pacific islanders could not have been skilled navigators.</p>" },
          { label: 'C', html: "<p>That assumption was dramatically overturned in 1976. A double-hulled voyaging canoe named Hōkūle'a, built according to traditional designs, sailed from Hawaii to Tahiti, a distance of more than four thousand kilometres, without any instruments. Because the traditional knowledge had largely been lost in Hawaii, the crew was guided by Mau Piailug, a navigator from a small island in Micronesia, where such skills had survived. After a month at sea, the canoe arrived exactly where it was intended to. The voyage caused great excitement, and it inspired a revival of traditional navigation throughout the Pacific.</p>" },
          { label: 'D', html: "<p>The methods used by traditional navigators, often called wayfinding, depend on close observation of the natural world. The most important tool is the night sky. Navigators memorise the points on the horizon where dozens of stars rise and set, and use them to hold a steady course, much as a modern sailor uses a compass. This mental 'star compass' divides the horizon into a number of houses, each named after the stars associated with it. During the day, the sun serves a similar purpose, particularly at sunrise and sunset, when it is low in the sky. Navigators must also keep a constant mental record of the canoe's speed and direction, and of how far it has been pushed sideways by wind and current, in order to estimate its position. Learning all this traditionally took many years of training, beginning in childhood, and much of the knowledge was passed on through chants and stories rather than in written form.</p>" },
          { label: 'E', html: "<p>Navigators also read the ocean itself. Large swells, generated by distant weather systems, travel across the ocean in consistent directions for days at a time. An experienced navigator can feel the pattern of these swells through the movement of the canoe, often while lying down in the hull, and can keep a course even when the sky is covered by cloud. Near land, swells bend around islands and bounce back from them, creating patterns that reveal the presence of an island long before it can be seen.</p>" },
          { label: 'F', html: "<p>As a canoe approaches its destination, other signs become important. Certain seabirds, such as terns and noddies, fly out to sea each morning to fish and return to land at dusk; following them in the evening leads the navigator to land. Clouds tend to gather over islands, and in some places the underside of a cloud may take on a greenish colour, reflected from a lagoon below. By combining these signs, a navigator effectively expands a small island into a much larger target. Today, a new generation of navigators, trained by Piailug and his students, continues to sail the Pacific using these methods. Between 2013 and 2017, Hōkūle'a itself completed a voyage around the world, visiting dozens of countries, much of it navigated without modern instruments. The revival has become a source of great pride for Pacific peoples, and a powerful demonstration of knowledge that outsiders once dismissed.</p>" },
        ],
        questionGroups: [
          {
            id: 't28-r3-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has six paragraphs, A-F. Choose the correct heading for paragraphs A-D from the list of headings below.',
            bank: [
              { key: 'i', text: 'A voyage that changed opinions' },
              { key: 'ii', text: 'Using the stars to hold a course' },
              { key: 'iii', text: 'A historical mystery' },
              { key: 'iv', text: 'Theories that doubted the islanders\' abilities' },
              { key: 'v', text: 'The construction of voyaging canoes' },
              { key: 'vi', text: 'Trade between islands' },
            ],
            questions: [
              { number: 27, promptHtml: 'Paragraph A', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph A: how people reached the islands "became one of the great puzzles of history".', locatorParagraph: 'A' },
              { number: 28, promptHtml: 'Paragraph B', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph B: "Both theories shared an assumption that Pacific islanders could not have been skilled navigators."', locatorParagraph: 'B' },
              { number: 29, promptHtml: 'Paragraph C', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph C: "That assumption was dramatically overturned in 1976."', locatorParagraph: 'C' },
              { number: 30, promptHtml: 'Paragraph D', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph D: "The most important tool is the night sky."', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't28-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              { number: 31, promptHtml: 'When Europeans arrived in Polynesia, they found that', options: [{ key: 'A', text: 'most islands were uninhabited.' }, { key: 'B', text: 'the islanders used compasses.' }, { key: 'C', text: 'islanders spoke related languages.' }, { key: 'D', text: 'the islands had been settled recently.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph A: "people who shared closely related languages and cultures".' },
              { number: 32, promptHtml: 'Thor Heyerdahl believed that the islands were settled by people who', options: [{ key: 'A', text: 'came from South America.' }, { key: 'B', text: 'were blown off course from Asia.' }, { key: 'C', text: 'used advanced navigation.' }, { key: 'D', text: 'arrived from New Zealand.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph B: "the settlers had come from South America".' },
              { number: 33, promptHtml: 'Why was Mau Piailug chosen to guide Hōkūle\'a?', options: [{ key: 'A', text: 'He had designed the canoe.' }, { key: 'B', text: 'Traditional skills had survived on his island.' }, { key: 'C', text: 'He was the only Hawaiian navigator.' }, { key: 'D', text: 'He had sailed to Tahiti before.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C: "a navigator from a small island in Micronesia, where such skills had survived".' },
              { number: 34, promptHtml: 'According to paragraph E, swells are especially useful when', options: [{ key: 'A', text: 'the canoe is near land.' }, { key: 'B', text: 'the stars cannot be seen.' }, { key: 'C', text: 'the wind is strong.' }, { key: 'D', text: 'the sea is calm.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph E: a navigator "can keep a course even when the sky is covered by cloud".' },
            ],
          },
          {
            id: 't28-r3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Signs of land</strong></p><p>Swells that bend around islands and {{q35}} from them show that land is near. Some seabirds leave land to fish in the morning and come back at {{q36}}, so they can guide a canoe. {{q37}} often form over islands, and may look green because of a {{q38}} underneath. Using all these signs turns a small island into a larger {{q39}}.</p>',
            questions: [
              { number: 35, answer: { accepted: ['bounce back', 'bounce'] }, explanationHtml: 'Paragraph E: "swells bend around islands and bounce back from them".' },
              { number: 36, answer: { accepted: ['dusk'] }, explanationHtml: 'Paragraph F: "return to land at dusk".' },
              { number: 37, answer: { accepted: ['clouds'] }, explanationHtml: 'Paragraph F: "Clouds tend to gather over islands".' },
              { number: 38, answer: { accepted: ['lagoon'] }, explanationHtml: 'Paragraph F: "a greenish colour, reflected from a lagoon below".' },
              { number: 39, answer: { accepted: ['target'] }, explanationHtml: 'Paragraph F: "expands a small island into a much larger target".' },
            ],
          },
          {
            id: 't28-r3-title',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              { number: 40, promptHtml: 'Which is the most suitable title for Reading Passage 3?', options: [{ key: 'A', text: 'How storms shaped the settlement of the Pacific' }, { key: 'B', text: 'The rediscovery of traditional Pacific navigation' }, { key: 'C', text: 'The life of Mau Piailug' }, { key: 'D', text: 'Why European explorers came to Polynesia' }], answer: { accepted: ['B'] }, explanationHtml: 'The passage covers doubts about islanders\' skills, the 1976 voyage and the methods and revival of wayfinding.' },
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
        contextText: 'You will hear a woman phoning an amateur astronomy society.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Hello, Northbridge Astronomy Society, Peter speaking." },
          { speaker: 'B', voice: 'zira', text: "Oh, hello. I'm interested in joining the society, and I wondered if you could tell me a bit about it." },
          { speaker: 'A', voice: 'david', text: "Of course. We meet on the first Tuesday of every month. We used to meet on Wednesdays, but we changed last year." },
          { speaker: 'B', voice: 'zira', text: "And where are the meetings?" },
          { speaker: 'A', voice: 'david', text: "At the community centre on Station Road. There's a large room at the back that we use." },
          { speaker: 'B', voice: 'zira', text: "What time do they start?" },
          { speaker: 'A', voice: 'david', text: "Seven forty-five. People usually arrive a bit earlier for a cup of tea." },
          { speaker: 'B', voice: 'zira', text: "How much does it cost to join?" },
          { speaker: 'A', voice: 'david', text: "The annual fee is thirty pounds, or fifteen for students. That includes a monthly magazine, which has news and a guide to what's in the sky that month." },
          { speaker: 'B', voice: 'zira', text: "Do you do any actual observing?" },
          { speaker: 'A', voice: 'david', text: "Yes, we have observing evenings at Hilltop Farm, about five miles outside town, where the sky is much darker. We can't plan them in advance because of the weather, so we let members know by text message on the day." },
          { speaker: 'B', voice: 'zira', text: "I don't have any equipment, I'm afraid." },
          { speaker: 'A', voice: 'david', text: "That's no problem. Members can borrow a telescope from the society for up to a month. You just need to pay a deposit of fifty pounds, which you get back when you return it." },
          { speaker: 'B', voice: 'zira', text: "That's great. How do I join?" },
          { speaker: 'A', voice: 'david', text: "You'll need to contact our membership secretary, Ruth Calloway. That's C-A-L-L-O-W-A-Y." },
        ],
        questionGroups: [
          {
            id: 't28-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Northbridge Astronomy Society</strong></p>' +
              '<p>Meetings: first {{q1}} of every month<br/>Place: {{q2}}, Station Road<br/>Start time: {{q3}} pm</p>' +
              '<p>Annual fee: £{{q4}} (students £15)<br/>Fee includes a monthly {{q5}}</p>' +
              '<p>Observing evenings: at {{q6}}<br/>Members told by {{q7}} on the day</p>' +
              '<p>Members can borrow a {{q8}} for up to a month<br/>Deposit: £{{q9}}</p>' +
              '<p>Membership secretary: Ruth {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['tuesday'] }, explanationHtml: '"We meet on the first Tuesday of every month."' },
              { number: 2, answer: { accepted: ['community centre', 'the community centre', 'community center'] }, explanationHtml: '"At the community centre on Station Road."' },
              { number: 3, answer: { accepted: ['7.45', '7:45', 'seven forty-five'] }, explanationHtml: '"Seven forty-five."' },
              { number: 4, answer: { accepted: ['30', 'thirty'] }, explanationHtml: '"The annual fee is thirty pounds".' },
              { number: 5, answer: { accepted: ['magazine'] }, explanationHtml: '"That includes a monthly magazine".' },
              { number: 6, answer: { accepted: ['hilltop farm'] }, explanationHtml: '"observing evenings at Hilltop Farm".' },
              { number: 7, answer: { accepted: ['text message', 'text'] }, explanationHtml: '"we let members know by text message".' },
              { number: 8, answer: { accepted: ['telescope'] }, explanationHtml: '"Members can borrow a telescope".' },
              { number: 9, answer: { accepted: ['50', 'fifty'] }, explanationHtml: '"a deposit of fifty pounds".' },
              { number: 10, answer: { accepted: ['calloway'] }, explanationHtml: '"Ruth Calloway. That\'s C-A-L-L-O-W-A-Y."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear an organiser talking on local radio about a food festival.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira2', text: "Good morning. I'm here to tell you about this year's Riverside Food Festival, which takes place next weekend, and it's bigger than ever." },
          { speaker: 'A', voice: 'zira2', text: "Events are spread across four sites in the town. In past years, the cookery demonstrations were held in the town hall, but this year they've moved to the main marquee in the park, which has much more seating." },
          { speaker: 'A', voice: 'zira2', text: "The town hall will be used for the children's baking sessions instead, where young people can make and decorate their own biscuits." },
          { speaker: 'A', voice: 'zira2', text: "And if you're hungry, head for the market square, where you'll find more than forty street food stalls. The riverside tent, by the way, is reserved for the wine and cheese tasting, and tickets for that have already sold out." },
          { speaker: 'A', voice: 'zira2', text: "Now some highlights. On Saturday there's our famous chilli-eating contest. Entry costs five pounds, with all the money going to a local charity, and the winner receives a trophy, rather than cash as in previous years." },
          { speaker: 'A', voice: 'zira2', text: "Also on Saturday, there's a cheese-making workshop, starting at half past two. Places are limited, and participants are asked to bring an apron, as it can get quite messy." },
          { speaker: 'A', voice: 'zira2', text: "On Sunday, we have the cake competition. Anyone can enter, but cakes must be delivered to the judges' table by ten a.m., as judging starts at eleven." },
          { speaker: 'A', voice: 'zira2', text: "In the afternoon, a local farmer is giving a talk about growing heritage vegetables, old varieties that have almost disappeared from the shops." },
          { speaker: 'A', voice: 'zira2', text: "And to close the festival on Sunday evening, there'll be a fireworks display over the river, starting at nine o'clock. We hope to see you there!" },
        ],
        questionGroups: [
          {
            id: 't28-l2-match',
            type: 'matching_features',
            instructionHtml: 'Where will each of the following be found? Choose the correct letter, <strong>A-D</strong>.',
            bank: [
              { key: 'A', text: 'the main marquee' },
              { key: 'B', text: 'the riverside tent' },
              { key: 'C', text: 'the market square' },
              { key: 'D', text: 'the town hall' },
            ],
            questions: [
              { number: 11, promptHtml: 'cookery demonstrations', answer: { accepted: ['A'] }, explanationHtml: '"they\'ve moved to the main marquee in the park".' },
              { number: 12, promptHtml: 'children\'s baking sessions', answer: { accepted: ['D'] }, explanationHtml: '"The town hall will be used for the children\'s baking sessions".' },
              { number: 13, promptHtml: 'street food stalls', answer: { accepted: ['C'] }, explanationHtml: '"head for the market square ... street food stalls".' },
            ],
          },
          {
            id: 't28-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Event', 'Day', 'Details'],
              [
                ['Chilli-eating contest', 'Saturday', 'entry £{{q14}}; winner receives {{q15}}'],
                ['Cheese-making workshop', 'Saturday, {{q16}}', 'bring {{q17}}'],
                ['Cake competition', 'Sunday', 'deliver cakes by {{q18}}'],
                ['Talk by a farmer', 'Sunday afternoon', 'on growing {{q19}}'],
                ['Closing event', 'Sunday evening', '{{q20}} over the river'],
              ]
            ),
            questions: [
              { number: 14, answer: { accepted: ['5', 'five'] }, explanationHtml: '"Entry costs five pounds".' },
              { number: 15, answer: { accepted: ['a trophy', 'trophy'] }, explanationHtml: '"the winner receives a trophy, rather than cash".' },
              { number: 16, answer: { accepted: ['2.30', '2:30', '2.30 pm', 'half past two'] }, explanationHtml: '"starting at half past two".' },
              { number: 17, answer: { accepted: ['an apron', 'apron'] }, explanationHtml: '"participants are asked to bring an apron".' },
              { number: 18, answer: { accepted: ['10 am', '10', '10.00', 'ten am', '10 a.m.'] }, explanationHtml: '"cakes must be delivered ... by ten a.m.".' },
              { number: 19, answer: { accepted: ['heritage vegetables'] }, explanationHtml: '"a talk about growing heritage vegetables".' },
              { number: 20, answer: { accepted: ['fireworks display', 'a fireworks display', 'fireworks'] }, explanationHtml: '"there\'ll be a fireworks display over the river".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two education students, Priya and Tom, discussing their research project on children\'s screen time.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "So, Tom, let's go through where we are with the screen-time project." },
          { speaker: 'B', voice: 'david', text: "OK. We're looking at children aged eight to eleven. The plan is to send a questionnaire to their parents, asking how much time the children spend on screens." },
          { speaker: 'A', voice: 'zira', text: "And we've got permission from the headteacher at two primary schools to send it home with the pupils." },
          { speaker: 'B', voice: 'david', text: "Right. I'm a bit worried, though, about how accurate the parents' estimates will be. People often underestimate these things." },
          { speaker: 'A', voice: 'zira', text: "That's why we're also asking the children to keep a diary for one week, recording exactly what they do. Then we can compare the two." },
          { speaker: 'B', voice: 'david', text: "Good. And we'll put all the results into a spreadsheet to analyse them." },
          { speaker: 'A', voice: 'zira', text: "How many families have agreed to take part so far?" },
          { speaker: 'B', voice: 'david', text: "Forty. We were hoping for fifty, but forty should be enough." },
          { speaker: 'A', voice: 'zira', text: "From the first diaries that have come back, what's taking up most of their screen time?" },
          { speaker: 'B', voice: 'david', text: "I expected it to be watching videos, but actually it's video games, especially for the boys." },
          { speaker: 'A', voice: 'zira', text: "Interesting. And when's the deadline for the report?" },
          { speaker: 'B', voice: 'david', text: "The end of March. And before we send out the questionnaire, our supervisor needs to check it." },
          { speaker: 'A', voice: 'zira', text: "OK. What should we include in the final report? I definitely think we need graphs to show the main results." },
          { speaker: 'B', voice: 'david', text: "Yes. And I'd like to include some recommendations for parents, based on what we find." },
          { speaker: 'A', voice: 'zira', text: "Agreed. What about interviews with the children?" },
          { speaker: 'B', voice: 'david', text: "We don't have time for interviews, I'm afraid. But we should compare our findings with previous studies." },
          { speaker: 'A', voice: 'zira', text: "Yes, that's essential. And we won't list the individual apps, it would take up too much space." },
        ],
        questionGroups: [
          {
            id: 't28-l3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Research method</strong></p><p>Parents of children aged 8-11 will receive a {{q21}} about screen use. The {{q22}} of two schools has given permission. Tom is concerned about the {{q23}} of parents\' estimates, so the children will also keep a {{q24}} for a week. The results will be analysed using a {{q25}}.</p>',
            questions: [
              { number: 21, answer: { accepted: ['questionnaire'] }, explanationHtml: '"send a questionnaire to their parents".' },
              { number: 22, answer: { accepted: ['headteacher', 'headteachers'] }, explanationHtml: '"permission from the headteacher at two primary schools".' },
              { number: 23, answer: { accepted: ['accuracy'] }, explanationHtml: '"how accurate the parents\' estimates will be".' },
              { number: 24, answer: { accepted: ['diary'] }, explanationHtml: '"asking the children to keep a diary for one week".' },
              { number: 25, answer: { accepted: ['spreadsheet'] }, explanationHtml: '"we\'ll put all the results into a spreadsheet".' },
            ],
          },
          {
            id: 't28-l3-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              { number: 26, promptHtml: 'How many families have agreed to take part? {{q26}}', answer: { accepted: ['40', 'forty'] }, explanationHtml: '"Forty. We were hoping for fifty".' },
              { number: 27, promptHtml: 'Which activity takes up most screen time so far? {{q27}}', answer: { accepted: ['video games', 'games'] }, explanationHtml: '"actually it\'s video games".' },
              { number: 28, promptHtml: 'In which month is the report deadline? {{q28}}', answer: { accepted: ['march'] }, explanationHtml: '"The end of March."' },
              { number: 29, promptHtml: 'Who must check the questionnaire first? {{q29}}', answer: { accepted: ['supervisor', 'their supervisor', 'the supervisor'] }, explanationHtml: '"our supervisor needs to check it".' },
            ],
          },
          {
            id: 't28-l3-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-G.',
            questions: [
              {
                number: 30,
                promptHtml: 'Which THREE things will they include in the final report?',
                options: [
                  { key: 'A', text: 'graphs' },
                  { key: 'B', text: 'interviews with children' },
                  { key: 'C', text: 'recommendations for parents' },
                  { key: 'D', text: 'photographs' },
                  { key: 'E', text: 'a comparison with earlier research' },
                  { key: 'F', text: 'a list of apps' },
                  { key: 'G', text: 'information on costs' },
                ],
                selectCount: 3,
                answer: { accepted: ['A', 'C', 'E'] },
                explanationHtml: 'Graphs, "recommendations for parents" and "compare our findings with previous studies". No interviews and no list of apps.',
              },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about bioluminescence, the production of light by living things.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david2', text: "Today we're looking at bioluminescence, the ability of living organisms to produce light. You may have seen fireflies on a summer evening, but in fact the great majority of bioluminescent species live in the ocean, particularly in the deep sea, where sunlight never reaches." },
          { speaker: 'A', voice: 'david2', text: "How is the light produced? It's the result of a chemical reaction. A molecule called luciferin reacts with oxygen, helped by an enzyme, and the energy released comes out as light rather than heat. That's why it's sometimes called cold light." },
          { speaker: 'A', voice: 'david2', text: "In the sea, most bioluminescence is blue. The reason is that blue light travels furthest through seawater, so it's the most useful colour for communicating or hunting." },
          { speaker: 'A', voice: 'david2', text: "On land, the best-known example is the firefly. Fireflies flash in patterns that are specific to each species, and they use their light mainly to attract a mate." },
          { speaker: 'A', voice: 'david2', text: "Let's look at some of the uses of light in the ocean. The anglerfish has a glowing lure hanging in front of its mouth, which it uses to attract prey in the darkness." },
          { speaker: 'A', voice: 'david2', text: "Some squid produce light on their undersides, matching the faint light from above. This hides their shadow from predators looking up from below." },
          { speaker: 'A', voice: 'david2', text: "Certain deep-sea shrimps, when attacked, release a glowing cloud into the water, which confuses the predator while the shrimp escapes." },
          { speaker: 'A', voice: 'david2', text: "Some fungi glow as well. It's thought that the light may attract insects, which then carry the fungus's spores to new places." },
          { speaker: 'A', voice: 'david2', text: "Bioluminescence has become very important in science. A glowing protein first found in a jellyfish is now used in laboratories around the world to track what's happening inside cells." },
          { speaker: 'A', voice: 'david2', text: "And looking to the future, some engineers are even developing glowing trees that might one day replace street lights, although that is still a long way off." },
        ],
        questionGroups: [
          {
            id: 't28-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'Most bioluminescent species live', options: [{ key: 'A', text: 'in forests.' }, { key: 'B', text: 'in the ocean.' }, { key: 'C', text: 'in caves.' }], answer: { accepted: ['B'] }, explanationHtml: '"the great majority of bioluminescent species live in the ocean".' },
              { number: 32, promptHtml: 'Bioluminescent light is called cold light because', options: [{ key: 'A', text: 'it is produced in cold water.' }, { key: 'B', text: 'the energy is released as light, not heat.' }, { key: 'C', text: 'it is blue in colour.' }], answer: { accepted: ['B'] }, explanationHtml: '"the energy released comes out as light rather than heat".' },
              { number: 33, promptHtml: 'Most bioluminescence in the sea is blue because blue light', options: [{ key: 'A', text: 'uses the least energy.' }, { key: 'B', text: 'travels furthest in water.' }, { key: 'C', text: 'cannot be seen by predators.' }], answer: { accepted: ['B'] }, explanationHtml: '"blue light travels furthest through seawater".' },
              { number: 34, promptHtml: 'Fireflies use their light mainly to', options: [{ key: 'A', text: 'find food.' }, { key: 'B', text: 'warn predators.' }, { key: 'C', text: 'attract a partner.' }], answer: { accepted: ['C'] }, explanationHtml: '"they use their light mainly to attract a mate".' },
            ],
          },
          {
            id: 't28-l4-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              { number: 35, promptHtml: 'The anglerfish uses a glowing lure to attract {{q35}}.', answer: { accepted: ['prey'] }, explanationHtml: '"which it uses to attract prey".' },
              { number: 36, promptHtml: 'Light on the underside of some squid hides their {{q36}}.', answer: { accepted: ['shadow'] }, explanationHtml: '"This hides their shadow from predators".' },
              { number: 37, promptHtml: 'Some shrimps release a glowing {{q37}} to confuse predators.', answer: { accepted: ['cloud'] }, explanationHtml: '"release a glowing cloud into the water".' },
              { number: 38, promptHtml: 'The light of some fungi may attract {{q38}} that spread spores.', answer: { accepted: ['insects'] }, explanationHtml: '"the light may attract insects".' },
              { number: 39, promptHtml: 'A glowing protein used in laboratories came from a {{q39}}.', answer: { accepted: ['jellyfish'] }, explanationHtml: '"A glowing protein first found in a jellyfish".' },
              { number: 40, promptHtml: 'Glowing trees might one day replace {{q40}}.', answer: { accepted: ['street lights', 'streetlights'] }, explanationHtml: '"glowing trees that might one day replace street lights".' },
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
        '<p>The charts below show the main reasons why students chose their university and how satisfied they were with their course, in 2010 and 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Main reason for choosing a university (% of students)',
        unit: '%',
        categories: ['Course reputation', 'Location', 'Cost', 'Job prospects', 'Campus facilities'],
        xAxisLabel: 'Reason',
        yAxisLabel: 'Percentage of students',
        series: [
          { name: '2010', data: [34, 27, 12, 15, 12] },
          { name: '2022', data: [22, 18, 24, 29, 7] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that international tourism brings great benefits to the places that tourists visit. Others believe that it causes more harm than good to local communities.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
