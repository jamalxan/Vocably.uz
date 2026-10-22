// Vocably Reading 145 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-145',
  title: 'Reading 145: The Yak',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'yak', title: 'The Yak', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r145-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'In the Tibetan language, the word yak is used for animals of both sexes.', 'FALSE', 'Paragraph B: "In Tibetan and Balti it refers only to the male of the species".', 'B'),
              q(2, 'Some scientists think the yak is closer to the bison than to other species in its own genus.', 'TRUE', 'Paragraph C: "there is some suggestion that it may be more closely related to bison than to the other members of its designated genus".', 'C'),
              q(3, 'Linnaeus studied living yaks before he named the species.', 'NOT GIVEN', 'Paragraph D: "The species was originally designated as Bos grunniens" by Linnaeus in 1766, but nothing is said about how he came to name it.', 'D'),
              q(4, 'Wild yaks show more variety in colour than domestic yaks.', 'FALSE', 'Paragraph E: "While wild yaks are generally dark, blackish to brown in colouration, domestic yaks can be quite variable".', 'E'),
              q(5, 'Przhevalsky was mistaken in thinking that wild yaks make no sound.', 'TRUE', 'Paragraph H: "Nikolay Przhevalsky named the wild variant Bos mutus (silent bull), believing that it did not make a sound at all, but it does."', 'H'),
            ],
          },
          {
            id: 'r145-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Physical features of the yak</strong></p><ul><li>Horns of bulls: sweep outwards, then curve back; up to {{q6}} cm long</li><li>Hump over the shoulders: present in both sexes but bigger in {{q7}}</li><li>Weight of wild bulls: as much as {{q8}} kg</li><li>Tail: long and {{q9}}, not tufted like the tail of cattle</li></ul>',
            questions: [
              q(6, null, '99', 'Paragraph E: the horns of bulls "typically range from 48 to 99 cm (19 to 39 in) in length".', 'E'),
              q(7, null, ['males', 'bulls'], 'Paragraph F: "Both sexes have a short neck with a pronounced hump over the shoulders, although this is larger and more visible in males."', 'F'),
              q(8, null, ['1,000', '1000'], 'Paragraph F: "Wild (feral) yaks can be substantially heavier, bulls reaching weights of up to 1,000 kg (2,200 lb)."', 'F'),
              q(9, null, 'horselike', 'Paragraph G: "The tail is long and horselike rather than tufted like the tails of cattle or bison."', 'G'),
            ],
          },
          {
            id: 'r145-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'According to the passage, one reason yaks cope well at high altitude is that they', ['have thicker skulls than other cattle.', 'keep a form of haemoglobin that other cattle have only before birth.', 'breathe more slowly than lowland cattle.', 'have a larger number of sweat glands.'], 'B', 'Paragraph I: yaks have "greater capacity for transporting oxygen through their blood, due to the persistence of foetal haemoglobin throughout life".', 'I'),
              mc(11, 'What problem do yaks have at lower altitudes?', ['They cannot find the right kind of grass.', 'They lose their thick coats.', 'They are likely to overheat.', 'They become unusually aggressive.'], 'C', 'Paragraph I: "yaks have trouble thriving at lower altitudes, and are prone to suffering from heat exhaustion above about 15 °C (59 °F)".', 'I'),
              mc(12, 'Compared with domestic cattle, yaks', ['need to eat three times as much food.', 'can get more nourishment from poor-quality food.', 'have an unusually small rumen.', 'prefer shrubs to grass.'], 'B', 'Paragraph J: the large rumen "likely allows them to consume greater quantities of low-quality food at a time, and to ferment it longer to extract more nutrients".', 'J'),
              mc(13, 'During the mating season, bull yaks', ['remain with the main herd throughout the year.', 'avoid any direct contact with their rivals.', 'roll in dry earth in the same way as bison.', 'are receptive for only a few hours.'], 'C', 'Paragraph K: "Like bison, but unlike cattle, males wallow in dry soil during the rut, often while scent-marking with urine or dung."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
