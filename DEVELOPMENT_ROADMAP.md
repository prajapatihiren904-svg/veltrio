# VELTRIO: Development Roadmap

## Working agreement

- Build **one phase at a time**. Do not start the next phase until the current one is verified.
- Each phase touches only the files it concerns, plus the small registration points listed in PROJECT_ARCHITECTURE.md section 10.
- Existing files are inspected before they are edited. Nothing is rewritten unnecessarily.
- A phase is **done** when its acceptance checks pass, the app still runs, and earlier phases still work.

## Phase overview

| # | Phase | Outcome |
|---|---|---|
| 0 | Architecture | Folder structure and documentation (this step) |
| 1 | Foundation | Running API connected to Atlas, design tokens, UI primitives, layouts, router |
| 2 | Authentication and roles | Register, login, logout, password reset, route guards |
| 3 | Transactions | Income, Expenses, and Transaction History working end to end |
| 4 | Dashboard | Real balance, totals, recent activity, charts |
| 5 | Budgets | Monthly budgets with progress and warnings |
| 6 | Savings goals | Goals with contributions and progress |
| 7 | Analytics | Reports, breakdowns, trends |
| 8 | Profile and settings | Profile, password, currency, account |
| 9 | Admin dashboard | User management and platform statistics |
| 10 | Landing page | Complete public marketing site |
| 11 | Hardening and deployment | QA, security review, performance, live deployment |

## Phase details

### Phase 0: Architecture (this step)
- Folder structure, README, architecture document, roadmap, `.env.example` files, `.gitignore`.
- **Done when:** structure reviewed and approved.

### Phase 1: Foundation (implemented)
- **Backend:** environment validation (`config/env.js`), MongoDB connection structure (`config/db.js`), `ApiError`, `asyncHandler`, standard response helper, central error handler, NoSQL-injection sanitizer, helmet, CORS allow-list, rate limiting, `/api/v1/health` (route, controller, service), graceful shutdown.
- **Frontend:** Vite + Tailwind wired to centralized design tokens, React Router with a single route table, API client with error normalization, four global layouts (Public, Auth, App, Admin) with responsive sidebar and phone drawer, page transitions, reusable components (Button, Card, Badge, Input, Select, Modal, ProgressBar, Spinner, Skeleton, EmptyState, ErrorBoundary, Toaster), formatters, a developer-only design-system gallery and layout previews, and a design-token linter.
- **Checks:** `/api/v1/health` reports the database as connected; unknown routes return the standard JSON error; the landing page shows live API and database status; every layout holds up on phone, tablet and desktop; `npm test` passes; no secret is tracked by Git.
- **Manual verification still required on your machine:** dependency installation, the HTTP integration tests, a real MongoDB Atlas connection, `vite build`, and a visual pass in a browser. See PHASE1_TEST_REPORT.md.

### Phase 2: Authentication and roles (implemented; local verification pending)
- **Backend:** install `jsonwebtoken`, `bcryptjs`, `express-validator`, `nodemailer`; User model (with `role`, `status`), register, login, `me`, forgot and reset password, `authenticate` and `authorize` middleware, validators.
- **Frontend:** `AuthContext`, `authService`, `useAuth`, Login, Register, ForgotPassword, ResetPassword pages, `ProtectedRoute`, `AdminRoute`, `AuthLayout`.
- **Implemented:** User and PasswordResetToken models; bcrypt password hashing; JWT issue/verify; register, login, current-session, logout, forgot-password and reset-password endpoints; request validation; authentication and role authorization middleware; auth rate limiting; React AuthContext/useAuth, auth service, guest/protected/admin route guards, and responsive login/register/forgot/reset pages.
- **Checks:** automated API checks cover unauthenticated private access, registration validation, and forgot-password email validation before database access. See `PHASE2_TEST_REPORT.md` for remaining manual checks. Do not begin Phase 3 until the full checklist passes.

### Phase 3: Transactions (Income, Expenses, History) (implemented; local verification pending)
- **Backend:** Transaction and Category models, per-user default/custom categories, CRUD service, filters (type, category, date range, search), pagination, and ownership-scoped reads/updates/deletes.
- **Frontend:** `transactionService`, `useTransactions`, shared responsive transaction form, list, filters, pagination, edit/delete actions; Income, Expenses, and Transactions pages. Sidebar links are enabled.
- **Checks:** automated unauthenticated API checks cover transaction and category endpoints. Manual verification still required: add, edit, delete, category creation, filters, pagination, user A cannot read/change user B records, and responsive layouts. See `PHASE3_TEST_REPORT.md`.

### Phase 4: Dashboard (implemented; local verification pending)
- **Backend:** authenticated `/api/v1/dashboard/summary` endpoint. Aggregates all-time income/expenses/balance, current-month totals, six-month income/expense series, current-month expense categories, and six recent transactions. Every query is scoped to the authenticated user.
- **Frontend:** real dashboard replaces the temporary session page; balance/income/expense/net stat cards, six-month comparison chart, current-month expense breakdown, recent activity, monthly snapshot, refresh and empty states.
- **Implementation note:** charts use accessible, responsive CSS-based visualizations rather than adding a chart dependency; this keeps the existing dependency set unchanged while meeting the current dashboard requirements.
- **Checks:** backend summary route rejects unauthenticated requests; chart utility tests cover empty and populated data. Manual verification still required: reconcile totals against MongoDB transactions, verify a second account sees only its own summary, check new-user empty state, and test charts on phone/tablet/desktop.

### Phase 5: Budgets (implemented; local verification pending)
- **Backend:** Budget model, user/month/category unique index, authenticated list/upsert/delete API, progress calculation from same-month expense transactions.
- **Frontend:** budget page, month selector, create/update form, progress bars, warning states at the alert threshold and at 100 percent.
- **Checks:** one budget per user/month/category; spending is derived from transactions; deleting a budget never deletes transactions.
- **Local acceptance still required:** save a budget, add an expense in that category and verify progress changes, test 80% and 100% warning states, verify another user cannot see or change it, and test responsive layout.

### Phase 6: Savings goals
- **Backend:** Goal model, contributions, derived status.
- **Frontend:** goal cards, progress, contribution modal, completion state.
- **Checks:** contributions update progress; goals complete at 100 percent; edits and deletes behave.

### Phase 7: Analytics
- **Backend:** monthly report, category breakdown, income analysis, trend endpoints.
- **Frontend:** interactive charts, month selector, breakdown tables.
- **Checks:** totals reconcile with Dashboard and Transactions; month switching is correct; large data sets stay responsive.

### Phase 8: Profile and settings
- **Backend:** update profile, change password, preferences, account deletion.
- **Frontend:** Profile and Settings pages, `CurrencyContext`.
- **Checks:** currency change is reflected across the app; password change requires the current password; account deletion removes the user's data.

### Phase 9: Admin dashboard
- **Backend:** `seedAdmin` script, admin stats (user counts, signups over time, platform activity totals), user list, suspend and reactivate.
- **Frontend:** `AdminLayout`, admin overview, users table with search and status actions.
- **Checks:** non-admins get 403 on every admin route; admins cannot see any user's individual financial records; suspended users cannot sign in.

### Phase 10: Landing page
- **Frontend:** navbar, hero, features, how it works, pricing, testimonials, FAQ, footer, smooth page transitions.
- **Checks:** all sections responsive; call-to-action buttons route to Register and Login; Lighthouse accessibility and performance acceptable.

### Phase 11: Hardening and deployment
- Responsive pass on desktop, laptop, tablet, Android, and iPhone.
- Security review: authorization tests, rate limits, headers, dependency audit, production error masking.
- Production builds, environment configuration, SPA fallback, CORS and Atlas allowlist, live smoke test.
- **Done when:** the deployed app passes the full acceptance checklist from Phases 2 to 9.

## Change management after launch

New features follow the playbook in PROJECT_ARCHITECTURE.md section 10: add files, register in the index points, leave existing features untouched, and add acceptance checks to this roadmap.
