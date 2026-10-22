// Vocably Reading 162 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-162',
  title: 'Reading 162: The Dead Sea Scrolls',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'dead-sea-scrolls', title: 'The Dead Sea Scrolls', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r162-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to the passage, why are the Dead Sea Scrolls so important for the study of religious history?', ['They contain the earliest surviving copies of whole books that became part of the Bible.', 'They were written by the founders of Christianity.', 'They prove that Rabbinic Judaism existed before the Second Temple period.', 'They are the only manuscripts ever found in the Judaean Desert.'], 'A', 'Paragraph A: "the Dead Sea Scrolls include the oldest surviving manuscripts of entire books later included in the various Jewish and Christian biblical canons".', 'A'),
              mc(2, 'On what does Israel mainly base its claim to the scrolls?', ['the location of the caves inside Israeli territory', 'the importance of the scrolls in Jewish history and heritage', 'an agreement signed with Jordan after 1967', 'the fact that Israeli archaeologists discovered them'], 'B', 'Paragraph B: "Israel\'s claims are primarily based on historical and religious grounds, given their significance in Jewish history and in the heritage of Judaism".', 'B'),
              mc(3, 'What does the passage say about the condition of the scrolls?', ['Most of the manuscripts have survived almost complete.', 'All of the fragments were damaged by human activity.', 'The damaged fragments have not yet been published.', 'Only a small number of manuscripts are nearly whole.'], 'D', 'Paragraph C: "a small number of well-preserved and nearly intact manuscripts have survived—fewer than a dozen among those from the Qumran Caves".', 'C'),
              mc(4, 'What is the significance of the bronze coins found at the sites?', ['They show that the scrolls were written by Hasmonean rulers.', 'They prove the scrolls were made after the First Jewish–Roman War.', 'They back up other methods used to date the scrolls.', 'They indicate that the scrolls were bought and sold.'], 'C', 'Paragraph D: the coins form a series "supporting the paleography and radiocarbon dating of the scrolls".', 'D'),
            ],
          },
          {
            id: 'r162-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'All of the scrolls were found within a single year.', 'FALSE', 'Paragraph A: "They were discovered over a period of ten years, between 1946 and 1956".', 'A'),
              q(6, 'Most of the fragments have appeared in print in a multi-volume publication.', 'TRUE', 'Paragraph C: "most have been published, together with the details of their discovery, in the 40-volume Discoveries in the Judaean Desert".', 'C'),
              q(7, 'Scholars are unanimous that the Essenes wrote the scrolls.', 'FALSE', 'Paragraph C: "some recent interpretations have challenged this connection and argue that priests in Jerusalem or other unknown Jewish groups wrote the scrolls".', 'C'),
              q(8, 'The scroll made of copper is the most valuable item in the collection.', 'NOT GIVEN', 'Paragraph D says only that "Most of the texts are written on parchment, some on papyrus, and one on copper" and gives no information about the value of any scroll.', 'D'),
              q(9, 'Keeping worn-out religious texts in jars reflects a long-standing Jewish practice.', 'TRUE', 'Paragraph H: "The practice of storing worn-out sacred manuscripts in earthenware vessels buried in the earth or within caves is related to the ancient Jewish custom of genizah."', 'H'),
            ],
          },
          {
            id: 'r162-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Nearly all of the scrolls and fragments are kept at the ______ in Jerusalem.', 'Israel Museum', 'Paragraph A: "Almost all of the 15,000 scrolls and scroll fragments are held in the Shrine of the Book at the Israel Museum in Jerusalem."', 'A'),
              q(11, 'The eleven caves lie close to a Hellenistic Jewish settlement at ______.', 'Khirbet Qumran', 'Paragraph C: "which lie in the immediate vicinity of the Hellenistic Jewish settlement at the site of Khirbet Qumran".', 'C'),
              q(12, 'Manuscripts in Latin were discovered at ______.', 'Masada', 'Paragraph D: "Other discoveries from the Judaean Desert add Latin (from Masada)".', 'D'),
              q(13, 'Around 30% of the texts were never ______ in the Hebrew Bible.', 'canonized', 'Paragraph E: "texts from the Second Temple period that ultimately were not canonized in the Hebrew Bible".', 'E'),
              q(14, 'Before standardisation around 100 CE, the biblical text showed considerable ______.', ['textual variation', 'variation'], 'Paragraph G: "while also revealing substantial textual variation and a fluid biblical-textual tradition before standardization around 100 CE".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
