# back-end/Dockerfile

# → Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# 1) instala dependências (cache-friendly)
COPY package*.json ./
RUN npm ci

# 2) copia código e builda
COPY . .
RUN npm run build

# → Runtime stage
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# só precisa de deps de prod e do dist
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/.env ./.env

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
