// docs/ai-content-agent-tz-avtopilot.md §3.3/§10 kickoff item 6 — "Xavfsizlik:
// licence/publishScope va blocker-gate tekshiruvlari policy'dan MUSTAQIL,
// hardcoded qolishi shart — buni alohida unit test bilan tasdiqlang."
//
// Bu fayl ataylab TOZA (DB'siz, hech qanday import yo'q boshqa modullardan) —
// orchestrator (docs' §3.1, hali qurilmagan — M2-M6 asosiy pipeline kutmoqda)
// va hozirgi qo'lda "Nashr qilish" tugmasi ikkalasi ham xuddi shu funksiyalar
// orqali o'tishi kerak, shunda qoida IKKI joyda ikki xil yozilib
// nomuvofiqlashib qolmaydi. Policy (`AutomationPolicy`) faqat "AI harakat
// qilsinmi" degan savolga javob beradi — bu yerdagi qoidalarni AYLANIB
// O'TA OLMAYDI, chunki bu funksiyalar policy'ni umuman argument sifatida
// olmaydi (faqat aniq raqam/enum qiymatlar), policy shu qiymatlarni
// chaqiruvchi joyda oldindan hisoblab beradi.

/**
 * §3.3 item 1/2 — bloklovchi xato bo'lgan yoki litsenziya/nashr doirasi
 * noto'g'ri kombinatsiyadagi test HECH QACHON avtomatik nashr qilinmaydi.
 * `level` — chaqiruvchi policy'dan o'qib beradi ('manual' bo'lsa ham bu
 * funksiya rad etadi, chunki avto-nashr faqat assisted/autopilotda ma'noga
 * ega — lekin bu yerda ham qat'iy tekshiriladi, chaqiruvchi xato qilsa ham).
 */
export function canAutoPublish({ blockers, qaScore, licence, publishScope, level, autoPublishMinQaScore }) {
  if ((blockers ?? 0) > 0) {
    return { allowed: false, reason: `${blockers} ta blocker bor — avtomatik nashr taqiqlangan` };
  }
  if (licence === 'third_party_copyright' && publishScope === 'public') {
    return { allowed: false, reason: "third_party_copyright kitobni public nashr qilib bo'lmaydi (§16, o'zgarmas qoida)" };
  }
  if (level !== 'assisted' && level !== 'autopilot') {
    return { allowed: false, reason: `automationLevel '${level}' avtonom nashrga ruxsat bermaydi` };
  }
  const threshold = autoPublishMinQaScore ?? 0.95;
  if (typeof qaScore !== 'number' || qaScore < threshold) {
    return { allowed: false, reason: `qa.score (${qaScore ?? 'yo‘q'}) chegaradan (${threshold}) past` };
  }
  return { allowed: true, reason: '' };
}

/**
 * §5 S13 auto_review_sweep — faqat `warning` darajali, ishonchi chegaradan
 * yuqori elementlar avto-qabul qilinadi. `blocker` bu funksiyaga umuman
 * kirmasligi kerak (chaqiruvchi joyda filtrlanadi), lekin himoya sifatida
 * bu yerda ham qat'iy rad etiladi.
 */
export function canAutoAccept({ severity, confidence, autoAcceptConfidence }) {
  if (severity === 'blocker') {
    return { allowed: false, reason: "blocker hech qachon avto-qabul qilinmaydi — admin ko'rishi shart" };
  }
  const threshold = autoAcceptConfidence ?? 0.93;
  if (typeof confidence !== 'number' || confidence < threshold) {
    return { allowed: false, reason: `confidence (${confidence ?? 'yo‘q'}) chegaradan (${threshold}) past` };
  }
  return { allowed: true, reason: '' };
}

/**
 * §3.3 item 3 — kunlik avtonom xarajat chegarasi. Bu FAQAT AI o'zi qilgan
 * (admin bosmagan) harakatlar xarajatini hisoblaydi; admin qo'lda
 * ishlatayotgan xarajatga taalluqli emas — shuning uchun chaqiruvchi
 * `costUsdToday`ni `agent_actions`dan yig'ib berishi kerak, `ai_calls`ning
 * umumidan emas.
 */
export function canContinueAutonomous({ costUsdToday, maxAutonomousCostUsdPerDay }) {
  const cap = maxAutonomousCostUsdPerDay ?? 15;
  if ((costUsdToday ?? 0) >= cap) {
    return { allowed: false, reason: `bugungi avtonom xarajat ($${(costUsdToday ?? 0).toFixed(2)}) kunlik chegaradan ($${cap}) oshdi` };
  }
  return { allowed: true, reason: '' };
}
