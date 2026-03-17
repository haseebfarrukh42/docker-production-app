# ============================================================
# STAGE 1: "builder"
# Purpose: Install dependencies and compile React → static files
# This entire stage is DISCARDED after build completes
# ============================================================
FROM node:18-alpine AS builder

# Set working directory for the build stage
WORKDIR /app

# Copy dependency manifests first (layer caching optimization)
# If package.json hasn't changed, Docker reuses this cached layer
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code AFTER installing deps (cache efficiency)
COPY . .

# Build React app → outputs static files to /app/build
RUN npm run build

# ============================================================
# STAGE 2: "production"
# Purpose: Serve the compiled static files with lightweight Nginx
# This is the FINAL image — only ~25MB
# ============================================================
FROM nginx:1.25-alpine AS production

# Copy ONLY the compiled output from Stage 1
# Nothing else from Stage 1 comes with this
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80

# Nginx starts automatically — this is the default CMD
CMD ["nginx", "-g", "daemon off;"]
