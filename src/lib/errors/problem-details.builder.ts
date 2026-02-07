import { ProblemDetails } from './problem-details'

/**
 * ProblemDetailsBuilder - Fluent builder for creating Problem Details
 *
 * Provides a clean, type-safe API for constructing RFC 9457 Problem Details.
 * Validates required fields on build().
 *
 * @example
 * ```typescript
 * const problem = new ProblemDetailsBuilder()
 *   .withType('/problems/not-found')
 *   .withTitle('Resource Not Found')
 *   .withStatus(404)
 *   .withDetail('User with id "123" not found')
 *   .withInstance('/api/v1/users/123')
 *   .withRequestId('abc-123')
 *   .withTimestamp(new Date())
 *   .withExtension('entityType', 'User')
 *   .withExtension('entityId', '123')
 *   .build()
 * ```
 */
export class ProblemDetailsBuilder {
  private type?: string
  private title?: string
  private status?: number
  private detail?: string
  private instance?: string
  private requestId?: string
  private timestamp?: string
  private extensions: Record<string, unknown> = {}

  /**
   * Set the problem type URI
   */
  withType(type: string): this {
    this.type = type
    return this
  }

  /**
   * Set the problem title
   */
  withTitle(title: string): this {
    this.title = title
    return this
  }

  /**
   * Set the HTTP status code
   */
  withStatus(status: number): this {
    this.status = status
    return this
  }

  /**
   * Set the detailed explanation
   */
  withDetail(detail: string): this {
    this.detail = detail
    return this
  }

  /**
   * Set the instance URI (usually request path)
   */
  withInstance(instance: string): this {
    this.instance = instance
    return this
  }

  /**
   * Set the request ID for tracing
   */
  withRequestId(requestId: string): this {
    this.requestId = requestId
    return this
  }

  /**
   * Set the timestamp (will be converted to ISO 8601 string)
   */
  withTimestamp(timestamp: Date): this {
    this.timestamp = timestamp.toISOString()
    return this
  }

  /**
   * Add a custom extension field
   */
  withExtension(key: string, value: unknown): this {
    this.extensions[key] = value
    return this
  }

  /**
   * Add multiple extension fields at once
   */
  withExtensions(extensions: Record<string, unknown>): this {
    Object.assign(this.extensions, extensions)
    return this
  }

  /**
   * Build the ProblemDetails object
   *
   * @throws Error if required fields are missing
   */
  build(): ProblemDetails {
    // Validate required fields
    if (!this.type) {
      throw new Error('ProblemDetailsBuilder: type is required')
    }
    if (!this.title) {
      throw new Error('ProblemDetailsBuilder: title is required')
    }
    if (this.status === undefined) {
      throw new Error('ProblemDetailsBuilder: status is required')
    }
    if (!this.detail) {
      throw new Error('ProblemDetailsBuilder: detail is required')
    }

    // Build the object
    const problemDetails: ProblemDetails = {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      ...this.extensions
    }

    // Add optional fields if present
    if (this.instance) {
      problemDetails.instance = this.instance
    }
    if (this.requestId) {
      problemDetails.requestId = this.requestId
    }
    if (this.timestamp) {
      problemDetails.timestamp = this.timestamp
    }

    return problemDetails
  }
}
