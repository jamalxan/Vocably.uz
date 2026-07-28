# Sinonimlar AI — Ingliz tili lug'ati platformasi

Next.js (App Router) + MongoDB + Google Gemini AI asosidagi shaxsiy lug'at platformasi.
Kirish/ro'yxatdan o'tish **telefon raqam** orqali, raqam esa **Telegram bot** orqali tasdiqlanadi.

## Imkoniyatlar
- Telefon raqam + parol orqali kirish
- Ro'yxatdan o'tish va parolni tiklashda raqam Telegram bot orqali tasdiqlanadi (kod avtomatik saytga o'tadi)
- Har bir foydalanuvchi uchun alohida, cheklanmagan sonli kategoriyalar (lug'atlar)
- **Kartochka** rejimi — so'zga bosib javobni ko'rish
- **Yozish testi** — sinonim/tarjimalarni o'zingiz yozib sinash
- **Juftlikni topish** o'yini
- **Jadval** — qidiruv, qo'lda so'z qo'shish/o'chirish, talaffuzni eshitish (brauzer ovozi)
- **AI import** — lug'at sahifasi rasmini yuklaganda, Gemini undagi so'z va tarjimalarni avtomatik jadvalga qo'shadi
- **AI Chat** — faqat ingliz tili grammatikasi va tarjima bo'yicha javob beradigan Gemini asosidagi chatbot
- To'liq **responsive** dizayn (telefon, planshet, kompyuter)

> **Ovoz haqida eslatma:** talaffuz brauzerning o'rnatilgan Web Speech API orqali ishlaydi — bu tezkor va bepul.

---

## Telefon raqamni tasdiqlash qanday ishlaydi?

1. Foydalanuvchi saytda telefon raqamini (va parolini) kiritadi.
2. Sayt uni Telegram botga yo'naltiradi (`t.me/BotUsername?start=...`).
3. Bot "Raqamni ulashish" tugmasi orqali kontaktini so'raydi — Telegram bu tugmani bossa, foydalanuvchining **o'z** raqamini avtomatik yuboradi.
4. Bot bu raqamni saytda kiritilgan raqam bilan solishtiradi. Mos kelsa — 6 xonali kod yuboradi.
5. Foydalanuvchi kodni saytga kiritadi, va hisob yaratiladi / parol tiklanadi.

Kod faqat **ro'yxatdan o'tishda** va **parolni unutganda** so'raladi — oddiy kirishda kerak emas.

Bot Vercel'ning serverless funksiyasi (`/api/telegram/webhook`) sifatida ishlaydi — alohida server yoki doim ishlab turadigan process kerak emas.

---

## 1-qadam: Loyihani kompyuteringizda ishga tushirish

```bash
npm install
cp .env.example .env.local
```

`.env.local` faylini oching va quyidagi bo'limlarda tasvirlangan qiymatlarni to'ldiring.

---

## 2-qadam: MONGODB_URI olish (bepul)

1. https://www.mongodb.com/cloud/atlas/register saytida bepul hisob oching.
2. "Build a Database" → **M0 Free** klasterni tanlang.
3. **Database Access** bo'limida yangi foydalanuvchi (username/password) yarating.
4. **Network Access** bo'limida "Allow access from anywhere" (0.0.0.0/0) qo'shing.
5. "Connect" → "Drivers" bo'limidan connection string'ni nusxalang va `.env.local`'ga qo'ying.

---

## 3-qadam: GEMINI_API_KEY olish (bepul)

1. https://aistudio.google.com/app/apikey sahifasiga kiring.
2. "Create API key" tugmasini bosing va kalitni `.env.local`'ga qo'ying.

---

## 4-qadam: JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Natijani `JWT_SECRET` sifatida ishlating.

---

## 5-qadam: Telegram bot yaratish (bepul)

1. Telegram'da [@BotFather](https://t.me/BotFather) botiga o'ting.
2. `/newbot` buyrug'ini yuboring, botga nom va username bering (username `Bot` bilan tugashi kerak, masalan `SinonimlarAIBot`).
3. BotFather sizga bot **token**ini beradi (masalan `123456:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) — buni `TELEGRAM_BOT_TOKEN` sifatida saqlang.
4. Bot username'ini (`@` belgisisiz) `TELEGRAM_BOT_USERNAME` sifatida saqlang.
5. `TELEGRAM_WEBHOOK_SECRET` va `ADMIN_SETUP_SECRET` uchun tasodifiy qiymatlar generatsiya qiling:
   ```bash
   node -e "console.log(require('crypto').randomBytes(20).toString('hex'))"
   ```
   (ikkalasi uchun alohida-alohida ishga tushiring)

> **Eslatma:** botni lokal (`localhost`) muhitda to'liq sinab bo'lmaydi, chunki Telegram webhook manzili ochiq (internetga chiqadigan) URL bo'lishi kerak. Webhookni faqat Vercel'ga joylashtirgandan keyin sozlang (7-qadam).

---

## 6-qadam: GitHub'ga yuklash

```bash
git init
git add .
git commit -m "Sinonimlar AI"
```

GitHub'da yangi bo'sh repository yarating, so'ng:

```bash
git remote add origin https://github.com/<username>/<repo-nomi>.git
git branch -M main
git push -u origin main
```

---

## 7-qadam: Vercel'ga joylash va Telegram webhookni sozlash

1. https://vercel.com saytiga GitHub hisobingiz bilan kiring.
2. "Add New" → "Project" → repositoriyangizni tanlang → "Import".
3. "Environment Variables" bo'limida `.env.local`'dagi barcha qiymatlarni qo'shing:
   `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, `ADMIN_SETUP_SECRET`.
   `APP_URL` ni hozircha bo'sh qoldiring.
4. "Deploy" tugmasini bosing. 1-2 daqiqada loyihangiz jonli bo'ladi (masalan `https://loyiha-nomi.vercel.app`).
5. `APP_URL` environment variable'ini shu manzil bilan to'ldiring (masalan `https://loyiha-nomi.vercel.app`) va loyihani qayta deploy qiling (Vercel'da "Redeploy").
6. Brauzerda quyidagi manzilga bir marta kiring (webhookni ro'yxatdan o'tkazish uchun):
   ```
   https://loyiha-nomi.vercel.app/api/telegram/setup?secret=ADMIN_SETUP_SECRET_QIYMATINGIZ
   ```
   Javobda `"success": true` chiqsa — bot tayyor.

Kodga har safar `git push` qilganingizda, Vercel avtomatik qayta joylaydi (environment variable'lar saqlanib qoladi, webhookni qayta sozlash shart emas).

---

## Loyiha tuzilishi

```
src/
  app/
    page.jsx                      -> Kirish / Ro'yxatdan o'tish / Parolni tiklash
    dashboard/page.jsx            -> Asosiy ilova (barcha rejimlar shu yerda)
    api/
      auth/login/route.js         -> Kirish (telefon + parol)
      auth/register-init/route.js -> Ro'yxatdan o'tishni boshlash, Telegram sessiyasi yaratish
      auth/reset-init/route.js    -> Parolni tiklashni boshlash
      auth/session-status/route.js-> Frontend Telegram tasdig'ini kutayotganda so'raydi
      auth/verify-code/route.js   -> 6 xonali kodni tekshirish
      auth/reset-password/route.js-> Yangi parolni saqlash
      telegram/webhook/route.js   -> Telegram botning asosiy mantig'i
      telegram/setup/route.js     -> Webhookni bir martalik ro'yxatdan o'tkazish
      words/route.js              -> Kategoriya/so'zlarni o'qish va saqlash
      ai/ocr/route.js             -> Rasmdan so'z aniqlash (Gemini Vision)
      ai/chat/route.js            -> AI chat (Gemini)
  lib/
    db.js        -> MongoDB ulanishi
    models.js    -> Mongoose sxemalari (User, OtpSession, Category, Word, ChatMessage)
    auth.js      -> JWT tekshirish yordamchisi
    phone.js     -> Telefon raqamlarni normallashtirish/solishtirish
    telegram.js  -> Telegram Bot API klienti
    otp.js       -> Kod va sessiya tokeni generatsiyasi
    gemini.js    -> Gemini klienti
```

## Muammo yuzaga kelsa

- **"MONGODB_URI sozlanmagan"** — Environment Variables to'g'ri to'ldirilganini tekshiring, serverni qayta ishga tushiring.
- **Login/Register ishlamayapti** — MongoDB Atlas'da "Network Access"da 0.0.0.0/0 qo'shilganini tekshiring.
- **Telegram bot javob bermayapti** — `/api/telegram/setup` orqali webhook to'g'ri sozlanganini, `TELEGRAM_BOT_TOKEN` va `APP_URL` to'g'riligini tekshiring.
- **"Raqam mos kelmadi" xatoligi** — foydalanuvchi Telegram akkauntida ro'yxatdan o'tgan raqam bilan saytda kiritilgan raqam bir xil bo'lishi kerak.
- **AI import/chat ishlamayapti** — `GEMINI_API_KEY` to'g'riligini va Google AI Studio'da kvota tugamaganini tekshiring.
