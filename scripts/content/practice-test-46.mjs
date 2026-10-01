// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { svgDataUri, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

const WAREHOUSE_PLAN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#fafafa"/>
  <text x="200" y="22" font-weight="bold" fill="#333">Food bank warehouse — ground floor</text>
  <rect x="20" y="30" width="560" height="345" fill="#fff" stroke="#333" stroke-width="3"/>
  <rect x="30" y="40" width="120" height="90" fill="#eceff1" stroke="#777"/>
  <rect x="160" y="40" width="120" height="90" fill="#eceff1" stroke="#777"/>
  <rect x="290" y="40" width="120" height="90" fill="#eceff1" stroke="#777"/>
  <rect x="420" y="40" width="150" height="90" fill="#d7ccc8" stroke="#777"/>
  <text x="455" y="90" fill="#4e342e">Loading bay</text>
  <rect x="30" y="150" width="100" height="100" fill="#eceff1" stroke="#777"/>
  <rect x="470" y="150" width="100" height="100" fill="#eceff1" stroke="#777"/>
  <rect x="250" y="170" width="100" height="60" fill="#dfe6ef" stroke="#7a8ca3"/>
  <text x="265" y="205" fill="#333">Reception</text>
  <rect x="60" y="270" width="180" height="90" fill="#eceff1" stroke="#777"/>
  <rect x="360" y="270" width="180" height="90" fill="#eceff1" stroke="#777"/>
  <rect x="270" y="368" width="60" height="14" fill="#fff" stroke="#333"/>
  <text x="268" y="396" fill="#333">Entrance</text>
</svg>`);

const CABLE_DIAGRAM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="360" fill="#f7f9fb"/>
  <text x="150" y="24" font-weight="bold" fill="#333">Cross-section of the 1866 Atlantic telegraph cable</text>
  <circle cx="300" cy="190" r="140" fill="#9e9e9e" stroke="#424242"/>
  <g fill="#616161" stroke="#212121">
    <circle cx="300" cy="62" r="12"/><circle cx="364" cy="80" r="12"/><circle cx="410" cy="126" r="12"/><circle cx="428" cy="190" r="12"/>
    <circle cx="410" cy="254" r="12"/><circle cx="364" cy="300" r="12"/><circle cx="300" cy="318" r="12"/><circle cx="236" cy="300" r="12"/>
    <circle cx="190" cy="254" r="12"/><circle cx="172" cy="190" r="12"/><circle cx="190" cy="126" r="12"/><circle cx="236" cy="80" r="12"/>
  </g>
  <circle cx="300" cy="190" r="100" fill="#c8a165" stroke="#8d6e63"/>
  <circle cx="300" cy="190" r="55" fill="#4e342e"/>
  <circle cx="300" cy="190" r="18" fill="#ef8f3a" stroke="#b35c00"/>
</svg>`);

export default {
  slug: 'vocably-practice-test-46',
  title: 'Vocably Practice Test 46',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'A wire across the ocean',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>In the middle of the nineteenth century, news travelled between Europe and North America no faster than a ship could carry it, which meant about ten days at best. The electric telegraph had already transformed communication on land, allowing messages to be sent across a country in minutes, and short underwater cables had been laid across rivers and narrow seas, including the channel between England and France in 1851. But the Atlantic Ocean, more than three thousand kilometres wide and in places over four kilometres deep, was a different matter.</p>" },
          { label: '', html: "<p>The project was driven by an American businessman, Cyrus Field, who had made a fortune in the paper trade and had no technical knowledge of telegraphy. In 1854 he began raising money in both the United States and Britain, and in 1856 the Atlantic Telegraph Company was founded in London. A survey of the ocean floor had found a broad, relatively flat area between Ireland and Newfoundland, which was named 'Telegraph Plateau', and it was along this route that the cable would be laid. Neither government was willing to take on the risk alone, but both agreed to provide ships from their navies to help lay the cable and to pay an annual subsidy if it worked. Field made dozens of crossings of the Atlantic over the following years, persuading investors to continue supporting a project that many regarded as hopeless.</p>" },
          { label: '', html: "<p>The first attempt, in 1857, ended in failure when the cable broke after only a few hundred kilometres had been laid. The following year, two ships met in the middle of the ocean, joined their halves of the cable, and sailed in opposite directions. After several more breaks, the cable was finally completed in August 1858. The celebrations on both sides of the Atlantic were enormous, with fireworks, parades and church services. A message of greeting from Queen Victoria to the American president, just ninety-eight words long, took around sixteen hours to transmit.</p>" },
          { label: '', html: "<p>The success was short-lived. The signals became steadily weaker, and after about three weeks the cable stopped working altogether. Part of the blame fell on the company's chief electrician, who believed that high voltages were needed to push signals through such a long cable, and who applied such powerful currents that the insulation was damaged. A rival scientist, William Thomson, later Lord Kelvin, had argued that the answer was not more power but more sensitive instruments, and he had developed a device that could detect very weak currents.</p>" },
          { label: '', html: "<p>An official investigation carried out after the failure produced a detailed set of recommendations on the design, manufacture and testing of cables, but the outbreak of civil war in the United States delayed further attempts. When work resumed, the company had access to a remarkable ship, the Great Eastern, which was five times larger than any other vessel afloat and could carry the entire length of cable in a single load. In 1865 the ship set out from Ireland, but the cable broke when two thirds of it had been laid, and attempts to lift it from the ocean floor failed.</p>" },
          { label: '', html: "<p>In July 1866 the Great Eastern tried again, and this time the cable was landed successfully in Newfoundland. The crew then returned to the spot where the 1865 cable had been lost, lowered a large hook on a rope several kilometres long, and after many attempts managed to raise the broken end from the sea bed. They joined it to new cable and completed it, so that by September two working cables crossed the Atlantic. Messages that had taken ten days could now be sent in minutes.</p>" },
          { label: '', html: "<p>The design of the successful cable reflected the lessons of the earlier failures. At its centre was a conductor made of seven twisted strands of copper, which was purer and thicker than in the first cable, so that it carried signals more efficiently. This was surrounded by several layers of gutta-percha, a natural rubber-like material from the sap of a Malaysian tree, which remained an excellent insulator even under the cold and pressure of the deep ocean. Around this was a thick layer of tarred hemp, and on the outside, protecting the whole cable, were strands of iron wire, each one also wrapped in hemp. The resulting cable was stronger and yet lighter in water than its predecessors.</p>" },
        ],
        questionGroups: [
          {
            id: 't46-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'Underwater cables had been used before the Atlantic project.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "short underwater cables had been laid across rivers and narrow seas".' },
              { number: 2, promptHtml: 'Cyrus Field had trained as a telegraph engineer.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: he "had no technical knowledge of telegraphy".' },
              { number: 3, promptHtml: 'Most of the money for the project came from Britain.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 2 says he raised money in both countries, but not where most of it came from.' },
              { number: 4, promptHtml: 'Queen Victoria\'s message was transmitted in a few minutes.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: it "took around sixteen hours to transmit".' },
            ],
          },
          {
            id: 't46-r1-dates',
            type: 'matching_features',
            instructionHtml: 'Look at the following events and the list of dates below. Match each event with the correct date, <strong>A-G</strong>.',
            bank: [
              { key: 'A', text: '1851' },
              { key: 'B', text: '1854' },
              { key: 'C', text: '1856' },
              { key: 'D', text: '1857' },
              { key: 'E', text: '1858' },
              { key: 'F', text: '1865' },
              { key: 'G', text: '1866' },
            ],
            questions: [
              { number: 5, promptHtml: 'A company to build the cable was established.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 2: "in 1856 the Atlantic Telegraph Company was founded in London".' },
              { number: 6, promptHtml: 'A cable was brought up from the ocean floor.', answer: { accepted: ['G'] }, explanationHtml: 'Paragraph 6: in 1866 the crew "managed to raise the broken end from the sea bed".' },
              { number: 7, promptHtml: 'Two ships started laying cable from the middle of the ocean.', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 3: "The following year [1858], two ships met in the middle of the ocean".' },
              { number: 8, promptHtml: 'A cable was lost when it broke after most of it had been laid.', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph 5: in 1865 "the cable broke when two thirds of it had been laid".' },
            ],
          },
          {
            id: 't46-r1-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            imageUrl: CABLE_DIAGRAM,
            imageAlt: 'Circular cross-section of a cable: a small orange core in the centre, surrounded by a dark layer, then a wide light-brown layer, then a ring of twelve round grey strands on the outside.',
            imageHotspots: [
              { questionNumber: 9, x: 50, y: 53 },
              { questionNumber: 10, x: 57, y: 53 },
              { questionNumber: 11, x: 50, y: 31 },
              { questionNumber: 12, x: 71, y: 53 },
              { questionNumber: 13, x: 57, y: 19 },
            ],
            questions: [
              { number: 9, answer: { accepted: ['copper', 'copper strands'] }, explanationHtml: 'Paragraph 7: "a conductor made of seven twisted strands of copper".' },
              { number: 10, answer: { accepted: ['gutta-percha', 'gutta percha'] }, explanationHtml: 'Paragraph 7: "surrounded by several layers of gutta-percha".' },
              { number: 11, answer: { accepted: ['tarred hemp', 'hemp'] }, explanationHtml: 'Paragraph 7: "Around this was a thick layer of tarred hemp".' },
              { number: 12, answer: { accepted: ['iron wire', 'iron wires'] }, explanationHtml: 'Paragraph 7: "on the outside ... were strands of iron wire".' },
              { number: 13, answer: { accepted: ['hemp'] }, explanationHtml: 'Paragraph 7: each iron wire was "also wrapped in hemp".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The book nobody can read',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>In a rare books library at an American university, there is a small, unremarkable-looking volume of about 240 pages, written on animal skin. It is filled with drawings of plants that no botanist has been able to identify, diagrams of stars and circles, and pictures of small human figures bathing in pools connected by pipes. Every page is covered in neat, flowing handwriting in an alphabet of some twenty to thirty characters. The problem is that nobody knows what language it is written in, or even whether it is a language at all. For more than a century, the book has defeated linguists, historians, professional code-breakers and, more recently, computer scientists.</p>" },
          { label: 'B', html: "<p>The manuscript is usually known by the name of Wilfrid Voynich, a book dealer who bought it in 1912 from a religious college in Italy. A letter found inside suggested that it had once belonged to the Holy Roman Emperor Rudolf II, who was famous for collecting curiosities and is said to have paid a large sum for it. Its history before that is unknown. Voynich himself believed it was the work of the thirteenth-century English philosopher Roger Bacon, and spent the rest of his life trying to prove it. After his death, the manuscript passed through several owners before being given to the university library in 1969, where it has been kept ever since and is one of the most requested items in the collection.</p>" },
          { label: 'C', html: "<p>That theory was undermined in 2009, when scientists used radiocarbon dating to establish the age of the animal skin on which the book is written. The results showed that it was produced in the early fifteenth century, between about 1404 and 1438, long after Bacon's death. Analysis of the ink found that it was consistent with inks used at that time. Although it is possible that old skin was used at a later date, most researchers now accept that the manuscript was created in the early fifteenth century, probably somewhere in central Europe.</p>" },
          { label: 'D', html: "<p>The most sceptical explanation is that the book is an elaborate hoax, perhaps created to be sold to a wealthy collector such as Rudolf. In 2004, a British computer scientist demonstrated that text with many of the manuscript's features could be produced using a simple device: a card with holes cut in it, placed over a table of syllables. The words produced in this way looked meaningful but contained no message. Critics of the hoax theory point out that producing 240 pages in this way would have required enormous effort for an uncertain reward.</p>" },
          { label: 'E', html: "<p>Statistical studies have provided some support for the view that the text is genuine. In natural languages, a small number of words are used very frequently and most words are rare, following a regular mathematical pattern; the manuscript's text follows the same pattern. Words also appear to cluster in particular sections, as they would if they related to the subject matter of the pictures. Nonsense text produced at random rarely shows these features, although some researchers argue that a careful hoaxer could have imitated them. There are also some odd features: certain words are repeated two or three times in a row far more often than in any known language, and the text contains almost no corrections, which is unusual in a handwritten book of this length.</p>" },
          { label: 'F', html: "<p>If the text is meaningful, it might be written in an unknown or lost language, in a known language using an invented alphabet, or in a code. Each possibility has its supporters, and over the years dozens of people have announced that they have solved the mystery, identifying the language variously as Latin, Hebrew, Turkish or a form of early Romance. None of these claims has convinced other experts, usually because the proposed method could be used to produce almost any translation.</p>" },
          { label: 'G', html: "<p>The whole manuscript has now been photographed in high resolution and made freely available online, allowing anyone in the world to attempt a solution. Some scholars believe that the answer will eventually be found by artificial intelligence, which can compare the text with hundreds of languages far more quickly than any human. Others suspect that the book will keep its secret forever. Either way, it remains one of the most famous unsolved puzzles in the history of writing.</p>" },
        ],
        questionGroups: [
          {
            id: 't46-r2-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below.',
            bank: [
              { key: 'i', text: 'Evidence that the text behaves like a real language' },
              { key: 'ii', text: 'A mysterious object' },
              { key: 'iii', text: 'Many solutions, none accepted' },
              { key: 'iv', text: 'Scientific tests establish a date' },
              { key: 'v', text: 'A possible deception' },
              { key: 'vi', text: 'Known owners and an early theory' },
              { key: 'vii', text: 'Opening the puzzle to the world' },
              { key: 'viii', text: 'The value of the manuscript today' },
              { key: 'ix', text: 'Similar books from the same period' },
            ],
            questions: [
              { number: 14, promptHtml: 'Paragraph A', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph A describes the book and says nobody knows what language it is in.', locatorParagraph: 'A' },
              { number: 15, promptHtml: 'Paragraph B', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph B: Voynich, Rudolf II, and the Roger Bacon theory.', locatorParagraph: 'B' },
              { number: 16, promptHtml: 'Paragraph C', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph C: "radiocarbon dating to establish the age".', locatorParagraph: 'C' },
              { number: 17, promptHtml: 'Paragraph D', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph D: "the book is an elaborate hoax".', locatorParagraph: 'D' },
              { number: 18, promptHtml: 'Paragraph E', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph E: the text "follows the same pattern" as natural languages.', locatorParagraph: 'E' },
              { number: 19, promptHtml: 'Paragraph F', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph F: dozens have claimed a solution; "None of these claims has convinced other experts".', locatorParagraph: 'F' },
              { number: 20, promptHtml: 'Paragraph G', answer: { accepted: ['vii'] }, explanationHtml: 'Paragraph G: "made freely available online, allowing anyone in the world to attempt a solution".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't46-r2-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>The Voynich manuscript</strong></p><p>The book contains drawings of unidentified {{q21}}, diagrams of stars, and small figures bathing in pools. It was bought in 1912 from a religious {{q22}} in Italy. Scientific tests on the animal skin and the {{q23}} suggest it dates from the early fifteenth century. In 2004, a computer scientist showed that similar text could be produced using a {{q24}} with holes cut in it. Many people have claimed to translate it, but their methods could produce almost any {{q25}}.</p>',
            questions: [
              { number: 21, answer: { accepted: ['plants'] }, explanationHtml: 'Paragraph A: "drawings of plants that no botanist has been able to identify".', locatorParagraph: 'A' },
              { number: 22, answer: { accepted: ['college'] }, explanationHtml: 'Paragraph B: "bought it in 1912 from a religious college in Italy".', locatorParagraph: 'B' },
              { number: 23, answer: { accepted: ['ink'] }, explanationHtml: 'Paragraph C: "Analysis of the ink found that it was consistent with inks used at that time."', locatorParagraph: 'C' },
              { number: 24, answer: { accepted: ['card'] }, explanationHtml: 'Paragraph D: "a card with holes cut in it".', locatorParagraph: 'D' },
              { number: 25, answer: { accepted: ['translation'] }, explanationHtml: 'Paragraph F: "the proposed method could be used to produce almost any translation".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't46-r2-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 26,
                promptHtml: 'Which TWO features of the text suggest that it may be a genuine language?',
                options: [
                  { key: 'A', text: 'Word frequencies follow a pattern found in natural languages.' },
                  { key: 'B', text: 'The handwriting is very neat.' },
                  { key: 'C', text: 'Certain words are concentrated in particular sections.' },
                  { key: 'D', text: 'The alphabet resembles Latin.' },
                  { key: 'E', text: 'The book contains a letter from its owner.' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'Paragraph E: the text "follows the same pattern", and "Words also appear to cluster in particular sections".',
              },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Nobody is watching you (as much as you think)',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: '', html: "<p>Most of us have had the experience of arriving at a party or a meeting and suddenly becoming aware of a stain on our shirt, or a bad haircut, and feeling certain that everyone in the room has noticed. We spend the rest of the evening uncomfortable, convinced that we are the object of silent judgement. Psychologists have a name for this feeling: the spotlight effect. The research on it suggests that our worries are, in most cases, greatly exaggerated.</p>" },
          { label: '', html: "<p>In a well-known experiment carried out at an American university around the turn of the century, students were asked to put on a T-shirt showing a large picture of a singer who was, at the time, considered deeply unfashionable among young people. Each student then entered a room where a group of other students were filling in questionnaires, stayed for a short time, and left. Afterwards, the students wearing the shirt were asked to estimate how many people in the room had noticed who was on it. On average they guessed about half. In fact, fewer than a quarter had noticed.</p>" },
          { label: '', html: "<p>The explanation is simple. Each of us experiences the world from the centre of our own attention, and it is very difficult to imagine how little attention others are paying to us. We know every detail of our own appearance and behaviour, and we assume, without realising it, that others see us as clearly as we see ourselves. But other people are, of course, at the centre of their own worlds, and are far more concerned with how they themselves appear than with how we do.</p>" },
          { label: '', html: "<p>The effect applies not only to appearance but to behaviour. People who make a mistake while speaking in public typically believe that their audience judged them much more harshly than it actually did. Players in team games overestimate how much their teammates noticed their errors. And, interestingly, the effect works in both directions: we also overestimate how much others notice our successes, such as a clever remark or a good performance. In both cases, we are the only ones who are paying very close attention. A related finding is that people believe their emotions are more visible than they really are: speakers who feel nervous are often convinced that their anxiety is obvious to the audience, when observers report noticing very little.</p>" },
          { label: '', html: "<p>I think it is worth dwelling on why this matters. The spotlight effect is not merely a curiosity; it can have real consequences. Fear of being judged prevents many people from speaking in meetings, asking questions in class, trying a new sport or learning a language, activities in which mistakes are an inevitable part of the process. If we understood how little others actually notice our failures, we might be more willing to take the risks that learning requires.</p>" },
          { label: '', html: "<p>That said, I do not want to suggest that other people's opinions are irrelevant. There are situations, such as job interviews, in which we are indeed being carefully observed, and in which it makes sense to prepare. And some people, for example those who are well known or who belong to a group that is often the target of prejudice, may genuinely attract more attention than average. The spotlight effect describes a general tendency, not a rule that applies equally to everyone in every situation.</p>" },
          { label: '', html: "<p>Can we reduce the effect? Research suggests that simply knowing about it helps a little. More useful, perhaps, is a technique that involves deliberately imagining the situation from the point of view of an observer. When people are asked to think about what others are actually likely to be focusing on, their estimates of how much they were noticed become more accurate. Another approach is to remember our own experience: how often do we notice, let alone remember, a small mistake made by someone else?</p>" },
          { label: '', html: "<p>The answer, for most of us, is rarely. And that, in the end, is the most reassuring lesson of this research. The stain on the shirt, the stumble over a word, the awkward joke: these loom large in our own memories for days, but for everyone else, they are forgotten almost as soon as they happen, if they are noticed at all. Knowing this will not make embarrassment disappear, but it may make it a little easier to raise a hand, try something new, or simply enjoy the party.</p>" },
        ],
        questionGroups: [
          {
            id: 't46-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 27, promptHtml: 'In the T-shirt experiment, the students wearing the shirt', options: [{ key: 'A', text: 'were asked to speak to the other students.' }, { key: 'B', text: 'overestimated how many people noticed the picture.' }, { key: 'C', text: 'chose the singer themselves.' }, { key: 'D', text: 'filled in a questionnaire before entering.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 2: they guessed about half; "fewer than a quarter had noticed".' },
              { number: 28, promptHtml: 'According to the third paragraph, the spotlight effect happens because', options: [{ key: 'A', text: 'people are generally critical of others.' }, { key: 'B', text: 'we find it hard to see ourselves from outside.' }, { key: 'C', text: 'we do not pay attention to our appearance.' }, { key: 'D', text: 'other people are unkind.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "it is very difficult to imagine how little attention others are paying to us".' },
              { number: 29, promptHtml: 'What does the writer say about our successes?', options: [{ key: 'A', text: 'Others remember them longer than our failures.' }, { key: 'B', text: 'We usually underestimate them.' }, { key: 'C', text: 'Others notice them less than we think.' }, { key: 'D', text: 'They reduce the spotlight effect.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 4: "we also overestimate how much others notice our successes".' },
              { number: 30, promptHtml: 'Which technique for reducing the effect does the writer describe as more useful?', options: [{ key: 'A', text: 'avoiding situations in which we might be judged' }, { key: 'B', text: 'imagining the situation as an observer' }, { key: 'C', text: 'asking friends for their opinion' }, { key: 'D', text: 'reading about the research' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 7: "More useful ... is a technique that involves deliberately imagining the situation from the point of view of an observer."' },
            ],
          },
          {
            id: 't46-r3-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-H, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'risks' },
              { key: 'B', text: 'meetings' },
              { key: 'C', text: 'mistakes' },
              { key: 'D', text: 'interviews' },
              { key: 'E', text: 'friends' },
              { key: 'F', text: 'prejudice' },
              { key: 'G', text: 'fashion' },
              { key: 'H', text: 'games' },
            ],
            stemHtml:
              '<p><strong>Why the spotlight effect matters</strong></p><p>Fear of being judged stops many people from speaking in {{q31}} or trying new activities in which {{q32}} are unavoidable. However, in some situations, such as job {{q33}}, people really are being watched closely.</p>',
            questions: [
              { number: 31, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 5: "prevents many people from speaking in meetings".' },
              { number: 32, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 5: "activities in which mistakes are an inevitable part of the process".' },
              { number: 33, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph 6: "situations, such as job interviews, in which we are indeed being carefully observed".' },
            ],
          },
          {
            id: 't46-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 34, promptHtml: 'Most people\'s worries about being judged by others are exaggerated.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 1: "our worries are, in most cases, greatly exaggerated".' },
              { number: 35, promptHtml: 'The spotlight effect is only an interesting curiosity with no practical importance.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 5: "The spotlight effect is not merely a curiosity; it can have real consequences."' },
              { number: 36, promptHtml: 'Women are more affected by the spotlight effect than men.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer does not compare men and women.' },
              { number: 37, promptHtml: 'Other people\'s opinions should be completely ignored.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 6: "I do not want to suggest that other people\'s opinions are irrelevant."' },
              { number: 38, promptHtml: 'Some people may really receive more attention than others.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph 6: some people "may genuinely attract more attention than average".' },
              { number: 39, promptHtml: 'Learning about the spotlight effect has no effect on how people feel.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph 7: "simply knowing about it helps a little".' },
            ],
          },
          {
            id: 't46-r3-title',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 40,
                promptHtml: 'Which of the following is the most suitable subtitle for the passage?',
                options: [
                  { key: 'A', text: 'How to make a good impression at parties' },
                  { key: 'B', text: 'Why we believe others notice us more than they do' },
                  { key: 'C', text: 'The history of an American psychology experiment' },
                  { key: 'D', text: 'Why fashion matters to young people' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'The whole passage explains the spotlight effect: our overestimate of how much others notice us.',
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
        contextText: 'You will hear a woman phoning an agency about becoming a host family for international students.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good afternoon, HomeStay Connect. Daniel speaking." },
          { speaker: 'B', voice: 'zira', text: "Hi, I'm thinking of becoming a host family for an international student, and I'd like to know what's involved." },
          { speaker: 'A', voice: 'david', text: "Great. Can I take a few details first? What's your name?" },
          { speaker: 'B', voice: 'zira', text: "It's Rachel Brennan." },
          { speaker: 'A', voice: 'david', text: "And where do you live, Rachel?" },
          { speaker: 'B', voice: 'zira', text: "In Ashfield, on Linden Avenue. It's about twenty minutes from the city centre by bus." },
          { speaker: 'A', voice: 'david', text: "That's fine. Most of our students attend language schools in the centre, so we try to keep journeys under forty-five minutes. Who else lives in the house?" },
          { speaker: 'B', voice: 'zira', text: "My husband and our two children, who are eight and eleven. And we have a cat." },
          { speaker: 'A', voice: 'david', text: "OK, some students are allergic to cats, so we'll make sure to match you with someone who isn't. Now, the student would need their own bedroom. Do you have a spare room?" },
          { speaker: 'B', voice: 'zira', text: "Yes, it's on the second floor. It has a bed, a wardrobe and a desk." },
          { speaker: 'A', voice: 'david', text: "The desk is important, because they'll need somewhere to study. And we ask hosts to provide a reliable internet connection." },
          { speaker: 'B', voice: 'zira', text: "That's no problem. What about meals?" },
          { speaker: 'A', voice: 'david', text: "Hosts provide breakfast and an evening meal every day, and lunch at weekends. We'd encourage you to eat together as a family as often as possible. It's one of the best ways for the student to practise English." },
          { speaker: 'B', voice: 'zira', text: "And how much do hosts receive?" },
          { speaker: 'A', voice: 'david', text: "It's one hundred and ninety pounds a week for each student. That's paid directly into your bank account at the end of each month." },
          { speaker: 'B', voice: 'zira', text: "How long do students usually stay?" },
          { speaker: 'A', voice: 'david', text: "It varies. Summer students often stay for just two or three weeks, but in term time it's usually around three months." },
          { speaker: 'B', voice: 'zira', text: "What happens next if I want to go ahead?" },
          { speaker: 'A', voice: 'david', text: "One of our staff will visit your home to check it's suitable. And all adults in the house will need a background check, which we arrange. It usually takes about three weeks." },
          { speaker: 'B', voice: 'zira', text: "Could the visit be on a Thursday? That's my day off." },
          { speaker: 'A', voice: 'david', text: "I'll make a note of that. And could I have a phone number?" },
          { speaker: 'B', voice: 'zira', text: "It's oh seven nine one two, four four six, three eight one." },
        ],
        questionGroups: [
          {
            id: 't46-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Host family application</strong></p>' +
              '<p>Name: Rachel {{q1}}<br/>Address: {{q2}} Avenue, Ashfield<br/>Household: husband, two children and a {{q3}}<br/>Student\'s room: on the {{q4}} floor, with bed, wardrobe and desk<br/>Hosts must also provide reliable {{q5}}</p>' +
              '<p><em>Meals</em>: breakfast and evening meal daily; lunch at {{q6}}</p>' +
              '<p><em>Payment</em>: £{{q7}} per student per week</p>' +
              '<p><em>Length of stay in term time</em>: about three {{q8}}</p>' +
              '<p><em>Next steps</em><br/>• home visit, preferably on a {{q9}}<br/>• background check for all adults (takes about {{q10}} weeks)</p>',
            questions: [
              { number: 1, answer: { accepted: ['brennan'] }, explanationHtml: '"It\'s Rachel Brennan."' },
              { number: 2, answer: { accepted: ['linden'] }, explanationHtml: '"In Ashfield, on Linden Avenue."' },
              { number: 3, answer: { accepted: ['cat'] }, explanationHtml: '"And we have a cat."' },
              { number: 4, answer: { accepted: ['second', '2nd'] }, explanationHtml: '"it\'s on the second floor".' },
              { number: 5, answer: { accepted: ['internet', 'wifi', 'wi-fi'] }, explanationHtml: '"we ask hosts to provide a reliable internet connection".' },
              { number: 6, answer: { accepted: ['weekends'] }, explanationHtml: '"and lunch at weekends".' },
              { number: 7, answer: { accepted: ['190'] }, explanationHtml: '"one hundred and ninety pounds a week for each student".' },
              { number: 8, answer: { accepted: ['months'] }, explanationHtml: '"in term time it\'s usually around three months".' },
              { number: 9, answer: { accepted: ['thursday'] }, explanationHtml: '"Could the visit be on a Thursday?"' },
              { number: 10, answer: { accepted: ['3', 'three'] }, explanationHtml: '"It usually takes about three weeks."' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear the manager of a food bank talking to a group of new volunteers.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone, and thank you for volunteering with the Eastside Food Bank. I'm Maria, the manager. Before we start, I'd like to tell you a bit about how we work and then show you round the warehouse." },
          { speaker: 'A', voice: 'zira', text: "We provide emergency food parcels to people in the area who can't afford to buy food. Last year we gave out around twelve thousand parcels, and demand has risen again this year. Most of our food is donated by the public, through collection points in supermarkets, but we also receive fresh produce from local farms and some food that supermarkets would otherwise throw away." },
          { speaker: 'A', voice: 'zira', text: "People often ask what they'll be doing. The two most important tasks for new volunteers are checking that donated food is within its use-by date, and packing parcels. Later on, some of you may help with deliveries, but you'll need to be with us for at least three months first." },
          { speaker: 'A', voice: 'zira', text: "We also ask volunteers not to do two things. First, please don't take any food home yourselves, even if it's close to its date. We have a system for passing that food to other charities. And second, please don't discuss our clients with anyone outside the food bank. Many people feel embarrassed about needing our help." },
          { speaker: 'A', voice: 'zira', text: "Finally, there are a couple of things that surprise new volunteers. One is how much of our work is not about food at all: many clients need advice about money or housing, and we have trained advisers who can help. The other is the number of people who use us who are in work. Around a third of our clients have jobs, but still can't afford to feed their families." },
          { speaker: 'A', voice: 'zira', text: "OK, let me show you the layout. You can see the plan on the wall. We're at the entrance, at the bottom. Reception is straight ahead of you, in the middle of the building." },
          { speaker: 'A', voice: 'zira', text: "As you come in, the room immediately on your left is the volunteers' room, where you can leave your coats and bags and make yourselves a drink. On the right of the entrance is the collection point, where clients come to pick up their parcels." },
          { speaker: 'A', voice: 'zira', text: "Along the back wall, there are four rooms. On the far right, as you can see, is the loading bay, where the vans come in. Starting from the other end, in the far left corner, is the freezer room. Next to it is the fridge room, for fresh food such as milk and vegetables. And the third room from the left, next to the loading bay, is the dry goods store, where we keep tins, pasta, rice and so on." },
          { speaker: 'A', voice: 'zira', text: "On the left-hand wall, between the volunteers' room and the freezer room, is the sorting area. That's where donations are checked when they first arrive. And opposite that, on the right-hand wall, is the packing area, where the parcels are made up." },
          { speaker: 'A', voice: 'zira', text: "The toilets and my office are upstairs, on the first floor. Right, let's go to the sorting area and get started." },
        ],
        questionGroups: [
          {
            id: 't46-l2-multi1',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 11,
                promptHtml: 'Which TWO sources of food does Maria mention, apart from public donations?',
                options: [
                  { key: 'A', text: 'local farms' },
                  { key: 'B', text: 'restaurants' },
                  { key: 'C', text: 'the local council' },
                  { key: 'D', text: 'supermarkets\' unwanted food' },
                  { key: 'E', text: 'schools' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: '"fresh produce from local farms and some food that supermarkets would otherwise throw away".',
              },
            ],
          },
          {
            id: 't46-l2-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 12,
                promptHtml: 'Which TWO things are volunteers asked NOT to do?',
                options: [
                  { key: 'A', text: 'take food home' },
                  { key: 'B', text: 'wear their own clothes' },
                  { key: 'C', text: 'use their phones' },
                  { key: 'D', text: 'talk about clients to outsiders' },
                  { key: 'E', text: 'lift heavy boxes' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: '"please don\'t take any food home" and "please don\'t discuss our clients with anyone outside".',
              },
            ],
          },
          {
            id: 't46-l2-multi3',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 13,
                promptHtml: 'Which TWO facts often surprise new volunteers?',
                options: [
                  { key: 'A', text: 'how many parcels are given out' },
                  { key: 'B', text: 'how much work involves advice' },
                  { key: 'C', text: 'how many clients are elderly' },
                  { key: 'D', text: 'how many clients have jobs' },
                  { key: 'E', text: 'how much food is thrown away' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"how much of our work is not about food at all" (advice) and "the number of people who use us who are in work".',
              },
            ],
          },
          {
            id: 't46-l2-plan',
            type: 'plan_label',
            instructionHtml: 'Label the plan below. Choose the correct letter, <strong>A-I</strong>, for each numbered room.',
            imageUrl: WAREHOUSE_PLAN,
            imageAlt: 'Ground-floor plan of a warehouse: the entrance is at the bottom centre with reception in the middle; there is one room on each side of the entrance, one room on each side wall and four rooms along the back wall, the far right one marked Loading bay.',
            bank: [
              { key: 'A', text: 'Sorting area' },
              { key: 'B', text: 'Fridge room' },
              { key: 'C', text: 'Freezer room' },
              { key: 'D', text: 'Volunteers\' room' },
              { key: 'E', text: 'Toilets' },
              { key: 'F', text: 'Manager\'s office' },
              { key: 'G', text: 'Packing area' },
              { key: 'H', text: 'Dry goods store' },
              { key: 'I', text: 'Collection point' },
            ],
            imageHotspots: [
              { questionNumber: 14, x: 25, y: 79 },
              { questionNumber: 15, x: 75, y: 79 },
              { questionNumber: 16, x: 15, y: 21 },
              { questionNumber: 17, x: 37, y: 21 },
              { questionNumber: 18, x: 58, y: 21 },
              { questionNumber: 19, x: 13, y: 50 },
              { questionNumber: 20, x: 87, y: 50 },
            ],
            questions: [
              { number: 14, answer: { accepted: ['D'] }, explanationHtml: '"the room immediately on your left is the volunteers\' room".' },
              { number: 15, answer: { accepted: ['I'] }, explanationHtml: '"On the right of the entrance is the collection point".' },
              { number: 16, answer: { accepted: ['C'] }, explanationHtml: '"in the far left corner, is the freezer room".' },
              { number: 17, answer: { accepted: ['B'] }, explanationHtml: '"Next to it is the fridge room".' },
              { number: 18, answer: { accepted: ['H'] }, explanationHtml: '"the third room from the left, next to the loading bay, is the dry goods store".' },
              { number: 19, answer: { accepted: ['A'] }, explanationHtml: '"On the left-hand wall ... is the sorting area."' },
              { number: 20, answer: { accepted: ['G'] }, explanationHtml: '"on the right-hand wall, is the packing area".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two business students, Ella and Sam, discussing a case study about an unsuccessful product launch.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Sam, have you finished reading the case study about the smart water bottle?" },
          { speaker: 'B', voice: 'david', text: "Yes. It's a great example of how not to launch a product. The company raised millions from investors, and the bottle was withdrawn after less than a year." },
          { speaker: 'A', voice: 'zira', text: "What did you think was the main reason it failed?" },
          { speaker: 'B', voice: 'david', text: "The price, I think. At over a hundred dollars, it was about five times more expensive than an ordinary bottle, and customers couldn't see why it was worth it." },
          { speaker: 'A', voice: 'zira', text: "I agree the price didn't help, but I think the real problem was that it didn't solve a problem people actually had. Most people don't need an app to tell them when to drink water." },
          { speaker: 'B', voice: 'david', text: "That's a fair point. The founders assumed everyone would be as interested in tracking their health as they were." },
          { speaker: 'A', voice: 'zira', text: "And they didn't test the idea properly. They asked their friends and colleagues, who all said it was brilliant, of course." },
          { speaker: 'B', voice: 'david', text: "Exactly. There was also a technical problem. The battery needed charging every two days, and the bottle couldn't go in the dishwasher, which people found really annoying." },
          { speaker: 'A', voice: 'zira', text: "What did you think of the way they marketed it?" },
          { speaker: 'B', voice: 'david', text: "Their advertising was actually very good. The videos were clever and got a lot of views. The problem was that they focused on the technology rather than on what the customer would gain from it." },
          { speaker: 'A', voice: 'zira', text: "And they launched in too many countries at once. They'd have learned a lot more by starting with one market." },
          { speaker: 'B', voice: 'david', text: "Right. The case study says their customer service couldn't cope either, because they had so many complaints in different languages." },
          { speaker: 'A', voice: 'zira', text: "So what lessons are we going to draw for our presentation?" },
          { speaker: 'B', voice: 'david', text: "I think the most important one is that companies should talk to real potential customers early on, not just people they know." },
          { speaker: 'A', voice: 'zira', text: "Yes. And the case study mentioned that one competitor later produced a much simpler bottle, without the app, that just has lines on the side showing how much you should have drunk by certain times of day. And it sold very well." },
          { speaker: 'B', voice: 'david', text: "Which shows that simple solutions are sometimes the best. We should include that." },
          { speaker: 'A', voice: 'zira', text: "OK. Which two areas should we focus on in our recommendations section, do you think?" },
          { speaker: 'B', voice: 'david', text: "Definitely market research, and I'd say pricing strategy too." },
          { speaker: 'A', voice: 'zira', text: "I'd rather do market research and the launch strategy, the question of how many markets to start in. Pricing is covered in the next module anyway." },
          { speaker: 'B', voice: 'david', text: "Fair enough, let's do those two." },
          { speaker: 'A', voice: 'zira', text: "And what visuals should we use? I thought a timeline of the company's history, and maybe some of the customer reviews." },
          { speaker: 'B', voice: 'david', text: "The reviews would be good. A timeline might be too detailed. What about a chart comparing its price with competitors?" },
          { speaker: 'A', voice: 'zira', text: "Yes, let's use that and the reviews." },
        ],
        questionGroups: [
          {
            id: 't46-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'According to Ella, the main reason the product failed was that', options: [{ key: 'A', text: 'it was too expensive.' }, { key: 'B', text: 'people did not need it.' }, { key: 'C', text: 'it was badly made.' }], answer: { accepted: ['B'] }, explanationHtml: '"the real problem was that it didn\'t solve a problem people actually had".' },
              { number: 22, promptHtml: 'How did the company test its idea?', options: [{ key: 'A', text: 'by asking people it knew' }, { key: 'B', text: 'through an online survey' }, { key: 'C', text: 'in shops' }], answer: { accepted: ['A'] }, explanationHtml: '"They asked their friends and colleagues".' },
              { number: 23, promptHtml: 'What technical problem is mentioned?', options: [{ key: 'A', text: 'The bottle leaked.' }, { key: 'B', text: 'The battery did not last long.' }, { key: 'C', text: 'The app often crashed.' }], answer: { accepted: ['B'] }, explanationHtml: '"The battery needed charging every two days".' },
              { number: 24, promptHtml: 'What does Sam say about the company\'s advertising?', options: [{ key: 'A', text: 'It concentrated on the wrong message.' }, { key: 'B', text: 'It was too expensive.' }, { key: 'C', text: 'Few people saw it.' }], answer: { accepted: ['A'] }, explanationHtml: '"they focused on the technology rather than on what the customer would gain".' },
              { number: 25, promptHtml: 'What mistake did the company make with the launch?', options: [{ key: 'A', text: 'It launched too late.' }, { key: 'B', text: 'It launched in too many countries.' }, { key: 'C', text: 'It launched without advertising.' }], answer: { accepted: ['B'] }, explanationHtml: '"they launched in too many countries at once".' },
              { number: 26, promptHtml: 'Why could customer service not cope?', options: [{ key: 'A', text: 'It had too few staff.' }, { key: 'B', text: 'Complaints came in many languages.' }, { key: 'C', text: 'The phone lines were closed.' }], answer: { accepted: ['B'] }, explanationHtml: '"they had so many complaints in different languages".' },
              { number: 27, promptHtml: 'What is the most important lesson, according to Sam?', options: [{ key: 'A', text: 'Talk to real customers early.' }, { key: 'B', text: 'Keep prices low.' }, { key: 'C', text: 'Invest more in technology.' }], answer: { accepted: ['A'] }, explanationHtml: '"companies should talk to real potential customers early on".' },
              { number: 28, promptHtml: 'What was special about the competitor\'s bottle?', options: [{ key: 'A', text: 'It had a better app.' }, { key: 'B', text: 'It was very simple.' }, { key: 'C', text: 'It was made of glass.' }], answer: { accepted: ['B'] }, explanationHtml: '"a much simpler bottle, without the app ... it sold very well".' },
            ],
          },
          {
            id: 't46-l3-multi1',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 29,
                promptHtml: 'Which TWO areas will the students focus on in their recommendations?',
                options: [
                  { key: 'A', text: 'pricing strategy' },
                  { key: 'B', text: 'market research' },
                  { key: 'C', text: 'product design' },
                  { key: 'D', text: 'launch strategy' },
                  { key: 'E', text: 'customer service' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: 'Ella: "market research and the launch strategy" — "let\'s do those two". Pricing is covered in the next module.',
              },
            ],
          },
          {
            id: 't46-l3-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 30,
                promptHtml: 'Which TWO visuals will the students use?',
                options: [
                  { key: 'A', text: 'a timeline' },
                  { key: 'B', text: 'customer reviews' },
                  { key: 'C', text: 'photographs of the product' },
                  { key: 'D', text: 'a price comparison chart' },
                  { key: 'E', text: 'a video advertisement' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"let\'s use that [the price chart] and the reviews". The timeline "might be too detailed".',
              },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the early history of the bicycle.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today I want to look at the early history of one of the most successful machines ever invented: the bicycle. It's a story that involves a volcano, a great deal of trial and error, and some important social changes." },
          { speaker: 'A', voice: 'david', text: "The first machine that we might recognise as a bicycle was built in Germany in 1817 by a civil servant named Karl Drais. It had two wheels in a line and a seat, but no pedals. The rider sat on it and pushed along the ground with his feet, so it's sometimes called a running machine." },
          { speaker: 'A', voice: 'david', text: "Some historians have suggested that Drais was motivated by a shortage of horses. In 1815, a huge volcanic eruption in Indonesia threw so much ash into the atmosphere that the following year had an unusually cold summer across Europe, crops failed, and many horses died or were killed because there was nothing to feed them. It's an attractive theory, although there's no direct evidence that this was Drais's reason." },
          { speaker: 'A', voice: 'david', text: "Drais's machine was briefly fashionable, but it was banned from pavements in several cities because riders kept colliding with pedestrians." },
          { speaker: 'A', voice: 'david', text: "The next major step came in France in the eighteen sixties, when pedals were attached directly to the front wheel. These machines had iron-framed wooden wheels and were extremely uncomfortable on the cobbled streets of the time, which is why in English they became known as 'boneshakers'." },
          { speaker: 'A', voice: 'david', text: "Because the pedals turned the front wheel directly, the only way to go faster was to make that wheel bigger. This led to the high-wheeler, often called the penny-farthing, with a front wheel that could be more than one and a half metres across. It was fast, but very dangerous. If the wheel hit a stone, the rider could be thrown over the handlebars head first. So it was mainly ridden by athletic young men." },
          { speaker: 'A', voice: 'david', text: "The solution was the so-called safety bicycle, which appeared in England in the eighteen eighties. It had two wheels of equal size and, crucially, a chain that connected the pedals to the rear wheel. Using gears, a small wheel could now travel as fast as a large one, and the rider sat much lower, close to the ground." },
          { speaker: 'A', voice: 'david', text: "The final piece of the puzzle was the air-filled tyre, developed in 1888 by a Scottish vet living in Belfast, John Boyd Dunlop, reportedly to make his young son's tricycle more comfortable. Pneumatic tyres made cycling far smoother and faster, and within a few years almost every new bicycle had them." },
          { speaker: 'A', voice: 'david', text: "The result was a cycling boom in the eighteen nineties. For the first time, ordinary people had a cheap means of transport that let them travel well beyond their own neighbourhood. The effect on women was particularly significant. The bicycle gave them a new independence, and it also led to changes in fashion, as long heavy skirts were replaced by more practical clothing." },
          { speaker: 'A', voice: 'david', text: "And interestingly, the bicycle also contributed to the development of other technologies. Many of the techniques used in bicycle factories, such as ball bearings and lightweight tubes, were later used in cars and even aircraft. Indeed, the brothers who built the first successful powered aeroplane ran a bicycle shop." },
        ],
        questionGroups: [
          {
            id: 't46-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>The early bicycle</strong></p>' +
              '<p><em>1817: Drais\'s running machine</em><br/>• no {{q31}}; rider pushed with the feet<br/>• possibly inspired by a shortage of {{q32}} after a volcanic eruption<br/>• banned from {{q33}} in some cities</p>' +
              '<p><em>1860s: the boneshaker</em><br/>• uncomfortable on {{q34}} streets</p>' +
              '<p><em>The high-wheeler</em><br/>• fast but {{q35}}; riders could be thrown over the handlebars</p>' +
              '<p><em>1880s: the safety bicycle</em><br/>• wheels of equal size; a {{q36}} connected pedals to the rear wheel</p>' +
              '<p><em>1888: the pneumatic tyre</em><br/>• developed by a Scottish {{q37}} for his son\'s tricycle</p>' +
              '<p><em>Effects</em><br/>• gave women greater {{q38}}<br/>• led to changes in {{q39}}<br/>• factory techniques later used in cars and {{q40}}</p>',
            questions: [
              { number: 31, answer: { accepted: ['pedals'] }, explanationHtml: '"It had two wheels in a line and a seat, but no pedals."' },
              { number: 32, answer: { accepted: ['horses'] }, explanationHtml: '"Drais was motivated by a shortage of horses".' },
              { number: 33, answer: { accepted: ['pavements'] }, explanationHtml: '"it was banned from pavements in several cities".' },
              { number: 34, answer: { accepted: ['cobbled'] }, explanationHtml: '"extremely uncomfortable on the cobbled streets".' },
              { number: 35, answer: { accepted: ['dangerous'] }, explanationHtml: '"It was fast, but very dangerous."' },
              { number: 36, answer: { accepted: ['chain'] }, explanationHtml: '"a chain that connected the pedals to the rear wheel".' },
              { number: 37, answer: { accepted: ['vet'] }, explanationHtml: '"a Scottish vet living in Belfast, John Boyd Dunlop".' },
              { number: 38, answer: { accepted: ['independence', 'freedom'] }, explanationHtml: '"The bicycle gave them a new independence".' },
              { number: 39, answer: { accepted: ['fashion', 'clothing'] }, explanationHtml: '"it also led to changes in fashion".' },
              { number: 40, answer: { accepted: ['aircraft', 'aeroplanes', 'planes'] }, explanationHtml: '"later used in cars and even aircraft".' },
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
        '<p>The chart below shows the percentage of adults in different age groups who used three types of online service in one country in 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Use of online services by age group, 2022 (%)',
        unit: '%',
        categories: ['18-29', '30-44', '45-59', '60-74', '75+'],
        xAxisLabel: 'Age group',
        yAxisLabel: 'Percentage of adults',
        series: [
          { name: 'Online banking', data: [78, 86, 74, 55, 28] },
          { name: 'Video calls', data: [91, 84, 70, 62, 44] },
          { name: 'Online shopping', data: [88, 90, 79, 58, 31] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Many young people now do unpaid internships in order to gain work experience.</p><p>To what extent do you think this is fair to young people?</p>',
    },
  },
};
