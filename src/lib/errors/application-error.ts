import { BaseError } from './base-error'
import { ErrorContext, ErrorSeverity } from './error-context'

/**
 * Abstract base class for application layer errors
 *
 * Application errors occur in use cases and application services.
 * They represent failures in orchestrating domain logic and coordinating
 * between different parts of the system.
 *
 * Characteristics:
 * - Always operational (expected errors in use case execution)
 * - Usually map to 4xx HTTP status codes
 * - Medium severity (important but expected)
 * - Should be returned as Result.fail() from use cases
 *
 * Examples:
 * - UseCaseError: Generic use case execution failure
 * - AuthorizationError: User lacks required permissions
 * - ConcurrencyError: Optimistic locking conflict
 * - ResourceExhaustedError: Rate limit exceeded
 *
 * Usage in Application Layer:
 * ```typescript
 * // In Use Case
 * async execute(dto: CreateUserDTO): Promise<Result<User, ApplicationError | DomainError>> {
 *   // Check authorization
 *   if (!this.authService.hasPermission(currentUser, 'CREATE_USER')) {
 *     return Result.fail(
 *       new AuthorizationError('User lacks CREATE_USER permission', {
 *         userId: currentUser.id,
 *         operation: 'CreateUser',
 *         requiredPermission: 'CREATE_USER'
 *       })
 *     )
 *   }
 *
 *   // Orchestrate domain logic
 *   const userResult = await this.userService.createUser(dto)
 *   if (userResult.isFail()) {
 *     return Result.fail(userResult.getError())
 *   }
 *
 *   return Result.ok(userResult.getValue())
 * }
 * ```
 */
export abstract class ApplicationError extends BaseError {
  /**
   * Default HTTP status for application errors is 400 (Bad Request)
   * Indicates the request cannot be processed due to client error
   *
   * Subclasses can override this:
   * - AuthorizationError: 403 (Forbidden)
   * - AuthenticationError: 401 (Unauthorized)
   * - ResourceExhaustedError: 429 (Too Many Requests)
   */
  readonly httpStatus: number = 400

  /**
   * Application errors are typically MEDIUM severity
   * They are expected but indicate important failures in use case execution
   */
  readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM

  /**
   * Application errors are always operational (not bugs)
   */
  readonly isOperational: boolean = true

  constructor(message: string, context?: ErrorContext) {
    super(message, context, true)
  }
}
