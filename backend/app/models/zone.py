"""
HomeServe Platform - Service Zone Database Models
Represents geographic operational service zones defined by 6-digit Indian PIN codes,
and provider-to-zone coverage mapping.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.provider import Provider


class Zone(Base, TimestampMixin):
    """
    Zone entity representing operational coverage territories identified by 6-digit PIN codes.
    Maps to service_zones table.
    """
    __tablename__ = "service_zones"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Geographic Identifiers
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    pincode: Mapped[str] = mapped_column(
        String(6),
        unique=True,
        index=True,
        nullable=False,
    )

    # Operational Flag
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        index=True,
        nullable=False,
    )

    # ORM Relationships
    providers: Mapped[List["Provider"]] = relationship(
        "Provider",
        secondary="provider_zones",
        back_populates="zones",
        overlaps="provider_zones",
    )
    provider_zones: Mapped[List["ProviderZone"]] = relationship(
        "ProviderZone",
        back_populates="zone",
        cascade="all, delete-orphan",
        passive_deletes=True,
        overlaps="providers,zones",
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="zone",
        foreign_keys="Booking.zone_id",
    )

    def __repr__(self) -> str:
        return f"<Zone id={self.id} pincode={self.pincode} city={self.city} is_active={self.is_active}>"


class ProviderZone(Base):
    """
    Association entity linking Service Providers to the Service Zones they service.
    Maps to provider_zones table with unique constraint on (provider_id, zone_id).
    """
    __tablename__ = "provider_zones"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Foreign Keys
    provider_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    zone_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("service_zones.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Status & Audit
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    # Enforce uniqueness to prevent duplicate provider-zone assignments
    __table_args__ = (
        UniqueConstraint("provider_id", "zone_id", name="uq_provider_zone"),
        Index("ix_provider_zones_active", "provider_id", "is_active"),
    )

    # ORM Relationships
    provider: Mapped["Provider"] = relationship(
        "Provider",
        back_populates="provider_zones",
        overlaps="providers,zones",
    )
    zone: Mapped["Zone"] = relationship(
        "Zone",
        back_populates="provider_zones",
        overlaps="providers,zones",
    )

    def __repr__(self) -> str:
        return f"<ProviderZone provider_id={self.provider_id} zone_id={self.zone_id} is_active={self.is_active}>"


# Canonical alias for compatibility
ServiceZone = Zone
