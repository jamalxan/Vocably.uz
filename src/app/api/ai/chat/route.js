import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getGeminiClient, parseDataUrl } from '@/lib/gemini';
import { buildGeminiHistory } from '@/lib/chatRoles';
import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Siz "Sinonimlar AI" ilovasidagi yordamchi botsiz. Sizning vazifangiz FAQAT ingliz tilini o'rganayotgan o'zbek foydalanuvchilarga yordam berish:
- ingliz tili grammatikasi, qoidalari va mashqlari bo'yicha tushuntirish berish;
- inglizcha so'z yoki iboralarni o'zbek tiliga (yoki aksincha) tarjima qilish;
- sinonimlar, antonimlar va so'z qo'llanilishi bo'yicha misollar keltirish;
- talaffuz va imlo bo'yicha maslahat berish;
- foydalanuvchi rasm yuborsa (masalan lug'at sahifasi), undagi inglizcha so'zlar va tarjimalarini aniqlab, ro'yxat ko'rinishida chatda ko'rsatish.

Agar foydalanuvchi ingliz tili yoki tarjimaga aloqador bo'lmagan mavzuda savol bersa (masalan siyosat, dasturlash, boshqa fanlar va h.k.), muloyimlik bilan uzr so'rang va faqat ingliz tili bo'yicha yordam bera olishingizni ayting. Javoblaringiz qisqa, aniq va tushunarli bo'lsin, kerak bo'lganda misollar bilan tushuntiring.

Lug'atga so'z qo'shish bilan bog'liq qoidalar:
- Foydalanuvchi so'zlarni (matndan yoki rasmdan) lug'atiga qo'shishni so'rasa, avval list_categories funksiyasini chaqiring va foydalanuvchidan qaysi kategoriyaga qo'shishni so'rang.
- Agar foydalanuvchi "yangi kategoriya" desa, avval nomini so'rang, keyin create_category funksiyasini chaqiring.
- add_words funksiyasini FAQAT foydalanuvchi qo'shiladigan so'zlar ro'yxatini ko'rib chiqib, aniq tasdiqlagandan keyin ("ha", "tasdiqlayman", "qo'sh" kabi) chaqiring. Tasdiqlashdan oldin har doim qo'shiladigan so'zlar ro'yxatini chatda ko'rsating.
- Rasmda so'zlar topilmasa, buni foydalanuvchiga aytib, hech qanday funksiya chaqirmang.

Mashq rejimlari (foydalanuvchi "Writing/Reading/Speaking/Listening mashqini boshlaylik" kabi xabar bilan boshlasa):
- Writing: foydalanuvchidan biror mavzu so'rang (yoki o'zingiz 2-3 ta mavzu taklif qiling). U matn yozib yuborgach, xatolarni tuzatib, to'g'ri variantni ko'rsating va ish CEFR (A1-C1) darajasi bo'yicha qisqa baholang.
- Reading: foydalanuvchidan daraja (A1-C1) va mavzuni so'rang (yoki taklif qiling), shu asosda 80-150 so'zlik qisqa ingliz matni yozing, keyin 2-3 ta tushunish savoli bering va javoblarini tekshiring.
- Listening: qisqa ingliz jumla yoki matn yozing (foydalanuvchi uni ovozli o'qish tugmasi orqali tinglaydi), keyin shu matn bo'yicha tushunish savollari bering va javoblarni tekshiring.
- Speaking: erkin suhbat uchun mavzu taklif qiling va foydalanuvchi bilan qisqa dialog qiling (u ovozli yoki matnli javob berishi mumkin), suhbat oxirida uning ingliz tilidagi javoblari bo'yicha qisqa fikr-mulohaza bering.`;

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'list_categories',
        description: "Foydalanuvchining mavjud kategoriyalari ro'yxatini oladi",
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'add_words',
        description: "Berilgan so'zlarni ko'rsatilgan kategoriyaga qo'shadi",
        parameters: {
          type: 'object',
          properties: {
            categoryId: { type: 'string', description: 'Mavjud kategoriya ID si' },
            words: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  word: { type: 'string' },
                  syns: { type: 'array', items: { type: 'string' } },
                },
                required: ['word', 'syns'],
              },
            },
          },
          required: ['categoryId', 'words'],
        },
      },
      {
        name: 'create_category',
        description: "Yangi kategoriya yaratadi va uning ID sini qaytaradi",
        parameters: {
          type: 'object',
          properties: { name: { type: 'string' } },
          required: ['name'],
        },
      },
    ],
  },
];

const MAX_FUNCTION_ITERATIONS = 5;

// Gemini xatoliklarini foydalanuvchi tushunadigan matnga aylantiradi. Bepul tarifda
// gemini-3.6-flash uchun daqiqasiga atigi 5 ta so'rov ruxsat etilgan — 429 tez-tez uchraydi.
function friendlyError(err) {
  const msg = err?.message || 'Nomalum xatolik';
  if (err?.status === 429 || /quota|rate limit|429/i.test(msg)) {
    return "So'rovlar chegarasi to'lib qoldi (Gemini bepul tarifida daqiqasiga 5 ta so'rov). Bir daqiqadan keyin qayta urinib ko'ring.";
  }
  if (err?.status === 503 || /overloaded|unavailable/i.test(msg)) {
    return 'AI xizmati hozir band. Bir necha soniyadan keyin qayta urinib ko\'ring.';
  }
  return `Xatolik: ${msg}`;
}
const PENDING_MARK_START = '\n[[PENDING_ADD_WORDS]]';
const PENDING_MARK_END = '[[/PENDING_ADD_WORDS]]\n';

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const { sessionId, message, imageBase64 } = await req.json();
    if ((!message || !message.trim()) && !imageBase64) {
      return NextResponse.json({ error: "Xabar bo'sh bo'lmasin" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    let session = sessionId ? user.chatSessions.id(sessionId) : null;
    if (!session) {
      user.chatSessions.push({ title: 'Yangi suhbat', messages: [] });
      session = user.chatSessions[user.chatSessions.length - 1];
    }
    const isNewConversation = session.messages.length === 0;

    // Eski sessiyalarda roli 'function'/'assistant' bo'lgan buzuq yozuvlar bo'lishi mumkin —
    // buildGeminiHistory ularni normallashtiradi yoki tashlab ketadi.
    const history = buildGeminiHistory(session.messages);

    const userParts = [];
    if (message && message.trim()) userParts.push({ text: message });
    let imageUrlForStorage = null;
    if (imageBase64) {
      const { mimeType, data } = parseDataUrl(imageBase64);
      userParts.push({ inlineData: { mimeType, data } });
      imageUrlForStorage = imageBase64;
    }

    session.messages.push({
      role: 'user',
      parts: [{ text: message && message.trim() ? message : '(rasm yuborildi)' }],
      imageUrl: imageUrlForStorage,
    });

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: TOOLS,
    });

    // MUHIM: SDK ning `startChat`/`sendMessage` oqimidan foydalanmaymiz — u functionResponse
    // qismlariga avtomatik `role: "function"` qo'yadi, Gemini 3.x esa bu rolni rad etadi
    // ("[400] Role 'function' is not supported"). Shuning uchun `contents` ni o'zimiz boshqaramiz
    // va funksiya natijasini `role: "user"` bilan qaytaramiz.
    const contents = [...history, { role: 'user', parts: userParts }];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let assistantText = '';
        let pendingAction = null;

        try {
          for (let i = 0; i < MAX_FUNCTION_ITERATIONS; i++) {
            const result = await model.generateContentStream({ contents });

            // Modelning shu navbatdagi qismlarini XOM chunk'lardan yig'amiz. SDK ning yig'ma
            // javobi (`result.response`) `thoughtSignature` maydonini tashlab yuboradi, Gemini 3.x
            // esa functionCall qismini qaytarganda uni talab qiladi
            // ("Function call is missing a thought_signature").
            const modelParts = [];

            for await (const chunk of result.stream) {
              for (const part of chunk.candidates?.[0]?.content?.parts || []) {
                if (part.text || part.functionCall || part.thoughtSignature) modelParts.push(part);
              }
              const t = chunk.text();
              if (t) {
                assistantText += t;
                controller.enqueue(encoder.encode(t));
              }
            }

            const finalResp = await result.response;
            const calls = finalResp.functionCalls() || [];
            if (calls.length === 0) break;

            // Funksiya chaqiruvli navbatni tarixga qo'shamiz — aks holda keyingi so'rovda
            // functionResponse nimaga javob ekani yo'qoladi.
            if (modelParts.length > 0) contents.push({ role: 'model', parts: modelParts });

            const responseParts = [];
            let shouldStop = false;

            for (const call of calls) {
              if (call.name === 'list_categories') {
                const cats = user.categories.map((c) => ({
                  id: String(c._id),
                  name: c.name,
                  wordCount: c.words.length,
                }));
                responseParts.push({ functionResponse: { name: 'list_categories', response: { categories: cats } } });
              } else if (call.name === 'create_category') {
                const name = (call.args?.name || '').trim();
                if (name) {
                  user.categories.push({ name, words: [] });
                  const created = user.categories[user.categories.length - 1];
                  responseParts.push({
                    functionResponse: {
                      name: 'create_category',
                      response: { id: String(created._id), name: created.name },
                    },
                  });
                } else {
                  responseParts.push({
                    functionResponse: { name: 'create_category', response: { error: "Nomi bo'sh" } },
                  });
                }
              } else if (call.name === 'add_words') {
                pendingAction = {
                  categoryId: call.args?.categoryId || '',
                  words: Array.isArray(call.args?.words) ? call.args.words : [],
                };
                responseParts.push({
                  functionResponse: {
                    name: 'add_words',
                    response: { status: "Foydalanuvchi tasdig'i so'ralmoqda, hali qo'shilmadi" },
                  },
                });
                shouldStop = true;
              }
            }

            if (shouldStop) break;
            // Gemini 3.x: funksiya natijasi 'user' roli bilan yuboriladi, 'function' emas.
            contents.push({ role: 'user', parts: responseParts });
          }

          if (pendingAction) {
            controller.enqueue(encoder.encode(`${PENDING_MARK_START}${JSON.stringify(pendingAction)}${PENDING_MARK_END}`));
          }

          // Model faqat funksiya chaqirib, matn yozmagan bo'lishi mumkin — bo'sh `text` sxemadagi
          // `required` ni buzadi, shuning uchun o'rniga qisqa o'rinbosar matn saqlaymiz.
          const storedText = assistantText.trim()
            ? assistantText
            : pendingAction
              ? "So'zlarni qo'shishni tasdiqlashingizni kutmoqdaman."
              : '(javob bo\'sh)';
          session.messages.push({ role: 'model', parts: [{ text: storedText }] });
          session.updatedAt = new Date();
          if (isNewConversation && message && message.trim()) {
            session.title = message.trim().slice(0, 40);
          }
          await user.save();
        } catch (err) {
          controller.enqueue(encoder.encode(`\n⚠️ ${friendlyError(err)}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': String(session._id),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}
