// Admin AI chatning SUHBAT qatlami (fayl tahlili emas — u `analyze.js`da).
//
// Muhim qaror: HARAKATLARNI (test yaratish, audio biriktirish, nashr qilish)
// model O'ZI E'LON QILMAYDI. Har bir harakat server tomonida, haqiqiy
// ma'lumotdan (yuklangan fayl tahlili, DB'dagi testlar) DETERMINISTIK
// yig'iladi va chatda TUGMA (`proposal`) sifatida chiqadi. Model faqat
// gapiradi: tushuntiradi, savol beradi, holatni izohlaydi. Sabab oddiy —
// "model tugma yasasin" degan yondashuvda model mavjud bo'lmagan testId yoki
// bo'lmagan part'ni ko'rsatib yuborishi mumkin, admin esa buni bosadi.
export const AGENT_REPLY_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
  },
  required: ['reply'],
  additionalProperties: false,
};

export interface PlatformState {
  draftTests: number;
  publishedTests: number;
  listeningPartsMissingAudio: number;
  openReviewItems: number;
  recentTests: { title: string; sections: string[]; isPublished: boolean }[];
}

export function buildAgentSystemPrompt(state: PlatformState): string {
  return `Sen — Vocably IELTS platformasining ADMIN KONTENT AGENTIsan. Sening ishing oddiy foydalanuvchi AI yordamchisidan BUTUNLAY BOSHQA: sen o'quvchiga dars bermaysan, so'z tushuntirmaysan, mashq yechmaysan. Sening yagona vazifang — adminning yuborgan materiallarini (kitob, PDF/DOCX, audio, rasm) tahlil qilib, platformaning to'g'ri joyiga (Reading / Listening / Writing / Speaking) joylashtirishga yordam berish.

HOZIRGI HOLAT:
- Qoralama testlar: ${state.draftTests}
- Nashr qilingan testlar: ${state.publishedTests}
- Audiosi yetishmayotgan Listening part'lar: ${state.listeningPartsMissingAudio}
- Tekshiruv navbatidagi ochiq yozuvlar: ${state.openReviewItems}
${state.recentTests.length ? `- Oxirgi testlar: ${state.recentTests.map((t) => `${t.title} (${t.sections.join('/') || "bo'limsiz"}${t.isPublished ? ', nashr qilingan' : ', qoralama'})`).join('; ')}` : ''}

QOIDALAR:
- O'zbek tilida, qisqa va aniq yoz. Ortiqcha muqaddima, uzr, takroriy tushuntirish YO'Q.
- Hech qachon "men qildim" dema: haqiqiy o'zgarishni faqat admin tugmani bosganda server bajaradi. Sen faqat tushuntirasan va kerak bo'lsa savol berasan.
- Kontent haqida TAXMIN QILMA: agar fayl yuborilmagan bo'lsa, qaysi kitob ekanini bilmaysan — so'ra.
- Admin fayl yuborishi kerak bo'lsa aniq ayt: "PDF yoki DOCX tashlang", "audio faylni tashlang".
- Javob kaliti yo'q kontentni "to'ldirib" bo'lmaydi — bunday holatda buni ochiq ayt.`;
}

/** Chat tarixini modelga beriladigan ixcham shaklga keltiradi: juda uzun
 * xabarlar kesiladi, tuzilmali kartalar (`data`) esa bir qatorlik izohga
 * aylantiriladi — model ularning MAZMUNINI ko'rsin, JSON'ini emas. */
export function toModelMessages(
  messages: { role: string; content: string; data?: any }[],
  maxMessages = 16
): { role: 'user' | 'assistant'; content: string }[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-maxMessages)
    .map((m) => {
      const extras: string[] = [];
      const proposals = m.data?.proposals || [];
      if (proposals.length) extras.push(`[chatda ${proposals.length} ta taklif tugmasi ko'rsatilgan]`);
      if (m.data?.results?.length) extras.push(`[bajarilgan: ${m.data.results.map((r: any) => r.summary).join('; ')}]`);
      return {
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: `${(m.content || '').slice(0, 4000)}${extras.length ? `\n${extras.join(' ')}` : ''}`.trim() || '(bo\'sh)',
      };
    });
}

/** Suhbat uchun bitta prompt matni — `generateJson` (Groq/Gemini/Cerebras/
 * OpenRouter zanjiri) faqat bitta matn qabul qiladi, `messages` massivini
 * emas, shuning uchun tarix shu yerda matnga yig'iladi. */
export function buildConversationPrompt(state: PlatformState, history: { role: string; content: string; data?: any }[], userText: string): string {
  const compact = toModelMessages(history)
    .map((m) => `${m.role === 'user' ? 'ADMIN' : 'AGENT'}: ${m.content}`)
    .join('\n');

  return `${buildAgentSystemPrompt(state)}

SUHBAT TARIXI:
${compact || '(yangi suhbat)'}

ADMINNING YANGI XABARI:
"""
${userText.slice(0, 4000)}
"""

Javobni {"reply": "..."} ko'rinishidagi JSON sifatida qaytar. "reply" — adminga ko'rinadigan matn.`;
}
