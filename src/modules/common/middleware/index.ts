/**
 * Common Middleware Module
 *
 * Global middlewares that apply across all modules.
 * All middlewares follow the IMiddleware/IErrorMiddleware interface.
 *
 * Usage:
 * ```typescript
 * import {
 *   RequestIdMiddleware,
 *   LoggerMiddleware,
 *   CorsMiddleware,
 *   ErrorHandlerMiddleware,
 *   NotFoundMiddleware
 * } from '@/modules/common/middleware'
 *
 * const requestId = new RequestIdMiddleware()
 * const logger = new LoggerMiddleware(loggerInstance)
 * const cors = new CorsMiddleware(corsOptions)
 * const notFound = new NotFoundMiddleware(apiBaseUrl)
 * const errorHandler = new ErrorHandlerMiddleware(loggerInstance, isDev, apiBaseUrl)
 *
 * app.use(cors.handle.bind(cors))
 * app.use(requestId.handle.bind(requestId))
 * app.use(logger.handle.bind(logger))
 *
 * // ... routes ...
 *
 * app.use(notFound.handle.bind(notFound))
 * app.use(errorHandler.handle.bind(errorHandler))
 * ```
 */

// Interfaces
export * from './middleware.interface'
export * from './error-middleware.interface'

// Implementations
export * from './request-id.middleware'
export * from './logger.middleware'
export * from './cors.middleware'
export * from './error-handler.middleware'
export * from './not-found.middleware'
