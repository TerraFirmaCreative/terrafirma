# syntax=docker/dockerfile:1
FROM node:21-alpine as builder
ENV NODE_ENV=production

WORKDIR /root
COPY ["yarn.lock", "package.json", "./"]
COPY ./packages/rest ./packages/rest
RUN yarn workspace @terrafirma/rest install --ignore-engines --immutable --all --non-interactive --cache-folder ./ycache; rm -rf ./ycache
RUN yarn workspace @terrafirma/rest build

FROM node:21-alpine as runner
EXPOSE 3000
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /root/packages/rest/dist ./packages/rest/dist
COPY --from=builder /root/packages/rest/package.json ./packages/rest/package.json
COPY --from=builder /root/node_modules ./node_modules
COPY --from=builder /root/package.json ./package.json

CMD node ./packages/rest/dist/src/index.js
