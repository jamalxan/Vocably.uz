import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getGeminiClient, parseDataUrl } from '@/lib/gemini';
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
- Rasmda so'zlar topilmasa, buni foydalanuvchiga aytib, hech qanday funksiya chaqirmang.`;

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

    // Tarixni qayta tuzishda rasmlarni qayta yubormaymiz (og'irligi katta) — o'rniga matnli belgi qoldiramiz.
    const history = session.messages.map((m) => ({
      role: m.role,
      parts: m.imageUrl
        ? [{ text: `${m.parts[0]?.text || ''} [rasm yuborilgan edi]`.trim() }]
        : m.parts.map((p) => ({ text: p.text })),
    }));

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
    const chat = model.startChat({ history });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let assistantText = '';
        let pendingAction = null;

        try {
          let currentParts = userParts;

          for (let i = 0; i < MAX_FUNCTION_ITERATIONS; i++) {
            const result = await chat.sendMessageStream(currentParts);

            for await (const chunk of result.stream) {
              const t = chunk.text();
              if (t) {
                assistantText += t;
                controller.enqueue(encoder.encode(t));
              }
            }

            const finalResp = await result.response;
            const calls = finalResp.functionCalls() || [];
            if (calls.length === 0) break;

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
            currentParts = responseParts;
          }

          if (pendingAction) {
            controller.enqueue(encoder.encode(`${PENDING_MARK_START}${JSON.stringify(pendingAction)}${PENDING_MARK_END}`));
          }

          session.messages.push({ role: 'model', parts: [{ text: assistantText }] });
          session.updatedAt = new Date();
          if (isNewConversation && message && message.trim()) {
            session.title = message.trim().slice(0, 40);
          }
          await user.save();
        } catch (err) {
          controller.enqueue(encoder.encode(`\n⚠️ Xatolik: ${err.message}`));
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
