import { BaseError } from '@/lib/errors'
import { ValidationError } from '@/modules/common/errors/validation.error'
import { NotFoundError } from '@/modules/common/errors/not-found.error'
import { UnauthorizedError } from '@/modules/common/errors/unauthorized.error'
import { ForbiddenError } from '@/modules/common/errors/forbidden.error'
import { ConflictError } from '@/modules/common/errors/conflict.error'
import { ProblemDetails, ProblemDetailsBuilder } from '@/lib/errors'

/**
 * Options for converting errors to Problem Details
 */
export interface ErrorMapperOptions {
  /**
   * Request path where the error occurred
   */
  instance?: string

  /**
   * Request ID for tracing
   */
  requestId?: string

  /**
   * Include error context in response (only in development)
   */
  includeContext?: boolean

  /**
   * Base URL for type URIs
   * @default "https://api.example.com"
   */
  baseUrl?: string
}

/**
 * ErrorMapper - Converts application errors to RFC 9457 Problem Details
 *
 * Maps application errors (BaseError and subclasses) to standardized
 * Problem Details format. Handles both expected errors and unexpected errors.
 *
 * This mapper is application-specific because it knows about:
 * - ValidationError, NotFoundError, etc (common errors)
 * - How to extract custom fields from each error type
 * - Business context requirements
 *
 * Features:
 * - Automatic type URI generation from error codes
 * - Error-specific extension fields
 * - Safe handling of unexpected errors (no sensitive data leaked)
 * - Development vs production mode (context inclusion)
 *
 * @example
 * ```typescript
 * // In error handler middleware
 * const problemDetails = ErrorMapper.toProblemDetails(error, {
 *   instance: req.originalUrl,
 *   requestId: req.id,
 *   includeContext: config.isDevelopment,
 *   baseUrl: config.apiBaseUrl
 * })
 *
 * res.status(problemDetails.status).json(problemDetails)
 * ```
 */
export class ErrorMapper {
  private static readonly DEFAULT_BASE_URL = 'https://api.example.com'

  /**
   * Convert any error to Problem Details
   */
  static toProblemDetails(error: Error, options: ErrorMapperOptions = {}): ProblemDetails {
    if (error instanceof BaseError) {
      return this.mapBaseError(error, options)
    }

    // Unexpected error - return generic 500
    return this.mapUnexpectedError(error, options)
  }

  /**
   * Map BaseError (and subclasses) to Problem Details
   */
  private static mapBaseError(error: BaseError, options: ErrorMapperOptions): ProblemDetails {
    const builder = new ProblemDetailsBuilder()
      .withType(this.buildTypeUrl(error.errorCode, options.baseUrl))
      .withTitle(this.getTitle(error))
      .withStatus(error.httpStatus)
      .withDetail(error.message)
      .withTimestamp(error.timestamp)

    // Add optional fields
    if (options.instance) {
      builder.withInstance(options.instance)
    }
    if (options.requestId) {
      builder.withRequestId(options.requestId)
    }

    // Add error-specific extensions
    const extensions = this.getErrorExtensions(error, options.includeContext)
    builder.withExtensions(extensions)

    return builder.build()
  }

  /**
   * Map unexpected errors to generic Problem Details
   */
  private static mapUnexpectedError(error: Error, options: ErrorMapperOptions): ProblemDetails {
    const builder = new ProblemDetailsBuilder()
      .withType(this.buildTypeUrl('internal-server-error', options.baseUrl))
      .withTitle('Internal Server Error')
      .withStatus(500)
      .withDetail(
        options.includeContext
          ? error.message
          : 'An unexpected error occurred. Please try again later.'
      )
      .withTimestamp(new Date())

    if (options.instance) {
      builder.withInstance(options.instance)
    }
    if (options.requestId) {
      builder.withRequestId(options.requestId)
    }

    // Include stack trace only in development
    if (options.includeContext && error.stack) {
      builder.withExtension('stack', error.stack)
    }

    return builder.build()
  }

  /**
   * Get error-specific extension fields
   *
   * This method knows about all common error types and extracts
   * their specific fields for the Problem Details extensions.
   */
  private static getErrorExtensions(
    error: BaseError,
    includeContext?: boolean
  ): Record<string, unknown> {
    const extensions: Record<string, unknown> = {}

    // ValidationError extensions
    if (error instanceof ValidationError) {
      extensions.field = error.field
      extensions.reason = error.reason
    }

    // NotFoundError extensions
    if (error instanceof NotFoundError) {
      extensions.entityType = error.entityType
      extensions.entityId = error.entityId
    }

    // UnauthorizedError extensions
    if (error instanceof UnauthorizedError) {
      extensions.reason = error.reason
    }

    // ForbiddenError extensions
    if (error instanceof ForbiddenError) {
      extensions.action = error.action
      extensions.resource = error.resource
      extensions.reason = error.reason
    }

    // ConflictError extensions
    if (error instanceof ConflictError) {
      extensions.entityType = error.entityType
      extensions.conflictField = error.conflictField
      extensions.conflictValue = error.conflictValue
      extensions.reason = error.reason
    }

    // Include context only if requested (development mode)
    if (includeContext && error.context) {
      const context = error.context

      if (context.aggregateType) {
        extensions.aggregateType = context.aggregateType
      }
      if (context.aggregateId) {
        extensions.aggregateId = context.aggregateId
      }
      if (context.operation) {
        extensions.operation = context.operation
      }
      // userId and metadata can contain sensitive info - only in dev
      if (context.userId) {
        extensions.userId = context.userId
      }
      if (context.metadata) {
        extensions.metadata = context.metadata
      }
    }

    return extensions
  }

  /**
   * Get human-readable title for error type
   */
  private static getTitle(error: BaseError): string {
    // Convert ERROR_CODE to Title Case
    return error.errorCode
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  /**
   * Build type URL from error code
   */
  private static buildTypeUrl(errorCode: string, baseUrl?: string): string {
    const base = baseUrl || this.DEFAULT_BASE_URL
    const type = errorCode.toLowerCase().replace(/_/g, '-')
    return `${base}/problems/${type}`
  }
}
