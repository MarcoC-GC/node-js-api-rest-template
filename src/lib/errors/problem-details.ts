/**
 * ProblemDetails - RFC 9457 Problem Details for HTTP APIs
 *
 * Standard format for representing errors in HTTP APIs.
 * Provides machine-readable error information with human-readable messages.
 *
 * Standard Fields (RFC 9457):
 * - type: URI identifying the problem type
 * - title: Short, human-readable summary
 * - status: HTTP status code
 * - detail: Specific explanation for this occurrence
 * - instance: URI reference identifying this specific occurrence
 *
 * Extension Fields (custom):
 * - requestId: For request tracing
 * - timestamp: When the error occurred
 * - [key: string]: Any additional context
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 *
 * @example
 * ```json
 * {
 *   "type": "https://api.example.com/problems/validation-error",
 *   "title": "Validation Failed",
 *   "status": 400,
 *   "detail": "Validation failed for 'email': Invalid email format",
 *   "instance": "/api/v1/users",
 *   "requestId": "abc-123-def",
 *   "timestamp": "2024-02-07T10:30:00.000Z",
 *   "field": "email",
 *   "reason": "Invalid email format"
 * }
 * ```
 */
export interface ProblemDetails {
  /**
   * URI identifying the problem type
   * Should be a URL that provides human-readable documentation
   */
  type: string

  /**
   * Short, human-readable summary of the problem type
   * Should not change between occurrences
   */
  title: string

  /**
   * HTTP status code for this occurrence
   */
  status: number

  /**
   * Human-readable explanation specific to this occurrence
   */
  detail: string

  /**
   * URI reference identifying the specific occurrence
   * Usually the request path that caused the error
   */
  instance?: string

  /**
   * Unique request identifier for tracing
   */
  requestId?: string

  /**
   * ISO 8601 timestamp when the error occurred
   */
  timestamp?: string

  /**
   * Extension fields - any additional context
   * Used for error-specific information (field names, entity IDs, etc)
   */
  [key: string]: unknown
}
