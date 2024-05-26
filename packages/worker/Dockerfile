# syntax=docker/dockerfile:1
FROM node:21-alpine as builder
ENV NODE_ENV=production

WORKDIR /root
COPY ["yarn.lock", "package.json", "./"]
COPY ./packages/rest ./packages/rest
COPY ./packages/worker ./packages/worker
RUN yarn workspace @terrafirma/worker install --immutable --ignore-engines --all --non-interactive --cache-folder ./ycache; rm -rf ./ycache
# RUN yarn workspace @terrafirma/worker add typescript
RUN yarn workspace @terrafirma/worker build
# RUN yarn workspace @terrafirma/worker add sharp --ignore-engines

FROM node:21-alpine as runner
EXPOSE 3000
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /root/packages/rest/dist ./packages/rest/dist
COPY --from=builder /root/packages/rest/package.json ./packages/rest/package.json
COPY --from=builder /root/packages/worker/dist ./packages/worker/dist
COPY --from=builder /root/node_modules ./node_modules
CMD node ./packages/worker/dist/index.js