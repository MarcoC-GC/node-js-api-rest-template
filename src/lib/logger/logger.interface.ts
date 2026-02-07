/**
 * ILogger - Logger abstraction interface
 *
 * Framework-agnostic logging interface that can be implemented
 * by different logging libraries (Console, Winston, Pino, etc)
 *
 * Log Levels (in order of severity):
 * - debug: Detailed diagnostic information
 * - info: General informational messages
 * - warn: Warning messages for potentially harmful situations
 * - error: Error events that might still allow the app to continue
 *
 * @example
 * ```typescript
 * class MyService {
 *   constructor(private logger: ILogger) {}
 *
 *   doSomething() {
 *     this.logger.info('Starting operation', { userId: '123' })
 *     try {
 *       // ...
 *     } catch (error) {
 *       this.logger.error('Operation failed', error, { userId: '123' })
 *     }
 *   }
 * }
 * ```
 */
export interface ILogger {
  /**
   * Log debug information (verbose, for development)
   */
  debug(message: string, meta?: Record<string, unknown>): void

  /**
   * Log general information
   */
  info(message: string, meta?: Record<string, unknown>): void

  /**
   * Log warning messages
   */
  warn(message: string, meta?: Record<string, unknown>): void

  /**
   * Log error messages
   */
  error(message: string, error?: Error, meta?: Record<string, unknown>): void
}
