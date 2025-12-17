FROM node:22-alpine

WORKDIR /app
RUN corepack enable

# Copiamos manifests desde la raíz del repo (contexto = repo root en Railway)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm --filter api build

EXPOSE 3000
CMD ["pnpm","--filter","api","start"]
