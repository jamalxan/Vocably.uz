// Vocably Reading 127 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-127',
  title: 'Reading 127: Dreams',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'dream', title: 'What We Know About Dreams', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r127-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the passage say about where dreams come from in the brain?', ['They originate in a single region.', 'They are produced by several regions working together.', 'Scientists do not yet know.', 'They begin in the area responsible for vision.'], 'C', 'Paragraph B: "It is not known where in the brain dreams originate, if there is a single origin for dreams or if multiple regions of the brain are involved".', 'B'),
              mc(2, 'Why is it currently impossible to prove that animals dream?', ['Animals do not experience REM sleep.', 'A dream can only be studied through a verbal report.', 'Animals sleep for too short a time.', 'Brain activity in animals cannot be measured.'], 'B', 'Paragraph D: "To be studied, a dream must first be reduced to a verbal report" and therefore "dreaming by non-humans is currently unprovable".', 'D'),
              mc(3, 'In Old English, the word drēam', ['referred to a series of images during sleep.', 'was borrowed from Latin.', 'meant noise, joy or music.', 'was first used in the 13th century.'], 'C', 'Paragraph E: the word was used to describe noise, joy or music, "but not related to the sleep-induced brain activity".', 'E'),
              mc(4, 'How did the visitation dreams of ancient times differ from later dream experiences?', ['The dreamer mainly listened rather than took part.', 'They were usually about everyday life.', 'They were rarely written down.', 'The dreamer was always a ruler.'], 'A', 'Paragraph F: "dreamers were largely passive in their dreams, and visual content served primarily to frame authoritative auditory messaging".', 'F'),
            ],
          },
          {
            id: 'r127-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Write the correct letter, A-J.</em>',
            questions: [
              q(5, 'a comparison of how often pleasant and unpleasant feelings occur in dreams', 'H', 'Paragraph H: "Negative emotions were much more common than positive ones."', 'H'),
              q(6, 'a description of how the scenery of a dream keeps changing', 'I', 'Paragraph I: "different locations and objects continuously blend into each other".', 'I'),
              q(7, 'the effect of a worldwide health crisis on what people dreamed about', 'J', 'Paragraph J: "themes involving fear, illness, and death were two to four times more prevalent in dreams following the onset of the pandemic than they were before".', 'J'),
              q(8, 'an example of a ruler who acted on instructions received in a dream', 'F', 'Paragraph F: "Gudea, the king of the Sumerian city-state of Lagash (reigned c. 2144–2124 BCE), rebuilt the temple of Ningirsu as the result of a dream in which he was told to do so."', 'F'),
            ],
          },
          {
            id: 'r127-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The Hall studies</strong></p><ul><li>Between the 1940s and 1985 Calvin S. Hall gathered more than {{q9}} dream reports</li><li>1966: Hall and Van de Castle published a {{q10}} for analysing 1,000 reports from students</li><li>Hall\'s complete reports were released to the public in the mid-1990s by {{q11}}</li><li>Most frequent emotion in dreams: {{q12}}</li><li>Sexual dreams: no more than 10% of dreams; most common among young to {{q13}}</li></ul>',
            questions: [
              q(9, null, ['50,000', '50000'], 'Paragraph G: "From the 1940s to 1985, Calvin S. Hall collected more than 50,000 dream reports at Western Reserve University."', 'G'),
              q(10, null, 'coding system', 'Paragraph G: "Hall and Robert Van de Castle published The Content Analysis of Dreams, outlining a coding system to study 1,000 dream reports from college students".', 'G'),
              q(11, null, ['William Domhoff', 'Domhoff'], 'Paragraph G: "Hall\'s complete dream reports were made publicly available in the mid-1990s by his protégé William Domhoff."', 'G'),
              q(12, null, 'anxiety', 'Paragraph H: "In the Hall study, the most common emotion experienced in dreams was anxiety."', 'H'),
              q(13, null, 'mid-teens', 'Paragraph H: "sexual dreams occur no more than 10% of the time and are more prevalent in young to mid-teens".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
