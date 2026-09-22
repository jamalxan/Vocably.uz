// AI-01 worker orchestrator — VAQT-ASOSLI (cron-o'xshash) trigger uchun
// yig'ma nuqta: S15 mock_scheduler va S16 content_gap_scan ikkalasi ham
// allaqachon REAKTIV ishlaydi (`jobRunner.ts`, yangi test nashr qilingandan
// keyin) — bu funksiya esa `src/lib/queue/contentQueue.js`dagi
// `scheduleMaintenanceSweep()` (BullMQ `upsertJobScheduler`, har 6 soatda)
// orqali PERIODIK ham chaqiriladi, hech qanday yangi kontent kelmagan uzoq
// muddatda ham inventar qayta tekshirilsin uchun (docs' o'z so'zi: "har 6
// soatda inventory audit").
//
// Ikkalasi ham o'zining ICHKI policy tekshiruvini (`AutomationPolicy.level`/
// `autoContentGapScan`) o'zi qiladi — bu yerda QAYTA tekshirilmaydi, aks
// holda ikkita joyda ikki xil qoida paydo bo'lardi.
import { runMockScheduler } from './mockScheduler';
import { runContentGapScan } from './contentGapScan';

export interface MaintenanceSweepSummary {
  mockScheduler: Awaited<ReturnType<typeof runMockScheduler>>;
  contentGapScan: Awaited<ReturnType<typeof runContentGapScan>>;
}

export async function runMaintenanceSweep(): Promise<MaintenanceSweepSummary> {
  const mockScheduler = await runMockScheduler();
  const contentGapScan = await runContentGapScan();
  return { mockScheduler, contentGapScan };
}
