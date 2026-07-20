# API image: Postgres-backed Fastify (tsx runtime keeps @aikids/domain TS source)
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/domain/package.json packages/domain/
# Vidtory SDK vendored package (file: dependency for @vidtory/ai-sdk)
COPY packages/vidtory-ai-sdk/package.json packages/vidtory-ai-sdk/
COPY packages/vidtory-ai-sdk/dist packages/vidtory-ai-sdk/dist
RUN npm ci --workspace=@aikids/api --workspace=@aikids/domain --include-workspace-root

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY packages/domain packages/domain
COPY packages/vidtory-ai-sdk packages/vidtory-ai-sdk
COPY apps/api apps/api
# Domain ships as TS source in monorepo — compile for Node runtime imports
RUN npm run build -w @aikids/domain \
  && npx prisma generate --schema=apps/api/prisma/schema.prisma \
  && node apps/api/scripts/copy-generated.mjs
COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]
