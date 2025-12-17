FROM node:22-alpine

WORKDIR /app
RUN corepack enable

# 1) Manifests (cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# 2) Instalar deps (sin frozen)
RUN pnpm install --no-frozen-lockfile

# 3) Copiar el resto del repo
COPY . .

# 4) Build del API
RUN pnpm --filter api build

EXPOSE 3000
CMD ["pnpm","--filter","api","start"]
