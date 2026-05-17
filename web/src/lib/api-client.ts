import { ZodError, type ZodType } from 'zod';

import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';
import { tokenPairSchema } from '@/features/auth/schemas';
import type { ApiErrorResponse } from '@/types/api';

import { ApiError } from './api-error';
import { authStorage } from './auth-storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

export interface RequestConfig<T> {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;

  // Response validation (always required)
  schema: ZodType<T>;

  // Skip auth for public endpoints (login/register/refresh)
  skipAuth?: boolean;
}

/* ─────────────────────────────────────────────────────────────
   URL BUILDER
───────────────────────────────────────────────────────────── */

const buildUrl = (
  path: string,
  query: Record<string, QueryValue> | undefined,
): string => {
  const base = env.VITE_API_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  let url = `${base}${cleanPath}`;

  if (query !== undefined) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.set(key, String(value));
    }

    const qs = params.toString();
    if (qs.length > 0) url += `?${qs}`;
  }

  return url;
};

/* ─────────────────────────────────────────────────────────────
   REFRESH TOKEN (DEDUPED)
───────────────────────────────────────────────────────────── */

let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  const url = buildUrl('/auth/refresh', undefined);

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return null;
  }

  const result = tokenPairSchema.safeParse(payload);
  if (!result.success) return null;

  authStorage.setRefreshToken(result.data.refreshToken);
  useAuthStore
    .getState()
    .setSession(result.data.user, result.data.accessToken);

  return result.data.accessToken;
};

export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = performRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

/* ─────────────────────────────────────────────────────────────
   ERROR PARSING
───────────────────────────────────────────────────────────── */

const parseErrorResponse = async (
  response: Response,
): Promise<ApiError> => {
  let payload: ApiErrorResponse | null = null;

  try {
    payload = (await response.json()) as ApiErrorResponse;
  } catch {
    // ignore non-json responses
  }

  return new ApiError(
    response.status,
    payload?.error.code ?? 'UNKNOWN_ERROR',
    payload?.error.message ?? response.statusText,
    payload?.error.details ?? null,
    payload?.error.requestId,
  );
};

/* ─────────────────────────────────────────────────────────────
   CORE REQUEST EXECUTION
───────────────────────────────────────────────────────────── */

interface InternalConfig<T> extends RequestConfig<T> {
  _retried?: boolean;
}

const executeRequest = async <T>(
  config: InternalConfig<T>,
): Promise<T> => {
  const url = buildUrl(config.path, config.query);
  const method = config.method ?? 'GET';

  const headers: Record<string, string> = { ...config.headers };

  if (config.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (!config.skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      ...(config.signal ? { signal: config.signal } : {}),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;

    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
  }

  /* ─── 401 HANDLING (AUTO REFRESH) ───────────────────────── */

  if (
    response.status === 401 &&
    !config.skipAuth &&
    !config._retried
  ) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      return executeRequest({ ...config, _retried: true });
    }

    authStorage.clearRefreshToken();
    useAuthStore.getState().clearSession();

    throw await parseErrorResponse(response);
  }

  /* ─── NON-OK RESPONSE ───────────────────────────────────── */

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  /* ─── NO CONTENT ────────────────────────────────────────── */

  if (response.status === 204) {
    return config.schema.parse(undefined) as T;
  }

  /* ─── JSON PARSE ────────────────────────────────────────── */

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Response was not valid JSON',
    );
  }

  /* ─── ZOD VALIDATION ────────────────────────────────────── */

  try {
    return config.schema.parse(payload);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ApiError(
        response.status,
        'RESPONSE_SHAPE_MISMATCH',
        'Response did not match expected schema',
        err.flatten(),
      );
    }
    throw err;
  }
};

/* ─────────────────────────────────────────────────────────────
   PUBLIC API
───────────────────────────────────────────────────────────── */

export const apiClient = <T>(
  config: RequestConfig<T>,
): Promise<T> => {
  return executeRequest(config);
};