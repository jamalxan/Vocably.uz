// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE follows a standard Academic test
// layout; every topic, passage, transcript, question and answer is written from scratch.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION, svgDataUri, q, paras, mc, bank } from './_html.mjs';

const SPORTS_PLAN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#eef3f6"/>
  <text x="190" y="22" font-weight="bold" fill="#333">Parkway Sports Centre: ground floor</text>
  <rect x="40" y="40" width="150" height="120" fill="#dfe8f0" stroke="#6f8faa"/>
  <rect x="225" y="40" width="150" height="120" fill="#dfe8f0" stroke="#6f8faa"/>
  <rect x="410" y="40" width="150" height="120" fill="#dfe8f0" stroke="#6f8faa"/>
  <rect x="40" y="240" width="150" height="120" fill="#dfe8f0" stroke="#6f8faa"/>
  <rect x="410" y="240" width="150" height="120" fill="#dfe8f0" stroke="#6f8faa"/>
  <rect x="225" y="260" width="150" height="100" fill="#f3efe0" stroke="#a89c6a"/>
  <text x="272" y="315" fill="#5a4f1f" font-weight="bold">Reception</text>
  <rect x="40" y="170" width="520" height="60" fill="#fafafa" stroke="#ccc" stroke-dasharray="4"/>
  <text x="250" y="205" fill="#777">Main corridor</text>
  <rect x="260" y="385" width="80" height="12" fill="#555"/>
  <text x="350" y="396" fill="#333">Entrance</text>
  <path d="M580 330 L580 305 M572 315 L580 302 L588 315" stroke="#333" stroke-width="2" fill="none"/>
  <text x="575" y="345" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-21',
  title: 'Vocably Practice Test 21',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The secret life of lichen',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: paras(
          ['A', `Look closely at an old stone wall, a gravestone or the bark of a tree, and you will almost certainly see patches of crusty grey, green or orange growth. These are lichens, and although they are often dismissed as a kind of moss, they are something far stranger. A lichen is not a single organism but a partnership between at least two: a fungus, which provides the structure, and an alga or a bacterium capable of photosynthesis, which produces food from sunlight. The fungus shelters its partner and supplies it with water and minerals, and in return, receives sugars. Some twenty thousand species of lichen are known, and they grow on every continent, from tropical rainforests to the bare rock of Antarctica.`],
          ['B', `Lichens owe their success to their toughness. They can survive extremes of heat and cold, and when they dry out, they go into a dormant state, reviving within hours when it rains. They have no roots, and absorb water and nutrients directly from the rain and the air through their whole surface. In 2005, a team of European scientists attached samples of lichen to the outside of a spacecraft, exposing them to the vacuum of space and to strong radiation for two weeks. When they were returned to Earth, most of them resumed growing normally, and some researchers have described lichens as among the most resilient organisms known.`],
          ['C', `The price of such resilience is slowness. Many lichens grow by only a fraction of a millimetre a year, and a patch the size of a dinner plate may have been growing for hundreds of years, while some in the Arctic are thought to be several thousand years old. Scientists have turned this to good use. By measuring the diameter of the largest lichen on a rock surface, and comparing it with the known growth rate of that species, they can estimate how long ago the surface was exposed, a technique called lichenometry. It has been used to date the retreat of glaciers, rockfalls and even the age of gravestones, and is especially valuable in places where other dating methods are not available.`],
          ['D', `Because lichens take their nutrients directly from the air, they are extremely sensitive to pollution. Many species cannot tolerate sulphur dioxide, a gas produced by burning coal, and disappear from polluted cities, while others thrive on it. By noting which species are present, scientists can assess air quality without any instruments. In Europe and North America, the return of sensitive lichens to cities has been taken as a sign that air pollution has fallen since the clean-air laws of the twentieth century. Lichens also accumulate metals and radioactive particles, and were used to track the spread of fallout after a nuclear accident in the 1980s.`],
          ['E', `Lichens have also been of practical value to people. For centuries, they were a source of dyes, giving colours ranging from yellow to deep purple, and one extract was used to make litmus, which turns red in acid and blue in alkali and is still used in school laboratories. In the far north, reindeer and caribou depend on lichen as their main winter food, scraping it from under the snow. Some lichens are eaten by people in times of famine, and others contain chemicals with antibiotic properties, which are being investigated by researchers looking for new medicines.`],
          ['F', `Lichens continue to surprise scientists. For more than a century, the textbooks described them as a partnership between two organisms. In 2016, however, researchers studying lichens in Montana found that many of them contain a third partner, a type of yeast embedded in the outer layer, which had been overlooked because it is so hard to detect. Its role is still unclear, but it may help to protect the lichen or to give it its particular shape. The discovery is a reminder that even the most familiar organisms may have secrets, and that the patches on the old wall still have much to teach us.`]
        ),
        questionGroups: [
          {
            id: 't21-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'A lichen consists of a fungus living in partnership with an alga or a bacterium.', 'TRUE', 'Paragraph A: "a partnership between at least two".', 'A'),
              q(2, 'All lichens grow at the same speed.', 'FALSE', 'Paragraph C: growth rates differ by species ("the known growth rate of that species").', 'C'),
              q(3, 'Lichens can be used to assess the quality of the air.', 'TRUE', 'Paragraph D: "scientists can assess air quality".', 'D'),
              q(4, 'Litmus is made from an extract of lichen.', 'TRUE', 'Paragraph E: "one extract was used to make litmus".', 'E'),
              q(5, 'Reindeer depend on lichen as their main food throughout the year.', 'FALSE', 'Paragraph E: "main winter food".', 'E'),
              q(6, 'Lichens have been used successfully to treat human infections.', 'NOT GIVEN', 'Paragraph E says only that they contain chemicals "being investigated".', 'E'),
            ],
          },
          {
            id: 't21-r1-sentences',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              q(7, 'About {{q7}} species of lichen are known.', ['twenty thousand', '20,000', '20000'], 'Paragraph A: "Some twenty thousand species".', 'A'),
              q(8, 'Lichens absorb water and nutrients from the rain and the {{q8}}.', ['air'], 'Paragraph B: "from the rain and the air".', 'B'),
              q(9, 'In 2005, lichens were exposed to space for {{q9}}.', ['two weeks', '2 weeks'], 'Paragraph B: "for two weeks".', 'B'),
              q(10, 'Lichenometry is used to estimate how long ago a surface was {{q10}}.', ['exposed'], 'Paragraph C: "how long ago the surface was exposed".', 'C'),
              q(11, 'Many lichens cannot tolerate {{q11}}, a gas produced by burning coal.', ['sulphur dioxide', 'sulfur dioxide'], 'Paragraph D: "sulphur dioxide, a gas produced by burning coal".', 'D'),
              q(12, 'Litmus turns red in an acid and {{q12}} in an alkali.', ['blue'], 'Paragraph E: "turns red in acid and blue in alkali".', 'E'),
              q(13, 'In 2016, researchers found that many lichens contain a third partner, a type of {{q13}}.', ['yeast'], 'Paragraph F: "a type of yeast".', 'F'),
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'A short history of the passport',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: paras(
          ['A', `The passport is such a familiar part of modern life that it seems to have existed for ever, yet the document in its present form is barely a century old. The idea of a written permission to travel is ancient: the Bible records that a governor serving a Persian king asked for letters to ensure his safe passage through neighbouring lands. In the Middle Ages, rulers and towns issued safe-conducts to merchants and pilgrims, which promised protection, and sometimes demanded payment. The English word is thought to come from the French for passing through a port, although some scholars doubt it. What is certain is that for most of history, such papers were issued individually, were valid for a single journey and were largely ignored by people who travelled little.`],
          ['B', `In the nineteenth century, something unexpected happened: the passport almost disappeared. The spread of railways made it possible for millions of people to cross borders every year, and the officials who might have checked their papers could not keep up. Governments, too, came to believe that free movement was good for trade. By the 1870s, travellers could cross most of Europe without showing any documents at all, and many people in the period recalled it as a golden age of travel. A British writer observed that a person could move from country to country with no more formality than is required to go from one English county to another.`],
          ['C', `The First World War ended this freedom almost overnight. Governments that feared spies and saboteurs introduced strict controls on movement, and required travellers to carry papers that could be checked at the frontier. In 1914, Britain issued a new form of passport, a single folded sheet on which the holder's description was written and, for the first time, a photograph was attached. A photograph, unlike a written description, could not easily be forged or copied, and it allowed a border official to see at once whether the person in front of them was the person named. The measures were intended to be temporary, but they never were withdrawn.`],
          ['D', `The chaos of the post-war years, in which millions of people were displaced by revolution and the collapse of empires, led to demands for order. In 1920, an international conference in Paris, organised by the League of Nations, agreed a common standard: passports should be small booklets with a fixed number of pages, written in the national language and in French, and containing the holder's photograph and details. Further conferences in the 1920s refined the format, and the booklet that most people carry today is a direct descendant of it. Although the standards were designed for the convenience of governments, they made international travel simpler for the traveller as well.`],
          ['E', `The value of a passport, however, varies enormously. A yearly index compares the number of countries to which the holder of each nationality may travel without a visa. At the top of the list, holders of the most favoured passports can enter nearly two hundred countries with no advance permission, while those at the bottom may enter fewer than thirty, and must apply for visas, pay fees and wait weeks for each trip. For the millions of people who are stateless, or who are refugees without documents, the situation is worse, since they have no passport at all. Some writers have described the passport as the most unequal document in the world, since it determines where people may go, work and live.`],
          ['F', `Technology has transformed the document. Since 2006, most countries have issued electronic passports, containing a small chip in which the holder's details and a digital photograph are stored, and making forgery far more difficult. At many airports, travellers can now pass through automatic gates, where a camera compares their face with the image in the chip, and a growing number of countries are introducing systems that record fingerprints or scan the iris of the eye. Supporters say that these measures make travel faster and more secure. Critics respond that they create vast databases of personal information, which might be hacked or misused, and that the price of convenience is a loss of privacy.`],
          ['G', `What will the passport look like in another century? Some governments are already experimenting with digital versions, stored on a mobile phone, which could be checked without the need to hand over a document. Such a system would be hard to lose and easy to update, but it would depend on the security of the phone and on the agreement of other countries to accept it. Others suggest that the passport might eventually be replaced altogether by systems that identify a person by their face as they walk through a door. Whatever form it takes, the document that began as a letter of introduction seems likely to remain an essential part of international travel.`]
        ),
        questionGroups: [
          {
            id: 't21-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              q(14, 'a reference to a travel document mentioned in an ancient text', 'A', 'Paragraph A: "the Bible records".', 'A'),
              q(15, 'a reason why travel documents became unnecessary for a time', 'B', 'Paragraph B: railways and the belief that free movement was good for trade.', 'B'),
              q(16, 'an explanation of why photographs were added to passports', 'C', 'Paragraph C: a photograph "could not easily be forged or copied".', 'C'),
              q(17, 'an international meeting that agreed a standard format', 'D', 'Paragraph D: "an international conference in Paris".', 'D'),
              q(18, 'a comparison showing differences in the freedom to travel', 'E', 'Paragraph E: nearly two hundred countries compared with fewer than thirty.', 'E'),
              q(19, 'a reference to electronic chips', 'F', 'Paragraph F: "a small chip".', 'F'),
              q(20, 'a prediction that passports may be stored on phones', 'G', 'Paragraph G: "digital versions, stored on a mobile phone".', 'G'),
            ],
          },
          {
            id: 't21-r2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(21, 'The word "passport" is thought to come from', ['a Persian word', 'the French for passing through a port', 'a Latin word for a letter', 'the name of a king'], 'B', 'Paragraph A: "the French for passing through a port".', 'A'),
              mc(22, 'What does paragraph B say about travel in the 1870s?', ['It was impossible without a passport.', 'Travellers could cross most of Europe without documents.', 'It was limited to the wealthy.', 'Railways were banned.'], 'B', 'Paragraph B: "without showing any documents at all".', 'B'),
              mc(23, 'Why did governments introduce controls during the First World War?', ['to raise money', 'because they feared spies and saboteurs', 'to encourage trade', 'to help refugees'], 'B', 'Paragraph C: "feared spies and saboteurs".', 'C'),
              mc(24, 'What did the 1920 conference achieve?', ['It abolished visas.', 'It agreed a common standard for passports.', 'It introduced electronic passports.', 'It created a world passport.'], 'B', 'Paragraph D: "agreed a common standard".', 'D'),
              mc(25, 'What does paragraph E show?', ['All passports give the same rights.', 'Passports differ greatly in the freedom they give.', 'Refugees have the strongest passports.', 'Visas are free.'], 'B', 'Paragraph E: "The value of a passport ... varies enormously."', 'E'),
              mc(26, 'What do critics of biometric systems say?', ['They are too slow.', 'They create databases that may be hacked or misused.', 'They cannot be used at airports.', 'They make forgery easier.'], 'B', 'Paragraph F: "vast databases of personal information, which might be hacked or misused".', 'F'),
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'When machines write the news',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: paras(
          ['A', `In the early hours of a March morning in 2014, a journalist at a Los Angeles newspaper was woken by an earthquake. By the time he reached his desk, a short report was already waiting for him. It had been written by a computer program, which had received the data from the geological survey seconds after the tremor, and produced a report giving the location, the magnitude and a comparison with earlier quakes. The story was published within minutes, ahead of any rival. It was an early example of what is now called automated journalism, the use of software to produce news stories without a human writer, and it marked the beginning of a change whose consequences are still unfolding.`],
          ['B', `The technique is simpler than it sounds. The program is given a template, a story whose structure has been written by a journalist, with gaps for the details, and it fills the gaps with data. A report on a football match, for example, might begin with the score, go on to name the scorers, and then mention the position of each team in the league, each element chosen according to rules that an editor has laid down. More advanced systems can decide which fact is the most important, and start the story with it, and can vary the wording so that thousands of reports do not sound identical. The method works best on subjects for which there is a great deal of structured data, such as sport, finance and the weather.`],
          ['C', `The advantages are considerable. Machines are fast, and never tire, and they can produce a report the moment the data is published. They are also cheap, and so can cover subjects that no newspaper could afford to send a reporter to. One large news agency that began using automation for company earnings reports increased its output from about three hundred each quarter to several thousand, including reports on small companies that had never been covered before. Local news, which has been hit by the decline of newspapers, might benefit in the same way, through automatic reports on school results, council spending or sports fixtures. Supporters also argue that automation frees journalists from routine work, allowing them to devote their time to investigations and interviews.`],
          ['D', `A new generation of software has made the prospect more striking. Large language models, which have been trained on huge quantities of text, can produce fluent articles on almost any subject, and can draft headlines, summarise documents and adapt a story for different readers. But they have a weakness that template-based systems do not: they sometimes state things that are not true, including invented facts and quotations attributed to people who never said them, and they do so with complete confidence. Several newsrooms that experimented with publishing articles produced by such systems had to issue corrections after errors were found, and some abandoned the experiment.`],
          ['E', `Trust is the central concern. Studies in several countries have found that readers are often unable to distinguish between articles written by people and those written by software, and that they tend to rate automatically produced stories as accurate but dull. Yet many say that they would like to be told whether a story was written by a machine. Machines also reflect the biases of the data on which they are trained, and because a program has no sense of responsibility, it is hard to decide who should be blamed when it makes a mistake: the programmer, the editor or the publisher.`],
          ['F', `There are also limits to what a machine can do. It cannot attend a meeting, win the confidence of a source or ask the awkward question that makes a politician uncomfortable. It cannot decide that an apparently dull story is, in fact, important, because it is about something that nobody has yet noticed. The work of uncovering wrongdoing, of explaining complicated events and of putting facts into a context that readers can understand depends on qualities, such as curiosity, scepticism and judgement, that software does not possess. The best investigative reporting of the past half-century would have been impossible for a machine.`],
          ['G', `The economic pressures, though, are considerable. Newspapers have lost much of their advertising income to the internet, and many have cut staff. A publisher who can produce more stories with fewer journalists has an obvious temptation to do so, and there are fears that automation will be used to cut jobs, leaving fewer people to perform the work that machines cannot. Others counter that new kinds of work, such as editing and checking machine-produced text, will emerge, as they have after earlier technological changes, but the transition is likely to be painful for many.`],
          ['H', `My own view is that automated tools should be welcomed for the routine tasks for which they are suited, provided that they are supervised by people who understand their weaknesses. Readers should be told when a story has been written by a machine, and publishers should be ready to accept responsibility for errors. Above all, news organisations should remember that their value to the public lies in reporting that nobody else will do, and that their survival depends not on producing more words, but on producing words that can be trusted.`]
        ),
        questionGroups: [
          {
            id: 't21-r3-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has eight paragraphs, A-H. Choose the correct heading for paragraphs B-H from the list of headings below.<br/><em>Example: Paragraph A — x</em>',
            bank: [
              { key: 'i', text: 'Qualities that only human reporters have' },
              { key: 'ii', text: 'Speed, low cost and wider coverage' },
              { key: 'iii', text: 'The risks of software that invents facts' },
              { key: 'iv', text: 'A recommendation for careful and open use' },
              { key: 'v', text: 'Pressures on publishers and worries about jobs' },
              { key: 'vi', text: 'How a template is turned into a story' },
              { key: 'vii', text: 'The history of the newspaper' },
              { key: 'viii', text: 'Questions of trust and responsibility' },
              { key: 'ix', text: 'The decline of local sport' },
              { key: 'x', text: 'A story written in minutes' },
            ],
            questions: [
              q(27, 'Paragraph B', 'vi', 'Paragraph B: the template with gaps filled with data.', 'B'),
              q(28, 'Paragraph C', 'ii', 'Paragraph C: machines are fast, cheap and cover more subjects.', 'C'),
              q(29, 'Paragraph D', 'iii', 'Paragraph D: language models "sometimes state things that are not true".', 'D'),
              q(30, 'Paragraph E', 'viii', 'Paragraph E: "Trust is the central concern" and who should be blamed.', 'E'),
              q(31, 'Paragraph F', 'i', 'Paragraph F: curiosity, scepticism and judgement.', 'F'),
              q(32, 'Paragraph G', 'v', 'Paragraph G: lost advertising income and fears about jobs.', 'G'),
              q(33, 'Paragraph H', 'iv', 'Paragraph H: welcome tools, supervise them and tell readers.', 'H'),
            ],
          },
          {
            id: 't21-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              q(34, 'Automated reporting allows newspapers to cover subjects that they could not afford to cover before.', 'YES', 'Paragraph C: "can cover subjects that no newspaper could afford to send a reporter to".', 'C'),
              q(35, 'Articles produced by language models are always accurate.', 'NO', 'Paragraph D: they "sometimes state things that are not true".', 'D'),
              q(36, 'Readers can easily tell whether a story was written by a person or a machine.', 'NO', 'Paragraph E: readers "are often unable to distinguish".', 'E'),
              q(37, 'Machines will soon be able to replace investigative journalists.', 'NO', 'Paragraph F: "would have been impossible for a machine".', 'F'),
              q(38, 'Publishers should be required by law to label automated stories.', 'NOT GIVEN', 'Paragraph H says readers should be told, but the writer does not mention a legal requirement.', 'H'),
              q(39, 'Some newsrooms that published machine-written articles had to issue corrections.', 'YES', 'Paragraph D: "had to issue corrections after errors were found".', 'D'),
              q(40, 'Only journalists are able to judge whether a story is important.', 'NOT GIVEN', 'Paragraph F says a machine cannot, but does not say that nobody else can.', 'F'),
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
        contextText: 'You will hear a woman phoning a restaurant to book a table for a family celebration.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good evening, the Olive Tree Restaurant." },
          { speaker: 'B', voice: 'zira', text: "Good evening. I'd like to book a table for a family celebration, please." },
          { speaker: 'A', voice: 'david', text: "Certainly. What's the occasion?" },
          { speaker: 'B', voice: 'zira', text: "My parents' fortieth wedding anniversary. It's on Saturday the twenty-sixth of April." },
          { speaker: 'A', voice: 'david', text: "Congratulations. How many people will there be?" },
          { speaker: 'B', voice: 'zira', text: "Fourteen, including three children." },
          { speaker: 'A', voice: 'david', text: "For a group of that size, we recommend our private room, which seats up to eighteen. There's a minimum spend of a thousand pounds, but there's no charge for the room." },
          { speaker: 'B', voice: 'zira', text: "That should be fine. What time could we come?" },
          { speaker: 'A', voice: 'david', text: "We serve from twelve until three and from six until ten. Would you prefer lunch or dinner?" },
          { speaker: 'B', voice: 'zira', text: "Dinner, I think, at half past seven." },
          { speaker: 'A', voice: 'david', text: "That's fine. We have a set menu for groups, at forty-two pounds per person, with three courses. There's a vegetarian option, and we can cater for special diets if you tell us in advance." },
          { speaker: 'B', voice: 'zira', text: "My father is allergic to shellfish, and one of the children doesn't eat meat." },
          { speaker: 'A', voice: 'david', text: "I'll make a note of both. Would you like us to provide a cake?" },
          { speaker: 'B', voice: 'zira', text: "Yes, a chocolate cake, if possible, with the words 'Happy anniversary'." },
          { speaker: 'A', voice: 'david', text: "Of course, that's an extra eighteen pounds. We also need a deposit of two hundred pounds, payable by card, to secure the booking." },
          { speaker: 'B', voice: 'zira', text: "I'll pay now. Is there parking?" },
          { speaker: 'A', voice: 'david', text: "There's a public car park behind the restaurant, which is free after six. And the room is on the ground floor, so there are no stairs." },
          { speaker: 'B', voice: 'zira', text: "Excellent. My name is Teresa Albright, A-L-B-R-I-G-H-T." },
          { speaker: 'A', voice: 'david', text: "Thank you, Mrs Albright. I'll send you a confirmation by email." },
        ],
        questionGroups: [
          {
            id: 't21-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Olive Tree Restaurant: Booking', ''],
              [
                ['Occasion', 'parents\' {{q1}} wedding anniversary'],
                ['Date', 'Saturday {{q2}} April'],
                ['Number of guests', '{{q3}}'],
                ['Room', 'the {{q4}} room'],
                ['Time', '{{q5}} p.m.'],
                ['Menu price', '£{{q6}} per person'],
                ['Special requirements', 'one guest allergic to {{q7}}; one child vegetarian'],
                ['Cake', '{{q8}} cake, extra £18'],
                ['Deposit', '£{{q9}}'],
                ['Surname', '{{q10}}'],
              ]
            ),
            questions: [
              q(1, null, ['40th', 'fortieth', '40', 'forty'], '"fortieth wedding anniversary".'),
              q(2, null, ['26th', 'twenty-sixth', '26', 'twenty sixth'], '"the twenty-sixth of April".'),
              q(3, null, ['14', 'fourteen'], '"Fourteen, including three children".'),
              q(4, null, ['private'], '"our private room".'),
              q(5, null, ['7.30', '7:30', 'half past seven', 'seven thirty', '19:30'], '"at half past seven".'),
              q(6, null, ['42', 'forty-two', 'forty two'], '"forty-two pounds per person".'),
              q(7, null, ['shellfish'], '"allergic to shellfish".'),
              q(8, null, ['chocolate'], '"a chocolate cake".'),
              q(9, null, ['200', 'two hundred'], '"a deposit of two hundred pounds".'),
              q(10, null, ['albright'], 'Spelled out: A-L-B-R-I-G-H-T.'),
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a manager showing new members around a sports centre.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Welcome to Parkway Sports Centre. I'm Carla, the manager, and I'm going to show you where everything is. Please look at the plan." },
          { speaker: 'A', voice: 'zira', text: "We're standing at the entrance, at the bottom of the plan. Straight ahead is reception, where you'll swipe your membership card. The main corridor runs across the building behind reception, and all the facilities open off it." },
          { speaker: 'A', voice: 'zira', text: "On your left, in the south-west corner of the building, is the café, which is open from eight until eight and serves healthy snacks. It has a view of the car park, and it's a good place to meet friends." },
          { speaker: 'A', voice: 'zira', text: "On your right, in the south-east corner, is the gym. It has over sixty machines, and a free weights area. Newcomers must have an induction, which takes forty minutes, and we offer sessions every morning." },
          { speaker: 'A', voice: 'zira', text: "Now go into the main corridor. At the far left, in the north-west corner, is the swimming pool. It's twenty-five metres long, with six lanes, and there's a separate shallow pool for children. Please shower before you get in." },
          { speaker: 'A', voice: 'zira', text: "In the middle, at the top, in the north of the building, is the sports hall, where we have badminton, basketball and indoor football. The hall is booked by clubs in the evenings, but members can use it during the day for a small extra fee." },
          { speaker: 'A', voice: 'zira', text: "And at the far right, in the north-east corner, are the squash courts. There are three of them. You can book a court online up to a week in advance, and rackets can be hired at reception." },
          { speaker: 'A', voice: 'zira', text: "The changing rooms are next to the swimming pool, and there are lockers which take a one-pound coin, which you get back. Please don't leave valuables in them, since we can't be responsible for things that are lost." },
          { speaker: 'A', voice: 'zira', text: "Some final points. The centre is open from six in the morning until ten at night on weekdays, and from eight until eight at weekends. A crèche is open on weekday mornings, for children up to the age of four. If you have any questions, please ask at reception, and I hope you enjoy using the centre." },
        ],
        questionGroups: [
          {
            id: 't21-l2-plan',
            type: 'plan_label',
            instructionHtml: 'Label the plan below. Choose the correct answer, <strong>A-H</strong>, for each numbered room (Questions 11-15).',
            imageUrl: SPORTS_PLAN,
            imageAlt: 'Ground-floor plan of a sports centre: entrance at the bottom centre; reception in the middle of the lower part; a main corridor across the middle; five unlabelled rooms in the north-west, north-centre, north-east, south-west and south-east.',
            bank: bank(['Gym', 'Squash courts', 'Swimming pool', 'Sauna', 'Sports hall', 'Café', 'Crèche', 'Dance studio']),
            imageHotspots: [
              { questionNumber: 11, x: 19, y: 25 },
              { questionNumber: 12, x: 50, y: 25 },
              { questionNumber: 13, x: 81, y: 25 },
              { questionNumber: 14, x: 19, y: 75 },
              { questionNumber: 15, x: 81, y: 75 },
            ],
            questions: [
              q(11, null, 'C', '"in the north-west corner, is the swimming pool".'),
              q(12, null, 'E', '"in the north of the building, is the sports hall".'),
              q(13, null, 'B', '"in the north-east corner, are the squash courts".'),
              q(14, null, 'F', '"in the south-west corner of the building, is the café".'),
              q(15, null, 'A', '"in the south-east corner, is the gym".'),
            ],
          },
          {
            id: 't21-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>Information for new members</strong></p><p>• gym induction lasts {{q16}} minutes<br/>• swimming pool: {{q17}} lanes; members should {{q18}} before getting in<br/>• squash courts can be booked up to a {{q19}} in advance<br/>• lockers take a £{{q20}} coin</p>',
            questions: [
              q(16, null, ['40', 'forty'], '"which takes forty minutes".'),
              q(17, null, ['6', 'six'], '"with six lanes".'),
              q(18, null, ['shower'], '"Please shower before you get in."'),
              q(19, null, ['week'], '"up to a week in advance".'),
              q(20, null, ['1', 'one'], '"a one-pound coin".'),
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two psychology students, Mira and Jon, discussing an experiment on memory with their tutor.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david2', text: "Mira, Jon, come in. How are you getting on with the memory experiment?" },
          { speaker: 'B', voice: 'zira', text: "We've run all the sessions, Dr Fraser. We tested whether people remember words better when they see a picture of the word or when they just read it." },
          { speaker: 'C', voice: 'david', text: "We had forty participants, divided into two groups. One group saw twenty words on a screen, one at a time. The other group saw the same words with a picture of each." },
          { speaker: 'A', voice: 'david2', text: "And how long did they have to study them?" },
          { speaker: 'B', voice: 'zira', text: "Each word was shown for four seconds. Then, after a break of ten minutes, during which they did a puzzle, they wrote down as many as they could remember." },
          { speaker: 'A', voice: 'david2', text: "Why the puzzle?" },
          { speaker: 'C', voice: 'david', text: "To stop them from rehearsing the words, which would have spoiled the result." },
          { speaker: 'A', voice: 'david2', text: "Good. And the results?" },
          { speaker: 'B', voice: 'zira', text: "The group who saw pictures remembered an average of fourteen words, compared with nine in the other group." },
          { speaker: 'A', voice: 'david2', text: "That's a large difference. Did you check whether it's statistically significant?" },
          { speaker: 'C', voice: 'david', text: "Yes, we used a t-test, and the probability that it happened by chance was less than one per cent." },
          { speaker: 'A', voice: 'david2', text: "Excellent. Now, are there any weaknesses in the design?" },
          { speaker: 'B', voice: 'zira', text: "Most of our participants were psychology students, so they may not be typical. And some of them might have known what we were looking for." },
          { speaker: 'A', voice: 'david2', text: "Both points should go in your discussion. Another is that pictures might simply have made the words more interesting. You could control for that in a future study by using boring pictures." },
          { speaker: 'C', voice: 'david', text: "That's a good idea. We'd also like to see if the effect lasts longer, by testing after a week." },
          { speaker: 'A', voice: 'david2', text: "Yes, that would show whether the benefit is lasting. Now, about the write-up. Use the standard structure: abstract, introduction, method, results, discussion and references. The abstract should be no more than two hundred words." },
          { speaker: 'B', voice: 'zira', text: "And the deadline?" },
          { speaker: 'A', voice: 'david2', text: "Monday the fourth of December. I'll give feedback on a draft if you send it a week before." },
        ],
        questionGroups: [
          {
            id: 't21-l3-flow',
            type: 'flowchart_completion',
            instructionHtml: 'Complete the flow-chart below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>The experiment</strong></p><p>1. {{q21}} participants are divided into two groups.</p><p>2. One group sees {{q22}} words on a screen; the other sees the words with a picture of each.</p><p>3. Each word is shown for {{q23}} seconds.</p><p>4. After a break of {{q24}} minutes, during which they do a puzzle, participants write down the words they remember.</p><p>5. The average recalled was {{q25}} words with pictures and nine without.</p>',
            questions: [
              q(21, null, ['40', 'forty'], '"We had forty participants".'),
              q(22, null, ['20', 'twenty'], '"saw twenty words on a screen".'),
              q(23, null, ['4', 'four'], '"shown for four seconds".'),
              q(24, null, ['10', 'ten'], '"a break of ten minutes".'),
              q(25, null, ['14', 'fourteen'], '"an average of fourteen words".'),
            ],
          },
          {
            id: 't21-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(26, 'What was the purpose of the puzzle?', ['to make the experiment longer', 'to stop participants rehearsing the words', 'to test intelligence'], 'B', '"To stop them from rehearsing the words".'),
              mc(27, 'The probability that the difference happened by chance was', ['less than one per cent', 'about five per cent', 'about ten per cent'], 'A', '"less than one per cent".'),
              mc(28, 'What weakness do the students mention?', ['most participants were psychology students', 'the words were too easy', 'the test was too short'], 'A', '"Most of our participants were psychology students".'),
              mc(29, 'What would the students like to test in a future study?', ['whether the effect lasts a week', 'whether older people recall more', 'whether colour matters'], 'A', '"testing after a week".'),
              mc(30, 'How long should the abstract be?', ['at most 100 words', 'at most 200 words', 'at most 500 words'], 'B', '"no more than two hundred words".'),
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about the history of agriculture.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "For most of the history of our species, humans obtained their food by hunting animals and gathering wild plants. Agriculture, the deliberate growing of crops and keeping of animals, began only about eleven thousand years ago, and it was probably the most important change in the way people lived." },
          { speaker: 'A', voice: 'david', text: "The earliest evidence comes from the Fertile Crescent, an arc of land stretching from present-day Iraq to Egypt, where wild wheat and barley, sheep and goats were first domesticated. Farming developed independently in other regions: rice in China, maize in Mexico, and potatoes in the Andes." },
          { speaker: 'A', voice: 'david', text: "Why did people take up farming? One theory is that the climate became warmer and more stable after the last ice age, making it possible to rely on cultivated plants. Another is that growing populations in certain areas put pressure on wild food supplies. Probably both played a part." },
          { speaker: 'A', voice: 'david', text: "Farming brought major changes. People settled in villages rather than moving with the seasons, and they built permanent houses and stored surplus grain. A surplus meant that not everyone had to grow food, which allowed specialists to emerge: potters, builders, priests and rulers. In this sense, farming made possible towns and, eventually, states." },
          { speaker: 'A', voice: 'david', text: "But it had costs. Studies of skeletons show that early farmers were shorter and less healthy than the hunter-gatherers who preceded them. Their diet was less varied, dependent on a few crops, and living close together, and with animals, exposed them to diseases such as measles and tuberculosis, which passed to humans from livestock." },
          { speaker: 'A', voice: 'david', text: "Techniques improved gradually. The plough, invented about six thousand years ago and pulled by oxen, allowed farmers to cultivate larger areas. Irrigation, in which water is brought to fields through channels, made farming possible in dry regions such as Mesopotamia. In medieval Europe, farmers discovered crop rotation, in which different crops are grown in turn on the same land, which keeps the soil fertile." },
          { speaker: 'A', voice: 'david', text: "The greatest change came in the eighteenth and nineteenth centuries, with new machinery, better breeding of animals and, later, chemical fertilisers. Yields rose dramatically, and by the twentieth century, a single farmer in a wealthy country could feed dozens of people. A further jump, often called the Green Revolution, came in the nineteen-sixties, when new varieties of wheat and rice doubled harvests in parts of Asia and probably saved millions from starvation." },
          { speaker: 'A', voice: 'david', text: "Today, agriculture faces new challenges. It uses about seventy per cent of the world's fresh water, contributes roughly a quarter of greenhouse gas emissions and is a leading cause of the loss of forests and wildlife. Researchers are looking for ways to feed a larger population with less damage, through precision farming, which uses sensors and satellites to apply water and fertiliser exactly where they are needed, and through new crops which resist drought." },
        ],
        questionGroups: [
          {
            id: 't21-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: '<p><strong>History of agriculture</strong></p><p><em>Origins</em><br/>• began about {{q31}} years ago in the Fertile Crescent; wild wheat, barley, sheep and {{q32}} domesticated<br/>• rice in China, maize in {{q33}}, potatoes in the Andes<br/>• possible reasons: a warmer, more stable {{q34}}, and growing populations</p><p><em>Effects</em><br/>• people settled in villages and stored surplus {{q35}}<br/>• early farmers were shorter and less healthy; diseases passed from {{q36}}</p><p><em>Techniques</em><br/>• plough invented about 6000 years ago, pulled by {{q37}}<br/>• {{q38}} brought water to fields in dry regions<br/>• crop rotation keeps the soil fertile</p><p><em>Modern period</em><br/>• Green Revolution in the 1960s doubled harvests in parts of {{q39}}<br/>• agriculture uses about {{q40}} per cent of the world\'s fresh water</p>',
            questions: [
              q(31, null, ['11000', '11,000', 'eleven thousand'], '"about eleven thousand years ago".'),
              q(32, null, ['goats'], '"sheep and goats".'),
              q(33, null, ['mexico'], '"maize in Mexico".'),
              q(34, null, ['climate'], '"the climate became warmer and more stable".'),
              q(35, null, ['grain'], '"stored surplus grain".'),
              q(36, null, ['livestock', 'animals'], '"passed to humans from livestock".'),
              q(37, null, ['oxen'], '"pulled by oxen".'),
              q(38, null, ['irrigation'], '"Irrigation ... made farming possible in dry regions".'),
              q(39, null, ['asia'], '"in parts of Asia".'),
              q(40, null, ['70', 'seventy'], '"about seventy per cent".'),
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
        '<p>The chart below shows the number of international trips made by residents of four countries in 2005 and in 2025.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'International trips by residents (millions)',
        unit: 'millions',
        categories: ['Germany', 'United Kingdom', 'China', 'Brazil'],
        xAxisLabel: 'Country',
        yAxisLabel: 'Trips (millions)',
        series: [
          { name: '2005', data: [73, 66, 31, 5] },
          { name: '2025', data: [108, 94, 155, 14] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Newspapers and news websites are increasingly using computer programs to write reports.</p><p>Do the advantages of this development outweigh the disadvantages?</p>',
    },
  },
};
