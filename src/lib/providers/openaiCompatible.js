// Groq va OpenRouter ikkalasi ham OpenAI bilan mos /chat/completions formatini ishlatadi,
// shuning uchun ularni bitta generic klient bilan chaqiramiz — faqat baseUrl/key/model farq qiladi.

// SSE oqimini o'qib, matn bo'laklarini `onToken` orqali darhol beradi, funksiya-chaqiruvlarini
// (tool_calls) esa oxirigacha to'plab qaytaradi (ular parcha-parcha keladi va yig'ish kerak).
export async function streamOpenAiCompatible({ baseUrl, apiKey, model, messages, tools, extraHeaders, onToken }) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(tools ? { tools, tool_choice: 'auto' } : {}),
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      // javob tanasini o'qib bo'lmadi
    }
    const err = new Error(`Provayder xatosi (${res.status}): ${detail.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  const toolCalls = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let json;
      try {
        json = JSON.parse(payload);
      } catch {
        continue;
      }

      const delta = json.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        text += delta.content;
        onToken?.(delta.content);
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          if (!toolCalls[idx]) toolCalls[idx] = { id: '', name: '', arguments: '' };
          if (tc.id) toolCalls[idx].id = tc.id;
          if (tc.function?.name) toolCalls[idx].name += tc.function.name;
          if (tc.function?.arguments) toolCalls[idx].arguments += tc.function.arguments;
        }
      }
    }
  }

  return { text, toolCalls: toolCalls.filter(Boolean) };
}
