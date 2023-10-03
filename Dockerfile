FROM node:20 as BUILD

ENV PUBLIC_LANG=cl

WORKDIR /app
COPY package*.json /app

RUN npm ci

COPY . /app
RUN npx astro build

RUN rm -rf node_modules

FROM node:20

WORKDIR /app
COPY --from=BUILD /app /app
RUN npm i --omit=dev
RUN npx astro telemetry disable

EXPOSE 4321

CMD npx astro preview --host 0.0.0.0 --port 4321
