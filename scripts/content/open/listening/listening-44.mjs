// Vocably Listening 44 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-44',
  title: 'Listening 44: Shadowing Native Speakers',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'improve-your-english-pronunciation-shadowing-others',
        contextText: 'You will hear an education programme about improving pronunciation by shadowing other speakers.',
        questionGroups: [
          {
            id: 'l44-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'At which university does Marla Yoshida teach?', ['University of California', 'California', 'Irvine'], 'The speaker says Yoshida is a teacher "at the University of California, Irvine".'),
              q(2, 'Apart from sounds, what does Yoshida say native speakers use to communicate?', ['pauses'], 'The speaker says "Native speakers also communicate by using pauses".'),
              q(3, 'How do English learners usually study pronunciation?', ['listening and repeating'], 'The speaker says learners often "study pronunciation by listening and repeating something from a recording".'),
            ],
          },
          {
            id: 'l44-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(4, 'According to Yoshida, what happens to the sounds a learner hears?', ['They are stored exactly as the speaker said them.', 'They are filtered through the sound system of the learner\'s own language.', 'They are forgotten within a few seconds.', 'They are only understood if they are repeated.'], 'B', 'Yoshida says "your brain interprets them or filters them through the sound system of your own language".'),
              mc(5, 'Why might native speakers have trouble understanding English learners?', ['Learners speak too quickly.', 'Learners use a narrow range of their voice.', 'Learners pause too often.', 'Learners emphasise every word.'], 'B', 'The speaker says native speakers might have difficulty "when learners use a narrow range of their voice".'),
              mc(6, 'What is the maximum length Yoshida suggests for a shadowing clip?', ['30 seconds', 'one minute', 'two minutes', 'five minutes'], 'C', 'Yoshida says the clip should be "at most two minutes long".'),
            ],
          },
          {
            id: 'l44-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>How to shadow a clip</strong></p><ul><li>listen a couple of times to get the {{q7}} and notice pauses, emphasis and intonation</li><li>{{q8}} the things you notice, then listen a few more times</li><li>start {{q9}} the speaker, trying to sound exactly like them</li><li>remember: English sentences usually put {{q10}} information at the end</li></ul>',
            questions: [
              q(7, null, 'meaning', 'Yoshida says "Listen to it a couple of times to get the meaning".'),
              q(8, null, 'mark', 'Yoshida says "mark things that you notice, then listen a few more times".'),
              q(9, null, 'imitating', 'Yoshida says "and then start imitating".'),
              q(10, null, 'new', 'The speaker says the end of a sentence is "the place where you usually find new information".'),
            ],
          },
        ],
      }),
    ],
  },
};
