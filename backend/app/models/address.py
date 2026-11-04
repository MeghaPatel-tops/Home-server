"""
HomeServe Platform - User Address Database Model
Represents customer physical service addresses with 6-digit pincode serviceability,
doorstep coordinates, and primary address designations.
"""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.user import User


class UserAddress(Base, TimestampMixin, SoftDeleteMixin):
    """
    UserAddress entity storing physical doorstep locations for service fulfillment.
    Indexed by user and pincode for rapid dispatch and serviceability checks.
    """
    __tablename__ = "user_addresses"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # User Reference (Foreign Key with Cascade Delete)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # Address Descriptor & Doorstep Details
    label: Mapped[str] = mapped_column(
        String(50),
        default="Home",
        nullable=False,
    )
    house_details: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    street_locality: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    landmark: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Regional & Postal Information
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    pincode: Mapped[str] = mapped_column(
        String(6),
        index=True,
        nullable=False,
    )

    # Geographic Coordinates (High-Precision GPS for Technician Route Navigation)
    latitude: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 7),
        nullable=True,
    )
    longitude: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 7),
        nullable=True,
    )

    # Default Address Flag
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        server_default="0",
    )

    # Composite Index for fetching a user's default address quickly
    __table_args__ = (
        Index("ix_user_addresses_user_default", "user_id", "is_default"),
    )

    # ORM Relationship
    user: Mapped["User"] = relationship(
        "User",
        back_populates="addresses",
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="address",
        foreign_keys="Booking.address_id",
    )

    def __repr__(self) -> str:
        return f"<UserAddress id={self.id} user_id={self.user_id} pincode={self.pincode} is_default={self.is_default}>"


# Canonical alias for external model imports
Address = UserAddress
