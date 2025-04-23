FROM node:23-alpine3.20 AS base
ENV YARN_VERSION=4.5.3

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

FROM base AS builder
ENV NODE_ENV=production
WORKDIR /root
COPY [".yarnrc.yml", "yarn.lock", "package.json", "./"]
COPY ./packages/worker ./packages/worker
COPY ./packages/rest ./packages/rest

RUN yarn install
RUN yarn workspace @terrafirma/rest prisma generate
RUN yarn workspace @terrafirma/worker install --immutable --ignore-engines --all --non-interactive --cache-folder ./ycache; rm -rf ./ycache
RUN yarn workspace @terrafirma/worker build

FROM base as runner
EXPOSE 3000
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /root/packages/rest/dist ./packages/rest/dist
COPY --from=builder /root/packages/rest/package.json ./packages/rest/package.json
COPY --from=builder /root/packages/worker/dist ./packages/worker/dist
COPY --from=builder /root/node_modules ./node_modules

CMD node ./packages/worker/dist/index.js