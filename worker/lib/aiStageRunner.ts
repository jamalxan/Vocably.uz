// AI-01 worker — 7 ta AI-asosli bosqich (segment, parse_reading,
// parse_listening, parse_writing, parse_speaking, parse_answerkey,
// image.classify/extract_images, qa.validate/qa) UMUMIY chaqiruv yo'lini
// baham ko'radi: taskConfig o'qish -> `aiRouter.callTask` (retry/fallback
// zanjiri, allaqachon sinalgan) -> `AiCall` audit yozuvi. Har bosqich fayli
// (`stages/segment.ts` va h.k.) faqat O'ZIGA XOS prompt/schema qismini
// yozadi, bu qismni EMAS — TZ §5.1 "Hech bir bosqich modelga qattiq
// bog'lanmaydi" bir joyda amalga oshiriladi, 7 marta emas.
import { getTaskConfig, recordAiCall, hashInput } from '@/lib/contentAgent/aiCallStore';
import { callTask, AiRouterError } from '@/lib/contentAgent/aiRouter';
import { RetryableStageError, UnrecoverableStageError } from './errors';

export interface AiStageParams {
  taskKey: string;
  bookId: string;
  jobId: string;
  systemPrompt: string;
  userContent?: string;
  // Vision (rasm) kiritish uchun — `extract_images` (image.classify) shu
  // orqali ishlaydi. Berilsa `userContent` o'rniga shu ishlatiladi
  // (aiRouter.js `buildRequestBody`dagi bir xil naqsh — `content` OpenAI
  // ko'p-qismli (matn+image_url) shaklida bo'lishi mumkin, string bilan
  // cheklanmaydi).
  messages?: { role: string; content: string | { type: string; text?: string; image_url?: { url: string } }[] }[];
  jsonSchema: unknown;
  promptVersion: string;
  // AiCall.inputHash — bu bosqichning "kirishi" deb hisoblanadigan narsa
  // (odatda systemPrompt+userContent'ning o'zi, lekin ba'zan faqat userContent
  // yetarli — chaqiruvchi tanlaydi, masalan juda katta systemPrompt'ni har
  // safar hash'ga qo'shib o'tirish shart emas).
  inputForHash: unknown;
}

export interface AiStageResult<T = unknown> {
  data: T;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

/** AiRouterError.retryable (aiRouter.js) shu modulning ikkita xato turiga
 * (`errors.ts`) map qilinadi — jobRunner.ts BullMQ semantikasiga o'girish
 * uchun shularga qaraydi. */
function toStageError(err: unknown): Error {
  if (err instanceof AiRouterError) {
    return err.retryable ? new RetryableStageError(err.message) : new UnrecoverableStageError(err.message);
  }
  return err instanceof Error ? err : new Error(String(err));
}

export async function runAiStage<T = unknown>(params: AiStageParams): Promise<AiStageResult<T>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new UnrecoverableStageError("OPENROUTER_API_KEY sozlanmagan — worker .env'ini tekshiring.");

  const config = await getTaskConfig(params.taskKey);
  if (!config) throw new UnrecoverableStageError(`Noma'lum taskKey: '${params.taskKey}' (na AiTaskConfig'da, na DEFAULT_MODEL_MATRIX'da)`);

  const inputHash = hashInput(params.inputForHash);
  const startedAt = Date.now();

  try {
    const result = await callTask({
      taskKey: params.taskKey,
      systemPrompt: params.systemPrompt,
      userContent: params.userContent,
      messages: params.messages as any,
      jsonSchema: params.jsonSchema as any,
      config,
      apiKey,
      sleepFn: undefined,
    });

    await recordAiCall({
      jobId: params.jobId,
      bookId: params.bookId,
      taskKey: params.taskKey,
      model: result.model,
      promptVersion: params.promptVersion,
      inputHash,
      modelId: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      latencyMs: Date.now() - startedAt,
      ok: true,
      validationErrors: undefined,
    });

    return { data: result.data as T, model: result.model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, costUsd: result.costUsd };
  } catch (err) {
    const stageError = toStageError(err);
    // Audit yozuvi (muvaffaqiyatsiz chaqiruv ham) — asosiy xatoni to'xtatmasin,
    // shuning uchun o'z xatosi jim yutiladi.
    await recordAiCall({
      jobId: params.jobId,
      bookId: params.bookId,
      taskKey: params.taskKey,
      model: config.primary,
      promptVersion: params.promptVersion,
      inputHash,
      modelId: config.primary,
      tokensIn: undefined,
      tokensOut: undefined,
      costUsd: undefined,
      ok: false,
      validationErrors: [stageError.message],
      latencyMs: Date.now() - startedAt,
    }).catch(() => {});
    throw stageError;
  }
}
