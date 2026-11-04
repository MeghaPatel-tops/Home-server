# HomeServe Backend Completion Plan

---

### Document Information
- **Project Name:** HomeServe Home Services Booking SaaS Platform
- **Document Version:** 1.0.0
- **Architectural Reference:** `ARCHITECTURE.md` (v1.5.0), `PROJECT_STRUCTURE.md` (v1.6.0), `API_DESIGN.md` (v1.4.0), `REQUIREMENTS.md` (v1.2.0)
- **Status:** Strategic Roadmap & Module Breakdown
- **Date:** November 2026

---

## 1. Executive Summary & Baseline Audit

### 1.1 Existing Technical Foundation
The backend foundation follows a clean, decoupled architecture built on:
- **FastAPI** with `/health`, `/health/ready` (MySQL readiness probe), and versioned `/api/v1` routers.
- **Synchronous SQLAlchemy 2.0** with `create_engine(pool_pre_ping=True, pool_recycle=3600)`, `sessionmaker(autocommit=False, autoflush=False)`, and standard `get_db()` lifecycle.
- **MySQL 8.0** database storage with whole integer paise precision (INR 1.00 = 100 paise) and UTC timestamps.
- **Alembic** migration runner configured with `NullPool` and connected to `Base.metadata`.

### 1.2 Current Asset Inventory
| Category | Completed Assets |
| :--- | :--- |
| **Existing Models (13 Tables)** | `users`, `refresh_tokens`, `user_addresses`, `categories`, `services`, `providers`, `technicians`, `service_zones`, `provider_zones`, `bookings`, `dispatch_attempts`, `booking_media`, `change_orders` |
| **Existing Migrations (3 Applied)** | `0001_create_user_and_auth_tables.py`<br>`1e4804eb7cc9_create_categories_and_services.py`<br>`5306e443fee9_create_providers_technicians_and_zones.py` |
| **Pending Migration** | Booking & Dispatch tables (`bookings`, `dispatch_attempts`, `booking_media`, `change_orders`) are defined in SQLAlchemy models and ready for revision generation. |
| **Existing Schemas** | Auth tokens, User profiles, Address DTOs, Catalog (Category/Service), Provider, Technician, Zone, Booking, Dispatch, Media, Change Order schemas. |
| **Core Infrastructure** | Configuration loader (`pydantic-settings`), Core Enums & Constants (`UserRole`, `AccountStatus`, `KycStatus`, `BookingStatus`, `PaymentStatus`, `PaymentPreference`, `DispatchAttemptStatus`, `MediaType`, `ChangeOrderStatus`). |

### 1.3 Strategic Implementation Paradigm
To accelerate development without incurring technical debt, backend construction will proceed via **complete vertical modules** rather than fragmented layer-by-layer slices. Each module delivers:
1. **Database Entities & Alembic Migration** (if new models are introduced).
2. **Pydantic v2 Request & Response DTOs** (with strict typing and validation).
3. **Repository Layer** (data access abstraction and transactional unit-of-work).
4. **Service Layer** (domain business rules, SLA timers, state machine transitions, financial arithmetic).
5. **API Route Endpoints** (FastAPI routers, dependency injection, RBAC guards).
6. **Integration / Verification Tests** (verifying happy paths and security constraints).

---

## 2. Global Architecture & Architectural Rules

1. **Database Integrity & Transactions:**
   - All monetary calculations are performed strictly in integer paise (`Integer` / `BigInteger`). Floating-point arithmetic is strictly forbidden.
   - External API calls (Razorpay, Cloud Storage) must never occur inside active MySQL database transactions.
   - `get_db()` dependency yields sessions without auto-commit; services explicitly handle commits and rollbacks.

2. **Authentication, Tokens & RBAC:**
   - **Access Token:** Short-lived JWT (15-minute expiry) passed via `Authorization: Bearer <token>` header.
   - **Refresh Token:** Long-lived (7-day expiry) stored as server-side SHA-256 hash in MySQL `refresh_tokens`, issued with token rotation and reuse detection.
   - **Cookie Standard:** `__Host-refresh_token` with `Path=/`, `Secure`, `HttpOnly`, `SameSite=Lax`, and no `Domain` attribute.
   - **RBAC Enforcer:** `require_roles(UserRole.SUPER_ADMIN, ...)` dependency injected on routes.

3. **OTP Security Rules:**
   - HMAC-SHA256 hashed with secret salt and booking context (`booking_id + user_id + otp`).
   - Plaintext OTPs are never stored in the database, printed in logs, or returned in API responses.
   - 60-second regeneration cooldown, 10-minute validity, maximum 3 failed verification attempts before 15-minute lockout.

4. **Idempotency Standards:**
   - Mutative financial endpoints enforce `Idempotency-Key` headers backed by an `idempotency_keys` table with 24-hour TTL.

5. **Migration Policy:**
   - Migrations are generated via `alembic revision --autogenerate -m "..."`.
   - Migrations are **never executed automatically** on application startup.

---

## 3. Modular Completion Matrix & Implementation Order

```
[Module 0: Core Security & Dependencies]
                     │
                     ▼
[Module 1: Auth & User Account Management]
                     │
                     ▼
[Module 2: Catalog & Zone Serviceability]
                     │
                     ▼
[Module 3: Provider Fleet & Technician Management]
                     │
                     ▼
[Module 4: Booking Lifecycle, Dispatch & Verification]
                     │
                     ▼
[Module 5: Payments, Webhooks & Invoicing]
                     │
                     ▼
[Module 6: Provider Ledger & Payout Settlement]
                     │
                     ▼
[Module 7: Customer Reviews, Disputes & Platform Governance]
```

---

## 4. Detailed Module Specifications

### Module 0: Core Security, Authentication & Base Infrastructure
*The foundational layer required before any secured endpoints can execute.*

- **Scope & Purpose:** Implement cryptography, JWT token handling, security dependencies, and shared repository base.
- **Components to Implement:**
  - `app/core/security.py`: Password hashing using Bcrypt (12 work rounds), JWT creation and validation using PyJWT.
  - `app/core/otp.py`: 6-digit numeric OTP generation, HMAC-SHA256 signature verification, context hashing.
  - `app/api/deps.py`: `get_db`, `get_current_user`, `get_current_active_user`, `require_roles(*roles)`.
  - `app/middleware/correlation.py`: `X-Request-ID` request correlation logging middleware.
  - `app/repositories/base.py`: Generic CRUD base repository (`BaseRepository[ModelType]`).
- **Dependencies:** `pyjwt`, `passlib[bcrypt]`, `pydantic`.
- **Database Changes:** None.
- **Endpoints Delivered:** 0 (Infrastructure only).

---

### Module 1: Authentication & User Account Management
*User onboarding, credential authentication, session lifecycle, and doorstep address management.*

- **Scope & Purpose:** Complete end-to-end registration, login, token refresh, and address book for Customers and Providers.
- **Database Entities:** Reuses existing `users`, `refresh_tokens`, `user_addresses`.
- **Schemas:**
  - `app/schemas/auth.py`: `LoginRequest`, `TokenResponse`, `CustomerRegisterRequest`, `ProviderRegisterRequest`, `RefreshTokenRequest`.
  - `app/schemas/user.py`: `UserProfileResponse`, `UserUpdateRequest`, `AddressCreate`, `AddressResponse`, `AddressUpdate`.
- **Repositories & Services:**
  - `app/repositories/user_repo.py`: User credential lookup, unique email/phone checks.
  - `app/repositories/token_repo.py`: Token family tracking, hash revocation, replay attack detection.
  - `app/repositories/address_repo.py`: Customer doorstep address management, default address switching.
  - `app/services/auth_service.py`: Password verification, JWT generation, refresh rotation, logout invalidation.
  - `app/services/user_service.py`: Profile updates, address persistence with pincode validation.
- **API Endpoints (7 endpoints):**
  - `POST /api/v1/auth/register/customer` (Public)
  - `POST /api/v1/auth/register/provider` (Public)
  - `POST /api/v1/auth/login` (Public)
  - `POST /api/v1/auth/refresh` (Public / Cookie-based)
  - `POST /api/v1/auth/logout` (Authenticated)
  - `GET  /api/v1/users/me` (Authenticated)
  - `PUT  /api/v1/users/me` (Authenticated)
  - Customer Address Management sub-routes:
    - `GET    /api/v1/customer/addresses` (Customer)
    - `POST   /api/v1/customer/addresses` (Customer)
    - `DELETE /api/v1/customer/addresses/{id}` (Customer)

---

### Module 2: Service Catalog & Zone Serviceability
*Public discovery of trade services, category hierarchies, base pricing, and pincode coverage checks.*

- **Scope & Purpose:** Expose browseable catalog services and high-performance pincode serviceability lookups.
- **Database Entities:** Reuses existing `categories`, `services`, `service_zones`, `provider_zones`.
- **Schemas:** Reuses existing `app/schemas/catalog.py` and `app/schemas/zone.py`.
- **Repositories & Services:**
  - `app/repositories/catalog_repo.py`: Category and active service retrieval with slug lookups.
  - `app/repositories/zone_repo.py`: Zone matching by 6-digit Indian PIN code and active provider coverage.
  - `app/services/catalog_service.py`: Catalog listing with paise-to-rupee display calculations, category hierarchies.
  - `app/services/serviceability_service.py`: Check if active providers cover requested category in the pincode.
- **API Endpoints (6 endpoints):**
  - `GET /api/v1/categories` (Public - Active categories)
  - `GET /api/v1/categories/{id}/services` (Public - Services under category)
  - `GET /api/v1/services/{id}` (Public - Single service breakdown & price)
  - `GET /api/v1/zones/check-serviceability` (Public - Pincode check: `pincode=560001&category_id=...`)
  - Admin Catalog Management:
    - `POST /api/v1/admin/categories` (Super Admin)
    - `PUT  /api/v1/admin/categories/{id}` (Super Admin)
    - `POST /api/v1/admin/services` (Super Admin)
    - `PUT  /api/v1/admin/services/{id}` (Super Admin)

---

### Module 3: Provider Fleet & Technician Management
*Contractor business onboarding, KYC document verification, zone linkage, and fleet technician dispatch duty.*

- **Scope & Purpose:** Manage contractor organizations, KYC approval workflows, and technician rosters.
- **Database Entities:** Reuses existing `providers`, `technicians`, `provider_zones`.
- **Schemas:** Reuses existing `app/schemas/provider.py` and `app/schemas/technician.py`.
- **Repositories & Services:**
  - `app/repositories/provider_repo.py`: Provider profile, KYC status transitions, zone coverage bindings.
  - `app/repositories/technician_repo.py`: Fleet technician listings, availability and duty status toggles.
  - `app/services/provider_service.py`: KYC document secure key storage, zone coverage modification.
  - `app/services/technician_service.py`: Technician account creation, skills assignment, duty toggle (`is_available`).
- **API Endpoints (11 endpoints):**
  - `GET  /api/v1/provider/me` (Provider)
  - `POST /api/v1/provider/kyc/upload` (Provider - Private document key record)
  - `GET  /api/v1/provider/zones` (Provider - Serviced zones)
  - `PUT  /api/v1/provider/zones` (Provider - Link/unlink zones)
  - `GET  /api/v1/provider/fleet` (Provider - Roster of technicians)
  - `POST /api/v1/provider/fleet` (Provider - Create fleet technician)
  - `PUT  /api/v1/provider/fleet/{id}/status` (Provider - Active / suspended)
  - `PUT  /api/v1/technician/duty-status` (Technician - Toggle online/offline)
  - Admin KYC Governance:
    - `GET  /api/v1/admin/kyc/pending` (Super Admin)
    - `POST /api/v1/admin/kyc/{provider_id}/decision` (Super Admin - Approve/Reject)
    - `POST /api/v1/admin/zones` (Super Admin - Register new serviceable pincode)
    - `GET  /api/v1/admin/zones` (Super Admin - List operational zones)

---

### Module 4: Booking Lifecycle, Dispatch & Verification (OTP)
*The operational core of HomeServe: order creation, 15m provider dispatch SLA, technician routing, OTP job verification, and on-site change orders.*

- **Scope & Purpose:** Implements the complete booking execution state machine, provider routing, secure OTP start/finish handshakes, and proof photo uploads.
- **Database Entities:**
  - Reuses existing `bookings`, `dispatch_attempts`, `booking_media`, `change_orders`.
  - *Migration Action:* Generate Alembic migration script for these Phase 4.5 tables.
- **Schemas:** Reuses existing `app/schemas/booking.py`.
- **Repositories & Services:**
  - `app/repositories/booking_repo.py`: Booking creation, status transitions, timeline tracking, filtering by customer/provider/technician.
  - `app/repositories/dispatch_repo.py`: Dispatch attempt records, active timeout checks.
  - `app/repositories/media_repo.py`: BEFORE/AFTER job photo storage records.
  - `app/repositories/change_order_repo.py`: On-site spare parts quote creation and approval tracking.
  - `app/services/booking_service.py`: Financial calculation (base + travel + GST), unique booking number generation (`BK-YYYYMMDD-XXXX`), cancellation refund matrix.
  - `app/services/dispatch_service.py`: Candidate provider selection based on pincode zone, 15-minute SLA timer creation, accept/reject routing transitions (`PENDING_ASSIGNMENT` &rarr; `PROVIDER_ACCEPTED` &rarr; `ASSIGNED`).
  - `app/services/otp_service.py`: Start OTP generation upon assignment, completion OTP generation upon job completion, HMAC-SHA256 verification, attempt throttling.
- **API Endpoints (18 endpoints):**
  - **Customer Booking Flow:**
    - `POST /api/v1/customer/bookings` (Customer - Create booking with Idempotency-Key)
    - `GET  /api/v1/customer/bookings/my-bookings` (Customer - Paginated past/active)
    - `GET  /api/v1/customer/bookings/{id}` (Customer - Full detail & timeline)
    - `POST /api/v1/customer/bookings/{id}/cancel` (Customer - Cancellation with fee calculation)
    - `POST /api/v1/customer/bookings/{id}/resend-otp` (Customer - Start/End OTP resend)
    - `POST /api/v1/customer/bookings/{id}/change-order/approve` (Customer)
    - `POST /api/v1/customer/bookings/{id}/change-order/reject` (Customer)
  - **Provider Dispatch Flow:**
    - `GET  /api/v1/provider/bookings/queue` (Provider - Pending 15m routing offers)
    - `POST /api/v1/provider/bookings/{id}/accept` (Provider - Accept offer)
    - `POST /api/v1/provider/bookings/{id}/reject` (Provider - Reject & forward)
    - `POST /api/v1/provider/dispatch/assign` (Provider - Assign to technician)
  - **Technician Execution Flow:**
    - `GET  /api/v1/technician/my-jobs` (Technician - Assigned job list, OTPs hidden)
    - `PUT  /api/v1/technician/bookings/{id}/status` (Technician - Update to EN_ROUTE or ARRIVED)
    - `POST /api/v1/technician/bookings/{id}/start-otp` (Technician - Verify Start OTP &rarr; IN_PROGRESS)
    - `POST /api/v1/technician/bookings/{id}/change-order` (Technician - Submit parts quote)
    - `POST /api/v1/technician/bookings/{id}/complete` (Technician - Upload proof photos & notes &rarr; AWAITING_CONFIRMATION)
    - `POST /api/v1/technician/bookings/{id}/verify-completion-otp` (Technician - Verify End OTP &rarr; COMPLETED)
    - `POST /api/v1/technician/bookings/{id}/confirm-cash` (Technician - Confirm cash payment on site)

---

### Module 5: Payments, Razorpay Integration & Invoicing
*Financial settlement, payment gateway integration, secure webhook handling, and GST tax invoice generation.*

- **Scope & Purpose:** Implements Razorpay Test Mode order creation, HMAC-SHA256 payment verification, asynchronous webhook deduplication, cash settlement reconciliation, and downloadable tax invoices.
- **Database Entities to Implement (3 Models):**
  1. `Payment` (`payments` table):
     - `id` (UUID String 36, PK)
     - `booking_id` (FK `bookings.id`, Unique)
     - `razorpay_order_id` (String 100, Unique, Indexed)
     - `razorpay_payment_id` (String 100, Nullable, Indexed)
     - `amount_paise` (Integer, Not Null)
     - `currency` (String 10, Default "INR")
     - `payment_method` (String 50: "ONLINE", "CASH")
     - `payment_status` (Enum: `PENDING`, `PAID`, `FAILED`, `REFUNDED`)
     - `gateway_fee_paise` (Integer, Default 0)
     - `tax_paise` (Integer, Default 0)
     - `error_code` / `error_description` (Text, Nullable)
     - `raw_response` (JSON, Nullable)
     - Timestamps (`created_at`, `updated_at`)
  2. `Invoice` (`invoices` table):
     - `id` (UUID String 36, PK)
     - `invoice_number` (String 50, Unique, Indexed, e.g. "INV-202611-0001")
     - `booking_id` (FK `bookings.id`, Unique)
     - `customer_id` (FK `users.id`)
     - `provider_id` (FK `providers.id`)
     - `base_amount_paise` (Integer)
     - `travel_fee_paise` (Integer)
     - `cgst_paise` (Integer) - 9%
     - `sgst_paise` (Integer) - 9%
     - `total_amount_paise` (Integer)
     - `invoice_date` (DateTime)
     - `pdf_storage_key` (String 500, Nullable)
     - Timestamps (`created_at`)
  3. `IdempotencyRecord` (`idempotency_keys` table):
     - `id` (UUID String 36, PK)
     - `idempotency_key` (String 255, Unique, Indexed)
     - `user_id` (FK `users.id`)
     - `request_hash` (String 64)
     - `status_code` (Integer)
     - `response_payload` (JSON)
     - `created_at` (DateTime)
     - `expires_at` (DateTime, Indexed)
- **Schemas:**
  - `app/schemas/payment.py`: `PaymentOrderCreate`, `PaymentOrderResponse`, `PaymentVerifyRequest`, `PaymentVerifyResponse`, `InvoiceResponse`.
- **Repositories & Services:**
  - `app/repositories/payment_repo.py`: Payment record management, transaction status queries.
  - `app/repositories/invoice_repo.py`: Tax invoice creation, invoice numbering sequence.
  - `app/repositories/idempotency_repo.py`: 24-hour key lookup and response caching.
  - `app/services/payment_service.py`: Razorpay order creation in paise, client signature verification (`razorpay_order_id + "|" + razorpay_payment_id` HMAC-SHA256).
  - `app/services/webhook_service.py`: Processing `payment.captured`, `payment.failed`, `refund.processed` using raw body bytes; atomic booking status update.
  - `app/services/invoice_service.py`: Tax computation breakdown (18% GST split into 9% CGST + 9% SGST).
- **API Endpoints (4 endpoints):**
  - `POST /api/v1/payments/razorpay/create-order` (Customer - Create Razorpay order)
  - `POST /api/v1/payments/razorpay/verify` (Customer - Verify payment signature)
  - `POST /api/v1/payments/razorpay/webhook` (Public - Signed raw webhook listener)
  - `GET  /api/v1/customer/bookings/{id}/invoice` (Customer - Retrieve tax invoice)

---

### Module 6: Provider Ledger, Commission Settlement & Payouts
*Commission accounting, wallet balances, provider credit/debit records, and bank payout requests.*

- **Scope & Purpose:** Maintains a transparent, audit-compliant financial ledger for service providers, tracking gross earnings, platform commission deductions (15% default), cash adjustments, and bank disbursements.
- **Database Entities to Implement (2 Models):**
  1. `ProviderLedgerEntry` (`provider_ledger` table):
     - `id` (UUID String 36, PK)
     - `provider_id` (FK `providers.id`, Indexed)
     - `booking_id` (FK `bookings.id`, Nullable, Indexed)
     - `entry_type` (Enum: `BOOKING_CREDIT`, `COMMISSION_DEBIT`, `CASH_COLLECTION_ADJUSTMENT`, `PAYOUT_DEBIT`, `PENALTY_DEBIT`, `REVERSAL_CREDIT`)
     - `amount_paise` (Integer, Not Null)
     - `balance_after_paise` (Integer, Not Null)
     - `description` (String 255)
     - Timestamps (`created_at`)
  2. `PayoutRequest` (`provider_payouts` table):
     - `id` (UUID String 36, PK)
     - `provider_id` (FK `providers.id`, Indexed)
     - `amount_paise` (Integer, Not Null)
     - `payout_status` (Enum: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED`)
     - `bank_account_number_mask` (String 30)
     - `bank_ifsc` (String 15)
     - `bank_reference_id` (String 100, Nullable)
     - `admin_notes` (Text, Nullable)
     - `requested_at` (DateTime)
     - `processed_at` (DateTime, Nullable)
     - Timestamps (`created_at`, `updated_at`)
- **Schemas:**
  - `app/schemas/ledger.py`: `LedgerEntryResponse`, `ProviderBalanceResponse`, `PayoutCreateRequest`, `PayoutResponse`, `AdminPayoutProcessRequest`.
- **Repositories & Services:**
  - `app/repositories/ledger_repo.py`: Append-only ledger mutations, wallet balance calculation.
  - `app/repositories/payout_repo.py`: Payout requests and approval tracking.
  - `app/services/ledger_service.py`: Automated ledger posting upon booking completion (credit provider 85%, debit commission 15%, debit collected cash if CASH payment).
  - `app/services/payout_service.py`: Payout validation (minimum threshold ₹500 / 50000 paise), fund lock, disbursement confirmation.
- **API Endpoints (5 endpoints):**
  - `GET  /api/v1/provider/payouts` (Provider - Wallet balance & ledger history)
  - `POST /api/v1/provider/payouts/request` (Provider - Request payout with Idempotency-Key)
  - `GET  /api/v1/admin/payouts` (Super Admin - List pending withdrawal requests)
  - `POST /api/v1/admin/payouts/{id}/process` (Super Admin - Disburse with bank UTR reference)
  - `POST /api/v1/admin/payouts/{id}/reject` (Super Admin - Reject payout & unlock wallet funds)

---

### Module 7: Customer Reviews, Disputes & Platform Governance
*Post-service customer feedback, dispute ticket arbitration within 48h SLA, and executive Super Admin metrics.*

- **Scope & Purpose:** Collect verified 1-5 star customer ratings, manage customer dispute tickets, and provide Super Admin management analytics.
- **Database Entities to Implement (3 Models):**
  1. `Review` (`reviews` table):
     - `id` (UUID String 36, PK)
     - `booking_id` (FK `bookings.id`, Unique)
     - `customer_id` (FK `users.id`)
     - `provider_id` (FK `providers.id`, Indexed)
     - `technician_id` (FK `technicians.id`, Indexed)
     - `service_id` (FK `services.id`, Indexed)
     - `rating` (Integer: 1 to 5, Not Null)
     - `comment` (Text, Nullable)
     - `is_public` (Boolean, Default True)
     - Timestamps (`created_at`, `updated_at`)
  2. `DisputeTicket` (`disputes` table):
     - `id` (UUID String 36, PK)
     - `booking_id` (FK `bookings.id`, Unique)
     - `raised_by_id` (FK `users.id`)
     - `status` (Enum: `OPEN`, `UNDER_REVIEW`, `RESOLVED_REFUND`, `RESOLVED_REWORK`, `DISMISSED`)
     - `reason` (String 255)
     - `resolution_notes` (Text, Nullable)
     - `refund_amount_paise` (Integer, Default 0)
     - `resolved_at` (DateTime, Nullable)
     - Timestamps (`created_at`, `updated_at`)
  3. `DisputeMessage` (`dispute_messages` table):
     - `id` (UUID String 36, PK)
     - `dispute_id` (FK `disputes.id`, Indexed)
     - `sender_id` (FK `users.id`)
     - `message` (Text, Not Null)
     - `created_at` (DateTime)
- **Schemas:**
  - `app/schemas/review.py`: `ReviewCreate`, `ReviewResponse`.
  - `app/schemas/dispute.py`: `DisputeCreate`, `DisputeResponse`, `DisputeMessageCreate`, `DisputeMessageResponse`, `DisputeResolveRequest`.
  - `app/schemas/analytics.py`: `PlatformOverviewResponse` (GMV, net revenue, active bookings, top categories).
- **Repositories & Services:**
  - `app/repositories/review_repo.py`: Review creation and aggregate ratings per provider/service.
  - `app/repositories/dispute_repo.py`: Dispute conversation thread tracking and status updates.
  - `app/services/review_service.py`: Verify review eligibility (only customer of COMPLETED booking).
  - `app/services/dispute_service.py`: Enforce 48-hour post-completion window, dispute message appending, resolution arbitration.
  - `app/services/analytics_service.py`: Aggregated platform statistics.
- **API Endpoints (9 endpoints):**
  - Customer Feedback:
    - `POST /api/v1/customer/reviews` (Customer - Submit rating & comment)
    - `GET  /api/v1/reviews/service/{id}` (Public - List approved reviews for a service)
  - Dispute Resolution:
    - `POST /api/v1/customer/disputes` (Customer - Raise ticket within 48h)
    - `GET  /api/v1/customer/disputes/{id}` (Customer / Admin - Thread detail)
    - `POST /api/v1/customer/disputes/{id}/messages` (Customer / Admin - Reply to dispute)
    - `GET  /api/v1/admin/disputes` (Super Admin - List open disputes)
    - `POST /api/v1/admin/disputes/{id}/resolve` (Super Admin - Arbitrate & trigger refund/dismissal)
  - Admin Analytics:
    - `GET  /api/v1/admin/analytics/overview` (Super Admin - Platform GMV & operational metrics)

---

## 5. Summary of Database Models & Migrations Strategy

### 5.1 Comprehensive Database Model Breakdown
| Status | Table Name | Model Class | Primary Function |
| :--- | :--- | :--- | :--- |
| **Existing** | `users` | `User` | Authentication identity & role assignment |
| **Existing** | `refresh_tokens` | `RefreshToken` | Rotated 7-day refresh tokens & session revocation |
| **Existing** | `user_addresses` | `UserAddress` | Customer doorstep locations with 6-digit pincode |
| **Existing** | `categories` | `Category` | Master service classifications |
| **Existing** | `services` | `Service` | Bookable trade items with integer paise base price |
| **Existing** | `providers` | `Provider` | Contractor organizations & KYC compliance |
| **Existing** | `technicians` | `Technician` | Fleet personnel, skills, and duty status |
| **Existing** | `service_zones` | `Zone` | 6-digit Indian PIN code operational territories |
| **Existing** | `provider_zones` | `ProviderZone` | Provider-to-zone coverage association |
| **Existing** | `bookings` | `Booking` | Core customer service orders & lifecycle states |
| **Existing** | `dispatch_attempts` | `DispatchAttempt` | 15-minute SLA provider routing attempts |
| **Existing** | `booking_media` | `BookingMedia` | BEFORE/AFTER proof photos (private storage keys) |
| **Existing** | `change_orders` | `ChangeOrder` | On-site extra parts / scope additions in paise |
| **Module 5** | `payments` | `Payment` | Razorpay order, payment transaction & status |
| **Module 5** | `invoices` | `Invoice` | Printable GST tax invoice with CGST/SGST split |
| **Module 5** | `idempotency_keys` | `IdempotencyRecord`| 24-hour cache for mutative financial requests |
| **Module 6** | `provider_ledger` | `ProviderLedgerEntry`| Append-only double-entry wallet transactions |
| **Module 6** | `provider_payouts` | `PayoutRequest` | Provider bank withdrawal requests & status |
| **Module 7** | `reviews` | `Review` | 1-5 star customer ratings and feedback |
| **Module 7** | `disputes` | `DisputeTicket` | Customer complaint ticket within 48h SLA |
| **Module 7** | `dispute_messages` | `DisputeMessage` | Discussion thread for arbitrated disputes |

*Total Planned Schema: 21 Tables (13 Already Implemented, 8 Remaining Across Modules 5, 6, 7).*

### 5.2 Numbered Migration Plan
- **Migration 0001:** `0001_create_user_and_auth_tables.py` *(Applied)*
- **Migration 0002:** `1e4804eb7cc9_create_categories_and_services.py` *(Applied)*
- **Migration 0003:** `5306e443fee9_create_providers_technicians_and_zones.py` *(Applied)*
- **Migration 0004 (Pending):** `create_booking_and_dispatch_tables.py` (Creates `bookings`, `dispatch_attempts`, `booking_media`, `change_orders`)
- **Migration 0005 (Module 5):** `create_payment_and_invoice_tables.py` (Creates `payments`, `invoices`, `idempotency_keys`)
- **Migration 0006 (Module 6):** `create_ledger_and_payout_tables.py` (Creates `provider_ledger`, `provider_payouts`)
- **Migration 0007 (Module 7):** `create_review_and_dispute_tables.py` (Creates `reviews`, `disputes`, `dispute_messages`)

---

## 6. Endpoint Inventory & Capacity Estimation

| Module | Route Prefix | Public Endpoints | Customer Endpoints | Provider Endpoints | Tech Endpoints | Admin Endpoints | Total Endpoints |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Module 1: Auth & Users** | `/auth`, `/users`, `/customer/addresses` | 4 | 4 | 0 | 0 | 0 | **8** |
| **Module 2: Catalog & Zones** | `/categories`, `/services`, `/zones`, `/admin` | 4 | 0 | 0 | 0 | 4 | **8** |
| **Module 3: Provider Fleet** | `/provider`, `/technician`, `/admin` | 0 | 0 | 7 | 1 | 4 | **12** |
| **Module 4: Bookings & Dispatch**| `/customer/bookings`, `/provider/bookings`, `/technician/bookings` | 0 | 7 | 4 | 7 | 0 | **18** |
| **Module 5: Payments & Invoice** | `/payments`, `/customer/bookings/{id}/invoice` | 1 | 3 | 0 | 0 | 0 | **4** |
| **Module 6: Ledger & Payouts** | `/provider/payouts`, `/admin/payouts` | 0 | 0 | 2 | 0 | 3 | **5** |
| **Module 7: Reviews & Disputes** | `/customer/reviews`, `/customer/disputes`, `/admin` | 1 | 4 | 0 | 0 | 4 | **9** |
| **Totals** | | **10** | **18** | **13** | **8** | **15** | **64 Endpoints** |

---

## 7. Third-Party Dependencies & Environment Configuration

### 7.1 Required Python Packages
```text
pyjwt>=2.8.0          # JWT encoding, decoding, token validation
passlib[bcrypt]>=1.7.4 # Password hashing (Bcrypt with 12 rounds)
razorpay>=1.4.1       # Razorpay API client (Test Mode order generation & verification)
reportlab>=4.0.0      # PDF Generation engine for GST Tax Invoices
boto3>=1.34.0         # S3-compatible private storage client (KYC & proof photos)
```

### 7.2 Backend `.env` Keys Verified
```ini
# Application Core
SECRET_KEY=...
ENVIRONMENT=development
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Connection (MySQL 8)
DATABASE_URL=mysql+pymysql://homeserve_user:securepassword@localhost:3306/homeserve_db

# OTP & Verification Salt
OTP_HMAC_SECRET=...

# Razorpay Test Gateway
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Cloud Storage (Private KYC docs & photos)
STORAGE_BUCKET_NAME=homeserve-private
STORAGE_REGION=ap-south-1
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
```

---

## 8. Recommended Execution Sequence & Immediate Next Steps

### Recommended Step 1: Module 0 (Core Security & Dependencies)
1. Implement `app/core/security.py` (Bcrypt hashing, JWT access/refresh token generation & decoding).
2. Implement `app/core/otp.py` (HMAC-SHA256 OTP generation and verification utilities).
3. Implement `app/api/deps.py` (Database session dependency, JWT bearer extraction, `get_current_user`, `require_roles` RBAC guard).
4. Implement `app/repositories/base.py` (Type-safe synchronous SQLAlchemy 2.0 BaseRepository).

### Recommended Step 2: Module 1 (Authentication & User Account APIs)
1. Implement repositories: `UserRepository`, `TokenRepository`, `AddressRepository`.
2. Implement services: `AuthService` (login, registration, rotation, logout), `UserService` (profile, address book).
3. Implement endpoints: `app/api/v1/endpoints/auth.py` and `users.py`.
4. Write integration unit tests for customer registration, provider registration, password login, token refresh rotation, and logout revocation.

### Recommended Step 3: Migration Generation for Booking Tables
Generate migration `create_booking_and_dispatch_tables` for the 4 models implemented in Phase 4.5 (`bookings`, `dispatch_attempts`, `booking_media`, `change_orders`).
*(Note: Per project requirements, migrations will only be generated, never run automatically).*

### Recommended Step 4: Step-by-Step Module Rollout
Proceed sequentially through **Module 2 &rarr; Module 3 &rarr; Module 4 &rarr; Module 5 &rarr; Module 6 &rarr; Module 7**, ensuring each module is complete with its schemas, repository, service, routes, and tests before moving to the next.
