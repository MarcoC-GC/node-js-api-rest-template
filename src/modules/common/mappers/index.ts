/**
 * Common Mappers Module
 *
 * Application-specific mappers that convert between different representations.
 * These mappers know about the application's domain and common errors.
 *
 * @example
 * ```typescript
 * import { ErrorMapper } from '@/modules/common/mappers'
 *
 * const problemDetails = ErrorMapper.toProblemDetails(error, options)
 * ```
 */

export { ErrorMapper, type ErrorMapperOptions } from './error-mapper'
