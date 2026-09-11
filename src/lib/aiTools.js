// AI chat funksiya-chaqiruvlari (tool calling) barcha provayderlar (Gemini, Groq, OpenRouter)
// uchun umumiy — faqat ularning sxema formati farq qiladi, biznes-mantiq shu yerda bitta joyda.

const TOOL_DEFS = [
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
              word: { type: 'string', description: 'Inglizcha so\'z' },
              pronunciation: {
                type: 'string',
                description: 'Talaffuz transkripsiyasi, IPA formatida (masalan "/əˈraɪz/")',
              },
              syns: {
                type: 'array',
                items: { type: 'string' },
                description: "So'zning o'zbekcha tarjima(lar)i — kamida bittasi shart",
              },
            },
            required: ['word', 'pronunciation', 'syns'],
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
  {
    name: 'generate_quiz',
    description:
      "Foydalanuvchi 'Test tuz' deb so'raganda (yoki so'z(lar) asosida test/quiz so'ralganda) chaqiriladi. " +
      "Testni oddiy matn sifatida YOZMANG — har doim shu funksiya orqali strukturali qaytaring, " +
      "shunda foydalanuvchi interaktiv (bosib javob beradigan) test ko'radi.",
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              prompt: { type: 'string', description: "Savol matni (masalan so'z ma'nosi yoki gapni to'ldirish)" },
              options: {
                type: 'array',
                items: { type: 'string' },
                description: '3-4 ta javob varianti',
              },
              answer: { type: 'string', description: "To'g'ri javob — options ichidan aynan bittasi" },
              explanation: { type: 'string', description: 'Nega shu javob to\'g\'ri — qisqa izoh' },
            },
            required: ['prompt', 'options', 'answer', 'explanation'],
          },
        },
      },
      required: ['questions'],
    },
  },
];

export function toGeminiTools() {
  return [{ functionDeclarations: TOOL_DEFS }];
}

export function toOpenAiTools() {
  return TOOL_DEFS.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

// Bitta funksiya-chaqiruvni bajaradi. `user` mongoose hujjatiga to'g'ridan-to'g'ri o'zgartirish
// kiritadi (chaqiruvchi keyin user.save() qilishi kerak). `ctx.createdCategoryIds` beriladigan
// bo'lsa, shu chaqiruv paytida yaratilgan kategoriya ID'lari shu massivga qo'shiladi — provayder
// fallback muvaffaqiyatsiz bo'lganda chaqiruvchi ularni bekor qila olishi (rollback) uchun kerak.
export function runToolCall(name, args, user, ctx = {}) {
  if (name === 'list_categories') {
    const categories = user.categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      wordCount: c.words.length,
    }));
    return { result: { categories } };
  }

  if (name === 'create_category') {
    const catName = (args?.name || '').trim();
    if (!catName) return { result: { error: "Nomi bo'sh" } };

    // Xuddi shu nomli kategoriya allaqachon bor bo'lsa, qayta yaratmasdan o'shani qaytaramiz —
    // aks holda model bir necha marta chaqirsa yoki provayder qayta urinsa, bir xil nomli
    // takroriy (duplicate) kategoriyalar hosil bo'lib qoladi.
    const existing = user.categories.find(
      (c) => c.name.trim().toLowerCase() === catName.toLowerCase()
    );
    if (existing) {
      return { result: { id: String(existing._id), name: existing.name } };
    }

    user.categories.push({ name: catName, words: [] });
    const created = user.categories[user.categories.length - 1];
    ctx.createdCategoryIds?.push(String(created._id));
    return { result: { id: String(created._id), name: created.name } };
  }

  if (name === 'add_words') {
    const pendingAction = {
      categoryId: args?.categoryId || '',
      words: (Array.isArray(args?.words) ? args.words : []).map((w) => ({
        word: w?.word || '',
        pronunciation: w?.pronunciation || '',
        syns: Array.isArray(w?.syns) ? w.syns : [],
      })),
    };
    return {
      result: { status: "Foydalanuvchi tasdig'i so'ralmoqda, hali qo'shilmadi" },
      pendingAction,
      shouldStop: true,
    };
  }

  // TZ-vocably-v2.md §D3 (BUG-011) — "Test tuz" endi oddiy matn emas, strukturali JSON
  // qaytaradi (add_words'dagi pendingAction bilan bir xil naqsh: shu javobda darhol
  // to'xtaymiz, klient QuizCard'ni render qiladi).
  if (name === 'generate_quiz') {
    const quizAction = {
      questions: (Array.isArray(args?.questions) ? args.questions : [])
        .map((q) => ({
          prompt: q?.prompt || '',
          options: Array.isArray(q?.options) ? q.options.filter(Boolean) : [],
          answer: q?.answer || '',
          explanation: q?.explanation || '',
        }))
        .filter((q) => q.prompt && q.options.length >= 2 && q.answer),
    };
    return {
      result: { status: "Test foydalanuvchiga interaktiv ko'rinishda ko'rsatilmoqda" },
      quizAction,
      shouldStop: true,
    };
  }

  return { result: { error: 'Nomalum funksiya' } };
}
