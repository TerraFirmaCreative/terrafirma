FROM node:23-alpine AS base
ENV YARN_VERSION=4.5.3

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

FROM base AS builder

ARG SHOPIFY_STORE_DOMAIN
ARG SHOPIFY_STOREFRONT_ACCESS_TOKEN
ARG SHOPIFY_ADMIN_ACCESS_TOKEN

ENV SHOPIFY_STORE_DOMAIN=$SHOPIFY_STORE_DOMAIN
ENV SHOPIFY_STOREFRONT_ACCESS_TOKEN=$SHOPIFY_STOREFRONT_ACCESS_TOKEN
ENV SHOPIFY_ADMIN_ACCESS_TOKEN=$SHOPIFY_ADMIN_ACCESS_TOKEN
ENV DEPLOY_ENV=docker
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /root
COPY [".yarnrc.yml", "yarn.lock", "package.json", "./"]
COPY ./packages/rest ./packages/rest
COPY ./packages/frontend ./packages/frontend
# RUN yarn install --immutable --non-interactive --cache-folder ./ycache; rm -rf ./ycache

RUN yarn install
RUN yarn workspace @terrafirma/frontend install --immutable --ignore-engines --all --non-interactive --cache-folder ./ycache; rm -rf ./ycache
RUN yarn workspace @terrafirma/rest prisma generate
RUN yarn workspace @terrafirma/frontend build
RUN cp -r ./packages/frontend/.next/static ./packages/frontend/.next/standalone/packages/frontend/.next/static
RUN cp -r ./packages/frontend/public ./packages/frontend/.next/standalone/packages/frontend/public

FROM base as runner
EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=builder /root/packages/frontend/.next/standalone ./standalone
COPY --from=builder /root/packages/frontend/server.js ./standalone/packages/frontend/server.js

WORKDIR /app/standalone/packages/frontend

CMD node ./server.js