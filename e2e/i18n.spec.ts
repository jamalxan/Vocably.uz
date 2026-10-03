// Ruscha interfeys (B1): Sozlamalarda til tanlash, saqlanishi (cookie), <html lang>, tarjima qilingan yuzalar, orqaga qaytish.
import { expect, test } from '@playwright/test';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test('til Sozlamalarda almashadi, qayta yuklanganda saqlanadi, <html lang> mos, orqaga uz', async ({ page, context }) => {
  test.setTimeout(420_000); // to'rt sahifa ketma-ket — sovuq dev serverda har biri alohida kompilyatsiya qilinadi
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/profil');
  await page.getByRole('button', { name: 'Sozlamalar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Sozlamalar' });
  await expect(dialog).toBeVisible({ timeout: 60_000 });

  await dialog.getByRole('button', { name: 'Русский' }).click();
  // Dialog darhol ruscha: sarlavha va bo'limlar
  await expect(page.getByRole('dialog', { name: 'Настройки' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Настройки' }).getByRole('heading', { name: 'Безопасность' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  const cookie = (await context.cookies()).find((c) => c.name === 'vocably_lang');
  expect(cookie?.value).toBe('ru');

  // Mashq sahifasi va yangi kartalar ruscha (qayta yuklashdan keyin ham)
  await page.goto('/app/mashq');
  await expect(page.getByRole('heading', { name: 'Практика' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('Над каким навыком будете работать?')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Офлайн-повторение' })).toBeVisible();
  await expect(page.getByText('Полный пробный экзамен из 4 разделов')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

  // O'yinlar markazidagi hikoya kartasi ham ruscha
  await page.goto('/app/oyinlar');
  await expect(page.getByRole('region', { name: 'ИИ-рассказ' })).toBeVisible({ timeout: 60_000 });

  // Orqaga o'zbekchaga
  await page.goto('/app/profil');
  await page.getByRole('button', { name: /Настройки/ }).click();
  await page.getByRole('dialog', { name: 'Настройки' }).getByRole('button', { name: "O'zbekcha" }).click();
  await expect(page.getByRole('dialog', { name: 'Sozlamalar' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
});

test('kirish/ro‘yxat sahifasi: tizimga kirmasdan til tanlanadi, forma va xatolar ruscha', async ({ page }) => {
  await page.goto('/kirish');
  await expect(page.getByRole('heading', { name: 'Tizimga kirish' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Русский' }).click();
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible();
  await expect(page.getByLabel('Номер телефона')).toBeVisible();
  await expect(page.getByLabel('Пароль', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByText('Введите номер телефона', { exact: true })).toBeVisible();

  // Parolni tiklash bosqichi va ro'yxatdan o'tish sahifasi ham ruscha (til cookie'da saqlanadi)
  await page.getByRole('button', { name: 'Забыли пароль?' }).click();
  await expect(page.getByRole('heading', { name: 'Восстановление пароля' })).toBeVisible();
  await page.goto('/royxat');
  await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('Нет аккаунта?')).toHaveCount(0); // faqat kirish sahifasida
  await expect(page.getByText('Уже есть аккаунт?')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test('o‘yinlar markazi ruscha: sarlavhalar, server matnlari (o‘yin/daraja/vazifa), murabbiy; uz da o‘zgarmaydi', async ({ page, context }) => {
  test.setTimeout(420_000);
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'ru', url: 'http://localhost:3100' }]);
  await page.goto('/app/oyinlar');
  await expect(page.getByRole('heading', { name: 'Ваш путь по словарю' })).toBeVisible({ timeout: 90_000 });
  // Statik sarlavhalar
  for (const h of ['План на сегодня', 'Игры', 'Достижения', 'Этапы освоения']) {
    await expect(page.getByRole('heading', { name: h })).toBeVisible();
  }
  await expect(page.getByText('Ежедневные задания')).toBeVisible();
  await expect(page.getByText('Еженедельные задания')).toBeVisible();
  // Serverdan o'zbekcha kelgan matnlar mijozda tarjima qilinadi
  await expect(page.getByText('Пары слов').first()).toBeVisible(); // o'yin nomi
  await expect(page.getByText('Выучите 10 новых слов')).toBeVisible(); // vazifa
  await expect(page.getByText(/Уровень \d+ · Новичок/)).toBeVisible(); // daraja nomi
  await expect(page.getByText('Первое слово')).toBeVisible(); // yutuq
  // Murabbiy xabari serverda ruscha tuziladi (cookie bo'yicha)
  await expect(page.getByRole('region', { name: 'Наставник' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('region', { name: 'Наставник' }).getByText(/Доброе утро|Добрый день|Добрый вечер|Здравствуйте/)).toBeVisible();
  // O'zbek tilida qaytganda matnlar avvalgidek
  await context.addCookies([{ name: 'vocably_lang', value: 'uz', url: 'http://localhost:3100' }]);
  await page.reload();
  await expect(page.getByRole('heading', { name: "Lug'at sayohatingiz" })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("So'z juftligi").first()).toBeVisible();
});

test('noto‘g‘ri cookie qiymati uz ga tushadi (inyeksiya/yiqilish yo‘q)', async ({ page, context }) => {
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'xx"<script>', url: 'http://localhost:3100' }]).catch(() => {});
  await page.goto('/app/mashq');
  await expect(page.getByRole('heading', { name: 'Mashq' })).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
});
