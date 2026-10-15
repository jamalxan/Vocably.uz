// Vocably Reading 38 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-38',
  title: 'Reading 38: Ships of the Air',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'airship', title: 'Ships of the Air', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r38-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs B, D, E, F and G from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Two lifting gases and the drawbacks of each',
              'Three ways of keeping an airship in shape',
              'Why airships lost out, and what they are used for now',
              'The changing meaning of a word',
              'Balloons that stay attached to the ground, and their modern uses',
              'The company that gave its name to a type of aircraft',
              'Where the engines and crew are carried',
              'The dangers of flying in stormy weather',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'i', 'Paragraph B: hydrogen\'s "inherent flammability led to several fatal accidents", while helium "is not flammable, but is rare and relatively expensive".', 'B'),
              q(2, 'Paragraph D', 'ii', 'Paragraph D: "The main types of airship are non-rigid, semi-rigid, and rigid airships."', 'D'),
              q(3, 'Paragraph E', 'iii', 'Paragraph E: "their use declined as aeroplanes surpassed their capabilities" and "Since the 1960s, helium airships have been used where the ability to hover for extended periods outweighs the need for speed".', 'E'),
              q(4, 'Paragraph F', 'iv', 'Paragraph F: in the early years the word covered any navigable flying machine, but nowadays it "is used only for powered, dirigible balloons".', 'F'),
              q(5, 'Paragraph G', 'v', 'Paragraph G: "The term aerostat has also been used to indicate a tethered or moored balloon" and "aerostats can serve as platforms for telecommunications services".', 'G'),
            ],
          },
          {
            id: 'r38-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Early airships were filled with hydrogen because it', [
                'was safer than helium.',
                'lifted well and was easy to obtain.',
                'had recently been discovered in the United States.',
                'was lighter than hot air.',
              ], 'B', 'Paragraph B: "the lifting gas was hydrogen, due to its high lifting capacity and ready availability".', 'B'),
              mc(7, 'What does the writer say about helium?', [
                'It has been used by most airships built since the 1960s.',
                'It is slightly flammable.',
                'It was first found in large quantities in Europe.',
                'It is now cheap and widely available.',
              ], 'A', 'Paragraph B: "Most airships built since the 1960s have used helium, though some have used hot air."', 'B'),
              mc(8, 'Rigid airships are often called zeppelins because', [
                'Count Zeppelin invented the internal gas cells.',
                'they were all built in Germany.',
                'most of them were made by the company Count Zeppelin founded.',
                'Zeppelin also designed the Parseval airship.',
              ], 'C', 'Paragraph D: "the vast majority of rigid airships built were manufactured by the firm he founded, Luftschiffbau Zeppelin. As a result, rigid airships are often called zeppelins."', 'D'),
              mc(9, 'What happened to the USS Akron and the USS Macon?', [
                'They burned because they were filled with hydrogen.',
                'They were sold to the British navy.',
                'They crashed in France.',
                'They were destroyed in storms.',
              ], 'D', 'Paragraph E: "the 1933 and 1935 storm-related crashes of the twin airborne aircraft carrier U.S. Navy helium-filled rigids, the USS Akron and USS Macon respectively".', 'E'),
            ],
          },
          {
            id: 'r38-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'In which part of an airship are the engines and crew housed?', ['gondola', 'the gondola'], 'Paragraph C: "The engines, crew, and payload capacity necessary for the airship\'s operation are instead housed in the gondola".', 'C'),
              q(11, 'What kind of supporting structure is given as an example for a semi-rigid airship?', ['fixed keel', 'keel'], 'Paragraph D: "Semi-rigid airships maintain their shape by internal pressure, but have some form of supporting structure, such as a fixed keel".', 'D'),
              q(12, 'What did Frederick Handley Page call the smaller passenger airships in 1919?', ['air yachts'], 'Paragraph F: "In 1919 Frederick Handley Page was reported as referring to" ships of the air, "with smaller passenger types as" air yachts.', 'F'),
              q(13, 'What was the name of the Zeppelin company\'s early competitor?', ['Parseval'], 'Paragraph J: "although its early rival was the Parseval semi-rigid design".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
