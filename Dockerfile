# Этап 1: Сборка проекта
FROM node:20-buster-slim AS build

WORKDIR /usr/src/app

# Устанавливаем необходимые системные зависимости для сборки графических пакетов
RUN apt-get update && apt-get install -y \
    libpng-dev zlib1g-dev libjpeg-dev gcc g++ make autoconf automake libtool nasm

# Копируем package.json и package-lock.json для основного проекта
COPY package*.json ./

# Устанавливаем зависимости для основного проекта, включая опциональные зависимости
RUN npm install

# Копируем исходный код и запускаем сборку
COPY . .
RUN npm run build

# Этап 2: Production-образ
FROM node:20-buster-slim

WORKDIR /usr/src/app

# Устанавливаем необходимые системные зависимости для графических пакетов в production-окружении
RUN apt-get update && apt-get install -y \
    libpng-dev zlib1g-dev libjpeg-dev

# Копируем необходимые файлы из build-этапа
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

# Копируем pwa-template
COPY --from=build /usr/src/app/pwa-template ./pwa-template

# Устанавливаем зависимости для pwa-template, включая опциональные зависимости
WORKDIR /usr/src/app/pwa-template
RUN npm install --production

# Возвращаемся в основную директорию для запуска
WORKDIR /usr/src/app

# Устанавливаем production-зависимости для основного проекта
RUN npm install --production --omit=dev

# Открываем порт для сервера
EXPOSE 3000

# Команда для запуска приложения
CMD ["node", "dist/main.js"]
