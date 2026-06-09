FROM oven/bun:1.3.14 AS base
WORKDIR /app
ENV CI=1
ENV TURBO_TELEMETRY_DISABLED=1

FROM base AS development
ARG VITE_HUB_ORIGIN=http://localhost:5173
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=5174
ENV VITE_HUB_ORIGIN=$VITE_HUB_ORIGIN
COPY . .
RUN bun install --frozen-lockfile
WORKDIR /app/apps/web
EXPOSE 5174
CMD ["bun", "run", "react-router", "dev", "--host", "0.0.0.0", "--port", "5174"]

FROM base AS pruner
COPY . .
RUN bun install --frozen-lockfile
RUN bun run turbo prune web --docker

FROM base AS dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

FROM dependencies AS builder
ARG VITE_HUB_ORIGIN=http://localhost:5173
ENV VITE_HUB_ORIGIN=$VITE_HUB_ORIGIN
COPY --from=pruner /app/out/full/ .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
RUN bun run turbo run build --filter=web

FROM base AS production-dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile --production

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5174

COPY --from=production-dependencies /app ./
COPY --from=builder /app/apps/web/build ./apps/web/build
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web
EXPOSE 5174
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
