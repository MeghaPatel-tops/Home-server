"""
HomeServe Platform - Core System Constants & Enumerations
Defines system-wide enums for roles, account statuses, booking states,
payment preferences, dispatch attempts, media types, and change orders.
"""

import enum


class UserRole(str, enum.Enum):
    """
    User roles supported by the HomeServe SaaS Platform.
    Enforces role-based access control (RBAC).
    """
    SUPER_ADMIN = "SUPER_ADMIN"
    PROVIDER = "PROVIDER"
    TECHNICIAN = "TECHNICIAN"
    CUSTOMER = "CUSTOMER"


class AccountStatus(str, enum.Enum):
    """
    Account activation and lifecycle status.
    """
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class KycStatus(str, enum.Enum):
    """
    Provider KYC verification workflow states.
    Super Admin document approval lifecycle.
    """
    PENDING = "PENDING"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class BookingStatus(str, enum.Enum):
    """
    Booking execution lifecycle state machine.
    Strictly separated from monetary payment status.
    """
    PENDING_ASSIGNMENT = "PENDING_ASSIGNMENT"
    PROVIDER_ACCEPTED = "PROVIDER_ACCEPTED"
    ASSIGNED = "ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"
    IN_PROGRESS = "IN_PROGRESS"
    AWAITING_COMPLETION_CONFIRMATION = "AWAITING_COMPLETION_CONFIRMATION"
    COMPLETED = "COMPLETED"
    CANCELLED_BY_CUSTOMER = "CANCELLED_BY_CUSTOMER"
    CANCELLED_BY_PROVIDER = "CANCELLED_BY_PROVIDER"
    TIMEOUT_AUTO_REASSIGNED = "TIMEOUT_AUTO_REASSIGNED"
    NO_PROVIDER_AVAILABLE = "NO_PROVIDER_AVAILABLE"
    DISPUTED = "DISPUTED"


class PaymentStatus(str, enum.Enum):
    """
    Monetary transaction and settlement lifecycle.
    """
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"


class PaymentPreference(str, enum.Enum):
    """
    Customer payment settlement preference.
    ONLINE (Razorpay) or CASH (On-site collection).
    """
    ONLINE = "ONLINE"
    CASH = "CASH"


class DispatchAttemptStatus(str, enum.Enum):
    """
    SLA routing attempt states for provider acceptance tracking.
    """
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class MediaType(str, enum.Enum):
    """
    Job proof photo classifications.
    """
    BEFORE = "BEFORE"
    AFTER = "AFTER"


class ChangeOrderStatus(str, enum.Enum):
    """
    Customer approval states for on-site spare parts / change orders.
    """
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
