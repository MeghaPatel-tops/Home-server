"""
HomeServe Platform - Dispatch Attempt Database Model
Tracks provider routing iterations, acceptance SLAs (15-minute deadline),
rejection reasons, and auto-timeout reassignment events.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import DispatchAttemptStatus
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.provider import Provider


class DispatchAttempt(Base, TimestampMixin):
    """
    DispatchAttempt entity recording routing offers dispatched to eligible providers.
    Enforces a 15-minute provider acceptance SLA.
    """
    __tablename__ = "dispatch_attempts"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Associated Booking Reference
    booking_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # Candidate Provider Reference
    provider_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("providers.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # Attempt Lifecycle Status
    attempt_status: Mapped[DispatchAttemptStatus] = mapped_column(
        Enum(DispatchAttemptStatus, name="dispatch_attempt_status", native_enum=False),
        default=DispatchAttemptStatus.PENDING,
        index=True,
        nullable=False,
    )

    # Offer Timing & SLA Expiration
    offered_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    acceptance_deadline: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    responded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    # Rejection Audit
    rejection_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Composite Performance Indexes
    __table_args__ = (
        Index("ix_dispatch_attempts_provider_status", "provider_id", "attempt_status"),
        Index("ix_dispatch_attempts_booking_status", "booking_id", "attempt_status"),
        Index("ix_dispatch_attempts_deadline", "acceptance_deadline", "attempt_status"),
    )

    # ORM Relationships
    booking: Mapped["Booking"] = relationship(
        "Booking",
        back_populates="dispatch_attempts",
    )
    provider: Mapped["Provider"] = relationship(
        "Provider",
        back_populates="dispatch_attempts",
    )

    def __repr__(self) -> str:
        return (
            f"<DispatchAttempt id={self.id} booking_id={self.booking_id} "
            f"provider_id={self.provider_id} status={self.attempt_status}>"
        )
