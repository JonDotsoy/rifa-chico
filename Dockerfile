FROM node:20 as BUILD

WORKDIR /app

COPY . .

RUN npm ci
RUN npx astro build

FROM node:20

WORKDIR /app
COPY --from=BUILD /app /app
RUN npm run --omit=dev

EXPOSE 4321

CMD npx astro preview --host 0.0.0.0 --port 4321
