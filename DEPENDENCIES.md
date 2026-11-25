# VELTRIO: Dependencies (Phase 1)

Only packages that Phase 1 actually uses are installed. Later phases add their own (listed at the bottom).
Versions are semver ranges; `npm install` resolves them and creates `package-lock.json`, which you should commit.

## Runtime requirement

Node.js **20.6 or newer** (22 LTS recommended). The backend uses Node's built-in `--env-file` and `--watch`, so `dotenv` and `nodemon` are not needed.

## Root (`package.json`)

| Package | Range | Purpose |
|---|---|---|
| concurrently (dev) | ^9.1.0 | Runs backend and frontend together with `npm run dev` |

## Backend (`backend/package.json`)

| Package | Range | Purpose |
|---|---|---|
| express | ^4.21.2 | HTTP server and routing (v4 line, mature middleware ecosystem) |
| mongoose | ^8.9.0 | MongoDB Atlas connection and schemas |
| cors | ^2.8.5 | Cross-origin policy limited to `CLIENT_URL` |
| helmet | ^8.0.0 | Secure HTTP headers |
| express-rate-limit | ^7.5.0 | Request rate limiting |
| morgan | ^1.10.0 | HTTP request logging |

## Frontend (`frontend/package.json`)

| Package | Range | Purpose |
|---|---|---|
| react, react-dom | ^18.3.1 | UI library |
| react-router-dom | ^6.28.0 | Routing |
| axios | ^1.7.9 | HTTP client behind `services/apiClient.js` |
| framer-motion | ^11.15.0 | Page transitions, modal and drawer animation |
| lucide-react | ^0.468.0 | Icons |
| react-hot-toast | ^2.4.1 | Toast notifications |
| vite (dev) | ^6.0.7 | Dev server and build tool |
| @vitejs/plugin-react (dev) | ^4.3.4 | React support for Vite |
| tailwindcss (dev) | ^3.4.17 | Utility CSS, wired to the design tokens |
| postcss, autoprefixer (dev) | ^8.4.49, ^10.4.20 | CSS processing |

## Added in later phases

| Phase | Packages |
|---|---|
| 2 Authentication | backend: `jsonwebtoken`, `bcryptjs`, `express-validator`, `nodemailer` |
| 4 Dashboard | frontend: `recharts` |
