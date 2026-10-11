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
