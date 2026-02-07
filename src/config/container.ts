import 'reflect-metadata' // Required by TSyringe
import { container } from 'tsyringe'
import { Config } from './index'
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
 *
 * Registration Strategy:
 * - Singletons: Config, Logger, Database connections
 * - Transients: Use Cases, Controllers (new instance per resolution)
 * - Scoped: Request-specific dependencies (future)
 *
 * @example
 * ```typescript
 * const config = Config.load()
 * Container.setup(config)
 *
 * const logger = Container.resolve<ILogger>('ILogger')
 * const middleware = Container.resolve<RequestIdMiddleware>('RequestIdMiddleware')
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
    container.register<Config>('Config', {
      useValue: config
    })

    // Logger (singleton)
    container.register<ILogger>('ILogger', {
      useFactory: () => config.createLogger()
    })

    // ==========================================
    // Middlewares (transient - new instance each time)
    // ==========================================

    container.register('RequestIdMiddleware', {
      useFactory: () => new RequestIdMiddleware()
    })

    container.register('LoggerMiddleware', {
      useFactory: (deps) => {
        const logger = deps.resolve<ILogger>('ILogger')
        return new LoggerMiddleware(logger)
      }
    })

    container.register('CorsMiddleware', {
      useFactory: (deps) => {
        const config = deps.resolve<Config>('Config')
        return new CorsMiddleware(config.corsOptions)
      }
    })

    container.register('NotFoundMiddleware', {
      useFactory: (deps) => {
        const config = deps.resolve<Config>('Config')
        return new NotFoundMiddleware(config.apiBaseUrl)
      }
    })

    container.register('ErrorHandlerMiddleware', {
      useFactory: (deps) => {
        const logger = deps.resolve<ILogger>('ILogger')
        const config = deps.resolve<Config>('Config')
        return new ErrorHandlerMiddleware(logger, config.isDevelopment, config.apiBaseUrl)
      }
    })

    // ==========================================
    // TODO: Add module-specific dependencies
    // ==========================================
    // - Repositories
    // - Use Cases
    // - Controllers
    // - Routes
  }

  /**
   * Resolve a dependency from the container
   */
  static resolve<T>(token: string): T {
    return container.resolve<T>(token)
  }

  /**
   * Clear all registered dependencies (useful for testing)
   */
  static clear(): void {
    container.clearInstances()
  }
}
