"""
HomeServe Platform - Zone Schemas
Pydantic v2 DTOs for Service Zones (Pincodes) and Provider-to-Zone Coverage Mappings.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ZoneBase(BaseModel):
    """Shared base properties for a geographic service zone."""
    name: str = Field(..., min_length=2, max_length=100, description="Territory / neighborhood name")
    city: str = Field(..., min_length=2, max_length=100, description="City name")
    state: str = Field(..., min_length=2, max_length=100, description="State name")
    pincode: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", description="6-digit Indian PIN code")
    is_active: bool = Field(True, description="Whether this zone is actively serviceable")


class ZoneCreate(ZoneBase):
    """Payload for registering an operational service zone."""
    pass


class ZoneUpdate(BaseModel):
    """Payload for modifying an existing service zone."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    pincode: Optional[str] = Field(None, min_length=6, max_length=6, pattern=r"^\d{6}$")
    is_active: Optional[bool] = None


class ZoneResponse(ZoneBase):
    """Response DTO for service zone representations."""
    id: str = Field(..., description="UUID identifier")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProviderZoneAssign(BaseModel):
    """Payload for bulk-assigning serviced zones to a provider."""
    zone_ids: List[str] = Field(..., min_length=1, description="List of Zone UUIDs to service")


class ProviderZoneResponse(BaseModel):
    """Response DTO for provider-zone mapping."""
    id: str
    provider_id: str
    zone_id: str
    is_active: bool
    created_at: datetime
    zone: Optional[ZoneResponse] = None

    model_config = ConfigDict(from_attributes=True)
