# HomeServe - System Architecture Blueprint
## Scalable Enterprise Architecture Specification

---

### Document Information
- **Project Name:** HomeServe SaaS Platform
- **Document Version:** 1.3.0 (Phase 2 Final Consistency Corrections)
- **Phase:** Phase 2 - System Architecture & Technical Specifications
- **Target Tech Stack:** React.js, Vite, Tailwind CSS, Python FastAPI (Synchronous SQLAlchemy 2.0), MySQL 8.0 + PyMySQL, Alembic, JWT Authentication, Razorpay Test Mode
- **Currency & Precision:** Indian Rupee (₹ / INR), Database storage and calculation in Integer Paise ($1\text{ INR} = 100\text{ Paise}$)
- **Timezone Standard:** Stored in UTC (`DATETIME(6)` / ISO-8601 `Z`), Displayed in Indian Standard Time (`Asia/Kolkata`, UTC+05:30)

---

## 1. High-Level Architectural Style

HomeServe adopts a **Decoupled Client-Server Layered Architecture** with strict separation of concerns between presentation, business application services, data access, and storage.

```
+─────────────────────────────────────────────────────────────────────────────────────────+
|                                    CLIENT TIER                                          |
|                     Single Page Application (React.js + Vite + Tailwind CSS)            |
|                                                                                         |
|  [Customer Portal]     [Provider Console]     [Technician Mobile Web]   [Admin Portal]  |
+─────────────────────────────────────────────────────────────────────────────────────────+
                                           │
                                  HTTPS / REST / JSON
                                           ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
|                                API & GATEWAY TIER                                       |
|                                FastAPI ASGI Router                                      |
|                                                                                         |
|   ┌─────────────────────────────────────────────────────────────────────────────────┐   |
|   │ Global Middleware Pipeline: CORS, Rate Limiting, Request ID, Exception Handler  │   |
|   └─────────────────────────────────────────────────────────────────────────────────┘   |
|   ┌─────────────────────────────────────────────────────────────────────────────────┐   |
|   │ Route Versioning: /api/v1/                                                      │   |
|   └─────────────────────────────────────────────────────────────────────────────────┘   |
|   ┌─────────────────────────────────────────────────────────────────────────────────┐   |
|   │ Authentication & Role Guard Dependencies (JWT Access Token Validation)           │   |
|   └─────────────────────────────────────────────────────────────────────────────────┘   |
+─────────────────────────────────────────────────────────────────────────────────────────+
                                           │
                                 Python Method Calls
                                           ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
|                               APPLICATION SERVICE TIER                                  |
|                      (Pure Business Logic & Orchestration)                              |
|                                                                                         |
|   AuthService         BookingService       DispatchService       CommissionService      |
|   PaymentService      CatalogService       KYCService            NotificationService    |
+─────────────────────────────────────────────────────────────────────────────────────────+
                                           │
                                 Repository Pattern
                                           ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
|                                PERSISTENCE / DATA ACCESS TIER                           |
|                        Synchronous SQLAlchemy 2.0 Declarative ORM                       |
|                                                                                         |
|   UserRepository       BookingRepository     ProviderRepository    ServiceRepository    |
|   DispatchRepository   PaymentRepository     ReviewRepository      ZoneRepository       |
+─────────────────────────────────────────────────────────────────────────────────────────+
                                           │
                             Synchronous Connection Pool (PyMySQL)
                                           ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
|                                STORAGE & EXTERNAL SERVICES                              |
|                                                                                         |
|   [MySQL 8.0 Database]         [Local Disk Storage]         [Razorpay Payment API]      |
|   - ACID Transactions          - Encrypted KYC Docs         - Order Creation in Paise   |
|   - Relational Constraints     - Before/After Job Photos    - Raw Body Webhook Verify   |
|   - Pincode & Booking Indexes  - Static Assets              - Signature Verification    |
+─────────────────────────────────────────────────────────────────────────────────────────+
```

### Core Architectural Principles
1. **Stateless API with Persistent Authentication Records:** The FastAPI server maintains zero in-memory session state; every request is independently verified using cryptographically signed JWTs. Persistent state (user profiles, hashed passwords, hashed refresh tokens for rotation, and revocation lists) is stored durably in MySQL.
2. **Post-Completion Payment Flow:** Payment occurs *after* job execution is complete and all customer-approved on-site change orders are tallied. The provider virtual ledger is credited **only after** payment is confirmed as `PAID`.
3. **Layered Isolation (Clean Architecture):**
   - **API Controller Layer (`app/api/v1/`):** Parses HTTP requests, validates DTOs with Pydantic, invokes application services, and formats JSON responses. Zero raw SQL.
   - **Service Layer (`app/services/`):** Contains business logic, calculations, 15% platform commission splits, state machine transitions, and external service orchestration (Razorpay). Completely isolated from HTTP objects.
   - **Repository Layer (`app/repositories/`):** Encapsulates raw database queries, inserts, and updates using SQLAlchemy 2.0. Contains no business pricing rules.
   - **Model Layer (`app/models/`):** Declarative SQLAlchemy 2.0 entities mapping directly to the MySQL database schema.
4. **Decoupled State Lifecycles:** Booking status (execution state) and Payment status (monetary state) are tracked in separate database columns.
5. **Idempotency & Concurrency Safety:** Critical operations (booking creation, technician slot reservation, and Razorpay payment verification) employ atomic database transactions (`session.commit()` with auto-rollback) and row-level locking (`SELECT ... FOR UPDATE`) to prevent double-booking or duplicate payments.

---

## 2. Standardized API Versioning & Routing Strategy

All endpoints are standardized under the `/api/v1/` namespace and partitioned cleanly by user role and domain:

```
https://api.homeserve.com/api/v1/{domain}/{action}
```

### Standardized Route Namespaces:
- **Authentication & User Profile:** `/api/v1/auth/...`, `/api/v1/users/...`
- **Customer Domain:** `/api/v1/customer/bookings/...`, `/api/v1/customer/addresses/...`, `/api/v1/customer/reviews/...`, `/api/v1/customer/disputes/...`
- **Service Provider Domain:** `/api/v1/provider/me`, `/api/v1/provider/kyc/...`, `/api/v1/provider/zones/...`, `/api/v1/provider/bookings/...`, `/api/v1/provider/dispatch/...`, `/api/v1/provider/fleet/...`, `/api/v1/provider/payouts/...`
- **Technician Field Operations:** `/api/v1/technician/my-jobs`, `/api/v1/technician/duty-status`, `/api/v1/technician/bookings/{id}/...`
- **Super Admin Platform Governance:** `/api/v1/admin/kyc/...`, `/api/v1/admin/categories/...`, `/api/v1/admin/services/...`, `/api/v1/admin/zones/...`, `/api/v1/admin/payouts/...`, `/api/v1/admin/disputes/...`, `/api/v1/admin/analytics/...`
- **Public Catalog & Serviceability:** `/api/v1/categories`, `/api/v1/services/...`, `/api/v1/zones/check-serviceability`, `/api/v1/reviews/service/{id}`
- **Payments & Billing:** `/api/v1/payments/razorpay/create-order`, `/api/v1/payments/razorpay/verify`, `/api/v1/payments/razorpay/webhook`

---

## 3. Database Architecture (Synchronous SQLAlchemy 2.0 & MySQL)

HomeServe uses **synchronous SQLAlchemy 2.0** with `PyMySQL` for the initial MVP. This provides enterprise connection pooling, robust transactional rollbacks, and multi-threaded request processing.

### 3.1 Connection Engine Configuration
```python
# app/database/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Construct synchronous MySQL connection URL
DATABASE_URL = (
    f"mysql+pymysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@"
    f"{settings.MYSQL_SERVER}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}?charset=utf8mb4"
)

engine = create_engine(
    DATABASE_URL,
    pool_size=20,            # Maintain 20 persistent connections in pool
    max_overflow=10,         # Allow up to 10 burst connections during spikes
    pool_recycle=3600,       # Recycle connections every 1 hour to prevent MySQL sleep disconnects
    pool_pre_ping=True,      # Test connection health prior to checkout (eliminates broken pipe errors)
    echo=False               # Set True only during local SQL query debugging
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False   # Keep objects readable after commit without redundant queries
)
```

### 3.2 Session Lifecycle & Dependency Injection
```python
# app/database/session.py
from typing import Generator
from sqlalchemy.orm import Session

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a thread-local database session.
    Automatically commits or rolls back and closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
```

### 3.3 Declarative Base & Common Mixins
```python
# app/database/base.py
from datetime import datetime
from sqlalchemy import DateTime, Boolean, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

class SoftDeleteMixin:
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
```

### 3.4 Entity Relationships & Foreign Keys

| Entity Model | Table Name | Foreign Keys & Relationships | Cascade Rules |
| :--- | :--- | :--- | :--- |
| `User` | `users` | - 1-to-1 with `Provider` (`user_id`)<br>- 1-to-1 with `Technician` (`user_id`)<br>- 1-to-many with `UserAddress`<br>- 1-to-many with `RefreshToken`<br>- 1-to-many with `Notification` | `all, delete-orphan` on addresses & tokens |
| `RefreshToken` | `refresh_tokens` | - `user_id` &rarr; `users.id` | `all, delete-orphan` |
| `UserAddress` | `user_addresses` | - `user_id` &rarr; `users.id`<br>- 1-to-many with `bookings` | Restrict deletion if active bookings exist |
| `Provider` | `providers` | - `user_id` &rarr; `users.id`<br>- 1-to-many with `Technician`<br>- Many-to-many with `ServiceZone` via `provider_zones`<br>- 1-to-many with `DispatchAttempt`<br>- 1-to-many with `bookings`<br>- 1-to-many with `LedgerEntry` | Restrict on active bookings |
| `Technician` | `technicians` | - `user_id` &rarr; `users.id`<br>- `provider_id` &rarr; `providers.id`<br>- 1-to-many with `bookings` | Restrict on active bookings |
| `ServiceCategory` | `service_categories` | - 1-to-many with `services` | Restrict deletion if services exist |
| `ServiceItem` | `services` | - `category_id` &rarr; `service_categories.id`<br>- 1-to-many with `bookings` | Restrict deletion if bookings exist |
| `ServiceZone` | `service_zones` | - Many-to-many with `providers` via `provider_zones` | Association table link |
| `Booking` | `bookings` | - `customer_id` &rarr; `users.id`<br>- `provider_id` &rarr; `providers.id`<br>- `technician_id` &rarr; `technicians.id`<br>- `service_id` &rarr; `services.id`<br>- `address_id` &rarr; `user_addresses.id`<br>- 1-to-many with `DispatchAttempt`<br>- 1-to-many with `ChangeOrder`<br>- 1-to-many with `BookingMedia`<br>- 1-to-1 with `Payment`<br>- 1-to-1 with `Invoice`<br>- 1-to-1 with `Review` | `all, delete-orphan` on change orders, media, attempts |
| `DispatchAttempt` | `dispatch_attempts` | - `booking_id` &rarr; `bookings.id`<br>- `provider_id` &rarr; `providers.id` | Cascaded with booking |
| `BookingMedia` | `booking_media` | - `booking_id` &rarr; `bookings.id` | Cascaded with booking |
| `ChangeOrder` | `change_orders` | - `booking_id` &rarr; `bookings.id` | Cascaded with booking |
| `Payment` | `payments` | - `booking_id` &rarr; `bookings.id` (Unique) | Restrict deletion |
| `Invoice` | `invoices` | - `booking_id` &rarr; `bookings.id` (Unique) | Restrict deletion |
| `LedgerEntry` | `provider_ledger` | - `provider_id` &rarr; `providers.id`<br>- `booking_id` &rarr; `bookings.id` | Restrict deletion |
| `Review` | `reviews` | - `booking_id` &rarr; `bookings.id` (Unique)<br>- `customer_id` &rarr; `users.id` | Restrict deletion |
| `DisputeTicket` | `disputes` | - `booking_id` &rarr; `bookings.id`<br>- `raised_by_id` &rarr; `users.id` | Restrict deletion |

---

## 4. Authentication, JWT & Security Architecture

### 4.1 Token Security Specifications
- **Access Token Expiry:** Strictly **15 minutes**.
- **Refresh Token Expiry:** Strictly **7 days**.
- **Password Hashing:** Salted **Bcrypt** with **12 work rounds**.
- **Secret Isolation:** Secret keys (`SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) are strictly kept on the backend `.env`. The frontend only accesses public `VITE_` variables (`VITE_API_BASE_URL`, `VITE_RAZORPAY_KEY_ID`).

### 4.2 Refresh Token Rotation & Revocation Architecture
Tokens rotate on every refresh call:
- When the client calls `POST /api/v1/auth/refresh`, the provided refresh token is hashed and checked against `refresh_tokens` in MySQL.
- If valid and not revoked, the old token record is marked `is_revoked = True` with `revoked_at = NOW()`.
- A newly generated refresh token hash is inserted, and a fresh access token (15 mins) and refresh token (7 days) are returned.
- **Compromise Detection:** If a request presents an already-revoked refresh token, all active tokens for that `user_id` are immediately revoked, terminating all sessions across devices.

```python
# app/models/refresh_token.py
from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base, TimestampMixin

class RefreshToken(Base, TimestampMixin):
    __tablename__ = "refresh_tokens"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
```

---

## 5. Booking & Payment Lifecycle State Machines

### 5.1 Decoupled Status Architecture

| Booking Status (Execution) | Payment Status (Financial) | Typical Stage Context |
| :--- | :--- | :--- |
| `PENDING_ASSIGNMENT` | `PENDING` | Customer created booking; DispatchAttempt #1 active |
| `PROVIDER_ACCEPTED` | `PENDING` | Provider accepted within 15m; awaiting technician assignment |
| `ASSIGNED` | `PENDING` | Technician designated; Start OTP generated |
| `EN_ROUTE` | `PENDING` | Technician traveling to customer doorstep |
| `ARRIVED` | `PENDING` | Technician arrived at doorstep |
| `IN_PROGRESS` | `PENDING` | Customer Start OTP verified; service actively being performed |
| `AWAITING_COMPLETION_CONFIRMATION` | `PENDING` | Tech submitted before/after photos & notes; Completion OTP generated |
| `COMPLETED` | `PENDING` | Customer Completion OTP verified; final amount locked |
| `COMPLETED` | `PAID` | Customer paid via Razorpay (verified) OR technician confirmed cash |
| `CANCELLED_BY_CUSTOMER` | `PENDING` / `REFUNDED` | Cancelled before cutoff (or partial penalty processed) |
| `DISPUTED` | `PAID` | Customer raised dispute within 48h of completion |

### 5.2 Dispatch Attempt Tracking & Provider 15-Minute SLA
- **`DispatchAttempt` Model:**
  ```python
  # app/models/dispatch_attempt.py
  class DispatchAttempt(Base, TimestampMixin):
      __tablename__ = "dispatch_attempts"
      
      id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
      booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), index=True)
      provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"), index=True)
      attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
      dispatched_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)  # UTC
      deadline_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)    # UTC (+15m)
      responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
      status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, ACCEPTED, REJECTED, EXPIRED
  ```
- **Dual Enforcement Mechanism:**
  1. **Background Task Scheduler:** Queries active attempts where `status = 'PENDING'` and `deadline_at < NOW()`. Marks attempt `EXPIRED`, updates booking to `TIMEOUT_AUTO_REASSIGNED`, and routes to next provider in pincode.
  2. **Eager Guard Check:** When provider calls `POST /api/v1/provider/bookings/{id}/accept`, endpoint checks `NOW() > deadline_at`. If expired, rejects with **HTTP 409 Conflict** (`ERR_PROVIDER_SLA_EXPIRED`) and triggers reassignment.
  3. **No Provider Available:** If all providers in the zone reject or expire, booking transitions to `NO_PROVIDER_AVAILABLE`, alerting the Super Admin dashboard.

---

## 6. Secure OTP Lifecycle & Verification Engine

### 6.1 OTP Security Specifications
1. **Start OTP:**
   - **Generation:** Generated when provider assigns technician (`POST /api/v1/provider/dispatch/assign`).
   - **Format:** 4-digit cryptographically secure numeric string (`secrets.randbelow(9000) + 1000`).
   - **Storage:** Hashed with a booking-specific salt using SHA-256 and stored in `bookings.start_otp_hash`. Plaintext is **never** stored in database.
   - **Exposure:** Delivered only to customer (web app and SMS). **Technician job-list API responses (`GET /api/v1/technician/my-jobs`) never contain the OTP.**
   - **Verification:** Technician enters OTP on-site (`POST /api/v1/technician/bookings/{id}/start-otp`). Backend salts and hashes input, compares with `start_otp_hash`, and transitions status to `IN_PROGRESS`.
2. **Completion OTP:**
   - **Generation:** Generated when technician submits work notes and uploads proof photos (`POST /api/v1/technician/bookings/{id}/complete`), transitioning booking to `AWAITING_COMPLETION_CONFIRMATION`.
   - **Storage:** Stored as salted SHA-256 hash in `bookings.end_otp_hash`.
   - **Delivery:** Displayed on customer app screen alongside the final itemized bill.
   - **Validity:** Valid for 30 minutes; customer can request resend via `POST /api/v1/customer/bookings/{id}/resend-otp` (60s cooldown; invalidates old hash).
   - **Verification:** Technician enters Completion OTP via `POST /api/v1/technician/bookings/{id}/verify-completion-otp`. Only upon match does status become `COMPLETED`.
3. **Brute-Force Protection:**
   - Maximum **3 failed verification attempts** permitted per OTP.
   - On the 3rd consecutive failed attempt, the verification endpoint locks out for 10 minutes (`ERR_OTP_LOCKED`).

---

## 7. Payment Security, Accounting & Commission Engine (INR ₹ & Integer Paise)

### 7.1 Payment Security & Fraud Prevention
1. **Idempotency & Unique Order Index:** `payments.razorpay_order_id` and `payments.gateway_tx_id` have `UNIQUE` constraints in MySQL.
2. **Double-Settlement Mutex:** Online and cash payments are strictly mutually exclusive. Before processing Razorpay verify or cash confirmation, the backend acquires an exclusive write-lock (`SELECT ... FOR UPDATE` on `payments`). If `payment_status == 'PAID'`, subsequent settlement attempts fail with HTTP 409 Conflict (`ERR_PAYMENT_ALREADY_SETTLED`).
3. **Raw Body Webhook Verification:** Razorpay webhooks (`POST /api/v1/payments/razorpay/webhook`) read raw request body bytes (`await request.body()`) before JSON parsing to compute HMAC SHA256 against `X-Razorpay-Signature`. Processed `event_id` records are tracked in `webhook_events` to ignore duplicate deliveries.
4. **Server-Side Price Authority:** The backend never trusts payment amounts passed from frontend or technician. Amounts are computed server-side from base service items and approved change orders in integer paise ($₹942.82 = 94282$ paise).

### 7.2 Accounting & Commission Formula (All in Integer Paise)

```
[Base Labor: 49900 paise] + [Travel Fee: 5000 paise] = 54900 paise (Pre-tax)
                         │
                         ▼
             [GST 18%: 9882 paise]
                         │
                         ▼
         Initial Estimate: 64782 paise (Payment: PENDING)
                         │
                         ▼
  [Change Order: Downrod 25000 paise + GST 18% 4500 paise = 29500 paise]
                         │
                         ▼
        Final Invoice Total: 94282 paise (₹942.82)
                         │
                         ▼
    [Customer Pays 94282 paise via Razorpay OR Cash -> Payment: PAID]
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼
            [Platform Commission: 7485 paise]            [Net Provider Credit: 72415 paise]
            (15% on Base Labor 49900 paise)              (49900 - 7485 + 25000 + 5000)
```

- **Commission Rule:** Platform takes default **15% on Base Service Labor Fee (49900 paise / ₹499.00)** only. Travel fees and spare parts pass 100% to Provider/Technician.
- **Platform Commission (15% of 49900 paise):** **7485 paise / ₹74.85**
- **GST on Commission (18% of 7485 paise):** **1347 paise / ₹13.47** (Platform B2B tax invoice to provider)
- **Net Provider Settlement Ledger Credit:**
  $$\text{Net Payout} = (\text{Base Labor} - \text{Commission}) + \text{Spare Parts} + \text{Travel Fee}$$
  $$\text{Net Payout} = (49900 - 7485) + 25000 + 5000 = 42415 + 30000 = \mathbf{72415\text{ paise / } ₹724.15}$$
  *(Total GST of 14382 paise / ₹143.82 tracked for statutory tax remittance).*
- **Ledger Guarantee:** The provider virtual ledger is credited **strictly after** the payment record reaches `payment_status = 'PAID'`.

---

## 8. Cancellation Policy Matrix Across Every Stage

| Booking Stage | Initiator | Cancellation Penalty / Fee | Customer Refund Amount | Allocation of Penalty |
| :--- | :--- | :--- | :--- | :--- |
| **`PENDING_ASSIGNMENT`** | Customer | **₹0.00** (Free cancellation) | **100% full refund** | None |
| **`PROVIDER_ACCEPTED`** | Customer | **₹0.00** (> 2h before slot)<br>**₹50.00** convenience fee (< 2h) | 100% (or Net of ₹50) | 100% to Platform |
| **`ASSIGNED`** | Customer | **₹0.00** (> 2h before slot)<br>**₹50.00** convenience fee (< 2h) | 100% (or Net of ₹50) | 100% to Platform |
| **`EN_ROUTE`** | Customer | **₹100.00** (Travel Compensation) | Total Paid minus ₹100.00 | ₹70 to Technician/Provider<br>₹30 to Platform |
| **`ARRIVED`** | Customer | **₹150.00** (Doorstep Visit Fee) | Total Paid minus ₹150.00 | ₹110 to Technician/Provider<br>₹40 to Platform |
| **`IN_PROGRESS`** | Neither | Unilateral customer cancellation blocked; requires Super Admin arbitration | Evaluated by Super Admin | Case-by-case |
| **`AWAITING_COMPLETION_CONFIRMATION`**| Neither | Unilateral customer cancellation blocked; requires Super Admin arbitration | Evaluated by Super Admin | Case-by-case |
| **`COMPLETED`** | Neither | Cannot cancel; Customer can raise dispute within 48 hours | Decided via Dispute Desk | Case-by-case |

---

## 9. Frontend Architecture & Axios Network Client

### 9.1 Centralized Axios Client (`frontend/src/services/apiClient.js`)
- Configured with base URL `import.meta.env.VITE_API_BASE_URL || '/api/v1'`.
- Request Interceptor: Injects stored `access_token` into `Authorization: Bearer <token>`.
- Response Interceptor with Mutex Queue: On `401 Unauthorized`, pauses incoming requests, calls `POST /api/v1/auth/refresh`, rotates tokens, and replays failed requests. Redirects to `/login` if refresh token is expired or revoked.

### 9.2 Role-Based Layout Structure
- `<CustomerLayout>`: Navbar, address selector, active bookings widget, cart drawer, and footer.
- `<ProviderLayout>`: Sidebar navigation, incoming dispatch queue with 15-minute SLA countdown timers, fleet roster, and payout tracker.
- `<TechnicianLayout>`: Mobile-first single-column viewport (360px-480px), prominent online/offline toggle, and high-contrast action cards.
- `<AdminLayout>`: Master enterprise dashboard, provider KYC queue, category/commission editor, dispute arbitration desk, and payout disbursement controls.

---

## 10. File Upload & Storage Pipeline

- **Categories:** Provider KYC documents (&le; 5MB PDF/JPEG), Technician government IDs (&le; 5MB PDF/JPEG), Field job proof photos (&le; 8MB JPEG/PNG).
- **Security:** Files validated for MIME type using magic byte inspection; original filenames discarded and replaced with cryptographically secure `UUID4` filenames.
- **Access Control:** KYC documents are served strictly through authenticated endpoints (`GET /api/v1/admin/kyc/{id}/document`), preventing unauthenticated public scraping.

---
*End of System Architecture Document.*
