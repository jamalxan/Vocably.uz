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

test('Bugun (dashboard) ruscha: kartalar, reja, kunlar; uz da o‘zgarmaydi', async ({ page, context }) => {
  test.setTimeout(420_000);
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'ru', url: 'http://localhost:3100' }]);
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: /Добро пожаловать/ })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText('Подготовка к IELTS')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'План на сегодня' })).toBeVisible();
  await expect(page.getByText('Задача на сегодня')).toBeVisible();
  await expect(page.getByText('Серия', { exact: true })).toBeVisible();
  await expect(page.getByText('Уровень освоения')).toBeVisible();
  await expect(page.getByText('Нагрузка на ближайшие 7 дней')).toBeVisible();
  await expect(page.getByText('По категориям')).toBeVisible();
  await expect(page.getByText('Повторено сегодня')).toBeVisible();
  await expect(page.getByText('Центр игр')).toBeVisible({ timeout: 30_000 }); // GamesCard — alohida so'rov
  // Qobiq (AppShell): sarlavhadagi tugmalar va suzuvchi AI tugma ruscha
  await expect(page.getByRole('button', { name: 'Выбрать тему' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Уведомления' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Открыть ИИ-помощника/ })).toBeVisible();
  // O'zbek tilida qaytganda avvalgidek
  await context.addCookies([{ name: 'vocably_lang', value: 'uz', url: 'http://localhost:3100' }]);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Xush kelibsiz/ })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText('IELTS tayyorgarlik')).toBeVisible();
  await expect(page.getByText('Bugungi ish')).toBeVisible();
});

test('o‘yin oqimi ruscha: sozlama → savollar → natija ekrani', async ({ page, context }) => {
  test.setTimeout(420_000);
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'ru', url: 'http://localhost:3100' }]);
  await page.goto('/app/oyinlar/multiple_choice');
  await expect(page.getByRole('heading', { name: 'Тест с вариантами ответа' })).toBeVisible({ timeout: 90_000 }); // server nomi tarjima qilingan
  await expect(page.getByText('Сложность', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Авто (рекомендуется)' })).toBeVisible();
  await page.getByRole('button', { name: 'Начать игру' }).click();

  const counter = page.getByText(/Вопрос \d+ \/ \d+/);
  await expect(counter).toBeVisible({ timeout: 60_000 });
  const total = Number((await counter.textContent())!.match(/\/ (\d+)/)![1]);
  await expect(page.getByRole('radiogroup', { name: 'Варианты ответа' })).toBeVisible();
  for (let i = 0; i < total; i++) {
    await expect(page.getByText(`Вопрос ${i + 1} / ${total}`)).toBeVisible();
    await page.getByRole('radiogroup', { name: 'Варианты ответа' }).getByRole('radio').first().click();
    const next = page.getByRole('button', { name: /Далее|Завершить/ });
    const after = i < total - 1 ? page.getByText(`Вопрос ${i + 2} / ${total}`) : page.getByText(/XP/).first();
    await expect(next.or(after)).toBeVisible({ timeout: 15_000 });
    if (await next.isVisible()) await next.click();
  }
  // Natija ekrani
  await expect(page.getByRole('heading', { name: /Готово!|Сессия завершена/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Точность', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Сыграть ещё раз' })).toBeVisible();
});

test('Lug‘at bo‘limi ruscha: menyu, jadval, test rejimi, takrorlash holati', async ({ page, context, isMobile }) => {
  test.setTimeout(480_000);
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'ru', url: 'http://localhost:3100' }]);

  await page.goto('/app/lugat');
  await expect(page.getByRole('heading', { name: 'Словарь' })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText('В каком режиме хотите заниматься?')).toBeVisible();
  await expect(page.getByText('Игра на память')).toBeVisible();
  await expect(page.getByText('Категории', { exact: true })).toBeVisible(); // CategorySwitcher

  await page.goto('/app/lugat/jadval');
  await expect(page.getByText('Новое слово', { exact: true })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole('columnheader', { name: 'Слово' })).toBeVisible();
  if (!isMobile) await expect(page.getByRole('columnheader', { name: 'Синонимы / переводы' })).toBeVisible(); // mobilda ustun yashirin
  await expect(page.getByPlaceholder('Поиск по слову или переводам...')).toBeVisible();

  await page.goto('/app/lugat/takrorlash');
  await expect(page.getByText('Просмотрено сегодня')).toBeVisible({ timeout: 90_000 });
  // Navbat holatiga qarab: bo'sh xabar YOKI karta ("Нажмите, чтобы увидеть")
  await expect(page.getByText('На сегодня слов для повторения не осталось!').or(page.getByText(/Нажмите, чтобы увидеть/))).toBeVisible();

  await page.goto('/app/lugat/test');
  await expect(page.getByRole('heading', { name: 'Диапазон теста' })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText('От:', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Начать', exact: true }).click();
  await expect(page.getByText(/Вопрос 1\/10/)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Выберите (перевод|английский вариант|слово по определению|слово для пропуска)/)).toBeVisible();
  await page.locator('div.space-y-2 > button').first().click(); // TestMode variantlari
  await expect(page.getByRole('button', { name: 'Следующий вопрос →' })).toBeVisible();

  // O'zbekchaga qaytganda avvalgidek
  await context.addCookies([{ name: 'vocably_lang', value: 'uz', url: 'http://localhost:3100' }]);
  await page.goto('/app/lugat');
  await expect(page.getByText('Qaysi rejimda mashq qilmoqchisiz?')).toBeVisible({ timeout: 60_000 });
});

test('Zaif so‘zlar, Kutubxona, Reyting ruscha', async ({ page, context }) => {
  test.setTimeout(300_000);
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'ru', url: 'http://localhost:3100' }]);

  await page.goto('/app/lugat/zaif-sozlar');
  await expect(page.getByRole('heading', { name: 'Слабые слова' })).toBeVisible({ timeout: 90_000 });

  await page.goto('/app/lugat/kutubxona');
  await expect(page.getByRole('heading', { name: 'Библиотека слов' })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByPlaceholder('Слово или перевод…')).toBeVisible();

  await page.goto('/app/reyting');
  await expect(page.getByRole('button', { name: 'Эта неделя' })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole('heading', { name: 'Рейтинг' })).toBeVisible();

  await context.addCookies([{ name: 'vocably_lang', value: 'uz', url: 'http://localhost:3100' }]);
  await page.goto('/app/reyting');
  await expect(page.getByRole('button', { name: 'Bu hafta' })).toBeVisible({ timeout: 60_000 });
});

test('noto‘g‘ri cookie qiymati uz ga tushadi (inyeksiya/yiqilish yo‘q)', async ({ page, context }) => {
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'xx"<script>', url: 'http://localhost:3100' }]).catch(() => {});
  await page.goto('/app/mashq');
  await expect(page.getByRole('heading', { name: 'Mashq' })).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
});
