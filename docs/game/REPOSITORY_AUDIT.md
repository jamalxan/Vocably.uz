# Repository Audit Report - Vocabulary World
**Date:** 2026-10-11
**Status:** Initial Baseline

## 1. Stack Validation
| Component | TZ Claim | Actual | Status | Evidence |
|---|---|---|---|---|
| Framework | Next.js 16 | Next.js 15.5.27 | **PARTIAL** | `package.json` |
| Database | PostgreSQL | MongoDB | **FAIL** | `src/lib/db.js` (mongoose) |
| ORM | Prisma | Mongoose | **FAIL** | `package.json` |
| Styling | Tailwind CSS 4 | Tailwind CSS 3.4.4 | **PARTIAL** | `package.json` |
| 3D Engine | R3F / Three.js | R3F / Three.js | **PASS** | `package.json` (three: 0.180.0, fiber: 9.8.1) |

## 2. Feature Audit (3D Game)
| Feature | Expected (TZ) | Actual | Status | Evidence |
|---|---|---|---|---|
| `/vocabulary-world` route | Present | Missing | **FAIL** | File system search |
| 3D Game Engine / Canvas | Present | Missing | **FAIL** | Grep for `GameCanvas`, `GameEngine` |
| Starter Island | Present | Missing | **FAIL** | File system search |
| Mini-Games (Runner, etc) | Present | Missing | **FAIL** | Grep results |
| Game Backend (API) | Present | Missing | **FAIL** | Grep for `/api/game` |
| SM-2 / SRS Logic | Present | Not found | **NOT VERIFIED** | Need to check `src/lib/vocab` |

## 3. Repository State
- **Git Status:** Clean baseline, but some uncommitted changes in `src/features/exam/speaking/SpeakingSection.tsx` and `src/lib/exam/types.ts`.
- **Uncommitted Files:** Several scripts in `scripts/content/open/` and `scripts/content/speakup/` are untracked.

## 4. Critical Risks
1. **Stack Mismatch:** The TZ assumes a SQL (Postgres/Prisma) stack, but the codebase is NoSQL (Mongo/Mongoose). This requires immediate adaptation of all database plans.
2. **Zero-State Implementation:** Contrary to previous reports, the 3D game logic is virtually non-existent in the current repository. I am building from scratch.
3. **Dependency Versions:** Tailwind 3 vs 4 and Next.js 15 vs 16. I will stick to the versions already in `package.json` to avoid breaking the rest of the platform.
