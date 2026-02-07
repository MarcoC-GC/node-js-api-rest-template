import { ApplicationError } from '@/lib/errors/application-error'
import { ErrorContext } from '@/lib/errors/error-context'

/**
 * UnauthorizedError - Application error for authentication failures
 *
 * Use this error when:
 * - User is not authenticated
 * - Token is missing, invalid, or expired
 * - Credentials are incorrect
 *
 * HTTP Status: 401 Unauthorized
 * Severity: MEDIUM (security-related but expected)
 *
 * @example
 * ```typescript
 * // In Authentication Service
 * class AuthService {
 *   async validateToken(token: string): Promise<Result<User, UnauthorizedError>> {
 *     if (!token) {
 *       return Result.fail(
 *         new UnauthorizedError('Token missing', {
 *           operation: 'validateToken'
 *         })
 *       )
 *     }
 *
 *     const decoded = await this.jwtService.verify(token)
 *
 *     if (!decoded) {
 *       return Result.fail(
 *         new UnauthorizedError('Invalid or expired token', {
 *           operation: 'validateToken',
 *           metadata: { tokenPrefix: token.substring(0, 10) }
 *         })
 *       )
 *     }
 *
 *     return Result.ok(decoded)
 *   }
 * }
 *
 * // In Login Use Case
 * class LoginUseCase {
 *   async execute(email: string, password: string): Promise<Result<TokenDTO, UnauthorizedError>> {
 *     const user = await this.userRepository.findByEmail(email)
 *
 *     if (!user || !await this.passwordService.compare(password, user.passwordHash)) {
 *       return Result.fail(
 *         new UnauthorizedError('Invalid credentials', {
 *           operation: 'login',
 *           metadata: { email }
 *         })
 *       )
 *     }
 *
 *     const token = await this.jwtService.sign({ userId: user.id })
 *     return Result.ok({ token })
 *   }
 * }
 * ```
 */
export class UnauthorizedError extends ApplicationError {
  readonly errorCode = 'UNAUTHORIZED'
  readonly httpStatus = 401

  /**
   * Human-readable reason for authentication failure
   */
  public readonly reason: string

  constructor(reason: string, context?: ErrorContext) {
    super(`Authentication failed: ${reason}`, context)

    this.reason = reason
  }

  /**
   * Override toJSON to include reason
   */
  toJSON() {
    return {
      ...super.toJSON(),
      reason: this.reason
    }
  }
}
