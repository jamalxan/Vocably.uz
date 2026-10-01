// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION } from './_html.mjs';

const KAYAK_DIAGRAM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="300" fill="#f5f9fc"/>
  <text x="230" y="24" font-weight="bold" fill="#333">A sea kayak (from above)</text>
  <path d="M30 150 Q300 60 570 150 Q300 240 30 150 Z" fill="#ffcc80" stroke="#e65100" stroke-width="2"/>
  <ellipse cx="300" cy="150" rx="55" ry="28" fill="#5d4037" stroke="#3e2723"/>
  <ellipse cx="150" cy="150" rx="28" ry="16" fill="#ffe0b2" stroke="#e65100"/>
  <ellipse cx="450" cy="150" rx="28" ry="16" fill="#ffe0b2" stroke="#e65100"/>
  <rect x="380" y="140" width="10" height="20" fill="#795548"/>
  <path d="M30 150 L12 150 M570 150 L588 150" stroke="#333" stroke-width="4"/>
  <text x="20" y="290" fill="#555" font-size="11">front (bow) on the left</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-40',
  title: 'Vocably Practice Test 40',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The inventor who walked into the smoke',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>Garrett Morgan was born in Kentucky in 1877, the son of formerly enslaved parents, and left school after only a few years of education in order to work. As a teenager he moved north to Ohio, eventually settling in the city of Cleveland, where he found a job repairing sewing machines in a clothing factory. He had a talent for understanding how machines worked, and he soon began to improve the equipment he was repairing. Within a few years he had opened his own repair shop, and later a tailoring business that employed more than thirty people. He had no formal training in engineering or science, and he later said that he had learned most of what he knew by taking machines apart and putting them back together, and by paying a private tutor to continue his education in the evenings.</p>" },
          { label: '', html: "<p>Like many inventors of his time, Morgan made his first commercial success almost by accident. While trying to find a liquid that would reduce the friction of a sewing-machine needle, which often scorched the woollen cloth it passed through, he noticed that the substance he was testing straightened the hairs of a piece of cloth. After experimenting further, he turned it into a hair-straightening cream, and the company he set up to sell it provided him with a steady income for the rest of his life.</p>" },
          { label: '', html: "<p>Morgan's best-known invention, however, was intended to save lives. Around 1912 he began work on a device that would allow firefighters to breathe in smoke-filled buildings. His 'safety hood' was a canvas covering that fitted over the head, with a long tube hanging down towards the floor, where the air is usually cleaner because smoke rises. A second tube allowed the wearer to breathe out. The design was patented in 1914, and in demonstrations Morgan would enter a tent filled with thick, poisonous smoke and remain inside for twenty minutes before emerging unharmed.</p>" },
          { label: '', html: "<p>The hood received its most dramatic test in July 1916. An explosion occurred in a tunnel being dug beneath Lake Erie to supply the city with fresh water, trapping a group of workers underground in an atmosphere filled with dangerous gas. Several rescuers who went in without protection were themselves overcome. Late at night, Morgan was called to the scene and, with his brother and a small group of volunteers, went down into the tunnel wearing his hoods. They brought out a number of men, some of whom survived, and recovered the bodies of others.</p>" },
          { label: '', html: "<p>The rescue should have made Morgan famous, but newspaper reports at first gave most of the credit to others, and the recognition he received from the city was limited. When orders for his hood began to arrive from fire departments in the southern states, some were cancelled once buyers discovered that the inventor was Black. Morgan responded by sometimes hiring a white actor to present the product at sales demonstrations while he himself played the part of an assistant. Despite such obstacles, modified versions of the hood were later developed for use by soldiers during the First World War.</p>" },
          { label: '', html: "<p>Morgan was also one of the first people in Cleveland to own a car, and he witnessed a serious collision at a busy crossroads. At the time, signals at road junctions usually showed only two instructions, stop and go, and they changed without warning, so that drivers had no time to react. Morgan's solution, patented in 1923, was a signal with a third position, which stopped traffic in all directions for a short time before allowing vehicles to move again. This interval gave drivers time to clear the junction safely, the same purpose served by the amber light in modern traffic lights.</p>" },
          { label: '', html: "<p>Morgan sold the rights to his traffic signal to a large electrical company for forty thousand dollars, a considerable sum at the time. He used some of his wealth to support the community in which he lived: he founded a newspaper for Cleveland's Black population, helped to establish a social club, and was active in campaigns for civil rights. In his later years his eyesight began to fail, but he continued to invent until shortly before his death in 1963. Today he is remembered as an example of how practical ingenuity could overcome both limited education and the prejudice of his time.</p>" },
        ],
        questionGroups: [
          {
            id: 't40-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 1, promptHtml: 'Morgan received a long formal education.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 1: he "left school after only a few years of education".' },
              { number: 2, promptHtml: 'Morgan\'s hair cream was the result of an unplanned discovery.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 2: "his first commercial success almost by accident".' },
              { number: 3, promptHtml: 'The safety hood was first used by firefighters in Cleveland.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not say where it was first used by firefighters.' },
              { number: 4, promptHtml: 'Morgan went into the tunnel alone.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: he went "with his brother and a small group of volunteers".' },
              { number: 5, promptHtml: 'Early newspaper reports of the rescue did not give Morgan the credit he deserved.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 5: "newspaper reports at first gave most of the credit to others".' },
              { number: 6, promptHtml: 'Morgan\'s traffic signal was used throughout the United States within a few years.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph 6-7 describe the patent and sale but not how widely it was used.' },
            ],
          },
          {
            id: 't40-r1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Garrett Morgan</strong></p>' +
              '<p><em>Early career</em><br/>• repaired {{q7}} in a clothing factory</p>' +
              '<p><em>Safety hood</em><br/>• made of {{q8}}<br/>• long tube reached down to the {{q9}}<br/>• demonstrated by staying in a {{q10}} full of smoke</p>' +
              '<p><em>Sales</em><br/>• employed an {{q11}} to present the product</p>' +
              '<p><em>Traffic signal</em><br/>• older signals showed only two {{q12}}<br/>• new signal stopped traffic in all directions, like today\'s {{q13}} light</p>',
            questions: [
              { number: 7, answer: { accepted: ['sewing machines', 'machines'] }, explanationHtml: 'Paragraph 1: "repairing sewing machines in a clothing factory".' },
              { number: 8, answer: { accepted: ['canvas'] }, explanationHtml: 'Paragraph 3: "a canvas covering that fitted over the head".' },
              { number: 9, answer: { accepted: ['floor'] }, explanationHtml: 'Paragraph 3: "a long tube hanging down towards the floor".' },
              { number: 10, answer: { accepted: ['tent'] }, explanationHtml: 'Paragraph 3: "enter a tent filled with thick, poisonous smoke".' },
              { number: 11, answer: { accepted: ['actor'] }, explanationHtml: 'Paragraph 5: "hiring a white actor to present the product".' },
              { number: 12, answer: { accepted: ['instructions'] }, explanationHtml: 'Paragraph 6: "signals ... usually showed only two instructions".' },
              { number: 13, answer: { accepted: ['amber'] }, explanationHtml: 'Paragraph 6: "the same purpose served by the amber light".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The science of recognising faces',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>Most of us can recognise hundreds, perhaps thousands, of faces, often after seeing them only briefly, and we can do so from different angles, in poor light and after many years. This ability is so ordinary that we rarely think about it, yet it is one of the most complex tasks the human brain performs. Faces are all built to the same basic plan, two eyes above a nose above a mouth, and the differences between them are small. Computers struggled for decades to match human performance, and even today's systems, which are highly accurate under good conditions, can be confused by changes in lighting or expression.</p>" },
          { label: 'B', html: "<p>Interest in faces begins remarkably early. In the early 1960s, the American psychologist Robert Fantz developed a simple method for studying what babies prefer to look at: he showed them pairs of images and measured how long they looked at each. Even very young infants looked longer at a pattern arranged like a face than at the same features in a jumbled order. Later researchers found that newborn babies, only minutes old, will turn their heads to follow a face-like pattern, suggesting that some preference for faces is present from birth.</p>" },
          { label: 'C', html: "<p>The ability to tell faces apart, however, develops over many years and is shaped by experience. Babies of around six months can distinguish the faces of monkeys almost as well as human faces, but by nine months this ability has faded, as the brain becomes specialised for the kinds of face it sees most often. A similar process explains why adults are often better at recognising faces from their own ethnic group than from others, an effect that becomes weaker in people who grow up surrounded by a wider range of faces.</p>" },
          { label: 'D', html: "<p>In 1997, the neuroscientist Nancy Kanwisher and her colleagues used brain scanning to identify a small region on the underside of the brain that responds much more strongly to faces than to other objects such as houses or tools. They named it the fusiform face area. Its existence supported the idea that faces are processed differently from other objects, although researchers still debate whether the region is specialised for faces themselves or for any category of object that a person has learned to distinguish in fine detail.</p>" },
          { label: 'E', html: "<p>Evidence that face recognition is a separate ability also comes from people who lack it. Prosopagnosia, sometimes called face blindness, can be caused by damage to the brain, but in many cases it seems to be present from birth and to run in families. People with the condition can see faces perfectly well and may recognise emotions, but they cannot tell who a person is from the face alone. Many rely instead on voices, hairstyles or the way someone walks, and some fail to recognise close relatives if they meet them in an unexpected place.</p>" },
          { label: 'F', html: "<p>At the other extreme are people with exceptional ability. In 2009, a team led by the psychologist Richard Russell described several individuals who could recognise people they had seen only once, years earlier, and who sometimes had to pretend not to recognise strangers to avoid making them uncomfortable. The researchers called them 'super-recognisers'. Some police forces have since recruited officers with this ability to identify suspects from video recordings, where they have proved more successful than colleagues and, in some cases, than computer systems.</p>" },
          { label: 'G', html: "<p>Perhaps the most surprising finding of recent years concerns unfamiliar faces. We are so good at recognising people we know that we assume we are good at faces in general. But when people are asked to decide whether two photographs of strangers show the same person, they make a large number of mistakes. In a study led by the psychologist David White, even experienced passport officers accepted photographs of a different person in around one case in seven. Professional experience, it appeared, made little difference to their accuracy.</p>" },
          { label: 'H', html: "<p>The explanation, researchers believe, is that recognising a familiar face depends on knowing how that particular face varies. After seeing a friend in many situations, laughing, tired or wearing glasses, the brain has learned which changes matter and which do not. With a stranger, we have only a single image to go on, and we are easily misled by differences in lighting or camera angle. For this reason, some experts have suggested that identity documents should include several photographs of the holder rather than one.</p>" },
        ],
        questionGroups: [
          {
            id: 't40-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              { number: 14, promptHtml: 'a practical recommendation to improve identity checks', answer: { accepted: ['H'] }, explanationHtml: 'Paragraph H: "identity documents should include several photographs".', locatorParagraph: 'H' },
              { number: 15, promptHtml: 'a reason why faces are difficult to distinguish', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: faces "are all built to the same basic plan ... the differences between them are small".', locatorParagraph: 'A' },
              { number: 16, promptHtml: 'strategies used by people who cannot recognise faces', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: "Many rely instead on voices, hairstyles or the way someone walks".', locatorParagraph: 'E' },
              { number: 17, promptHtml: 'an ability that disappears during the first year of life', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph C: distinguishing monkey faces at six months "has faded" by nine months.', locatorParagraph: 'C' },
              { number: 18, promptHtml: 'a disagreement about the precise function of a part of the brain', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: "researchers still debate whether the region is specialised for faces".', locatorParagraph: 'D' },
              { number: 19, promptHtml: 'the use of a special ability in police work', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: police forces "recruited officers with this ability to identify suspects".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't40-r2-people',
            type: 'matching_features',
            instructionHtml: 'Look at the following findings and the list of researchers below. Match each finding with the correct researcher, <strong>A-E</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'Robert Fantz' },
              { key: 'B', text: 'Nancy Kanwisher' },
              { key: 'C', text: 'Richard Russell' },
              { key: 'D', text: 'David White' },
              { key: 'E', text: 'none of these researchers' },
            ],
            questions: [
              { number: 20, promptHtml: 'Some people avoid showing that they recognise others.', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph F: super-recognisers "sometimes had to pretend not to recognise strangers".', locatorParagraph: 'F' },
              { number: 21, promptHtml: 'Infants spend more time looking at images that resemble faces.', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph B: infants "looked longer at a pattern arranged like a face".', locatorParagraph: 'B' },
              { number: 22, promptHtml: 'Experience in a job does not guarantee accuracy in matching photographs.', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph G: "Professional experience ... made little difference to their accuracy."', locatorParagraph: 'G' },
              { number: 23, promptHtml: 'Newborn babies follow face-like patterns with their heads.', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph B attributes this to "Later researchers", not to any named researcher.', locatorParagraph: 'B' },
            ],
          },
          {
            id: 't40-r2-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Familiar and unfamiliar faces</strong></p><p>We recognise people we know well because we have seen how their faces change, for example when they are laughing or wearing {{q24}}. With strangers, we only have one image, so we can be misled by differences in {{q25}} or the angle of the camera. Face blindness, by contrast, often runs in {{q26}}.</p>',
            questions: [
              { number: 24, answer: { accepted: ['glasses'] }, explanationHtml: 'Paragraph H: "laughing, tired or wearing glasses".' },
              { number: 25, answer: { accepted: ['lighting'] }, explanationHtml: 'Paragraph H: "misled by differences in lighting or camera angle".' },
              { number: 26, answer: { accepted: ['families'] }, explanationHtml: 'Paragraph E: it seems "to run in families".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'What are zoos for?',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>The first public zoos, opened in European cities in the eighteenth and nineteenth centuries, had a simple purpose: to display as many strange and impressive animals as possible to a paying public. Animals were kept in small cages arranged like the exhibits in a museum, often alone, with bare floors and iron bars. Little was known about their needs, and many died young. Collecting was driven by curiosity and national pride, and the animals themselves were largely replaced by capturing new ones from the wild when they died. Visitors were also encouraged to interact with the animals in ways that would be unthinkable today: feeding them whatever food they had brought, riding on elephants and camels, and in some cases watching animals perform tricks for their entertainment.</p>" },
          { label: 'B', html: "<p>Over the twentieth century, attitudes changed. Designers began to create enclosures without bars, using ditches and moats to separate animals from visitors so that they appeared to be living in natural surroundings. Later, zoos started to group species according to the regions they came from, and to provide space, vegetation and objects that encouraged natural behaviour. Today, the best zoos employ specialist staff whose job is to design daily activities for animals, such as hiding food so that it has to be searched for, to prevent the boredom and repetitive behaviour that were once common in captivity.</p>" },
          { label: 'C', html: "<p>At the same time, zoos began to justify their existence in new ways. The most important of these is conservation. Many modern zoos take part in coordinated breeding programmes, in which animals are exchanged between institutions to maintain healthy populations with as much genetic variety as possible. Several species that became extinct in the wild have survived only because they were bred in zoos, and some have been successfully returned to their natural habitats. Zoos also fund field projects, supporting the protection of habitats and the work of researchers in the countries where endangered species live.</p>" },
          { label: 'D', html: "<p>Critics are not persuaded. They point out that the great majority of animals in zoos belong to species that are not endangered, and that only a small proportion of zoos' income is spent on conservation in the wild. Some animals, they argue, simply cannot be kept well in captivity. Large, wide-ranging predators and highly intelligent animals such as elephants and some marine mammals show signs of stress in even the best enclosures, and several zoos have stopped keeping elephants for this reason. Critics also question whether breeding animals in captivity is the most effective way to protect a species, when the money might be better spent protecting habitats directly.</p>" },
          { label: 'E', html: "<p>Zoos also claim an educational role, arguing that seeing living animals encourages people, especially children, to care about wildlife. Here the evidence is mixed. Some studies have found that visitors' knowledge of biodiversity increases after a visit, but the effect is often small, and many visitors spend only a few seconds at each enclosure. Much depends on how the visit is organised: guided activities and talks by keepers appear to have a much greater effect than simply walking past the animals. There is also a question about what visitors learn beyond facts. Some researchers argue that the sight of an animal in an enclosure, however well designed, may teach people that wild animals exist mainly for human enjoyment, the opposite of the message zoos wish to send. Others respond that for many city children a zoo offers the only chance they will ever have to see such animals, and that this experience can inspire a lifelong interest in the natural world.</p>" },
          { label: 'F', html: "<p>What is clear is that the zoo of the future will look very different from the zoo of the past. Some experts predict that zoos will keep fewer species, concentrating on those that can be kept well and that benefit from breeding programmes, and give each more space. Others suggest that zoos will become more like conservation centres, closely linked to protected areas in the wild. Whatever form they take, zoos will increasingly have to show that the benefits they bring to animals and to conservation outweigh the costs of keeping animals in captivity. Public opinion is likely to play an important part in this process. Surveys in several countries suggest that most people still support zoos, but that support depends increasingly on the belief that animals are well treated and that zoos make a real contribution to protecting wildlife.</p>" },
        ],
        questionGroups: [
          {
            id: 't40-r3-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 3 has six paragraphs, A-F. Choose the correct heading for paragraphs B-E from the list of headings below.<br/><em>Example: Paragraph A — iii</em>',
            bank: [
              { key: 'i', text: 'Doubts about the value of visits' },
              { key: 'ii', text: 'Improving the lives of animals in captivity' },
              { key: 'iv', text: 'Arguments against keeping certain animals' },
              { key: 'v', text: 'The cost of building modern zoos' },
              { key: 'vi', text: 'A new justification for zoos' },
              { key: 'vii', text: 'Popular animals and visitor numbers' },
            ],
            questions: [
              { number: 27, promptHtml: 'Paragraph B', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph B describes enclosures and daily activities that encourage natural behaviour.', locatorParagraph: 'B' },
              { number: 28, promptHtml: 'Paragraph C', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph C: "zoos began to justify their existence in new ways ... conservation".', locatorParagraph: 'C' },
              { number: 29, promptHtml: 'Paragraph D', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph D: "Some animals ... simply cannot be kept well in captivity".', locatorParagraph: 'D' },
              { number: 30, promptHtml: 'Paragraph E', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph E: "Here the evidence is mixed".', locatorParagraph: 'E' },
            ],
          },
          {
            id: 't40-r3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 31, promptHtml: 'According to paragraph A, early zoos obtained new animals mainly by', options: [{ key: 'A', text: 'breeding them in captivity.' }, { key: 'B', text: 'exchanging them with other zoos.' }, { key: 'C', text: 'taking them from the wild.' }, { key: 'D', text: 'buying them from museums.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph A: animals were "replaced by capturing new ones from the wild".' },
              { number: 32, promptHtml: 'Why do some zoo staff hide animals\' food?', options: [{ key: 'A', text: 'to stop visitors feeding the animals' }, { key: 'B', text: 'to keep the animals from becoming bored' }, { key: 'C', text: 'to reduce the amount of food needed' }, { key: 'D', text: 'to prepare animals for release' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B: "to prevent the boredom and repetitive behaviour".' },
              { number: 33, promptHtml: 'What is the aim of exchanging animals between zoos?', options: [{ key: 'A', text: 'to attract more visitors' }, { key: 'B', text: 'to reduce costs' }, { key: 'C', text: 'to give animals more space' }, { key: 'D', text: 'to maintain genetic variety' }], answer: { accepted: ['D'] }, explanationHtml: 'Paragraph C: "to maintain healthy populations with as much genetic variety as possible".' },
              { number: 34, promptHtml: 'What do critics say about the animals kept in zoos?', options: [{ key: 'A', text: 'Most are not from endangered species.' }, { key: 'B', text: 'Most were born in the wild.' }, { key: 'C', text: 'Most are kept alone.' }, { key: 'D', text: 'Most are too old to breed.' }], answer: { accepted: ['A'] }, explanationHtml: 'Paragraph D: "the great majority of animals in zoos belong to species that are not endangered".' },
              { number: 35, promptHtml: 'Some zoos have stopped keeping elephants because', options: [{ key: 'A', text: 'they are too expensive to feed.' }, { key: 'B', text: 'they show signs of stress in captivity.' }, { key: 'C', text: 'visitors are no longer interested in them.' }, { key: 'D', text: 'they are dangerous to keepers.' }], answer: { accepted: ['B'] }, explanationHtml: 'Paragraph D: they "show signs of stress in even the best enclosures, and several zoos have stopped keeping elephants for this reason".' },
              { number: 36, promptHtml: 'According to paragraph E, which activity has the greatest educational effect?', options: [{ key: 'A', text: 'reading information signs' }, { key: 'B', text: 'watching feeding times' }, { key: 'C', text: 'talks given by keepers' }, { key: 'D', text: 'visiting many enclosures' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph E: "guided activities and talks by keepers appear to have a much greater effect".' },
            ],
          },
          {
            id: 't40-r3-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 37, promptHtml: 'Moats were used to separate visitors from animals.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph B: "using ditches and moats to separate animals from visitors".' },
              { number: 38, promptHtml: 'All species bred in zoos have been successfully returned to the wild.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph C: only "some have been successfully returned".' },
              { number: 39, promptHtml: 'Children learn more from zoo visits than adults do.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'Paragraph E does not compare what children and adults learn.' },
              { number: 40, promptHtml: 'Some experts believe zoos will keep a smaller number of species in future.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph F: "zoos will keep fewer species".' },
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
        contextText: 'You will hear a father phoning a leisure centre to ask about summer holiday clubs for children.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Parkside Leisure Centre, how can I help?" },
          { speaker: 'B', voice: 'david', text: "Hi, I'm calling about the summer holiday clubs. My daughter is nine, and I'd like to know what's available." },
          { speaker: 'A', voice: 'zira', text: "Sure. We've got three clubs for her age group this year. The first is the Sports Club, which runs here in the sports hall. It covers a different sport every day, and the special feature this year is that the children get coaching from a former professional footballer." },
          { speaker: 'B', voice: 'david', text: "She'd like that. What are the others?" },
          { speaker: 'A', voice: 'zira', text: "Then there's the Science Club. That's not held here, it's at Hillside Primary School, because they have proper laboratories. The children do experiments, and at the end of the week they make a rocket and launch it on the school field." },
          { speaker: 'B', voice: 'david', text: "That sounds fun. And the third?" },
          { speaker: 'A', voice: 'zira', text: "The Art Club, which is at the library, in their activity room. This year they're doing a project on painting, and the special thing is that the children's work will be shown in an exhibition at the town hall in September." },
          { speaker: 'B', voice: 'david', text: "I think she'd prefer the Science Club, to be honest. What's included in the price?" },
          { speaker: 'A', voice: 'zira', text: "For all the clubs, the price includes a mid-morning snack, and a T-shirt with the club logo. Lunch isn't provided, so children need to bring a packed lunch. And there's no transport between here and the school, I'm afraid, parents have to take them." },
          { speaker: 'B', voice: 'david', text: "OK. When does the Science Club run?" },
          { speaker: 'A', voice: 'zira', text: "There are two weeks, starting on the twenty-eighth of July and the eleventh of August. It runs from nine thirty to three thirty, Monday to Friday." },
          { speaker: 'B', voice: 'david', text: "The first week would be better. Does she need to bring anything apart from lunch?" },
          { speaker: 'A', voice: 'zira', text: "Yes, some old clothes, because some of the experiments can be messy. We provide safety goggles, so she doesn't need those." },
          { speaker: 'B', voice: 'david', text: "And how much is it?" },
          { speaker: 'A', voice: 'zira', text: "It's one hundred and twenty pounds for the week. But if you're a member of the leisure centre, you get ten per cent off." },
          { speaker: 'B', voice: 'david', text: "We are members, actually. Can I book now?" },
          { speaker: 'A', voice: 'zira', text: "Of course. We just need you to fill in a medical form, which I'll email to you. Please return it at least a week before the club starts." },
        ],
        questionGroups: [
          {
            id: 't40-l1-clubs',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['Club', 'Place', 'Special feature'],
              [
                ['Sports', 'sports hall', 'coaching from a former professional {{q1}}'],
                ['Science', '{{q2}} Primary School', 'children launch a {{q3}}'],
                ['Art', 'the library', 'work shown in an {{q4}} in September'],
              ],
              'Summer holiday clubs'
            ),
            questions: [
              { number: 1, answer: { accepted: ['footballer'] }, explanationHtml: '"coaching from a former professional footballer".' },
              { number: 2, answer: { accepted: ['hillside'] }, explanationHtml: '"it\'s at Hillside Primary School".' },
              { number: 3, answer: { accepted: ['rocket'] }, explanationHtml: '"they make a rocket and launch it on the school field".' },
              { number: 4, answer: { accepted: ['exhibition'] }, explanationHtml: '"shown in an exhibition at the town hall in September".' },
            ],
          },
          {
            id: 't40-l1-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 5,
                promptHtml: 'Which TWO things are included in the price of all the clubs?',
                options: [
                  { key: 'A', text: 'lunch' },
                  { key: 'B', text: 'a snack' },
                  { key: 'C', text: 'transport' },
                  { key: 'D', text: 'a T-shirt' },
                  { key: 'E', text: 'a certificate' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"the price includes a mid-morning snack, and a T-shirt". Lunch and transport are not provided.',
              },
            ],
          },
          {
            id: 't40-l1-booking',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Science Club booking', 'Details'],
              [
                ['Start date', '{{q6}}'],
                ['Times', '9.30 – {{q7}}'],
                ['Bring', 'packed lunch and {{q8}}'],
                ['Cost', '£120, with {{q9}} discount for members'],
                ['Before the club', 'return the {{q10}} a week in advance'],
              ]
            ),
            questions: [
              { number: 6, answer: { accepted: ['28 july', '28th july', 'july 28', 'july 28th', 'twenty-eighth of july', '28th of july'] }, explanationHtml: '"starting on the twenty-eighth of July" — "The first week would be better."' },
              { number: 7, answer: { accepted: ['3.30', '3:30', '15.30', '15:30'] }, explanationHtml: '"It runs from nine thirty to three thirty".' },
              { number: 8, answer: { accepted: ['old clothes'] }, explanationHtml: '"some old clothes, because some of the experiments can be messy". Goggles are provided.' },
              { number: 9, answer: { accepted: ['10%', '10 per cent', 'ten per cent', '10 percent'] }, explanationHtml: '"you get ten per cent off".' },
              { number: 10, answer: { accepted: ['medical form'] }, explanationHtml: '"fill in a medical form ... return it at least a week before".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear an instructor talking to a group at the start of a sea kayaking course.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Morning, everyone, and welcome to Westbay Outdoor Centre. I'm Nick, and I'll be your instructor for the kayaking course this week. Before we go anywhere near the water, I want to show you the main parts of the kayak, and tell you where to find your equipment." },
          { speaker: 'A', voice: 'david', text: "Have a look at the diagram on the board. This is a sea kayak seen from above, with the front, the bow, on the left. In the middle, of course, is the cockpit, where you sit. In front of you, the round cover near the front of the boat is a hatch. Underneath it there's a waterproof compartment where you can keep things like your lunch and a spare jumper." },
          { speaker: 'A', voice: 'david', text: "There's a second hatch at the back of the boat, but we keep the emergency equipment in that one, so please don't use it for your own things." },
          { speaker: 'A', voice: 'david', text: "Just behind the cockpit, you'll see a small bar across the deck. That's where you attach the pump, which you'll use to get water out of the kayak if you capsize." },
          { speaker: 'A', voice: 'david', text: "And at each end of the kayak, at the very tip, there's a grab handle. You use these to carry the kayak between two people, and if you're in the water, you hold onto the handle so that you don't get separated from your boat." },
          { speaker: 'A', voice: 'david', text: "OK, now your equipment. When we finish here, go to the changing rooms, where you'll find wetsuits in all sizes. Please try a few on; they should feel tight but comfortable." },
          { speaker: 'A', voice: 'david', text: "Buoyancy aids, the life jackets, are hanging up in the boathouse, next to the kayaks. Everyone must wear one whenever they're on or near the water, no exceptions." },
          { speaker: 'A', voice: 'david', text: "Paddles are kept in the store room behind reception, because they're expensive and we lock them up at night. I'll give them out myself." },
          { speaker: 'A', voice: 'david', text: "Helmets aren't needed on the sea, but we'll use them on Thursday when we go to the river. They're in the minibus already, so you don't need to collect them." },
          { speaker: 'A', voice: 'david', text: "If you forgot to bring a water bottle, you can buy one at reception. And the first aid kit is kept on the jetty, in the yellow box, so it's always close to the water." },
          { speaker: 'A', voice: 'david', text: "Finally, a couple of practical things. If you need to contact the centre during the week, the number is oh one four nine seven, three six two, eight eight five. And if the weather's too bad for kayaking, which happens about once a week at this time of year, we'll do a climbing session in the sports hall instead. Right, let's get changed." },
        ],
        questionGroups: [
          {
            id: 't40-l2-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Choose <strong>THREE</strong> answers from the box and write the correct letter, <strong>A-E</strong>, next to Questions 11-13.',
            imageUrl: KAYAK_DIAGRAM,
            imageAlt: 'Diagram of a sea kayak seen from above, bow on the left: a large oval cockpit in the middle, a round cover towards the front and another towards the back, a small bar across the deck just behind the cockpit, and a short line at each tip of the boat.',
            bank: [
              { key: 'A', text: 'emergency equipment' },
              { key: 'B', text: 'storage for your own things' },
              { key: 'C', text: 'grab handle' },
              { key: 'D', text: 'seat adjustment' },
              { key: 'E', text: 'place for the pump' },
            ],
            imageHotspots: [
              { questionNumber: 11, x: 25, y: 40 },
              { questionNumber: 12, x: 64, y: 40 },
              { questionNumber: 13, x: 3, y: 42 },
            ],
            questions: [
              { number: 11, answer: { accepted: ['B'] }, explanationHtml: '"the round cover near the front of the boat is a hatch ... where you can keep things like your lunch".' },
              { number: 12, answer: { accepted: ['E'] }, explanationHtml: '"Just behind the cockpit ... a small bar across the deck. That\'s where you attach the pump".' },
              { number: 13, answer: { accepted: ['C'] }, explanationHtml: '"at each end of the kayak, at the very tip, there\'s a grab handle".' },
            ],
          },
          {
            id: 't40-l2-where',
            type: 'matching_features',
            instructionHtml:
              'Where can each of the following be found? Choose <strong>FIVE</strong> answers from the box and write the correct letter, A-G, next to Questions 14-18.',
            bank: [
              { key: 'A', text: 'changing rooms' },
              { key: 'B', text: 'boathouse' },
              { key: 'C', text: 'store room' },
              { key: 'D', text: 'minibus' },
              { key: 'E', text: 'reception' },
              { key: 'F', text: 'jetty' },
              { key: 'G', text: 'sports hall' },
            ],
            questions: [
              { number: 14, promptHtml: 'wetsuits', answer: { accepted: ['A'] }, explanationHtml: '"go to the changing rooms, where you\'ll find wetsuits".' },
              { number: 15, promptHtml: 'buoyancy aids', answer: { accepted: ['B'] }, explanationHtml: '"Buoyancy aids ... are hanging up in the boathouse".' },
              { number: 16, promptHtml: 'paddles', answer: { accepted: ['C'] }, explanationHtml: '"Paddles are kept in the store room behind reception".' },
              { number: 17, promptHtml: 'helmets', answer: { accepted: ['D'] }, explanationHtml: '"They\'re in the minibus already".' },
              { number: 18, promptHtml: 'first aid kit', answer: { accepted: ['F'] }, explanationHtml: '"the first aid kit is kept on the jetty".' },
            ],
          },
          {
            id: 't40-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: '<p>Centre phone number: {{q19}}</p><p>In bad weather: {{q20}} session in the sports hall</p>',
            questions: [
              { number: 19, answer: { accepted: ['01497362885', '01497 362885', '01497 362 885'] }, explanationHtml: '"oh one four nine seven, three six two, eight eight five".' },
              { number: 20, answer: { accepted: ['climbing'] }, explanationHtml: '"we\'ll do a climbing session in the sports hall instead".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a mature student, Sandra, talking to her tutor about her first term on an engineering degree.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Come in, Sandra. So, you've finished your first term. How has it been, coming back to study after so long?" },
          { speaker: 'B', voice: 'zira', text: "Better than I expected, actually. I was really worried about the maths, because I hadn't done any for nearly fifteen years. But the refresher course in September helped a lot." },
          { speaker: 'A', voice: 'david', text: "I'm glad. Was there anything that was harder than you expected?" },
          { speaker: 'B', voice: 'zira', text: "Honestly, it was the computer programming. I thought it would be easy, because I use computers all the time at work, but writing code is completely different." },
          { speaker: 'A', voice: 'david', text: "A lot of students find that. And how have you found working with the younger students?" },
          { speaker: 'B', voice: 'zira', text: "I was nervous about it, but they've been very friendly. In the group projects, they seem to like having someone who's more organised. I've ended up as the one who plans everything." },
          { speaker: 'A', voice: 'david', text: "That's a useful skill. Your lab reports have been very good, by the way. You explain your methods clearly, and your results are always accurate. The one thing I'd say is that your conclusions are sometimes rather brief." },
          { speaker: 'B', voice: 'zira', text: "I know. I tend to run out of time at the end." },
          { speaker: 'A', voice: 'david', text: "Try planning the conclusion before you start writing. Now, next term you'll start the design module. Have you thought about which project you'd like to do?" },
          { speaker: 'B', voice: 'zira', text: "I'd like to do something on bridges. I've always been interested in how they're built." },
          { speaker: 'A', voice: 'david', text: "Good. For that, you'll need to use the materials testing lab. It's only open to students who've done the safety course, so book that as soon as you can. It runs on Wednesday afternoons." },
          { speaker: 'B', voice: 'zira', text: "OK. And how is the project assessed?" },
          { speaker: 'A', voice: 'david', text: "There's a written report, and you also have to present a model to the class. The model is worth forty per cent of the marks." },
          { speaker: 'B', voice: 'zira', text: "Forty per cent. That's a lot. What about managing my time? I'm still working two days a week." },
          { speaker: 'A', voice: 'david', text: "Many mature students find the most effective approach is to study in the early morning, before family and work demands start. But the key thing is to have a fixed timetable and stick to it." },
          { speaker: 'B', voice: 'zira', text: "That's what I've been trying to do. One more thing: I saw a notice about a mentoring scheme." },
          { speaker: 'A', voice: 'david', text: "Yes, second-year students who act as mentors to first-years. You'd meet your mentor once a fortnight. I think it would be helpful, especially for the programming." },
          { speaker: 'B', voice: 'zira', text: "Then I'll sign up. Thank you." },
        ],
        questionGroups: [
          {
            id: 't40-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Which part of the course did Sandra find most difficult?', options: [{ key: 'A', text: 'mathematics' }, { key: 'B', text: 'programming' }, { key: 'C', text: 'laboratory work' }], answer: { accepted: ['B'] }, explanationHtml: '"it was the computer programming". The refresher course helped with the maths.' },
              { number: 22, promptHtml: 'What role does Sandra usually take in group projects?', options: [{ key: 'A', text: 'She does the calculations.' }, { key: 'B', text: 'She presents the results.' }, { key: 'C', text: 'She plans the work.' }], answer: { accepted: ['C'] }, explanationHtml: '"I\'ve ended up as the one who plans everything."' },
            ],
          },
          {
            id: 't40-l3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 23, promptHtml: 'The tutor thinks the {{q23}} of Sandra\'s lab reports are too short.', answer: { accepted: ['conclusions'] }, explanationHtml: '"your conclusions are sometimes rather brief".' },
              { number: 24, promptHtml: 'Sandra wants to do her design project on {{q24}}.', answer: { accepted: ['bridges'] }, explanationHtml: '"I\'d like to do something on bridges."' },
              { number: 25, promptHtml: 'The model is worth 40 per cent of the {{q25}}.', answer: { accepted: ['marks'] }, explanationHtml: '"The model is worth forty per cent of the marks."' },
            ],
          },
          {
            id: 't40-l3-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            questions: [
              { number: 26, promptHtml: 'What must students complete before using the materials testing lab?', answer: { accepted: ['safety course', 'the safety course'] }, explanationHtml: '"It\'s only open to students who\'ve done the safety course".' },
              { number: 27, promptHtml: 'When does this course take place?', answer: { accepted: ['wednesday afternoons', 'on wednesday afternoons', 'wednesday afternoon'] }, explanationHtml: '"It runs on Wednesday afternoons."' },
              { number: 28, promptHtml: 'How many days a week does Sandra work?', answer: { accepted: ['two', '2', 'two days', '2 days'] }, explanationHtml: '"I\'m still working two days a week."' },
              { number: 29, promptHtml: 'When do many mature students find it best to study?', answer: { accepted: ['early morning', 'in the early morning', 'the early morning'] }, explanationHtml: '"study in the early morning".' },
              { number: 30, promptHtml: 'How often would Sandra meet her mentor?', answer: { accepted: ['once a fortnight', 'every two weeks', 'every fortnight'] }, explanationHtml: '"You\'d meet your mentor once a fortnight."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear a student presenting her group\'s research on the use of standing desks in an office.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good afternoon. Our group has been investigating standing desks, the adjustable desks that allow people to work either sitting or standing. We chose this topic because there's been a lot of media attention on the health risks of sitting for long periods, and many companies have started buying these desks for their staff." },
          { speaker: 'A', voice: 'zira', text: "We were lucky enough to be able to study an insurance company that had just bought standing desks for one of its departments. We compared that department with another department in the same building that still had ordinary desks. There were about forty people in each." },
          { speaker: 'A', voice: 'zira', text: "Our first question was simply whether people used the standing option. Before the study, we'd expected most people to stand for about half the day. In fact, in the first week, people stood for around two hours a day, but by the end of three months, this had fallen to just under an hour. The novelty seemed to wear off quite quickly." },
          { speaker: 'A', voice: 'zira', text: "We also asked people why they stopped standing. The most common reason wasn't tiredness, as we'd assumed. It was that people forgot. Once they sat down to concentrate on a task, they simply didn't think about changing position." },
          { speaker: 'A', voice: 'zira', text: "The company then tried putting reminders on people's computers every hour, and this did increase standing time for a while, but many staff found the reminders annoying and switched them off." },
          { speaker: 'A', voice: 'zira', text: "Next, we looked at productivity. The company measured this by the number of insurance claims processed. We found no significant difference between the two departments, which we thought was actually a positive result, since some managers had worried that standing would reduce concentration." },
          { speaker: 'A', voice: 'zira', text: "When we asked staff how they felt, those with standing desks reported less back pain than before, and said they felt more energetic in the afternoons. However, we should be careful here, because this was based on what people told us, not on any medical measurement." },
          { speaker: 'A', voice: 'zira', text: "Finally, we have some recommendations. We've summarised them in the table on the handout. First, for employees: we suggest alternating between sitting and standing, rather than standing for long periods, which can cause problems of its own, such as pain in the feet. A soft mat on the floor makes standing more comfortable." },
          { speaker: 'A', voice: 'zira', text: "Second, for managers: we found that people stood more when their manager did, so we'd recommend that managers set an example. Standing meetings are another idea; they tend to be shorter, too." },
          { speaker: 'A', voice: 'zira', text: "And third, for designers of office furniture. Several staff complained that the desks were noisy when they were raised or lowered, which disturbed colleagues. And the controls were often in an awkward position, so we'd suggest putting them at the front of the desk where they can easily be reached." },
          { speaker: 'A', voice: 'zira', text: "Thank you. We're happy to take any questions." },
        ],
        questionGroups: [
          {
            id: 't40-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'Why did the group choose this topic?', options: [{ key: 'A', text: 'The media had reported on the dangers of sitting.' }, { key: 'B', text: 'Their tutor suggested it.' }, { key: 'C', text: 'They had used standing desks themselves.' }], answer: { accepted: ['A'] }, explanationHtml: '"there\'s been a lot of media attention on the health risks of sitting".' },
              { number: 32, promptHtml: 'How did the group carry out the study?', options: [{ key: 'A', text: 'by comparing two companies' }, { key: 'B', text: 'by comparing two departments' }, { key: 'C', text: 'by studying one department before and after' }], answer: { accepted: ['B'] }, explanationHtml: '"We compared that department with another department in the same building".' },
              { number: 33, promptHtml: 'After three months, how long did people stand each day?', options: [{ key: 'A', text: 'about half the day' }, { key: 'B', text: 'about two hours' }, { key: 'C', text: 'less than an hour' }], answer: { accepted: ['C'] }, explanationHtml: '"by the end of three months, this had fallen to just under an hour".' },
              { number: 34, promptHtml: 'What was the main reason people stopped standing?', options: [{ key: 'A', text: 'They felt tired.' }, { key: 'B', text: 'They forgot to change position.' }, { key: 'C', text: 'Their colleagues complained.' }], answer: { accepted: ['B'] }, explanationHtml: '"The most common reason wasn\'t tiredness ... It was that people forgot."' },
              { number: 35, promptHtml: 'What happened with the computer reminders?', options: [{ key: 'A', text: 'They had no effect at all.' }, { key: 'B', text: 'Many people turned them off.' }, { key: 'C', text: 'They were sent too rarely.' }], answer: { accepted: ['B'] }, explanationHtml: '"many staff found the reminders annoying and switched them off".' },
              { number: 36, promptHtml: 'What did the group find about productivity?', options: [{ key: 'A', text: 'It increased in the standing-desk department.' }, { key: 'B', text: 'It fell because of poor concentration.' }, { key: 'C', text: 'It was similar in both departments.' }], answer: { accepted: ['C'] }, explanationHtml: '"We found no significant difference between the two departments".' },
            ],
          },
          {
            id: 't40-l4-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['For', 'Recommendations'],
              [
                ['Employees', 'alternate sitting and standing; use a soft {{q37}}'],
                ['Managers', 'set an {{q38}}; hold standing meetings'],
                ['Designers', 'make desks less {{q39}}; put controls at the {{q40}}'],
              ]
            ),
            questions: [
              { number: 37, answer: { accepted: ['mat'] }, explanationHtml: '"A soft mat on the floor makes standing more comfortable."' },
              { number: 38, answer: { accepted: ['example'] }, explanationHtml: '"we\'d recommend that managers set an example".' },
              { number: 39, answer: { accepted: ['noisy'] }, explanationHtml: '"the desks were noisy when they were raised or lowered".' },
              { number: 40, answer: { accepted: ['front'] }, explanationHtml: '"putting them at the front of the desk".' },
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
        '<p>The graph below shows the number of international students enrolled at universities in four countries between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'International university students, 2000-2020 (thousands)',
        unit: 'thousand',
        categories: ['2000', '2005', '2010', '2015', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Students (thousands)',
        series: [
          { name: 'Country A', data: [220, 300, 390, 450, 470] },
          { name: 'Country B', data: [150, 180, 250, 380, 520] },
          { name: 'Country C', data: [90, 140, 170, 190, 160] },
          { name: 'Country D', data: [30, 45, 80, 140, 230] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people believe that secondary school students should be allowed to choose all of the subjects they study.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
