# VELTRIO: Phase 2 Authentication and Roles — Implementation Report

## Implemented in this delivery

### Backend
- `User` model with unique normalized email, bcrypt password hashing, `role` (`user`/`admin`), `status` (`active`/`suspended`), INR currency default, and last-login timestamp.
- Registration and login endpoints issue signed JWTs. Password hashes are excluded from ordinary queries and JSON responses.
- `GET /api/v1/auth/me` verifies the bearer token, reloads the current user from MongoDB, and rejects deleted or suspended accounts.
- `POST /api/v1/auth/logout` acknowledges logout; JWT is stateless, so the browser removes its token. A token already copied elsewhere remains valid until expiry.
- Forgot-password returns the same response for known and unknown email addresses. Reset tokens are random, only SHA-256 hashes are stored, expiry is 15 minutes, and atomic consumption makes each token single-use.
- `PasswordResetToken` has a MongoDB TTL index on `expiresAt` with native `expireAfterSeconds: 0`. The TTL index is on the reset-token collection, never on User documents.
- `authenticate`, `authorize`, express-validator request rules, centralized validation errors, and stricter auth rate limiting.
- SMTP is optional for local development. With SMTP unset, the reset URL is written to the backend terminal. To send real email, configure `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` together.

### Frontend
- `AuthProvider` / `useAuth`, auth API service, and persisted bearer token using the existing safe storage helper.
- Startup session restoration through `/auth/me`; expired or invalid tokens clear the local session and redirect to sign-in.
- Guest-only, authenticated, and admin-only route guards.
- Responsive Login, Register, Forgot Password, and Reset Password screens using the existing VELTRIO design tokens and shared controls.
- `/dashboard` and `/admin` currently show a small authenticated-session placeholder. The actual dashboard and admin console belong to later roadmap phases.

## Automated checks executed in the build workspace

- Backend JavaScript syntax check: 29 files passed `node --check`.
- Backend Node test runner: 27 passed, 0 failed, 1 skipped.
- The skipped suite is the HTTP integration suite because this build workspace does not contain installed npm dependencies. It now includes Phase 2 checks for unauthenticated `/auth/me`, registration validation before database access, and forgot-password email validation before database access.
- Frontend Vite build and browser verification were not run in this build workspace because frontend dependencies are not installed here.

These results are not a substitute for installing dependencies and running the checks on the user's machine.

## Required local setup after merging this ZIP

From the project root, run:

```cmd
npm --prefix backend install
```

This installs the four Phase 2 backend packages and reconciles `backend/package-lock.json` with the updated `backend/package.json`. The existing frontend dependencies do not change.

Then run:

```cmd
npm test
npm run build
```

Start the app with:

```cmd
npm run dev
```

Open `http://localhost:5173`.

## Manual acceptance checklist — complete before Phase 3

1. Register a new user with name, email, and password of at least 8 characters.
2. Confirm the new user is redirected to `/dashboard`.
3. Sign out and sign in again with the same credentials.
4. Try an incorrect password; the API must reject it without revealing whether the email exists.
5. Open `/dashboard` in a signed-out browser; it must redirect to `/login`.
6. While signed in, refresh the page; the session should restore from `/auth/me`.
7. Sign out, then confirm the protected route redirects again.
8. Request a password reset. With SMTP unset, copy the reset link from the backend terminal.
9. Open the reset link and set a new password. The old password must fail and the new password must work.
10. Reuse the same reset link; it must fail. Wait 15 minutes and verify an expired link fails.
11. Confirm a normal registration request cannot create an admin by including `"role":"admin"` in its JSON body.
12. Test the responsive auth screens at mobile and desktop widths.

## Known limitations / security notes

- Logout is client-side token removal; server-side JWT revocation/refresh-token rotation is not implemented. The JWT remains usable until its configured expiry if copied before logout.
- Access tokens are stored in localStorage to match the existing Phase 1 API client. This is convenient but increases exposure if the site ever has an XSS vulnerability; production hardening should consider secure, HttpOnly, SameSite cookies and CSRF controls.
- No email delivery can be confirmed until real SMTP credentials are configured. Never commit SMTP credentials, MongoDB URI, or JWT secret.
- Admin seed tooling and admin management endpoints belong to Phase 9. For this phase, admin-only frontend route protection and backend `authorize('admin')` middleware are ready for future protected admin routes.
- A MongoDB TTL monitor deletes expired reset-token documents asynchronously; the API independently checks `expiresAt`, so an expired token is rejected even before TTL cleanup runs.
