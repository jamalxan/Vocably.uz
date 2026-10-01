// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE follows a standard Academic test
// layout; every topic, passage, transcript, question and answer is written from scratch.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION, svgDataUri, q, paras, mc, bank } from './_html.mjs';

const GALLERY_PLAN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f4f1ea"/>
  <text x="200" y="22" font-weight="bold" fill="#333">Harrow Art Gallery: ground floor</text>
  <rect x="40" y="40" width="150" height="120" fill="#e9e2d0" stroke="#8a7f66"/>
  <rect x="225" y="40" width="150" height="120" fill="#e9e2d0" stroke="#8a7f66"/>
  <rect x="410" y="40" width="150" height="120" fill="#e9e2d0" stroke="#8a7f66"/>
  <rect x="40" y="240" width="150" height="120" fill="#e9e2d0" stroke="#8a7f66"/>
  <rect x="410" y="240" width="150" height="120" fill="#e9e2d0" stroke="#8a7f66"/>
  <rect x="225" y="260" width="150" height="100" fill="#dfe8f0" stroke="#6f8faa"/>
  <text x="270" y="315" fill="#2c4a66" font-weight="bold">Reception</text>
  <rect x="40" y="170" width="520" height="60" fill="#faf8f2" stroke="#ccc" stroke-dasharray="4"/>
  <text x="250" y="205" fill="#777">Central corridor</text>
  <rect x="260" y="385" width="80" height="12" fill="#555"/>
  <text x="350" y="396" fill="#333">Main entrance</text>
  <path d="M580 330 L580 305 M572 315 L580 302 L588 315" stroke="#333" stroke-width="2" fill="none"/>
  <text x="575" y="345" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-13',
  title: 'Vocably Practice Test 13',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Saving the sea otter',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: paras(
          ['A', `Two hundred years ago, sea otters lived along the coast of the North Pacific from northern Japan to the Mexican peninsula, and their numbers may have been as high as three hundred thousand. They were hunted for their fur, which is the densest of any animal, with more than a hundred thousand hairs on every square centimetre of skin. Unlike seals and whales, sea otters have no layer of fat to keep them warm, and depend instead on this fur, which traps a layer of air against the skin. The fur was so prized that hunters pursued the otters along the entire coast, and by the time an international treaty banned the hunting of them in 1911, fewer than two thousand remained, scattered in a few small groups.`],
          ['B', `The disappearance of the otters did far more than reduce a population of charming animals. Sea otters feed on sea urchins, which graze on kelp, the giant seaweed that grows in dense underwater forests along rocky coasts. When the otters were removed, the urchins multiplied, and in many places, they ate the kelp so thoroughly that only bare rock, known as an urchin barren, was left. Healthy kelp forests shelter large numbers of fish, absorb carbon dioxide from the water and protect the shore by softening the force of waves. Because the whole ecosystem depends on the presence of a single species, ecologists describe the otter as a keystone species.`],
          ['C', `Conservation began in earnest once the hunting stopped. In the 1960s and 1970s, biologists captured otters from the healthiest groups in Alaska and moved them to places where they had vanished. The results were mixed. An attempt to restore otters to the coast of Oregon failed, probably because the animals were released into unsuitable places, but a similar effort in Washington State was a success, and there are now hundreds of otters along that coast. In California, where a small group had survived unnoticed, the population has grown slowly to around three thousand, while in Alaska, where hunting pressure had been lighter, numbers have recovered to tens of thousands.`],
          ['D', `The threats have not disappeared. The animals' dependence on their fur makes them especially vulnerable to oil. A film of oil mats the hair and destroys its ability to trap air, so that an otter that swims through a spill can die of cold within hours. When a tanker ran aground in Alaska in 1989, several thousand otters were killed. A more surprising danger comes from the land: a parasite found in the faeces of cats has been washed into the sea from drains, and infected otters, which are thought to pick it up from shellfish. In California, bites from great white sharks, which mistake otters for seals, also cause a significant number of deaths.`],
          ['E', `One of the most unusual programmes for helping otters is run by an aquarium on the California coast. Orphaned otter pups, found on beaches after their mothers have died, are given to surrogate mothers, females that are already living in the aquarium, which raise them with the patience of a real parent. The pups are taught to dive, to find food and to crack open shellfish with stones, and when they are old enough, they are released into the wild, where the females have gone on to raise young of their own. The scheme has added several hundred animals to the wild population, which is a significant contribution when the total is only a few thousand.`],
          ['F', `Not everyone welcomes the otters' return. Sea otters eat abalone, crabs, clams and other shellfish that people also want to harvest, and fishermen in some areas have objected that the otters are taking their livelihood. The argument is difficult, because it is true that the otters reduce the supply of shellfish. On the other hand, the recovery of the kelp forests has increased the numbers of several valuable fish, and studies in some areas suggest that the whole ecosystem, including commercial fisheries, may benefit in the long term. Wildlife managers are therefore trying to find compromises, such as zones in which shellfish harvesting is permitted, and others in which otters are left undisturbed.`]
        ),
        questionGroups: [
          {
            id: 't13-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Sea otters have the densest fur of any animal.', 'TRUE', 'Paragraph A: "the densest of any animal".', 'A'),
              q(2, 'An international treaty protected sea otters in 1911.', 'TRUE', 'Paragraph A: "an international treaty banned the hunting of them in 1911".', 'A'),
              q(3, 'An otter\'s fur keeps it warm even when it is covered with oil.', 'FALSE', 'Paragraph D: oil "destroys its ability to trap air".', 'D'),
              q(4, 'Several thousand otters were killed in an oil spill in 1989.', 'TRUE', 'Paragraph D: "several thousand otters were killed".', 'D'),
              q(5, 'Sharks are the main cause of death among otters in California.', 'NOT GIVEN', 'Paragraph D says sharks cause "a significant number" of deaths, not the main cause.', 'D'),
              q(6, 'The first attempt to restore otters to Oregon was successful.', 'FALSE', 'Paragraph C: "An attempt to restore otters to the coast of Oregon failed".', 'C'),
              q(7, 'Fishermen who harvest shellfish have sometimes objected to the otters.', 'TRUE', 'Paragraph F: "fishermen in some areas have objected".', 'F'),
            ],
          },
          {
            id: 't13-r1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS</strong> from paragraph B for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: '<p><strong>Why otters matter</strong></p><p>• Otters eat {{q8}}, which graze on kelp.<br/>• Without otters, bare rock known as an {{q9}} is left.<br/>• Kelp forests shelter large numbers of {{q10}}.<br/>• They absorb {{q11}} from the water.<br/>• They protect the shore by softening the force of {{q12}}.<br/>• The otter is described as a {{q13}} species.</p>',
            questions: [
              q(8, null, ['sea urchins', 'urchins'], 'Paragraph B: "Sea otters feed on sea urchins".', 'B'),
              q(9, null, ['urchin barren'], 'Paragraph B: "an urchin barren".', 'B'),
              q(10, null, ['fish'], 'Paragraph B: "shelter large numbers of fish".', 'B'),
              q(11, null, ['carbon dioxide'], 'Paragraph B: "absorb carbon dioxide".', 'B'),
              q(12, null, ['waves'], 'Paragraph B: "the force of waves".', 'B'),
              q(13, null, ['keystone'], 'Paragraph B: "a keystone species".', 'B'),
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Reading the road',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: paras(
          ['A', `Drivers read more road signs in a year than most people read books, and most of them do so without noticing. The first signs were simple distance markers: Roman milestones told travellers how far they were from the city. For almost two thousand years, little else was needed, since roads carried only slow traffic. The arrival of the bicycle in the 1880s changed that, because cycling clubs, whose members had to cope with steep hills and dangerous bends, began to put up warning signs. When the motor car arrived, the need became urgent, and in 1909, delegates from several European countries met in Paris and agreed on four symbols: one for a bump, one for a bend, one for a crossroads and one for a railway crossing.`],
          ['B', `That was only a beginning. As motorists began to travel between countries, it became clear that signs that meant different things in different places were a hazard. Further agreements in the 1920s made the signs more uniform, but it was not until 1968 that a major international convention, signed in Vienna, set out a common system that was eventually adopted by more than sixty countries. The convention is one of the reasons why a driver from Portugal can cross much of Europe, or even travel in parts of Asia, and understand most of what the road signs are telling them, without reading a word of the local language.`],
          ['C', `The system relies on the careful use of shape and colour. A triangle generally warns the driver of a hazard ahead, a circle gives an order or prohibits something, and a rectangle provides information. Colour reinforces the message: red usually signals danger or prohibition, blue signals an obligation or useful information, and green signals permission or direction. The shapes were chosen, in part, because they can be recognised at a great distance, before the details become visible, and some psychologists suggest that the triangle, with its points, naturally suggests a sense of alertness. Symbols are used instead of words wherever possible, because a picture can be understood by drivers of any nationality and read more quickly than a line of text.`],
          ['D', `Words are sometimes unavoidable, particularly on the large signs above motorways that give the names of towns, and the design of letters has been studied intensively. The wrong typeface can cost a driver travelling at high speed a fraction of a second of reading time, which can mean several metres of distance. In Britain, designers in the 1950s created a new typeface for road signs, with clear, wide letters and with a mixture of capitals and small letters, which research had shown were easier to recognise at speed than words written entirely in capitals. The design proved so successful that it was later adopted in other countries and is still in use today.`],
          ['E', `Psychologists have also looked at how drivers respond. A driver needs at least a second or two to notice a sign, read it and react, and too many signs close together can overload the mind, so that none is noticed. Some planners have concluded that the answer is fewer signs, not more. In a small town in the Netherlands, traffic engineers removed almost all signs, traffic lights and road markings from a busy junction, forcing drivers to slow down and make eye contact with pedestrians and other road users. Contrary to expectations, the number of accidents fell sharply, and the approach, known as shared space, has since been copied in several countries.`],
          ['F', `Road signs now have a second audience: machines. Cars with driver-assistance systems use cameras to read signs and warn the driver when the speed limit changes, and designers of fully automatic vehicles rely on them even more. Machines, however, can be confused in ways that humans are not. Signs that are faded, dirty or partly hidden by trees may not be recognised, and researchers have shown that a few carefully placed stickers can cause the software to mistake a stop sign for a speed limit. Transport authorities are therefore starting to ask whether signs ought to be redesigned, or supplemented by digital signals, to suit both kinds of reader.`],
          ['G', `Despite the rules, local character survives. Signs warning of animals crossing the road include kangaroos in Australia, moose in Scandinavia, camels in the Arabian desert and, in one region of Africa, a sign for elephants. In some countries, signs have been adapted to reflect local customs, such as a sign warning drivers of a herd of cattle, or of a school of children with their teacher. The symbols are a reminder that road signs, for all their international uniformity, are also a form of communication between people who share the same road.`],
          ['H', `The next generation of signs is likely to be electronic. Variable signs, which use lights to show different speed limits according to the traffic and the weather, are already common on busy motorways, and some cities are experimenting with signs that can be updated from a control room to warn of accidents or flooding. Whether the new signs will be as reliable as the old metal ones is unclear, but their designers are in no doubt that the simple grammar of shape and colour, developed over more than a century, will continue to be the basis of the system.`]
        ),
        questionGroups: [
          {
            id: 't13-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              q(14, 'the first international agreement about road symbols', 'A', 'Paragraph A: "in 1909, delegates ... agreed on four symbols".', 'A'),
              q(15, 'a convention that was eventually adopted by more than sixty countries', 'B', 'Paragraph B: "signed in Vienna ... more than sixty countries".', 'B'),
              q(16, 'an explanation of the meanings given to different shapes', 'C', 'Paragraph C: "A triangle generally warns ... a circle gives an order ... a rectangle provides information".', 'C'),
              q(17, 'research into the letters that can be read most easily at speed', 'D', 'Paragraph D: a mixture of capitals and small letters.', 'D'),
              q(18, 'a town where the removal of signs led to fewer accidents', 'E', 'Paragraph E: the number of accidents "fell sharply".', 'E'),
              q(19, 'a problem caused by stickers placed on signs', 'F', 'Paragraph F: "a few carefully placed stickers can cause the software to mistake a stop sign".', 'F'),
              q(20, 'examples of signs that warn drivers of animals', 'G', 'Paragraph G: kangaroos, moose, camels and elephants.', 'G'),
            ],
          },
          {
            id: 't13-r2-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary of paragraph C using the list of words, A-J, below.',
            bankReusable: false,
            bank: bank(['warns', 'informs', 'danger', 'orders', 'obligation', 'distance', 'permission', 'speed', 'words', 'symbols']),
            stemHtml: '<p>The system of road signs uses shape and colour. A triangle generally {{q21}} drivers of a hazard, a circle gives {{q22}} or prohibits something, and a rectangle {{q23}}. Red usually signals {{q24}} or prohibition, blue signals an {{q25}} or useful information, and green signals {{q26}} or direction.</p>',
            questions: [
              q(21, null, 'A', 'Paragraph C: "A triangle generally warns".', 'C'),
              q(22, null, 'D', 'Paragraph C: "a circle gives an order or prohibits something".', 'C'),
              q(23, null, 'B', 'Paragraph C: "a rectangle provides information".', 'C'),
              q(24, null, 'C', 'Paragraph C: "red usually signals danger or prohibition".', 'C'),
              q(25, null, 'E', 'Paragraph C: "blue signals an obligation".', 'C'),
              q(26, null, 'G', 'Paragraph C: "green signals permission or direction".', 'C'),
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Learning without walls',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: paras(
          ['A', `In the autumn of 2011, a university in California offered a free online course on artificial intelligence, expecting a few thousand students. More than a hundred and sixty thousand people in over a hundred and ninety countries enrolled. The response astonished the organisers, and within months, two companies had been set up to offer similar courses from leading universities. Newspapers declared that a revolution in higher education had begun, and that the traditional university, with its lecture halls and expensive fees, was about to be swept away. A decade later, it is clear that the revolution was less complete than predicted, but also that something important changed.`],
          ['B', `The promise was a simple and attractive one. The best teachers at the world's most famous universities would be available to everyone, free of charge, whatever their age, income or place of residence. A farmer in Kenya or a nurse in Brazil could follow the same lectures as a student at a famous campus, and the barriers of geography and cost would disappear. Supporters argued that this would be especially valuable in countries where there are too few university places for everyone who wishes to study, and that it would give millions of people a chance of education they would otherwise never have had.`],
          ['C', `The courses, known as massive open online courses, or MOOCs, were built on an entirely different model from the traditional lecture. Instead of an hour of talk, the material was divided into short videos, often no longer than six minutes, each followed by a quiz that the student could take immediately. Computer programs marked the answers, which made it possible to teach tens of thousands of students at once. Where written work was needed, students were asked to assess each other's essays using a set of criteria, and discussion forums allowed learners to help each other with problems.`],
          ['D', `Reality soon proved more complicated. The proportion of students who completed a course was very low, typically between five and ten per cent. Surveys suggest several reasons. There is no teacher to notice when a student stops attending, and no deadline with real consequences, and life tends to intrude: many of the learners were adults with jobs and families who had little time. Another discovery was unexpected. The great majority of those who finished were not the disadvantaged learners that the organisers had hoped to reach, but people who already had a university degree.`],
          ['E', `Research in several countries has confirmed this pattern. Students who are already well educated, with good internet connections and strong study skills, learn a great deal from the courses, while those with less education and fewer resources often give up. Language is another barrier, since most courses are in English, and a reliable computer and broadband connection, which are taken for granted in rich countries, cannot be assumed elsewhere. The technology that was intended to reduce inequality, in other words, has in many cases reinforced it, as those who have the most benefit the most.`],
          ['F', `The providers have therefore changed their approach. Some universities now use online lectures as part of ordinary courses, asking students to watch a video at home and spending class time on discussion, an approach known as the flipped classroom. Other companies have partnered with employers to offer short courses leading to credentials in areas such as data analysis and computer programming, which are more likely to be completed by people who need the skills for their work. A small number of universities now accept online courses for credit towards a degree, and some have launched entire degrees that can be taken online at a fraction of the usual cost.`],
          ['G', `The commercial side has also evolved. The first providers offered everything free; now most charge for a certificate, or for access to assessments, and some have moved to subscription models. Several companies have been sold or merged, and others have disappeared altogether. The business has proved harder than the early enthusiasts believed, since producing high-quality courses is expensive, and relatively few people are willing to pay.`],
          ['H', `So has the revolution succeeded? In my view, it has done so only partly. The original promise, of education for everybody, has not been met, and the traditional university is far from dead; students continue to value the experience of living and studying alongside others, and the recognition that a degree provides. But the courses have changed the way that millions of adults learn throughout their lives, by making it easy to pick up a new skill or explore a new subject, and they have pushed universities to think more seriously about how they teach. That, in the end, may be the real legacy.`]
        ),
        questionGroups: [
          {
            id: 't13-r3-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has eight paragraphs, A-H. Choose the correct heading for paragraphs B-H from the list of headings below.<br/><em>Example: Paragraph A — ix</em>',
            bank: [
              { key: 'i', text: 'A new way of teaching large numbers' },
              { key: 'ii', text: 'Who really benefits' },
              { key: 'iii', text: 'A lasting influence, despite falling short' },
              { key: 'iv', text: 'Hopes of education for all' },
              { key: 'v', text: 'Low completion and an unexpected discovery' },
              { key: 'vi', text: 'New partnerships and changes of direction' },
              { key: 'vii', text: 'The difficulty of earning money' },
              { key: 'viii', text: 'The decline of the lecture hall' },
              { key: 'ix', text: 'A surprising response to a simple experiment' },
              { key: 'x', text: 'Why teachers oppose online learning' },
            ],
            questions: [
              q(27, 'Paragraph B', 'iv', 'Paragraph B: "The best teachers ... available to everyone".', 'B'),
              q(28, 'Paragraph C', 'i', 'Paragraph C: short videos, quizzes and automatic marking for thousands of students.', 'C'),
              q(29, 'Paragraph D', 'v', 'Paragraph D: completion rates of "between five and ten per cent" and "an unexpected" discovery.', 'D'),
              q(30, 'Paragraph E', 'ii', 'Paragraph E: "those who have the most benefit the most".', 'E'),
              q(31, 'Paragraph F', 'vi', 'Paragraph F: flipped classroom, employer partnerships and online degrees.', 'F'),
              q(32, 'Paragraph G', 'vii', 'Paragraph G: "The business has proved harder than the early enthusiasts believed".', 'G'),
              q(33, 'Paragraph H', 'iii', 'Paragraph H: the promise "has not been met" but the courses have changed adult learning.', 'H'),
            ],
          },
          {
            id: 't13-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(34, 'What did the response to the 2011 course show?', ['that universities were about to close', 'that there was huge demand for online education', 'that artificial intelligence was easy to teach', 'that students preferred free courses'], 'B', 'Paragraph A: "More than a hundred and sixty thousand people ... enrolled".', 'A'),
              mc(35, 'According to paragraph D, which is one reason why few students finish?', ['The videos are too long.', 'There is no deadline with real consequences.', 'The quizzes are too difficult.', 'The courses are too expensive.'], 'B', 'Paragraph D: "no deadline with real consequences".', 'D'),
              mc(36, 'According to paragraph E, which students learn most from the courses?', ['those who are already well educated', 'those with little education', 'those who live in poorer countries', 'those who speak little English'], 'A', 'Paragraph E: "Students who are already well educated ... learn a great deal".', 'E'),
              mc(37, 'What is the writer\'s view of the effect of online courses on universities?', ['They have replaced them.', 'They have changed adult learning and encouraged universities to think about teaching.', 'They have had no effect.', 'They have made degrees cheaper for everyone.'], 'B', 'Paragraph H: courses "have changed the way that millions of adults learn ... and pushed universities to think more seriously about how they teach".', 'H'),
            ],
          },
          {
            id: 't13-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              q(38, 'Marking by fellow students is as reliable as marking by teachers.', 'NOT GIVEN', 'Paragraph C describes peer assessment without evaluating its reliability.', 'C'),
              q(39, 'The original promise of education for everybody has not been fulfilled.', 'YES', 'Paragraph H: "The original promise, of education for everybody, has not been met".', 'H'),
              q(40, 'Universities should stop charging fees for degrees.', 'NOT GIVEN', 'The writer expresses no view about fees.', 'H'),
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
        contextText: 'You will hear a parent phoning a school to ask about a school trip.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Oakdale Primary School, good morning." },
          { speaker: 'B', voice: 'david', text: "Good morning. My daughter is in Class Five, and I'd like to ask about the trip to the science museum next month." },
          { speaker: 'A', voice: 'zira', text: "Of course. What's your daughter's name?" },
          { speaker: 'B', voice: 'david', text: "Amelia Hargreaves. That's H-A-R-G-R-E-A-V-E-S." },
          { speaker: 'A', voice: 'zira', text: "Thank you. The trip is on Wednesday the twentieth of March. The coach leaves the school at eight forty-five, and we expect to return at about four." },
          { speaker: 'B', voice: 'david', text: "How much does it cost?" },
          { speaker: 'A', voice: 'zira', text: "It's eleven pounds per child, to cover the coach and the entrance fee. If your daughter has a free school meal, it's free, but we need to know by Friday." },
          { speaker: 'B', voice: 'david', text: "She doesn't, so I'll pay. Is there a deadline for payment?" },
          { speaker: 'A', voice: 'zira', text: "It should be paid by the end of next week, either online or in cash at the school office." },
          { speaker: 'B', voice: 'david', text: "Fine. Does she need to bring lunch?" },
          { speaker: 'A', voice: 'zira', text: "Yes, a packed lunch in a bag that can be thrown away, please, not a lunch box, because the children eat in a large hall. And no glass bottles or nuts, because some children have allergies." },
          { speaker: 'B', voice: 'david', text: "I see. What about clothing?" },
          { speaker: 'A', voice: 'zira', text: "They should wear school uniform with a waterproof coat, in case it rains, and comfortable shoes. There's a lot of walking." },
          { speaker: 'B', voice: 'david', text: "Are there any activities during the visit?" },
          { speaker: 'A', voice: 'zira', text: "Yes. In the morning they'll do a workshop on electricity, where they'll build a simple circuit, and in the afternoon there's a planetarium show." },
          { speaker: 'B', voice: 'david', text: "That sounds wonderful. And how many teachers go with them?" },
          { speaker: 'A', voice: 'zira', text: "Three teachers and four parent volunteers. We still need one more helper, actually. Would you be interested?" },
          { speaker: 'B', voice: 'david', text: "I'd love to, if I can get the day off work. May I let you know tomorrow?" },
          { speaker: 'A', voice: 'zira', text: "Certainly. Ask for Mrs Tanner in the school office." },
        ],
        questionGroups: [
          {
            id: 't13-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Oakdale Primary School: Trip enquiry', ''],
              [
                ['Child\'s surname', '{{q1}}'],
                ['Class', 'Class {{q2}}'],
                ['Destination', 'the {{q3}} museum'],
                ['Date', 'Wednesday {{q4}} March'],
                ['Coach leaves at', '{{q5}}'],
                ['Cost per child', '£{{q6}}'],
                ['Lunch', 'packed lunch in a {{q7}} bag; no glass bottles or nuts'],
                ['Clothing', 'school uniform and a waterproof {{q8}}'],
                ['Morning activity', 'workshop on {{q9}}'],
                ['Afternoon activity', '{{q10}} show'],
              ]
            ),
            questions: [
              q(1, null, ['hargreaves'], 'Spelled out: H-A-R-G-R-E-A-V-E-S.'),
              q(2, null, ['5', 'five'], '"in Class Five".'),
              q(3, null, ['science'], '"the science museum".'),
              q(4, null, ['20', 'twentieth', '20th'], '"Wednesday the twentieth of March".'),
              q(5, null, ['8.45', '8:45', 'eight forty-five', 'eight forty five', 'quarter to nine'], '"at eight forty-five".'),
              q(6, null, ['11', 'eleven'], '"eleven pounds per child".'),
              q(7, null, ['throwaway', 'throw-away', 'disposable', 'thrown away'], '"a bag that can be thrown away".'),
              q(8, null, ['coat'], '"a waterproof coat".'),
              q(9, null, ['electricity'], '"a workshop on electricity".'),
              q(10, null, ['planetarium'], '"a planetarium show".'),
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a guide giving visitors an introduction to an art gallery.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, and welcome to Harrow Art Gallery. I'm Rachel, and I'll be showing you around this morning. First, some background and practical information." },
          { speaker: 'A', voice: 'zira', text: "The gallery was founded in eighteen ninety-one by a local cloth merchant, who left his collection of paintings to the town. It has grown a great deal since then, and now has over four thousand works." },
          { speaker: 'A', voice: 'zira', text: "The gallery is open from ten until five every day except Mondays. Admission to the permanent collection is free, but there's a charge for special exhibitions. The current exhibition, on nineteenth-century landscape painting, costs nine pounds, or six for students." },
          { speaker: 'A', voice: 'zira', text: "Photography is permitted in most rooms, but flash is not allowed, because the light damages the paintings. Please also avoid touching the works, and keep bags and umbrellas in the cloakroom, which is free." },
          { speaker: 'A', voice: 'zira', text: "We run guided tours at eleven and two on weekdays. Children are welcome, and on Saturdays, there are art workshops for families, which need to be booked in advance." },
          { speaker: 'A', voice: 'zira', text: "Now, let me show you around the plan. We're standing at the main entrance, at the bottom of the plan. Straight ahead of you is reception, where you can buy tickets and pick up a free audio guide." },
          { speaker: 'A', voice: 'zira', text: "On your left, in the south-west corner, is the café, which serves lunch and is popular with local people. On the right, in the south-east corner, is the gift shop, where you can buy books, prints and postcards." },
          { speaker: 'A', voice: 'zira', text: "If you go through reception and into the central corridor, you'll reach the main galleries. In the north-west corner, at the top left, is the sculpture hall, with work by British and European artists. It's the quietest room." },
          { speaker: 'A', voice: 'zira', text: "Directly ahead, in the centre at the top, is the portrait gallery, with paintings of famous people from the last four centuries. And at the top right, in the north-east corner, is the gallery of modern art. The pieces in this room are the most controversial, so don't be surprised if you find some of them strange." },
          { speaker: 'A', voice: 'zira', text: "The toilets are beside the cloakroom, near the entrance, and the lift is next to reception for anyone who needs it. If you have any questions, please ask any member of staff, who will be wearing a green badge. Shall we begin?" },
        ],
        questionGroups: [
          {
            id: 't13-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(11, 'The gallery was founded by', ['a cloth merchant', 'a local artist', 'the town council'], 'A', '"founded ... by a local cloth merchant".'),
              mc(12, 'The gallery is closed on', ['Sundays', 'Mondays', 'Tuesdays'], 'B', '"every day except Mondays".'),
              mc(13, 'How much does the special exhibition cost for students?', ['£6', '£9', 'It is free.'], 'A', '"nine pounds, or six for students".'),
              mc(14, 'Visitors are not allowed to', ['take photographs', 'use flash', 'use audio guides'], 'B', '"flash is not allowed".'),
              mc(15, 'On Saturdays, the gallery offers', ['free guided tours', 'art workshops for families', 'evening concerts'], 'B', '"art workshops for families".'),
            ],
          },
          {
            id: 't13-l2-map',
            type: 'plan_label',
            instructionHtml: 'Label the plan below. Choose the correct answer, <strong>A-H</strong>, for each numbered room (Questions 16-20).',
            imageUrl: GALLERY_PLAN,
            imageAlt: 'Ground-floor plan of an art gallery: main entrance at the bottom centre; reception in the middle of the lower part; a central corridor across the middle; five unlabelled rooms in the north-west, north-centre, north-east, south-west and south-east.',
            bank: bank(['Children\'s studio', 'Gift shop', 'Café', 'Modern art', 'Photography', 'Portraits', 'Sculpture hall', 'Toilets']),
            imageHotspots: [
              { questionNumber: 16, x: 19, y: 25 },
              { questionNumber: 17, x: 50, y: 25 },
              { questionNumber: 18, x: 81, y: 25 },
              { questionNumber: 19, x: 19, y: 75 },
              { questionNumber: 20, x: 81, y: 75 },
            ],
            questions: [
              q(16, null, 'G', '"In the north-west corner, at the top left, is the sculpture hall".'),
              q(17, null, 'F', '"in the centre at the top, is the portrait gallery".'),
              q(18, null, 'D', '"at the top right, in the north-east corner, is the gallery of modern art".'),
              q(19, null, 'C', '"On your left, in the south-west corner, is the café".'),
              q(20, null, 'B', '"On the right, in the south-east corner, is the gift shop".'),
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two engineering students, Carla and Dev, discussing a bridge-building project with their tutor.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david2', text: "Good afternoon, both. I'd like to hear how your bridge project is progressing." },
          { speaker: 'B', voice: 'zira', text: "We've finished the design, Dr Lawson. It's a truss bridge made of balsa wood, with a span of sixty centimetres." },
          { speaker: 'A', voice: 'david2', text: "Why a truss design?" },
          { speaker: 'C', voice: 'david', text: "Because the triangles spread the load evenly, so it's strong for its weight. We tested several designs on a computer program, and this one performed best." },
          { speaker: 'A', voice: 'david2', text: "Good. And what's your target?" },
          { speaker: 'B', voice: 'zira', text: "The competition rule is that the bridge must carry at least five kilograms, but we'd like to get to eight." },
          { speaker: 'A', voice: 'david2', text: "That's ambitious. What's the weight of the bridge itself?" },
          { speaker: 'C', voice: 'david', text: "About a hundred and eighty grams, and the limit is two hundred and fifty, so there's a little room to strengthen weak points." },
          { speaker: 'A', voice: 'david2', text: "I'd be cautious about adding material. The best approach is to test a model to destruction, see where it breaks, and strengthen only that part." },
          { speaker: 'B', voice: 'zira', text: "We've done one test. It broke at the joints, not in the wood itself." },
          { speaker: 'A', voice: 'david2', text: "That's the usual problem. Which glue did you use?" },
          { speaker: 'C', voice: 'david', text: "An ordinary wood glue. We thought about epoxy, but it's much more expensive." },
          { speaker: 'A', voice: 'david2', text: "For the joints, it may be worth the expense. A cheap compromise is to use wood glue but add small triangles of card over each joint, which spread the force." },
          { speaker: 'B', voice: 'zira', text: "We hadn't thought of that. We'll try it." },
          { speaker: 'A', voice: 'david2', text: "Also, think about how the load will be applied. In the competition, the weight hangs from the centre of the bridge, so the middle section must be the strongest." },
          { speaker: 'C', voice: 'david', text: "Right. And the report? How long should it be?" },
          { speaker: 'A', voice: 'david2', text: "Two thousand words, including photographs and diagrams, and it must describe what went wrong as well as what worked. Engineers learn more from failure. The competition takes place on the fifteenth of June, and the report is due a week later." },
          { speaker: 'B', voice: 'zira', text: "Thanks, that's very helpful." },
        ],
        questionGroups: [
          {
            id: 't13-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(21, 'What material is the bridge made of?', ['balsa wood', 'steel', 'plastic'], 'A', '"a truss bridge made of balsa wood".'),
              mc(22, 'Why did the students choose a truss design?', ['It looks attractive.', 'The triangles spread the load evenly.', 'It is easy to build.'], 'B', '"the triangles spread the load evenly".'),
              mc(23, 'What is the minimum load the bridge must carry in the competition?', ['3 kg', '5 kg', '8 kg'], 'B', '"at least five kilograms".'),
              mc(24, 'In the first test, where did the bridge break?', ['in the wood itself', 'at the joints', 'in the middle'], 'B', '"It broke at the joints".'),
              mc(25, 'What does the tutor suggest for the joints?', ['more wood', 'small triangles of card', 'metal screws'], 'B', '"small triangles of card over each joint".'),
            ],
          },
          {
            id: 't13-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>Bridge project</strong></p><p>• span of {{q26}} centimetres<br/>• students\' target: to carry {{q27}} kg<br/>• weight of the bridge: about {{q28}} grams; limit is 250 grams<br/>• in the competition, the load hangs from the {{q29}} of the bridge<br/>• competition on the fifteenth of {{q30}}</p>',
            questions: [
              q(26, null, ['60', 'sixty'], '"a span of sixty centimetres".'),
              q(27, null, ['8', 'eight'], '"we\'d like to get to eight".'),
              q(28, null, ['180', 'a hundred and eighty', 'one hundred and eighty'], '"About a hundred and eighty grams".'),
              q(29, null, ['centre', 'center', 'middle'], '"the weight hangs from the centre of the bridge".'),
              q(30, null, ['june'], '"on the fifteenth of June".'),
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about rivers that have been hidden beneath cities.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Many of the world's great cities were built beside rivers, but in a surprising number of cases, the rivers are no longer visible. Today I'm going to talk about what geographers call buried or lost rivers, and about the efforts to bring some of them back." },
          { speaker: 'A', voice: 'david', text: "In the eighteenth and nineteenth centuries, as cities grew rapidly, small rivers and streams became dumping grounds for waste from factories, slaughterhouses and households. They smelled terrible, and were breeding places for disease. The obvious solution seemed to be to cover them over, and to use them as sewers." },
          { speaker: 'A', voice: 'david', text: "Engineers built brick and concrete tunnels around the streams, and the streets were built on top. In London alone, there are more than twenty rivers flowing beneath the pavements, and some of them still appear on maps as street names, such as Fleet Street." },
          { speaker: 'A', voice: 'david', text: "Burying the rivers had unintended consequences. Natural rivers absorb rainfall and release it slowly, whereas the pipes that replaced them carry water quickly to lower ground, and heavy storms can cause flooding. The storm water also flows over roads, collecting oil and other pollutants, and carries it directly to the sea." },
          { speaker: 'A', voice: 'david', text: "From the nineteen-seventies, some cities began to reverse the process. The pioneering example was a stream in a South Korean capital, which was buried under a motorway in the nineteen-sixties. In two thousand and three, the city demolished the motorway and restored the stream, at a cost of about three hundred and fifty million dollars. The river is now a major attraction, with millions of visitors each year, and researchers have recorded a fall in temperature in the surrounding area of several degrees on hot days." },
          { speaker: 'A', voice: 'david', text: "Other cities have followed. In Europe and North America, dozens of projects have uncovered streams, replaced concrete channels with natural banks and planted trees and reeds. The benefits include cleaner water, habitats for fish and birds, and protection against floods. Property prices in nearby areas have also risen." },
          { speaker: 'A', voice: 'david', text: "Not every project is practical. Restoring a stream can be extremely expensive, particularly when buildings have been constructed over the old route. Some cities have settled for partial solutions, such as marking the route of the river in the pavement or opening up only short sections." },
          { speaker: 'A', voice: 'david', text: "What does this tell us? Rivers, it seems, are not simply obstacles to be managed, but part of the life of a city. The challenge for planners is to find ways of making room for them, even in places where people have forgotten that they were ever there." },
        ],
        questionGroups: [
          {
            id: 't13-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>Lost rivers</strong></p><p><em>Why they were buried</em><br/>• became dumping grounds for waste from factories, {{q31}} and households<br/>• they smelled terrible and spread {{q32}}<br/>• covered over and used as {{q33}}</p><p><em>Examples and problems</em><br/>• more than {{q34}} rivers flow beneath London; one survives in the name of Fleet Street<br/>• pipes carry water quickly, so heavy storms may cause {{q35}}<br/>• storm water collects oil and other {{q36}}</p><p><em>Restoration</em><br/>• Korean capital: motorway demolished in {{q37}}; cost about $350 million<br/>• the area around the river is several {{q38}} cooler on hot days<br/>• property {{q39}} nearby have risen<br/>• some cities mark the route of the river in the {{q40}}</p>',
            questions: [
              q(31, null, ['slaughterhouses'], '"factories, slaughterhouses and households".'),
              q(32, null, ['disease'], '"breeding places for disease".'),
              q(33, null, ['sewers'], '"to use them as sewers".'),
              q(34, null, ['20', 'twenty'], '"more than twenty rivers".'),
              q(35, null, ['flooding'], '"heavy storms can cause flooding".'),
              q(36, null, ['pollutants'], '"oil and other pollutants".'),
              q(37, null, ['2003'], '"In two thousand and three".'),
              q(38, null, ['degrees'], '"a fall in temperature ... of several degrees".'),
              q(39, null, ['prices'], '"Property prices in nearby areas have also risen."'),
              q(40, null, ['pavement'], '"marking the route of the river in the pavement".'),
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
        '<p>The chart below shows the number of students who enrolled in four types of course at a college in 2010 and in 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Student enrolments by course type (hundreds)',
        unit: 'hundreds',
        categories: ['Business', 'Engineering', 'Languages', 'Arts'],
        xAxisLabel: 'Course type',
        yAxisLabel: 'Students (hundreds)',
        series: [
          { name: '2010', data: [42, 28, 25, 19] },
          { name: '2020', data: [38, 45, 14, 21] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people argue that online courses will eventually replace traditional universities.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
