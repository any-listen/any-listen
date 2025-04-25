FROM alpine AS base

# https://github.com/nodejs/docker-node/issues/1946

# RUN apk add --update --no-cache nodejs npm
# RUN node -e "console.log(123)"
# RUN npm i corepack -g

# https://github.com/nodejs/docker-node/blob/8d8fc479a7d5e98b71c944f362a76303c2ee18e5/22/alpine3.21/Dockerfile


FROM base AS builder

WORKDIR /source-code

RUN apk add --update --no-cache \
    g++ \
    make \
    py3-pip\
    git \
    nodejs \
    icu-data-full \
    npm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install corepack -g && corepack enable pnpm && pnpm fetch

COPY . ./
RUN pnpm i --offline --frozen-lockfile &&\
    pnpm build:web

FROM base AS final
WORKDIR /server

# https://github.com/sindresorhus/file-type/issues/664
# add icu-data-full fix `new TextDecoder('latin1')` error
RUN apk add --update --no-cache nodejs icu-data-full tzdata

COPY --from=builder ./source-code/build ./

# VOLUME /server/data
ENV DATA_PATH="/server/data"

# https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
# ENV TZ=Asia/Shanghai
EXPOSE 9500
ENV NODE_ENV="production"
ENV PORT="9500"
ENV BIND_IP="0.0.0.0"
# ENV PROXY_HEADER 'x-real-ip'
# ENV SERVER_NAME 'My Sync Server'
# ENV MAX_SNAPSHOT_NUM '10'
# ENV LIST_ADD_MUSIC_LOCATION_TYPE 'top'
# ENV LX_USER_user1 '123.123'
# ENV LX_USER_user2 '{ "password": "123.456", "maxSnapshotNum": 10, "list.addMusicLocationType": "top" }'
# ENV CONFIG_PATH '/server/config.js'
# ENV LOG_PATH '/server/logs'
# ENV DATA_PATH '/server/data'

CMD [ "node", "index.cjs" ]
