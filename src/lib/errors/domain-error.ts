import { BaseError } from './base-error'
import { ErrorContext, ErrorSeverity } from './error-context'

/**
 * Abstract base class for domain layer errors
 *
 * Domain errors represent violations of business rules and invariants.
 * These are expected errors that occur during normal business operations.
 *
 * Characteristics:
 * - Always operational (not programmer errors)
 * - Usually map to 4xx HTTP status codes
 * - Low to Medium severity (expected behavior)
 * - Should be returned as Result.fail() in domain layer
 *
 * Examples:
 * - ValidationError: Email format is invalid
 * - BusinessRuleViolationError: Cannot delete user with active sessions
 * - EntityNotFoundError: User with ID 123 does not exist
 * - DuplicateEntityError: Email already registered
 *
 * Usage in Domain Layer:
 * ```typescript
 * // In Value Object
 * static create(email: string): Result<Email, ValidationError> {
 *   if (!isValid(email)) {
 *     return Result.fail(new ValidationError('email', 'Invalid format'))
 *   }
 *   return Result.ok(new Email(email))
 * }
 *
 * // In Entity
 * deactivate(): Result<void, BusinessRuleViolationError> {
 *   if (this.hasActiveSessions()) {
 *     return Result.fail(new BusinessRuleViolationError('Cannot deactivate user with active sessions'))
 *   }
 *   this.status = 'inactive'
 *   return Result.ok()
 * }
 * ```
 */
export abstract class DomainError extends BaseError {
  /**
   * Default HTTP status for domain errors is 422 (Unprocessable Entity)
   * Indicates the request was well-formed but contains semantic errors
   *
   * Subclasses can override this:
   * - ValidationError: 400 (Bad Request)
   * - EntityNotFoundError: 404 (Not Found)
   * - DuplicateEntityError: 409 (Conflict)
   */
  readonly httpStatus: number = 422

  /**
   * Domain errors are typically LOW severity
   * They represent expected business rule violations
   */
  readonly severity: ErrorSeverity = ErrorSeverity.LOW

  /**
   * Domain errors are always operational (not bugs)
   */
  readonly isOperational: boolean = true

  constructor(message: string, context?: ErrorContext) {
    super(message, context, true)
  }
}
