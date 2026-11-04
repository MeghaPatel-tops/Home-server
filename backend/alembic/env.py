"""
HomeServe Platform - Alembic Migration Environment

This env.py is executed by the alembic CLI for both offline (SQL script
generation) and online (live database connection) migration modes.

Key responsibilities:
  1. Read DATABASE_URL from application settings (not from alembic.ini).
  2. Import all SQLAlchemy models so that Base.metadata is fully populated
     before autogenerate comparison runs.
  3. Set target_metadata = Base.metadata so alembic can diff the current
     database schema against the ORM model definitions.
  4. Never call Base.metadata.create_all() — schema is managed exclusively
     through versioned Alembic migration scripts.
"""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ---------------------------------------------------------------------------
# Ensure the backend root (parent of this file's alembic/ directory) is on
# sys.path so that `from app.xxx import yyy` resolves correctly.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# Alembic Config object — provides access to values in alembic.ini
# ---------------------------------------------------------------------------
config = context.config

# Configure Python standard logging from alembic.ini [loggers] section
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------------
# Import application settings to obtain DATABASE_URL
# ---------------------------------------------------------------------------
from app.core.config import settings  # noqa: E402

# Override the sqlalchemy.url in alembic config with the real DATABASE_URL.
# Escape '%' as '%%' to prevent ConfigParser from raising InterpolationSyntaxError
# if the database password or query parameters contain '%' characters.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))

# ---------------------------------------------------------------------------
# Import Base and all models
#
# IMPORTANT: Base.metadata contains table definitions for autogenerate.
# We import app.models (which will re-export all declarative models from
# app/models/__init__.py) to ensure all models are registered in metadata.
# ---------------------------------------------------------------------------
from app.database.base import Base  # noqa: E402
import app.models  # noqa: F401, E402

# Future model references (also exported via app.models):
# - app.models.user.User
# - app.models.refresh_token.RefreshToken
# - app.models.address.UserAddress
# - app.models.provider.Provider
# - app.models.technician.Technician
# - app.models.category.ServiceCategory
# - app.models.service.ServiceItem
# - app.models.zone.ServiceZone
# - app.models.booking.Booking
# - app.models.dispatch_attempt.DispatchAttempt
# - app.models.booking_media.BookingMedia
# - app.models.change_order.ChangeOrder
# - app.models.payment.Payment
# - app.models.payment_refund.PaymentRefund
# - app.models.ledger.LedgerAccount, LedgerTransaction, LedgerEntry
# - app.models.payout.ProviderPayoutRequest
# - app.models.invoice.Invoice
# - app.models.review.Review
# - app.models.dispute.DisputeTicket
# - app.models.dispute_message.DisputeMessage
# - app.models.notification.Notification
# - app.models.notification_outbox.NotificationOutbox
# - app.models.webhook_event.WebhookEvent
# - app.models.idempotency.IdempotencyKey

# Provide metadata to Alembic autogenerate
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline migration mode (generates SQL script without connecting to DB)
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Alembic generates a SQL script that can be reviewed and applied manually.
    No live database connection is opened.
    """
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Compare server defaults so server_default changes are detected
        compare_server_default=True,
        # Detect column type changes
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migration mode (connects to MySQL and applies migrations directly)
# ---------------------------------------------------------------------------
def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    Opens a real synchronous connection to MySQL and applies pending
    migration scripts within a transaction.
    """
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # Use NullPool for migrations (no persistent connections)
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_server_default=True,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ---------------------------------------------------------------------------
# Entry point — called by the alembic CLI
# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
