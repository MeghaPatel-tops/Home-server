"""
HomeServe Platform - Database Session Management
Synchronous SQLAlchemy 2.0 Engine and SessionLocal Setup

Architecture reference: ARCHITECTURE.md § 3.1 and § 3.2
"""

from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# ---------------------------------------------------------------------------
# Synchronous SQLAlchemy engine
#
# create_engine() registers the connection pool descriptor and validates the
# driver.  It does NOT open any network connections at import time — the first
# actual TCP connection is made only when the first query is executed.
# ---------------------------------------------------------------------------
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,          # Persistent connections kept open
    max_overflow=settings.DB_MAX_OVERFLOW,    # Burst connections above pool_size
    pool_recycle=settings.DB_POOL_RECYCLE,    # Recycle every 1 h (avoids MySQL wait_timeout disconnects)
    pool_pre_ping=settings.DB_POOL_PRE_PING,  # Test connection with SELECT 1 before checkout
    echo=False,                               # Set True to log raw SQL during development
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,          # Transactions must be committed explicitly
    autoflush=False,           # Flush only on explicit flush() or commit()
    bind=engine,
    expire_on_commit=False,    # Keep ORM objects readable after commit without re-querying
)


# ---------------------------------------------------------------------------
# FastAPI dependency — yields one session per request
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a synchronous SQLAlchemy session.

    Lifecycle:
    - Opens a new session from the pool at the start of the request.
    - On unhandled exception: rolls back the transaction before closing.
    - Always closes the session in the finally block, returning the
      connection back to the pool.

    Note: Callers (service/repository layer) are responsible for calling
    db.commit() after successful write operations.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Database connectivity probe (used by /health/ready endpoint)
# ---------------------------------------------------------------------------
def check_database_connection() -> dict:
    """
    Executes a lightweight SELECT 1 to verify that the MySQL database is
    reachable.  Returns a dict with 'ok' (bool) and 'detail' (str).

    This function is intentionally isolated from the FastAPI request lifecycle
    so it can be called from health-check endpoints without consuming a
    request-scoped session.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "detail": "MySQL connection successful."}
    except OperationalError as exc:
        # Surface only a sanitized error message — never expose credentials
        return {"ok": False, "detail": f"MySQL unreachable: {exc.orig}"}
    except Exception as exc:
        return {"ok": False, "detail": f"Unexpected database error: {type(exc).__name__}"}
