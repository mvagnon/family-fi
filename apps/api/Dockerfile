FROM oven/bun:1.3.14 AS base
WORKDIR /app
ENV CI=1
ENV TURBO_TELEMETRY_DISABLED=1

FROM base AS pruner
COPY . .
RUN bun install --frozen-lockfile
RUN bun run turbo prune api --docker

FROM base AS dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

FROM dependencies AS builder
COPY --from=pruner /app/out/full/ .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
RUN bun run turbo run build --filter=api

FROM base AS production-dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile --production

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=production-dependencies /app ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["bun", "dist/src/index.js"]
