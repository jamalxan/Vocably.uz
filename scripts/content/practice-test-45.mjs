// Original IELTS-style practice content (NOT copied or paraphrased from any real
// Cambridge/IELTS book). Only the exam STRUCTURE — section order, question types,
// question counts and word limits — follows a standard Academic test layout; every
// topic, passage, transcript, question and answer is written from scratch. See
// practice-test-2.mjs for the shared format notes.
import { table, svgDataUri, TFNG_INSTRUCTION } from './_html.mjs';

const CAMPUS_MAP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="400" fill="#f6f7f2"/>
  <text x="230" y="24" font-weight="bold" fill="#333">Northgate University campus</text>
  <path d="M40 210 H560" stroke="#b0a58a" stroke-width="14"/>
  <path d="M300 40 V370" stroke="#b0a58a" stroke-width="14"/>
  <text x="440" y="200" fill="#6d6250" font-size="11">Main Avenue</text>
  <text x="310" y="60" fill="#6d6250" font-size="11">College Walk</text>
  <rect x="260" y="370" width="80" height="22" fill="#555"/>
  <text x="348" y="386" fill="#333">Main gate</text>
  <rect x="200" y="235" width="80" height="60" fill="#dfe6ef" stroke="#7a8ca3"/>
  <text x="212" y="270" fill="#333">Reception</text>
  <rect x="330" y="235" width="90" height="60" fill="#e9e2d6" stroke="#999"/>
  <rect x="330" y="120" width="120" height="70" fill="#e9e2d6" stroke="#999"/>
  <rect x="160" y="110" width="110" height="80" fill="#e9e2d6" stroke="#999"/>
  <rect x="60" y="230" width="100" height="70" fill="#e9e2d6" stroke="#999"/>
  <rect x="470" y="230" width="90" height="70" fill="#e9e2d6" stroke="#999"/>
  <rect x="60" y="60" width="80" height="60" fill="#e9e2d6" stroke="#999"/>
  <ellipse cx="490" cy="110" rx="55" ry="35" fill="#bcd9ee" stroke="#6f9fc4"/>
  <text x="475" y="115" fill="#2c5d80">Lake</text>
  <path d="M560 380 L560 355 M552 365 L560 352 L568 365" stroke="#333" stroke-width="2" fill="none"/>
  <text x="555" y="396" fill="#333" font-size="12">N</text>
</svg>`);

const LIGHTHOUSE_LENS = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" font-family="Arial, sans-serif" font-size="13">
  <rect width="600" height="420" fill="#f7f9fb"/>
  <text x="170" y="24" font-weight="bold" fill="#333">A rotating lighthouse lens (cross-section)</text>
  <path d="M170 40 L300 20 L430 40 Z" fill="#90a4ae" stroke="#455a64"/>
  <rect x="160" y="40" width="280" height="250" fill="none" stroke="#455a64" stroke-width="3"/>
  <path d="M180 60 L240 60 M180 80 L240 80 M180 100 L240 100 M360 60 L420 60 M360 80 L420 80 M360 100 L420 100" stroke="#4fc3f7" stroke-width="8"/>
  <ellipse cx="300" cy="165" rx="130" ry="45" fill="none" stroke="#4fc3f7" stroke-width="6"/>
  <ellipse cx="300" cy="165" rx="90" ry="30" fill="none" stroke="#4fc3f7" stroke-width="5"/>
  <circle cx="300" cy="165" r="16" fill="#ffeb3b" stroke="#f9a825"/>
  <path d="M180 230 L240 230 M180 250 L240 250 M180 270 L240 270 M360 230 L420 230 M360 250 L420 250 M360 270 L420 270" stroke="#4fc3f7" stroke-width="8"/>
  <path d="M430 165 L580 150 M430 165 L580 180" stroke="#fbc02d" stroke-width="2" stroke-dasharray="6 4"/>
  <rect x="210" y="295" width="180" height="22" fill="#b0bec5" stroke="#546e7a"/>
  <rect x="220" y="317" width="160" height="12" fill="#cfd8dc" stroke="#546e7a"/>
  <rect x="290" y="330" width="20" height="50" fill="#795548"/>
  <path d="M310 360 L360 360 L360 395" stroke="#333" stroke-width="2" fill="none"/>
  <rect x="345" y="395" width="30" height="20" fill="#616161"/>
</svg>`);

export default {
  slug: 'vocably-practice-test-45',
  title: 'Vocably Practice Test 45',
  difficulty: 'medium',

  reading: {
    durationSec: 3600,
    passages: [
      {
        order: 1,
        title: 'The return of the night train',
        subtitle: 'Read the text and answer questions 1-13.',
        paragraphs: [
          { label: '', html: "<p>For much of the twentieth century, overnight trains were an essential part of travel in Europe. Business travellers, holidaymakers and families moving between countries boarded sleeping cars in the evening and woke up hundreds of kilometres away the next morning. Some routes, such as those linking northern Europe with the Mediterranean, became famous in their own right. Yet by the early years of this century, the night train seemed to be dying. One national railway after another cut its services, and in 2016 Germany's national operator withdrew from overnight trains altogether.</p>" },
          { label: '', html: "<p>The decline had several causes. The most important was the growth of low-cost airlines, which could carry passengers between major cities in a couple of hours, often for less than the price of a sleeping-car ticket. At the same time, new high-speed railway lines reduced daytime journey times so much that an overnight service was no longer necessary on many routes. Night trains were also expensive to run. Each carriage carried far fewer passengers than a daytime train, and the carriages were used for only one journey in each twenty-four hours, spending the day waiting in sidings. They also needed more staff, since each sleeping car had an attendant who prepared the beds, served breakfast and woke passengers before their stations. As the old carriages aged, operators faced the choice of investing heavily in new ones or abandoning the services, and most chose to abandon them.</p>" },
          { label: '', html: "<p>The revival began in Austria. When the German operator withdrew, the Austrian national railway took over several of its routes, together with some of the carriages, and relaunched them under a new brand. Many observers expected the venture to fail. Instead, the trains were often fully booked, and within a few years the company was ordering new rolling stock and adding routes to cities such as Brussels, Amsterdam and Paris. Other operators, including several small private companies, followed.</p>" },
          { label: '', html: "<p>Part of the explanation is environmental. As public concern about climate change grew, many travellers began to look for alternatives to flying, particularly for journeys of between five hundred and fifteen hundred kilometres, the distance at which night trains are most competitive. A train journey produces a small fraction of the carbon emissions of the same trip by air. Some governments have actively supported the change: France, for example, has restricted short domestic flights on routes where a train journey of less than two and a half hours is available.</p>" },
          { label: '', html: "<p>But the appeal of the night train is not only environmental. Travellers who use them often mention the convenience of arriving in a city centre early in the morning, without the need to travel to and from distant airports or to pay for a night in a hotel. For many, the journey itself is part of the attraction: there is a sense of adventure in falling asleep in one country and waking in another. The new generation of trains has been designed with this in mind, offering private compartments with their own showers as well as cheaper options, including small individual sleeping pods.</p>" },
          { label: '', html: "<p>Significant obstacles remain. Night trains must pay charges for using the track in each country they pass through, and these can make up a large part of the ticket price. Different countries use different electrical systems and safety equipment, so trains that cross several borders need expensive specialised locomotives. Maintenance work on railway lines is usually carried out at night, which can force night trains to take slow diversions. And new sleeping cars are costly to build, with long waiting times because few manufacturers produce them.</p>" },
          { label: '', html: "<p>Whether the revival will last depends largely on political decisions. Supporters argue that governments should reduce track charges for night trains, or remove the tax advantages that airlines enjoy in some countries, such as the absence of tax on aviation fuel. The European Union has named sleeper services as part of its strategy for reducing transport emissions, but so far its practical support has been limited. What is clear is that, only a few years after it seemed to be finished, the night train has once again become a symbol of a different, slower and perhaps more thoughtful way of travelling across the continent.</p>" },
        ],
        questionGroups: [
          {
            id: 't45-r1-sentence',
            type: 'sentence_completion',
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
            questions: [
              { number: 1, promptHtml: 'The growth of {{q1}} was the main reason for the decline of night trains.', answer: { accepted: ['low-cost airlines'] }, explanationHtml: 'Paragraph 2: "The most important was the growth of low-cost airlines".' },
              { number: 2, promptHtml: 'During the day, night-train carriages were left waiting in {{q2}}.', answer: { accepted: ['sidings'] }, explanationHtml: 'Paragraph 2: "spending the day waiting in sidings".' },
              { number: 3, promptHtml: 'The Austrian railway relaunched the routes under a new {{q3}}.', answer: { accepted: ['brand'] }, explanationHtml: 'Paragraph 3: "relaunched them under a new brand".' },
              { number: 4, promptHtml: 'France has restricted short {{q4}} where a fast train alternative exists.', answer: { accepted: ['domestic flights'] }, explanationHtml: 'Paragraph 4: "restricted short domestic flights".' },
              { number: 5, promptHtml: 'Travellers save the cost of a night in a {{q5}}.', answer: { accepted: ['hotel'] }, explanationHtml: 'Paragraph 5: "or to pay for a night in a hotel".' },
              { number: 6, promptHtml: 'The cheapest options on new trains include small individual {{q6}}.', answer: { accepted: ['sleeping pods', 'pods'] }, explanationHtml: 'Paragraph 5: "small individual sleeping pods".' },
              { number: 7, promptHtml: 'In some countries, airlines pay no tax on {{q7}}.', answer: { accepted: ['aviation fuel', 'fuel'] }, explanationHtml: 'Paragraph 7: "the absence of tax on aviation fuel".' },
            ],
          },
          {
            id: 't45-r1-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 8, promptHtml: 'Germany\'s national railway stopped running night trains in 2016.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: "in 2016 Germany\'s national operator withdrew from overnight trains altogether".' },
              { number: 9, promptHtml: 'Night trains carry more passengers per carriage than daytime trains.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "Each carriage carried far fewer passengers than a daytime train".' },
              { number: 10, promptHtml: 'Most experts predicted that the Austrian night trains would be successful.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 3: "Many observers expected the venture to fail."' },
              { number: 11, promptHtml: 'Night trains are most competitive on journeys of more than 2,000 kilometres.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: they are most competitive between "five hundred and fifteen hundred kilometres".' },
              { number: 12, promptHtml: 'Night-train passengers are mostly under thirty years old.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not give the ages of passengers.' },
              { number: 13, promptHtml: 'Only a few companies manufacture sleeping cars.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 6: "few manufacturers produce them".' },
            ],
          },
        ],
      },
      {
        order: 2,
        title: 'The lens that lit the coast',
        subtitle: 'Read the text and answer questions 14-26.',
        paragraphs: [
          { label: '', html: "<p>For most of history, lighthouses were remarkably ineffective. The earliest ones were simply towers with an open fire burning at the top, and even after candles and oil lamps replaced fires, most of the light escaped in every direction, including straight up into the sky. From the eighteenth century, some lighthouses used curved metal mirrors behind the lamps to reflect light towards the sea, but the mirrors quickly became dull, absorbed much of the light, and needed constant polishing. Shipwrecks along dangerous coastlines remained common, and sailors complained that many lights were too weak to be seen until a ship was already dangerously close to the rocks. Some lighthouses were so dim that they were mistaken for the lights of houses or other ships.</p>" },
          { label: '', html: "<p>The solution came from an unexpected source. Augustin Fresnel was a French engineer whose main work was building roads, but his real passion was the study of light, and in the 1810s he developed a new theory that light travels as a wave. In 1819 he was appointed to a government commission responsible for lighthouses, and he set about applying his understanding of optics to a practical problem: how to collect as much of a lamp's light as possible and send it out towards ships at sea.</p>" },
          { label: '', html: "<p>A single large glass lens could, in theory, bend the light into a strong beam, but such a lens would have to be extremely thick and heavy, and it would absorb much of the light passing through it. Fresnel's insight was that only the curved surface of a lens bends light; the glass inside does nothing useful. He therefore divided the lens into a series of concentric rings, each with the same curve as the corresponding part of a thick lens but only a fraction of its thickness. Making such a lens was extremely difficult with the glass-making techniques of the time, since each ring had to be ground to a precise shape and then fitted into a metal frame, and the earliest examples were assembled from many separate pieces. The result was a lens that was far thinner and lighter, but that focused light just as effectively.</p>" },
          { label: '', html: "<p>Fresnel added further refinements. Light from the lamp that travelled upwards or downwards would miss the central lens, so he surrounded it with rings of glass prisms, positioned above and below, which caught this light and redirected it outwards in the same direction as the main beam. In the best designs, more than eighty per cent of the lamp's light was sent out to sea, compared with a small proportion from the old mirror systems. The first of his lenses was installed in 1823 in a famous lighthouse at the mouth of a river in south-west France, where its beam could be seen from more than thirty kilometres away.</p>" },
          { label: '', html: "<p>A problem remained. Sailors needed to know not only that they were near a lighthouse, but which one it was. Fresnel's answer was to build the lens from several separate panels, each focusing light into its own beam, and to rotate the whole structure around the lamp. To a ship at sea, the light would then appear to flash as each beam swept past. By varying the number of panels and the speed of rotation, each lighthouse could be given its own pattern of flashes, which sailors could identify from a chart.</p>" },
          { label: '', html: "<p>Rotating a lens that could weigh several tonnes smoothly and continuously was itself a challenge. In later lighthouses, the lens was floated on a bath of mercury, a liquid metal so dense that it could support the enormous weight with very little friction. The rotation was driven by a clockwork mechanism, powered by heavy weights that slowly descended through the centre of the tower. Every few hours, the lighthouse keeper had to wind the weights back up by hand, a task that continued through every night of the year.</p>" },
          { label: '', html: "<p>Fresnel lenses spread rapidly around the world and saved countless lives. Fresnel himself did not live to see their success; he died of illness in 1827, at the age of only thirty-nine. Today most lighthouses are automated and many use modern plastic lenses or electric lights, but the principle he developed is still used in car headlights, traffic signals, projectors and solar power stations. Several of the original glass lenses survive, and are now displayed in museums as masterpieces of both engineering and craftsmanship.</p>" },
        ],
        questionGroups: [
          {
            id: 't45-r2-tfng',
            type: 'true_false_notgiven',
            instructionHtml: TFNG_INSTRUCTION,
            questions: [
              { number: 14, promptHtml: 'Early mirrors in lighthouses required frequent cleaning.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 1: the mirrors "needed constant polishing".' },
              { number: 15, promptHtml: 'Fresnel\'s main job was designing lighthouses.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 2: "his main work was building roads".' },
              { number: 16, promptHtml: 'Fresnel\'s theory of light was immediately accepted by other scientists.', answer: { accepted: ['NOT GIVEN'] }, explanationHtml: 'The passage does not say how other scientists responded to his theory.' },
              { number: 17, promptHtml: 'A thick single lens would absorb a lot of light.', answer: { accepted: ['TRUE'] }, explanationHtml: 'Paragraph 3: it "would absorb much of the light passing through it".' },
              { number: 18, promptHtml: 'The first Fresnel lens was installed outside France.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 4: it was installed "in south-west France".' },
              { number: 19, promptHtml: 'Fresnel lived to see his lenses used around the world.', answer: { accepted: ['FALSE'] }, explanationHtml: 'Paragraph 7: "Fresnel himself did not live to see their success".' },
            ],
          },
          {
            id: 't45-r2-diagram',
            type: 'diagram_label',
            instructionHtml: 'Label the diagram below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            imageUrl: LIGHTHOUSE_LENS,
            imageAlt: 'Cross-section of a rotating lighthouse lens: a light source in the centre surrounded by concentric glass rings; horizontal glass pieces above and below; a beam leaving to the right; the lens sits on a platform floating in a trough of liquid; beneath it a vertical shaft and a gear linked by a cord to a hanging block.',
            imageHotspots: [
              { questionNumber: 20, x: 50, y: 39 },
              { questionNumber: 21, x: 72, y: 36 },
              { questionNumber: 22, x: 33, y: 16 },
              { questionNumber: 23, x: 88, y: 38 },
              { questionNumber: 24, x: 68, y: 76 },
              { questionNumber: 25, x: 50, y: 88 },
              { questionNumber: 26, x: 62, y: 97 },
            ],
            questions: [
              { number: 20, answer: { accepted: ['lamp'] }, explanationHtml: 'Paragraph 4: "Light from the lamp".' },
              { number: 21, answer: { accepted: ['rings'] }, explanationHtml: 'Paragraph 3: "a series of concentric rings".' },
              { number: 22, answer: { accepted: ['prisms'] }, explanationHtml: 'Paragraph 4: "rings of glass prisms, positioned above and below".' },
              { number: 23, answer: { accepted: ['beam'] }, explanationHtml: 'Paragraph 5: "each focusing light into its own beam".' },
              { number: 24, answer: { accepted: ['mercury'] }, explanationHtml: 'Paragraph 6: "the lens was floated on a bath of mercury".' },
              { number: 25, answer: { accepted: ['clockwork'] }, explanationHtml: 'Paragraph 6: "driven by a clockwork mechanism".' },
              { number: 26, answer: { accepted: ['weights'] }, explanationHtml: 'Paragraph 6: "powered by heavy weights that slowly descended".' },
            ],
          },
        ],
      },
      {
        order: 3,
        title: 'Closing the hole in the sky',
        subtitle: 'Read the text and answer questions 27-40.',
        paragraphs: [
          { label: 'A', html: "<p>High in the atmosphere, between about fifteen and thirty-five kilometres above the Earth's surface, lies a layer of gas that makes life on land possible. Ozone, a form of oxygen, absorbs most of the ultraviolet radiation from the Sun that would otherwise damage the cells of plants and animals and cause skin cancer and eye disease in humans. In the 1970s and 1980s, scientists discovered that this protective layer was being destroyed by chemicals released by human activity, and the story of how the world responded has become one of the great success stories of environmental science.</p>" },
          { label: 'B', html: "<p>The chemicals responsible were chlorofluorocarbons, or CFCs. Invented in the 1920s, they were used in refrigerators, aerosol sprays and air-conditioning systems, and were regarded as ideal because they were cheap, non-toxic and did not react with other substances. In 1970, the Dutch chemist Paul Crutzen showed that certain nitrogen compounds could destroy ozone, raising for the first time the possibility that human activity could affect the ozone layer. Four years later, Mario Molina and his supervisor Sherwood Rowland, working in California, published a paper arguing that CFCs, precisely because they were so stable, would survive long enough to rise into the upper atmosphere, where ultraviolet light would break them apart and release chlorine that would destroy ozone.</p>" },
          { label: 'C', html: "<p>The chemical industry reacted with hostility. Manufacturers argued that the theory was unproven and that banning CFCs would cause enormous economic damage. Molina spent much of the following decade presenting evidence to politicians and the public. Some countries, including the United States, banned CFCs in aerosol sprays in the late 1970s, but their use in other products continued to grow.</p>" },
          { label: 'D', html: "<p>The decisive evidence came from Antarctica. Since the 1950s, scientists of the British Antarctic Survey had been measuring ozone levels at a research station, using a ground-based instrument. In the early 1980s, Joe Farman and his colleagues noticed that the levels each spring were falling dramatically. At first they suspected that their old instrument was faulty, and they obtained a new one, which gave the same results. When they published their findings in 1985, showing that springtime ozone had fallen by around a third, the news caused a sensation. Satellites had not detected the change because their data-processing software had been designed to reject extremely low readings as errors.</p>" },
          { label: 'E', html: "<p>Why was the loss so severe over Antarctica in particular? The answer was provided by the American chemist Susan Solomon, who proposed in 1986 that the extremely cold conditions of the Antarctic winter produce clouds high in the atmosphere, on whose surfaces chemical reactions convert chlorine into highly reactive forms. When sunlight returns in the spring, these forms destroy ozone very rapidly. Solomon led an expedition to Antarctica the following year that collected measurements supporting her theory.</p>" },
          { label: 'F', html: "<p>The political response was unusually fast. In 1987, just two years after Farman's paper, governments agreed the Montreal Protocol, which set out a timetable for reducing the production of CFCs. As the evidence became stronger, the agreement was revised several times to speed up the process, and eventually almost every country in the world signed it. Industry, which had resisted regulation, developed substitute chemicals more quickly than expected once it became clear that the ban was inevitable.</p>" },
          { label: 'G', html: "<p>In 1995, Crutzen, Molina and Rowland were jointly awarded the Nobel Prize in Chemistry for their work. The ozone layer, however, is recovering only slowly, because CFCs already released remain in the atmosphere for many decades. Scientists currently expect the Antarctic ozone hole to recover to 1980 levels around the middle of the century. Progress is monitored closely, and in recent years researchers have detected emissions of banned chemicals from a small number of factories, a reminder that international agreements depend on effective checks as well as good intentions.</p>" },
          { label: 'H', html: "<p>The ozone story is often held up as a model for dealing with climate change, but the comparison has limits. CFCs were produced by a relatively small number of companies, substitutes were available, and the cost of change was modest. Carbon dioxide, by contrast, is produced by almost every part of the world economy. Nevertheless, the example shows that international cooperation based on scientific evidence can succeed, and there has been an unexpected benefit: because many CFCs are also powerful greenhouse gases, the Montreal Protocol has done more to slow global warming than many agreements designed specifically for that purpose.</p>" },
        ],
        questionGroups: [
          {
            id: 't45-r3-matchinfo',
            type: 'matching_information',
            instructionHtml: 'Reading Passage 3 has eight paragraphs, A-H. Which paragraph contains the following information? <em>Choose the correct letter, A-H.</em>',
            questions: [
              { number: 27, promptHtml: 'a reason why a change in the atmosphere was missed by one type of equipment', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph D: satellite software "had been designed to reject extremely low readings as errors".', locatorParagraph: 'D' },
              { number: 28, promptHtml: 'the harmful effects of ultraviolet radiation', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph A: it would "damage the cells of plants and animals and cause skin cancer and eye disease".', locatorParagraph: 'A' },
              { number: 29, promptHtml: 'an unintended advantage of an international agreement', answer: { accepted: ['H'] }, explanationHtml: 'Paragraph H: "there has been an unexpected benefit ... to slow global warming".', locatorParagraph: 'H' },
            ],
          },
          {
            id: 't45-r3-table',
            type: 'table_completion',
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml: table(
              ['Date', 'Event'],
              [
                ['1920s', 'CFCs invented; used in refrigerators, {{q30}} sprays and air-conditioning'],
                ['1970', 'nitrogen compounds shown to destroy ozone'],
                ['1974', 'paper argues that ultraviolet light releases {{q31}} from CFCs'],
                ['late 1970s', 'some countries ban CFCs in sprays'],
                ['1985', 'Antarctic ozone found to have fallen by about a {{q32}}'],
                ['1986', 'theory that high {{q33}} help to convert chlorine'],
                ['1987', 'Montreal Protocol sets a {{q34}} for reducing CFCs'],
                ['1995', 'three scientists receive a Nobel {{q35}}'],
                ['mid-century', 'expected {{q36}} of the Antarctic ozone layer'],
              ]
            ),
            questions: [
              { number: 30, answer: { accepted: ['aerosol'] }, explanationHtml: 'Paragraph B: "used in refrigerators, aerosol sprays and air-conditioning systems".', locatorParagraph: 'B' },
              { number: 31, answer: { accepted: ['chlorine'] }, explanationHtml: 'Paragraph B: ultraviolet light "would break them apart and release chlorine".', locatorParagraph: 'B' },
              { number: 32, answer: { accepted: ['third'] }, explanationHtml: 'Paragraph D: "springtime ozone had fallen by around a third".', locatorParagraph: 'D' },
              { number: 33, answer: { accepted: ['clouds'] }, explanationHtml: 'Paragraph E: cold conditions "produce clouds high in the atmosphere".', locatorParagraph: 'E' },
              { number: 34, answer: { accepted: ['timetable'] }, explanationHtml: 'Paragraph F: "a timetable for reducing the production of CFCs".', locatorParagraph: 'F' },
              { number: 35, answer: { accepted: ['prize'] }, explanationHtml: 'Paragraph G: "jointly awarded the Nobel Prize in Chemistry".', locatorParagraph: 'G' },
              { number: 36, answer: { accepted: ['recovery'] }, explanationHtml: 'Paragraph G: expected "to recover to 1980 levels around the middle of the century".', locatorParagraph: 'G' },
            ],
          },
          {
            id: 't45-r3-people',
            type: 'matching_features',
            instructionHtml: 'Look at the following statements and the list of scientists below. Match each statement with the correct scientist, <strong>A-D</strong>.',
            bank: [
              { key: 'A', text: 'Paul Crutzen' },
              { key: 'B', text: 'Mario Molina' },
              { key: 'C', text: 'Joe Farman' },
              { key: 'D', text: 'Susan Solomon' },
            ],
            questions: [
              { number: 37, promptHtml: 'replaced a piece of equipment because the results seemed wrong', answer: { accepted: ['C'] }, explanationHtml: 'Paragraph D: Farman\'s team "suspected that their old instrument was faulty, and they obtained a new one".', locatorParagraph: 'D' },
              { number: 38, promptHtml: 'travelled to Antarctica to collect evidence for a theory', answer: { accepted: ['D'] }, explanationHtml: 'Paragraph E: Solomon "led an expedition to Antarctica".', locatorParagraph: 'E' },
              { number: 39, promptHtml: 'spent years trying to persuade politicians of a danger', answer: { accepted: ['B'] }, explanationHtml: 'Paragraph C: "Molina spent much of the following decade presenting evidence to politicians".', locatorParagraph: 'C' },
              { number: 40, promptHtml: 'first suggested that human activity could damage the ozone layer', answer: { accepted: ['A'] }, explanationHtml: 'Paragraph B: Crutzen\'s 1970 work raised "for the first time the possibility".', locatorParagraph: 'B' },
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
        contextText: 'You will hear a woman phoning to ask about a cookery holiday in Italy.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Good morning, Taste of Tuscany holidays, Luca speaking." },
          { speaker: 'B', voice: 'zira', text: "Hello. I'm interested in one of your cookery holidays, and I'd like some more information." },
          { speaker: 'A', voice: 'david', text: "Of course. Which course were you thinking of?" },
          { speaker: 'B', voice: 'zira', text: "The one called 'Pasta and More'. Is that suitable for beginners?" },
          { speaker: 'A', voice: 'david', text: "Yes, it's our most popular course for beginners. It lasts a week, and you learn to make fresh pasta, sauces, and some simple desserts." },
          { speaker: 'B', voice: 'zira', text: "Where does it take place?" },
          { speaker: 'A', voice: 'david', text: "In an old farmhouse near the town of Montalba, about an hour from Florence. The kitchen is in what used to be the barn." },
          { speaker: 'B', voice: 'zira', text: "And where would I stay?" },
          { speaker: 'A', voice: 'david', text: "In the farmhouse itself. All the rooms have their own bathroom, and most have a view of the vineyard." },
          { speaker: 'B', voice: 'zira', text: "Lovely. How many people are on each course?" },
          { speaker: 'A', voice: 'david', text: "A maximum of twelve, so everyone gets plenty of attention." },
          { speaker: 'B', voice: 'zira', text: "And how much is it?" },
          { speaker: 'A', voice: 'david', text: "It's one thousand two hundred and fifty euros per person, for the whole week." },
          { speaker: 'B', voice: 'zira', text: "What does that include?" },
          { speaker: 'A', voice: 'david', text: "All your meals, the classes, and wine with dinner. There's also a trip to a local market, where the chef shows you how to choose ingredients. The only thing not included is your flight, and transport from the airport. But we can arrange a taxi if you let us know your arrival time." },
          { speaker: 'B', voice: 'zira', text: "OK. Is there anything I need to bring?" },
          { speaker: 'A', voice: 'david', text: "We provide aprons and all the equipment, so you don't need to bring anything for the classes. But I'd suggest comfortable shoes, because you'll be standing for quite a long time. And a notebook, if you want to write down the recipes, although we do send them to you by email afterwards." },
          { speaker: 'B', voice: 'zira', text: "Good. And when are the next courses?" },
          { speaker: 'A', voice: 'david', text: "There's one starting on the fourteenth of May, but that's almost full. The next one after that starts on the eleventh of June." },
          { speaker: 'B', voice: 'zira', text: "June would be better for me. How do I book?" },
          { speaker: 'A', voice: 'david', text: "You can book online, and you'll need to pay a deposit of three hundred euros. The rest is due six weeks before the start date." },
        ],
        questionGroups: [
          {
            id: 't45-l1-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            wordLimit: { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' },
            stemHtml:
              '<p><strong>Cookery holiday: \'Pasta and More\'</strong></p>' +
              '<p>Location: farmhouse near {{q1}}; the kitchen was formerly a {{q2}}<br/>Rooms: own bathroom; most have a view of the {{q3}}<br/>Maximum group size: {{q4}}<br/>Price: €{{q5}} per person</p>' +
              '<p><em>Included</em><br/>• meals, classes and wine<br/>• a trip to a local {{q6}}<br/>• not included: flight and transport from the airport (a {{q7}} can be arranged)</p>' +
              '<p><em>What to bring</em><br/>• comfortable {{q8}} and a notebook</p>' +
              '<p><em>Booking</em><br/>• next available course: {{q9}} June<br/>• deposit: €{{q10}}</p>',
            questions: [
              { number: 1, answer: { accepted: ['montalba'] }, explanationHtml: '"near the town of Montalba".' },
              { number: 2, answer: { accepted: ['barn'] }, explanationHtml: '"The kitchen is in what used to be the barn."' },
              { number: 3, answer: { accepted: ['vineyard'] }, explanationHtml: '"most have a view of the vineyard".' },
              { number: 4, answer: { accepted: ['12', 'twelve'] }, explanationHtml: '"A maximum of twelve".' },
              { number: 5, answer: { accepted: ['1250', '1,250'] }, explanationHtml: '"one thousand two hundred and fifty euros per person".' },
              { number: 6, answer: { accepted: ['market'] }, explanationHtml: '"a trip to a local market".' },
              { number: 7, answer: { accepted: ['taxi'] }, explanationHtml: '"we can arrange a taxi".' },
              { number: 8, answer: { accepted: ['shoes'] }, explanationHtml: '"I\'d suggest comfortable shoes".' },
              { number: 9, answer: { accepted: ['11', '11th', 'eleventh'] }, explanationHtml: '"The next one after that starts on the eleventh of June."' },
              { number: 10, answer: { accepted: ['300', 'three hundred'] }, explanationHtml: '"a deposit of three hundred euros".' },
            ],
          },
        ],
      },
      {
        order: 2,
        contextText: 'You will hear a student adviser giving new international students advice and information about the campus.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Hello, everyone, and welcome to Northgate University. I'm Fiona, from the International Student Office. I'm going to give you a few pieces of advice and then show you where the main buildings are." },
          { speaker: 'A', voice: 'zira', text: "First, please make sure you register with a doctor in your first week. Don't wait until you're ill. You can do it at the health centre, and all you need is your student card." },
          { speaker: 'A', voice: 'zira', text: "Second, many students are surprised by how quickly the evenings get dark here in winter, so if you're walking home late, use the free night bus, which stops right outside the main gate." },
          { speaker: 'A', voice: 'zira', text: "Third, if you're finding your studies difficult, please don't keep it to yourself. Talk to your personal tutor. Every student has one, and that's what they're there for." },
          { speaker: 'A', voice: 'zira', text: "And finally, keep your receipts. If you need to make a claim on your insurance, for a lost laptop, for example, you'll need proof of what you paid." },
          { speaker: 'A', voice: 'zira', text: "Right, let's look at the map. We're at the main gate, at the bottom of the map. The two main paths cross in the middle of the campus: Main Avenue runs from west to east, and College Walk runs north from the main gate." },
          { speaker: 'A', voice: 'zira', text: "Just inside the main gate, on your left, is Reception, where you'll collect your student card. Opposite Reception, on the other side of College Walk, is the Health Centre, so that's easy to find." },
          { speaker: 'A', voice: 'zira', text: "If you turn left along Main Avenue, towards the west, the building at the far end, below the avenue, is the Sports Centre. It has a gym, a swimming pool and courts for badminton and tennis." },
          { speaker: 'A', voice: 'zira', text: "If you turn right, towards the east, the building at the end of Main Avenue, again below the avenue, is the Students' Union, with the shop and the café." },
          { speaker: 'A', voice: 'zira', text: "Now, going north along College Walk, past the crossroads. The large building on your left, west of College Walk, is the Library. It's open twenty-four hours a day during exam periods." },
          { speaker: 'A', voice: 'zira', text: "Opposite the library, on the right-hand side of College Walk, is the Science Building, where many of you will have lectures. And beyond the science building, next to the lake, there's a small cash machine, although most people just use their phones to pay." },
          { speaker: 'A', voice: 'zira', text: "Finally, in the far north-west corner of the campus, there's the International Student Office, where I work. Do come and see us any time. Our door is always open." },
        ],
        questionGroups: [
          {
            id: 't45-l2-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>Advice for new students</strong></p>' +
              '<p>• register with a {{q11}} in your first week<br/>• use the free night {{q12}} if walking home late<br/>• if studies are difficult, talk to your personal {{q13}}<br/>• keep {{q14}} in case of insurance claims</p>',
            questions: [
              { number: 11, answer: { accepted: ['doctor'] }, explanationHtml: '"make sure you register with a doctor in your first week".' },
              { number: 12, answer: { accepted: ['bus'] }, explanationHtml: '"use the free night bus".' },
              { number: 13, answer: { accepted: ['tutor'] }, explanationHtml: '"Talk to your personal tutor."' },
              { number: 14, answer: { accepted: ['receipts'] }, explanationHtml: '"keep your receipts".' },
            ],
          },
          {
            id: 't45-l2-map',
            type: 'map_label',
            instructionHtml: 'Label the map below. Choose the correct answer, <strong>A-H</strong>, for each numbered building.',
            imageUrl: CAMPUS_MAP,
            imageAlt: 'Campus map: the main gate is at the bottom; College Walk runs north from it and Main Avenue runs west to east, crossing in the middle. Reception is just inside the gate on the left. Unlabelled buildings: opposite Reception on the right, at the western end of Main Avenue below it, at the eastern end of Main Avenue below it, north-west of the crossroads, north-east of the crossroads, and in the far north-west corner. A lake lies in the north-east.',
            bank: [
              { key: 'A', text: 'Health Centre' },
              { key: 'B', text: 'Sports Centre' },
              { key: 'C', text: 'Students\' Union' },
              { key: 'D', text: 'Library' },
              { key: 'E', text: 'Science Building' },
              { key: 'F', text: 'International Student Office' },
              { key: 'G', text: 'Accommodation Office' },
              { key: 'H', text: 'Art Gallery' },
            ],
            imageHotspots: [
              { questionNumber: 15, x: 62, y: 66 },
              { questionNumber: 16, x: 18, y: 66 },
              { questionNumber: 17, x: 86, y: 66 },
              { questionNumber: 18, x: 36, y: 37 },
              { questionNumber: 19, x: 65, y: 39 },
              { questionNumber: 20, x: 17, y: 22 },
            ],
            questions: [
              { number: 15, answer: { accepted: ['A'] }, explanationHtml: '"Opposite Reception, on the other side of College Walk, is the Health Centre".' },
              { number: 16, answer: { accepted: ['B'] }, explanationHtml: '"the building at the far end [west], below the avenue, is the Sports Centre".' },
              { number: 17, answer: { accepted: ['C'] }, explanationHtml: '"the building at the end of Main Avenue [east] ... is the Students\' Union".' },
              { number: 18, answer: { accepted: ['D'] }, explanationHtml: '"The large building on your left, west of College Walk, is the Library."' },
              { number: 19, answer: { accepted: ['E'] }, explanationHtml: '"Opposite the library, on the right-hand side of College Walk, is the Science Building".' },
              { number: 20, answer: { accepted: ['F'] }, explanationHtml: '"in the far north-west corner ... the International Student Office".' },
            ],
          },
        ],
      },
      {
        order: 3,
        contextText: 'You will hear two psychology students, Hana and Josh, discussing a study about background music and concentration.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'zira', text: "Josh, have you read the study on background music that we're using for our project?" },
          { speaker: 'B', voice: 'david', text: "Yes, last night. It's quite short, but I think it's a good one to base our project on." },
          { speaker: 'A', voice: 'zira', text: "So, the researchers wanted to find out whether listening to music while studying helps or harms concentration. Who took part?" },
          { speaker: 'B', voice: 'david', text: "About ninety secondary school students, aged fifteen and sixteen. I'd assumed they'd use university students, because that's what most studies do, but they specifically wanted teenagers because they're the ones who study with music most." },
          { speaker: 'A', voice: 'zira', text: "That makes sense. And what did the students have to do?" },
          { speaker: 'B', voice: 'david', text: "They read a text about an unfamiliar topic, the history of a small island, and then answered questions on it. Some did it in silence, some with instrumental music, and some with songs with lyrics." },
          { speaker: 'A', voice: 'zira', text: "And the results?" },
          { speaker: 'B', voice: 'david', text: "The students who read in silence did best. The instrumental music group did almost as well. But the group who listened to songs with lyrics did much worse." },
          { speaker: 'A', voice: 'zira', text: "Did the researchers explain why?" },
          { speaker: 'B', voice: 'david', text: "They think it's because words in the songs compete with the words you're reading. The brain has to process both kinds of language at the same time." },
          { speaker: 'A', voice: 'zira', text: "What surprised me was that it made no difference whether the students liked the music or not." },
          { speaker: 'B', voice: 'david', text: "Me too. I'd have expected music you enjoy to be less distracting. And another interesting thing: the students who said they always studied with music believed they weren't affected, but their scores fell just as much." },
          { speaker: 'A', voice: 'zira', text: "So people aren't good at judging their own concentration. Did you find any weaknesses in the study?" },
          { speaker: 'B', voice: 'david', text: "The main one, I think, is that the reading session was only twenty minutes. Real studying often goes on for hours, and it's possible that music helps people keep going for longer, even if it reduces concentration a little." },
          { speaker: 'A', voice: 'zira', text: "Good point. And they only tested reading. Music might affect other tasks, like maths, differently." },
          { speaker: 'B', voice: 'david', text: "Right. So for our project, should we repeat the study exactly, or change something?" },
          { speaker: 'A', voice: 'zira', text: "I think we should change the task, to see if the results are the same for maths problems. That would be more interesting than just repeating it." },
          { speaker: 'B', voice: 'david', text: "I agree. And who should we test?" },
          { speaker: 'A', voice: 'zira', text: "It would be easiest to use students from our own course. We won't get permission to test school pupils in time." },
          { speaker: 'B', voice: 'david', text: "OK, and we'll need to think about which songs to use. The original study didn't say which ones they chose, which is a bit of a problem." },
          { speaker: 'A', voice: 'zira', text: "We could email the researchers and ask. Their contact details are on the paper." },
        ],
        questionGroups: [
          {
            id: 't45-l3-mc',
            type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, A, B or C.',
            questions: [
              { number: 21, promptHtml: 'Why did the researchers choose teenagers for their study?', options: [{ key: 'A', text: 'They were easier to find than university students.' }, { key: 'B', text: 'They often study while listening to music.' }, { key: 'C', text: 'They find it harder to concentrate than adults.' }], answer: { accepted: ['B'] }, explanationHtml: '"they specifically wanted teenagers because they\'re the ones who study with music most".' },
              { number: 22, promptHtml: 'What did the participants have to do?', options: [{ key: 'A', text: 'read a text and answer questions' }, { key: 'B', text: 'solve maths problems' }, { key: 'C', text: 'write a short essay' }], answer: { accepted: ['A'] }, explanationHtml: '"They read a text ... and then answered questions on it."' },
              { number: 23, promptHtml: 'Which group performed worst?', options: [{ key: 'A', text: 'the group working in silence' }, { key: 'B', text: 'the group listening to instrumental music' }, { key: 'C', text: 'the group listening to songs with lyrics' }], answer: { accepted: ['C'] }, explanationHtml: '"the group who listened to songs with lyrics did much worse".' },
              { number: 24, promptHtml: 'The researchers\' explanation for their results was that', options: [{ key: 'A', text: 'loud music causes stress.' }, { key: 'B', text: 'words in songs compete with the words being read.' }, { key: 'C', text: 'music makes people read faster.' }], answer: { accepted: ['B'] }, explanationHtml: '"words in the songs compete with the words you\'re reading".' },
              { number: 25, promptHtml: 'What surprised Hana?', options: [{ key: 'A', text: 'Liking the music made no difference.' }, { key: 'B', text: 'Instrumental music improved scores.' }, { key: 'C', text: 'Few students listened to music.' }], answer: { accepted: ['A'] }, explanationHtml: '"it made no difference whether the students liked the music or not".' },
              { number: 26, promptHtml: 'What did the study show about students who usually study with music?', options: [{ key: 'A', text: 'They performed better than others.' }, { key: 'B', text: 'They were unaware of its negative effect.' }, { key: 'C', text: 'They preferred instrumental music.' }], answer: { accepted: ['B'] }, explanationHtml: '"believed they weren\'t affected, but their scores fell just as much".' },
              { number: 27, promptHtml: 'According to Josh, the main weakness of the study was', options: [{ key: 'A', text: 'the small number of participants.' }, { key: 'B', text: 'the short length of the reading session.' }, { key: 'C', text: 'the choice of reading text.' }], answer: { accepted: ['B'] }, explanationHtml: '"the reading session was only twenty minutes".' },
              { number: 28, promptHtml: 'How will the students change the study for their project?', options: [{ key: 'A', text: 'by using a different type of task' }, { key: 'B', text: 'by using a longer text' }, { key: 'C', text: 'by using different music' }], answer: { accepted: ['A'] }, explanationHtml: '"we should change the task, to see if the results are the same for maths problems".' },
              { number: 29, promptHtml: 'Who will take part in the students\' project?', options: [{ key: 'A', text: 'school pupils' }, { key: 'B', text: 'students on their course' }, { key: 'C', text: 'members of the public' }], answer: { accepted: ['B'] }, explanationHtml: '"It would be easiest to use students from our own course."' },
              { number: 30, promptHtml: 'What problem do they have with the original study?', options: [{ key: 'A', text: 'The results were not published.' }, { key: 'B', text: 'The researchers cannot be contacted.' }, { key: 'C', text: 'The songs used were not identified.' }], answer: { accepted: ['C'] }, explanationHtml: '"The original study didn\'t say which ones they chose".' },
            ],
          },
        ],
      },
      {
        order: 4,
        contextText: 'You will hear part of a lecture about how octopuses change their appearance.',
        gapAfterSec: 30,
        transcriptLines: [
          { speaker: 'A', voice: 'david', text: "Today I'm going to talk about one of the most remarkable abilities in the animal kingdom: the way octopuses and their relatives can change their appearance in a fraction of a second." },
          { speaker: 'A', voice: 'david', text: "Many animals can change colour, but most do it slowly, over minutes or even days. An octopus can change the colour, pattern and even the texture of its skin in less than a second. It uses this ability mainly for camouflage, to hide from predators and to ambush prey, but also to communicate, for example to warn off rivals." },
          { speaker: 'A', voice: 'david', text: "How does it work? The key structures are cells in the skin called chromatophores. Each one is a small, elastic sac filled with coloured pigment, usually yellow, red or brown. The sac is surrounded by tiny muscles, which are controlled directly by nerves from the brain. When the muscles contract, they pull the sac open, so that the colour spreads across a larger area. When they relax, the sac shrinks to a tiny dot that's almost invisible." },
          { speaker: 'A', voice: 'david', text: "Because they're controlled by nerves rather than hormones, chromatophores can be switched on and off extremely quickly, which explains the speed of the change." },
          { speaker: 'A', voice: 'david', text: "Beneath the chromatophores are other layers of cells that don't contain pigment but reflect light. Some produce shimmering blue and green colours, similar to those seen on a soap bubble. Others simply reflect whatever light falls on them, so that the skin takes on the colour of its surroundings." },
          { speaker: 'A', voice: 'david', text: "Octopuses can also change the texture of their skin. By controlling small muscles, they can raise bumps and spikes called papillae, which allow them to imitate the rough surface of a rock or the shape of seaweed." },
          { speaker: 'A', voice: 'david', text: "Some species go further still. The mimic octopus, discovered off the coast of Indonesia in the late nineteen nineties, can imitate the appearance and movement of other, more dangerous animals, such as poisonous fish and sea snakes, apparently choosing the one most likely to frighten a particular predator." },
          { speaker: 'A', voice: 'david', text: "Now, here's the puzzle. Tests suggest that octopuses are colourblind. Their eyes contain only one type of light-sensitive cell, whereas humans have three. So how do they match colours they apparently can't see?" },
          { speaker: 'A', voice: 'david', text: "There are several theories. One is that the unusual shape of the pupil might allow the eye to separate colours in a different way. Another, which has attracted a lot of interest, is based on the discovery that octopus skin contains the same light-sensitive proteins that are found in the eye. This suggests that the skin itself may be able to detect light, and possibly help the animal to respond to its surroundings." },
          { speaker: 'A', voice: 'david', text: "Finally, this research has practical applications. Engineers are studying octopus skin to develop materials that can change colour, which could be used for camouflage clothing, or for screens that use very little energy." },
        ],
        questionGroups: [
          {
            id: 't45-l4-notes',
            type: 'note_completion',
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
            stemHtml:
              '<p><strong>How octopuses change their appearance</strong></p>' +
              '<p><em>Uses</em>: camouflage, and {{q31}} with other octopuses</p>' +
              '<p><em>Chromatophores</em><br/>• sacs containing coloured {{q32}}<br/>• opened by tiny {{q33}}<br/>• controlled by {{q34}}, not hormones, so changes are fast</p>' +
              '<p><em>Other layers</em><br/>• some produce colours like those on a soap {{q35}}</p>' +
              '<p><em>Texture</em><br/>• papillae imitate rocks or {{q36}}</p>' +
              '<p><em>Mimic octopus</em><br/>• copies dangerous animals such as fish and sea {{q37}}</p>' +
              '<p><em>Puzzle</em><br/>• octopuses seem to be {{q38}}<br/>• the {{q39}} may be able to detect light</p>' +
              '<p><em>Applications</em><br/>• clothing and energy-saving {{q40}}</p>',
            questions: [
              { number: 31, answer: { accepted: ['communication', 'communicate', 'communicating'] }, explanationHtml: '"but also to communicate".' },
              { number: 32, answer: { accepted: ['pigment'] }, explanationHtml: '"a small, elastic sac filled with coloured pigment".' },
              { number: 33, answer: { accepted: ['muscles'] }, explanationHtml: '"When the muscles contract, they pull the sac open".' },
              { number: 34, answer: { accepted: ['nerves'] }, explanationHtml: '"they\'re controlled by nerves rather than hormones".' },
              { number: 35, answer: { accepted: ['bubble'] }, explanationHtml: '"similar to those seen on a soap bubble".' },
              { number: 36, answer: { accepted: ['seaweed'] }, explanationHtml: '"the rough surface of a rock or the shape of seaweed".' },
              { number: 37, answer: { accepted: ['snakes'] }, explanationHtml: '"poisonous fish and sea snakes".' },
              { number: 38, answer: { accepted: ['colourblind', 'colorblind'] }, explanationHtml: '"Tests suggest that octopuses are colourblind."' },
              { number: 39, answer: { accepted: ['skin'] }, explanationHtml: '"the skin itself may be able to detect light".' },
              { number: 40, answer: { accepted: ['screens'] }, explanationHtml: '"screens that use very little energy".' },
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
        '<p>The chart below shows the percentage of household waste that was recycled in five cities in 2010 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
      chart: {
        chartType: 'bar',
        title: 'Household waste recycled (%)',
        unit: '%',
        categories: ['City A', 'City B', 'City C', 'City D', 'City E'],
        xAxisLabel: 'City',
        yAxisLabel: 'Percentage recycled',
        series: [
          { name: '2010', data: [22, 35, 18, 41, 12] },
          { name: '2020', data: [47, 52, 21, 58, 39] },
        ],
      },
    },
    task2: {
      order: 2,
      minWords: 250,
      recommendedMin: 40,
      promptHtml:
        '<p>Some people think that public transport in cities should be free for everyone.</p><p>To what extent do you agree or disagree?</p>',
    },
  },
};
