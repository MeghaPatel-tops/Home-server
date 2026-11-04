"""
HomeServe Platform - Refresh Token Database Model
Stores hashed refresh tokens, token family tracking for rotation,
compromise detection, and revocation timestamps.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class RefreshToken(Base):
    """
    RefreshToken entity storing cryptographic hashes of 7-day refresh tokens.
    Supports token rotation families and reuse compromise detection.
    """
    __tablename__ = "refresh_tokens"

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

    # Cryptographic Hash of the 7-day refresh token (never plain-text)
    token_hash: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    # Token Family Identifier for Rotation & Compromise Detection
    family_id: Mapped[str] = mapped_column(
        String(36),
        index=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
    )

    # Lifecycle Timestamps
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    is_revoked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        server_default="0",
        index=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        default=None,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    # Composite Index for efficient token family reuse lookup
    __table_args__ = (
        Index("ix_refresh_tokens_family_revoked", "family_id", "is_revoked"),
    )

    # ORM Relationship
    user: Mapped["User"] = relationship(
        "User",
        back_populates="refresh_tokens",
    )

    def __repr__(self) -> str:
        return f"<RefreshToken id={self.id} user_id={self.user_id} family_id={self.family_id} is_revoked={self.is_revoked}>"
