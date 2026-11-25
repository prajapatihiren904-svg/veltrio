# VELTRIO: Project Architecture

This document explains how VELTRIO is structured and why. Read it before adding or changing anything.

## 1. Principles

1. **Separation of concerns.** UI, API access, HTTP handling, business logic, and persistence each live in their own layer.
2. **Modularity.** Each feature (income, budgets, goals...) owns its page, components, service, and backend files, so a change stays local.
3. **Single source of truth.** Colors in design tokens, routes in one table, navigation in one constants file, categories in one constants file.
4. **Secure by default.** Authentication on every private route, ownership checks on every query, validation on every input, secrets only in environment variables.
5. **Additive change.** New features add files and register themselves in a small number of index files. They do not rewrite existing ones.

## 2. System overview

```
┌────────────────────────┐      HTTPS / JSON       ┌──────────────────────────┐
│  Browser (React SPA)   │ ──────────────────────► │  Express REST API        │
│                        │   Authorization: Bearer │  /api/v1/...             │
│  pages → hooks →       │ ◄────────────────────── │  route → middleware →    │
│  services → api client │      { success, data }  │  controller → service →  │
└────────────────────────┘                         │  model                   │
                                                   └────────────┬─────────────┘
                                                                │ Mongoose
                                                   ┌────────────▼─────────────┐
                                                   │      MongoDB Atlas       │
                                                   └──────────────────────────┘
```

The frontend and backend are independently deployable. They share only the HTTP contract described in section 8.

## 3. Repository layout

```
veltrio/
├── frontend/
│   ├── public/                    static files served as-is (favicon)
│   └── src/
│       ├── assets/                images/, icons/, fonts/
│       ├── components/
│       │   ├── common/            UI primitives (Button, Card, Badge, Modal, Spinner, ProgressBar, PageHeader, Logo)
│       │   ├── forms/             Input, Select, FormField, shared control styles
│       │   ├── feedback/          Skeleton, EmptyState, ErrorBoundary, AppToaster, PageLoader
│       │   ├── layout/            shell building blocks (AppShell, Sidebar, TopBar, MobileDrawer, PublicNavbar, Footer)
│       │   ├── charts/            generic Recharts wrappers (line, bar, pie)
│       │   └── landing/ dashboard/ transactions/ budgets/
│       │       goals/ analytics/ admin/     components used by one feature only
│       ├── constants/             navigation, route paths, categories
│       ├── contexts/              global React context providers
│       ├── hooks/                 data and behavior hooks
│       ├── layouts/               page shells (navbar, sidebar, outlet)
│       ├── pages/                 one folder per feature, one component per page (dev/ holds developer-only pages)
│       ├── routes/                route table and route guards
│       ├── services/              API access, one file per backend resource
│       ├── styles/                tokens.css and global styles
│       └── utils/                 pure helper functions
│   ├── scripts/                   check-design-tokens.mjs (design-token linter)
│   └── tests/                     frontend tests (node:test)
└── backend/
    ├── scripts/                   one-off scripts (seed first admin, Phase 9)
    ├── tests/                     unit/ and integration/ tests (node:test)
    └── src/
        ├── config/                env loading and database connection
        ├── constants/             roles, statuses, default categories
        ├── controllers/           HTTP layer
        ├── middleware/            cross-cutting request handling
        ├── models/                Mongoose schemas
        ├── routes/                routers, one per resource
        ├── services/              business logic
        ├── utils/                 small shared helpers
        └── validators/            request validation rules
```

## 4. Frontend architecture

### 4.1 Layers and dependency direction

```
pages  →  components  (UI)
pages  →  hooks       (data + behavior)
hooks  →  services    (API calls)
services → api client (axios instance, token handling)
```

- **Pages** compose layouts, components, and hooks. They contain no fetch logic and no business rules.
- **Components** are presentational. Generic ones live in `common/`, `forms/`, `feedback/`, `charts/`. Feature-specific ones live in their feature folder. A component used by two or more features is promoted to `common/`.
- **Hooks** own loading, error, and data state for a feature (for example `useTransactions`) and call services.
- **Services** are plain modules, one per backend resource (`authService`, `transactionService`, `budgetService`, `goalService`, `analyticsService`, `adminService`, `userService`). They know URLs and payload shapes, and nothing about React.
- **Utils** are pure functions (currency and date formatting, chart helpers) with no side effects.
- **Layout components** (`components/layout/`) are the building blocks of the page shells in `layouts/`. `AppLayout` and `AdminLayout` are thin wrappers around the shared `AppShell`.
- **Contexts** hold only global state: `AuthContext` (user, token, login, logout) and `CurrencyContext` (user's currency). Feature data stays in hooks, not contexts. No global store is introduced until there is a proven need.

### 4.2 Routing and layouts

| Route group | Guard | Layout | Examples |
|---|---|---|---|
| Public | none | `PublicLayout` | `/` |
| Guest-only | redirects signed-in users to the dashboard | `AuthLayout` | `/login`, `/register`, `/forgot-password`, `/reset-password/:token` |
| Private | `ProtectedRoute` | `AppLayout` | `/dashboard`, `/income`, `/expenses`, `/transactions`, `/budgets`, `/goals`, `/analytics`, `/profile`, `/settings` |
| Admin | `AdminRoute` (role check) | `AdminLayout` | `/admin`, `/admin/users` |

The route table is defined once in `routes/`. Sidebar and mobile navigation are generated from `constants/navigation.js`, so adding a page means adding one route entry and one navigation entry.

### 4.3 Pages and their components

| Page | Folder | Purpose |
|---|---|---|
| Landing | `pages/landing` | Navbar, hero, features, how it works, pricing, testimonials, FAQ, footer |
| Auth | `pages/auth` | Login, Register, ForgotPassword, ResetPassword |
| Dashboard | `pages/dashboard` | Balance, income, expenses, recent transactions, overview charts |
| Income | `pages/income` | Income-only management |
| Expenses | `pages/expenses` | Expense-only management |
| Transactions | `pages/transactions` | Combined history with search, filters, edit, delete |
| Budgets | `pages/budgets` | Monthly budgets, limits, progress, warnings |
| Goals | `pages/goals` | Savings goals and contributions |
| Analytics | `pages/analytics` | Reports, breakdowns, trends |
| Profile | `pages/profile` | Personal details |
| Settings | `pages/settings` | Password, currency, account |
| Admin | `pages/admin` | Platform stats, user management |
| Errors | `pages/errors` | NotFound, Forbidden |

Income and Expenses are separate pages with their own copy, defaults, and category lists, but they reuse the shared `components/transactions/` (list, form, filters). Income and expense differ by a `type` prop, not by duplicated code.

### 4.4 State, errors, and feedback

- API errors are normalized in the API client so hooks always receive `{ message, errors }`.
- A `401` response clears the session and redirects to login.
- Success and failure feedback use one toast component from `components/feedback/`.
- Loading states use skeletons, and empty states use `EmptyState`.

## 5. Backend architecture

### 5.1 Request flow

```
request
  → rate limiter, helmet, cors, json parser
  → route                 maps URL + method to a controller
  → middleware            authenticate, authorize(role), validate
  → controller            reads req, calls a service, sends res
  → service               business rules, queries, calculations
  → model                 Mongoose schema and indexes
  → errorHandler          single place that shapes every error
```

- **Controllers are thin.** They never contain business rules or direct database queries.
- **Services own the logic**, including aggregations, budget-versus-spend calculations, and goal progress. They receive plain arguments (`userId`, filters), never `req` or `res`, which makes them reusable and testable.
- **Models** define schema, validation, indexes, and hooks (password hashing lives in the User model).
- **Validators** define the allowed shape of every request body and query, and run before the controller.

### 5.2 Response contract

```json
// success
{ "success": true, "message": "optional", "data": { } }

// failure
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "Invalid email" } ] }
```

Lists are paginated with `?page=1&limit=20` and return `data.items` plus `data.pagination { page, limit, total, pages }`.

### 5.3 Error handling

Operational errors are thrown as `ApiError(statusCode, message)`. `asyncHandler` forwards rejected promises to a central `errorHandler` that also maps Mongoose validation errors, invalid IDs, duplicate keys, and JWT errors to proper status codes. Unexpected errors return a generic message in production and are logged server-side.

## 6. Authentication and authorization

- **Registration** hashes the password with bcrypt (cost 12 by default) inside the User model. The hash is never returned (`select: false`).
- **Login** returns a signed JWT (`sub` = user id, `role`, expiry from environment). The client sends it as `Authorization: Bearer <token>`.
- **`authenticate` middleware** verifies the token, loads the user, rejects suspended accounts, and sets `req.user`.
- **`authorize(...roles)` middleware** guards role-restricted routes. Admin routes use `authorize('admin')`.
- **Ownership:** every private query includes `{ user: req.user.id }`. Fetching another user's record behaves as "not found".
- **Roles:** `user` (default) and `admin`. Public registration can only create `user`. The first admin is created by `backend/scripts/seedAdmin.js` using credentials from environment variables.
- **Admin privacy boundary:** admins can list accounts, suspend or reactivate users, and view platform-wide aggregate statistics. Admin endpoints never return an individual user's transactions, budgets, or goals.
- **Password reset:** a random token is emailed to the user, only its SHA-256 hash is stored in a separate `PasswordResetToken` collection, and it expires after 15 minutes and is single-use. A TTL index uses MongoDB native `expireAfterSeconds: 0` on the token document expiry field; it never applies TTL to the User collection.
- **Rate limiting:** a general limiter on the API and a stricter limiter on login, register, and forgot-password.

## 7. Data model

Money is stored as a `Number` rounded to two decimals and validated as positive. Dates are stored as UTC `Date` values.

### User
| Field | Notes |
|---|---|
| `name`, `email` | email unique, lowercase |
| `password` | bcrypt hash, `select: false` |
| `role` | `user` or `admin`, default `user` |
| `status` | `active` or `suspended` |
| `currency` | ISO code, default `INR` |
| `lastLoginAt` | last successful login timestamp, used by the admin dashboard |

### PasswordResetToken
| Field | Notes |
|---|---|
| `user` | ref to User |
| `tokenHash` | SHA-256 hash only, unique, never returned |
| `expiresAt` | 15-minute expiry; TTL index with `expireAfterSeconds: 0` |
| `usedAt` | atomically set to enforce single use |

### Transaction
| Field | Notes |
|---|---|
| `user` | ref to User, indexed |
| `type` | `income` or `expense` |
| `amount` | positive number |
| `category` | ref to a Category owned by the same user and matching transaction type |
| `description`, `notes` | required description and optional notes |
| `date` | transaction date |
| `paymentMethod`, `currency` | payment channel and currency snapshot |

Indexes: `{ user, date }`, `{ user, type, date }`, `{ user, category, date }`, and a text index for description/notes. Income and expense share this model and are separated by `type`. All list/get/update/delete queries include the authenticated owner ID.

### Category
Categories are owned by a user and include `name`, `type`, `color`, and `isDefault`. Default income/expense categories are provisioned for each user on first category request; users can add custom categories. Unique index on `{ user, type, name }`.

### Budget
`user`, `month` (`"YYYY-MM"`), `totalLimit`, `categoryLimits: [{ category, limit }]`, `alertThreshold` (default 80 percent). Unique index on `{ user, month }`. Amounts spent are always **computed** from transactions, never stored, so they cannot go stale.

### Goal
`user`, `title`, `targetAmount`, `savedAmount`, `deadline`, `contributions: [{ amount, date, note }]`. Status (active or completed) is derived from saved versus target.

## 8. API surface

Base path: `/api/v1`. Every route except those marked public requires a valid token.

| Area | Endpoints |
|---|---|
| Health (public) | `GET /health` |
| Auth (public) | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password/:token` |
| Session | `GET /auth/me`, `POST /auth/logout` |
| Profile and settings | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password`, `PATCH /users/me/preferences`, `DELETE /users/me` |
| Transactions | `GET /transactions` (filters: `type`, `category`, `from`, `to`, `search`, pagination), `POST /transactions`, `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id` |
| Categories | `GET /transactions/categories?type=`, `POST /transactions/categories` |
| Budgets | `GET /budgets?month=`, `PUT /budgets/:month`, `DELETE /budgets/:month`, `GET /budgets/:month/progress` |
| Goals | `GET /goals`, `POST /goals`, `PATCH /goals/:id`, `POST /goals/:id/contributions`, `DELETE /goals/:id` |
| Analytics | `GET /analytics/summary`, `/analytics/monthly`, `/analytics/category-breakdown`, `/analytics/trends` |
| Admin (role `admin`) | `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id/status` |

The Income and Expenses pages both use `/transactions` with `type=income` or `type=expense`.

## 9. Design tokens and styling

All visual decisions are centralized:

- `frontend/src/styles/tokens.css` defines CSS variables for colors (as RGB triplets so opacity utilities work), fonts, radii, shadows, and spacing.
- `tailwind.config.js` maps semantic names (`canvas`, `surface`, `surface-raised`, `surface-overlay`, `line`, `content`, `content-muted`, `content-subtle`, `brand-*`, `success`, `warning`, `danger`, `info`) to those variables. The default Tailwind palette is **removed**, so classes like `bg-emerald-500` do not exist.
- Components use only semantic utility classes. No hex codes appear in components.
- `npm run lint:tokens` enforces this: it fails on hard-coded colors, raw palette classes, unknown token classes, undefined `var(--...)` references and invalid token values.
- Radii, shadows, motion timings and layout dimensions (`rounded-control`, `shadow-glow`, `w-sidebar`, `h-header`) are tokens too.
- Chart colors (Phase 4) will read the same tokens through `utils/chartTheme.js`, so Recharts follows the palette automatically.

Changing the brand color, the dark palette, or the font means editing `tokens.css` (and the font link) and nothing else. A future light theme is a second token set toggled by a class on the root element.

## 10. Modification playbook

| If you ask to... | Only these areas change |
|---|---|
| Change the dashboard layout | `pages/dashboard/`, `components/dashboard/` |
| Change dashboard numbers or calculations | `backend/src/services/analyticsService`, the analytics controller, `frontend/src/services/analyticsService` |
| Change colors, fonts, radii | `styles/tokens.css` only |
| Change the sidebar or add a nav item | `constants/navigation.js` and the route table |
| Change transaction fields | Transaction model, validator, service; `components/transactions/` form; no other pages |
| Add a new category default | `backend/src/constants/` and `frontend/src/constants/` category lists |
| Add a new feature (for example Recurring Payments) | see below |

**Adding a feature, step by step**

1. Backend: model, validator, service, controller, router; register the router in `routes/index.js`.
2. Frontend: service file, hook, feature components, page folder; add one route entry and one navigation entry.
3. Existing features are not edited, apart from those two registration points.

## 11. Security and environment

- Secrets exist only in backend environment variables. The frontend receives only `VITE_` values, which are public by nature.
- `.env` files are git-ignored. `.env.example` files document every variable with placeholders.
- The backend validates every environment variable at startup (`config/env.js`) and refuses to boot when one is missing, malformed, too weak (JWT secret under 32 characters) or still a placeholder from `.env.example`. In development Node loads `.env` itself (`node --env-file=.env`); in production the host injects the variables.
- Helmet sets secure headers, CORS allows only `CLIENT_URL`, request bodies are size-limited, and request input is stripped of MongoDB operators (`$...`, dotted keys) and prototype-pollution keys by `middleware/sanitize.js`, and per-route validation is added with each feature.
- Passwords are never logged or returned. Stack traces are hidden in production.
- Production traffic must use HTTPS. The Atlas network allowlist should be restricted to the backend host.

## 12. Conventions

- Files: React components `PascalCase.jsx`; hooks `useThing.js`; services and utils `camelCase.js`; backend files `camelCase.js` with a role suffix where helpful (`transactionService.js`, `authController.js`).
- One component per file. A page is named after its feature (`DashboardPage`).
- Backend uses ES modules. Route paths are plural nouns. HTTP verbs follow REST semantics.
- Comments explain why, not what.
- No duplicated logic: if two features need the same thing, promote it to `common/`, `utils/`, or a shared service.

## 13. Deployment

| Part | Suggested host | Notes |
|---|---|---|
| Frontend | Vercel or Netlify | Build `npm run build`; configure SPA fallback to `index.html`; set `VITE_API_URL` |
| Backend | Render or Railway | Set all backend variables; set `CLIENT_URL` to the frontend origin |
| Database | MongoDB Atlas | Restrict network access; use a dedicated database user |

## 14. Decision log

| Decision | Reason |
|---|---|
| Single `Transaction` model with `type` | Income and expense share all fields; one model keeps history, filtering, and analytics simple |
| Spent amounts computed, not stored | Prevents budgets drifting out of sync with transactions |
| Service layer on the backend | Keeps business logic out of HTTP code and reusable |
| `bcryptjs` instead of native `bcrypt` | Same algorithm, no native build step, installs cleanly on every host |
| Admin as a role, not a separate app | One codebase and one auth system, with a strict privacy boundary on data |
| Design tokens as CSS variables | One-file theming and easy future light mode |
| No global state library initially | Auth and currency are the only global state; add a store only if needed |
| Env loaded by Node (`--env-file`, `--watch`) | Removes `dotenv` and `nodemon`; fewer dependencies, same behavior (requires Node 20.6+) |
| Express 4, Tailwind 3, React 18 pinned by major | Mature, widely documented lines; avoids breaking changes from major upgrades |
| Tailwind color palette replaced, not extended | Makes the design tokens the only way to color anything |
| Health endpoint returns 200 with `status: degraded` when MongoDB is down | The frontend can still show which part is unhealthy; a load balancer can read `status` if it needs to |
| Developer-only pages behind `import.meta.env.DEV` | The design system and layout previews never ship in production builds |
