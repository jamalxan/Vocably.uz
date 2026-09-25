// Klient tomonida chiqariladigan avatar o'lchamlari — server tarafdagi
// src/lib/s3.js#AVATAR_SIZES bilan bir xil bo'lishi kerak (Telegram ham 640/160).
export const AVATAR_OUTPUT = { full: 640, small: 160 };

// Tanlanadigan fayl: brauzer <img> sifatida ocha oladigan asosiy formatlar.
// Juda katta fayllar (masalan 40MB RAW) brauzerni qotirmasligi uchun chegara.
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp';
export const AVATAR_INPUT_MAX_BYTES = 25 * 1024 * 1024;
