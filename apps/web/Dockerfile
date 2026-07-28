# Multi-stage: Vite build → nginx static
FROM node:22-bookworm-slim AS build
WORKDIR /app
# VITE_API_URL intentionally left empty — FE uses relative /api/* paths.
# nginx.conf (location /api/) proxies to the api container inside Docker network.
# Supply a value only when FE and API are on different domains.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/domain/package.json packages/domain/
RUN npm ci --workspace=@aikids/web --workspace=@aikids/domain --include-workspace-root
COPY packages/domain packages/domain
COPY apps/web apps/web
RUN npm run build -w @aikids/domain
RUN npm run build -w @aikids/web

FROM nginx:1.27-alpine
# envsubst is included in nginx:alpine via gettext package
RUN apk add --no-cache gettext
# Store as template; envsubst replaces ${STORYMEE_HUB_UPSTREAM} at container start
COPY apps/web/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
# Default upstream: host machine port 5100 (works on Docker Desktop for Mac/Windows)
ENV STORYMEE_HUB_UPSTREAM=http://host.docker.internal:5100
EXPOSE 80
# nginx:alpine's official entrypoint already processes /etc/nginx/templates/*.template
# via envsubst automatically — no custom CMD needed.
