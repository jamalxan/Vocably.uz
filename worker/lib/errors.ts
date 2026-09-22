// AI-01 worker — bosqich xatolarini ikki turga ajratadi: qayta urinish
// FOYDA berishi mumkin bo'lganlar (tarmoq, 429/5xx, vaqtincha AI xatosi) va
// qayta urinish HECH QACHON yordam bermaydigan (noto'g'ri konfiguratsiya,
// yo'q taskKey, litsenziya taqig'i) xatolar. `jobRunner.ts` buni BullMQ'ning
// `UnrecoverableError`iga (qolgan `attempts`dan qat'i nazar darhol
// "failed"ga o'tkazadi) yoki oddiy `Error`ga (BullMQ o'z `attempts`/`backoff`
// sozlamasi bo'yicha qayta uradi) map qiladi.
export class RetryableStageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableStageError';
  }
}

export class UnrecoverableStageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnrecoverableStageError';
  }
}
