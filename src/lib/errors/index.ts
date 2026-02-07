/**
 * Error handling system for Hexagonal Architecture + DDD
 *
 * This module provides a complete error hierarchy aligned with clean architecture layers:
 * - BaseError: Abstract foundation for all errors
 * - DomainError: Business rule violations (4xx, low severity)
 * - ApplicationError: Use case failures (4xx, medium severity)
 * - InfrastructureError: Technical failures (5xx, high severity)
 *
 * Features:
 * - Rich context for debugging (requestId, userId, aggregateId, etc)
 * - HTTP status code mapping
 * - Severity levels for monitoring and alerting
 * - Operational vs programmer error distinction
 * - JSON serialization for logging
 * - RFC 9457 Problem Details support (via error mapper)
 *
 * @example
 * ```typescript
 * import { ValidationError, NotFoundError } from '@/lib/errors'
 *
 * // In Value Object
 * if (!isValidEmail(email)) {
 *   return Result.fail(
 *     new ValidationError('email', 'Invalid format', {
 *       aggregateType: 'User',
 *       metadata: { providedValue: email }
 *     })
 *   )
 * }
 *
 * // In Repository
 * if (!user) {
 *   return Result.fail(
 *     new NotFoundError('User', userId, {
 *       operation: 'findById',
 *       requestId: req.id
 *     })
 *   )
 * }
 * ```
 */

// Base classes
export * from './base-error'
export * from './domain-error'
export * from './application-error'
export * from './infrastructure-error'

// Context and types
export * from './error-context'

// RFC 9457 Problem Details (framework-agnostic)
export * from './problem-details'
export * from './problem-details.builder'
