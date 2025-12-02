# ---------------- Stage 1: Builder ----------------
FROM node:20-slim AS builder
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# ---------------- Stage 2: Runtime ----------------
FROM node:20-slim AS runtime
ENV TZ=UTC
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y cron tzdata && \
    ln -snf /usr/share/zoneinfo/UTC /etc/localtime && echo UTC > /etc/timezone && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Node.js dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Setup cron job
COPY cron/mycron /etc/cron.d/mycron
RUN chmod 0644 /etc/cron.d/mycron && crontab /etc/cron.d/mycron

# Create volume mount points
RUN mkdir -p /data /cron && chmod 755 /data /cron

# Expose port 8080
EXPOSE 8080

# Start cron and API server
CMD cron && node server.js
