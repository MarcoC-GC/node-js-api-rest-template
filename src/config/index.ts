import { loadEnv, type Env } from './env'
import { ILogger, ConsoleLogger } from '@/lib/logger'
import type { CorsOptions } from 'cors'

/**
 * Config - Centralized application configuration
 *
 * Loads and validates environment variables on instantiation.
 * Provides type-safe access to all configuration values.
 *
 * Single source of truth for all app configuration.
 *
 * @example
 * ```typescript
 * const config = Config.load()
 *
 * console.log(config.port) // 3000
 * console.log(config.isDevelopment) // true
 *
 * const logger = config.createLogger()
 * ```
 */
export class Config {
  private constructor(private readonly env: Env) {}

  /**
   * Load and validate configuration from environment
   *
   * Call this once at application startup
   */
  static load(): Config {
    const env = loadEnv()
    return new Config(env)
  }

  // Server Configuration

  get port(): number {
    return this.env.PORT
  }

  get nodeEnv(): string {
    return this.env.NODE_ENV
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development'
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production'
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === 'test'
  }

  // Database Configuration

  get databaseUrl(): string {
    return this.env.DATABASE_URL
  }

  // API Configuration

  get apiBaseUrl(): string {
    return this.env.API_BASE_URL
  }

  // Logging Configuration

  get logLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return this.env.LOG_LEVEL
  }

  /**
   * Create logger instance with configured log level
   */
  createLogger(): ILogger {
    return new ConsoleLogger(this.logLevel)
  }

  // JWT Configuration

  get jwtSecret(): string {
    return this.env.JWT_SECRET
  }

  get jwtExpiresIn(): string {
    return this.env.JWT_EXPIRES_IN
  }

  // Bcrypt Configuration

  get bcryptSaltRounds(): number {
    return this.env.BCRYPT_SALT_ROUNDS
  }

  // CORS Configuration

  get corsOptions(): CorsOptions {
    return {
      origin: this.env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }
  }
}

// Export tokens for dependency injection
export { TOKENS, type Token } from './tokens'
