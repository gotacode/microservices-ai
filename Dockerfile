# syntax=docker/dockerfile:1.6

# --- Estágio 1: Build # Aqui instalamos todas as dependências (incluindo dev) e buildamos o projeto.
FROM node:20-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
# Instala todas as dependências para o build
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


# --- Estágio 2: Produção # Esta será a imagem final, otimizada e segura.
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# 1. (NOVO) Cria um usuário não-root para executar a aplicação
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copia os artefatos do build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

# 2. (NOVO) Instala APENAS as dependências de produção
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install --prod --frozen-lockfile

# Troca para o usuário não-root
USER appuser

EXPOSE 3000

# 3. (NOVO) Adiciona uma verificação de saúde que usa nosso endpoint /ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ready || exit 1

CMD ["node", "dist/index.js"]