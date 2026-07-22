# Multi-stage: Vite build → nginx static
FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/domain/package.json packages/domain/
RUN npm ci --workspace=@aikids/web --workspace=@aikids/domain --include-workspace-root
COPY packages/domain packages/domain
COPY apps/web apps/web
RUN npm run build -w @aikids/domain
RUN npm run build -w @aikids/web

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
