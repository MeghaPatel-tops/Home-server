"""
HomeServe Platform - Models Package
Exports all SQLAlchemy 2.0 declarative models for Alembic autogenerate
and application-wide database access.
"""

from app.core.constants import (
    AccountStatus,
    BookingStatus,
    ChangeOrderStatus,
    DispatchAttemptStatus,
    KycStatus,
    MediaType,
    PaymentPreference,
    PaymentStatus,
    UserRole,
)
from app.database.base import Base, SoftDeleteMixin, TimestampMixin
from app.models.address import Address, UserAddress
from app.models.booking import Booking
from app.models.booking_media import BookingMedia
from app.models.category import Category, ServiceCategory
from app.models.change_order import ChangeOrder
from app.models.dispatch_attempt import DispatchAttempt
from app.models.provider import Provider
from app.models.refresh_token import RefreshToken
from app.models.service import Service, ServiceItem
from app.models.technician import Technician
from app.models.user import User
from app.models.zone import ProviderZone, ServiceZone, Zone

__all__ = [
    # Declarative Base & Mixins
    "Base",
    "TimestampMixin",
    "SoftDeleteMixin",
    # Core Constants / Enums
    "UserRole",
    "AccountStatus",
    "KycStatus",
    "BookingStatus",
    "PaymentStatus",
    "PaymentPreference",
    "DispatchAttemptStatus",
    "MediaType",
    "ChangeOrderStatus",
    # User & Auth Models
    "User",
    "RefreshToken",
    "UserAddress",
    "Address",
    # Catalog Models
    "Category",
    "ServiceCategory",
    "Service",
    "ServiceItem",
    # Operations Models
    "Provider",
    "Technician",
    "Zone",
    "ServiceZone",
    "ProviderZone",
    # Booking & Dispatch Models
    "Booking",
    "DispatchAttempt",
    "BookingMedia",
    "ChangeOrder",
]
