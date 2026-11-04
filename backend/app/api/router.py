"""
HomeServe Platform - Top-Level API Router
Aggregates versioned sub-routers (v1, v2, etc.)
"""

from fastapi import APIRouter
from app.api.v1.router import router as v1_router

api_router = APIRouter()

# Mount Version 1 Router under prefix /v1
api_router.include_router(v1_router, prefix="/v1")
