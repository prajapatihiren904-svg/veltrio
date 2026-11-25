export const APP_NAME = import.meta.env.VITE_APP_NAME || 'VELTRIO';
export const APP_TAGLINE = 'Your Money. Your Clarity.';

// Dev: the Vite proxy forwards /api to the backend. Production: set VITE_API_URL.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');

export const DEFAULT_CURRENCY = 'INR';
export const TOKEN_STORAGE_KEY = 'veltrio.token';

// True only in `vite dev`. Developer-only routes and nav items are removed from production builds.
export const IS_DEV = import.meta.env.DEV;
