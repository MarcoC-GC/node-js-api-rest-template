import { DomainError } from '@/lib/errors/domain-error'
import { ErrorContext } from '@/lib/errors/error-context'

/**
 * NotFoundError - Domain error when an aggregate/entity cannot be found
 *
 * Use this error when:
 * - Repository cannot find an entity by ID
 * - Aggregate root doesn't exist
 * - Required related entity is missing
 *
 * HTTP Status: 404 Not Found
 * Severity: LOW (expected user navigation errors)
 *
 * @example
 * ```typescript
 * // In Repository
 * class UserRepository {
 *   async findById(id: string): Promise<Result<User, NotFoundError | DatabaseError>> {
 *     const user = await this.prisma.user.findUnique({ where: { id } })
 *
 *     if (!user) {
 *       return Result.fail(
 *         new NotFoundError('User', id, {
 *           aggregateType: 'User',
 *           aggregateId: id,
 *           operation: 'findById'
 *         })
 *       )
 *     }
 *
 *     return Result.ok(this.toDomain(user))
 *   }
 * }
 *
 * // In Use Case
 * class GetUserByIdUseCase {
 *   async execute(userId: string): Promise<Result<UserDTO, NotFoundError>> {
 *     const userResult = await this.userRepository.findById(userId)
 *
 *     if (userResult.isFailure()) {
 *       return Result.fail(userResult.error)
 *     }
 *
 *     return Result.ok(this.toDTO(userResult.value))
 *   }
 * }
 * ```
 */
export class NotFoundError extends DomainError {
  readonly errorCode = 'NOT_FOUND'
  readonly httpStatus = 404

  /**
   * The type of entity/aggregate that was not found
   */
  public readonly entityType: string

  /**
   * The identifier that was used for the lookup
   */
  public readonly entityId: string

  constructor(entityType: string, entityId: string, context?: ErrorContext) {
    super(`${entityType} with id '${entityId}' not found`, context)

    this.entityType = entityType
    this.entityId = entityId
  }

  /**
   * Override toJSON to include entity details
   */
  toJSON() {
    return {
      ...super.toJSON(),
      entityType: this.entityType,
      entityId: this.entityId
    }
  }
}
