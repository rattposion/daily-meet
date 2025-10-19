# Backend Dockerfile (Node 20)
FROM node:20-alpine AS base
WORKDIR /app

# Instala dependências
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia código do backend
COPY server ./server

EXPOSE 4000
CMD ["node", "server/index.js"]