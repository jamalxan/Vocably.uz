// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE follows a standard Academic test
// layout; every topic, passage, transcript, question and answer is written from scratch.
import { table, TFNG_INSTRUCTION, YNNG_INSTRUCTION, svgDataUri, q, paras, mc, bank } from './_html.mjs';

const GARDEN_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#e6f0da"/>
  <text x="190" y="22" font-weight="bold" fill="#333">Millbank Community Garden</text>
  <path d="M300 385 L300 110" stroke="#c2a878" stroke-width="10"/>
  <path d="M300 250 L120 250 M300 250 L480 250 M300 110 L150 80 M300 110 L450 90" stroke="#c2a878" stroke-width="7"/>
  <rect x="270" y="385" width="60" height="12" fill="#555"/>
  <text x="340" y="396" fill="#333">Entrance</text>
  <ellipse cx="300" cy="190" rx="70" ry="38" fill="#bcd9ee" stroke="#6f9fc4" stroke-width="2"/>
  <text x="283" y="195" fill="#2c5d80" font-weight="bold">Pond</text>
  <rect x="245" y="40" width="110" height="50" fill="#d7ecd0" stroke="#66a06a"/>
  <text x="262" y="70" fill="#27542b">Greenhouse</text>
  <rect x="50" y="40" width="100" height="70" fill="#f0f0e0" stroke="#999" stroke-dasharray="4"/>
  <rect x="470" y="60" width="90" height="70" fill="#f0f0e0" stroke="#999" stroke-dasharray="4"/>
  <rect x="40" y="200" width="80" height="60" fill="#f0f0e0" stroke="#999" stroke-dasharray="4"/>
  <rect x="480" y="200" width="80" height="60" fill="#f0f0e0" stroke="#999" stroke-dasharray="4"/>
  <rect x="60" y="300" width="100" height="60" fill="#f0f0e0" stroke="#999" stroke-dasharray="4"/>
  <rect x="440" y="300" width="100" height="60" fill="#f0f0e0" stroke="#999" stroke-dasharray="4"/>
  <path d="M560 330 L560 305 M552 315 L560 302 L568 315" stroke="#333" stroke-width="2" fill="none"/>
  <text x="555" y="345" fill="#333" font-size="12">N</text>
</svg>`);

export default {
  slug: 'vocably-practice-test-7',
  title: 'Vocably Practice Test 7',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'Digging beneath the city',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: paras(
          ['A', `By the middle of the nineteenth century, the streets of London were so crowded with horse-drawn carts, omnibuses and pedestrians that crossing the city could take hours. The solution proposed by a solicitor named Charles Pearson was radical: instead of widening the streets, build railways beneath them. Many of his contemporaries thought the idea absurd, and some predicted that the ground would collapse or that passengers would suffocate. Yet the first section of what became the Metropolitan Railway opened in 1863, running a few kilometres between two main-line stations, and it carried tens of thousands of passengers on its first day, far more than its owners had dared to hope for. Within a year, plans for further lines were being drawn up. The underground railway, as a form of transport, had been born.`],
          ['B', `The early lines were built by a method known as cut-and-cover. Workers dug a deep trench along the line of a road, built a brick arch over it and then restored the surface, so that the railway ran inside a covered tunnel. The method was simple, but it caused enormous disruption. Roads were closed for months, shops along the route lost customers, and houses in the way of the trench had to be demolished. The trains were pulled by steam locomotives, and although gaps in the roof let some smoke escape, the air in the stations was thick and unpleasant. Newspapers of the time described passengers emerging from the carriages coughing and covered in soot.`],
          ['C', `The breakthrough came from an engineer named James Greathead, who refined an invention known as the shield: a strong iron cylinder pushed forward through the ground, inside which workers could dig safely while a lining of iron rings was fitted behind them. The shield was first used in 1869 to build a small tunnel for pedestrians beneath the river, and it was later used for the City and South London Railway, which opened in 1890. This was the first deep underground line, running through tunnels cut through a layer of clay well below the foundations of the buildings above, and, more importantly, it was the first to use electric locomotives. Without smoke, there was no need for ventilation gaps, and tunnels could be built at any depth.`],
          ['D', `Other cities soon followed. Budapest opened the first underground railway in continental Europe in 1896, and Boston opened the first in North America the following year. Paris inaugurated its metro in 1900, in time for a great international exhibition, and New York's subway opened in 1904. Each system reflected the character of its city. Berlin and other cities soon added their own networks, and by the First World War dozens of cities worldwide had some form of underground railway. Paris built many shallow lines with elegant, decorated stations, while New York, where the ground is mostly solid rock, favoured fast express services with separate tracks for trains that skipped stations.`],
          ['E', `The new railways changed the shape of cities. Before their arrival, most people had to live within walking distance of their work, and the centres of large cities were crowded and unhealthy. Underground lines, especially when they extended into the countryside, allowed workers to live in newly built suburbs and travel to the centre in comfort. Some railway companies bought land along their routes and built houses on it, and cheap fares for working people, designed to fill carriages in the early morning, made it possible for families on modest incomes to move out. The stations themselves became centres of shopping and social life, and in the Second World War, many were used as shelters from air raids.`],
          ['F', `Today, building underground lines is one of the costliest forms of construction, often running to hundreds of millions of dollars per kilometre in dense cities. Digging also uncovers the past: in many old cities, work must stop when builders find ancient remains, and archaeologists may be given months to record them. Water is a further problem, since tunnels below the water table must be pumped continuously to keep them dry. In addition, deep tunnels are getting hotter, because the heat given off by trains and passengers has nowhere to go, and some operators are experimenting with ways of using this warmth to heat nearby buildings. Newer lines increasingly use driverless trains, which can run closer together and so carry more people.`]
        ),
        questionGroups: [
          {
            id: 't7-r1-endings',
            type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, A-H, below.',
            bank: [
              { key: 'A', text: 'caused smoke problems for passengers.' },
              { key: 'B', text: 'protected workers while the tunnel lining was fitted.' },
              { key: 'C', text: 'opened in 1863.' },
              { key: 'D', text: 'was the first such system in continental Europe.' },
              { key: 'E', text: 'made it possible for families on modest incomes to live further from work.' },
              { key: 'F', text: 'was completed in less than a year.' },
              { key: 'G', text: 'was abandoned after ten years.' },
              { key: 'H', text: 'were pulled by horses.' },
            ],
            questions: [
              q(1, 'The first section of the Metropolitan Railway', 'C', 'Paragraph A: "opened in 1863".', 'A'),
              q(2, 'Steam locomotives in the early tunnels', 'A', 'Paragraph B: "the air in the stations was thick and unpleasant".', 'B'),
              q(3, 'Greathead\'s shield', 'B', 'Paragraph C: workers "could dig safely while a lining of iron rings was fitted behind them".', 'C'),
              q(4, 'The Budapest line', 'D', 'Paragraph D: "the first underground railway in continental Europe".', 'D'),
              q(5, 'Cheap fares for working people', 'E', 'Paragraph E: "made it possible for families on modest incomes to move out".', 'E'),
            ],
          },
          {
            id: 't7-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Charles Pearson was an engineer.', 'FALSE', 'Paragraph A: "a solicitor named Charles Pearson".', 'A'),
              q(7, 'Cut-and-cover construction caused some shops to lose customers.', 'TRUE', 'Paragraph B: "shops along the route lost customers".', 'B'),
              q(8, 'The first tunnel built with Greathead\'s shield was for a passenger railway.', 'FALSE', 'Paragraph C: it was used "to build a small tunnel for pedestrians".', 'C'),
              q(9, 'New York\'s subway opened before the Paris metro.', 'FALSE', 'Paragraph D: Paris opened in 1900; New York in 1904.', 'D'),
            ],
          },
          {
            id: 't7-r1-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD ONLY</strong> from paragraph F for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['Challenge', 'Detail'],
              [
                ['Cost', 'often hundreds of millions of dollars per {{q10}}'],
                ['Archaeology', 'work stops when builders find ancient {{q11}}'],
                ['Water', 'tunnels below the water table must be pumped to keep them {{q12}}'],
                ['Heat', 'trains and passengers give off {{q13}}, which has nowhere to go'],
              ]
            ),
            questions: [
              q(10, null, ['kilometre', 'kilometer'], 'Paragraph F: "per kilometre".', 'F'),
              q(11, null, ['remains'], 'Paragraph F: "ancient remains".', 'F'),
              q(12, null, ['dry'], 'Paragraph F: "to keep them dry".', 'F'),
              q(13, null, ['heat'], 'Paragraph F: "the heat given off by trains and passengers".', 'F'),
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The placebo puzzle',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: paras(
          ['A', `A placebo is a treatment with no active ingredient: a sugar pill, an injection of salt water, a cream that contains nothing but oil. In medical trials, placebos are given to one group of patients while another receives the real drug, so that researchers can tell how much of any improvement is due to the drug itself. Curiously, patients given a placebo very often get better. For much of the twentieth century, doctors tended to dismiss this as imagination, a reaction of anxious or suggestible people that told them nothing about real illness. Over the past few decades, however, research has shown that the placebo effect is a genuine biological phenomenon, and one that may be among the most important in medicine.`],
          ['B', `The modern study of the subject is often dated to 1955, when an American anaesthetist named Henry Beecher reviewed fifteen studies and concluded that about a third of patients improved when given a placebo. The figure became famous, but later analyses suggested that it was too high. Many patients in the studies would have recovered without any treatment at all, and people who seek help when their symptoms are at their worst tend to feel better later simply because symptoms naturally fluctuate, a phenomenon statisticians call regression to the mean. Careful trials that include a group given no treatment at all have found that the true placebo effect is smaller than Beecher believed, though it is real.`],
          ['C', `How can an inactive substance produce a physical effect? The most convincing answer is that expectation changes the brain's chemistry. In a famous experiment in 1978, patients who had had a tooth removed reported less pain after receiving a placebo, but the effect disappeared when they were given a drug called naloxone, which blocks the action of the body's natural painkillers, the endorphins. This suggested that the belief that a treatment will work prompts the brain to release endorphins. Brain scans have since shown reduced activity in the regions associated with pain when people expect relief. Some scientists believe that similar mechanisms are involved in other responses, although the details are still debated.`],
          ['D', `The effect is strongest in conditions that are influenced by the brain and by perception, such as pain, depression, nausea and irritable bowel syndrome. In patients with Parkinson's disease, placebos have been shown to cause the brain to release dopamine, the chemical whose shortage causes the disease's symptoms. However, there is no evidence that placebos can shrink tumours, cure infections or repair damaged tissue, and researchers emphasise that a patient's sense of feeling better should not be confused with a cure.`],
          ['E', `Some of the most intriguing findings concern the way in which a treatment looks and is delivered. Large pills seem to work better than small ones, two pills better than one, and injections better than pills. Capsules are thought to be more effective than tablets, and branded packaging more effective than plain packaging. Even colour plays a part: in studies in several countries, red and yellow pills have seemed to act as stimulants, and blue ones as sedatives, although the associations differ between cultures. All of these results suggest that patients respond not only to a substance, but to the meaning they attach to it.`],
          ['F', `Perhaps the most surprising research involves what are known as open-label placebos. In a trial published in 2010, patients with irritable bowel syndrome were told honestly that their pills contained no medicine, but that placebos had been shown to help some people. They improved more than a group who were given no treatment. The results have been repeated in a few small studies, but the sample sizes are small and most researchers regard the findings as preliminary. If they are confirmed, they would raise an ethical question: if doctors need not deceive patients to produce the effect, it might be possible to use placebos openly.`],
          ['G', `The implications for medicine are considerable. Clinical trials must continue to include placebo groups, because without them the effect of a new drug cannot be separated from the effect of belief. The way a doctor speaks, the time they spend with a patient and the confidence they show may also affect how well a treatment works. But placebos are not a substitute for effective treatment. Patients who stop taking a proven drug in favour of a sugar pill are likely to be harmed, and the lesson of the research, most experts agree, is to use what we know about the mind to make real treatments more effective, not to replace them.`]
        ),
        questionGroups: [
          {
            id: 't7-r2-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? <em>Choose the correct letter, A-G.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bankReusable: true,
            questions: [
              q(14, 'a reason why an early estimate may have been too high', 'B', 'Paragraph B: patients would have recovered anyway; "regression to the mean".', 'B'),
              q(15, 'a chemical that is released by the brain when a person believes a treatment will work', 'C', 'Paragraph C: "the brain to release endorphins".', 'C'),
              q(16, 'examples of how the appearance of a treatment may affect its results', 'E', 'Paragraph E: size, colour and packaging of pills.', 'E'),
              q(17, 'a study in which patients knew that they were receiving a placebo', 'F', 'Paragraph F: "told honestly that their pills contained no medicine".', 'F'),
              q(18, 'a disease in which a placebo has been shown to cause a chemical to be released', 'D', 'Paragraph D: Parkinson\'s disease and dopamine.', 'D'),
              q(19, 'a warning about the limits of placebo treatment', 'G', 'Paragraph G: "placebos are not a substitute for effective treatment".', 'G'),
            ],
          },
          {
            id: 't7-r2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(20, 'What does paragraph A say about doctors in the twentieth century?', ['They believed the placebo effect was dangerous.', 'They often thought the effect existed only in the patient\'s mind.', 'They refused to use placebos in trials.', 'They studied the effect in suggestible people only.'], 'B', 'Paragraph A: "doctors tended to dismiss this as imagination".', 'A'),
              mc(21, 'The term "regression to the mean" in paragraph B refers to', ['patients forgetting how ill they were', 'symptoms naturally getting better after being at their worst', 'trials that give unreliable results', 'the average size of a placebo effect'], 'B', 'Paragraph B: people "tend to feel better later simply because symptoms naturally fluctuate".', 'B'),
              mc(22, 'According to paragraph D, placebos', ['have no effect on depression', 'can cure infections in some patients', 'affect conditions influenced by the brain but do not repair tissue', 'are stronger than most drugs'], 'C', 'Paragraph D: strongest in brain-influenced conditions; "no evidence that placebos can ... repair damaged tissue".', 'D'),
              mc(23, 'What is the writer\'s attitude to the open-label studies in paragraph F?', ['They are convincing evidence that doctors should stop using drugs.', 'They are promising but too small to be regarded as conclusive.', 'They have been shown to be wrong.', 'They are unethical.'], 'B', 'Paragraph F: "the sample sizes are small and most researchers regard the findings as preliminary".', 'F'),
            ],
          },
          {
            id: 't7-r2-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary of paragraph C below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: '<p>In a 1978 experiment, patients who had received a placebo after a tooth was removed reported less pain. The effect disappeared when they were given {{q24}}, which blocks the action of natural painkillers called {{q25}}. Brain scans have since shown reduced activity in regions associated with {{q26}}.</p>',
            questions: [
              q(24, null, ['naloxone'], 'Paragraph C: "a drug called naloxone".', 'C'),
              q(25, null, ['endorphins'], 'Paragraph C: "the body\'s natural painkillers, the endorphins".', 'C'),
              q(26, null, ['pain'], 'Paragraph C: "regions associated with pain".', 'C'),
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'The fermentation revival',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: paras(
          ['A', `Humans have been fermenting food for at least ten thousand years. Bread, cheese, yoghurt, beer, wine, soy sauce and pickled vegetables all depend on the activity of microscopic organisms, and in almost every culture, some form of fermented food is eaten every day. In recent years, however, something unusual has happened. Fermentation has moved out of factories and traditional kitchens and into the homes of enthusiasts and the laboratories of leading chefs, who treat it as a way of creating flavours that cannot be achieved by any other means. Books about fermentation have become bestsellers, and jars of bubbling cabbage have appeared on kitchen counters across the world.`],
          ['B', `The basic process is simple. Microorganisms such as yeasts and bacteria feed on the sugars in food and convert them into other substances: alcohol, acids and gases. In bread, the gas makes the dough rise; in beer and wine, the alcohol is the purpose; in pickles and yoghurt, it is the acids, which give a sour taste. These by-products also produce hundreds of other compounds, which contribute the complex aromas of aged cheese or soy sauce. Because different microorganisms produce different compounds, the same raw material can become a wide variety of products, depending on which organisms are present, how long they are left and at what temperature.`],
          ['C', `Before refrigerators, fermentation was essential for preserving food. The acids produced by bacteria make food too sour for the organisms that cause it to rot, so that cabbage turned into sauerkraut can be kept for months. Sailors on long voyages relied on it, and it had a further benefit that was not then understood: fermented cabbage retains much of its vitamin C, which protected crews from scurvy. The same principle lies behind the pickled vegetables, fermented fish and salted meats found in cuisines from Korea to Scandinavia, in regions where winters were long and fresh food was scarce.`],
          ['D', `Modern enthusiasm is often driven by claims about health. Fermented foods, it is said, contain beneficial bacteria that improve digestion, strengthen the immune system and even affect mood. The evidence, however, is more limited than the marketing suggests. Some studies indicate modest benefits, particularly for digestive problems, but many are small and have not been repeated. And many commercial products, including most shop-bought sauerkraut and some yoghurts, are heated after fermentation to extend their shelf life, which kills the organisms that are supposed to be beneficial. Anyone who eats fermented food only for its bacteria should read the label carefully.`],
          ['E', `For chefs, the attraction is flavour. Fermentation creates savoury depth, known as umami, that cannot be produced by cooking alone, which is why soy sauce, miso and fish sauce are used in kitchens all over the world. A restaurant in Copenhagen became famous for its fermentation laboratory, where staff experimented with making sauces from ingredients as varied as grasshoppers, bread and peas. Many of these experiments failed, but those that succeeded were copied by cooks elsewhere, and produced new staples such as black garlic and vinegars flavoured with fruit.`],
          ['F', `Safety is a common concern among those who try fermenting at home. In fact, fermented vegetables are usually very safe, since the acidic, salty conditions quickly discourage harmful bacteria, and the risks are small compared with many other kinds of home cooking. Nevertheless, the rules matter. Jars must be clean, the right amount of salt must be used, and any food that smells unpleasant, rather than pleasantly sour, should be thrown away. Some traditional methods, such as fermenting meat or fish without proper guidance, carry serious risks and are best left to experienced producers.`],
          ['G', `It would be wrong to regard the revival as a passing fashion. Fermentation is increasingly seen as a tool for solving practical problems. Food scientists are using fungi to produce protein from agricultural waste, and brewers have begun turning surplus bread into beer. Because fermentation needs little energy and can turn cheap, abundant ingredients into valuable foods, some researchers believe it could make an important contribution to feeding a growing population more sustainably. The jar of cabbage on the kitchen counter may seem a modest thing, but it connects the oldest of human technologies with some of the newest.`]
        ),
        questionGroups: [
          {
            id: 't7-r3-headings',
            type: 'matching_headings',
            instructionHtml: 'Reading Passage 3 has seven paragraphs, A-G. Choose the correct heading for paragraphs B-G from the list of headings below.<br/><em>Example: Paragraph A — viii</em>',
            bank: [
              { key: 'i', text: 'Claims that may be stronger than the evidence' },
              { key: 'ii', text: 'What happens to food when microbes go to work' },
              { key: 'iii', text: 'The search for flavour in professional kitchens' },
              { key: 'iv', text: 'A method for making food last' },
              { key: 'v', text: 'A technology with a future beyond the kitchen' },
              { key: 'vi', text: 'The dangers of shop-bought food' },
              { key: 'vii', text: 'Keeping the risks in proportion' },
              { key: 'viii', text: 'A traditional practice returns' },
              { key: 'ix', text: 'The decline of the pickling industry' },
            ],
            questions: [
              q(27, 'Paragraph B', 'ii', 'Paragraph B: microorganisms convert sugars into alcohol, acids and gases.', 'B'),
              q(28, 'Paragraph C', 'iv', 'Paragraph C: "essential for preserving food".', 'C'),
              q(29, 'Paragraph D', 'i', 'Paragraph D: "The evidence, however, is more limited than the marketing suggests."', 'D'),
              q(30, 'Paragraph E', 'iii', 'Paragraph E: "For chefs, the attraction is flavour."', 'E'),
              q(31, 'Paragraph F', 'vii', 'Paragraph F: "fermented vegetables are usually very safe ... Nevertheless, the rules matter."', 'F'),
              q(32, 'Paragraph G', 'v', 'Paragraph G: fermentation as "a tool for solving practical problems".', 'G'),
            ],
          },
          {
            id: 't7-r3-ynng',
            type: 'yes_no_notgiven',
            instructionHtml: YNNG_INSTRUCTION,
            questions: [
              q(33, 'Fermentation has recently become popular among people who cook at home.', 'YES', 'Paragraph A: fermentation has moved "into the homes of enthusiasts".', 'A'),
              q(34, 'Claims about the health benefits of fermented foods are generally supported by strong evidence.', 'NO', 'Paragraph D: "The evidence, however, is more limited than the marketing suggests."', 'D'),
              q(35, 'Most shop-bought yoghurts contain more beneficial bacteria than home-made ones.', 'NOT GIVEN', 'Paragraph D mentions only that some commercial products are heated; no comparison with home-made ones.', 'D'),
              q(36, 'Fermenting meat without guidance is an activity that the writer would advise beginners to avoid.', 'YES', 'Paragraph F: such methods "carry serious risks and are best left to experienced producers".', 'F'),
              q(37, 'The current interest in fermentation is likely to be short-lived.', 'NO', 'Paragraph G: "It would be wrong to regard the revival as a passing fashion."', 'G'),
            ],
          },
          {
            id: 't7-r3-multi',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>THREE</strong> letters, A-G.',
            questions: [
              {
                number: 38,
                promptHtml: 'Which THREE of the following are mentioned in the passage as results of fermentation?',
                options: [
                  { key: 'A', text: 'bread dough rises' },
                  { key: 'B', text: 'food becomes more expensive' },
                  { key: 'C', text: 'food becomes sour' },
                  { key: 'D', text: 'food becomes sweeter' },
                  { key: 'E', text: 'food keeps for longer' },
                  { key: 'F', text: 'food loses its vitamin C' },
                  { key: 'G', text: 'food changes colour' },
                ],
                selectCount: 3,
                answer: { accepted: ['A', 'C', 'E'] },
                explanationHtml: 'Paragraph B: gas makes dough rise; acids give a sour taste. Paragraph C: sauerkraut "can be kept for months".',
              },
            ],
          },
          {
            id: 't7-r3-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              q(39, 'Which vitamin in fermented cabbage protected sailors from scurvy?', ['vitamin c'], 'Paragraph C: "retains much of its vitamin C".', 'C'),
              q(40, 'What name is given to the savoury depth that fermentation creates?', ['umami'], 'Paragraph E: "savoury depth, known as umami".', 'E'),
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
        contextText: 'You will hear a woman phoning a removal company to ask for a quote.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Swift Removals, good morning." },
          { speaker: 'B', voice: 'zira', text: "Good morning. I'm moving house next month and I'd like a quote, please." },
          { speaker: 'A', voice: 'david', text: "Certainly. Can I have your surname?" },
          { speaker: 'B', voice: 'zira', text: "It's Whitlock. That's W-H-I-T-L-O-C-K." },
          { speaker: 'A', voice: 'david', text: "And where are you moving from?" },
          { speaker: 'B', voice: 'zira', text: "From a flat in Denby, on Orchard Lane, to a house in Cranleigh, which is about forty miles away." },
          { speaker: 'A', voice: 'david', text: "Right. And on what date would you like to move?" },
          { speaker: 'B', voice: 'zira', text: "The twelfth of June, if possible. It's a Friday." },
          { speaker: 'A', voice: 'david', text: "We can do that. How many bedrooms does the flat have?" },
          { speaker: 'B', voice: 'zira', text: "Two, and quite a lot of furniture, I'm afraid. I also have a piano, which will need special handling." },
          { speaker: 'A', voice: 'david', text: "Not a problem, but there's an extra charge of sixty pounds for a piano. Which floor is the flat on?" },
          { speaker: 'B', voice: 'zira', text: "The third floor, and unfortunately there's no lift." },
          { speaker: 'A', voice: 'david', text: "Then we'll need three men rather than two. Would you like us to pack your belongings as well?" },
          { speaker: 'B', voice: 'zira', text: "Only the kitchen things and the books. I'll pack the rest myself." },
          { speaker: 'A', voice: 'david', text: "Fine. One more thing: parking. Our van is large, so you might need a permit from the council to park outside." },
          { speaker: 'B', voice: 'zira', text: "I hadn't thought of that. How do I get one?" },
          { speaker: 'A', voice: 'david', text: "You apply online, and it takes about a week. Now, based on what you've said, the price will be four hundred and eighty pounds, plus the piano charge. We ask for a deposit of ten per cent when you book." },
          { speaker: 'B', voice: 'zira', text: "That sounds reasonable. Could you send the quote by email?" },
          { speaker: 'A', voice: 'david', text: "Of course. I'll send it this afternoon." },
        ],
        questionGroups: [
          {
            id: 't7-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml: table(
              ['Swift Removals: Quotation request', ''],
              [
                ['Surname', '{{q1}}'],
                ['Moving from', 'flat in Denby, Orchard {{q2}}'],
                ['Distance', 'about {{q3}} miles'],
                ['Date', '{{q4}} June'],
                ['Bedrooms', '{{q5}}'],
                ['Special item', '{{q6}} (extra £60)'],
                ['Floor', '{{q7}} floor, no lift'],
                ['Packing service', 'kitchen things and {{q8}} only'],
                ['Needed from council', 'parking {{q9}}'],
                ['Deposit', '{{q10}} per cent'],
              ]
            ),
            questions: [
              q(1, null, ['whitlock'], 'Spelled out: W-H-I-T-L-O-C-K.'),
              q(2, null, ['lane'], '"Orchard Lane".'),
              q(3, null, ['40', 'forty'], '"about forty miles away".'),
              q(4, null, ['12', 'twelfth', '12th'], '"The twelfth of June".'),
              q(5, null, ['2', 'two'], '"Two, and quite a lot of furniture".'),
              q(6, null, ['piano'], '"I also have a piano".'),
              q(7, null, ['third', '3rd'], '"The third floor".'),
              q(8, null, ['books'], '"Only the kitchen things and the books."'),
              q(9, null, ['permit'], '"a permit from the council".'),
              q(10, null, ['10', 'ten'], '"a deposit of ten per cent".'),
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a volunteer showing a group round a community garden.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Hello, everyone, and welcome to Millbank Community Garden. I'm Grace, one of the volunteers, and I'll show you round before we start work." },
          { speaker: 'A', voice: 'zira', text: "The garden was started eight years ago on a piece of waste land that used to be a car park. Local residents raised the money for the first beds by holding a street party, and the council now provides the water free of charge." },
          { speaker: 'A', voice: 'zira', text: "We're open every day from eight until dusk. Anyone can walk through, but only members may take vegetables. Membership costs twelve pounds a year, and volunteers who work at least two hours a month get a free bag of produce." },
          { speaker: 'A', voice: 'zira', text: "This year, our biggest project is raising money for a new roof on the greenhouse, which was damaged in a storm. We have about half of what we need so far." },
          { speaker: 'A', voice: 'zira', text: "Now, let me take you round. We're standing at the entrance, at the bottom of the map. The main path runs straight ahead, north through the middle of the garden. The pond is just ahead of you. Please keep children away from the edge." },
          { speaker: 'A', voice: 'zira', text: "Go past the pond and at the far end you'll see the greenhouse, where we grow tomatoes and seedlings." },
          { speaker: 'A', voice: 'zira', text: "If you take the path to the left just before the greenhouse, you reach the herb spiral, in the north-west corner. It's a raised bed built in the shape of a spiral, so that different herbs can grow in different conditions." },
          { speaker: 'A', voice: 'zira', text: "On the opposite side, in the north-east corner, are the beehives. Please don't go near them unless you're wearing a protective suit; one of our members looks after the bees and sells the honey." },
          { speaker: 'A', voice: 'zira', text: "Coming back to the middle, if you take the path to the left, about halfway down, you'll find the compost bins on the west side. We'd like every volunteer to add their kitchen waste there." },
          { speaker: 'A', voice: 'zira', text: "Across the path, on the east side, is the picnic area, with three tables. It's a lovely spot for lunch." },
          { speaker: 'A', voice: 'zira', text: "In the south-west corner, close to the entrance, is the children's plot, where local schoolchildren grow their own vegetables. And finally, in the south-east corner, is the tool shed. Please sign the book when you take tools out, and put them back when you've finished." },
          { speaker: 'A', voice: 'zira', text: "Right, let's start by weeding the herb spiral, if everyone has their gloves." },
        ],
        questionGroups: [
          {
            id: 't7-l2-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(11, 'Before it became a garden, the site was', ['a school playground', 'a car park', 'a market'], 'B', '"a piece of waste land that used to be a car park".'),
              mc(12, 'Who pays for the water used in the garden?', ['the council', 'the members', 'a local business'], 'A', '"the council now provides the water free of charge".'),
              mc(13, 'Volunteers who work two hours a month receive', ['a free membership', 'a bag of produce', 'a pot of honey'], 'B', '"a free bag of produce".'),
              mc(14, 'The garden is currently raising money to', ['build a new pond', 'repair the greenhouse roof', 'buy more tools'], 'B', '"a new roof on the greenhouse".'),
            ],
          },
          {
            id: 't7-l2-map',
            type: 'map_label',
            instructionHtml: 'Label the map below. Choose the correct answer, <strong>A-H</strong>, for each numbered place (Questions 15-20).',
            imageUrl: GARDEN_MAP,
            imageAlt: 'Plan of a community garden: entrance at the bottom centre; a pond in the centre; a greenhouse at the top centre; six unlabelled plots in the north-west corner, north-east corner, west side, east side, south-west corner and south-east corner.',
            bank: bank(['Beehives', 'Children\'s plot', 'Compost bins', 'Herb spiral', 'Orchard', 'Picnic tables', 'Tool shed', 'Wildflower strip']),
            imageHotspots: [
              { questionNumber: 15, x: 17, y: 19 },
              { questionNumber: 16, x: 86, y: 24 },
              { questionNumber: 17, x: 13, y: 57 },
              { questionNumber: 18, x: 87, y: 57 },
              { questionNumber: 19, x: 18, y: 83 },
              { questionNumber: 20, x: 82, y: 83 },
            ],
            questions: [
              q(15, null, 'D', '"the herb spiral, in the north-west corner".'),
              q(16, null, 'A', '"in the north-east corner, are the beehives".'),
              q(17, null, 'C', '"the compost bins on the west side".'),
              q(18, null, 'F', '"on the east side, is the picnic area".'),
              q(19, null, 'B', '"in the south-west corner ... the children\'s plot".'),
              q(20, null, 'G', '"in the south-east corner, is the tool shed".'),
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two business students, Nina and Omar, discussing a presentation on fair-trade coffee.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Omar, have you had a chance to look at the sources for our presentation on fair-trade coffee?" },
          { speaker: 'B', voice: 'david', text: "Yes. I started with the textbook, but I'm afraid it was written about fifteen years ago, so most of the figures are out of date." },
          { speaker: 'A', voice: 'zira', text: "That's a shame. I found a report from one of the big fair-trade organisations. It has lots of useful data on prices paid to farmers." },
          { speaker: 'B', voice: 'david', text: "Yes, but surely it's rather biased? They've got a reason to make the results look good." },
          { speaker: 'A', voice: 'zira', text: "That's true. We should say clearly where the figures come from. I also read a newspaper article that looks at the other side, arguing that fair-trade premiums don't always reach the farmers." },
          { speaker: 'B', voice: 'david', text: "I saw that too. It was well written, but it was based on only one region, so we can't generalise from it." },
          { speaker: 'A', voice: 'zira', text: "Agreed. What about the interview with the coffee grower in Colombia that our tutor mentioned?" },
          { speaker: 'B', voice: 'david', text: "It's the most interesting source of all, because it's first-hand, but the recording is very long, so we'll need to choose quotations carefully." },
          { speaker: 'A', voice: 'zira', text: "Good idea. Now, how shall we structure the presentation?" },
          { speaker: 'B', voice: 'david', text: "I think we should begin with a short history of the fair-trade movement, then describe how the system works, and finish with the arguments for and against." },
          { speaker: 'A', voice: 'zira', text: "I'd prefer to start with the interview, to catch the audience's attention, and then go back to the history." },
          { speaker: 'B', voice: 'david', text: "That could work. We've got twelve minutes, so we'll have to be careful with timing. I'll take the history and the system, and you can do the debate?" },
          { speaker: 'A', voice: 'zira', text: "Fine. And visuals? I thought we could use a map showing where the coffee is grown." },
          { speaker: 'B', voice: 'david', text: "Yes, and a simple graph of prices over the last twenty years. Too many slides would be distracting." },
          { speaker: 'A', voice: 'zira', text: "Then let's aim for no more than eight. I'll draft them tonight, and we can meet in the library at ten tomorrow." },
          { speaker: 'B', voice: 'david', text: "Perfect. I'll bring a summary of the report, with the main figures." },
        ],
        questionGroups: [
          {
            id: 't7-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(21, 'What is the problem with the textbook?', ['It is too technical.', 'Its figures are out of date.', 'It is too short.'], 'B', '"most of the figures are out of date".'),
              mc(22, 'Why do the students decide to state the source of the report\'s figures?', ['The report is biased.', 'The figures are difficult to read.', 'The report is very long.'], 'A', '"surely it\'s rather biased?"'),
              mc(23, 'What do they say about the newspaper article?', ['It is based on only one region.', 'It is too old.', 'It supports fair trade.'], 'A', '"it was based on only one region".'),
              mc(24, 'Nina would prefer to begin the presentation with', ['a history of fair trade', 'the interview', 'a graph'], 'B', '"I\'d prefer to start with the interview".'),
              mc(25, 'How long will the presentation last?', ['eight minutes', 'ten minutes', 'twelve minutes'], 'C', '"We\'ve got twelve minutes".'),
            ],
          },
          {
            id: 't7-l3-match',
            type: 'matching_features',
            instructionHtml: 'What do the students say about each source? Choose <strong>FOUR</strong> answers from the box and write the correct letter, A-F, next to Questions 26-29.',
            bank: [
              { key: 'A', text: 'It is the most interesting but very long.' },
              { key: 'B', text: 'It is too technical.' },
              { key: 'C', text: 'It may be biased.' },
              { key: 'D', text: 'It is out of date.' },
              { key: 'E', text: 'It covers only one region.' },
              { key: 'F', text: 'It contains no figures.' },
            ],
            questions: [
              q(26, 'the textbook', 'D', '"most of the figures are out of date".'),
              q(27, 'the fair-trade report', 'C', '"surely it\'s rather biased?"'),
              q(28, 'the newspaper article', 'E', '"based on only one region".'),
              q(29, 'the interview', 'A', '"the most interesting source of all ... the recording is very long".'),
            ],
          },
          {
            id: 't7-l3-short',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentence below. Write <strong>ONE WORD ONLY</strong> for the answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              q(30, 'They will meet in the {{q30}} at ten tomorrow.', ['library'], '"we can meet in the library at ten tomorrow".'),
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about how bats find their way in the dark.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Bats are the only mammals that can truly fly, and most species are active at night, when vision is of little use. So how do they find their way, and their food, in total darkness? The answer is echolocation." },
          { speaker: 'A', voice: 'david', text: "A bat produces a series of very high-pitched calls, usually too high for humans to hear, and listens for the echoes that bounce back from objects around it. From the time the echo takes to return, the bat can judge how far away an object is, and from small changes in the sound, it can tell something about its size, shape and even texture." },
          { speaker: 'A', voice: 'david', text: "Most bats make their calls with the larynx, the voice box, and emit them through the mouth. Some species, such as horseshoe bats, call through the nose, and have elaborate leaf-shaped structures around the nostrils that focus the sound into a narrow beam." },
          { speaker: 'A', voice: 'david', text: "The calls are extremely loud, sometimes louder than a smoke alarm, but because the frequency is so high, they are inaudible to us. A bat flying in open country makes about ten calls a second. But when it detects an insect and closes in for the kill, it speeds up dramatically, producing up to two hundred calls a second in what is known as the feeding buzz." },
          { speaker: 'A', voice: 'david', text: "Given that so many bats hunt at the same time, you might expect them to confuse each other's echoes. In fact, bats avoid this by adjusting the pitch of their calls slightly when they are near another bat, a behaviour known as the jamming avoidance response." },
          { speaker: 'A', voice: 'david', text: "Some insects have evolved defences. Certain moths can hear bat calls and dive to the ground when they detect one. Others, such as some tiger moths, make clicking sounds of their own, which seem to warn the bat that they taste unpleasant, or perhaps confuse its echolocation." },
          { speaker: 'A', voice: 'david', text: "Bats are also valuable to people. A single bat can eat thousands of insects in a night, including many that damage crops, and in some regions farmers have installed bat boxes to encourage them. Yet bats are declining in many countries because of loss of roosting sites and the use of pesticides, which reduce their food supply." },
          { speaker: 'A', voice: 'david', text: "Finally, research on echolocation has inspired human technology. Engineers have developed walking sticks for blind people that use ultrasound in a way similar to bats, and researchers are studying bat calls to improve the sonar used in underwater exploration." },
        ],
        questionGroups: [
          {
            id: 't7-l4-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B or C</strong>.',
            questions: [
              mc(31, 'How does a bat judge how far away an object is?', ['by the time the echo takes to return', 'by the loudness of the call', 'by the colour of the object'], 'A', '"From the time the echo takes to return".'),
              mc(32, 'Horseshoe bats are unusual because they', ['call through the nose', 'cannot hear high sounds', 'hunt only in daylight'], 'A', '"call through the nose".'),
              mc(33, 'When a bat closes in on an insect, it', ['stops calling', 'calls more slowly', 'calls much faster'], 'C', '"it speeds up dramatically".'),
              mc(34, 'The jamming avoidance response helps bats to', ['find roosting sites', 'avoid confusing each other\'s echoes', 'hunt in groups'], 'B', '"bats avoid this by adjusting the pitch of their calls".'),
              mc(35, 'Why do some tiger moths make clicking sounds?', ['to attract other moths', 'to warn bats or confuse their echolocation', 'to find food'], 'B', '"warn the bat that they taste unpleasant, or perhaps confuse its echolocation".'),
            ],
          },
          {
            id: 't7-l4-sentences',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              q(36, 'Most bats produce their calls with the {{q36}}.', ['larynx', 'voice box'], '"with the larynx, the voice box".'),
              q(37, 'In open country, a bat makes about {{q37}} calls a second.', ['10', 'ten'], '"about ten calls a second".'),
              q(38, 'During the feeding buzz, a bat can produce up to {{q38}} calls a second.', ['200', 'two hundred'], '"up to two hundred calls a second".'),
              q(39, 'Some farmers have installed bat {{q39}} to encourage bats.', ['boxes'], '"farmers have installed bat boxes".'),
              q(40, 'Walking sticks for blind people use {{q40}} in a similar way to bats.', ['ultrasound'], '"use ultrasound in a way similar to bats".'),
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
        '<p>The pie chart below shows how a typical household in a European country spent its income in 2022.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'pie',
        title: 'Household spending by category, 2022 (%)',
        unit: '%',
        categories: ['Housing', 'Food', 'Transport', 'Leisure', 'Clothing', 'Other'],
        series: [{ name: 'Share of spending', data: [31, 16, 14, 12, 7, 20] }],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that it is better to live in a small town, while others prefer a large city.</p><p>Discuss both views and give your own opinion.</p>',
    },
  },
};
