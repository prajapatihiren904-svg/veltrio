# VELTRIO Phase 5 — Budget Management

## Implemented
- Mongoose Budget model with per-user, month, and category uniqueness.
- Authenticated budget API: list by month, create/update (upsert), delete.
- Budget progress derived from the authenticated user's expense transactions in the selected calendar month.
- Remaining amount, percentage used, warning threshold, and exceeded status.
- Responsive budget page with month selector, budget form, summary cards, progress bars, warning states, and delete confirmation.
- Budget navigation enabled and `/budgets` route registered.
- Existing transaction records are read only; deleting a budget does not delete transactions.

## Checks performed in the build workspace
- `node --check` passed for all six changed/new backend JavaScript files.
- Project dependencies were not installed in this isolated workspace; full frontend production build, automated test suite, live MongoDB CRUD, authorization isolation, and browser responsiveness have not been run here.

## Required local acceptance tests
1. Run `npm run dev`; sign in and open `/budgets`.
2. Create a budget for a category that has existing expenses; verify spent and remaining amounts.
3. Add another expense in that category; reload Budgets and verify progress increases.
4. Verify warning at the chosen threshold (default 80%) and exceeded state at 100%.
5. Verify saving the same month/category updates the existing budget instead of creating a duplicate.
6. Verify a second user cannot see or delete the first user's budgets.
7. Verify deleting a budget does not delete transactions.
8. Run `npm run build` and `npm test`.
