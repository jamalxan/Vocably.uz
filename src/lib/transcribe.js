// Ovozni matnga o'giradi — Groq'ning Whisper endpoint'i (OpenAI /audio/transcriptions
// bilan mos, lekin JSON emas, multipart/form-data). VOCABLY-TZ.md §9.1 Azure/haqiqiy
// Whisper API'ni ko'zda tutgan edi — bu yerda "bepul tarif" varianti (§20.1 risklar
// jadvalidagi o'zi ta'kidlagan zaxira: "Whisper + LLM (fonemasiz)") — GROQ_API_KEY
// allaqachon sozlangan, boshqa hech qanday tashqi kalit qo'shilmadi.
export async function transcribeAudio(fileBuffer, filename, mimeType) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY yo'q — ovozni matnga o'girish sozlanmagan");

  const form = new FormData();
  form.append('file', new Blob([fileBuffer], { type: mimeType || 'audio/webm' }), filename || 'audio.webm');
  form.append('model', 'whisper-large-v3');
  form.append('language', 'en');
  form.append('response_format', 'json');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`Transkripsiya xatosi (${res.status}): ${detail.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.text || '';
}
