// Original IELTS-style practice content (NOT copied from any real Cambridge/IELTS
// book — see TZ-vocably-v2.md old-TZ BUG-021: reusing real Cambridge material as
// branded content is a copyright risk, so all four Vocably Practice Tests are
// written from scratch). `transcriptLines` are a TTS synthesis script (speaker +
// voice + text) consumed by scripts/tts/synthesize-listening.mjs; the final
// `transcript` string field on ListeningPart is derived from it automatically by
// scripts/seed-practice-tests.mjs, not authored here.

export default {
  slug: 'vocably-practice-test-2',
  title: 'Vocably Practice Test 2',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The Development of Photography',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          {
            label: 'A',
            html: '<p>Long before a photograph could be fixed permanently onto a surface, inventors had understood the basic principle behind the camera: light passing through a small hole projects an inverted image onto the opposite wall of a darkened box. This device, known as the camera obscura, had been used for centuries by artists as a drawing aid, and by the eighteenth century portable versions fitted with lenses and mirrors were common tools in the studios of professional painters. The real breakthrough came in the 1820s, when the French inventor Joseph Nicéphore Niépce succeeded in capturing an image that did not fade when exposed to light, using a light-sensitive form of bitumen coated onto a pewter plate. His method required an exposure of roughly eight hours, making it impractical for anything other than perfectly still scenes, but it proved that a permanent photographic record was possible, and it set off a race among inventors across Europe to find a faster, more practical alternative.</p>',
          },
          {
            label: 'B',
            html: '<p>Niépce\'s work was later refined by his business partner, Louis Daguerre, who announced a much faster and sharper process in 1839, reducing the required exposure time from hours to just a few minutes. The daguerreotype, as it became known, produced a single, highly detailed image on a silvered copper plate, with a level of fine detail that early viewers frequently described as almost unbelievable compared with the paintings and engravings they were used to. Because there was no negative, each daguerreotype was entirely unique; if a customer wanted a copy, the entire process had to be repeated, and the sitter had to remain still for the full exposure once again. Despite this drawback, the daguerreotype\'s remarkable clarity made it hugely popular with portrait studios, which sprang up in every major city within a few years of its introduction, offering ordinary members of the public a chance to own a lifelike image of themselves for the first time in history.</p>',
          },
          {
            label: 'C',
            html: '<p>A rival approach was developed in England by William Henry Fox Talbot, who had been experimenting privately with light-sensitive paper for several years before Daguerre\'s announcement forced him to publish his own findings earlier than planned. Rather than fixing an image directly, Talbot\'s calotype process produced a translucent negative, from which any number of positive prints could subsequently be made on paper, a crucial difference that Daguerre\'s method could never match. Although the resulting prints were initially less sharp than a daguerreotype and had a slightly grainy texture from the paper fibres, the ability to reproduce an image cheaply and repeatedly meant that Talbot\'s negative-positive principle, rather than Daguerre\'s single-plate method, became the foundation of photography for the next century and a half.</p>',
          },
          {
            label: 'D',
            html: '<p>For several decades, photography remained the preserve of professionals and dedicated enthusiasts, largely because it involved coating glass plates with chemicals shortly before each exposure and developing them again almost immediately afterwards, a process that required a portable darkroom for anyone working outside a studio. This changed in 1888, when the American company Kodak introduced a camera pre-loaded with a roll of flexible film, sold under the slogan "You press the button, we do the rest." Customers could take a hundred photographs, then send the entire camera back to the factory for processing, and it would be returned to them along with the printed photographs and a freshly loaded roll of film. Roll film transformed photography into a mass hobby, since it no longer demanded any specialist chemical knowledge from the person taking the picture, opening the activity up to millions of amateur photographers within a single generation.</p>',
          },
          {
            label: 'E',
            html: '<p>The final major shift occurred in the closing decades of the twentieth century, as electronic sensors gradually replaced chemical film. Early digital cameras, built around charge-coupled devices, or CCDs, converted light directly into an electrical signal that could be stored, edited and transmitted without any need for a darkroom, and without the delay and expense of waiting for film to be developed. Within about twenty years, digital sensors had become cheap and capable enough to be built into mobile telephones, so that the majority of photographs taken today are captured on a device that its owner primarily uses for something else entirely. The market for traditional film collapsed almost entirely as a result, bringing to a close an era that had begun with Niépce\'s eight-hour exposure nearly two centuries earlier.</p>',
          },
        ],
        questionGroups: [
          {
            id: 't2-p1-matchinfo',
            type: 'matching_information',
            instructionHtml:
              'Reading Passage 1 has five paragraphs, A-E. Which paragraph contains the following information? <em>Choose the correct letter, A-E.</em>',
            bankReusable: true,
            questions: [
              { number: 1, promptHtml: 'a reference to the first photographic image that did not fade', answer: { accepted: ['A'] }, explanationHtml: "Paragraph A describes Niépce's image, which \"did not fade when exposed to light\".", locatorParagraph: 'A' },
              { number: 2, promptHtml: 'a mention of a company that made photography accessible to ordinary people', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D describes Kodak turning photography into "a mass hobby".', locatorParagraph: 'D' },
              { number: 3, promptHtml: 'a description of a process that allowed many copies to be produced from a single image', answer: { accepted: ['C'] }, explanationHtml: "Paragraph C explains Talbot's negative, from which \"any number of positive prints\" could be made.", locatorParagraph: 'C' },
              { number: 4, promptHtml: 'a comparison between a chemical method and an electronic method of capturing images', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E contrasts chemical film with electronic sensors.', locatorParagraph: 'E' },
              { number: 5, promptHtml: 'a reason why an early photographic method was especially attractive to professional studios', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B links the daguerreotype\'s clarity to its popularity with portrait studios.', locatorParagraph: 'B' },
            ],
          },
          {
            id: 't2-p1-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 6,
                promptHtml: 'What was a major limitation of the daguerreotype?',
                options: [
                  { key: 'A', text: 'It required an eight-hour exposure' },
                  { key: 'B', text: 'It could not easily be copied' },
                  { key: 'C', text: 'It faded within a few years' },
                  { key: 'D', text: 'It could only be used outdoors' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph B: "there was no negative, each daguerreotype was entirely unique".',
                locatorParagraph: 'B',
              },
              {
                number: 7,
                promptHtml: "What was the key advantage of Talbot's calotype process?",
                options: [
                  { key: 'A', text: 'It produced a sharper image than the daguerreotype from the start' },
                  { key: 'B', text: 'It removed the need for a camera' },
                  { key: 'C', text: 'It allowed multiple prints to be made from one negative' },
                  { key: 'D', text: 'It worked without any light' },
                ],
                answer: { accepted: ['C'] },
                explanationHtml: 'Paragraph C: prints could be made "repeatedly" from Talbot\'s negative.',
                locatorParagraph: 'C',
              },
              {
                number: 8,
                promptHtml: 'Why did roll film change photography so significantly?',
                options: [
                  { key: 'A', text: 'It made cameras completely free of charge' },
                  { key: 'B', text: 'It allowed people without chemical knowledge to take many photographs' },
                  { key: 'C', text: 'It made the camera obscura obsolete' },
                  { key: 'D', text: 'It produced colour images for the first time' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph D: roll film "no longer demanded any specialist chemical knowledge".',
                locatorParagraph: 'D',
              },
            ],
          },
          {
            id: 't2-p1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            questions: [
              { number: 9, promptHtml: "Niépce's first permanent image needed roughly eight {{q9}} of exposure to light.", answer: { accepted: ['hours'] }, explanationHtml: 'Paragraph A: "an exposure of roughly eight hours".', locatorParagraph: 'A' },
              { number: 10, promptHtml: 'Because it had no negative, each daguerreotype produced only a single, unrepeatable {{q10}}.', answer: { accepted: ['image'] }, explanationHtml: 'Paragraph B: "a single, highly detailed image".', locatorParagraph: 'B' },
              { number: 11, promptHtml: "Talbot's process relied on a translucent {{q11}} from which prints could be made.", answer: { accepted: ['negative'] }, explanationHtml: "Paragraph C: Talbot's calotype \"produced a translucent negative\".", locatorParagraph: 'C' },
              { number: 12, promptHtml: 'The introduction of roll {{q12}} allowed ordinary people to take photographs without chemical expertise.', answer: { accepted: ['film'] }, explanationHtml: 'Paragraph D: "a roll of flexible film".', locatorParagraph: 'D' },
              { number: 13, promptHtml: 'Modern cameras capture images using electronic {{q13}} rather than chemical film.', answer: { accepted: ['sensors'] }, explanationHtml: 'Paragraph E: "electronic sensors gradually replaced chemical film".', locatorParagraph: 'E' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'Migratory Birds',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          {
            label: 'A',
            html: '<p>Every year, billions of birds undertake journeys that can cover thousands of kilometres, moving between breeding grounds and wintering areas in a pattern known as migration. Although migration has been studied for over a century, several aspects of the behaviour remain only partly understood by researchers, particularly why certain populations of the same species migrate while others do not, even when they breed in the same region and face broadly similar conditions. The scale of these journeys varies enormously: some species travel only a few hundred kilometres, adjusting their range only slightly with the seasons, while the Arctic tern completes an annual round trip of more than seventy thousand kilometres, the longest migration known in the animal kingdom, effectively spending its life chasing summer between the two poles.</p>',
          },
          {
            label: 'B',
            html: '<p>Migration is generally triggered by environmental cues rather than a single fixed calendar date. Changes in day length appear to be the primary signal for many species, since this reliably indicates the changing of the seasons regardless of local weather conditions, which can vary considerably from one year to the next in a way that would make a purely weather-based trigger unreliable. Falling temperatures and dwindling food supplies act as secondary cues, often determining the precise week in which a population departs even when the underlying decision to migrate has already been set by day length, and birds held in captivity under artificial lighting conditions have been shown to display restless behaviour at exactly the time their wild counterparts would normally begin their journey.</p>',
          },
          {
            label: 'C',
            html: "<p>How birds find their way across such vast distances has puzzled scientists for decades, and no single explanation applies to every species. Many birds appear to sense the Earth's magnetic field, effectively carrying an internal compass, though the precise biological mechanism behind this ability is still debated, with candidate explanations ranging from light-sensitive proteins in the eye to tiny magnetic particles in the beak. Others rely on the position of the sun during the day or the pattern of stars at night, and some combine these methods with a memorised map of visual landmarks such as coastlines, rivers and mountain ranges encountered on previous journeys, suggesting that at least some species genuinely learn and remember specific routes rather than relying purely on an innate sense of direction.</p>",
          },
          {
            label: 'D',
            html: '<p>Migratory journeys expose birds to considerable danger. Severe storms can blow flocks hundreds of kilometres off course, exhausting their fat reserves before they reach land, and exhausted birds that come down in unsuitable habitat, such as open ocean or desert, often do not survive. Predators take advantage of the fact that migrating birds are often flying through unfamiliar territory where they have not learned to recognise local threats. In recent decades, human activity has introduced new hazards: artificial light from cities can disorient night-flying birds, leading to fatal collisions with illuminated buildings, while wind turbines and communication towers pose additional risks along established flight paths that have been used, largely unchanged, for thousands of years.</p>',
          },
          {
            label: 'E',
            html: '<p>Modern tracking technology has transformed the study of migration. Lightweight GPS tags, small enough to be carried by birds weighing only a few grams, transmit precise location data over an entire migratory route, revealing stopover sites that were previously unknown, including several that turned out to host a large fraction of an entire species\' global population for a few critical weeks each year. This information has fed directly into international conservation agreements, since a wetland used briefly by a migrating species may be just as critical to its survival as its main breeding ground, even though the birds are present for only a few weeks each year, a finding that has forced conservation planners to think in terms of entire migratory networks rather than isolated protected areas.</p>',
          },
        ],
        questionGroups: [
          {
            id: 't2-p2-yng',
            // VOCABLY-TZ.md §2.2 auditi — "'Migratory Birds' faktik matn... Faktik
            // ma'lumot uchun TRUE/FALSE/NOT GIVEN kerak, muallif fikri uchun
            // YES/NO/NOT GIVEN." Bu passage sof faktik/tavsifiy (migratsiya
            // sabablari, navigatsiya, xavflar, kuzatuv texnologiyasi) — "muallif
            // da'vosi" emas, shuning uchun YNG emas, TFNG to'g'ri tur.
            type: 'true_false_notgiven',
            instructionHtml:
              'Do the following statements agree with the information given in the passage?<br/><strong>TRUE</strong> if the statement agrees with the information<br/><strong>FALSE</strong> if the statement contradicts the information<br/><strong>NOT GIVEN</strong> if there is no information on this',
            questions: [
              { number: 14, promptHtml: 'Migration behaviour is now completely understood by scientists.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph A: several aspects "remain only partly understood".', locatorParagraph: 'A' },
              { number: 15, promptHtml: 'The Arctic tern travels a shorter distance than most other migratory birds.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph A describes its migration as "the longest migration known in the animal kingdom".', locatorParagraph: 'A' },
              { number: 16, promptHtml: 'Every migratory species uses exactly the same navigational method.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph C: "no single explanation applies to every species".', locatorParagraph: 'C' },
              { number: 17, promptHtml: 'Artificial lighting can create difficulties for birds migrating at night.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph D: "artificial light from cities can disorient night-flying birds".', locatorParagraph: 'D' },
              { number: 18, promptHtml: 'Most migratory species prefer to travel exclusively during the night.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage never states a general preference for night travel.' },
              { number: 19, promptHtml: 'International conservation agreements have had no effect on protecting migratory birds.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph E: tracking data "has fed directly into international conservation agreements".', locatorParagraph: 'E' },
            ],
          },
          {
            id: 't2-p2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Migratory Birds — Notes</strong></p><p>Main trigger for migration: change in {{q20}} length</p><p>Navigation methods: Earth\'s {{q21}} field; position of the {{q22}}; memorised {{q23}}</p><p>Main dangers: severe {{q24}}; predators; {{q25}} with buildings caused by artificial light</p><p>Modern research tool: lightweight {{q26}} tags</p>',
            questions: [
              { number: 20, answer: { accepted: ['day'] }, explanationHtml: 'Paragraph B: "changes in day length".', locatorParagraph: 'B' },
              { number: 21, answer: { accepted: ['magnetic'] }, explanationHtml: "Paragraph C: \"sense the Earth's magnetic field\".", locatorParagraph: 'C' },
              { number: 22, answer: { accepted: ['sun'] }, explanationHtml: 'Paragraph C: "the position of the sun during the day".', locatorParagraph: 'C' },
              { number: 23, answer: { accepted: ['landmarks'] }, explanationHtml: 'Paragraph C: "a memorised map of visual landmarks".', locatorParagraph: 'C' },
              { number: 24, answer: { accepted: ['storms'] }, explanationHtml: 'Paragraph D: "severe storms can blow flocks hundreds of kilometres off course".', locatorParagraph: 'D' },
              { number: 25, answer: { accepted: ['collisions'] }, explanationHtml: 'Paragraph D: "fatal collisions with illuminated buildings".', locatorParagraph: 'D' },
              { number: 26, answer: { accepted: ['gps'] }, explanationHtml: 'Paragraph E: "lightweight GPS tags".', locatorParagraph: 'E' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Behavioural Economics and Marketing',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: '<p>Traditional economic models are built on the assumption that consumers behave rationally, gathering all relevant information and choosing the option that maximises their own benefit. Over the past few decades, however, the field of behavioural economics has shown that real decision-making relies heavily on mental shortcuts, and that these shortcuts can be predictably influenced, often without the shopper realising that their judgement has been shaped at all. Marketers have been quick to apply these findings, embedding subtle psychological techniques into pricing, packaging and advertising, sometimes with the help of dedicated behavioural science consultants employed specifically for this purpose.</p>' },
          { label: 'B', html: '<p>One of the best-documented shortcuts is anchoring, in which an initial piece of information disproportionately affects later judgements, even when the person making the judgement is consciously aware that the initial figure is arbitrary or irrelevant. A shopper who first sees a jacket priced at three hundred dollars, for example, will judge a subsequent price of one hundred and fifty dollars to be a bargain, even if that second figure is still more than the jacket is actually worth. Retailers exploit this by displaying a high "original" price alongside a discounted one, anchoring the customer\'s expectations before the real price is even revealed, a practice that has drawn regulatory scrutiny in some countries where the "original" price was never genuinely charged.</p>' },
          { label: 'C', html: '<p>A second, closely related principle is loss aversion: people feel the pain of losing something roughly twice as strongly as they feel the pleasure of gaining an equivalent amount, a finding that has been replicated across many different cultures and types of decision. This asymmetry explains the enduring popularity of limited-time offers and phrases such as "only three left in stock", which reframe an ordinary purchase decision as an opportunity to avoid a loss rather than simply to make a gain, creating a sense of urgency that a plain, unlimited offer would never produce.</p>' },
          { label: 'D', html: '<p>Social proof is a third widely used technique, based on the observation that people look to the behaviour of others when they are uncertain how to act themselves, particularly when the decision involves some risk or unfamiliar territory. Displaying star ratings, customer review counts or a label reading "our best-selling item" all serve to reassure a hesitant buyer that a large number of other people have already made, and presumably not regretted, the same choice, effectively substituting the crowd\'s judgement for research the individual buyer has not had time to do themselves.</p>' },
          { label: 'E', html: '<p>A more subtle strategy is the decoy effect, which involves introducing a third option purely to make one of the original two appear more attractive by comparison, rather than because anyone is expected to actually choose the decoy itself. A well-known example comes from subscription pricing: a company might offer a cheap digital-only plan, an expensive print-and-digital plan priced almost the same as digital-only, and a print-only plan priced close to the combined option. The print-only plan is rarely chosen, but its presence makes the combined plan look like outstanding value, quietly steering customers towards the more profitable option without any need for an explicit recommendation.</p>' },
          { label: 'F', html: '<p>Not everyone is comfortable with the growing sophistication of these techniques. Supporters describe them as gentle "nudges" that simply make good choices easier without restricting anyone\'s freedom, pointing to applications such as encouraging healthier food choices in a cafeteria simply by changing where items are placed. Critics argue that some applications, particularly those aimed at children or exploiting anxiety about missing out, cross the line from persuasion into manipulation, since they work precisely by bypassing careful conscious judgement rather than appealing to it. This disagreement has prompted several countries to consider stricter regulation of online pricing and advertising practices.</p>' },
        ],
        questionGroups: [
          {
            id: 't2-p3-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p>Unlike traditional economic models, which assume complete {{q27}}, behavioural economics recognises that consumers rely on mental shortcuts. One such shortcut is {{q28}}, in which an initial number affects how a later price is judged. Marketers also make use of loss {{q29}}, since people fear losing something more than they value an equivalent gain, which explains the appeal of limited-time offers. Another common technique is social {{q30}}, in which evidence of other customers\' choices encourages a purchase. The {{q31}} effect works by adding a third, unattractive option that makes a particular choice seem better value. Critics argue that some of these methods amount to {{q32}} rather than a helpful nudge.</p>',
            questions: [
              { number: 27, answer: { accepted: ['rationality'] }, explanationHtml: 'Paragraph A: consumers are assumed to "behave rationally".', locatorParagraph: 'A' },
              { number: 28, answer: { accepted: ['anchoring'] }, explanationHtml: 'Paragraph B names this shortcut "anchoring".', locatorParagraph: 'B' },
              { number: 29, answer: { accepted: ['aversion'] }, explanationHtml: 'Paragraph C: "loss aversion".', locatorParagraph: 'C' },
              { number: 30, answer: { accepted: ['proof'] }, explanationHtml: 'Paragraph D: "social proof".', locatorParagraph: 'D' },
              { number: 31, answer: { accepted: ['decoy'] }, explanationHtml: 'Paragraph E: "the decoy effect".', locatorParagraph: 'E' },
              { number: 32, answer: { accepted: ['manipulation'] }, explanationHtml: 'Paragraph F: critics say some techniques "cross the line from persuasion into manipulation".', locatorParagraph: 'F' },
            ],
          },
          {
            id: 't2-p3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B, C or D.',
            questions: [
              {
                number: 33,
                promptHtml: 'What is the main claim of behavioural economics, according to the passage?',
                options: [
                  { key: 'A', text: 'Consumers always make fully rational choices' },
                  { key: 'B', text: 'Psychological shortcuts predictably influence economic decisions' },
                  { key: 'C', text: 'Marketing has no real effect on consumer behaviour' },
                  { key: 'D', text: 'Prices are determined only by supply and demand' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph A: real decision-making "relies heavily on mental shortcuts... predictably influenced".',
                locatorParagraph: 'A',
              },
              {
                number: 34,
                promptHtml: 'Why is loss aversion useful to marketers?',
                options: [
                  { key: 'A', text: 'It makes products permanently cheaper' },
                  { key: 'B', text: 'It makes customers more sensitive to missing out than to gaining' },
                  { key: 'C', text: 'It removes the need for any advertising' },
                  { key: 'D', text: 'It guarantees a customer will return' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph C: people "feel the pain of losing something roughly twice as strongly" as gaining.',
                locatorParagraph: 'C',
              },
              {
                number: 35,
                promptHtml: 'What is the purpose of the decoy option in the subscription-pricing example?',
                options: [
                  { key: 'A', text: 'To offer genuinely more choice for its own sake' },
                  { key: 'B', text: 'To reduce the cost of every plan' },
                  { key: 'C', text: 'To make a particular plan look like better value by comparison' },
                  { key: 'D', text: 'To remove the cheapest plan from sale' },
                ],
                answer: { accepted: ['C'] },
                explanationHtml: 'Paragraph E: the decoy "makes the combined plan look like outstanding value".',
                locatorParagraph: 'E',
              },
              {
                number: 36,
                promptHtml: 'What concern do critics raise about these marketing techniques?',
                options: [
                  { key: 'A', text: 'They are too costly for companies to use' },
                  { key: 'B', text: 'They may amount to manipulation rather than helpful guidance' },
                  { key: 'C', text: 'They work only in the technology industry' },
                  { key: 'D', text: 'They have already been banned everywhere' },
                ],
                answer: { accepted: ['B'] },
                explanationHtml: 'Paragraph F: critics say some applications "cross the line from persuasion into manipulation".',
                locatorParagraph: 'F',
              },
            ],
          },
          {
            id: 't2-p3-matchinfo',
            type: 'matching_information',
            instructionHtml:
              'Reading Passage 3 has six paragraphs, A-F. Which paragraph contains the following information? <em>Choose the correct letter, A-F.</em>',
            bankReusable: true,
            questions: [
              { number: 37, promptHtml: 'an example of how displaying customer reviews can influence a purchase', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D discusses star ratings and review counts.', locatorParagraph: 'D' },
              { number: 38, promptHtml: 'a description of a technique based on comparing an early piece of information with what follows', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph B describes anchoring.', locatorParagraph: 'B' },
              { number: 39, promptHtml: 'a mention of disagreement over whether certain marketing methods are ethical', answer: { accepted: ['F'] }, explanationHtml: 'Paragraph F contrasts supporters and critics of these techniques.', locatorParagraph: 'F' },
              { number: 40, promptHtml: 'an example involving three different pricing plans', answer: { accepted: ['E'] }, explanationHtml: 'Paragraph E describes the three-plan subscription example.', locatorParagraph: 'E' },
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
        contextText: 'You will hear a conversation between a woman who wants to enrol in an evening language course and a college receptionist.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good afternoon, Riverside Community College, how can I help you?" },
          { speaker: 'B', voice: 'david', text: "Hi, I'd like to find out about your evening Spanish classes, please." },
          { speaker: 'A', voice: 'zira', text: "Of course. Could I take your full name first?" },
          { speaker: 'B', voice: 'david', text: "Yes, it's Martin Osei. That's O-S-E-I." },
          { speaker: 'A', voice: 'zira', text: "Thanks, Martin. And have you studied Spanish before, or would this be your beginner level?" },
          { speaker: 'B', voice: 'david', text: "Complete beginner, I'm afraid." },
          { speaker: 'A', voice: 'zira', text: "That's fine, most people start there. We run beginner classes on two different days — would you prefer Tuesday or Thursday evenings?" },
          { speaker: 'B', voice: 'david', text: "Tuesday works better for me." },
          { speaker: 'A', voice: 'zira', text: "Great. The Tuesday group meets from seven until nine in the evening." },
          { speaker: 'B', voice: 'david', text: "Perfect. How long does the course run for in total?" },
          { speaker: 'A', voice: 'zira', text: "It's ten weeks altogether, one session a week." },
          { speaker: 'B', voice: 'david', text: "And what's the fee for the whole course?" },
          { speaker: 'A', voice: 'zira', text: "It's one hundred and thirty pounds, which includes the course textbook." },
          { speaker: 'B', voice: 'david', text: "That sounds reasonable. Can I ask how many students are usually in a class?" },
          { speaker: 'A', voice: 'zira', text: "We keep it small — a maximum of fourteen students, so there's plenty of speaking practice." },
          { speaker: 'B', voice: 'david', text: "Good. Can I give you a contact number in case anything changes?" },
          { speaker: 'A', voice: 'zira', text: "Please do." },
          { speaker: 'B', voice: 'david', text: "It's oh-seven-nine-one-one, two-two-three-three-four-four." },
          { speaker: 'A', voice: 'zira', text: "Got it. And finally, the next group starts on the third of March, so please arrive fifteen minutes early on the first evening to complete your registration." },
          { speaker: 'B', voice: 'david', text: "Will do. Thank you very much for your help." },
        ],
        questionGroups: [
          {
            id: 't2-l1-form',
            type: 'form_completion',
            instructionHtml: 'Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Evening Spanish Course — Enrolment</strong></p><p>Name: {{q1}}<br/>Level: {{q2}}<br/>Preferred day: {{q3}}<br/>Class time: {{q4}} pm to 9 pm<br/>Course length: {{q5}} weeks<br/>Course fee: £{{q6}}<br/>Maximum class size: {{q7}} students<br/>Contact number: {{q8}}<br/>Course start date: {{q9}} March<br/>Arrive {{q10}} minutes early on the first evening</p>',
            questions: [
              { number: 1, answer: { accepted: ['martin osei'] }, explanationHtml: 'The caller gives his name as "Martin Osei".' },
              { number: 2, answer: { accepted: ['beginner', 'complete beginner'] }, explanationHtml: 'He says "complete beginner".' },
              { number: 3, answer: { accepted: ['tuesday'] }, explanationHtml: '"Tuesday works better for me."' },
              { number: 4, answer: { accepted: ['7', 'seven'] }, explanationHtml: 'The Tuesday group meets "from seven until nine".' },
              { number: 5, answer: { accepted: ['10', 'ten'] }, explanationHtml: '"It\'s ten weeks altogether."' },
              { number: 6, answer: { accepted: ['130', 'one hundred and thirty'] }, explanationHtml: 'The fee is "one hundred and thirty pounds".' },
              { number: 7, answer: { accepted: ['14', 'fourteen'] }, explanationHtml: '"a maximum of fourteen students".' },
              { number: 8, answer: { accepted: ['07911223344'] }, explanationHtml: 'The caller reads out the number "oh-seven-nine-one-one, two-two-three-three-four-four".' },
              { number: 9, answer: { accepted: ['3rd', 'third', '3'] }, explanationHtml: '"the next group starts on the third of March".' },
              { number: 10, answer: { accepted: ['15', 'fifteen'] }, explanationHtml: '"arrive fifteen minutes early".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear an announcement about the Riverside Community Festival.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Good morning, everyone, and thank you for tuning in for details of this year's Riverside Community Festival, running over the last weekend of the month." },
          { speaker: 'A', voice: 'zira', text: "Things get underway on Friday with a Farmers Market, starting at nine in the morning down at Riverside Park." },
          { speaker: 'A', voice: 'zira', text: "On Saturday, the main event is our Jazz Concert, which begins at two in the afternoon in the Main Square." },
          { speaker: 'A', voice: 'zira', text: "Also on Saturday, at one o'clock, there's a Cooking Demonstration taking place at the Food Court, just behind the market stalls." },
          { speaker: 'A', voice: 'zira', text: "Sunday morning kicks off with our popular Fun Run, starting at eight o'clock from Bridge Street." },
          { speaker: 'A', voice: 'zira', text: "And the whole festival finishes on Sunday evening with a Closing Ceremony at six o'clock, back at Riverside Park, where the market began." },
          { speaker: 'A', voice: 'zira', text: "Full details and free tickets are available from the town hall, and we hope to see you there." },
        ],
        questionGroups: [
          {
            id: 't2-l2-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            stemHtml:
              '<table style="border-collapse:collapse;width:100%"><thead><tr><th style="border:1px solid #999;padding:4px 8px">Day</th><th style="border:1px solid #999;padding:4px 8px">Event</th><th style="border:1px solid #999;padding:4px 8px">Time</th><th style="border:1px solid #999;padding:4px 8px">Venue</th></tr></thead><tbody>' +
              '<tr><td style="border:1px solid #999;padding:4px 8px">Friday</td><td style="border:1px solid #999;padding:4px 8px">Farmers {{q11}}</td><td style="border:1px solid #999;padding:4px 8px">9 am</td><td style="border:1px solid #999;padding:4px 8px">{{q12}}</td></tr>' +
              '<tr><td style="border:1px solid #999;padding:4px 8px">Saturday</td><td style="border:1px solid #999;padding:4px 8px">{{q13}} Concert</td><td style="border:1px solid #999;padding:4px 8px">{{q14}}</td><td style="border:1px solid #999;padding:4px 8px">Main Square</td></tr>' +
              '<tr><td style="border:1px solid #999;padding:4px 8px">Saturday</td><td style="border:1px solid #999;padding:4px 8px">Cooking {{q15}}</td><td style="border:1px solid #999;padding:4px 8px">1 pm</td><td style="border:1px solid #999;padding:4px 8px">{{q16}}</td></tr>' +
              '<tr><td style="border:1px solid #999;padding:4px 8px">Sunday</td><td style="border:1px solid #999;padding:4px 8px">{{q17}} Run</td><td style="border:1px solid #999;padding:4px 8px">8 am</td><td style="border:1px solid #999;padding:4px 8px">{{q18}}</td></tr>' +
              '<tr><td style="border:1px solid #999;padding:4px 8px">Sunday</td><td style="border:1px solid #999;padding:4px 8px">Closing {{q19}}</td><td style="border:1px solid #999;padding:4px 8px">{{q20}}</td><td style="border:1px solid #999;padding:4px 8px">Riverside Park</td></tr>' +
              '</tbody></table>',
            questions: [
              { number: 11, answer: { accepted: ['market'] }, explanationHtml: '"a Farmers Market".' },
              { number: 12, answer: { accepted: ['riverside park'] }, explanationHtml: 'The market is "down at Riverside Park".' },
              { number: 13, answer: { accepted: ['jazz'] }, explanationHtml: '"our Jazz Concert".' },
              { number: 14, answer: { accepted: ['2 pm', '2pm', 'two'] }, explanationHtml: '"begins at two in the afternoon".' },
              { number: 15, answer: { accepted: ['demonstration'] }, explanationHtml: '"a Cooking Demonstration".' },
              { number: 16, answer: { accepted: ['food court'] }, explanationHtml: 'It takes place "at the Food Court".' },
              { number: 17, answer: { accepted: ['fun'] }, explanationHtml: '"our popular Fun Run".' },
              { number: 18, answer: { accepted: ['bridge street'] }, explanationHtml: 'It starts "from Bridge Street".' },
              { number: 19, answer: { accepted: ['ceremony'] }, explanationHtml: '"a Closing Ceremony".' },
              { number: 20, answer: { accepted: ['6', 'six', '6 pm'] }, explanationHtml: '"at six o\'clock".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two students, Priya and Jack, discussing a group presentation with their supervisor, Dr Evans.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'C', voice: 'zira', text: "So, Priya and Jack, tell me how the presentation planning is going." },
          { speaker: 'A', voice: 'zira', text: "We've picked our topic, but we're still deciding on the exact focus. We think we're going to struggle with two things: finding recent enough data, and keeping the whole thing under fifteen minutes." },
          { speaker: 'B', voice: 'david', text: "Yeah, there's just so much material out there, it's hard to know what to cut." },
          { speaker: 'C', voice: 'zira', text: "That's a very common problem. What sources are you planning to use?" },
          { speaker: 'A', voice: 'zira', text: "We're planning to use two main sources: the department's own research database, and a couple of recent industry reports." },
          { speaker: 'B', voice: 'david', text: "We did think about interviewing someone, but we probably won't have time." },
          { speaker: 'C', voice: 'zira', text: "Fair enough. How are you dividing the work between you, Priya?" },
          { speaker: 'A', voice: 'zira', text: "I'll be responsible for the introduction and for building the slides." },
          { speaker: 'B', voice: 'david', text: "And I'll handle the data analysis and the conclusion." },
          { speaker: 'C', voice: 'zira', text: "Sounds sensible. My feedback, then, would be two things: first, narrow your topic down to one clear question rather than trying to cover everything, and second, rehearse out loud at least once before the real thing, because timing always slips otherwise." },
          { speaker: 'A', voice: 'zira', text: "That's really helpful, thank you." },
          { speaker: 'B', voice: 'david', text: "Yes, we'll do both of those." },
        ],
        questionGroups: [
          {
            id: 't2-l3-multi1',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-D.',
            questions: [
              {
                number: 21,
                promptHtml: 'Which TWO problems does the pair expect to have with their presentation?',
                options: [
                  { key: 'A', text: 'Finding recent enough data' },
                  { key: 'B', text: 'Booking a room' },
                  { key: 'C', text: 'Keeping within the time limit' },
                  { key: 'D', text: 'Getting permission from their supervisor' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'Priya mentions "finding recent enough data" and "keeping the whole thing under fifteen minutes".',
              },
            ],
          },
          {
            id: 't2-l3-multi2',
            type: 'multiple_choice_multi',
            instructionHtml: 'Choose <strong>TWO</strong> letters, A-D.',
            questions: [
              {
                number: 22,
                promptHtml: 'Which TWO sources will the students use?',
                options: [
                  { key: 'A', text: "The department's research database" },
                  { key: 'B', text: 'A personal interview' },
                  { key: 'C', text: 'Industry reports' },
                  { key: 'D', text: 'A textbook' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'They plan to use "the department\'s own research database" and "a couple of recent industry reports".',
              },
            ],
          },
          {
            id: 't2-l3-multi3',
            type: 'multiple_choice_multi',
            instructionHtml: "Choose <strong>TWO</strong> letters, A-D, describing Dr Evans's feedback.",
            questions: [
              {
                number: 23,
                promptHtml: "Which TWO pieces of advice does Dr Evans give?",
                options: [
                  { key: 'A', text: 'Narrow the topic to one clear question' },
                  { key: 'B', text: 'Use more visual aids' },
                  { key: 'C', text: 'Rehearse out loud before the presentation' },
                  { key: 'D', text: 'Ask another student to join the group' },
                ],
                selectCount: 2,
                answer: { accepted: ['A', 'C'] },
                explanationHtml: 'Dr Evans advises narrowing the topic and rehearsing out loud beforehand.',
              },
            ],
          },
          {
            id: 't2-l3-features',
            type: 'matching_features',
            // VOCABLY-TZ.md §2.2 auditi — bir xil sabab bilan (q. test-1'dagi
            // izoh): "Write" -> "Choose" + reused-letter NB eslatmasi.
            instructionHtml:
              'Who will be responsible for each task? <em>Choose the correct letter, A or B.</em><br/><strong>NB</strong> You may use any letter more than once.',
            bank: [
              { key: 'A', text: 'Priya' },
              { key: 'B', text: 'Jack' },
            ],
            bankReusable: true,
            questions: [
              { number: 24, promptHtml: 'the introduction', answer: { accepted: ['A'] }, explanationHtml: 'Priya says "I\'ll be responsible for the introduction".' },
              { number: 25, promptHtml: 'building the slides', answer: { accepted: ['A'] }, explanationHtml: 'Priya says she will build "the slides".' },
              { number: 26, promptHtml: 'the data analysis', answer: { accepted: ['B'] }, explanationHtml: "Jack says \"I'll handle the data analysis\"." },
              { number: 27, promptHtml: 'the conclusion', answer: { accepted: ['B'] }, explanationHtml: 'Jack says he will handle "the conclusion" too.' },
            ],
          },
          {
            id: 't2-l3-short',
            type: 'short_answer',
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.',
            wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
            questions: [
              { number: 28, promptHtml: 'What is the maximum length the presentation should be?', answer: { accepted: ['fifteen minutes', '15 minutes'] }, explanationHtml: '"under fifteen minutes".' },
              { number: 29, promptHtml: "What did the students consider doing but probably will not have time for?", answer: { accepted: ['interviewing someone', 'an interview'] }, explanationHtml: '"We did think about interviewing someone."' },
              { number: 30, promptHtml: 'According to Dr Evans, what always slips if students do not rehearse?', answer: { accepted: ['timing', 'the timing'] }, explanationHtml: '"timing always slips otherwise".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear a lecture on ocean currents.',
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning. Today I want to talk about ocean currents, the great rivers of water that circulate through our oceans and quietly shape the climate of the entire planet." },
          { speaker: 'A', voice: 'david', text: "Ocean currents are driven by three main forces. The first is wind, which drags the surface layer of the ocean along with it. The second is differences in water density, caused by variation in temperature and salinity — colder, saltier water is denser and sinks, pulling surface water in to replace it. The third factor is the rotation of the Earth, which bends moving water into large circular patterns called gyres." },
          { speaker: 'A', voice: 'david', text: "Perhaps the most famous current is the Gulf Stream, which carries warm water from the Caribbean up the eastern coast of North America and across the Atlantic towards Western Europe. Without it, winters in countries like the United Kingdom would be considerably colder, since the Gulf Stream transfers an enormous amount of heat into the atmosphere along its route." },
          { speaker: 'A', voice: 'david', text: "Ocean currents also play a critical role in the carbon cycle. As surface water sinks in polar regions, it carries dissolved carbon dioxide down into the deep ocean, where it can remain trapped for centuries. This process, sometimes called the ocean's biological pump, removes a significant proportion of the carbon dioxide that would otherwise stay in the atmosphere." },
          { speaker: 'A', voice: 'david', text: "Scientists are increasingly concerned that melting polar ice could disrupt this entire system. Large amounts of fresh water entering the ocean reduce its salinity, which in turn reduces its density, potentially slowing the sinking process that drives deep currents. A significant slowdown could, over time, alter weather patterns across the whole of the Northern Hemisphere." },
          { speaker: 'A', voice: 'david', text: "To finish, I'll mention that current monitoring today relies heavily on a global network of floating sensors, which drift with the currents and regularly transmit data on temperature, salinity and depth back to research centres by satellite." },
        ],
        questionGroups: [
          {
            id: 't2-l4-summary',
            type: 'summary_completion',
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p>Ocean currents are driven by {{q31}}, by differences in water density, and by the {{q32}} of the Earth, which bends currents into circular patterns called gyres. The Gulf Stream carries {{q33}} water from the Caribbean towards Western Europe, keeping winters there milder. Currents also affect the {{q34}} cycle: sinking water in polar regions carries dissolved carbon dioxide into the deep ocean, a process known as the biological {{q35}}. Melting polar {{q36}} adds fresh water to the ocean, reducing its {{q37}}, which may slow the sinking process. This could eventually change {{q38}} patterns across the Northern Hemisphere. Currents are now monitored using a network of floating {{q39}} that transmit data by {{q40}}.</p>',
            questions: [
              { number: 31, answer: { accepted: ['wind'] }, explanationHtml: '"The first is wind".' },
              { number: 32, answer: { accepted: ['rotation'] }, explanationHtml: '"the rotation of the Earth".' },
              { number: 33, answer: { accepted: ['warm'] }, explanationHtml: '"carries warm water from the Caribbean".' },
              { number: 34, answer: { accepted: ['carbon'] }, explanationHtml: 'The lecture mentions "the carbon cycle".' },
              { number: 35, answer: { accepted: ['pump'] }, explanationHtml: '"the ocean\'s biological pump".' },
              { number: 36, answer: { accepted: ['ice'] }, explanationHtml: '"melting polar ice".' },
              { number: 37, answer: { accepted: ['salinity'] }, explanationHtml: 'Fresh water "reduces its salinity".' },
              { number: 38, answer: { accepted: ['weather'] }, explanationHtml: '"alter weather patterns".' },
              { number: 39, answer: { accepted: ['sensors'] }, explanationHtml: '"a global network of floating sensors".' },
              { number: 40, answer: { accepted: ['satellite'] }, explanationHtml: 'Data is transmitted "by satellite".' },
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
        '<p>The graph below shows the percentage of total energy consumption that came from renewable sources in three countries between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'line',
        title: 'Renewable energy as a share of total energy consumption, 2000-2020',
        unit: '%',
        categories: ['2000', '2005', '2010', '2015', '2020'],
        xAxisLabel: 'Year',
        yAxisLabel: 'Percentage (%)',
        series: [
          { name: 'Country A', data: [4, 9, 18, 29, 42] },
          { name: 'Country B', data: [8, 12, 17, 22, 27] },
          { name: 'Country C', data: [2, 3, 5, 9, 15] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>In many parts of the world, cities are growing at an unprecedented rate as more people move from rural areas in search of work and opportunity.</p><p>What problems does rapid urbanisation cause, and what measures could be taken to address them?</p>',
    },
  },
};
