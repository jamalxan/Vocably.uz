// Vakolatli imtihon kontenti. Asl "full-8" mock github.com/jamalxan/Everest-Mock
// backend/content.py'dan portlangan (AI/demo kontent). To'g'ri javoblar FAQAT shu
// serverda — `publicMock()` ularni olib tashlab qaytaradi, clientga hech qachon
// yuborilmaydi.
//
// 2026-09-10 — Cambridge IELTS 15 (Academic, Test 1) qo'shildi (`cambridge-15-t1`).
// Foydalanuvchi shaxsan yuklagan kitobning skanerlangan sahifalaridan (matn qatlami
// yo'q edi) qo'lda transkripsiya qilingan — passage/savol matnlari, audioscript va
// javoblar kaliti rasmiy nashrdan so'zma-so'z. MUHIM: bu HUQUQIY XAVFNI o'z ichiga
// oladi (mualliflik huquqi bilan himoyalangan kontent) — foydalanuvchi buni bila
// turib, ongli ravishda tanlagan (memory/ papkasiga o'zi yuklagan kitob).
//
// DIQQAT — haqiqiy audio fayl YO'Q ("full-8"da ham, Cambridge testida ham):
// `audioUrl` Everest-Mock'ning o'z CDN'iga ishora qiladi, bu yerda yuklanmagan.
// Cambridge test uchun buning o'rniga `transcript` maydoni bor — mock/[id]/page.jsx
// shuni brauzer TTS (speakText()) orqali o'qiydi, shunda haqiqiy audio bo'lmasa ham
// tinglash mashqi mazmunli bo'ladi.
//
// Kelgusida ko'proq mock qo'shish uchun: shu MOCKS obyektiga (va MOCK_LIST'ga) yangi
// kalit qo'shish kifoya — qolgan hamma narsa (getMock/answerKey/publicMock/dvigatel)
// generic.

export const SECTION_DURATIONS: Record<string, number> = {
  listening: 30 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
};

export const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking'] as const;

type Question = {
  id: string;
  // 'mcq' — variantlardan birini tanlash (shu jumladan TFNG va harf-moslashtirish
  // savollari ham shu turdan foydalanadi, chunki ular ham "ro'yxatdan bitta tanlash").
  // 'gap' — matn kiritish (note/table/summary completion) — Cambridge IELTS 15'dan
  // import qilingan haqiqiy testlar uchun qo'shilgan (2026-09-10).
  type: 'mcq' | 'gap';
  text: string;
  options?: string[];
  correct?: number | string;
  // Faqat 'gap' uchun — bir nechta to'g'ri variant qabul qilinadi (masalan "10" va "ten"),
  // solishtirish lib/textCompare.js'dagi normalizeForCompare orqali (katta-kichik harf,
  // apostrof farqiga sezgir emas).
  acceptable?: string[];
};

type Mock = {
  id: string;
  title: string;
  type: string;
  exam_type: string;
  sections: {
    // `transcript` — ixtiyoriy: haqiqiy Cambridge testlarida audio fayl yo'qligi
    // sababli brauzer TTS orqali o'qib berish uchun (speakText()) — mavjud bo'lsa,
    // client shuni ishlatadi; bo'lmasa eski "audio fayl yo'q" ogohlantirishi qoladi.
    listening: { audioLabel: string; audioUrl: string; transcript?: string; questions: Question[] };
    reading: { passageTitle: string; passage: string; questions: Question[] };
    // `chart` — TZ-vocably-v2.md §C3 F-W1 (BUG-014): Task 1 matni "The chart below
    // shows..." deydi, lekin grafikning o'zi yo'q edi. Endi shu struktura ma'lumoti
    // src/lib/chartSvg.js#renderChartSvg orqali chizib ko'rsatiladi (mock/[id]/page.jsx).
    writing: {
      task1: string;
      task2: string;
      chart?: {
        chartType: 'bar' | 'line' | 'pie' | 'table';
        title: string;
        unit?: string;
        categories: string[];
        series: { name: string; data: number[] }[];
      };
    };
    speaking: { parts: { id: string; label: string; question: string }[] };
  };
};

export const MOCKS: Record<string, Mock> = {
  'full-8': {
    id: 'full-8',
    title: 'Full Mock #8',
    type: 'Academic',
    exam_type: 'ielts_academic',
    sections: {
      listening: {
        audioLabel: 'Section 1 — A conversation about a community center membership',
        audioUrl: '/audio/full-8/listening.mp3',
        // BUG-012 interim tuzatish — bu mock'da avval `transcript` umuman yo'q edi
        // (faqat mavjud bo'lmagan `audioUrl`), shuning uchun Play tugmasi hech narsa
        // qilmasdi. Endi brauzer TTS shu matnni o'qiydi — barcha savollarga javob
        // matnda mavjud.
        transcript:
          "Welcome to the Riverside Community Center. Let me tell you about our opening hours and membership options. The center is open from seven in the morning until nine p.m. on weekdays, and from nine a.m. until six p.m. on weekends. For membership, we offer a few different plans. The standard annual membership fee for adults is sixty dollars, which gives you full access to the gym, the library, and most classes. Please note that our swimming pool is closed every Monday for routine maintenance and cleaning, but it's open every other day of the week. As a member, you can borrow up to five items from our library at any one time, including books, magazines, and DVDs. If you have any other questions about the facilities, feel free to ask at the front desk.",
        questions: [
          { id: 'l1', type: 'mcq', text: 'The community center is open until ______ on weekdays.', options: ['8 pm', '9 pm', '10 pm', '11 pm'], correct: 1 },
          { id: 'l2', type: 'mcq', text: 'The annual membership fee for adults is ______.', options: ['$40', '$50', '$60', '$75'], correct: 2 },
          { id: 'l3', type: 'mcq', text: 'The swimming pool is closed on ______.', options: ['Monday', 'Wednesday', 'Friday', 'Sunday'], correct: 0 },
          { id: 'l4', type: 'mcq', text: 'Members can borrow up to ______ items from the library.', options: ['three', 'four', 'five', 'six'], correct: 2 },
        ],
      },
      reading: {
        passageTitle: 'The Architecture of Termite Mounds',
        passage:
          'Termite mounds are among the most remarkable structures built by any non-human species. Despite being constructed by insects only a few millimetres long, these towers can reach heights of several metres and remain standing for decades. The internal architecture of a mound is a sophisticated ventilation system. As the colony metabolises, it generates heat and carbon dioxide, which must be removed to keep conditions stable for the millions of termites within.\n\nScientists once believed that mounds worked like chimneys, with warm air rising and escaping through a hole at the top. However, more recent research has shown that many mounds are in fact closed at the top. Instead, the structure relies on daily temperature swings between day and night. During the day, the outer walls heat up, driving air upward through the outer channels; at night the process reverses. This oscillating flow gradually flushes stale air out and draws fresh air in, without any single permanent opening.\n\nEngineers have begun to study these structures for inspiration. Buildings modelled on termite ventilation can maintain comfortable internal temperatures while using a fraction of the energy required by conventional air conditioning. The principle is elegantly simple: rather than fighting the external climate, the design works with the natural rhythm of heating and cooling.',
        questions: [
          { id: 'r1', type: 'mcq', text: "What is the main function of a termite mound's internal architecture?", options: ['Storing food', 'Ventilation and temperature control', 'Protection from predators', 'Water collection'], correct: 1 },
          { id: 'r2', type: 'mcq', text: 'What did scientists originally believe about how mounds worked?', options: ['They worked like chimneys', 'They were solid throughout', 'They stored cold air underground', 'They had no airflow'], correct: 0 },
          { id: 'r3', type: 'mcq', text: 'According to recent research, many mounds are:', options: ['open at the top', 'closed at the top', 'open at the base', 'made of metal'], correct: 1 },
          { id: 'r4', type: 'mcq', text: 'What drives the airflow in many mounds?', options: ['Wind only', 'A fan system', 'Daily temperature swings', 'Rainfall'], correct: 2 },
          { id: 'r5', type: 'mcq', text: 'Why are engineers interested in termite mounds?', options: ['For decoration', 'For energy-efficient ventilation ideas', 'To study insects', 'To build taller towers'], correct: 1 },
        ],
      },
      writing: {
        // BUG-014 parentetik eslatmasi: asl matnda "EVEREST centers" (boshqa loyihaning
        // nomi, portlash paytida qolib ketgan) bor edi — olib tashlandi.
        task1: 'The chart below shows the number of students who took an IELTS mock exam over a six-month period. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
        task2: 'Some people believe that practising under exam conditions is the best way to prepare for a test, while others think that relaxed, untimed study is more effective. Discuss both views and give your own opinion. Write at least 250 words.',
        chart: {
          chartType: 'bar',
          title: 'Number of students taking the mock exam (Jan–Jun)',
          unit: 'students',
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          series: [{ name: 'Students', data: [120, 145, 160, 150, 190, 210] }],
        },
      },
      speaking: {
        parts: [
          { id: 's1', label: 'Part 1 — Introduction', question: "Let's talk about your hometown. Where are you from, and what do you like most about it?" },
          { id: 's2', label: 'Part 2 — Cue card', question: 'Describe a goal you worked hard to achieve. You should say: what it was, how you prepared, what difficulties you faced, and how you felt when you achieved it.' },
          { id: 's3', label: 'Part 3 — Discussion', question: 'Do you think setting ambitious goals is always a good idea? Why or why not?' },
        ],
      },
    },
  },

  // Cambridge IELTS 15 Academic, Test 1 — memory/Cambridge-Practice-Test-For-IELTS-15-Academic.pdf'dan
  // qo'lda transkripsiya qilingan (fayl qatlami yo'q skanerlangan nusxa edi). Har bir
  // passage/section (Reading 1-3, Listening Part 1-4) o'z ichida alohida ajratib
  // ko'rsatilgan — 2026-09-10 so'rovi.
  'cambridge-15-t1': {
    id: 'cambridge-15-t1',
    title: 'Cambridge IELTS 15 — Test 1',
    type: 'Academic',
    exam_type: 'ielts_academic',
    sections: {
      listening: {
        audioLabel: "4 qism, 40 savol — haqiqiy audio fayl yo'q, brauzer TTS orqali audioscript o'qiladi.",
        audioUrl: '',
        transcript:
          "PART 1\n\nAMBER: Hello William. This is Amber — you said to phone if I wanted to get more information about the job agency you mentioned. Is now a good time?\nWILLIAM: Oh, hi Amber. Yes, fine. So the agency I was talking about is called Bankside — they're based in Docklands — I can tell you the address now — 497 Eastside.\nAMBER: OK, thanks. So is there anyone in particular I should speak to there?\nWILLIAM: The agent I always deal with is called Becky Jameson.\nAMBER: Let me write that down — Becky ...\nWILLIAM: Jameson. J-A-M-E-S-O-N.\nAMBER: Do you have her direct line?\nWILLIAM: Yes, it's in my contacts somewhere — right, here we are: 078 double 6, 519 triple 3. I wouldn't call her until the afternoon if I were you — she's always really busy in the morning trying to fill last-minute vacancies. She's really helpful and friendly so I'm sure it would be worth getting in touch with her for an informal chat.\nAMBER: It's mainly clerical and admin jobs they deal with, isn't it?\nWILLIAM: That's right. You're hoping to find a full-time job in the media eventually — but Becky mostly recruits temporary staff for the finance sector — which will look good on your CV — and generally short-term.\nAMBER: Yeah — I'm just a bit worried because I don't have much office experience.\nWILLIAM: I wouldn't worry. They'll probably start you as a receptionist, or something like that. So there's plenty of scope for finding a job which suits your skills, or knowing lots of different computer systems — it's communication that really matters — so you'd be fine there. And you'll pick up office skills quickly on the job. It's not that complicated.\nAMBER: OK good. So how long do people generally need temporary staff for? It would be good if I could get something lasting at least a month.\nWILLIAM: That shouldn't be too difficult. But you're more likely to be offered something for a week at first, which might get extended. It's unusual to be sent somewhere for just a day or two.\nAMBER: Right, I've heard the pay isn't too bad — better than working in a shop or a restaurant.\nWILLIAM: Oh yes — definitely. The hourly rate is about £10, 11 if you're lucky.\nAMBER: That's pretty good. I was only expecting to get eight or nine pounds an hour.\n\nDo you want me to tell you anything about the registration process?\nWILLIAM: Yes, please. I know you have to have an interview.\nAMBER: The interview usually takes about an hour and you should arrange that about a week in advance.\nWILLIAM: I suppose I should dress smartly if it's for office work — I can probably borrow a suit from Mum.\nAMBER: Good idea. It's better to look too smart than too casual.\nWILLIAM: Will I need to bring copies of my exam certificates or anything like that?\nAMBER: No — they don't need to see those, I don't think.\nWILLIAM: What about my passport?\nAMBER: Oh yes — they'll ask to see that.\nWILLIAM: OK.\nAMBER: I wouldn't get stressed about the interview though. It's just a chance for them to build a relationship with you — so they can try and match you to a job which you'll like. So there aren't questions about personality as such — but they always ask candidates — fairly basic ones. And they probably won't ask anything too difficult like what your plans are for the future.\nWILLIAM: Hope not.\nAMBER: Anyway, there are lots of benefits to using an agency — for example, the interview will be useful because they'll give you feedback on your performance so you can improve next time.\nWILLIAM: Hope not.\nAMBER: And they'll have access to jobs which aren't advertised.\nWILLIAM: Exactly — most temporary jobs aren't advertised.\nAMBER: And I expect finding a temporary job this way takes a lot less time — it's much easier than ringing up individual companies.\nWILLIAM: Yes indeed. Well I think ...\n\nPART 2\n\nGood morning. My name's Erica Matthews, and I'm the owner of Matthews Island Holidays, a company set up by my parents. Thank you for coming to this presentation, in which I hope to interest you in what we have to offer. We're a small, family-run company, and we believe in the importance of the personal touch, so we don't aim to compete with other companies on the number of customers. What we do is build on our many years' experience — more than almost any other rail holiday company — to ensure we provide perfect holidays in a small number of destinations, which we've got to know extremely well.\n\nI'll start with our six-day Isle of Man holiday. This is a fascinating island in the Irish Sea, with Wales to the south, England to the east, and Scotland to the north and Northern Ireland to the west. Our holiday starts in Heysham, where your tour manager will meet you, then you'll travel by ferry to the Isle of Man. Some people prefer to fly from Luton instead, and another popular option is to take a coach to Liverpool and take a ferry from there.\n\nYou have five nights in the hotel, and the price covers five breakfasts and dinners, and lunch on the three days when there are organised trips: day four is free, and most people have lunch in a café or restaurant in Douglas.\n\nThe price of the holiday includes the ferry to the island, all travel on the island, all meals I've mentioned. Incidentally, we try to make everything as simple, fair and easy as possible, so unlike with many companies, the price is the same whether you book six months in advance or at the last minute, and there's no supplement for single rooms in hotels. If you make a booking then need to change the start date, for example because of illness, you're welcome to change to an alternative date or a different tour, for a small administration fee.\n\nOK, so what does the holiday consist of? Well, on day one you'll arrive in time for a short introduction by your tour manager, followed by dinner in the hotel. The dining room looks out at the river, close to where it flows into the harbour, and there's usually plenty of activity going on.\n\nOn day two you'll take the coach to the small town of Peel, on the way calling in at the Tynwald Exhibition. The Isle of Man isn't part of the United Kingdom, and it has its own parliament, called Tynwald. It's claimed that this is the world's oldest parliament that's functioning, and it dates back to 979. However, the earliest surviving reference to it is from 1422, so perhaps it isn't quite as old as it claims!\n\nDay three we have a trip to the mountain Snaefell. This begins with a leisurely ride along the promenade in Douglas in a horse-drawn tram. Then you board an electric train which takes you to the fishing village of Laxey. From there it's an eight-kilometre ride in the Snaefell Mountain Railway to the top, giving you spectacular views of the island.\n\nDay four is free for you to explore, using the pass which we'll give you. So you won't have to pay for travel on local transport, or for entrance to the island's heritage sites. Or you might just want to take it easy in Douglas and perhaps do a little light shopping.\n\nThe last full day, day five, is for some people the highlight of the holiday, with a ride on the steam railway, from Douglas to Port Erin. After some time to explore, a coach will take you to the headland that overlooks the Calf of Man, a small island just off the coast. After some time there you continue to Castletown, which used to be the capital of the Isle of Man, and its medieval castle.\n\nAnd on day six it's back to the ferry — or the airport, if you flew to the island — and time to go home.\n\nNow I'd like to tell you ...\n\nPART 3\n\nRUTH: Ed, how are you getting on with the reading for our presentation next week?\nED: Well, OK, Ruth — but there's so much of it.\nRUTH: I know, I hadn't realised birth order was such a popular area of research.\nED: But the stuff on birth order and personality is mostly unreliable. From what I've been reading a lot of the claims about how your position in the family determines certain personality traits are just stereotypes, with no robust evidence to support them.\nRUTH: OK, but that's an interesting point — we could start by outlining what previous research has shown. There are studies going back over a hundred years.\nED: Yeah — so we could just run through some of the typical traits. Like the consensus seems to be that oldest children are generally less well-adjusted because they never get the arrival of a younger sibling.\nRUTH: Right, put on a positive note, some studies claimed that they were thought to be good at nurturing — certainly in the past when people had large families and would have been expected to look after the younger ones.\nED: There isn't such a clear picture for middle children — but one trait that a lot of the studies mention is that they are easier to get on with than older or younger siblings.\nRUTH: What the problem with most of these studies, do you think?\nED: I think it was because in a lot of cases data was collected from only one family member, they were only very informally interviewed, and the sample size was often quite small.\nRUTH: Some of the old research into the relationship between birth order and academic achievement has been proved to be accurate though. It's about intelligence tests being slightly higher for the eldest child to his or her younger siblings. This has been proved in lots of recent studies.\nED: Although what many of them didn't take into consideration was family size. The more siblings there are, the lower likelihood there is of large families having older and younger children who have equal access to educational resources — this can also account for differences between siblings in academic performance.\nRUTH: The oldest boy might be given more opportunities than his younger sisters, for example.\nED: Exactly.\nRUTH: But the reason for the marginally higher academic performance of oldest children is puzzling, I think. It's not only that they benefit intellectually from extra attention at a young age — which it would have expected. It's that they benefit from being teachers for their younger siblings, by verbalising processes.\nED: Right, and this gives them status and confidence, which again contribute, in a small way, to better performance.\nRUTH: So would you say sibling rivalry has been a useful thing for you?\nED: I think so — my younger sister was incredibly annoying and we fought a lot but I think this has made me a stronger person. I know I've defined myself against my sister — I've had to put up with a lot of jealousy and most of the time she was co-existed amicably enough.\nRUTH: Yes, my situation was very similar. But I don't think having two older brothers made me any less sociable — I was never prepared to let my brothers use any of my stuff.\nED: That's perfectly normal ...\n\nWhat the problem with most of these studies do you think?\nED: There was one on personality, which said that it was likely to be quite sibling because they were very often too tired to depend on for support.\nRUTH: My cousins were like that when they were small and found it hard press to engage with other kids. They often had a lot of independence from their parents.\nED: Only children can have a really hard press to fight for their own advantage — trained by children who were fewer and had access to their share.\nRUTH: That does seem a bit harsh. One category I hadn't considered before was children with an older sibling — some studies mentioned that these children grow up more quickly, and are expected to do basic things for themselves — like getting dressed.\nRUTH: I can see how that might be true — although I expect they're sometimes the exact opposite — playing the baby role and clamouring for special treatment.\n\nWhat the problem with most of these studies, do you think?\nED: I think it was because in a lot of cases data was collected from only one family member, they were only very informally interviewed and the sample size was often quite small.\nRUTH: Mmm. Some of the old research into the relationship between birth order and academic achievement has been proved to be accurate though. It's about intelligence tests being slightly higher for the eldest child than for younger siblings. This has been proved in lots of recent studies.\nED: The oldest child might be given more opportunities than his younger sisters, for example.\nRUTH: But the reason for the marginally higher academic performance of oldest children is puzzling, I think. It's not only that they benefit intellectually from extra attention at a young age — which it would have expected. It's that they benefit from being teachers for their younger siblings, by verbalising processes.\n\nSo would you say sibling rivalry has been a useful thing for you?\nED: I think so — my younger brother was incredibly annoying and we fought a lot but I think this has made me a stronger person. I know I've defined myself against my sister — I've had to put up with a lot of jealousy and most of the time she was co-existed amicably enough.\nRUTH: Yes, my situation was very similar. But I don't think having two older brothers made me any less sociable — I was never prepared to let my brothers use any of my stuff.\nED: That's perfectly normal, whereas ...\n\nPART 4\n\nToday I'm going to talk about the eucalyptus tree. This is a very common tree in Australia, where it's also sometimes called the gum tree. First I'm going to talk about why it's important, then I'm going to be describing some problems it faces at present.\n\nRight, well the eucalyptus tree is an important tree for lots of reasons. For example, it gives shelter to creatures like birds and bats, and these and other species also depend on it for food, particularly the nectar from its flowers. It supports biodiversity. It's useful to us humans too, because we can kill germs with a disinfectant made from oil extracted from eucalyptus leaves.\n\nThe eucalyptus grows all over Australia and the trees can live for up to four hundred years. But it's alarming that all across the country, numbers of eucalyptus are falling because the trees are dying off prematurely. So what are the reasons for this?\n\nOne possible reason is disease. As far back as the 1970s the trees started getting a disease called Mundulla Yellows. The trees' leaves would gradually turn yellow, then the tree would die. It wasn't until 2000 that they found the cause of the problem was lime, or calcium hydroxide to give it its proper chemical name, which was being used in the construction of roads. The lime was being washed away into the ground and affecting the roots of the eucalyptus trees nearby. What it was doing was preventing the trees from sucking up the iron they needed for healthy growth. When this was injected back into the affected trees, they immediately recovered.\n\nBut this problem only affected a relatively small number of trees. By 2000, huge numbers of eucalyptus trees were dying along Australia's East Coast, and a disease known as the Bell-miner Associated Die-back is now thought to be common in these areas, in particular where populations of bell-miners. Again it's the leaves of the trees that are affected. What happens is that insects settle on the leaves and eat their way round, causing the tree to become sick, as they do so, they secrete a solution which has sugar in it, and this is much liked by possible pest, they feed exclusively on it, they eat the same insects that would otherwise eat the leaves. So these insects and birds thrive at the expense of other species, and eventually the tree dies.\n\nBut experts say that trees can start looking sick before any sign of Bell-miner Associated Die-back. So it looks as if the problem might have another explanation. Possibility is that it's to do with the frequency of bushfires that we have in Australia region affect region. A theory proposed over 40 years ago by ecologist William Jackson is that the frequency of bushfires in a particular region affects the type of vegetation that grows there. If there are very frequent bushfires in a region, this encourages grass to grow afterwards, while if the fires are rather less frequent, this results in growth of eucalyptus forests.\n\nSo why is this? Why do fairly frequent bushfires actually support the growth of eucalyptus? Well, one reason is that fire stops the growth of other species which would consume water needed by eucalyptus trees. And there's another reason. If these quick-growing species of bushes and plants are allowed to proliferate, they harm the eucalyptus in another way, by affecting the composition of the soil, and removing nutrients from it. So some bushfires are essential for eucalyptus to survive as long as they are not too frequent. In fact there's evidence that Australia's indigenous people practised regular burning of bush land for thousands of years before the arrival of the Europeans.\n\nBut since Europeans arrived on the continent, the number of bushfires has been strictly controlled. Now scientists believe that this reduced frequency of bushfires to low levels has led to what's known as 'dry rainforest', which seems an odd name as usually we associate tropical rainforest with wet conditions. And what's special about this type of rainforest? Well, unlike tropical rainforest which is a rich ecosystem, this type of ecosystem is usually a simple one. It has thick, dense vegetation, but not many varieties of species. The vegetation provides lots of shade, so one species that does find it ideal in the undergrowth there. Again that's not helpful for the eucalyptus tree.",
        questions: [
          { id: 'c1-l1', type: 'gap', text: "Bankside Recruitment Agency — Name of agent: Becky ______ (surname)", correct: 'Jameson' },
          { id: 'c1-l2', type: 'gap', text: 'Best to call her in the ______ (time of day).', correct: 'afternoon' },
          { id: 'c1-l3', type: 'gap', text: 'Typical jobs: must have good ______ skills.', correct: 'communication' },
          { id: 'c1-l4', type: 'gap', text: 'Jobs are usually for at least a ______.', correct: 'week' },
          { id: 'c1-l5', type: 'gap', text: 'Pay is usually £______ per hour.', correct: '10', acceptable: ['ten'] },
          { id: 'c1-l6', type: 'gap', text: 'Registration: wear a ______ to the interview.', correct: 'suit' },
          { id: 'c1-l7', type: 'gap', text: 'Must bring your ______ to the interview.', correct: 'passport' },
          { id: 'c1-l8', type: 'gap', text: "They will ask questions about each applicant's ______.", correct: 'personality' },
          { id: 'c1-l9', type: 'gap', text: 'Advantages of using an agency: the ______ you receive at interview will benefit you.', correct: 'feedback' },
          { id: 'c1-l10', type: 'gap', text: 'Less ______ is involved in applying for jobs.', correct: 'time' },
          {
            id: 'c1-l11',
            type: 'mcq',
            text: 'Matthews Island Holidays — According to the speaker, the company',
            options: ['has been in business for longer than most of its competitors.', 'arranges holidays to more destinations than its competitors.', 'has more customers than its competitors.'],
            correct: 0,
          },
          {
            id: 'c1-l12',
            type: 'mcq',
            text: 'Where can customers meet the tour manager before travelling to the Isle of Man?',
            options: ['Liverpool', 'Heysham', 'Luton'],
            correct: 1,
          },
          {
            id: 'c1-l13',
            type: 'mcq',
            text: 'How many lunches are included in the price of the holiday?',
            options: ['three', 'four', 'five'],
            correct: 0,
          },
          {
            id: 'c1-l14',
            type: 'mcq',
            text: 'Customers have to pay extra for',
            options: ['guaranteeing themselves a larger room.', 'booking at short notice.', 'transferring to another date.'],
            correct: 2,
          },
          { id: 'c1-l15', type: 'gap', text: 'Timetable — Day 1: hotel dining room has view of the ______.', correct: 'river' },
          { id: 'c1-l16', type: 'gap', text: 'Day 2: Tynwald may have been founded by ______, not 979.', correct: '1422' },
          { id: 'c1-l17', type: 'gap', text: 'Day 3: train to Laxey; train to the ______ of Snaefell.', correct: 'top' },
          { id: 'c1-l18', type: 'gap', text: 'Day 4 (free day): company provides a ______ for local transport and heritage sites.', correct: 'pass' },
          { id: 'c1-l19', type: 'gap', text: 'Day 5: take the ______ railway train from Douglas to Port Erin.', correct: 'steam' },
          { id: 'c1-l20', type: 'gap', text: 'Day 5: Castletown, former ______ of the Isle of Man, has old castle.', correct: 'capital' },
          {
            id: 'c1-l21',
            type: 'mcq',
            text: 'Personality traits — which trait is the eldest child likely to have because of their position in the family?',
            options: ['outgoing', 'selfish', 'independent', 'attention-seeking', 'introverted', 'co-operative', 'caring', 'competitive'],
            correct: 6,
          },
          {
            id: 'c1-l22',
            type: 'mcq',
            text: 'Which trait is a middle child likely to have because of their position in the family?',
            options: ['outgoing', 'selfish', 'independent', 'attention-seeking', 'introverted', 'co-operative', 'caring', 'competitive'],
            correct: 5,
          },
          {
            id: 'c1-l23',
            type: 'mcq',
            text: 'Which trait is the youngest child likely to have because of their position in the family?',
            options: ['outgoing', 'selfish', 'independent', 'attention-seeking', 'introverted', 'co-operative', 'caring', 'competitive'],
            correct: 0,
          },
          {
            id: 'c1-l24',
            type: 'mcq',
            text: 'Which trait is a twin likely to have because of their position in the family?',
            options: ['outgoing', 'selfish', 'independent', 'attention-seeking', 'introverted', 'co-operative', 'caring', 'competitive'],
            correct: 4,
          },
          {
            id: 'c1-l25',
            type: 'mcq',
            text: 'Which trait is an only child likely to have because of their position in the family?',
            options: ['outgoing', 'selfish', 'independent', 'attention-seeking', 'introverted', 'co-operative', 'caring', 'competitive'],
            correct: 1,
          },
          {
            id: 'c1-l26',
            type: 'mcq',
            text: 'Which trait is a child with much older siblings likely to have because of their position in the family?',
            options: ['outgoing', 'selfish', 'independent', 'attention-seeking', 'introverted', 'co-operative', 'caring', 'competitive'],
            correct: 2,
          },
          {
            id: 'c1-l27',
            type: 'mcq',
            text: 'What do the speakers say about the evidence relating to birth order and academic success?',
            options: [
              'There is conflicting evidence about whether oldest children perform best in intelligence tests.',
              'There is little doubt that birth order has less influence on academic achievement than socio-economic status.',
              'Some studies have neglected to include important factors such as family size.',
            ],
            correct: 2,
          },
          {
            id: 'c1-l28',
            type: 'mcq',
            text: "What does Ruth think is surprising about the difference in oldest children's academic performance?",
            options: [
              'It is mainly thanks to their roles as teachers for their younger siblings.',
              'The advantages they have only lead to a slightly higher level of achievement.',
              'The extra parental attention they receive at a young age makes little difference.',
            ],
            correct: 0,
          },
          {
            id: 'c1-l29',
            type: 'mcq',
            text: 'Which TWO experiences of sibling rivalry do the speakers agree have been valuable for them? (1st)',
            options: ['learning to share', 'learning to stand up for oneself', 'learning to be a good loser', 'learning to be tolerant', 'learning to say sorry'],
            correct: '1,3',
          },
          {
            id: 'c1-l30',
            type: 'mcq',
            text: 'Which TWO experiences of sibling rivalry do the speakers agree have been valuable for them? (2nd)',
            options: ['learning to share', 'learning to stand up for oneself', 'learning to be a good loser', 'learning to be tolerant', 'learning to say sorry'],
            correct: '1,3',
          },
          { id: 'c1-l31', type: 'gap', text: 'The Eucalyptus Tree — it provides ______ and food for a wide range of species.', correct: 'shelter' },
          { id: 'c1-l32', type: 'gap', text: 'Its leaves provide ______ which is used to make a disinfectant.', correct: 'oil' },
          { id: 'c1-l33', type: 'gap', text: "'Mundulla Yellows' — cause: lime used for making ______ was absorbed.", correct: 'roads' },
          { id: 'c1-l34', type: 'gap', text: "'Bell-miner Associated Die-back' — cause: ______ feed on eucalyptus leaves.", correct: 'insects' },
          { id: 'c1-l35', type: 'gap', text: "William Jackson's theory: high-frequency bushfires result in growth of ______.", correct: 'grasses', acceptable: ['grass'] },
          { id: 'c1-l36', type: 'gap', text: 'Mid-frequency bushfires make more ______ available to the trees.', correct: 'water' },
          { id: 'c1-l37', type: 'gap', text: 'Mid-frequency bushfires maintain the quality of the ______.', correct: 'soil' },
          { id: 'c1-l38', type: 'gap', text: "Low-frequency bushfires result in growth of eucalyptus '______ rainforest'.", correct: 'dry' },
          { id: 'c1-l39', type: 'gap', text: 'This type of rainforest is a ______ ecosystem.', correct: 'simple' },
          { id: 'c1-l40', type: 'gap', text: 'It is an ideal environment for the ______ of the bell-miner.', correct: 'nests', acceptable: ['nest'] },
        ],
      },
      reading: {
        passageTitle: 'Reading Passage 1: Nutmeg — a valuable spice | Reading Passage 2: Driverless cars | Reading Passage 3: What is exploration?',
        passage:
          "══════ READING PASSAGE 1 — Nutmeg: a valuable spice ══════\n\nThe nutmeg tree, Myristica fragrans, is a large evergreen tree native to Southeast Asia. Until the late 18th century, it only grew in one place in the world: a small group of islands in the Banda Sea, part of the Moluccas — or Spice Islands — in northeastern Indonesia. The tree is thickly branched with dense foliage of leaves, dark green and oval, and produces small, yellow, bell-shaped flowers and pale yellow pear-shaped fruits. The fruit is encased in a fleshy husk. When the fruit is ripe, this husk splits into two halves along a ridge running the length of the fruit. Inside is a purple-brown shiny seed, 2–3 cm long by about 2 cm across, surrounded by a lacy red or crimson covering called an 'aril'. These are the sources of the two spices nutmeg and mace, the former being produced from the dried seed and the latter from the aril.\n\nNutmeg was a highly prized and costly ingredient in European cuisine in the Middle Ages, and was used as a flavouring, medicinal, and preservative agent. Throughout this period, the Arabs were the exclusive importers of the spice to Europe. They sold nutmeg for high prices to merchants based in Venice, but they never revealed the exact location of the source of this extremely valuable commodity. The Arab-Venetian dominance of the trade finally ended in 1512, when the Portuguese reached the Banda Islands and began exploiting its precious resources.\n\nAlways in danger of competition from neighbouring Spain, the Portuguese began subcontracting their spice distribution to Dutch traders. Profits began to flow into the Netherlands, and the Dutch commercial fleet swiftly grew into one of the largest in the world. The Dutch quietly gained control of most of the shipping and trading of spices in Northern Europe. Then, in 1580, Portugal fell under Spanish rule, and by the end of the 16th century the Dutch found themselves locked out of the market. As prices for pepper, nutmeg, and other spices soared across Europe, they decided to fight back.\n\nIn 1602, Dutch merchants founded the VOC, a trading corporation better known as the Dutch East India Company. By 1617, the VOC was the richest commercial operation in the world. The company had 50,000 employees worldwide, with a private army of 30,000 men and a fleet of 200 ships. At the same time, thousands of people across Europe were dying of deadly disease. Doctors were desperate for a way to stop the spread of this disease, and nutmeg held the cure. Everybody wanted nutmeg, and many were willing to spare no expense to have it. Nutmeg bought for a few pennies in Indonesia could be sold for 68,000 times its original cost on the streets of London. The only problem was the short supply. And that's where the Dutch found their opportunity.\n\nThe Banda Islands were ruled by local sultans who insisted on maintaining a neutral trading policy towards foreign powers. This allowed them to avoid the presence of Portuguese or Spanish troops on their soil, but it also left them unprotected from other invaders. In 1621, the Dutch arrived and took over. Once securely in control of the Bandas, the Dutch went to work protecting their new investment. They concentrated all nutmeg production into a few easily guarded areas, uprooting and destroying any trees outside the plantation zones. All exported nutmeg was covered with lime to make sure there was no chance a fertile seed which could be grown elsewhere would leave the islands. There was only one obstacle to Dutch domination. One of the Banda Islands, a sliver of land called Run, was just 3 km long by less than 1 km wide, was under the control of the British. After decades of fighting for control of this tiny island, the Dutch and British arrived at a compromise settlement, the Treaty of Breda, in 1667. Intent on securing their hold over every nutmeg-producing island, the Dutch offered a trade: if the British would give them the island of Run, they would in turn give Britain a distant and much less valuable island in North America. That other island was Manhattan, which is how New Amsterdam became New York. The Dutch now had a monopoly over the nutmeg trade which would last for another century.\n\nThen, in 1770, a Frenchman named Pierre Poivre successfully smuggled nutmeg plants to safety where they thrived, especially on the island of Grenada. Next, in 1778, a volcanic eruption in the Banda region caused a tsunami that wiped out half the nutmeg groves. Finally, in 1809, the British returned to Indonesia and seized the Banda Islands by force. They returned the islands to the Dutch in 1817, not before transplanting hundreds of nutmeg seedlings to plantations in several locations across southern Asia. The Dutch nutmeg monopoly was over.\n\nToday, nutmeg is grown in Indonesia, the Caribbean, India, Malaysia, Papua New Guinea and Sri Lanka, and world nutmeg production is estimated to average between 10,000 and 12,000 tonnes per year.\n\n══════ READING PASSAGE 2 — Driverless cars ══════\n\nA The automotive sector is well used to adapting to automation in manufacturing. The implementation of robotic car manufacture from the 1970s onwards led to significant cost savings and improvements in the reliability and flexibility of vehicle mass production. A new challenge to vehicle production is now on the horizon and, again, it comes from automation. However, this time it is not to do with the manufacturing process, but with the vehicles themselves. Research projects on vehicle automation are not new. Vehicles with limited self-driving capabilities have been around for more than 50 years, resulting in significant contributions towards driver assistance systems. But since Google announced in 2010 that it had been trialling self-driving cars on the streets of California, progress in this field has quickly gathered pace.\n\nB There are many reasons why technology is advancing so fast. One frequently cited reason is financial; indeed, research at the UK's Transport Research Laboratory has demonstrated that more than 90 percent of road collisions involve human error as a contributory factor, and it is the primary cause in the vast majority. Automation may help to reduce the incidence of this. Another aim is to free the time people spend driving for other purposes. If the vehicle can do some or all of the driving, it may be possible to be productive, or socialise or simply relax while automation systems have responsibility for safe control of the vehicle. If the vehicle can do the driving, those who are challenged by existing mobility models — such as older or disabled travellers — may be able to enjoy significantly greater travel autonomy.\n\nC Beyond these direct benefits, we can consider the wider implications for transport and society, and how manufacturing processes might need to respond as a result. At present, the average car spends more than 90 percent of its life parked. Automation means that initiatives for car-sharing become much more viable, particularly in urban areas with significant travel demand. If a significant proportion of the population chose to use shared automated vehicles, mobility demand can be met by far fewer vehicles.\n\nD The Massachusetts Institute of Technology investigated automated mobility in Singapore, finding that fewer than 30 percent of the vehicles currently used would be required if fully automated car sharing could be implemented. If this is the case, it might mean that we need to manufacture far fewer vehicles to meet demand. However, the number of trips being taken would probably rise, partly because empty vehicles would have to be moved from one customer to the next.\n\nModelling work by the University of Michigan Transportation Research Institute suggests automated vehicles might reduce vehicle ownership by 43 percent, because vehicles that switch drivers would need to be used more intensively, and might need replacing sooner. This faster rate of turnover may mean that vehicle production will not necessarily decrease.\n\nE Automation may prompt other changes in vehicle manufacture. If we move to a model where consumers are tending not to own a single vehicle but to purchase access to a range of vehicles through a mobility provider, drivers will have the freedom to select one that best suits their needs for a particular journey, rather than making a compromise across all their requirements.\n\nSince, for most of the time, most of the seats in most cars are unoccupied, this may boost production of a smaller, more efficient range of vehicles that suit the needs of individuals. Specialised vehicles may be available for exceptional journeys, such as going on a family camping trip or helping a son or daughter move to university.\n\nF There are a number of hurdles to overcome in delivering automated vehicles to our roads. These include the technical difficulties in ensuring that the vehicle works reliably in the infinite range of traffic, weather and road situations it might encounter; the regulatory challenges in understanding how liability and enforcement might change when drivers are no longer essential for vehicle operation; and the societal changes that may be required for communities to trust and accept automated vehicles as being a valuable part of the mobility landscape.\n\nG It's clear that there are many challenges that need to be addressed but, through robust and targeted research, this can most probably be conquered within the next 10 years. Mobility will change in association with so many other technological developments, such as telepresence and virtual reality, that it is hard to make concrete predictions about the future. However, one thing is certain: change is coming, and the need to be flexible in response to this will be vital for those involved in manufacturing the vehicles that will deliver future mobility.\n\n══════ READING PASSAGE 3 — What is exploration? ══════\n\nWe are all explorers. Our desire to discover, and then share that new-found knowledge, is part of what makes us human — indeed this has played an important part in our success as a species. Long before the first caveman slumped down beside the fire and grunted news that there are plenty of wildebeest over yonder, our ancestors had learnt the value of sending out scouts to investigate the unknown. This questing nature of ours undoubtedly helped our species spread around the globe, just as it nowadays no doubt helps the last nomadic Penan maintain their existence in the depleted forests of Borneo, and a visitor negotiate the subways of New York.\n\nOver the years, we've come to think of explorers as a peculiar breed — different from the rest of us, be they eccentric amateurs or, more likely, professional scientists. This distinction, however, is not real, and perhaps a more useful measure of what exploration is might be to look at the impact a journey has on those who make it, and how it can be found in the outcomes felt long after the return.\n\nThomas Hardy set some of his novels in Egdon Heath, a fictional area of uncultivated land, and used the landscape to suggest the desires and fears of his characters. This is surely an act of exploration, as we all recognise because they are common to humanity. That's not to take away from the fact that we all have this enquiring instinct, even today; that in all sorts of professions — whether artist, marine biologist or astronomer — borders of the unknown are being tested each day.\n\nIn this book about the exploration of the earth's surface, I have confined myself to those whose travels were real and who also aimed at more personal discovery. But that still left me with another problem: the word 'explorer' has become associated with a past era. We think back to a golden age, as if exploration peaked somehow in the 19th century — as if the process of discovery is now on the decline, the truth is that we have named only one and a half million of this planet's species, and there may be more than 10 million — and that's not including bacteria. We have studied only 5 per cent of the ocean floors, and know even less about ourselves; we fully understand the workings of only 10 per cent of our brains.\n\nHere is how some of today's 'explorers' define the word. Ran Fiennes, dubbed the 'greatest living explorer', said, 'An explorer is someone who has done something that no human has done before — and also done something scientifically useful.' Chris Bonington, a leading mountaineer, felt exploration was to be found in the act of physically touching the unknown: 'You have to have gone somewhere new.' Then Robin Hanbury-Tenison, a campaigner on behalf of remote so-called 'tribal' peoples, said, 'A traveller simply records information about far-off world, and reports back; but an explorer changes the world.' Wilfred Thesiger, who crossed Arabia's Empty Quarter in 1946, and belongs to an era of unmechanised travel now lost to the rest of us, told me, 'If I'd gone across by camel when I could have gone by car, it would have been a stunt.' To him, exploration meant bringing back information from a remote place regardless of any great self-discovery.\n\nEach definition is slightly different — and tends to reflect the field of endeavour of each pioneer. This was the same whoever I asked: the prominent historian would say exploration was a thing of the past, the cutting-edge scientist would say it was a thing of the present. And so on. They each set their own particular criteria; the common factor in their approach being that they all had, unlike many of us who simply enjoy travel or discovering new things, both a definite objective from the outset and also a desire to record their findings.\n\nI'd best declare my own bias. As a writer, I'm interested in the exploration of ideas. I've done a great many expeditions and each one was unique. I've lived for months alone with isolated groups of people all around the world, even two 'uncontacted tribes'. But none of these worked as the slightest chance to anyone new, a slant, a new idea. Why? Because the world has moved on. The time has long passed for the great continental voyages — another walk to the poles, another crossing of the Empty Quarter. We know how the land surface of our planet lies; exploration of it is now down to the details — the habits of microbes, say, or the grazing behaviour of buffalo. Aside from the deep sea and deep underground, it's the era of specialists. However, this is to disregard the role the human mind has in conveying remote places; and this is what interests me: how a fresh interpretation, even of a well-travelled route, can give its readers new insights.",
        questions: [
          { id: 'c1-r1', type: 'gap', text: 'The nutmeg tree and fruit — the leaves of the tree are ______ in shape.', correct: 'oval' },
          { id: 'c1-r2', type: 'gap', text: 'The ______ surrounds the fruit and breaks open when the fruit is ripe.', correct: 'husk' },
          { id: 'c1-r3', type: 'gap', text: 'The ______ is used to produce the spice nutmeg.', correct: 'seed' },
          { id: 'c1-r4', type: 'gap', text: 'The covering known as the aril is used to produce ______.', correct: 'mace' },
          {
            id: 'c1-r5',
            type: 'mcq',
            text: 'In the Middle Ages, most Europeans knew where nutmeg was grown. (TRUE / FALSE / NOT GIVEN)',
            options: ['TRUE', 'FALSE', 'NOT GIVEN'],
            correct: 1,
          },
          {
            id: 'c1-r6',
            type: 'mcq',
            text: "The VOC was the world's first major trading company. (TRUE / FALSE / NOT GIVEN)",
            options: ['TRUE', 'FALSE', 'NOT GIVEN'],
            correct: 2,
          },
          {
            id: 'c1-r7',
            type: 'mcq',
            text: 'Following the Treaty of Breda, the Dutch had control of all the islands where nutmeg grew. (TRUE / FALSE / NOT GIVEN)',
            options: ['TRUE', 'FALSE', 'NOT GIVEN'],
            correct: 0,
          },
          { id: 'c1-r8', type: 'gap', text: 'Middle Ages — nutmeg was brought to Europe by the ______.', correct: 'Arabs' },
          { id: 'c1-r9', type: 'gap', text: '17th century — demand for nutmeg grew, as it was believed to be effective against the disease known as the ______.', correct: 'plague' },
          { id: 'c1-r10', type: 'gap', text: 'The Dutch put ______ on nutmeg to avoid it being cultivated outside the islands.', correct: 'lime' },
          { id: 'c1-r11', type: 'gap', text: 'The Dutch finally obtained the island of ______ from the British.', correct: 'Run' },
          { id: 'c1-r12', type: 'gap', text: 'Late 18th century — 1770: nutmeg plants were secretly taken to ______.', correct: 'Mauritius' },
          { id: 'c1-r13', type: 'gap', text: "1778: half the Banda Islands' nutmeg plantations were destroyed by a ______.", correct: 'tsunami' },
          {
            id: 'c1-r14',
            type: 'mcq',
            text: 'Driverless cars — which section (A-G) contains: reference to the amount of time when a car is not in use?',
            options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            correct: 2,
          },
          {
            id: 'c1-r15',
            type: 'mcq',
            text: 'Which section (A-G) mentions several advantages of driverless vehicles for individual road-users?',
            options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            correct: 1,
          },
          {
            id: 'c1-r16',
            type: 'mcq',
            text: 'Which section (A-G) refers to the opportunity of choosing the most appropriate vehicle for each trip?',
            options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            correct: 4,
          },
          {
            id: 'c1-r17',
            type: 'mcq',
            text: 'Which section (A-G) gives an estimate of how long it will take to overcome a number of problems?',
            options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            correct: 6,
          },
          {
            id: 'c1-r18',
            type: 'mcq',
            text: 'Which section (A-G) suggests that the use of driverless cars may have no effect on the number of vehicles manufactured?',
            options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            correct: 3,
          },
          { id: 'c1-r19', type: 'gap', text: 'The impact of driverless cars — most motor accidents are partly due to ______.', correct: 'human error' },
          { id: 'c1-r20', type: 'gap', text: 'Schemes for ______ will be more workable, especially in towns and cities.', correct: 'car-sharing', acceptable: ['car sharing', 'carsharing'] },
          { id: 'c1-r21', type: 'gap', text: 'There could be a 43 percent drop in ______ of cars.', correct: 'ownership' },
          { id: 'c1-r22', type: 'gap', text: 'The yearly ______ of each car would, on average, be twice as high as it currently is.', correct: 'mileage' },
          {
            id: 'c1-r23',
            type: 'mcq',
            text: 'Which TWO benefits of automated vehicles does the writer mention? (1st)',
            options: ['Car travellers could enjoy considerable cost savings.', 'It would be easier to find parking spaces in urban areas.', 'Travellers could spend journeys doing something other than driving.', 'People who find driving physically difficult could travel independently.', 'A reduction in the number of cars would mean a reduction in pollution.'],
            correct: '2,3',
          },
          {
            id: 'c1-r24',
            type: 'mcq',
            text: 'Which TWO benefits of automated vehicles does the writer mention? (2nd)',
            options: ['Car travellers could enjoy considerable cost savings.', 'It would be easier to find parking spaces in urban areas.', 'Travellers could spend journeys doing something other than driving.', 'People who find driving physically difficult could travel independently.', 'A reduction in the number of cars would mean a reduction in pollution.'],
            correct: '2,3',
          },
          {
            id: 'c1-r25',
            type: 'mcq',
            text: 'Which TWO challenges to automated vehicle development does the writer mention? (1st)',
            options: ['making sure the general public has confidence in automated vehicles', 'managing the pace of transition from conventional to automated vehicles', 'deciding how to compensate professional drivers who become redundant', 'setting up the infrastructure to make roads suitable for automated vehicles', 'getting automated vehicles to adapt to various different driving conditions'],
            correct: '0,4',
          },
          {
            id: 'c1-r26',
            type: 'mcq',
            text: 'Which TWO challenges to automated vehicle development does the writer mention? (2nd)',
            options: ['making sure the general public has confidence in automated vehicles', 'managing the pace of transition from conventional to automated vehicles', 'deciding how to compensate professional drivers who become redundant', 'setting up the infrastructure to make roads suitable for automated vehicles', 'getting automated vehicles to adapt to various different driving conditions'],
            correct: '0,4',
          },
          {
            id: 'c1-r27',
            type: 'mcq',
            text: 'What is exploration? — the writer refers to visitors to New York to illustrate the point that',
            options: ['exploration is an intrinsic element of being human.', 'most people are enthusiastic about exploring.', 'exploration can lead to surprising results.', 'most people find exploration daunting.'],
            correct: 0,
          },
          {
            id: 'c1-r28',
            type: 'mcq',
            text: "According to the second paragraph, what is the writer's view of explorers?",
            options: ['Their discoveries have brought both benefits and disadvantages.', 'Their main value is in teaching others.', 'They act on an urge that is common to everyone.', 'They tend to be more attracted to certain professions than to others.'],
            correct: 2,
          },
          {
            id: 'c1-r29',
            type: 'mcq',
            text: 'The writer refers to a description of Egdon Heath to suggest that',
            options: ['Hardy was writing about his own experience of exploration.', 'Hardy was mistaken about the nature of exploration.', "Hardy's aim was to investigate people's emotional states.", "Hardy's aim was to show the attraction of isolation."],
            correct: 2,
          },
          {
            id: 'c1-r30',
            type: 'mcq',
            text: "In the fourth paragraph, the writer refers to a 'golden age' to suggest that",
            options: ['the amount of useful information produced by exploration has decreased.', 'fewer people are interested in exploring than in the 19th century.', 'recent developments have made exploration less exciting.', 'we are wrong to think that exploration is no longer necessary.'],
            correct: 3,
          },
          {
            id: 'c1-r31',
            type: 'mcq',
            text: 'In the sixth paragraph, when discussing the definition of exploration, the writer argues that',
            options: ['people tend to relate exploration to their own professional interests.', 'certain people are likely to misunderstand the nature of exploration.', 'the generally accepted definition has changed over time.', 'historians and scientists have more valid definitions than the general public.'],
            correct: 0,
          },
          {
            id: 'c1-r32',
            type: 'mcq',
            text: 'In the last paragraph, the writer explains that he is interested in',
            options: ["how someone's personality is reflected in their choice of places to visit.", 'the human ability to cast new light on places that may be familiar.', 'how travel writing has evolved to meet changing demands.', 'the feelings that writers develop about the places that they explore.'],
            correct: 1,
          },
          {
            id: 'c1-r33',
            type: 'mcq',
            text: 'Match the statement to the explorer — He referred to the relevance of the form of transport used.',
            options: ['Peter Fleming', 'Ran Fiennes', 'Chris Bonington', 'Robin Hanbury-Tenison', 'Wilfred Thesiger'],
            correct: 4,
          },
          {
            id: 'c1-r34',
            type: 'mcq',
            text: 'He described feelings on coming back home after a long journey.',
            options: ['Peter Fleming', 'Ran Fiennes', 'Chris Bonington', 'Robin Hanbury-Tenison', 'Wilfred Thesiger'],
            correct: 0,
          },
          {
            id: 'c1-r35',
            type: 'mcq',
            text: 'He worked for the benefit of specific groups of people.',
            options: ['Peter Fleming', 'Ran Fiennes', 'Chris Bonington', 'Robin Hanbury-Tenison', 'Wilfred Thesiger'],
            correct: 3,
          },
          {
            id: 'c1-r36',
            type: 'mcq',
            text: 'He did not consider learning about oneself an essential part of exploration.',
            options: ['Peter Fleming', 'Ran Fiennes', 'Chris Bonington', 'Robin Hanbury-Tenison', 'Wilfred Thesiger'],
            correct: 1,
          },
          {
            id: 'c1-r37',
            type: 'mcq',
            text: 'He defined exploration as being both unique and of value to others.',
            options: ['Peter Fleming', 'Ran Fiennes', 'Chris Bonington', 'Robin Hanbury-Tenison', 'Wilfred Thesiger'],
            correct: 2,
          },
          { id: 'c1-r38', type: 'gap', text: "The writer's own bias — the writer has experience of a large number of ______.", correct: 'unique expeditions', acceptable: ['expeditions'] },
          { id: 'c1-r39', type: 'gap', text: 'He was the first stranger that certain previously ______ people had encountered.', correct: 'uncontacted', acceptable: ['isolated'] },
          { id: 'c1-r40', type: 'gap', text: "He believes there is no need for further exploration of Earth's ______, except to answer specific questions.", correct: 'land surface', acceptable: ['surface'] },
        ],
      },
      writing: {
        // BUG-014: son jadvali endi matn ichiga qotib qolgan holda emas, alohida
        // `chart` (pastga q.) sifatida — vizual grafik shu ma'lumotdan chiziladi.
        task1:
          'You should spend about 20 minutes on this task.\n\nThe chart below shows the results of a survey about people\'s coffee and tea buying and drinking habits in five Australian cities. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
        task2:
          'You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nIn some countries, owning a home rather than renting one is very important for people.\n\nWhy might this be the case?\n\nDo you think this is a positive or negative situation?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
        chart: {
          chartType: 'bar',
          title: "Coffee and tea buying/drinking habits in five Australian cities (last 4 weeks)",
          unit: '%',
          categories: ['Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Hobart'],
          series: [
            { name: 'Bought fresh coffee', data: [44, 42, 34, 34, 38] },
            { name: 'Bought instant coffee', data: [46, 48, 53, 50, 54] },
            { name: 'Went to a café', data: [61, 64, 55, 49, 62] },
          ],
        },
      },
      speaking: {
        parts: [
          { id: 'c1-s1', label: 'Part 1 — Introduction', question: "Let's talk about your hometown. What kind of place is it? What do you like most about living there?" },
          { id: 'c1-s2', label: 'Part 2 — Cue card', question: 'Describe a piece of technology you find useful. You should say: what it is, when you started using it, how you use it, and explain why you find it useful.' },
          { id: 'c1-s3', label: 'Part 3 — Discussion', question: 'How has technology changed the way people communicate with each other? Do you think these changes are mostly positive or negative?' },
        ],
      },
    },
  },
};

// Mock tanlash UI uchun (VOCABLY-TZ) — /app/mock sahifasida ko'rsatiladi.
export const MOCK_LIST = Object.values(MOCKS).map((m) => ({ id: m.id, title: m.title }));

export function getMock(mockId: string): Mock | undefined {
  return MOCKS[mockId];
}

/** {questionId: to'g'ri qiymat} — avtomatik baholanadigan bo'lim uchun, bo'lmasa {}.
 * Faqat mcq'ning "asosiy" to'g'ri qiymatini qaytaradi — gap savollar uchun
 * `gradingInfo()`dan foydalaning (acceptable variantlarni ham hisobga oladi). */
export function answerKey(mockId: string, section: string): Record<string, number | string> {
  const mock = MOCKS[mockId];
  const sec = (mock?.sections as any)?.[section];
  const key: Record<string, number | string> = {};
  for (const q of sec?.questions || []) {
    if (q.correct !== undefined) key[q.id] = q.correct;
  }
  return key;
}

/** Baholash uchun to'liq ma'lumot (tur + to'g'ri qiymat + qabul qilinadigan
 * variantlar) — scoreExam() va /answer route'dagi "practice reveal" shu orqali
 * gap savollarni ham (matn solishtirish bilan) to'g'ri baholaydi. */
export function gradingInfo(
  mockId: string,
  section: string
): Record<string, { type: 'mcq' | 'gap'; correct: number | string; acceptable?: string[] }> {
  const mock = MOCKS[mockId];
  const sec = (mock?.sections as any)?.[section];
  const info: Record<string, { type: 'mcq' | 'gap'; correct: number | string; acceptable?: string[] }> = {};
  for (const q of sec?.questions || []) {
    if (q.correct !== undefined) info[q.id] = { type: q.type, correct: q.correct, acceptable: q.acceptable };
  }
  return info;
}

/** get_mock() bilan bir xil kontent, lekin har bir `correct`/`acceptable` javob
 * olib tashlangan, ustiga server-mustahkam bo'lim davomiyliklari qo'shilgan. */
export function publicMock(mockId: string) {
  const mock = MOCKS[mockId];
  if (!mock) return null;
  const pub = structuredClone(mock) as any;
  for (const sec of Object.values(pub.sections) as any[]) {
    for (const q of sec.questions || []) {
      delete q.correct;
      delete q.acceptable;
    }
  }
  pub.durations = SECTION_DURATIONS;
  pub.order = SECTION_ORDER;
  return pub;
}

/** Berilgan savol ID'si qaysi bo'limga tegishli ekanini topadi — /answer'da
 * bo'lim vaqti tugaganini tekshirish uchun. */
export function sectionOfQuestion(mockId: string, questionId: string): string | null {
  const mock = MOCKS[mockId];
  if (!mock) return null;
  for (const [key, sec] of Object.entries(mock.sections)) {
    for (const q of (sec as any).questions || []) {
      if (q.id === questionId) return key;
    }
  }
  return null;
}
