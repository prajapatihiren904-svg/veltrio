# VELTRIO Phase 3 — Transactions

**Status:** Implemented in source; local verification pending.

## Delivered

### Backend
- `Transaction` model with owner, type, amount, category, description, date, payment method, notes, currency, and timestamps.
- `Category` model with owner, type, name, color, and default/custom marker.
- Default income and expense categories are created for each signed-in user on first category request.
- Authenticated API endpoints:
  - `GET /api/v1/transactions` — paginated list; supports `type`, `category`, `from`, `to`, `search`, `page`, and `limit`.
  - `POST /api/v1/transactions` — create.
  - `GET /api/v1/transactions/:id` — get one.
  - `PATCH /api/v1/transactions/:id` — update.
  - `DELETE /api/v1/transactions/:id` — delete.
  - `GET /api/v1/transactions/categories?type=income|expense` — list owned categories and ensure defaults.
  - `POST /api/v1/transactions/categories` — create a custom category.
- Every transaction query/mutation is scoped by the authenticated user's ID. Category references are also checked for ownership and matching transaction type.
- Amounts must be positive; transaction descriptions, notes, dates, payment methods, category IDs, and filters are validated.

### Frontend
- Income, Expenses, and Transactions routes and pages.
- Responsive table on desktop and compact cards on mobile.
- Add/edit modal with type, amount, category, description, date, payment method, and notes.
- Create custom category from the transaction form.
- Search, category, date-range filters, clear filters, pagination, edit and delete.
- Sidebar navigation enabled for all three pages.

## Local verification steps

1. Stop the running dev server with `Ctrl+C`.
2. Extract the Phase 3 ZIP over the existing project folder, preserving `backend/.env`.
3. From the project root run `npm --prefix backend install` and `npm --prefix frontend install` if package manifests changed or dependencies are missing.
4. Run `npm run dev`.
5. Sign in and open `/income`, `/expenses`, and `/transactions`.
6. Add an income record and an expense record. Confirm they appear on their respective pages and on Transactions.
7. Edit one record; verify the changed values persist after refresh.
8. Delete a test record; verify it disappears after refresh.
9. Add a custom category and use it for a transaction.
10. Test category, search, from/to date filters, and pagination.
11. Create/sign in as a second user. Verify the second user cannot see the first user's records. Also verify that a guessed transaction ID from user A cannot be fetched, edited, or deleted by user B (API must return 404).
12. Check the pages at desktop and narrow mobile widths.

## Automated checks added

- Integration test: transaction list rejects unauthenticated requests with HTTP 401.
- Integration test: category creation rejects unauthenticated requests with HTTP 401.

These checks do not prove live database CRUD or cross-user isolation; those require the manual two-account verification above.

## Not included in Phase 3

- Dashboard totals/charts (Phase 4).
- Budgets, savings goals, analytics, recurring transactions, CSV import/export, or bank integrations.
