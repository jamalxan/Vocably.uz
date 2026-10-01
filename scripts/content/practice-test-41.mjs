// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-41',
  title: 'Vocably Practice Test 41',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The frozen water trade',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>Today, ice is so easy to produce that it is hard to imagine it was once a luxury. Yet for most of human history, people living in warm climates had no way of keeping food cold or cooling a drink in summer. Wealthy households in some northern countries stored winter ice in underground ice houses, packed in straw, but this was only possible where winters were cold. At the beginning of the nineteenth century, a young man from Boston, in the north-east of the United States, came up with an idea that most people considered absurd: cutting ice from frozen lakes in New England and shipping it thousands of kilometres to the tropics.</p>" },
          { label: '', html: "<p>His name was Frederic Tudor, and his first attempt, in 1806, was a financial disaster. He sent a ship loaded with ice to the Caribbean island of Martinique, where the cargo arrived largely intact. The problem was that nobody there knew what to do with it. There were no ice houses to store it in, and customers had never used ice before, so most of it simply melted before it could be sold. Over the following years Tudor lost so much money that he was briefly imprisoned for debt.</p>" },
          { label: '', html: "<p>Tudor did not give up. He realised that he needed to create demand as well as supply, and he began to build insulated ice houses in the ports he traded with. He also set about teaching people how to use his product. Bar owners were given free ice for a period so that customers could become used to cold drinks, and once they had tasted them, they were unwilling to go back. Tudor showed hospitals how ice could be used to lower the temperature of patients with fever, and he encouraged cooks to make ice cream.</p>" },
          { label: '', html: "<p>Just as important were improvements in the way ice was handled. Tudor experimented with different materials for keeping ice from melting during long voyages and found that sawdust, which timber mills in New England produced in huge quantities and usually threw away, was cheap and extremely effective. Packed tightly between blocks of ice, it reduced losses on a voyage to a fraction of what they had been. The trade therefore made use of two things that had no value at all in New England: winter ice and the waste from sawmills.</p>" },
          { label: '', html: "<p>The work of cutting ice was transformed in 1825 by one of Tudor's suppliers, Nathaniel Wyeth, who invented a cutter pulled by horses. Two parallel blades cut grooves across the frozen surface of a lake, producing a grid of identical blocks. Before this, ice had been cut by hand with saws and axes into irregular pieces that were difficult to pack. Uniform blocks could be stacked closely together, leaving less air between them, which further reduced melting.</p>" },
          { label: '', html: "<p>The most remarkable voyage took place in 1833, when a ship carrying around 180 tonnes of ice sailed from Boston to Calcutta, in India, a journey of about four months that crossed the equator twice. Roughly a hundred tonnes survived. The ice caused a sensation among the British community in the city, who paid for the construction of an ice house to store future shipments, and India remained one of Tudor's most profitable markets for several decades.</p>" },
          { label: '', html: "<p>By the middle of the century, ice had become an industry. Other businesses copied Tudor's methods, lakes near cities across the northern United States were harvested every winter, and ice was delivered daily to homes in cities such as New York, where it was used in wooden cabinets known as iceboxes to keep food fresh. The trade employed tens of thousands of workers, and in some years more than a million tonnes were harvested around Boston alone. In Europe, Norway became a major exporter, shipping ice from its lakes and fjords to Britain.</p>" },
          { label: '', html: "<p>The decline of the natural ice trade came with the development of mechanical refrigeration. Machines that could produce ice artificially were invented in the middle of the nineteenth century, but for many years they were expensive and unreliable. As they improved, they gained an important advantage: artificial ice could be made from clean water, whereas natural ice harvested from lakes near growing cities was increasingly polluted. By the 1930s, the electric refrigerator was becoming common in homes, and the business that Tudor had built, once dismissed as a foolish dream, had almost completely disappeared.</p>" },
        ],
        questionGroups: [
          {
            id: 't41-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'Most of the ice on Tudor\'s first shipment melted during the voyage.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "the cargo arrived largely intact"; it melted afterwards because it could not be stored or sold.' },
              { number: 2, promptHtml: 'Tudor was sent to prison because of his debts.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: "he was briefly imprisoned for debt".' },
              { number: 3, promptHtml: 'Tudor charged bar owners a reduced price for ice at first.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: "Bar owners were given free ice for a period".' },
              { number: 4, promptHtml: 'Wyeth was paid a large sum for his invention.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 5 describes the invention but not any payment.' },
              { number: 5, promptHtml: 'Artificial ice was cleaner than much of the ice taken from lakes.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 8: artificial ice was made from clean water, while natural ice "was increasingly polluted".' },
            ],
          },
          {
            id: 't41-r1-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 6, promptHtml: 'What material was ice packed in when stored in traditional ice houses?', answer: { accepted: ['straw'] }, explanationHtml: 'Paragraph 1: winter ice "packed in straw".' },
              { number: 7, promptHtml: 'Which medical condition did Tudor show that ice could help to treat?', answer: { accepted: ['fever'] }, explanationHtml: 'Paragraph 3: "to lower the temperature of patients with fever".' },
              { number: 8, promptHtml: 'What waste material did Tudor use to stop ice melting on voyages?', answer: { accepted: ['sawdust'] }, explanationHtml: 'Paragraph 4: "sawdust ... was cheap and extremely effective".' },
            ],
          },
          {
            id: 't41-r1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Date', 'Event', 'Details'],
              [
                ['1806', 'first shipment of ice', 'sent to {{q9}}'],
                ['1825', 'invention of a new ice cutter', 'pulled by {{q10}}; produced blocks of the same size'],
                ['1833', 'voyage to India', 'about {{q11}} tonnes of ice survived'],
                ['mid-1800s', 'ice delivered to homes', 'kept in {{q12}} to preserve food'],
                ['1930s', 'natural ice trade disappears', 'electric {{q13}} common in homes'],
              ]
            ),
            questions: [
              { number: 9, answer: { accepted: ['martinique'] }, explanationHtml: 'Paragraph 2: "He sent a ship loaded with ice to the Caribbean island of Martinique".' },
              { number: 10, answer: { accepted: ['horses'] }, explanationHtml: 'Paragraph 5: "a cutter pulled by horses".' },
              { number: 11, answer: { accepted: ['100', 'hundred'] }, explanationHtml: 'Paragraph 6: "Roughly a hundred tonnes survived."' },
              { number: 12, answer: { accepted: ['iceboxes'] }, explanationHtml: 'Paragraph 7: "wooden cabinets known as iceboxes".' },
              { number: 13, answer: { accepted: ['refrigerator', 'refrigerators'] }, explanationHtml: 'Paragraph 8: "the electric refrigerator was becoming common in homes".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Tiny forests in big cities',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>In a growing number of cities around the world, small patches of land that were once lawns, car parks or waste ground are being turned into dense miniature forests. Some are no larger than a tennis court. Planted by volunteers and schoolchildren, often in a single weekend, they are promoted as a way to bring nature back into urban areas, to cool streets in hot weather and to provide homes for wildlife. The idea has spread rapidly across Europe, Asia and South America in the past decade.</p>" },
          { label: 'B', html: "<p>The method behind most of these forests was developed by the Japanese botanist Akira Miyawaki, who spent decades studying the natural vegetation of Japan. He noticed that the ancient forests surviving around temples and shrines contained a very different mix of trees from the plantations of pine and cedar that covered much of the countryside. He concluded that the native species that would naturally grow in a particular place were better adapted to its conditions than the trees people had chosen to plant, and that forests made up of them would be more resilient.</p>" },
          { label: 'C', html: "<p>A Miyawaki forest is planted in a way that seems at first to contradict normal forestry practice. Rather than spacing trees widely, planters place three to five young trees in every square metre, choosing from twenty or more native species, including shrubs as well as tall trees. The ground is first dug deeply and enriched with organic material, and after planting it is covered with a thick layer of straw or leaves to keep moisture in. The trees are watered and weeded for the first two or three years; after that, the forest is expected to look after itself.</p>" },
          { label: 'D', html: "<p>Because the young trees are so close together, they compete fiercely for light, and this, supporters say, makes them grow unusually fast. Claims made for the method are often dramatic: it is sometimes said that such forests grow ten times faster than conventional plantations and support a hundred times more biodiversity. Researchers who have examined these figures, however, point out that they are rarely based on careful measurement, and that the comparisons are often made with poorly managed plantations rather than with natural woodland.</p>" },
          { label: 'E', html: "<p>Some of the most detailed studies come from the Netherlands, where an environmental organisation has planted more than two hundred tiny forests since 2015, many of them next to schools. Scientists monitoring the sites have found that they attract a wide range of insects, birds and small mammals, and that the number of species increases steadily over the first few years. The forests have also proved popular with local residents, who often take part in planting and in regular surveys of wildlife.</p>" },
          { label: 'F', html: "<p>Not all the results have been positive. Close planting inevitably means that many trees die as the forest develops, and in some projects the proportion that survived was much lower than expected, particularly where there was no one responsible for watering during dry summers. In very hot or dry climates, the method may require large amounts of water in the early years, which can make it expensive to maintain.</p>" },
          { label: 'G', html: "<p>There are also questions about the effect of such small forests on the climate. Supporters sometimes present them as a means of absorbing carbon dioxide, but a forest the size of a tennis court can only store a tiny amount compared with the emissions of a city. Most researchers agree that their real benefits are local: shade, cooler air, reduced noise, better absorption of rainwater, and places where children can experience nature at first hand.</p>" },
          { label: 'H', html: "<p>For city authorities, one of the attractions of tiny forests is that they fit into spaces too small for a conventional park. In densely built areas, where land is extremely valuable, a strip of ground beside a road or at the edge of a playground may be the only space available. Some cities have begun to include tiny forests in their official plans for adapting to hotter summers, alongside larger parks and street trees.</p>" },
          { label: 'I', html: "<p>The enthusiasm for tiny forests has sometimes run ahead of the evidence, and critics warn that they should not become a distraction from protecting existing woodland, which is far richer in wildlife than any newly planted site. Yet few would deny that they have succeeded in one important respect. By involving thousands of people in planting and caring for trees, they have given many city dwellers a new sense of connection to the natural world on their own doorstep.</p>" },
        ],
        questionGroups: [
          {
            id: 't41-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has nine paragraphs, A-I. Choose the correct heading for paragraphs B-I from the list of headings below.<br/><em>Example: Paragraph A — iii</em>',
            bank: [
              { key: 'i', text: 'Doubts about impressive figures' },
              { key: 'ii', text: 'The origins of a method' },
              { key: 'iv', text: 'A solution for crowded urban areas' },
              { key: 'v', text: 'An unusual approach to planting' },
              { key: 'vi', text: 'Evidence from a long-term programme' },
              { key: 'vii', text: 'The true value of tiny forests' },
              { key: 'viii', text: 'Problems with survival and cost' },
              { key: 'ix', text: 'A balanced final assessment' },
              { key: 'x', text: 'Government funding for tree planting' },
              { key: 'xi', text: 'Choosing the right trees for a garden' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph B', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph B describes how Miyawaki developed the method.', locatorParagraph: 'B' },
              { number: 15, promptHtml: 'Paragraph C', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph C: planting "seems at first to contradict normal forestry practice".', locatorParagraph: 'C' },
              { number: 16, promptHtml: 'Paragraph D', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph D: the dramatic claims "are rarely based on careful measurement".', locatorParagraph: 'D' },
              { number: 17, promptHtml: 'Paragraph E', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph E: detailed studies of more than two hundred forests in the Netherlands since 2015.', locatorParagraph: 'E' },
              { number: 18, promptHtml: 'Paragraph F', answer: { accepted: ['viii'] }, explanationHtml: 'Paragraph F: many trees die, and watering can make it "expensive to maintain".', locatorParagraph: 'F' },
              { number: 19, promptHtml: 'Paragraph G', answer: { accepted: ['vii'] }, explanationHtml: 'Paragraph G: "their real benefits are local".', locatorParagraph: 'G' },
              { number: 20, promptHtml: 'Paragraph H', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph H: they "fit into spaces too small for a conventional park" in densely built areas.', locatorParagraph: 'H' },
              { number: 21, promptHtml: 'Paragraph I', answer: { accepted: ['ix'] }, explanationHtml: 'Paragraph I weighs the criticism against their success in involving people.', locatorParagraph: 'I' },
            ],
          },
          {
            id: 't41-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 22, promptHtml: 'Miyawaki studied forests that had survived near religious buildings.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph B: "the ancient forests surviving around temples and shrines".', locatorParagraph: 'B' },
              { number: 23, promptHtml: 'A Miyawaki forest needs care for at least ten years after planting.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph C: it is cared for "for the first two or three years; after that, the forest is expected to look after itself".', locatorParagraph: 'C' },
              { number: 24, promptHtml: 'Most of the tiny forests in the Netherlands were paid for by schools.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph E says many are next to schools, but not who paid for them.', locatorParagraph: 'E' },
              { number: 25, promptHtml: 'Tiny forests can make a significant contribution to reducing a city\'s carbon emissions.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph G: such a forest "can only store a tiny amount compared with the emissions of a city".', locatorParagraph: 'G' },
              { number: 26, promptHtml: 'Critics fear that tiny forests may draw attention away from protecting older woodland.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph I: "they should not become a distraction from protecting existing woodland".', locatorParagraph: 'I' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'The art of forgetting',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>We tend to think of forgetting as a failure. We are annoyed when we cannot remember a name, anxious when we lose track of an appointment, and afraid of the memory loss that can come with old age. Popular books and apps promise to 'train' our memories, and people who can recite long lists of numbers are treated almost as heroes. The assumption behind all this is that a perfect memory would be a wonderful thing, and that every forgotten fact represents something lost. I want to suggest that this assumption is mistaken.</p>" },
          { label: '', html: "<p>Consider, first, what a perfect memory would actually be like. There are a small number of people who remember almost every day of their lives in extraordinary detail: what they ate, what the weather was like, what they were wearing. When asked about their ability, many describe it as more of a burden than a gift. They cannot stop the past from returning, and painful experiences remain as vivid as the day they happened. Some say that they find it hard to concentrate on the present because their minds are constantly pulled back to earlier events.</p>" },
          { label: '', html: "<p>For the rest of us, forgetting performs an essential function. The world presents us with vast amounts of information, most of which is irrelevant: the colour of a stranger's coat, the number of a bus we will never take again. If we stored all of it, the useful memories would be buried among the useless ones, and finding what we need would take far longer. Forgetting, in other words, is a kind of filtering, and it allows us to concentrate on what matters. Researchers have found that people who are good at suppressing irrelevant memories are often better at recalling important ones.</p>" },
          { label: '', html: "<p>Forgetting also helps us to update our knowledge. Our circumstances change constantly: we move house, change jobs, and replace old passwords with new ones. If the old information remained as strong as the new, we would constantly confuse the two. Studies with animals have shown that the brain actively weakens connections that are no longer used, a process that appears to be as important for learning as the strengthening of new connections. Forgetting is not simply the passive fading of memory; it is, at least in part, something the brain does deliberately.</p>" },
          { label: '', html: "<p>Perhaps most interestingly, forgetting allows us to generalise. A child who remembered every individual dog in perfect detail might struggle to understand what all dogs have in common. By losing the details, we keep the general pattern, and this is what allows us to recognise a dog we have never seen before. Computer scientists working on artificial intelligence have found something similar: systems that are designed to 'forget' some of the details of the examples they learn from are often better at dealing with new situations.</p>" },
          { label: '', html: "<p>None of this is to say that all forgetting is good. Memory loss caused by illness is a tragedy, and forgetting important information at work or in an examination can have serious consequences. But these cases should not lead us to conclude that the ideal memory is one that keeps everything. What we should want is a memory that keeps what is useful and lets go of what is not, and that is, for most people most of the time, exactly what we already have.</p>" },
          { label: '', html: "<p>This has practical implications. Much of the anxiety people feel about their memories is unnecessary. Forgetting where you put your keys is not a sign that something is wrong; it is a sign that your brain did not consider the location of your keys worth recording. Rather than trying to remember everything, we would do better to use notes, calendars and other external aids for routine information, and save our mental effort for the things that really deserve it.</p>" },
          { label: '', html: "<p>The same principle applies to education. For generations, students have been required to memorise large quantities of facts, many of which are forgotten soon after the examination. Teachers would do well to accept that forgetting is inevitable and to concentrate instead on helping students to understand principles and to know where to find information when they need it. Understanding, unlike isolated facts, tends to last, precisely because it is built on the general patterns that forgetting leaves behind.</p>" },
        ],
        questionGroups: [
          {
            id: 't41-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 27, promptHtml: 'In the first paragraph, the writer suggests that people generally', options: [{ key: 'A', text: 'underestimate how much they forget.' }, { key: 'B', text: 'believe a perfect memory would be desirable.' }, { key: 'C', text: 'do not trust memory-training apps.' }, { key: 'D', text: 'are unaware of age-related memory loss.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 1: "The assumption behind all this is that a perfect memory would be a wonderful thing".' },
              { number: 28, promptHtml: 'What do many people with exceptional memories say about their ability?', options: [{ key: 'A', text: 'It helps them in their careers.' }, { key: 'B', text: 'It can be trained in others.' }, { key: 'C', text: 'It causes them difficulties.' }, { key: 'D', text: 'It fades as they grow older.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 2: "many describe it as more of a burden than a gift".' },
              { number: 29, promptHtml: 'The writer mentions a stranger\'s coat as an example of', options: [{ key: 'A', text: 'information that is not worth remembering.' }, { key: 'B', text: 'a detail that is easy to recall.' }, { key: 'C', text: 'something people with good memories notice.' }, { key: 'D', text: 'a memory that returns unexpectedly.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: examples of information that "is irrelevant".' },
              { number: 30, promptHtml: 'What have studies with animals shown?', options: [{ key: 'A', text: 'Animals forget more quickly than humans.' }, { key: 'B', text: 'Forgetting is an active process in the brain.' }, { key: 'C', text: 'New connections replace old ones instantly.' }, { key: 'D', text: 'Animals cannot update what they have learned.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 4: "the brain actively weakens connections that are no longer used".' },
            ],
          },
          {
            id: 't41-r3-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-G, below.',
            bank: [
              { key: 'A', text: 'may be better at recalling important memories.' },
              { key: 'B', text: 'can deal more effectively with new situations.' },
              { key: 'C', text: 'is a sign that the brain chose not to record it.' },
              { key: 'D', text: 'should be kept in external aids such as calendars.' },
              { key: 'E', text: 'tends to be remembered for longer than isolated facts.' },
              { key: 'F', text: 'must be memorised before an examination.' },
              { key: 'G', text: 'makes it harder to form new friendships.' },
            ],
            questions: [
              { number: 31, promptHtml: 'People who can suppress irrelevant memories', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: they "are often better at recalling important ones".' },
              { number: 32, promptHtml: 'Computer systems designed to lose some details', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: they "are often better at dealing with new situations".' },
              { number: 33, promptHtml: 'Forgetting where you have left your keys', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 7: "your brain did not consider the location of your keys worth recording".' },
              { number: 34, promptHtml: 'Routine information', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 7: "use notes, calendars and other external aids for routine information".' },
              { number: 35, promptHtml: 'An understanding of principles', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 8: "Understanding, unlike isolated facts, tends to last".' },
            ],
          },
          {
            id: 't41-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 36, promptHtml: 'Forgetting is entirely a passive process.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 4: "Forgetting is not simply the passive fading of memory".' },
              { number: 37, promptHtml: 'Losing details helps us to recognise general patterns.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 5: "By losing the details, we keep the general pattern".' },
              { number: 38, promptHtml: 'Memory-training apps are a waste of money.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer mentions such apps but gives no opinion on their value for money.' },
              { number: 39, promptHtml: 'Forgetting caused by illness should be regarded as a useful process.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 6: "Memory loss caused by illness is a tragedy".' },
              { number: 40, promptHtml: 'Most people\'s memories already work in a way that suits their needs.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 6: that is, "for most people most of the time, exactly what we already have".' },
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
        contextText: 'You will hear a woman phoning a pet care company to arrange dog walking.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Happy Paws Pet Care, Simon speaking." },
          { speaker: 'B', voice: 'zira', text: "Hello. I've just started a new job, and I'm going to be out of the house all day, so I need someone to walk my dog. Could you tell me about your service?" },
          { speaker: 'A', voice: 'david', text: "Of course. Let me take a few details about your dog first. What's his or her name?" },
          { speaker: 'B', voice: 'zira', text: "She's called Pepper." },
          { speaker: 'A', voice: 'david', text: "And what breed is she?" },
          { speaker: 'B', voice: 'zira', text: "She's a spaniel. About four years old." },
          { speaker: 'A', voice: 'david', text: "Lovely. Is she friendly with other dogs? Some of our walks are in groups." },
          { speaker: 'B', voice: 'zira', text: "Very friendly, with dogs and people. The only thing is that she's frightened of bicycles. If one goes past quickly, she tries to run away." },
          { speaker: 'A', voice: 'david', text: "That's useful to know. We'll keep her on the lead near cycle paths. Any health problems?" },
          { speaker: 'B', voice: 'zira', text: "She's got a bad hip, so she shouldn't jump or run too much. The vet says gentle walks are fine." },
          { speaker: 'A', voice: 'david', text: "OK. And does she need feeding during the day?" },
          { speaker: 'B', voice: 'zira', text: "No, but she does need to take a tablet at lunchtime. I'll leave it in the kitchen, in a small box by the kettle." },
          { speaker: 'A', voice: 'david', text: "That's fine, our walkers can do that. Now, let me explain the options. The first is our Group Walk. That's one hour, with up to five other dogs, and it costs twelve pounds." },
          { speaker: 'B', voice: 'zira', text: "Where do the group walks go?" },
          { speaker: 'A', voice: 'david', text: "Usually to Beacon Hill, because there's lots of open space. Then there's the Solo Walk, where Pepper would be the only dog. That's forty-five minutes, and it's eighteen pounds. Those usually go along the river." },
          { speaker: 'B', voice: 'zira', text: "And is there anything longer?" },
          { speaker: 'A', voice: 'david', text: "The Adventure Walk. That's two hours, in a small group, and we take the dogs by van to the forest. It's twenty-five pounds, and it includes a towel-dry and a brush afterwards, because they often come back quite muddy." },
          { speaker: 'B', voice: 'zira', text: "With her hip, I don't think two hours would be a good idea. The solo walk would probably be best, at least at first." },
          { speaker: 'A', voice: 'david', text: "I think so too. Before we start, one of our team will come to your house to meet Pepper and collect a spare key. We call it a meet-and-greet, and it's free." },
          { speaker: 'B', voice: 'zira', text: "Great. Could they come on Saturday morning?" },
          { speaker: 'A', voice: 'david', text: "Yes, I can book that now." },
        ],
        questionGroups: [
          {
            id: 't41-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Happy Paws — new customer</strong></p>' +
              '<p>Dog\'s name: Pepper<br/>Breed: {{q1}}<br/>Friendly, but afraid of {{q2}}<br/>Health: has a bad {{q3}}, so only gentle walks<br/>Needs a {{q4}} at lunchtime (in a box by the {{q5}})<br/>Before starting: free visit to meet the dog and collect a spare {{q6}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['spaniel'] }, explanationHtml: '"She\'s a spaniel."' },
              { number: 2, answer: { accepted: ['bicycles', 'bikes'] }, explanationHtml: '"she\'s frightened of bicycles".' },
              { number: 3, answer: { accepted: ['hip'] }, explanationHtml: '"She\'s got a bad hip".' },
              { number: 4, answer: { accepted: ['tablet', 'pill'] }, explanationHtml: '"she does need to take a tablet at lunchtime".' },
              { number: 5, answer: { accepted: ['kettle'] }, explanationHtml: '"in a small box by the kettle".' },
              { number: 6, answer: { accepted: ['key'] }, explanationHtml: '"to meet Pepper and collect a spare key".' },
            ],
          },
          {
            id: 't41-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Walk', 'Length', 'Price', 'Notes'],
              [
                ['Group', '1 hour', '£12', 'usually to Beacon {{q7}}'],
                ['Solo', '45 minutes', '£{{q8}}', 'usually along the {{q9}}'],
                ['Adventure', '2 hours', '£25', 'includes a towel-dry and a {{q10}}'],
              ]
            ),
            questions: [
              { number: 7, answer: { accepted: ['hill'] }, explanationHtml: '"Usually to Beacon Hill".' },
              { number: 8, answer: { accepted: ['18', 'eighteen'] }, explanationHtml: '"That\'s forty-five minutes, and it\'s eighteen pounds."' },
              { number: 9, answer: { accepted: ['river'] }, explanationHtml: '"Those usually go along the river."' },
              { number: 10, answer: { accepted: ['brush'] }, explanationHtml: '"it includes a towel-dry and a brush afterwards".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the volunteer coordinator of a city hospital talking to a group of new volunteers.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone. I'm Grace Adeyemi, the volunteer coordinator here at St Luke's Hospital, and I'd like to thank you all for offering to give up your time. We have around three hundred volunteers at the moment, and they make an enormous difference to patients." },
          { speaker: 'A', voice: 'zira', text: "Let me start by telling you what volunteers don't do. You won't be asked to do any medical tasks, such as helping patients to eat if they have difficulty swallowing, or moving patients in and out of bed. Those jobs need specialist training. And you won't be asked to replace paid staff." },
          { speaker: 'A', voice: 'zira', text: "So what will you be doing? Most of you will start on the wards. The single most valuable thing volunteers do there is simply to talk to patients. Many of them, especially older people, have very few visitors, and a friendly conversation can make a real difference to how they feel." },
          { speaker: 'A', voice: 'zira', text: "Some of you will help at the main entrance, guiding visitors to the right department. The hospital is a confusing building, so we'll give you a map to learn before your first shift." },
          { speaker: 'A', voice: 'zira', text: "We also have a library trolley, which goes round the wards twice a week with books and magazines. And in the children's ward, volunteers help to run play sessions. For that you'll need to complete an extra check, and it usually takes about a month." },
          { speaker: 'A', voice: 'zira', text: "Now, a few rules. First, and most important, is confidentiality. You'll overhear things about patients, and you must never repeat them to anyone outside the hospital, not even to your own family." },
          { speaker: 'A', voice: 'zira', text: "Second, hand hygiene. There are gel dispensers outside every ward, and you must use them every time you go in or out. Infections spread very easily in hospitals." },
          { speaker: 'A', voice: 'zira', text: "Third, please wear your identity badge at all times, where people can see it. And if you're unwell, even with a cold, don't come in. Just phone the volunteer office and let us know." },
          { speaker: 'A', voice: 'zira', text: "We ask all volunteers to commit to at least one shift a week for six months. Shifts are normally three hours long." },
          { speaker: 'A', voice: 'zira', text: "Finally, some benefits. You'll get a free meal in the staff restaurant on every shift, and we'll pay your bus fares. Parking at the hospital is very limited, I'm afraid, so we don't provide parking permits. And every year in June, we hold a volunteers' celebration evening, where we thank everyone for their work." },
          { speaker: 'A', voice: 'zira', text: "Right, let's take a break, and then I'll show you round." },
        ],
        questionGroups: [
          {
            id: 't41-l2-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 11,
                promptHtml: 'Which TWO tasks will volunteers NOT be asked to do?',
                options: [
                  { key: 'A', text: 'help patients who have difficulty eating' },
                  { key: 'B', text: 'talk to patients' },
                  { key: 'C', text: 'move patients in and out of bed' },
                  { key: 'D', text: 'guide visitors' },
                  { key: 'E', text: 'take books round the wards' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: '"You won\'t be asked to do any medical tasks, such as helping patients to eat ... or moving patients in and out of bed."',
              },
            ],
          },
          {
            id: 't41-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Volunteering at St Luke\'s Hospital</strong></p>' +
              '<p><em>Roles</em><br/>• on the wards: most valuable task is to {{q12}} to patients<br/>• main entrance: learn a {{q13}} before the first shift<br/>• library trolley goes round {{q14}} a week<br/>• children\'s ward: help with {{q15}}; extra check needed</p>' +
              '<p><em>Rules</em><br/>• most important: {{q16}}<br/>• use gel dispensers for hand {{q17}}<br/>• always wear your identity {{q18}}</p>' +
              '<p><em>Commitment</em>: one shift a week for {{q19}}</p>' +
              '<p><em>Benefits</em>: free meal and {{q20}} paid; celebration evening in June</p>',
            questions: [
              { number: 12, answer: { accepted: ['talk'] }, explanationHtml: '"The single most valuable thing volunteers do there is simply to talk to patients."' },
              { number: 13, answer: { accepted: ['map'] }, explanationHtml: '"we\'ll give you a map to learn before your first shift".' },
              { number: 14, answer: { accepted: ['twice'] }, explanationHtml: '"goes round the wards twice a week".' },
              { number: 15, answer: { accepted: ['play sessions'] }, explanationHtml: '"volunteers help to run play sessions".' },
              { number: 16, answer: { accepted: ['confidentiality'] }, explanationHtml: '"First, and most important, is confidentiality."' },
              { number: 17, answer: { accepted: ['hygiene'] }, explanationHtml: '"Second, hand hygiene."' },
              { number: 18, answer: { accepted: ['badge'] }, explanationHtml: '"please wear your identity badge at all times".' },
              { number: 19, answer: { accepted: ['six months', '6 months'] }, explanationHtml: '"at least one shift a week for six months".' },
              { number: 20, answer: { accepted: ['bus fares', 'bus fare'] }, explanationHtml: '"we\'ll pay your bus fares". Parking permits are not provided.' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two archaeology students, Chloe and Ben, discussing an experiment in which they made and fired clay pots.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Ben, we need to start writing up the pottery experiment. Shall we go through what happened?" },
          { speaker: 'B', voice: 'david', text: "Sure. So the aim was to find out whether the kind of pots found at the Bronze Age site could have been made using only the materials available locally." },
          { speaker: 'A', voice: 'zira', text: "Right. And I think the most surprising thing was the clay. We assumed we'd have to buy some, but the clay from the riverbank near the site was perfectly usable once we'd removed the stones." },
          { speaker: 'B', voice: 'david', text: "Yes, although it took ages to clean. What about the tempering material? The stuff you mix into the clay to stop it cracking." },
          { speaker: 'A', voice: 'zira', text: "We tried sand first, because that's what the textbook suggested. But the pots made with crushed shell survived the firing much better. Which fits with the archaeological evidence, because there are tiny pieces of shell in the original pots." },
          { speaker: 'B', voice: 'david', text: "That was a good result. Now, the firing. We used an open fire, not a kiln, because there's no evidence of kilns at the site." },
          { speaker: 'A', voice: 'zira', text: "And that's where most of the pots broke. I think the problem was that we heated them too quickly at the start." },
          { speaker: 'B', voice: 'david', text: "I agree. The second time, we warmed them slowly beside the fire for about an hour before putting them in, and far fewer cracked." },
          { speaker: 'A', voice: 'zira', text: "How many pots did we make altogether?" },
          { speaker: 'B', voice: 'david', text: "Twenty. Twelve survived, and eight broke, mostly in the first firing." },
          { speaker: 'A', voice: 'zira', text: "What do you think was the main limitation of the experiment?" },
          { speaker: 'B', voice: 'david', text: "Our lack of skill, definitely. The people who made the originals had probably been doing it all their lives. So if our pots broke, it doesn't necessarily mean the method was wrong." },
          { speaker: 'A', voice: 'zira', text: "Good point. We should put that in the discussion. Now, for the report itself, the tutor wants us to include photographs of each stage." },
          { speaker: 'B', voice: 'david', text: "I've got those. And I think we should also include a table comparing the weights of the pots before and after firing, to show how much water was lost." },
          { speaker: 'A', voice: 'zira', text: "Yes. And in the introduction, we need to explain why experimental archaeology is useful. Actually making the objects tells us things that just studying them can't." },
          { speaker: 'B', voice: 'david', text: "Such as how much time it took. We should mention that it took about three days to make one batch, including the drying." },
          { speaker: 'A', voice: 'zira', text: "And the fuel. We used much more wood than we'd expected, which suggests that collecting fuel would have been a major task for the community." },
          { speaker: 'B', voice: 'david', text: "That's a really interesting point for the conclusion. OK, shall we split the sections?" },
        ],
        questionGroups: [
          {
            id: 't41-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'What surprised the students about the clay?', options: [{ key: 'A', text: 'It had to be bought.' }, { key: 'B', text: 'Local clay could be used.' }, { key: 'C', text: 'It contained no stones.' }], answer: { accepted: ['B'] }, explanationHtml: '"the clay from the riverbank near the site was perfectly usable".' },
              { number: 22, promptHtml: 'Which tempering material worked best?', options: [{ key: 'A', text: 'sand' }, { key: 'B', text: 'crushed stone' }, { key: 'C', text: 'crushed shell' }], answer: { accepted: ['C'] }, explanationHtml: '"the pots made with crushed shell survived the firing much better".' },
              { number: 23, promptHtml: 'Why did many pots break in the first firing?', options: [{ key: 'A', text: 'They were heated too fast.' }, { key: 'B', text: 'The fire was not hot enough.' }, { key: 'C', text: 'The clay was too wet.' }], answer: { accepted: ['A'] }, explanationHtml: '"we heated them too quickly at the start".' },
              { number: 24, promptHtml: 'How many pots broke?', options: [{ key: 'A', text: '8' }, { key: 'B', text: '12' }, { key: 'C', text: '20' }], answer: { accepted: ['A'] }, explanationHtml: '"Twelve survived, and eight broke".' },
              { number: 25, promptHtml: 'What does Ben see as the main limitation of the experiment?', options: [{ key: 'A', text: 'the small number of pots' }, { key: 'B', text: 'the students\' lack of experience' }, { key: 'C', text: 'the absence of a kiln' }], answer: { accepted: ['B'] }, explanationHtml: '"Our lack of skill, definitely."' },
            ],
          },
          {
            id: 't41-l3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Report plan</strong></p>' +
              '<p>• include {{q26}} of each stage<br/>• table showing pot {{q27}} before and after firing<br/>• introduction: explain why experimental archaeology is {{q28}}<br/>• one batch took about three {{q29}}<br/>• conclusion: collecting {{q30}} would have been a major task</p>',
            questions: [
              { number: 26, answer: { accepted: ['photographs', 'photos'] }, explanationHtml: '"include photographs of each stage".' },
              { number: 27, answer: { accepted: ['weights'] }, explanationHtml: '"a table comparing the weights of the pots before and after firing".' },
              { number: 28, answer: { accepted: ['useful'] }, explanationHtml: '"explain why experimental archaeology is useful".' },
              { number: 29, answer: { accepted: ['days'] }, explanationHtml: '"it took about three days to make one batch".' },
              { number: 30, answer: { accepted: ['fuel', 'wood'] }, explanationHtml: '"collecting fuel would have been a major task for the community".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about efforts to restore land on the southern edge of the Sahara.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "In this lecture, I'm going to talk about one of the largest environmental projects ever attempted: the effort to restore land across the Sahel, the region that stretches across Africa along the southern edge of the Sahara Desert." },
          { speaker: 'A', voice: 'david', text: "The Sahel has always had a harsh climate, with a short rainy season and long dry months. But from the late nineteen sixties onwards, a series of severe droughts, combined with a rapidly growing population, led to serious land degradation. Trees were cut for firewood, soils were exhausted by continuous farming, and in many places the land became unable to support crops." },
          { speaker: 'A', voice: 'david', text: "In 2007, the African Union launched a project known as the Great Green Wall. The original idea was to plant a continuous belt of trees about fifteen kilometres wide, running from Senegal in the west to Djibouti in the east, a distance of around eight thousand kilometres." },
          { speaker: 'A', voice: 'david', text: "The idea attracted enormous international attention, but it soon became clear that simply planting trees in a line wasn't going to work. In some early projects, the great majority of planted seedlings died, because they were planted in the wrong places or because nobody looked after them. So the project has gradually changed from a wall of trees into a mosaic of different land restoration activities, designed with local communities." },
          { speaker: 'A', voice: 'david', text: "Some of the most successful methods are very simple and cost very little. One is known as farmer-managed natural regeneration. In many degraded fields, the roots of trees that were cut down long ago are still alive underground, and they send up new shoots every year. Traditionally, farmers cleared these shoots. Instead, they're now encouraged to select the strongest ones, protect them and remove the side branches, so that they grow into trees." },
          { speaker: 'A', voice: 'david', text: "This approach has been especially successful in Niger, where farmers have regenerated trees across millions of hectares. The trees provide shade for crops, their leaves feed animals and improve the soil, and they give families a source of firewood." },
          { speaker: 'A', voice: 'david', text: "Another traditional technique is the use of planting pits, known in Burkina Faso as zaï. Farmers dig small holes in hard, crusted ground during the dry season and fill them with manure. When the rain comes, water collects in the pits instead of running off, and termites attracted by the manure dig tunnels that help the water to soak into the soil. Crops planted in the pits can produce much higher yields." },
          { speaker: 'A', voice: 'david', text: "In other areas, farmers build low lines of stones along the contours of slopes, which slow down rainwater and stop the soil from being washed away." },
          { speaker: 'A', voice: 'david', text: "So, how successful has the Great Green Wall been? Progress has been slower than hoped. The target is to restore a hundred million hectares by 2030, but by the early twenty twenties, only a small proportion had been achieved. Funding has been a major problem, and in some countries, conflict has made the work impossible." },
          { speaker: 'A', voice: 'david', text: "Nevertheless, most experts believe that the change of approach was right. The lesson is that restoration works best when local people have a direct interest in the result, because it's they who will protect the trees long after the international organisations have gone." },
        ],
        questionGroups: [
          {
            id: 't41-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Restoring land in the Sahel</strong></p>' +
              '<p><em>Background</em><br/>• severe {{q31}} and population growth caused land degradation<br/>• trees were cut for {{q32}}</p>' +
              '<p><em>The Great Green Wall</em><br/>• originally a belt of trees across the continent<br/>• many early {{q33}} died<br/>• now a {{q34}} of activities designed with local communities</p>' +
              '<p><em>Methods</em><br/>• natural regeneration: shoots grow from living {{q35}}<br/>• farmers protect the strongest shoots and remove side {{q36}}<br/>• zaï pits are filled with {{q37}}<br/>• {{q38}} help water to soak into the soil<br/>• lines of {{q39}} stop soil being washed away</p>' +
              '<p><em>Problems</em><br/>• lack of {{q40}} and conflict</p>',
            questions: [
              { number: 31, answer: { accepted: ['droughts', 'drought'] }, explanationHtml: '"a series of severe droughts, combined with a rapidly growing population".' },
              { number: 32, answer: { accepted: ['firewood'] }, explanationHtml: '"Trees were cut for firewood".' },
              { number: 33, answer: { accepted: ['seedlings'] }, explanationHtml: '"the great majority of planted seedlings died".' },
              { number: 34, answer: { accepted: ['mosaic'] }, explanationHtml: '"a mosaic of different land restoration activities".' },
              { number: 35, answer: { accepted: ['roots'] }, explanationHtml: '"the roots of trees ... are still alive underground, and they send up new shoots".' },
              { number: 36, answer: { accepted: ['branches'] }, explanationHtml: '"protect them and remove the side branches".' },
              { number: 37, answer: { accepted: ['manure'] }, explanationHtml: '"fill them with manure".' },
              { number: 38, answer: { accepted: ['termites'] }, explanationHtml: '"termites ... dig tunnels that help the water to soak into the soil".' },
              { number: 39, answer: { accepted: ['stones'] }, explanationHtml: '"low lines of stones along the contours of slopes".' },
              { number: 40, answer: { accepted: ['funding', 'money'] }, explanationHtml: '"Funding has been a major problem, and in some countries, conflict".' },
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
        '<p>The chart below shows how students at one university travelled to the campus in 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'pie',
        title: 'Main method of travel to campus, 2023',
        unit: '%',
        categories: ['Bus', 'Walking', 'Bicycle', 'Car (driver)', 'Car (passenger)', 'Train', 'Other'],
        series: [{ name: 'Students', data: [31, 24, 14, 12, 7, 9, 3] }],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people believe that international tourism brings more problems than benefits to the places that tourists visit.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
