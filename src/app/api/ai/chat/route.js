import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getGeminiClient, parseDataUrl } from '@/lib/gemini';
import { buildGeminiHistory, buildOpenAiHistory } from '@/lib/chatRoles';
import { toGeminiTools, toOpenAiTools, runToolCall } from '@/lib/aiTools';
import { streamOpenAiCompatible } from '@/lib/providers/openaiCompatible';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Siz Vocably — ingliz tili o'rganish platformasidagi yordamchisiz. Sizning vazifangiz FAQAT ingliz tilini o'rganayotgan o'zbek foydalanuvchilarga yordam berish:
- ingliz tili grammatikasi, qoidalari va mashqlari bo'yicha tushuntirish berish;
- inglizcha so'z yoki iboralarni o'zbek tiliga (yoki aksincha) tarjima qilish;
- sinonimlar, antonimlar va so'z qo'llanilishi bo'yicha misollar keltirish;
- talaffuz va imlo bo'yicha maslahat berish;
- foydalanuvchi bitta yoki bir nechta rasm yuborsa (masalan lug'at sahifalari), barcha rasmlardagi inglizcha so'zlar va tarjimalarini aniqlab, ro'yxat ko'rinishida chatda ko'rsatish.

Agar foydalanuvchi ingliz tili yoki tarjimaga aloqador bo'lmagan mavzuda savol bersa (masalan siyosat, dasturlash, boshqa fanlar va h.k.), muloyimlik bilan uzr so'rang va faqat ingliz tili bo'yicha yordam bera olishingizni ayting. Javoblaringiz qisqa, aniq va tushunarli bo'lsin, kerak bo'lganda misollar bilan tushuntiring.

Lug'atga so'z qo'shish bilan bog'liq qoidalar:
- Foydalanuvchi so'zlarni (matndan yoki rasmdan) lug'atiga qo'shishni so'rasa, avval list_categories funksiyasini chaqiring va foydalanuvchidan qaysi kategoriyaga qo'shishni so'rang.
- Agar foydalanuvchi "yangi kategoriya" desa, avval nomini so'rang, keyin create_category funksiyasini chaqiring.
- MUHIM — foydalanuvchi so'zni faqat bitta tilda bersa ham (masalan faqat inglizcha "arise" yoki faqat o'zbekcha "paydo bo'lmoq"), ikkinchi tomonini SIZ o'zingiz tarjima qilishingiz kerak — hech qachon foydalanuvchidan tarjimani so'rab, uni kutib turmang, o'zingiz aniqlab bering. add_words'ga yuboriladigan har bir so'z uchun: (1) inglizcha "word", (2) IPA formatidagi "pronunciation" (masalan "/əˈraɪz/"), (3) kamida bitta o'zbekcha tarjima "syns" ichida — uchalasi ham HAR DOIM to'ldirilgan bo'lishi shart, birontasi ham bo'sh qolmasin.
- add_words funksiyasini FAQAT foydalanuvchi qo'shiladigan so'zlar ro'yxatini ko'rib chiqib, aniq tasdiqlagandan keyin ("ha", "tasdiqlayman", "qo'sh" kabi) chaqiring. Tasdiqlashdan oldin har doim qo'shiladigan so'zlar ro'yxatini (so'z — talaffuz — tarjima(lar)) chatda ko'rsating.
- Rasm(lar)da so'zlar topilmasa, buni foydalanuvchiga aytib, hech qanday funksiya chaqirmang.

Mashq rejimlari (foydalanuvchi "Writing/Reading/Speaking/Listening mashqini boshlaylik" kabi xabar bilan boshlasa):
- Writing: foydalanuvchidan biror mavzu so'rang (yoki o'zingiz 2-3 ta mavzu taklif qiling). U matn yozib yuborgach, xatolarni tuzatib, to'g'ri variantni ko'rsating va ish CEFR (A1-C1) darajasi bo'yicha qisqa baholang.
- Reading: foydalanuvchidan daraja (A1-C1) va mavzuni so'rang (yoki taklif qiling), shu asosda 80-150 so'zlik qisqa ingliz matni yozing, keyin 2-3 ta tushunish savoli bering va javoblarini tekshiring.
- Listening: qisqa ingliz jumla yoki matn yozing (foydalanuvchi uni ovozli o'qish tugmasi orqali tinglaydi), keyin shu matn bo'yicha tushunish savollari bering va javoblarni tekshiring.
- Speaking: erkin suhbat uchun mavzu taklif qiling va foydalanuvchi bilan qisqa dialog qiling (u ovozli yoki matnli javob berishi mumkin), suhbat oxirida uning ingliz tilidagi javoblari bo'yicha qisqa fikr-mulohaza bering.`;

const MAX_FUNCTION_ITERATIONS = 5;
const MAX_IMAGES = 10;

// Provayderlar navbat bilan sinaladi: Groq (matn uchun eng yuqori bepul RPM) -> OpenRouter
// (zaxira, rasm uchun ham) -> Gemini (oxirgi zaxira, doim ishlaydigan asosiy provayder).
// Shu tufayli birontasi kvota/limitga tegib qolsa, foydalanuvchi buni sezmasdan davom etadi.
const PROVIDERS = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  },
  openrouterText: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    extraHeaders: { 'HTTP-Referer': process.env.APP_URL || 'https://vocably.app', 'X-Title': 'Vocably' },
  },
  openrouterVision: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'nvidia/nemotron-nano-12b-v2-vl:free',
    extraHeaders: { 'HTTP-Referer': process.env.APP_URL || 'https://vocably.app', 'X-Title': 'Vocably' },
  },
};

// Gemini/Groq/OpenRouter xatoliklarini foydalanuvchi tushunadigan matnga aylantiradi.
function friendlyError(err) {
  const msg = err?.message || "Noma'lum xatolik";
  if (err?.status === 429 || /quota|rate limit|429/i.test(msg)) {
    return "AI xizmatlari hozir band (so'rovlar chegarasi to'lib qoldi). Bir necha daqiqadan keyin qayta urinib ko'ring.";
  }
  if (err?.status === 503 || /overloaded|unavailable/i.test(msg)) {
    return "AI xizmati hozir band. Bir necha soniyadan keyin qayta urinib ko'ring.";
  }
  return `Xatolik: ${msg}`;
}

const PENDING_MARK_START = '\n[[PENDING_ADD_WORDS]]';
const PENDING_MARK_END = '[[/PENDING_ADD_WORDS]]\n';

// Gemini SDK orqali bir "navbat"ni funksiya-chaqiruv sikli bilan bajaradi va oqim davomida
// matnni to'g'ridan-to'g'ri controller'ga yuboradi.
async function runGeminiProviderTurn({ history, userParts, controller, encoder, user, state, createdCategoryIds }) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: toGeminiTools(),
  });

  // MUHIM: SDK ning `startChat`/`sendMessage` oqimidan foydalanmaymiz — u functionResponse
  // qismlariga avtomatik `role: "function"` qo'yadi, Gemini 3.x esa bu rolni rad etadi
  // ("[400] Role 'function' is not supported"). Shuning uchun `contents` ni o'zimiz boshqaramiz
  // va funksiya natijasini `role: "user"` bilan qaytaramiz.
  const contents = [...history, { role: 'user', parts: userParts }];
  let assistantText = '';
  let pendingAction = null;
  // Shu navbat davomida create_category chaqirilgan bo'lsa, ID'sini shu yerda saqlaymiz —
  // agar keyinroq add_words boshqa/yaroqsiz categoryId bilan chaqirilsa (model ba'zan bitta
  // javobda ikkalasini ham chaqirib, add_words'ga hali ma'lum bo'lmagan ID beradi), shu bilan
  // to'g'irlaymiz.
  let justCreatedCategoryId = null;

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
        state.emitted = true;
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
      const knownCategoryIds = new Set(user.categories.map((c) => String(c._id)));
      const args =
        call.name === 'add_words' && justCreatedCategoryId && !knownCategoryIds.has(call.args?.categoryId)
          ? { ...call.args, categoryId: justCreatedCategoryId }
          : call.args;

      const { result: toolResult, pendingAction: pa, shouldStop: stop } = runToolCall(call.name, args, user, {
        createdCategoryIds,
      });
      if (call.name === 'create_category' && toolResult?.id) justCreatedCategoryId = toolResult.id;
      if (pa) pendingAction = pa;
      if (stop) shouldStop = true;
      responseParts.push({ functionResponse: { name: call.name, response: toolResult } });
    }

    if (shouldStop) break;
    // Gemini 3.x: funksiya natijasi 'user' roli bilan yuboriladi, 'function' emas.
    contents.push({ role: 'user', parts: responseParts });
  }

  return { assistantText, pendingAction };
}

// Groq/OpenRouter (OpenAI bilan mos) uchun bir "navbat"ni funksiya-chaqiruv sikli bilan bajaradi.
async function runOpenAiProviderTurn({ provider, history, currentMessage, controller, encoder, user, state, createdCategoryIds }) {
  const messages = [{ role: 'system', content: SYSTEM_INSTRUCTION }, ...history, currentMessage];
  const tools = toOpenAiTools();
  let assistantText = '';
  let pendingAction = null;
  // Gemini navbatidagi bilan bir xil maqsad — bitta javobda create_category + add_words
  // birga chaqirilganda categoryId'ni haqiqiy yaratilgan kategoriyaga to'g'irlab qo'yamiz.
  let justCreatedCategoryId = null;

  for (let i = 0; i < MAX_FUNCTION_ITERATIONS; i++) {
    const { text, toolCalls } = await streamOpenAiCompatible({
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey,
      model: provider.model,
      messages,
      tools,
      extraHeaders: provider.extraHeaders,
      onToken: (chunk) => {
        assistantText += chunk;
        state.emitted = true;
        controller.enqueue(encoder.encode(chunk));
      },
    });

    if (toolCalls.length === 0) break;

    const callsWithIds = toolCalls.map((tc, idx) => ({
      ...tc,
      id: tc.id || `call_${i}_${idx}`,
    }));

    messages.push({
      role: 'assistant',
      content: text || null,
      tool_calls: callsWithIds.map((tc) => ({
        id: tc.id,
        type: 'function',
        function: { name: tc.name, arguments: tc.arguments || '{}' },
      })),
    });

    let shouldStop = false;
    for (const tc of callsWithIds) {
      let args = {};
      try {
        args = JSON.parse(tc.arguments || '{}');
      } catch {
        // model noto'g'ri JSON qaytarsa — bo'sh argument bilan davom etamiz
      }

      const knownCategoryIds = new Set(user.categories.map((c) => String(c._id)));
      if (tc.name === 'add_words' && justCreatedCategoryId && !knownCategoryIds.has(args?.categoryId)) {
        args = { ...args, categoryId: justCreatedCategoryId };
      }

      const { result: toolResult, pendingAction: pa, shouldStop: stop } = runToolCall(tc.name, args, user, {
        createdCategoryIds,
      });
      if (tc.name === 'create_category' && toolResult?.id) justCreatedCategoryId = toolResult.id;
      if (pa) pendingAction = pa;
      if (stop) shouldStop = true;
      messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(toolResult) });
    }

    if (shouldStop) break;
  }

  return { assistantText, pendingAction };
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const { sessionId, message, imagesBase64 } = await req.json();
    const images = Array.isArray(imagesBase64) ? imagesBase64.slice(0, MAX_IMAGES) : [];
    if ((!message || !message.trim()) && images.length === 0) {
      return NextResponse.json({ error: "Xabar bo'sh bo'lmasin" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    let session = sessionId ? user.chatSessions.id(sessionId) : null;
    if (!session) {
      user.chatSessions.push({ title: 'Yangi suhbat', messages: [] });
      session = user.chatSessions[user.chatSessions.length - 1];
    }
    const isNewConversation = session.messages.length === 0;

    // Eski sessiyalarda roli 'function'/'assistant' bo'lgan buzuq yozuvlar bo'lishi mumkin —
    // history quruvchilar ularni normallashtiradi yoki tashlab ketadi.
    const geminiHistory = buildGeminiHistory(session.messages);
    const openAiHistory = buildOpenAiHistory(session.messages);

    session.messages.push({
      role: 'user',
      parts: [{ text: message && message.trim() ? message : '(rasm yuborildi)' }],
      imageUrls: images,
    });

    const hasImages = images.length > 0;

    const geminiUserParts = [];
    if (message && message.trim()) geminiUserParts.push({ text: message });
    for (const img of images) {
      const { mimeType, data } = parseDataUrl(img);
      geminiUserParts.push({ inlineData: { mimeType, data } });
    }

    let openAiUserMessage;
    if (hasImages) {
      const content = [{ type: 'text', text: message && message.trim() ? message : "Rasm(lar)ni tahlil qiling" }];
      for (const img of images) content.push({ type: 'image_url', image_url: { url: img } });
      openAiUserMessage = { role: 'user', content };
    } else {
      openAiUserMessage = { role: 'user', content: message };
    }

    // Rasm bo'lsa Groq'da bepul vision modeli yo'q — to'g'ridan-to'g'ri vision zaxiraga o'tamiz.
    const chain = hasImages
      ? [{ ...PROVIDERS.openrouterVision, key: 'openrouterVision' }, { key: 'gemini' }]
      : [
          { ...PROVIDERS.groq, key: 'groq' },
          { ...PROVIDERS.openrouterText, key: 'openrouterText' },
          { key: 'gemini' },
        ];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const state = { emitted: false };
        let finalText = '';
        let pendingAction = null;
        let succeeded = false;
        let lastErr = null;

        for (const provider of chain) {
          // Shu urinish davomida yaratilgan kategoriyalarni kuzatamiz — urinish muvaffaqiyatsiz
          // bo'lib keyingi provayderga o'tilsa, ular bekor qilinadi (pastda). Aks holda `user`
          // hujjati urinishlar orasida umumiy bo'lgani uchun, muvaffaqiyatsiz urinishda yaratilgan
          // kategoriya keyingi provayderning o'z (mustaqil) urinishiga "chiqib qolib", oxir-oqibat
          // bir xil nomli ikkita kategoriya saqlanib qolishi mumkin edi.
          const attemptCreatedCategoryIds = [];
          try {
            if (provider.key !== 'gemini' && !provider.apiKey) {
              throw Object.assign(new Error('API kalit sozlanmagan'), { status: 401 });
            }

            const outcome =
              provider.key === 'gemini'
                ? await runGeminiProviderTurn({
                    history: geminiHistory,
                    userParts: geminiUserParts,
                    controller,
                    encoder,
                    user,
                    state,
                    createdCategoryIds: attemptCreatedCategoryIds,
                  })
                : await runOpenAiProviderTurn({
                    provider,
                    history: openAiHistory,
                    currentMessage: openAiUserMessage,
                    controller,
                    encoder,
                    user,
                    state,
                    createdCategoryIds: attemptCreatedCategoryIds,
                  });

            finalText = outcome.assistantText;
            pendingAction = outcome.pendingAction;
            succeeded = true;
            break;
          } catch (err) {
            lastErr = err;
            for (const catId of attemptCreatedCategoryIds) user.categories.pull(catId);
            // Hech narsa oqimga chiqarilmagan bo'lsa (masalan 429 birinchi so'rovda) — keyingi
            // provayderga o'tamiz. Aks holda foydalanuvchiga allaqachon matn ko'rsatilgan,
            // uni almashtirib bo'lmaydi — shu bilan to'xtaymiz.
            if (state.emitted) break;
          }
        }

        if (!succeeded) {
          controller.enqueue(encoder.encode(`\n⚠️ ${friendlyError(lastErr)}`));
        } else {
          if (pendingAction) {
            controller.enqueue(encoder.encode(`${PENDING_MARK_START}${JSON.stringify(pendingAction)}${PENDING_MARK_END}`));
          }

          // Model faqat funksiya chaqirib, matn yozmagan bo'lishi mumkin.
          const storedText = finalText.trim()
            ? finalText
            : pendingAction
              ? "So'zlarni qo'shishni tasdiqlashingizni kutmoqdaman."
              : "(javob bo'sh)";
          session.messages.push({ role: 'model', parts: [{ text: storedText }] });
          session.updatedAt = new Date();
          if (isNewConversation && message && message.trim()) {
            session.title = message.trim().slice(0, 40);
          }
          try {
            await user.save();
          } catch (saveErr) {
            controller.enqueue(encoder.encode(`\n⚠️ Saqlashda xatolik: ${saveErr.message}`));
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': String(session._id),
      },
    });
  } catch (err) {
    return serverError(err, 'ai/chat');
  }
}
