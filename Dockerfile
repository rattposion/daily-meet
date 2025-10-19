# Dockerfile único para backend (Express) e frontend (Vite)

# 1) Instala dependências (incluindo dev) uma vez
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) Build do frontend (gera /dist)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Runtime: backend + estáticos do frontend
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Instala apenas dependências de produção para o backend
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia código do backend
COPY server ./server

# Copia build do frontend
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "server/index.js"]