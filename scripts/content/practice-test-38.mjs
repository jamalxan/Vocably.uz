// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

const MILL_SITE_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f4f7ee"/>
  <text x="215" y="24" font-weight="bold" fill="#333">Hatherley Mill — visitor site</text>
  <path d="M0 70 C150 90 300 55 600 80" stroke="#6f9fc4" stroke-width="26" fill="none"/>
  <text x="470" y="62" fill="#2c5d80">River Hather</text>
  <rect x="250" y="100" width="100" height="60" fill="#d7c4a3" stroke="#8d6e63"/>
  <text x="275" y="135" fill="#5d4037">Mill</text>
  <circle cx="240" cy="110" r="18" fill="none" stroke="#5d4037" stroke-width="3"/>
  <text x="150" y="104" fill="#5d4037" font-size="11">Water wheel</text>
  <rect x="270" y="360" width="60" height="30" fill="#555"/>
  <text x="338" y="382" fill="#333">Main entrance</text>
  <path d="M300 360 L300 160" stroke="#b08b5a" stroke-width="10"/>
  <path d="M300 280 L520 280" stroke="#b08b5a" stroke-width="10"/>
  <path d="M300 230 L90 230" stroke="#b08b5a" stroke-width="10"/>
  <rect x="400" y="120" width="110" height="60" fill="#e7e1d3" stroke="#999"/>
  <text x="410" y="155" fill="#333">Miller's cottage</text>
  <rect x="60" y="120" width="90" height="60" fill="#e7e1d3" stroke="#999"/>
  <rect x="60" y="260" width="90" height="70" fill="#e7e1d3" stroke="#999"/>
  <rect x="440" y="300" width="110" height="60" fill="#e7e1d3" stroke="#999"/>
  <rect x="180" y="290" width="80" height="50" fill="#e7e1d3" stroke="#999"/>
  <path d="M560 380 L560 355 M552 365 L560 352 L568 365" stroke="#333" stroke-width="2" fill="none"/>
  <text x="555" y="396" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-38',
  title: 'Vocably Practice Test 38',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Too early for school?',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>Parents of teenagers are familiar with the problem. A child who, at the age of ten, woke up cheerfully at seven o'clock becomes, a few years later, almost impossible to get out of bed. The usual explanation is that teenagers are lazy, or that they stay up too late looking at screens. Screens certainly play a part, but sleep researchers now agree that there is a more fundamental cause: during adolescence, the body clock itself changes.</p>" },
          { label: 'B', html: "<p>The timing of sleep is controlled partly by a hormone called melatonin, which the brain releases in the evening as light fades and which makes us feel drowsy. In young children, melatonin is released relatively early. At around the time of puberty, however, the release is delayed by up to two hours. The result is that a typical teenager does not feel sleepy until eleven o'clock or later, however early he or she goes to bed. At the same time, teenagers still need between eight and ten hours of sleep a night, only slightly less than younger children.</p>" },
          { label: 'C', html: "<p>If a teenager cannot fall asleep before eleven but must get up at half past six to reach school on time, the arithmetic is simple and worrying. Surveys in several countries suggest that a majority of secondary school pupils regularly sleep less than eight hours on school nights, and many try to make up for it by sleeping late at weekends. Unfortunately, this pattern makes things worse, because it shifts the body clock even later, so that Monday morning feels, to the teenager, like the middle of the night.</p>" },
          { label: 'D', html: "<p>Lack of sleep has consequences that go well beyond tiredness. It affects memory, since much of the work of storing what has been learned during the day takes place while we sleep. It reduces the ability to concentrate and to control emotions, and it has been linked to higher rates of anxiety and depression among young people. There is also a risk on the roads: in countries where teenagers are allowed to drive, those who sleep less are more likely to be involved in accidents.</p>" },
          { label: 'E', html: "<p>One obvious response is to start the school day later, and a number of schools have done exactly that. In one American district, secondary schools moved their start time from 7.50 to 8.55. Researchers found that pupils did not simply go to bed later; on average they gained around forty minutes of extra sleep each night. Attendance improved, fewer pupils fell asleep in class, and grades in the first lesson of the day rose noticeably.</p>" },
          { label: 'F', html: "<p>A school in England that tried a similar change, starting at ten o'clock instead of half past eight, reported that the number of pupils making good progress in national examinations increased. However, the experiment was abandoned after a few years when a new head teacher was appointed, and because the school was not compared with a similar school that kept its original timetable, it is hard to be certain how much of the improvement was due to the later start.</p>" },
          { label: 'G', html: "<p>Changing school hours is not simple. Later finishing times can make it difficult for pupils to take part in sports or to hold part-time jobs, and many parents have to leave for work before a later school day would begin. School buses are often shared between primary and secondary schools, so a change for one group of pupils affects the other. Teachers, too, may be unhappy about finishing later in the afternoon.</p>" },
          { label: 'H', html: "<p>Some schools have looked for compromises. Instead of changing the whole timetable, they have moved the most demanding lessons, such as mathematics, away from the first period, or introduced a later start on one or two days a week. Others have focused on education, teaching pupils and parents about sleep and encouraging families to remove phones and computers from bedrooms at night.</p>" },
          { label: 'I', html: "<p>The evidence that adolescent body clocks run late is now very strong, and several medical organisations have recommended that secondary schools should not start before half past eight. Whether that recommendation is followed will depend less on science than on money and on the willingness of schools, parents and transport companies to change long-established routines. As one researcher has put it, the question is no longer whether teenagers need more sleep, but whether adults are prepared to let them have it.</p>" },
        ],
        questionGroups: [
          {
            id: 't38-r1-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 1 has nine sections, A-I. Which section contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              { number: 1, promptHtml: 'a reason why it is difficult to judge the success of one school\'s experiment', answer: { accepted: ['F'] }, explanationHtml: 'Section F: the school "was not compared with a similar school", so "it is hard to be certain".', locatorParagraph: 'F' },
              { number: 2, promptHtml: 'an explanation of why sleeping late at weekends is unhelpful', answer: { accepted: ['C'] }, explanationHtml: 'Section C: it "shifts the body clock even later".', locatorParagraph: 'C' },
              { number: 3, promptHtml: 'a description of a chemical that affects when we feel tired', answer: { accepted: ['B'] }, explanationHtml: 'Section B: melatonin "makes us feel drowsy".', locatorParagraph: 'B' },
              { number: 4, promptHtml: 'the view that the main obstacles to change are not scientific', answer: { accepted: ['I'] }, explanationHtml: 'Section I: it "will depend less on science than on money".', locatorParagraph: 'I' },
              { number: 5, promptHtml: 'a reference to the danger of driving without enough sleep', answer: { accepted: ['D'] }, explanationHtml: 'Section D: "more likely to be involved in accidents".', locatorParagraph: 'D' },
              { number: 6, promptHtml: 'a common explanation for teenage behaviour that is only partly correct', answer: { accepted: ['A'] }, explanationHtml: 'Section A: "Screens certainly play a part, but ... there is a more fundamental cause".', locatorParagraph: 'A' },
            ],
          },
          {
            id: 't38-r1-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              { number: 7, promptHtml: 'By how much can the release of melatonin be delayed during puberty?', answer: { accepted: ['two hours', '2 hours', 'up to two hours'] }, explanationHtml: 'Section B: "delayed by up to two hours".', locatorParagraph: 'B' },
              { number: 8, promptHtml: 'What mental ability is affected because learning is stored during sleep?', answer: { accepted: ['memory'] }, explanationHtml: 'Section D: "It affects memory".', locatorParagraph: 'D' },
              { number: 9, promptHtml: 'How much extra sleep each night did pupils in the American district gain?', answer: { accepted: ['forty minutes', '40 minutes'] }, explanationHtml: 'Section E: "around forty minutes of extra sleep each night".', locatorParagraph: 'E' },
              { number: 10, promptHtml: 'Who ended the experiment at the English school?', answer: { accepted: ['head teacher', 'new head teacher'] }, explanationHtml: 'Section F: it "was abandoned ... when a new head teacher was appointed".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't38-r1-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-F.',
            questions: [
              {
                number: 11,
                promptHtml: 'Which TWO problems with later school hours are mentioned in the passage?',
                options: [
                  { key: 'A', text: 'Pupils may have less time for sport.' },
                  { key: 'B', text: 'Pupils may do less homework.' },
                  { key: 'C', text: 'Schools may have to pay teachers more.' },
                  { key: 'D', text: 'Bus timetables for younger pupils may be affected.' },
                  { key: 'E', text: 'Examination results may fall.' },
                  { key: 'F', text: 'School buildings may be used less efficiently.' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: 'Section G: later finishing makes it difficult "to take part in sports", and buses "shared between primary and secondary schools" would be affected.',
              },
            ],
          },
          {
            id: 't38-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 12,
                promptHtml: 'Which compromise is mentioned in Section H?',
                options: [
                  { key: 'A', text: 'shortening the school day' },
                  { key: 'B', text: 'moving difficult subjects later in the day' },
                  { key: 'C', text: 'giving pupils time to sleep at school' },
                  { key: 'D', text: 'starting later every day in winter' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Section H: schools "moved the most demanding lessons ... away from the first period".',
              },
              {
                number: 13,
                promptHtml: 'What is the writer\'s main purpose in the passage?',
                options: [
                  { key: 'A', text: 'to criticise teenagers for their use of technology' },
                  { key: 'B', text: 'to explain why teenagers sleep late and discuss a possible response' },
                  { key: 'C', text: 'to argue that all schools must start at ten o\'clock' },
                  { key: 'D', text: 'to compare school systems in different countries' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'The passage explains the change in body clocks (A-D) and then discusses later school start times (E-I).',
              },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Mapping the hidden floor of the ocean',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>By the middle of the twentieth century, the surface of the Moon had been mapped in more detail than the floor of the Earth's oceans. This was not surprising. The oceans cover more than two thirds of the planet, and their average depth is almost four kilometres. For centuries, the only way to measure that depth was to lower a weighted rope until it touched the bottom, a process that could take hours at a single point. Most people, including many scientists, imagined the deep sea floor as a flat, featureless plain covered in mud.</p>" },
          { label: 'B', html: "<p>The situation changed with the invention of echo sounding. A ship sends a pulse of sound downwards and measures the time it takes for the echo to return from the sea floor; since the speed of sound in water is known, the depth can be calculated. Developed partly for detecting submarines, the technique allowed ships to record depths continuously as they travelled. After the Second World War, research vessels crossed the oceans collecting thousands of these measurements, and the data were sent to laboratories on land to be interpreted.</p>" },
          { label: 'C', html: "<p>One such laboratory was a geological research institute near New York, directed by the geophysicist Maurice Ewing, who was determined to collect as much information about the ocean floor as possible and required every ship that the institute operated to take measurements wherever it went. Among the staff was a young woman, Marie Tharp, who had degrees in geology and mathematics. At that time, women were not permitted to work on the institute's research ships, so Tharp stayed on land, turning long paper records of echo soundings into detailed profiles of the sea bed.</p>" },
          { label: 'D', html: "<p>In the early 1950s, Tharp was working with a colleague, Bruce Heezen, on profiles across the North Atlantic. As she lined them up, she noticed something remarkable. Along the centre of a long underwater mountain chain, every profile showed a deep V-shaped valley. Tharp concluded that it was a rift, a place where the Earth's crust was being pulled apart. Heezen at first rejected the idea, because it seemed to support the theory of continental drift, which most geologists of the time regarded as nonsense. He changed his mind only when he found that the earthquakes recorded in the Atlantic occurred along the same line as Tharp's valley.</p>" },
          { label: 'E', html: "<p>Because much of the depth data had military value, it could not be published in the form of a conventional map with exact contours. Tharp and Heezen solved this by producing what they called physiographic diagrams, drawings that showed the sea floor as it might look if all the water were removed, viewed from an angle. The first, covering the North Atlantic, was published in 1957. Over the next twenty years they mapped every ocean in the same way, revealing a system of ridges that runs around the entire globe like the seam on a tennis ball.</p>" },
          { label: 'F', html: "<p>The maps arrived at a crucial moment. In the early 1960s, the geologist Harry Hess proposed that new ocean floor is created at the ridges, where hot rock rises from below and spreads outwards on each side. Hess had himself collected echo-sounding data while commanding a naval ship during the war, but it was the global pattern shown in the new maps that made his idea hard to ignore. Within a decade, supported by evidence from magnetic measurements of the sea floor, the theory of plate tectonics had been accepted by almost all geologists.</p>" },
          { label: 'G', html: "<p>Tharp received little recognition at the time. Her name appeared on the maps, but the scientific papers that explained their significance were usually written by men, and she was not allowed to join a research voyage until 1968. In later life, however, her contribution was widely celebrated, and a world map of the ocean floor, painted by an Austrian artist from her and Heezen's work and published in 1977, remains one of the most famous images in the history of geology, reproduced in textbooks, atlases and museums around the world. Even today, though, only around a quarter of the sea floor has been mapped in high detail, and international projects are working to complete the task within the next decade.</p>" },
        ],
        questionGroups: [
          {
            id: 't38-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em>',
            questions: [
              { number: 14, promptHtml: 'the reason why the depth data could not be shown on normal maps', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: "Because much of the depth data had military value, it could not be published".', locatorParagraph: 'E' },
              { number: 15, promptHtml: 'an explanation of how echo sounding works', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: "A ship sends a pulse of sound downwards and measures the time".', locatorParagraph: 'B' },
              { number: 16, promptHtml: 'a comparison between knowledge of the ocean floor and knowledge of another place', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: the Moon "had been mapped in more detail than the floor of the Earth\'s oceans".', locatorParagraph: 'A' },
              { number: 17, promptHtml: 'a statement about how much of the ocean floor remains to be mapped in detail', answer: { accepted: ['G'] }, explanationHtml: 'Paragraph G: "only around a quarter of the sea floor has been mapped in high detail".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't38-r2-people',
            type: 'matching_features',
            instructionHtml: 'Look at the following statements and the list of people below. Match each statement with the correct person, <strong>A-D</strong>.',
            bank: [
              { key: 'A', text: 'Maurice Ewing' },
              { key: 'B', text: 'Marie Tharp' },
              { key: 'C', text: 'Bruce Heezen' },
              { key: 'D', text: 'Harry Hess' },
            ],
            questions: [
              { number: 18, promptHtml: 'accepted an idea after comparing it with the location of earthquakes', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: Heezen "changed his mind only when he found that the earthquakes ... occurred along the same line".', locatorParagraph: 'D' },
              { number: 19, promptHtml: 'insisted that all ships should collect data on every journey', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: Ewing "required every ship ... to take measurements wherever it went".', locatorParagraph: 'C' },
              { number: 20, promptHtml: 'suggested that the ocean floor is continually being formed', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph F: Hess "proposed that new ocean floor is created at the ridges".', locatorParagraph: 'F' },
              { number: 21, promptHtml: 'identified a feature that appeared in every profile of an underwater mountain range', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph D: Tharp noticed that "every profile showed a deep V-shaped valley".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't38-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 22, promptHtml: 'Before echo sounding, measuring the depth at one point could take a long time.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph A: "a process that could take hours at a single point".' },
              { number: 23, promptHtml: 'Echo sounding was originally invented to help scientists study the sea floor.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph B: it was "Developed partly for detecting submarines".' },
              { number: 24, promptHtml: 'Tharp was the first woman to be employed by the institute.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph C says she was on the staff, but not whether she was the first woman employed.' },
              { number: 25, promptHtml: 'Hess had no personal experience of collecting ocean depth data.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph F: "Hess had himself collected echo-sounding data while commanding a naval ship".' },
              { number: 26, promptHtml: 'The world map published in 1977 was painted by Tharp herself.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph G: it was "painted by an Austrian artist from her and Heezen\'s work".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'In praise of boredom',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Few experiences are as universally disliked as boredom. We fill every spare moment, whether we are waiting for a bus or standing in a queue, with messages, news and games on our phones, and many of us would do almost anything to avoid sitting with nothing to do. In one well-known experiment, participants were left alone in an empty room for fifteen minutes with only a button that gave them a mild electric shock. A surprising number chose to press it, apparently preferring pain to the discomfort of their own thoughts. Yet a growing group of psychologists argues that boredom, far from being useless, is an important and even valuable emotion. Their work has attracted attention well beyond universities, partly because it seems to offer a scientific answer to a question that many parents and teachers ask: should we try to keep children entertained all the time?</p>" },
          { label: '', html: "<p>Their argument begins with the observation that every emotion has a function. Fear prepares us to escape danger; disgust keeps us away from things that might make us ill. Boredom, they suggest, is a signal that what we are currently doing is not meeting our needs, and that we should look for something more meaningful or more interesting. In this sense it is similar to hunger, which is unpleasant precisely because its purpose is to make us act. A person who never felt bored would have little reason to seek out new experiences, to learn new skills, or to change an unsatisfying situation.</p>" },
          { label: '', html: "<p>Some researchers have gone further, claiming that boredom encourages creativity. In a frequently cited study, one group of volunteers spent a quarter of an hour copying numbers from a telephone directory, a deliberately dull task, while another group went straight on to the next part of the experiment. Both groups were then asked to think of as many uses as they could for a pair of plastic cups. Those who had been bored first produced more ideas, and more original ones. The researchers concluded that when the mind is not occupied by anything interesting, it begins to wander, and that this wandering can lead to new connections between ideas. Other studies have reported similar effects in children, who were found to tell more imaginative stories after a period with nothing to do, and brain-imaging research has identified a network of regions that becomes more active when attention is not focused on the outside world, which some scientists believe plays a role in planning and imagination.</p>" },
          { label: '', html: "<p>I find this conclusion attractive, but I am not fully convinced by the evidence. The studies are small, often involving only a few dozen university students, and several attempts to repeat them have produced weaker results. More importantly, the kind of boredom produced in a laboratory, lasting a few minutes and ending when the experiment ends, is very different from the long periods of boredom experienced by people in monotonous jobs, or by those who are unemployed or seriously ill. There is good evidence that chronic boredom of this kind is associated with poor mental health, overeating and risky behaviour. It would be wrong to suggest that such people should simply learn to enjoy it.</p>" },
          { label: '', html: "<p>What the research does suggest, I believe, is that the problem with modern life is not too much boredom but too little tolerance of it. Because smartphones allow us to escape the feeling instantly, we rarely give our minds the chance to wander, and we may be losing the ability to stay with a difficult or slow task long enough to find it rewarding. Teachers often report that pupils give up on a problem as soon as it stops being entertaining, and some parents feel under pressure to organise activities for their children every hour of the day. Neither of these tendencies, in my view, helps young people to develop the patience that serious learning requires. Scientists, musicians and writers often describe their work as long periods of slow, repetitive effort, interrupted only occasionally by moments of excitement. Someone who has never learned to tolerate the slow periods is unlikely ever to reach the exciting ones.</p>" },
          { label: '', html: "<p>None of this means that we should seek out boredom for its own sake, or that every dull meeting is secretly good for us. But it does suggest that the next time we feel bored, we might pause before reaching for a phone. The feeling may be telling us something useful about our lives, and the few minutes of mental wandering that follow may lead somewhere unexpected. As one psychologist put it, boredom is not the enemy; the enemy is our constant rush to avoid it.</p>" },
        ],
        questionGroups: [
          {
            id: 't38-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 27, promptHtml: 'The experiment with the electric shock is mentioned to show that', options: [{ key: 'A', text: 'many people find being alone with their thoughts unpleasant.' }, { key: 'B', text: 'people do not understand the effects of pain.' }, { key: 'C', text: 'boredom can be dangerous.' }, { key: 'D', text: 'most people enjoy new experiences.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 1: they apparently preferred "pain to the discomfort of their own thoughts".' },
              { number: 28, promptHtml: 'Why does the writer compare boredom with hunger?', options: [{ key: 'A', text: 'Both are experienced by all animals.' }, { key: 'B', text: 'Both are unpleasant in order to make us act.' }, { key: 'C', text: 'Both can be easily satisfied.' }, { key: 'D', text: 'Both are more common in modern life.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: hunger "is unpleasant precisely because its purpose is to make us act".' },
              { number: 29, promptHtml: 'In the study described in the third paragraph, the bored group', options: [{ key: 'A', text: 'completed the task more quickly.' }, { key: 'B', text: 'gave up on the second task.' }, { key: 'C', text: 'had more and better ideas.' }, { key: 'D', text: 'preferred to copy numbers.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: they "produced more ideas, and more original ones".' },
              { number: 30, promptHtml: 'What criticism does the writer make of the research on boredom and creativity?', options: [{ key: 'A', text: 'It was carried out by people with a commercial interest.' }, { key: 'B', text: 'It has only studied older people.' }, { key: 'C', text: 'Its results have not always been confirmed.' }, { key: 'D', text: 'It has ignored the role of smartphones.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 4: "several attempts to repeat them have produced weaker results".' },
              { number: 31, promptHtml: 'According to the writer, the main problem with modern life is that', options: [{ key: 'A', text: 'people are bored more often than in the past.' }, { key: 'B', text: 'people are less able to accept boredom.' }, { key: 'C', text: 'jobs have become more monotonous.' }, { key: 'D', text: 'children have too few organised activities.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "the problem ... is not too much boredom but too little tolerance of it".' },
            ],
          },
          {
            id: 't38-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 32, promptHtml: 'Boredom can encourage people to improve an unsatisfactory situation.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 2: without boredom a person "would have little reason ... to change an unsatisfying situation".' },
              { number: 33, promptHtml: 'Boredom produced in a laboratory is similar to boredom experienced in daily life.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 4: it "is very different from the long periods of boredom" in real life.' },
              { number: 34, promptHtml: 'People who are bored for long periods should be taught to enjoy the feeling.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 4: "It would be wrong to suggest that such people should simply learn to enjoy it."' },
              { number: 35, promptHtml: 'Adults today experience less boredom than children.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not compare the amount of boredom experienced by adults and children.' },
              { number: 36, promptHtml: 'Organising activities for children all day helps them to learn patience.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 5: "Neither of these tendencies ... helps young people to develop the patience".' },
              { number: 37, promptHtml: 'Many workplace meetings are more useful than people realise.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Final paragraph only says we should not assume "every dull meeting is secretly good for us"; no view on their usefulness is given.' },
            ],
          },
          {
            id: 't38-r3-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-E, below.',
            bank: [
              { key: 'A', text: 'may be linked to poor mental health.' },
              { key: 'B', text: 'helps us to avoid illness.' },
              { key: 'C', text: 'can lead to new connections between ideas.' },
              { key: 'D', text: 'makes people more patient.' },
              { key: 'E', text: 'has been shown to improve examination results.' },
            ],
            questions: [
              { number: 38, promptHtml: 'The emotion of disgust', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "disgust keeps us away from things that might make us ill".' },
              { number: 39, promptHtml: 'Allowing the mind to wander', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: "this wandering can lead to new connections between ideas".' },
              { number: 40, promptHtml: 'Boredom that lasts for a long time', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: "chronic boredom ... is associated with poor mental health".' },
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
        contextText: 'You will hear a woman phoning a railway lost property office.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good afternoon, Central Railways lost property. How can I help you?" },
          { speaker: 'B', voice: 'zira', text: "Hello. I left a bag on a train yesterday, and I'm hoping someone's handed it in." },
          { speaker: 'A', voice: 'david', text: "I'm sorry to hear that. I'll fill in a report form, and then we can check what's come in. Could I have your name first?" },
          { speaker: 'B', voice: 'zira', text: "Yes, it's Anna Kowal. That's K-O-W-A-L." },
          { speaker: 'A', voice: 'david', text: "Thank you. And which train were you on?" },
          { speaker: 'B', voice: 'zira', text: "The one from Hollington to the city. It left at twenty past five, I think. No, sorry, it was the five forty. The twenty past five was cancelled." },
          { speaker: 'A', voice: 'david', text: "Five forty from Hollington. And do you remember which part of the train you were in?" },
          { speaker: 'B', voice: 'zira', text: "I was near the back. The train was very crowded, so I put the bag on the rack above my seat, and I forgot it when I got off." },
          { speaker: 'A', voice: 'david', text: "That happens a lot, I'm afraid. Can you describe the bag?" },
          { speaker: 'B', voice: 'zira', text: "It's a backpack. It's green, dark green, with a brown leather strap on the top." },
          { speaker: 'A', voice: 'david', text: "Any name or label on it?" },
          { speaker: 'B', voice: 'zira', text: "No, unfortunately not. But there's a small badge on the front pocket, a picture of a bicycle." },
          { speaker: 'A', voice: 'david', text: "That's helpful. And what was inside it?" },
          { speaker: 'B', voice: 'zira', text: "The most important thing is my laptop. It's for work. There was also a book, a scarf, and my glasses in a case." },
          { speaker: 'A', voice: 'david', text: "What make is the laptop?" },
          { speaker: 'B', voice: 'zira', text: "I'm not sure of the make, but it's silver, and it's got a sticker on the lid. It's in a black case." },
          { speaker: 'A', voice: 'david', text: "And was there any money?" },
          { speaker: 'B', voice: 'zira', text: "No, my wallet was in my coat, luckily." },
          { speaker: 'A', voice: 'david', text: "OK. Now, I'll need a contact number for you." },
          { speaker: 'B', voice: 'zira', text: "It's oh seven seven one, four three eight, nine two five." },
          { speaker: 'A', voice: 'david', text: "And an email address?" },
          { speaker: 'B', voice: 'zira', text: "It's anna dot kowal at flintmail dot com. That's F-L-I-N-T-mail." },
          { speaker: 'A', voice: 'david', text: "Thank you. Now, I've checked the list, and there is a green backpack that was found at the end of the line yesterday evening. It hasn't been opened yet, so I can't tell you if it's yours. It's being kept at the Riverside station office." },
          { speaker: 'B', voice: 'zira', text: "Oh, that's wonderful. When can I collect it?" },
          { speaker: 'A', voice: 'david', text: "The office is open from nine until six, Monday to Saturday. You'll need to bring some photo ID, like a passport or driving licence. And there's a small charge, I'm afraid, of three pounds fifty, to cover storage." },
          { speaker: 'B', voice: 'zira', text: "That's fine. I'll come tomorrow morning. Thank you so much." },
        ],
        questionGroups: [
          {
            id: 't38-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Central Railways — Lost Property Report</strong></p>' +
              '<p><em>Example:</em> Item lost: bag</p>' +
              '<p>Name: Anna {{q1}}<br/>Train: {{q2}} from Hollington<br/>Where left: on the {{q3}} above the seat</p>' +
              '<p><em>Description</em><br/>Type of bag: {{q4}}<br/>Colour: dark green, with a brown leather strap<br/>Badge showing a {{q5}}</p>' +
              '<p><em>Contents</em><br/>Laptop: {{q6}} with a sticker, in a black case<br/>Also: a book, a scarf, and {{q7}} in a case</p>' +
              '<p><em>Contact</em><br/>Email: anna.kowal@{{q8}}.com</p>' +
              '<p><em>Collection</em><br/>Place: {{q9}} station office<br/>Bring photo ID; storage charge £{{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['kowal'] }, explanationHtml: 'Spelled "K-O-W-A-L".' },
              { number: 2, answer: { accepted: ['5.40', '5:40', '17.40', '17:40'] }, explanationHtml: '"it was the five forty. The twenty past five was cancelled."' },
              { number: 3, answer: { accepted: ['rack'] }, explanationHtml: '"I put the bag on the rack above my seat".' },
              { number: 4, answer: { accepted: ['backpack', 'rucksack'] }, explanationHtml: '"It\'s a backpack."' },
              { number: 5, answer: { accepted: ['bicycle', 'bike'] }, explanationHtml: '"a small badge on the front pocket, a picture of a bicycle".' },
              { number: 6, answer: { accepted: ['silver'] }, explanationHtml: '"it\'s silver, and it\'s got a sticker on the lid".' },
              { number: 7, answer: { accepted: ['glasses'] }, explanationHtml: '"my glasses in a case".' },
              { number: 8, answer: { accepted: ['flintmail'] }, explanationHtml: '"anna dot kowal at flintmail dot com".' },
              { number: 9, answer: { accepted: ['riverside'] }, explanationHtml: '"It\'s being kept at the Riverside station office."' },
              { number: 10, answer: { accepted: ['3.50', '3,50'] }, explanationHtml: '"a small charge ... of three pounds fifty".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a volunteer talking to visitors at the start of an open day at a restored water mill.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone, and welcome to Hatherley Mill. My name's Clare, and I'm one of the volunteers who help to run the site. We're very pleased to see so many of you here for our first open day since the restoration work finished." },
          { speaker: 'A', voice: 'zira', text: "Let me start with today's special events. At eleven o'clock, in the mill itself, you can watch a demonstration of flour being ground by the water wheel, just as it was two hundred years ago. At half past twelve, there's a talk in the cottage garden about the history of the family who ran the mill for four generations. And at three o'clock, children can join a treasure hunt, which starts from the picnic area. The prizes, I'm told, are bags of our own flour." },
          { speaker: 'A', voice: 'zira', text: "Now, a little about the restoration. The mill stopped working in the nineteen sixties and was in a very poor state when the trust bought it. The biggest job was the water wheel. Many people assume that it had to be completely replaced, but in fact about two thirds of the original ironwork was saved; only the wooden paddles are new." },
          { speaker: 'A', voice: 'zira', text: "The work took six years and cost just over a million pounds. Most of that came from a national heritage fund, but a surprising amount, around a fifth, was raised by local people through events and donations, and we're very grateful to them." },
          { speaker: 'A', voice: 'zira', text: "We do ask visitors to follow a few rules. Please don't go beyond the fence along the river bank, because the water is deeper and faster than it looks. And while you're welcome to take photographs anywhere, please don't use flash inside the mill, as it can distract the volunteers operating the machinery." },
          { speaker: 'A', voice: 'zira', text: "Right, let me show you where everything is. You can see the map on the board here. We're standing at the main entrance, at the bottom of the map, and the main path runs straight north from here to the mill, which is by the river." },
          { speaker: 'A', voice: 'zira', text: "Further along the main path, there's a path branching off to the west, on your left. Follow it right to the end, and you'll find two buildings. The one below the path, to the south, is the shop, where you can buy our flour and other local products." },
          { speaker: 'A', voice: 'zira', text: "The other building at the end of that western path, above it in the far north-west corner, is the old stable. It's now used as an exhibition room, with photographs showing the mill before and during the restoration." },
          { speaker: 'A', voice: 'zira', text: "Going back to the main path: a little nearer the entrance, there's another path going east, towards the right of the map. At the far end of that path, in the south-east corner, you'll find the café. It serves bread and cakes baked with flour from the mill." },
          { speaker: 'A', voice: 'zira', text: "And the small building just to the west of the main path, close to the entrance and on your left as you walk in, is the toilet block. The miller's cottage, in the north-east next to the mill, isn't open today, I'm afraid, as the roof is still being repaired." },
          { speaker: 'A', voice: 'zira', text: "OK, that's all from me. Enjoy your visit." },
        ],
        questionGroups: [
          {
            id: 't38-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            stemHtml: table(
              ['Time', 'Event', 'Place'],
              [
                ['11.00', 'Demonstration of {{q11}}', 'the mill'],
                ['12.30', 'Talk about the family who ran the mill', 'the {{q12}}'],
                ['3.00', 'Children\'s {{q13}}', 'starts from the picnic area'],
              ],
              "Today's events"
            ),
            questions: [
              { number: 11, answer: { accepted: ['flour being ground', 'grinding flour', 'flour grinding'] }, explanationHtml: '"a demonstration of flour being ground by the water wheel".' },
              { number: 12, answer: { accepted: ['cottage garden'] }, explanationHtml: '"a talk in the cottage garden".' },
              { number: 13, answer: { accepted: ['treasure hunt'] }, explanationHtml: '"children can join a treasure hunt, which starts from the picnic area".' },
            ],
          },
          {
            id: 't38-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 14, promptHtml: 'What does Clare say about the water wheel?', options: [{ key: 'A', text: 'It was completely replaced.' }, { key: 'B', text: 'Most of the original metal was kept.' }, { key: 'C', text: 'The wooden parts are original.' }], answer: { accepted: ['B'] }, explanationHtml: '"about two thirds of the original ironwork was saved; only the wooden paddles are new".' },
              { number: 15, promptHtml: 'How much of the restoration money came from local people?', options: [{ key: 'A', text: 'about 20%' }, { key: 'B', text: 'about 33%' }, { key: 'C', text: 'about 66%' }], answer: { accepted: ['A'] }, explanationHtml: '"around a fifth, was raised by local people".' },
              { number: 16, promptHtml: 'Visitors are asked not to', options: [{ key: 'A', text: 'take photographs inside the mill.' }, { key: 'B', text: 'use flash inside the mill.' }, { key: 'C', text: 'walk along the river bank.' }], answer: { accepted: ['B'] }, explanationHtml: '"please don\'t use flash inside the mill". Photos are allowed anywhere; only going beyond the fence is forbidden.' },
            ],
          },
          {
            id: 't38-l2-map',
            type: 'map_label',
            instructionHtml: 'Label the map below. Choose the correct answer, <strong>A-F</strong>, for each numbered building.',
            imageUrl: MILL_SITE_MAP,
            imageAlt: 'Map of the Hatherley Mill site: the river runs across the top, the mill and water wheel are in the centre near the river, the miller\'s cottage is to the north-east; a main path runs north from the main entrance at the bottom; one path branches west and another branches east; there are unlabelled buildings in the north-west, west, south-east and near the entrance.',
            bank: [
              { key: 'A', text: 'Shop' },
              { key: 'B', text: 'Exhibition room' },
              { key: 'C', text: 'Café' },
              { key: 'D', text: 'Toilets' },
              { key: 'E', text: 'Picnic area' },
              { key: 'F', text: 'Ticket office' },
            ],
            imageHotspots: [
              { questionNumber: 17, x: 17, y: 74 },
              { questionNumber: 18, x: 17, y: 37 },
              { questionNumber: 19, x: 82, y: 82 },
              { questionNumber: 20, x: 37, y: 79 },
            ],
            questions: [
              { number: 17, answer: { accepted: ['A'] }, explanationHtml: '"The first building ... on the left-hand side of that path, the one below the path, is the shop".' },
              { number: 18, answer: { accepted: ['B'] }, explanationHtml: '"the building in the far north-west corner ... is the old stable ... now used as an exhibition room".' },
              { number: 19, answer: { accepted: ['C'] }, explanationHtml: '"At the far end of that path, in the south-east corner, you\'ll find the café."' },
              { number: 20, answer: { accepted: ['D'] }, explanationHtml: '"the small building just to the west of the main path, close to the entrance ... is the toilet block".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two media students, Lily and Marcus, talking to their tutor about a podcast they are making.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Lily, Marcus, how's the podcast going?" },
          { speaker: 'B', voice: 'zira', text: "Well, we've recorded the first two episodes. We decided to make a series about the history of local shops, because a lot of the old family businesses in the town are closing." },
          { speaker: 'A', voice: 'david', text: "I remember. Why did you choose that rather than something more personal?" },
          { speaker: 'C', voice: 'david2', text: "We did think about a series on student life, but there are already hundreds of those. We wanted something where we'd have to go out and interview people, because that's the skill we most wanted to practise." },
          { speaker: 'A', voice: 'david', text: "Good. And how have the interviews gone?" },
          { speaker: 'B', voice: 'zira', text: "The shopkeepers have been really generous with their time. The problem has been the sound quality. We recorded the first interview in a bakery, and you can hear the machines in the background the whole time." },
          { speaker: 'A', voice: 'david', text: "That's a very common problem. What have you done about it?" },
          { speaker: 'C', voice: 'david2', text: "We've started asking people if we can record in a back room, away from customers. And we've borrowed a better microphone from the department, one that picks up less background noise." },
          { speaker: 'A', voice: 'david', text: "Sensible. How long is each episode?" },
          { speaker: 'B', voice: 'zira', text: "We were aiming for about thirty minutes, but the first one came out at forty-five, and when we listened back, it felt too slow. So we've cut them both to around twenty minutes." },
          { speaker: 'A', voice: 'david', text: "Listeners generally prefer shorter episodes, so I think that's the right decision. Now, you'll need to write a report to go with the podcast. Let's talk about what should go in it." },
          { speaker: 'C', voice: 'david2', text: "We were going to start with our research into the shops' history." },
          { speaker: 'A', voice: 'david', text: "Yes, and explain where your information came from. I know you used the town's local history archive. Mention that, and the old newspapers you looked at." },
          { speaker: 'B', voice: 'zira', text: "We also found some old photographs. One of the shopkeepers lent us a family album." },
          { speaker: 'A', voice: 'david', text: "Excellent, you could use those on the podcast's web page. Then there should be a section on planning. I'd like to see your schedule, and how you decided the order of the episodes." },
          { speaker: 'C', voice: 'david2', text: "OK. And should we talk about the technical side?" },
          { speaker: 'A', voice: 'david', text: "Definitely. In particular, describe the editing process. That's where students usually learn the most, and it's where you had to make those difficult decisions about length." },
          { speaker: 'B', voice: 'zira', text: "And we should say something about the audience, I suppose." },
          { speaker: 'A', voice: 'david', text: "Yes. Who is the podcast for? Have you thought about that?" },
          { speaker: 'C', voice: 'david2', text: "We think it's mainly older residents who remember the shops, but we'd also like to reach younger people who've moved to the town recently." },
          { speaker: 'A', voice: 'david', text: "Then think about how you'll promote it to both groups. The local radio station sometimes plays extracts from student podcasts, so it might be worth contacting them. And finally, the report should end with an evaluation, what worked and what you'd do differently." },
          { speaker: 'B', voice: 'zira', text: "When's the deadline?" },
          { speaker: 'A', voice: 'david', text: "The end of next month. But I'd like to hear the third episode before then, if possible." },
        ],
        questionGroups: [
          {
            id: 't38-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Why did the students choose the topic of local shops?', options: [{ key: 'A', text: 'They wanted to practise interviewing.' }, { key: 'B', text: 'Their tutor suggested it.' }, { key: 'C', text: 'They had worked in local shops.' }], answer: { accepted: ['A'] }, explanationHtml: '"We wanted something where we\'d have to go out and interview people".' },
              { number: 22, promptHtml: 'What problem did they have with the first interview?', options: [{ key: 'A', text: 'The shopkeeper was too busy.' }, { key: 'B', text: 'There was too much background noise.' }, { key: 'C', text: 'The recording was lost.' }], answer: { accepted: ['B'] }, explanationHtml: '"you can hear the machines in the background the whole time".' },
              { number: 23, promptHtml: 'How long is each episode now?', options: [{ key: 'A', text: 'about 20 minutes' }, { key: 'B', text: 'about 30 minutes' }, { key: 'C', text: 'about 45 minutes' }], answer: { accepted: ['A'] }, explanationHtml: '"we\'ve cut them both to around twenty minutes".' },
              { number: 24, promptHtml: 'What does the tutor say about their decision on length?', options: [{ key: 'A', text: 'It will make editing harder.' }, { key: 'B', text: 'It suits what listeners like.' }, { key: 'C', text: 'The episodes are now too short.' }], answer: { accepted: ['B'] }, explanationHtml: '"Listeners generally prefer shorter episodes, so I think that\'s the right decision."' },
            ],
          },
          {
            id: 't38-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Report on the podcast</strong></p>' +
              '<p><em>Research</em>: mention the local history {{q25}} and old newspapers<br/>Photographs from a family {{q26}} could go on the web page</p>' +
              '<p><em>Planning</em>: include the {{q27}} and the order of episodes</p>' +
              '<p><em>Technical</em>: focus on the {{q28}} process</p>' +
              '<p><em>Audience</em>: older residents and younger newcomers; possibly contact the local {{q29}}</p>' +
              '<p><em>Conclusion</em>: an {{q30}} of what worked</p>',
            questions: [
              { number: 25, answer: { accepted: ['archive'] }, explanationHtml: '"you used the town\'s local history archive".' },
              { number: 26, answer: { accepted: ['album'] }, explanationHtml: '"One of the shopkeepers lent us a family album ... you could use those on the podcast\'s web page".' },
              { number: 27, answer: { accepted: ['schedule'] }, explanationHtml: '"I\'d like to see your schedule".' },
              { number: 28, answer: { accepted: ['editing'] }, explanationHtml: '"describe the editing process".' },
              { number: 29, answer: { accepted: ['radio station', 'radio'] }, explanationHtml: '"The local radio station sometimes plays extracts ... worth contacting them".' },
              { number: 30, answer: { accepted: ['evaluation'] }, explanationHtml: '"the report should end with an evaluation".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about bamboo as a building material.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "In today's lecture on sustainable construction, I'm going to talk about a material that has been used for thousands of years in Asia and South America, but which is only now attracting serious attention from engineers elsewhere: bamboo." },
          { speaker: 'A', voice: 'david', text: "Botanically, bamboo is not a tree but a grass, and that's the source of its first great advantage: speed of growth. Some species can grow almost a metre in a single day, and a bamboo plant can be harvested after three to five years, compared with thirty years or more for most timber. What's more, when it's cut, the plant isn't killed; new shoots grow from the same roots." },
          { speaker: 'A', voice: 'david', text: "The second advantage is strength. Bamboo is hollow, but its walls contain long fibres that make it extremely strong when it is pulled, stronger in this respect than many types of steel of the same weight. That's why it has traditionally been used for scaffolding, and in Hong Kong you can still see bamboo scaffolding on the sides of very tall buildings." },
          { speaker: 'A', voice: 'david', text: "Bamboo is also flexible, and this makes it particularly suitable in regions that suffer from earthquakes. After a major earthquake in Costa Rica in the early nineteen nineties, it was reported that a group of bamboo houses near the centre of the earthquake survived with no serious damage, while many concrete buildings collapsed." },
          { speaker: 'A', voice: 'david', text: "So why isn't bamboo used more widely? There are several problems. The first is durability. Untreated bamboo contains sugar, which attracts insects, and it can rot quickly if it's allowed to stay wet. It must therefore be treated, traditionally by soaking it in water for several weeks, or nowadays with chemical solutions." },
          { speaker: 'A', voice: 'david', text: "The second problem is fire. Bamboo burns easily, although the risk can be reduced with special coatings." },
          { speaker: 'A', voice: 'david', text: "Third, and perhaps most important for engineers, bamboo is a natural material, so no two pieces are exactly the same. The diameter and the thickness of the walls vary, which makes it difficult to calculate exactly how much weight a structure can carry. For this reason, many countries have had no official building standards for bamboo, and insurers are often unwilling to cover bamboo buildings." },
          { speaker: 'A', voice: 'david', text: "Engineers are addressing this in two ways. One is the development of international standards, which now exist for testing the strength of bamboo. The other is engineered bamboo. Here, the bamboo is cut into thin strips, which are then glued together under pressure to form boards or beams of uniform size, rather like plywood. These products behave far more predictably and can be used in the same way as timber." },
          { speaker: 'A', voice: 'david', text: "There's also growing interest in bamboo's environmental benefits. Because it grows so fast, it takes carbon dioxide out of the atmosphere at a high rate, and its roots help to prevent soil erosion on hillsides." },
          { speaker: 'A', voice: 'david', text: "However, we should be careful about treating bamboo as a perfect solution. Most of it is grown in Asia, so for builders in Europe, the energy used in transport has to be considered. And in some areas, natural forests have been cleared to make room for bamboo plantations, which obviously undermines its environmental case." },
        ],
        questionGroups: [
          {
            id: 't38-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Bamboo as a building material</strong></p>' +
              '<p><em>Advantages</em><br/>• botanically a {{q31}}, it grows very fast<br/>• after harvesting, new shoots grow from the {{q32}}<br/>• its {{q33}} make it very strong<br/>• traditionally used for {{q34}}<br/>• its flexibility is useful in areas with {{q35}}</p>' +
              '<p><em>Problems</em><br/>• contains {{q36}}, which attracts insects<br/>• burns easily<br/>• pieces vary, so there have been no official {{q37}} and insurance is difficult</p>' +
              '<p><em>Solutions</em><br/>• engineered bamboo: thin {{q38}} glued together</p>' +
              '<p><em>Environment</em><br/>• roots help prevent soil {{q39}}<br/>• concerns: transport, and clearing of natural {{q40}}</p>',
            questions: [
              { number: 31, answer: { accepted: ['grass'] }, explanationHtml: '"bamboo is not a tree but a grass".' },
              { number: 32, answer: { accepted: ['roots'] }, explanationHtml: '"new shoots grow from the same roots".' },
              { number: 33, answer: { accepted: ['fibres', 'fibers'] }, explanationHtml: '"its walls contain long fibres that make it extremely strong".' },
              { number: 34, answer: { accepted: ['scaffolding'] }, explanationHtml: '"it has traditionally been used for scaffolding".' },
              { number: 35, answer: { accepted: ['earthquakes'] }, explanationHtml: '"particularly suitable in regions that suffer from earthquakes".' },
              { number: 36, answer: { accepted: ['sugar'] }, explanationHtml: '"Untreated bamboo contains sugar, which attracts insects".' },
              { number: 37, answer: { accepted: ['standards'] }, explanationHtml: '"many countries have had no official building standards for bamboo".' },
              { number: 38, answer: { accepted: ['strips'] }, explanationHtml: '"the bamboo is cut into thin strips, which are then glued together".' },
              { number: 39, answer: { accepted: ['erosion'] }, explanationHtml: '"its roots help to prevent soil erosion".' },
              { number: 40, answer: { accepted: ['forests'] }, explanationHtml: '"natural forests have been cleared to make room for bamboo plantations".' },
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
        '<p>The chart below shows the average number of hours per month that men and women in different age groups spent on voluntary work in one country in 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Average hours of voluntary work per month, 2023',
        unit: 'hours',
        categories: ['16-24', '25-34', '35-49', '50-64', '65-74', '75+'],
        xAxisLabel: 'Age group',
        yAxisLabel: 'Hours per month',
        series: [
          { name: 'Men', data: [4.5, 2.8, 3.1, 4.2, 7.9, 5.1] },
          { name: 'Women', data: [5.2, 3.4, 4.6, 6.3, 9.4, 5.8] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that private cars should be banned from the centres of large cities.</p><p>To what extent do you agree or disagree with this view?</p>',
    },
  },
};
