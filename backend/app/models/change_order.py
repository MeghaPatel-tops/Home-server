"""
HomeServe Platform - Change Order Database Model
Represents on-site scope amendments, extra parts, or additional services
requested by technicians and subject to customer approval.
All pricing is strictly maintained in integer paise.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

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

from app.core.constants import ChangeOrderStatus
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.technician import Technician


class ChangeOrder(Base, TimestampMixin):
    """
    ChangeOrder entity tracking on-site scope expansions, spare parts additions,
    or additional labour charges. Only APPROVED change orders contribute to final billing.
    """
    __tablename__ = "change_orders"

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

    # Submitting Technician Reference
    technician_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("technicians.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    # Itemized Description of Extra Scope / Parts
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Financial Breakdown (Strictly Integer Paise: INR 1.00 = 100 paise)
    additional_amount_paise: Mapped[int] = mapped_column(
        Integer,
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

    # Customer Approval Lifecycle
    approval_status: Mapped[ChangeOrderStatus] = mapped_column(
        Enum(ChangeOrderStatus, name="change_order_status", native_enum=False),
        default=ChangeOrderStatus.PENDING,
        index=True,
        nullable=False,
    )
    customer_response_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    # Composite Index for querying change orders by booking and status
    __table_args__ = (
        Index("ix_change_orders_booking_status", "booking_id", "approval_status"),
    )

    # ORM Relationships
    booking: Mapped["Booking"] = relationship(
        "Booking",
        back_populates="change_orders",
    )
    technician: Mapped["Technician"] = relationship(
        "Technician",
        back_populates="change_orders",
    )

    def __repr__(self) -> str:
        return (
            f"<ChangeOrder id={self.id} booking_id={self.booking_id} "
            f"amount_paise={self.total_amount_paise} status={self.approval_status}>"
        )
