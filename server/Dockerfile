# ---- deps ----
    FROM node:20-alpine AS deps
    WORKDIR /app
    COPY package.json package-lock.json* ./
    RUN npm ci --omit=dev
    
    # ---- build ----
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package.json package-lock.json* tsconfig.json ./
    RUN npm ci
    COPY src ./src
    RUN npm run build
    
    # ---- runner ----
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    COPY --from=deps /app/node_modules ./node_modules
    COPY --from=build /app/dist ./dist
    EXPOSE 8787
    CMD ["pm2", "start", "dist/index.js", "--name", "nasa-explorer-api", "--time"]
    