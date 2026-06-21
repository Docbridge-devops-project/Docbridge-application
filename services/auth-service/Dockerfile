# Stage 1: Builder - install production dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Stage 2: Runtime - lean image with security patches
FROM node:18-alpine
RUN apk update && apk upgrade --no-cache
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
USER node
CMD ["node", "src/server.js"]
