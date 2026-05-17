 /**
  * Base class for all application-thrown errors. Carries:
  *   - statusCode: HTTP status the error handler will emit
  *   - code: stable string for client-side switching (e.g. "VALIDATION_ERROR")
  *   - details: optional structured payload (e.g. Zod field errors)
  *   - isOperational: true for expected/handled errors, false for bugs / programmer
  *     errors. Non-operational errors trigger fatal-level logging.
  */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details: unknown = null,
    isOperational = true,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: unknown = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details: unknown = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity', details: unknown = null) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', details: unknown = null) {
    super(message, 500, 'INTERNAL_ERROR', details, false);
  }
}