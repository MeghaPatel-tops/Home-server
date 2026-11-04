"""
HomeServe Platform - Provider Schemas
Pydantic v2 DTOs for Service Provider Profiles, KYC Submissions, and Responses.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import KycStatus


class ProviderBase(BaseModel):
    """Shared base properties for a service provider organization."""
    business_name: str = Field(..., min_length=2, max_length=150, description="Registered legal/business name")
    contact_number: str = Field(..., min_length=10, max_length=20, description="Business contact phone number")
    description: Optional[str] = Field(None, max_length=1000, description="Company overview and service specializations")
    is_active: bool = Field(True, description="Whether the provider is active on the platform")


class ProviderCreate(BaseModel):
    """Payload for creating a new provider profile during onboarding."""
    business_name: str = Field(..., min_length=2, max_length=150)
    contact_number: str = Field(..., min_length=10, max_length=20)
    description: Optional[str] = Field(None, max_length=1000)


class ProviderUpdate(BaseModel):
    """Payload for updating provider business details."""
    business_name: Optional[str] = Field(None, min_length=2, max_length=150)
    contact_number: Optional[str] = Field(None, min_length=10, max_length=20)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProviderKycUpload(BaseModel):
    """Payload for recording private KYC storage references (Never public URLs)."""
    kyc_document_key: str = Field(..., description="Secure storage key / path of the uploaded document (e.g. 'kyc/uuid.pdf')")


class ProviderResponse(ProviderBase):
    """Response DTO for provider profile representation."""
    id: str = Field(..., description="UUID identifier")
    user_id: str = Field(..., description="Associated User account UUID")
    kyc_status: KycStatus
    kyc_document_key: Optional[str] = Field(None, description="Internal storage reference (restricted access)")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
