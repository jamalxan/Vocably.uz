// Vocably Reading 142 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-142',
  title: 'Reading 142: The Colosseum',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'colosseum', title: 'The Colosseum and Its Name', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r142-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What happened to the Colosseum after it stopped being used for public entertainment?', ['It was turned straight into a church.', 'It was put to a range of practical uses.', 'It was left empty and never entered again.', 'It was rebuilt as a palace for the Pope.'], 'B', 'Paragraph B: "It was later reused for such purposes as housing, workshops, quarters for a religious order, a fortress, a quarry, and a Christian shrine."', 'B'),
              mc(2, 'What does the passage say about the name Flavian Amphitheatre?', ['It was the official name chosen by the emperors who built it.', 'There is no proof that it was used in ancient times.', 'It was invented by the poet Byron.', 'It could only ever refer to the building in Rome.'], 'B', 'Paragraph D: "Though the modern name Flavian Amphitheatre (Latin: Amphitheatrum Flavium) is often used, there is no evidence it was used in classical antiquity."', 'D'),
              mc(3, 'According to the passage, the giant statue of Nero', ['was carved from stone in imitation of a Greek original.', 'stood beside the amphitheatre from the day the building opened.', 'was moved next to the amphitheatre by a later emperor.', 'had been destroyed by the year 1000.'], 'C', 'Paragraph E: "The giant bronze sculpture of Nero as a solar deity was moved to its position beside the amphitheatre by the emperor Hadrian (r. 117–138)."', 'E'),
              mc(4, 'The writer mentions Byron\'s poem as an example of', ['a work that describes the statue accurately.', 'the earliest use of the word Colosseum in English.', 'a text that confuses the statue with the building.', 'a prophecy about the fall of Rome.'], 'C', 'Paragraph F: "This is often mistranslated to refer to the Colosseum rather than the Colossus (as in, for instance, Byron\'s poem Childe Harold\'s Pilgrimage)."', 'F'),
            ],
          },
          {
            id: 'r142-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'The Colosseum was finished during the reign of the emperor who began it.', 'FALSE', 'Paragraph A: "Construction began under the Emperor Vespasian (r. 69–79 AD) in 72 and was completed in AD 80 under his successor and heir, Titus".', 'A'),
              q(6, 'Volcanic stone was one of the materials used to build the Colosseum.', 'TRUE', 'Paragraph B: the Colosseum "is built of travertine, Roman concrete (foundations, corridors vaults and secondary brick walls), and tuff (volcanic rock)".', 'B'),
              q(7, 'The Colosseum attracts more visitors than any other site in Italy.', 'NOT GIVEN', 'Paragraph C says only that "It is one of Rome\'s most popular tourist attractions"; no comparison with other Italian sites is made.', 'C'),
              q(8, 'The Flavian emperors built a second amphitheatre outside Rome.', 'TRUE', 'Paragraph D: "Vespasian and Titus, builders of the Colosseum, also constructed a Flavian Amphitheatre in Puteoli (modern Pozzuoli)".', 'D'),
              q(9, 'At the time the Pseudo-Bede was writing, the word coliseus meant the building.', 'FALSE', 'Paragraph F: "at the time that the Pseudo-Bede wrote, the masculine noun coliseus was applied to the statue rather than to the amphitheatre".', 'F'),
            ],
          },
          {
            id: 'r142-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'On average, the Colosseum held an audience of about ______ people.', ['65,000', '65000', 'some 65,000'], 'Paragraph B: "having an average audience of some 65,000".', 'B'),
              q(11, 'The Latin adjective colosseus has the meaning ______ or colossean.', 'gigantic', 'Paragraph E: "The word colosseum is a neuter Latin noun formed from the adjective colosseus" meaning "gigantic" or "colossean".', 'E'),
              q(12, 'By the year 1000, the amphitheatre was being called the Colosseum after the nearby ______.', ['Colossus Solis', 'Colossus'], 'Paragraph E: "By the year 1000 the Latin name" Colosseum "had been coined to refer to the amphitheatre from the nearby" Colossus Solis.', 'E'),
              q(13, 'The first recorded use of Colosseum in Early Modern English appears in a translation published in ______.', '1600', 'Paragraph H: "The earliest citation for the name Colosseum in Early Modern English is the 1600 translation, by Philemon Holland".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
