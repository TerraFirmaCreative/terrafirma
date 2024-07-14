FROM node:21-alpine as builder

ARG SHOPIFY_STORE_DOMAIN
ARG SHOPIFY_STOREFRONT_ACCESS_TOKEN
ARG SHOPIFY_ADMIN_ACCESS_TOKEN
ENV SHOPIFY_STORE_DOMAIN=$SHOPIFY_STORE_DOMAIN
ENV SHOPIFY_STOREFRONT_ACCESS_TOKEN=$SHOPIFY_STOREFRONT_ACCESS_TOKEN
ENV SHOPIFY_ADMIN_ACCESS_TOKEN=$SHOPIFY_ADMIN_ACCESS_TOKEN
ENV DEPLOY_ENV=docker

WORKDIR /root
COPY ["yarn.lock", "package.json", "./"]
COPY ./packages/rest ./packages/rest
COPY ./packages/frontend ./packages/frontend
# RUN yarn install --immutable --non-interactive --cache-folder ./ycache; rm -rf ./ycache
RUN yarn workspace @terrafirma/frontend install --immutable --ignore-engines --all --non-interactive --cache-folder ./ycache; rm -rf ./ycache
RUN yarn workspace @terrafirma/frontend build
RUN cp -r ./packages/frontend/.next/static ./packages/frontend/.next/standalone/packages/frontend/.next/static
RUN cp -r ./packages/frontend/public ./packages/frontend/.next/standalone/packages/frontend/public

FROM node:21-alpine as runner
EXPOSE 3000
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /root/packages/frontend/.next/standalone ./standalone
CMD node ./standalone/packages/frontend/server.js