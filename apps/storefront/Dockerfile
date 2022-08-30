FROM node:16-alpine as deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY dist/package.json ./package.json
RUN yarn install

FROM node:16-alpine as runner

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL $NEXT_PUBLIC_MEDUSA_BACKEND_URL

ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

COPY store-config.js ./store-config.js
COPY store.config.json ./store.config.json
COPY postcss.config.js ./postcss.config.js
COPY tailwind.config.js ./tailwind.config.js
COPY dist/next.config.js ./next.config.js
COPY dist/public ./public
COPY dist/.next/standalone/apps/frontend ./
COPY dist/.next/static ./.next/static
COPY dist/.next ./dist/.next
RUN yarn add sharp

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]