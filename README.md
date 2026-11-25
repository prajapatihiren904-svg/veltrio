# VELTRIO

**Your Money. Your Clarity.**

VELTRIO is a full-stack personal finance management platform: track income and expenses, plan budgets, reach savings goals, and understand spending through analytics. It includes a public landing page, secure authentication, a user dashboard, and an admin dashboard.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express.js (REST API) |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT, bcryptjs, express-validator, optional Nodemailer SMTP |

## Repository layout

```
veltrio/
├── frontend/   React SPA (see PROJECT_ARCHITECTURE.md, section 4)
├── backend/    Express API (see PROJECT_ARCHITECTURE.md, section 5)
├── README.md
├── PROJECT_ARCHITECTURE.md   how the system is designed and why
├── DEVELOPMENT_ROADMAP.md    build order, deliverables, acceptance checks
├── DEPENDENCIES.md           every package and why it is used
├── PHASE1_TEST_REPORT.md     what was tested for Phase 1 and what remains
└── .gitignore
```

## Prerequisites

- Node.js 20.6 or newer (22 LTS recommended)
- A free MongoDB Atlas cluster and its connection string
- Git

## Getting started

```bash
# 1. Install everything (root helper + backend + frontend)
npm run install:all

# 2. Configure the backend
cd backend
cp .env.example .env        # Windows: copy .env.example .env
#   edit .env: set MONGO_URI (Atlas) and JWT_SECRET (see the file for a generator command)
cd ..

# 3. Start both apps together
npm run dev                 # API http://localhost:5000, web http://localhost:5173
```

Or run them separately: `npm run dev:backend` and `npm run dev:frontend`.

Open http://localhost:5173. The landing page shows a live **System status** card; both rows should be green. In development the navbar also links to the **Design system** page and the layout previews.

In development the frontend proxies `/api` to the backend, so no CORS setup is needed.

### MongoDB Atlas (first time)

1. Create a free **M0** cluster at mongodb.com/cloud/atlas.
2. **Database Access:** add a database user (letters and digits in the password avoid URL-encoding issues).
3. **Network Access:** add your current IP address.
4. **Connect > Drivers:** copy the connection string, put your password in it, add `/veltrio` after the host, and paste it into `backend/.env` as `MONGO_URI`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Backend and frontend together |
| `npm test` | Backend tests, frontend tests, design-token lint |
| `npm run build` | Production build of the frontend |
| `npm --prefix backend test` | Backend tests only |
| `npm --prefix frontend run lint:tokens` | Design-token lint only |

## Environment variables

Each app has its own template: `backend/.env.example` and `frontend/.env.example`. Real `.env` files are git-ignored. Secrets (database URI, JWT secret, SMTP credentials) live only in the backend; the frontend only receives `VITE_`-prefixed, non-secret values. SMTP is optional for local development: without SMTP, the reset URL is printed in the backend terminal. Configure all three `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` values together to send real email.

## Project rules

1. Every page is its own component under `frontend/src/pages/<feature>/`.
2. UI never calls the API directly. Pages and hooks use `frontend/src/services/`.
3. Business logic lives in `backend/src/services/`, never in controllers or React components.
4. Colors, spacing, and fonts come from design tokens in `frontend/src/styles/tokens.css`. No hard-coded hex values in components.
5. Every private query is scoped to the authenticated user.
6. Changes touch only the files they concern. See the modification playbook in PROJECT_ARCHITECTURE.md.

## Documentation

- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md): architecture, data model, API surface, security, conventions
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md): phases, deliverables, and acceptance checks

## Status

Phase 0 (architecture), Phase 1 (foundation), Phase 2 (authentication), and the Phase 3 transaction implementation are present. Phase 2 authentication has been manually exercised locally. Phase 3 still requires the local CRUD, filtering, responsive, and two-account ownership checks in `PHASE3_TEST_REPORT.md`.


## Phase 4: Dashboard
The authenticated dashboard now reads its figures from `/api/v1/dashboard/summary`. It shows all-time balance and totals, current-month net, a six-month income/expense comparison, current-month expense categories, and recent transactions. See `DEVELOPMENT_ROADMAP.md` for the remaining local acceptance checks.
\n\n## Phase 5 — Budgets\n\nBudgets are managed at `/budgets`. The API supports authenticated `GET /api/v1/budgets?month=YYYY-MM`, `PUT /api/v1/budgets` (upsert by user, month, and category), and `DELETE /api/v1/budgets/:id`. Budget progress is calculated from that user's expense transactions for the selected calendar month. Budget deletion does not delete transactions.\n