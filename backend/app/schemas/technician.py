"""
HomeServe Platform - Technician Schemas
Pydantic v2 DTOs for Technician Fleet Management, Skills, and Availability Toggles.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TechnicianBase(BaseModel):
    """Shared base properties for a field technician."""
    skills: List[str] = Field(default_factory=list, description="List of trade specializations (e.g. ['electrician'])")
    is_available: bool = Field(True, description="Real-time duty / availability status for dispatches")
    is_active: bool = Field(True, description="Employment status with the provider")


class TechnicianCreate(BaseModel):
    """Payload for onboarding a technician under a provider."""
    user_id: str = Field(..., description="User account UUID for technician login credentials")
    provider_id: str = Field(..., description="Affiliated provider organization UUID")
    skills: List[str] = Field(default_factory=list)


class TechnicianUpdate(BaseModel):
    """Payload for updating technician skills or employment state."""
    skills: Optional[List[str]] = None
    is_available: Optional[bool] = None
    is_active: Optional[bool] = None


class TechnicianStatusUpdate(BaseModel):
    """Payload for toggling technician real-time on-duty / availability status."""
    is_available: bool = Field(..., description="True for Online/Available, False for Offline/Busy")


class TechResponse(TechnicianBase):
    """Response DTO for technician records."""
    id: str = Field(..., description="UUID identifier")
    user_id: str = Field(..., description="Associated User account UUID")
    provider_id: str = Field(..., description="Affiliated Provider UUID")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Alias
TechnicianResponse = TechResponse
