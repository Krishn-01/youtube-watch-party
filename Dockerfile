# Build stage — client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage — server
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev

COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 5000

CMD ["node", "src/index.js"]
