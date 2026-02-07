import express, { Express } from 'express'
import { Config } from '@/config'
import { Container } from '@/config/container'
import { ILogger } from '@/lib/logger'
import {
  RequestIdMiddleware,
  LoggerMiddleware,
  CorsMiddleware,
  ErrorHandlerMiddleware,
  NotFoundMiddleware
} from '@/modules/common/middleware'

/**
 * App - Application orchestrator
 *
 * Configures and manages the Express application lifecycle.
 * Responsibilities:
 * - Setup middlewares in correct order
 * - Register module routes
 * - Configure error handling
 * - Manage application lifecycle (start/shutdown)
 *
 * @example
 * ```typescript
 * const config = Config.load()
 * Container.setup(config)
 *
 * const app = new App()
 * await app.start()
 * ```
 */
export class App {
  private readonly app: Express
  private readonly config: Config
  private readonly logger: ILogger

  constructor() {
    // Resolve dependencies from container
    this.config = Container.resolve<Config>('Config')
    this.logger = Container.resolve<ILogger>('ILogger')

    // Create Express app
    this.app = express()

    // Setup application
    this.setupMiddlewares()
    this.setupRoutes()
    this.setupErrorHandlers()

    this.logger.info('Application initialized')
  }

  /**
   * Setup global middlewares
   * ORDER MATTERS: cors -> requestId -> logger -> body parsing
   */
  private setupMiddlewares(): void {
    // Body parsing
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // CORS (must be first to handle preflight requests)
    const corsMiddleware = Container.resolve<CorsMiddleware>('CorsMiddleware')
    this.app.use(corsMiddleware.handle.bind(corsMiddleware))

    // Request ID (must be early to be available in all logs)
    const requestIdMiddleware = Container.resolve<RequestIdMiddleware>('RequestIdMiddleware')
    this.app.use(requestIdMiddleware.handle.bind(requestIdMiddleware))

    // Logger (after requestId to include it in logs)
    const loggerMiddleware = Container.resolve<LoggerMiddleware>('LoggerMiddleware')
    this.app.use(loggerMiddleware.handle.bind(loggerMiddleware))

    this.logger.info('Global middlewares configured')
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        requestId: req.id,
        environment: this.config.nodeEnv
      })
    })

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Node.js REST API Template',
        version: '1.0.0',
        documentation: '/api/docs'
      })
    })

    // TODO: Register module routes
    // Example:
    // const authRoutes = Container.resolve('AuthRoutes')
    // const userRoutes = Container.resolve('UserRoutes')
    // this.app.use('/api/v1/auth', authRoutes)
    // this.app.use('/api/v1/users', userRoutes)

    this.logger.info('Routes configured')
  }

  /**
   * Setup error handling
   * ORDER MATTERS: notFound -> errorHandler (must be last)
   */
  private setupErrorHandlers(): void {
    // 404 handler for undefined routes (before error handler)
    const notFoundMiddleware = Container.resolve<NotFoundMiddleware>('NotFoundMiddleware')
    this.app.use(notFoundMiddleware.handle.bind(notFoundMiddleware))

    // Global error handler (MUST BE LAST)
    const errorHandlerMiddleware =
      Container.resolve<ErrorHandlerMiddleware>('ErrorHandlerMiddleware')
    this.app.use(errorHandlerMiddleware.handle.bind(errorHandlerMiddleware))

    this.logger.info('Error handlers configured')
  }

  /**
   * Get the Express application instance
   * Useful for testing or custom configuration
   */
  public getExpressApp(): Express {
    return this.app
  }

  /**
   * Start the HTTP server
   */
  public async start(): Promise<void> {
    const port = this.config.port

    // TODO: Connect to database
    // const prisma = Container.resolve('PrismaClient')
    // await prisma.$connect()
    // this.logger.info('Database connected')

    // Start server
    this.app.listen(port, () => {
      this.logger.info(`🚀 Server running on port ${port}`)
      this.logger.info(`📚 Environment: ${this.config.nodeEnv}`)
      this.logger.info(`🔗 API Base URL: ${this.config.apiBaseUrl}`)
      this.logger.info(`📝 Log Level: ${this.config.logLevel}`)
    })
  }

  /**
   * Gracefully shutdown the application
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down gracefully...')

    // TODO: Close database connection
    // const prisma = Container.resolve('PrismaClient')
    // await prisma.$disconnect()
    // this.logger.info('Database disconnected')

    this.logger.info('Shutdown complete')
  }
}
