# Coolify / production image for apps/docs (Fumadocs + Next.js standalone).
# Build context MUST be the monorepo root (Dockerfile build pack + dockerfile_location=/apps/docs/Dockerfile).
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune docs --docker

FROM base AS installer
ENV NODE_ENV=development
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
# openspec is outside the docs workspace graph — required content SoT for the site.
COPY openspec ./openspec

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm exec turbo run build --filter=docs...

FROM base AS production
RUN apk add --no-cache curl \
  && addgroup -g 1001 nodeapp && adduser -u 1001 -G nodeapp -s /bin/sh -D nodeapp

WORKDIR /app

COPY --from=installer --chown=nodeapp:nodeapp /app/apps/docs/.next/standalone ./
COPY --from=installer --chown=nodeapp:nodeapp /app/apps/docs/.next/static ./apps/docs/.next/static

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

USER nodeapp
EXPOSE 4000
CMD ["node", "apps/docs/server.js"]
