# syntax=docker/dockerfile:1
FROM node:21-slim as builder
ENV NODE_ENV=production

WORKDIR /root
COPY ["yarn.lock", "package.json", "./"]
COPY ./packages/rest ./packages/rest
COPY ./packages/worker ./packages/worker
RUN yarn workspace @terrafirma/worker install --immutable --ignore-engines --all --non-interactive --cache-folder ./ycache; rm -rf ./ycache
# RUN yarn workspace @terrafirma/worker add typescript
RUN yarn workspace @terrafirma/worker build
# RUN yarn workspace @terrafirma/worker add sharp --ignore-engines

FROM node:21-slim as runner
EXPOSE 3000
ENV NODE_ENV=production
ENV PROJECTION_MAP_PATH=/app/lib/python/projection_map/
ENV PYTHON_CMD=python3
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install python/pip
# ENV PYTHONUNBUFFERED=1
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python && ln -sf python /usr/bin/python
# RUN python3 -m ensurepip
# RUN pip3 install --no-cache --upgrade pip setuptools

COPY ./packages/worker/src/utils/python ./lib/python

RUN apt-get update && apt-get install -y python3 python3-pip python3.11-venv
RUN python3 -m venv ./lib/python/.venv
RUN . lib/python/.venv/bin/activate && python3 -m pip install -r ./lib/python/projection_map/requirements-docker.txt
# RUN . lib/python/.venv/bin/activate && pip install opencv-contrib-python
# RUN . lib/python/.venv/bin/activate && pip install opencv-python-headless
# RUN source ./lib/python/.venv/bin/activate && pip install cv2 pandas dotenv "gql[all]"
COPY --from=builder /root/packages/rest/dist ./packages/rest/dist
COPY --from=builder /root/packages/rest/package.json ./packages/rest/package.json
COPY --from=builder /root/packages/worker/dist ./packages/worker/dist
COPY --from=builder /root/node_modules ./node_modules
CMD . lib/python/.venv/bin/activate && node ./packages/worker/dist/index.js