# HomeServe - Home Services Booking SaaS Platform

HomeServe is a multi-tenant Home Services Booking SaaS platform connecting customers with vetted local service professionals across multiple trades:
- Electricians
- Plumbers
- AC Technicians
- Cleaners
- Painters
- Carpenters
- Appliance Repair Professionals

---

## 1. Technology Stack

- **Frontend:** React.js (v18+), Vite, Tailwind CSS v3.4.x, PostCSS, Autoprefixer, Axios
- **Backend:** Python FastAPI (v0.110+), Synchronous SQLAlchemy 2.0, MySQL 8.0, PyMySQL, Pydantic v2 Settings
- **Authentication:** JWT (15-min in-memory access token + 7-day `__Host-` HttpOnly cookie refresh token)
- **Payments:** Razorpay Test Mode (INR, Integer Paise precision)
- **Monetary Precision:** Whole Integer Paise ($1\text{ INR} = 100\text{ Paise}$)
- **Timezone Standard:** UTC in database storage; Indian Standard Time (`Asia/Kolkata`, UTC+05:30) for display

---

## 2. Project Directory Structure

```
c:\HomeServer\
├── backend/                  # FastAPI Application Root
│   ├── alembic/              # Database migration environments
│   ├── app/                  # Application source package
│   │   ├── api/              # Versioned API routes (v1)
│   │   ├── core/             # Configuration, settings, security
│   │   ├── database/         # Synchronous SQLAlchemy session and Base
│   │   ├── middleware/       # CORS, rate limiting, logging, idempotency
│   │   ├── models/           # SQLAlchemy 2.0 declarative database entities
│   │   ├── repositories/     # Data access layer
│   │   ├── schemas/          # Pydantic v2 DTO schemas
│   │   ├── services/         # Pure business logic and workflow orchestration
│   │   └── utils/            # Helper utilities (HMAC OTP, PDF invoice, storage)
│   ├── tests/                # Automated pytest test suites
│   ├── uploads/              # Local storage for KYC & job media (dev only)
│   ├── .env.example          # Backend environment variables template
│   ├── main.py               # ASGI application runner
│   └── requirements.txt      # Python dependencies manifest
│
├── frontend/                 # React Vite SPA Root
│   ├── public/               # Static assets
│   ├── src/                  # React source package
│   │   ├── assets/           # Icons, graphics, Tailwind CSS entry
│   │   ├── components/       # Reusable UI & role widgets
│   │   ├── context/          # React Context providers (Auth, Booking, Toast)
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # Role layouts (Customer, Provider, Tech, Admin)
│   │   ├── pages/            # Page-level route views
│   │   ├── routes/           # React Router route definitions & guards
│   │   ├── services/         # Axios API client & domain services
│   │   └── utils/            # Formatters, constants, helpers
│   ├── .env.example          # Frontend environment variables template
│   ├── index.html            # HTML5 entrypoint
│   ├── package.json          # Node dependencies & npm scripts
│   ├── postcss.config.js     # PostCSS Tailwind config
│   ├── tailwind.config.js    # Tailwind CSS v3 configuration
│   └── vite.config.js        # Vite bundler configuration
│
├── ARCHITECTURE.md           # System architecture blueprint
├── PROJECT_STRUCTURE.md      # Detailed folder & module specification
├── API_DESIGN.md             # Complete REST API specification
├── REQUIREMENTS.md           # Business and functional requirements
└── README.md                 # Project root documentation
```

---

## 3. Quick Start & Local Setup

### 3.1 Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend runs by default at `http://localhost:5173`.

---

### 3.2 Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

5. **Run the FastAPI development server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend API runs by default at `http://localhost:8000`.
   Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## 4. Health Check Verification

Once both servers are running, test the backend health endpoints:

```bash
# Root application health
curl http://localhost:8000/health

# API Version 1 health
curl http://localhost:8000/api/v1/health
```

Expected JSON responses:
- `GET /health` &rarr; `{"status": "healthy", "project": "HomeServe API", "version": "1.0.0", ...}`
- `GET /api/v1/health` &rarr; `{"status": "healthy", "api_version": "v1", "service": "HomeServe API", ...}`

---

## 5. Architectural Documents

For in-depth architectural and specification details, refer to:
- [`REQUIREMENTS.md`](REQUIREMENTS.md) - Complete business rules, roles, and workflows.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture, database patterns, and security.
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) - Comprehensive directory blueprint and module mapping.
- [`API_DESIGN.md`](API_DESIGN.md) - Full REST API endpoints, schemas, and status codes.
