# FC Web Portal

[![Pipeline Status](https://git.ztu.edu.ua/ipz/2022-2026/vt-22-1/tsyvinskyy-maryan/fc-web-portal/badges/main/pipeline.svg)](https://git.ztu.edu.ua/ipz/2022-2026/vt-22-1/tsyvinskyy-maryan/fc-web-portal/-/pipelines)
[![Vercel](https://img.shields.io/badge/vercel-deployed-brightgreen?logo=vercel)](https://fc-web-portal.vercel.app)


Повностековий вебпортал футбольного клубу «Смарагдова Банда» з інтегрованим фаншопом — єдина цифрова екосистема для інформування вболівальників та онлайн-продажів клубної атрибутики.

## Живий застосунок

**URL:** https://fc-web-portal.vercel.app

## Технологічний стек

| Шар | Технології |
|-----|-----------|
| **Фреймворк** | Next.js 16 (App Router), React 19 |
| **Мова** | TypeScript |
| **Стилізація** | TailwindCSS v4, shadcn/ui, Radix UI |
| **База даних** | PostgreSQL (Neon), Prisma ORM |
| **Автентифікація** | NextAuth v5 (credentials + Google OAuth) |
| **Стан** | Zustand (кошик з persist) |
| **Валідація** | Zod |
| **Редактор** | TipTap |
| **Таблиці** | TanStack Table |
| **Медіа** | UploadThing |
| **Платежі** | Stripe (Checkout + Webhook) |
| **Спортивні дані** | Sofascore via RapidAPI |
| **Мультимовність** | next-intl (uk/en) |
| **Хостинг** | Vercel + Neon (serverless) |
| **CI/CD** | GitLab CI/CD → GitHub → Vercel |

## Функціональні модулі

- **Контент та медіа** — публікація новин, інтерв'ю та заяв, керування фотогалереями з прив'язкою до матчів і гравців. 
- **Команда** — профілі гравців і тренерів (біографія, антропометрія). Впроваджено систему гібридної статистики, що об'єднує історичні дані з динамічно обчисленими показниками  на основі реальних подій матчів.
- **Матч-центр** — календар, турнірні таблиці та детальні протоколи ігор (склади, голи, картки, заміни). Дані автоматично синхронізуються із сервісом Sofascore через RapidAPI, знімаючи рутинне навантаження з адміністраторів.
- **Електрона комерція** — повний цикл продажів: управління каталогом, розмірною сіткою та знижками. Стан кошика персистується без авторизації завдяки Zustand та localStorage, а транзакції безпечно обробляються платіжним шлюзом Stripe.
- **Користувачі** — автентифікація через NextAuth v5 (OAuth та Email/Password), розмежування ролей (Admin/User), особистий кабінет з історією замовлень та автоматична прив'язка попередніх гостьових покупок до новоствореного акаунту.

## Локальний запуск

### Вимоги
- Node.js 22+
- npm

### Встановлення

```bash
# 1. Клонування репозиторію
git clone https://git.ztu.edu.ua/ipz/2022-2026/vt-22-1/tsyvinskyy-maryan/fc-web-portal.git
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

## Змінні середовища

Створіть файл `.env.local` у кореневій директорії:

```env
# База даних (Neon PostgreSQL)
DATABASE_URL=                        # Рядок підключення через pgBouncer (для Prisma)
DATABASE_URL_UNPOOLED=               # Пряме підключення без pgBouncer (для міграцій)

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

## Доступні команди

```bash
npm run dev            # Запуск у режимі розробки
npm run build          # Production збірка
npm run start          # Запуск production сервера
npm run lint           # Статичний аналіз коду (ESLint)
npm run type-check     # Перевірка TypeScript типів
npm run prisma-generate # Генерація Prisma клієнта
```

## CI/CD Pipeline

Pipeline запускається при кожному push до будь-якої гілки та складається з чотирьох стадій:
lint → type-check → build → mirror (тільки main)

| Стадія | Опис |
|--------|------|
| `lint` | Статичний аналіз коду через ESLint |
| `type-check` | Перевірка TypeScript типів через tsc --noEmit |
| `build` | Production збірка Next.js + генерація Prisma клієнта |
| `mirror` | Дзеркалювання на GitHub → автодеплой на Vercel |

## Структура проєкту

```
fc-web-portal/
├── prisma/                        ← Схема БД (31 сутність)
├── public/                        ← Статичні файли
├── src/
│   ├── actions/                   ← 16 Server Actions (бізнес-логіка мутацій)
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (admin)/           ← Адміністративна панель
│   │   │   ├── (auth)/            ← Сторінки входу та реєстрації
│   │   │   ├── (main)/            ← Публічна частина порталу
│   │   │   ├── (shop)/            ← Фаншоп
│   │   │   ├── [...catchAll]/     ← Обробник невідомих маршрутів
│   │   │   ├── layout.tsx
│   │   │   └── not-found.tsx
│   │   └── api/
│   │       ├── auth/              ← NextAuth обробники
│   │       ├── cron/              ← Vercel Cron Jobs (3 завдання)
│   │       ├── uploadthing/       ← UploadThing файловий роутер
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts   ← Stripe Webhook обробник
│   ├── components/                ← UI компоненти
│   ├── hooks/                     ← Клієнтські React хуки
│   ├── i18n/                      ← Конфігурація next-intl
│   ├── lib/
│   │   ├── services/              ← Сервіси (Sofascore, синхронізація)
│   │   ├── utils/                 ← Допоміжні утиліти
│   │   ├── constants.ts           ← Константи (локалі, статуси)
│   │   ├── prisma.ts              ← Prisma singleton клієнт
│   │   ├── schemas.ts             ← Zod схеми валідації
│   │   ├── stripe.ts              ← Stripe клієнт
│   │   ├── uploadthing.ts         ← UploadThing конфігурація
│   │   └── utils.ts               ← Загальні утиліти
│   ├── messages/                  ← Файли перекладів (uk.json, en.json)
│   ├── store/                     ← Zustand (кошик фаншопу)
│   ├── auth.ts                    ← NextAuth конфігурація
│   ├── global.d.ts                ← Глобальні TypeScript типи
│   └── proxy.ts                   ← Комбінований middleware (NextAuth + next-intl)
├── .gitlab-ci.yml                 ← GitLab CI/CD pipeline
├── eslint.config.mjs              ← ESLint конфігурація
├── next.config.ts                 ← Next.js конфігурація
├── next-auth.d.ts                 ← NextAuth TypeScript типи
├── package.json
├── prisma.config.ts               ← Prisma конфігурація
├── tsconfig.json
└── vercel.json                    ← Vercel Cron Jobs конфігурація
```

## Якість коду

- **ESLint** — статичний аналіз, запускається у CI
- **TypeScript** — суворий type-check на всіх рівнях застосунку
- **Lighthouse** — 98/100 Performance (Desktop), 96/100 (Mobile)
- **Тестування** — 18 функціональних сценаріїв, 11 граничних випадків
- **Кросбраузерність** — Chromium, WebKit, Gecko

## Дзеркало

GitLab (основний): https://git.ztu.edu.ua/ipz/2022-2026/vt-22-1/tsyvinskyy-maryan/fc-web-portal

GitHub (дзеркало): https://github.com/Mar1kya/fc-web-portal