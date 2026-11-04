"""
HomeServe Platform - Provider Database Model
Represents verified service provider organizations and contractor businesses.
Manages KYC approval state, fleet technician management, and zone coverage.
"""

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import KycStatus
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.dispatch_attempt import DispatchAttempt
    from app.models.technician import Technician
    from app.models.user import User
    from app.models.zone import ProviderZone, Zone


class Provider(Base, TimestampMixin):
    """
    Provider entity representing registered contractor organizations on HomeServe.
    Linked 1-to-1 to a User with role PROVIDER.
    """
    __tablename__ = "providers"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # 1-to-1 Link to User Authentication Entity
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    # Business Information
    business_name: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )
    contact_number: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # KYC Verification Lifecycle
    kyc_status: Mapped[KycStatus] = mapped_column(
        Enum(KycStatus, name="kyc_status", native_enum=False),
        default=KycStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Secure KYC Private Document Reference (Never public URLs)
    # Stores private cloud bucket object key (e.g., 'kyc/47ac10b-...pdf')
    kyc_document_key: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Operational Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        index=True,
        nullable=False,
    )

    # ORM Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="provider",
    )
    technicians: Mapped[List["Technician"]] = relationship(
        "Technician",
        back_populates="provider",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    zones: Mapped[List["Zone"]] = relationship(
        "Zone",
        secondary="provider_zones",
        back_populates="providers",
    )
    provider_zones: Mapped[List["ProviderZone"]] = relationship(
        "ProviderZone",
        back_populates="provider",
        cascade="all, delete-orphan",
        passive_deletes=True,
        overlaps="zones",
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="provider",
        foreign_keys="Booking.provider_id",
    )
    dispatch_attempts: Mapped[List["DispatchAttempt"]] = relationship(
        "DispatchAttempt",
        back_populates="provider",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Provider id={self.id} business_name={self.business_name} kyc_status={self.kyc_status}>"
