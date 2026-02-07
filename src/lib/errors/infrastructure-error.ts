import { BaseError } from './base-error'
import { ErrorContext, ErrorSeverity } from './error-context'

/**
 * Abstract base class for infrastructure layer errors
 *
 * Infrastructure errors represent technical failures in external systems,
 * databases, file systems, network calls, and other infrastructure concerns.
 * These are typically not the fault of the user or business logic.
 *
 * Characteristics:
 * - Can be operational or non-operational (depends on error type)
 * - Always map to 5xx HTTP status codes (server errors)
 * - High to Critical severity (indicates system issues)
 * - Should trigger alerts and monitoring
 * - May require manual intervention or system restart
 *
 * Examples:
 * - DatabaseError: Connection timeout, query failure
 * - ExternalServiceError: Third-party API failure
 * - FileSystemError: Cannot read/write file
 * - ConfigurationError: Missing or invalid configuration
 * - NetworkError: Connection refused, timeout
 *
 * Usage in Infrastructure Layer:
 * ```typescript
 * // In Repository Implementation
 * async findById(id: string): Promise<Result<User, DatabaseError | NotFoundError>> {
 *   try {
 *     const user = await this.db.users.findUnique({ where: { id } })
 *     if (!user) {
 *       return Result.fail(new NotFoundError('User', id))
 *     }
 *     return Result.ok(UserMapper.toDomain(user))
 *   } catch (error) {
 *     return Result.fail(
 *       new DatabaseError('Failed to query user', {
 *         operation: 'findById',
 *         aggregateType: 'User',
 *         aggregateId: id,
 *         metadata: { originalError: error }
 *       })
 *     )
 *   }
 * }
 * ```
 */
export abstract class InfrastructureError extends BaseError {
  /**
   * Infrastructure errors always map to 500 (Internal Server Error)
   * Indicates a server-side problem, not a client error
   *
   * Subclasses can override this for specific cases:
   * - ServiceUnavailableError: 503 (Service Unavailable)
   * - GatewayTimeoutError: 504 (Gateway Timeout)
   */
  readonly httpStatus: number = 500

  /**
   * Infrastructure errors are typically HIGH severity
   * They indicate system-level problems that may affect multiple requests
   *
   * Some errors may be CRITICAL:
   * - Database connection pool exhausted
   * - Disk space full
   * - Critical service unavailable
   */
  readonly severity: ErrorSeverity = ErrorSeverity.HIGH

  /**
   * Infrastructure errors can be:
   * - Operational (true): Expected failures like network timeouts
   * - Non-operational (false): Bugs like null reference errors
   *
   * Default is false (programmer error) for safety.
   * Subclasses should explicitly set to true if error is expected.
   */
  readonly isOperational: boolean = false

  constructor(message: string, context?: ErrorContext, isOperational = false) {
    super(message, context, isOperational)
  }
}
