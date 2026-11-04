"""
HomeServe Platform - Schemas Package
Exports Pydantic v2 DTOs for request validation and response serialization.
"""

from app.schemas.booking import (
    BookingBase,
    BookingCreate,
    BookingDetailResponse,
    BookingMediaBase,
    BookingMediaCreate,
    BookingMediaResponse,
    BookingResponse,
    BookingStatusUpdate,
    ChangeOrderBase,
    ChangeOrderCreate,
    ChangeOrderCustomerAction,
    ChangeOrderResponse,
    DispatchAttemptBase,
    DispatchAttemptResponse,
)
from app.schemas.catalog import (
    CategoryBase,
    CategoryCreate,
    CategoryDetailResponse,
    CategoryResponse,
    CategoryUpdate,
    ServiceBase,
    ServiceCreate,
    ServiceDetailResponse,
    ServiceResponse,
    ServiceUpdate,
)
from app.schemas.provider import (
    ProviderBase,
    ProviderCreate,
    ProviderKycUpload,
    ProviderResponse,
    ProviderUpdate,
)
from app.schemas.technician import (
    TechResponse,
    TechnicianBase,
    TechnicianCreate,
    TechnicianResponse,
    TechnicianStatusUpdate,
    TechnicianUpdate,
)
from app.schemas.zone import (
    ProviderZoneAssign,
    ProviderZoneResponse,
    ZoneBase,
    ZoneCreate,
    ZoneResponse,
    ZoneUpdate,
)

__all__ = [
    # Catalog
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoryDetailResponse",
    "ServiceBase",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceResponse",
    "ServiceDetailResponse",
    # Provider
    "ProviderBase",
    "ProviderCreate",
    "ProviderUpdate",
    "ProviderKycUpload",
    "ProviderResponse",
    # Technician
    "TechnicianBase",
    "TechnicianCreate",
    "TechnicianUpdate",
    "TechnicianStatusUpdate",
    "TechResponse",
    "TechnicianResponse",
    # Zone
    "ZoneBase",
    "ZoneCreate",
    "ZoneUpdate",
    "ZoneResponse",
    "ProviderZoneAssign",
    "ProviderZoneResponse",
    # Booking & Dispatch
    "BookingBase",
    "BookingCreate",
    "BookingStatusUpdate",
    "BookingResponse",
    "BookingDetailResponse",
    "DispatchAttemptBase",
    "DispatchAttemptResponse",
    "BookingMediaBase",
    "BookingMediaCreate",
    "BookingMediaResponse",
    "ChangeOrderBase",
    "ChangeOrderCreate",
    "ChangeOrderCustomerAction",
    "ChangeOrderResponse",
]
