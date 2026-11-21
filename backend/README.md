# HomeServe Backend (Node.js, Express & Mongoose)

This backend implements the full architecture specified in [`BACKEND_COMPLETION_PLAN.md`](../BACKEND_COMPLETION_PLAN.md).

## Architecture & Modular Breakdown

### Module 0: Core Infrastructure & Security
- **Config & Env (`src/config/env.js`, `src/config/database.js`)**: Zod-validated environment config and robust MongoDB connection handler.
- **Security Utilities (`src/core/security/`)**:
  - `password.js`: Bcrypt with salt rounds = 12.
  - `jwt.js`: 15-minute access tokens & 7-day refresh tokens with rotation and token family reuse detection.
  - `otp.js`: HMAC-SHA256 OTP generation and constant-time verification.
- **Middleware (`src/middleware/`)**:
  - `authenticate.js`: Bearer JWT token verification.
  - `authorize.js`: Role-based access control (`SUPER_ADMIN`, `CUSTOMER`, `PROVIDER`, `TECHNICIAN`).
  - `idempotency.js`: 24-hour TTL replay protection for mutative endpoints.
  - `validate.js`: Zod schema validation.
  - `requestId.js`: Distributed tracing correlation IDs.
  - `rateLimiter.js`: General and strict auth rate limits.
  - `errorHandler.js`: Centralized error handler with Mongo duplicate-key handling.

### Module 1: Authentication & User Accounts
- Customer registration, Provider onboarding, Login with JWT & HttpOnly refresh token cookie.
- Token rotation and automatic session termination on token reuse detection.
- Customer addresses book with default address toggling.

### Module 2: Catalog & Zone Serviceability
- Categories hierarchy and active service listings.
- 6-digit Indian PIN code coverage and serviceability check.

### Module 3: Provider Fleet & Technicians
- Provider business profiles, KYC document upload and Admin review decision.
- Technician management, skill assignments, and online/offline duty status toggles.

### Module 4: Booking Lifecycle, Dispatch & OTP
- Booking creation with automated unique code (`BK-YYYYMMDD-XXXX`).
- Auto-dispatch to active providers in zone with acceptance SLAs.
- Technician assignment and job status progression: `PENDING_ASSIGNMENT` -> `PROVIDER_ACCEPTED` -> `ASSIGNED` -> `EN_ROUTE` -> `ARRIVED` -> `IN_PROGRESS` -> `COMPLETED`.
- Start & Completion OTP verification (never exposed to technicians).
- On-site Change Orders with customer approval/rejection.

### Module 5: Payments & Invoicing
- Razorpay order creation and HMAC-SHA256 signature verification.
- Cash on delivery confirmation.
- Automated GST breakdown (9% CGST + 9% SGST) and Invoice generation.

### Module 6: Provider Ledger & Payouts
- Append-only financial ledger (`BOOKING_CREDIT`, `COMMISSION_DEBIT`, `PAYOUT_DEBIT`).
- 85% provider share / 15% platform commission settlement.
- Payout requests (min ₹500), balance reservation, bank UTR processing.

### Module 7: Reviews, Disputes & Platform Governance
- Verified customer reviews for completed jobs.
- Post-service dispute ticket threads with customer and admin messaging.
- Super Admin platform analytics (GMV, net commission, active bookings).

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure MongoDB URI:
```bash
cp .env.example .env
```

### 3. Seed Demo Data
To populate demo categories, services, Bangalore service zones, and test accounts:
```bash
npm run seed
```

### 4. Run Server
Development mode:
```bash
npm run dev
```
Production mode:
```bash
npm start
```
The server runs on `http://localhost:8000/api/v1` (matching the frontend configuration).
