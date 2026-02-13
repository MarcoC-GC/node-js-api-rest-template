import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

/**
 * Auth Routes
 *
 * Defines HTTP routes for authentication operations.
 * Maps routes to controller methods.
 *
 * @remarks
 * These routes are PUBLIC - they do NOT require authentication middleware.
 * Users must be able to register and login without having a token.
 *
 * Endpoints:
 * - POST /auth/register - Create new user account
 * - POST /auth/login - Authenticate and receive JWT token
 *
 * @example
 * ```typescript
 * // In app.ts or identity module setup:
 * const authRoutes = new AuthRoutes(authController)
 * app.use('/api/auth', authRoutes.getRouter())
 * ```
 */
export class AuthRoutes {
  private readonly router: Router
  private readonly controller: AuthController

  /**
   * Creates an instance of AuthRoutes
   *
   * @param controller - The AuthController instance with register/login methods
   */
  constructor(controller: AuthController) {
    this.router = Router()
    this.controller = controller
    this.setupRoutes()
  }

  /**
   * Sets up the authentication routes
   *
   * @private
   * @remarks
   * All routes are PUBLIC (no authentication middleware).
   * Validation is handled by the controller using Zod schemas.
   */
  private setupRoutes(): void {
    /**
     * POST /auth/register
     *
     * Register a new user account
     * Body: { email, password, firstName, lastName }
     * Returns: 201 + UserResponseDto
     */
    this.router.post('/register', this.controller.register.bind(this.controller))

    /**
     * POST /auth/login
     *
     * Authenticate user and receive JWT token
     * Body: { email, password }
     * Returns: 200 + { accessToken, user }
     */
    this.router.post('/login', this.controller.login.bind(this.controller))
  }

  /**
   * Returns the configured Express Router
   *
   * @returns Express Router with authentication routes
   *
   * @example
   * ```typescript
   * const authRoutes = new AuthRoutes(controller)
   * app.use('/api/auth', authRoutes.getRouter())
   * ```
   */
  getRouter(): Router {
    return this.router
  }
}
