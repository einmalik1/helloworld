# Coolify / production image for apps/storybook (Storybook static → serve).
# Build context MUST be the monorepo root (Dockerfile build pack + dockerfile_location=/apps/storybook/Dockerfile).
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo@2.11.6
COPY . .
RUN turbo prune @helloworld/storybook --docker

FROM base AS installer
ENV NODE_ENV=development
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY .env.example ./

RUN pnpm exec turbo run build --filter=@helloworld/storybook... \
  && pnpm add -w serve@14.2.5

FROM base AS production
RUN apk add --no-cache curl \
  && addgroup -g 1001 nodeapp && adduser -u 1001 -G nodeapp -s /bin/sh -D nodeapp
WORKDIR /app

COPY --from=installer --chown=nodeapp:nodeapp /app .

ENV NODE_ENV=production
USER nodeapp
EXPOSE 6006
CMD ["pnpm", "exec", "serve", "-s", "apps/storybook/storybook-static", "-l", "6006"]
