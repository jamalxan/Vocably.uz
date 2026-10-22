// Vocably Reading 168 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank, mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-168',
  title: 'Reading 168: Fog',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'fog', title: 'Fog: A Cloud at Ground Level', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r168-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs D, E, F, G, I and K from the list of headings below. <em>Write the correct number, i-ix.</em>',
            bank: bank([
              'How air pressure controls the depth of a fog layer',
              'The conditions and processes that create fog',
              'Fog that forms when wind carries moist air over a cold surface',
              'Why fog is a danger to aircraft',
              'Living organisms that grow inside fog',
              'Humidity: usually, but not always, the deciding factor',
              'Light rain and snow produced by fog',
              'The history of fog forecasting',
              'Methods used to clear fog from airports',
            ], true),
            questions: [
              q(1, 'Paragraph D', 'ii', 'Paragraph D: "Fog begins to form when water vapor condenses into tiny water droplets that are suspended in the air" and "Some examples of ways that water vapor is condensed include wind convergence into areas of upward motion".', 'D'),
              q(2, 'Paragraph E', 'vi', 'Paragraph E: "Fog normally occurs at a relative humidity near 100%" but "fog can form at lower humidities and can sometimes fail to form with relative humidity at 100%".', 'E'),
              q(3, 'Paragraph F', 'vii', 'Paragraph F: "Fog commonly produces precipitation in the form of drizzle or very light snow."', 'F'),
              q(4, 'Paragraph G', 'i', 'Paragraph G: "The thickness of a fog layer is largely determined by the altitude of the inversion boundary" and "The inversion boundary varies its altitude primarily in response to the weight of the air above it, which is measured in terms of atmospheric pressure."', 'G'),
              q(5, 'Paragraph I', 'v', 'Paragraph I: "The fog water bacteria have also been found to increase in cell volume and exhibit higher rates of active cell division compared to those in dry air, indicating in situ biological growth."', 'I'),
              q(6, 'Paragraph K', 'iii', 'Paragraph K: "Advection fog occurs when moist air passes over a cool surface by advection (wind) and is cooled."', 'K'),
            ],
          },
          {
            id: 'r168-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(7, 'Fog is a kind of low cloud that generally looks like ______.', 'stratus', 'Paragraph A: "Fog can be considered a type of low-lying cloud usually resembling stratus".', 'A'),
              q(8, 'Near the sea, fog forms when water vapour condenses on tiny pieces of ______.', 'salt', 'Paragraph B: "Sea fog, which shows up near bodies of saline water, is formed as water vapor condenses on bits of salt."', 'B'),
              q(9, 'By definition, fog cuts visibility to under ______.', ['1 km', '1 kilometre', 'one kilometre'], 'Paragraph C: "By definition, fog reduces visibility to less than 1 km (0.62 mi)".', 'C'),
              q(10, 'Drizzle turns into freezing drizzle when the temperature at the surface falls below the ______.', 'freezing point', 'Paragraph F: "Drizzle becomes freezing drizzle when the temperature at the surface drops below the freezing point."', 'F'),
            ],
          },
          {
            id: 'r168-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'What recent discovery about fog does the passage mention?', ['Fog contains more ice crystals than was previously thought.', 'Fog is an environment in which bacteria live and multiply.', 'Fog has become more frequent near large cities.', 'Fog is affected by human activities such as shipping.'], 'B', 'Paragraph A: "Recent atmospheric research indicates that fog also functions as an active aquatic ecosystem. Fog droplets harbor microbiomes where bacteria actively grow, divide, and interact with atmospheric chemistry."', 'A'),
              mc(12, 'What happens to the marine layer when the pressure above it falls?', ['It becomes warmer and drier.', 'It is pressed down towards the ground.', 'It disappears completely.', 'It may grow taller.'], 'D', 'Paragraph G: the marine layer "may expand upwards when the pressure above it is lowering".', 'G'),
              mc(13, 'How does the amount of bacteria in fog water compare with that in lakes and seas?', ['It is about the same.', 'It is far higher.', 'It is much lower.', 'It has never been measured.'], 'A', 'Paragraph H: "Fog water contains bacterial concentrations similar to those in continental or marine bodies of water."', 'H'),
              mc(14, 'What does the passage say about ground fog?', ['It always reaches up to the clouds above it.', 'It hides more than 60% of the sky.', 'It is sometimes only tens of centimetres deep.', 'It forms mainly when the wind is strong.'], 'C', 'Paragraph J: "in some cases the depth of the fog is on the order of tens of centimetres over certain kinds of terrain with the absence of wind".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
