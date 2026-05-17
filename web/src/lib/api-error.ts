 // Thrown by api-client for non-2xx responses or validation failures.
 // UI can safely switch on `code` and use `statusCode` for HTTP logic.

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly requestId?: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: unknown = null,
    requestId?: string,
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.requestId = requestId;

    // ⚠️ Important for proper stack traces in modern TS builds
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const isApiError = (err: unknown): err is ApiError =>
  err instanceof ApiError;

/* ─────────────────────────────────────────────────────────────
   SAFE MESSAGE EXTRACTION
───────────────────────────────────────────────────────────── */

export const errorMessage = (err: unknown): string => {
  if (isApiError(err)) {
    return err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'An unexpected error occurred';
};
