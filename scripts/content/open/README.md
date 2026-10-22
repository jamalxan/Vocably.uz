# Vocably Open Tests

Full IELTS-style practice tests (Reading 3×13-14, Listening 4×10, Writing 2 tasks) whose
**texts and audio come from openly licensed sources**. Questions, answer keys and Writing
prompts are written for Vocably.

| Section | Source | Licence | Stored in |
|---|---|---|---|
| Reading passages | Wikipedia (fixed revision, light edits) | CC BY-SA 4.0 — attribution shown in each passage subtitle | `sources/wiki/*.json` |
| Listening audio + transcript | VOA Learning English, **VOA-staff stories only** (no AP/Reuters/AFP material) | Public domain (U.S. Government work) | `sources/voa/*.json` (mp3 URL + transcript) |
| Writing Task 1 data | Our World in Data | CC BY 4.0 — noted in the task prompt | inline in `open-test-N.mjs` |

Each test's `rights.licenceNote` in the database lists every source URL.

## Adding a test

1. Add passage JSON (`sources/wiki/<slug>.json`: `article`, `url` with `oldid`, `paragraphs[{label,text}]`)
   and VOA JSON (`sources/voa/<key>.json`: `title`, `url`, `mp3`, `credit`, `paragraphs`).
2. Write `open-test-N.mjs` with `wikiPassage()` / `voaPart()` from `_lib.mjs`.
3. `node scripts/content/open/verify.mjs` — static checks: numbering 1-40, answer formats,
   word limits, every gap answer present in the passage/transcript, and every quoted piece
   of evidence in an explanation present verbatim (in the cited paragraph).
4. `node --env-file=.env --import tsx scripts/load-open-tests.mts --only=N --dry` — additionally:
   scores every key with the app's scorer, downloads and compresses the audio (40 kbps mono),
   decodes it fully, and transcribes it with Whisper (Groq) to confirm every answer and every
   quoted fact (including numbers) is actually **spoken** in the audio. Mismatches are re-checked
   on a cut clip of that segment before failing.
5. Run again without `--dry` to upload (GridFS, sha256 read-back) and publish.

`openTests.test.ts` re-runs the static, validator and scoring checks in the normal test suite.

## Full 40-question series (`reading-full-N`, `listening-full-N`) — composed, not written

Added 2026-10-22. Full-length Academic Reading tests (3 passages, 13+13+14 = 40 questions,
60 min) and Listening tests (4 parts × 10 = 40 questions) are **composed** from the section
files by `full/compose.mjs` according to `full/sets.json` (which section numbers form which
full test; `n` is stable because the slugs `vocably-reading-full-N` / `vocably-listening-full-N`
are published). Questions are renumbered 1..40 (`{{qN}}` placeholders, subtitle ranges, group
ids prefixed `p1-`…), everything else is byte-for-byte the section content, so a fix in a
section file flows into its full test on the next load.

- Extend the table after adding new section files: `node scripts/content/open/tools/full-sets-gen.mjs`
  (existing sets are never changed; it only adds sets from unused sections — Reading needs
  two 13-question and one 14-question passage per test with 2150-2750 words in total).
- Verify / test / load exactly like the other series: `--series=reading-full|listening-full`.
  Listening audio is the sections' static files (already live), so no new upload is needed.
- Once the full tests are published the section tests are unpublished
  (`tools/unpublish-sections.mts`); the section files stay as the source of the full tests.
- Both full series pass `isSectionMockEligible`, so they also feed the full-format mock pool.

## Reading series (`reading/reading-N.mjs`) and Listening series (`listening/listening-N.mjs`)

Section-only practice tests (added 2026-10-15; 100 + 100 planned). Same source rules and
the same `verify.mjs` / `load-open-tests.mts` / `openTests.test.ts` pipeline as the full tests.

| Series | File | Slug / title | Content | Timing |
|---|---|---|---|---|
| reading | `reading/reading-N.mjs` | `vocably-reading-N`, `Reading N: <Topic>` | **1** `wikiPassage()` (650-1000 words, ≥5 paragraphs), **13-14** questions numbered 1..13/14 in **3** question groups of different types | `reading.durationSec: 1200` |
| listening | `listening/listening-N.mjs` | `vocably-listening-N`, `Listening N: <Topic>` | **1** `voaPart()` (one VOA story, 3-9 min), **10** questions numbered 1..10 in 2-3 groups | `listening.checkTimeSec: 60`, `listening.audio: 'static'` |

Listening audio for this series is stored as a **static file** `public/audio/exam/open/<key>.mp3`
(Atlas has no room for more GridFS audio) — commit + push the mp3 first, the loader refuses to
publish a test whose audio URL is not live (`HEAD` must return 200 `audio/mpeg`).

Shape of a question group (see `reading/reading-1.mjs`, `open-test-11.mjs`, `open-test-5.mjs`):

```js
{ id: 'r7-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION, questions: [ q(6, 'statement', 'TRUE', 'Paragraph C: "verbatim quote".', 'C'), … ] }
{ id: 'r7-sent', type: 'sentence_completion', wordLimit: { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' }, instructionHtml: '…', questions: [ q(10, 'The ______ was …', ['answer', 'alt answer'], 'Paragraph D: "…".', 'D') ] }
{ id: 'r7-notes', type: 'note_completion', wordLimit: W1, instructionHtml: '…', stemHtml: '<p><strong>Title</strong></p><ul><li>… {{q11}} …</li></ul>', questions: [ q(11, null, 'answer', 'Paragraph E: "…".', 'E') ] }
{ id: 'r7-mc', type: 'multiple_choice_single', instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.', questions: [ mc(3, 'Question?', ['opt A', 'opt B', 'opt C', 'opt D'], 'B', 'Paragraph B: "…".', 'B') ] }   // mc() from ../../_html.mjs
{ id: 'r7-people', type: 'matching_features', bankReusable: false, instructionHtml: '…', bank: bank(['Name 1', 'Name 2', …]), questions: [ q(1, 'statement', 'B', 'Paragraph A: "…".', 'A') ] }
{ id: 'r7-info', type: 'matching_information', bankReusable: true, instructionHtml: 'The passage has seven paragraphs, A-G. Which paragraph contains…', questions: [ q(1, 'description', 'E', 'Paragraph E: "…".', 'E') ] }
{ id: 'r7-head', type: 'matching_headings', instructionHtml: '…', bank: bank(['Heading i', 'Heading ii', …], true), questions: [ q(1, 'Paragraph B', 'iii', 'Paragraph B: "…".', 'B') ] }
```

Hard rules enforced by `verify.mjs` (run it until it prints `0 ta xato`):
- numbering contiguous from 1; group ids unique across the file (prefix `rN-` / `lN-`);
- every explanation must contain the evidence in **double quotes, verbatim** from the cited
  paragraph (`locatorParagraph`) — reading: from `sources/wiki/<slug>.json`; listening: from the
  transcript in `sources/voa/<key>.json` (and the loader then checks it is actually *spoken*);
- gap answers (sentence/note/summary/table/flowchart/short_answer) must appear verbatim in the
  source and respect `wordLimit`; `stemHtml` must contain `{{qN}}` for every question and nothing extra;
- TFNG/YNNG answers only `TRUE|FALSE|NOT GIVEN` / `YES|NO|NOT GIVEN`; MC answer must be an option
  key; matching answers must be bank keys / paragraph labels; `sentence_completion` prompt needs `______`.
Authoring rules (not machine-checked — this is what makes the tests good):
- IELTS Academic style: paraphrase the passage in stems, never copy a sentence; distractors
  plausible; every question needs the passage (no general-knowledge answers); answers spread
  through the text in order where the type expects it (TFNG, completion); at least one real
  NOT GIVEN per TFNG group; MC with 4 options; vary the type mix between tests.
