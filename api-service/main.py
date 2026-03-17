from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import socket
import json
import redis
from datetime import datetime

app = FastAPI(
    title="Docker Production App - API Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection — uses service name "redis" as hostname
# Docker DNS resolves "redis" to the Redis container's IP
def get_redis():
    try:
        r = redis.Redis(
            host=os.getenv("REDIS_HOST", "redis"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            decode_responses=True,
            socket_connect_timeout=2
        )
        r.ping()  # Test connection
        return r
    except Exception as e:
        print(f"[API] Redis connection failed: {e}")
        return None

@app.get("/health")
async def health_check():
    redis_status = "disconnected"
    try:
        r = get_redis()
        if r:
            r.ping()
            redis_status = "connected"
    except:
        pass

    return {
        "status": "healthy",
        "service": "api-service",
        "timestamp": datetime.utcnow().isoformat(),
        "hostname": socket.gethostname(),
        "redis": redis_status
    }

@app.get("/info")
async def service_info():
    cache_key = "api:info"
    r = get_redis()

    # Check cache first
    if r:
        cached = r.get(cache_key)
        if cached:
            data = json.loads(cached)
            data["source"] = "redis_cache"   # Show it came from cache
            return data

    # Cache miss — build response
    response = {
        "message": "Docker Production App — Python API Service",
        "version": "1.0.0",
        "tech_stack": "FastAPI + Uvicorn + Redis",
        "hostname": socket.gethostname(),
        "timestamp": datetime.utcnow().isoformat(),
        "source": "database"
    }

    # Store in Redis with 5-minute expiry
    if r:
        r.setex(cache_key, 300, json.dumps(response))

    return response

@app.get("/cache-test")
async def cache_test():
    """Demonstrate Redis caching — first call slow, subsequent calls instant"""
    r = get_redis()
    cache_key = "cache:demo"

    if r:
        hit = r.get(cache_key)
        if hit:
            return {
                "result": hit,
                "source": "CACHE HIT (Redis)",
                "latency": "< 1ms"
            }

        # Simulate slow DB query
        import time
        time.sleep(0.5)  # Simulates 500ms DB query
        value = f"Generated at {datetime.utcnow().isoformat()}"

        r.setex(cache_key, 30, value)  # Cache for 30 seconds

        return {
            "result": value,
            "source": "CACHE MISS (computed, now cached for 30s)",
            "latency": "~500ms"
        }

    return {"error": "Redis not available"}

@app.get("/")
async def root():
    return {"service": "api-service", "status": "running"}


@app.get("/external-config")
async def external_config():
    """
    Shows how external service config is accessed.
    In production this would call real external APIs.
    """
    import os
    return {
        "smtp_configured": bool(os.getenv("SMTP_HOST")),
        "smtp_host": os.getenv("SMTP_HOST", "not configured"),
        "external_api": os.getenv("EXTERNAL_API_URL", "not configured"),
        "aws_region": os.getenv("AWS_REGION", "not configured"),
        "note": "Credentials hidden — only showing non-sensitive config"
    }
