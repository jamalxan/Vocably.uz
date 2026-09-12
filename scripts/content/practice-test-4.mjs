// Original IELTS-style practice content, written for Vocably (NOT copied or
// paraphrased from any real Cambridge/IELTS publication — see TZ-vocably-v2.md
// BUG-021, which flags reusing real Cambridge material as a copyright risk and
// recommends "original content + generic names" instead).
//
// Consumed by scripts/seed-practice-tests.mjs, which turns `listening.parts[].
// transcriptLines` into real synthesized audio (Windows offline TTS) and
// `writing.task1.chart` into an SVG image (src/lib/chartSvg.js), then inserts
// the assembled Test document into MongoDB via the ExamTest model.

export default {
  slug: 'vocably-practice-test-4',
  title: 'Vocably Practice Test 4',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The Origins of Chocolate',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          {
            label: 'A',
            html: "<p>Long before chocolate became the sweet treat found in supermarkets around the world, its main ingredient, the cacao tree, grew wild in the tropical rainforests of the Amazon basin in South America. <em>Theobroma cacao</em>, as botanists later named it &mdash; a term meaning &ldquo;food of the gods&rdquo; &mdash; produces large pods containing bitter seeds. Archaeological evidence suggests that as early as 1900 BC, the Olmec people of present-day Mexico were already fermenting and roasting these seeds to make a bitter drink, marking the first known use of cacao by humans.</p>",
          },
          {
            label: 'B',
            html: "<p>Several centuries later, the Maya and Aztec civilisations elevated cacao to something far more significant than a simple beverage. Beans were so highly valued that they were used as a form of currency, and a frothy, spiced drink known as <em>xocolatl</em> &mdash; mixed with chilli peppers, cornmeal and other flavourings &mdash; was reserved largely for rulers, warriors and priests. It was consumed during religious ceremonies and believed to carry sacred properties, a far cry from the sugary confectionery of today.</p>",
          },
          {
            label: 'C',
            html: "<p>When Spanish conquistadors arrived in the region in the early sixteenth century, they encountered this bitter drink and eventually carried cacao beans back across the Atlantic to Europe. At first, Europeans found the drink unpalatable, but Spanish colonists began adding sugar and vanilla, transforming it into something far more appealing to European tastes. For almost a hundred years, Spain managed to keep the recipe a closely guarded secret, and chocolate remained an expensive luxury enjoyed exclusively by the aristocracy.</p>",
          },
          {
            label: 'D',
            html: "<p>The chocolate familiar to most people today did not appear until the Industrial Revolution. In 1828, a Dutch chemist named Coenraad Van Houten patented a hydraulic press capable of separating cocoa butter from roasted, ground cacao beans, leaving behind a fine powder that could be mixed with liquid far more easily. Building on this innovation, Swiss chocolatiers later developed a process called <strong>conching</strong>, which gave chocolate its smooth texture, paving the way for the first solid, edible chocolate bars and, eventually, mass production.</p>",
          },
          {
            label: 'E',
            html: "<p>Today, the vast majority of the world&rsquo;s cocoa is grown not in Latin America but in West Africa, with Ivory Coast and Ghana together producing well over half of the global supply. This shift has brought its own difficulties: the industry has faced sustained criticism over poor pay for farmers and the use of child labour on some cocoa farms. In response, certification schemes and direct-trade arrangements between chocolate makers and growers have emerged, aiming to ensure that farmers receive a fairer share of the profits.</p>",
          },
          {
            label: 'F',
            html: "<p>Chocolate&rsquo;s story is far from finished. Nutrition researchers have identified compounds called <strong>flavonoids</strong> in cocoa, particularly in dark chocolate, that may offer some cardiovascular benefits, although experts caution that the high sugar content of many chocolate products can easily outweigh any advantage. Meanwhile, agricultural scientists are racing to breed hardier cacao varieties, as rising temperatures and disease threaten to shrink the regions where the crop can be grown &mdash; a reminder that the future of this ancient food is still being written.</p>",
          },
        ],
        questionGroups: [
          {
            id: 'p1-headings',
            type: 'matching_headings',
            instructionHtml:
              'The passage has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below.',
            bank: [
              { key: 'i', text: 'A drink reserved for the powerful' },
              { key: 'ii', text: "Turning cacao into a solid bar" },
              { key: 'iii', text: "The plant's beginnings in the rainforest" },
              { key: 'iv', text: 'A commodity crossing the Atlantic' },
              { key: 'v', text: 'Concerns about how cacao is grown today' },
              { key: 'vi', text: 'Possible benefits and risks for health' },
              { key: 'vii', text: 'A failed attempt to grow cacao in Europe' },
              { key: 'viii', text: "Scientists study the tree's future" },
            ],
            questions: [
              { number: 1, promptHtml: 'Paragraph A', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph A describes cacao growing wild in the Amazon rainforest before humans used it.' },
              { number: 2, promptHtml: 'Paragraph B', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph B describes xocolatl as a drink reserved for rulers, warriors and priests.' },
              { number: 3, promptHtml: 'Paragraph C', answer: { accepted: ['iv'] }, explanationHtml: 'Paragraph C describes cacao being carried across the Atlantic to Europe.' },
              { number: 4, promptHtml: 'Paragraph D', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph D describes the industrial process that produced solid chocolate bars.' },
              { number: 5, promptHtml: 'Paragraph E', answer: { accepted: ['v'] }, explanationHtml: 'Paragraph E discusses labour and fair-trade concerns in cocoa farming today.' },
              { number: 6, promptHtml: 'Paragraph F', answer: { accepted: ['vi'] }, explanationHtml: 'Paragraph F discusses possible cardiovascular benefits and sugar-related risks.' },
            ],
          },
          {
            id: 'p1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 7,
                promptHtml: "What does the term 'Theobroma cacao' mean?",
                options: [
                  { key: 'A', text: 'food of the gods' },
                  { key: 'B', text: 'bitter seed' },
                  { key: 'C', text: 'sacred tree' },
                  { key: 'D', text: 'tree of currency' },
                ],
                answer: { accepted: ['A'] },
                explanationHtml: "Paragraph A: botanists named it Theobroma cacao, meaning 'food of the gods'.",
                locatorParagraph: 'A',
              },
              {
                number: 8,
                promptHtml: 'How did xocolatl differ from chocolate today, according to the passage?',
                options: [
                  { key: 'A', text: 'It was mainly drunk by ordinary Aztec farmers' },
                  { key: 'B', text: 'It was flavoured with chilli and cornmeal rather than sugar' },
                  { key: 'C', text: 'It was only ever used as currency' },
                  { key: 'D', text: 'It was invented after the Spanish conquest' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph B: xocolatl was mixed with chilli peppers and cornmeal, not sugar.',
                locatorParagraph: 'B',
              },
              {
                number: 9,
                promptHtml: "What was the main effect of Coenraad Van Houten's invention?",
                options: [
                  { key: 'A', text: 'It made cacao easier to grow in Europe' },
                  { key: 'B', text: 'It allowed cocoa butter to be separated from the rest of the bean' },
                  { key: 'C', text: 'It ended the use of cacao as currency' },
                  { key: 'D', text: 'It introduced sugar to the chocolate recipe' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: "Paragraph D: Van Houten's press separated cocoa butter from the ground beans.",
                locatorParagraph: 'D',
              },
            ],
          },
          {
            id: 'p1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            questions: [
              { number: 10, promptHtml: 'Cacao pods originally grew wild in the rainforests of the {{q10}}.', answer: { accepted: ['Amazon basin', 'the Amazon basin'] }, explanationHtml: "Paragraph A: cacao grew wild in the Amazon basin.", locatorParagraph: 'A' },
              { number: 11, promptHtml: 'For nearly a hundred years, {{q11}} succeeded in keeping the chocolate recipe secret.', answer: { accepted: ['Spain'] }, explanationHtml: 'Paragraph C: Spain kept the recipe secret for almost a hundred years.', locatorParagraph: 'C' },
              { number: 12, promptHtml: 'A process called {{q12}}, developed by Swiss chocolatiers, gave chocolate its smooth texture.', answer: { accepted: ['conching'] }, explanationHtml: 'Paragraph D names the process conching.', locatorParagraph: 'D' },
              { number: 13, promptHtml: 'Nutrition researchers have identified compounds called {{q13}} in cocoa that may benefit heart health.', answer: { accepted: ['flavonoids'] }, explanationHtml: 'Paragraph F: flavonoids may offer cardiovascular benefits.', locatorParagraph: 'F' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Wildlife Migration Tracking Technology',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: 'A', html: "<p>For centuries, scientists studying animal migration relied on direct observation and simple methods such as ringing birds' legs with numbered bands, hoping a bird would later be found or recaptured elsewhere. This approach offered only an incomplete picture of where animals actually travelled. Over the past thirty years, satellite and GPS tracking technology has transformed the field, revealing journeys far more detailed and surprising than researchers had imagined.</p>" },
          { label: 'B', html: "<p>Early tracking devices, developed in the 1960s and 1970s, relied on bulky radio transmitters that had to be physically attached to an animal. These devices were heavy, expensive and had a limited transmission range, which meant that only larger animals, such as elephants and whales, could realistically carry them without the equipment affecting their behaviour.</p>" },
          { label: 'C', html: "<p>Advances in miniaturisation changed this considerably. Satellite systems such as Argos allowed signals to be picked up from much smaller tags, and today solar-powered GPS tags weighing only a few grams can transmit precise location data for years at a time. This has even made it possible to track small songbirds and, remarkably, insects such as monarch butterflies.</p>" },
          { label: 'D', html: "<p>The findings from this technology have overturned earlier assumptions. Tracking data revealed, for example, that Arctic terns migrate far greater distances than scientists had previously calculated, travelling between the Arctic and the Antarctic each year. Tracking has also identified previously unknown stopover sites that are critical for resting and feeding, along with threats such as wind farms and hunting located along certain migratory flyways.</p>" },
          { label: 'E', html: "<p>Citizen science projects, in which members of the public report sightings through smartphone apps, now combine with professional tracking data to build far more comprehensive migration maps than either method could produce alone. These combined datasets have gone on to inform international conservation agreements and the designation of protected migratory corridors.</p>" },
          { label: 'F', html: "<p>Challenges remain, however. The weight and drag of a tag can still affect the behaviour and survival of smaller animals, and cost and battery life continue to limit how long many species can be tracked. Ethical guidelines have been developed to minimise harm, and researchers are now working on lighter, more energy-efficient sensors, including some that transmit data using existing mobile phone networks.</p>" },
        ],
        questionGroups: [
          {
            id: 'p2-yng',
            type: 'yes_no_notgiven',
            instructionHtml:
              "Do the following statements agree with the claims of the writer?<br/><strong>YES</strong> if the statement agrees with the claims of the writer<br/><strong>NO</strong> if the statement contradicts the claims of the writer<br/><strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this",
            questions: [
              { number: 14, promptHtml: 'Traditional methods of studying migration gave researchers a complete understanding of animal movements.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph A says traditional methods offered only "an incomplete picture".', locatorParagraph: 'A' },
              { number: 15, promptHtml: 'Early tracking devices could be attached to almost any species.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph B says only larger animals could realistically carry early devices.', locatorParagraph: 'B' },
              { number: 16, promptHtml: 'Advances in miniaturisation have made it possible to track insects.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph C says monarch butterflies can now be tracked.', locatorParagraph: 'C' },
              { number: 17, promptHtml: 'Most conservation researchers agree that citizen science data is unreliable.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage never comments on the reliability of citizen science data.' },
              { number: 18, promptHtml: 'Tracking data revealed that Arctic terns migrate further than scientists had previously thought.', answer: { accepted: ['YES'] }, explanationHtml: 'Paragraph D states Arctic terns migrate "far greater distances than scientists had previously calculated".', locatorParagraph: 'D' },
              { number: 19, promptHtml: 'The weight of tracking devices has no effect on the animals that carry them.', answer: { accepted: ['NO'] }, explanationHtml: 'Paragraph F says tag weight and drag can still affect behaviour and survival.', locatorParagraph: 'F' },
            ],
          },
          {
            id: 'p2-summary',
            type: 'summary_completion_bank',
            instructionHtml: 'Complete the summary below. Choose the correct answer from the box for each gap.',
            bankReusable: false,
            bank: [
              { key: 'A', text: 'lighter' },
              { key: 'B', text: 'solar-powered' },
              { key: 'C', text: 'stopover' },
              { key: 'D', text: 'corridors' },
              { key: 'E', text: 'citizen' },
              { key: 'F', text: 'battery' },
              { key: 'G', text: 'wind farms' },
              { key: 'H', text: 'Argos' },
              { key: 'I', text: 'monarch' },
              { key: 'J', text: 'crowdsourced' },
            ],
            stemHtml:
              "<p>Modern tags are often {{q20}}, meaning they can transmit data for long periods without needing to be replaced. Tracking has revealed previously unknown {{q21}} sites that are vital for resting and feeding during migration, as well as threats such as {{q22}} along certain flyways. Conservationists have used this information to help establish protected {{q23}}. Meanwhile, {{q24}} science projects, in which members of the public report sightings, add valuable extra data to tracking studies. Researchers are also working to design {{q25}} sensors that reduce the impact of a tag on the animal wearing it, since {{q26}} life continues to restrict how long some devices can operate.</p>",
            questions: [
              { number: 20, answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C: solar-powered GPS tags can transmit for years.', locatorParagraph: 'C' },
              { number: 21, answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: previously unknown stopover sites were identified.', locatorParagraph: 'D' },
              { number: 22, answer: { accepted: ['G'] }, explanationHtml: 'Paragraph D: wind farms are named as a threat along flyways.', locatorParagraph: 'D' },
              { number: 23, answer: { accepted: ['D'] }, explanationHtml: 'Paragraph E: data has informed protected migratory corridors.', locatorParagraph: 'E' },
              { number: 24, answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E: citizen science projects combine with tracking data.', locatorParagraph: 'E' },
              { number: 25, answer: { accepted: ['A'] }, explanationHtml: 'Paragraph F: researchers are working on lighter sensors.', locatorParagraph: 'F' },
              { number: 26, answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F: battery life limits tracking duration.', locatorParagraph: 'F' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'The Rise of Artificial Intelligence in Everyday Life',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>Not long ago, artificial intelligence, or AI, belonged mostly to science fiction and specialised research laboratories. Today, it is embedded in countless daily routines &mdash; from unlocking a smartphone with facial recognition to receiving a personalised playlist &mdash; often without users being fully aware that AI is involved at all.</p>" },
          { label: 'B', html: "<p>The most significant breakthrough came with machine learning, a shift away from rigidly rule-based programming towards systems that learn patterns for themselves. In a typical project, vast quantities of raw data &mdash; text, images or sound &mdash; are first <strong>collected</strong> from a wide range of sources, then cleaned and organised in a stage engineers call <strong>preprocessing</strong>. A <strong>neural</strong> network, loosely modelled on connections in the human brain, is then trained by repeatedly adjusting its internal settings until its output matches the examples provided. Once trained, the model is tested on new, unseen data to measure its <strong>accuracy</strong>, and only once this reaches an acceptable level is the system finally <strong>deployed</strong> inside a real application such as a phone or a smart speaker. This general approach, refined since around 2012, enabled major leaps in image and speech recognition.</p>" },
          { label: 'C', html: "<p>Everyday applications now abound. Voice assistants schedule appointments and answer spoken questions; navigation apps predict traffic and suggest faster routes; streaming services suggest content that users might enjoy; banking systems increasingly use AI for fraud detection; and in medicine, AI can assist with the diagnosis of scans and images, flagging areas that a doctor should examine more closely.</p>" },
          { label: 'D', html: "<p>These benefits come with real concerns. Because models learn from existing data, they can reproduce and even amplify unfair or biased outcomes if that data itself reflects historical bias. There are also fears about job losses in certain industries, worries about the constant collection of personal data, and calls for greater transparency in high-stakes decisions such as loan approvals or hiring, where an unexplainable AI judgement can feel deeply unfair to the person affected.</p>" },
          { label: 'E', html: "<p>In response, governments and international organisations have begun drafting regulations and ethical guidelines intended to balance innovation against these safeguards. Some technology companies have gone further, establishing internal ethics boards to review how AI systems are designed and used before they are released to the public.</p>" },
          { label: 'F', html: "<p>Looking ahead, AI is expected to become even more deeply integrated into daily life, from autonomous vehicles to personalised education and healthcare diagnostics. Many commentators argue that improving public understanding of how these systems work &mdash; sometimes called digital literacy &mdash; will be just as important as any technical advance, as societies continue to debate how much autonomy should ultimately be delegated to machines.</p>" },
        ],
        questionGroups: [
          {
            id: 'p3-flowchart',
            type: 'flowchart_completion',
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              "<p>1. Large amounts of raw data (text, images, or sound) are {{q27}} from a wide range of sources.</p><p>2. This data is cleaned and organised so that a computer model can use it, a stage often called {{q28}}.</p><p>3. A {{q29}} network is trained by adjusting internal settings until its predictions match the examples it has seen.</p><p>4. The trained model is tested on new, unseen data to check its {{q30}}.</p><p>5. Once performance is satisfactory, the system is {{q31}} into an application such as a voice assistant or a recommendation engine.</p>",
            questions: [
              { number: 27, answer: { accepted: ['collected', 'gathered'] }, explanationHtml: 'Paragraph B: data is "collected" from a wide range of sources.', locatorParagraph: 'B' },
              { number: 28, answer: { accepted: ['preprocessing', 'pre-processing'] }, explanationHtml: 'Paragraph B names this stage "preprocessing".', locatorParagraph: 'B' },
              { number: 29, answer: { accepted: ['neural'] }, explanationHtml: 'Paragraph B: a "neural" network is trained on the data.', locatorParagraph: 'B' },
              { number: 30, answer: { accepted: ['accuracy'] }, explanationHtml: 'Paragraph B: the model is tested to measure its "accuracy".', locatorParagraph: 'B' },
              { number: 31, answer: { accepted: ['deployed'] }, explanationHtml: 'Paragraph B: the system is finally "deployed" inside a real application.', locatorParagraph: 'B' },
            ],
          },
          {
            id: 'p3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 32,
                promptHtml: 'According to the passage, a neural network is loosely modelled on...',
                options: [
                  { key: 'A', text: 'traffic patterns' },
                  { key: 'B', text: 'the human brain' },
                  { key: 'C', text: 'banking systems' },
                  { key: 'D', text: 'government databases' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph B: a neural network is "loosely modelled on connections in the human brain".',
                locatorParagraph: 'B',
              },
              {
                number: 33,
                promptHtml: 'Which of the following is NOT mentioned as a concern about AI in the passage?',
                options: [
                  { key: 'A', text: 'unfair or biased outcomes' },
                  { key: 'B', text: 'loss of jobs in some industries' },
                  { key: 'C', text: 'rising costs of electricity' },
                  { key: 'D', text: 'lack of transparency in important decisions' },
                ],
                answer: { accepted: ['C'] },
                explanationHtml: 'Paragraph D lists bias, job losses and lack of transparency, but never mentions electricity costs.',
                locatorParagraph: 'D',
              },
              {
                number: 34,
                promptHtml: "What have some governments and organisations started to do in response to AI's growth?",
                options: [
                  { key: 'A', text: 'ban AI research entirely' },
                  { key: 'B', text: 'draft regulations and ethical guidelines' },
                  { key: 'C', text: 'require all AI to be open source' },
                  { key: 'D', text: 'replace human decision-makers completely' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph E: governments have begun "drafting regulations and ethical guidelines".',
                locatorParagraph: 'E',
              },
            ],
          },
          {
            id: 'p3-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 35, promptHtml: 'Banking systems increasingly use AI for {{q35}} detection.', answer: { accepted: ['fraud'] }, explanationHtml: 'Paragraph C: AI is used for fraud detection.', locatorParagraph: 'C' },
              { number: 36, promptHtml: 'Streaming services rely on AI to {{q36}} content that users might enjoy.', answer: { accepted: ['suggest', 'recommend'] }, explanationHtml: 'Paragraph C: streaming services "suggest content that users might enjoy".', locatorParagraph: 'C' },
              { number: 37, promptHtml: 'In medicine, AI can assist with the {{q37}} of scans and images.', answer: { accepted: ['diagnosis'] }, explanationHtml: 'Paragraph C: AI can assist with the "diagnosis of scans and images".', locatorParagraph: 'C' },
              { number: 38, promptHtml: 'Some companies have created internal {{q38}} boards to help oversee how AI is used.', answer: { accepted: ['ethics'] }, explanationHtml: 'Paragraph E: some companies have established internal "ethics boards".', locatorParagraph: 'E' },
              { number: 39, promptHtml: 'In the future, AI is expected to play a greater role in personalised {{q39}} and healthcare.', answer: { accepted: ['education'] }, explanationHtml: 'Paragraph F: AI is expected to expand into "personalised education and healthcare diagnostics".', locatorParagraph: 'F' },
              { number: 40, promptHtml: 'The passage suggests that improving public {{q40}} will be important as AI becomes more common.', answer: { accepted: ['understanding'] }, explanationHtml: 'Paragraph F: improving public "understanding" (digital literacy) will be important.', locatorParagraph: 'F' },
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
        contextText: 'You will hear a conversation between a new member and a staff member at a fitness centre.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'staff', voice: 'zira', text: 'Good afternoon, welcome to Riverside Fitness Centre. How can I help you today?' },
          { speaker: 'customer', voice: 'david', text: "Hi, I'd like to find out about joining. I'm interested in the evening classes." },
          { speaker: 'staff', voice: 'zira', text: 'No problem. Could I take your full name first, please?' },
          { speaker: 'customer', voice: 'david', text: "Yes, it's Michael Turner. That's T-U-R-N-E-R." },
          { speaker: 'staff', voice: 'zira', text: "Thanks, Michael. And what's the best contact number for you?" },
          { speaker: 'customer', voice: 'david', text: 'You can reach me on oh seven nine one two, double four, six one three eight.' },
          { speaker: 'staff', voice: 'zira', text: 'Great. Now, we have three membership options: Basic, Standard and Premium. The Standard plan includes all group classes and costs thirty-two pounds a month.' },
          { speaker: 'customer', voice: 'david', text: 'That sounds like what I need. Do you offer any discount for students?' },
          { speaker: 'staff', voice: 'zira', text: 'Yes, students get fifteen percent off any plan, so the Standard would come to just over twenty-seven pounds a month.' },
          { speaker: 'customer', voice: 'david', text: "Perfect, I'll take that one." },
          { speaker: 'staff', voice: 'zira', text: 'Lovely. Our evening classes run in the East Studio, on the second floor. The most popular one is called Power Circuit, on Tuesday and Thursday evenings at six thirty.' },
          { speaker: 'customer', voice: 'david', text: 'Six thirty works for me. Is there anything I need to bring on my first visit?' },
          { speaker: 'staff', voice: 'zira', text: 'Just comfortable clothing and a water bottle. We also ask new members to arrive fifteen minutes early to complete a short health questionnaire.' },
          { speaker: 'customer', voice: 'david', text: "That's fine. Oh, and is there parking available?" },
          { speaker: 'staff', voice: 'zira', text: "Yes, there's a car park at the back of the building, but it does get busy, so we'd recommend arriving by six at the latest." },
          { speaker: 'customer', voice: 'david', text: 'Understood, thank you very much.' },
          { speaker: 'staff', voice: 'zira', text: "You're welcome. I'll just need your email address to send over the confirmation and the health form." },
          { speaker: 'customer', voice: 'david', text: "It's michael dot turner, all one word, at mailbox dot com." },
          { speaker: 'staff', voice: 'zira', text: 'Got it. Welcome to Riverside Fitness Centre, Michael!' },
        ],
        questionGroups: [
          {
            id: 'l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Riverside Fitness Centre — New Member Form</strong></p><p>Surname: {{q1}}<br/>Phone number: {{q2}}<br/>Membership plan chosen: {{q3}}<br/>Monthly cost with student discount: £{{q4}}<br/>Class name: {{q5}}<br/>Studio floor: {{q6}}<br/>Class days: {{q7}}<br/>Class time: {{q8}}<br/>Arrive early by: {{q9}} minutes<br/>Email: {{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['Turner', 'Michael Turner'] }, explanationHtml: "The customer spells his surname: T-U-R-N-E-R." },
              { number: 2, answer: { accepted: ['07912446138', '0791 244 6138', '07912 446138', '07912 44 6138'] }, explanationHtml: "The number is read out digit by digit: 07912446138." },
              { number: 3, answer: { accepted: ['Standard'] }, explanationHtml: 'The customer chooses the Standard plan.' },
              { number: 4, answer: { accepted: ['27', '27.00'] }, explanationHtml: 'With the 15% student discount, Standard comes to "just over twenty-seven pounds".' },
              { number: 5, answer: { accepted: ['Power Circuit'] }, explanationHtml: 'The most popular evening class is called Power Circuit.' },
              { number: 6, answer: { accepted: ['second', '2nd'] }, explanationHtml: 'The East Studio is on the second floor.' },
              { number: 7, answer: { accepted: ['Tuesday and Thursday', 'Tuesdays and Thursdays'] }, explanationHtml: 'Power Circuit runs on Tuesday and Thursday evenings.' },
              { number: 8, answer: { accepted: ['6:30', '6.30', 'six thirty'] }, explanationHtml: 'The class time is six thirty.' },
              { number: 9, answer: { accepted: ['15', 'fifteen'] }, explanationHtml: 'New members are asked to arrive fifteen minutes early.' },
              { number: 10, answer: { accepted: ['michael.turner@mailbox.com'] }, explanationHtml: "The customer spells his email as michael dot turner at mailbox dot com." },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a museum audio guide.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'guide', voice: 'zira', text: "Welcome to the Riverton City Museum. As we begin our tour in the Great Hall, you'll notice the building itself dates back to eighteen ninety-two, when it first opened as a public library." },
          { speaker: 'guide', voice: 'zira', text: 'The museum moved into this building permanently in nineteen sixty-seven, and today it houses more than two hundred thousand items across twelve permanent galleries.' },
          { speaker: 'guide', voice: 'zira', text: "To your left is the Natural History gallery, which contains the museum's most popular exhibit: a complete whale skeleton discovered on the local coastline in nineteen thirty-one." },
          { speaker: 'guide', voice: 'zira', text: 'Further along, the Local History gallery focuses on the growth of the textile industry, which shaped this city throughout the nineteenth century.' },
          { speaker: 'guide', voice: 'zira', text: 'Please note that photography without flash is permitted throughout the museum, but tripods are only allowed with prior written permission from the front desk.' },
          { speaker: 'guide', voice: 'zira', text: 'The museum shop, located near the main entrance, is open until five thirty, half an hour after the galleries themselves close.' },
          { speaker: 'guide', voice: 'zira', text: "If you'd like to learn more, free guided tours in addition to this audio guide depart from the entrance hall every day at eleven o'clock and at two o'clock." },
          { speaker: 'guide', voice: 'zira', text: 'For visitors with children, the Discovery Room on the ground floor offers hands-on activities and is included in the standard admission ticket.' },
          { speaker: 'guide', voice: 'zira', text: 'The museum café can be found on the top floor, and it offers a view over the botanical gardens next door.' },
          { speaker: 'guide', voice: 'zira', text: 'Finally, we recommend allowing at least two hours to see the main galleries, though many visitors choose to return more than once, as membership includes unlimited free entry for a full year.' },
        ],
        questionGroups: [
          {
            id: 'l2-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            questions: [
              { number: 11, promptHtml: 'The museum building originally opened in {{q11}} as a public library.', answer: { accepted: ['1892', 'eighteen ninety-two'] }, explanationHtml: 'The guide states the building "dates back to eighteen ninety-two".' },
              { number: 12, promptHtml: 'The museum has occupied the building since {{q12}}.', answer: { accepted: ['1967'] }, explanationHtml: 'The museum "moved into this building permanently in nineteen sixty-seven".' },
              { number: 13, promptHtml: "The museum's most popular exhibit is a complete {{q13}} skeleton.", answer: { accepted: ['whale'] }, explanationHtml: 'The Natural History gallery contains a complete whale skeleton.' },
              { number: 14, promptHtml: 'The whale skeleton was discovered on the coast in {{q14}}.', answer: { accepted: ['1931'] }, explanationHtml: 'The skeleton was "discovered on the local coastline in nineteen thirty-one".' },
              { number: 15, promptHtml: 'The Local History gallery focuses on the {{q15}} industry.', answer: { accepted: ['textile'] }, explanationHtml: 'The Local History gallery focuses on the growth of the textile industry.' },
              { number: 16, promptHtml: '{{q16}} are only allowed in the museum with prior written permission.', answer: { accepted: ['Tripods', 'tripods'] }, explanationHtml: 'Tripods are only allowed with prior written permission from the front desk.' },
              { number: 17, promptHtml: 'The museum shop closes at {{q17}}.', answer: { accepted: ['5:30', '5.30', 'half past five'] }, explanationHtml: 'The shop is open until five thirty.' },
              { number: 18, promptHtml: "Free guided tours depart from the entrance hall at eleven o'clock and at {{q18}}.", answer: { accepted: ['2:00', '2', 'two o\'clock', '2pm'] }, explanationHtml: 'Tours depart at eleven o\'clock and at two o\'clock.' },
              { number: 19, promptHtml: 'The {{q19}} Room offers hands-on activities for children.', answer: { accepted: ['Discovery'] }, explanationHtml: 'The Discovery Room offers hands-on activities for children.' },
              { number: 20, promptHtml: 'The museum café overlooks the {{q20}} gardens next door.', answer: { accepted: ['botanical'] }, explanationHtml: 'The café "offers a view over the botanical gardens next door".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Emma and Josh, discussing plans for a research field trip.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'Emma', voice: 'zira', text: "So for the field trip proposal, I think we need to decide on the site and the equipment first." },
          { speaker: 'Josh', voice: 'david', text: "Right. I've been looking at Redmarsh Wetland and Fenbridge Reserve. Redmarsh is closer, but Fenbridge has more diverse bird species." },
          { speaker: 'Emma', voice: 'zira', text: "True, but Redmarsh also has better path access for the equipment carts, and there's a visitor centre where we could store our gear." },
          { speaker: 'Josh', voice: 'david', text: "Good point. I think for equipment, we'll definitely need waterproof boots and binoculars. A field microscope would be useful too, but it might be too fragile to carry that far." },
          { speaker: 'Emma', voice: 'zira', text: "Agreed, let's leave the microscope behind and take a portable weather station instead, plus a GPS logger to record exact locations." },
          { speaker: 'Josh', voice: 'david', text: "For funding, we could apply to the departmental research grant, or the student union environmental fund." },
          { speaker: 'Emma', voice: 'zira', text: "The student union fund is smaller, but it's much faster to get approved — usually within two weeks. The departmental grant takes over a month." },
          { speaker: 'Josh', voice: 'david', text: "Given our timeline, let's go with the student union fund, and maybe also ask the local wildlife trust for a small equipment loan." },
          { speaker: 'Emma', voice: 'zira', text: "Good idea. Now, in terms of what we'll actually record — species counts and water quality testing seem essential. Soil sampling might be interesting, but it's probably outside our scope this time." },
          { speaker: 'Josh', voice: 'david', text: "Agreed. Let's also think about who to invite — perhaps Dr Patel, since she has experience with wetland ecosystems, and maybe a local ranger who knows the site well." },
          { speaker: 'Emma', voice: 'zira', text: "Yes, both of those would be valuable. I don't think we need anyone from the chemistry department this time." },
          { speaker: 'Josh', voice: 'david', text: "What about transport? We could hire a minibus, or ask if the department can lend us a car. Cycling isn't really practical with all this equipment." },
          { speaker: 'Emma', voice: 'zira', text: "Let's request the departmental car — it's free, whereas the minibus would cost us extra from our small budget." },
          { speaker: 'Josh', voice: 'david', text: "For safety, we should bring a first aid kit and a charged mobile phone. I don't think we need a satellite phone since there's mobile signal at the site." },
          { speaker: 'Emma', voice: 'zira', text: "Agreed. And for storing our data, I'd rather use a shared cloud spreadsheet than paper notebooks, since it's much easier for both of us to update from the field." },
          { speaker: 'Josh', voice: 'david', text: "Sounds good. For presenting our results afterwards, I think a poster would work better than a full written report, since the department is holding a poster session next month anyway." },
          { speaker: 'Josh', voice: 'david', text: "Also, a poster will let us get quick feedback from other students, whereas a written report is only read by the supervisor." },
        ],
        questionGroups: [
          {
            id: 'l3-mc1', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 21, selectCount: 2,
              promptHtml: 'Which TWO features does Redmarsh Wetland have, according to the speakers?',
              options: [{ key: 'A', text: 'more diverse bird species' }, { key: 'B', text: 'easier path access for equipment carts' }, { key: 'C', text: 'a visitor centre for storing gear' }, { key: 'D', text: 'lower travel cost' }, { key: 'E', text: 'a research grant already approved' }],
              answer: { accepted: ['B', 'C'] }, explanationHtml: 'Emma says Redmarsh has better path access and a visitor centre for storing gear.',
            }],
          },
          {
            id: 'l3-mc2', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 22, selectCount: 2,
              promptHtml: 'Which TWO items of equipment do the students decide to take, in addition to boots and binoculars?',
              options: [{ key: 'A', text: 'a field microscope' }, { key: 'B', text: 'a GPS logger' }, { key: 'C', text: 'a satellite phone' }, { key: 'D', text: 'a portable weather station' }, { key: 'E', text: 'a soil sampling kit' }],
              answer: { accepted: ['B', 'D'] }, explanationHtml: 'They agree to take a portable weather station and a GPS logger, leaving the microscope behind.',
            }],
          },
          {
            id: 'l3-mc3', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 23, selectCount: 2,
              promptHtml: 'Which TWO funding sources do Emma and Josh decide to use?',
              options: [{ key: 'A', text: 'departmental research grant' }, { key: 'B', text: 'student union environmental fund' }, { key: 'C', text: 'local wildlife trust equipment loan' }, { key: 'D', text: 'a bank loan' }, { key: 'E', text: 'crowdfunding' }],
              answer: { accepted: ['B', 'C'] }, explanationHtml: 'They choose the student union fund and ask the wildlife trust for an equipment loan.',
            }],
          },
          {
            id: 'l3-mc4', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 24, selectCount: 2,
              promptHtml: 'Which TWO types of data collection do the students consider essential?',
              options: [{ key: 'A', text: 'soil sampling' }, { key: 'B', text: 'species counts' }, { key: 'C', text: 'water quality testing' }, { key: 'D', text: 'air quality testing' }, { key: 'E', text: 'noise level measurement' }],
              answer: { accepted: ['B', 'C'] }, explanationHtml: 'Emma says species counts and water quality testing seem essential.',
            }],
          },
          {
            id: 'l3-mc5', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 25, selectCount: 2,
              promptHtml: 'Which TWO people do the students want to invite to help with the trip?',
              options: [{ key: 'A', text: 'Dr Patel' }, { key: 'B', text: 'a chemistry lecturer' }, { key: 'C', text: 'a local ranger' }, { key: 'D', text: 'the university president' }, { key: 'E', text: 'a journalist' }],
              answer: { accepted: ['A', 'C'] }, explanationHtml: 'Josh suggests Dr Patel and a local ranger.',
            }],
          },
          {
            id: 'l3-mc6', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 26, selectCount: 2,
              promptHtml: 'Which TWO reasons do the students give for choosing the departmental car over a minibus?',
              options: [{ key: 'A', text: 'it seats more people' }, { key: 'B', text: 'it is free to use' }, { key: 'C', text: 'it has GPS built in' }, { key: 'D', text: 'the minibus costs extra from their budget' }, { key: 'E', text: 'the minibus is unavailable' }],
              answer: { accepted: ['B', 'D'] }, explanationHtml: 'Emma says the departmental car is free, while the minibus costs extra from their budget.',
            }],
          },
          {
            id: 'l3-mc7', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 27, selectCount: 2,
              promptHtml: 'Which TWO safety items do the students agree to bring?',
              options: [{ key: 'A', text: 'a satellite phone' }, { key: 'B', text: 'a first aid kit' }, { key: 'C', text: 'a charged mobile phone' }, { key: 'D', text: 'a life jacket' }, { key: 'E', text: 'a fire extinguisher' }],
              answer: { accepted: ['B', 'C'] }, explanationHtml: 'Josh says they should bring a first aid kit and a charged mobile phone.',
            }],
          },
          {
            id: 'l3-mc8', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 28, selectCount: 2,
              promptHtml: 'Which TWO reasons does Emma give for preferring a shared cloud spreadsheet?',
              options: [{ key: 'A', text: 'it is cheaper than notebooks' }, { key: 'B', text: 'it is easier for both students to update' }, { key: 'C', text: 'it works without mobile signal' }, { key: 'D', text: 'it can be accessed from the field' }, { key: 'E', text: 'it automatically analyses the data' }],
              answer: { accepted: ['B', 'D'] }, explanationHtml: "Emma says it's easier for both of them to update from the field.",
            }],
          },
          {
            id: 'l3-mc9', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 29, selectCount: 2,
              promptHtml: 'Which TWO factors influence the choice of a poster over a written report?',
              options: [{ key: 'A', text: 'a poster session is being held next month' }, { key: 'B', text: 'posters allow quick feedback from other students' }, { key: 'C', text: 'written reports are no longer accepted' }, { key: 'D', text: 'posters take less time to prepare' }, { key: 'E', text: 'Josh prefers visual presentations' }],
              answer: { accepted: ['A', 'B'] }, explanationHtml: 'Josh mentions the upcoming poster session and the chance for quick feedback from other students.',
            }],
          },
          {
            id: 'l3-mc10', type: 'multiple_choice_multi',
            instructionHtml: 'Choose TWO letters, A-E.',
            questions: [{
              number: 30, selectCount: 2,
              promptHtml: 'Which TWO methods of transport do the students reject?',
              options: [{ key: 'A', text: 'departmental car' }, { key: 'B', text: 'hired minibus' }, { key: 'C', text: 'cycling' }, { key: 'D', text: 'walking' }, { key: 'E', text: 'train' }],
              answer: { accepted: ['B', 'C'] }, explanationHtml: 'Josh says cycling is impractical, and Emma rejects the minibus because of its extra cost.',
            }],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear a lecture on climate change adaptation strategies.',
        transcriptLines: [
          { speaker: 'lecturer', voice: 'david', text: 'Today I want to move away from climate change mitigation — reducing emissions — and focus instead on adaptation: how communities are already adjusting to changes that can no longer be avoided.' },
          { speaker: 'lecturer', voice: 'david', text: 'One of the clearest examples is coastal flood defence. Many cities are raising sea walls, but a growing number are also restoring natural barriers such as mangrove forests and salt marshes, which absorb wave energy far more cheaply than concrete alone.' },
          { speaker: 'lecturer', voice: 'david', text: 'In agriculture, farmers in drought-prone regions are switching to drought-resistant crop varieties, and many are adopting drip irrigation, a technique that delivers water directly to plant roots and can cut water use by up to sixty percent compared with traditional flood irrigation.' },
          { speaker: 'lecturer', voice: 'david', text: 'Urban areas face a different challenge: extreme heat. Some cities have begun painting rooftops white, a method known as cool roofing, to reflect sunlight and reduce indoor temperatures without needing extra air conditioning.' },
          { speaker: 'lecturer', voice: 'david', text: 'Water scarcity is being tackled through greywater recycling, where water from sinks and showers is treated and reused for purposes such as toilet flushing or garden irrigation, easing pressure on limited freshwater supplies.' },
          { speaker: 'lecturer', voice: 'david', text: 'In mountainous regions, changing snowmelt patterns threaten local water supplies, so some communities are building small-scale reservoirs, sometimes called ice stupas, that freeze overnight and release water gradually as they melt through the dry season.' },
          { speaker: 'lecturer', voice: 'david', text: "Insurance is another important tool. Several governments are now offering what's called parametric insurance, which pays out automatically once a measurable trigger, such as rainfall dropping below a set level, is recorded, speeding up support after a disaster." },
          { speaker: 'lecturer', voice: 'david', text: 'Early warning systems, using satellite data and mobile phone alerts, have dramatically reduced casualties during cyclones and floods in several countries by giving residents more time to evacuate.' },
          { speaker: 'lecturer', voice: 'david', text: "On a larger scale, some cities are redesigning drainage using what's called a sponge city approach, incorporating permeable pavements and green spaces that absorb heavy rainfall instead of letting it overwhelm the sewer system." },
          { speaker: 'lecturer', voice: 'david', text: "Finally, adaptation isn't just physical — education plays a role too, and many local governments now run community workshops to help residents understand their own specific climate risks and the practical steps they can take at home." },
        ],
        questionGroups: [
          {
            id: 'l4-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            questions: [
              { number: 31, promptHtml: 'Which natural barrier, alongside salt marshes, is being restored for coastal flood defence?', answer: { accepted: ['mangrove forests', 'mangroves'] }, explanationHtml: 'The lecturer mentions restoring "mangrove forests and salt marshes".' },
              { number: 32, promptHtml: 'What irrigation technique can cut water use by up to sixty percent?', answer: { accepted: ['drip irrigation'] }, explanationHtml: 'Drip irrigation delivers water directly to plant roots.' },
              { number: 33, promptHtml: 'What is the name given to the method of painting rooftops white to reduce heat?', answer: { accepted: ['cool roofing', 'cool roofs'] }, explanationHtml: 'This method is called "cool roofing".' },
              { number: 34, promptHtml: 'What kind of water is reused for toilet flushing and garden irrigation under greywater recycling?', answer: { accepted: ['greywater', 'grey water'] }, explanationHtml: 'Greywater recycling reuses water from sinks and showers.' },
              { number: 35, promptHtml: 'What are the small-scale frozen water reservoirs in mountainous regions sometimes called?', answer: { accepted: ['ice stupas'] }, explanationHtml: 'These reservoirs are "sometimes called ice stupas".' },
              { number: 36, promptHtml: 'What type of insurance pays out automatically once a measurable trigger is recorded?', answer: { accepted: ['parametric insurance', 'parametric'] }, explanationHtml: 'This is called "parametric insurance".' },
              { number: 37, promptHtml: 'What kind of data, alongside mobile phone alerts, do early warning systems use?', answer: { accepted: ['satellite data'] }, explanationHtml: 'Early warning systems use "satellite data and mobile phone alerts".' },
              { number: 38, promptHtml: 'What is the name of the drainage approach that uses permeable pavements and green spaces?', answer: { accepted: ['sponge city', 'sponge city approach'] }, explanationHtml: 'This is called the "sponge city approach".' },
              { number: 39, promptHtml: 'What do local governments run to help residents understand their own climate risks?', answer: { accepted: ['community workshops', 'workshops'] }, explanationHtml: 'Local governments run "community workshops".' },
              { number: 40, promptHtml: "According to the lecturer, what is today's talk mainly about, instead of emission reduction?", answer: { accepted: ['adaptation', 'climate change adaptation'] }, explanationHtml: 'The lecturer says the talk will "focus instead on adaptation".' },
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
        '<p>The chart below shows the preferred mode of transport for commuting to work in four different cities.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Preferred mode of transport for commuting, by city',
        unit: '%',
        categories: ['City A', 'City B', 'City C', 'City D'],
        xAxisLabel: 'City',
        yAxisLabel: 'Percentage (%)',
        series: [
          { name: 'Car', data: [45, 60, 30, 20] },
          { name: 'Public transport', data: [40, 25, 50, 35] },
          { name: 'Bicycle/walking', data: [15, 15, 20, 45] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>In many countries, young people now spend several hours a day using social media platforms.</p><p>Some people believe this has a positive effect on society, while others believe it causes more harm than good.</p><p>Discuss both these views and give your own opinion.</p>',
    },
  },
};
