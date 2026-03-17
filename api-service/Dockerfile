# ============================================================
# STAGE 1: "builder"
# Install build tools and compile dependencies
# ============================================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install into a specific directory
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ============================================================
# STAGE 2: "production"
# Slim runtime image without build tools
# ============================================================
FROM python:3.11-slim AS production

# Install only runtime dependency (libpq for psycopg2)
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 apiuser

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /root/.local /home/apiuser/.local

# Copy application code
COPY --chown=apiuser:apiuser . .

USER apiuser

# Ensure scripts in .local are accessible
ENV PATH=/home/apiuser/.local/bin:$PATH
ENV PYTHONPATH=/home/apiuser/.local/lib/python3.11/site-packages

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
