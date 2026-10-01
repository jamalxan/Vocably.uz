import { User } from '@/lib/models';
import { escapeTelegramHtml } from './telegramHtml';
import { sendMessage, editMessageText } from '@/lib/telegram';
import { applyWordReview, logReviewEvent } from '@/lib/wordReview';

// Daily 5-minute mini-test in Telegram: five words from the user's own
// vocabulary (due ones first), "which translation is right?" with four
// inline buttons. Each answer is a real SRS review (same schedule and streak
// as the web app, src/lib/wordReview.js). State lives on the user
// (`tgQuiz`), so the webhook stays stateless.

export const QUIZ_SIZE = 5;
const LETTERS = ['A', 'B', 'C', 'D'];
const APP = () => (process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '');

export function tashkentDate(d = new Date()) {
  return new Date(d.getTime() + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

function shuffle(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pure: picks up to `size` words with translations (due first) and builds
 * four-option questions whose wrong options are other words' translations. */
export function buildQuiz(categories, { size = QUIZ_SIZE, now = new Date(), rnd = Math.random } = {}) {
  const pool = [];
  for (const c of categories || []) {
    for (const w of c.words || []) {
      const syn = (w.syns || []).find((s) => s && s.trim());
      if (!syn) continue;
      const due = !w.stats?.nextReview || new Date(w.stats.nextReview).getTime() <= now.getTime();
      pool.push({ categoryId: String(c._id), wordId: String(w._id), word: w.word, answer: syn.trim(), due });
    }
  }
  const distinctAnswers = [...new Set(pool.map((p) => p.answer.toLowerCase()))];
  if (pool.length < 4 || distinctAnswers.length < 4) return null;

  const picked = [...shuffle(pool.filter((p) => p.due), rnd), ...shuffle(pool.filter((p) => !p.due), rnd)].slice(0, size);
  const items = picked.map((p) => {
    const wrong = shuffle(
      [...new Set(pool.map((x) => x.answer).filter((a) => a.toLowerCase() !== p.answer.toLowerCase()))],
      rnd
    ).slice(0, 3);
    const options = shuffle([p.answer, ...wrong], rnd);
    return { categoryId: p.categoryId, wordId: p.wordId, word: p.word, options, correct: options.indexOf(p.answer) };
  });
  return { date: tashkentDate(now), idx: 0, score: 0, items };
}

export function questionMarkup(quiz) {
  const q = quiz.items[quiz.idx];
  return {
    text: `🧠 <b>${quiz.idx + 1}/${quiz.items.length}.</b> <b>${escapeTelegramHtml(q.word)}</b> — qaysi tarjima to‘g‘ri?\n\n${q.options.map((o, i) => `${LETTERS[i]}) ${escapeTelegramHtml(o)}`).join('\n')}`,
    reply_markup: {
      inline_keyboard: [
        q.options.map((_, i) => ({ text: LETTERS[i], callback_data: `tq:${quiz.date}:${quiz.idx}:${i}` })),
        [{ text: '🔕 Kunlik mashqni o‘chirish', callback_data: 'tq:off' }],
      ],
    },
  };
}

/** Sends today's reminder + first question (or a plain reminder when the
 * vocabulary is too small for a quiz). Returns what was sent. */
export async function sendDailyPractice(user, now = new Date()) {
  const quiz = buildQuiz(user.categories, { now });
  const streak = user.reviewStreak || 0;
  const header = streak > 0 ? `🔥 ${streak} kunlik seriyangizni uzmang!` : '👋 Bugungi 5 daqiqalik mashq vaqti!';
  if (!quiz) {
    await sendMessage(user.telegramChatId, `${header}\n\nLug‘atingizga so‘z qo‘shing — keyin shu yerda kunlik mini-test keladi.`, {
      reply_markup: { inline_keyboard: [[{ text: 'Vocably’ni ochish', url: `${APP()}/app` }], [{ text: '🔕 O‘chirish', callback_data: 'tq:off' }]] },
    });
    await User.updateOne({ _id: user._id }, { $set: { tgDailySentOn: tashkentDate(now), tgQuiz: null } });
    return 'reminder';
  }
  await sendMessage(user.telegramChatId, `${header}\n${quiz.items.length} ta so‘z — javobni tugma bilan tanlang.`);
  const q = questionMarkup(quiz);
  await sendMessage(user.telegramChatId, q.text, { reply_markup: q.reply_markup });
  await User.updateOne({ _id: user._id }, { $set: { tgDailySentOn: tashkentDate(now), tgQuiz: quiz } });
  return 'quiz';
}

/** Handles a `tq:` callback. Returns the short toast text for answerCallbackQuery. */
export async function handleQuizCallback(chatId, messageId, data, now = new Date()) {
  const user = await User.findOne({ telegramChatId: chatId });
  if (!user) return 'Hisob topilmadi';

  if (data === 'tq:off') {
    user.tgDailyPractice = false;
    user.tgQuiz = null;
    await user.save();
    await sendMessage(chatId, '🔕 Kunlik mashq o‘chirildi. Qayta yoqish: /mashq');
    return 'O‘chirildi';
  }

  const [, date, idxStr, choiceStr] = data.split(':');
  const quiz = user.tgQuiz;
  const idx = Number(idxStr);
  // Stale button (an older quiz or an already answered question) — ignore.
  if (!quiz || quiz.date !== date || quiz.idx !== idx) return 'Bu savol allaqachon javoblangan';

  const item = quiz.items[idx];
  const choice = Number(choiceStr);
  const correct = choice === item.correct;

  const category = user.categories.id(item.categoryId);
  const word = category?.words.id(item.wordId);
  let review = null;
  if (word) review = applyWordReview(user, word, { correct, rating: correct ? 3 : 1, now });

  const next = { ...quiz, idx: idx + 1, score: quiz.score + (correct ? 1 : 0) };
  user.tgQuiz = next.idx < quiz.items.length ? next : null;
  user.markModified('tgQuiz');
  await user.save();
  if (review) {
    await logReviewEvent({ userId: user._id, categoryId: item.categoryId, wordId: item.wordId, mode: 'telegram', rating: correct ? 3 : 1, correct, now, ...review });
  }

  const verdict = correct ? '✅ To‘g‘ri!' : `❌ To‘g‘ri javob: <b>${item.options[item.correct]}</b>`;
  await editMessageText(chatId, messageId, `<b>${escapeTelegramHtml(item.word)}</b> — ${verdict}`).catch(() => {});

  if (next.idx < quiz.items.length) {
    const q = questionMarkup(next);
    await sendMessage(chatId, q.text, { reply_markup: q.reply_markup });
  } else {
    await sendMessage(chatId, `🏁 Natija: <b>${next.score}/${quiz.items.length}</b>. ${next.score === quiz.items.length ? 'Zo‘r!' : 'Ertaga yana davom etamiz.'}\nSeriya: ${user.reviewStreak || 0} kun 🔥`, {
      reply_markup: { inline_keyboard: [[{ text: 'Ilovada davom etish', url: `${APP()}/app/lugat/takrorlash` }]] },
    });
  }
  return correct ? 'To‘g‘ri!' : 'Noto‘g‘ri';
}
