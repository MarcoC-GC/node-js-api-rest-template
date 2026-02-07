import { Request, Response, NextFunction } from 'express'

/**
 * IMiddleware - Base interface for all middleware classes
 *
 * All middleware classes must implement this interface.
 * Provides a consistent contract for middleware that can be:
 * - Instantiated with dependencies
 * - Tested in isolation
 * - Composed together
 *
 * @example
 * ```typescript
 * class LoggerMiddleware implements IMiddleware {
 *   constructor(private logger: ILogger) {}
 *
 *   handle(req: Request, res: Response, next: NextFunction): void {
 *     this.logger.info(`${req.method} ${req.path}`)
 *     next()
 *   }
 * }
 *
 * // Usage in Express
 * const middleware = new LoggerMiddleware(logger)
 * app.use(middleware.handle.bind(middleware))
 * ```
 */
export interface IMiddleware {
  /**
   * Handle the HTTP request
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  handle(req: Request, res: Response, next: NextFunction): void | Promise<void>
}
