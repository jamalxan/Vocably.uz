// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-44',
  title: 'Vocably Practice Test 44',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The summer of the Great Stink',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>In the middle of the nineteenth century, London was the largest and richest city in the world, with a population of more than two and a half million. It was also one of the dirtiest. For centuries, the city's waste had been collected in cesspits beneath houses, which were emptied by night-soil men who sold the contents to farmers as fertiliser. But as the city grew, this system broke down. The introduction of the flushing toilet, which became fashionable in the 1840s, made matters much worse, because it sent huge volumes of water into cesspits that were never designed to hold them. The overflow was increasingly directed into the old drains and streams that flowed into the River Thames.</p>" },
          { label: '', html: "<p>The Thames was therefore turning into an open sewer, and it was also the main source of drinking water for much of the city. Outbreaks of cholera killed tens of thousands of Londoners in the 1830s, 1840s and 1850s. At the time, most doctors believed that the disease was spread by a 'miasma', a poisonous vapour rising from rotting matter. In 1854, a doctor named John Snow showed that cases of cholera in one district were clustered around a single public water pump, and argued that the disease was carried in contaminated water. His conclusion was correct, but few people accepted it during his lifetime.</p>" },
          { label: '', html: "<p>The summer of 1858 was unusually hot, and the level of the river fell. The smell from the exposed banks of waste became so overwhelming that the period became known as the Great Stink. Its effects were felt most directly by the members of Parliament, whose new building stood on the edge of the river. Curtains soaked in chemicals were hung at the windows in an attempt to block the smell, and there was serious discussion of moving Parliament out of London altogether. Within a few weeks, a law was passed giving the city's Metropolitan Board of Works the power and the money to build a new sewer system.</p>" },
          { label: '', html: "<p>The engineer in charge was Joseph Bazalgette. His plan was based on a simple idea. Rather than allowing waste to flow directly into the Thames in the centre of the city, it would be caught by large sewers running parallel to the river on both sides, and carried eastwards, well beyond the built-up area, where it would be released into the river on the outgoing tide. The system combined gravity with pumping: where the land was too flat for the sewage to flow naturally, large steam-powered pumping stations lifted it to a higher level.</p>" },
          { label: '', html: "<p>The scale of the work was immense. Bazalgette's teams built around 130 kilometres of main intercepting sewers, fed by more than 1,700 kilometres of smaller street sewers, and used hundreds of millions of bricks. Bazalgette insisted on using a new, stronger type of cement, which hardened even under water, and he tested every batch that was delivered. When calculating the size of the pipes, he worked out the diameter that would be needed for the expected population, and then doubled it, on the grounds that the work would only be done once. This decision allowed the system to cope with London's growth for more than a century.</p>" },
          { label: '', html: "<p>In the centre of the city, part of the new system was built into three new embankments along the river. These not only contained sewers but also provided space for roads, an underground railway and public gardens, and reclaimed land that had previously been covered with mud at low tide. The main system was officially opened in 1865, although work continued for another ten years.</p>" },
          { label: '', html: "<p>The effect on public health was dramatic. In 1866, there was one final serious outbreak of cholera in London, but it was concentrated in an area in the east of the city that had not yet been connected to the new sewers, which strongly supported Snow's theory. After that, the disease never returned to the city on a large scale. Ironically, the sewers had been built largely to deal with the smell, which the authorities believed was the cause of disease; they succeeded because they also kept sewage out of the drinking water. Bazalgette was knighted for his work, and much of his system is still in use today, although a large new tunnel has recently been built beneath the river to cope with the demands of a much bigger city.</p>" },
        ],
        questionGroups: [
          {
            id: 't44-r1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>London\'s sewers</strong></p>' +
              '<p><em>Before 1858</em><br/>• waste collected in cesspits and sold to farmers as {{q1}}<br/>• flushing toilets sent too much water into cesspits<br/>• most doctors thought cholera was caused by a {{q2}}</p>' +
              '<p><em>Bazalgette\'s system</em><br/>• sewers ran parallel to the river and carried waste {{q3}}<br/>• steam-powered {{q4}} stations used where land was flat<br/>• used a new type of {{q5}}, which was tested carefully<br/>• pipe sizes were {{q6}} to allow for growth</p>',
            questions: [
              { number: 1, answer: { accepted: ['fertiliser', 'fertilizer'] }, explanationHtml: 'Paragraph 1: sold "to farmers as fertiliser".' },
              { number: 2, answer: { accepted: ['miasma'] }, explanationHtml: 'Paragraph 2: "spread by a \'miasma\'".' },
              { number: 3, answer: { accepted: ['eastwards', 'east'] }, explanationHtml: 'Paragraph 4: "carried eastwards, well beyond the built-up area".' },
              { number: 4, answer: { accepted: ['pumping'] }, explanationHtml: 'Paragraph 4: "large steam-powered pumping stations".' },
              { number: 5, answer: { accepted: ['cement'] }, explanationHtml: 'Paragraph 5: "a new, stronger type of cement ... he tested every batch".' },
              { number: 6, answer: { accepted: ['doubled'] }, explanationHtml: 'Paragraph 5: "and then doubled it".' },
            ],
          },
          {
            id: 't44-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 7, promptHtml: 'The flushing toilet helped to solve London\'s waste problem.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: it "made matters much worse".' },
              { number: 8, promptHtml: 'John Snow\'s ideas were widely accepted during his lifetime.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "few people accepted it during his lifetime".' },
              { number: 9, promptHtml: 'Moving Parliament away from London was considered in 1858.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 3: "there was serious discussion of moving Parliament out of London altogether".' },
              { number: 10, promptHtml: 'Bazalgette had previously designed sewers in other cities.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage says nothing about his earlier work.' },
              { number: 11, promptHtml: 'The embankments were used for transport as well as for sewers.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 6: they "provided space for roads, an underground railway".' },
              { number: 12, promptHtml: 'The 1866 cholera outbreak affected an area that already had new sewers.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 7: it was in an area "that had not yet been connected to the new sewers".' },
              { number: 13, promptHtml: 'The authorities who built the sewers understood that cholera was spread by water.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 7: they "believed [the smell] was the cause of disease".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'How habits are made',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>Much of what we do every day happens without conscious thought. We brush our teeth, lock the door, check our phones and follow the same route to work, often without remembering afterwards that we did so. The psychologist Wendy Wood, who asked volunteers to record their thoughts and actions at regular intervals throughout the day, found that around 43 per cent of their daily behaviour was performed almost automatically, while they were thinking about something else. Habits, in other words, make up a large part of our lives.</p>" },
          { label: 'B', html: "<p>From the brain's point of view, habits are a way of saving effort. When we first learn a task, such as driving a car, it requires close attention, and activity is high in the parts of the brain responsible for planning and decision-making. With repetition, control gradually shifts to deeper structures known as the basal ganglia. The neuroscientist Ann Graybiel, recording the brain activity of rats learning to find chocolate in a maze, found that as the animals became familiar with the route, activity became concentrated at the beginning and end of the run, while the middle section was performed on 'autopilot'.</p>" },
          { label: 'C', html: "<p>Researchers commonly describe habits as having three parts: a cue, which triggers the behaviour; the behaviour itself; and a reward, which makes it more likely to be repeated. The cue might be a time of day, a place, a feeling or the presence of other people. This model was popularised by the journalist Charles Duhigg in a best-selling book, and it helps to explain why habits are so hard to break: the cue continues to appear, and each time it does, the old behaviour is triggered almost immediately.</p>" },
          { label: 'D', html: "<p>How long does it take to form a new habit? A popular claim is that it takes twenty-one days, but this figure has little scientific basis. In a study by Phillippa Lally and her colleagues, volunteers chose a new healthy behaviour, such as drinking a glass of water after breakfast or going for a run before dinner, and recorded each day how automatic it felt. On average, it took sixty-six days for the behaviour to reach its maximum level of automaticity, but the range was enormous, from eighteen days to more than eight months, depending on the person and the behaviour. Missing a single day did not seriously affect the process.</p>" },
          { label: 'E', html: "<p>Since willpower is limited, many researchers argue that the key to changing behaviour is not trying harder but changing the environment. People who successfully eat less unhealthy food, for example, tend not to resist temptation more often; they simply encounter it less often, because they do not keep such food at home. Wood has shown that habits are closely tied to context, which is why major life changes, such as moving house or starting a new job, offer a valuable opportunity to form new habits: the old cues have disappeared.</p>" },
          { label: 'F', html: "<p>Another effective technique is to link a new behaviour to a specific situation in advance. The psychologist Peter Gollwitzer has shown that people who form plans of the type 'When situation X arises, I will do Y' are much more likely to carry out their intentions than those who simply decide to do something. Such plans work because they create an artificial cue, so that the decision has already been made before the situation occurs.</p>" },
          { label: 'G', html: "<p>Other researchers have focused on making desirable behaviour more attractive. The economist Katy Milkman tested an approach she called 'temptation bundling', in which people allowed themselves to enjoy something they liked, such as listening to a gripping audiobook, only while doing something they tended to avoid, such as exercising. Participants who were given this arrangement visited the gym significantly more often, although the effect weakened after a holiday interrupted the routine.</p>" },
          { label: 'H', html: "<p>The Stanford researcher B.J. Fogg recommends starting with behaviour so small that it requires almost no motivation, for example doing two press-ups after brushing one's teeth, and allowing it to grow naturally over time. Critics point out that much of the popular advice about habits goes further than the evidence supports. Nevertheless, there is broad agreement on one central point: lasting change depends less on strong determination than on repetition in a stable context, until the behaviour no longer requires a decision at all.</p>" },
        ],
        questionGroups: [
          {
            id: 't44-r2-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Habits and the brain</strong></p><p>When we first learn a task, the areas of the brain used for planning and {{q14}} are very active. After repetition, the {{q15}} take control. In a study of rats in a maze, brain activity was highest at the start and end of the route, while the middle was done on {{q16}}. A habit has three parts: a cue, the behaviour and a {{q17}}. The popular belief that habits take {{q18}} to form is not supported by research.</p>',
            questions: [
              { number: 14, answer: { accepted: ['decision-making', 'decision making'] }, explanationHtml: 'Paragraph B: "the parts of the brain responsible for planning and decision-making".', locatorParagraph: 'B' },
              { number: 15, answer: { accepted: ['basal ganglia'] }, explanationHtml: 'Paragraph B: "control gradually shifts to deeper structures known as the basal ganglia".', locatorParagraph: 'B' },
              { number: 16, answer: { accepted: ['autopilot'] }, explanationHtml: 'Paragraph B: "the middle section was performed on \'autopilot\'".', locatorParagraph: 'B' },
              { number: 17, answer: { accepted: ['reward'] }, explanationHtml: 'Paragraph C: "a cue ... the behaviour itself; and a reward".', locatorParagraph: 'C' },
              { number: 18, answer: { accepted: ['twenty-one days', '21 days'] }, explanationHtml: 'Paragraph D: "A popular claim is that it takes twenty-one days, but this figure has little scientific basis."', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't44-r2-people',
            type: 'matching_features',
            instructionHtml: 'Look at the following findings and the list of people below. Match each finding with the correct person, <strong>A-G</strong>.',
            bank: [
              { key: 'A', text: 'Wendy Wood' },
              { key: 'B', text: 'Ann Graybiel' },
              { key: 'C', text: 'Charles Duhigg' },
              { key: 'D', text: 'Phillippa Lally' },
              { key: 'E', text: 'Peter Gollwitzer' },
              { key: 'F', text: 'Katy Milkman' },
              { key: 'G', text: 'B.J. Fogg' },
            ],
            questions: [
              { number: 19, promptHtml: 'Combining a pleasant activity with an unpleasant one can increase motivation.', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph G: Milkman\'s "temptation bundling".', locatorParagraph: 'G' },
              { number: 20, promptHtml: 'Deciding in advance what to do in a particular situation makes action more likely.', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph F: Gollwitzer\'s "When situation X arises, I will do Y" plans.', locatorParagraph: 'F' },
              { number: 21, promptHtml: 'The time needed to form a habit varies widely between people.', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: Lally\'s study found "the range was enormous".', locatorParagraph: 'D' },
              { number: 22, promptHtml: 'A large proportion of everyday actions are carried out automatically.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: Wood found "around 43 per cent of their daily behaviour was performed almost automatically".', locatorParagraph: 'A' },
            ],
          },
          {
            id: 't44-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              { number: 23, promptHtml: 'a reason why moving to a new home may help people change their habits', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: major life changes are an opportunity because "the old cues have disappeared".', locatorParagraph: 'E' },
              { number: 24, promptHtml: 'a warning that some popular advice is not based on strong evidence', answer: { accepted: ['H'] }, explanationHtml: 'Paragraph H: "much of the popular advice about habits goes further than the evidence supports".', locatorParagraph: 'H' },
              { number: 25, promptHtml: 'an explanation of why bad habits are difficult to stop', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: "it helps to explain why habits are so hard to break".', locatorParagraph: 'C' },
              { number: 26, promptHtml: 'a finding that occasionally failing to perform a behaviour does little harm', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: "Missing a single day did not seriously affect the process."', locatorParagraph: 'D' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Rethinking homework',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Few aspects of school life cause as much conflict in family homes as homework. Parents argue with children about when to do it, children complain that they have too much, and teachers find themselves marking work that may or may not have been completed by the pupils whose names are on it. Yet the practice is so deeply established that most people rarely stop to ask whether it actually works. For older secondary school students, the evidence suggests that it generally does. For young children in primary school, the picture is very different.</p>" },
          { label: '', html: "<p>The most frequently cited reviews of research, which combine the results of many individual studies, have found a clear positive relationship between homework and achievement in the later years of secondary school, where students are preparing for important examinations and need to practise independently. In primary school, however, the relationship is weak and in some studies almost non-existent. Children who do more homework at the age of seven or eight do not, on average, perform noticeably better than those who do less.</p>" },
          { label: '', html: "<p>There are several reasons why this might be. Young children have a limited ability to concentrate for long periods and to organise their own work, skills that develop with age. Much primary homework consists of worksheets or projects that repeat what has been done in class without deepening understanding. And because young children usually need help, the outcome often depends less on the child than on the parent, which means that homework may increase the gap between children whose parents have the time and knowledge to help and those whose parents do not.</p>" },
          { label: '', html: "<p>In my view, this last point is the most serious objection to homework in the early years. Schools spend a great deal of effort trying to give every child an equal chance, and then send work home where the conditions could hardly be more unequal. One child has a quiet room, a computer and a parent who is a teacher; another shares a crowded flat with younger siblings and a parent who works in the evenings. To grade the homework of these two children as if they had had the same opportunity seems to me fundamentally unfair.</p>" },
          { label: '', html: "<p>Supporters of homework argue that it has benefits beyond test scores. It teaches children to take responsibility for their own learning, they say, and helps to establish routines that will be valuable later on. It also gives parents a window into what their children are learning at school. These are reasonable points, but they do not require the kind of homework that is usually set. A child can develop responsibility by reading a book of his or her own choosing each evening, and parents can learn about school by talking to their children about their day. Neither of these requires worksheets, deadlines or marks, and neither is likely to end in tears at the kitchen table.</p>" },
          { label: '', html: "<p>Reading is, in fact, the one form of home learning for young children whose value is supported by strong evidence. Children who read regularly for pleasure make more progress not only in reading but in other subjects, and the benefits are greatest when the reading is enjoyable rather than compulsory. Several schools that have abolished traditional homework in the early years have replaced it with a simple expectation that children read, or are read to, every day.</p>" },
          { label: '', html: "<p>None of this means that primary homework should be banned. Occasional tasks that involve families in a meaningful way, such as interviewing a grandparent about their childhood or measuring the rooms of the house for a mathematics project, can be valuable and enjoyable. The problem is the routine setting of worksheets, often because parents expect it or because it is school policy, rather than because there is good reason to think it helps.</p>" },
          { label: '', html: "<p>Changing long-established practice is never easy, and schools that reduce homework sometimes face complaints from parents who worry that their children are not being challenged. These concerns deserve to be taken seriously, and schools need to explain the reasons for their decisions clearly. But the question should not be whether homework is traditional, or whether parents expect it. It should be whether it helps children learn, and for most young children, the honest answer appears to be: not very much.</p>" },
        ],
        questionGroups: [
          {
            id: 't44-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 27, promptHtml: 'According to the second paragraph, reviews of research show that homework', options: [{ key: 'A', text: 'is equally useful at all ages.' }, { key: 'B', text: 'is most useful for older students.' }, { key: 'C', text: 'has no benefit in secondary school.' }, { key: 'D', text: 'harms young children\'s progress.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: "a clear positive relationship ... in the later years of secondary school".' },
              { number: 28, promptHtml: 'Which reason is given for homework being less effective for young children?', options: [{ key: 'A', text: 'Teachers do not mark it carefully.' }, { key: 'B', text: 'It is usually too difficult.' }, { key: 'C', text: 'It often repeats classwork without developing it.' }, { key: 'D', text: 'Children forget to hand it in.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 3: worksheets "repeat what has been done in class without deepening understanding".' },
              { number: 29, promptHtml: 'The writer\'s main objection to homework for young children is that', options: [{ key: 'A', text: 'it takes time away from play.' }, { key: 'B', text: 'it causes arguments in families.' }, { key: 'C', text: 'children\'s home conditions are unequal.' }, { key: 'D', text: 'teachers have too much marking.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 4: "this last point is the most serious objection ... the conditions could hardly be more unequal".' },
              { number: 30, promptHtml: 'How does the writer respond to the argument that homework teaches responsibility?', options: [{ key: 'A', text: 'He rejects it completely.' }, { key: 'B', text: 'He says the same aim can be achieved in other ways.' }, { key: 'C', text: 'He says it is the most important benefit.' }, { key: 'D', text: 'He says it only applies to secondary students.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "These are reasonable points, but they do not require the kind of homework that is usually set."' },
              { number: 31, promptHtml: 'What have some schools done instead of traditional homework?', options: [{ key: 'A', text: 'introduced longer school days' }, { key: 'B', text: 'asked children to read every day' }, { key: 'C', text: 'set weekly projects' }, { key: 'D', text: 'offered homework clubs' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 6: they "replaced it with a simple expectation that children read, or are read to, every day".' },
            ],
          },
          {
            id: 't44-r3-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-G, below.',
            bank: [
              { key: 'A', text: 'is greater when it is enjoyable.' },
              { key: 'B', text: 'may depend more on parents than on children.' },
              { key: 'C', text: 'should be explained clearly by schools.' },
              { key: 'D', text: 'develops as children get older.' },
              { key: 'E', text: 'can be valuable if it involves families meaningfully.' },
              { key: 'F', text: 'is required by law in most countries.' },
              { key: 'G', text: 'is the main cause of stress in teenagers.' },
            ],
            questions: [
              { number: 32, promptHtml: 'The ability to concentrate and organise work', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 3: "skills that develop with age".' },
              { number: 33, promptHtml: 'The result of young children\'s homework', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "the outcome often depends less on the child than on the parent".' },
              { number: 34, promptHtml: 'The benefit of reading for pleasure', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 6: "the benefits are greatest when the reading is enjoyable".' },
              { number: 35, promptHtml: 'An occasional task such as interviewing a grandparent', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 7: tasks "that involve families in a meaningful way ... can be valuable".' },
              { number: 36, promptHtml: 'A decision to reduce homework', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 8: "schools need to explain the reasons for their decisions clearly".' },
            ],
          },
          {
            id: 't44-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 37, promptHtml: 'It is unfair to grade the homework of children from very different home environments in the same way.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 4: "seems to me fundamentally unfair".' },
              { number: 38, promptHtml: 'All homework for primary school children should be prohibited.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 7: "None of this means that primary homework should be banned."' },
              { number: 39, promptHtml: 'Parents who complain about reduced homework should be ignored.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 8: "These concerns deserve to be taken seriously".' },
              { number: 40, promptHtml: 'Children in private schools receive more homework than those in state schools.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not compare types of school.' },
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
        contextText: 'You will hear a woman phoning a catering company to order food for an office event.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good afternoon, Fresh Table Catering, Mark speaking." },
          { speaker: 'B', voice: 'zira', text: "Hello. I'm organising a lunch for my office, and I'd like to order some food. It's to say goodbye to a colleague who's retiring." },
          { speaker: 'A', voice: 'david', text: "Lovely. When is it?" },
          { speaker: 'B', voice: 'zira', text: "Next Friday, at one o'clock. There'll be about thirty people." },
          { speaker: 'A', voice: 'david', text: "And where should we deliver to?" },
          { speaker: 'B', voice: 'zira', text: "Our office is in the Grange Building, on the fourth floor. It's on Marlow Street, opposite the station." },
          { speaker: 'A', voice: 'david', text: "Is there a lift? Some of our trays are quite heavy." },
          { speaker: 'B', voice: 'zira', text: "Yes, there is. And the best place to park is at the back of the building, by the loading entrance." },
          { speaker: 'A', voice: 'david', text: "Great. Any special dietary needs?" },
          { speaker: 'B', voice: 'zira', text: "Two people are vegetarian, and one person has an allergy to nuts, so we need to be very careful about that." },
          { speaker: 'A', voice: 'david', text: "No problem. We label everything clearly. Now, we have three main menus. The first is the Sandwich menu. That includes a selection of sandwiches, crisps and fresh fruit. It's eight pounds fifty per person." },
          { speaker: 'B', voice: 'zira', text: "What's the second one?" },
          { speaker: 'A', voice: 'david', text: "That's the Buffet menu, which is twelve pounds. It includes sandwiches, but also hot dishes such as small pies, and salads. And it comes with dessert, usually a selection of cakes." },
          { speaker: 'B', voice: 'zira', text: "And the third?" },
          { speaker: 'A', voice: 'david', text: "The Deluxe menu. That's sixteen pounds per person. It's similar to the buffet, but with more expensive dishes, like smoked salmon, and it includes a waiter who serves the food and clears up afterwards." },
          { speaker: 'B', voice: 'zira', text: "I think the buffet would be best. Do you provide plates and cutlery?" },
          { speaker: 'A', voice: 'david', text: "Yes, they're included with all our menus. They're made from bamboo, so they can be composted afterwards." },
          { speaker: 'B', voice: 'zira', text: "Good. And we'd also like a cake for our colleague. Could you do one with a message on it?" },
          { speaker: 'A', voice: 'david', text: "Certainly. What would you like it to say?" },
          { speaker: 'B', voice: 'zira', text: "Just 'Happy Retirement, Graham'." },
          { speaker: 'A', voice: 'david', text: "That's fine. The cake is an extra twenty-five pounds. Now, we'll need a deposit to confirm the order. We ask for twenty per cent, and the rest is paid on delivery." },
        ],
        questionGroups: [
          {
            id: 't44-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Catering order</strong></p>' +
              '<p>Occasion: a colleague is {{q1}}<br/>Date: next {{q2}}, 1 pm; about 30 people<br/>Address: Grange Building, fourth floor, {{q3}} Street<br/>Parking: at the back, by the {{q4}} entrance<br/>Special needs: two vegetarians; one person allergic to {{q5}}<br/>Cake message: "Happy Retirement, {{q6}}"</p>',
            questions: [
              { number: 1, answer: { accepted: ['retiring'] }, explanationHtml: '"to say goodbye to a colleague who\'s retiring".' },
              { number: 2, answer: { accepted: ['friday'] }, explanationHtml: '"Next Friday, at one o\'clock."' },
              { number: 3, answer: { accepted: ['marlow'] }, explanationHtml: '"It\'s on Marlow Street".' },
              { number: 4, answer: { accepted: ['loading'] }, explanationHtml: '"at the back of the building, by the loading entrance".' },
              { number: 5, answer: { accepted: ['nuts'] }, explanationHtml: '"one person has an allergy to nuts".' },
              { number: 6, answer: { accepted: ['graham'] }, explanationHtml: '"Just \'Happy Retirement, Graham\'."' },
            ],
          },
          {
            id: 't44-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['Menu', 'Price per person', 'Includes'],
              [
                ['Sandwich', '£8.50', 'sandwiches, crisps and {{q7}}'],
                ['Buffet', '£12', 'sandwiches, hot dishes, salads and {{q8}}'],
                ['Deluxe', '£16', 'more expensive dishes and a {{q9}}'],
              ]
            ) + '<p>Plates and cutlery made from {{q10}}</p>',
            questions: [
              { number: 7, answer: { accepted: ['fruit'] }, explanationHtml: '"sandwiches, crisps and fresh fruit".' },
              { number: 8, answer: { accepted: ['dessert', 'cakes'] }, explanationHtml: '"it comes with dessert, usually a selection of cakes".' },
              { number: 9, answer: { accepted: ['waiter'] }, explanationHtml: '"it includes a waiter who serves the food".' },
              { number: 10, answer: { accepted: ['bamboo'] }, explanationHtml: '"They\'re made from bamboo".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the manager of a newly restored outdoor swimming pool being interviewed on local radio.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "This morning I'm joined by Richard Lowe, manager of the Parkfield Lido, the outdoor swimming pool that reopens next week after twenty years. Richard, why did it close in the first place?" },
          { speaker: 'B', voice: 'david', text: "People often think it was because visitor numbers fell, but actually it was quite popular right up to the end. The problem was the cost of repairs. The pool was leaking badly, and the council at the time decided it couldn't afford to fix it." },
          { speaker: 'A', voice: 'zira', text: "So how did it come to be reopened?" },
          { speaker: 'B', voice: 'david', text: "It was entirely due to a group of local residents, who started a campaign about ten years ago. They raised money, applied for grants and eventually persuaded the council to hand the lido over to a charity, which now runs it." },
          { speaker: 'A', voice: 'zira', text: "What's changed since it last opened?" },
          { speaker: 'B', voice: 'david', text: "The pool itself is the same size, fifty metres, and we've kept the original changing cabins, which are a listed building. But the big difference is that the water is now heated, using solar panels on the roof of the café. It'll be kept at around twenty-four degrees." },
          { speaker: 'A', voice: 'zira', text: "Will it be open all year?" },
          { speaker: 'B', voice: 'david', text: "That was the plan, but in the end we decided to open from April to October only, at least for the first year. Winter swimming is becoming popular, so we may extend it later." },
          { speaker: 'A', voice: 'zira', text: "What about prices?" },
          { speaker: 'B', voice: 'david', text: "A single swim is five pounds for adults. Children under five are free, and we have reduced prices for students and people over sixty." },
          { speaker: 'A', voice: 'zira', text: "Tell us about the different sessions." },
          { speaker: 'B', voice: 'david', text: "We open at six thirty in the morning, and from then until nine it's lane swimming only, for people who want to swim lengths before work. From nine until twelve, it's general swimming, open to everyone. Then from twelve until one, we have a session for parents with babies and toddlers, and we keep the water slightly warmer for that." },
          { speaker: 'B', voice: 'david', text: "The afternoon is general swimming again, and in the evening, from six until eight, there are lessons, with a qualified instructor, for adults who've never learned to swim. That's something we're particularly proud of." },
          { speaker: 'A', voice: 'zira', text: "And at weekends?" },
          { speaker: 'B', voice: 'david', text: "At weekends it's general swimming all day, but on Saturday evenings in summer we're going to show films on a big screen at the end of the pool. People can watch from the water or from deckchairs." },
          { speaker: 'A', voice: 'zira', text: "That sounds wonderful. Richard Lowe, thank you." },
        ],
        questionGroups: [
          {
            id: 't44-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 11, promptHtml: 'Why did the lido close twenty years ago?', options: [{ key: 'A', text: 'Too few people used it.' }, { key: 'B', text: 'Repairs were too expensive.' }, { key: 'C', text: 'The land was sold.' }], answer: { accepted: ['B'] }, explanationHtml: '"The problem was the cost of repairs."' },
              { number: 12, promptHtml: 'Who was mainly responsible for reopening the lido?', options: [{ key: 'A', text: 'local people' }, { key: 'B', text: 'the council' }, { key: 'C', text: 'a sports company' }], answer: { accepted: ['A'] }, explanationHtml: '"It was entirely due to a group of local residents".' },
              { number: 13, promptHtml: 'What is the main change to the lido?', options: [{ key: 'A', text: 'The pool is larger.' }, { key: 'B', text: 'The water is heated.' }, { key: 'C', text: 'There are new changing rooms.' }], answer: { accepted: ['B'] }, explanationHtml: '"the big difference is that the water is now heated".' },
              { number: 14, promptHtml: 'When will the lido be open this year?', options: [{ key: 'A', text: 'all year' }, { key: 'B', text: 'April to October' }, { key: 'C', text: 'June to September' }], answer: { accepted: ['B'] }, explanationHtml: '"we decided to open from April to October only".' },
              { number: 15, promptHtml: 'Who can swim free of charge?', options: [{ key: 'A', text: 'children under five' }, { key: 'B', text: 'students' }, { key: 'C', text: 'people over sixty' }], answer: { accepted: ['A'] }, explanationHtml: '"Children under five are free". Students and over-60s get reduced prices.' },
            ],
          },
          {
            id: 't44-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml: table(
              ['Time', 'Session', 'Notes'],
              [
                ['6.30-9.00', '{{q16}} only', 'for people swimming before work'],
                ['9.00-12.00', 'general swimming', 'open to everyone'],
                ['12.00-1.00', 'parents with babies and {{q17}}', 'water kept slightly {{q18}}'],
                ['6.00-8.00 pm', 'lessons for {{q19}}', 'qualified instructor'],
                ['Saturday evenings', 'general swimming', '{{q20}} shown on a big screen'],
              ]
            ),
            questions: [
              { number: 16, answer: { accepted: ['lane swimming'] }, explanationHtml: '"from then until nine it\'s lane swimming only".' },
              { number: 17, answer: { accepted: ['toddlers'] }, explanationHtml: '"a session for parents with babies and toddlers".' },
              { number: 18, answer: { accepted: ['warmer'] }, explanationHtml: '"we keep the water slightly warmer for that".' },
              { number: 19, answer: { accepted: ['adults', 'adult beginners'] }, explanationHtml: '"lessons ... for adults who\'ve never learned to swim".' },
              { number: 20, answer: { accepted: ['films'] }, explanationHtml: '"we\'re going to show films on a big screen".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Kate and Omar, planning a presentation about keeping bees in cities.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "OK, Omar, let's plan our presentation on urban beekeeping. What did you find most surprising in your research?" },
          { speaker: 'B', voice: 'david', text: "I think it was how many hives there are now on city rooftops. I had no idea it was so popular. And that city bees often produce more honey than bees in the countryside." },
          { speaker: 'A', voice: 'zira', text: "Yes, because of all the different flowers in gardens and parks, and fewer pesticides. That surprised me too. And I was surprised that some scientists think there are now too many hives in some cities." },
          { speaker: 'B', voice: 'david', text: "Because the honeybees compete with wild bees for flowers. Right. What do you think the audience will find most interesting?" },
          { speaker: 'A', voice: 'zira', text: "Probably the practical side, how you actually keep bees on a roof. And the idea that bees could be used to monitor pollution." },
          { speaker: 'B', voice: 'david', text: "Good. Now, what's our main argument going to be?" },
          { speaker: 'A', voice: 'zira', text: "I think we should argue that cities should focus on planting more flowers rather than adding more hives. That's what the evidence seems to support." },
          { speaker: 'B', voice: 'david', text: "Agreed. And how long have we got?" },
          { speaker: 'A', voice: 'zira', text: "Fifteen minutes, plus five for questions." },
          { speaker: 'B', voice: 'david', text: "OK. So let's go through each section and decide where the information will come from. The introduction, about the history of beekeeping in cities." },
          { speaker: 'A', voice: 'zira', text: "I found a very good documentary about that. It had some old film of beekeepers in Paris in the nineteenth century. We could show a short clip." },
          { speaker: 'B', voice: 'david', text: "Great. Then the section on how many hives there are now. I found some official figures in a government report, so let's use those." },
          { speaker: 'A', voice: 'zira', text: "Then the practical section, on how to keep bees on a roof. You interviewed that beekeeper, didn't you?" },
          { speaker: 'B', voice: 'david', text: "Yes, the one who manages hives on top of the hotel. I recorded the interview, so we could play some of it." },
          { speaker: 'A', voice: 'zira', text: "Perfect. And the section on competition with wild bees?" },
          { speaker: 'B', voice: 'david', text: "There's a recent scientific article about a study in London. It's quite technical, but I can summarise it." },
          { speaker: 'A', voice: 'zira', text: "And the pollution idea. I read about that in a newspaper article, about a project where they tested honey for traces of metals from traffic." },
          { speaker: 'B', voice: 'david', text: "Should we check the original study?" },
          { speaker: 'A', voice: 'zira', text: "I tried, but it wasn't published yet. So we'll have to say it's from the newspaper." },
          { speaker: 'B', voice: 'david', text: "And finally, public attitudes. We could do our own survey of students." },
          { speaker: 'A', voice: 'zira', text: "Yes, a short online questionnaire. We'll ask whether people would feel comfortable with hives near their homes." },
        ],
        questionGroups: [
          {
            id: 't44-l3-multi1',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 21,
                promptHtml: 'Which TWO facts surprised the students?',
                options: [
                  { key: 'A', text: 'City bees may produce more honey than country bees.' },
                  { key: 'B', text: 'Honey from cities is more expensive.' },
                  { key: 'C', text: 'There may be too many hives in some cities.' },
                  { key: 'D', text: 'Bees cannot survive on rooftops.' },
                  { key: 'E', text: 'Most beekeepers are young people.' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'Omar: city bees "often produce more honey"; Kate: "some scientists think there are now too many hives".',
              },
            ],
          },
          {
            id: 't44-l3-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 22,
                promptHtml: 'Which TWO topics does Kate think the audience will find most interesting?',
                options: [
                  { key: 'A', text: 'the history of beekeeping' },
                  { key: 'B', text: 'how to keep bees on a roof' },
                  { key: 'C', text: 'the price of honey' },
                  { key: 'D', text: 'using bees to monitor pollution' },
                  { key: 'E', text: 'types of wild bee' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"Probably the practical side, how you actually keep bees on a roof. And the idea that bees could be used to monitor pollution."',
              },
            ],
          },
          {
            id: 't44-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 23, promptHtml: 'What will be the main argument of the presentation?', options: [{ key: 'A', text: 'Cities should plant more flowers.' }, { key: 'B', text: 'Cities should ban beehives.' }, { key: 'C', text: 'Cities should encourage more hives.' }], answer: { accepted: ['A'] }, explanationHtml: '"cities should focus on planting more flowers rather than adding more hives".' },
              { number: 24, promptHtml: 'How long will the presentation itself last?', options: [{ key: 'A', text: '5 minutes' }, { key: 'B', text: '15 minutes' }, { key: 'C', text: '20 minutes' }], answer: { accepted: ['B'] }, explanationHtml: '"Fifteen minutes, plus five for questions."' },
            ],
          },
          {
            id: 't44-l3-sources',
            type: 'matching_features',
            instructionHtml:
              'What source will the students use for each section of the presentation? Choose <strong>SIX</strong> answers from the box and write the correct letter, A-G, next to Questions 25-30.',
            bank: [
              { key: 'A', text: 'an interview' },
              { key: 'B', text: 'a government report' },
              { key: 'C', text: 'a scientific article' },
              { key: 'D', text: 'a documentary' },
              { key: 'E', text: 'a newspaper article' },
              { key: 'F', text: 'their own survey' },
              { key: 'G', text: 'a textbook' },
            ],
            questions: [
              { number: 25, promptHtml: 'history of urban beekeeping', answer: { accepted: ['D'] }, explanationHtml: '"I found a very good documentary about that."' },
              { number: 26, promptHtml: 'number of hives', answer: { accepted: ['B'] }, explanationHtml: '"some official figures in a government report".' },
              { number: 27, promptHtml: 'keeping bees on a roof', answer: { accepted: ['A'] }, explanationHtml: '"I recorded the interview".' },
              { number: 28, promptHtml: 'competition with wild bees', answer: { accepted: ['C'] }, explanationHtml: '"a recent scientific article about a study in London".' },
              { number: 29, promptHtml: 'bees and pollution', answer: { accepted: ['E'] }, explanationHtml: '"we\'ll have to say it\'s from the newspaper".' },
              { number: 30, promptHtml: 'public attitudes', answer: { accepted: ['F'] }, explanationHtml: '"We could do our own survey of students."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about what happens to wind turbine blades at the end of their working life.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "In today's lecture on renewable energy, I want to look at a problem that has only recently begun to receive attention: what to do with wind turbines when they reach the end of their working life." },
          { speaker: 'A', voice: 'david', text: "A typical turbine is designed to last between twenty and twenty-five years. The first large wind farms were built in the nineteen nineties, so many turbines are now being taken down, and the number will rise sharply over the coming decades." },
          { speaker: 'A', voice: 'david', text: "Most parts of a turbine are fairly easy to deal with. The tower is made of steel, which can be recycled, and so can the copper in the generator. In fact, around eighty-five to ninety per cent of a turbine by weight can already be recycled. The problem is the blades." },
          { speaker: 'A', voice: 'david', text: "Blades need to be light, strong and flexible, and to survive decades of wind and rain. To achieve this, they're made from a composite material: fibres of glass or carbon held together by a type of plastic resin. The two components are bonded so tightly that it's very difficult and expensive to separate them." },
          { speaker: 'A', voice: 'david', text: "Until recently, most old blades were simply buried in landfill sites. They're very large, often more than fifty metres long, so they have to be cut into sections before they can even be transported. And they don't break down in the ground. Several European countries have now banned blades from landfill, which has forced the industry to look for alternatives." },
          { speaker: 'A', voice: 'david', text: "One approach is to grind blades into small pieces and use them in cement production. The glass fibres replace some of the sand, and the resin is burned as fuel in the cement kilns. This is the most common method at the moment, but it's not really recycling in the full sense, because the valuable fibres are lost." },
          { speaker: 'A', voice: 'david', text: "Another approach is to reuse whole blades or large sections in new structures. In Denmark and the Netherlands, old blades have been used to make bicycle shelters, and there's a bridge in Ireland built from blades. In some cities, they've been turned into playground equipment. These projects are attractive, but they can only use a small fraction of the blades being removed." },
          { speaker: 'A', voice: 'david', text: "The long-term solution is probably to design blades differently from the start. Several manufacturers have now developed blades using a new type of resin that can be dissolved at the end of the blade's life, allowing the fibres to be recovered and used again. Another company has produced a blade made from wood, which is lighter than expected and can be recycled more easily." },
          { speaker: 'A', voice: 'david', text: "Of course, these new designs will only make a difference to turbines built from now on. For the blades already in use, the challenge will remain for many years. But it's worth putting the problem in perspective. The total amount of blade waste is small compared with, say, the waste from coal power stations, and it doesn't undermine the environmental case for wind energy. It is, however, a reminder that sustainability means thinking about the whole life of a product, including what happens when it's no longer needed." },
        ],
        questionGroups: [
          {
            id: 't44-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'How long is a typical wind turbine designed to last?', options: [{ key: 'A', text: '10-15 years' }, { key: 'B', text: '20-25 years' }, { key: 'C', text: '30-35 years' }], answer: { accepted: ['B'] }, explanationHtml: '"designed to last between twenty and twenty-five years".' },
              { number: 32, promptHtml: 'What proportion of a turbine can already be recycled?', options: [{ key: 'A', text: 'about half' }, { key: 'B', text: 'about three quarters' }, { key: 'C', text: 'up to 90 per cent' }], answer: { accepted: ['C'] }, explanationHtml: '"around eighty-five to ninety per cent of a turbine by weight can already be recycled".' },
              { number: 33, promptHtml: 'Why are blades difficult to recycle?', options: [{ key: 'A', text: 'Their materials are hard to separate.' }, { key: 'B', text: 'They contain dangerous chemicals.' }, { key: 'C', text: 'They are made of many different metals.' }], answer: { accepted: ['A'] }, explanationHtml: '"The two components are bonded so tightly that it\'s very difficult and expensive to separate them."' },
            ],
          },
          {
            id: 't44-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Dealing with old turbine blades</strong></p>' +
              '<p><em>Landfill</em><br/>• blades must be cut up before {{q34}}<br/>• now {{q35}} in several European countries</p>' +
              '<p><em>Cement production</em><br/>• glass fibres replace some of the {{q36}}; the resin is used as fuel</p>' +
              '<p><em>Reuse</em><br/>• bicycle shelters, a {{q37}} in Ireland, and playground equipment</p>' +
              '<p><em>New designs</em><br/>• a resin that can be {{q38}} so fibres can be recovered<br/>• blades made of {{q39}}</p>' +
              '<p><em>Conclusion</em><br/>• sustainability means considering the whole {{q40}} of a product</p>',
            questions: [
              { number: 34, answer: { accepted: ['transport', 'transporting'] }, explanationHtml: '"they have to be cut into sections before they can even be transported".' },
              { number: 35, answer: { accepted: ['banned'] }, explanationHtml: '"Several European countries have now banned blades from landfill".' },
              { number: 36, answer: { accepted: ['sand'] }, explanationHtml: '"The glass fibres replace some of the sand".' },
              { number: 37, answer: { accepted: ['bridge'] }, explanationHtml: '"there\'s a bridge in Ireland built from blades".' },
              { number: 38, answer: { accepted: ['dissolved'] }, explanationHtml: '"a new type of resin that can be dissolved".' },
              { number: 39, answer: { accepted: ['wood'] }, explanationHtml: '"a blade made from wood".' },
              { number: 40, answer: { accepted: ['life'] }, explanationHtml: '"thinking about the whole life of a product".' },
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
        '<p>The graph below shows average house prices in three cities between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'Average house prices, 2000-2020 (thousands of dollars)',
        unit: 'thousand $',
        categories: ['2000', '2004', '2008', '2012', '2016', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Price (thousands of dollars)',
        series: [
          { name: 'City A', data: [180, 260, 310, 280, 390, 470] },
          { name: 'City B', data: [120, 150, 190, 170, 200, 240] },
          { name: 'City C', data: [90, 100, 135, 140, 180, 260] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people believe that longer prison sentences are the best way to reduce crime. Others think that there are better ways of reducing crime.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
