FROM oven/bun:1.3
WORKDIR /app

RUN apt update && apt install -y openssl

COPY package.json bun.lock ./
RUN bun install
