import { DomainError } from '@/lib/errors/domain-error'
import { ErrorContext } from '@/lib/errors/error-context'

/**
 * ConflictError - Domain error for business rule conflicts and duplicates
 *
 * Use this error when:
 * - Unique constraint violation (duplicate email, username, etc)
 * - Concurrent modification conflict (optimistic locking)
 * - Business rule prevents the operation (e.g., can't delete user with active orders)
 *
 * HTTP Status: 409 Conflict
 * Severity: LOW (expected business rule violations)
 *
 * @example
 * ```typescript
 * // Duplicate unique value
 * class UserRepository {
 *   async create(user: User): Promise<Result<User, ConflictError | DatabaseError>> {
 *     const existing = await this.findByEmail(user.email)
 *
 *     if (existing.isSuccess()) {
 *       return Result.fail(
 *         new ConflictError(
 *           'User',
 *           'email',
 *           user.email.value,
 *           'A user with this email already exists',
 *           {
 *             aggregateType: 'User',
 *             operation: 'create',
 *             metadata: {
 *               existingUserId: existing.value.id,
 *               attemptedEmail: user.email.value
 *             }
 *           }
 *         )
 *       )
 *     }
 *
 *     return Result.ok(await this.persist(user))
 *   }
 * }
 *
 * // Optimistic locking
 * class OrderRepository {
 *   async update(order: Order): Promise<Result<Order, ConflictError | DatabaseError>> {
 *     const result = await this.prisma.order.updateMany({
 *       where: {
 *         id: order.id,
 *         version: order.version // Optimistic lock check
 *       },
 *       data: {
 *         status: order.status,
 *         version: { increment: 1 }
 *       }
 *     })
 *
 *     if (result.count === 0) {
 *       return Result.fail(
 *         new ConflictError(
 *           'Order',
 *           'version',
 *           order.version.toString(),
 *           'Order was modified by another process',
 *           {
 *             aggregateType: 'Order',
 *             aggregateId: order.id,
 *             operation: 'update'
 *           }
 *         )
 *       )
 *     }
 *
 *     return Result.ok(order)
 *   }
 * }
 *
 * // Business rule conflict
 * class DeleteUserUseCase {
 *   async execute(userId: string): Promise<Result<void, ConflictError | NotFoundError>> {
 *     const user = await this.userRepository.findById(userId)
 *     if (user.isFailure()) {
 *       return Result.fail(user.error)
 *     }
 *
 *     const hasActiveOrders = await this.orderRepository.countActiveByUserId(userId)
 *
 *     if (hasActiveOrders > 0) {
 *       return Result.fail(
 *         new ConflictError(
 *           'User',
 *           'status',
 *           'active',
 *           'Cannot delete user with active orders',
 *           {
 *             aggregateType: 'User',
 *             aggregateId: userId,
 *             operation: 'delete',
 *             metadata: { activeOrdersCount: hasActiveOrders }
 *           }
 *         )
 *       )
 *     }
 *
 *     await this.userRepository.delete(userId)
 *     return Result.ok()
 *   }
 * }
 * ```
 */
export class ConflictError extends DomainError {
  readonly errorCode = 'CONFLICT'
  readonly httpStatus = 409

  /**
   * The type of entity/aggregate involved in the conflict
   */
  public readonly entityType: string

  /**
   * The field that has the conflict
   */
  public readonly conflictField: string

  /**
   * The value that caused the conflict
   */
  public readonly conflictValue: string

  /**
   * Human-readable reason for the conflict
   */
  public readonly reason: string

  constructor(
    entityType: string,
    conflictField: string,
    conflictValue: string,
    reason: string,
    context?: ErrorContext
  ) {
    super(
      `Conflict in ${entityType}.${conflictField} with value '${conflictValue}': ${reason}`,
      context
    )

    this.entityType = entityType
    this.conflictField = conflictField
    this.conflictValue = conflictValue
    this.reason = reason
  }

  /**
   * Override toJSON to include conflict details
   */
  toJSON() {
    return {
      ...super.toJSON(),
      entityType: this.entityType,
      conflictField: this.conflictField,
      conflictValue: this.conflictValue,
      reason: this.reason
    }
  }
}
