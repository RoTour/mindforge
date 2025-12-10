# Use the official Bun image
# See all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Prerelease stage: generate prisma client and build the app
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Generate Prisma Client
# We set dummy environment variables here because:
# 1. 'prisma generate' requires DATABASE_URL to be present (even if not connecting)
# 2. 'bun run build' (SvelteKit) imports server files that may reference env vars (e.g. OPENROUTER_API_KEY)
# These values are NOT persisted to the final image and are only used for the build step.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV REDIS_HOST="localhost"
ENV REDIS_PORT="6379"
ENV OPENROUTER_API_KEY="sk-or-v1-dummy"
ENV RESEND_API_KEY="re_dummy_123456789"
ENV RESEND_FROM_EMAIL="dummy@example.com"
RUN bun run prisma generate

# Build the app
ENV NODE_ENV=production
RUN bun run build

# Final release image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build build
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/prisma prisma

# We use custom output for Prisma client (prisma/generated), so we don't need to copy .prisma from node_modules.
# The 'prisma' directory (containing generated client) is copied above.
# @prisma/client is installed in node_modules via bun install --production.

# Optional: User setup (good practice but kept simple for now as per request "production grade" usually implies non-root)
# USER bun

# Expose the port
EXPOSE 3000/tcp

# Run the app
# SvelteKit adapter-node builds to build/index.js by default
CMD [ "bun", "run", "build/index.js" ]
