"""
HomeServe Platform - Technician Database Model
Represents field service personnel deployed by Service Providers.
Tracks on-duty availability, specialization skills, and provider affiliation.
"""

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, ForeignKey, Index, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.change_order import ChangeOrder
    from app.models.provider import Provider
    from app.models.user import User


class Technician(Base, TimestampMixin):
    """
    Technician entity representing field service workers assigned to job dispatches.
    Linked 1-to-1 to a User with role TECHNICIAN, and affiliated with an employing Provider.
    """
    __tablename__ = "technicians"

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

    # Employing Provider Organization Reference
    provider_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("providers.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    # Specialization Skills & Trade Badges
    # Stored as native JSON array of skill identifiers (e.g., ["electrician", "ac_technician"])
    skills: Mapped[List[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    # Real-Time Duty & Dispatch Status
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        index=True,
        nullable=False,
    )

    # Employment Active Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        index=True,
        nullable=False,
    )

    # Composite Index for dispatch matching: active and available technicians under a provider
    __table_args__ = (
        Index("ix_technicians_provider_dispatch", "provider_id", "is_available", "is_active"),
    )

    # ORM Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="technician",
    )
    provider: Mapped["Provider"] = relationship(
        "Provider",
        back_populates="technicians",
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="technician",
        foreign_keys="Booking.technician_id",
    )
    change_orders: Mapped[List["ChangeOrder"]] = relationship(
        "ChangeOrder",
        back_populates="technician",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Technician id={self.id} user_id={self.user_id} provider_id={self.provider_id} is_available={self.is_available}>"
