import { Request, Response, NextFunction } from 'express'
import { IErrorMiddleware } from './error-middleware.interface'
import { ILogger } from '@/lib/logger'
import { BaseError } from '@/lib/errors'
import { ErrorMapper, type ErrorMapperOptions } from '@/lib/errors/error-mapper'

/**
 * ErrorHandlerMiddleware - Global error handler
 *
 * Converts all errors to RFC 9457 Problem Details format.
 * Logs appropriately based on error type and severity.
 * Sets correct HTTP status and Content-Type header.
 *
 * Must be registered LAST, after all routes and other middlewares.
 *
 * @example
 * ```typescript
 * const middleware = new ErrorHandlerMiddleware(
 *   logger,
 *   config.isDevelopment,
 *   config.apiBaseUrl
 * )
 *
 * // Register AFTER all routes
 * app.use(middleware.handle.bind(middleware))
 * ```
 */
export class ErrorHandlerMiddleware implements IErrorMiddleware {
  constructor(
    private readonly logger: ILogger,
    private readonly isDevelopment: boolean,
    private readonly apiBaseUrl?: string
  ) {}

  handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    // If headers already sent, delegate to Express default handler
    if (res.headersSent) {
      return next(error)
    }

    // Convert error to Problem Details
    const options: ErrorMapperOptions = {
      instance: req.originalUrl,
      requestId: req.id,
      includeContext: this.isDevelopment,
      baseUrl: this.apiBaseUrl
    }

    const problemDetails = ErrorMapper.toProblemDetails(error, options)

    // Log based on error type
    if (error instanceof BaseError) {
      if (error.isOperational) {
        this.logger.warn('Operational error', {
          requestId: req.id,
          error: error.message,
          errorCode: error.errorCode,
          httpStatus: error.httpStatus,
          context: error.context
        })
      } else {
        this.logger.error('Non-operational error', error, {
          requestId: req.id,
          errorCode: error.errorCode,
          context: error.context
        })
      }
    } else {
      // Unexpected error
      this.logger.error('Unexpected error', error, {
        requestId: req.id,
        method: req.method,
        path: req.path
      })
    }

    // Send response with Problem Details
    res
      .status(problemDetails.status)
      .header('Content-Type', 'application/problem+json')
      .json(problemDetails)
  }
}
