# ============================================================
# STAGE 1: "dependencies"  
# Install ALL deps including devDependencies for any build steps
# ============================================================
FROM node:18-alpine AS dependencies

WORKDIR /app
COPY package*.json ./

# Install everything (dev + production)
RUN npm install

# ============================================================
# STAGE 2: "production"
# Only production dependencies, no dev tools
# ============================================================
FROM node:18-alpine AS production

# Create non-root user for security (best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --production && \
    npm cache clean --force

# Copy application source code
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

EXPOSE 5000

CMD ["node", "server.js"]
