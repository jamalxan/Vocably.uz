// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from './_html.mjs';

export default {
  slug: 'vocably-practice-test-35',
  title: 'Vocably Practice Test 35',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Diamonds from the laboratory',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>For most of history, every diamond in the world was formed deep underground, where carbon was subjected to enormous heat and pressure over periods of hundreds of millions, or even billions, of years, and was then carried towards the surface by volcanic eruptions. Diamonds were rare, and their rarity, together with their hardness and brilliance, made them among the most valuable substances on Earth. Today, however, a growing share of the diamonds sold in jewellery shops were made in factories, in a matter of weeks.</p>" },
          { label: '', html: "<p>Scientists tried for more than a century to make diamonds artificially. Several claimed to have succeeded, but none of their results could be repeated. The first reliable method was developed in 1954 by researchers at an American electrical company, who reproduced the conditions deep in the Earth by squeezing carbon in a powerful press at temperatures of over 1,500 degrees Celsius. The diamonds they produced were tiny and dark, suitable only for industrial uses such as cutting and drilling, where hardness matters more than beauty. For decades, these industrial diamonds were the only kind that could be made economically. They were nevertheless enormously important: synthetic diamond grit is now used in saws that cut stone and concrete, in drills for oil and gas wells, and in tools for polishing lenses and shaping metal parts, and far more synthetic diamond is produced for these purposes each year than natural diamond is mined.</p>" },
          { label: '', html: "<p>A second method, known as chemical vapour deposition, was developed later and has transformed the industry. A thin slice of diamond, called a seed, is placed in a sealed chamber filled with a mixture of gases containing carbon. Microwaves heat the gases until the carbon atoms separate and settle on the seed, building up a new crystal layer by layer. The process takes several weeks and requires large amounts of electricity, but it can produce stones that are large, clear and virtually flawless. Improvements in the technology over the past two decades have made gem-quality diamonds much cheaper to produce.</p>" },
          { label: '', html: "<p>Laboratory-grown diamonds are not imitations. They have exactly the same chemical composition, crystal structure and physical properties as natural diamonds, and they cannot be distinguished from them by eye, even by an experienced jeweller. Special equipment is needed to tell them apart, and it detects tiny differences in the patterns of growth or the presence of certain impurities. By law in many countries, laboratory-grown stones must be clearly described as such when they are sold. Many producers also engrave a tiny identification number on the edge of each stone, visible only under magnification, so that buyers can check its origin. The natural diamond industry has invested heavily in detection machines, partly to reassure customers that they are getting what they pay for.</p>" },
          { label: '', html: "<p>The effect on prices has been dramatic. Because production can be increased almost without limit, the price of laboratory-grown diamonds has fallen sharply, and a stone of a given size may now cost a small fraction of a natural one. Sales have risen rapidly, particularly among young couples buying engagement rings, many of whom say that they prefer a larger stone for the same money. Some jewellers have begun to worry that, as the price continues to fall, laboratory-grown diamonds may lose their appeal as a luxury product altogether.</p>" },
          { label: '', html: "<p>Supporters of laboratory diamonds argue that they are more ethical than mined stones. Diamond mining has a troubled history: in some countries, the profits from diamonds have been used to finance wars, and mining can cause serious damage to the environment. The mining industry responds that it has introduced a certification scheme to keep conflict diamonds out of the market, and that in several countries, diamond mining provides employment and government income that many communities depend on. It also points out that growing diamonds requires large amounts of energy, much of which still comes from fossil fuels.</p>" },
          { label: '', html: "<p>In my view, the environmental argument is less clear-cut than either side suggests, since it depends on where and how diamonds are produced. But there is no doubt that laboratory-grown stones have ended the idea that diamonds are naturally scarce. The sense of rarity that made them so valuable was always partly a product of marketing, and the natural diamond industry may need to find new ways to persuade buyers that a stone formed underground is worth many times more than an identical one made in a factory.</p>" },
        ],
        questionGroups: [
          {
            id: 't35-r1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              { number: 1, promptHtml: 'What is the main topic of the passage?', options: [{ key: 'A', text: 'the history of diamond mining' }, { key: 'B', text: 'the production of diamonds in laboratories and its effects' }, { key: 'C', text: 'how jewellers value diamonds' }, { key: 'D', text: 'the use of diamonds in industry' }], answer: { accepted: ['B'] }, explanationHtml: 'The passage describes methods of making diamonds and the effects on prices, ethics and the industry.' },
              { number: 2, promptHtml: 'The first diamonds made in 1954 were', options: [{ key: 'A', text: 'large and clear.' }, { key: 'B', text: 'used mainly for jewellery.' }, { key: 'C', text: 'small and suitable only for industry.' }, { key: 'D', text: 'impossible to reproduce.' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 2: "tiny and dark, suitable only for industrial uses".' },
              { number: 3, promptHtml: 'According to the passage, how can laboratory-grown diamonds be identified?', options: [{ key: 'A', text: 'by an experienced jeweller looking carefully' }, { key: 'B', text: 'by their chemical composition' }, { key: 'C', text: 'by special equipment' }, { key: 'D', text: 'by their colour' }], answer: { accepted: ['C'] }, explanationHtml: 'Paragraph 4: "Special equipment is needed to tell them apart".' },
            ],
          },
          {
            id: 't35-r1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 4, promptHtml: 'Natural diamonds were brought close to the surface by {{q4}}.', answer: { accepted: ['volcanic eruptions'] }, explanationHtml: 'Paragraph 1: "carried towards the surface by volcanic eruptions".' },
              { number: 5, promptHtml: 'In industry, diamonds are used for cutting and {{q5}}.', answer: { accepted: ['drilling'] }, explanationHtml: 'Paragraph 2: "industrial uses such as cutting and drilling".' },
              { number: 6, promptHtml: 'Many young couples buy laboratory diamonds for {{q6}}.', answer: { accepted: ['engagement rings'] }, explanationHtml: 'Paragraph 5: "young couples buying engagement rings".' },
            ],
          },
          {
            id: 't35-r1-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary using the list of words, A-I, below.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'microwaves' },
              { key: 'B', text: 'seed' },
              { key: 'C', text: 'electricity' },
              { key: 'D', text: 'press' },
              { key: 'E', text: 'gases' },
              { key: 'F', text: 'layers' },
              { key: 'G', text: 'sand' },
              { key: 'H', text: 'volcanoes' },
              { key: 'I', text: 'months' },
            ],
            stemHtml:
              '<p><strong>Chemical vapour deposition</strong></p><p>A thin piece of diamond, known as a {{q7}}, is put inside a sealed chamber. The chamber is filled with {{q8}} that contain carbon, which are heated by {{q9}}. Carbon then builds up on the diamond in {{q10}}.</p>',
            questions: [
              { number: 7, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph 3: "A thin slice of diamond, called a seed".' },
              { number: 8, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph 3: "a mixture of gases containing carbon".' },
              { number: 9, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph 3: "Microwaves heat the gases".' },
              { number: 10, answer: { accepted: ['F'] }, explanationHtml: 'Paragraph 3: "building up a new crystal layer by layer".' },
            ],
          },
          {
            id: 't35-r1-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 11, promptHtml: 'Laboratory-grown diamonds are clearly better for the environment than mined diamonds.', answer: { accepted: ['NO'] }, explanationHtml: 'Final paragraph: "the environmental argument is less clear-cut than either side suggests".' },
              { number: 12, promptHtml: 'The rarity of natural diamonds was partly created by marketing.', answer: { accepted: ['YES'] }, explanationHtml: 'Final paragraph: "The sense of rarity ... was always partly a product of marketing".' },
              { number: 13, promptHtml: 'Natural diamonds will become cheaper than laboratory-grown ones.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The writer does not predict this.' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Making your own luck',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>Some people seem to lead charmed lives. They meet the right person at the right time, stumble on job opportunities and escape accidents that befall others. Others appear to be dogged by misfortune. Most of us assume that luck is a matter of chance, something that simply happens to people. But a psychologist who spent ten years studying people who considered themselves either lucky or unlucky came to a different conclusion: to a large extent, he argued, people create their own good and bad fortune.</p>" },
          { label: '', html: "<p>The researcher placed advertisements in national newspapers asking for people who felt consistently lucky or unlucky to contact him, and eventually worked with several hundred volunteers of all ages and backgrounds. He interviewed them, asked them to keep diaries, and gave them a series of experiments and personality tests. The results showed that lucky and unlucky people had very different ways of thinking and behaving, and that these differences could explain much of their apparent luck. Importantly, the two groups did not differ in intelligence, and the lucky volunteers were not simply more optimistic in the way they described events: their diaries recorded a genuinely larger number of fortunate encounters and opportunities.</p>" },
          { label: '', html: "<p>In one simple experiment, volunteers were given a newspaper and asked to count the number of photographs inside. Unlucky people typically took about two minutes; lucky people took a few seconds. The reason was that on the second page, in large type, was a message reading: 'Stop counting. There are 43 photographs in this newspaper.' Lucky people tended to notice it; unlucky people were so focused on counting that they overlooked it. Halfway through the newspaper was a second message offering the reader a cash prize for telling the researcher that they had seen it. Again, the unlucky people missed it.</p>" },
          { label: '', html: "<p>The researcher concluded that unlucky people are generally more tense and anxious than lucky people, and that anxiety narrows attention, making people less likely to notice the unexpected. Lucky people, by contrast, are more relaxed and open, and so are better at spotting chance opportunities. They also tend to be more sociable, meeting a wider range of people and so increasing the number of opportunities that come their way. When one lucky volunteer arrived at a party, for example, she made a point of talking to someone she did not already know. Several lucky volunteers described meeting future partners, business contacts or close friends in this way, through conversations that an unlucky person might never have started. Unlucky people, on the other hand, tended to stick to familiar routines, taking the same route to work each day and talking to the same people at social events.</p>" },
          { label: '', html: "<p>Lucky and unlucky people also responded differently to misfortune. When asked to imagine being shot in the arm during a bank robbery, unlucky people considered this extremely bad luck, while lucky people thought it fortunate that they had not been shot somewhere worse. This ability to see the positive side of bad events, the researcher suggested, helps lucky people to recover quickly and to keep trying, which in turn makes future success more likely.</p>" },
          { label: '', html: "<p>Perhaps most importantly, the researcher believed that these habits can be learned. He set up what he called a 'luck school', in which unlucky volunteers were taught techniques such as varying their daily routine, listening to their intuition, and expecting good fortune. After a month, a large majority reported that they felt luckier and that their lives had improved. Critics have pointed out that such reports are difficult to verify, and that feeling lucky is not the same as being lucky, but the findings have been widely discussed in books and training courses.</p>" },
          { label: '', html: "<p>None of this means that chance plays no part in people's lives. Some events, such as winning a lottery or being born into a wealthy family, are genuinely a matter of luck, and no amount of positive thinking will change them. The researcher himself found that lucky people were no more likely than unlucky people to win lotteries. But in many everyday situations, what we call luck may depend less on fate than on how open we are to the opportunities around us. As one participant put it after the luck school, the world had not changed, but she had started to notice more of it, and that alone seemed to make good things happen more often.</p>" },
        ],
        questionGroups: [
          {
            id: 't35-r2-multi3',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-H.',
            questions: [
              {
                number: 14,
                promptHtml: 'Which THREE characteristics of lucky people are mentioned in the passage?',
                options: [
                  { key: 'A', text: 'They are relaxed.' },
                  { key: 'B', text: 'They are highly intelligent.' },
                  { key: 'C', text: 'They are sociable.' },
                  { key: 'D', text: 'They avoid taking risks.' },
                  { key: 'E', text: 'They see positive aspects of bad events.' },
                  { key: 'F', text: 'They plan everything carefully.' },
                  { key: 'G', text: 'They are usually wealthy.' },
                  { key: 'H', text: 'They prefer routine.' },
                ],
                selectCount: 3,
                answer: { accepted: ['A', 'C', 'E'] },
                explanationHtml: 'Paragraph 4: "more relaxed and open ... more sociable"; paragraph 5: they "see the positive side of bad events".',
              },
            ],
          },
          {
            id: 't35-r2-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 15,
                promptHtml: 'Which TWO techniques were taught at the \'luck school\'?',
                options: [
                  { key: 'A', text: 'changing daily routines' },
                  { key: 'B', text: 'buying lottery tickets' },
                  { key: 'C', text: 'planning each day in detail' },
                  { key: 'D', text: 'trusting their intuition' },
                  { key: 'E', text: 'avoiding strangers' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'D'] },
                explanationHtml: 'Paragraph 6: "varying their daily routine, listening to their intuition".',
              },
            ],
          },
          {
            id: 't35-r2-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 16, promptHtml: 'Volunteers were found through advertisements in {{q16}}.', answer: { accepted: ['national newspapers', 'newspapers'] }, explanationHtml: 'Paragraph 2: "advertisements in national newspapers".' },
              { number: 17, promptHtml: 'Besides being interviewed, volunteers were asked to keep {{q17}}.', answer: { accepted: ['diaries'] }, explanationHtml: 'Paragraph 2: "asked them to keep diaries".' },
              { number: 18, promptHtml: 'According to the researcher, {{q18}} makes people less likely to notice unexpected things.', answer: { accepted: ['anxiety'] }, explanationHtml: 'Paragraph 4: "anxiety narrows attention".' },
            ],
          },
          {
            id: 't35-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 19, promptHtml: 'The research lasted for about a decade.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "spent ten years studying".' },
              { number: 20, promptHtml: 'All the volunteers were young adults.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "volunteers of all ages and backgrounds".' },
              { number: 21, promptHtml: 'Unlucky people took longer to complete the newspaper task.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 3: unlucky people took about two minutes; lucky people a few seconds.' },
              { number: 22, promptHtml: 'The second message in the newspaper was printed on the front page.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: it was "Halfway through the newspaper".' },
              { number: 23, promptHtml: 'More women than men described themselves as lucky.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage gives no information about the gender of lucky people.' },
              { number: 24, promptHtml: 'Most people who attended the luck school said they felt luckier afterwards.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 6: "a large majority reported that they felt luckier".' },
              { number: 25, promptHtml: 'Critics accept that the results of the luck school have been independently confirmed.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 6: critics say "such reports are difficult to verify".' },
              { number: 26, promptHtml: 'Lucky people won lotteries more often than unlucky people.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Final paragraph: "lucky people were no more likely than unlucky people to win lotteries".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Why we put things off',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Almost everyone procrastinates at some time: we delay writing an essay, filing a tax return or making an unpleasant phone call, even when we know that the delay will make things worse. Surveys suggest that around one in five adults regard themselves as chronic procrastinators, and among students the proportion is much higher. Procrastination is often dismissed as a sign of laziness or poor time management, but research over the past few decades suggests that it is something rather different. The word itself comes from Latin and means, literally, 'belonging to tomorrow', and writers have complained about the habit for thousands of years, which suggests that it is a deep-rooted feature of human nature rather than a product of modern distractions.</p>" },
          { label: 'B', html: "<p>The key insight is that procrastination is primarily a problem of emotion, not of time. When we face a task that makes us feel anxious, bored, confused or inadequate, putting it off provides immediate relief from those feelings. The relief is temporary, and the task remains, often becoming more stressful as the deadline approaches. But because the reward of avoidance comes immediately, while the cost comes later, the brain tends to favour avoidance. In this sense, procrastination is a way of managing bad moods rather than a failure to plan.</p>" },
          { label: 'C', html: "<p>This explains why simply giving people better timetables or calendars often has little effect. A student who puts off an essay usually knows perfectly well when it is due and how long it will take. What stops them is the unpleasant feeling associated with starting it, perhaps a fear that the result will not be good enough. Perfectionists are particularly vulnerable: because they set impossibly high standards, the prospect of beginning a task can feel threatening, and delaying it protects them, for a while, from the possibility of failure.</p>" },
          { label: 'D', html: "<p>Procrastination has real costs. Studies of students have found that chronic procrastinators tend to receive lower grades and report higher levels of stress, particularly towards the end of term. Among adults, it has been linked to poorer health, partly because people put off visiting the doctor or making changes to their lifestyle, and to financial problems, since people delay saving for retirement or paying bills. It also affects relationships, because other people are often left waiting.</p>" },
          { label: 'E', html: "<p>Researchers have tested several approaches for reducing procrastination. One of the simplest is to make the first step very small. Rather than deciding to 'write the essay', a student might decide to write one sentence, or simply to open the document. Once people have started, they often find that the task is less unpleasant than they expected, and continue. Another technique is to remove temptations, for example by switching off the phone or working in a library, so that avoidance becomes harder. Some people find it helpful to work alongside others, even in silence, because the presence of someone else who is working creates a mild social pressure to continue. Setting specific times for a task, rather than vague intentions, has also been shown to help, since it reduces the number of decisions a person must make before beginning.</p>" },
          { label: 'F', html: "<p>Perhaps surprisingly, one of the most effective strategies is self-forgiveness. In a study of university students, those who forgave themselves for procrastinating before their first examinations were less likely to procrastinate before the next ones. The explanation seems to be that harsh self-criticism creates exactly the kind of negative feelings that lead to avoidance in the first place, whereas forgiving oneself reduces them and makes it easier to try again.</p>" },
          { label: 'G', html: "<p>I believe this research should change the way we talk about procrastination. Telling people to 'just get on with it', or treating them as lazy, is not only unkind but also unlikely to help, since it adds guilt to the feelings they are already trying to escape. A more useful approach is to ask what emotion a task is producing and to find ways of making it more manageable. For teachers and managers, this may mean breaking large projects into smaller stages with their own deadlines, and giving feedback early, before small delays have grown into serious problems. For individuals, it may simply mean recognising that the urge to put something off is a feeling, not a fact, and that it usually passes once work has begun.</p>" },
        ],
        questionGroups: [
          {
            id: 't35-r3-headings',
            type: 'matching_headings',
            instructionHtml:
              'Reading Passage 3 has seven paragraphs, A-G. Choose the correct heading for paragraphs B-G from the list of headings below.<br/><em>Example: Paragraph A — v</em>',
            bank: [
              { key: 'i', text: 'Being kind to oneself' },
              { key: 'ii', text: 'Why better planning is often not enough' },
              { key: 'iii', text: 'The damage caused by delay' },
              { key: 'iv', text: 'Starting small and avoiding distractions' },
              { key: 'vi', text: 'A matter of feelings' },
              { key: 'vii', text: 'A new way of responding to procrastinators' },
              { key: 'viii', text: 'Procrastination in other cultures' },
              { key: 'ix', text: 'The role of technology' },
            ],
            questions: [
              { number: 27, promptHtml: 'Paragraph B', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph B: "procrastination is primarily a problem of emotion, not of time".', locatorParagraph: 'B' },
              { number: 28, promptHtml: 'Paragraph C', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph C: "giving people better timetables or calendars often has little effect".', locatorParagraph: 'C' },
              { number: 29, promptHtml: 'Paragraph D', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph D: "Procrastination has real costs."', locatorParagraph: 'D' },
              { number: 30, promptHtml: 'Paragraph E', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph E: make the first step small and remove temptations.', locatorParagraph: 'E' },
              { number: 31, promptHtml: 'Paragraph F', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph F: "one of the most effective strategies is self-forgiveness".', locatorParagraph: 'F' },
              { number: 32, promptHtml: 'Paragraph G', answer: { accepted: ['vii'] }, explanationHtml: 'Paragraph G: "this research should change the way we talk about procrastination".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't35-r3-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<p><strong>Procrastination</strong></p>' +
              '<p>• putting a task off gives {{q33}} from unpleasant feelings<br/>• {{q34}} are especially likely to delay tasks because of their high standards<br/>• adults who procrastinate may have poorer health and {{q35}}<br/>• teachers could break large projects into smaller {{q36}}</p>',
            questions: [
              { number: 33, answer: { accepted: ['immediate relief', 'relief'] }, explanationHtml: 'Paragraph B: "putting it off provides immediate relief".', locatorParagraph: 'B' },
              { number: 34, answer: { accepted: ['perfectionists'] }, explanationHtml: 'Paragraph C: "Perfectionists are particularly vulnerable".', locatorParagraph: 'C' },
              { number: 35, answer: { accepted: ['financial problems'] }, explanationHtml: 'Paragraph D: "and to financial problems".', locatorParagraph: 'D' },
              { number: 36, answer: { accepted: ['stages'] }, explanationHtml: 'Paragraph G: "breaking large projects into smaller stages".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't35-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              { number: 37, promptHtml: 'Procrastination is mainly caused by laziness.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph A: it is "often dismissed as a sign of laziness ... but research ... suggests that it is something rather different".' },
              { number: 38, promptHtml: 'Students who procrastinate usually know when their work is due.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph C: "A student who puts off an essay usually knows perfectly well when it is due".' },
              { number: 39, promptHtml: 'Procrastination is more common in older people.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage compares students with adults generally, not by age.' },
              { number: 40, promptHtml: 'Treating procrastinators as lazy is likely to help them change.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph G: it "is not only unkind but also unlikely to help".' },
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
        contextText: 'You will hear a student phoning an agency for advice about summer language schools.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good afternoon, Study Abroad Advice, Helen speaking." },
          { speaker: 'B', voice: 'david', text: "Hi. I'd like to do a Spanish course in Spain this summer, and I'd like some advice on choosing a school." },
          { speaker: 'A', voice: 'zira', text: "Of course. Let me take a few details. What's your name?" },
          { speaker: 'B', voice: 'david', text: "Ryan Holloway." },
          { speaker: 'A', voice: 'zira', text: "And how long would you like to study for?" },
          { speaker: 'B', voice: 'david', text: "Four weeks, in July." },
          { speaker: 'A', voice: 'zira', text: "And what level is your Spanish?" },
          { speaker: 'B', voice: 'david', text: "I'd say intermediate. I studied it at school for three years." },
          { speaker: 'A', voice: 'zira', text: "OK. We work with four schools that would suit you. The first is in Valencia, right by the beach. It's two hundred and ten euros a week. The only problem is that the classes are quite large, up to fifteen students." },
          { speaker: 'B', voice: 'david', text: "That's too many for me. What else?" },
          { speaker: 'A', voice: 'zira', text: "The second is in Seville. It's two hundred and forty a week, with small classes of eight. But it gets extremely hot there in July, and the school doesn't have air conditioning." },
          { speaker: 'B', voice: 'david', text: "Hmm. And the third?" },
          { speaker: 'A', voice: 'zira', text: "That's in Salamanca, a university city. It's one hundred and ninety a week, and the teaching's excellent. The drawback is the location: it's a long way from the airport, about three hours by bus." },
          { speaker: 'B', voice: 'david', text: "I don't mind that. And the last one?" },
          { speaker: 'A', voice: 'zira', text: "The fourth is in Barcelona. It's the most expensive, at two hundred and eighty a week. It's a good school, but lots of people in the city speak Catalan, so you may hear less Spanish outside class." },
          { speaker: 'B', voice: 'david', text: "I think Salamanca sounds best. What's included in the price?" },
          { speaker: 'A', voice: 'zira', text: "Twenty hours of lessons a week, a welcome party on the first day, and a guided walking tour of the old city. Accommodation is extra. Excursions at the weekends are also extra, and so is the certificate exam if you want to take it." },
        ],
        questionGroups: [
          {
            id: 't35-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Language Course Enquiry</strong></p><p><em>Example:</em> Language: Spanish</p><p>Name: Ryan {{q1}}<br/>Length of course: {{q2}} weeks<br/>Level: {{q3}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['holloway'] }, explanationHtml: '"Ryan Holloway."' },
              { number: 2, answer: { accepted: ['4', 'four'] }, explanationHtml: '"Four weeks, in July."' },
              { number: 3, answer: { accepted: ['intermediate'] }, explanationHtml: '"I\'d say intermediate."' },
            ],
          },
          {
            id: 't35-l1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml: table(
              ['City', 'Price per week', 'Problem'],
              [
                ['Valencia', '€210', 'classes are too {{q4}}'],
                ['{{q5}}', '€240', 'no {{q6}}'],
                ['Salamanca', '€{{q7}}', 'far from the {{q8}}'],
                ['Barcelona', '€280', 'many people speak {{q9}}'],
              ]
            ),
            questions: [
              { number: 4, answer: { accepted: ['large', 'big'] }, explanationHtml: '"the classes are quite large, up to fifteen students".' },
              { number: 5, answer: { accepted: ['seville'] }, explanationHtml: '"The second is in Seville."' },
              { number: 6, answer: { accepted: ['air-conditioning', 'air conditioning'] }, explanationHtml: '"the school doesn\'t have air conditioning".' },
              { number: 7, answer: { accepted: ['190'] }, explanationHtml: '"It\'s one hundred and ninety a week".' },
              { number: 8, answer: { accepted: ['airport'] }, explanationHtml: '"it\'s a long way from the airport".' },
              { number: 9, answer: { accepted: ['catalan'] }, explanationHtml: '"lots of people in the city speak Catalan".' },
            ],
          },
          {
            id: 't35-l1-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-E.',
            questions: [
              {
                number: 10,
                promptHtml: 'Which TWO things are included in the price at Salamanca, apart from lessons?',
                options: [
                  { key: 'A', text: 'accommodation' },
                  { key: 'B', text: 'a welcome party' },
                  { key: 'C', text: 'weekend excursions' },
                  { key: 'D', text: 'a walking tour' },
                  { key: 'E', text: 'a certificate exam' },
                ],
                selectCount: 2,
                answer: { accepted: ['B', 'D'] },
                explanationHtml: '"a welcome party on the first day, and a guided walking tour". Accommodation, excursions and the exam are extra.',
              },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a radio presenter talking about a new science discovery centre.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "And now to some exciting news for families. The new Brightwater Discovery Centre opened its doors last weekend, and I went along to have a look." },
          { speaker: 'A', voice: 'david', text: "The centre is housed in a former power station on the riverside, which has been beautifully converted. It's best known for its hands-on approach: almost every exhibit is designed to be touched, pushed or played with, rather than just looked at." },
          { speaker: 'A', voice: 'david', text: "There are five main zones. The biggest is the Space zone, with a full-size model of a Mars rover. There's also a Weather zone, where you can stand inside a tornado made of mist, a Human Body zone, a zone about engineering, and my personal favourite, a planetarium, which shows films every hour." },
          { speaker: 'A', voice: 'david', text: "The building was saved from demolition by a group of local residents, and was converted with money from a national lottery fund. It took four years and cost thirty-two million pounds." },
          { speaker: 'A', voice: 'david', text: "It's run by an educational charity, and it's open every day except Christmas Day. Opening hours are ten until six, and until eight on Fridays." },
          { speaker: 'A', voice: 'david', text: "Now, there are some special events this week. On Tuesday evening, at seven, there's a talk by an astronaut about life on the space station. That's in the lecture theatre, and tickets are twelve pounds." },
          { speaker: 'A', voice: 'david', text: "On Thursday, at two o'clock, there's a family workshop on building robots, in the Engineering zone. That's five pounds per child, and adults go free." },
          { speaker: 'A', voice: 'david', text: "And on Saturday and Sunday, all day, there's a festival of chemistry, with experiments and demonstrations in the main hall. That's included in the normal entry price." },
          { speaker: 'A', voice: 'david', text: "I'd definitely recommend booking online, because it's already very busy." },
        ],
        questionGroups: [
          {
            id: 't35-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Brightwater Discovery Centre</strong></p>' +
              '<p>Building: a former {{q11}}<br/>Known for: its {{q12}} approach<br/>Largest zone: {{q13}}<br/>Saved from demolition by {{q14}}<br/>Cost of conversion: £{{q15}} million<br/>Late opening: until 8 pm on {{q16}}</p>',
            questions: [
              { number: 11, answer: { accepted: ['power station'] }, explanationHtml: '"housed in a former power station".' },
              { number: 12, answer: { accepted: ['hands-on'] }, explanationHtml: '"It\'s best known for its hands-on approach".' },
              { number: 13, answer: { accepted: ['space', 'space zone', 'the space zone'] }, explanationHtml: '"The biggest is the Space zone".' },
              { number: 14, answer: { accepted: ['local residents', 'residents'] }, explanationHtml: '"saved from demolition by a group of local residents".' },
              { number: 15, answer: { accepted: ['32', 'thirty-two'] }, explanationHtml: '"cost thirty-two million pounds".' },
              { number: 16, answer: { accepted: ['fridays', 'friday'] }, explanationHtml: '"until eight on Fridays".' },
            ],
          },
          {
            id: 't35-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Day', 'Time', 'Event', 'Place', 'Price'],
              [
                ['Tuesday', '7 pm', 'talk by an astronaut', '{{q17}}', '£12'],
                ['Thursday', '2 pm', 'family workshop on {{q18}}', 'Engineering zone', '£{{q19}} per child'],
                ['Saturday and Sunday', 'all day', 'festival of chemistry', 'main hall', '{{q20}}'],
              ]
            ),
            questions: [
              { number: 17, answer: { accepted: ['lecture theatre', 'the lecture theatre'] }, explanationHtml: '"That\'s in the lecture theatre".' },
              { number: 18, answer: { accepted: ['building robots', 'robots'] }, explanationHtml: '"a family workshop on building robots".' },
              { number: 19, answer: { accepted: ['5', 'five'] }, explanationHtml: '"That\'s five pounds per child".' },
              { number: 20, answer: { accepted: ['included in entry', 'normal entry price', 'included'] }, explanationHtml: '"That\'s included in the normal entry price."' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear a student, Maria, talking to a university business adviser about her plan to start a small business.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Hello, Maria. So, you're thinking of starting a business while you're studying?" },
          { speaker: 'B', voice: 'zira', text: "Yes. I make jewellery from recycled materials, old glass and metal mostly, and friends keep asking to buy it. So I thought I'd try selling it properly." },
          { speaker: 'A', voice: 'david', text: "That's great. What made you decide now, rather than after you graduate?" },
          { speaker: 'B', voice: 'zira', text: "Mainly because I have more free time now than I will when I start a full-time job. And the university has this start-up programme, which gives students free advice." },
          { speaker: 'A', voice: 'david', text: "Right. How are you selling at the moment?" },
          { speaker: 'B', voice: 'zira', text: "Just to friends, and through social media. I've sold about forty pieces so far." },
          { speaker: 'A', voice: 'david', text: "Have you worked out your costs?" },
          { speaker: 'B', voice: 'zira', text: "Roughly. The materials are almost free, since they're recycled. The biggest cost is actually my time. Each piece takes about two hours." },
          { speaker: 'A', voice: 'david', text: "That's a common problem with handmade products. You need to make sure your prices reflect that time. What's been the biggest challenge so far?" },
          { speaker: 'B', voice: 'zira', text: "Honestly, photographing the jewellery. It looks much better in real life, and my photos don't do it justice." },
          { speaker: 'A', voice: 'david', text: "The start-up programme runs a photography workshop, so do sign up for that. Now, let's talk about your plans for the next year. Are you going to set up a website?" },
          { speaker: 'B', voice: 'zira', text: "Definitely. I'm going to do that this month. My cousin's a web designer, and she's offered to help." },
          { speaker: 'A', voice: 'david', text: "What about running jewellery-making workshops? That can be a good source of income." },
          { speaker: 'B', voice: 'zira', text: "I'd love to, but I'm not sure I'll have time. Maybe in the summer holidays. I'll see how things go." },
          { speaker: 'A', voice: 'david', text: "And selling through shops?" },
          { speaker: 'B', voice: 'zira', text: "No, I've decided against that. They take such a big percentage that I'd hardly make anything." },
          { speaker: 'A', voice: 'david', text: "Fair enough. And having a stall at craft markets?" },
          { speaker: 'B', voice: 'zira', text: "Yes, I've already booked a stall at the Christmas market in town, so I'll definitely be doing that." },
        ],
        questionGroups: [
          {
            id: 't35-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'What does Maria use to make her jewellery?', options: [{ key: 'A', text: 'new silver' }, { key: 'B', text: 'recycled materials' }, { key: 'C', text: 'natural stones' }], answer: { accepted: ['B'] }, explanationHtml: '"I make jewellery from recycled materials".' },
              { number: 22, promptHtml: 'Why has Maria decided to start the business now?', options: [{ key: 'A', text: 'She needs money for her studies.' }, { key: 'B', text: 'She has more free time than she will later.' }, { key: 'C', text: 'Her tutor encouraged her.' }], answer: { accepted: ['B'] }, explanationHtml: '"I have more free time now than I will when I start a full-time job".' },
              { number: 23, promptHtml: 'How many pieces has Maria sold?', options: [{ key: 'A', text: 'about 20' }, { key: 'B', text: 'about 40' }, { key: 'C', text: 'about 200' }], answer: { accepted: ['B'] }, explanationHtml: '"I\'ve sold about forty pieces so far."' },
              { number: 24, promptHtml: 'What is Maria\'s biggest cost?', options: [{ key: 'A', text: 'materials' }, { key: 'B', text: 'her time' }, { key: 'C', text: 'advertising' }], answer: { accepted: ['B'] }, explanationHtml: '"The biggest cost is actually my time."' },
              { number: 25, promptHtml: 'What has Maria found most difficult?', options: [{ key: 'A', text: 'photographing her work' }, { key: 'B', text: 'finding customers' }, { key: 'C', text: 'getting materials' }], answer: { accepted: ['A'] }, explanationHtml: '"Honestly, photographing the jewellery."' },
              { number: 26, promptHtml: 'What does the adviser suggest?', options: [{ key: 'A', text: 'hiring a photographer' }, { key: 'B', text: 'attending a workshop' }, { key: 'C', text: 'raising her prices immediately' }], answer: { accepted: ['B'] }, explanationHtml: '"The start-up programme runs a photography workshop, so do sign up for that."' },
            ],
          },
          {
            id: 't35-l3-plans',
            type: 'matching_features',
            instructionHtml: 'What does Maria decide about each of the following? Choose the correct letter, <strong>A, B or C</strong>.<br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            bank: [
              { key: 'A', text: 'She will do this.' },
              { key: 'B', text: 'She might do this.' },
              { key: 'C', text: 'She won\'t do this.' },
            ],
            questions: [
              { number: 27, promptHtml: 'set up a website', answer: { accepted: ['A'] }, explanationHtml: '"Definitely. I\'m going to do that this month."' },
              { number: 28, promptHtml: 'run workshops', answer: { accepted: ['B'] }, explanationHtml: '"Maybe in the summer holidays. I\'ll see how things go."' },
              { number: 29, promptHtml: 'sell through shops', answer: { accepted: ['C'] }, explanationHtml: '"No, I\'ve decided against that."' },
              { number: 30, promptHtml: 'have a stall at craft markets', answer: { accepted: ['A'] }, explanationHtml: '"I\'ve already booked a stall ... so I\'ll definitely be doing that."' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about how cats came to live with humans.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Today I want to talk about the domestication of the cat, which, as we'll see, was rather different from that of other domestic animals." },
          { speaker: 'A', voice: 'zira', text: "Most domestic animals, such as sheep, cattle and dogs, were deliberately selected and bred by humans for particular purposes. The cat, by contrast, seems to have largely domesticated itself. Its closest wild relative is a wildcat that still lives in North Africa and the Near East, and genetic studies show that all domestic cats are descended from this animal." },
          { speaker: 'A', voice: 'zira', text: "So how did it happen? Most researchers believe the process began around ten thousand years ago, when people in the Near East first started farming. Farmers stored grain, and grain stores attracted mice. Mice in turn attracted wildcats, and the cats that were least afraid of people were able to take advantage of this new source of food." },
          { speaker: 'A', voice: 'zira', text: "Humans probably tolerated the cats because they were useful in controlling pests, and over many generations, the cats living near people became tamer." },
          { speaker: 'A', voice: 'zira', text: "The earliest evidence of a close relationship comes not from the Near East itself but from the island of Cyprus, where archaeologists found a cat buried next to a human, in a grave around nine and a half thousand years old. Since there are no native wildcats on Cyprus, the cat must have been brought there by boat." },
          { speaker: 'A', voice: 'zira', text: "Cats became particularly important in ancient Egypt. They were associated with a goddess, and killing a cat was a serious crime. Huge numbers of cats were mummified, and in the nineteenth century, so many mummified cats were found that some were shipped to Britain and used as fertiliser." },
          { speaker: 'A', voice: 'zira', text: "Cats later spread around the world largely by sea. Ships carried cats to control rats on board, and cats travelled along trade routes to Europe and Asia. A large genetic study a few years ago found that there were two main waves of expansion: one from the Near East with early farmers, and a later one from Egypt, along trading routes." },
          { speaker: 'A', voice: 'zira', text: "Interestingly, domestic cats have changed very little physically from their wild ancestors, compared with dogs. The same study found that the familiar blotched tabby pattern, as opposed to the striped pattern of the wildcat, only became common in the Middle Ages." },
          { speaker: 'A', voice: 'zira', text: "Finally, the relationship between cats and humans is still unusual. Unlike dogs, cats are not strongly motivated to please their owners, and many can survive perfectly well without human help. In a sense, the cat has never been fully domesticated at all." },
        ],
        questionGroups: [
          {
            id: 't35-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 31, promptHtml: 'How was the domestication of cats different from that of other animals?', options: [{ key: 'A', text: 'It happened much more recently.' }, { key: 'B', text: 'It was not mainly directed by humans.' }, { key: 'C', text: 'It took place in several different regions.' }], answer: { accepted: ['B'] }, explanationHtml: '"The cat ... seems to have largely domesticated itself."' },
              { number: 32, promptHtml: 'According to most researchers, domestication began because', options: [{ key: 'A', text: 'people wanted pets.' }, { key: 'B', text: 'grain stores attracted mice.' }, { key: 'C', text: 'wildcats were hunted for fur.' }], answer: { accepted: ['B'] }, explanationHtml: '"grain stores attracted mice. Mice in turn attracted wildcats".' },
              { number: 33, promptHtml: 'Why is the grave in Cyprus significant?', options: [{ key: 'A', text: 'It is the oldest human grave.' }, { key: 'B', text: 'It shows cats were brought to the island by people.' }, { key: 'C', text: 'It contains many cats.' }], answer: { accepted: ['B'] }, explanationHtml: '"Since there are no native wildcats on Cyprus, the cat must have been brought there by boat."' },
              { number: 34, promptHtml: 'What happened to many Egyptian cat mummies?', options: [{ key: 'A', text: 'They were displayed in museums.' }, { key: 'B', text: 'They were used as fertiliser.' }, { key: 'C', text: 'They were reburied.' }], answer: { accepted: ['B'] }, explanationHtml: '"some were shipped to Britain and used as fertiliser".' },
            ],
          },
          {
            id: 't35-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Cats and humans</strong></p>' +
              '<p>• humans accepted cats because they controlled {{q35}}<br/>• in Egypt, cats were linked to a {{q36}}<br/>• cats were taken on ships to catch {{q37}}<br/>• second wave of expansion came from {{q38}}<br/>• blotched tabby pattern became common in the Middle {{q39}}<br/>• cats are not strongly motivated to {{q40}} their owners</p>',
            questions: [
              { number: 35, answer: { accepted: ['pests'] }, explanationHtml: '"they were useful in controlling pests".' },
              { number: 36, answer: { accepted: ['goddess'] }, explanationHtml: '"They were associated with a goddess".' },
              { number: 37, answer: { accepted: ['rats'] }, explanationHtml: '"Ships carried cats to control rats on board".' },
              { number: 38, answer: { accepted: ['egypt'] }, explanationHtml: '"a later one from Egypt, along trading routes".' },
              { number: 39, answer: { accepted: ['ages'] }, explanationHtml: '"only became common in the Middle Ages".' },
              { number: 40, answer: { accepted: ['please'] }, explanationHtml: '"cats are not strongly motivated to please their owners".' },
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
        '<p>The chart below shows average daily water consumption per person in five cities in 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Daily water use per person (litres)',
        unit: 'litres',
        categories: ['City A', 'City B', 'City C', 'City D', 'City E'],
        xAxisLabel: 'City',
        yAxisLabel: 'Litres per person per day',
        series: [
          { name: '2000', data: [310, 180, 145, 220, 95] },
          { name: '2020', data: [245, 165, 150, 170, 120] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people say that increasing the tax on sugary food and drinks is the best way to improve public health.</p><p>To what extent do you agree or disagree? What other measures do you think might be effective?</p>',
    },
  },
};
