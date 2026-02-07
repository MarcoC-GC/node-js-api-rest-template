import { ApplicationError } from '@/lib/errors/application-error'
import { ErrorContext } from '@/lib/errors/error-context'

/**
 * ForbiddenError - Application error for authorization failures
 *
 * Use this error when:
 * - User is authenticated but lacks permissions
 * - Resource access is restricted
 * - Action is not allowed for the user's role
 *
 * HTTP Status: 403 Forbidden
 * Severity: MEDIUM (security-related but expected)
 *
 * @example
 * ```typescript
 * // In Authorization Service
 * class AuthorizationService {
 *   canDeleteUser(currentUser: User, targetUserId: string): Result<void, ForbiddenError> {
 *     if (!currentUser.isAdmin() && currentUser.id !== targetUserId) {
 *       return Result.fail(
 *         new ForbiddenError(
 *           'delete',
 *           'User',
 *           'Only admins can delete other users',
 *           {
 *             userId: currentUser.id,
 *             aggregateType: 'User',
 *             aggregateId: targetUserId,
 *             operation: 'deleteUser',
 *             metadata: {
 *               currentUserRole: currentUser.role,
 *               requiredRole: 'ADMIN'
 *             }
 *           }
 *         )
 *       )
 *     }
 *
 *     return Result.ok()
 *   }
 * }
 *
 * // In Use Case
 * class DeleteUserUseCase {
 *   async execute(
 *     currentUserId: string,
 *     targetUserId: string
 *   ): Promise<Result<void, ForbiddenError | NotFoundError>> {
 *     const currentUser = await this.userRepository.findById(currentUserId)
 *     if (currentUser.isFailure()) {
 *       return Result.fail(currentUser.error)
 *     }
 *
 *     const authResult = this.authService.canDeleteUser(
 *       currentUser.value,
 *       targetUserId
 *     )
 *
 *     if (authResult.isFailure()) {
 *       return Result.fail(authResult.error)
 *     }
 *
 *     await this.userRepository.delete(targetUserId)
 *     return Result.ok()
 *   }
 * }
 * ```
 */
export class ForbiddenError extends ApplicationError {
  readonly errorCode = 'FORBIDDEN'
  readonly httpStatus = 403

  /**
   * The action that was attempted
   */
  public readonly action: string

  /**
   * The resource type being accessed
   */
  public readonly resource: string

  /**
   * Human-readable reason for authorization failure
   */
  public readonly reason: string

  constructor(action: string, resource: string, reason: string, context?: ErrorContext) {
    super(`Access denied: cannot ${action} ${resource}. Reason: ${reason}`, context)

    this.action = action
    this.resource = resource
    this.reason = reason
  }

  /**
   * Override toJSON to include action, resource, and reason
   */
  toJSON() {
    return {
      ...super.toJSON(),
      action: this.action,
      resource: this.resource,
      reason: this.reason
    }
  }
}
