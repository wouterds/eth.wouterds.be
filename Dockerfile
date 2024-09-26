FROM node:20-alpine AS base
WORKDIR /code

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

RUN apk update
RUN apk add --no-cache libc6-compat dumb-init

FROM base AS build

COPY . .

RUN npm install
RUN npm run build
RUN npm prune --omit=dev

FROM base AS runtime
WORKDIR /code

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

COPY --chown=node:node --from=build /code/build /code/build
COPY --chown=node:node --from=build /code/package.json /code/package.json
COPY --chown=node:node --from=build /code/package-lock.json /code/package-lock.json
COPY --chown=node:node --from=build /code/node_modules /code/node_modules

USER node
EXPOSE $PORT

CMD dumb-init npm run start
