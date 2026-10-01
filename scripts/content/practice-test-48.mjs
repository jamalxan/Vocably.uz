// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

const COWORK_PLAN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#fafafa"/>
  <text x="190" y="22" font-weight="bold" fill="#333">The Hive co-working centre — ground floor</text>
  <rect x="20" y="30" width="560" height="345" fill="#fff" stroke="#333" stroke-width="3"/>
  <rect x="200" y="300" width="200" height="60" fill="#dfe6ef" stroke="#7a8ca3"/>
  <text x="265" y="335" fill="#333">Reception</text>
  <rect x="270" y="368" width="60" height="14" fill="#fff" stroke="#333"/>
  <text x="268" y="396" fill="#333">Entrance</text>
  <rect x="30" y="40" width="160" height="110" fill="#eceff1" stroke="#777"/>
  <rect x="220" y="40" width="160" height="110" fill="#eceff1" stroke="#777"/>
  <rect x="410" y="40" width="160" height="110" fill="#eceff1" stroke="#777"/>
  <rect x="30" y="200" width="140" height="160" fill="#eceff1" stroke="#777"/>
  <rect x="430" y="200" width="140" height="160" fill="#d7ccc8" stroke="#777"/>
  <text x="470" y="285" fill="#4e342e">Café</text>
  <path d="M220 180 H380" stroke="#bbb" stroke-dasharray="6 4"/>
  <text x="250" y="200" fill="#999" font-size="11">open-plan desks</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-48',
  title: 'Vocably Practice Test 48',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Two languages, one brain',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>For much of the twentieth century, parents and teachers in many countries were warned that bringing up children with two languages could be harmful. Early studies, many of them carried out on children from immigrant families who were tested in a language they did not speak well, appeared to show that bilingual children scored lower on intelligence tests. It was widely believed that learning two languages would confuse children, slow their development and hold them back at school. Some families were advised to speak only the majority language at home, even when the parents themselves did not speak it fluently. As a result, many children grew up unable to communicate easily with their grandparents, and some communities lost their traditional languages within a generation or two.</p>" },
          { label: '', html: "<p>Opinion began to change in the 1960s, when researchers in Canada compared bilingual and monolingual children who were carefully matched for social background. To their surprise, the bilingual children performed better on a range of tests, particularly those that required mental flexibility. Over the following decades, a growing number of studies reported that bilingualism might bring benefits beyond language itself. Researchers also realised that the earlier studies had confused bilingualism with poverty and with the difficulties faced by children being educated in an unfamiliar language, factors that had nothing to do with knowing two languages as such.</p>" },
          { label: '', html: "<p>The most influential researcher in this field has been the Canadian psychologist Ellen Bialystok. Her explanation for the apparent advantage was that bilingual people constantly have to manage two languages, both of which are active in the brain at the same time, and must repeatedly suppress the one they are not using. This, she argued, provides continuous practice for the brain's executive control system, the set of abilities that allow us to focus attention, ignore distractions and switch between tasks. In experiments, bilingual children and adults were often faster than monolinguals at tasks that required them to ignore misleading information.</p>" },
          { label: '', html: "<p>Perhaps the most striking claim concerned old age. In 2007, Bialystok and her colleagues examined the medical records of patients at a memory clinic in Toronto and found that bilingual patients had developed the symptoms of dementia around four years later, on average, than monolingual patients. The researchers stressed that bilingualism did not prevent the disease, but suggested that it helped the brain to cope with damage for longer. Similar findings were later reported in other countries, including a large study in India.</p>" },
          { label: '', html: "<p>In recent years, however, the idea of a 'bilingual advantage' has been strongly challenged. The American psychologist Kenneth Paap and his colleagues carried out a series of large studies and found no consistent differences between bilinguals and monolinguals in executive control. They argued that many of the positive findings came from small studies, and that research showing no difference was less likely to be published. Other researchers, including a team in Barcelona led by Albert Costa, found that the advantages they had observed in earlier experiments disappeared when the tasks were repeated several times, suggesting that bilinguals might simply adapt to new tasks more quickly rather than having better control overall.</p>" },
          { label: '', html: "<p>The debate has become one of the most heated in modern psychology. Part of the difficulty is that 'bilingual' covers an enormous range of experience. A child who grows up speaking two languages equally at home is very different from an adult who learned a second language at school and rarely uses it, and it is possible that any benefits depend on how often, and in what ways, the languages are used. Most researchers now agree that the benefits, if they exist, are smaller and less consistent than was once claimed.</p>" },
          { label: '', html: "<p>What is not in dispute is that bilingualism does no harm. The fears of the early twentieth century have been thoroughly rejected, and there is no evidence that children who learn two languages suffer any lasting disadvantage. Moreover, the practical benefits of speaking more than one language, from being able to communicate with relatives to greater opportunities for work and travel, do not depend on any effect on the brain. As one researcher has put it, the best reason to learn a language is to be able to speak it. Whatever the final outcome of the scientific debate, parents who wish to pass on their own language to their children can do so with confidence, and schools that teach second languages from an early age need not fear that they are placing too great a burden on young minds.</p>" },
        ],
        questionGroups: [
          {
            id: 't48-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'Some early studies tested children in a language they did not know well.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: children "tested in a language they did not speak well".' },
              { number: 2, promptHtml: 'The Canadian researchers in the 1960s expected bilingual children to perform better.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "To their surprise, the bilingual children performed better".' },
              { number: 3, promptHtml: 'The Toronto study suggested that bilingualism prevents dementia.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: "bilingualism did not prevent the disease".' },
              { number: 4, promptHtml: 'The study in India involved more patients than the Toronto study.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The Indian study is described as large, but no comparison of numbers is made.' },
            ],
          },
          {
            id: 't48-r1-people',
            type: 'matching_features',
            instructionHtml: 'Look at the following statements and the list of researchers below. Match each statement with the correct researcher, <strong>A-C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Ellen Bialystok' },
              { key: 'B', text: 'Kenneth Paap' },
              { key: 'C', text: 'Albert Costa' },
            ],
            questions: [
              { number: 5, promptHtml: 'Studies that find no effect are less likely to be published.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: Paap argued "research showing no difference was less likely to be published".' },
              { number: 6, promptHtml: 'Bilingual people practise controlling their attention because both languages are always active.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: Bialystok\'s explanation.' },
              { number: 7, promptHtml: 'An advantage seen at first may disappear with repeated testing.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: Costa\'s team found advantages "disappeared when the tasks were repeated".' },
              { number: 8, promptHtml: 'Symptoms of a disease may appear later in bilingual people.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 4: Bialystok\'s team found symptoms appeared about four years later.' },
              { number: 9, promptHtml: 'Large studies have failed to find consistent differences in executive control.', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: Paap "found no consistent differences".' },
            ],
          },
          {
            id: 't48-r1-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-F, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'harm' },
              { key: 'B', text: 'experience' },
              { key: 'C', text: 'intelligence' },
              { key: 'D', text: 'relatives' },
              { key: 'E', text: 'consistent' },
              { key: 'F', text: 'school' },
            ],
            stemHtml:
              '<p><strong>The current view</strong></p><p>The word \'bilingual\' describes a wide range of {{q10}}, and any benefits may depend on how the languages are used. Most researchers accept that benefits are smaller and less {{q11}} than was once thought. However, it is clear that learning two languages does not cause {{q12}}, and there are practical advantages, such as being able to talk to {{q13}}.</p>',
            questions: [
              { number: 10, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 6: "\'bilingual\' covers an enormous range of experience".' },
              { number: 11, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 6: "smaller and less consistent than was once claimed".' },
              { number: 12, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 7: "bilingualism does no harm".' },
              { number: 13, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 7: "being able to communicate with relatives".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Where did the Moon come from?',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>The Moon is by far the largest satellite in the solar system relative to the size of its planet: its diameter is more than a quarter of the Earth's. For centuries, its origin was a mystery, and by the middle of the twentieth century scientists had proposed three main explanations. The first was that the Moon had been captured by the Earth's gravity as it passed close by. The second was that the Earth and the Moon had formed together, side by side, from the same cloud of dust and gas. The third, proposed in the nineteenth century by a son of Charles Darwin, was that the young Earth had spun so fast that a piece broke away.</p>" },
          { label: '', html: "<p>None of these theories was entirely satisfactory. Capturing a body as large as the Moon would be extremely unlikely, because it would have to lose a great deal of energy at exactly the right moment. If the two bodies had formed together, it was hard to explain why the Moon has a very small iron core, whereas the Earth's core is large. And calculations showed that the Earth could never have spun fast enough to throw off a piece of the necessary size.</p>" },
          { label: '', html: "<p>The situation changed after the Apollo missions of 1969 to 1972 brought back almost four hundred kilograms of lunar rock. Analysis showed that the Moon is made of material very similar to the Earth's outer layer, the mantle, but that it contains almost no water or other substances that turn into gas at relatively low temperatures. This suggested that the material had been heated to extremely high temperatures at some point in its history.</p>" },
          { label: '', html: "<p>In the mid-1970s, two groups of scientists independently proposed a new explanation, which has since become known as the giant impact hypothesis. According to this theory, around four and a half billion years ago, when the solar system was still young, a body roughly the size of Mars collided with the early Earth. The impact melted and threw out an enormous quantity of material, most of it from the outer layers of both bodies, into orbit around the Earth, where it gradually came together to form the Moon. Much of the iron from the impacting body would have sunk into the Earth's core, which explains why the Moon has so little.</p>" },
          { label: '', html: "<p>The giant impact hypothesis explains many of the Moon's features, and it is now accepted by most planetary scientists. However, it has faced a serious difficulty. Computer simulations of the collision suggest that most of the Moon's material should have come from the impacting body rather than from the Earth. Yet detailed chemical analysis has shown that the Moon's rocks are almost identical to the Earth's in their chemical 'fingerprint', in particular in the proportions of different forms of oxygen, which usually vary between bodies that formed in different parts of the solar system.</p>" },
          { label: '', html: "<p>Scientists have proposed several ways of solving this puzzle. Perhaps the impacting body formed close to the Earth and therefore had a very similar composition. Perhaps the collision was even more violent than originally thought, so that material from both bodies was thoroughly mixed in a cloud of vapour before the Moon formed. Or perhaps the Moon formed from a series of smaller impacts rather than a single large one. None of these explanations has yet been generally accepted. Future missions that bring back rocks from different parts of the Moon, including its far side, may help to decide between them.</p>" },
          { label: '', html: "<p>One thing that is certain is that the Moon has been moving slowly away from the Earth ever since it formed. Measurements made by bouncing laser beams off reflectors left on the surface by astronauts show that the distance is increasing by almost four centimetres a year. This is caused by the tides: the Moon's gravity raises tides in the Earth's oceans, and the interaction gradually transfers energy from the Earth's rotation to the Moon's orbit. As a result, the Earth's day is also slowly getting longer. When the Moon first formed, it was far closer, and a day on Earth may have lasted only a few hours. Evidence for the changing length of the day can even be found in the fossil record: the growth lines in ancient corals suggest that, several hundred million years ago, a year contained around four hundred days, each of them a little over twenty-one hours long.</p>" },
        ],
        questionGroups: [
          {
            id: 't48-r2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 14, promptHtml: 'Which theory was proposed by a son of Charles Darwin?', options: [{ key: 'A', text: 'The Moon was captured by the Earth.' }, { key: 'B', text: 'The Moon formed next to the Earth.' }, { key: 'C', text: 'A piece broke off the fast-spinning Earth.' }, { key: 'D', text: 'The Moon formed after a collision.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 1: "the young Earth had spun so fast that a piece broke away".' },
              { number: 15, promptHtml: 'Why was the idea that the Earth and Moon formed together unsatisfactory?', options: [{ key: 'A', text: 'The Moon is too large.' }, { key: 'B', text: 'The Moon\'s core is much smaller.' }, { key: 'C', text: 'The Moon contains more water.' }, { key: 'D', text: 'The Moon is too far away.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: it could not explain "why the Moon has a very small iron core".' },
              { number: 16, promptHtml: 'What did the Apollo samples suggest?', options: [{ key: 'A', text: 'The Moon\'s material had once been extremely hot.' }, { key: 'B', text: 'The Moon had once had oceans.' }, { key: 'C', text: 'The Moon was older than the Earth.' }, { key: 'D', text: 'The Moon had a large iron core.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: "the material had been heated to extremely high temperatures".' },
              { number: 17, promptHtml: 'According to the giant impact hypothesis, the body that hit the Earth was', options: [{ key: 'A', text: 'larger than the Earth.' }, { key: 'B', text: 'about the size of Mars.' }, { key: 'C', text: 'made mostly of ice.' }, { key: 'D', text: 'a fragment of the Moon.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 4: "a body roughly the size of Mars".' },
              { number: 18, promptHtml: 'What is the main difficulty with the giant impact hypothesis?', options: [{ key: 'A', text: 'The Moon is chemically very similar to the Earth.' }, { key: 'B', text: 'No computer simulations support it.' }, { key: 'C', text: 'It cannot explain the Moon\'s size.' }, { key: 'D', text: 'The Apollo samples contradict it.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 5: simulations suggest material from the impactor, "Yet ... the Moon\'s rocks are almost identical to the Earth\'s".' },
            ],
          },
          {
            id: 't48-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 19, promptHtml: 'The Moon\'s diameter is more than half that of the Earth.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: it is "more than a quarter of the Earth\'s".' },
              { number: 20, promptHtml: 'The giant impact hypothesis was proposed by two groups working separately.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 4: "two groups of scientists independently proposed a new explanation".' },
              { number: 21, promptHtml: 'All planetary scientists now accept the giant impact hypothesis.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 5: it is "accepted by most planetary scientists".' },
              { number: 22, promptHtml: 'The laser reflectors on the Moon were left by astronauts.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 7: "reflectors left on the surface by astronauts".' },
              { number: 23, promptHtml: 'The Moon will eventually escape from the Earth\'s gravity completely.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage says the Moon is moving away, but not what will eventually happen.' },
            ],
          },
          {
            id: 't48-r2-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-E, below.',
            bank: [
              { key: 'A', text: 'may have had a composition similar to the Earth\'s.' },
              { key: 'B', text: 'is gradually becoming longer.' },
              { key: 'C', text: 'would require the Moon to lose energy at exactly the right time.' },
              { key: 'D', text: 'contains large amounts of water.' },
              { key: 'E', text: 'was caused by volcanic activity.' },
            ],
            questions: [
              { number: 24, promptHtml: 'The capture theory', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 2: "it would have to lose a great deal of energy at exactly the right moment".' },
              { number: 25, promptHtml: 'The body that collided with the Earth', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 6: "Perhaps the impacting body formed close to the Earth and therefore had a very similar composition."' },
              { number: 26, promptHtml: 'The length of a day on Earth', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 7: "the Earth\'s day is also slowly getting longer".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'In praise of amateurs',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Until the late nineteenth century, much of the world's science was carried out by amateurs: clergymen who collected fossils, doctors who studied the stars in their spare time, and wealthy gentlemen who built private laboratories. As science became a profession, based in universities and research institutes, the amateur was gradually pushed to the margins. The word itself came to suggest someone who is not quite serious or competent. I believe this change, though understandable, has led us to undervalue the contribution that non-professionals can make.</p>" },
          { label: 'B', html: "<p>The most obvious contribution is sheer numbers. Many scientific questions require observations over vast areas or long periods of time, far more than any team of professionals could collect. Records of when birds arrive in spring, when trees come into leaf, or how many butterflies are seen in a garden, gathered by thousands of volunteers over decades, now provide some of the most valuable evidence we have about the effects of climate change on wildlife. No research budget could have paid for this work. Some of these records go back more than a century, to a time when keeping a nature diary was a common hobby, and scientists have found that notes made by amateurs long ago can be compared directly with modern observations.</p>" },
          { label: 'C', html: "<p>Amateurs also bring skills that professionals may lack. In astronomy, dedicated enthusiasts with their own telescopes spend far more hours watching the sky than professional astronomers, who must share time on large instruments. As a result, amateurs have discovered a large proportion of the comets and exploding stars reported each year. In some fields, such as the identification of insects or fungi, the leading experts on particular groups are not professional scientists at all, but people who have devoted their free time to the subject for many years.</p>" },
          { label: 'D', html: "<p>The internet has greatly expanded what amateurs can do. In one well-known project, astronomers who had collected images of around a million galaxies asked members of the public to help classify them by shape through a website. The response was overwhelming: within a year, more than a hundred thousand volunteers had made tens of millions of classifications, and their collective judgements proved as reliable as those of experts. The volunteers even made discoveries of their own, including a previously unknown type of galaxy, which was first noticed by a schoolteacher. Similar projects have since asked volunteers to transcribe old weather records from ships' logbooks, to count animals in photographs taken by hidden cameras in the African savannah, and even to fold proteins in a computer game, producing results that helped professional biologists to solve problems that had defeated them for years.</p>" },
          { label: 'E', html: "<p>Critics raise legitimate concerns. Data collected by volunteers can be inconsistent, since people differ in their skill and care, and there is a risk that enthusiastic amateurs will see what they hope to see. Some professional scientists also worry that relying on unpaid volunteers may be used as an excuse to reduce funding for research. These problems are real, but they are not insurmountable. Well-designed projects train their volunteers, check a sample of their work, and use statistical methods to identify and correct errors. In many cases, having several volunteers examine the same piece of data and comparing their answers produces results that are more accurate than those of a single expert working alone.</p>" },
          { label: 'F', html: "<p>Perhaps the greatest benefit of amateur science, however, is not the data it produces but its effect on the people who take part. Volunteers learn how science actually works, with all its uncertainty and patient effort, and many develop a deep and lasting interest in the natural world. At a time when trust in science is often said to be declining, it is hard to think of a better way to build public understanding than to invite people to take part in research themselves. Professional scientists, in my view, should treat amateurs not as helpers to be tolerated but as partners to be welcomed. That means acknowledging their contributions properly, sharing results with them, and listening to their ideas, which are sometimes more original precisely because they come from outside the profession.</p>" },
        ],
        questionGroups: [
          {
            id: 't48-r3-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below.',
            bank: [
              { key: 'i', text: 'Problems that can be overcome' },
              { key: 'ii', text: 'Long-term records that no budget could fund' },
              { key: 'iii', text: 'How the role of amateurs declined' },
              { key: 'iv', text: 'Online projects on a vast scale' },
              { key: 'v', text: 'Expertise found outside universities' },
              { key: 'vi', text: 'Benefits for the volunteers themselves' },
              { key: 'vii', text: 'The cost of scientific equipment' },
            ],
            questions: [
              { number: 27, promptHtml: 'Paragraph A', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph A: "the amateur was gradually pushed to the margins".', locatorParagraph: 'A' },
              { number: 28, promptHtml: 'Paragraph B', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph B: records "gathered by thousands of volunteers over decades ... No research budget could have paid for this work."', locatorParagraph: 'B' },
              { number: 29, promptHtml: 'Paragraph C', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph C: "the leading experts ... are not professional scientists at all".', locatorParagraph: 'C' },
              { number: 30, promptHtml: 'Paragraph D', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph D: "more than a hundred thousand volunteers had made tens of millions of classifications".', locatorParagraph: 'D' },
              { number: 31, promptHtml: 'Paragraph E', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph E: "These problems are real, but they are not insurmountable."', locatorParagraph: 'E' },
              { number: 32, promptHtml: 'Paragraph F', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph F: "its effect on the people who take part".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't48-r3-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-G, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'comets' },
              { key: 'B', text: 'classify' },
              { key: 'C', text: 'schoolteacher' },
              { key: 'D', text: 'telescopes' },
              { key: 'E', text: 'reliable' },
              { key: 'F', text: 'professional' },
              { key: 'G', text: 'photograph' },
            ],
            stemHtml:
              '<p><strong>Amateurs in astronomy</strong></p><p>Amateur astronomers with their own equipment discover many of the {{q33}} and exploding stars reported every year. In one online project, members of the public were asked to {{q34}} images of galaxies, and their results were as {{q35}} as those of experts. A new type of galaxy was first spotted by a {{q36}}.</p>',
            questions: [
              { number: 33, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph C: "amateurs have discovered a large proportion of the comets and exploding stars".', locatorParagraph: 'C' },
              { number: 34, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph D: "asked members of the public to help classify them".', locatorParagraph: 'D' },
              { number: 35, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph D: "their collective judgements proved as reliable as those of experts".', locatorParagraph: 'D' },
              { number: 36, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: "first noticed by a schoolteacher".', locatorParagraph: 'D' },
            ],
          },
          {
            id: 't48-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 37, promptHtml: 'The contribution of non-professionals to science is now generally undervalued.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph A: "this change ... has led us to undervalue the contribution that non-professionals can make".' },
              { number: 38, promptHtml: 'Concerns about the quality of volunteer data are unjustified.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph E: "Critics raise legitimate concerns."' },
              { number: 39, promptHtml: 'Amateur scientists should be paid for their work.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer mentions unpaid volunteers but does not say whether they should be paid.' },
              { number: 40, promptHtml: 'Professional scientists should regard amateurs as partners.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph F: they "should treat amateurs ... as partners to be welcomed".' },
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
        contextText: 'You will hear a man phoning an adult education college to ask about evening classes.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good evening, Westbrook Adult College, enquiries." },
          { speaker: 'B', voice: 'david', text: "Hello. I'm interested in doing an evening class this autumn, and I'd like some information about a few of them." },
          { speaker: 'A', voice: 'zira', text: "Of course. Which ones?" },
          { speaker: 'B', voice: 'david', text: "First, the photography course. When does that run?" },
          { speaker: 'A', voice: 'zira', text: "Digital Photography is on Monday evenings, in Room 12. It's ninety-five pounds for ten weeks. You'll need your own camera, but a phone camera is fine for the first few weeks." },
          { speaker: 'B', voice: 'david', text: "OK. And what about the Spanish course?" },
          { speaker: 'A', voice: 'zira', text: "Conversational Spanish is on Wednesdays, in the language lab. It costs a hundred and ten pounds, and that includes the textbook." },
          { speaker: 'B', voice: 'david', text: "And I saw something about woodwork." },
          { speaker: 'A', voice: 'zira', text: "Yes, Furniture Making. That's on Thursdays, in the workshop behind the main building. It's more expensive, a hundred and sixty pounds, because it includes all the wood and materials. And you'll need to buy safety glasses, which we sell at reception for five pounds." },
          { speaker: 'B', voice: 'david', text: "Is there anything on Tuesdays?" },
          { speaker: 'A', voice: 'zira', text: "Creative Writing is on Tuesday evenings. It's in the library, and it's eighty pounds." },
          { speaker: 'B', voice: 'david', text: "Right. Now, I've never done any photography before, apart from holiday snaps. Is the course suitable for beginners?" },
          { speaker: 'A', voice: 'zira', text: "Yes, the photography course is for complete beginners. The Spanish course, though, is for people who already have some Spanish, at an intermediate level. You'd need to be able to hold a simple conversation." },
          { speaker: 'B', voice: 'david', text: "I did Spanish at school, but that was a long time ago. And the furniture course?" },
          { speaker: 'A', voice: 'zira', text: "That's open to all levels. The tutor gives each person a project that suits their experience, so beginners make something simple, like a small stool, while more experienced people can make a table or a cabinet." },
          { speaker: 'B', voice: 'david', text: "That sounds good. I think I'll go for the photography course, then. How do I enrol?" },
          { speaker: 'A', voice: 'zira', text: "You can enrol online or come to the college in person. The first class is on the fifteenth of September." },
        ],
        questionGroups: [
          {
            id: 't48-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['Course', 'Day', 'Place', 'Cost', 'Notes'],
              [
                ['Digital Photography', 'Monday', 'Room {{q1}}', '£95', 'need own {{q2}}'],
                ['Conversational Spanish', 'Wednesday', 'language lab', '£110', 'includes the {{q3}}'],
                ['Furniture Making', '{{q4}}', 'the workshop', '£{{q5}}', 'buy safety {{q6}} at reception'],
                ['Creative Writing', 'Tuesday', 'the {{q7}}', '£80', ''],
              ]
            ),
            questions: [
              { number: 1, answer: { accepted: ['12', 'twelve'] }, explanationHtml: '"on Monday evenings, in Room 12".' },
              { number: 2, answer: { accepted: ['camera'] }, explanationHtml: '"You\'ll need your own camera".' },
              { number: 3, answer: { accepted: ['textbook'] }, explanationHtml: '"that includes the textbook".' },
              { number: 4, answer: { accepted: ['thursday', 'thursdays'] }, explanationHtml: '"That\'s on Thursdays".' },
              { number: 5, answer: { accepted: ['160'] }, explanationHtml: '"a hundred and sixty pounds".' },
              { number: 6, answer: { accepted: ['glasses'] }, explanationHtml: '"you\'ll need to buy safety glasses".' },
              { number: 7, answer: { accepted: ['library'] }, explanationHtml: '"It\'s in the library".' },
            ],
          },
          {
            id: 't48-l1-levels',
            type: 'matching_features',
            instructionHtml: 'Which level is each course suitable for? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'beginners' },
              { key: 'B', text: 'intermediate students' },
              { key: 'C', text: 'all levels' },
            ],
            questions: [
              { number: 8, promptHtml: 'Digital Photography', answer: { accepted: ['A'] }, explanationHtml: '"the photography course is for complete beginners".' },
              { number: 9, promptHtml: 'Conversational Spanish', answer: { accepted: ['B'] }, explanationHtml: '"at an intermediate level".' },
              { number: 10, promptHtml: 'Furniture Making', answer: { accepted: ['C'] }, explanationHtml: '"That\'s open to all levels."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the manager of a new co-working centre giving a tour to new members.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Welcome to The Hive, everyone. I'm Jonathan, the centre manager. As new members, you'll be using the building in different ways, so let me explain what we offer and then show you round the ground floor." },
          { speaker: 'A', voice: 'david', text: "First, membership types. Our Flexible members can use any free desk in the open-plan area. Please remember that it's first come, first served, and you need to clear your desk at the end of the day." },
          { speaker: 'A', voice: 'david', text: "Fixed-desk members have their own desk, with a lockable drawer, and they can leave their things there overnight." },
          { speaker: 'A', voice: 'david', text: "Some of you have booked private offices. Those are on the first floor, and they're available twenty-four hours a day." },
          { speaker: 'A', voice: 'david', text: "Now, some services. The printers are in the corridor next to reception. Printing is included in all memberships, up to a limit, and after that there's a small charge." },
          { speaker: 'A', voice: 'david', text: "Post and deliveries can be sent to the centre's address, and they're kept at reception until you collect them. Please collect them within a week." },
          { speaker: 'A', voice: 'david', text: "The phone booths are small soundproof rooms for private calls. They can't be booked in advance; just use one if it's free, but please keep calls to under thirty minutes." },
          { speaker: 'A', voice: 'david', text: "The kitchen is shared by everyone. Tea and coffee are free, and there's a fridge where you can keep your lunch. Please label anything you put in it." },
          { speaker: 'A', voice: 'david', text: "And we organise regular events, such as talks and breakfasts, where members can meet each other. They're free for members, and they're the best way to make contacts." },
          { speaker: 'A', voice: 'david', text: "Right, let's look at the plan. We're at the entrance, at the bottom. Reception is directly in front of you, and the open-plan desks are in the centre of the floor." },
          { speaker: 'A', voice: 'david', text: "In the bottom right-hand corner is the café, which is also open to the public. And in the bottom left-hand corner, opposite the café, is the kitchen." },
          { speaker: 'A', voice: 'david', text: "Along the back wall, there are three rooms. The one in the middle, directly opposite reception, is the large meeting room, which you can book online. The room on the right is the quiet room, where phones and conversations aren't allowed. And the room on the left, in the top left-hand corner, is where the phone booths are." },
        ],
        questionGroups: [
          {
            id: 't48-l2-services',
            type: 'matching_features',
            instructionHtml:
              'What does Jonathan say about each of the following? Choose <strong>SIX</strong> answers from the box and write the correct letter, A-G, next to Questions 11-16.',
            bank: [
              { key: 'A', text: 'available at any time of day or night' },
              { key: 'B', text: 'must be cleared daily' },
              { key: 'C', text: 'free up to a certain amount' },
              { key: 'D', text: 'must be collected within a week' },
              { key: 'E', text: 'cannot be reserved' },
              { key: 'F', text: 'items must have a name on them' },
              { key: 'G', text: 'only open on weekdays' },
            ],
            questions: [
              { number: 11, promptHtml: 'flexible desks', answer: { accepted: ['B'] }, explanationHtml: '"you need to clear your desk at the end of the day".' },
              { number: 12, promptHtml: 'private offices', answer: { accepted: ['A'] }, explanationHtml: '"they\'re available twenty-four hours a day".' },
              { number: 13, promptHtml: 'printing', answer: { accepted: ['C'] }, explanationHtml: '"Printing is included ... up to a limit, and after that there\'s a small charge."' },
              { number: 14, promptHtml: 'post and deliveries', answer: { accepted: ['D'] }, explanationHtml: '"Please collect them within a week."' },
              { number: 15, promptHtml: 'phone booths', answer: { accepted: ['E'] }, explanationHtml: '"They can\'t be booked in advance".' },
              { number: 16, promptHtml: 'the fridge', answer: { accepted: ['F'] }, explanationHtml: '"Please label anything you put in it."' },
            ],
          },
          {
            id: 't48-l2-plan',
            type: 'plan_label',
            instructionHtml: 'Label the plan below. Choose the correct letter, <strong>A-F</strong>, for each numbered room.',
            imageUrl: COWORK_PLAN,
            imageAlt: 'Ground-floor plan: the entrance and reception are at the bottom centre, open-plan desks in the middle, a café in the bottom right corner, a room in the bottom left corner, and three rooms along the back wall.',
            bank: [
              { key: 'A', text: 'Kitchen' },
              { key: 'B', text: 'Meeting room' },
              { key: 'C', text: 'Quiet room' },
              { key: 'D', text: 'Phone booths' },
              { key: 'E', text: 'Private offices' },
              { key: 'F', text: 'Printers' },
            ],
            imageHotspots: [
              { questionNumber: 17, x: 17, y: 70 },
              { questionNumber: 18, x: 50, y: 24 },
              { questionNumber: 19, x: 82, y: 24 },
              { questionNumber: 20, x: 18, y: 24 },
            ],
            questions: [
              { number: 17, answer: { accepted: ['A'] }, explanationHtml: '"in the bottom left-hand corner, opposite the café, is the kitchen".' },
              { number: 18, answer: { accepted: ['B'] }, explanationHtml: '"The one in the middle, directly opposite reception, is the large meeting room".' },
              { number: 19, answer: { accepted: ['C'] }, explanationHtml: '"The room on the right is the quiet room".' },
              { number: 20, answer: { accepted: ['D'] }, explanationHtml: '"the room on the left, in the top left-hand corner, is where the phone booths are".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a student, Zara, talking to her tutor about her research into how people decide which news to trust.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "So, Zara, how's your research on trust in news going?" },
          { speaker: 'B', voice: 'zira', text: "Quite well. I've finished the interviews. I spoke to thirty people, a mix of students and people from the local community." },
          { speaker: 'A', voice: 'david', text: "Good. And how did you choose them?" },
          { speaker: 'B', voice: 'zira', text: "I put notices in the library and the community centre. I'd wanted to include some older people, over seventy, but I couldn't find any who were willing, so that's a gap." },
          { speaker: 'A', voice: 'david', text: "You should mention that in your limitations section. What did you find about how people decide whether to trust a news story?" },
          { speaker: 'B', voice: 'zira', text: "The two things people mentioned most were whether the story came from a well-known organisation, and whether it was shared by someone they knew personally. Very few people said they checked the evidence themselves." },
          { speaker: 'A', voice: 'david', text: "That fits with other research. Was there anything that surprised you?" },
          { speaker: 'B', voice: 'zira', text: "Two things, really. One was how many people said they deliberately avoid the news, because they find it depressing. And the other was that the students were more sceptical than the older participants, which is the opposite of what I expected." },
          { speaker: 'A', voice: 'david', text: "Interesting. And in terms of methods, did the interviews work well?" },
          { speaker: 'B', voice: 'zira', text: "Mostly. I think recording them was the right decision. And asking people to look at real headlines during the interview worked really well, because it made the discussion much more concrete. What didn't work so well was the questionnaire I gave them first. It was too long, and people got bored." },
          { speaker: 'A', voice: 'david', text: "OK. Now, you'll need to decide how to analyse the data. Are you planning to use the coding software?" },
          { speaker: 'B', voice: 'zira', text: "I was going to, but I've only got thirty interviews, so I think I'll do it by hand. It'll help me get to know the data better." },
          { speaker: 'A', voice: 'david', text: "That's reasonable with thirty. What about presenting your findings? Some students use a lot of quotations." },
          { speaker: 'B', voice: 'zira', text: "I'd like to use quotations, because they show people's actual words. But I'll also include some tables summarising the main patterns." },
          { speaker: 'A', voice: 'david', text: "Good balance. And for the conclusion, what do you think the main message will be?" },
          { speaker: 'B', voice: 'zira', text: "That people trust the source more than the content. It's who tells them the story that matters." },
          { speaker: 'A', voice: 'david', text: "Right. One more thing: have you thought about what you'd do differently if you had more time?" },
          { speaker: 'B', voice: 'zira', text: "I'd like to follow some of the participants over a few months, to see whether their views change. A one-off interview only gives a snapshot." },
          { speaker: 'A', voice: 'david', text: "That would be a good recommendation for future research. When can you send me a draft?" },
          { speaker: 'B', voice: 'zira', text: "By the end of the month, I hope." },
        ],
        questionGroups: [
          {
            id: 't48-l3-multi1',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 21,
                promptHtml: 'Which TWO factors did participants mention most when deciding whether to trust news?',
                options: [
                  { key: 'A', text: 'the reputation of the organisation' },
                  { key: 'B', text: 'the quality of the writing' },
                  { key: 'C', text: 'whether it was shared by someone they knew' },
                  { key: 'D', text: 'whether it included photographs' },
                  { key: 'E', text: 'the evidence given' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: '"whether the story came from a well-known organisation, and whether it was shared by someone they knew personally".',
              },
            ],
          },
          {
            id: 't48-l3-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 22,
                promptHtml: 'Which TWO findings surprised Zara?',
                options: [
                  { key: 'A', text: 'Many people avoid the news on purpose.' },
                  { key: 'B', text: 'Few people read newspapers.' },
                  { key: 'C', text: 'Students were more sceptical than older people.' },
                  { key: 'D', text: 'Most people check the evidence.' },
                  { key: 'E', text: 'People trust television more than websites.' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: '"how many people said they deliberately avoid the news" and "the students were more sceptical than the older participants".',
              },
            ],
          },
          {
            id: 't48-l3-multi3',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 23,
                promptHtml: 'Which TWO aspects of her method does Zara think worked well?',
                options: [
                  { key: 'A', text: 'the initial questionnaire' },
                  { key: 'B', text: 'recording the interviews' },
                  { key: 'C', text: 'interviewing people in groups' },
                  { key: 'D', text: 'using real headlines' },
                  { key: 'E', text: 'the notices in the library' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"recording them was the right decision" and "asking people to look at real headlines ... worked really well". The questionnaire was too long.',
              },
            ],
          },
          {
            id: 't48-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 24, promptHtml: 'How many people did Zara interview?', options: [{ key: 'A', text: '20' }, { key: 'B', text: '30' }, { key: 'C', text: '70' }], answer: { accepted: ['B'] }, explanationHtml: '"I spoke to thirty people".' },
              { number: 25, promptHtml: 'What gap does Zara mention in her sample?', options: [{ key: 'A', text: 'There were no students.' }, { key: 'B', text: 'There were no people over seventy.' }, { key: 'C', text: 'There were too few women.' }], answer: { accepted: ['B'] }, explanationHtml: '"I\'d wanted to include some older people, over seventy, but I couldn\'t find any".' },
              { number: 26, promptHtml: 'How will Zara analyse her data?', options: [{ key: 'A', text: 'by hand' }, { key: 'B', text: 'using software' }, { key: 'C', text: 'with help from another student' }], answer: { accepted: ['A'] }, explanationHtml: '"I think I\'ll do it by hand."' },
              { number: 27, promptHtml: 'How will Zara present her findings?', options: [{ key: 'A', text: 'using quotations and tables' }, { key: 'B', text: 'using only quotations' }, { key: 'C', text: 'using graphs and statistics' }], answer: { accepted: ['A'] }, explanationHtml: '"I\'d like to use quotations ... But I\'ll also include some tables".' },
              { number: 28, promptHtml: 'What will be the main message of her conclusion?', options: [{ key: 'A', text: 'People trust the content more than the source.' }, { key: 'B', text: 'People trust the source more than the content.' }, { key: 'C', text: 'People do not trust any news.' }], answer: { accepted: ['B'] }, explanationHtml: '"people trust the source more than the content".' },
              { number: 29, promptHtml: 'What would Zara do with more time?', options: [{ key: 'A', text: 'interview more people' }, { key: 'B', text: 'study people over several months' }, { key: 'C', text: 'compare different countries' }], answer: { accepted: ['B'] }, explanationHtml: '"I\'d like to follow some of the participants over a few months".' },
              { number: 30, promptHtml: 'When will Zara send her draft?', options: [{ key: 'A', text: 'next week' }, { key: 'B', text: 'by the end of the month' }, { key: 'C', text: 'after the holidays' }], answer: { accepted: ['B'] }, explanationHtml: '"By the end of the month, I hope."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about coffee houses in seventeenth-century England.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "In today's lecture on social history, I'm going to talk about an institution that played a surprisingly important role in the development of modern Britain: the coffee house." },
          { speaker: 'A', voice: 'david', text: "Coffee originated in Ethiopia and was drunk widely in the Arab world and the Ottoman Empire long before it reached Europe. The first coffee house in England opened in Oxford in 1650, and two years later, the first in London was opened by a Greek servant who had been brought to England by a merchant who'd acquired the coffee-drinking habit in Turkey." },
          { speaker: 'A', voice: 'david', text: "Coffee houses spread extremely rapidly. By the end of the century, there were hundreds of them in London alone. Part of their appeal was that coffee, unlike beer or wine, didn't make people drunk, so they could stay alert while talking or doing business." },
          { speaker: 'A', voice: 'david', text: "But the main attraction was the conversation. For the price of a penny, which paid for entry and a cup of coffee, anyone could sit down and join in the discussions. This is why coffee houses were sometimes called 'penny universities'. Social rank was supposed to be ignored: a customer was expected to sit in the first empty seat, whoever was next to him." },
          { speaker: 'A', voice: 'david', text: "I say 'him' deliberately, because coffee houses were almost entirely male spaces. In 1674, a pamphlet appeared, supposedly written by a group of women, complaining that their husbands spent all their time in coffee houses and came home exhausted and useless. Whether it was really written by women, we don't know." },
          { speaker: 'A', voice: 'david', text: "Coffee houses were centres of news. Newspapers were provided for customers to read, and many people went there specifically to hear the latest reports. This made the government nervous. In 1675, King Charles the Second issued a proclamation ordering all coffee houses to close, because he believed they were places where people spread false rumours and criticised the government. The public reaction was so strong that the order was withdrawn within about ten days." },
          { speaker: 'A', voice: 'david', text: "Different coffee houses attracted different groups. Some were popular with scientists, and there are records of experiments and even dissections of fish being carried out at the tables. Others were used by writers, and others by merchants." },
          { speaker: 'A', voice: 'david', text: "In fact, several important modern institutions began in coffee houses. A coffee house owned by Edward Lloyd became the place where ship owners and merchants met to arrange insurance for their voyages, and this developed into one of the world's most famous insurance markets. Similarly, traders who bought and sold shares met in another coffee house, and this eventually became the London Stock Exchange." },
          { speaker: 'A', voice: 'david', text: "In the eighteenth century, coffee houses gradually declined. Tea, which was increasingly drunk at home, became more popular than coffee, and many of the wealthier customers moved to private clubs, which had membership fees and were more exclusive. But the idea of a public space where people could meet, read the news and exchange ideas had a lasting influence." },
        ],
        questionGroups: [
          {
            id: 't48-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Coffee houses in seventeenth-century England</strong></p>' +
              '<p><em>Origins</em><br/>• coffee originated in {{q31}}<br/>• first English coffee house opened in {{q32}} in 1650</p>' +
              '<p><em>Appeal</em><br/>• coffee did not make people {{q33}}<br/>• called \'penny {{q34}}\'<br/>• social {{q35}} was supposed to be ignored</p>' +
              '<p><em>Politics</em><br/>• 1674: a {{q36}} complained about husbands spending time there<br/>• 1675: the King ordered them to close, but the order was withdrawn</p>' +
              '<p><em>Uses</em><br/>• scientists carried out {{q37}} at tables<br/>• Lloyd\'s coffee house: merchants arranged {{q38}}<br/>• another became the Stock {{q39}}</p>' +
              '<p><em>Decline</em><br/>• tea became more popular; wealthy customers moved to private {{q40}}</p>',
            questions: [
              { number: 31, answer: { accepted: ['ethiopia'] }, explanationHtml: '"Coffee originated in Ethiopia".' },
              { number: 32, answer: { accepted: ['oxford'] }, explanationHtml: '"The first coffee house in England opened in Oxford in 1650".' },
              { number: 33, answer: { accepted: ['drunk'] }, explanationHtml: '"coffee, unlike beer or wine, didn\'t make people drunk".' },
              { number: 34, answer: { accepted: ['universities'] }, explanationHtml: '"coffee houses were sometimes called \'penny universities\'".' },
              { number: 35, answer: { accepted: ['rank'] }, explanationHtml: '"Social rank was supposed to be ignored".' },
              { number: 36, answer: { accepted: ['pamphlet'] }, explanationHtml: '"In 1674, a pamphlet appeared ... complaining that their husbands spent all their time in coffee houses".' },
              { number: 37, answer: { accepted: ['experiments', 'dissections'] }, explanationHtml: '"there are records of experiments and even dissections of fish being carried out at the tables".' },
              { number: 38, answer: { accepted: ['insurance'] }, explanationHtml: '"ship owners and merchants met to arrange insurance".' },
              { number: 39, answer: { accepted: ['exchange'] }, explanationHtml: '"this eventually became the London Stock Exchange".' },
              { number: 40, answer: { accepted: ['clubs'] }, explanationHtml: '"many of the wealthier customers moved to private clubs".' },
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
        '<p>The chart below shows the average number of hours of sleep per night reported by people in different age groups in one country in 2005 and 2023.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Average hours of sleep per night',
        unit: 'hours',
        categories: ['13-17', '18-29', '30-44', '45-59', '60+'],
        xAxisLabel: 'Age group',
        yAxisLabel: 'Hours',
        series: [
          { name: '2005', data: [8.1, 7.6, 7.2, 7.0, 7.3] },
          { name: '2023', data: [7.2, 7.1, 6.8, 6.9, 7.4] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people believe that governments should spend money on exploring space. Others think this money should be spent on solving problems on Earth.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
