"""
HomeServe Platform - API v1 Router
Aggregates all Version 1 endpoint controllers
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
def v1_health():
    """
    API v1 health check endpoint.
    Returns the same standard OK response as the root health endpoint.
    """
    return {
        "status": "ok",
        "message": "HomeServe backend is running",
    }
