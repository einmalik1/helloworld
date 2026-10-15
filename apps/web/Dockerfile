# Coolify / production image for apps/web (Vite static → serve).
# Build context MUST be the monorepo root (Dockerfile build pack + dockerfile_location=/apps/web/Dockerfile).
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune @helloworld/web --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY .env.example ./

# Browser-facing API URL baked at build time (Vite PUBLIC_*).
ARG PUBLIC_API_URL=http://localhost:3000
ARG PUBLIC_CHAT_URL=http://localhost:3200
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_CHAT_URL=$PUBLIC_CHAT_URL

RUN pnpm exec turbo run build --filter=@helloworld/web... \
  && pnpm add -w serve@14.2.5

FROM base AS production
RUN addgroup -g 1001 nodeapp && adduser -u 1001 -G nodeapp -s /bin/sh -D nodeapp
WORKDIR /app

COPY --from=installer --chown=nodeapp:nodeapp /app .

ENV NODE_ENV=production
USER nodeapp
EXPOSE 5173
CMD ["pnpm", "exec", "serve", "-s", "apps/web/dist", "-l", "5173"]
