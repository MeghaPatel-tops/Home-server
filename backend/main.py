"""
HomeServe Platform - ASGI Application Entrypoint
FastAPI application initialization, middleware setup, and route mounting

Health endpoints:
  GET /health        → Liveness probe.  Always returns 200 OK.  Does NOT touch MySQL.
  GET /health/ready  → Readiness probe. Executes SELECT 1 against MySQL.
                       Returns 200 if reachable, 503 if not.
"""

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.database.session import check_database_connection

# ---------------------------------------------------------------------------
# FastAPI application instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="HomeServe Home Services Booking SaaS Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS Middleware
# allow_credentials=True is required for the __Host-refresh_token HttpOnly cookie.
# allow_origins must NEVER use ["*"] when allow_credentials=True.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Versioned API routers  →  /api/v1/...
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api")


# ---------------------------------------------------------------------------
# Liveness probe — does NOT require a database connection
#
# Used by container orchestrators (Kubernetes, ECS) to decide whether the
# process itself is running.  Should always return 200 as long as the
# Python process is alive.
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_liveness():
    """
    Liveness endpoint.
    Returns 200 OK immediately without touching MySQL.
    """
    return {
        "status": "ok",
        "message": "HomeServe backend is running",
    }


# ---------------------------------------------------------------------------
# Readiness probe — verifies MySQL connectivity
#
# Used by container orchestrators to decide whether the application is ready
# to receive traffic.  Returns 200 when MySQL is reachable, 503 otherwise.
# ---------------------------------------------------------------------------
@app.get("/health/ready", tags=["Health"])
def health_readiness(response: Response):
    """
    Readiness endpoint.
    Executes SELECT 1 against MySQL.
    Returns 200 {"status": "ready"} when connected.
    Returns 503 {"status": "unavailable"} when MySQL is unreachable.
    """
    result = check_database_connection()
    if result["ok"]:
        return {
            "status": "ready",
            "database": "connected",
            "detail": result["detail"],
        }
    # Set 503 so load balancers / health checks treat this correctly
    response.status_code = 503
    return {
        "status": "unavailable",
        "database": "disconnected",
        "detail": result["detail"],
    }


# ---------------------------------------------------------------------------
# Development runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
