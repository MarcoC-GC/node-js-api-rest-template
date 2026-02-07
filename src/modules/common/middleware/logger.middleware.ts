import { Request, Response, NextFunction } from 'express'
import { IMiddleware } from './middleware.interface'
import { ILogger } from '@/lib/logger'

/**
 * LoggerMiddleware - Logs HTTP requests and responses
 *
 * Logs:
 * - Incoming request: method, path, requestId, query, IP
 * - Completed response: statusCode, duration
 *
 * Does NOT log errors (handled by error middleware)
 *
 * @example
 * ```typescript
 * const middleware = new LoggerMiddleware(logger)
 * app.use(middleware.handle.bind(middleware))
 * ```
 */
export class LoggerMiddleware implements IMiddleware {
  constructor(private readonly logger: ILogger) {}

  handle(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now()

    // Log incoming request
    this.logger.info('Incoming request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip
    })

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime

      this.logger.info('Request completed', {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      })
    })

    next()
  }
}
