"""
HomeServe Platform - Booking & Dispatch Schemas
Pydantic v2 DTOs for booking lifecycles, provider dispatch matching,
technician proof media, and on-site change orders.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import (
    BookingStatus,
    ChangeOrderStatus,
    DispatchAttemptStatus,
    MediaType,
    PaymentPreference,
    PaymentStatus,
)


# =============================================================================
# Booking Media Schemas
# =============================================================================

class BookingMediaBase(BaseModel):
    """Base metadata properties for technician proof photos."""
    media_type: MediaType = Field(..., description="Job execution stage (BEFORE or AFTER)")
    original_filename: str = Field(..., min_length=1, max_length=255, description="Original uploaded file name")
    mime_type: str = Field(..., min_length=3, max_length=100, description="MIME content type (e.g. image/jpeg)")
    file_size: int = Field(..., gt=0, description="File size in bytes")


class BookingMediaCreate(BookingMediaBase):
    """Payload for registering an uploaded media item with its secure cloud storage key."""
    storage_key: str = Field(..., min_length=3, max_length=500, description="Internal cloud bucket object key (Never public URLs)")


class BookingMediaResponse(BookingMediaBase):
    """Response DTO for booking media metadata."""
    id: str = Field(..., description="Media UUID identifier")
    booking_id: str = Field(..., description="Associated booking UUID")
    uploaded_by: str = Field(..., description="Uploader user UUID")
    storage_key: str = Field(..., description="Secure storage key")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Change Order Schemas
# =============================================================================

class ChangeOrderBase(BaseModel):
    """Base attributes for technician on-site change orders."""
    description: str = Field(..., min_length=5, max_length=2000, description="Scope details and spare parts list")
    additional_amount_paise: int = Field(..., gt=0, description="Base additional fee in integer paise (INR 1.00 = 100 paise)")
    gst_amount_paise: int = Field(0, ge=0, description="GST surcharge in integer paise")
    total_amount_paise: int = Field(..., gt=0, description="Gross total additional charge in integer paise")


class ChangeOrderCreate(ChangeOrderBase):
    """Payload submitted by a technician to propose an on-site change order."""
    pass


class ChangeOrderCustomerAction(BaseModel):
    """Customer decision payload to approve or reject a pending change order."""
    approved: bool = Field(..., description="True to approve addition, False to reject")


class ChangeOrderResponse(ChangeOrderBase):
    """Response DTO representing a change order entity."""
    id: str = Field(..., description="Change order UUID identifier")
    booking_id: str = Field(..., description="Associated booking UUID")
    technician_id: str = Field(..., description="Submitting technician UUID")
    approval_status: ChangeOrderStatus
    customer_response_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Dispatch Attempt Schemas
# =============================================================================

class DispatchAttemptBase(BaseModel):
    """Attributes tracking a provider dispatch routing attempt."""
    booking_id: str = Field(..., description="Target booking UUID")
    provider_id: str = Field(..., description="Offered provider UUID")


class DispatchAttemptResponse(DispatchAttemptBase):
    """Response DTO representing a provider dispatch attempt and SLA tracking."""
    id: str = Field(..., description="Dispatch attempt UUID")
    attempt_status: DispatchAttemptStatus
    offered_at: datetime
    acceptance_deadline: datetime = Field(..., description="UTC timestamp (+15 min SLA)")
    responded_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Booking Schemas
# =============================================================================

class BookingBase(BaseModel):
    """Shared core attributes for a service booking."""
    scheduled_at: datetime = Field(..., description="Requested service fulfillment slot in UTC")
    payment_preference: PaymentPreference = Field(
        default=PaymentPreference.ONLINE,
        description="Payment mode preference: ONLINE (Razorpay) or CASH (On-site collection)",
    )
    special_instructions: Optional[str] = Field(
        None,
        max_length=1000,
        description="Customer access notes or special instructions",
    )


class BookingCreate(BookingBase):
    """Payload submitted by a customer to create a service booking."""
    service_id: str = Field(..., description="UUID of the selected service item")
    address_id: str = Field(..., description="UUID of customer's verified delivery address")


class BookingStatusUpdate(BaseModel):
    """Payload for transition events in booking fulfillment."""
    status: BookingStatus = Field(..., description="New booking lifecycle status")
    cancellation_reason: Optional[str] = Field(None, max_length=1000, description="Reason if status is CANCELLED")


class BookingResponse(BookingBase):
    """Standard summary response DTO for booking lists and status checks."""
    id: str = Field(..., description="Booking UUID")
    booking_number: str = Field(..., description="Human-readable booking reference number")
    customer_id: str = Field(..., description="Customer user UUID")
    address_id: str = Field(..., description="Service delivery address UUID")
    service_id: str = Field(..., description="Booked service UUID")
    zone_id: str = Field(..., description="Serviceable zone UUID")
    provider_id: Optional[str] = Field(None, description="Assigned provider UUID")
    technician_id: Optional[str] = Field(None, description="Assigned field technician UUID")

    # Status tracking
    booking_status: BookingStatus
    payment_status: PaymentStatus

    # Pricing in Integer Paise
    base_price_paise: int = Field(..., description="Base catalogue price in paise")
    travel_fee_paise: int = Field(..., description="Travel fee in paise")
    gst_amount_paise: int = Field(..., description="18% GST in paise")
    total_amount_paise: int = Field(..., description="Total price in paise")
    commission_amount_paise: int = Field(..., description="Platform commission cut in paise")
    provider_amount_paise: int = Field(..., description="Net provider share in paise")

    provider_acceptance_deadline: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingDetailResponse(BookingResponse):
    """Comprehensive detail response including attempts, media, and change orders."""
    dispatch_attempts: List[DispatchAttemptResponse] = Field(default_factory=list)
    media: List[BookingMediaResponse] = Field(default_factory=list)
    change_orders: List[ChangeOrderResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
