"""
HomeServe Platform - Booking Database Model
Represents customer service orders, tracking the lifecycle from dispatch matching,
technician fulfillment, secure OTP job verification, to financial settlement.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import BookingStatus, PaymentPreference, PaymentStatus
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.address import UserAddress
    from app.models.booking_media import BookingMedia
    from app.models.change_order import ChangeOrder
    from app.models.dispatch_attempt import DispatchAttempt
    from app.models.provider import Provider
    from app.models.service import Service
    from app.models.technician import Technician
    from app.models.user import User
    from app.models.zone import Zone


class Booking(Base, TimestampMixin):
    """
    Booking entity tracking service order execution, assignment, pricing, and job verification.
    Uses whole integer paise for all monetary values.
    Maintains separate booking lifecycle and payment lifecycle states.
    """
    __tablename__ = "bookings"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Human-Readable Unique Booking Number (e.g. BK-20261104-XXXX)
    booking_number: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        nullable=False,
    )

    # Foreign Keys
    customer_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    address_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user_addresses.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    service_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("services.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    zone_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("service_zones.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    provider_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("providers.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    technician_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("technicians.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    # Schedule Time (UTC)
    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    # Status State Machines (Booking and Payment are strictly separated)
    booking_status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status", native_enum=False),
        default=BookingStatus.PENDING_ASSIGNMENT,
        index=True,
        nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status", native_enum=False),
        default=PaymentStatus.PENDING,
        index=True,
        nullable=False,
    )
    payment_preference: Mapped[PaymentPreference] = mapped_column(
        Enum(PaymentPreference, name="payment_preference", native_enum=False),
        default=PaymentPreference.ONLINE,
        nullable=False,
    )

    # Financial Breakdown (All values strictly stored in Integer Paise: INR 1.00 = 100 paise)
    base_price_paise: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    travel_fee_paise: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )
    gst_amount_paise: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )
    total_amount_paise: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    commission_amount_paise: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )
    provider_amount_paise: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )

    # SLA & Operational Deadlines
    provider_acceptance_deadline: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    # Narrative Notes
    special_instructions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    cancellation_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Secure OTP Verification (HMAC-SHA256 hashes, never plaintext)
    start_otp_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    end_otp_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    otp_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )
    otp_locked_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    # Composite & Performance Indexes
    __table_args__ = (
        Index("ix_bookings_provider_status", "provider_id", "booking_status"),
        Index("ix_bookings_tech_status", "technician_id", "booking_status"),
        Index("ix_bookings_zone_status", "zone_id", "booking_status"),
        Index("ix_bookings_customer_created", "customer_id", "created_at"),
    )

    # ORM Relationships
    customer: Mapped["User"] = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="customer_bookings",
    )
    address: Mapped["UserAddress"] = relationship(
        "UserAddress",
        foreign_keys=[address_id],
        back_populates="bookings",
    )
    service: Mapped["Service"] = relationship(
        "Service",
        foreign_keys=[service_id],
        back_populates="bookings",
    )
    zone: Mapped["Zone"] = relationship(
        "Zone",
        foreign_keys=[zone_id],
        back_populates="bookings",
    )
    provider: Mapped[Optional["Provider"]] = relationship(
        "Provider",
        foreign_keys=[provider_id],
        back_populates="bookings",
    )
    technician: Mapped[Optional["Technician"]] = relationship(
        "Technician",
        foreign_keys=[technician_id],
        back_populates="bookings",
    )
    dispatch_attempts: Mapped[List["DispatchAttempt"]] = relationship(
        "DispatchAttempt",
        back_populates="booking",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    media: Mapped[List["BookingMedia"]] = relationship(
        "BookingMedia",
        back_populates="booking",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    change_orders: Mapped[List["ChangeOrder"]] = relationship(
        "ChangeOrder",
        back_populates="booking",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"<Booking id={self.id} number={self.booking_number} "
            f"status={self.booking_status} payment={self.payment_status} "
            f"total_paise={self.total_amount_paise}>"
        )
