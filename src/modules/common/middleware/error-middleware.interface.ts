import { Request, Response, NextFunction } from 'express'

/**
 * IErrorMiddleware - Interface for error handling middleware classes
 *
 * Error middlewares have 4 parameters (error as first param)
 * following Express error handling convention.
 *
 * Must be registered AFTER all routes and other middlewares.
 *
 * @example
 * ```typescript
 * class ErrorHandlerMiddleware implements IErrorMiddleware {
 *   constructor(
 *     private logger: ILogger,
 *     private config: Config
 *   ) {}
 *
 *   handle(error: Error, req: Request, res: Response, next: NextFunction): void {
 *     this.logger.error('Error occurred', error)
 *     res.status(500).json({ message: 'Internal Server Error' })
 *   }
 * }
 *
 * // Usage in Express
 * const errorHandler = new ErrorHandlerMiddleware(logger, config)
 * app.use(errorHandler.handle.bind(errorHandler))
 * ```
 */
export interface IErrorMiddleware {
  /**
   * Handle an error that occurred during request processing
   *
   * @param error - The error that was thrown
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  handle(error: Error, req: Request, res: Response, next: NextFunction): void | Promise<void>
}
