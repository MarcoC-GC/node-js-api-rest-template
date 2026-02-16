/**
 * Common Errors Module
 *
 * Reusable error classes that apply across all modules.
 * These errors represent common failure scenarios in any application:
 *
 * - ValidationError: Input validation failures (400)
 * - NotFoundError: Entity not found (404)
 * - UnauthorizedError: Authentication failures (401)
 * - ForbiddenError: Authorization failures (403)
 * - ConflictError: Duplicates and business rule conflicts (409)
 *
 * Usage:
 * Import these errors in your domain, application, or infrastructure layers
 * when you need standard error handling.
 *
 * @example
 * ```typescript
 * import { ValidationError, NotFoundError } from '@/modules/common/errors'
 *
 * // In a repository
 * if (!user) {
 *   return Result.fail(new NotFoundError('User', userId))
 * }
 *
 * // In a value object
 * if (!isValid) {
 *   return Result.fail(new ValidationError('email', 'Invalid format'))
 * }
 * ```
 */

export { ValidationError } from './domain/validation.error'
export { NotFoundError } from './not-found.error'
export { UnauthorizedError } from './unauthorized.error'
export { ForbiddenError } from './forbidden.error'
export { ConflictError } from './conflict.error'
