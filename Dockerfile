# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# If you use a custom server, you can copy that as well
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# Actually, and easy way for local dev/run is to just copy everything 
# and use npm start, but the "standalone" mode is better for production.
# For simplicity in this task, I will use the simpler multi-stage copy.
COPY --from=builder /app ./

EXPOSE 9002

# Environment variables will be passed via docker-compose
# Use a script to run migrations then start the app
CMD ["npm", "run", "start"]
