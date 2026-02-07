import { Request, Response, NextFunction } from 'express'
import { IMiddleware } from './middleware.interface'
import { ProblemDetailsBuilder } from '@/lib/errors/problem-details.builder'

/**
 * NotFoundMiddleware - Handles 404 for undefined routes
 *
 * Should be registered AFTER all valid routes but BEFORE error handler.
 * Returns Problem Details format for consistency.
 *
 * @example
 * ```typescript
 * const middleware = new NotFoundMiddleware(config.apiBaseUrl)
 *
 * // Register after all routes
 * app.use(middleware.handle.bind(middleware))
 * ```
 */
export class NotFoundMiddleware implements IMiddleware {
  constructor(private readonly apiBaseUrl?: string) {}

  handle(req: Request, res: Response, _next: NextFunction): void {
    const problemDetails = new ProblemDetailsBuilder()
      .withType(this.buildTypeUrl('not-found'))
      .withTitle('Route Not Found')
      .withStatus(404)
      .withDetail(`Route ${req.method} ${req.path} does not exist`)
      .withInstance(req.originalUrl)
      .withRequestId(req.id)
      .withTimestamp(new Date())
      .build()

    res.status(404).header('Content-Type', 'application/problem+json').json(problemDetails)
  }

  private buildTypeUrl(type: string): string {
    const base = this.apiBaseUrl || 'https://api.example.com'
    return `${base}/problems/${type}`
  }
}
