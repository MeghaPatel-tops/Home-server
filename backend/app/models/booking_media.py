"""
HomeServe Platform - Booking Media Database Model
Stores metadata for technician job proof photos (BEFORE and AFTER work completion).
Adheres to security guidelines by storing private storage keys rather than public URLs.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import MediaType
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.user import User


class BookingMedia(Base):
    """
    BookingMedia entity tracking visual proof artifacts uploaded by field technicians.
    References secure cloud storage keys rather than direct public file URLs.
    """
    __tablename__ = "booking_media"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Booking Reference
    booking_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # Uploader User Reference (Technician / Provider)
    uploaded_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    # Photo Stage (BEFORE / AFTER job execution)
    media_type: Mapped[MediaType] = mapped_column(
        Enum(MediaType, name="booking_media_type", native_enum=False),
        index=True,
        nullable=False,
    )

    # Secure Cloud Storage Reference (e.g., 'bookings/{booking_id}/before/{uuid}.jpg')
    storage_key: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # Original Upload Metadata
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Upload Audit Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    # Composite Index for querying proof media by booking and type
    __table_args__ = (
        Index("ix_booking_media_booking_type", "booking_id", "media_type"),
    )

    # ORM Relationships
    booking: Mapped["Booking"] = relationship(
        "Booking",
        back_populates="media",
    )
    uploader: Mapped["User"] = relationship(
        "User",
        foreign_keys=[uploaded_by],
    )

    def __repr__(self) -> str:
        return (
            f"<BookingMedia id={self.id} booking_id={self.booking_id} "
            f"type={self.media_type} filename={self.original_filename}>"
        )
