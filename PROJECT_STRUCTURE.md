# HomeServe - Project Directory Structure Specification

---

### Document Information
- **Project Name:** HomeServe SaaS Platform
- **Document Version:** 1.6.0 (Phase 2 Architectural Hardening & Reliability Baseline)
- **Phase:** Phase 2 - Project Structure & Directory Blueprint
- **Frontend Stack:** React.js (v18+), Vite, Tailwind CSS v3 (v3.4.x with PostCSS)
- **Backend Stack:** Python FastAPI (v0.110+), Synchronous SQLAlchemy 2.0, Alembic, MySQL 8.0 + PyMySQL
- **Currency & Precision:** Indian Rupee (₹ / INR), Database storage and calculation in Integer Paise ($1\text{ INR} = 100\text{ Paise}$)
- **Timezone Standard:** Stored in UTC (`DATETIME(6)` / ISO-8601 `Z`), Displayed in Indian Standard Time (`Asia/Kolkata`, UTC+05:30)

---

## 1. High-Level Project Directory Layout

The codebase is organized into a clean mono-repository with two primary top-level application roots: `frontend/` and `backend/`, supported by root-level orchestration scripts and environment templates.

```
c:\HomeServer\
├── backend/                  # Python FastAPI Backend Application Root
│   ├── alembic/              # Database migration environments and version scripts
│   ├── app/                  # Application source package
│   │   ├── api/              # API controllers, versioning, and route endpoints
│   │   ├── core/             # Core configurations, security, exceptions, and events
│   │   ├── database/         # Synchronous SQLAlchemy 2.0 engine, SessionLocal, and mixins
│   │   ├── middleware/       # Custom middleware (CORS, Rate Limiting, Request ID, Idempotency)
│   │   ├── models/           # SQLAlchemy 2.0 declarative database entities
│   │   ├── repositories/     # Data access layer (abstracted SQL/ORM queries)
│   │   ├── schemas/          # Pydantic v2 validation DTOs (Request/Response)
│   │   ├── services/         # Pure business logic and workflow orchestration
│   │   └── utils/            # Shared utilities (HMAC OTP, file storage, formatters)
│   ├── tests/                # Automated unit and integration test suites
│   ├── uploads/              # Local disk storage for KYC & job photos (DEVELOPMENT ONLY)
│   ├── .env.example          # Backend environment variables template
│   ├── alembic.ini           # Alembic migration configuration
│   ├── main.py               # Application entrypoint & ASGI server runner
│   └── requirements.txt      # Python dependencies manifest
│
├── frontend/                 # React.js Single Page Application Root (Vite)
│   ├── public/               # Static public assets (favicons, robots.txt)
│   ├── src/                  # React application source code
│   │   ├── assets/           # Bundled static assets (images, logos, SVG icons)
│   │   ├── components/       # Reusable UI primitives and domain widgets
│   │   ├── context/          # React Context providers (Auth, Notifications, Toast, Booking)
│   │   ├── hooks/            # Custom React hooks (useAuth, useBooking, etc.)
│   │   ├── layouts/          # Role-based shell layouts (Admin, Provider, Tech, Customer)
│   │   ├── pages/            # Page-level route views organized by role domain
│   │   ├── routes/           # React Router v6 routing table & role guards
│   │   ├── services/         # Axios API client and domain HTTP services
│   │   └── utils/            # Pure helper functions, formatters, and constants
│   ├── .env.example          # Frontend environment variables template
│   ├── index.html            # HTML5 single-page application entry file
│   ├── package.json          # Node.js dependencies manifest & npm scripts
│   ├── postcss.config.js     # PostCSS configuration for Tailwind CSS v3
│   ├── tailwind.config.js    # Tailwind CSS v3 design system configuration
│   └── vite.config.js        # Vite bundler and development server configuration
│
├── ARCHITECTURE.md           # System architecture blueprint
├── PROJECT_STRUCTURE.md      # This file
├── API_DESIGN.md             # Complete REST API specification
└── REQUIREMENTS.md           # Business and functional requirements specification
```

---

## 2. Frontend Configuration & Directory Structure (`frontend/src/`)

### 2.1 CSS Framework Standard: Tailwind CSS v3 (v3.4.x)
To guarantee production stability, predictable utility class generation, and complete plugin compatibility, HomeServe standardizes on **Tailwind CSS v3.4.x**:
- **PostCSS Config (`frontend/postcss.config.js`):** Standard PostCSS pipeline with `tailwindcss` and `autoprefixer`.
- **Tailwind Config (`frontend/tailwind.config.js`):** Scans all JSX templates (`content: ["./index.html", "./src/**/*.{js,jsx}"]`).
- **Main CSS Entry (`frontend/src/assets/styles/index.css`):**
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

### 2.2 Frontend Source Layout
```
frontend/src/
├── assets/
│   ├── icons/                # Custom SVG icons and trade badges (Electrician, Plumber, etc.)
│   ├── images/               # Illustration graphics, banners, and default avatars
│   └── styles/
│       └── index.css         # Standard Tailwind CSS v3 directives
│
├── components/
│   ├── ui/                   # Reusable atomic UI components (design system)
│   │   ├── Button.jsx        # Standard, outlined, ghost, loading-state buttons
│   │   ├── Input.jsx         # Accessible form inputs with label and error state
│   │   ├── Select.jsx        # Dropdown selection component
│   │   ├── Modal.jsx         # Accessible dialog overlay with backdrop blur
│   │   ├── Card.jsx          # Container card with standardized borders and padding
│   │   ├── Badge.jsx         # Status pill indicator (Pending, In Progress, Awaiting Confirmation, etc.)
│   │   ├── Spinner.jsx       # Loading indicators and skeleton loaders
│   │   └── Drawer.jsx        # Slide-over panel (mobile navigation & booking drawer)
│   ├── common/               # Shared cross-cutting components
│   │   ├── Navbar.jsx        # Top global navigation header
│   │   ├── Footer.jsx        # Site footer with service links and contact details
│   │   ├── OtpInput.jsx      # 4-digit auto-advancing OTP input component
│   │   ├── Toast.jsx         # Animated popup alert notification
│   │   └── ErrorBoundary.jsx # React crash safety wrapper
│   ├── customer/             # Customer-specific UI components
│   │   ├── AddressSelector.jsx   # Address card picker with "Add New Address" modal
│   │   ├── SlotPicker.jsx        # Calendar date & 2-hour time slot selection grid (Asia/Kolkata)
│   │   ├── ServiceCard.jsx       # Service item tile with pricing (in ₹) and "Book Now"
│   │   ├── RatingModal.jsx       # 5-star review modal with feedback text area
│   │   ├── DisputeModal.jsx      # Raise dispute form with description & file attachment
│   │   └── InvoiceDownloadButton.jsx # Trigger PDF download for completed booking
│   ├── provider/             # Service Provider UI components
│   │   ├── IncomingJobCard.jsx   # Order alert card with 15-minute SLA countdown timer
│   │   ├── TechRosterTable.jsx   # List of fleet technicians with status pills
│   │   ├── DispatchModal.jsx     # Assign technician dialog with availability filter
│   │   └── PayoutSummaryCard.jsx # Ledger balance card with "Request Payout" button
│   ├── technician/           # Technician mobile UI components
│   │   ├── JobActionCard.jsx     # High-contrast action card (Start Travel, Arrived)
│   │   ├── OtpVerifyModal.jsx    # Numeric pad input to verify Customer Start/End OTP
│   │   ├── ChangeOrderModal.jsx  # Form to add extra spare parts with price estimate (in ₹)
│   │   ├── PhotoUploader.jsx     # Mobile camera capture for Before/After job proof
│   │   └── CashCollectionModal.jsx # Technician cash confirmation modal
│   └── admin/                # Super Admin UI components
│       ├── KycReviewModal.jsx    # Split-view document inspector (PDF/Image) with Approve/Reject
│       ├── CommissionEditor.jsx  # Configurable default 15% and category commission editor
│       ├── ServiceModal.jsx      # Create/Edit service item dialog
│       ├── ZoneModal.jsx         # Add/List operational 6-digit pincodes dialog
│       └── DisputeThread.jsx     # 3-party dispute history with resolution buttons
│
├── context/
│   ├── AuthContext.jsx       # Global user authentication state, in-memory access token
│   ├── ToastContext.jsx      # Global toast notification queue and dispatcher
│   └── BookingContext.jsx    # Active booking configuration and step state
│
├── hooks/
│   ├── useAuth.js            # Convenient hook accessing AuthContext
│   ├── useToast.js           # Trigger success/error/warning toast alerts
│   ├── useBookings.js        # Data fetching hook for bookings with status filtering
│   ├── usePincodeCheck.js    # Debounced hook validating serviceability for 6-digit pincodes
│   └── useRazorpay.js        # Hook handling Razorpay Standard Checkout modal integration
│
├── layouts/
│   ├── AuthLayout.jsx        # Centered card layout for Login, Register, Forgot Password
│   ├── CustomerLayout.jsx    # Layout with Customer Navbar, Booking Drawer, and Footer
│   ├── ProviderLayout.jsx    # Layout with Provider Sidebar, Ops Header, and Quick Stats
│   ├── TechnicianLayout.jsx  # Mobile-optimized single-column layout with duty toggle
│   └── AdminLayout.jsx       # Full-width enterprise sidebar layout for Super Admin
│
├── pages/
│   ├── public/               # Publicly accessible pages
│   │   ├── HomePage.jsx          # Hero section, category grid, testimonials, FAQ
│   │   ├── ServiceDetailPage.jsx # Service breakdown, pricing in ₹, what's included/excluded
│   │   └── NotFoundPage.jsx      # 404 Error page
│   ├── auth/                 # Authentication pages
│   │   ├── LoginPage.jsx         # Unified login with role redirection
│   │   ├── RegisterCustomerPage.jsx  # Customer self-signup
│   │   ├── RegisterProviderPage.jsx  # Provider onboarding with business registration
│   │   └── ForgotPasswordPage.jsx    # Password reset link request
│   ├── customer/             # Customer portal pages
│   │   ├── BookServicePage.jsx   # Stepper: Select Service -> Address -> Slot -> Preference
│   │   ├── MyBookingsPage.jsx    # Active and completed orders list
│   │   ├── BookingDetailPage.jsx # Live tracking, Start OTP display, Pay Now button, Invoice
│   │   ├── ProfilePage.jsx       # Profile info (GET/PUT /users/me), Saved addresses
│   │   └── DisputesPage.jsx      # Dispute detail and conversation thread
│   ├── provider/             # Service Provider portal pages
│   │   ├── DashboardPage.jsx     # Overview metrics (revenue, active jobs, ratings)
│   │   ├── DispatchBoardPage.jsx # Unassigned orders queue (15m SLA timer) & fleet status
│   │   ├── FleetPage.jsx         # Add/Edit technicians, toggle active/suspended status
│   │   ├── ZonesPage.jsx         # Manage serviced pincodes and pricing
│   │   └── PayoutsPage.jsx       # Ledger history, earnings split, withdrawal requests
│   ├── technician/           # Technician mobile web pages
│   │   ├── TodayJobsPage.jsx     # Daily work schedule and active order cards
│   │   ├── ActiveJobPage.jsx     # Step-by-step job execution (OTP, Change Orders, Photos)
│   │   └── EarningsPage.jsx      # Daily/weekly job counts and earnings summary
│   └── admin/                # Super Admin master control pages
│       ├── AdminDashboardPage.jsx    # Platform GMV, net revenue, active bookings
│       ├── KycManagementPage.jsx     # Pending provider registrations queue
│       ├── CategoriesPage.jsx        # Manage categories, subcategories, services, base rates
│       ├── ZonesManagementPage.jsx   # Manage operational zones and 6-digit pincodes
│       ├── DisputeDeskPage.jsx       # Escalated customer complaints and refund triggers
│       └── PayoutApprovalsPage.jsx   # Audit and approve provider withdrawal requests
│
├── routes/
│   ├── AppRoutes.jsx         # Central React Router v6 route configuration
│   ├── ProtectedRoute.jsx    # Guard checking active authentication session
│   └── RoleGuard.jsx         # Guard checking user role (`SUPER_ADMIN`, `CUSTOMER`, etc.)
│
├── services/
│   ├── apiClient.js          # Configured Axios instance with JWT interceptors
│   ├── authService.js        # Maps to /api/v1/auth/... and /api/v1/users/me
│   ├── catalogService.js     # Maps to /api/v1/categories, /api/v1/services, /api/v1/zones/..., /api/v1/reviews/service/{id}
│   ├── customerService.js    # Maps to /api/v1/customer/... (Bookings, Addresses, Reviews, Disputes)
│   ├── providerService.js    # Maps to /api/v1/provider/... (Accept, Reject, Fleet, Payouts)
│   ├── technicianService.js  # Maps to /api/v1/technician/... (Status, OTPs, Change Order, Proof, Cash)
│   ├── paymentService.js     # Maps to /api/v1/payments/... (Razorpay Create Order, Verify, Webhook)
│   └── adminService.js       # Maps to /api/v1/admin/... (KYC, Categories, Services, Zones, Payouts, Disputes)
│
└── utils/
    ├── constants.js          # Booking statuses, user roles, payment types constants
    ├── formatters.js         # Currency formatting (₹ INR), dates (Asia/Kolkata), durations
    ├── validators.js         # Form field regex validation helpers (email, phone, 6-digit pincode)
    └── storage.js            # Safe browser storage wrappers (never stores refresh tokens)
```

---

## 3. Backend Directory Structure (`backend/`)

```
backend/
├── alembic/
│   ├── versions/             # Numbered migration scripts (e.g., 0001_initial_tables.py)
│   ├── env.py                # Alembic migration environment importing app.models.Base
│   └── script.py.mako        # Migration generator template
│
├── app/
│   ├── api/                  # API Controller Layer
│   │   ├── v1/               # Version 1 Router Root
│   │   │   ├── router.py     # Aggregates all modular sub-routers under /api/v1
│   │   │   ├── endpoints/    # Domain-specific endpoint controllers
│   │   │   │   ├── auth.py           # /api/v1/auth/... (login, register, refresh, logout)
│   │   │   │   ├── users.py          # /api/v1/users/me (GET, PUT profile)
│   │   │   │   ├── customer.py       # /api/v1/customer/... (bookings, addresses, disputes)
│   │   │   │   ├── provider.py       # /api/v1/provider/... (accept, reject, assign, fleet, payouts)
│   │   │   │   ├── technician.py     # /api/v1/technician/... (jobs, duty, otp, change-order, complete)
│   │   │   │   ├── admin.py          # /api/v1/admin/... (kyc, categories, services, zones, payouts, disputes)
│   │   │   │   ├── catalog.py        # /api/v1/categories, /api/v1/services (Public catalog)
│   │   │   │   ├── zones.py          # /api/v1/zones/check-serviceability (Pincode lookup)
│   │   │   │   ├── reviews.py        # /api/v1/reviews/service/{id} (Public) & /api/v1/customer/reviews (Customer)
│   │   │   │   └── payments.py       # /api/v1/payments/razorpay/... (create-order, verify, webhook)
│   │   │   └── deps.py       # Endpoint dependencies (get_current_user, RequireRoles, get_idempotency_key)
│   │   └── router.py         # Top-level API router mounting /v1
│   │
│   ├── core/                 # Cross-Cutting Core Components
│   │   ├── config.py         # Pydantic BaseSettings loading .env configuration & statutory defaults
│   │   ├── security.py       # Password hashing (Bcrypt 12 rounds), JWT generation/decoding
│   │   ├── exceptions.py     # Custom application exceptions and RFC 7807 error handlers
│   │   ├── constants.py      # System Enums (UserRole, BookingStatus, PaymentStatus, LedgerAccountCode)
│   │   └── events.py         # Application startup/shutdown event handlers
│   │
│   ├── database/             # Relational Persistence Configuration (Synchronous SQLAlchemy 2.0)
│   │   ├── session.py        # SQLAlchemy synchronous engine, SessionLocal, get_db dependency
│   │   └── base.py           # DeclarativeBase, TimestampMixin, SoftDeleteMixin
│   │
│   ├── middleware/           # FastAPI Custom Middlewares
│   │   ├── cors.py           # Dynamic CORS origin policy middleware with credential enforcement
│   │   ├── rate_limit.py     # In-memory sliding window rate limiter (dev/single-node; Redis option)
│   │   ├── logging.py        # Structured JSON request/response logger with X-Request-ID
│   │   ├── idempotency.py    # Idempotency-Key validation middleware for financial & mutative routes
│   │   └── error_handler.py  # Global unhandled exception middleware (RFC 7807)
│   │
│   ├── models/               # SQLAlchemy 2.0 Declarative Entities
│   │   ├── __init__.py       # Exports all models so Alembic autogenerate detects them
│   │   ├── user.py           # User entity (Auth credentials, role, status)
│   │   ├── refresh_token.py  # RefreshToken entity (7-day token hash, revocation tracking)
│   │   ├── address.py        # UserAddress entity (6-digit pincode, lat/long, street)
│   │   ├── provider.py       # Provider entity (Company info, KYC status, bank details)
│   │   ├── technician.py     # Technician entity (Skills, duty status, rating)
│   │   ├── category.py       # ServiceCategory and Subcategory entities
│   │   ├── service.py        # ServiceItem entity (Pricing type, base price in paise, duration)
│   │   ├── zone.py           # ServiceZone and provider_zones association table
│   │   ├── booking.py        # Booking entity (BookingStatus, slots, HMAC hashes, amounts in paise)
│   │   ├── dispatch_attempt.py# DispatchAttempt entity (Provider SLA tracking, attempt count, deadlines)
│   │   ├── booking_media.py  # BookingMedia entity (Before/After photo proofs, document attachments)
│   │   ├── change_order.py   # ChangeOrder entity (On-site spare parts line items in paise)
│   │   ├── payment.py        # Payment entity (PaymentStatus, Razorpay IDs, amounts in paise)
│   │   ├── payment_refund.py # PaymentRefund entity (Partial/full refunds, gateway refund IDs, paise)
│   │   ├── ledger.py         # Auditable Double-Entry Ledger entities (LedgerAccount, LedgerTransaction, LedgerEntry)
│   │   ├── payout.py         # ProviderPayoutRequest entity (Withdrawal ledger)
│   │   ├── invoice.py        # Invoice entity (PDF metadata, tax breakdown, invoice number)
│   │   ├── review.py         # Review entity (Ratings 1-5, textual review)
│   │   ├── dispute.py        # DisputeTicket entity (Complaint reason, status)
│   │   ├── dispute_message.py# DisputeMessage entity (1-to-many with DisputeTicket, message text, attachment)
│   │   ├── notification.py   # Notification entity (User in-app alerts and notifications)
│   │   ├── notification_outbox.py # Transactional Outbox entity (Guaranteed notification delivery)
│   │   ├── webhook_event.py  # WebhookEvent entity (Deduplication of Razorpay webhooks)
│   │   └── idempotency.py    # IdempotencyKey entity (Cached responses for idempotent operations)
│   │
│   ├── repositories/         # Data Access Layer (Clean SQL/ORM Queries)
│   │   ├── base.py           # Generic CRUD repository (get, get_all, create, update, delete)
│   │   ├── user_repo.py      # User lookup by email, verify credentials
│   │   ├── token_repo.py     # Refresh token revocation and rotation queries
│   │   ├── booking_repo.py   # Booking filters by customer, provider, tech, date, status
│   │   ├── dispatch_repo.py  # Dispatch attempt queries, deadline expiry checks
│   │   ├── provider_repo.py  # Provider lookup by zone, KYC status queries
│   │   ├── service_repo.py   # Catalog queries with category filtering
│   │   ├── zone_repo.py      # Pincode serviceability queries
│   │   ├── payment_repo.py   # Payment verification queries with row write-locks
│   │   ├── refund_repo.py    # Refund tracking and balance integrity queries
│   │   ├── ledger_repo.py    # Double-entry journal queries and balanced transaction poster
│   │   ├── invoice_repo.py   # Tax invoice creation and lookup
│   │   ├── dispute_repo.py   # Dispute ticket and dispute messages queries
│   │   ├── outbox_repo.py    # Transactional outbox polling, claim, and status queries
│   │   └── idempotency_repo.py# Idempotency key lookup, processing-lock, and response caching
│   │
│   ├── schemas/              # Pydantic v2 Validation Schemas
│   │   ├── auth.py           # LoginRequest, RegisterRequest, TokenResponse, RefreshRequest
│   │   ├── user.py           # UserResponse, UserUpdate, AddressCreate, AddressResponse
│   │   ├── provider.py       # ProviderCreate, ProviderKycUpload, ProviderResponse, AssignRequest
│   │   ├── technician.py     # TechnicianCreate, TechnicianStatusUpdate, TechResponse
│   │   ├── catalog.py        # CategoryCreate, ServiceCreate, ServiceUpdate, ServiceResponse
│   │   ├── booking.py        # BookingCreate, BookingResponse, BookingDetailResponse
│   │   ├── execution.py      # StartOtpVerify, ChangeOrderCreate, CompleteJobRequest, ConfirmCashRequest
│   │   ├── payment.py        # RazorpayOrderCreate, RazorpayVerify, PaymentResponse, RefundResponse
│   │   ├── review.py         # ReviewCreate, ReviewResponse
│   │   ├── dispute.py        # DisputeCreate, DisputeMessageCreate, DisputeResponse, DisputeDetailResponse
│   │   └── common.py         # StandardPaginatedResponse, StandardErrorResponse
│   │
│   ├── services/             # Pure Business Logic Layer
│   │   ├── auth_service.py       # Login validation, token generation, 7-day token rotation
│   │   ├── booking_service.py    # Slot capacity checks, booking creation, cancellation rules
│   │   ├── dispatch_service.py   # Provider matching, DispatchAttempt tracking, 15m SLA timeout
│   │   ├── execution_service.py  # Keyed HMAC OTP verification, change orders, two-stage completion
│   │   ├── payment_service.py    # Razorpay order generation, HMAC verification, webhook handling
│   │   ├── reconciliation_service.py # Periodic gateway-to-ledger reconciliation worker
│   │   ├── commission_service.py # Statutory commission deduction & double-entry ledger posting
│   │   ├── kyc_service.py        # Document verification and provider approval lifecycle
│   │   ├── storage_service.py    # Abstracted file storage (Local in dev, S3/GCS in prod with signed URLs)
│   │   ├── notification_service.py # High-level notification dispatch interface
│   │   └── outbox_worker.py      # Transactional outbox polling worker with exponential backoff
│   │
│   └── utils/                # Reusable Helper Utilities
│       ├── otp.py            # Keyed HMAC-SHA256 OTP generator & context-bound verifier
│       ├── file_storage.py   # Multipart file handler, UUID renaming, MIME validator
│       ├── pdf_generator.py  # PDF Tax invoice and credit note generator for completed bookings
│       └── razorpay_client.py# Initialized Razorpay test client wrapper
│
├── tests/                    # Pytest Test Suites
│   ├── conftest.py           # Test database fixtures, mock clients, test JWT tokens
│   ├── test_auth.py          # Authentication and token refresh tests
│   ├── test_bookings.py      # Booking state machine and OTP verification tests
│   └── test_payments.py      # Razorpay signature verification and commission tests
│
├── .env.example              # Environment variables template
├── alembic.ini               # Alembic configuration
├── main.py                   # ASGI app initialization, middleware mounting, router inclusion
└── requirements.txt          # Production and development Python packages
```

---

## 4. Key Architectural Clarifications & Subsystem Specifications

### 4.1 Complete Browser Authentication, Token Storage & Security Boundaries
- **Token Lifecycles:** Access Token is strictly **15 minutes**; Refresh Token is strictly **7 days**.
- **Access Token Storage (In-Memory Only):**
  - Stored exclusively **in-memory** within client-side React state (`AuthContext.jsx`).
  - **Never** persisted to `localStorage` or `sessionStorage`. If the browser tab refreshes or closes, the memory state is cleared, and the application silently requests a new access token via `POST /api/v1/auth/refresh`.
- **Refresh Token Storage (`__Host-` Cookie Enforcement):**
  - Stored in an **`HttpOnly`**, **`Secure`**, **`SameSite=Lax`** cookie named **`__Host-refresh_token`**.
  - **RFC 6265bis Prefix Constraints:** Under the browser `__Host-` prefix specification, this cookie **MUST** meet all three structural requirements:
    1. Must include the `Secure` flag (HTTPS only; rejected over plain HTTP).
    2. Must specify `Path=/` (cannot be restricted to a subpath like `/api/v1/auth`).
    3. **Must NOT include any `Domain` attribute** (binding the cookie strictly to the origin host and completely preventing subdomain injection or interception).
  - **Setting the Cookie (Server Header):**
    ```http
    Set-Cookie: __Host-refresh_token=<token_value>; Path=/; Max-Age=604800; Secure; HttpOnly; SameSite=Lax
    ```
- **Logout Cookie-Clearing Example:**
  - Upon user logout (`POST /api/v1/auth/logout`), the backend revokes the refresh token in MySQL and invalidates the browser cookie by setting `Max-Age=0` and an expired timestamp with identical prefix flags:
    ```http
    Set-Cookie: __Host-refresh_token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax
    ```
- **Realistic XSS Security Boundaries:**
  - `HttpOnly` completely prevents malicious client scripts from reading `document.cookie`, neutralizing direct exfiltration of the 7-day refresh token.
  - **However, `HttpOnly` does NOT eliminate XSS risks.** An attacker achieving JavaScript execution on the origin can still access the in-memory access token during the session or issue arbitrary authenticated API requests using the browser's ambient credentials.
  - Therefore, defense-in-depth requires strict Content Security Policy (`Content-Security-Policy`), rigorous context-aware output encoding in React, and automated dependency vulnerability scanning.
- **Strict Credentialed CORS & CSRF Defense:**
  - Because credentialed cookies are transmitted, FastAPI's CORS middleware (`CORSMiddleware`) **must never use wildcard origins (`*`)**.
  - The backend explicitly configures `allow_origins` to an enumerated whitelist of trusted client origins (e.g., `["https://app.homeserve.com"]` in production; `["http://localhost:5173"]` in development), paired with `allow_credentials=True`.
  - **CSRF Protection:** Browser cross-site subrequests (such as malicious forms or script tags from external sites) are blocked by `SameSite=Lax`. Furthermore, all state-changing API endpoints require custom HTTP headers (such as `Authorization: Bearer <token>`, `X-Request-ID`, and `Idempotency-Key`). Browsers enforce that custom headers cannot be set in simple cross-origin requests without a successful CORS preflight `OPTIONS` handshake.

---

### 4.2 Cryptographic OTP Architecture & Context Binding
Plaintext or simple unsalted/salted hashes are prohibited. OTP security is enforced via server-secret keyed HMAC with context binding:

- **Keyed HMAC-SHA256 Generation & Validation:**
  - OTP hashes are generated using HMAC-SHA256 keyed with a cryptographically random, environment-configured server secret (`OTP_SECRET_KEY`):
    $$\text{HMAC\_Hash} = \text{HMAC-SHA256}\Big(K = \text{OTP\_SECRET\_KEY},\, M = \text{booking\_id} \parallel \text{user\_id} \parallel \text{otp\_code} \parallel \text{purpose}\Big)$$
  - Where `purpose` is strictly constrained to `'START'` (for job check-in) or `'COMPLETION'` (for job sign-off).
- **Booking-Specific Context Binding:**
  - Incorporating `booking_id`, the customer's `user_id`, and `purpose` into the HMAC payload ensures that an OTP is cryptographically bound to its unique booking context. An attacker or technician cannot replay a valid OTP from one booking to satisfy another.
- **Expiry, Resend Invalidation & Cooldown Rules:**
  - **Start OTP:** Valid for **15 minutes** from generation.
  - **Completion OTP:** Valid for **30 minutes** from submission of job proof.
  - **Resend Invalidation:** Calling `POST /api/v1/customer/bookings/{id}/resend-otp` instantly generates a new 4-digit code, recalculates the HMAC hash, and updates `bookings.start_otp_hash` (or `end_otp_hash`), rendering the previously issued code immediately invalid.
  - **Cooldown Period:** A strict 60-second cooldown is enforced between resend requests to protect against SMS gateway exhaustion and notification flooding.
- **Maximum Verification Attempts & Lockout:**
  - The system permits a maximum of **3 consecutive incorrect OTP attempts** (`otp_attempts` counter).
  - Upon the 3rd failed attempt, the booking's OTP verification is locked for **10 minutes** (`locked_until = NOW() + INTERVAL 10 MINUTE`). Any subsequent attempt during this window is rejected with `HTTP 429 Too Many Requests` or `HTTP 409 Conflict` (`ERR_OTP_LOCKED`).
- **One-Time-Use Invalidation:**
  - Upon successful verification, the stored HMAC hash column (`start_otp_hash` or `end_otp_hash`) is immediately cleared (`NULL`) or marked consumed (`is_verified = True`), guaranteeing that a used OTP cannot be verified twice.
- **Strict Masking in Logs & API Responses:**
  - Plaintext OTP values **must never be written to application logs, audit traces, or database records**.
  - Technician API endpoints (`GET /api/v1/technician/my-jobs`, `GET /api/v1/technician/bookings/{id}`) **must never expose OTP fields**. The plaintext OTP is communicated solely out-of-band to the customer (via SMS, push notification, or authenticated customer portal).

---

### 4.3 Payment Reliability, Gateway-DB Asynchrony & Exact-Once Settlement
- **Asynchronous Fault Domains (Razorpay vs. MySQL):**
  - External HTTP requests to the Razorpay payment gateway and internal MySQL database transactions exist in separate fault domains. A distributed 2-phase commit (2PC) between Razorpay and MySQL is technically impossible.
  - Network timeouts, user browser drops, or mid-transaction crashes can result in Razorpay capturing funds while the backend database remains uncommitted.
- **Webhook Deduplication & Raw Signature Verification:**
  - Razorpay webhooks (`POST /api/v1/payments/razorpay/webhook`) deliver authoritative payment notifications.
  - **Signature Verification:** The raw, unparsed request payload bytes must be verified against `X-Razorpay-Signature` using `HMAC-SHA256` keyed with `RAZORPAY_WEBHOOK_SECRET`.
  - **Deduplication:** Every incoming webhook is recorded in the `webhook_events` table with a `UNIQUE (gateway, event_id)` constraint (using Razorpay's `X-Razorpay-Event-Id`). Duplicate event deliveries are detected immediately, logged, and acknowledged with `HTTP 200 OK` without re-executing business logic.
- **Exactly-Once Double-Entry Ledger Settlement:**
  - When payment verification succeeds (via client callback or webhook), the backend acquires an exclusive row write-lock on the booking and payment (`SELECT ... FOR UPDATE`).
  - **Settlement Guard:** If `payments.status == 'PAID'`, the settlement routine terminates immediately to prevent duplicate ledger postings.
  - In a single atomic MySQL transaction:
    1. Update `payments.status = 'PAID'` and record gateway transaction references.
    2. Update `bookings.payment_status = 'PAID'`.
    3. Insert a balanced `LedgerTransaction` with balanced debit/credit `LedgerEntry` records.
- **Failure Recovery Workflows:**
  - **Scenario (Client Drops After Payment):** Customer's bank account is debited and Razorpay marks the order paid, but the customer closes their browser before `POST /api/v1/payments/razorpay/verify` executes.
  - **Recovery Channel 1 (Authoritative Webhooks):** The Razorpay `payment.captured` or `order.paid` webhook arrives asynchronously, locks the payment row, verifies the order amount and currency, transitions the state to `PAID`, and posts the ledger entry.
  - **Recovery Channel 2 (Periodic Reconciliation Worker):** A background worker (`reconciliation_service.py`) runs periodically (e.g., every 15 minutes) scanning all bookings with `payment_status = 'PENDING'` whose scheduled completion occurred >30 minutes ago. It queries Razorpay's REST API (`GET /v1/orders/{order_id}/payments`), checks if any captured payment exists, and triggers the settlement pipeline.
  - **Recovery Channel 3 (Idempotent Client Retry):** When the customer re-opens the app, the client re-attempts verification using the original `Idempotency-Key`. The endpoint returns the confirmed payment status.

---

### 4.4 Transactional Notification Outbox & Delivery Reliability
- **FastAPI `BackgroundTasks` Limitations:**
  - FastAPI's built-in `BackgroundTasks` runs functions in an in-memory threadpool *after* the HTTP response has been sent.
  - Because tasks reside only in volatile server memory, worker restarts, crashes, or unhandled exceptions will drop pending tasks permanently without retry mechanisms.
- **The Transactional Outbox Pattern:**
  - To guarantee that critical notifications (customer OTPs, booking dispatch alerts, payment receipts, cancellation notices) are never lost, HomeServe implements the **Transactional Outbox Pattern**.
  - Whenever a domain service commits a state change, it persists a corresponding record into the `notification_outbox` table **within the exact same synchronous MySQL transaction**:
    ```
    BEGIN TRANSACTION;
      UPDATE bookings SET status = 'AWAITING_COMPLETION_CONFIRMATION', ...;
      INSERT INTO notification_outbox (event_type, recipient_id, channel, payload, status)
      VALUES ('OTP_GENERATED', 42, 'SMS', '{"booking_id": 101, "phone": "+919876543210"}', 'PENDING');
    COMMIT;
    ```
- **Outbox Worker & Exponential Backoff:**
  - A dedicated background polling worker (`outbox_worker.py`) polls the outbox using row-level locking:
    ```sql
    SELECT * FROM notification_outbox 
    WHERE status = 'PENDING' OR (status = 'FAILED' AND retry_count < max_retries AND next_retry_at <= NOW())
    ORDER BY created_at ASC LIMIT 50 
    FOR UPDATE SKIP LOCKED;
    ```
  - The worker dispatches the message via external gateways (Twilio / SendGrid / SMS).
  - On delivery failure, the worker increments `retry_count`, calculates `next_retry_at` using exponential backoff ($30\text{s} \times 2^{\text{retry\_count}}$), and sets `status = 'FAILED'`.
  - If `retry_count >= max_retries` (default: 5), `status` transitions to `'DEAD_LETTER'`, triggering an alert for administrative intervention.
- **Role of FastAPI `BackgroundTasks`:**
  - `BackgroundTasks` is retained strictly for non-critical, lightweight operations: sending an immediate wake-up nudge to the outbox worker (minimizing notification latency without waiting for the next polling interval) or recording non-critical diagnostics.
- **Dedicated Independent Synchronous Sessions:**
  - Any background task or outbox worker must create and close its own isolated SQLAlchemy session (`with SessionLocal() as db:`). Database sessions must never be shared across threads or outlive the request context.

---

### 4.5 Auditable Double-Entry Accounting Model & Refund Mechanics
To ensure financial traceability and satisfy audit requirements, HomeServe employs an **Auditable Double-Entry Ledger System** rather than a loose balance-tracking column.

- **Chart of Accounts (`LedgerAccount`):**
  - **`1010 - PLATFORM_GATEWAY_RECEIVABLE` (Asset):** Funds held in transit by Razorpay.
  - **`1020 - TECHNICIAN_CASH_HOLDING` (Asset):** Physical cash collected from customers by technicians on-site.
  - **`2010 - PROVIDER_PAYABLE` (Liability):** Platform's financial obligation to the service provider organization.
  - **`2020 - GST_OUTPUT_TAX_PAYABLE` (Liability):** Statutory GST collected on platform commissions, owed to the tax authorities.
  - **`4010 - PLATFORM_COMMISSION_INCOME` (Revenue):** Platform earnings earned on service labor facilitation.
- **Double-Entry Transactions & Balanced Invariant:**
  - Every financial movement is represented by a `LedgerTransaction` header containing two or more `LedgerEntry` items.
  - **Fundamental Accounting Invariant:** For every `LedgerTransaction`:
    $$\sum \text{Debit Amount (Paise)} \equiv \sum \text{Credit Amount (Paise)}$$
  - *Example (Booking completed with ₹499 base labor paid online, 15% commission = ₹74.85, 18% GST on commission = ₹13.47, Net provider payable = ₹410.68):*
    - `DEBIT  1010 (Gateway Receivable):` 49900 paise
    - `CREDIT 2010 (Provider Payable):` 41068 paise
    - `CREDIT 4010 (Platform Commission):` 7485 paise
    - `CREDIT 2020 (GST Output Tax):` 1347 paise
    - *Total Debits (49900) == Total Credits (49900)*.
- **Immutable Compensating Entries for Reversals:**
  - The `ledger_entries` table is **append-only**. Deleting or updating historical ledger entries is prohibited by software validation and database triggers.
  - Adjustments, cancellation penalties, and customer dispute refunds are executed exclusively through **compensating reversal transactions** (`transaction_type = 'REVERSAL'`) that record opposite balancing entries referencing the original transaction ID.
- **Explicit Payment Refund Model (`PaymentRefund`):**
  - Refunds are tracked via a dedicated `PaymentRefund` entity linked 1-to-many to `Payment`:
    - Columns: `id`, `payment_id`, `booking_id`, `razorpay_refund_id`, `amount_paise`, `reason` (`CUSTOMER_CANCELLATION`, `DISPUTE_SETTLEMENT`, `OVERCHARGE_CORRECTION`), `status` (`PENDING`, `PROCESSED`, `FAILED`), `idempotency_key`, `created_at`, `processed_at`.
  - **Refund Invariant:** The sum of all processed `amount_paise` for a given `payment_id` must never exceed the original `payments.amount_paise`.

---

### 4.6 Tax, Invoices & Statutory Compliance (Configurable Business Assumptions)
- **Four Distinct Financial Documents:**
  1. **Customer Service Invoice (B2C):** Issued by the Service Provider (facilitated by HomeServe as an intermediary) to the Customer, detailing the full consumer bill: Base Labor Fee, Approved Spare Parts, and Travel Surcharge.
  2. **Platform Commission Invoice (B2B Tax Invoice):** Issued by HomeServe Platform to the Service Provider Organization, covering the platform facilitation fee (15% on base labor) plus applicable statutory GST (18%).
  3. **Provider Payout Statement:** Remittance settlement sheet issued upon withdrawal approval, itemizing gross booking credits, platform commission deductions, GST deductions, statutory TDS withholdings (if applicable), and the net bank transfer amount.
  4. **Credit Note:** Formally issued to adjust or nullify an existing tax invoice in cases of partial or full customer refunds, cancellations, or resolved disputes.
- **Commission Calculation Base:**
  - Platform commission (default 15%, or category-specific rate) is computed **strictly on Base Service Labor**.
  - Travel fees (₹50) and customer-approved on-site change orders (spare parts) pass **100% to the Service Provider** without commission deduction.
- **Timing of Supply & Tax Invoice Issuance:**
  - In accordance with Section 31 of the CGST Act (Time of Supply for Services), the legal obligation to issue a tax invoice arises within 30 days of the **completion of the service** or receipt of payment, **whichever occurs earlier**.
  - Service completion (`COMPLETED` verified via Completion OTP) constitutes the primary legal trigger for final invoice generation. Payment status alone is not the sole determinant of invoice timing; if payment is delayed or contested post-completion, the service invoice must still be finalized and locked against modification.
- **Configurable Business Assumptions (Subject to Professional CA Validation):**
  - **Statutory Assumptions:** GST at 18%, e-commerce operator liability under Section 9(5) of the CGST Act, and Section 194O TDS deductions (1%) are documented as **configurable business assumptions**.
  - **Validation Requirement:** Prior to production launch, these assumptions must be reviewed, confirmed, and certified by a licensed Indian Chartered Accountant (CA) or Tax Attorney. Tax rates must remain dynamically configurable via `.env` and `app/core/config.py` rather than hardcoded in business logic.

---

### 4.7 Hardened Idempotency Mechanism & Replay Semantics
- **Protected Financial & Mutative Operations:**
  Mandatory `Idempotency-Key` headers are strictly enforced on:
  1. `POST /api/v1/customer/bookings` (Booking Creation)
  2. `POST /api/v1/payments/razorpay/create-order` (Razorpay Order Creation)
  3. `POST /api/v1/payments/razorpay/verify` (Payment Signature Verification)
  4. `POST /api/v1/technician/bookings/{id}/confirm-cash` (On-site Cash Confirmation)
  5. `POST /api/v1/provider/payouts/request` (Payout Withdrawal Request)
  6. `POST /api/v1/admin/disputes/{id}/resolve` (Dispute Refund/Settlement)
  7. `POST /api/v1/admin/payouts/{id}/process` (Admin Payout Disbursement)
- **Composite Unique Constraint & Payload Hashing:**
  - Table `idempotency_keys` enforces `UNIQUE (user_id, idempotency_key)`.
  - The middleware computes a SHA-256 hash (`request_hash`) across HTTP method, endpoint path, and request body. If the same key is submitted with a different payload hash, the request is rejected with `HTTP 409 Conflict` (`ERR_IDEMPOTENCY_CONFLICT`).
- **Concurrent Request Handling:**
  - When a request arrives, the middleware inserts a row with `status = 'PROCESSING'`.
  - If a concurrent duplicate request arrives while the first is executing, the second request detects the active processing state and serializes (polls with exponential backoff up to a 10-second timeout). Once the initial execution completes, the second request immediately receives the cached result.
- **Response Replay & Header Allowlisting:**
  - Cached responses replay the exact HTTP status code, serialized response body, and specific allowlisted headers (`Content-Type`, `Content-Length`, `X-Request-ID`), alongside a response header:
    ```http
    X-Cache-Lookup: HIT
    ```
  - Ephemeral or transport-specific headers (`Set-Cookie`, `Date`, `Connection`, `Transfer-Encoding`, `Keep-Alive`) are **strictly excluded** from storage and replay.
- **Business-Level Duplicate Protection After Key Expiry:**
  - Idempotency records carry a 24-hour TTL (`expires_at = NOW() + INTERVAL 24 HOUR`), after which they are purged by a daily maintenance job.
  - To prevent duplicate operations after a key has expired, the domain layer enforces **business-level unique constraints and state validations**:
    - `payments.razorpay_order_id` carries a `UNIQUE` index in MySQL.
    - Payment transitions reject execution if `payments.status == 'PAID'`.
    - Payout disbursements reject requests if `provider_payouts.status != 'PENDING'`.
    - Refund totals are validated against `payments.amount_paise`.

---

### 4.8 In-Memory Rate Limiting vs. Production Distributed Cache
- **Development & Single-Instance Deployment:** An in-memory sliding-window rate limiter middleware (`app/middleware/rate_limit.py`) limits requests by client IP (e.g., maximum 10 requests per minute on `/auth/login` and `/auth/register`).
- **Production Scaling Option:** In multi-instance deployments behind an AWS ALB or Nginx reverse proxy, the rate-limiting middleware is reconfigured to use a shared **Redis** instance to enforce cluster-wide sliding window rate limits.

---

### 4.9 File Storage Security & UUID Filename Structure
- **Storage Strategy:** All uploaded files are stored using randomly generated UUID4-based filenames (e.g., `uploads/kyc/f47ac10b-58cc-4372-a567-0e02b2c3d479.pdf`), partitioned by category directories (`uploads/kyc/`, `uploads/proofs/`). Client-submitted original filenames are discarded to prevent path traversal, filename collisions, and malicious payload execution.
- **Strict Private Storage for KYC & Identity Proofs:**
  - KYC documents, government IDs, and tax certificates **must never be served via static file web servers or public HTTP URLs**.
  - **Local Development:** Uploaded KYC files are placed outside the web root and streamed strictly through authenticated FastAPI endpoints requiring Super Admin authorization (`GET /api/v1/admin/kyc/{id}/document`).
  - **Production Object Storage (S3 / GCS):** All sensitive documents are stored in **private cloud storage buckets**. Access is mediated through time-limited (15-minute expiry) cryptographically signed URLs issued exclusively to authorized administrators. Direct public bucket listing or reading is explicitly disabled via IAM bucket policies.

---

## 5. Complete Frontend-to-Backend Interface Mapping

Every frontend API service method maps 1-to-1 to a defined backend endpoint:

| Frontend Service File | Primary Backend Endpoints Consumed | HTTP Method & Path | User Role Context | Idempotency Header |
| :--- | :--- | :--- | :--- | :---: |
| **`authService.js`** | User login | `POST /api/v1/auth/login` | Public | No |
| | Register customer | `POST /api/v1/auth/register/customer` | Public | No |
| | Register provider | `POST /api/v1/auth/register/provider` | Public | No |
| | Rotate refresh token | `POST /api/v1/auth/refresh` | Public (`__Host-` Cookie) | No |
| | Logout session | `POST /api/v1/auth/logout` | Authenticated | No |
| | Get profile | `GET /api/v1/users/me` | Authenticated | No |
| | Update profile | `PUT /api/v1/users/me` | Authenticated | No |
| **`catalogService.js`** | List categories | `GET /api/v1/categories` | Public | No |
| | Category services | `GET /api/v1/categories/{id}/services` | Public | No |
| | Service detail | `GET /api/v1/services/{id}` | Public | No |
| | Public service reviews | `GET /api/v1/reviews/service/{id}` | Public | No |
| | Check pincode | `GET /api/v1/zones/check-serviceability` | Public | No |
| **`customerService.js`** | Create booking | `POST /api/v1/customer/bookings` | Customer | **Mandatory** |
| | My bookings list | `GET /api/v1/customer/bookings/my-bookings` | Customer | No |
| | Booking detail | `GET /api/v1/customer/bookings/{id}` | Customer | No |
| | Cancel booking | `POST /api/v1/customer/bookings/{id}/cancel` | Customer | No |
| | Download PDF invoice | `GET /api/v1/customer/bookings/{id}/invoice` | Customer | No |
| | Approve change order | `POST /api/v1/customer/bookings/{id}/change-order/approve` | Customer | No |
| | Reject change order | `POST /api/v1/customer/bookings/{id}/change-order/reject` | Customer | No |
| | Resend OTP (Start/End)| `POST /api/v1/customer/bookings/{id}/resend-otp` | Customer | No |
| | List addresses | `GET /api/v1/customer/addresses` | Customer | No |
| | Add address | `POST /api/v1/customer/addresses` | Customer | No |
| | Delete address | `DELETE /api/v1/customer/addresses/{id}` | Customer | No |
| | Submit review | `POST /api/v1/customer/reviews` | Customer | No |
| | Open dispute | `POST /api/v1/customer/disputes` | Customer | No |
| | View dispute thread | `GET /api/v1/customer/disputes/{id}` | Customer | No |
| | Post dispute reply | `POST /api/v1/customer/disputes/{id}/messages` | Customer | No |
| **`providerService.js`** | Provider profile | `GET /api/v1/provider/me` | Service Provider | No |
| | Upload KYC docs | `POST /api/v1/provider/kyc/upload` | Service Provider | No |
| | View serviced zones | `GET /api/v1/provider/zones` | Service Provider | No |
| | Update serviced zones | `PUT /api/v1/provider/zones` | Service Provider | No |
| | Incoming queue | `GET /api/v1/provider/bookings/queue` | Service Provider | No |
| | Accept booking (15m SLA)| `POST /api/v1/provider/bookings/{id}/accept` | Service Provider | No |
| | Reject booking | `POST /api/v1/provider/bookings/{id}/reject` | Service Provider | No |
| | Assign technician | `POST /api/v1/provider/dispatch/assign` | Service Provider | No |
| | List fleet | `GET /api/v1/provider/fleet` | Service Provider | No |
| | Add technician | `POST /api/v1/provider/fleet` | Service Provider | No |
| | Update tech status | `PUT /api/v1/provider/fleet/{id}/status` | Service Provider | No |
| | Payouts ledger | `GET /api/v1/provider/payouts` | Service Provider | No |
| | Request withdrawal | `POST /api/v1/provider/payouts/request` | Service Provider | **Mandatory** |
| **`technicianService.js`**| My assigned jobs | `GET /api/v1/technician/my-jobs` | Technician | No |
| | Toggle duty status | `PUT /api/v1/technician/duty-status` | Technician | No |
| | Update transit status | `PUT /api/v1/technician/bookings/{id}/status` | Technician | No |
| | Submit Start OTP | `POST /api/v1/technician/bookings/{id}/start-otp` | Technician | No |
| | Add change order | `POST /api/v1/technician/bookings/{id}/change-order` | Technician | No |
| | Submit completion proof| `POST /api/v1/technician/bookings/{id}/complete` | Technician | No |
| | Verify completion OTP | `POST /api/v1/technician/bookings/{id}/verify-completion-otp` | Technician | No |
| | Confirm cash | `POST /api/v1/technician/bookings/{id}/confirm-cash` | Technician | **Mandatory** |
| **`paymentService.js`** | Create Razorpay order | `POST /api/v1/payments/razorpay/create-order` | Customer | **Mandatory** |
| | Verify HMAC signature | `POST /api/v1/payments/razorpay/verify` | Customer | **Mandatory** |
| | Payment webhook | `POST /api/v1/payments/razorpay/webhook` | Webhook (Public) | Verified via HMAC |
| **`adminService.js`** | Pending KYC queue | `GET /api/v1/admin/kyc/pending` | Super Admin | No |
| | KYC decision | `POST /api/v1/admin/kyc/{provider_id}/decision` | Super Admin | No |
| | Create category | `POST /api/v1/admin/categories` | Super Admin | No |
| | Update category | `PUT /api/v1/admin/categories/{id}` | Super Admin | No |
| | Create service | `POST /api/v1/admin/services` | Super Admin | No |
| | Update service | `PUT /api/v1/admin/services/{id}` | Super Admin | No |
| | Add zone pincode | `POST /api/v1/admin/zones` | Super Admin | No |
| | List all zones | `GET /api/v1/admin/zones` | Super Admin | No |
| | List disputes | `GET /api/v1/admin/disputes` | Super Admin | No |
| | Resolve dispute | `POST /api/v1/admin/disputes/{id}/resolve` | Super Admin | **Mandatory** |
| | Pending payouts queue | `GET /api/v1/admin/payouts` | Super Admin | No |
| | Disburse payout | `POST /api/v1/admin/payouts/{id}/process` | Super Admin | **Mandatory** |
| | Overview analytics | `GET /api/v1/admin/analytics/overview` | Super Admin | No |

---

## 6. Unresolved Business, Regulatory & Tax Decisions

The following items are recognized as operational or legal decisions requiring professional confirmation before production launch:

| Issue | Current Architecture Baseline | Validation Requirement Prior to Production |
| :--- | :--- | :--- |
| **GST Section 9(5) E-Commerce Liability** | Treated as facilitator; Provider issues customer service bill, platform bills commission. | Must be confirmed by a Chartered Accountant whether specific services (e.g. housekeeping, plumbing) trigger Section 9(5) e-commerce operator direct tax liability. |
| **Section 194O TDS Deductions (1%)** | Not deducted in MVP; gross commission subtracted from net payout. | Clarification needed from tax counsel whether HomeServe must withhold 1% TDS on gross provider sales before payout disbursement. |
| **Interstate vs. Intrastate Tax (CGST+SGST vs. IGST)** | Fixed 18% GST (9% CGST + 9% SGST) assumed for intrastate operations. | Multi-state expansion requires determining place-of-supply rules when provider or customer is registered in another state. |
| **Customer Split Invoicing vs. Single Composite Invoice** | Provider invoice covers labor + parts; platform issues separate B2B commission invoice to provider. | Verify whether consumer-facing display should show a single unified invoice or explicitly show facilitator markup breakdown. |

---

## 7. Document Revision History

| Version | Date | Author | Summary of Changes |
| :---: | :---: | :---: | :--- |
| **1.0.0** | 2026-11-04 | Senior Architect | Initial project directory structure blueprint for frontend and backend. |
| **1.1.0** | 2026-11-04 | Senior Architect | Synchronized API routes, standardized namespaces, and decoupled payment status. |
| **1.2.0** | 2026-11-04 | Senior Architect | Added models for dispatch attempts, media, ledger, and tax invoices; 15m SLA everywhere. |
| **1.3.0** | 2026-11-04 | Senior Architect | Added `AWAITING_COMPLETION_CONFIRMATION` flow, OTP salted hash specs, and paise calculations. |
| **1.4.0** | 2026-11-04 | Senior Architect | Added mutually exclusive payments, mandatory idempotency keys, and dispute message model. |
| **1.5.0** | 2026-11-04 | Senior Architect | Documented browser authentication (`HttpOnly` cookie + in-memory access token); background-task reliability rules; explicit completion OTP requirement; hardened idempotency constraints; in-memory vs Redis rate limiting; UUID-based file paths; private cloud bucket security for KYC; financial rounding rules; and renamed `CartContext.jsx` to `BookingContext.jsx`. |
| **1.6.0** | 2026-11-04 | Senior Architect | Corrected `__Host-refresh_token` cookie configuration (`Path=/`, `Secure`, `HttpOnly`, `SameSite=Lax`, no `Domain`); clarified XSS boundaries; enforced strict credentialed CORS & CSRF defense; upgraded OTP storage to server-secret keyed HMAC-SHA256 with booking context binding, cooldowns, and lockout limits; detailed payment reliability across asynchronous fault domains, webhook deduplication, and failure recovery; introduced persistent Transactional Outbox pattern (`NotificationOutbox`, `outbox_worker.py`); specified auditable double-entry accounting model (`LedgerAccount`, `LedgerTransaction`, `LedgerEntry`) with immutable compensating reversals; introduced explicit `PaymentRefund` model; categorized four distinct tax/invoice documents; clarified labor-only commission base and Time of Supply tax triggers; expanded idempotency protection to refunds and dispute settlements; and cataloged unresolved tax and regulatory assumptions. |

---
*End of Project Directory Structure Document.*
