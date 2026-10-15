// Vocably Reading 85 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-85',
  title: 'Reading 85: The Komodo Dragon',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'komodo-dragon', title: 'The Komodo Dragon', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r85-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a reference to a film that was inspired by an expedition', 'H', 'Paragraph H: "this expedition provided the inspiration for the 1933 movie King Kong".', 'H'),
              q(2, 'a traditional belief about a family link between people and the dragons', 'E', 'Paragraph E: "a traditional belief by the Komodo people that they share the same spiritual mother as the dragons".', 'E'),
              q(3, 'how young dragons avoid being eaten', 'C', 'Paragraph C: "dwell in trees to avoid predators, including cannibalistic adults, which young Komodo dragons also try to repel by rolling in feces".', 'C'),
              q(4, 'the first time living Komodo dragons were shown to the public in Europe', 'G', 'Paragraph G: "The first two live Komodo dragons to arrive in Europe were exhibited in the Reptile House at London Zoo when it opened in 1927."', 'G'),
              q(5, 'steps taken by colonial officials to stop the dragons being killed for sport', 'I', 'Paragraph I: "outlawed sport hunting and heavily limited the number of individuals taken for scientific study".', 'I'),
            ],
          },
          {
            id: 'r85-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Adult males can weigh as much as ______ kilograms.', '150', 'Paragraph A: "the males growing to a maximum length of 3 m (10 ft) and weighing up to 150 kg (330 lb)".', 'A'),
              q(7, 'As well as live prey, adult dragons eat a lot of ______.', 'carrion', 'Paragraph B: "though they also eat considerable amounts of carrion".', 'B'),
              q(8, 'The eggs hatch in April, when ______ are most abundant.', 'insects', 'Paragraph C: "hatching in April, when insects are most plentiful".', 'C'),
              q(9, 'The popular name "Komodo dragon" was invented by ______.', ['Burden', 'Douglas Burden'], 'Paragraph H: "It was also Burden who coined the common name".', 'H'),
            ],
          },
          {
            id: 'r85-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'Why is the Komodo dragon listed as Endangered?', ['Too many are taken for zoos.', 'The area where it lives is getting smaller.', 'It reproduces very slowly.', 'Adults kill large numbers of young.'], 'B', 'Paragraph D: "their range has been reduced by human encroachment and is likely to contract further from the effects of climate change; hence, they are listed as Endangered".', 'D'),
              mc(11, 'What made the Komodo dragon widely known after 1912?', ['A Dutch officer captured a live animal.', 'A museum director published a scientific paper.', 'A photograph was printed in a newspaper.', 'A collector sold specimens to a zoo.'], 'B', 'Paragraph F: "Widespread notoriety came after 1912, when Peter Ouwens, the director of the Zoological Museum of Bogor, Java, published a paper on the topic".', 'F'),
              mc(12, 'What happened to scientific collecting during the Second World War?', ['It was restricted to Dutch scientists.', 'It increased because of the military presence.', 'It came to a complete stop.', 'It concentrated on body temperature.'], 'C', 'Paragraph I: "Collecting expeditions ground to a halt with the occurrence of World War II".', 'I'),
              mc(13, 'What was the main effect of the Auffenberg family\'s research?', ['It helped people to raise the animals in captivity.', 'It revealed a new population on Flores.', 'It led directly to the creation of the national park.', 'It showed that the dragons were venomous.'], 'A', 'Paragraph J: "Research from the Auffenberg expedition proved enormously influential in raising Komodo dragons in captivity."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
