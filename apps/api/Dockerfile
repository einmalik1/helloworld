# Coolify / production image for apps/api.
# Build context MUST be the monorepo root (Dockerfile build pack + dockerfile_location=/apps/api/Dockerfile).
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune api --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY drizzle.config.ts .env.example ./
# Root migrate script + drizzle-kit (workspace root may omit them after prune).
RUN pnpm add -wD drizzle-kit@0.31.11 \
  && pnpm exec turbo run build --filter=api...

FROM base AS production
RUN addgroup -g 1001 nodeapp && adduser -u 1001 -G nodeapp -s /bin/sh -D nodeapp
WORKDIR /app

COPY --from=installer --chown=nodeapp:nodeapp /app .

COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production
USER nodeapp
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]
