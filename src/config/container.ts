import 'reflect-metadata' // Required by TSyringe
import { container } from 'tsyringe'
import { Config } from './index'
import { TOKENS } from './tokens'
import { ILogger } from '@/lib/logger'
import {
  RequestIdMiddleware,
  LoggerMiddleware,
  CorsMiddleware,
  ErrorHandlerMiddleware,
  NotFoundMiddleware
} from '@/modules/common/middleware'

/**
 * Container - Dependency Injection setup
 *
 * Configures TSyringe container with all application dependencies.
 * Uses factory functions (no decorators) to keep classes clean.
 * Uses Symbols as tokens for type safety and no collisions.
 *
 * Registration Strategy:
 * - Singletons: Config, Logger, Database connections
 * - Transients: Use Cases, Controllers (new instance per resolution)
 * - Scoped: Request-specific dependencies (future)
 *
 * @example
 * ```typescript
 * import { TOKENS } from '@/config/tokens'
 *
 * const config = Config.load()
 * Container.setup(config)
 *
 * const logger = Container.resolve<ILogger>(TOKENS.ILogger)
 * const middleware = Container.resolve<RequestIdMiddleware>(TOKENS.RequestIdMiddleware)
 * ```
 */
export class Container {
  /**
   * Setup dependency injection container
   *
   * Call this once at application startup, before creating the App
   */
  static setup(config: Config): void {
    // ==========================================
    // Core Dependencies
    // ==========================================

    // Config (singleton)
    container.register<Config>(TOKENS.Config, {
      useValue: config
    })

    // Logger (singleton)
    container.register<ILogger>(TOKENS.ILogger, {
      useFactory: () => config.createLogger()
    })

    // ==========================================
    // Middlewares (transient - new instance each time)
    // ==========================================

    container.register(TOKENS.RequestIdMiddleware, {
      useFactory: () => new RequestIdMiddleware()
    })

    container.register(TOKENS.LoggerMiddleware, {
      useFactory: (deps) => {
        const logger = deps.resolve<ILogger>(TOKENS.ILogger)
        return new LoggerMiddleware(logger)
      }
    })

    container.register(TOKENS.CorsMiddleware, {
      useFactory: (deps) => {
        const config = deps.resolve<Config>(TOKENS.Config)
        return new CorsMiddleware(config.corsOptions)
      }
    })

    container.register(TOKENS.NotFoundMiddleware, {
      useFactory: (deps) => {
        const config = deps.resolve<Config>(TOKENS.Config)
        return new NotFoundMiddleware(config.apiBaseUrl)
      }
    })

    container.register(TOKENS.ErrorHandlerMiddleware, {
      useFactory: (deps) => {
        const logger = deps.resolve<ILogger>(TOKENS.ILogger)
        const config = deps.resolve<Config>(TOKENS.Config)
        return new ErrorHandlerMiddleware(logger, config.isDevelopment, config.apiBaseUrl)
      }
    })

    // ==========================================
    // TODO: Add module-specific dependencies
    // ==========================================
    // Example:
    // container.register(TOKENS.UserRepository, {
    //   useFactory: (deps) => {
    //     const prisma = deps.resolve(TOKENS.PrismaClient)
    //     return new PrismaUserRepository(prisma)
    //   }
    // })
  }

  /**
   * Resolve a dependency from the container
   *
   * @example
   * ```typescript
   * const logger = Container.resolve<ILogger>(TOKENS.ILogger)
   * ```
   */
  static resolve<T>(token: symbol): T {
    return container.resolve<T>(token)
  }

  /**
   * Clear all registered dependencies (useful for testing)
   */
  static clear(): void {
    container.clearInstances()
  }
}
