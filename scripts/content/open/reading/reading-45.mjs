// Vocably Reading 45 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1W = { maxWords: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-45',
  title: 'Reading 45: The Phonograph',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'phonograph', title: 'The Phonograph and the Record Player', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r45-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a legal ruling about the use of a product name', 'G', 'Paragraph G: "in 1910, an English court ruled that the term had become generic".', 'G'),
              q(2, 'how the earliest machines made the recorded sound loud enough to hear', 'A', 'Paragraph A: "the stylus vibrated a diaphragm that produced sound waves coupled to the open air through a flaring horn".', 'A'),
              q(3, 'an inventor who was inspired by a picture of part of the human body', 'J', 'Paragraph J: "he happened upon that customer\'s engraved illustration of the anatomy of the human ear".', 'J'),
              q(4, 'the distinction between several names for playback equipment', 'D', 'Paragraph D: "Each of these terms denotes distinct items."', 'D'),
              q(5, 'the period in which records became popular once again', 'C', 'Paragraph C: "records have undergone a revival since the late 2000s".', 'C'),
            ],
          },
          {
            id: 'r45-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What change is Emile Berliner credited with?', ['replacing cylinders with flat discs', 'introducing wax-coated cylinders', 'inventing a stylus that moved from side to side', 'adding electrical amplification to the phonograph'], 'A', 'Paragraph B: "Emile Berliner initiated the transition from phonograph cylinders to flat discs with a spiral groove".', 'B'),
              mc(7, 'According to the passage, why did the use of phonographs fall sharply in the 1980s?', ['8-track cartridges were introduced.', 'Cassettes and compact discs became popular.', 'Records became too expensive to produce.', 'People stopped listening to music at home.'], 'B', 'Paragraph C: "phonograph use declined sharply due to the popularity of cassettes and the rise of the compact disc".', 'C'),
              mc(8, 'In an electric record player, the movement of the stylus is', ['amplified by a horn.', 'recorded onto a tape.', 'changed into an electrical signal.', 'sent straight to the loudspeakers.'], 'C', 'Paragraph E: "the movements of the stylus are transformed into an electrical signal by a transducer".', 'E'),
              mc(9, 'What was Scott de Martinville trying to achieve with the phonautograph?', ['to play back recorded music', 'to improve on Edison\'s machine', 'to copy the way the human ear works', 'to print spoken words on paper'], 'C', 'Paragraph J: "aiming to build a device that could replicate the function of the human ear".', 'J'),
            ],
          },
          {
            id: 'r45-table', type: 'table_completion', wordLimit: W1W,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: table(['Term', 'What it refers to'], [
              ['turntable', 'a component that must be connected to a separate {{q10}} and speakers'],
              ['record changer', 'a machine that plays a {{q11}} of records one after another'],
              ['decks', 'turntables that a DJ uses together with a {{q12}}'],
              ['gramophone (Australian English)', 'only the old {{q13}} players that had to be wound up'],
            ], 'Record-playing terminology'),
            questions: [
              q(10, null, 'amplifier', 'Paragraph D: "a turntable refers to a component that is connected to a separate amplifier and speakers".', 'D'),
              q(11, null, 'stack', 'Paragraph D: "A record changer plays a stack of records in sequence."', 'D'),
              q(12, null, 'mixer', 'Paragraph E: "When integrated into a DJ setup with a mixer, turntables are colloquially known as" decks.', 'E'),
              q(13, null, 'mechanical', 'Paragraph I: gramophone "was restricted to the old mechanical" (wind-up) players.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
