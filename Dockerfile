FROM alpine AS base

# https://github.com/nodejs/docker-node/issues/1946

# RUN apk add --update --no-cache nodejs npm
# RUN node -e "console.log(123)"
# RUN npm i corepack -g

# https://github.com/nodejs/docker-node/blob/8d8fc479a7d5e98b71c944f362a76303c2ee18e5/22/alpine3.21/Dockerfile


FROM base AS builder

ARG IS_CI
ARG GIT_COMMIT_ID
ARG GIT_COMMIT_DATE

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
ENV WEB_SERVER_ONLY="true"

ENV PATH="$PNPM_HOME:$PATH"
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install corepack -g && corepack enable pnpm && pnpm fetch

COPY . ./
RUN pnpm i --offline --frozen-lockfile

ENV IS_CI=${IS_CI}
ENV CI=${IS_CI}
ENV GIT_COMMIT_ID=${GIT_COMMIT_ID}
ENV GIT_COMMIT_DATE="${GIT_COMMIT_DATE}"

RUN pnpm build:web

FROM base AS final
WORKDIR /server

# https://github.com/sindresorhus/file-type/issues/664
# add icu-data-full fix `new TextDecoder('latin1')` error
RUN apk add --update --no-cache nodejs icu-data-full tzdata

RUN addgroup -g 1001 -S algroup && adduser -u 1001 -S anylisten -G algroup
RUN mkdir /server/data && chown anylisten:algroup /server/data

COPY --from=builder --chown=anylisten:algroup ./source-code/build ./

ENV DATA_PATH="/server/data"

# https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
# ENV TZ=Asia/Shanghai
ENV NODE_ENV="production"
ENV PORT="9500"
ENV BIND_IP="0.0.0.0"

EXPOSE 9500

USER anylisten

CMD [ "node", "index.cjs" ]
