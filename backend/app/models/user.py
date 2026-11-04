"""
HomeServe Platform - User Database Model
Represents all system users across four RBAC roles:
SUPER_ADMIN, PROVIDER, TECHNICIAN, CUSTOMER
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AccountStatus, UserRole
from app.database.base import Base, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.address import UserAddress
    from app.models.booking import Booking
    from app.models.provider import Provider
    from app.models.refresh_token import RefreshToken
    from app.models.technician import Technician


class User(Base, TimestampMixin, SoftDeleteMixin):
    """
    User entity storing core authentication credentials, contact info,
    role assignments, and verification lifecycle states.
    """
    __tablename__ = "users"

    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )

    # Personal & Identity Information
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    phone_number: Mapped[str | None] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=True,
    )

    # Security Credentials (Salted Bcrypt Hash, never plain-text)
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Role & Account Lifecycle
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=False),
        default=UserRole.CUSTOMER,
        nullable=False,
        index=True,
    )
    status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status", native_enum=False),
        default=AccountStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    # Verification Flags
    is_email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        server_default="0",
    )
    is_phone_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        server_default="0",
    )

    # ORM Relationships
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    addresses: Mapped[List["UserAddress"]] = relationship(
        "UserAddress",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    provider: Mapped[Optional["Provider"]] = relationship(
        "Provider",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    technician: Mapped[Optional["Technician"]] = relationship(
        "Technician",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    customer_bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="customer",
        foreign_keys="Booking.customer_id",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role} status={self.status}>"
