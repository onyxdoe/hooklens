# syntax=docker/dockerfile:1

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY cli/package.json ./cli/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -g 1001 hooklens \
  && useradd -u 1001 -g hooklens -m hooklens

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml drizzle.config.ts ./
COPY cli/package.json ./cli/
COPY drizzle ./drizzle
COPY app/db/schema.ts app/db/base.ts ./app/db/
COPY scripts/docker-entrypoint.sh /entrypoint.sh
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

RUN chmod +x /entrypoint.sh \
  && mkdir -p /app/data \
  && chown -R hooklens:hooklens /app

USER hooklens
VOLUME ["/app/data"]
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
