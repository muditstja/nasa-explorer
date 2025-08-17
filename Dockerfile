# ----- builder: install & build client + server -----
FROM node:18 AS builder
WORKDIR /app

# copy package manifests first for better caching
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# install deps
RUN cd client && npm ci
RUN cd server && npm ci

# copy sources
COPY client ./client
COPY server ./server

# build client (must output to ../server/build as you said)
# e.g. in client/package.json: "build": "vite build --outDir ../server/build"
RUN cd client && npm run build

# build server (tsc -> dist)
RUN cd server && npm run build

# ----- runtime: minimal image + pm2 -----
FROM node:18-alpine AS runtime
WORKDIR /app

# server runtime deps only
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# built artifacts from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/build ./server/build
# if your server reads openapi.json at runtime, copy it too:
# COPY --from=builder /app/server/openapi.json ./server/openapi.json

# pm2 for process management in containers
RUN npm i -g pm2

ENV NODE_ENV=production
# Render will set PORT dynamically; your server must use process.env.PORT
ENV PORT=8080
EXPOSE 8080

# Best practice for Docker: keep PM2 in foreground
CMD ["pm2-runtime", "server/dist/index.js"]
