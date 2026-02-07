import { ILogger } from './logger.interface'

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * ConsoleLogger - Simple console-based logger implementation
 *
 * Uses native console methods with colored output and structured metadata.
 * Respects log level configuration (won't log below configured level).
 *
 * Colors:
 * - debug: Gray
 * - info: Blue
 * - warn: Yellow
 * - error: Red
 *
 * @example
 * ```typescript
 * const logger = new ConsoleLogger('info')
 *
 * logger.debug('This will not be logged') // Below 'info' level
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Database connection failed', error, { host: 'localhost' })
 * ```
 */
export class ConsoleLogger implements ILogger {
  private readonly logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  private readonly colors = {
    debug: '\x1b[90m', // Gray
    info: '\x1b[34m', // Blue
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'
  }

  constructor(private readonly minLevel: LogLevel = 'info') {}

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, undefined, meta)
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, undefined, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, undefined, meta)
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log('error', message, error, meta)
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    meta?: Record<string, unknown>
  ): void {
    // Check if we should log this level
    if (this.logLevels[level] < this.logLevels[this.minLevel]) {
      return
    }

    const timestamp = new Date().toISOString()
    const color = this.colors[level]
    const reset = this.colors.reset
    const levelUpperCase = level.toUpperCase().padEnd(5)

    // Base log message
    let logMessage = `${color}[${timestamp}] ${levelUpperCase}${reset} ${message}`

    // Add metadata if present
    if (meta && Object.keys(meta).length > 0) {
      logMessage += `\n  ${JSON.stringify(meta, null, 2)}`
    }

    // Add error details if present
    if (error) {
      logMessage += `\n  Error: ${error.message}`
      if (error.stack) {
        logMessage += `\n  Stack: ${error.stack}`
      }
    }

    // Use appropriate console method
    switch (level) {
      case 'debug':
        console.debug(logMessage)
        break
      case 'info':
        console.info(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      case 'error':
        console.error(logMessage)
        break
    }
  }
}
