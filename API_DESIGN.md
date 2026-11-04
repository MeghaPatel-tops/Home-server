# HomeServe - RESTful API Specification (v1)

---

### Document Information
- **Project Name:** HomeServe SaaS Platform
- **Document Version:** 1.4.0 (Phase 2 Final Production Hardening)
- **Phase:** Phase 2 - API Design & Contract Specification
- **Base URL:** `https://api.homeserve.com/api/v1` (Local: `http://localhost:8000/api/v1`)
- **Protocol:** HTTPS / REST / JSON
- **Auth Scheme:** Bearer Token (JWT in `Authorization` header)
- **Currency & Precision:** Indian Rupee (₹ / INR), Database storage and calculation in Integer Paise ($1\text{ INR} = 100\text{ Paise}$)
- **Timezone Standard:** Stored in UTC (`DATETIME(6)` / ISO-8601 `Z`), Displayed in Indian Standard Time (`Asia/Kolkata`, UTC+05:30)

---

## 1. Global API Standards & Conventions

### 1.1 HTTP Headers
- **Standard Request Headers:**
  - `Content-Type: application/json` (or `multipart/form-data` for file uploads)
  - `Accept: application/json`
  - `Authorization: Bearer <jwt_access_token>` (for authenticated endpoints)
  - `X-Request-ID: <uuid>` (Correlation ID for distributed tracing)
- **Mandatory Idempotency Header:**
  - `Idempotency-Key: <uuid>`
  - **Required on all mutative financial & booking creation routes:**
    - `POST /api/v1/customer/bookings`
    - `POST /api/v1/payments/razorpay/create-order`
    - `POST /api/v1/payments/razorpay/verify`
    - `POST /api/v1/technician/bookings/{id}/confirm-cash`
    - `POST /api/v1/provider/payouts/request`
  - **Idempotency Mechanism:** The backend checks the `idempotency_keys` table. If the same key is submitted within 24 hours with an identical payload hash, the server immediately returns the cached response with an `X-Cache-Lookup: HIT` header without re-executing business logic. If the same key is submitted with a differing payload, it rejects with HTTP 409 Conflict (`ERR_IDEMPOTENCY_CONFLICT`).
- **Webhook Request Headers:**
  - `X-Razorpay-Signature: <hmac_sha256_hex>`
  - Verified on the backend using the **raw request body bytes** (`await request.body()`) before JSON parsing.

### 1.2 Standard Success Response Envelopes
Paginated listing response:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total_records": 142,
    "total_pages": 8
  },
  "timestamp": "2026-11-04T04:00:00Z"
}
```

Single resource response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource processed successfully",
  "timestamp": "2026-11-04T04:00:00Z"
}
```

### 1.3 Standard Error Response Envelope (RFC 7807 Problem Details)
```json
{
  "type": "https://homeserve.com/errors/RESOURCE_NOT_FOUND",
  "title": "Resource Not Found",
  "status": 404,
  "code": "ERR_NOT_FOUND",
  "detail": "Booking with ID 'bk_550e8400' does not exist.",
  "instance": "/api/v1/customer/bookings/bk_550e8400",
  "timestamp": "2026-11-04T04:00:00Z",
  "errors": []
}
```

Validation error response (`422 Unprocessable Entity`):
```json
{
  "type": "https://homeserve.com/errors/VALIDATION_ERROR",
  "title": "Unprocessable Entity",
  "status": 422,
  "code": "ERR_VALIDATION",
  "detail": "Request body failed validation schema.",
  "instance": "/api/v1/customer/bookings",
  "timestamp": "2026-11-04T04:00:00Z",
  "errors": [
    {
      "field": "scheduled_date",
      "message": "Scheduled date cannot be in the past."
    },
    {
      "field": "pincode",
      "message": "Pincode must be exactly 6 numeric digits."
    }
  ]
}
```

---

## 2. Error Code Dictionary

| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `ERR_INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `ERR_TOKEN_EXPIRED` | 401 | JWT access token expired (15m elapsed) |
| `ERR_INVALID_TOKEN` | 401 | Malformed or invalid JWT token |
| `ERR_REFRESH_TOKEN_REVOKED`| 401 | Presented refresh token has been revoked or already rotated |
| `ERR_FORBIDDEN_ROLE` | 403 | User role does not have permission for this resource |
| `ERR_ACCOUNT_SUSPENDED` | 403 | User or Provider account is locked/suspended |
| `ERR_KYC_NOT_APPROVED` | 403 | Provider cannot accept jobs until KYC is approved by Super Admin |
| `ERR_NOT_FOUND` | 404 | Requested entity does not exist |
| `ERR_IDEMPOTENCY_KEY_REQUIRED`| 400 | Mandatory `Idempotency-Key` header missing on mutative financial route |
| `ERR_IDEMPOTENCY_CONFLICT` | 409 | Idempotency key already used with a differing request payload |
| `ERR_PAYMENT_METHOD_MISMATCH`| 400 | Cash confirmation attempted on active online payment or vice versa |
| `ERR_PAYMENT_ALREADY_SETTLED`| 409 | Booking payment is already marked PAID |
| `ERR_ZONE_NOT_SERVICED` | 400 | No verified active providers service the requested 6-digit pincode |
| `ERR_SLOT_UNAVAILABLE` | 409 | Selected time window has reached maximum booking capacity |
| `ERR_PROVIDER_SLA_EXPIRED` | 409 | 15-minute acceptance deadline expired; booking reassigned to next vendor |
| `ERR_INVALID_OTP` | 400 | Provided 4-digit start or completion OTP is incorrect |
| `ERR_OTP_LOCKED` | 429 | Maximum 3 verification attempts exceeded; locked for 10 minutes |
| `ERR_OTP_COOLDOWN` | 429 | OTP resend requested before 60-second cooldown elapsed |
| `ERR_INVALID_STATE_TRANSITION` | 400 | State change not permitted in current execution stage |
| `ERR_PAYMENT_SIGNATURE_INVALID` | 400 | Razorpay HMAC SHA256 signature verification failed |
| `ERR_CHANGE_ORDER_ALREADY_RESOLVED`| 409 | Change order has already been approved or rejected |

---

## 3. Complete Standardized API Endpoint Catalog

### 3.1 Authentication & User Profile (`/api/v1/auth`, `/api/v1/users`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register/customer` | Public | Register a new customer account |
| `POST` | `/auth/register/provider` | Public | Register a new service provider organization |
| `POST` | `/auth/login` | Public | Authenticate user; returns 15m access + 7d refresh token |
| `POST` | `/auth/refresh` | Public | Rotate refresh token; issues new 15m access + 7d refresh token |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token in MySQL and terminate session |
| `GET` | `/users/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/users/me` | Authenticated | Update user name, phone number, and preferences |

---

### 3.2 Public Catalog & Serviceability (`/api/v1/categories`, `/api/v1/services`, `/api/v1/zones`, `/api/v1/reviews`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Public | List all active service categories (e.g., Electrician, AC) |
| `GET` | `/categories/{id}/services`| Public | List all active services under a specific category |
| `GET` | `/services/{id}` | Public | Get detailed service breakdown and pricing (in ₹ and paise) |
| `GET` | `/zones/check-serviceability`| Public | Check if a 6-digit pincode is serviced for a specific category |
| `GET` | `/reviews/service/{id}` | Public | List approved public customer reviews for a service |

---

### 3.3 Customer Domain (`/api/v1/customer/...`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/customer/bookings` | Customer | Create a new service booking (**Requires `Idempotency-Key`**) |
| `GET` | `/customer/bookings/my-bookings`| Customer | List customer's past and active bookings (paginated) |
| `GET` | `/customer/bookings/{id}` | Customer | Get full booking details, technician status, and timeline |
| `POST` | `/customer/bookings/{id}/cancel`| Customer | Cancel booking (Refund computed per stage penalty matrix) |
| `GET` | `/customer/bookings/{id}/invoice`| Customer | Download printable/PDF tax invoice for completed booking |
| `POST` | `/customer/bookings/{id}/change-order/approve`| Customer | Approve technician's on-site spare parts quote |
| `POST` | `/customer/bookings/{id}/change-order/reject` | Customer | Reject technician's on-site spare parts quote |
| `POST` | `/customer/bookings/{id}/resend-otp` | Customer | Regenerate Start or Completion OTP (60s cooldown) |
| `GET` | `/customer/addresses` | Customer | List saved addresses for the customer |
| `POST` | `/customer/addresses` | Customer | Add a new address with 6-digit pincode and notes |
| `DELETE`| `/customer/addresses/{id}`| Customer | Delete a saved address |
| `POST` | `/customer/reviews` | Customer | Submit 1-5 star rating and review after job completion |
| `POST` | `/customer/disputes` | Customer | Raise a dispute ticket within 48 hours of job completion |
| `GET` | `/customer/disputes/{id}` | Customer | View dispute conversation thread and status |
| `POST` | `/customer/disputes/{id}/messages`| Customer | Send message/reply in dispute ticket |

---

### 3.4 Service Provider Operations (`/api/v1/provider/...`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/provider/me` | Service Provider | Get provider company profile and KYC approval status |
| `POST` | `/provider/kyc/upload` | Service Provider | Upload business license / GST registration documents (PDF/JPEG) |
| `GET` | `/provider/zones` | Service Provider | View operational pincodes currently served by provider |
| `PUT` | `/provider/zones` | Service Provider | Link/unlink serviced 6-digit pincodes for the provider |
| `GET` | `/provider/bookings/queue` | Service Provider | List pending bookings in provider zone awaiting 15m decision |
| `POST` | `/provider/bookings/{id}/accept`| Service Provider | Accept booking within 15m SLA (`PROVIDER_ACCEPTED`) |
| `POST` | `/provider/bookings/{id}/reject`| Service Provider | Reject booking; auto-routes to next provider (`PROVIDER_REJECTED`) |
| `POST` | `/provider/dispatch/assign`| Service Provider | Assign accepted booking to a fleet technician (`ASSIGNED`) |
| `GET` | `/provider/fleet` | Service Provider | List all technicians in provider fleet with duty status |
| `POST` | `/provider/fleet` | Service Provider | Create and onboard a new technician profile |
| `PUT` | `/provider/fleet/{id}/status`| Service Provider | Activate, deactivate, or suspend a technician |
| `GET` | `/provider/payouts` | Service Provider | View provider wallet balance and payout transaction ledger |
| `POST` | `/provider/payouts/request`| Service Provider | Request bank transfer withdrawal (**Requires `Idempotency-Key`**) |

---

### 3.5 Technician Field Operations (`/api/v1/technician/...`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/technician/my-jobs` | Technician | View assigned jobs (**OTPs strictly hidden from response**) |
| `PUT` | `/technician/duty-status` | Technician | Toggle online/offline duty status |
| `PUT` | `/technician/bookings/{id}/status` | Technician | Update status to `EN_ROUTE` or `ARRIVED` |
| `POST` | `/technician/bookings/{id}/start-otp` | Technician | Validate Customer Start OTP to begin job (`IN_PROGRESS`) |
| `POST` | `/technician/bookings/{id}/change-order` | Technician | Submit add-on spare parts quote for customer approval |
| `POST` | `/technician/bookings/{id}/complete` | Technician | Upload proof photos & notes; transitions to `AWAITING_COMPLETION_CONFIRMATION` |
| `POST` | `/technician/bookings/{id}/verify-completion-otp`| Technician | Submit customer Completion OTP; transitions to `COMPLETED` |
| `POST` | `/technician/bookings/{id}/confirm-cash`| Technician | Confirm on-site cash collection (**Requires `Idempotency-Key`**) |

---

### 3.6 Payments & Invoicing (Razorpay Test Mode) (`/api/v1/payments/...`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/razorpay/create-order`| Customer | Create Razorpay order ID in integer paise (**Requires `Idempotency-Key`**) |
| `POST` | `/payments/razorpay/verify` | Customer | Verify HMAC SHA256 signature (**Requires `Idempotency-Key`**) |
| `POST` | `/payments/razorpay/webhook`| Public (Signed) | Async Razorpay webhook listener; verifies raw body bytes |

---

### 3.7 Super Admin Platform Governance (`/api/v1/admin/...`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/kyc/pending` | Super Admin | List all pending provider KYC registrations |
| `POST` | `/admin/kyc/{provider_id}/decision`| Super Admin | Approve or Reject provider KYC with reason |
| `POST` | `/admin/categories` | Super Admin | Create a new master service category with commission % |
| `PUT` | `/admin/categories/{id}` | Super Admin | Update category details, icon, or commission rate |
| `POST` | `/admin/services` | Super Admin | Create a service item under a subcategory |
| `PUT` | `/admin/services/{id}` | Super Admin | Update service base price (in paise/₹), duration, or terms |
| `POST` | `/admin/zones` | Super Admin | Add new operational 6-digit pincode / zone |
| `GET` | `/admin/zones` | Super Admin | List all operational zones and pincodes |
| `GET` | `/admin/disputes` | Super Admin | List open and escalated customer disputes |
| `POST` | `/admin/disputes/{id}/resolve`| Super Admin | Arbitrate dispute: trigger refund, rework, or dismiss |
| `GET` | `/admin/payouts` | Super Admin | List pending provider payout requests |
| `POST` | `/admin/payouts/{id}/process`| Super Admin | Approve and disburse payout with bank reference ID |
| `GET` | `/admin/analytics/overview`| Super Admin | Global GMV, net revenue, active bookings, top services |

---

## 4. Key Request & Response Payloads (All in Integer Paise & UTC/IST Standardized)

### 4.1 Authentication: Login Request & Response
`POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "customer@homeserve.test",
  "password": "SecurePassword123!"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 900,
    "user": {
      "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "customer@homeserve.test",
      "full_name": "Jane Doe",
      "role": "CUSTOMER",
      "phone": "+919876543210"
    }
  },
  "message": "Login successful",
  "timestamp": "2026-11-04T04:00:00Z"
}
```

---

### 4.2 Check Serviceability by 6-digit Pincode
`GET /api/v1/zones/check-serviceability?category_id=cat_elec_01&pincode=560001`

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "pincode": "560001",
    "city": "Bengaluru",
    "is_serviceable": true,
    "available_providers_count": 4,
    "earliest_available_slot": {
      "date": "2026-11-05",
      "time_slot": "10:00-12:00",
      "time_slot_utc_start": "2026-11-05T04:30:00Z",
      "time_slot_utc_end": "2026-11-05T06:30:00Z"
    }
  },
  "timestamp": "2026-11-04T04:00:00Z"
}
```

---

### 4.3 Create Booking (Customer) - With Idempotency-Key
`POST /api/v1/customer/bookings`

**Request Headers:**
- `Idempotency-Key: 7b2c5890-481e-4c0d-b7ea-067f5e8b31a2`

**Request Body:**
```json
{
  "service_id": "srv_fan_install_01",
  "address_id": "addr_8291a9b",
  "scheduled_date": "2026-11-05",
  "time_slot": "10:00-12:00",
  "customer_notes": "Ceiling fan needs replacement in living room. Ceiling height is 10ft.",
  "payment_preference": "ONLINE"
}
```

**Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "booking_reference": "HS-20261105-550E",
    "booking_status": "PENDING_ASSIGNMENT",
    "payment_status": "PENDING",
    "payment_method": "ONLINE",
    "service": {
      "id": "srv_fan_install_01",
      "title": "Ceiling Fan Installation",
      "base_price_paise": 49900,
      "base_price_inr": 499.00
    },
    "schedule": {
      "date": "2026-11-05",
      "time_slot": "10:00-12:00",
      "timezone": "Asia/Kolkata",
      "utc_slot_start": "2026-11-05T04:30:00Z"
    },
    "pro_forma_invoice": {
      "invoice_type": "PRO_FORMA_ESTIMATE",
      "base_service_amount_paise": 49900,
      "travel_fee_paise": 5000,
      "subtotal_pre_tax_paise": 54900,
      "tax_amount_gst_18pct_paise": 9882,
      "estimated_total_paise": 64782,
      "estimated_total_inr": 647.82,
      "note": "Pro-forma estimate only. Final tax invoice issued post-completion."
    },
    "dispatch": {
      "attempt_number": 1,
      "deadline_utc": "2026-11-04T04:15:00Z"
    },
    "created_at": "2026-11-04T04:00:00Z"
  },
  "message": "Booking created. Dispatched to regional providers with 15-minute SLA.",
  "timestamp": "2026-11-04T04:00:00Z"
}
```

---

### 4.4 Provider Accepts Booking within 15-Minute SLA
`POST /api/v1/provider/bookings/bk_550e8400/accept`

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "booking_status": "PROVIDER_ACCEPTED",
    "accepted_by_provider_id": "prv_4f7a8b9c",
    "accepted_at": "2026-11-04T04:05:00Z"
  },
  "message": "Booking accepted within 15-minute SLA. Ready for technician dispatch.",
  "timestamp": "2026-11-04T04:05:00Z"
}
```

*(If called after the 15-minute deadline:)*
```json
{
  "type": "https://homeserve.com/errors/PROVIDER_SLA_EXPIRED",
  "title": "SLA Acceptance Deadline Expired",
  "status": 409,
  "code": "ERR_PROVIDER_SLA_EXPIRED",
  "detail": "The 15-minute acceptance deadline expired at 2026-11-04T04:15:00Z. Booking has been reassigned.",
  "instance": "/api/v1/provider/bookings/bk_550e8400/accept",
  "timestamp": "2026-11-04T04:16:00Z"
}
```

---

### 4.5 Provider Assigns Technician
`POST /api/v1/provider/dispatch/assign`

**Request Body:**
```json
{
  "booking_id": "bk_550e8400",
  "technician_id": "tech_7c9e6b21"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "booking_status": "ASSIGNED",
    "assigned_technician": {
      "id": "tech_7c9e6b21",
      "full_name": "Ramesh Kumar",
      "phone": "+919811223344",
      "rating": 4.85
    },
    "assigned_at": "2026-11-04T04:08:00Z"
  },
  "message": "Technician assigned. Start OTP generated and delivered to customer.",
  "timestamp": "2026-11-04T04:08:00Z"
}
```

---

### 4.6 Technician Verifies Customer Start OTP
`POST /api/v1/technician/bookings/bk_550e8400/start-otp`

**Request Body:**
```json
{
  "otp": "4921",
  "technician_notes": "Arrived on time. Inspected old fan mount."
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "booking_status": "IN_PROGRESS",
    "job_started_at": "2026-11-05T04:42:00Z"
  },
  "message": "Start OTP verified successfully. Job is now IN_PROGRESS.",
  "timestamp": "2026-11-05T04:42:00Z"
}
```

---

### 4.7 Submit On-Site Change Order for Spare Parts (Technician)
`POST /api/v1/technician/bookings/bk_550e8400/change-order`

**Request Body:**
```json
{
  "item_name": "Heavy Duty Downrod (3ft)",
  "quantity": 1,
  "unit_price_paise": 25000,
  "tax_rate": 18.0,
  "reason": "Existing downrod is too short for high ceiling. Customer requested 3ft extension."
}
```

**Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "change_order_id": "co_8812c3",
    "booking_id": "bk_550e8400",
    "item_name": "Heavy Duty Downrod (3ft)",
    "pre_tax_amount_paise": 25000,
    "tax_amount_paise": 4500,
    "total_add_on_amount_paise": 29500,
    "total_add_on_amount_inr": 295.00,
    "status": "PENDING_CUSTOMER_APPROVAL",
    "created_at": "2026-11-05T04:55:00Z"
  },
  "message": "Change order submitted. Awaiting customer authorization in app.",
  "timestamp": "2026-11-05T04:55:00Z"
}
```

---

### 4.8 Customer Approves Change Order
`POST /api/v1/customer/bookings/bk_550e8400/change-order/approve`

**Request Body:**
```json
{
  "change_order_id": "co_8812c3"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "change_order_id": "co_8812c3",
    "status": "APPROVED",
    "updated_booking_total_paise": 94282,
    "updated_booking_total_inr": 942.82
  },
  "message": "Change order approved. Total bill adjusted.",
  "timestamp": "2026-11-05T04:56:00Z"
}
```

---

### 4.9 Technician Completes Work & Submits Proof (Transitions to Awaiting Confirmation)
`POST /api/v1/technician/bookings/bk_550e8400/complete`

**Request Body (`multipart/form-data`):**
- `work_notes`: `"Old fan removed. 3ft downrod fitted. Tested at speeds 1-5."`
- `before_photo`: `[File: before_repair.jpg]`
- `after_photo`: `[File: completed_fan.jpg]`

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "booking_status": "AWAITING_COMPLETION_CONFIRMATION",
    "payment_status": "PENDING",
    "submitted_at": "2026-11-05T05:35:00Z",
    "final_bill": {
      "base_service_amount_paise": 49900,
      "approved_spare_parts_paise": 25000,
      "travel_fee_paise": 5000,
      "total_pre_tax_paise": 79900,
      "total_gst_taxes_paise": 14382,
      "final_total_payable_paise": 94282,
      "final_total_payable_inr": 942.82
    }
  },
  "message": "Work proof submitted. Booking in AWAITING_COMPLETION_CONFIRMATION. Completion OTP sent to customer.",
  "timestamp": "2026-11-05T05:35:00Z"
}
```

---

### 4.10 Technician Verifies Customer Completion OTP (Transitions to COMPLETED)
`POST /api/v1/technician/bookings/bk_550e8400/verify-completion-otp`

**Request Body:**
```json
{
  "otp": "8140"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "booking_status": "COMPLETED",
    "completion_verified": true,
    "payment_status": "PENDING",
    "final_total_payable_paise": 94282,
    "completed_at": "2026-11-05T05:36:00Z"
  },
  "message": "Completion OTP verified. Booking marked COMPLETED. Ready for payment collection.",
  "timestamp": "2026-11-05T05:36:00Z"
}
```

---

### 4.11 Razorpay: Create Order for Post-Completion Payment - With Idempotency-Key
`POST /api/v1/payments/razorpay/create-order`

**Request Headers:**
- `Idempotency-Key: a3d891b2-192e-4b71-a083-d98c11f481c0`

**Request Body:**
```json
{
  "booking_id": "bk_550e8400"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "razorpay_order_id": "order_EKwxwAgitu980R",
    "amount_paise": 94282,
    "amount_inr": 942.82,
    "currency": "INR",
    "key_id": "rzp_test_YourKeyHere",
    "booking_id": "bk_550e8400"
  },
  "message": "Razorpay order generated in paise (94282)",
  "timestamp": "2026-11-05T05:37:00Z"
}
```

---

### 4.12 Razorpay: Signature Verification & Ledger Settlement - With Idempotency-Key
`POST /api/v1/payments/razorpay/verify`

**Request Headers:**
- `Idempotency-Key: f19d44a2-9981-42cb-b1b7-7819ef387bb0`

**Request Body:**
```json
{
  "booking_id": "bk_550e8400",
  "razorpay_order_id": "order_EKwxwAgitu980R",
  "razorpay_payment_id": "pay_29QQoUBcx96udK",
  "razorpay_signature": "9ef4b2df3b92e5a4e52516a5b6c382bbfaec89efd3a01a3de711ec4bca118b62"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "payment_id": "pmt_48921a",
    "payment_status": "PAID",
    "payment_method": "ONLINE",
    "transaction_reference": "pay_29QQoUBcx96udK",
    "amount_paid_paise": 94282,
    "final_tax_invoice": {
      "invoice_number": "HS-INV-202611-0042",
      "invoice_type": "FINAL_TAX_INVOICE",
      "sac_code": "998719",
      "gstin": "29AAAAA0000A1Z5",
      "total_amount_inr": 942.82
    },
    "settlement": {
      "platform_commission_15pct_paise": 7485,
      "provider_net_credit_paise": 72415,
      "provider_net_credit_inr": 724.15
    }
  },
  "message": "Payment verified. Final Tax Invoice issued. Provider ledger credited with ₹724.15.",
  "timestamp": "2026-11-05T05:38:00Z"
}
```

---

### 4.13 Technician Confirms Cash Payment - With Idempotency-Key
`POST /api/v1/technician/bookings/bk_550e8400/confirm-cash`

**Request Headers:**
- `Idempotency-Key: e81b2390-482a-4bc1-9029-478a01f92e11`

**Request Body:**
```json
{
  "amount_collected_paise": 94282
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "bk_550e8400",
    "payment_status": "PAID",
    "payment_method": "CASH",
    "amount_collected_paise": 94282,
    "final_tax_invoice": {
      "invoice_number": "HS-INV-202611-0042",
      "invoice_type": "FINAL_TAX_INVOICE",
      "total_amount_inr": 942.82
    },
    "settlement": {
      "platform_commission_15pct_paise": 7485,
      "provider_net_credit_paise": 72415,
      "provider_net_credit_inr": 724.15
    },
    "confirmed_at": "2026-11-05T05:39:00Z"
  },
  "message": "Cash collection confirmed. Final Tax Invoice issued. Provider ledger credited.",
  "timestamp": "2026-11-05T05:39:00Z"
}
```

*(If called when payment is already settled:)*
```json
{
  "type": "https://homeserve.com/errors/PAYMENT_ALREADY_SETTLED",
  "title": "Payment Already Settled",
  "status": 409,
  "code": "ERR_PAYMENT_ALREADY_SETTLED",
  "detail": "Booking bk_550e8400 has already been settled and marked PAID.",
  "instance": "/api/v1/technician/bookings/bk_550e8400/confirm-cash",
  "timestamp": "2026-11-05T05:40:00Z"
}
```

---

### 4.14 Customer Dispute Thread & Message Persistence
`POST /api/v1/customer/disputes/dsp_99182a/messages`

**Request Body:**
```json
{
  "message": "The fan makes a humming noise at speed 4. Requesting technician re-inspection.",
  "attachment_url": "https://storage.homeserve.com/proofs/humming_noise_recording.mp4"
}
```

**Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "message_id": "msg_881920",
    "dispute_id": "dsp_99182a",
    "sender_id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "sender_role": "CUSTOMER",
    "message": "The fan makes a humming noise at speed 4. Requesting technician re-inspection.",
    "attachment_url": "https://storage.homeserve.com/proofs/humming_noise_recording.mp4",
    "created_at": "2026-11-06T04:15:00Z"
  },
  "message": "Dispute message posted successfully",
  "timestamp": "2026-11-06T04:15:00Z"
}
```

---
*End of RESTful API Specification Document.*
