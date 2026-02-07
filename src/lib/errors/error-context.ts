/**
 * Severity levels for error categorization and monitoring
 *
 * - LOW: Expected errors like validation failures
 * - MEDIUM: Important but expected errors (business rule violations)
 * - HIGH: Unexpected errors that might indicate bugs
 * - CRITICAL: System-critical failures requiring immediate attention
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Additional context information for error tracking and debugging
 *
 * @property requestId - Unique identifier for the HTTP request (correlation ID)
 *                       Allows tracing a request through all layers
 * @property userId - ID of the authenticated user (if available)
 *                    Useful for user-specific debugging and compliance
 * @property aggregateId - ID of the domain entity/aggregate involved
 * @property aggregateType - Type of the domain entity (User, Role, Permission, etc)
 * @property operation - Name of the operation that failed (CreateUser, ValidateEmail, etc)
 * @property metadata - Any additional contextual data relevant to the error
 */
export interface ErrorContext {
  requestId?: string
  userId?: string
  aggregateId?: string
  aggregateType?: string
  operation?: string
  metadata?: Record<string, unknown>
}

/**
 * Serializable error representation for logging and monitoring
 */
export interface ErrorJSON {
  name: string
  message: string
  errorCode: string
  httpStatus: number
  severity: ErrorSeverity
  timestamp: string
  stack?: string
  context?: ErrorContext
  isOperational: boolean
}
