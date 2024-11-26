FROM node:23-alpine AS base
ENV YARN_VERSION=4.5.3

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

FROM base AS builder
ENV NODE_ENV=production

WORKDIR /root
COPY [".yarnrc.yml", "yarn.lock", "package.json", "./"]
COPY ./packages/rest ./packages/rest
RUN yarn workspace @terrafirma/rest install
RUN yarn workspace @terrafirma/rest build

FROM base as runner
EXPOSE 3000
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /root/packages/rest/dist ./packages/rest/dist
COPY --from=builder /root/packages/rest/package.json ./packages/rest/package.json
COPY --from=builder /root/node_modules ./node_modules
COPY --from=builder /root/package.json ./package.json

CMD node ./packages/rest/dist/src/index.js
