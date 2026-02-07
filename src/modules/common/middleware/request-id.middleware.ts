import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'node:crypto'
import { IMiddleware } from './middleware.interface'

/**
 * RequestIdMiddleware - Generates and attaches unique request ID
 *
 * Behavior:
 * - Checks for existing request ID in headers
 * - Generates UUID if not present
 * - Attaches to req.id
 * - Sets X-Request-ID response header
 *
 * Use for:
 * - Request tracing across all layers
 * - Correlating logs
 * - Debugging production issues
 *
 * @example
 * ```typescript
 * const middleware = new RequestIdMiddleware()
 * app.use(middleware.handle.bind(middleware))
 *
 * // In route handler
 * console.log(req.id) // "abc-123-def-456"
 * ```
 */
export class RequestIdMiddleware implements IMiddleware {
  constructor(private readonly headerName: string = 'x-request-id') {}

  handle(req: Request, res: Response, next: NextFunction): void {
    // Get existing request ID or generate new one
    const requestId = (req.headers[this.headerName] as string) || randomUUID()

    // Attach to request object
    req.id = requestId

    // Set response header
    res.setHeader('X-Request-ID', requestId)

    next()
  }
}

/**
 * Type augmentation for Express Request
 * Adds 'id' property to Request interface
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string
    }
  }
}
