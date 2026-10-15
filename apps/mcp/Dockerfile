# Coolify / production image for apps/mcp.
# Build context MUST be the monorepo root (Dockerfile build pack + dockerfile_location=/apps/mcp/Dockerfile).
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune mcp --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY .env.example ./
RUN pnpm exec turbo run build --filter=mcp...

FROM base AS production
RUN addgroup -g 1001 nodeapp && adduser -u 1001 -G nodeapp -s /bin/sh -D nodeapp
WORKDIR /app

COPY --from=installer --chown=nodeapp:nodeapp /app .

ENV NODE_ENV=production
USER nodeapp
WORKDIR /app/apps/mcp
EXPOSE 3100
CMD ["node", "dist/main.js"]
