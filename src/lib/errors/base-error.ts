import { ErrorContext, ErrorJSON, ErrorSeverity } from './error-context'

/**
 * Abstract base class for all application errors
 *
 * Provides a consistent structure for error handling across all layers:
 * - Domain Layer: Business rule violations
 * - Application Layer: Use case errors
 * - Infrastructure Layer: Technical failures
 *
 * Features:
 * - Captures stack traces for debugging
 * - Stores contextual information (requestId, userId, etc)
 * - Distinguishes operational errors from programmer errors
 * - Provides serialization for logging and monitoring
 * - Maps to HTTP status codes and RFC 9457 Problem Details
 */
export abstract class BaseError extends Error {
  /**
   * Unique error code for this error type
   * Example: 'USER_NOT_FOUND', 'INVALID_EMAIL', 'DATABASE_CONNECTION_FAILED'
   */
  abstract readonly errorCode: string

  /**
   * HTTP status code to return when this error reaches the HTTP layer
   * Example: 400, 404, 422, 500
   */
  abstract readonly httpStatus: number

  /**
   * Severity level for monitoring and alerting
   */
  abstract readonly severity: ErrorSeverity

  /**
   * Timestamp when the error occurred
   */
  public readonly timestamp: Date

  /**
   * Additional context for debugging and monitoring
   */
  public readonly context?: ErrorContext

  /**
   * Indicates if this error is operational (expected) or a programmer error
   *
   * - true: Operational errors are expected (validation, not found, etc)
   * - false: Programmer errors indicate bugs (null reference, etc)
   *
   * Operational errors should be logged but not cause alerts.
   * Programmer errors should trigger alerts for immediate investigation.
   */
  public readonly isOperational: boolean

  constructor(message: string, context?: ErrorContext, isOperational = true) {
    super(message)

    // Ensure the name is set to the concrete class name
    this.name = this.constructor.name

    // Store metadata
    this.timestamp = new Date()
    this.context = context
    this.isOperational = isOperational

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)

    // Captures stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Serializes the error to JSON for logging and monitoring
   * Includes all relevant information for debugging
   */
  toJSON(): ErrorJSON {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      httpStatus: this.httpStatus,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      context: this.context,
      isOperational: this.isOperational
    }
  }

  /**
   * Returns a string representation of the error
   * Useful for console logging and debugging
   */
  toString(): string {
    const contextStr = this.context ? ` | Context: ${JSON.stringify(this.context, null, 2)}` : ''
    return `[${this.errorCode}] ${this.name}: ${this.message}${contextStr}`
  }
}
