import axios from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/constants/app';
import { storage } from '@/utils/storage';

/** Normalized error every service call rejects with (except cancellations). */
export class ApiRequestError extends Error {
  constructor(message, { status = null, errors = null, isNetworkError = false, isTimeout = false } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
  }
}

let unauthorizedHandler = null;

/**
 * Lets the auth layer (Phase 2) react to expired sessions: when a request that carried a token
 * receives 401, the registered handler runs (clear session, redirect to login).
 * Returns an unregister function.
 */
export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

export const isRequestCanceled = (error) => axios.isCancel(error);

function toApiRequestError(error) {
  if (error.code === 'ECONNABORTED') {
    return new ApiRequestError('The request timed out. Please try again.', { isTimeout: true });
  }
  if (!error.response) {
    return new ApiRequestError('Cannot reach the server. Check your connection and try again.', {
      isNetworkError: true,
    });
  }
  const { status, data } = error.response;
  return new ApiRequestError(data?.message || 'Something went wrong. Please try again.', {
    status,
    errors: data?.errors || null,
  });
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const normalized = toApiRequestError(error);
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (normalized.status === 401 && hadToken && unauthorizedHandler) unauthorizedHandler();
    return Promise.reject(normalized);
  }
);

export default apiClient;
