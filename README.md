# FC Web Portal

[![CI](https://github.com/Mar1kya/fc-web-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/Mar1kya/fc-web-portal/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/github/deployments/Mar1kya/fc-web-portal/Production?label=Vercel&logo=vercel)](https://fc-web-portal.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Повностековий вебпортал футбольного клубу «Смарагдова Банда» з інтегрованим фаншопом – єдина цифрова екосистема для інформування вболівальників та онлайн-продажів клубної атрибутики.

## Живий застосунок

**URL:** https://fc-web-portal.vercel.app

## Технологічний стек

| Шар | Технології |
|-----|-----------|
| **Фреймворк** | Next.js 16 (App Router), React 19 |
| **Мова** | TypeScript |
| **Стилізація** | TailwindCSS v4, shadcn/ui, Radix UI |
| **База даних** | PostgreSQL (Neon), Prisma ORM (pg driver adapter) |
| **Автентифікація** | NextAuth v5 (credentials + Google OAuth), bcryptjs, @auth/prisma-adapter |
| **Стан** | Zustand (кошик з persist) |
| **Data fetching** | SWR |
| **Валідація** | Zod |
| **Редактор** | TipTap, sanitize-html (санітизація контенту) |
| **Таблиці** | TanStack Table |
| **Візуалізація даних** | Recharts (дашборд аналітики продажів) |
| **Медіа** | UploadThing, embla-carousel-react, yet-another-react-lightbox |
| **Платежі** | Stripe (Checkout + Webhook) |
| **Спортивні дані** | Sofascore via RapidAPI, react-world-flags (прапори країн гравців/тренерів) |
| **Мультимовність** | next-intl (uk/en) |
| **Хостинг** | Vercel + Neon (serverless) |
| **CI/CD** | GitHub Actions → Vercel, Husky (pre-commit хуки) |

## Основні можливості

### Публічна частина порталу
 
- **Новини та медіа** – стрічка новин, інтерв'ю та офіційних заяв клубу, фотогалереї з прив'язкою до конкретних матчів і гравців.
- **Команда** – профілі гравців і тренерів: біографія, антропометричні дані, прапор країни походження. Гібридна система статистики поєднує історичні показники з даними, обчисленими динамічно на основі реальних подій матчів.
- **Матч-центр** – календар ігор, турнірні таблиці, детальні протоколи матчів (склади, голи, картки, заміни). Дані синхронізуються із сервісом Sofascore через RapidAPI – частина оновлень відбувається автоматично за розкладом, частина запускається адміністратором вручну (детальніше – у розділі «Адміністративна панель»).
- **Фаншоп** – каталог атрибутики з розмірною сіткою та знижками, кошик з персистентним станом без авторизації (Zustand + localStorage), оплата через Stripe.
- **Оформлення замовлення** – покупка доступна як з акаунтом, так і без реєстрації (гостьовий чекаут). Якщо гість пізніше реєструється через Google OAuth, його попередні замовлення прив'язуються до акаунту автоматично. При реєстрації через email/пароль користувач може прив'язати гостьові замовлення вручну в особистому кабінеті, ввівши номер телефону замовлення та його 6-значний ідентифікатор.
- **Мультимовність** – інтерфейс доступний українською та англійською (next-intl).
### Адміністративна панель
 
- **Дашборд** – KPI-картки, графіки аналітики продажів (Recharts), останні 10 замовлень, товарні залишки (менше 5 шт. на складі), список матчів, що завершились, але ще очікують оновлення детального протоколу.
- **Новини** – CRUD-керування публікаціями.
- **Команда** – CRUD-керування гравцями та тренерами. Ростер гравців (без тренерів) можна синхронізувати з Sofascore одним натисканням.
- **Турніри та матчі** – керування матчами, турнірами, сезонами, турнірними таблицями, суперниками та перекладами назв команд. Через Sofascore можна: підтягнути всі матчі поточного сезону одним натисканням, довантажити детальну статистику окремого матчу (склади, голи, картки, заміни) вручну, оновити турнірну таблицю – автоматично за розкладом (cron) або вручну як запасний варіант.
- **Фаншоп** – керування замовленнями, товарами, атрибутикою та категоріями.
- **Галерея** – керування фотоматеріалами.
- **Ролі** – розмежування доступу Admin / User.

## Локальний запуск

### Вимоги
- Node.js 20+
- npm

### Встановлення

```bash
# 1. Клонування репозиторію
git clone https://github.com/Mar1kya/fc-web-portal.git
cd fc-web-portal

# 2. Встановлення залежностей (без скриптів, щоб уникнути Husky в CI)
npm ci --ignore-scripts

# 3. Генерація Prisma клієнта
npm run prisma-generate

# 4. Налаштування змінних середовища
cp .env.example .env.local
# Заповніть значення у .env.local

# 5. Міграція бази даних
npx prisma migrate deploy

# 6. Запуск у режимі розробки
npm run dev
```

Застосунок буде доступний за адресою: http://localhost:3000

> **Примітка щодо Husky:** крок 2 навмисно пропускає `prepare`-скрипт (`--ignore-scripts`), тому pre-commit хуки (lint + type-check перед комітом) не встановлюються автоматично. Якщо плануєте комітити в цей репозиторій локально, встановіть їх вручну: `npm run prepare`.

## Змінні середовища

Створіть файл `.env.local` у кореневій директорії (шаблон – у [`.env.example`](.env.example)):

```env
# База даних (Neon PostgreSQL)
# Обов'язкова змінна – саме її використовує Prisma (prisma.config.ts, lib/prisma.ts).
DATABASE_URL=

# NextAuth
AUTH_SECRET=                         # Секретний ключ для підпису JWT-токенів
AUTH_URL=                            # Базова URL-адреса застосунку
AUTH_TRUST_HOST=true                 # Дозвіл довіри хосту

# Google OAuth
AUTH_GOOGLE_ID=                      # Client ID OAuth-додатку Google
AUTH_GOOGLE_SECRET=                  # Client Secret OAuth-додатку Google

# UploadThing
UPLOADTHING_TOKEN=                   # Токен для роботи з UploadThing API
UPLOADTHING_SECRET=                  # Секретний ключ UploadThing

# Vercel Cron
CRON_SECRET=                         # Секретний ключ для авторизації Cron-запитів

# RapidAPI / Sofascore
RAPIDAPI_KEY=                        # Ключ доступу до Sofascore через RapidAPI

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Публічний ключ Stripe (клієнт)
STRIPE_SECRET_KEY=                   # Секретний ключ Stripe (сервер)
STRIPE_WEBHOOK_SECRET=               # Секрет для верифікації Stripe Webhook подій
```

> При підключенні Neon через інтеграцію Vercel автоматично додається ще низка змінних (`DATABASE_URL_UNPOOLED`, `PGHOST`, `POSTGRES_*` тощо). Проєкт їх не використовує – достатньо однієї `DATABASE_URL`. Повний перелік – у `.env.example`.

## Доступні команди

```bash
npm run dev            # Запуск у режимі розробки
npm run build          # Production збірка
npm run start          # Запуск production сервера
npm run lint            # Статичний аналіз коду (ESLint)
npm run type-check      # Перевірка TypeScript типів
npm run prisma-generate # Генерація Prisma клієнта
```

## CI/CD Pipeline

Pipeline на GitHub Actions запускається при push та pull request до `main` і складається з чотирьох job'ів:

`lint` → `type-check` → `build` → `deploy` (тільки push у `main`, після успішного проходження попередніх job'ів)

| Job | Опис |
|-----|------|
| `lint` | Статичний аналіз коду через ESLint |
| `type-check` | Перевірка TypeScript типів через `tsc --noEmit` |
| `build` | Production збірка Next.js + генерація Prisma клієнта |
| `deploy` | Продакшн-деплой на Vercel через `vercel build` + `vercel deploy --prebuilt --prod` |

Конфігурація: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Структура проєкту

```
fc-web-portal/
├── .github/workflows/         ← CI/CD pipeline (ci.yml)
├── .husky/                    ← Pre-commit хуки (lint + type-check)
├── prisma/                    ← Схема БД (37 моделей) + міграції
├── public/                    ← Статичні файли
├── src/
│   ├── actions/                ← Server Actions (бізнес-логіка мутацій, 19 файлів)
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (admin)/        ← Адміністративна панель (дашборд, новини, команда, турніри, фаншоп, галерея)
│   │   │   ├── (auth)/         ← Сторінки входу та реєстрації
│   │   │   ├── (main)/         ← Публічна частина порталу (новини, команда, матчі, турнірні таблиці, клубна інформація, кабінет)
│   │   │   ├── (shop)/         ← Фаншоп (каталог, кошик, чекаут, замовлення)
│   │   │   ├── [...catchAll]/  ← Обробник невідомих маршрутів
│   │   │   ├── layout.tsx
│   │   │   └── not-found.tsx
│   │   └── api/
│   │       ├── auth/           ← NextAuth обробники
│   │       ├── cron/           ← Vercel Cron Jobs (5 завдань)
│   │       ├── uploadthing/    ← UploadThing файловий роутер
│   │       └── webhooks/
│   │           └── stripe/     ← Stripe Webhook обробник
│   ├── components/             ← UI компоненти (layout, auth, shared, ui – shadcn/ui)
│   ├── hooks/                  ← Клієнтські React хуки
│   ├── i18n/                   ← Конфігурація next-intl
│   ├── lib/                    ← Сервіси (Sofascore, аналітика), утиліти, Prisma/Stripe клієнти, Zod-схеми
│   ├── messages/                ← Файли перекладів (uk.json, en.json)
│   ├── store/                   ← Zustand (кошик фаншопу)
│   ├── auth.ts                  ← NextAuth конфігурація
│   └── proxy.ts                 ← Комбінований middleware (NextAuth + next-intl)
├── .env.example                 ← Шаблон змінних середовища (заповнюється локально в .env.local)
├── .gitignore
├── LICENSE                      ← MIT
├── components.json              ← Конфігурація shadcn/ui
├── eslint.config.mjs            ← ESLint конфігурація
├── next.config.ts               ← Next.js конфігурація
├── next-auth.d.ts               ← NextAuth TypeScript типи
├── postcss.config.mjs           ← PostCSS конфігурація (TailwindCSS v4)
├── prisma.config.ts             ← Prisma конфігурація
├── package.json
├── tsconfig.json
└── vercel.json                  ← Vercel Cron Jobs конфігурація
```

Кожен розділ адмінки та публічної частини (наприклад, `admin/tournaments`, `matches/[slug]`, `shop/product/[slug]`) має власні `_components/`, а списки записів – окремий підмаршрут `archive/` для архівованих елементів. Ця вкладеність навмисно не показана в дереві вище, щоб не перевантажувати огляд.

> **Cron-завдання:** у `vercel.json` налаштовано 4 автоматичних cron-завдання (`update-standings`, `sync-matches`, `sync-details`, `cancel-expired-orders`). П'ятий роут – `sync-roster` – використовує ту саму структуру, але запускається вручну з адміністративної панелі, а не за розкладом.

## Ліцензія

Проєкт розповсюджується під ліцензією MIT – деталі у файлі [LICENSE](./LICENSE).