# Jira Synergy

Веб-приложение для управления проектами и задачами (аналог Jira). Разработано в рамках выпускной квалификационной работы.

## Описание

Система поддерживает создание проектов, участников с ролями (VIEWER, EDITOR, ADMIN), задачи со статусами и приоритетами, визуализацию процесса на Kanban-доске. Реализована синхронизация изменений в реальном времени между участниками (WebSocket). Аутентификация и разграничение прав доступа — через NextAuth.js и проверку ролей на уровне API.

## Технологический стек

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Redux Toolkit, Tailwind CSS, styled-components
- **Backend:** Next.js Route Handlers (REST API), Socket.io (события в реальном времени)
- **БД:** PostgreSQL, Prisma ORM
- **Инфраструктура:** Docker (PostgreSQL), монорепозиторий (Turborepo)

## Требования

- Node.js 20+ (рекомендуется 22)
- npm 10+
- Docker и Docker Compose (для запуска базы данных)

## Запуск

### 1. База данных (Docker)

В корне проекта создайте файл `.env` с переменными:

```
POSTGRES_USER=synergy_admin
POSTGRES_PASSWORD=<пароль>
POSTGRES_DB=jira_synergy_prod
```

Запуск контейнера с PostgreSQL:

```bash
docker compose up -d
```

### 2. Приложение

Установка зависимостей:

```bash
npm install
```

В корне и при необходимости в `apps/web` и `packages/database` задайте `DATABASE_URL` в `.env`, например:

```
DATABASE_URL="postgresql://synergy_admin:<пароль>@localhost:5432/jira_synergy_prod?schema=public"
```

Применение схемы БД и генерация Prisma Client:

```bash
cd packages/database && npx prisma generate && npx prisma db push && cd ../..
```

Запуск в режиме разработки:

```bash
npm run dev
```

Приложение доступно по адресу: http://localhost:3000

### Дополнительно

- Сборка: `npm run build`
- Запуск в production-режиме: из корня после сборки — `npm run build`, затем в `apps/web`: `npm run start`
- Тесты: `npm run test`
- Линтинг: `npm run lint`

## Структура репозитория

- `apps/web` — веб-приложение (Next.js, клиент и API)
- `packages/database` — схема Prisma и общая работа с БД

Исходные тексты ВКР и материалы к защите расположены в каталоге `diploma/`.
