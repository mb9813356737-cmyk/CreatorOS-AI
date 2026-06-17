# ─── Build Stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies (openssl is required for Prisma)
RUN apk add --no-cache openssl curl

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js production bundle
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Production Runner Stage ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies (like openssl for Prisma)
RUN apk add --no-cache openssl curl

# Copy built application and dependencies from builder stage
COPY --from=builder /app ./

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Default command: Start Next.js web application
CMD ["npm", "run", "start"]
