// Vocably Listening 59 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-59',
  title: 'Listening 59: Recording Yourself to Practise Speaking',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'try-these-activities-for-english-speaking-practice',
        contextText: 'You will hear a talk about two recording activities for improving your English speaking.',
        questionGroups: [
          {
            id: 'l59-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to William Stout, why does retelling a story help you speak more easily?', ['You do not have to form complex ideas.', 'The vocabulary is very simple.', 'You can learn the story by heart.', 'The story is about your own life.'], 'A', 'The speaker says "narrative storytelling frees your mind from forming complex ideas, which lets you speak more easily in English".'),
              mc(2, 'How long should the storytelling recording be?', ['less than one minute', 'three minutes or less', 'about five minutes', 'at least ten minutes'], 'B', 'The speaker says "aim for a recording of three minutes or fewer".'),
              mc(3, 'When listening to the recording, which mistakes can you find easily?', ['problems with individual sounds', 'wrong verb tenses and word endings', 'most vocabulary mistakes', 'every grammar error'], 'B', 'The speaker says "you can easily find some mistakes, such as wrong verb tenses, verb endings and noun endings".'),
            ],
          },
          {
            id: 'l59-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>The directions activity</strong></p><p>Choose a starting point you know well, e.g. your {{q4}} or a nearby station</p><p>↓</p><p>Choose a destination you often go to, e.g. the {{q5}}, your work place or a favourite restaurant</p><p>↓</p><p>Record yourself giving directions – no longer than one {{q6}}</p><p>↓</p><p>Use the {{q7}} form, which begins with a verb, e.g. "Turn right"</p>',
            questions: [
              q(4, null, 'home', 'The speaker says "choose a place that you know well, like your home or a nearby bus or train station".'),
              q(5, null, 'supermarket', 'The speaker says "choose a place you need to travel to more often, such as the supermarket".'),
              q(6, null, 'minute', 'The speaker says "The recording should not be longer than one minute."'),
              q(7, null, ['command', 'imperative'], 'The speaker says the activity is "a good way to employ the imperative form, also known as the command form".'),
            ],
          },
          {
            id: 'l59-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            questions: [
              q(8, 'Learners often make the mistake of adding the modal verb ______ to directions.', 'can', 'The speaker says to avoid adding the modal verb can, "which Oshiberu notes is a common mistake of English learners".'),
              q(9, 'Following your own recording on foot shows whether the directions were clear and ______.', 'accurate', 'The speaker says "This will let you know whether your directions were clear and accurate."'),
              q(10, 'To practise getting directions, change the ______ settings of your GPS to English.', 'language', 'The speaker says "she suggests changing the language settings on the GPS system to English".'),
            ],
          },
        ],
      }),
    ],
  },
};
