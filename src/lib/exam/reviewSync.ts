// N-10 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — manually/admin-
// created `ExamTest` docs (JSON/DSL import, `POST`/`PATCH /api/admin/exam-
// tests`) have no `ContentBook` at all, so `worker/stages/validate.ts`'s
// `ReviewItem`-creation path (which requires `ctx.job.bookId`, the AI
// content-ingestion pipeline) never runs for them — `validateTest()`
// warnings/errors for them had nowhere to persist, and the admin "Tekshiruv
// navbati" always showed 0 for these tests even though `validateTest()`
// clearly returns several. This is the equivalent sync path for that non-AI-
// pipeline route: same `ReviewItem` collection, `bookId: null`,
// `reason: 'content_validator_warning'`.
import { ReviewItem } from '@/lib/models';
import type { ValidationIssue } from './contentValidator';

// models.js is plain JS — importing into a .ts file loses Mongoose's generic
// static-method typing (TS2349); `worker/stages/validate.ts` and
// `attemptServer.ts` use the exact same `: any` cast for the same reason.
const ReviewItemModel: any = ReviewItem;

const SECTION_KEYS = new Set(['listening', 'reading', 'writing', 'speaking']);

/** `issue.path` always starts with one of reading/listening/writing/speaking/
 * title/slug/sections/rights. When it doesn't start with a real section name
 * (e.g. "title", "slug", "rights", "sections"), default to 'reading' as a
 * harmless fallback since the schema requires SOME enum value here — the
 * full original path is still preserved in `evidence.rawText` (see below) so
 * admins can see exactly what the issue was about regardless of this
 * best-effort bucketing. */
function sectionKeyFromPath(path: string): 'listening' | 'reading' | 'writing' | 'speaking' {
  const first = path.split('.')[0]?.split('[')[0];
  return first && SECTION_KEYS.has(first) ? (first as 'listening' | 'reading' | 'writing' | 'speaking') : 'reading';
}

/** Upserts one OPEN `ReviewItem` per `validateTest()` issue for a manually-
 * created test (`bookId: null`, `reason: 'content_validator_warning'`).
 * Idempotent — re-validating the same test does not create duplicate open
 * items for issues that already have one open (matched on testId + reason +
 * target.sectionKey + evidence.rawText — the full "path: message" text, so
 * the key stays stable and legible). Does NOT close/delete items for issues
 * that no longer apply on re-validation — out of scope by design, left for
 * the admin to resolve manually via the existing accept/fix/reject flow. */
export async function syncValidationIssuesToReviewQueue(testId: string, issues: ValidationIssue[]): Promise<void> {
  await Promise.all(
    issues.map(async (issue) => {
      const sectionKey = sectionKeyFromPath(issue.path);
      const rawText = `${issue.path}: ${issue.message}`;
      const severity = issue.severity === 'error' ? 'blocker' : 'warning';

      const existing = await ReviewItemModel.findOne({
        testId,
        reason: 'content_validator_warning',
        'target.sectionKey': sectionKey,
        'evidence.rawText': rawText,
        status: 'open',
      });
      if (existing) return;

      await ReviewItemModel.create({
        bookId: null,
        testId,
        target: { sectionKey },
        reason: 'content_validator_warning',
        severity,
        evidence: { rawText },
        status: 'open',
      });
    })
  );
}
