"""
HomeServe Platform - Declarative Base & Common Model Mixins

Architecture reference: ARCHITECTURE.md § 3.3

This module provides:
  - Base: SQLAlchemy 2.0 DeclarativeBase — all models must inherit from this.
  - TimestampMixin: Adds created_at / updated_at columns using server-side defaults.
  - SoftDeleteMixin: Adds is_deleted / deleted_at columns for logical (soft) deletion.

Important:
  - Base.metadata is imported by Alembic's env.py for autogenerate migration detection.
  - Tables are NEVER created automatically via Base.metadata.create_all().
    All schema changes must go through numbered Alembic migration scripts.
"""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Root SQLAlchemy 2.0 declarative base.
    Every ORM model in app/models/ inherits from this class.
    """
    pass


class TimestampMixin:
    """
    Adds standardised UTC audit timestamp columns to any model.

    created_at:  Set by the database server on INSERT (func.now()).
    updated_at:  Set by the database server on INSERT and auto-updated on UPDATE.

    Both columns store values in UTC without timezone offset
    (MySQL DATETIME type).  Display conversion to Asia/Kolkata is
    performed by the API response layer.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """
    Adds logical-delete columns to any model.

    Models using this mixin are never hard-deleted from the database.
    Instead, is_deleted is set to True and deleted_at records the timestamp.
    Repositories must filter WHERE is_deleted = FALSE in all standard queries.
    """
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        server_default="0",
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
