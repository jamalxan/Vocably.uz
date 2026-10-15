// Vocably Listening 33 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-33',
  title: 'Listening 33: Why the News Is Always Breaking',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'why-is-the-news-always-breaking',
        contextText: 'You will hear a talk about the meanings of the word "breaking" in the expressions "breaking news" and "breaking bad".',
        questionGroups: [
          {
            id: 'l33-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'For how long has "break" been used to mean making something known to the public?', ['about 75 years', 'more than 750 years', 'since television began', 'since the year 2016'], 'B', 'The speaker says "the word has been used this way for more than 750 years".'),
              mc(2, 'Why is it becoming harder for reporters to get a "scoop"?', ['There are fewer reporters than before.', 'Newsmakers can send messages to the public themselves.', 'Broadcasts are no longer interrupted.', 'Audiences have lost interest in the news.'], 'B', 'The speaker says "newsmakers and reporters can immediately send messages to the public".'),
              mc(3, 'In the past, why did reporters not use the words "breaking news"?', ['The phrase had not been invented.', 'It was obvious they were interrupting the programme.', 'They preferred the word "scoop".', 'Broadcasters did not allow it.'], 'B', 'The speaker says "it was clear they were breaking into the regular program".'),
            ],
          },
          {
            id: 'l33-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Breaking news today</strong></p><p>On many news programs the words "breaking news" now appear every {{q4}}, even when there is no real {{q5}} to the normal broadcast. The report is probably not an {{q6}} story. The Cambridge Dictionary defines breaking news as information about an event that has just happened or just {{q7}}.</p>',
            questions: [
              q(4, null, 'day', 'The speaker says "the words breaking news appear every day, without a real interruption to the normal broadcast".'),
              q(5, null, 'interruption', 'The speaker says "the words breaking news appear every day, without a real interruption to the normal broadcast".'),
              q(6, null, 'original', 'The speaker says "It is probably not an original story."'),
              q(7, null, 'begun', 'The speaker says "information that is being received and broadcast about an event that has just happened or just begun".'),
            ],
          },
          {
            id: 'l33-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'What was the job of the main character in Breaking Bad before he became a drug dealer?', ['chemistry teacher', 'teacher'], 'The speaker says the series "told the story of an average high school chemistry teacher who became a drug dealer".'),
              q(9, 'In which US state did Vince Gilligan grow up?', 'Virginia', 'The speaker says "When he was growing up in Southern Virginia, the term break bad meant to go wild".'),
              q(10, 'In the American South, what does "good old boys" mean?', ['local men', 'men'], 'The speaker says "good old boys refers to average local men".'),
            ],
          },
        ],
      }),
    ],
  },
};
