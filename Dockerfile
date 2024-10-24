FROM --platform=linux/amd64 node:20-bullseye AS build

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    libpng-dev zlib1g-dev libjpeg-dev build-essential \
    libtool autoconf automake nasm

COPY package*.json ./

RUN npm install --omit=optional

COPY . .

WORKDIR /usr/src/app/pwa-template
RUN npm install

WORKDIR /usr/src/app
RUN npm run build

FROM --platform=linux/amd64 node:20-bullseye

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    libpng-dev zlib1g-dev libjpeg-dev build-essential \
    libtool autoconf automake nasm

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

COPY --from=build /usr/src/app/pwa-template ./pwa-template

WORKDIR /usr/src/app

RUN npm install --production --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]
