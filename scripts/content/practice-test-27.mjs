// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { svgDataUri, YNNG_INSTRUCTION } from './_html.mjs';

const PARK_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#e6f0da"/>
  <text x="210" y="22" font-weight="bold" fill="#333">Oakfield Country Park</text>
  <ellipse cx="300" cy="190" rx="130" ry="70" fill="#bcd9ee" stroke="#6f9fc4" stroke-width="2"/>
  <text x="285" y="195" fill="#2c5d80" font-weight="bold">Lake</text>
  <path d="M300 385 L300 360 M300 320 L300 260" stroke="#c2a878" stroke-width="10"/>
  <path d="M170 190 L60 190 M430 190 L460 190" stroke="#c2a878" stroke-width="8"/>
  <path d="M300 120 L300 70" stroke="#c2a878" stroke-width="8"/>
  <rect x="270" y="385" width="60" height="12" fill="#555"/>
  <text x="340" y="396" fill="#333">Main entrance</text>
  <rect x="250" y="320" width="100" height="40" fill="#d7ccc8" stroke="#795548"/>
  <text x="258" y="345" fill="#3e2723">Visitor centre</text>
  <rect x="40" y="330" width="130" height="55" fill="#cfd8dc" stroke="#78909c"/>
  <text x="75" y="362" fill="#37474f">Car park</text>
  <rect x="460" y="170" width="100" height="45" fill="#d7ccc8" stroke="#795548"/>
  <text x="495" y="197" fill="#3e2723">Café</text>
  <rect x="280" y="80" width="40" height="30" fill="#e7e1d3" stroke="#999"/>
  <rect x="430" y="310" width="80" height="40" fill="#e7e1d3" stroke="#999"/>
  <rect x="40" y="50" width="110" height="70" fill="#a5d6a7" stroke="#66bb6a"/>
  <rect x="40" y="200" width="90" height="60" fill="#c5e1a5" stroke="#7cb342"/>
  <circle cx="200" cy="80" r="14" fill="#81c784"/><circle cx="420" cy="70" r="16" fill="#81c784"/><circle cx="520" cy="110" r="14" fill="#81c784"/>
  <path d="M560 60 L560 35 M552 45 L560 32 L568 45" stroke="#333" stroke-width="2" fill="none"/>
  <text x="555" y="75" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-27',
  title: 'Vocably Practice Test 27',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Bringing back the lost',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: 'A', html: "<p>In 2003, a team of scientists in Spain achieved something that had never been done before. Using cells taken from the last known Pyrenean ibex, a wild goat that had died three years earlier, they produced a cloned kid, which was carried by a goat of a related species. For a few minutes, an extinct animal lived again. Then the newborn died, from a defect in its lungs. It was a brief success, but it showed that the idea of reversing extinction was no longer pure science fiction.</p>" },
          { label: 'B', html: "<p>Since then, the field that has become known as de-extinction has attracted growing attention and considerable investment. One private company has announced plans to create an animal resembling the woolly mammoth by editing the genes of the Asian elephant, its closest living relative. The same company has also spoken of reviving the thylacine, a striped meat-eating marsupial from Tasmania, and even the dodo. Its founders speak confidently of seeing the first results within a few years.</p>" },
          { label: 'C', html: "<p>There are three main ways in which scientists hope to bring back lost species. The first is cloning, which is only possible when well-preserved living cells are available, as in the case of the ibex. The second is back-breeding, in which animals that still carry some traits of an extinct ancestor are selectively bred over many generations. The third, and most ambitious, is gene editing, in which parts of the DNA of a living species are altered to match that of an extinct one.</p>" },
          { label: 'D', html: "<p>Supporters of de-extinction argue that some lost animals performed important roles in their ecosystems. Mammoths, they suggest, once kept the Arctic grasslands open by knocking down trees and trampling snow. Without the insulating layer of snow, the frozen ground beneath stayed colder in winter. Returning large herds of mammoth-like animals to the Arctic might therefore slow the melting of the permafrost, which contains vast amounts of carbon, and so help to limit global warming.</p>" },
          { label: 'E', html: "<p>I must admit to being sceptical. An elephant that has been altered to grow thick hair and store extra fat is not a mammoth; it is a cold-tolerant elephant. The mammoth's genome can now be read, but we understand only a small part of how its genes worked together, and we know very little about its behaviour. To call such a creature a mammoth seems to me misleading, however impressive the science behind it may be.</p>" },
          { label: 'F', html: "<p>There is also the question of cost. Conservation budgets are limited, and money spent on reviving extinct animals is money not spent on protecting those that still exist. One study, which examined the likely costs of maintaining revived species in the wild, concluded that the same funds, used to protect endangered species today, would save several times as many species. Whatever its scientific appeal, de-extinction may be a poor use of scarce resources.</p>" },
          { label: 'G', html: "<p>The welfare of the animals themselves also deserves attention. Cloning has a high failure rate, and many embryos never develop, while those that survive to birth may suffer from health problems. A revived animal would be born to a mother of a different species and would have no parents of its own kind to learn from. For social animals, whose behaviour is passed on through generations, this could leave them poorly equipped to survive. It is hard to imagine a young mammoth learning to be a mammoth from an elephant.</p>" },
          { label: 'H', html: "<p>A further problem is that the conditions which allowed many species to thrive have disappeared. The passenger pigeon, which once flew over North America in flocks of hundreds of millions, depended on huge areas of forest and on living in enormous groups. Small numbers of revived pigeons would be unlikely to survive, and the forests that supported them have largely been cleared. Bringing back an animal without its habitat is, at best, creating a museum exhibit.</p>" },
          { label: 'I', html: "<p>Nevertheless, I do not believe the research is worthless. The techniques developed for de-extinction may be extremely valuable for species that are still alive. In 2020, scientists in the United States cloned a black-footed ferret from cells that had been frozen more than thirty years earlier. Because the ferret population had been reduced to just a handful of individuals, adding the genes of a long-dead animal could help to restore some of the genetic diversity the species had lost.</p>" },
          { label: 'J', html: "<p>My greatest concern is the message that de-extinction sends. If the public comes to believe that extinct species can simply be brought back, there is a danger that people will worry less about losing them in the first place, and that governments will feel less pressure to protect habitats. Extinction should remain what it has always been: permanent. The real value of this research lies not in reviving the past, but in helping us to avoid further losses in the future.</p>" },
        ],
        questionGroups: [
          {
            id: 't27-r1-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 1 has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              { number: 1, promptHtml: 'a fear that people may become less concerned about protecting species', answer: { accepted: ['J'] }, explanationHtml: 'Paragraph J: "people will worry less about losing them in the first place".', locatorParagraph: 'J' },
              { number: 2, promptHtml: 'an example of an animal that died shortly after birth', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: "For a few minutes, an extinct animal lived again. Then the newborn died".', locatorParagraph: 'A' },
              { number: 3, promptHtml: 'a description of different methods of reviving a species', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: cloning, back-breeding and gene editing.', locatorParagraph: 'C' },
              { number: 4, promptHtml: 'an example of cloning being used to help a surviving species', answer: { accepted: ['I'] }, explanationHtml: 'Paragraph I: the black-footed ferret.', locatorParagraph: 'I' },
              { number: 5, promptHtml: 'a suggestion that a revived animal could have an effect on the climate', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: it "might ... slow the melting of the permafrost ... and so help to limit global warming".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't27-r1-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 6, promptHtml: 'An elephant with some mammoth features should not be described as a mammoth.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph E: "To call such a creature a mammoth seems to me misleading".' },
              { number: 7, promptHtml: 'Private companies should be banned from carrying out de-extinction research.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer mentions a private company but gives no view on banning such companies.' },
              { number: 8, promptHtml: 'A revived animal would quickly learn to behave like its ancestors.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph G: it would have "no parents of its own kind to learn from" and could be "poorly equipped to survive".' },
              { number: 9, promptHtml: 'A small population of passenger pigeons could survive in today\'s conditions.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph H: "Small numbers of revived pigeons would be unlikely to survive".' },
            ],
          },
          {
            id: 't27-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              { number: 10, promptHtml: 'What does the writer suggest about the 2003 experiment?', options: [{ key: 'A', text: 'It was a complete failure.' }, { key: 'B', text: 'It proved that de-extinction was realistic.' }, { key: 'C', text: 'It was carried out on a living species.' }, { key: 'D', text: 'It was widely criticised at the time.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph A: "it showed that the idea of reversing extinction was no longer pure science fiction".' },
              { number: 11, promptHtml: 'According to supporters, mammoth-like animals in the Arctic would', options: [{ key: 'A', text: 'increase the amount of snow.' }, { key: 'B', text: 'encourage the growth of trees.' }, { key: 'C', text: 'help to keep the ground frozen.' }, { key: 'D', text: 'provide food for other animals.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: without the snow, "the frozen ground beneath stayed colder".' },
              { number: 12, promptHtml: 'The writer refers to the study in paragraph F in order to show that', options: [{ key: 'A', text: 'revived species would be cheap to maintain.' }, { key: 'B', text: 'conservation budgets are increasing.' }, { key: 'C', text: 'money could achieve more if spent on existing species.' }, { key: 'D', text: 'de-extinction is scientifically impossible.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph F: the same funds "would save several times as many species".' },
              { number: 13, promptHtml: 'What is the writer\'s overall opinion of de-extinction research?', options: [{ key: 'A', text: 'It should be stopped immediately.' }, { key: 'B', text: 'It is most useful for protecting species that still exist.' }, { key: 'C', text: 'It will soon bring back many extinct animals.' }, { key: 'D', text: 'It is the best answer to climate change.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph J: "The real value of this research lies ... in helping us to avoid further losses in the future."' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Working for an app',
        subtitle: 'Read the text and answer questions 14-27.',
        paragraphs: [
          { label: 'A', html: "<p>A growing number of people now find work not through an employer but through a smartphone application. Drivers pick up passengers booked through ride-hailing apps; couriers deliver restaurant meals ordered online; and freelance designers, translators and programmers bid for short projects on websites that connect them with clients around the world. This way of working, often called the gig economy, has expanded rapidly over the past fifteen years, and it has divided opinion like few other changes in the world of work.</p>" },
          { label: 'B', html: "<p>For many of those involved, the main attraction is flexibility. Gig workers can, in principle, decide when and how much they work, logging on for a few hours in the evening or working intensively for a week and then taking time off. This suits students who need to fit work around their studies, parents with childcare responsibilities, and retired people who want to earn a little extra. A survey by the labour economist Dr Helen Marsh found that around two thirds of gig workers used the work to supplement income from another job rather than as their main source of earnings. For such people, the arrangement can work well, and I see no reason to deny them that choice.</p>" },
          { label: 'C', html: "<p>The flexibility, however, comes at a price. Because gig workers are usually classified as self-employed, they are generally not entitled to the protections that employees take for granted: a minimum wage, sick pay, paid holidays or contributions to a pension. Their earnings can vary sharply from week to week, depending on demand, the weather and the number of other workers competing for the same jobs. When a courier falls ill or is injured in an accident, the loss of income is theirs alone. For those who depend on gig work for their living, this insecurity can be a serious burden.</p>" },
          { label: 'D', html: "<p>Another distinctive feature of platform work is the way it is managed. Instead of a human supervisor, workers deal with software. Algorithms decide which jobs are offered to whom, set prices and monitor performance, while customers rate each worker after every job. Workers whose ratings fall below a certain level may find that they are simply removed from the platform, sometimes without any explanation. Professor Tomas Reyes, who has interviewed hundreds of drivers, argues that this form of control leaves many workers feeling powerless and anxious. Customer ratings, moreover, can reflect prejudice or bad luck as much as the quality of the service. In my view, anyone who loses access to their source of income deserves to know the reason and to have a chance to challenge it.</p>" },
          { label: 'E', html: "<p>Not surprisingly, the status of gig workers has been fought over in the courts. In several countries, workers have argued that, although they are called self-employed, the degree of control that platforms exercise over them makes them, in reality, employees. In 2021, the United Kingdom's Supreme Court ruled that drivers for one major ride-hailing company were 'workers', entitled to the minimum wage and holiday pay. The decision was widely reported as a victory, but it applied to one company, and many other platforms have since adjusted their contracts to avoid similar claims. Legal battles alone, it seems, are unlikely to settle the matter.</p>" },
          { label: 'F', html: "<p>What, then, might be done? One proposal, developed by the policy researcher Dr Anika Shah, is for 'portable' benefits: contributions towards sick pay and pensions that are attached to the worker rather than to any single employer, and which follow them from one platform to another. Some economists, such as Mark Olsen, warn that extra costs would be passed on to consumers, who currently enjoy cheap and convenient services. Others point to worker-owned cooperatives, in which drivers or couriers collectively own the app they use. Dr Grace Lin, who has studied such cooperatives in several European cities, found that members reported higher earnings and greater satisfaction. Such cooperatives remain small, and I doubt they will ever replace the large platforms, but they show that the technology itself does not dictate how workers must be treated.</p>" },
        ],
        questionGroups: [
          {
            id: 't27-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has six paragraphs, A-F. Choose the most suitable key point for paragraphs B-F from the list below.<br/><em>Example: Paragraph A — vii</em>',
            bank: [
              { key: 'i', text: 'The freedom to choose when to work' },
              { key: 'ii', text: 'The absence of normal employment rights' },
              { key: 'iii', text: 'Being managed by computer programs' },
              { key: 'iv', text: 'Arguments in court about workers\' status' },
              { key: 'v', text: 'Possible ways to improve conditions' },
              { key: 'vi', text: 'A rise in full-time jobs for young people' },
              { key: 'viii', text: 'The effect on prices in traditional industries' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph B', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph B: "the main attraction is flexibility ... decide when and how much they work".', locatorParagraph: 'B' },
              { number: 15, promptHtml: 'Paragraph C', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph C: "not entitled to ... a minimum wage, sick pay, paid holidays".', locatorParagraph: 'C' },
              { number: 16, promptHtml: 'Paragraph D', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph D: "Instead of a human supervisor, workers deal with software."', locatorParagraph: 'D' },
              { number: 17, promptHtml: 'Paragraph E', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph E: "the status of gig workers has been fought over in the courts".', locatorParagraph: 'E' },
              { number: 18, promptHtml: 'Paragraph F', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph F: "What, then, might be done?" — portable benefits and cooperatives.', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't27-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 19, promptHtml: 'Gig work can suit the circumstances of some people well.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph B: "For such people, the arrangement can work well".' },
              { number: 20, promptHtml: 'Most gig workers would prefer a permanent job with one employer.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer does not say what most gig workers would prefer.' },
              { number: 21, promptHtml: 'Customer ratings are a fair way of judging workers.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph D: ratings "can reflect prejudice or bad luck as much as the quality of the service".' },
              { number: 22, promptHtml: 'Workers who are removed from a platform should be told why.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph D: they "deserve to know the reason".' },
              { number: 23, promptHtml: 'The 2021 court decision solved the problems faced by gig workers.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph E: "Legal battles alone ... are unlikely to settle the matter."' },
              { number: 24, promptHtml: 'Worker-owned cooperatives are likely to replace the large platforms.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph F: "I doubt they will ever replace the large platforms".' },
            ],
          },
          {
            id: 't27-r2-people',
            type: 'matching_features',
            instructionHtml: 'Match each finding or idea with the correct person, <strong>A-E</strong>.',
            bank: [
              { key: 'A', text: 'Helen Marsh' },
              { key: 'B', text: 'Tomas Reyes' },
              { key: 'C', text: 'Anika Shah' },
              { key: 'D', text: 'Mark Olsen' },
              { key: 'E', text: 'Grace Lin' },
            ],
            questions: [
              { number: 25, promptHtml: 'Benefits should move with workers between different platforms.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph F: Dr Anika Shah\'s "portable" benefits.' },
              { number: 26, promptHtml: 'Most gig workers use the work as an additional source of income.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph B: Dr Helen Marsh\'s survey — two thirds used it "to supplement income".' },
              { number: 27, promptHtml: 'Being managed by software makes many workers feel they have no control.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph D: Professor Tomas Reyes — workers feel "powerless and anxious".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Can we tell when someone is lying?',
        subtitle: 'Read the text and answer questions 28-40.',
        paragraphs: [
          { label: '', html: "<p>Most people believe that they are reasonably good at spotting a liar. We imagine that liars avoid eye contact, fidget, stumble over their words or touch their faces. Yet decades of research suggest that this confidence is badly misplaced. When psychologists combined the results of more than two hundred experiments, in which people watched others either lying or telling the truth, they found that participants identified lies correctly only about fifty-four per cent of the time, barely better than tossing a coin. Police officers, customs officials and judges, whose work might be expected to make them experts, performed little better than students.</p>" },
          { label: '', html: "<p>One reason for this poor performance is that the signs people rely on are not reliable. Liars do not consistently avoid eye contact; some deliberately hold a steady gaze because they know it is expected of truthful people. Nervousness, meanwhile, is as common among honest people who fear being disbelieved as among those who are lying. An innocent suspect in a police interview may sweat, stammer and look away simply because the situation is frightening. Treating anxiety as a sign of guilt is, in my view, not merely inaccurate but dangerous, since it can lead to innocent people being wrongly accused.</p>" },
          { label: '', html: "<p>The best-known attempt to detect lies scientifically is the polygraph, first developed in the early twentieth century. The machine records several physical responses at once: heart rate, blood pressure, breathing and the amount of sweat on the skin, which is measured through sensors attached to the fingers. A typical examination begins with a pre-test interview, in which the examiner explains the procedure and agrees the wording of the questions. During the test itself, the subject answers relevant questions about the matter under investigation, mixed with so-called control questions, which are designed to make almost anyone slightly uncomfortable. The examiner then compares the physical responses to the two kinds of question. If the reactions to the relevant questions are stronger, the subject is judged to be deceptive.</p>" },
          { label: '', html: "<p>The problem is that the polygraph does not measure lying; it measures arousal. A truthful person who is frightened by an accusation may react strongly to relevant questions, while a calm and practised liar may not. People can also be trained to defeat the test, for example by deliberately causing themselves discomfort during the control questions. For these reasons, polygraph results are not accepted as evidence in the courts of many countries, and I believe this is entirely right. It is worrying, therefore, that the machines continue to be used by some employers and government agencies to screen job applicants.</p>" },
          { label: '', html: "<p>More recently, some researchers have turned their attention away from the body and towards the mind. Their starting point is that lying is usually more mentally demanding than telling the truth: the liar must invent a story, keep it consistent, and watch the listener's reactions, all at the same time. If the mental effort required of a speaker is increased, the argument goes, liars will reach their limit sooner and begin to make mistakes. This approach, sometimes called cognitive-load interviewing, involves techniques such as asking people to describe events in reverse order, or asking unexpected questions that a liar is unlikely to have prepared for, such as asking them to draw the layout of a room they claim to have visited. Studies suggest that such methods can improve the detection of lies significantly, and they have the advantage of requiring no equipment. I find this approach far more promising than any machine.</p>" },
          { label: '', html: "<p>At the most technologically advanced end of the field are attempts to detect lies directly in the brain. Using scanners that detect changes in blood flow, researchers have found that certain regions of the brain appear to be more active when people lie. A few companies have even offered brain-based lie detection commercially. However, almost all of the research has been carried out in laboratories, with volunteers who have been instructed to lie about trivial matters, such as which playing card they have chosen. Whether the results apply to real suspects, who may be lying about serious crimes under great stress, is unknown.</p>" },
          { label: '', html: "<p>The search for a perfect lie detector has a long history, and it is unlikely to end soon. Perhaps the most important lesson from the research, however, is a humbling one: human beings are far less skilled at reading one another than they think, and any method that claims to reveal the truth with certainty should be treated with great caution.</p>" },
        ],
        questionGroups: [
          {
            id: 't27-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 28, promptHtml: 'Most people are skilled at recognising when others are lying.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 1: this confidence "is badly misplaced"; accuracy is "barely better than tossing a coin".' },
              { number: 29, promptHtml: 'Nervousness is a dependable sign that someone is lying.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 2: nervousness "is as common among honest people".' },
              { number: 30, promptHtml: 'Courts are right not to accept polygraph results as evidence.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 4: "I believe this is entirely right."' },
              { number: 31, promptHtml: 'Brain-scanning methods are too expensive for police forces to use.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The cost of brain scanning is not discussed.' },
              { number: 32, promptHtml: 'Cognitive-load interviewing is more promising than machine-based methods.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 5: "I find this approach far more promising than any machine."' },
            ],
          },
          {
            id: 't27-r3-classify',
            type: 'matching_features',
            instructionHtml:
              'Classify the following features as belonging to<br/><strong>A</strong> the polygraph<br/><strong>B</strong> cognitive-load interviewing<br/><strong>C</strong> brain-based lie detection',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'the polygraph' },
              { key: 'B', text: 'cognitive-load interviewing' },
              { key: 'C', text: 'brain-based lie detection' },
            ],
            questions: [
              { number: 33, promptHtml: 'records the subject\'s breathing', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: the polygraph records "heart rate, blood pressure, breathing".' },
              { number: 34, promptHtml: 'aims to make the speaker think harder', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "If the mental effort required of a speaker is increased".' },
              { number: 35, promptHtml: 'has mostly been tested on volunteers telling unimportant lies', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 6: "volunteers ... instructed to lie about trivial matters".' },
              { number: 36, promptHtml: 'uses questions the subject does not expect', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "asking unexpected questions".' },
              { number: 37, promptHtml: 'detects changes in the flow of blood', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 6: "scanners that detect changes in blood flow".' },
            ],
          },
          {
            id: 't27-r3-flow',
            type: 'flowchart_completion',
            instructionHtml: 'Complete the flow-chart below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>A polygraph examination</strong></p>' +
              '<p>The examiner holds a {{q38}} to explain the procedure and agree the questions</p><p>↓</p>' +
              '<p>Sensors are attached, e.g. to the fingers to measure sweat</p><p>↓</p>' +
              '<p>The subject answers relevant questions and {{q39}}</p><p>↓</p>' +
              '<p>The examiner compares the physical responses</p><p>↓</p>' +
              '<p>Stronger reactions to relevant questions → the subject is judged {{q40}}</p>',
            questions: [
              { number: 38, answer: { accepted: ['pre-test interview', 'pretest interview'] }, explanationHtml: 'Paragraph 3: "A typical examination begins with a pre-test interview".' },
              { number: 39, answer: { accepted: ['control questions'] }, explanationHtml: 'Paragraph 3: "mixed with so-called control questions".' },
              { number: 40, answer: { accepted: ['deceptive'] }, explanationHtml: 'Paragraph 3: "the subject is judged to be deceptive".' },
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
        contextText: 'You will hear a man phoning a company to rent a storage unit.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, SafeSpace Storage. How can I help?" },
          { speaker: 'B', voice: 'david', text: "Hi, I'm moving house and I need somewhere to keep some things for a few months." },
          { speaker: 'A', voice: 'zira', text: "No problem. I'll take a few details. What's your name?" },
          { speaker: 'B', voice: 'david', text: "Daniel Harker. That's H-A-R-K-E-R." },
          { speaker: 'A', voice: 'zira', text: "And your current address?" },
          { speaker: 'B', voice: 'david', text: "Seventeen Beech Road. B-E-E-C-H." },
          { speaker: 'A', voice: 'zira', text: "Thanks. How much space do you think you'll need?" },
          { speaker: 'B', voice: 'david', text: "I'm not sure. I've got a sofa, a bed, a few chairs and lots of boxes." },
          { speaker: 'A', voice: 'zira', text: "Mostly furniture, then. Anything else?" },
          { speaker: 'B', voice: 'david', text: "Yes, books. Probably twenty boxes of books." },
          { speaker: 'A', voice: 'zira', text: "Then I'd recommend a unit of six square metres. The four-metre ones are a bit small for a sofa and a bed." },
          { speaker: 'B', voice: 'david', text: "OK, six it is. I'd like to start on the third of May." },
          { speaker: 'A', voice: 'zira', text: "Fine. And for how long?" },
          { speaker: 'B', voice: 'david', text: "I was thinking three months, but let's say four, to be safe." },
          { speaker: 'A', voice: 'zira', text: "Four months. The price for that size is seventy pounds a month, but there's a discount for rentals of four months or more, so it comes to sixty-five." },
          { speaker: 'B', voice: 'david', text: "Great. Is insurance included?" },
          { speaker: 'A', voice: 'zira', text: "Basic insurance is included, and it covers goods up to two thousand pounds. You can pay extra for more." },
          { speaker: 'B', voice: 'david', text: "Two thousand should be enough. What are the opening hours?" },
          { speaker: 'A', voice: 'zira', text: "You can access your unit from six in the morning until ten at night, every day. The office is only staffed until five, though." },
          { speaker: 'B', voice: 'david', text: "That's fine." },
          { speaker: 'A', voice: 'zira', text: "And finally, can I ask how you heard about us? Was it online?" },
          { speaker: 'B', voice: 'david', text: "No, actually, I saw your advert in the newspaper." },
        ],
        questionGroups: [
          {
            id: 't27-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>SafeSpace Storage — Booking form</strong></p>' +
              '<p>Name: Daniel {{q1}}<br/>Address: 17 {{q2}} Road</p>' +
              '<p>Items to store: furniture and {{q3}}<br/>Unit size: {{q4}} square metres</p>' +
              '<p>Start date: {{q5}} May<br/>Length of rental: {{q6}} months<br/>Monthly cost: £{{q7}}</p>' +
              '<p>Insurance covers goods up to £{{q8}}<br/>Access: 6 am to {{q9}} pm daily</p>' +
              '<p>Heard about company from: {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['harker'] }, explanationHtml: '"Daniel Harker. That\'s H-A-R-K-E-R."' },
              { number: 2, answer: { accepted: ['beech'] }, explanationHtml: '"Seventeen Beech Road. B-E-E-C-H."' },
              { number: 3, answer: { accepted: ['books'] }, explanationHtml: '"Yes, books."' },
              { number: 4, answer: { accepted: ['6', 'six'] }, explanationHtml: '"I\'d recommend a unit of six square metres."' },
              { number: 5, answer: { accepted: ['3', '3rd', 'third'] }, explanationHtml: '"start on the third of May".' },
              { number: 6, answer: { accepted: ['4', 'four'] }, explanationHtml: '"let\'s say four, to be safe".' },
              { number: 7, answer: { accepted: ['65', 'sixty-five'] }, explanationHtml: '"so it comes to sixty-five" (not seventy).' },
              { number: 8, answer: { accepted: ['2000', '2,000'] }, explanationHtml: '"it covers goods up to two thousand pounds".' },
              { number: 9, answer: { accepted: ['10', 'ten'] }, explanationHtml: '"from six in the morning until ten at night".' },
              { number: 10, answer: { accepted: ['newspaper'] }, explanationHtml: '"I saw your advert in the newspaper."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a ranger giving information to visitors at a country park.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone, and welcome to Oakfield Country Park. My name's Jenny and I'm one of the rangers here." },
          { speaker: 'A', voice: 'zira', text: "Some of you may not know that the park hasn't always looked like this. Forty years ago this was a gravel quarry. When the digging stopped, the pits filled with water and formed the lake you see today, and the council planted the woods around it." },
          { speaker: 'A', voice: 'zira', text: "Dogs are welcome throughout the park, and in the woods they can run freely. But please keep them on a lead near the lake, because a lot of birds nest along the shore." },
          { speaker: 'A', voice: 'zira', text: "We run free guided walks too. We used to hold them once a month, but they were so popular that they now take place every Sunday morning." },
          { speaker: 'A', voice: 'zira', text: "Let me show you where things are on the map. We're standing in the visitor centre, just inside the main entrance. The car park, as you know, is in the south-west corner, and the café is on the eastern side of the lake." },
          { speaker: 'A', voice: 'zira', text: "If you'd like to hire a bike, the bike hire shop is the building to the east of the visitor centre, right in the south-east corner of the park, near the entrance." },
          { speaker: 'A', voice: 'zira', text: "Bird watchers should head for the bird hide. Take the path straight ahead from here, go around the lake, and you'll find the hide on the northern shore, right at the water's edge." },
          { speaker: 'A', voice: 'zira', text: "For families, there's our maze, which is in the far north-west corner of the park, in the woods. It takes about twenty minutes to get to the middle." },
          { speaker: 'A', voice: 'zira', text: "And if you've brought lunch, the picnic area is on the western side of the lake, at the end of the path that leads away from the water. There are tables there, and barbecues can be booked." },
          { speaker: 'A', voice: 'zira', text: "A few last things. Please don't feed the ducks bread, as it's bad for them. You can buy special seed at the visitor centre instead. Children can pick up a free activity booklet here, too, with puzzles and a nature trail." },
          { speaker: 'A', voice: 'zira', text: "The park closes at sunset, and the ranger locks the gates, so please make sure you're back at your car by then. Enjoy your visit!" },
        ],
        questionGroups: [
          {
            id: 't27-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'What was the site before it became a park?', options: [{ key: 'A', text: 'farmland' }, { key: 'B', text: 'a quarry' }, { key: 'C', text: 'a private estate' }], answer: { accepted: ['B'] }, explanationHtml: '"Forty years ago this was a gravel quarry."' },
              { number: 12, promptHtml: 'Dogs must be kept on a lead', options: [{ key: 'A', text: 'everywhere in the park.' }, { key: 'B', text: 'in the woods.' }, { key: 'C', text: 'near the lake.' }], answer: { accepted: ['C'] }, explanationHtml: '"please keep them on a lead near the lake".' },
              { number: 13, promptHtml: 'The free guided walks take place', options: [{ key: 'A', text: 'once a month.' }, { key: 'B', text: 'every Sunday morning.' }, { key: 'C', text: 'every weekend.' }], answer: { accepted: ['B'] }, explanationHtml: '"they now take place every Sunday morning".' },
            ],
          },
          {
            id: 't27-l2-map',
            type: 'map_label',
            instructionHtml: 'Label the map below. Choose the correct answer, <strong>A-J</strong>, for each numbered place.',
            imageUrl: PARK_MAP,
            imageAlt: 'Map of a country park: a lake in the centre; the main entrance and visitor centre at the bottom; a car park in the south-west; a café on the east side of the lake; unlabelled places on the north shore of the lake, in the south-east corner, in the north-west corner and on the west side of the lake.',
            bank: [
              { key: 'A', text: 'Adventure playground' },
              { key: 'B', text: 'Bike hire' },
              { key: 'C', text: 'Bird hide' },
              { key: 'D', text: 'Boat hire' },
              { key: 'E', text: 'Maze' },
              { key: 'F', text: 'Picnic area' },
              { key: 'G', text: 'Rose garden' },
              { key: 'H', text: 'Toilets' },
              { key: 'I', text: 'Wildflower meadow' },
              { key: 'J', text: 'Fishing platform' },
            ],
            imageHotspots: [
              { questionNumber: 14, x: 78, y: 82 },
              { questionNumber: 15, x: 50, y: 24 },
              { questionNumber: 16, x: 16, y: 21 },
              { questionNumber: 17, x: 14, y: 57 },
            ],
            questions: [
              { number: 14, answer: { accepted: ['B'] }, explanationHtml: '"the bike hire shop is ... in the south-east corner of the park".' },
              { number: 15, answer: { accepted: ['C'] }, explanationHtml: '"you\'ll find the hide on the northern shore".' },
              { number: 16, answer: { accepted: ['E'] }, explanationHtml: '"our maze, which is in the far north-west corner".' },
              { number: 17, answer: { accepted: ['F'] }, explanationHtml: '"the picnic area is on the western side of the lake".' },
            ],
          },
          {
            id: 't27-l2-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 18, promptHtml: 'Visitors should feed the ducks with {{q18}} from the visitor centre.', answer: { accepted: ['seed', 'seeds'] }, explanationHtml: '"You can buy special seed at the visitor centre".' },
              { number: 19, promptHtml: 'Children can get a free activity {{q19}}.', answer: { accepted: ['booklet'] }, explanationHtml: '"a free activity booklet".' },
              { number: 20, promptHtml: 'The park closes at {{q20}}.', answer: { accepted: ['sunset'] }, explanationHtml: '"The park closes at sunset".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two business students, Ben and Chloe, planning a presentation on packaging.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Chloe, we need to plan our presentation on sustainable packaging. Remember, it can't be longer than fifteen minutes, including questions." },
          { speaker: 'B', voice: 'zira', text: "Right. And Dr Evans said we shouldn't try to cover everything. She wants us to focus on food packaging, because that's where most of the waste comes from." },
          { speaker: 'A', voice: 'david', text: "Good. Have you found any useful sources?" },
          { speaker: 'B', voice: 'zira', text: "Yes, there's a really detailed report by an environmental charity, with lots of data on how much packaging ends up in landfill." },
          { speaker: 'A', voice: 'david', text: "Great. I thought it would be interesting to show a short video of shoppers giving their opinions. I could film some people outside the supermarket." },
          { speaker: 'B', voice: 'zira', text: "Good idea, as long as they agree to be filmed. OK, so what about the main content? I thought we could compare materials." },
          { speaker: 'A', voice: 'david', text: "Yes. Plastic first. It's light and cheap, which is why it's everywhere. The problem is that a lot of it is very hard to recycle, especially when different plastics are mixed." },
          { speaker: 'B', voice: 'zira', text: "Then glass. It can be recycled again and again, but it's heavy, so the transport costs are much higher, and that means more fuel." },
          { speaker: 'A', voice: 'david', text: "And paper and card?" },
          { speaker: 'B', voice: 'zira', text: "They're easier to recycle, but for food they often need a plastic coating to make them waterproof, and then they can't be recycled easily." },
          { speaker: 'A', voice: 'david', text: "I also found some new materials. There's a company making packaging from seaweed, and another using mushroom roots." },
          { speaker: 'B', voice: 'zira', text: "We should also talk about consumers. Surveys show people say they care about the environment, but when they're actually shopping, they mainly choose on price." },
          { speaker: 'A', voice: 'david', text: "So, for our conclusion, we could argue that voluntary action isn't enough, and that we need government regulations to force companies to change." },
          { speaker: 'B', voice: 'zira', text: "Agreed." },
        ],
        questionGroups: [
          {
            id: 't27-l3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            questions: [
              { number: 21, promptHtml: 'The presentation must last no more than {{q21}}.', answer: { accepted: ['15 minutes', 'fifteen minutes'] }, explanationHtml: '"it can\'t be longer than fifteen minutes".' },
              { number: 22, promptHtml: 'The tutor wants them to focus on {{q22}}.', answer: { accepted: ['food packaging'] }, explanationHtml: '"She wants us to focus on food packaging".' },
              { number: 23, promptHtml: 'Chloe found a detailed report by {{q23}}.', answer: { accepted: ['an environmental charity', 'environmental charity'] }, explanationHtml: '"a really detailed report by an environmental charity".' },
              { number: 24, promptHtml: 'Ben will make a short {{q24}} of shoppers\' opinions.', answer: { accepted: ['video'] }, explanationHtml: '"show a short video of shoppers giving their opinions".' },
            ],
          },
          {
            id: 't27-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Presentation content</strong></p>' +
              '<ul><li>Plastic: light and cheap, but often hard to {{q25}}</li>' +
              '<li>Glass: heavy, so higher {{q26}}</li>' +
              '<li>Paper and card: need a coating to be {{q27}}</li>' +
              '<li>New materials: made from {{q28}} or mushroom roots</li>' +
              '<li>Consumers: mainly choose on {{q29}}</li>' +
              '<li>Conclusion: need government {{q30}}</li></ul>',
            questions: [
              { number: 25, answer: { accepted: ['recycle'] }, explanationHtml: '"a lot of it is very hard to recycle".' },
              { number: 26, answer: { accepted: ['transport costs'] }, explanationHtml: '"it\'s heavy, so the transport costs are much higher".' },
              { number: 27, answer: { accepted: ['waterproof'] }, explanationHtml: '"a plastic coating to make them waterproof".' },
              { number: 28, answer: { accepted: ['seaweed'] }, explanationHtml: '"packaging from seaweed".' },
              { number: 29, answer: { accepted: ['price'] }, explanationHtml: '"they mainly choose on price".' },
              { number: 30, answer: { accepted: ['regulations', 'regulation'] }, explanationHtml: '"we need government regulations".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the science of laughter.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today I want to talk about something we all do every day, often without thinking about it: laughing." },
          { speaker: 'A', voice: 'david', text: "Laughter is much older than human language. Apes such as chimpanzees make a panting sound when they play-fight or are tickled, and most researchers believe that human laughter evolved from this, as a signal that rough behaviour was only play and not a real attack." },
          { speaker: 'A', voice: 'david', text: "One researcher spent many hours recording people laughing in everyday situations: shopping centres, offices, cafés. He found that we are around thirty times more likely to laugh when we're with other people than when we're alone. And surprisingly, most laughter doesn't follow jokes at all, but ordinary comments such as 'see you later'." },
          { speaker: 'A', voice: 'david', text: "He also found that in conversations, it's the speaker, not the listener, who laughs more. So laughter isn't mainly a response to humour; it's a social signal." },
          { speaker: 'A', voice: 'david', text: "Laughter is also contagious. Brain scans show that hearing laughter activates the areas of the brain that control the muscles of the face, as if preparing us to join in." },
          { speaker: 'A', voice: 'david', text: "What are the effects of laughing? When we laugh, the brain releases endorphins, chemicals that make us feel good. In one experiment, people who had watched a comedy together were able to tolerate more pain than those who had watched a documentary." },
          { speaker: 'A', voice: 'david', text: "Laughter also seems to strengthen relationships. In one study, couples who laughed together while discussing a problem reported greater satisfaction with their relationship." },
          { speaker: 'A', voice: 'david', text: "These findings have inspired a practice called laughter yoga, which began in India in 1995. Groups meet to laugh on purpose, without jokes. Although the laughter starts out fake, it usually turns into genuine laughter, because of that contagious effect." },
          { speaker: 'A', voice: 'david', text: "Finally, babies. They begin laughing at around four months old, long before they can speak, which reminds us just how basic this behaviour is." },
        ],
        questionGroups: [
          {
            id: 't27-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'Human laughter probably developed as a way of', options: [{ key: 'A', text: 'showing that behaviour was playful.' }, { key: 'B', text: 'warning others of danger.' }, { key: 'C', text: 'attracting a partner.' }], answer: { accepted: ['A'] }, explanationHtml: '"as a signal that rough behaviour was only play".' },
              { number: 32, promptHtml: 'The researcher found that people laugh most', options: [{ key: 'A', text: 'when they hear jokes.' }, { key: 'B', text: 'when they are with others.' }, { key: 'C', text: 'when they are alone.' }], answer: { accepted: ['B'] }, explanationHtml: '"thirty times more likely to laugh when we\'re with other people".' },
              { number: 33, promptHtml: 'In conversations, who usually laughs more?', options: [{ key: 'A', text: 'the listener' }, { key: 'B', text: 'the speaker' }, { key: 'C', text: 'both equally' }], answer: { accepted: ['B'] }, explanationHtml: '"it\'s the speaker, not the listener, who laughs more".' },
              { number: 34, promptHtml: 'Brain scans suggest that laughter is contagious because hearing it', options: [{ key: 'A', text: 'reduces stress.' }, { key: 'B', text: 'activates areas controlling facial muscles.' }, { key: 'C', text: 'improves memory.' }], answer: { accepted: ['B'] }, explanationHtml: '"activates the areas of the brain that control the muscles of the face".' },
            ],
          },
          {
            id: 't27-l4-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              { number: 35, promptHtml: 'Laughing causes the brain to release {{q35}}.', answer: { accepted: ['endorphins'] }, explanationHtml: '"the brain releases endorphins".' },
              { number: 36, promptHtml: 'People who watched a comedy together could tolerate more {{q36}}.', answer: { accepted: ['pain'] }, explanationHtml: '"able to tolerate more pain".' },
              { number: 37, promptHtml: 'Couples who laughed together reported greater {{q37}}.', answer: { accepted: ['satisfaction'] }, explanationHtml: '"reported greater satisfaction with their relationship".' },
              { number: 38, promptHtml: 'Laughter yoga started in {{q38}} in 1995.', answer: { accepted: ['india'] }, explanationHtml: '"laughter yoga, which began in India in 1995".' },
              { number: 39, promptHtml: 'In laughter yoga, fake laughter usually becomes {{q39}}.', answer: { accepted: ['genuine laughter', 'genuine'] }, explanationHtml: '"it usually turns into genuine laughter".' },
              { number: 40, promptHtml: 'Babies start to laugh at about {{q40}} old.', answer: { accepted: ['four months', '4 months'] }, explanationHtml: '"at around four months old".' },
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
        '<p>The chart below shows the percentage of household waste that was recycled in five countries in 2005 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Household waste recycled (%)',
        unit: '%',
        categories: ['Country A', 'Country B', 'Country C', 'Country D', 'Country E'],
        xAxisLabel: 'Country',
        yAxisLabel: 'Percentage recycled',
        series: [
          { name: '2005', data: [18, 32, 9, 41, 25] },
          { name: '2020', data: [44, 48, 15, 56, 24] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people prefer to live in a large city, while others think that life in the countryside is better.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
