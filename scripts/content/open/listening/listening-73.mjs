// Vocably Listening 73 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-73',
  title: 'Listening 73: Franklin D. Roosevelt',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-franklin-roosevelt',
        contextText: 'You will hear a talk about the early life and political career of Franklin D. Roosevelt.',
        questionGroups: [
          {
            id: 'l73-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Franklin D. Roosevelt</strong></p><p>FDR defeated Herbert Hoover in the election of {{q1}} by promising Americans a "new deal". He stayed in office for {{q2}} years, longer than any other president. The only child of wealthy parents, he went to Harvard and then studied law at {{q3}} University. He married Eleanor Roosevelt, the {{q4}} of President Theodore Roosevelt.</p>',
            questions: [
              q(1, null, '1932', 'The speaker says "FDR defeated Hoover in the election of 1932."'),
              q(2, null, ['12', 'twelve'], 'The speaker says "He remained in office for 12 years".'),
              q(3, null, 'Columbia', 'The speaker says "He also studied law at Columbia University in New York."'),
              q(4, null, 'niece', 'The speaker says "She was the niece of a politician FDR greatly respected: President Theodore Roosevelt."'),
            ],
          },
          {
            id: 'l73-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What was FDR\'s first political position?', ['assistant secretary of the Navy', 'member of the New York state senate', 'governor of New York', 'U.S. senator'], 'B', 'The speaker says "He left a job in a law office to serve in the New York state senate."'),
              mc(6, 'What happened to FDR in 1920?', ['He won a seat in the U.S. Senate.', 'He became vice president.', 'He ran for vice president and lost.', 'He became seriously ill.'], 'C', 'The speaker says he was nominated "to be its vice presidential candidate in 1920" and that "he and his partner lost the race".'),
              mc(7, 'Why did FDR hide the extent of his disability?', ['His doctors advised him to rest.', 'He thought voters would not accept a leader who could not walk.', 'His family asked him to keep it private.', 'He did not want to use a wheelchair.'], 'B', 'The speaker says "He did not think the public would accept a leader who could not even walk by himself."'),
            ],
          },
          {
            id: 'l73-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>FDR\'s return to politics</strong></p><p>{{q8}}: "walks" to the stage at the Democratic National Convention to nominate the governor of New York</p><p>↓</p><p>Four years later: elected {{q9}} of New York</p><p>↓</p><p>1932: appears in person at the Democratic convention to accept the {{q10}} for president</p><p>↓</p><p>Democrats win the White House and majorities in both houses of Congress</p>',
            questions: [
              q(8, null, '1924', 'The speaker says "FDR walked to the stage at the 1924 Democratic National Convention."'),
              q(9, null, 'governor', 'The speaker says "Four years later, FDR himself was elected governor of New York."'),
              q(10, null, 'nomination', 'The speaker says "He took the unusual step of appearing in person at the Democratic convention to accept his party\'s nomination."'),
            ],
          },
        ],
      }),
    ],
  },
};
