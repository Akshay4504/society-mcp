# Stage 1: Build TypeScript source code
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runtime execution
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && chown -R node:node /app
COPY --from=build --chown=node:node /app/dist ./dist
USER node
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/app.js"]
