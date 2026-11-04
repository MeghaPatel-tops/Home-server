"""
HomeServe Platform - Catalog Schemas
Pydantic v2 DTOs for Service Categories and Bookable Services.
Enforces Integer Paise for monetary fields and provides formatted Rupee conversions.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field


# ============================================================================
# CATEGORY SCHEMAS
# ============================================================================

class CategoryBase(BaseModel):
    """Shared base properties for a service category."""
    name: str = Field(..., min_length=2, max_length=100, description="Category name (e.g. Electrician, Plumbing)")
    slug: str = Field(..., min_length=2, max_length=120, description="URL-friendly identifier")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed category summary")
    image: Optional[str] = Field(None, max_length=500, description="Category graphic or icon asset path/URL")
    is_active: bool = Field(True, description="Whether this category is available for booking")


class CategoryCreate(BaseModel):
    """Payload for creating a new category."""
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    image: Optional[str] = Field(None, max_length=500)
    is_active: bool = True


class CategoryUpdate(BaseModel):
    """Payload for updating an existing category."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=120)
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """Response DTO for category listings and summary views."""
    id: str = Field(..., description="UUID identifier")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# SERVICE SCHEMAS
# ============================================================================

class ServiceBase(BaseModel):
    """Shared base properties for a bookable service."""
    category_id: str = Field(..., description="Parent category UUID")
    name: str = Field(..., min_length=2, max_length=150, description="Service title (e.g. Ceiling Fan Installation)")
    slug: str = Field(..., min_length=2, max_length=180, description="URL-friendly service slug")
    description: Optional[str] = Field(None, description="Detailed scope of work and inclusions/exclusions")
    base_price_paise: int = Field(..., ge=0, description="Base service price in whole integer paise (e.g. 49900 = ₹499.00)")
    estimated_duration_minutes: int = Field(60, ge=1, le=1440, description="Estimated work duration in minutes")
    is_active: bool = Field(True, description="Whether this service is currently bookable")


class ServiceCreate(BaseModel):
    """Payload for creating a new service item."""
    category_id: str
    name: str = Field(..., min_length=2, max_length=150)
    slug: Optional[str] = Field(None, min_length=2, max_length=180)
    description: Optional[str] = None
    base_price_paise: int = Field(..., ge=0, description="Base labor price in integer paise (no float)")
    estimated_duration_minutes: int = Field(60, ge=1, le=1440)
    is_active: bool = True


class ServiceUpdate(BaseModel):
    """Payload for updating an existing service item."""
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    slug: Optional[str] = Field(None, min_length=2, max_length=180)
    description: Optional[str] = None
    base_price_paise: Optional[int] = Field(None, ge=0)
    estimated_duration_minutes: Optional[int] = Field(None, ge=1, le=1440)
    is_active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    """Response DTO for service listings and detail cards."""
    id: str = Field(..., description="UUID identifier")
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def price_in_rupees(self) -> float:
        """Formatted Indian Rupee representation strictly for display ($1 INR = 100 Paise)."""
        return round(self.base_price_paise / 100.0, 2)

    model_config = ConfigDict(from_attributes=True)


class ServiceDetailResponse(ServiceResponse):
    """Detailed service response including parent category information."""
    category: Optional[CategoryResponse] = None


class CategoryDetailResponse(CategoryResponse):
    """Detailed category response including all child active services."""
    services: List[ServiceResponse] = []
