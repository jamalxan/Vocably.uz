// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-37',
  title: 'Vocably Practice Test 37',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The woman who measured the warming sun',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>For more than a century, the discovery that certain gases in the atmosphere trap heat was credited almost entirely to the Irish physicist John Tyndall, whose careful laboratory measurements were published in 1859. Only in the last fifteen years or so has a wider public learned that three years earlier, an American amateur scientist named Eunice Newton Foote had carried out a simple but revealing experiment that pointed in the same direction. Her story says a good deal about the science of her time, and about who was allowed to take part in it.</p>" },
          { label: '', html: "<p>Foote was born in Connecticut in 1819 and grew up in New York State. Unusually for a girl of that period, she received a serious scientific education. At the Troy Female Seminary, a school founded to give young women the same kind of learning available to young men, pupils were encouraged to attend lectures at a nearby science college, and some of them carried out experiments of their own in chemistry and biology. Foote later married a lawyer and judge, Elisha Foote, who shared her interest in invention, and the couple settled in the town of Seneca Falls.</p>" },
          { label: '', html: "<p>Seneca Falls is famous as the place where, in 1848, the first convention on women's rights in the United States was held. Eunice Foote attended the meeting and was one of the signatories of its Declaration of Sentiments, which demanded equal treatment for women in education, property and public life. She also helped to prepare the published record of the convention. These activities are a reminder that her scientific work was carried out in a society in which women could not vote and were largely excluded from universities and learned societies.</p>" },
          { label: '', html: "<p>Her experiment, described in a short paper in 1856, used equipment that could be found in many households or schoolrooms. She took two glass cylinders, placed a thermometer in each, and used an air pump to change what was inside them. In one set of trials she compared cylinders containing dry air with cylinders containing moist air; in another she filled one cylinder with ordinary air and the other with carbonic acid gas, which we now call carbon dioxide. She then placed the cylinders side by side in direct sunlight and recorded the temperatures at regular intervals.</p>" },
          { label: '', html: "<p>The results were clear. Moist air became warmer than dry air, and the cylinder containing carbon dioxide heated up most of all. It also took considerably longer to cool down once it was moved into the shade. From this, Foote made a remarkable suggestion: that an atmosphere containing more of this gas would give the Earth a higher temperature, and that changes in the amount of the gas might explain differences in the planet's climate in the distant past. Her paper was only two pages long, but it contained, in outline, an idea that would become central to climate science.</p>" },
          { label: '', html: "<p>The paper was presented in August 1856 at a meeting of a national association for the advancement of science, held in Albany. Foote did not read it herself; it was read on her behalf by Joseph Henry, a leading physicist of the day, who introduced it with a few remarks about the ability of women to contribute to science. A summary appeared in a popular science magazine, and the paper was printed in an academic journal later that year. Yet it was left out of the official proceedings of the meeting, and it was quickly forgotten.</p>" },
          { label: '', html: "<p>Historians are cautious about claiming that Foote 'discovered' the greenhouse effect. Her apparatus could not separate the effect of sunlight from the effect of heat given off by the warm glass, and it was Tyndall who first measured how gases absorb infrared radiation, the form of energy that the Earth sends back into space. There is also no evidence that Tyndall knew of her work. Nevertheless, her results were correct, and her conclusion about the atmosphere was bolder than anything else published at the time. Foote went on to write a second paper, on static electricity in gases, and she and her husband patented a number of inventions, including an improved filling for the soles of boots. She died in 1888, and it was not until 2011, when a retired geologist came across her paper by chance, that her name began to appear in histories of climate science.</p>" },
        ],
        questionGroups: [
          {
            id: 't37-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: "Tyndall's measurements were published before Foote's experiment.", answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: Tyndall published in 1859; Foote\'s experiment was "three years earlier".' },
              { number: 2, promptHtml: 'Pupils at the Troy Female Seminary were able to attend science lectures outside their own school.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: pupils "were encouraged to attend lectures at a nearby science college".' },
              { number: 3, promptHtml: "Foote's husband helped her to carry out her experiments.", answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 2 says he "shared her interest in invention", but not that he helped with the experiments.' },
              { number: 4, promptHtml: 'Foote was among the people who signed a declaration at the Seneca Falls convention.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 3: she "was one of the signatories of its Declaration of Sentiments".' },
              { number: 5, promptHtml: 'The equipment Foote used was specially made for her.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: she used "equipment that could be found in many households or schoolrooms".' },
              { number: 6, promptHtml: 'The cylinder containing carbon dioxide stayed warm for longer than the others.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 5: "It also took considerably longer to cool down".' },
              { number: 7, promptHtml: "Joseph Henry disagreed with the conclusions of Foote's paper.", answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 6 says he read it and commented on women in science; his opinion of its conclusions is not given.' },
            ],
          },
          {
            id: 't37-r1-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 8, promptHtml: 'What device did Foote use to change the contents of the cylinders?', answer: { accepted: ['air pump', 'an air pump'] }, explanationHtml: 'Paragraph 4: she "used an air pump to change what was inside them".' },
              { number: 9, promptHtml: 'Where did Foote put the cylinders during the experiment?', answer: { accepted: ['direct sunlight', 'in sunlight', 'sunlight'] }, explanationHtml: 'Paragraph 4: "placed the cylinders side by side in direct sunlight".' },
              { number: 10, promptHtml: 'Which type of air became warmer than dry air?', answer: { accepted: ['moist air', 'moist'] }, explanationHtml: 'Paragraph 5: "Moist air became warmer than dry air".' },
              { number: 11, promptHtml: 'In which city was the scientific meeting held in 1856?', answer: { accepted: ['albany'] }, explanationHtml: 'Paragraph 6: the meeting was "held in Albany".' },
              { number: 12, promptHtml: 'What form of energy did Tyndall measure being absorbed by gases?', answer: { accepted: ['infrared radiation', 'infrared'] }, explanationHtml: 'Paragraph 7: Tyndall "first measured how gases absorb infrared radiation".' },
              { number: 13, promptHtml: 'Who found Foote\'s paper in 2011?', answer: { accepted: ['retired geologist', 'a geologist', 'geologist'] }, explanationHtml: 'Paragraph 7: "a retired geologist came across her paper by chance".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Working less, achieving more?',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>The five-day working week is younger than most people assume. For much of the nineteenth century, factory workers in industrial countries worked six days, and often more than ten hours a day. Saturday afternoons off were the first concession, won in some industries in the second half of the century, and Sunday was protected mainly for religious reasons rather than as a right to rest.The two-day weekend spread gradually during the twentieth century, pushed forward partly by trade unions and partly by employers who discovered that tired workers made costly mistakes. Now a growing number of organisations are asking whether the next step should be a four-day week, with no reduction in pay. Supporters see it as a natural continuation of a long historical trend; critics regard it as an expensive experiment that few businesses can afford.</p>" },
          { label: 'B', html: "<p>The evidence comes mainly from trials, and the largest so far involved sixty-one companies in one European country, employing almost three thousand people. The firms, which ranged from small software developers to a fish-and-chip shop, agreed to reduce working hours by about a fifth for six months while keeping salaries the same. Researchers measured productivity, staff wellbeing and company revenue before and during the trial. At the end, more than ninety per cent of the companies chose to continue with the shorter week, and a majority said they intended to make the change permanent. Importantly, the firms were free to decide how to organise the shorter week. Some closed on Fridays, others gave staff a different day off in rotation so that customers could still be served, and a few simply reduced the length of each working day. The researchers argued that this flexibility was one of the reasons for the high success rate.</p>" },
          { label: 'C', html: "<p>The reasons for this success are not mysterious. When time is limited, people tend to use it more carefully. Many participating firms cut the length of meetings, reduced the number of people invited to them, and set aside periods of the day for concentrated work without email or messages. Employees reported sleeping better and feeling less exhausted, and the number of sick days fell by around two thirds. For employers, one of the most valuable outcomes was a sharp drop in the number of staff leaving: recruiting and training a replacement is expensive, and a four-day week turned out to be an attractive benefit that competitors could not easily match. Revenue, meanwhile, stayed broadly the same, and in some firms it rose slightly, which suggests that the loss of working time was more than compensated for by the changes in how that time was used.</p>" },
          { label: 'D', html: "<p>It would be a mistake, however, to assume that these results can be repeated everywhere. The companies in the trial volunteered to take part, which suggests that their managers were already enthusiastic about the idea and confident that it could work. Most were in office-based industries, where output is difficult to measure and where there is often scope to remove unnecessary tasks. In a hospital, a school or a bus company, the situation is very different. A nurse cannot treat patients more quickly simply because the week is shorter, and if staff work fewer hours, someone else must be employed to cover the missing time. For such organisations, a four-day week means higher costs unless the service itself is reduced. There is also the question of how long the benefits last. Enthusiasm is often high at the start of any new arrangement, and some psychologists warn that the improvements seen in a six-month trial may fade once the shorter week becomes normal and the pressure to prove that it works has gone.</p>" },
          { label: 'E', html: "<p>My own view is that the debate is too often framed as a simple choice between five days and four. The deeper question is whether the number of hours people spend at work is a good measure of what they contribute, and in many jobs it clearly is not. Some organisations may benefit from a compressed week, others from shorter days, and others from giving staff more control over when they work. What the trials have shown, beyond doubt, is that the traditional working week is not a law of nature. It was designed for the factories of the past, and there is no reason why it should not be redesigned for the workplaces of today. Governments, in my opinion, should encourage further experiments rather than impose a single model on every employer.</p>" },
        ],
        questionGroups: [
          {
            id: 't37-r2-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 2 has five paragraphs, A-E. Choose the correct heading for paragraphs B-E from the list of headings below.<br/><em>Example: Paragraph A — iii</em>',
            bank: [
              { key: 'i', text: 'Why a shorter week improved results' },
              { key: 'ii', text: 'Details of a large-scale experiment' },
              { key: 'iv', text: 'Reasons for caution' },
              { key: 'v', text: 'The attitude of trade unions' },
              { key: 'vi', text: 'A call for a more flexible approach' },
              { key: 'vii', text: 'The cost of recruiting new staff' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph B', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph B describes the size, participants and method of the largest trial.', locatorParagraph: 'B' },
              { number: 15, promptHtml: 'Paragraph C', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph C: "The reasons for this success are not mysterious."', locatorParagraph: 'C' },
              { number: 16, promptHtml: 'Paragraph D', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph D: "It would be a mistake ... to assume that these results can be repeated everywhere."', locatorParagraph: 'D' },
              { number: 17, promptHtml: 'Paragraph E', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph E argues for different models and "further experiments rather than ... a single model".', locatorParagraph: 'E' },
            ],
          },
          {
            id: 't37-r2-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            questions: [
              { number: 18, promptHtml: 'For how long did the companies in the largest trial reduce working hours?', answer: { accepted: ['six months', '6 months'] }, explanationHtml: 'Paragraph B: "for six months".', locatorParagraph: 'B' },
              { number: 19, promptHtml: 'By how much did the number of sick days fall?', answer: { accepted: ['two thirds', 'around two thirds', 'about two thirds', '2/3'] }, explanationHtml: 'Paragraph C: sick days "fell by around two thirds".', locatorParagraph: 'C' },
              { number: 20, promptHtml: 'What type of industries did most of the companies in the trial belong to?', answer: { accepted: ['office-based industries', 'office-based'] }, explanationHtml: 'Paragraph D: "Most were in office-based industries".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't37-r2-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 21, promptHtml: 'The five-day working week has existed for longer than many people think.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph A: it "is younger than most people assume".', locatorParagraph: 'A' },
              { number: 22, promptHtml: 'Shorter meetings helped some firms to make better use of working time.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph C: firms "cut the length of meetings" as time was used "more carefully".', locatorParagraph: 'C' },
              { number: 23, promptHtml: 'The managers of the companies in the trial were probably in favour of the idea from the start.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph D: volunteering "suggests that their managers were already enthusiastic".', locatorParagraph: 'D' },
              { number: 24, promptHtml: 'Hospitals that have tried a four-day week have reduced the quality of patient care.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph D discusses the difficulties hospitals would face but does not mention any hospital that has tried it.', locatorParagraph: 'D' },
              { number: 25, promptHtml: 'Hours spent at work are always a reliable measure of how much a person contributes.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph E: "in many jobs it clearly is not".', locatorParagraph: 'E' },
              { number: 26, promptHtml: 'Governments should require all employers to adopt a four-day week.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph E: governments should encourage experiments "rather than impose a single model on every employer".', locatorParagraph: 'E' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Reading history in the rings of trees',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Cut through the trunk of a tree growing in a temperate climate and you will usually see a series of rings, one inside another. Each ring represents a single year of growth. In spring and early summer, when water is plentiful, the tree produces large, thin-walled cells that appear pale; later in the season, growth slows and the cells become smaller and darker. The contrast between the dark wood of one year and the pale wood of the next creates a visible boundary. Counting the rings from the bark inwards therefore gives the age of the tree, a fact that has been known for centuries. What is less widely known is that the rings can also reveal the exact year in which a piece of wood was growing, even if the tree was cut down thousands of years ago.</p>" },
          { label: '', html: "<p>The science that makes this possible is called dendrochronology, and it was developed in the early twentieth century by an American astronomer, Andrew Ellicott Douglass. Douglass was not interested in trees for their own sake. He wanted to know whether changes in the activity of the Sun affected the Earth's climate, and he needed a long record of past weather. Instrument records went back only a few decades, but he realised that trees, whose growth depends on rainfall and temperature, might have kept a record of their own. He noticed that the pattern of wide and narrow rings was similar in different trees from the same region, because they had all experienced the same good and bad years.</p>" },
          { label: '', html: "<p>This observation is the key to the whole method. A single ring width tells us little, but a sequence of wide and narrow rings over several decades forms a pattern as distinctive as a fingerprint. If the outer rings of an old tree overlap in time with the inner rings of a living tree, the patterns can be matched, and the record extended further back. By linking together living trees, timbers from old buildings, and wood preserved in rivers, bogs and archaeological sites, researchers have built continuous chronologies that stretch back more than twelve thousand years in some parts of Europe.</p>" },
          { label: '', html: "<p>The process of dating a new sample follows a set series of steps. First, a thin cylinder of wood, known as a core, is removed with a hollow drill; this does not harm a living tree, and it allows beams in historic buildings to be sampled without being taken down. The surface of the core is then sanded until the individual cells can be seen under a microscope. Next, the width of every ring is measured, usually to a hundredth of a millimetre, and the measurements are entered into a computer. The resulting sequence is compared statistically with a master chronology for the region. When a strong match is found, each ring can be assigned to a calendar year. Finally, the researcher must consider how many outer rings may be missing, because the bark and the softer outer wood are often removed when timber is prepared for use.</p>" },
          { label: '', html: "<p>The applications of the method go far beyond simply establishing dates. Because the timbers in a building were usually used soon after the trees were cut, dendrochronology can show when a house, church or ship was constructed, and sometimes that it was repaired or extended at a later date. Art historians have used it to date the wooden panels on which medieval paintings were made, revealing in some cases that a painting attributed to a famous artist was produced after his death. The origins of timber can also be traced: oak used in several English buildings, for instance, has been shown to have come from the Baltic region, providing evidence of trade routes.</p>" },
          { label: '', html: "<p>Climate scientists, like Douglass before them, remain among the most important users of tree-ring data. In dry regions, ring width is closely related to rainfall, so ancient timbers can reveal long droughts that occurred before written records began. In cold regions near the tree line, ring width and wood density reflect summer temperature. Tree rings have also recorded the effects of large volcanic eruptions, which throw ash and gas into the upper atmosphere and cool the planet for several years. Distinctive frost damage inside the rings of trees in North America, for example, has been linked to eruptions that took place on the other side of the world.</p>" },
          { label: '', html: "<p>The method has limitations. It works best in regions with a clear difference between seasons, and it is far more difficult in the tropics, where many trees grow all year round and may not form annual rings at all. Some species regularly produce a ring that is too narrow to see, or two rings in a single year, and a sample must contain enough rings, usually at least fifty, for its pattern to be matched with confidence. Despite these difficulties, dendrochronology remains one of the most precise dating methods available to science, and it is frequently used to check the accuracy of other techniques, including radiocarbon dating.</p>" },
        ],
        questionGroups: [
          {
            id: 't37-r3-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 27, promptHtml: 'What kind of cells does a tree produce in spring and early summer?', answer: { accepted: ['large', 'large cells', 'thin-walled cells', 'thin-walled'] }, explanationHtml: 'Paragraph 1: the tree "produces large, thin-walled cells that appear pale".' },
              { number: 28, promptHtml: 'What did Douglass want to find out whether the Sun affected?', answer: { accepted: ["earth's climate", 'the climate', 'climate'] }, explanationHtml: 'Paragraph 2: whether changes in the Sun "affected the Earth\'s climate".' },
              { number: 29, promptHtml: 'What does the text compare a sequence of ring widths to?', answer: { accepted: ['a fingerprint', 'fingerprint'] }, explanationHtml: 'Paragraph 3: "a pattern as distinctive as a fingerprint".' },
              { number: 30, promptHtml: 'Which region did the oak in several English buildings come from?', answer: { accepted: ['baltic region', 'the baltic', 'baltic'] }, explanationHtml: 'Paragraph 5: oak "has been shown to have come from the Baltic region".' },
            ],
          },
          {
            id: 't37-r3-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 31, promptHtml: 'Douglass was originally trained as a biologist.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: Douglass was "an American astronomer".' },
              { number: 32, promptHtml: 'Taking a core from a living tree causes it no damage.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 4: "this does not harm a living tree".' },
              { number: 33, promptHtml: 'Tree-ring chronologies in North America go back further than those in Europe.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Only European chronologies (over twelve thousand years) are described; no comparison is made.' },
            ],
          },
          {
            id: 't37-r3-flow',
            type: 'flowchart_completion',
            instructionHtml: 'Complete the flow-chart below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Dating a wood sample</strong></p>' +
              '<p>A core is removed using a {{q34}}.</p><p>↓</p>' +
              '<p>The core is {{q35}} so that cells are visible under a microscope.</p><p>↓</p>' +
              '<p>Each ring is measured to a {{q36}} of a millimetre.</p><p>↓</p>' +
              '<p>The sequence is compared with a {{q37}} for the region.</p><p>↓</p>' +
              '<p>After a match, each ring is given a {{q38}}.</p><p>↓</p>' +
              '<p>The researcher estimates the number of {{q39}} that may be missing.</p>',
            questions: [
              { number: 34, answer: { accepted: ['hollow drill'] }, explanationHtml: 'Paragraph 4: "removed with a hollow drill".' },
              { number: 35, answer: { accepted: ['sanded'] }, explanationHtml: 'Paragraph 4: "The surface of the core is then sanded".' },
              { number: 36, answer: { accepted: ['hundredth'] }, explanationHtml: 'Paragraph 4: "usually to a hundredth of a millimetre".' },
              { number: 37, answer: { accepted: ['master chronology'] }, explanationHtml: 'Paragraph 4: "compared statistically with a master chronology for the region".' },
              { number: 38, answer: { accepted: ['calendar year'] }, explanationHtml: 'Paragraph 4: "each ring can be assigned to a calendar year".' },
              { number: 39, answer: { accepted: ['outer rings'] }, explanationHtml: 'Paragraph 4: "how many outer rings may be missing".' },
            ],
          },
          {
            id: 't37-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 40,
                promptHtml: 'Why is dendrochronology difficult to use in the tropics?',
                options: [
                  { key: 'A', text: 'Few old timbers have survived there.' },
                  { key: 'B', text: 'Many trees there do not form a ring each year.' },
                  { key: 'C', text: 'Tropical wood is too dense to sample.' },
                  { key: 'D', text: 'Rainfall there is the same every year.' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Final paragraph: many tropical trees "grow all year round and may not form annual rings at all".',
              },
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
        contextText: 'You will hear a man phoning a council office to ask about renting a garden allotment.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, Parks and Allotments office, Julie speaking." },
          { speaker: 'B', voice: 'david', text: "Oh, hello. I've just moved to the area and I'd like to rent an allotment, a piece of land to grow vegetables on. Could you tell me how it works?" },
          { speaker: 'A', voice: 'zira', text: "Of course. We have four sites in the town at the moment. Which part of town are you in?" },
          { speaker: 'B', voice: 'david', text: "I'm on the east side, near the hospital." },
          { speaker: 'A', voice: 'zira', text: "Then the nearest one would be the site on Kingfisher Lane. There's one on Mill Road as well, but that's full at the moment, and it has quite a long waiting list." },
          { speaker: 'B', voice: 'david', text: "Kingfisher Lane sounds fine. How big are the plots?" },
          { speaker: 'A', voice: 'zira', text: "A full plot is about two hundred and fifty square metres, which is a lot of work for a beginner. Most new tenants start with a half plot, which is a hundred and twenty-five." },
          { speaker: 'B', voice: 'david', text: "I think a half plot would be enough. What does it cost?" },
          { speaker: 'A', voice: 'zira', text: "A half plot is forty-two pounds a year. That includes the water. The full plot is seventy-eight." },
          { speaker: 'B', voice: 'david', text: "Forty-two pounds. That's very reasonable. Is there anywhere to keep tools? I don't really want to carry everything backwards and forwards." },
          { speaker: 'A', voice: 'zira', text: "Each plot at Kingfisher Lane has its own small shed. You're not allowed to put up anything bigger yourself, though, and you can't use it for sleeping or anything like that." },
          { speaker: 'B', voice: 'david', text: "No, of course not. Are there any other rules I should know about?" },
          { speaker: 'A', voice: 'zira', text: "The main one is that at least three quarters of the plot must be used for growing food, fruit or vegetables. You can have some flowers, but it isn't meant to be an ornamental garden. And you can't keep animals, except for bees, and for those you need written permission." },
          { speaker: 'B', voice: 'david', text: "What about bonfires? I've got a lot of garden rubbish at home." },
          { speaker: 'A', voice: 'zira', text: "Bonfires are only allowed between October and March, and only after four in the afternoon. But we'd much rather people used the compost bins. There are large ones by the main gate." },
          { speaker: 'B', voice: 'david', text: "Good. And how soon could I start?" },
          { speaker: 'A', voice: 'zira', text: "There are two half plots free at the moment. Before you sign the agreement, all new tenants have to go to an induction session. It lasts about an hour and it's held at the site on the first Saturday of each month." },
          { speaker: 'B', voice: 'david', text: "So that would be the fourth of next month?" },
          { speaker: 'A', voice: 'zira', text: "That's right, at ten o'clock. The session is run by the site representative, who's a volunteer. Her name is Mrs Oduya." },
          { speaker: 'B', voice: 'david', text: "Could you spell that, please?" },
          { speaker: 'A', voice: 'zira', text: "O-D-U-Y-A. She'll show you the plot and explain where everything is." },
          { speaker: 'B', voice: 'david', text: "Do I need to bring anything?" },
          { speaker: 'A', voice: 'zira', text: "Just some proof of your address, a recent bill for example, because the allotments are only for people who live in the town. And wear strong boots, because it can be very muddy at this time of year." },
          { speaker: 'B', voice: 'david', text: "That's great. Thank you very much for your help." },
        ],
        questionGroups: [
          {
            id: 't37-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Allotment enquiry</strong></p>' +
              '<p><em>Example:</em> Number of sites in the town: four</p>' +
              '<p>Nearest site: {{q1}}<br/>Size of a half plot: {{q2}} square metres<br/>Yearly cost of a half plot: £{{q3}} (including water)<br/>Each plot has its own {{q4}}</p>' +
              '<p><em>Rules</em><br/>• at least {{q5}} of the plot must be used for growing food<br/>• animals not allowed, except bees (need {{q6}})<br/>• bonfires only from October to March, after {{q7}}</p>' +
              '<p><em>Starting</em><br/>• must attend an induction on the first {{q8}} of each month<br/>• site representative: Mrs {{q9}}<br/>• bring proof of address, e.g. a recent {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['kingfisher lane'] }, explanationHtml: '"the nearest one would be the site on Kingfisher Lane". Mill Road is full.' },
              { number: 2, answer: { accepted: ['125', 'one hundred and twenty-five', 'a hundred and twenty-five'] }, explanationHtml: '"a half plot, which is a hundred and twenty-five". 250 is a full plot.' },
              { number: 3, answer: { accepted: ['42', 'forty-two'] }, explanationHtml: '"A half plot is forty-two pounds a year."' },
              { number: 4, answer: { accepted: ['shed', 'small shed', 'own small shed'] }, explanationHtml: '"Each plot ... has its own small shed."' },
              { number: 5, answer: { accepted: ['three quarters', '3/4', 'three-quarters', '75%'] }, explanationHtml: '"at least three quarters of the plot must be used for growing food".' },
              { number: 6, answer: { accepted: ['written permission', 'permission'] }, explanationHtml: '"except for bees, and for those you need written permission".' },
              { number: 7, answer: { accepted: ['4 pm', '4pm', 'four', '4', '4 o\'clock', 'four in the afternoon', '4 in the afternoon'] }, explanationHtml: '"only after four in the afternoon".' },
              { number: 8, answer: { accepted: ['saturday'] }, explanationHtml: '"held at the site on the first Saturday of each month".' },
              { number: 9, answer: { accepted: ['oduya'] }, explanationHtml: 'Spelled "O-D-U-Y-A".' },
              { number: 10, answer: { accepted: ['bill'] }, explanationHtml: '"a recent bill for example".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a local radio presenter talking about a new weekly market in the town of Ashbury.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "And now some news for anyone who likes good food. From this Saturday, Ashbury will have its own farmers' market for the first time in more than thirty years. The market will take place every Saturday morning in Church Square, right in the centre of the town, which is currently used as a car park during the week." },
          { speaker: 'A', voice: 'david', text: "The idea came from a group of local farmers who were tired of travelling to markets in other towns, and they worked with the town council to make it happen. The opening hours will be from eight until one o'clock, although the organisers say that if it's popular, they may keep it open until three during the summer." },
          { speaker: 'A', voice: 'david', text: "There'll be around thirty stalls on the first day. The organisers have one strict rule: everything on sale must be grown, raised or made within forty miles of Ashbury. So you won't find tropical fruit here, but you will find meat, cheese, eggs, bread, honey and, of course, plenty of seasonal vegetables." },
          { speaker: 'A', voice: 'david', text: "Most of the stallholders are farmers, but there are also a few bakers and one very popular cheese maker from the hills above the town, whose goat's cheese has won several prizes." },
          { speaker: 'A', voice: 'david', text: "For the opening day, there'll be some special attractions. The mayor will open the market at eight thirty, and there'll be a cookery demonstration at eleven, given by the head chef of the Riverside Hotel, who'll be showing how to cook with vegetables that are in season. Children can take part in a competition to guess the weight of a giant pumpkin, and the winner gets a basket of local produce." },
          { speaker: 'A', voice: 'david', text: "Now, a few practical details. Because the square is normally a car park, there will be no parking there on Saturdays. Instead, visitors are asked to use the car park behind the library, which will be free on market days until two o'clock. There's also a bus from the railway station every twenty minutes." },
          { speaker: 'A', voice: 'david', text: "Many people have asked whether they'll be able to pay by card. The answer is that most stalls will accept cards, but not all of them, so the organisers suggest bringing some cash just in case. There's a cash machine on the corner of the square." },
          { speaker: 'A', voice: 'david', text: "The organisers are also keen to reduce waste. They're asking shoppers to bring their own bags, and several stalls will offer a discount to customers who bring their own containers for things like olives and honey. Plastic bags won't be provided at all." },
          { speaker: 'A', voice: 'david', text: "What about the effect on the shops in the town centre? Some shopkeepers were worried at first that the market would take their customers away. But the council points out that in similar towns, markets have actually brought more people into the town centre, and several cafés near the square have already said they'll open earlier on Saturdays." },
          { speaker: 'A', voice: 'david', text: "Finally, if you're a local producer and you'd like a stall, the organisers would like to hear from you. At the moment there's a particular shortage of people selling fish, so if that's you, do get in touch. The cost of a stall is fifteen pounds for each market day, and there's a reduced rate for anyone who books for a whole year." },
        ],
        questionGroups: [
          {
            id: 't37-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Ashbury Farmers\' Market</strong></p>' +
              '<p>Location: Church Square (normally used as a {{q11}} during the week)<br/>Opening hours: 8 am to {{q12}} pm<br/>All goods must come from within {{q13}} miles of Ashbury<br/>Prize-winning cheese made from the milk of {{q14}}</p>' +
              '<p><em>Opening day</em><br/>• cookery demonstration by a hotel {{q15}}<br/>• children guess the weight of a giant {{q16}}</p>',
            questions: [
              { number: 11, answer: { accepted: ['car park', 'carpark'] }, explanationHtml: '"which is currently used as a car park during the week".' },
              { number: 12, answer: { accepted: ['1', 'one'] }, explanationHtml: '"from eight until one o\'clock". Three o\'clock is only a possibility for summer.' },
              { number: 13, answer: { accepted: ['40', 'forty'] }, explanationHtml: '"within forty miles of Ashbury".' },
              { number: 14, answer: { accepted: ['goats', "goat's", 'goat'] }, explanationHtml: '"whose goat\'s cheese has won several prizes".' },
              { number: 15, answer: { accepted: ['chef'] }, explanationHtml: '"given by the head chef of the Riverside Hotel".' },
              { number: 16, answer: { accepted: ['pumpkin'] }, explanationHtml: '"guess the weight of a giant pumpkin".' },
            ],
          },
          {
            id: 't37-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 17, promptHtml: 'Where should visitors park their cars on market days?', options: [{ key: 'A', text: 'in Church Square' }, { key: 'B', text: 'behind the library' }, { key: 'C', text: 'at the railway station' }], answer: { accepted: ['B'] }, explanationHtml: '"visitors are asked to use the car park behind the library".' },
              { number: 18, promptHtml: 'What does the presenter say about payment?', options: [{ key: 'A', text: 'Only cash will be accepted.' }, { key: 'B', text: 'All stalls will take cards.' }, { key: 'C', text: 'Some stalls may not accept cards.' }], answer: { accepted: ['C'] }, explanationHtml: '"most stalls will accept cards, but not all of them".' },
            ],
          },
          {
            id: 't37-l2-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 19,
                promptHtml: 'Which TWO things are shoppers asked or encouraged to do?',
                options: [
                  { key: 'A', text: 'bring their own bags' },
                  { key: 'B', text: 'arrive before nine o\'clock' },
                  { key: 'C', text: 'bring their own containers' },
                  { key: 'D', text: 'buy plastic bags at the entrance' },
                  { key: 'E', text: 'book stalls a year in advance' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: '"asking shoppers to bring their own bags" and a discount "to customers who bring their own containers". Plastic bags "won\'t be provided at all".',
              },
            ],
          },
          {
            id: 't37-l2-short',
            type: 'short_answer',
            instructionHtml: 'Answer the question below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for your answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            questions: [
              { number: 20, promptHtml: 'What type of food are the organisers particularly looking for new stallholders to sell?', answer: { accepted: ['fish'] }, explanationHtml: '"there\'s a particular shortage of people selling fish".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Ruth and Daniel, discussing their project on food waste with their tutor, Dr Green.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Come in, both of you. So, you've finished collecting the data for your food waste project. How did it go?" },
          { speaker: 'B', voice: 'zira', text: "Quite well, I think. As you know, we decided to look at the main university canteen, because it serves nearly two thousand meals a day." },
          { speaker: 'C', voice: 'david2', text: "We weighed the food that was left on plates for two weeks. We'd planned to do it for a month, but the canteen manager was worried it would slow down the washing-up, so we agreed on two weeks." },
          { speaker: 'A', voice: 'david', text: "That's reasonable. What did you find?" },
          { speaker: 'B', voice: 'zira', text: "The biggest surprise was that the most wasted item wasn't vegetables, which is what we expected. It was rice and potatoes. People were being given much larger portions than they could eat." },
          { speaker: 'A', voice: 'david', text: "Why do you think that was?" },
          { speaker: 'C', voice: 'david2', text: "Partly because the staff serve everyone the same amount, whatever they ask for. But mainly, I think, because the price is the same whatever you take, so students feel they should get as much as possible." },
          { speaker: 'A', voice: 'david', text: "And did you talk to the students themselves?" },
          { speaker: 'B', voice: 'zira', text: "Yes, we did a short questionnaire. We'd hoped to get a hundred replies, and in the end we got about sixty. We handed it out at lunchtime, which wasn't ideal, because people were in a hurry." },
          { speaker: 'A', voice: 'david', text: "Sixty is enough for a project like this. What did they say?" },
          { speaker: 'C', voice: 'david2', text: "Most of them said they cared about food waste, but very few thought they personally wasted much. When we showed them photos of the plates, a lot of them were quite shocked." },
          { speaker: 'A', voice: 'david', text: "That gap between what people believe and what they do is a well-known finding. Now, what are you going to recommend?" },
          { speaker: 'B', voice: 'zira', text: "Our main recommendation is to offer two portion sizes, with the smaller one slightly cheaper. We think the price difference is important, because otherwise nobody would choose it." },
          { speaker: 'C', voice: 'david2', text: "We also thought about removing trays. Some American universities found that without trays, students take less food because they can only carry two plates. But the canteen manager said it would cause problems at the till, so we've put that in as a possible future step." },
          { speaker: 'A', voice: 'david', text: "Good, it shows you've considered practical issues. What about the food that is wasted? Does anything happen to it?" },
          { speaker: 'B', voice: 'zira', text: "At the moment it all goes into general rubbish. The city council does collect food waste separately for composting, but the canteen hasn't signed up. The manager said it was because of the cost of the special bins." },
          { speaker: 'A', voice: 'david', text: "Right. Now, when you write this up, I'd like to see more in the section on your method. At the moment, it isn't clear how you decided what counted as waste. Did you include bones, for example, or banana skins?" },
          { speaker: 'C', voice: 'david2', text: "We didn't include them, because people can't eat them. But you're right, we should explain that." },
          { speaker: 'A', voice: 'david', text: "And your literature review is a bit short. You've mainly used newspaper articles. There's quite a lot of academic research on this, particularly from hospitals and schools, so do look at that." },
          { speaker: 'B', voice: 'zira', text: "OK. How long should the whole report be?" },
          { speaker: 'A', voice: 'david', text: "Around four thousand words, not including the appendices. Put the questionnaire in an appendix, not in the main text." },
          { speaker: 'C', voice: 'david2', text: "And one more thing: we'd like to send a copy to the canteen manager. Is that OK?" },
          { speaker: 'A', voice: 'david', text: "I think that's an excellent idea, but send it after it's been marked, so you can include any corrections." },
        ],
        questionGroups: [
          {
            id: 't37-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Why did the students collect data for only two weeks?', options: [{ key: 'A', text: 'They did not have enough time.' }, { key: 'B', text: 'The canteen manager had concerns.' }, { key: 'C', text: 'Two weeks produced enough data.' }], answer: { accepted: ['B'] }, explanationHtml: '"the canteen manager was worried it would slow down the washing-up, so we agreed on two weeks".' },
              { number: 22, promptHtml: 'Which food was wasted most?', options: [{ key: 'A', text: 'vegetables' }, { key: 'B', text: 'meat' }, { key: 'C', text: 'rice and potatoes' }], answer: { accepted: ['C'] }, explanationHtml: '"the most wasted item wasn\'t vegetables ... It was rice and potatoes."' },
              { number: 23, promptHtml: 'According to Daniel, what is the main reason students take too much food?', options: [{ key: 'A', text: 'The price does not depend on the amount.' }, { key: 'B', text: 'The staff give everyone large portions.' }, { key: 'C', text: 'Students are very hungry at lunchtime.' }], answer: { accepted: ['A'] }, explanationHtml: '"mainly ... because the price is the same whatever you take". The staff issue is only "partly".' },
              { number: 24, promptHtml: 'How many replies to the questionnaire did the students receive?', options: [{ key: 'A', text: 'about 40' }, { key: 'B', text: 'about 60' }, { key: 'C', text: 'about 100' }], answer: { accepted: ['B'] }, explanationHtml: '"We\'d hoped to get a hundred replies, and in the end we got about sixty."' },
              { number: 25, promptHtml: 'What did the questionnaire show?', options: [{ key: 'A', text: 'Students were not interested in food waste.' }, { key: 'B', text: 'Students underestimated their own waste.' }, { key: 'C', text: 'Students thought the portions were too small.' }], answer: { accepted: ['B'] }, explanationHtml: '"very few thought they personally wasted much. When we showed them photos ... a lot of them were quite shocked."' },
              { number: 26, promptHtml: 'Why do the students think the smaller portion should cost less?', options: [{ key: 'A', text: 'so that students will actually choose it' }, { key: 'B', text: 'because it costs the canteen less to prepare' }, { key: 'C', text: 'because other universities do this' }], answer: { accepted: ['A'] }, explanationHtml: '"the price difference is important, because otherwise nobody would choose it".' },
              { number: 27, promptHtml: 'What do the students say about removing trays?', options: [{ key: 'A', text: 'It has already been tried in the canteen.' }, { key: 'B', text: 'It would have no effect on waste.' }, { key: 'C', text: 'It could be considered later.' }], answer: { accepted: ['C'] }, explanationHtml: '"we\'ve put that in as a possible future step".' },
              { number: 28, promptHtml: 'Why has the canteen not joined the council\'s food waste collection?', options: [{ key: 'A', text: 'the price of the bins' }, { key: 'B', text: 'a lack of space' }, { key: 'C', text: 'the smell of the waste' }], answer: { accepted: ['A'] }, explanationHtml: '"it was because of the cost of the special bins".' },
              { number: 29, promptHtml: 'What does Dr Green want the students to explain more clearly?', options: [{ key: 'A', text: 'how they chose the canteen' }, { key: 'B', text: 'how they defined waste' }, { key: 'C', text: 'how they designed the questionnaire' }], answer: { accepted: ['B'] }, explanationHtml: '"it isn\'t clear how you decided what counted as waste".' },
              { number: 30, promptHtml: 'What does Dr Green say about the literature review?', options: [{ key: 'A', text: 'It should include more academic sources.' }, { key: 'B', text: 'It should be moved to an appendix.' }, { key: 'C', text: 'It should focus on newspaper articles.' }], answer: { accepted: ['A'] }, explanationHtml: '"You\'ve mainly used newspaper articles. There\'s quite a lot of academic research on this ... do look at that."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about urban heat islands.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning. Today's lecture in our series on urban environments is about a phenomenon that affects almost every large city in the world: the urban heat island. This is the name given to the fact that cities are usually warmer than the countryside around them. The difference is often small during the day, but at night it can be as much as ten degrees Celsius." },
          { speaker: 'A', voice: 'david', text: "Why does this happen? The first cause is the materials cities are built from. Concrete, brick and especially dark surfaces such as asphalt roads absorb a great deal of heat from the sun during the day, and then release it slowly after dark. That's why the effect is strongest at night." },
          { speaker: 'A', voice: 'david', text: "The second cause is the shape of the city itself. In streets between tall buildings, heat that's released from the ground is trapped rather than escaping to the sky. The buildings also reduce wind speed, so the warm air isn't carried away." },
          { speaker: 'A', voice: 'david', text: "Third, there's the lack of vegetation. In the countryside, plants release water through their leaves, and this has a cooling effect, rather like sweating does for the human body. In cities, most rainwater runs straight into drains, so there's far less of this natural cooling." },
          { speaker: 'A', voice: 'david', text: "And finally, cities produce heat of their own, from vehicles, factories and air-conditioning units, which of course push hot air out into the street in order to cool the inside of buildings." },
          { speaker: 'A', voice: 'david', text: "Why does it matter? The most serious effect is on health. During heatwaves, death rates rise sharply in cities, particularly among elderly people, because the body has no chance to recover when nights stay hot. Heat islands also increase energy consumption, because people use more air conditioning, and they can make air pollution worse, since some pollutants form more quickly at high temperatures." },
          { speaker: 'A', voice: 'david', text: "So what can be done? One of the simplest solutions is to change the colour of surfaces. Light-coloured roofs reflect far more sunlight than dark ones. In some American cities, painting roofs white has reduced the temperature inside the top floor of a building by several degrees, and some cities are now experimenting with lighter coloured road surfaces too." },
          { speaker: 'A', voice: 'david', text: "A second approach is to increase the number of trees. Trees provide shade, which keeps surfaces cool, and they release moisture. Studies in Europe have found that a park can reduce temperatures not only inside it but for several hundred metres around it." },
          { speaker: 'A', voice: 'david', text: "Third, there are green roofs, in other words roofs covered with plants. These are more expensive to build, but they also absorb rainwater, which reduces the risk of flooding, and they provide a habitat for insects and birds." },
          { speaker: 'A', voice: 'david', text: "Finally, cities can be designed differently. Planners in some Asian cities now use computer models to identify wind paths, corridors along which cool air can flow into the city from nearby hills or the sea, and they try not to allow tall buildings to block them." },
          { speaker: 'A', voice: 'david', text: "None of these measures is a complete solution on its own, and each has a cost. But as cities grow and summers become hotter, the question of how to keep cities cool is likely to become one of the most important issues facing urban planners." },
        ],
        questionGroups: [
          {
            id: 't37-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Urban heat islands</strong></p>' +
              '<p>Cities are warmer than the countryside, especially at {{q31}}.</p>' +
              '<p><em>Causes</em><br/>• materials, e.g. {{q32}} roads, absorb heat<br/>• tall buildings trap heat and reduce {{q33}}<br/>• lack of vegetation: rainwater goes into {{q34}}<br/>• heat produced by vehicles, factories and {{q35}} units</p>' +
              '<p><em>Effects</em><br/>• higher death rates among {{q36}} during heatwaves<br/>• more energy use and worse air {{q37}}</p>' +
              '<p><em>Solutions</em><br/>• light-coloured {{q38}} reflect sunlight<br/>• trees and parks, plus green roofs, which also reduce {{q39}}<br/>• planners protect {{q40}} that bring cool air into cities</p>',
            questions: [
              { number: 31, answer: { accepted: ['night'] }, explanationHtml: '"at night it can be as much as ten degrees".' },
              { number: 32, answer: { accepted: ['asphalt', 'dark asphalt'] }, explanationHtml: '"dark surfaces such as asphalt roads absorb a great deal of heat".' },
              { number: 33, answer: { accepted: ['wind speed', 'wind'] }, explanationHtml: '"The buildings also reduce wind speed".' },
              { number: 34, answer: { accepted: ['drains'] }, explanationHtml: '"most rainwater runs straight into drains".' },
              { number: 35, answer: { accepted: ['air-conditioning', 'air conditioning'] }, explanationHtml: '"vehicles, factories and air-conditioning units".' },
              { number: 36, answer: { accepted: ['elderly people', 'the elderly', 'elderly'] }, explanationHtml: '"particularly among elderly people".' },
              { number: 37, answer: { accepted: ['pollution'] }, explanationHtml: '"they can make air pollution worse".' },
              { number: 38, answer: { accepted: ['roofs'] }, explanationHtml: '"Light-coloured roofs reflect far more sunlight than dark ones."' },
              { number: 39, answer: { accepted: ['flooding', 'risk of flooding'] }, explanationHtml: 'Green roofs "absorb rainwater, which reduces the risk of flooding".' },
              { number: 40, answer: { accepted: ['wind paths', 'corridors'] }, explanationHtml: '"wind paths, corridors along which cool air can flow into the city".' },
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
        '<p>The chart below shows the percentage of households with access to high-speed internet in five regions of one country in 2010 and 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Households with high-speed internet access (%)',
        unit: '%',
        categories: ['North', 'South', 'East', 'West', 'Capital'],
        xAxisLabel: 'Region',
        yAxisLabel: 'Percentage of households',
        series: [
          { name: '2010', data: [18, 32, 25, 12, 55] },
          { name: '2022', data: [71, 84, 78, 49, 93] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>More and more companies now allow their employees to work from home for part or all of the week.</p><p>Do the advantages of this development outweigh the disadvantages?</p>',
    },
  },
};
