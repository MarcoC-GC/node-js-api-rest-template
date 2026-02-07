import cors, { CorsOptions } from 'cors'
import { Request, Response, NextFunction } from 'express'
import { IMiddleware } from './middleware.interface'

/**
 * CorsMiddleware - Handles Cross-Origin Resource Sharing
 *
 * Wraps the 'cors' package with our middleware interface.
 * Allows dependency injection of CORS configuration.
 *
 * @example
 * ```typescript
 * const corsOptions = {
 *   origin: 'https://example.com',
 *   credentials: true
 * }
 *
 * const middleware = new CorsMiddleware(corsOptions)
 * app.use(middleware.handle.bind(middleware))
 * ```
 */
export class CorsMiddleware implements IMiddleware {
  private readonly corsHandler: (req: Request, res: Response, next: NextFunction) => void

  constructor(options?: CorsOptions) {
    this.corsHandler = cors(options)
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.corsHandler(req, res, next)
  }
}
