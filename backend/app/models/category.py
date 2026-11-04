"""
HomeServe Platform - Category Database Model
Represents service trade categories (Electrician, Plumber, AC Repair, Cleaning, etc.)
"""

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.service import Service


class Category(Base, TimestampMixin):
    """
    Category entity representing master service classifications.
    One-to-many relationship with Service offerings.
    """
    __tablename__ = "categories"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Category Identity & URL Slug
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
        nullable=False,
    )

    # Descriptive Content & Media Asset
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Availability Flag
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="1",
        index=True,
        nullable=False,
    )

    # ORM Relationships
    services: Mapped[List["Service"]] = relationship(
        "Service",
        back_populates="category",
        passive_deletes="all",
    )

    def __repr__(self) -> str:
        return f"<Category id={self.id} name={self.name} slug={self.slug} is_active={self.is_active}>"


# Canonical alias for compatibility
ServiceCategory = Category
