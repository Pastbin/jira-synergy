FROM node:22 AS builder

WORKDIR /app

# Копируем манифесты зависимостей (монорепозиторий)
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/

# Установка зависимостей
RUN npm ci

# Копируем исходники
COPY packages/database ./packages/database
COPY apps/web ./apps/web
COPY turbo.json ./

# Генерация Prisma Client и сборка (Turbo собирает web и зависимости)
RUN cd packages/database && npx prisma generate
RUN npm run build

# Финальный образ для запуска
FROM node:22 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Копируем собранное приложение и зависимости
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages/database ./packages/database

WORKDIR /app/apps/web

EXPOSE 3000

# Слушать на всех интерфейсах внутри контейнера
ENV HOSTNAME="0.0.0.0"
CMD ["npx", "next", "start"]
