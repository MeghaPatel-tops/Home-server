"""
HomeServe Platform - Service Database Model
Represents bookable trade services with pricing in integer paise and estimated durations.
"""

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.category import Category


class Service(Base, TimestampMixin):
    """
    Service entity representing individual bookable jobs (e.g. Switchboard Repair, Tap Replacement).
    Belongs to a master Category. Pricing is stored strictly in Integer Paise ($1 INR = 100 Paise).
    """
    __tablename__ = "services"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Category Foreign Key (Restricted deletion if services exist)
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    # Service Identity & URL Slug
    name: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(180),
        unique=True,
        index=True,
        nullable=False,
    )

    # Descriptive Content
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Pricing & Operational Duration
    # Stored strictly in whole integer paise (e.g. 49900 paise = ₹499.00)
    base_price_paise: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    estimated_duration_minutes: Mapped[int] = mapped_column(
        Integer,
        default=60,
        nullable=False,
    )

    # Availability Flag
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        index=True,
        nullable=False,
    )

    # Composite Index for querying active services within a category
    __table_args__ = (
        Index("ix_services_category_active", "category_id", "is_active"),
    )

    # ORM Relationships
    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="services",
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="service",
        foreign_keys="Booking.service_id",
    )

    def __repr__(self) -> str:
        return (
            f"<Service id={self.id} name={self.name} category_id={self.category_id} "
            f"base_price_paise={self.base_price_paise} is_active={self.is_active}>"
        )


# Canonical alias for compatibility
ServiceItem = Service
