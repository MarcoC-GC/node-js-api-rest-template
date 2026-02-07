/**
 * Dependency Injection Tokens
 *
 * Symbols used as unique identifiers for dependency injection.
 * Using symbols instead of strings provides:
 * - Type safety
 * - No naming collisions
 * - Better IDE support
 * - Refactor-safe code
 *
 * @example
 * ```typescript
 * // Register
 * container.register(TOKENS.ILogger, { useClass: ConsoleLogger })
 *
 * // Resolve
 * const logger = container.resolve<ILogger>(TOKENS.ILogger)
 * ```
 */

// Core Dependencies
export const TOKENS = {
  // Configuration
  Config: Symbol.for('Config'),

  // Logging
  ILogger: Symbol.for('ILogger'),

  // Middlewares
  RequestIdMiddleware: Symbol.for('RequestIdMiddleware'),
  LoggerMiddleware: Symbol.for('LoggerMiddleware'),
  CorsMiddleware: Symbol.for('CorsMiddleware'),
  NotFoundMiddleware: Symbol.for('NotFoundMiddleware'),
  ErrorHandlerMiddleware: Symbol.for('ErrorHandlerMiddleware'),

  // Database (future)
  PrismaClient: Symbol.for('PrismaClient'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),

  // Repositories (future)
  UserRepository: Symbol.for('UserRepository'),

  // Use Cases (future)
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),

  // Controllers (future)
  UserController: Symbol.for('UserController'),

  // Routes (future)
  AuthRoutes: Symbol.for('AuthRoutes'),
  UserRoutes: Symbol.for('UserRoutes')
} as const

/**
 * Type helper to get the token type
 */
export type Token = (typeof TOKENS)[keyof typeof TOKENS]
