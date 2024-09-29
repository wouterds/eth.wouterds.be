FROM node:20-alpine AS base
WORKDIR /code

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

RUN apk update
RUN apk add --no-cache libc6-compat dumb-init

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build

COPY . .
COPY --from=deps /code/node_modules ./node_modules
COPY --from=deps /code/package.json ./package.json
COPY --from=deps /code/package-lock.json ./package-lock.json
RUN npm run build

FROM base AS runtime
WORKDIR /code

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

COPY --chown=node:node --from=build /code/build ./build
COPY --chown=node:node --from=deps /code/package.json ./package.json
COPY --chown=node:node --from=deps /code/package-lock.json ./package-lock.json
COPY --chown=node:node --from=deps /code/node_modules ./node_modules

USER node
EXPOSE $PORT

CMD ["dumb-init", "npm", "run", "start"]
